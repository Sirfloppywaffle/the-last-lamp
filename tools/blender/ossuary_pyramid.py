"""The Ossuary's pyramid of skulls, modelled and lit in Blender (Criss, 28 Nov 2026: try Blender for the pyramids while PixelLab's
allowance is spent). Run headless, no window and no add-on:

    blender --background --factory-startup --python tools/blender/ossuary_pyramid.py -- <out dir> [seed]

It builds a heap of skulls (each turned a little its own way) on a stone pedestal with a cross of bones on top, and renders it three
times at 8x the sprite (48 by 116, the foot of the pedestal's footprint at x 24, y 104, as PIX_FLOOR.ossuary.cols' ay says):
  shade<seed>.png  the light: everything one plain colour, lit from the top left as px.py shades (a sun and a soft sky, Cycles' own
                   contact shadows between the skulls)
  id<seed>.png     what each pixel is, in flat colours: bone red, socket blue, teeth yellow, stone green
  inst<seed>.png   which skull each pixel belongs to (red = its number), for the dark lines between skulls
tools/pixel/blender_pixels.py turns the three into the sprite, in the game's palette.
"""
import bpy, bmesh, math, random, sys, os
from mathutils import Matrix, Vector, Euler

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
DEST = os.path.abspath(argv[0] if argv else '.')
SEED = int(argv[1]) if len(argv) > 1 else 0
W, H, K = 48, 116, 8           # the sprite, and how many times bigger it is rendered
PX = 9.0                       # pixels per unit: a skull is one unit wide, 9 px, as bones.py's skull(…, 9)
FOOT = (24, 104)               # where the footprint's centre falls in the sprite
ELEV = 15.0                    # how far the camera looks down, in degrees: the pedestal's top shows as a thin band, as in the old one
LIGHT = (-1.0, 1.3, 1.5)       # px.py's light: left, up, toward the viewer (camera space)

random.seed(SEED)

# ---------- an empty scene ----------
for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
sc = bpy.context.scene

# ---------- materials (index 0 bone, 1 socket, 2 teeth, 3 stone), each with a node tree swapped per render ----------
MATS = {}
for name in ('bone', 'socket', 'teeth', 'stone'):
    m = bpy.data.materials.new(name); m.use_nodes = True; MATS[name] = m
ID_COL = {'bone': (1, 0, 0), 'socket': (0, 0, 1), 'teeth': (1, 1, 0), 'stone': (0, 1, 0)}
ALBEDO = {'bone': .8, 'socket': .8, 'teeth': .8, 'stone': .8}   # one plain colour: the palette comes later, the render gives only light

def set_mode(mode):
    for name, m in MATS.items():
        nt = m.node_tree; nt.nodes.clear(); out = nt.nodes.new('ShaderNodeOutputMaterial')
        if mode == 'shade':
            b = nt.nodes.new('ShaderNodeBsdfDiffuse'); a = ALBEDO[name]; b.inputs['Color'].default_value = (a, a, a, 1)
            nt.links.new(b.outputs[0], out.inputs['Surface'])
        else:
            e = nt.nodes.new('ShaderNodeEmission'); e.inputs['Strength'].default_value = 1.0
            if mode == 'id':
                e.inputs['Color'].default_value = (*ID_COL[name], 1)
            else:   # inst: the object's pass index in red, as an exact 8-bit value
                info = nt.nodes.new('ShaderNodeObjectInfo'); div = nt.nodes.new('ShaderNodeMath'); div.operation = 'DIVIDE'
                div.inputs[1].default_value = 255.0; comb = nt.nodes.new('ShaderNodeCombineColor')
                nt.links.new(info.outputs['Object Index'], div.inputs[0]); nt.links.new(div.outputs[0], comb.inputs['Red'])
                nt.links.new(comb.outputs[0], e.inputs['Color'])
            nt.links.new(e.outputs[0], out.inputs['Surface'])

# ---------- one skull, facing -Y, a unit wide; built once and shared by every skull in the heap ----------
def add_ellipsoid(bm, centre, radii, mat, seg=20, rings=12):
    mtx = Matrix.Translation(centre) @ Matrix.Diagonal((*radii, 1.0))
    ret = bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=1.0, matrix=mtx)
    for v in ret['verts']:
        for f in v.link_faces: f.material_index = mat
def add_box(bm, centre, size, mat):
    mtx = Matrix.Translation(centre) @ Matrix.Diagonal((*size, 1.0))
    ret = bmesh.ops.create_cube(bm, size=1.0, matrix=mtx)
    for v in ret['verts']:
        for f in v.link_faces: f.material_index = mat
def skull_mesh():
    bm = bmesh.new()
    add_ellipsoid(bm, (0, .06, .12), (.5, .55, .45), 0)            # the cranium
    add_ellipsoid(bm, (0, -.2, -.2), (.31, .28, .23), 0)            # the upper jaw
    for s in (-1, 1): add_ellipsoid(bm, (s * .29, -.27, -.1), (.15, .12, .11), 0, 12, 8)   # cheekbones
    add_box(bm, (0, -.36, -.4), (.4, .12, .13), 2)                  # the teeth
    for s in (-1, 1): add_ellipsoid(bm, (s * .19, -.47, -.02), (.12, .08, .13), 1, 14, 8)  # the sockets, dark and deep
    add_ellipsoid(bm, (0, -.5, -.2), (.06, .05, .1), 1, 10, 6)      # the nose
    me = bpy.data.meshes.new('skull'); bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = True
    for n in ('bone', 'socket', 'teeth', 'stone'): me.materials.append(MATS[n])
    return me
SKULL = skull_mesh()

def place(mesh, loc, rot, idx):
    o = bpy.data.objects.new(mesh.name, mesh); o.location = loc; o.rotation_euler = rot; o.pass_index = idx
    sc.collection.objects.link(o); return o

# ---------- the pedestal: a plinth, a block and a capstone, all stone ----------
def box_mesh(name, size):
    bm = bmesh.new(); add_box(bm, (0, 0, 0), size, 3); me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    for n in ('bone', 'socket', 'teeth', 'stone'): me.materials.append(MATS[n])
    return me
place(box_mesh('plinth', (4.5, 4.5, .35)), (0, 0, .175), (0, 0, 0), 250)
place(box_mesh('block', (4.0, 4.0, 1.6)), (0, 0, .35 + .8), (0, 0, 0), 250)
place(box_mesh('cap', (4.4, 4.4, .3)), (0, 0, 1.95 + .15), (0, 0, 0), 250)
TOP = 2.25

# ---------- the heap: rings of skulls facing outward, narrowing upward, each a little turned ----------
idx = 1
LAYERS = 8
for i in range(LAYERS):
    z = TOP + .42 + i * .74
    r = 1.62 * (1 - i / (LAYERS + .4))
    n = max(1, round(2 * math.pi * r / .9)) if r > .35 else 1
    ph = random.uniform(0, 2 * math.pi)
    for j in range(n):
        a = ph + j * 2 * math.pi / n if n > 1 else -math.pi / 2
        loc = (r * math.cos(a), r * math.sin(a), z) if n > 1 else (0, 0, z)
        yaw = a + math.pi / 2 + math.radians(random.uniform(-8, 8))
        rot = Euler((math.radians(random.uniform(-6, 4)), math.radians(random.uniform(-5, 5)), yaw), 'XYZ')
        place(SKULL, loc, rot, idx); idx += 1
# the crown: one skull facing the camera, a little higher, and a cross of bones above it
ztop = TOP + .42 + LAYERS * .74
place(SKULL, (0, 0, ztop - .1), (math.radians(-4), 0, 0), idx); idx += 1
def bone_mesh(name, length, r=.11):
    bm = bmesh.new()
    mtx = Matrix.Diagonal((r, r, length / 2, 1.0))
    ret = bmesh.ops.create_cone(bm, cap_ends=True, segments=12, radius1=1.0, radius2=1.0, depth=2.0, matrix=mtx)
    for s in (-1, 1):
        for dx in (-r * 1.1, r * 1.1):
            add_ellipsoid(bm, (dx, 0, s * length / 2), (r * 1.35, r * 1.35, r * 1.35), 0, 10, 6)
    for f in bm.faces: f.material_index = 0
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth = True
    for n in ('bone', 'socket', 'teeth', 'stone'): me.materials.append(MATS[n])
    return me
place(bone_mesh('upright', 1.9), (0, 0, ztop + 1.05), (0, 0, 0), idx); idx += 1
place(bone_mesh('arm', 1.3, .1), (0, -.05, ztop + 1.35), (0, math.radians(90), 0), idx); idx += 1

# ---------- camera: orthographic, looking down ELEV degrees, the footprint's centre at FOOT ----------
cam_d = bpy.data.cameras.new('cam'); cam_d.type = 'ORTHO'; cam_d.ortho_scale = H / PX
cam_d.shift_x = (W / 2 - FOOT[0]) / H; cam_d.shift_y = (FOOT[1] - H / 2) / H
cam = bpy.data.objects.new('cam', cam_d); sc.collection.objects.link(cam); sc.camera = cam
e = math.radians(ELEV); fwd = Vector((0, math.cos(e), -math.sin(e)))
cam.location = -fwd * 40; cam.rotation_euler = Euler((math.radians(90 - ELEV), 0, 0), 'XYZ')

# ---------- light: a sun from px.py's direction in camera space, and a dim sky so the shadow side is not black ----------
right = Vector((1, 0, 0)); up = fwd.cross(right).normalized() * -1; toward = -fwd
L = (right * LIGHT[0] + up * LIGHT[1] + toward * LIGHT[2]).normalized()
sun_d = bpy.data.lights.new('sun', 'SUN'); sun_d.energy = 4.0; sun_d.angle = math.radians(8)
sun = bpy.data.objects.new('sun', sun_d); sc.collection.objects.link(sun); sun.rotation_euler = L.to_track_quat('Z', 'Y').to_euler()
world = bpy.data.worlds.new('w'); sc.world = world; world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (1, 1, 1, 1)

# ---------- render settings ----------
r = sc.render; r.engine = 'CYCLES'; r.resolution_x = W * K; r.resolution_y = H * K; r.resolution_percentage = 100
r.film_transparent = True; r.image_settings.file_format = 'PNG'; r.image_settings.color_mode = 'RGBA'; r.image_settings.color_depth = '8'
r.dither_intensity = 0.0
sc.view_settings.view_transform = 'Standard'; sc.view_settings.look = 'None'
sc.cycles.device = 'CPU'; sc.cycles.use_denoising = False; sc.cycles.seed = SEED

def render(mode, path, samples, bg):
    set_mode(mode); sc.cycles.samples = samples
    world.node_tree.nodes['Background'].inputs['Strength'].default_value = bg
    sun.hide_render = mode != 'shade'
    sc.cycles.filter_width = 1.5 if mode == 'shade' else 0.01
    sc.cycles.max_bounces = 4 if mode == 'shade' else 0
    r.filepath = path; bpy.ops.render.render(write_still=True)

os.makedirs(DEST, exist_ok=True)
render('shade', os.path.join(DEST, f'shade{SEED}.png'), 96, .35)
render('id', os.path.join(DEST, f'id{SEED}.png'), 1, 0.0)
render('inst', os.path.join(DEST, f'inst{SEED}.png'), 1, 0.0)
print('ossuary_pyramid: %d skulls, written to %s' % (idx - 3, DEST))

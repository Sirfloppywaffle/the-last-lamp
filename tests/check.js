// Fast checks that need no browser: the game script must parse, and the traps we've already fallen into
// (AGENTS.md section 6) must not come back. Run: node check.js
const fs=require('fs'), path=require('path'), vm=require('vm');
const file=path.join(__dirname,'..','index.html');
const html=fs.readFileSync(file,'utf8');
const problems=[], warnings=[];
const lineOf=(i)=>html.slice(0,i).split('\n').length;

// 1. every inline <script> parses
const scripts=[...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)];
if(!scripts.length)problems.push('no inline <script> found');
for(const m of scripts){try{new vm.Script(m[1],{filename:'index.html'});}catch(e){problems.push(`syntax error in the script starting at line ${lineOf(m.index)}: ${e.message}`);}}
const js=scripts.map(m=>m[1]).join('\n')
  .replace(/\/\*[\s\S]*?\*\//g,m=>m.replace(/[^\n]/g,' '))   // blank out block comments (keep line numbers)
  .replace(/^\s*\/\/.*$/gm,'');                                // and whole-line // comments

// 2. hash(a,b,s) needs all three arguments (with two it returns NaN and things silently vanish)
for(const m of js.matchAll(/\bhash\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g)){
  const argc=m[1].split(',').length;
  if(!/function\s+hash/.test(js.slice(Math.max(0,m.index-9),m.index+5))&&argc!==3)problems.push(`hash() called with ${argc} argument(s): hash(${m[1].slice(0,60)}) — it takes (a,b,s)`);
}

// 3. no inline on*="…" handlers in markup or markup strings
for(const m of html.matchAll(/\son(click|pointerdown|touchstart|mousedown|load|error)\s*=\s*["']/gi))problems.push(`inline ${m[0].trim()} at line ${lineOf(m.index)}: use data- attributes and JS handlers`);

// 4. no external scripts (the game must stay a single self-contained file); fonts are the only outside resource
for(const m of html.matchAll(/<script[^>]*\bsrc=["']([^"']+)/g))problems.push(`external script ${m[1]}: keep the game self-contained`);

// 5. overlays should dismiss on click, not pointerdown (touch ghost-taps)
for(const m of js.matchAll(/\$\(['"]#(mapOverlay|modal|bossCard)['"]\)\.addEventListener\(\s*['"]pointerdown/g))problems.push(`#${m[1]} listens on pointerdown: use click (AGENTS.md rule 5)`);

// 6. the placement card must stay out of the stage (AGENTS.md rule 1)
const stage=html.match(/<main class="stage"[\s\S]*?<\/main>/);
if(stage&&/id="modebar"/.test(stage[0]))problems.push('#modebar is inside the stage again: it covered the board in v13 (AGENTS.md rule 1)');

// 7. sizes worth knowing about
const kb=Math.round(Buffer.byteLength(html)/1024);
if(kb>600)warnings.push(`index.html is ${kb} KB: consider whether something can be trimmed`);

for(const w of warnings)console.log('warn  '+w);
if(problems.length){for(const p of problems)console.log('FAIL  '+p); process.exit(1);}
console.log(`static checks ok (${scripts.length} script block, ${kb} KB)`);

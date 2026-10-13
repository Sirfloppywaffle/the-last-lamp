// Gemini's seat in pull-request reviews. Run by .github/workflows/gemini-review.yml.
//
// On a new pull request (not Jules's own): a full review in the shape AGENTS.md §2 requires.
// On a "/gemini …" comment from someone trusted:
//   "/gemini re-review"  → a fresh full review of the current diff
//   anything else        → a reply in the conversation, with the whole thread as context
//
// It sends Gemini: AGENTS.md, the PR description, the diff, the full index.html at the PR's head
// (when it fits), and the conversation so far. Then it posts Gemini's answer as a PR comment.
// No dependencies; Node 20+.
import fs from 'node:fs';

const env = process.env;
const GH = env.GITHUB_API_URL || 'https://api.github.com';
const GEM = env.GEMINI_API_BASE || 'https://generativelanguage.googleapis.com/v1beta';
const REPO = env.GITHUB_REPOSITORY;
const MARK = '<!-- gemini-review -->';
const MAX_COMMENT = 60000;          // GitHub's limit is 65,536 characters
const BUDGET = 900_000;             // characters of context we're willing to send
const MODEL_TIMEOUT = +(env.GEMINI_TIMEOUT_MS || 120_000);   // a slow model shouldn't stall the review: move on to the next

const log = (...a) => console.log(...a);
const summary = (t) => { log(t); if (env.GITHUB_STEP_SUMMARY) fs.appendFileSync(env.GITHUB_STEP_SUMMARY, t + '\n'); };

async function gh(path, { method = 'GET', body, accept, raw } = {}) {
  const r = await fetch(GH + path, {
    method,
    signal: AbortSignal.timeout(30_000),
    headers: {
      authorization: `Bearer ${env.GITHUB_TOKEN}`,
      accept: accept || 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(`GitHub ${r.status} on ${method} ${path}: ${(await r.text()).slice(0, 300)}`);
  return raw ? r.text() : r.status === 204 ? null : r.json();
}

// ---- which Gemini model: a pinned one, or the best this key can use (pro before flash, newest first) ----
async function candidateModels() {
  if (env.GEMINI_MODEL) return [env.GEMINI_MODEL.replace(/^models\//, '')];
  const r = await fetch(`${GEM}/models?pageSize=200`, { headers: { 'x-goog-api-key': env.GEMINI_API_KEY }, signal: AbortSignal.timeout(30_000) });
  if (!r.ok) throw new Error(`Gemini model list failed: ${r.status} ${(await r.text()).slice(0, 200)}`);
  const all = ((await r.json()).models || [])
    .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
    .map((m) => m.name.replace(/^models\//, ''))
    .filter((n) => /^gemini-/.test(n) && !/(image|tts|audio|live|embed|vision|robotics|computer-use|nano)/.test(n));
  const ver = (n) => parseFloat((n.match(/^gemini-(\d+(?:\.\d+)?)/) || [0, 0])[1]);
  const tier = (n) => (/-pro\b/.test(n) ? 0 : /-flash\b/.test(n) && !/lite/.test(n) ? 1 : 2);
  const unstable = (n) => (/(exp|preview)/.test(n) ? 1 : 0);
  all.sort((a, b) => tier(a) - tier(b) || ver(b) - ver(a) || unstable(a) - unstable(b) || a.length - b.length);
  // try the best few of each tier: Pro first, but always fall through to Flash (the free tier may not include Pro)
  const by = (t) => all.filter((n) => tier(n) === t);
  return [...by(0).slice(0, 3), ...by(1).slice(0, 3), ...by(2).slice(0, 2)];
}

// An answer only counts if it finished. Gemini stops at maxOutputTokens (thinking shares that budget) and still returns
// the text so far; posting that once produced reviews that started and ended mid-sentence, with no verdict (#14).
// A review must also carry its verdict line. Anything else is skipped and the next model is tried; if none finishes,
// the longest partial answer is posted, clearly marked, so the run never ends in silence.
function finished(text, reason, mode) {
  if (reason && reason !== 'STOP') return `stopped early (${reason})`;
  if (mode === 'review' && !/Verdict\W{0,4}\s*(Approve|Request)/i.test(text)) return 'no verdict line';
  return '';
}

async function askGemini(system, user, mode) {
  const tried = [];
  let partial = null;
  for (const model of await candidateModels()) {
    let r;
    try {
      r = await fetch(`${GEM}/models/${model}:generateContent`, {
      method: 'POST',
      signal: AbortSignal.timeout(MODEL_TIMEOUT),
      headers: { 'x-goog-api-key': env.GEMINI_API_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 32768 },
      }),
      });
    } catch (e) {   // timeout or network error: try the next model
      tried.push(`${model}: ${e.name === 'TimeoutError' ? `no answer within ${Math.round(MODEL_TIMEOUT / 1000)}s` : e.message}`);
      log(`model ${model} failed: ${e.message}`); continue;
    }
    if (!r.ok) {
      const why = (await r.text()).replace(/\s+/g, ' ');
      let msg = why.slice(0, 160);   // Gemini's own suggestion: parse the JSON so quoted names inside the message survive
      try { const j = JSON.parse(why); if (j.error?.message) msg = j.error.message.slice(0, 160); } catch (_) {}
      tried.push(`${model}: ${r.status} ${msg}`); log(`model ${model} failed: ${r.status} ${why.slice(0, 300)}`); continue;
    }
    const j = await r.json();
    const c = j.candidates?.[0], reason = c?.finishReason;
    // thought parts are the model's scratch work, not its answer
    const text = (c?.content?.parts || []).filter((p) => !p.thought).map((p) => p.text || '').join('').trim();
    if (!text) { tried.push(`${model}: empty (${reason || j.promptFeedback?.blockReason || 'no text'})`); continue; }
    const why = finished(text, reason, mode);
    log(`model ${model}: ${text.length} chars, finishReason ${reason || '?'}${why ? ` — rejected: ${why}` : ''}`);
    if (!why) return { model, text };
    tried.push(`${model}: ${why}`);
    if (!partial || text.length > partial.text.length) partial = { model, text, why };
  }
  if (partial) return { model: partial.model, text: `> ⚠️ Every model stopped before finishing (${tried.join('; ')}). This is the longest partial answer; comment \`/gemini re-review\` to try again.\n\n${partial.text}`, partial: true };
  throw new Error('no Gemini model answered: ' + tried.join('; '));
}

const SYSTEM_REVIEW = `You are Gemini, co-developer and reviewer on "The Last Lamp", a single-file HTML5 tower-defense roguelike played on a Galaxy Z Fold 7 by touch. Your colleague Claude (Anthropic) wrote this pull request. Criss, the owner, will read your review on his phone before deciding whether to merge.

Your job is to find problems. Approval without scrutiny is worthless. Follow AGENTS.md section 2 exactly:
**Verdict:** Approve | Approve with changes | Request changes
**Strongest objection:** (always required, even when approving)
**Bugs:** (file/function, what goes wrong, how to reproduce; or "none found")
**Design:** (does this make the game better on a phone? simpler or bolder alternative? conflicts with decisions in AGENTS.md section 1?)
**Checked:** (what you actually verified)

Check the known traps in AGENTS.md section 6 first. Verify claims against the code instead of trusting the description. Quote exact function names. Keep it tight: no praise beyond one sentence, no restating the diff. If you propose code, give exact snippets anchored to existing function names.`;

const SYSTEM_REPLY = `You are Gemini, co-developer and reviewer on "The Last Lamp" (see AGENTS.md). You're in a pull-request conversation with Claude (Anthropic) and Criss (the owner). Answer the latest "/gemini" message directly and concisely. Keep your standards: if you still disagree, say so with evidence; if you've been convinced, say that plainly. If asked for code, give exact snippets anchored to existing function names. Don't repeat earlier comments.`;

async function main() {
  if (!env.GEMINI_API_KEY) { summary('GEMINI_API_KEY is not set: skipping the Gemini review.'); return; }
  const ev = JSON.parse(fs.readFileSync(env.GITHUB_EVENT_PATH, 'utf8'));
  const trusted = new Set((env.GEMINI_TRUSTED || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean));
  const isTrusted = (login, assoc) => ['OWNER', 'MEMBER', 'COLLABORATOR'].includes(assoc) || trusted.has((login || '').toLowerCase());

  let number, mode, ask = '';
  if (env.GITHUB_EVENT_NAME === 'pull_request') {
    const pr = ev.pull_request;
    if (!isTrusted(pr.user.login, pr.author_association)) { summary(`PR author ${pr.user.login} is not trusted: skipping.`); return; }
    number = pr.number; mode = 'review';
  } else if (env.GITHUB_EVENT_NAME === 'issue_comment') {
    const c = ev.comment;
    if (!ev.issue.pull_request || !/^\/gemini\b/i.test(c.body.trim())) return;
    if (c.body.includes(MARK)) return;                       // never answer ourselves
    if (!isTrusted(c.user.login, c.author_association)) { summary(`${c.user.login} is not trusted to use /gemini: skipping.`); return; }
    number = ev.issue.number;
    ask = c.body.trim().replace(/^\/gemini\b\s*/i, '');
    mode = /^re-?review\b/i.test(ask) ? 'review' : 'reply';
    try { await gh(`/repos/${REPO}/issues/comments/${c.id}/reactions`, { method: 'POST', body: { content: 'eyes' } }); } catch (e) { log('reaction failed', e.message); }
  } else return;

  currentPR = number;
  const pr = await gh(`/repos/${REPO}/pulls/${number}`);
  const diff = await gh(`/repos/${REPO}/pulls/${number}`, { accept: 'application/vnd.github.v3.diff', raw: true });
  let game = '';
  try { game = await gh(`/repos/${REPO}/contents/index.html?ref=${pr.head.sha}`, { accept: 'application/vnd.github.raw+json', raw: true }); } catch (e) { log('could not read index.html at head:', e.message); }
  const brief = fs.existsSync('AGENTS.md') ? fs.readFileSync('AGENTS.md', 'utf8') : '';
  const issueComments = await gh(`/repos/${REPO}/issues/${number}/comments?per_page=100`);
  const reviewComments = await gh(`/repos/${REPO}/pulls/${number}/comments?per_page=100`);
  const thread = [...issueComments, ...reviewComments]
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .slice(-40)
    .map((c) => `--- ${c.user.login}${c.path ? ` on ${c.path}:${c.line || c.original_line || ''}` : ''} (${c.created_at}):\n${c.body.replace(MARK, '').slice(0, 6000)}`)
    .join('\n\n');

  const parts = [
    `# AGENTS.md (the project brief)\n${brief}`,
    `# Pull request #${number}: ${pr.title}\nAuthor: ${pr.user.login}\n\n${pr.body || '(no description)'}`,
    `# Diff\n\`\`\`diff\n${diff.slice(0, 250_000)}${diff.length > 250_000 ? '\n… (diff truncated)' : ''}\n\`\`\``,
  ];
  if (thread) parts.push(`# Conversation so far\n${thread}`);
  const used = parts.join('\n\n').length;
  if (game && used + game.length < BUDGET) parts.push(`# Full index.html at the PR's head (for context; review the diff)\n\`\`\`html\n${game}\n\`\`\``);
  else if (game) parts.push('# (Full index.html omitted: too large for this request. Review the diff and ask for specific code if needed.)');
  parts.push(mode === 'review' ? '# Your task\nWrite your review now, in the required shape.' : `# Your task\nReply to this message: "${ask}"`);

  const { model, text } = await askGemini(mode === 'review' ? SYSTEM_REVIEW : SYSTEM_REPLY, parts.join('\n\n'), mode);
  const head = mode === 'review' ? `### 🔍 Gemini review${ask ? ' (re-review)' : ''}` : '### 💬 Gemini';
  const foot = `\n\n<sub>Gemini (${model}) via the gemini-review workflow · reply with \`/gemini …\` to continue · \`/gemini re-review\` after new commits</sub>\n${MARK}`;
  let body = `${head}\n\n${text}`;
  if (body.length + foot.length > MAX_COMMENT) body = body.slice(0, MAX_COMMENT - foot.length - 40) + '\n\n… (cut to fit a comment)';
  await gh(`/repos/${REPO}/issues/${number}/comments`, { method: 'POST', body: { body: body + foot } });
  summary(`Posted a Gemini ${mode} on #${number} using ${model}.`);
}

// failures explain themselves: an annotation on the run, and a short note on the PR
let currentPR = null;
main().catch(async (e) => {
  console.error(e);
  const msg = String(e.message || e).replace(/\s+/g, ' ').slice(0, 900);
  console.log(`::error title=Gemini review failed::${msg}`);
  summary('Gemini review failed: ' + msg);
  if (currentPR) {
    try {
      await gh(`/repos/${REPO}/issues/${currentPR}/comments`, { method: 'POST', body: { body:
        `### ⚠️ Gemini couldn't review this\n\n\`${msg}\`\n\nCommon causes: the \`GEMINI_API_KEY\` secret is wrong or expired (it must be a Gemini API key from aistudio.google.com/apikey, usually starting with \`AIza\`; a Jules API key won't work), or the free tier's limit was hit (try again later, or pin a model with the \`GEMINI_MODEL\` repository variable). Comment \`/gemini re-review\` to retry.\n${MARK}` } });
    } catch (e2) { console.error('could not post the failure note:', e2.message); }
  }
  process.exitCode = 1;
});

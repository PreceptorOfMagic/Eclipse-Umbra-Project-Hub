// Hub visit counter: a Cloudflare Worker with a D1 (SQLite) database.
//
// What it keeps, per page view: the page, the referring site's host name, the time the page was visible, and a
// visitor code that is only good for one UTC day. The code is a hash of that day's random salt, the IP address and
// the browser's user-agent; the salt is deleted when the day ends, so codes cannot be linked across days or turned
// back into an address. No cookies or browser storage are used, and the IP address is never stored.
// Raw rows are deleted after 13 months.
//
// Downloads are counted two ways: a click on a release file on the Hub is recorded with its exact time and page
// (no visitor code), and once an hour the release files' download counts on GitHub are read and any increase is
// recorded, which covers downloads from anywhere (GitHub's own page, links posted elsewhere) to the nearest hour.

export const ORIGIN = 'https://preceptorofmagic.github.io';
export const PAGES = new Set(['index.html', 'setup.html', 'eclipse.html', 'umbra.html', 'development.html',
  'credits.html', 'licence.html', '404.html']);
const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|python|curl|wget|httpclient|go-http|java\//i;
const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const HOST = /^[a-z0-9.-]{1,100}$/;
const MAX_MS = 3600000;          // a page left open longer than an hour counts as one hour
const KEEP_DAYS = 396;           // 13 months
const DAY_MS = 86400000;
export const REPOS = ['Eclipse', 'Umbra'];
const FILE = /^[A-Za-z0-9._+-]{1,120}$/;

export default {
  fetch: (req, env) => handle(req, env, new Date()),
  scheduled: async (event, env) => { await pollGitHub(env, fetch, new Date()); await prune(env.DB, new Date()); },
};

const cors = { 'Access-Control-Allow-Origin': ORIGIN, 'Vary': 'Origin' };
const empty = (status) => new Response(null, { status, headers: cors });
export const dayOf = (now) => now.toISOString().slice(0, 10);

export async function handle(req, env, now) {
  const url = new URL(req.url);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...cors,
    'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400' } });
  if (req.method === 'POST' && (url.pathname === '/v' || url.pathname === '/l' || url.pathname === '/d')) {
    if (req.headers.get('Origin') !== ORIGIN) return empty(403);
    const text = await req.text();
    if (text.length > 512) return empty(413);
    let body;
    try { body = JSON.parse(text); } catch { return empty(400); }
    if (!body || typeof body !== 'object') return empty(400);
    if (url.pathname === '/d') return click(req, env.DB, body, now);
    if (typeof body.id !== 'string' || !ID.test(body.id)) return empty(400);
    if (url.pathname === '/v') return view(req, env.DB, body, now);
    return leave(env.DB, body, now);
  }
  if (req.method === 'GET' && url.pathname === '/stats') return stats(req, env, url, now);
  return new Response('Not found', { status: 404 });
}

async function view(req, db, body, now) {
  const ua = req.headers.get('User-Agent') || '';
  if (!ua || BOT.test(ua)) return empty(204);
  if (!PAGES.has(body.p)) return empty(400);
  const ref = typeof body.r === 'string' && HOST.test(body.r) ? body.r : '';
  const day = dayOf(now);
  const salt = await daySalt(db, day);
  const ip = req.headers.get('CF-Connecting-IP') || '';
  const visitor = (await sha256(`${salt}|${ip}|${ua}`)).slice(0, 16);
  await db.prepare('INSERT OR IGNORE INTO views (id, day, ts, page, ref, visitor, ms) VALUES (?, ?, ?, ?, ?, ?, NULL)')
    .bind(body.id, day, now.getTime(), body.p, ref, visitor).run();
  return empty(204);
}

async function leave(db, body, now) {
  if (!Number.isFinite(body.ms) || body.ms < 0) return empty(400);
  const ms = Math.min(Math.round(body.ms), MAX_MS);
  await db.prepare('UPDATE views SET ms = MAX(COALESCE(ms, 0), ?) WHERE id = ? AND ts >= ?')
    .bind(ms, body.id, now.getTime() - DAY_MS).run();
  return empty(204);
}

async function click(req, db, body, now) {
  const ua = req.headers.get('User-Agent') || '';
  if (!ua || BOT.test(ua)) return empty(204);
  if (!PAGES.has(body.p) || !REPOS.includes(body.repo) || typeof body.f !== 'string' || !FILE.test(body.f)) return empty(400);
  await db.prepare('INSERT INTO clicks (day, ts, page, repo, file) VALUES (?, ?, ?, ?, ?)')
    .bind(dayOf(now), now.getTime(), body.p, body.repo, body.f).run();
  return empty(204);
}

// Reads every release file's download count; records increases since the last reading. A file's first reading is
// its starting total and is not recorded as a download. Drafts are invisible without a token and are skipped.
export async function pollGitHub(env, fetcher, now) {
  const db = env.DB;
  const headers = { 'User-Agent': 'hub-count', Accept: 'application/vnd.github+json' };
  if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
  const last = await db.prepare("SELECT value FROM meta WHERE key = 'github_poll'").first();
  const since = last ? JSON.parse(last.value).ts : null;
  let note = 'ok', files = 0;
  try {
    for (const repo of REPOS) {
      const res = await fetcher(`https://api.github.com/repos/PreceptorOfMagic/${repo}/releases?per_page=100`, { headers });
      if (!res.ok) throw new Error(`${repo}: GitHub ${res.status}`);
      for (const rel of await res.json()) {
        if (rel.draft) continue;
        for (const a of rel.assets || []) {
          if (typeof a.download_count !== 'number' || !FILE.test(a.name)) continue;
          files++;
          const old = await db.prepare('SELECT count FROM assets WHERE asset_id = ?').bind(a.id).first();
          if (old && a.download_count > old.count) {
            await db.prepare('INSERT INTO downloads (day, ts, since, repo, tag, file, n) VALUES (?, ?, ?, ?, ?, ?, ?)')
              .bind(dayOf(now), now.getTime(), since, repo, rel.tag_name, a.name, a.download_count - old.count).run();
          }
          if (!old || a.download_count !== old.count) {
            await db.prepare(`INSERT INTO assets (asset_id, repo, tag, file, count, first_count) VALUES (?, ?, ?, ?, ?, ?)
              ON CONFLICT (asset_id) DO UPDATE SET count = excluded.count, tag = excluded.tag, file = excluded.file`)
              .bind(a.id, repo, rel.tag_name, a.name, a.download_count, a.download_count).run();
          }
        }
      }
    }
  } catch (e) { note = String(e.message || e).slice(0, 200); }
  await db.prepare("INSERT INTO meta (key, value) VALUES ('github_poll', ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value")
    .bind(JSON.stringify({ ts: now.getTime(), note, files })).run();
  return note;
}

async function daySalt(db, day) {
  const row = await db.prepare('SELECT salt FROM salts WHERE day = ?').bind(day).first();
  if (row) return row.salt;
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  await db.prepare('INSERT OR IGNORE INTO salts (day, salt) VALUES (?, ?)').bind(day, hex(bytes)).run();
  await db.prepare('DELETE FROM salts WHERE day < ?').bind(day).run();
  return (await db.prepare('SELECT salt FROM salts WHERE day = ?').bind(day).first()).salt;
}

export async function prune(db, now) {
  await db.prepare('DELETE FROM salts WHERE day < ?').bind(dayOf(now)).run();
  const cutoff = dayOf(new Date(now.getTime() - KEEP_DAYS * DAY_MS));
  for (const t of ['views', 'clicks', 'downloads']) await db.prepare(`DELETE FROM ${t} WHERE day < ?`).bind(cutoff).run();
}

const hex = (bytes) => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
async function sha256(s) { return hex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))); }

async function authorised(req, env) {
  const want = env.STATS_PASSWORD;
  const got = (req.headers.get('Authorization') || '').match(/^Basic (.+)$/);
  if (!want || !got) return false;
  let pass;
  try { pass = atob(got[1]).split(':').slice(1).join(':'); } catch { return false; }
  const [a, b] = await Promise.all([sha256(pass), sha256(want)]);   // equal-length compare
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
export function duration(ms) {
  if (ms == null) return '–';
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s`;
}

export async function stats(req, env, url, now) {
  if (!(await authorised(req, env))) return new Response('Password required', { status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Hub visits", charset="UTF-8"' } });
  const days = [7, 30, 90, 365].includes(Number(url.searchParams.get('days'))) ? Number(url.searchParams.get('days')) : 30;
  const from = dayOf(new Date(now.getTime() - (days - 1) * DAY_MS));
  const db = env.DB;
  const polled = await db.prepare("SELECT value FROM meta WHERE key = 'github_poll'").first();
  if (!polled || now.getTime() - JSON.parse(polled.value).ts > 65 * 60000) await pollGitHub(env, env.FETCH || fetch, now);
  const q = (sql) => db.prepare(sql).bind(from).all().then((r) => r.results);
  const [total] = await q(`SELECT COUNT(*) AS views, COUNT(DISTINCT day || visitor) AS visitors,
    AVG(NULLIF(ms, 0)) AS avg_ms FROM views WHERE day >= ?`);
  const [site] = await q(`SELECT AVG(t) AS avg_ms FROM (SELECT SUM(ms) AS t FROM views WHERE day >= ? AND ms > 0
    GROUP BY day, visitor)`);
  const byDay = await q(`SELECT day, COUNT(*) AS views, COUNT(DISTINCT visitor) AS visitors, AVG(NULLIF(ms, 0)) AS avg_ms
    FROM views WHERE day >= ? GROUP BY day ORDER BY day DESC`);
  const byPage = await q(`SELECT page, COUNT(*) AS views, COUNT(DISTINCT day || visitor) AS visitors,
    AVG(NULLIF(ms, 0)) AS avg_ms FROM views WHERE day >= ? GROUP BY page ORDER BY views DESC`);
  const byRef = await q(`SELECT ref, COUNT(*) AS views FROM views WHERE day >= ? AND ref != '' GROUP BY ref
    ORDER BY views DESC LIMIT 25`);
  const files = await q(`SELECT a.repo, a.tag, a.file, a.count, a.first_count,
    (SELECT SUM(n) FROM downloads d WHERE d.repo = a.repo AND d.file = a.file AND d.tag = a.tag AND d.day >= ?1) AS period,
    (SELECT COUNT(*) FROM clicks c WHERE c.repo = a.repo AND c.file = a.file AND c.day >= ?1) AS clicks,
    (SELECT MAX(ts) FROM downloads d WHERE d.repo = a.repo AND d.file = a.file AND d.tag = a.tag) AS last
    FROM assets a WHERE a.file NOT LIKE '%.sha256' AND a.file != 'SHA256SUMS' ORDER BY a.repo, a.count DESC`);
  const recent = await q(`SELECT ts, since, 'GitHub count' AS how, repo, file, n FROM downloads WHERE day >= ?1
    UNION ALL SELECT ts, NULL, 'Hub button on ' || page, repo, file, 1 FROM clicks WHERE day >= ?1 ORDER BY ts DESC LIMIT 60`);
  const poll = await db.prepare("SELECT value FROM meta WHERE key = 'github_poll'").first();
  const pollInfo = poll ? JSON.parse(poll.value) : null;
  const when = (ms) => ms ? new Date(ms).toISOString().slice(0, 16).replace('T', ' ') + ' UTC' : '–';
  const table = (head, rows) => `<table><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr>${rows.map((r) =>
    `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table>`;
  const tabs = [7, 30, 90, 365].map((d) => d === days ? `<b>${d} days</b>` : `<a href="?days=${d}">${d} days</a>`).join(' · ');
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>Hub visits</title><style>body{font:15px system-ui,sans-serif;margin:0 auto;max-width:56rem;padding:1rem;color:#1d1b24;background:#faf9fc}
table{border-collapse:collapse;margin:.5rem 0 1.5rem;font-variant-numeric:tabular-nums}th,td{padding:.3rem .8rem;border-bottom:1px solid #ddd;text-align:right}
th:first-child,td:first-child{text-align:left}.big{display:flex;gap:2rem;flex-wrap:wrap}.big b{display:block;font-size:1.6rem}
@media (prefers-color-scheme:dark){body{color:#ecebf2;background:#16151b}th,td{border-color:#333}a{color:#b9a3ff}}</style>
<h1>Hub visits</h1><p>${tabs} (UTC days, from ${from})</p>
<div class="big"><div><b>${total.views}</b>page views</div><div><b>${total.visitors}</b>daily unique visitors</div>
<div><b>${duration(total.avg_ms)}</b>average time on a page</div><div><b>${duration(site.avg_ms)}</b>average time on the site per visitor per day</div></div>
<h2>Pages</h2>${table(['Page', 'Views', 'Daily unique visitors', 'Average time'], byPage.map((r) => [r.page, r.views, r.visitors, duration(r.avg_ms)]))}
<h2>Days</h2>${table(['Day', 'Views', 'Unique visitors', 'Average time on a page'], byDay.map((r) => [r.day, r.views, r.visitors, duration(r.avg_ms)]))}
<h2>Downloads</h2><p>GitHub counts every download of a release file, wherever the link was found, and is read once an hour
(last read ${pollInfo ? `${when(pollInfo.ts)}: ${esc(pollInfo.note)}, ${pollInfo.files} files` : 'not yet'}). “Before counting” is GitHub’s total when
the counter first saw the file, including the project’s own test downloads. Checksum files are left out of this table.</p>
${files.length ? table(['File', 'Release', 'All-time (GitHub)', 'Before counting', 'In this period', 'Clicked on the Hub', 'Last seen'],
    files.map((r) => [r.file, r.tag, r.count, r.first_count, r.period || 0, r.clicks, when(r.last)])) : '<p>No GitHub reading yet.</p>'}
<h3>Recent downloads</h3><p>A Hub button click has its exact time. A GitHub count can only say a download happened between
two readings.</p>${recent.length ? table(['Time', 'Seen by', 'Project', 'File', 'Downloads'],
    recent.map((r) => [r.since ? `between ${when(r.since)} and ${when(r.ts)}` : when(r.ts), r.how, r.repo, r.file, r.n])) : '<p>None in this period.</p>'}
<h2>Referring sites</h2>${byRef.length ? table(['Site', 'Views'], byRef.map((r) => [r.ref, r.views])) : '<p>None yet.</p>'}
<p>A visitor is counted once per UTC day; the same person on two days counts twice, by design. Times are how long the page was visible; views where the visitor left before the time was sent show no time.</p>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store',
    'X-Robots-Tag': 'noindex' } });
}

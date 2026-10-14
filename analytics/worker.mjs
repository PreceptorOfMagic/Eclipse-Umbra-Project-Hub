// Hub visit counter: a Cloudflare Worker with a D1 (SQLite) database.
//
// What it keeps, per page view: the page, the referring site's host name, the time the page was visible, and a
// visitor code that is only good for one day (midnight to midnight UTC+10). The code is a hash of that day's random
// salt, the IP address and the browser's user-agent; the salt is deleted when the day ends, so codes cannot be linked
// across days or turned back into an address. No cookies or browser storage are used, and the IP address is never stored.
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
const TZ_MS = 10 * 3600000;      // Brisbane: UTC+10 all year, no daylight saving. Stats days and visitor days use it.
export const REPOS = ['Eclipse', 'Umbra', 'Umbra-Vibepollo'];
const FILE = /^[A-Za-z0-9._+-]{1,120}$/;

export default {
  fetch: (req, env) => handle(req, env, new Date()),
  scheduled: async (event, env) => { await pollGitHub(env, fetch, new Date()); await prune(env.DB, new Date()); },
};

const cors = { 'Access-Control-Allow-Origin': ORIGIN, 'Vary': 'Origin' };
const empty = (status) => new Response(null, { status, headers: cors });
export const dayOf = (now) => now.toISOString().slice(0, 10);
export const localDay = (now) => dayOf(new Date(now.getTime() + TZ_MS));

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
  if (req.method === 'POST' && url.pathname === '/counts') return receiveCounts(req, env, now);
  if (req.method === 'GET' && url.pathname === '/stats') return stats(req, env, url, now);
  return new Response('Not found', { status: 404 });
}

async function view(req, db, body, now) {
  const ua = req.headers.get('User-Agent') || '';
  if (!ua || BOT.test(ua)) return empty(204);
  if (!PAGES.has(body.p)) return empty(400);
  const ref = typeof body.r === 'string' && HOST.test(body.r) ? body.r : '';
  const day = dayOf(now);
  const salt = await daySalt(db, localDay(now));
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

// Release download counts arrive two ways: this worker reads GitHub every hour (GitHub may rate-limit Cloudflare's
// shared addresses), and an hourly GitHub Actions job in the Hub repository sends them to /counts. Both go through
// recordReleases. A file's first reading is its starting total and is not recorded as a download; after that, each
// increase is recorded once, with the window since the previous successful reading. Drafts are skipped.
export async function recordReleases(db, byRepo, now) {
  const prev = await meta(db, 'last_reading');
  const since = prev ? prev.ts : null;
  let files = 0;
  for (const { repo, releases } of byRepo) {
    for (const rel of releases) {
      if (rel.draft || typeof rel.tag_name !== 'string') continue;
      for (const a of rel.assets || []) {
        if (!Number.isInteger(a.id) || !Number.isInteger(a.download_count) || !FILE.test(a.name)) continue;
        files++;
        const old = await db.prepare('SELECT count FROM assets WHERE asset_id = ?').bind(a.id).first();
        if (!old) {
          await db.prepare('INSERT OR IGNORE INTO assets (asset_id, repo, tag, file, count, first_count) VALUES (?, ?, ?, ?, ?, ?)')
            .bind(a.id, repo, rel.tag_name, a.name, a.download_count, a.download_count).run();
        } else if (a.download_count !== old.count) {
          const res = await db.prepare('UPDATE assets SET count = ?, tag = ?, file = ? WHERE asset_id = ? AND count = ?')
            .bind(a.download_count, rel.tag_name, a.name, a.id, old.count).run();
          if (res.meta.changes === 1 && a.download_count > old.count) {
            await db.prepare('INSERT INTO downloads (day, ts, since, repo, tag, file, n) VALUES (?, ?, ?, ?, ?, ?, ?)')
              .bind(dayOf(now), now.getTime(), since, repo, rel.tag_name, a.name, a.download_count - old.count).run();
          }
        }
      }
    }
  }
  await setMeta(db, 'last_reading', { ts: now.getTime() });
  return files;
}

export async function pollGitHub(env, fetcher, now) {
  const headers = { 'User-Agent': 'hub-count', Accept: 'application/vnd.github+json' };
  if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
  let note = 'ok', files = 0;
  try {
    const byRepo = [];
    for (const repo of REPOS) {
      const res = await fetcher(`https://api.github.com/repos/PreceptorOfMagic/${repo}/releases?per_page=100`, { headers });
      if (!res.ok) {
        const limited = res.headers && res.headers.get && res.headers.get('x-ratelimit-remaining') === '0';
        throw new Error(`${repo}: GitHub ${res.status}${limited ? ' (rate limited)' : ''}`);
      }
      byRepo.push({ repo, releases: await res.json() });
    }
    files = await recordReleases(env.DB, byRepo, now);
  } catch (e) { note = String(e.message || e).slice(0, 200); }
  await setMeta(env.DB, 'github_poll', { ts: now.getTime(), note, files });
  return note;
}

async function receiveCounts(req, env, now) {
  if (!(await sameSecret(((req.headers.get('Authorization') || '').match(/^Bearer (.+)$/) || [])[1], env.COUNTS_TOKEN)))
    return new Response('Unauthorised', { status: 401 });
  const text = await req.text();
  if (text.length > 65536) return new Response('Too large', { status: 413 });
  let body;
  try { body = JSON.parse(text); } catch { return new Response('Bad JSON', { status: 400 }); }
  if (!Array.isArray(body) || !body.every((r) => r && REPOS.includes(r.repo) && Array.isArray(r.releases)))
    return new Response('Bad shape', { status: 400 });
  const files = await recordReleases(env.DB, body, now);
  await setMeta(env.DB, 'github_push', { ts: now.getTime(), note: 'ok', files });
  return new Response(`recorded ${files} files\n`, { status: 200 });
}

async function meta(db, key) {
  const row = await db.prepare('SELECT value FROM meta WHERE key = ?').bind(key).first();
  return row ? JSON.parse(row.value) : null;
}
const setMeta = (db, key, value) => db.prepare('INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value')
  .bind(key, JSON.stringify(value)).run();

async function daySalt(db, day) {
  const row = await db.prepare('SELECT salt FROM salts WHERE day = ?').bind(day).first();
  if (row) return row.salt;
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  await db.prepare('INSERT OR IGNORE INTO salts (day, salt) VALUES (?, ?)').bind(day, hex(bytes)).run();
  await db.prepare('DELETE FROM salts WHERE day < ?').bind(day).run();
  return (await db.prepare('SELECT salt FROM salts WHERE day = ?').bind(day).first()).salt;
}

export async function prune(db, now) {
  await db.prepare('DELETE FROM salts WHERE day < ?').bind(localDay(now)).run();
  const cutoff = dayOf(new Date(now.getTime() - KEEP_DAYS * DAY_MS));
  for (const t of ['views', 'clicks', 'downloads']) await db.prepare(`DELETE FROM ${t} WHERE day < ?`).bind(cutoff).run();
}

const hex = (bytes) => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
async function sha256(s) { return hex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))); }

async function authorised(req, env) {
  const got = (req.headers.get('Authorization') || '').match(/^Basic (.+)$/);
  if (!got) return false;
  let pass;
  try { pass = atob(got[1]).split(':').slice(1).join(':'); } catch { return false; }
  return sameSecret(pass, env.STATS_PASSWORD);
}

async function sameSecret(got, want) {
  if (!want || typeof got !== 'string') return false;
  const [a, b] = await Promise.all([sha256(got), sha256(want)]);   // equal-length compare
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

// Times are stored in UTC and shown in Brisbane time. LOCAL_DAY is the Brisbane date of a row's ts, in SQL.
const LOCAL_DAY = `date((ts + ${TZ_MS}) / 1000, 'unixepoch')`;
const localIso = (ms) => new Date(ms + TZ_MS).toISOString();
export const when = (ms) => ms ? localIso(ms).slice(0, 16).replace('T', ' ') : '–';
const seconds = (ms) => ms == null ? null : Math.round(ms / 100) / 10;

// RFC 4180, with a byte-order mark so Excel reads it as UTF-8. Text starting like a formula is prefixed with ' so a
// spreadsheet shows it instead of running it.
export function csv(rows) {
  const cell = (v) => {
    if (v == null) return '';
    let s = String(v);
    if (typeof v === 'string' && /^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return '\ufeff' + rows.map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n';
}

// One row per page view, oldest first. The window runs over whole visitor-code days (the inner query starts at the
// UTC day the period starts in, which also covers codes that changed at midnight UTC before 2026-10-15), so a
// visitor's page number and previous page are right even at the start of the period.
async function visitsCsv(db, fromUtc, start) {
  const rows = (await db.prepare(`SELECT * FROM (SELECT ts, page, ref, ms, visitor,
      ROW_NUMBER() OVER w AS page_no, COUNT(*) OVER (PARTITION BY visitor) AS pages,
      LAG(page) OVER w AS prev_page, LAG(ts) OVER w AS prev_ts
    FROM views WHERE day >= ?1 WINDOW w AS (PARTITION BY visitor ORDER BY ts, id)) WHERE ts >= ?2 ORDER BY ts, visitor`)
    .bind(fromUtc, start).all()).results;
  return csv([['Date (Brisbane)', 'Time (Brisbane)', 'Page', 'Came from site', 'Seconds on page', 'Visitor code (one day only)',
    'Visitor’s page no. that day', 'Visitor’s pages that day', 'Previous page', 'Seconds since previous page', 'UTC time'],
  ...rows.map((r) => { const t = localIso(r.ts); return [t.slice(0, 10), t.slice(11, 19), r.page, r.ref, seconds(r.ms), r.visitor,
    r.page_no, r.pages, r.prev_page, r.prev_ts == null ? null : seconds(r.ts - r.prev_ts), new Date(r.ts).toISOString()]; })]);
}

// Hub button clicks (exact time) and increases in GitHub's counts (happened between the previous reading and this one).
async function downloadsCsv(db, fromUtc, start) {
  const rows = (await db.prepare(`SELECT ts, NULL AS since, 'Hub button click' AS how, repo, NULL AS tag, file, 1 AS n, page
    FROM clicks WHERE day >= ?1 AND ts >= ?2 UNION ALL SELECT ts, since, 'GitHub count', repo, tag, file, n, NULL
    FROM downloads WHERE day >= ?1 AND ts >= ?2 ORDER BY ts`).bind(fromUtc, start).all()).results;
  return csv([['Date (Brisbane)', 'Time (Brisbane)', 'Counted by', 'Project', 'Release', 'File', 'Downloads', 'Hub page',
    'Counted since (Brisbane)', 'UTC time'],
  ...rows.map((r) => { const t = localIso(r.ts); return [t.slice(0, 10), t.slice(11, 19), r.how, r.repo, r.tag, r.file, r.n, r.page,
    r.since ? localIso(r.since).slice(0, 19).replace('T', ' ') : null, new Date(r.ts).toISOString()]; })]);
}

export async function stats(req, env, url, now) {
  if (!(await authorised(req, env))) return new Response('Password required', { status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Hub visits", charset="UTF-8"' } });
  const days = [7, 30, 90, 365].includes(Number(url.searchParams.get('days'))) ? Number(url.searchParams.get('days')) : 30;
  // The period is whole Brisbane days. start = its first midnight in UTC ms; fromUtc narrows by the indexed day column.
  const today = localDay(now);
  const from = dayOf(new Date(Date.parse(today) - (days - 1) * DAY_MS));
  const start = Date.parse(from) - TZ_MS;
  const fromUtc = dayOf(new Date(start));
  const db = env.DB;
  const download = url.searchParams.get('download');
  if (download === 'visits' || download === 'downloads') {
    const body = await (download === 'visits' ? visitsCsv : downloadsCsv)(db, fromUtc, start);
    return new Response(body, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex', 'Content-Disposition': `attachment; filename="hub-${download}_${from}_to_${today}.csv"` } });
  }
  const reading = await meta(db, 'last_reading');
  if (url.searchParams.get('refresh') === '1' || !reading || now.getTime() - reading.ts > 65 * 60000) await pollGitHub(env, env.FETCH || fetch, now);
  const q = (sql) => db.prepare(sql).bind(fromUtc, start).all().then((r) => r.results);
  const [total] = await q(`SELECT COUNT(*) AS views, COUNT(DISTINCT ${LOCAL_DAY} || visitor) AS visitors,
    AVG(NULLIF(ms, 0)) AS avg_ms FROM views WHERE day >= ?1 AND ts >= ?2`);
  const [site] = await q(`SELECT AVG(t) AS avg_ms FROM (SELECT SUM(ms) AS t FROM views WHERE day >= ?1 AND ts >= ?2 AND ms > 0
    GROUP BY ${LOCAL_DAY}, visitor)`);
  const byDay = await q(`SELECT ${LOCAL_DAY} AS day, COUNT(*) AS views, COUNT(DISTINCT visitor) AS visitors, AVG(NULLIF(ms, 0)) AS avg_ms,
    MIN(NULLIF(ms, 0)) AS min_ms, MAX(NULLIF(ms, 0)) AS max_ms FROM views WHERE day >= ?1 AND ts >= ?2 GROUP BY 1 ORDER BY 1 DESC`);
  const byPage = await q(`SELECT page, COUNT(*) AS views, COUNT(DISTINCT ${LOCAL_DAY} || visitor) AS visitors,
    AVG(NULLIF(ms, 0)) AS avg_ms, MIN(NULLIF(ms, 0)) AS min_ms, MAX(NULLIF(ms, 0)) AS max_ms FROM views WHERE day >= ?1 AND ts >= ?2
    GROUP BY page ORDER BY views DESC`);
  const byRef = await q(`SELECT ref, COUNT(*) AS views FROM views WHERE day >= ?1 AND ts >= ?2 AND ref != '' GROUP BY ref
    ORDER BY views DESC LIMIT 25`);
  // Only increases after a file's first reading are shown; its starting total (first_count) predates counting.
  const files = await q(`SELECT a.repo, a.tag, a.file,
    (SELECT COALESCE(SUM(n), 0) FROM downloads d WHERE d.repo = a.repo AND d.file = a.file AND d.tag = a.tag AND d.day >= ?1 AND d.ts >= ?2) AS period,
    (SELECT COUNT(*) FROM clicks c WHERE c.repo = a.repo AND c.file = a.file AND c.day >= ?1 AND c.ts >= ?2) AS clicks,
    MAX(COALESCE((SELECT MAX(ts) FROM downloads d WHERE d.repo = a.repo AND d.file = a.file AND d.tag = a.tag), 0),
      COALESCE((SELECT MAX(ts) FROM clicks c WHERE c.repo = a.repo AND c.file = a.file), 0)) AS last
    FROM assets a WHERE a.file NOT LIKE '%.sha256' AND a.file != 'SHA256SUMS' ORDER BY a.repo, period DESC, clicks DESC, a.file`);
  const recent = await q(`SELECT ts, since, 'GitHub count' AS how, repo, file, n FROM downloads WHERE day >= ?1 AND ts >= ?2
    UNION ALL SELECT ts, NULL, 'Hub button on ' || page, repo, file, 1 FROM clicks WHERE day >= ?1 AND ts >= ?2 ORDER BY ts DESC LIMIT 60`);
  const [lastReading, poll, push] = await Promise.all(['last_reading', 'github_poll', 'github_push'].map((k) => meta(db, k)));
  const status = (m) => m ? `${when(m.ts)}: ${esc(m.note)}, ${m.files} files` : 'not yet';
  const table = (head, rows) => `<table><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr>${rows.map((r) =>
    `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table>`;
  const tabs = [7, 30, 90, 365].map((d) => d === days ? `<b>${d} days</b>` : `<a href="?days=${d}">${d} days</a>`).join(' · ');
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>Hub visits</title><style>body{font:15px system-ui,sans-serif;margin:0 auto;max-width:56rem;padding:1rem;color:#1d1b24;background:#faf9fc}
table{border-collapse:collapse;margin:.5rem 0 1.5rem;font-variant-numeric:tabular-nums}th,td{padding:.3rem .8rem;border-bottom:1px solid #ddd;text-align:right}
th:first-child,td:first-child{text-align:left}.big{display:flex;gap:2rem;flex-wrap:wrap}.big b{display:block;font-size:1.6rem}
@media (prefers-color-scheme:dark){body{color:#ecebf2;background:#16151b}th,td{border-color:#333}a{color:#b9a3ff}}</style>
<h1>Hub visits</h1><p>${tabs} (from ${from}; all days and times are Brisbane time, UTC+10)</p>
<p>Raw data for these ${days} days, one row each: <a href="?days=${days}&amp;download=visits">page views (CSV)</a> ·
<a href="?days=${days}&amp;download=downloads">downloads (CSV)</a></p>
<div class="big"><div><b>${total.views}</b>page views</div><div><b>${total.visitors}</b>daily unique visitors</div>
<div><b>${duration(total.avg_ms)}</b>average time on a page</div><div><b>${duration(site.avg_ms)}</b>average time on the site per visitor per day</div></div>
<h2>Pages</h2>${table(['Page', 'Views', 'Daily unique visitors', 'Average time', 'Shortest time', 'Longest time'],
  byPage.map((r) => [r.page, r.views, r.visitors, duration(r.avg_ms), duration(r.min_ms), duration(r.max_ms)]))}
<h2>Days</h2>${table(['Day', 'Views', 'Unique visitors', 'Average time on a page', 'Shortest time on a page', 'Longest time on a page'],
  byDay.map((r) => [r.day, r.views, r.visitors, duration(r.avg_ms), duration(r.min_ms), duration(r.max_ms)]))}
<h2>Downloads</h2><p>Counted from the counter’s first reading of GitHub; earlier downloads, including the project’s own
test downloads, are not shown. <b>Hub button clicks</b>: someone clicked this file’s download button on the Hub, recorded the
moment it happened. <b>Downloads from anywhere</b>: GitHub’s own count for the file, which also covers its release page and
links shared elsewhere (and so includes most Hub clicks), read every hour. Checksum files are left out.</p>
${files.length ? table(['File', 'Release', 'Hub button clicks', 'Downloads from anywhere', 'Most recent'],
    files.map((r) => [r.file, r.tag, r.clicks, r.period, when(r.last)])) : '<p>No GitHub reading yet.</p>'}
<p><small>GitHub last read ${lastReading ? when(lastReading.ts) : 'never'} · by this counter: ${status(poll)} · by GitHub Actions: ${status(push)} ·
<a href="?days=${days}&amp;refresh=1">Read now</a></small></p>
<h3>Recent downloads</h3><p>A Hub button click has its exact time. A GitHub count can only say a download happened between
two readings.</p>${recent.length ? table(['When', 'Counted by', 'Project', 'File', 'Downloads'],
    recent.map((r) => [r.since ? `between ${when(r.since)} and ${when(r.ts)}` : when(r.ts), r.how, r.repo, r.file, r.n])) : '<p>None in this period.</p>'}
<h2>Referring sites</h2>${byRef.length ? table(['Site', 'Views'], byRef.map((r) => [r.ref, r.views])) : '<p>None yet.</p>'}
<p>A visitor is counted once per Brisbane day; the same person on two days counts twice, by design. Up to 14 October 2026 the
visitor code changed at 10:00 Brisbane time (midnight UTC), so on those days someone seen both before and after 10:00 counts
twice. Times are how long the page was visible; views where the visitor left before the time was sent show no time and are left out of the average, shortest and longest. A page left open longer than an hour counts as one hour.</p>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store',
    'X-Robots-Tag': 'noindex' } });
}

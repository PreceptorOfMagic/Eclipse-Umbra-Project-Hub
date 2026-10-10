import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { handle, prune, ORIGIN, duration } from '../../analytics/worker.mjs';
import { startCounting, pageName, referrerHost } from '../../site/assets/count.mjs';

// The D1 calls the worker uses, on a real SQLite database.
function d1() {
  const sql = new DatabaseSync(':memory:');
  sql.exec(readFileSync(new URL('../../analytics/schema.sql', import.meta.url), 'utf8'));
  const prepare = (q) => ({ bind: (...a) => ({
    run: async () => sql.prepare(q).run(...a),
    first: async () => sql.prepare(q).get(...a) ?? null,
    all: async () => ({ results: sql.prepare(q).all(...a) }),
  }) });
  return { prepare, sql };
}
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36';
const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
function post(path, body, { origin = ORIGIN, ua = UA, ip = '203.0.113.7' } = {}) {
  return new Request(`https://count.example${path}`, { method: 'POST', body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { 'Content-Type': 'text/plain;charset=UTF-8', Origin: origin, 'User-Agent': ua, 'CF-Connecting-IP': ip } });
}
const T0 = new Date('2026-10-11T10:00:00Z');
const later = (ms) => new Date(T0.getTime() + ms);
const auth = (pw) => ({ Authorization: 'Basic ' + btoa('any:' + pw) });

test('records a view and its visible time; a later, smaller time does not lower it', async () => {
  const DB = d1(), env = { DB };
  assert.equal((await handle(post('/v', { id: id(1), p: 'setup.html', r: 'www.reddit.com' }), env, T0)).status, 204);
  await handle(post('/l', { id: id(1), ms: 42000 }), env, later(42000));
  await handle(post('/l', { id: id(1), ms: 1000 }), env, later(43000));
  const row = DB.sql.prepare('SELECT * FROM views').get();
  assert.deepEqual([row.page, row.ref, row.day, row.ms], ['setup.html', 'www.reddit.com', '2026-10-11', 42000]);
  assert.equal(row.visitor.length, 16);
  assert.ok(!JSON.stringify(row).includes('203.0.113.7'), 'IP address must not be stored');
});

test('rejects other origins, bots, unknown pages, bad ids and oversized bodies', async () => {
  const DB = d1(), env = { DB };
  assert.equal((await handle(post('/v', { id: id(1), p: 'index.html' }, { origin: 'https://evil.example' }), env, T0)).status, 403);
  assert.equal((await handle(post('/v', { id: id(2), p: 'index.html' }, { ua: 'Googlebot/2.1' }), env, T0)).status, 204);
  assert.equal((await handle(post('/v', { id: id(3), p: '../secret' }), env, T0)).status, 400);
  assert.equal((await handle(post('/v', { id: 'x', p: 'index.html' }), env, T0)).status, 400);
  assert.equal((await handle(post('/v', 'x'.repeat(600)), env, T0)).status, 413);
  assert.equal((await handle(post('/v', '{'), env, T0)).status, 400);
  assert.equal((await handle(post('/v', { id: id(4), p: 'index.html', r: '<script>' }), env, T0)).status, 204);
  assert.deepEqual(DB.sql.prepare('SELECT id, ref FROM views').all().map((r) => [r.id, r.ref]), [[id(4), '']]);
});

test('times are capped at an hour and old views cannot be changed', async () => {
  const DB = d1(), env = { DB };
  await handle(post('/v', { id: id(1), p: 'index.html' }), env, T0);
  await handle(post('/l', { id: id(1), ms: 9e9 }), env, T0);
  assert.equal(DB.sql.prepare('SELECT ms FROM views').get().ms, 3600000);
  await handle(post('/v', { id: id(2), p: 'index.html' }), env, T0);
  await handle(post('/l', { id: id(2), ms: 5000 }), env, later(2 * 86400000));
  assert.equal(DB.sql.prepare('SELECT ms FROM views WHERE id = ?').get(id(2)).ms, null);
});

test('one visitor is one unique per day, and cannot be linked to the next day', async () => {
  const DB = d1(), env = { DB };
  await handle(post('/v', { id: id(1), p: 'index.html' }), env, T0);
  await handle(post('/v', { id: id(2), p: 'setup.html' }), env, later(60000));
  await handle(post('/v', { id: id(3), p: 'index.html' }, { ip: '198.51.100.9' }), env, later(60000));
  await handle(post('/v', { id: id(4), p: 'index.html' }), env, later(86400000));
  const v = DB.sql.prepare('SELECT id, visitor FROM views ORDER BY id').all().map((r) => r.visitor);
  assert.equal(v[0], v[1]);
  assert.notEqual(v[0], v[2]);
  assert.notEqual(v[0], v[3], 'same person next day must get an unrelated code');
  assert.deepEqual(DB.sql.prepare('SELECT day FROM salts').all().map((r) => r.day), ['2026-10-12'], 'old salt deleted');
});

test('stats need the password and report views, uniques, time and referrers', async () => {
  const DB = d1(), env = { DB, STATS_PASSWORD: 'correct horse' };
  await handle(post('/v', { id: id(1), p: 'index.html', r: 'news.ycombinator.com' }), env, T0);
  await handle(post('/l', { id: id(1), ms: 30000 }), env, T0);
  await handle(post('/v', { id: id(2), p: 'setup.html' }), env, T0);
  await handle(post('/l', { id: id(2), ms: 90000 }), env, T0);
  await handle(post('/v', { id: id(3), p: 'index.html' }, { ip: '198.51.100.9' }), env, T0);
  const get = (h) => handle(new Request('https://count.example/stats?days=7', { headers: h }), env, T0);
  assert.equal((await get({})).status, 401);
  assert.equal((await get(auth('wrong'))).status, 401);
  assert.equal((await handle(new Request('https://count.example/stats'), { DB }, T0)).status, 401, 'no password set = locked');
  const html = await (await get(auth('correct horse'))).text();
  assert.match(html, /<b>3<\/b>page views/);
  assert.match(html, /<b>2<\/b>daily unique visitors/);
  assert.match(html, /<b>1 min 00 s<\/b>average time on a page/);
  assert.match(html, /<b>2 min 00 s<\/b>average time on the site per visitor per day/);
  assert.match(html, /<td>index.html<\/td><td>2<\/td><td>2<\/td>/);
  assert.match(html, /<td>news.ycombinator.com<\/td><td>1<\/td>/);
});

test('pruning removes views older than 13 months and past salts', async () => {
  const DB = d1(), env = { DB };
  await handle(post('/v', { id: id(1), p: 'index.html' }), env, new Date('2025-08-01T00:00:00Z'));
  await handle(post('/v', { id: id(2), p: 'index.html' }), env, T0);
  await prune(DB, later(86400000));
  assert.deepEqual(DB.sql.prepare('SELECT id FROM views').all().map((r) => r.id), [id(2)]);
  assert.equal(DB.sql.prepare('SELECT COUNT(*) AS n FROM salts').get().n, 0);
  assert.equal(duration(null), '–');
});

function fakeWindow({ gpc = false, dnt = null, hidden = false } = {}) {
  const sent = [], listeners = {};
  let t = 1000;
  const doc = { visibilityState: hidden ? 'hidden' : 'visible', referrer: 'https://www.reddit.com/r/LGOLED/',
    addEventListener: (e, f) => { listeners['d:' + e] = f; } };
  const win = {
    navigator: { sendBeacon: (url, body) => { sent.push([url, JSON.parse(body)]); return true; }, globalPrivacyControl: gpc, doNotTrack: dnt },
    document: doc, crypto: { randomUUID: () => id(9) }, performance: { now: () => t },
    location: { pathname: '/Eclipse-Umbra-Project-Hub/setup.html', hostname: 'preceptorofmagic.github.io' },
    addEventListener: (e, f) => { listeners['w:' + e] = f; },
  };
  return { win, sent, fire: (k) => listeners[k](), tick: (ms) => { t += ms; }, doc };
}

test('page script sends the view, then only visible time', () => {
  const w = fakeWindow();
  assert.equal(startCounting(w.win, 'https://count.example'), id(9));
  assert.deepEqual(w.sent[0], ['https://count.example/v', { id: id(9), p: 'setup.html', r: 'www.reddit.com' }]);
  w.tick(5000); w.doc.visibilityState = 'hidden'; w.fire('d:visibilitychange');
  w.tick(60000); w.doc.visibilityState = 'visible'; w.fire('d:visibilitychange');
  w.tick(2000); w.fire('w:pagehide');
  assert.deepEqual(w.sent.slice(1), [['https://count.example/l', { id: id(9), ms: 5000 }], ['https://count.example/l', { id: id(9), ms: 7000 }]]);
});

test('page script does nothing without an endpoint or when asked not to track', () => {
  for (const opts of [{ gpc: true }, { dnt: '1' }]) {
    const w = fakeWindow(opts);
    assert.equal(startCounting(w.win, 'https://count.example'), null);
    assert.equal(w.sent.length, 0);
  }
  assert.equal(startCounting(fakeWindow().win, ''), null);
  assert.equal(pageName('/Eclipse-Umbra-Project-Hub/'), 'index.html');
  assert.equal(referrerHost('https://preceptorofmagic.github.io/x', 'preceptorofmagic.github.io'), '');
  assert.equal(referrerHost('', 'x'), '');
});

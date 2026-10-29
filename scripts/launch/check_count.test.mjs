import test from 'node:test';
import assert from 'node:assert/strict';
import { startCounting, pageName, referrerHost, releaseFile, releasePage } from '../../site/assets/count.mjs';

// The page's counting script. The counter that receives it is kept in a private repository.
const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

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
  return { win, sent, fire: (k, arg) => listeners[k](arg), tick: (ms) => { t += ms; }, doc };
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

const IPK = 'https://github.com/PreceptorOfMagic/Eclipse/releases/download/eclipse-v1.3.4/com.aurora.gamestream_1.3.4_arm.ipk';
test('page script reports clicks on release files only', () => {
  const w = fakeWindow();
  startCounting(w.win, 'https://count.example');
  const link = (href) => ({ target: { closest: () => ({ href }) } });
  w.fire('d:click', link(IPK));
  w.fire('d:click', link('https://github.com/someone/Eclipse/releases/download/v1/x.ipk'));
  w.fire('d:click', { target: { closest: () => null } });
  w.fire('d:auxclick', { button: 1, ...link(IPK) });
  w.fire('d:auxclick', { button: 2, ...link(IPK) });
  const sent = ['https://count.example/d', { p: 'setup.html', repo: 'Eclipse', t: 'eclipse-v1.3.4', f: 'com.aurora.gamestream_1.3.4_arm.ipk' }];
  assert.deepEqual(w.sent.slice(1), [sent, sent], 'a click and a middle click; a right click is not a download');
  assert.deepEqual(releaseFile('https://github.com/PreceptorOfMagic/Umbra/releases/download/umbra-v0.5.0/Umbra-windows-x64.exe'),
    { repo: 'Umbra', t: 'umbra-v0.5.0', f: 'Umbra-windows-x64.exe' });
  assert.equal(releaseFile('https://github.com/PreceptorOfMagic/Umbra/releases/download/%E0/x.exe'), null);
});


test('page script reports links to a release page on GitHub, apart from downloads', () => {
  const w = fakeWindow();
  startCounting(w.win, 'https://count.example');
  const link = (href) => ({ target: { closest: () => ({ href }) } });
  w.fire('d:click', link('https://github.com/PreceptorOfMagic/Eclipse/releases/tag/eclipse-v1.3.6'));
  w.fire('d:auxclick', { button: 1, ...link('https://github.com/PreceptorOfMagic/Umbra/releases/latest') });
  w.fire('d:click', link('https://github.com/PreceptorOfMagic/Umbra-Vibepollo/releases'));
  w.fire('d:click', link('https://github.com/PreceptorOfMagic/Eclipse'));
  w.fire('d:click', link('https://github.com/someone/Eclipse/releases/tag/v1'));
  assert.deepEqual(w.sent.slice(1), [
    ['https://count.example/g', { p: 'setup.html', repo: 'Eclipse', t: 'eclipse-v1.3.6' }],
    ['https://count.example/g', { p: 'setup.html', repo: 'Umbra' }],
    ['https://count.example/g', { p: 'setup.html', repo: 'Umbra-Vibepollo' }]]);
  assert.equal(releasePage('https://github.com/PreceptorOfMagic/Eclipse/releases/download/v1/x.ipk'), null);
});

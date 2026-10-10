// Anonymous visit counter: no cookies, no browser storage. Sends the page name, the referring site's host name and
// how long the page was visible. Skipped when the browser asks not to be tracked. Receiver: analytics/worker.mjs.
export const ENDPOINT = 'https://hub-count.preceptorofmagic.workers.dev';

export function pageName(pathname) {
  const last = pathname.split('/').pop();
  return last && last.endsWith('.html') ? last : 'index.html';
}

export function referrerHost(referrer, ownHost) {
  try {
    const host = new URL(referrer).hostname.toLowerCase();
    return host === ownHost ? '' : host;
  } catch { return ''; }
}

export function startCounting(win = globalThis, endpoint = ENDPOINT) {
  const nav = win.navigator, doc = win.document;
  if (!endpoint || !nav || typeof nav.sendBeacon !== 'function' || !win.crypto?.randomUUID) return null;
  if (nav.webdriver || nav.globalPrivacyControl === true || nav.doNotTrack === '1') return null;
  const id = win.crypto.randomUUID();
  const send = (path, body) => { try { nav.sendBeacon(endpoint + path, JSON.stringify(body)); } catch {} };
  let shown = 0, since = doc.visibilityState === 'hidden' ? null : win.performance.now();
  const flush = () => {
    if (since !== null) { shown += win.performance.now() - since; since = null; }
    send('/l', { id, ms: Math.round(shown) });
  };
  send('/v', { id, p: pageName(win.location.pathname), r: referrerHost(doc.referrer, win.location.hostname) });
  doc.addEventListener('visibilitychange', () => {
    if (doc.visibilityState === 'hidden') flush();
    else if (since === null) since = win.performance.now();
  });
  win.addEventListener('pagehide', flush);
  return id;
}

if (typeof window !== 'undefined') startCounting(window);

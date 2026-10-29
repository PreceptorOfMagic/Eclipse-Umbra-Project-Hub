// Anonymous visit counter: no cookies, no browser storage. Sends the page name, the referring site's host name and
// how long the page was visible, and which release file (and release) a download link points to when one is clicked, or which release page a link to GitHub opens. Skipped when the browser asks not to be tracked. Receiver: the Hub's counter, a Cloudflare Worker kept in a private repository (what it keeps: analytics/README.md).
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

const RELEASE_FILE = /^https:\/\/github\.com\/PreceptorOfMagic\/(Eclipse|Umbra|Umbra-Vibepollo)\/releases\/download\/([^/]+)\/([^/?#]+)$/;
export function releaseFile(href) {
  const m = RELEASE_FILE.exec(href || '');
  try { return m ? { repo: m[1], t: decodeURIComponent(m[2]), f: decodeURIComponent(m[3]) } : null; } catch { return null; }
}

// A link to a release's page on GitHub (the link under each download button, or a releases link): not a download.
const RELEASE_PAGE = /^https:\/\/github\.com\/PreceptorOfMagic\/(Eclipse|Umbra|Umbra-Vibepollo)\/releases(?:\/tag\/([^/?#]+)|\/latest)?\/?(?:[?#].*)?$/;
export function releasePage(href) {
  const m = RELEASE_PAGE.exec(href || '');
  try { return m ? { repo: m[1], ...(m[2] ? { t: decodeURIComponent(m[2]) } : {}) } : null; } catch { return null; }
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
  // A middle click opens the link without a click event, so it is caught as auxclick.
  const clicked = (e) => {
    const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    const file = a && releaseFile(a.href), page = a && !file && releasePage(a.href);
    if (file) send('/d', { p: pageName(win.location.pathname), ...file });
    else if (page) send('/g', { p: pageName(win.location.pathname), ...page });
  };
  doc.addEventListener('click', clicked, true);
  doc.addEventListener('auxclick', (e) => { if (e.button === 1) clicked(e); }, true);
  return id;
}

if (typeof window !== 'undefined') startCounting(window);

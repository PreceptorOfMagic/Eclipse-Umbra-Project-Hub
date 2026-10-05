// Native details work without JavaScript. This only reveals deep-linked content.
export function openDisclosureTarget(root, hash) {
  if (!hash || hash === '#') return null;
  let id;
  try { id = decodeURIComponent(hash.slice(1)); } catch { return null; }
  const target = root.getElementById(id);
  if (!target) return null;
  let node = target;
  let insideDisclosure = false;
  while (node) {
    if (node.tagName === 'DETAILS') {
      node.open = true;
      insideDisclosure = true;
    }
    node = node.parentElement;
  }
  return insideDisclosure ? target : null;
}

if (typeof document !== 'undefined') {
  const reveal = () => {
    const target = openDisclosureTarget(document, location.hash);
    if (target) requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  };
  window.addEventListener('hashchange', reveal);
  // A second click on the same fragment does not fire hashchange.
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.('a[href]');
    if (!link || link.hasAttribute('download') || link.target) return;
    const url = new URL(link.href, location.href);
    if (url.origin === location.origin && url.pathname === location.pathname && url.search === location.search && url.hash === location.hash) reveal();
  });
  reveal();
}

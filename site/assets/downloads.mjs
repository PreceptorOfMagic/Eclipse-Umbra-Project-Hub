// No credentials are embedded: private repositories intentionally cannot resolve
// public downloads. Release attachments remain owned by the component repository.

// The Umbra for Linux release's HDR extras, one file per distribution and desktop (Umbra-HDR-<KDE|GNOME>-<target>.tar.gz).
export const hdrExtraTargets = Object.freeze({
  'ubuntu26.04': 'Ubuntu 26.04', 'ubuntu26.10': 'Ubuntu 26.10', fedora44: 'Fedora 44', fedora45: 'Fedora 45',
  'opensuse-tumbleweed': 'openSUSE Tumbleweed', arch: 'Arch Linux', cachyos: 'CachyOS',
});
function hdrExtraPlatforms() {
  const entries = [];
  for (const [target, distribution] of Object.entries(hdrExtraTargets)) {
    for (const [desktop, name] of [['KDE', 'KDE Plasma'], ['GNOME', 'GNOME']]) {
      entries.push([`umbra-hdr-${desktop.toLowerCase()}-${target}`, {
        repo: 'Umbra', tagPrefix: 'umbra-linux-v', extra: true, label: `${desktop} extra`,
        description: `the ${name} HDR extra for ${distribution}`,
        match: new RegExp(`^Umbra-HDR-${desktop}-${target.replace(/\./g, '\\.')}\\.tar\\.gz$`),
      }]);
    }
  }
  return Object.fromEntries(entries);
}

export const platforms = Object.freeze({
  webos: { repo: 'Eclipse', label: 'LG webOS', match: /^com\.aurora\.gamestream_[\w.+-]+_arm\.ipk$/i },
  windows: { repo: 'Eclipse', label: 'Windows x64', match: /^eclipse-windows-x64(?:-unsigned)?\.zip$/i },
  'windows-setup': { repo: 'Eclipse', label: 'Windows x64 installer', match: /^eclipse-windows-x64-setup(?:-unsigned)?\.exe$/i },
  linux: { repo: 'Eclipse', label: 'Linux x86_64', match: /^eclipse-linux-x86_64\.tar\.gz$/i },
  'umbra-windows': { repo: 'Umbra', label: 'Umbra Windows x64', match: /^(?:umbra(?:-windows-x64)?|apollo)\.exe$/i },
  // Linux and Windows Umbra are separate releases; Windows keeps "latest", so Linux is found by its tag.
  'umbra-linux': { repo: 'Umbra', tagPrefix: 'umbra-linux-v', label: 'Umbra for Linux (Flatpak)', match: /^umbra-[\w.+-]+-linux-x86_64\.flatpak$/i },
  'umbra-vibepollo-windows': { repo: 'Umbra-Vibepollo', label: 'Umbra (Vibepollo) Windows x64', match: /^umbra-vibepollo-windows-x64\.exe$/i },
  ...hdrExtraPlatforms(),
});

export function selectAsset(platform, release) {
  const config = platforms[platform];
  if (!config || !release || release.draft || release.prerelease || !Array.isArray(release.assets)) return null;
  const prefix = `https://github.com/PreceptorOfMagic/${config.repo}/releases/download/`;
  const matches = release.assets.filter(asset => typeof asset.name === 'string'
    && config.match.test(asset.name) && asset.state === 'uploaded' && asset.size > 0
    && typeof asset.browser_download_url === 'string' && asset.browser_download_url.startsWith(prefix));
  // An ambiguous release must be read by the user, not guessed by the site.
  return matches.length === 1 ? matches[0] : null;
}

// tagPrefix: the newest stable release whose tag starts with it, instead of the repository's latest.
export async function loadRelease(repo, fetcher = fetch, tagPrefix = '') {
  const api = `https://api.github.com/repos/PreceptorOfMagic/${repo}/releases`;
  const response = await fetcher(tagPrefix ? `${api}?per_page=30` : `${api}/latest`, {
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (response.status === 404) return { unavailable: true };
  if (!response.ok) throw new Error('Release lookup unavailable');
  if (!tagPrefix) return { release: await response.json() };
  const releases = await response.json();
  const release = Array.isArray(releases) ? releases.find(item => item && !item.draft && !item.prerelease
    && typeof item.tag_name === 'string' && item.tag_name.startsWith(tagPrefix)) : null;
  return release ? { release } : { unavailable: true };
}

export function displayRelease(control, platform, result) {
  const config = platforms[platform];
  const link = control.querySelector('[data-download-link]');
  const status = control.querySelector('[data-download-status]');
  if (result.error) {
    status.textContent = 'Release details could not be loaded. Open releases and choose the platform package under Assets.';
    return;
  }
  if (result.unavailable) {
    status.textContent = 'No public stable release is available. Repository collaborators can open releases while signed in; public downloads appear here when published.';
    return;
  }
  const asset = selectAsset(platform, result.release);
  if (!asset) {
    status.textContent = 'No unique matching platform package was found in the latest stable release. Open releases and check its Assets and compatibility notes.';
    return;
  }
  link.href = asset.browser_download_url;
  link.textContent = `Download ${config.label}`;
  status.textContent = `${asset.name} · ${result.release.tag_name || 'Latest stable release'} · Read the release notes and verify the matching checksum before installing. `;
  const notes = control.ownerDocument.createElement('a');
  notes.href = config.tagPrefix && result.release.tag_name
    ? `https://github.com/PreceptorOfMagic/${config.repo}/releases/tag/${encodeURIComponent(result.release.tag_name)}`
    : `https://github.com/PreceptorOfMagic/${config.repo}/releases/latest`;
  notes.textContent = 'Release notes and checksums';
  status.append(notes);
}

// An HDR extra sits in a table cell: a short label, its file name and a link to its own checksum file.
export function displayExtra(control, platform, result) {
  const config = platforms[platform];
  const link = control.querySelector('[data-download-link]');
  const status = control.querySelector('[data-download-status]');
  const asset = result.release ? selectAsset(platform, result.release) : null;
  if (!asset) {
    status.textContent = result.error
      ? 'Release details could not be loaded. Open the release and choose this file under Assets.'
      : 'Not in the current Umbra for Linux release.';
    return;
  }
  link.href = asset.browser_download_url;
  link.textContent = `Download ${config.label}`;
  link.setAttribute?.('aria-label', `Download ${config.description}`);
  status.textContent = `${asset.name} · `;
  const sum = result.release.assets.find(item => item && item.name === `${asset.name}.sha256`
    && item.state === 'uploaded' && typeof item.browser_download_url === 'string'
    && item.browser_download_url.startsWith(asset.browser_download_url.slice(0, asset.browser_download_url.lastIndexOf('/') + 1)));
  const check = control.ownerDocument.createElement('a');
  check.href = sum ? sum.browser_download_url
    : `https://github.com/PreceptorOfMagic/${config.repo}/releases/tag/${encodeURIComponent(result.release.tag_name || '')}`;
  check.textContent = sum ? 'checksum' : 'release and checksums';
  status.append(check);
}

export async function initialiseDownloads(documentRoot, fetcher = fetch) {
  const requests = new Map();
  await Promise.all([...documentRoot.querySelectorAll('[data-download]')].map(async control => {
    const platform = control.dataset.download;
    const config = platforms[platform];
    if (!config) return;
    const key = `${config.repo}|${config.tagPrefix || ''}`;
    if (!requests.has(key)) requests.set(key, loadRelease(config.repo, fetcher, config.tagPrefix).catch(() => ({ error: true })));
    (config.extra ? displayExtra : displayRelease)(control, platform, await requests.get(key));
  }));
}

if (typeof document !== 'undefined') initialiseDownloads(document);

// No credentials are embedded: private repositories intentionally cannot resolve
// public downloads. Release attachments remain owned by the component repository.
export const platforms = Object.freeze({
  webos: { repo: 'Eclipse', label: 'LG webOS', match: /^com\.aurora\.gamestream_[\w.+-]+_arm\.ipk$/i },
  windows: { repo: 'Eclipse', label: 'Windows x64', match: /^eclipse-windows-x64(?:-unsigned)?\.zip$/i },
  'windows-setup': { repo: 'Eclipse', label: 'Windows x64 installer', match: /^eclipse-windows-x64-setup(?:-unsigned)?\.exe$/i },
  linux: { repo: 'Eclipse', label: 'Linux x86_64', match: /^eclipse-linux-x86_64\.tar\.gz$/i },
  'umbra-windows': { repo: 'Umbra', label: 'Umbra Windows x64', match: /^(?:umbra(?:-windows-x64)?|apollo)\.exe$/i },
  'umbra-linux': { repo: 'Umbra', label: 'Umbra Ubuntu 24.04', match: /^umbra-[\w.+-]+-ubuntu24\.04-amd64\.deb$/i },
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

export async function loadRelease(repo, fetcher = fetch) {
  const response = await fetcher(`https://api.github.com/repos/PreceptorOfMagic/${repo}/releases/latest`, {
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (response.status === 404) return { unavailable: true };
  if (!response.ok) throw new Error('Release lookup unavailable');
  return { release: await response.json() };
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
  notes.href = `https://github.com/PreceptorOfMagic/${config.repo}/releases/latest`;
  notes.textContent = 'Release notes and checksums';
  status.append(notes);
}

export async function initialiseDownloads(documentRoot, fetcher = fetch) {
  const requests = new Map();
  await Promise.all([...documentRoot.querySelectorAll('[data-download]')].map(async control => {
    const platform = control.dataset.download;
    const config = platforms[platform];
    if (!config) return;
    if (!requests.has(config.repo)) requests.set(config.repo, loadRelease(config.repo, fetcher).catch(() => ({ error: true })));
    displayRelease(control, platform, await requests.get(config.repo));
  }));
}

if (typeof document !== 'undefined') initialiseDownloads(document);

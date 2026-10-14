import test from 'node:test';
import assert from 'node:assert/strict';
import { selectAsset, loadRelease, displayRelease, initialiseDownloads } from '../../site/assets/downloads.mjs';

function asset(name, repo = 'Eclipse') {
  return { name, state: 'uploaded', size: 1234, browser_download_url: `https://github.com/PreceptorOfMagic/${repo}/releases/download/v1/${name}` };
}
function release(...assets) { return { tag_name: 'v1', assets, draft: false, prerelease: false }; }
for (const [platform, name, repo] of [
  ['webos', 'com.aurora.gamestream_1.0.8_arm.ipk', 'Eclipse'],
  ['windows', 'eclipse-windows-x64-unsigned.zip', 'Eclipse'],
  ['linux', 'eclipse-linux-x86_64.tar.gz', 'Eclipse'],
  ['windows-setup', 'eclipse-windows-x64-setup-unsigned.exe', 'Eclipse'],
  ['umbra-windows', 'Umbra-windows-x64.exe', 'Umbra'],
  ['umbra-linux', 'Umbra-0.5.1-linux-x86_64.flatpak', 'Umbra'],
]) test(`${platform}: choose only its package`, () => {
  const file = asset(name, repo);
  assert.equal(selectAsset(platform, release(asset('source.zip'), asset('checksums.sha256'), file)), file);
});
test('reject beta app, ARM, debug and unsupported names', () => {
  assert.equal(selectAsset('webos', release(asset('com.aurora.gamestream.beta_1.0.8_arm.ipk'))), null);
  assert.equal(selectAsset('windows', release(asset('eclipse-windows-arm64.zip'), asset('eclipse-windows-x64-debug.zip'))), null);
});
test('Linux button picks the Flatpak, not its checksum, sources, HDR extras or the old .deb', () => {
  const bundle = asset('Umbra-0.5.1-linux-x86_64.flatpak', 'Umbra');
  const others = ['Umbra-0.5.1-linux-x86_64.flatpak.sha256', 'Umbra-0.5.1-linux-flatpak-sources.tar.gz',
    'Umbra-HDR-KDE-ubuntu26.04.tar.gz', 'Umbra-0.5.0-ubuntu24.04-amd64.deb', 'Umbra-windows-x64.exe'].map(name => asset(name, 'Umbra'));
  assert.equal(selectAsset('umbra-linux', release(...others, bundle)), bundle);
  assert.equal(selectAsset('umbra-linux', release(...others)), null);
});
test('Linux release is found by its tag, not the repository latest', async () => {
  const linux = { ...release(asset('Umbra-0.5.1-linux-x86_64.flatpak', 'Umbra')), tag_name: 'umbra-linux-v0.5.1' };
  const list = [{ ...linux, tag_name: 'umbra-linux-v0.5.2', prerelease: true }, { ...release(), tag_name: 'umbra-v0.5.1' }, linux];
  let url = '';
  const result = await loadRelease('Umbra', async u => { url = u; return { status: 200, ok: true, json: async () => list }; }, 'umbra-linux-v');
  assert.match(url, /\/releases\?per_page=30$/);
  assert.equal(result.release, linux);
  assert.deepEqual(await loadRelease('Umbra', async () => ({ status: 200, ok: true, json: async () => [list[1]] }), 'umbra-linux-v'), { unavailable: true });
  const ui = control('umbra-linux');
  displayRelease(ui, 'umbra-linux', result);
  assert.equal(ui.link.textContent, 'Download Umbra for Linux (Flatpak)');
  assert.equal(ui.status.child.href, 'https://github.com/PreceptorOfMagic/Umbra/releases/tag/umbra-linux-v0.5.1');
});
test('do not guess when multiple matching files exist', () => {
  assert.equal(selectAsset('windows', release(asset('eclipse-windows-x64.zip'), asset('eclipse-windows-x64-unsigned.zip'))), null);
});
test('reject prerelease, draft, unuploaded and external assets', () => {
  const file = asset('eclipse-linux-x86_64.tar.gz');
  for (const extra of [{draft:true}, {prerelease:true}]) assert.equal(selectAsset('linux', {...release(file), ...extra}), null);
  assert.equal(selectAsset('linux', release({...file, state:'new'})), null);
  assert.equal(selectAsset('linux', release({...file, size:0})), null);
  assert.equal(selectAsset('linux', release({...file, browser_download_url:'https://example.com/file'})), null);
  assert.equal(selectAsset('linux', release({...file, browser_download_url:'https://github.com/PreceptorOfMagic/Umbra/releases/download/v1/file'})), null);
});
test('404 remains unavailable; server errors are not claimed to be empty releases', async () => {
  assert.deepEqual(await loadRelease('Eclipse', async () => ({status:404})), {unavailable:true});
  await assert.rejects(loadRelease('Eclipse', async () => ({status:403, ok:false})));
  const data = release(asset('eclipse-linux-x86_64.tar.gz'));
  assert.deepEqual(await loadRelease('Eclipse', async () => ({status:200,ok:true,json:async()=>data})), {release:data});
});
function control(platform) {
  const link={href:'fallback',textContent:'Open releases'};
  const status={textContent:'',append(node){this.child=node;}};
  return {dataset:{download:platform},link,status,querySelector(s){return s==='[data-download-link]'?link:status;},ownerDocument:{createElement(){return {};}}};
}
test('resolved UI links directly to file and retains release notes', () => {
  const ui=control('linux'); const file=asset('eclipse-linux-x86_64.tar.gz');
  displayRelease(ui,'linux',{release:release(file)});
  assert.equal(ui.link.href,file.browser_download_url);
  assert.equal(ui.link.textContent,'Download Linux x86_64');
  assert.equal(ui.status.child.href,'https://github.com/PreceptorOfMagic/Eclipse/releases/latest');
});
test('unavailable and failed lookups retain the working releases fallback', () => {
  for (const result of [{unavailable:true},{error:true},{release:release()}]) {
    const ui=control('linux'); displayRelease(ui,'linux',result);
    assert.equal(ui.link.href,'fallback'); assert.ok(ui.status.textContent.length>20);
  }
});
test('deduplicate repo requests for platform controls', async () => {
  const controls=[control('linux'),control('windows'),control('webos'),control('umbra-windows')];
  const urls=[];
  await initialiseDownloads({querySelectorAll:()=>controls},async url=>{urls.push(url);return {status:404};});
  assert.equal(urls.length,2);
  for(const ui of controls) assert.match(ui.status.textContent,/No public stable release/);
});

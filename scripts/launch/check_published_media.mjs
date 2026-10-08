#!/usr/bin/env node
// Validate the delivery inventory actually published by the current site.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { publicationLimit } from './publication_limits.mjs';
import { inspectWebP, validateMp4FastStart, parseMp4TopLevelAtoms } from './check_media.mjs';
const scriptFile = fileURLToPath(import.meta.url);
const defaultRoot = fileURLToPath(new URL('../../', import.meta.url));
const positive = value => typeof value === 'number' && Number.isFinite(value) && value > 0;
const processFailed = result => result.error || result.status !== 0 || String(result.stderr ?? '').trim();

// Keep the legacy structural/metadata checks, but compressed samples are not text metadata.
function inspectPublishedMp4(bytes) {
  const atoms = parseMp4TopLevelAtoms(bytes);
  const metadataView = Buffer.from(bytes);
  for (const atom of atoms.filter(a => a.type === 'mdat')) {
    const headerBytes = bytes.readUInt32BE(atom.offset) === 1 ? 16 : 8;
    metadataView.fill(0, atom.offset + headerBytes, atom.offset + atom.size);
  }
  validateMp4FastStart(metadataView);
}

function inspectPublishedWebP(bytes) {
  // The original launch contract required opaque stills. Existing desktop-window screenshots
  // legitimately use the standard VP8X + ALPH + VP8 layout. Validate that layout before adapting
  // the metadata-only view for the legacy helper; ffprobe/full decode inspect the original file.
  if (bytes.length < 12 || bytes.toString('ascii',0,4) !== 'RIFF' || bytes.toString('ascii',8,12) !== 'WEBP' ||
      bytes.readUInt32LE(4) + 8 !== bytes.length) return inspectWebP(bytes);
  const chunks = [];
  for (let offset = 12; offset < bytes.length;) {
    if (offset + 8 > bytes.length) throw new Error('truncated WebP chunk header');
    const type = bytes.toString('ascii',offset,offset+4), length = bytes.readUInt32LE(offset+4);
    const end = offset + 8 + length + length % 2;
    if (end > bytes.length) throw new Error(`${type} chunk extends beyond the file`);
    chunks.push({type,length,offset,end}); offset = end;
  }
  const alpha = chunks.filter(c => c.type === 'ALPH');
  const extended = chunks.find(c => c.type === 'VP8X');
  const alphaFlag = extended?.length === 10 && (bytes[extended.offset + 8] & 0x10) !== 0;
  const layout = chunks.map(c => c.type).join(',');
  if (!alpha.length && !alphaFlag) return inspectWebP(bytes);
  if (!alphaFlag || !['VP8X,ALPH,VP8 ', 'VP8X,VP8L'].includes(layout) || alpha.some(c => c.length < 1)) {
    throw new Error('invalid static WebP alpha layout');
  }
  const normalized = Buffer.concat([bytes.subarray(0,12), ...chunks.filter(c=>c.type!=='ALPH').map(c=>bytes.subarray(c.offset,c.end))]);
  normalized.writeUInt32LE(normalized.length - 8,4);
  normalized[20] &= ~0x10; // Only clear the validated alpha flag; forbidden animation/metadata flags remain.
  return inspectWebP(normalized);
}

export function checkPublishedMedia({root = defaultRoot, decode = false, run = spawnSync} = {}) {
  const media = path.join(root, 'site/media');
  const manifest = JSON.parse(fs.readFileSync(path.join(media, 'media-manifest.json'), 'utf8'));
  const errors = [];
  const fail = (name, message) => errors.push(`${name}: ${message}`);
  const files = new Map();
  if (manifest?.schemaVersion !== 2 || !Array.isArray(manifest.deliveries) || !manifest.deliveries.length) {
    throw new Error('Expected nonempty delivery manifest v2');
  }
  for (const item of manifest.deliveries) {
    const name = item?.name;
    if (typeof name !== 'string' || !/^[a-z0-9-]+\.(webp|mp4|webm)$/.test(name) || files.has(name)) {
      fail(String(name), 'invalid or duplicate delivery name'); continue;
    }
    files.set(name, item);
    const still = name.endsWith('.webp');
    const expectedCodec = still ? 'webp' : name.endsWith('.mp4') ? 'h264' : 'vp9';
    if (!/^[a-f0-9]{64}$/.test(item.sha256 ?? '') ||
        !Number.isInteger(item.width) || item.width <= 0 || !Number.isInteger(item.height) || item.height <= 0 ||
        item.codec !== expectedCodec || (!still && (!positive(item.frameRate) || !positive(item.durationSeconds) || typeof item.audio !== 'boolean'))) {
      fail(name, 'invalid delivery contract (checksum, dimensions, codec or video measurements)'); continue;
    }
    const file = path.join(media, name);
    if (!fs.existsSync(file) || !fs.lstatSync(file).isFile()) { fail(name, 'missing regular delivery file'); continue; }
    const bytes = fs.readFileSync(file);
    if (!bytes.length || bytes.length > publicationLimit(`site/media/${name}`)) fail(name, 'empty or exceeds publication budget');
    if (crypto.createHash('sha256').update(bytes).digest('hex') !== item.sha256) fail(name, 'checksum differs from reviewed delivery');
    try {
      // Both helpers throw on invalid structure; their return values contain parsed facts, not errors.
      if (still) inspectPublishedWebP(bytes);
      if (name.endsWith('.mp4')) inspectPublishedMp4(bytes);
    } catch (error) { fail(name, error.message); }
    const probe = run('ffprobe', ['-v','error','-show_streams','-show_format','-of','json',file], {encoding:'utf8'});
    if (processFailed(probe)) { fail(name, `ffprobe failed${probe.error ? `: ${probe.error.message}` : ''}`); continue; }
    let data;
    try { data = JSON.parse(probe.stdout); } catch { fail(name, 'ffprobe returned invalid JSON'); continue; }
    if (!Array.isArray(data?.streams)) { fail(name, 'ffprobe returned no stream inventory'); continue; }
    const video = data.streams.filter(s => s.codec_type === 'video');
    if (video.length !== 1) { fail(name, 'expected one video/image stream'); continue; }
    const v = video[0];
    if (v.width !== item.width || v.height !== item.height) fail(name, 'dimensions differ from review');
    if (v.codec_name !== item.codec) fail(name, 'codec differs from review');
    const audio = data.streams.filter(s => s.codec_type === 'audio');
    if (data.streams.some(s => s.codec_type !== 'video' && !(item.audio === true && !still && s.codec_type === 'audio'))) fail(name, 'unexpected stream');
    if (!still) {
      const [n,d] = String(v.avg_frame_rate).split('/').map(Number);
      const frameRate = n / d, duration = Number(data.format?.duration);
      if (!positive(frameRate) || Math.abs(frameRate - item.frameRate) > 0.01) fail(name, 'frame rate differs from review or is unavailable');
      if (!positive(duration) || Math.abs(duration - item.durationSeconds) > 0.05) fail(name, 'duration differs from review or is unavailable');
      if (v.pix_fmt !== 'yuv420p' || ['color_space','color_primaries'].some(k => v[k] !== 'bt709') || !['bt709','iec61966-2-1'].includes(v.color_transfer) || v.color_range !== 'tv') fail(name, 'expected SDR Rec.709 primaries/matrix, Rec.709 or sRGB transfer, limited-range yuv420p');
      if (audio.length !== (item.audio ? 1 : 0)) fail(name, 'audio stream count differs from review');
    }
    if (decode) {
      // Map every stream: ffmpeg's default selection could otherwise leave an audio track unchecked.
      const decoded = run('ffmpeg',['-v','error','-xerror','-i',file,'-map','0','-f','null','-'],{encoding:'utf8',maxBuffer:1024*1024});
      if (processFailed(decoded)) fail(name, `full decode failed${decoded.error ? `: ${decoded.error.message}` : ''}`);
    }
  }
  for (const name of fs.readdirSync(media)) {
    if (!['README.md','media-manifest.json'].includes(name) && !files.has(name)) fail(name, 'unreviewed file in delivery directory');
  }
  for (const filename of fs.readdirSync(path.join(root,'site')).filter(n => n.endsWith('.html'))) {
    const text = fs.readFileSync(path.join(root,'site',filename),'utf8');
    for (const [, name] of text.matchAll(/(?:src|poster)=["']media\/([^"'?]+)(?:\?[^"' ]*)?["']/g)) {
      if (!files.has(name)) fail(filename, `references unreviewed media ${name}`);
    }
  }
  for (const item of files.values()) {
    if (!item.name.endsWith('.mp4')) continue;
    const other = files.get(item.name.replace(/\.mp4$/,'.webm'));
    if (other && (Math.abs(item.durationSeconds-other.durationSeconds)>0.05 || item.frameRate!==other.frameRate || item.width!==other.width || item.height!==other.height || item.audio!==other.audio)) fail(item.name, 'paired encodings disagree');
  }
  return {errors, count: files.size};
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptFile) {
  try {
    const decode = process.argv.includes('--decode');
    const {errors, count} = checkPublishedMedia({decode});
    if (errors.length) { console.error(errors.join('\n')); process.exitCode=1; }
    else console.log(`Published media check passed: ${count} reviewed deliveries${decode ? ', fully decoded' : ''}.`);
  } catch (error) { console.error(`Published media check failed: ${error.message}`); process.exitCode=1; }
}

#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptFile = fileURLToPath(import.meta.url);
const scriptDirectory = path.dirname(scriptFile);
const repositoryRoot = path.resolve(scriptDirectory, "..", "..");

const SDR_VIDEO = Object.freeze({
  pixelFormat: "yuv420p",
  colorSpace: "bt709",
  colorTransfer: "bt709",
  colorPrimaries: "bt709",
  colorRange: "tv",
  requireStartKeyframe: true,
});

function videoDelivery(name, maxBytes, codec, profile, dimensions, timing) {
  return Object.freeze({
    name,
    maxBytes,
    kind: "video",
    codec,
    profile,
    ...dimensions,
    ...timing,
    ...SDR_VIDEO,
  });
}

function stillDelivery(name, maxBytes, kind, width, height) {
  return Object.freeze({ name, maxBytes, kind, width, height });
}

export const VIDEO_VARIANT_GROUPS = Object.freeze([
  Object.freeze({
    id: "hero",
    webm: "coop-hero-loop.webm",
    mp4: "coop-hero-loop.mp4",
    poster: "coop-hero-poster.webp",
    width: 1920,
    height: 1080,
    durationMin: 6,
    durationMax: 8,
    frameRateMin: 29.9,
    frameRateMax: 60.01,
    sourceKinds: Object.freeze(["continuous-live-take"]),
  }),
  Object.freeze({
    id: "independent-input",
    webm: "coop-independent-input-loop.webm",
    mp4: "coop-independent-input-loop.mp4",
    poster: "coop-independent-input-poster.webp",
    width: 1280,
    height: 720,
    durationSeconds: 8,
    durationTolerance: 0.05,
    frameRate: 60,
    frameRateTolerance: 0.1,
    sourceKinds: Object.freeze(["continuous-live-take"]),
  }),
  Object.freeze({
    id: "layout-switch",
    webm: "coop-layout-switch-loop.webm",
    mp4: "coop-layout-switch-loop.mp4",
    poster: "coop-layout-switch-poster.webp",
    width: 1280,
    height: 720,
    durationSeconds: 10,
    durationTolerance: 0.05,
    frameRate: 60,
    frameRateTolerance: 0.1,
    sourceKinds: Object.freeze(["continuous-live-take"]),
  }),
  Object.freeze({
    id: "setup-flow",
    webm: "coop-setup-flow-loop.webm",
    mp4: "coop-setup-flow-loop.mp4",
    poster: "coop-setup-flow-poster.webp",
    width: 1280,
    height: 720,
    durationSeconds: 10,
    durationTolerance: 0.05,
    frameRate: 60,
    frameRateTolerance: 0.1,
    sourceKinds: Object.freeze(["screen-capture", "continuous-live-take"]),
  }),
  Object.freeze({
    id: "single-host",
    webm: "single-host-loop.webm",
    mp4: "single-host-loop.mp4",
    poster: "single-host-poster.webp",
    width: 1280,
    height: 720,
    durationSeconds: 6,
    durationTolerance: 0.05,
    frameRate: 60,
    frameRateTolerance: 0.1,
    sourceKinds: Object.freeze(["screen-capture", "continuous-live-take"]),
  }),
]);

const videoContracts = VIDEO_VARIANT_GROUPS.flatMap((group) => {
  const timing = group.durationSeconds === undefined
    ? {
        durationMin: group.durationMin,
        durationMax: group.durationMax,
        frameRateMin: group.frameRateMin,
        frameRateMax: group.frameRateMax,
      }
    : {
        durationSeconds: group.durationSeconds,
        durationTolerance: group.durationTolerance,
        frameRate: group.frameRate,
        frameRateTolerance: group.frameRateTolerance,
      };
  const dimensions = { width: group.width, height: group.height };
  const isHero = group.id === "hero";
  return [
    videoDelivery(group.webm, (isHero ? 10 : 4) * 1024 * 1024, "vp9", "Profile 0", dimensions, timing),
    videoDelivery(group.mp4, (isHero ? 12 : 5) * 1024 * 1024, "h264", "High", dimensions, timing),
  ];
});

const posterContracts = VIDEO_VARIANT_GROUPS.map((group) => stillDelivery(
  group.poster,
  (group.id === "hero" ? 750 : 400) * 1024,
  "poster",
  group.width,
  group.height,
));

export const DELIVERY_CONTRACT = Object.freeze([
  ...videoContracts,
  ...posterContracts,
  stillDelivery("living-room-wide.webp", 1024 * 1024, "photo", 1920, 1080),
  stillDelivery("coop-picker.webp", 1024 * 1024, "photo", 1920, 1080),
  { name: "coop-walkthrough.en.vtt", maxBytes: 100 * 1024, kind: "vtt" },
  { name: "coop-walkthrough-transcript.md", maxBytes: 100 * 1024, kind: "transcript" },
  { name: "media-manifest.json", maxBytes: 100 * 1024, kind: "manifest" },
]);

const HASHED_DELIVERY_NAMES = DELIVERY_CONTRACT
  .filter((delivery) => delivery.kind !== "manifest")
  .map((delivery) => delivery.name);
const DELIVERY_BY_NAME = new Map(DELIVERY_CONTRACT.map((delivery) => [delivery.name, delivery]));
const VISUAL_DELIVERY_NAMES = new Set(
  DELIVERY_CONTRACT.filter((delivery) => ["video", "poster", "photo"].includes(delivery.kind)).map((delivery) => delivery.name),
);
const SOURCE_KINDS = new Set([
  "continuous-live-take",
  "screen-capture",
  "screenshot",
  "photograph",
  "walkthrough-master",
]);
const SHA256_PATTERN = /^[0-9a-f]{64}$/i;
const COMMIT_PATTERN = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/i;
const VERSION_PATTERN = /^\d+(?:\.\d+){1,3}$/;
const DOTTED_QUAD_PATTERN = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const PLACEHOLDER_PATTERN = /(?:\{\{[^{}]+\}\}|\[\s*(?:FILL|TODO|TBD|TBC|FIXME|INSERT|REPLACE|HOSTED(?: WALKTHROUGH)? URL|DEMO URL|STATUS URL|SOURCE URL)[^\]]*\]|\b(?:TODO|TBD|TBC|FIXME|XXX|TK|TKTK|CHANGEME|REPLACE[ -]?ME|LOREM IPSUM)\b|placeholder(?: text| copy| url)?)/i;
const SSIM_MINIMUM = 0.95;
const PUBLIC_MEDIA_README_MAX_BYTES = 100 * 1024;
const BUILD_LABELS = Object.freeze({
  eclipse: "Eclipse",
  umbraHostA: "Umbra host A",
  umbraHostB: "Umbra host B",
});
const ALLOWED_MEDIA_DIRECTORY_FILES = new Set([
  ...DELIVERY_CONTRACT.map((delivery) => delivery.name),
  "README.md",
]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function inventoryMediaDirectory(mediaRoot) {
  const errors = [];
  const regularFiles = new Set();
  let entries;
  try {
    entries = fs.readdirSync(mediaRoot, { withFileTypes: true });
  } catch (error) {
    return { errors: [`site/media: cannot inventory directory (${error.message})`], regularFiles };
  }
  for (const entry of entries) {
    const location = `site/media/${entry.name}`;
    if (entry.isSymbolicLink()) {
      errors.push(`${location}: symbolic links are not allowed`);
    } else if (entry.isDirectory()) {
      errors.push(`${location}: nested directories are not allowed`);
    } else if (!entry.isFile()) {
      errors.push(`${location}: only regular files are allowed`);
    } else {
      regularFiles.add(entry.name);
      if (!ALLOWED_MEDIA_DIRECTORY_FILES.has(entry.name)) errors.push(`${location}: unreviewed file is not in the public-media allowlist`);
      if (entry.name === "README.md") {
        const readmeFile = path.join(mediaRoot, entry.name);
        const size = fs.statSync(readmeFile).size;
        if (size > PUBLIC_MEDIA_README_MAX_BYTES) {
          errors.push(`${location}: ${size} bytes exceeds ${PUBLIC_MEDIA_README_MAX_BYTES}`);
        } else {
          const text = fs.readFileSync(readmeFile, "utf8");
          for (const problem of publicSafetyProblems(text)) errors.push(`${location}: ${problem}`);
        }
      }
    }
  }
  return { errors, regularFiles };
}

function rejectUnknownKeys(value, allowedKeys, location, errors) {
  if (!isPlainObject(value)) {
    errors.push(`${location}: expected an object`);
    return false;
  }
  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) errors.push(`${location}: unknown field ${key}`);
  }
  return true;
}

function isValidIsoDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isNonPlaceholderString(value, minimumLength = 1) {
  return typeof value === "string" && value.trim().length >= minimumLength && !PLACEHOLDER_PATTERN.test(value);
}

export function isPublicHttpsUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return false;
    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
    if (!hostname || net.isIP(hostname) !== 0) return false;
    if (!hostname.includes(".") || hostname.split(".").some((label) =>
      !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label))) return false;
    if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local") ||
        hostname === "home.arpa" || hostname.endsWith(".home.arpa") || hostname.endsWith(".invalid") ||
        hostname.endsWith(".test") || hostname === "example" || hostname.endsWith(".example") ||
        /^(?:[^.]+\.)*example\.(?:com|org|net)$/.test(hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

function textUrlCandidates(value) {
  if (typeof value !== "string") return [];
  return (value.match(/https?:\/\/[^\s<>"']+/gi) ?? [])
    .map((candidate) => candidate.replace(/[\])},.;!?]+$/g, ""))
    .filter(Boolean);
}

function hasClearlyPrivateUrlHost(value) {
  try {
    const hostname = new URL(value).hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
    return !hostname.includes(".") || net.isIP(hostname) !== 0 || hostname === "localhost" ||
      hostname.endsWith(".localhost") || hostname.endsWith(".local") || hostname === "home.arpa" ||
      hostname.endsWith(".home.arpa");
  } catch {
    return true;
  }
}

function publicSafetyProblems(value, { allowedDottedQuads = [] } = {}) {
  if (typeof value !== "string") return [];
  const problems = [];
  const allowedDottedQuadSet = new Set(allowedDottedQuads);
  if (PLACEHOLDER_PATTERN.test(value)) problems.push("contains a placeholder");
  const dottedQuads = value.match(DOTTED_QUAD_PATTERN) ?? [];
  if (dottedQuads.some((candidate) => !allowedDottedQuadSet.has(candidate))) problems.push("contains an IP address");
  if (/\b(?:[0-9a-f]{2}[:-]){5}[0-9a-f]{2}\b/i.test(value)) problems.push("contains a MAC address");
  if (/(?:^|[\s"'(])(?:\/home\/|\/Users\/|\/mnt\/|\/tmp\/|\/root\/|[A-Za-z]:[\\/])/.test(value)) {
    problems.push("contains a local filesystem path");
  }
  if (/[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,253}\.[A-Za-z]{2,63}/.test(value)) {
    problems.push("contains an email address");
  }
  if (/\b(?:SKYNET|VEGA|PC2)\b/i.test(value)) problems.push("contains an internal machine name");
  if (/https?:\/\/(?:[^/\s.]+\.)*example\.(?:com|org|net)\b|https?:\/\/[^/\s]+\.(?:example|invalid|test)\b/i.test(value)) {
    problems.push("contains a reserved example URL");
  }
  const urlCandidates = textUrlCandidates(value);
  if (urlCandidates.some((candidate) => !isPublicHttpsUrl(candidate)) ||
      /\b(?:localhost|[a-z0-9.-]+\.local|(?:[a-z0-9-]+\.)*home\.arpa)(?::\d{1,5})?(?:\/[^\s]*)?/i.test(value)) {
    problems.push("contains a non-public URL");
  }
  return problems;
}

export function binaryPrintableSafetyProblems(buffers) {
  const problems = new Set();
  for (const buffer of buffers) {
    const runs = buffer.toString("latin1").match(/[\x20-\x7e]{8,}/g) ?? [];
    for (const run of runs) {
      for (const problem of publicSafetyProblems(run)) {
        if (problem !== "contains a placeholder" && problem !== "contains a non-public URL") problems.add(problem);
      }
      if (textUrlCandidates(run).some(hasClearlyPrivateUrlHost)) problems.add("contains a non-public URL");
      if (/\/(?:home|Users|mnt|tmp|root)\//.test(run) ||
          /(?:^|[\s"'(])[A-Za-z]:[\\/]/.test(run)) {
        problems.add("contains a local filesystem path");
      }
    }
  }
  return [...problems];
}

function scanPublicStrings(value, location, errors) {
  if (typeof value === "string") {
    const allowedDottedQuads = location.endsWith(".version") && VERSION_PATTERN.test(value) ? [value] : [];
    for (const problem of publicSafetyProblems(value, { allowedDottedQuads })) {
      errors.push(`${location}: ${problem}`);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => scanPublicStrings(entry, `${location}[${index}]`, errors));
    return;
  }
  if (isPlainObject(value)) {
    for (const [key, entry] of Object.entries(value)) scanPublicStrings(entry, `${location}.${key}`, errors);
  }
}

export function parseClockTimecode(value) {
  if (typeof value !== "string") return Number.NaN;
  const match = value.match(/^(\d{2,}):(\d{2}):(\d{2})\.(\d{3})$/);
  if (!match) return Number.NaN;
  const [, hoursText, minutesText, secondsText, millisecondsText] = match;
  const minutes = Number(minutesText);
  const seconds = Number(secondsText);
  if (minutes > 59 || seconds > 59) return Number.NaN;
  return Number(hoursText) * 3600 + minutes * 60 + seconds + Number(millisecondsText) / 1000;
}

function parseWebVttTimestamp(value) {
  if (typeof value !== "string") return Number.NaN;
  const match = value.match(/^(?:(\d{2,}):)?(\d{2}):(\d{2})\.(\d{3})$/);
  if (!match) return Number.NaN;
  const [, hoursText, minutesText, secondsText, millisecondsText] = match;
  const hours = hoursText === undefined ? 0 : Number(hoursText);
  const minutes = Number(minutesText);
  const seconds = Number(secondsText);
  if (minutes > 59 || seconds > 59) return Number.NaN;
  return hours * 3600 + minutes * 60 + seconds + Number(millisecondsText) / 1000;
}

function isWebVttPercentage(value) {
  const match = value.match(/^(\d+(?:\.\d+)?)%$/);
  return Boolean(match) && Number(match[1]) >= 0 && Number(match[1]) <= 100;
}

function validateWebVttCueSettings(settingsText) {
  if (settingsText === undefined || settingsText === "") return;
  const seen = new Set();
  for (const token of settingsText.split(/[ \t]+/)) {
    const separator = token.indexOf(":");
    if (separator <= 0 || separator === token.length - 1) throw new Error(`invalid cue setting: ${token}`);
    const name = token.slice(0, separator);
    const value = token.slice(separator + 1);
    if (seen.has(name)) throw new Error(`duplicate cue setting: ${name}`);
    seen.add(name);
    let valid = false;
    if (name === "vertical") valid = /^(?:rl|lr)$/.test(value);
    else if (name === "align") valid = /^(?:start|center|end|left|right)$/.test(value);
    else if (name === "size") valid = isWebVttPercentage(value);
    else if (name === "region") valid = /^[^\s,:]+$/.test(value);
    else if (name === "line") {
      const [position, alignment, extra] = value.split(",");
      valid = extra === undefined && (position === "auto" || /^-?\d+$/.test(position) || isWebVttPercentage(position)) &&
        (alignment === undefined || /^(?:start|center|end)$/.test(alignment));
    } else if (name === "position") {
      const [position, alignment, extra] = value.split(",");
      valid = extra === undefined && isWebVttPercentage(position) &&
        (alignment === undefined || /^(?:line-left|center|line-right|auto)$/.test(alignment));
    }
    if (!valid) throw new Error(`invalid cue setting: ${token}`);
  }
}

export function parseWebVtt(rawText, walkthroughDuration = Number.NaN) {
  if (typeof rawText !== "string") throw new Error("caption file is not text");
  const text = rawText.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  if (PLACEHOLDER_PATTERN.test(text)) throw new Error("caption file contains a placeholder");
  const documentSafetyProblems = publicSafetyProblems(text).filter((problem) => problem !== "contains a placeholder");
  if (documentSafetyProblems.length > 0) {
    throw new Error(`caption file ${documentSafetyProblems.join(" and ")}`);
  }
  const blocks = text.split(/\n{2,}/);
  const header = blocks.shift()?.split("\n") ?? [];
  if (!/^WEBVTT(?:[ \t].*)?$/.test(header[0] ?? "")) throw new Error("missing valid WEBVTT header");
  if (header.some((line, index) => index > 0 && line.includes("-->"))) {
    throw new Error("WEBVTT header must be separated from the first cue by a blank line");
  }

  const cues = [];
  let sawCue = false;
  for (const rawBlock of blocks) {
    const lines = rawBlock.split("\n");
    while (lines.length > 0 && lines[0].trim() === "") lines.shift();
    while (lines.length > 0 && lines.at(-1).trim() === "") lines.pop();
    if (lines.length === 0) continue;
    if (/^NOTE(?:[ \t]|$)/.test(lines[0])) continue;
    if (/^(?:STYLE|REGION)$/.test(lines[0])) {
      if (sawCue) throw new Error(`${lines[0]} block appears after a cue`);
      continue;
    }

    let timingIndex = 0;
    if (!lines[0].includes("-->")) timingIndex = 1;
    if (timingIndex >= lines.length) throw new Error("cue is missing a timing line");
    if ((lines[timingIndex].match(/-->/g) ?? []).length !== 1) {
      throw new Error(`invalid cue timing line: ${lines[timingIndex]}`);
    }
    const timing = lines[timingIndex].match(/^(\S+)\s+-->\s+(\S+)(?:[ \t]+(.+?))?[ \t]*$/);
    if (!timing) throw new Error(`invalid cue timing line: ${lines[timingIndex]}`);
    validateWebVttCueSettings(timing[3]);
    const start = parseWebVttTimestamp(timing[1]);
    const end = parseWebVttTimestamp(timing[2]);
    if (!Number.isFinite(start) || !Number.isFinite(end)) throw new Error("cue has an invalid timestamp");
    if (end <= start) throw new Error("cue end must be later than cue start");

    const cuePayloadLines = lines.slice(timingIndex + 1);
    if (cuePayloadLines.some((line) => line.includes("-->"))) {
      throw new Error("cue payload contains a timing arrow; a blank cue separator is missing");
    }
    const cueText = cuePayloadLines.join("\n").trim();
    const visibleCueText = cueText
      .replace(/<[^>]*>/g, "")
      .replace(/&(?:nbsp|lrm|rlm);/gi, " ")
      .trim();
    if (!visibleCueText) throw new Error("cue text is empty");
    const previous = cues.at(-1);
    if (previous && start < previous.start) throw new Error("cues are not ordered by start time");
    if (previous && start < previous.end) throw new Error("cues overlap");
    cues.push({ start, end, text: cueText });
    sawCue = true;
  }

  if (cues.length === 0) throw new Error("no caption cue found");
  if (Number.isFinite(walkthroughDuration) && cues.at(-1).end > walkthroughDuration) {
    throw new Error(`final cue ends at ${cues.at(-1).end}s after the ${walkthroughDuration}s walkthrough`);
  }
  return cues;
}

export function parseMp4TopLevelAtoms(buffer) {
  if (!Buffer.isBuffer(buffer)) throw new Error("MP4 data is not a buffer");
  const atoms = [];
  let offset = 0;
  while (offset < buffer.length) {
    if (buffer.length - offset < 8) throw new Error("truncated MP4 atom header");
    const size32 = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    let headerSize = 8;
    let size;
    if (size32 === 1) {
      if (buffer.length - offset < 16) throw new Error(`truncated extended-size ${type} atom`);
      const extendedSize = buffer.readBigUInt64BE(offset + 8);
      if (extendedSize > BigInt(Number.MAX_SAFE_INTEGER)) throw new Error(`${type} atom is too large to validate safely`);
      size = Number(extendedSize);
      headerSize = 16;
    } else if (size32 === 0) {
      size = buffer.length - offset;
    } else {
      size = size32;
    }
    if (size < headerSize) throw new Error(`${type} atom has an invalid size`);
    const end = offset + size;
    if (end > buffer.length) throw new Error(`${type} atom extends beyond the file`);
    atoms.push({ type, offset, size });
    offset = end;
  }
  return atoms;
}

export function validateMp4FastStart(buffer) {
  const atoms = parseMp4TopLevelAtoms(buffer);
  const ftypAtoms = atoms.filter((atom) => atom.type === "ftyp");
  const moovAtoms = atoms.filter((atom) => atom.type === "moov");
  const mdatAtoms = atoms.filter((atom) => atom.type === "mdat");
  if (ftypAtoms.length !== 1 || atoms[0]?.type !== "ftyp") {
    throw new Error("expected one top-level ftyp atom in first position");
  }
  if (moovAtoms.length !== 1 || mdatAtoms.length !== 1) {
    throw new Error("expected one top-level moov and one mdat atom");
  }
  if (moovAtoms[0].offset > mdatAtoms[0].offset) {
    throw new Error("MP4 is not fast-started (top-level moov must precede mdat)");
  }
  const allowedTypes = new Set(["ftyp", "moov", "mdat", "free", "skip"]);
  const unknownAtoms = atoms.filter((atom) => !allowedTypes.has(atom.type));
  if (unknownAtoms.length > 0) {
    throw new Error(`unexpected top-level atoms remain: ${unknownAtoms.map((atom) => atom.type).join(", ")}`);
  }
  const payloadPadding = atoms.filter((atom) => ["free", "skip"].includes(atom.type) && atom.size !== 8);
  if (payloadPadding.length > 0) throw new Error("top-level free/skip padding atoms must have no payload");
  const binarySafetyProblems = binaryPrintableSafetyProblems([buffer]);
  if (binarySafetyProblems.length > 0) {
    throw new Error(`MP4 bytes ${binarySafetyProblems.join(" and ")}`);
  }
  return atoms;
}

export function inspectWebP(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) throw new Error("WebP file is too short");
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") {
    throw new Error("missing RIFF/WEBP signature");
  }
  const declaredLength = buffer.readUInt32LE(4) + 8;
  if (declaredLength !== buffer.length) throw new Error("RIFF length does not match the file length");

  const chunks = [];
  let offset = 12;
  while (offset < buffer.length) {
    if (buffer.length - offset < 8) throw new Error("truncated WebP chunk header");
    const type = buffer.toString("ascii", offset, offset + 4);
    const length = buffer.readUInt32LE(offset + 4);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd > buffer.length) throw new Error(`${type} chunk extends beyond the file`);
    chunks.push({ type, length, dataStart });
    offset = dataEnd + (length % 2);
  }
  if (offset !== buffer.length) throw new Error("WebP chunk padding extends beyond the file");

  const safeChunks = new Set(["VP8 ", "VP8L", "VP8X"]);
  const unknownChunks = chunks.filter((chunk) => !safeChunks.has(chunk.type) &&
    !["ANIM", "ANMF", "EXIF", "XMP ", "ICCP"].includes(chunk.type));
  if (unknownChunks.length > 0) {
    throw new Error(`unknown WebP chunks are not allowed: ${unknownChunks.map((chunk) => chunk.type.trim()).join(", ")}`);
  }
  const forbiddenChunks = chunks.filter((chunk) => ["ANIM", "ANMF", "EXIF", "XMP ", "ICCP"].includes(chunk.type));
  if (forbiddenChunks.length > 0) {
    throw new Error(`forbidden WebP chunks remain: ${forbiddenChunks.map((chunk) => chunk.type.trim()).join(", ")}`);
  }
  const imageChunks = chunks.filter((chunk) => chunk.type === "VP8 " || chunk.type === "VP8L");
  if (imageChunks.length !== 1) throw new Error(`expected one still-image payload, found ${imageChunks.length}`);
  if (chunks.filter((chunk) => chunk.type === "VP8X").length > 1) throw new Error("multiple VP8X chunks are not allowed");

  const legalOrders = new Set(["VP8 ", "VP8L", "VP8X,VP8 ", "VP8X,VP8L"]);
  if (!legalOrders.has(chunks.map((chunk) => chunk.type).join(","))) {
    throw new Error("WebP chunks are not in an accepted opaque still-image layout");
  }

  for (const chunk of chunks.filter((entry) => entry.type === "VP8X")) {
    if (chunk.length !== 10) throw new Error("VP8X chunk must be exactly 10 bytes");
    const flags = buffer[chunk.dataStart];
    if (flags !== 0) throw new Error("VP8X feature and reserved flags must all be zero for launch stills");
    if (buffer.subarray(chunk.dataStart + 1, chunk.dataStart + 4).some((byte) => byte !== 0)) {
      throw new Error("VP8X reserved bytes must be zero");
    }
  }
  const binarySafetyProblems = binaryPrintableSafetyProblems([buffer]);
  if (binarySafetyProblems.length > 0) {
    throw new Error(`WebP bytes ${binarySafetyProblems.join(" and ")}`);
  }
  return { chunks: chunks.map((chunk) => chunk.type), imageFrameCount: imageChunks.length };
}

function fraction(value) {
  const [numerator, denominator = "1"] = String(value).split("/").map(Number);
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) return Number.NaN;
  return numerator / denominator;
}

export function validateVideoMeasurements(name, { duration, frameRate, frameCount }, contract = {}) {
  const errors = [];
  if (!Number.isFinite(duration) || duration <= 0) {
    errors.push(`${name}: duration must be finite and positive`);
  } else if (Number.isFinite(contract.durationSeconds)) {
    const tolerance = Number.isFinite(contract.durationTolerance) ? contract.durationTolerance : 0.05;
    if (Math.abs(duration - contract.durationSeconds) > tolerance) {
      errors.push(`${name}: duration ${duration}s differs from ${contract.durationSeconds}s by more than ${tolerance}s`);
    }
  } else {
    const minimum = Number.isFinite(contract.durationMin) ? contract.durationMin : 6;
    const maximum = Number.isFinite(contract.durationMax) ? contract.durationMax : 8;
    if (duration < minimum || duration > maximum) {
      errors.push(`${name}: duration ${duration}s is outside the ${minimum}–${maximum}s contract`);
    }
  }
  if (!Number.isFinite(frameRate) || frameRate <= 0) {
    errors.push(`${name}: frame rate must be finite and positive`);
  } else if (Number.isFinite(contract.frameRate)) {
    const tolerance = Number.isFinite(contract.frameRateTolerance) ? contract.frameRateTolerance : 0.1;
    if (Math.abs(frameRate - contract.frameRate) > tolerance) {
      errors.push(`${name}: frame rate ${frameRate} differs from ${contract.frameRate}fps by more than ${tolerance}fps`);
    }
  } else {
    const minimum = Number.isFinite(contract.frameRateMin) ? contract.frameRateMin : 29.9;
    const maximum = Number.isFinite(contract.frameRateMax) ? contract.frameRateMax : 60.01;
    if (frameRate < minimum || frameRate > maximum) {
      errors.push(`${name}: frame rate ${frameRate} is outside nominal ${minimum}–${maximum}fps`);
    }
  }
  if (!Number.isFinite(frameCount) || !Number.isInteger(frameCount) || frameCount <= 0) {
    errors.push(`${name}: decoded frame count must be a finite positive integer`);
  }
  return errors;
}

export function validateVideoTechnicalContract(name, stream, contract) {
  const errors = [];
  const expected = [
    ["codec_name", contract.codec, "codec"],
    ["profile", contract.profile, "profile"],
    ["pix_fmt", contract.pixelFormat, "pixel format"],
    ["color_space", contract.colorSpace, "colour space"],
    ["color_transfer", contract.colorTransfer, "colour transfer"],
    ["color_primaries", contract.colorPrimaries, "colour primaries"],
    ["color_range", contract.colorRange, "colour range"],
  ];
  for (const [field, value, label] of expected) {
    if (value !== undefined && stream?.[field] !== value) {
      errors.push(`${name}: expected ${label} ${value}, found ${stream?.[field] ?? "unknown"}`);
    }
  }
  if (stream?.width !== contract.width || stream?.height !== contract.height) {
    errors.push(`${name}: expected ${contract.width}x${contract.height}, found ${stream?.width}x${stream?.height}`);
  }
  if (stream?.sample_aspect_ratio !== "1:1") {
    errors.push(`${name}: expected square pixels (1:1), found ${stream?.sample_aspect_ratio ?? "unknown"}`);
  }
  return errors;
}

export function startsWithKeyframe(frames) {
  return Array.isArray(frames) && frames.length > 0 && Number(frames[0]?.key_frame) === 1;
}

export function compareFrameTimelines(webmTimestamps, mp4Timestamps, toleranceSeconds = 0.005) {
  const errors = [];
  for (const [label, timestamps] of [["WebM", webmTimestamps], ["MP4", mp4Timestamps]]) {
    if (!Array.isArray(timestamps) || timestamps.length === 0) {
      errors.push(`${label} timeline has no decoded timestamps`);
      continue;
    }
    if (timestamps.some((timestamp) => !Number.isFinite(timestamp))) {
      errors.push(`${label} timeline contains a non-finite timestamp`);
      continue;
    }
    for (let index = 1; index < timestamps.length; index += 1) {
      if (timestamps[index] <= timestamps[index - 1]) {
        errors.push(`${label} timeline is not strictly increasing at frame ${index + 1}`);
        break;
      }
    }
  }
  if (errors.length > 0) return errors;
  if (webmTimestamps.length !== mp4Timestamps.length) {
    errors.push(`decoded timelines contain ${webmTimestamps.length} WebM frames and ${mp4Timestamps.length} MP4 frames`);
    return errors;
  }
  const webmStart = webmTimestamps[0];
  const mp4Start = mp4Timestamps[0];
  for (let index = 0; index < webmTimestamps.length; index += 1) {
    const webmTime = webmTimestamps[index] - webmStart;
    const mp4Time = mp4Timestamps[index] - mp4Start;
    if (Math.abs(webmTime - mp4Time) > toleranceSeconds) {
      errors.push(`decoded timelines differ by more than ${toleranceSeconds}s at frame ${index + 1}`);
      break;
    }
  }
  return errors;
}

export function parseSsim(output) {
  const matches = [...String(output).matchAll(/\bAll:([0-9]+(?:\.[0-9]+)?)/g)];
  if (matches.length === 0) return Number.NaN;
  return Number(matches.at(-1)[1]);
}

export function parseSsimFrameStats(output) {
  const frames = [];
  for (const line of String(output).split(/\r?\n/)) {
    const numberMatch = line.match(/^n:(\d+)\s/);
    const scoreMatch = line.match(/\bAll:([0-9]+(?:\.[0-9]+)?)/);
    if (!numberMatch || !scoreMatch) continue;
    frames.push({ number: Number(numberMatch[1]), all: Number(scoreMatch[1]) });
  }
  return frames;
}

function validateReviewFields(entry, location, errors) {
  for (const field of ["rightsReviewed", "privacyReviewed", "accessibilityReviewed"]) {
    if (entry[field] !== true) errors.push(`${location}.${field}: must be true`);
  }
  if (!isNonPlaceholderString(entry.reviewedBy, 2)) errors.push(`${location}.reviewedBy: required public-safe reviewer label`);
  if (!isValidIsoDate(entry.reviewedAt)) errors.push(`${location}.reviewedAt: expected YYYY-MM-DD`);
}

function validatePlacements(value, location, errors) {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${location}: expected at least one final site placement`);
    return;
  }
  const seen = new Set();
  for (const placement of value) {
    if (typeof placement !== "string" || !/^site\/[a-z0-9-]+\.html#[a-z][a-z0-9_-]*$/i.test(placement)) {
      errors.push(`${location}: invalid site HTML fragment placement ${String(placement)}`);
      continue;
    }
    if (seen.has(placement)) errors.push(`${location}: duplicate placement ${placement}`);
    seen.add(placement);
  }
}

function validateAccessibilityCopy(entry, name, location, errors) {
  const contract = DELIVERY_BY_NAME.get(name);
  if (!contract || !["video", "poster", "photo"].includes(contract.kind)) {
    for (const field of ["accessibleDescription", "altText", "caption", "posterFile", "placements", "loopSeamReviewed"]) {
      if (entry[field] !== undefined) errors.push(`${location}.${field}: accessibility copy is only valid for visual deliveries`);
    }
    return;
  }
  if (!isNonPlaceholderString(entry.caption, 20)) errors.push(`${location}.caption: required reviewed caption`);
  validatePlacements(entry.placements, `${location}.placements`, errors);
  if (contract.kind === "video") {
    if (!isNonPlaceholderString(entry.accessibleDescription, 30)) {
      errors.push(`${location}.accessibleDescription: required reviewed visual description`);
    }
    if (entry.altText !== undefined) errors.push(`${location}.altText: video deliveries use accessibleDescription`);
    const group = VIDEO_VARIANT_GROUPS.find((candidate) => candidate.webm === name || candidate.mp4 === name);
    if (entry.posterFile !== group?.poster) {
      errors.push(`${location}.posterFile: expected ${group?.poster ?? "the registered loop poster"}`);
    }
    if (entry.loopSeamReviewed !== true) errors.push(`${location}.loopSeamReviewed: must be true`);
  } else {
    if (!isNonPlaceholderString(entry.altText, 20)) errors.push(`${location}.altText: required reviewed alt text`);
    if (entry.accessibleDescription !== undefined) {
      errors.push(`${location}.accessibleDescription: still deliveries use altText`);
    }
    if (entry.posterFile !== undefined) errors.push(`${location}.posterFile: still deliveries cannot name a poster`);
    if (entry.loopSeamReviewed !== undefined) errors.push(`${location}.loopSeamReviewed: still deliveries are not loops`);
  }
}

function validateEvidenceId(value, location, errors) {
  if (!isNonPlaceholderString(value, 2) || value.length > 100) {
    errors.push(`${location}: required public-safe evidence identifier`);
  }
}

function validateLineageClock(value, location, source, errors) {
  const seconds = parseClockTimecode(value);
  if (!Number.isFinite(seconds)) {
    errors.push(`${location}: expected HH:MM:SS.mmm`);
  } else if (Number.isFinite(source?.durationSeconds) && seconds > source.durationSeconds + 0.05) {
    errors.push(`${location}: exceeds source duration ${source.durationSeconds}s`);
  }
  return seconds;
}

function validateFrameAtTime(lineage, source, location, errors) {
  if (!Number.isSafeInteger(lineage.sourceFrame) || lineage.sourceFrame < 0) {
    errors.push(`${location}.sourceFrame: expected a nonnegative safe integer frame number`);
    return;
  }
  if (Number.isSafeInteger(source?.frameCount) && lineage.sourceFrame >= source.frameCount) {
    errors.push(`${location}.sourceFrame: exceeds source frame count ${source.frameCount}`);
  }
  const seconds = parseClockTimecode(lineage.sourceTimecode);
  if (Number.isFinite(seconds) && Number.isFinite(source?.frameRate) && source.frameRate > 0) {
    const expectedFrame = Math.round(seconds * source.frameRate);
    if (lineage.sourceFrame !== expectedFrame) {
      errors.push(
        `${location}: sourceTimecode maps to frame ${expectedFrame}, not declared frame ${lineage.sourceFrame}`,
      );
    }
  }
}

export function validateManifest(manifest, deliveryHashes = new Map()) {
  const errors = [];
  if (!rejectUnknownKeys(
    manifest,
    new Set(["schemaVersion", "walkthrough", "builds", "sourceInventory", "deliveries"]),
    "media-manifest.json",
    errors,
  )) return errors;
  if (manifest.schemaVersion !== 2) errors.push("media-manifest.json.schemaVersion: expected 2");

  const walkthrough = manifest.walkthrough;
  if (rejectUnknownKeys(
    walkthrough,
    new Set([
      "url", "durationSeconds", "targetDurationSeconds", "sourceId", "uploadFileName",
      "width", "height", "frameRate", "videoCodec", "videoProfile", "pixelFormat",
      "colorSpace", "colorTransfer", "colorPrimaries", "colorRange", "audioCodec", "audioSampleRateHz",
      "signedOutPlaybackReviewed", "captionsEnabledReviewed", "reviewedBy", "reviewedAt",
    ]),
    "media-manifest.json.walkthrough",
    errors,
  )) {
    if (!isPublicHttpsUrl(walkthrough.url)) {
      errors.push("media-manifest.json.walkthrough.url: expected a public HTTPS URL without credentials");
    }
    if (!Number.isFinite(walkthrough.durationSeconds) || walkthrough.durationSeconds < 90 || walkthrough.durationSeconds > 105) {
      errors.push("media-manifest.json.walkthrough.durationSeconds: expected the 90–105 second delivery duration");
    }
    const walkthroughContract = {
      targetDurationSeconds: 100,
      uploadFileName: "eclipse-umbra-coop-walkthrough-1080p60.mp4",
      width: 1920,
      height: 1080,
      frameRate: 60,
      videoCodec: "h264",
      videoProfile: "High",
      pixelFormat: "yuv420p",
      colorSpace: "bt709",
      colorTransfer: "bt709",
      colorPrimaries: "bt709",
      colorRange: "tv",
      audioCodec: "aac",
      audioSampleRateHz: 48000,
    };
    for (const [field, expected] of Object.entries(walkthroughContract)) {
      if (walkthrough[field] !== expected) {
        errors.push(`media-manifest.json.walkthrough.${field}: expected ${expected}`);
      }
    }
    if (!isNonPlaceholderString(walkthrough.sourceId, 2)) errors.push("media-manifest.json.walkthrough.sourceId: required");
    if (walkthrough.signedOutPlaybackReviewed !== true) {
      errors.push("media-manifest.json.walkthrough.signedOutPlaybackReviewed: must be true");
    }
    if (walkthrough.captionsEnabledReviewed !== true) {
      errors.push("media-manifest.json.walkthrough.captionsEnabledReviewed: must be true");
    }
    if (!isNonPlaceholderString(walkthrough.reviewedBy, 2)) {
      errors.push("media-manifest.json.walkthrough.reviewedBy: required public-safe reviewer label");
    }
    if (!isValidIsoDate(walkthrough.reviewedAt)) {
      errors.push("media-manifest.json.walkthrough.reviewedAt: expected YYYY-MM-DD");
    }
  }

  const builds = manifest.builds;
  const requiredBuilds = ["eclipse", "umbraHostA", "umbraHostB"];
  if (rejectUnknownKeys(builds, new Set(requiredBuilds), "media-manifest.json.builds", errors)) {
    for (const name of requiredBuilds) {
      const build = builds[name];
      const location = `media-manifest.json.builds.${name}`;
      if (!rejectUnknownKeys(build, new Set(["commit", "version", "artifactSha256"]), location, errors)) continue;
      if (!COMMIT_PATTERN.test(build.commit ?? "")) errors.push(`${location}.commit: expected a full 40- or 64-character commit hash`);
      if (!VERSION_PATTERN.test(build.version ?? "")) {
        errors.push(`${location}.version: expected 2–4 dot-separated numeric components`);
      }
      if (!SHA256_PATTERN.test(build.artifactSha256 ?? "")) errors.push(`${location}.artifactSha256: expected SHA-256`);
    }
  }

  const sourceById = new Map();
  if (!Array.isArray(manifest.sourceInventory) || manifest.sourceInventory.length === 0) {
    errors.push("media-manifest.json.sourceInventory: expected at least one public-safe source record");
  } else {
    manifest.sourceInventory.forEach((source, index) => {
      const location = `media-manifest.json.sourceInventory[${index}]`;
      if (!rejectUnknownKeys(
        source,
        new Set([
          "id", "kind", "publicLabel", "sha256", "durationSeconds", "frameRate", "frameCount", "publicSafe", "liveCapture",
          "captureMethod", "preRollSeconds", "postRollSeconds",
          "rightsReviewId", "privacyReviewId", "consentReviewId", "reviewedBy", "reviewedAt",
        ]),
        location,
        errors,
      )) return;
      if (!/^[a-z0-9][a-z0-9._-]{1,63}$/.test(source.id ?? "")) errors.push(`${location}.id: expected a public slug`);
      if (sourceById.has(source.id)) errors.push(`${location}.id: duplicate source id ${source.id}`);
      else if (typeof source.id === "string") sourceById.set(source.id, source);
      if (!SOURCE_KINDS.has(source.kind)) errors.push(`${location}.kind: unsupported source kind ${source.kind}`);
      if (!isNonPlaceholderString(source.publicLabel, 3)) errors.push(`${location}.publicLabel: required`);
      if (!SHA256_PATTERN.test(source.sha256 ?? "")) errors.push(`${location}.sha256: expected SHA-256`);
      if (source.publicSafe !== true) errors.push(`${location}.publicSafe: must be true`);
      if (typeof source.liveCapture !== "boolean") errors.push(`${location}.liveCapture: expected boolean`);
      if (!isNonPlaceholderString(source.captureMethod, 12)) {
        errors.push(`${location}.captureMethod: required public-safe capture decision`);
      }
      if (["continuous-live-take", "screen-capture", "walkthrough-master"].includes(source.kind)) {
        if (!Number.isFinite(source.durationSeconds) || source.durationSeconds <= 0) {
          errors.push(`${location}.durationSeconds: required finite positive duration for recorded sources`);
        }
        if (!Number.isFinite(source.frameRate) || source.frameRate <= 0) {
          errors.push(`${location}.frameRate: required finite positive frame rate for recorded sources`);
        }
        if (!Number.isSafeInteger(source.frameCount) || source.frameCount <= 0) {
          errors.push(`${location}.frameCount: required positive safe integer frame count for recorded sources`);
        }
        if (Number.isFinite(source.durationSeconds) && Number.isFinite(source.frameRate) && source.frameRate > 0 &&
            Number.isSafeInteger(source.frameCount) &&
            Math.abs(source.frameCount / source.frameRate - source.durationSeconds) > 0.05) {
          errors.push(`${location}: duration, frameRate and frameCount disagree by more than 0.05s`);
        }
      } else if (source.durationSeconds !== undefined || source.frameRate !== undefined || source.frameCount !== undefined) {
        errors.push(`${location}: still sources must omit durationSeconds, frameRate and frameCount`);
      }
      if (["continuous-live-take", "screen-capture"].includes(source.kind)) {
        if (!Number.isFinite(source.preRollSeconds) || source.preRollSeconds < 2) {
          errors.push(`${location}.preRollSeconds: recorded source requires at least two seconds of pre-roll handle`);
        }
        if (!Number.isFinite(source.postRollSeconds) || source.postRollSeconds < 2) {
          errors.push(`${location}.postRollSeconds: recorded source requires at least two seconds of post-roll handle`);
        }
      } else if (source.preRollSeconds !== undefined || source.postRollSeconds !== undefined) {
        errors.push(`${location}: only continuous live takes and screen captures may declare roll handles`);
      }
      validateEvidenceId(source.rightsReviewId, `${location}.rightsReviewId`, errors);
      validateEvidenceId(source.privacyReviewId, `${location}.privacyReviewId`, errors);
      validateEvidenceId(source.consentReviewId, `${location}.consentReviewId`, errors);
      if (!isNonPlaceholderString(source.reviewedBy, 2)) errors.push(`${location}.reviewedBy: required public-safe reviewer label`);
      if (!isValidIsoDate(source.reviewedAt)) errors.push(`${location}.reviewedAt: expected YYYY-MM-DD`);
    });
  }

  if (isPlainObject(walkthrough)) {
    const source = sourceById.get(walkthrough.sourceId);
    if (!source) {
      errors.push(`media-manifest.json.walkthrough.sourceId: unknown source ${walkthrough.sourceId}`);
    } else {
      if (source.kind !== "walkthrough-master") errors.push("media-manifest.json.walkthrough.sourceId: source must be walkthrough-master");
      if (Number.isFinite(source.durationSeconds) && Number.isFinite(walkthrough.durationSeconds) &&
          Math.abs(source.durationSeconds - walkthrough.durationSeconds) > 0.05) {
        errors.push("media-manifest.json.walkthrough: source and hosted durations differ by more than 0.05s");
      }
      if (Number.isFinite(source.frameRate) && Number.isFinite(walkthrough.frameRate) &&
          Math.abs(source.frameRate - walkthrough.frameRate) > 0.01) {
        errors.push("media-manifest.json.walkthrough: source and upload-master frame rates differ");
      }
    }
  }

  const deliveries = manifest.deliveries;
  const deliveryByName = new Map();
  if (rejectUnknownKeys(deliveries, new Set(HASHED_DELIVERY_NAMES), "media-manifest.json.deliveries", errors)) {
    for (const name of HASHED_DELIVERY_NAMES) {
      const entry = deliveries[name];
      const location = `media-manifest.json.deliveries.${name}`;
      if (!rejectUnknownKeys(
        entry,
        new Set([
          "sha256", "lineage", "rightsReviewed", "privacyReviewed", "accessibilityReviewed",
          "accessibleDescription", "altText", "caption", "posterFile", "placements", "loopSeamReviewed",
          "reviewedBy", "reviewedAt",
        ]),
        location,
        errors,
      )) continue;
      deliveryByName.set(name, entry);
      if (!SHA256_PATTERN.test(entry.sha256 ?? "")) {
        errors.push(`${location}.sha256: expected SHA-256`);
      } else if (deliveryHashes.has(name) && entry.sha256.toLowerCase() !== deliveryHashes.get(name).toLowerCase()) {
        errors.push(`${location}.sha256: does not match site/media/${name}`);
      }
      validateReviewFields(entry, location, errors);
      validateAccessibilityCopy(entry, name, location, errors);
      if (!Array.isArray(entry.lineage) || entry.lineage.length !== 1) {
        errors.push(`${location}.lineage: expected exactly one source lineage record`);
        continue;
      }
      const lineage = entry.lineage[0];
      if (!rejectUnknownKeys(
        lineage,
        new Set(["sourceId", "sourceIn", "sourceOut", "sourceTimecode", "sourceFrame"]),
        `${location}.lineage[0]`,
        errors,
      )) continue;
      const source = sourceById.get(lineage.sourceId);
      if (!source) errors.push(`${location}.lineage[0].sourceId: unknown source ${lineage.sourceId}`);
      if (lineage.sourceIn !== undefined) validateLineageClock(lineage.sourceIn, `${location}.lineage[0].sourceIn`, source, errors);
      if (lineage.sourceOut !== undefined) validateLineageClock(lineage.sourceOut, `${location}.lineage[0].sourceOut`, source, errors);
      if (lineage.sourceTimecode !== undefined) {
        validateLineageClock(lineage.sourceTimecode, `${location}.lineage[0].sourceTimecode`, source, errors);
      }
      if (lineage.sourceFrame !== undefined && lineage.sourceFrame !== "original-still" &&
          (!Number.isSafeInteger(lineage.sourceFrame) || lineage.sourceFrame < 0)) {
        errors.push(`${location}.lineage[0].sourceFrame: expected original-still or a nonnegative safe integer frame number`);
      }
      if (lineage.sourceIn !== undefined && lineage.sourceOut !== undefined) {
        const sourceIn = parseClockTimecode(lineage.sourceIn);
        const sourceOut = parseClockTimecode(lineage.sourceOut);
        if (Number.isFinite(sourceIn) && Number.isFinite(sourceOut) && sourceOut <= sourceIn) {
          errors.push(`${location}.lineage[0]: sourceOut must be later than sourceIn`);
        }
      }
    }
  }

  for (const group of VIDEO_VARIANT_GROUPS) {
    const webmEntry = deliveryByName.get(group.webm);
    const mp4Entry = deliveryByName.get(group.mp4);
    const webmLineage = webmEntry?.lineage?.[0];
    const mp4Lineage = mp4Entry?.lineage?.[0];
    for (const [name, entry, lineage] of [
      [group.webm, webmEntry, webmLineage],
      [group.mp4, mp4Entry, mp4Lineage],
    ]) {
      if (!lineage) continue;
      const location = `media-manifest.json.deliveries.${name}.lineage[0]`;
      if (lineage.sourceIn === undefined || lineage.sourceOut === undefined ||
          lineage.sourceTimecode !== undefined || lineage.sourceFrame !== undefined) {
        errors.push(`${location}: loop video requires sourceId/sourceIn/sourceOut only`);
      }
      const source = sourceById.get(lineage.sourceId);
      if (source && (!group.sourceKinds.includes(source.kind) || source.liveCapture !== true)) {
        errors.push(`${location}.sourceId: ${group.id} loop requires a live ${group.sourceKinds.join(" or ")} source`);
      }
      const sourceIn = parseClockTimecode(lineage.sourceIn);
      const sourceOut = parseClockTimecode(lineage.sourceOut);
      if (Number.isFinite(group.durationSeconds) && Number.isFinite(sourceIn) && Number.isFinite(sourceOut) &&
          Math.abs((sourceOut - sourceIn) - group.durationSeconds) > group.durationTolerance) {
        errors.push(`${location}: source interval must be ${group.durationSeconds}s within ${group.durationTolerance}s`);
      }
      if (entry?.posterFile !== group.poster) {
        errors.push(`media-manifest.json.deliveries.${name}.posterFile: expected ${group.poster}`);
      }
    }
    if (webmLineage && mp4Lineage &&
        (webmLineage.sourceId !== mp4Lineage.sourceId || webmLineage.sourceIn !== mp4Lineage.sourceIn ||
         webmLineage.sourceOut !== mp4Lineage.sourceOut)) {
      errors.push(`media-manifest.json: ${group.id} WebM and MP4 variants must declare identical source lineage`);
    }
    if (webmEntry && mp4Entry) {
      for (const field of ["accessibleDescription", "caption", "posterFile", "placements"]) {
        if (JSON.stringify(webmEntry[field]) !== JSON.stringify(mp4Entry[field])) {
          errors.push(`media-manifest.json: ${group.id} WebM and MP4 variants must share ${field}`);
        }
      }
    }

    const posterLineage = deliveryByName.get(group.poster)?.lineage?.[0];
    if (!posterLineage) continue;
    const posterLocation = `media-manifest.json.deliveries.${group.poster}.lineage[0]`;
    if (posterLineage.sourceTimecode === undefined || !Number.isSafeInteger(posterLineage.sourceFrame) ||
        posterLineage.sourceFrame < 0 || posterLineage.sourceIn !== undefined || posterLineage.sourceOut !== undefined) {
      errors.push(`${posterLocation}: poster requires sourceId, sourceTimecode and a nonnegative safe integer sourceFrame`);
    }
    if (webmLineage && posterLineage.sourceId !== webmLineage.sourceId) {
      errors.push(`${posterLocation}.sourceId: poster must come from the same reviewed source as the ${group.id} loop`);
    }
    const posterTime = parseClockTimecode(posterLineage.sourceTimecode);
    const sourceIn = parseClockTimecode(webmLineage?.sourceIn);
    const sourceOut = parseClockTimecode(webmLineage?.sourceOut);
    if (Number.isFinite(posterTime) && Number.isFinite(sourceIn) && Number.isFinite(sourceOut) &&
        (posterTime < sourceIn || posterTime > sourceOut)) {
      errors.push(`${posterLocation}.sourceTimecode: poster frame must fall inside the loop source interval`);
    }
    validateFrameAtTime(posterLineage, sourceById.get(posterLineage.sourceId), posterLocation, errors);
  }

  const roomLineage = deliveryByName.get("living-room-wide.webp")?.lineage?.[0];
  if (roomLineage) {
    const location = "media-manifest.json.deliveries.living-room-wide.webp.lineage[0]";
    if (roomLineage.sourceFrame !== "original-still" || roomLineage.sourceIn !== undefined ||
        roomLineage.sourceOut !== undefined || roomLineage.sourceTimecode !== undefined) {
      errors.push(`${location}: room photograph requires sourceId and sourceFrame=original-still`);
    }
    const source = sourceById.get(roomLineage.sourceId);
    if (source && source.kind !== "photograph") errors.push(`${location}.sourceId: source must be a photograph`);
  }

  const pickerLineage = deliveryByName.get("coop-picker.webp")?.lineage?.[0];
  if (pickerLineage) {
    const location = "media-manifest.json.deliveries.coop-picker.webp.lineage[0]";
    const hasVideoFrame = pickerLineage.sourceTimecode !== undefined && Number.isSafeInteger(pickerLineage.sourceFrame) &&
      pickerLineage.sourceFrame >= 0;
    const hasOriginalStill = pickerLineage.sourceTimecode === undefined && pickerLineage.sourceFrame === "original-still";
    if (hasVideoFrame === hasOriginalStill || pickerLineage.sourceIn !== undefined || pickerLineage.sourceOut !== undefined) {
      errors.push(`${location}: picker requires either sourceTimecode plus a nonnegative integer sourceFrame, or sourceFrame=original-still`);
    }
    const source = sourceById.get(pickerLineage.sourceId);
    if (source && !["screen-capture", "screenshot", "continuous-live-take"].includes(source.kind)) {
      errors.push(`${location}.sourceId: source must be a screen capture, screenshot or continuous live take`);
    }
    if (source && source.liveCapture !== true) {
      errors.push(`${location}.sourceId: picker source must attest a live application capture`);
    }
    if (source && hasVideoFrame && !["screen-capture", "continuous-live-take"].includes(source.kind)) {
      errors.push(`${location}.sourceId: video-derived picker source must be a screen capture or continuous live take`);
    }
    if (source && hasOriginalStill && source.kind !== "screenshot") {
      errors.push(`${location}.sourceId: original-still picker source must be a screenshot`);
    }
    if (hasVideoFrame) validateFrameAtTime(pickerLineage, source, location, errors);
  }

  for (const name of ["coop-walkthrough.en.vtt", "coop-walkthrough-transcript.md"]) {
    const lineage = deliveryByName.get(name)?.lineage?.[0];
    if (!lineage || !isPlainObject(walkthrough)) continue;
    const location = `media-manifest.json.deliveries.${name}.lineage[0]`;
    if (lineage.sourceId !== walkthrough.sourceId || Object.keys(lineage).length !== 1) {
      errors.push(`${location}: accessibility text must reference only the reviewed walkthrough master`);
    }
  }

  const referencedSources = new Set();
  if (isPlainObject(walkthrough) && typeof walkthrough.sourceId === "string") referencedSources.add(walkthrough.sourceId);
  for (const entry of deliveryByName.values()) {
    for (const lineage of entry.lineage ?? []) {
      if (typeof lineage.sourceId === "string") referencedSources.add(lineage.sourceId);
    }
  }
  for (const sourceId of sourceById.keys()) {
    if (!referencedSources.has(sourceId)) errors.push(`media-manifest.json.sourceInventory: unused source ${sourceId}`);
  }

  scanPublicStrings(manifest, "media-manifest.json", errors);
  return errors;
}

function markdownSections(text) {
  const headings = [...text.matchAll(/^(#{1,6})[ \t]+(.+?)[ \t]*#*[ \t]*$/gm)].map((match) => ({
    level: match[1].length,
    title: match[2].trim(),
    start: match.index,
    contentStart: match.index + match[0].length,
  }));
  return headings.map((heading, index) => {
    let end = text.length;
    for (let next = index + 1; next < headings.length; next += 1) {
      if (headings[next].level <= heading.level) {
        end = headings[next].start;
        break;
      }
    }
    return { ...heading, end, content: text.slice(heading.contentStart, end).trim() };
  });
}

function partitionMarkdownNonContent(text) {
  const hidden = [];
  const withoutComments = text.replace(/<!--[\s\S]*?-->/g, (comment) => {
    hidden.push(comment);
    return "\n".repeat((comment.match(/\n/g) ?? []).length);
  });
  const visible = [];
  let fence;
  for (const line of withoutComments.split(/\r?\n/)) {
    const marker = line.match(/^\s*(`{3,}|~{3,})/);
    if (!fence && marker) {
      fence = { character: marker[1][0], length: marker[1].length };
      hidden.push(line);
      continue;
    }
    if (fence) {
      hidden.push(line);
      const closing = line.match(/^\s*(`{3,}|~{3,})\s*$/);
      if (closing && closing[1][0] === fence.character && closing[1].length >= fence.length) fence = undefined;
      continue;
    }
    visible.push(line);
  }
  return { visible: visible.join("\n"), hidden: hidden.join("\n") };
}

function stripMarkdownNonContent(text) {
  return partitionMarkdownNonContent(text).visible;
}

function escapeRegularExpression(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function maskExpectedBuildRecordVersions(visibleText, manifest) {
  const sections = markdownSections(visibleText);
  const buildSection = sections.find((entry) => entry.title.toLowerCase().includes("build record"));
  if (!buildSection || !isPlainObject(manifest?.builds)) return visibleText;
  const start = buildSection.contentStart;
  const end = buildSection.end;
  let content = visibleText.slice(start, end);
  for (const [name, build] of Object.entries(manifest.builds)) {
    if (!isPlainObject(build) || !VERSION_PATTERN.test(build.version ?? "")) continue;
    const label = BUILD_LABELS[name];
    if (!label) continue;
    const pattern = new RegExp(
      `(^[ \\t]*(?:[-*+][ \\t]+)?${escapeRegularExpression(label)}\\b[^\\r\\n]*?\\bversion\\b[^\\r\\n]*?)` +
        `\`?\\b${escapeRegularExpression(build.version)}\\b\`?`,
      "im",
    );
    content = content.replace(pattern, "$1BUILD_VERSION");
  }
  return `${visibleText.slice(0, start)}${content}${visibleText.slice(end)}`;
}

export function validateTranscript(text, manifest) {
  const errors = [];
  if (typeof text !== "string" || text.trim().length < 400) {
    errors.push("transcript is too short");
    return errors;
  }
  if (PLACEHOLDER_PATTERN.test(text)) errors.push("transcript contains a placeholder");
  const markdownContent = partitionMarkdownNonContent(text);
  const visibleText = markdownContent.visible;
  const safetyVisibleText = maskExpectedBuildRecordVersions(visibleText, manifest);
  const safetyProblems = new Set([
    ...publicSafetyProblems(safetyVisibleText),
    ...publicSafetyProblems(markdownContent.hidden),
  ]);
  for (const problem of [...safetyProblems].filter((entry) => entry !== "contains a placeholder")) {
    errors.push(`transcript ${problem}`);
  }
  const sections = markdownSections(visibleText);
  if (!sections.some((section) => section.level === 1 && section.title.length > 0)) errors.push("transcript is missing a title heading");

  const requireSection = (label, predicate) => {
    const section = sections.find((entry) => predicate(entry.title.toLowerCase()));
    if (!section) {
      errors.push(`transcript is missing ${label} heading`);
      return undefined;
    }
    if (section.content.replace(/\s+/g, " ").trim().length < 20) errors.push(`transcript ${label} section is empty or too short`);
    return section;
  };
  const buildSection = requireSection("Build record", (title) => title.includes("build record"));
  const narrationSection = requireSection("Narration", (title) => title.includes("narration"));
  const soundSection = sections.find((entry) => entry.title.toLowerCase().includes("sound cue")) ??
    (narrationSection?.title.toLowerCase().includes("sound cue") ? narrationSection : undefined);
  if (!soundSection) errors.push("transcript is missing Sound cues heading (separate or combined with Narration)");
  else if (soundSection.content.replace(/\s+/g, " ").trim().length < 20) errors.push("transcript Sound cues section is empty or too short");
  requireSection("Visual description", (title) => title.includes("visual description"));
  const linksSection = requireSection("Public links", (title) => title.includes("public links"));
  const creditsSection = requireSection("Credits", (title) => title === "credits" || title.includes("credits and"));

  if (!isPlainObject(manifest)) {
    errors.push("transcript cannot be checked without a valid media manifest");
    return errors;
  }
  const hostedUrl = manifest.walkthrough?.url;
  if (typeof hostedUrl !== "string" || !visibleText.includes(hostedUrl)) errors.push("transcript is missing the hosted walkthrough URL from the manifest");
  if (linksSection && typeof hostedUrl === "string" && !linksSection.content.includes(hostedUrl)) {
    errors.push("transcript Public links section is missing the hosted walkthrough URL");
  }
  if (buildSection && isPlainObject(manifest.builds)) {
    for (const [name, build] of Object.entries(manifest.builds)) {
      if (!isPlainObject(build)) continue;
      const label = BUILD_LABELS[name] ?? name;
      if (!buildSection.content.toLowerCase().includes(label.toLowerCase())) {
        errors.push(`transcript Build record is missing ${label} label`);
      }
      for (const field of ["version", "commit", "artifactSha256"]) {
        if (typeof build[field] === "string" && !buildSection.content.includes(build[field])) {
          errors.push(`transcript Build record is missing ${name} ${field}`);
        }
      }
    }
  }
  if (creditsSection) {
    for (const name of ["Moonlight", "Sunshine", "Moonlight TV", "Aurora", "Apollo"]) {
      if (!creditsSection.content.includes(name)) errors.push(`transcript Credits section is missing ${name}`);
    }
  }
  return errors;
}

function sha256File(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

export function probeProcessFailed(result) {
  return result.status !== 0 || String(result.stderr ?? "").trim() !== "";
}

function probeFrameTimeline(file) {
  const probe = spawnSync("ffprobe", [
    "-v", "error", "-err_detect", "explode", "-select_streams", "v:0", "-show_entries",
    "frame=best_effort_timestamp_time,pts_time,key_frame", "-of", "json", file,
  ], { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
  if (probeProcessFailed(probe)) return { error: "ffprobe could not cleanly decode the frame timeline" };
  try {
    const data = JSON.parse(probe.stdout);
    const frames = data.frames ?? [];
    const timestamps = frames.map((frame) => Number(frame.best_effort_timestamp_time ?? frame.pts_time));
    return { timestamps, frames };
  } catch {
    return { error: "ffprobe returned an invalid frame timeline" };
  }
}

export function hasInvalidRotationMetadata(stream) {
  const rotations = [];
  if (Object.prototype.hasOwnProperty.call(stream.tags ?? {}, "rotate")) rotations.push(stream.tags.rotate);
  for (const entry of stream.side_data_list ?? []) {
    if (entry.side_data_type === "Display Matrix" || Object.prototype.hasOwnProperty.call(entry, "displaymatrix")) {
      return true;
    }
    if (Object.prototype.hasOwnProperty.call(entry, "rotation")) rotations.push(entry.rotation);
  }
  return rotations.some((rotation) => {
    if (rotation === "" || rotation === null || rotation === undefined) return true;
    const numericRotation = Number(rotation);
    return !Number.isFinite(numericRotation) || numericRotation !== 0;
  });
}

export function unexpectedNonVideoStreamTypes(streams) {
  return [...new Set(
    (Array.isArray(streams) ? streams : [])
      .filter((stream) => stream.codec_type !== "video")
      .map((stream) => stream.codec_type ?? "unknown"),
  )];
}

export function hasUnexpectedChapters(chapters) {
  return Array.isArray(chapters) && chapters.length > 0;
}

const FORMAT_TAG_RULES = new Map([
  ["major_brand", (value) => /^[A-Za-z0-9 ]{4}$/.test(value)],
  ["minor_version", (value) => /^\d+$/.test(value)],
  ["compatible_brands", (value) => /^[A-Za-z0-9 ]+$/.test(value)],
  ["encoder", (value) => /^[A-Za-z0-9 ._()+-]{1,160}$/.test(value)],
]);
const STREAM_TAG_RULES = new Map([
  ["language", (value) => /^(?:und|eng)$/.test(value)],
  ["handler_name", (value) => value === "VideoHandler"],
  ["vendor_id", (value) => value === "[0][0][0][0]"],
  ["encoder", (value) => /^[A-Za-z0-9 ._()+-]{1,160}$/.test(value)],
  ["duration", (value) => /^\d{2,}:\d{2}:\d{2}\.\d{3,9}$/.test(value)],
  ["rotate", (value) => Number.isFinite(Number(value)) && Number(value) === 0],
]);

export function validateTechnicalMetadata(formatTags = {}, streamTags = {}) {
  const errors = [];
  for (const [scope, tags, rules] of [
    ["format", formatTags ?? {}, FORMAT_TAG_RULES],
    ["stream", streamTags ?? {}, STREAM_TAG_RULES],
  ]) {
    for (const [rawKey, rawValue] of Object.entries(tags)) {
      const key = rawKey.toLowerCase();
      const value = String(rawValue);
      for (const problem of publicSafetyProblems(value)) {
        errors.push(`${scope} tag ${rawKey} ${problem}`);
      }
      const rule = rules.get(key);
      if (!rule) errors.push(`${scope} tag ${rawKey} is not an allowed technical metadata field`);
      else if (!rule(value)) errors.push(`${scope} tag ${rawKey} has an unexpected value`);
    }
  }
  return errors;
}

function runSsim(webmFile, mp4File, frameRate) {
  const result = spawnSync("ffmpeg", [
    "-hide_banner", "-nostats", "-xerror", "-err_detect", "explode", "-i", webmFile,
    "-err_detect", "explode", "-i", mp4File,
    "-filter_complex",
    `[0:v]settb=AVTB,setpts=N/(${frameRate}*TB),format=yuv420p[webm];` +
      `[1:v]settb=AVTB,setpts=N/(${frameRate}*TB),format=yuv420p[mp4];` +
      "[webm][mp4]ssim=stats_file=-",
    "-fps_mode", "passthrough", "-an", "-f", "null", "-",
  ], { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
  if (result.status !== 0) return { error: "ffmpeg SSIM comparison failed" };
  const value = parseSsim(result.stderr);
  if (!Number.isFinite(value)) return { error: "ffmpeg SSIM comparison produced no score" };
  const frames = parseSsimFrameStats(result.stdout);
  if (frames.some((frame) => !Number.isFinite(frame.all) || !Number.isInteger(frame.number))) {
    return { error: "ffmpeg SSIM comparison produced invalid per-frame statistics" };
  }
  return { value, frames };
}

function main() {
  const mediaRoot = path.join(repositoryRoot, "site", "media");
  const errors = [];
  const inventory = inventoryMediaDirectory(mediaRoot);
  errors.push(...inventory.errors);
  const deliveries = DELIVERY_CONTRACT.map((delivery) => ({
    ...delivery,
    file: path.join(mediaRoot, delivery.name),
  }));
  const validationFiles = new Set();

  for (const delivery of deliveries) {
    if (!inventory.regularFiles.has(delivery.name)) {
      errors.push(`site/media/${delivery.name}: required delivery is missing`);
      continue;
    }
    const size = fs.statSync(delivery.file).size;
    if (size === 0) errors.push(`site/media/${delivery.name}: file is empty`);
    if (size > delivery.maxBytes) {
      errors.push(`site/media/${delivery.name}: ${size} bytes exceeds ${delivery.maxBytes}`);
    }
    if (size > 0 && size <= delivery.maxBytes) validationFiles.add(delivery.name);
  }

  const deliveryHashes = new Map();
  for (const name of HASHED_DELIVERY_NAMES) {
    const file = path.join(mediaRoot, name);
    if (validationFiles.has(name)) deliveryHashes.set(name, sha256File(file));
  }

  let manifest;
  const manifestFile = path.join(mediaRoot, "media-manifest.json");
  if (validationFiles.has("media-manifest.json")) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
      errors.push(...validateManifest(manifest, deliveryHashes));
    } catch (error) {
      errors.push(`site/media/media-manifest.json: invalid JSON (${error.message})`);
    }
  }

  const probeTargets = deliveries.filter((delivery) =>
    validationFiles.has(delivery.name) && ["video", "poster", "photo"].includes(delivery.kind));
  if (probeTargets.length > 0) {
    const version = spawnSync("ffprobe", ["-version"], { encoding: "utf8" });
    if (version.status !== 0) errors.push("ffprobe is required to validate launch media");
  }

  const videoFacts = new Map();
  for (const delivery of probeTargets) {
    const probe = spawnSync("ffprobe", [
      "-v", "error", "-err_detect", "explode", "-count_frames", "-show_entries",
      "format=format_name,duration,start_time:format_tags:" +
        "stream=codec_type,codec_name,profile,width,height,pix_fmt,avg_frame_rate,sample_aspect_ratio,nb_read_frames," +
        "color_space,color_transfer,color_primaries,color_range:" +
        "stream_tags:stream_side_data=side_data_type,displaymatrix,rotation:chapter=id,start_time,end_time:chapter_tags",
      "-of", "json", delivery.file,
    ], { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
    if (probeProcessFailed(probe)) {
      errors.push(`site/media/${delivery.name}: ffprobe reported a decode/container error`);
      continue;
    }
    let data;
    try {
      data = JSON.parse(probe.stdout);
    } catch {
      errors.push(`site/media/${delivery.name}: ffprobe returned invalid JSON`);
      continue;
    }
    const streams = data.streams ?? [];
    if (hasUnexpectedChapters(data.chapters)) {
      errors.push(`site/media/${delivery.name}: chapters are not allowed in public launch media`);
    }
    const videoStreams = streams.filter((stream) => stream.codec_type === "video");
    const types = unexpectedNonVideoStreamTypes(streams);
    if (types.length > 0) {
      errors.push(`site/media/${delivery.name}: unexpected non-video streams remain (${types.join(", ")})`);
    }
    if (videoStreams.length !== 1) {
      errors.push(`site/media/${delivery.name}: expected exactly one video/image stream`);
      continue;
    }
    const stream = videoStreams[0];
    if (delivery.kind === "video") {
      const formatName = data.format?.format_name ?? "";
      const expectedFormat = delivery.name.endsWith(".webm") ? "webm" : "mp4";
      if (!formatName.split(",").includes(expectedFormat)) {
        errors.push(`site/media/${delivery.name}: expected ${expectedFormat} container, found ${formatName}`);
      }
      errors.push(...validateVideoTechnicalContract(`site/media/${delivery.name}`, stream, delivery));
      const duration = Number(data.format?.duration);
      const frameRate = fraction(stream.avg_frame_rate);
      const frameCount = Number(stream.nb_read_frames);
      for (const error of validateVideoMeasurements(
        `site/media/${delivery.name}`,
        { duration, frameRate, frameCount },
        delivery,
      )) {
        errors.push(error);
      }
      if (hasInvalidRotationMetadata(stream)) {
        errors.push(`site/media/${delivery.name}: rotation metadata must be finite zero or absent`);
      }
      for (const problem of validateTechnicalMetadata(data.format?.tags, stream.tags)) {
        errors.push(`site/media/${delivery.name}: ${problem}`);
      }
      if (delivery.name.endsWith(".mp4")) {
        try {
          validateMp4FastStart(fs.readFileSync(delivery.file));
        } catch (error) {
          errors.push(`site/media/${delivery.name}: invalid MP4 atom structure (${error.message})`);
        }
      } else {
        const binarySafetyProblems = binaryPrintableSafetyProblems([fs.readFileSync(delivery.file)]);
        if (binarySafetyProblems.length > 0) {
          errors.push(`site/media/${delivery.name}: printable bytes ${binarySafetyProblems.join(" and ")}`);
        }
      }
      const timeline = probeFrameTimeline(delivery.file);
      if (timeline.error) errors.push(`site/media/${delivery.name}: ${timeline.error}`);
      else if (timeline.timestamps.length !== frameCount) {
        errors.push(`site/media/${delivery.name}: timeline has ${timeline.timestamps.length} frames but ffprobe counted ${frameCount}`);
      }
      if (!timeline.error && delivery.requireStartKeyframe && !startsWithKeyframe(timeline.frames)) {
        errors.push(`site/media/${delivery.name}: first decoded frame must be a keyframe`);
      }
      videoFacts.set(delivery.name, {
        duration,
        frameRate,
        frameCount,
        timestamps: timeline.timestamps ?? [],
      });
    } else {
      if (stream.codec_name !== "webp") errors.push(`site/media/${delivery.name}: expected WebP image`);
      try {
        inspectWebP(fs.readFileSync(delivery.file));
      } catch (error) {
        errors.push(`site/media/${delivery.name}: invalid public WebP (${error.message})`);
      }
      const sar = stream.sample_aspect_ratio;
      if (sar !== undefined && sar !== "N/A" && sar !== "0:1" && sar !== "1:1") {
        errors.push(`site/media/${delivery.name}: expected square pixels, found ${sar}`);
      }
      if (hasInvalidRotationMetadata(stream)) {
        errors.push(`site/media/${delivery.name}: rotation metadata must be finite zero or absent`);
      }
      const metadataKeys = [
        ...Object.keys(data.format?.tags ?? {}),
        ...Object.keys(stream.tags ?? {}),
      ];
      if (metadataKeys.length > 0) {
        errors.push(`site/media/${delivery.name}: embedded metadata tags remain (${metadataKeys.join(", ")})`);
      }
      if (stream.width !== delivery.width || stream.height !== delivery.height) {
        errors.push(`site/media/${delivery.name}: expected ${delivery.width}x${delivery.height}, found ${stream.width}x${stream.height}`);
      }
    }
  }

  const completeVariantGroups = VIDEO_VARIANT_GROUPS.filter((group) =>
    videoFacts.has(group.webm) && videoFacts.has(group.mp4));
  const ffmpegVersion = completeVariantGroups.length > 0
    ? spawnSync("ffmpeg", ["-version"], { encoding: "utf8" })
    : undefined;
  if (ffmpegVersion && ffmpegVersion.status !== 0) {
    errors.push("ffmpeg is required to compare decoded WebM/MP4 media variants");
  }
  for (const group of completeVariantGroups) {
    const webmFacts = videoFacts.get(group.webm);
    const mp4Facts = videoFacts.get(group.mp4);
    const label = `site/media ${group.id} loop variants`;
    if (Number.isFinite(webmFacts.duration) && Number.isFinite(mp4Facts.duration) &&
        Math.abs(webmFacts.duration - mp4Facts.duration) > 0.05) {
      errors.push(`${label}: WebM and MP4 durations differ by more than 0.05s`);
    }
    if (Number.isFinite(webmFacts.frameRate) && Number.isFinite(mp4Facts.frameRate) &&
        Math.abs(webmFacts.frameRate - mp4Facts.frameRate) > 0.01) {
      errors.push(`${label}: WebM and MP4 frame rates do not match`);
    }
    if (Number.isFinite(webmFacts.frameCount) && Number.isFinite(mp4Facts.frameCount) &&
        webmFacts.frameCount !== mp4Facts.frameCount) {
      errors.push(`${label}: WebM has ${webmFacts.frameCount} frames and MP4 has ${mp4Facts.frameCount}`);
    }
    for (const error of compareFrameTimelines(webmFacts.timestamps, mp4Facts.timestamps)) {
      errors.push(`${label}: ${error}`);
    }
    if (ffmpegVersion?.status === 0) {
      if (!Number.isFinite(webmFacts.frameRate) || webmFacts.frameRate <= 0 ||
          !Number.isInteger(webmFacts.frameCount) || webmFacts.frameCount <= 0) {
        errors.push(`${label}: valid rate and frame count are required for SSIM comparison`);
      } else {
        const similarity = runSsim(
          path.join(mediaRoot, group.webm),
          path.join(mediaRoot, group.mp4),
          webmFacts.frameRate,
        );
        if (similarity.error) {
          errors.push(`${label}: ${similarity.error}`);
        } else {
          if (similarity.frames.length !== webmFacts.frameCount) {
            errors.push(
              `${label}: SSIM compared ${similarity.frames.length} frames; expected ${webmFacts.frameCount}`,
            );
          } else {
            const unexpectedNumber = similarity.frames.find((frame, index) => frame.number !== index + 1);
            if (unexpectedNumber) {
              errors.push(`${label}: SSIM frame sequence is not contiguous at frame ${unexpectedNumber.number}`);
            }
          }
          const weakestFrame = similarity.frames.reduce(
            (weakest, frame) => !weakest || frame.all < weakest.all ? frame : weakest,
            undefined,
          );
          if (weakestFrame && weakestFrame.all < SSIM_MINIMUM) {
            errors.push(
              `${label}: decoded frame ${weakestFrame.number} SSIM ${weakestFrame.all} is below ${SSIM_MINIMUM}`,
            );
          }
          if (similarity.value < SSIM_MINIMUM) {
            errors.push(`${label}: decoded aggregate SSIM ${similarity.value} is below ${SSIM_MINIMUM}`);
          }
        }
      }
    }
    const lineage = manifest?.deliveries?.[group.webm]?.lineage?.[0];
    if (lineage) {
      const sourceIn = parseClockTimecode(lineage.sourceIn);
      const sourceOut = parseClockTimecode(lineage.sourceOut);
      if (Number.isFinite(sourceIn) && Number.isFinite(sourceOut) && Number.isFinite(webmFacts.duration) &&
          Math.abs((sourceOut - sourceIn) - webmFacts.duration) > 0.05) {
        errors.push(`${label}: declared source interval differs from delivery duration by more than 0.05s`);
      }
    }
  }

  const vttFile = path.join(mediaRoot, "coop-walkthrough.en.vtt");
  if (validationFiles.has("coop-walkthrough.en.vtt")) {
    try {
      parseWebVtt(fs.readFileSync(vttFile, "utf8"), Number(manifest?.walkthrough?.durationSeconds));
    } catch (error) {
      errors.push(`site/media/coop-walkthrough.en.vtt: ${error.message}`);
    }
  }

  const transcriptFile = path.join(mediaRoot, "coop-walkthrough-transcript.md");
  if (validationFiles.has("coop-walkthrough-transcript.md")) {
    for (const error of validateTranscript(fs.readFileSync(transcriptFile, "utf8"), manifest)) {
      errors.push(`site/media/coop-walkthrough-transcript.md: ${error}`);
    }
  }

  if (errors.length > 0) {
    console.error("Launch-media check failed:");
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Launch-media check passed: ${deliveries.length} delivery files.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptFile) main();

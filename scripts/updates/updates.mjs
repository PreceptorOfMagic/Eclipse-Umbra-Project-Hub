#!/usr/bin/env node
// site/updates.json: the list of releases that Eclipse and Umbra read to show their update notice.
//
//   node scripts/updates/updates.mjs validate
//   node scripts/updates/updates.mjs add --product eclipse --version 1.3.7 --date 2026-11-20 \
//        --notes-url https://github.com/PreceptorOfMagic/Eclipse/releases/tag/eclipse-v1.3.7 \
//        --highlight "First signed Windows release" --highlight "Update notice in Settings" \
//        [--platforms windows,linux] [--silent]
//   node scripts/updates/updates.mjs notify --product eclipse --version 1.3.7 on|off
//
// A release is announced by default. --silent (or `notify ... off`) publishes it without the notice:
// clients never show a dot for it on its own, and list it only beneath a later announced release.
// --platforms limits a release to those platforms. Clients read schema 1 only; a change that older
// clients cannot read needs a new schema number, which those clients then ignore.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const defaultFile = path.resolve(here, "../../site/updates.json");

export const products = ["eclipse", "umbra", "umbra-vibepollo"];
export const platforms = {
  eclipse: ["webos", "windows", "linux", "android"],
  umbra: ["windows", "linux"],
  "umbra-vibepollo": ["windows"],
};
const maxHighlights = 10;
const maxHighlightLength = 160;

export function validate(doc) {
  const errors = [];
  if (doc === null || typeof doc !== "object" || Array.isArray(doc)) return ["the file is not a JSON object"];
  if (doc.schema !== 1) errors.push("schema must be 1");
  for (const product of products) {
    const p = doc[product];
    if (p === undefined) continue;
    const where = product;
    if (typeof p !== "object" || p === null) { errors.push(`${where}: not an object`); continue; }
    if (p.download_url !== undefined && !/^https:\/\//.test(p.download_url)) errors.push(`${where}.download_url: not https`);
    for (const [key, text] of Object.entries(p.how_to_update ?? {})) {
      if (!platforms[product].includes(key)) errors.push(`${where}.how_to_update.${key}: unknown platform`);
      if (typeof text !== "string" || text.length === 0) errors.push(`${where}.how_to_update.${key}: empty`);
    }
    if (!Array.isArray(p.releases)) { errors.push(`${where}.releases: not an array`); continue; }
    const seen = new Set();
    p.releases.forEach((r, i) => {
      const at = `${where}.releases[${i}]`;
      if (typeof r.version !== "string" || !/^v?\d+(\.\d+)*(-[0-9A-Za-z.]+)?$/.test(r.version)) errors.push(`${at}.version: bad`);
      // The same version may appear once per platform (Umbra's Windows and Linux numbers differ).
      for (const plat of r.platforms ?? ["*"]) {
        const key = `${r.version}@${plat}`;
        if (seen.has(key)) errors.push(`${at}: version ${r.version} listed twice for ${plat}`);
        seen.add(key);
      }
      if (r.date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(r.date)) errors.push(`${at}.date: not YYYY-MM-DD`);
      if (r.notify !== undefined && typeof r.notify !== "boolean") errors.push(`${at}.notify: not true/false`);
      if (r.notes_url !== undefined && !/^https:\/\//.test(r.notes_url)) errors.push(`${at}.notes_url: not https`);
      if (r.platforms !== undefined) {
        if (!Array.isArray(r.platforms) || r.platforms.length === 0) errors.push(`${at}.platforms: empty`);
        else for (const plat of r.platforms) if (!platforms[product].includes(plat)) errors.push(`${at}.platforms: unknown ${plat}`);
      }
      const hl = r.highlights ?? [];
      if (!Array.isArray(hl)) errors.push(`${at}.highlights: not an array`);
      else {
        if (hl.length > maxHighlights) errors.push(`${at}.highlights: more than ${maxHighlights}`);
        hl.forEach((h, j) => {
          if (typeof h !== "string" || h.length === 0) errors.push(`${at}.highlights[${j}]: empty`);
          else if (h.length > maxHighlightLength) errors.push(`${at}.highlights[${j}]: over ${maxHighlightLength} characters`);
        });
      }
    });
  }
  for (const key of Object.keys(doc)) {
    if (key !== "schema" && !products.includes(key)) errors.push(`${key}: unknown product`);
  }
  return errors;
}

function parseArgs(argv) {
  const opts = { highlight: [] };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--silent") opts.silent = true;
    else if (a.startsWith("--")) {
      const key = a.slice(2);
      const value = argv[++i];
      if (value === undefined) throw new Error(`${a} needs a value`);
      if (key === "highlight") opts.highlight.push(value);
      else opts[key] = value;
    } else rest.push(a);
  }
  return { opts, rest };
}

export function addRelease(doc, opts) {
  const { product, version } = opts;
  if (!products.includes(product)) throw new Error(`--product must be one of ${products.join(", ")}`);
  if (!version) throw new Error("--version is required");
  doc[product] ??= { releases: [] };
  const release = { version };
  if (opts.date) release.date = opts.date;
  if (opts.silent) release.notify = false;
  if (opts.platforms) release.platforms = opts.platforms.split(",").map((s) => s.trim()).filter(Boolean);
  if (opts["notes-url"]) release.notes_url = opts["notes-url"];
  release.highlights = opts.highlight;
  doc[product].releases.unshift(release);
  return release;
}

export function setNotify(doc, product, version, on) {
  const matches = (doc[product]?.releases ?? []).filter((r) => r.version === version);
  if (matches.length === 0) throw new Error(`${product} ${version} is not in the file`);
  for (const r of matches) {
    if (on) delete r.notify;
    else r.notify = false;
  }
  return matches.length;
}

function load(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function save(file, doc) {
  const errors = validate(doc);
  if (errors.length) throw new Error(`refusing to write an invalid file:\n  ${errors.join("\n  ")}`);
  fs.writeFileSync(file, `${JSON.stringify(doc, null, 2)}\n`);
}

function main(argv) {
  const [command, ...args] = argv;
  const { opts, rest } = parseArgs(args);
  const file = opts.file ? path.resolve(opts.file) : defaultFile;
  if (command === "validate") {
    const errors = validate(load(file));
    if (errors.length) {
      console.error(`${file}:\n  ${errors.join("\n  ")}`);
      return 1;
    }
    console.log(`${path.relative(process.cwd(), file)} is valid`);
    return 0;
  }
  if (command === "add") {
    const doc = load(file);
    const r = addRelease(doc, opts);
    save(file, doc);
    console.log(`added ${opts.product} ${r.version}${r.notify === false ? " (silent)" : ""}`);
    return 0;
  }
  if (command === "notify") {
    const state = rest[0];
    if (state !== "on" && state !== "off") throw new Error("notify needs on or off");
    const doc = load(file);
    setNotify(doc, opts.product, opts.version, state === "on");
    save(file, doc);
    console.log(`${opts.product} ${opts.version}: notice ${state}`);
    return 0;
  }
  console.error("usage: updates.mjs validate | add --product P --version V ... | notify --product P --version V on|off");
  return 2;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = main(process.argv.slice(2));
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  }
}

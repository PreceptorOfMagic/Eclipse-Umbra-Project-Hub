#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..", "..");
const siteRoot = path.join(repositoryRoot, "site");
const errors = [];
const pages = ["index.html", "setup.html", "eclipse.html", "umbra.html", "development.html", "credits.html", "licence.html", "404.html"];
const navContract = [
  ["Project Hub", "./"], ["Installation Guide", "setup.html"], ["Eclipse", "eclipse.html"],
  ["Umbra", "umbra.html"], ["Development", "development.html"], ["Acknowledgements", "credits.html"],
];
const baseUrl = "https://preceptorofmagic.github.io/Eclipse-Umbra-Project-Hub/";
// Each illustrated mode keeps its natural ratio, without a fixed-height letterbox.
const stylesheet = fs.readFileSync(path.join(siteRoot, "assets", "styles.css"), "utf8");
const heroImageRule = stylesheet.match(/\.hero-diagram-row\s*\{([^}]+)\}/)?.[1] ?? "";
if (!/\bwidth\s*:\s*100%\s*;/.test(heroImageRule) || !/\bheight\s*:\s*auto\s*;/.test(heroImageRule)) {
  errors.push("hero artwork must scale its width and height together");
}
const heroArtwork = fs.readFileSync(path.join(siteRoot, "assets", "hero-art.svg"), "utf8");
if (!heroArtwork.includes('viewBox="0 0 1216 900"')) errors.push("hero artwork must match the two illustrated viewport crops");
for (const label of heroArtwork.matchAll(/<text\b[^>]*font-size="([\d.]+)"/g)) {
  if (Number(label[1]) < 28) errors.push("hero artwork label is below the enlarged type-size contract");
}
const canonicals = new Map([
  ["index.html", baseUrl], ["setup.html", `${baseUrl}setup.html`], ["eclipse.html", `${baseUrl}eclipse.html`],
  ["umbra.html", `${baseUrl}umbra.html`], ["development.html", `${baseUrl}development.html`], ["credits.html", `${baseUrl}credits.html`],
  ["licence.html", `${baseUrl}licence.html`],
]);

function anchors(fragment) {
  return [...fragment.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((match) => [
    match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    match[1].match(/\bhref=["']([^"']+)["']/i)?.[1] ?? "",
  ]);
}

function checkContract(file, label, actual) {
  if (actual.length !== navContract.length) {
    errors.push(`${file}: ${label} contains ${actual.length} links; expected ${navContract.length}`);
    return;
  }
  navContract.forEach((expected, index) => {
    if (actual[index][0] !== expected[0] || actual[index][1] !== expected[1]) {
      errors.push(`${file}: ${label} link ${index + 1} must be ${expected[0]} (${expected[1]})`);
    }
  });
}

for (const page of pages) if (!fs.existsSync(path.join(siteRoot, page))) errors.push(`site/${page}: required page is missing`);
for (const obsolete of ["projects.html", "media.html", "support.html", "walkthrough.html"]) {
  if (fs.existsSync(path.join(siteRoot, obsolete))) errors.push(`site/${obsolete}: obsolete public page must be removed`);
}

const htmlFiles = fs.readdirSync(siteRoot).filter((name) => name.endsWith(".html"));
const idsByFile = new Map();
const htmlByFile = new Map();
for (const name of htmlFiles) {
  const file = path.join(siteRoot, name);
  const html = fs.readFileSync(file, "utf8");
  htmlByFile.set(file, html);
  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]);
  idsByFile.set(file, new Set(ids));
  if (ids.length !== new Set(ids).size) errors.push(`site/${name}: duplicate id`);
  if (!/^<!doctype html>/i.test(html.trimStart())) errors.push(`site/${name}: missing doctype`);
  if (!/<html\b[^>]*lang=["'][^"']+["']/i.test(html)) errors.push(`site/${name}: missing language`);
  if (!/<meta\b[^>]*name=["']viewport["']/i.test(html)) errors.push(`site/${name}: missing viewport`);
  if (!/<title>[^<]+<\/title>/i.test(html)) errors.push(`site/${name}: missing title`);
  if (!/<main\b[^>]*id=["']main["']/i.test(html)) errors.push(`site/${name}: missing main landmark`);
  if (!/<h1\b/i.test(html)) errors.push(`site/${name}: missing h1`);
  const skipTarget = name === "404.html" ? "404.html#main" : "#main";
  if (!new RegExp(`<a\\b[^>]*class=["'][^"']*skip-link[^"']*["'][^>]*href=["']${skipTarget.replace(".", "\\.")}["']`, "i").test(html)) errors.push(`site/${name}: incorrect skip link`);
  const headerNav = html.match(/<nav\b[^>]*aria-label=["']Primary navigation["'][^>]*>([\s\S]*?)<\/nav>/i)?.[1] ?? "";
  const footerNav = html.match(/<nav\b[^>]*aria-label=["']Footer navigation["'][^>]*>([\s\S]*?)<\/nav>/i)?.[1] ?? "";
  checkContract(`site/${name}`, "primary navigation", anchors(headerNav));
  checkContract(`site/${name}`, "footer navigation", anchors(footerNav));
  if (!/href="licence.html"/.test(html)) errors.push(`site/${name}: licence link is missing`);
  if (name !== "licence.html" && /not affiliated with or endorsed|third-party names identify lineage/i.test(html)) errors.push(`site/${name}: notices belong on the licence page`);
  for (const tag of html.matchAll(/<img\b[^>]*>/gi)) if (!/\balt=["'][^"']*["']/i.test(tag[0])) errors.push(`site/${name}: image lacks alt text`);

  if (name === "404.html") {
    if (!html.includes(`<base href="${baseUrl}">`)) errors.push("site/404.html: project-site base is missing");
    if (!/name=["']robots["'][^>]*noindex/i.test(html)) errors.push("site/404.html: noindex is missing");
  } else {
    for (const key of ["description", "twitter:card", "twitter:image", "twitter:image:alt"]) if (!new RegExp(`name=["']${key.replace(":", "\\:")}["']`, "i").test(html)) errors.push(`site/${name}: missing ${key}`);
    for (const key of ["og:title", "og:description", "og:url", "og:image", "og:image:alt"]) if (!new RegExp(`property=["']${key.replace(":", "\\:")}["']`, "i").test(html)) errors.push(`site/${name}: missing ${key}`);
    const canonical = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1];
    const ogUrl = html.match(/property=["']og:url["'][^>]*content=["']([^"']+)["']/i)?.[1];
    if (canonical !== canonicals.get(name) || ogUrl !== canonicals.get(name)) errors.push(`site/${name}: canonical and og:url must match the project Pages URL`);
    const imageUrl = `${baseUrl}assets/og-card.png`;
    if (!html.includes(`content="${imageUrl}"`)) errors.push(`site/${name}: canonical social image is missing`);
  }
  for (const [pattern, label] of [[/\b(?:engineering|source-first) preview\b/i,"preview copy"],[/prerecorded playback/i,"prerecorded-playback copy"],[/PreceptorOfMagic\.github\.io(?!\/Eclipse-Umbra-Project-Hub)/i,"old hub URL"],[/github\.com\/PreceptorOfMagic\/(?:eclipse|umbra)(?:[\/#"'])/,"lowercase repository URL"]]) {
    if (pattern.test(html)) errors.push(`site/${name}: contains ${label}`);
  }
  if (name !== "credits.html" && /CTM-USBIP|CTM_USBIP|PreceptorOfMagic\/CTM-USBIP/i.test(html)) errors.push(`site/${name}: CTM must only appear on Acknowledgements`);
}

let localReferences = 0;
for (const [file, html] of htmlByFile) {
  for (const match of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
    const reference = match[1];
    if (/^(?:https?:|mailto:)/i.test(reference) || reference.startsWith("//")) continue;
    if (reference.startsWith("/")) { errors.push(`${path.basename(file)}: root-relative reference breaks project Pages: ${reference}`); continue; }
    localReferences += 1;
    const [beforeHash, hash] = reference.split("#", 2);
    const cleanPath = beforeHash.split("?", 1)[0];
    let target = cleanPath ? path.resolve(path.dirname(file), decodeURIComponent(cleanPath)) : file;
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, "index.html");
    if (target !== siteRoot && !target.startsWith(`${siteRoot}${path.sep}`)) { errors.push(`${path.basename(file)}: reference escapes site: ${reference}`); continue; }
    if (!fs.existsSync(target)) { errors.push(`${path.basename(file)}: broken local reference: ${reference}`); continue; }
    if (hash && target.endsWith(".html") && !idsByFile.get(target)?.has(decodeURIComponent(hash))) errors.push(`${path.basename(file)}: missing fragment: ${reference}`);
  }
}

if (errors.length) { console.error("Public-site check failed:"); errors.forEach((error) => console.error(`- ${error}`)); process.exit(1); }
console.log(`Public-site check passed: ${htmlFiles.length} HTML pages and ${localReferences} local references.`);

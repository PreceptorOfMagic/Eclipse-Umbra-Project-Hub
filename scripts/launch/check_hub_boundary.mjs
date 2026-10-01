#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..", "..");
const errors = [];
const allowedRootDirectories = new Set([".github", "docs", "scripts", "site"]);
const allowedRootFiles = new Set([
  ".gitattributes",
  ".gitignore",
  "ACKNOWLEDGEMENTS.md",
  "CONTRIBUTING.md",
  "LICENSE.txt",
  "LICENSES.md",
  "README.md",
  "SUPPORT.md",
]);
const excludedDirectoryNames = new Set([".git", "node_modules"]);
const forbiddenDirectoryNames = new Set([
  ".idea",
  ".vs",
  ".vscode",
  "private-run-sheets",
  "raw-media",
  "recording-masters",
  "scratchpad",
]);
const forbiddenExtensions = new Set([
  ".7z",
  ".dll",
  ".drp",
  ".exe",
  ".h264",
  ".h265",
  ".hevc",
  ".ipk",
  ".log",
  ".mkv",
  ".mov",
  ".pcap",
  ".prproj",
  ".tar",
  ".wav",
  ".zip",
]);
const maximumFileBytes = 12 * 1024 * 1024;
const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".svg",
  ".txt",
  ".vtt",
  ".yaml",
  ".yml",
]);
const sensitiveTextPatterns = [
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i, "contains a private-key header"],
  [/\bghp_[A-Za-z0-9]{20,}\b/, "contains a GitHub personal-access-token pattern"],
  [/\bgithub_pat_[A-Za-z0-9_]{20,}\b/, "contains a GitHub fine-grained-token pattern"],
  [/\bsk_(?:live|test)_[A-Za-z0-9]{16,}\b/, "contains a Stripe secret-key pattern"],
  [/\/home\/camer(?:\/|\b)/i, "contains the maintainer's local home path"],
  [/[A-Z]:\\Users\\camer(?:\\|\b)/i, "contains the maintainer's Windows home path"],
  [/\bprisoner@(?:\d{1,3}\.){3}\d{1,3}\b/i, "contains a private device login/address"],
];

function walk(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    const relative = path.relative(repositoryRoot, target);
    if (entry.isSymbolicLink()) {
      errors.push(`${relative}: symbolic links are not allowed in the clean hub`);
      continue;
    }
    if (entry.isDirectory()) {
      if (excludedDirectoryNames.has(entry.name)) continue;
      if (forbiddenDirectoryNames.has(entry.name)) {
        errors.push(`${relative}/: private or development-only directory is forbidden`);
        continue;
      }
      files.push(...walk(target));
      continue;
    }
    files.push(target);
  }
  return files;
}

for (const entry of fs.readdirSync(repositoryRoot, { withFileTypes: true })) {
  if (entry.name === ".git") continue;
  if (entry.isDirectory() && !allowedRootDirectories.has(entry.name)) {
    errors.push(`${entry.name}/: unexpected top-level directory`);
  }
  if (entry.isFile() && !allowedRootFiles.has(entry.name)) {
    errors.push(`${entry.name}: unexpected top-level file`);
  }
}

const files = walk(repositoryRoot);
let totalBytes = 0;
for (const file of files) {
  const relative = path.relative(repositoryRoot, file);
  const stat = fs.statSync(file);
  totalBytes += stat.size;
  if (stat.size > maximumFileBytes) {
    errors.push(`${relative}: ${stat.size} bytes exceeds the 12 MiB clean-hub file limit`);
  }

  const extension = path.extname(file).toLowerCase();
  if (forbiddenExtensions.has(extension)) {
    errors.push(`${relative}: raw capture, package, archive or editor-project files are forbidden`);
  }
  if ([".mp4", ".webm", ".webp"].includes(extension) && !relative.startsWith(`site${path.sep}media${path.sep}`)) {
    errors.push(`${relative}: delivery media must live in site/media and pass the media manifest`);
  }

  if (!textExtensions.has(extension) || stat.size > 2 * 1024 * 1024 || relative.endsWith(".test.mjs")) continue;
  const text = fs.readFileSync(file, "utf8");
  for (const [pattern, message] of sensitiveTextPatterns) {
    if (pattern.test(text)) errors.push(`${relative}: ${message}`);
  }
}

if (errors.length > 0) {
  console.error("Clean-hub boundary check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Clean-hub boundary check passed: ${files.length} files, ${totalBytes} bytes, no private/source-history surfaces found.`);

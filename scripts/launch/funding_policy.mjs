import fs from "node:fs";
import path from "node:path";

export function validateFundingPolicy({ repositoryRoot, siteRoot = path.join(repositoryRoot, "site") }) {
  const errors = [];
  const funding = fs.readFileSync(path.join(repositoryRoot, ".github", "FUNDING.yml"), "utf8");
  const active = funding.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith("#"));
  let username = null;
  if (active.length !== 1) errors.push(".github/FUNDING.yml: Buy Me a Coffee must be the sole active funding entry");
  const match = active[0]?.match(/^buy_me_a_coffee:\s*([A-Za-z0-9][A-Za-z0-9._-]*)$/);
  if (!match) errors.push(".github/FUNDING.yml: expected one valid buy_me_a_coffee username");
  else username = match[1];

  const htmlFiles = fs.readdirSync(siteRoot).filter((name) => name.endsWith(".html"));
  for (const name of htmlFiles) {
    const html = fs.readFileSync(path.join(siteRoot, name), "utf8");
    const scripts = [...html.matchAll(/<script\b([^>]*)><\/script>/gi)].filter((entry) => /buymeacoffee/i.test(entry[1]));
    if (scripts.length !== 1) { errors.push(`site/${name}: expected exactly one Buy Me a Coffee button script in the shared header`); continue; }
    const attrs = scripts[0][1];
    const expected = new Map([
      ["src", "https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js"], ["data-name", "bmc-button"],
      ["data-slug", username], ["data-color", "#BD5FFF"], ["data-text", "Buy me a coffee"],
      ["data-outline-color", "#000000"], ["data-font-color", "#ffffff"], ["data-coffee-color", "#FFDD00"],
    ]);
    for (const [attribute, value] of expected) {
      const actual = attrs.match(new RegExp(`\\b${attribute}=["']([^"']*)["']`, "i"))?.[1];
      if (actual !== value) errors.push(`site/${name}: Buy Me a Coffee ${attribute} must be ${value}`);
    }
    const withoutScript = html.replace(scripts[0][0], "");
    if (/buy\s*me\s*a\s*coffee|buymeacoffee\.com/i.test(withoutScript)) errors.push(`site/${name}: funding copy must be limited to the button itself`);
  }

  if (username) {
    const canonical = `https://buymeacoffee.com/${username}`.toLowerCase();
    const supportPolicy = fs.readFileSync(path.join(repositoryRoot, "SUPPORT.md"), "utf8").toLowerCase();
    if (!supportPolicy.includes(canonical)) errors.push("SUPPORT.md: Buy Me a Coffee destination does not match FUNDING.yml");
  }
  return { errors, mode: username ? "enabled" : "disabled", username };
}

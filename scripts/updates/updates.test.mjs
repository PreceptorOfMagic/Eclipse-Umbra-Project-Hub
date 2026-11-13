import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { addRelease, defaultFile, setNotify, validate } from "./updates.mjs";

test("the published file is valid", () => {
  assert.deepEqual(validate(JSON.parse(fs.readFileSync(defaultFile, "utf8"))), []);
});

test("add announces by default and --silent does not", () => {
  const doc = { schema: 1, eclipse: { releases: [] } };
  addRelease(doc, { product: "eclipse", version: "1.3.7", date: "2026-11-20", highlight: ["A"] });
  addRelease(doc, { product: "eclipse", version: "1.3.8", silent: true, platforms: "windows", highlight: [] });
  assert.equal(doc.eclipse.releases[0].version, "1.3.8");
  assert.equal(doc.eclipse.releases[0].notify, false);
  assert.deepEqual(doc.eclipse.releases[0].platforms, ["windows"]);
  assert.equal(doc.eclipse.releases[1].notify, undefined);
  assert.deepEqual(validate(doc), []);
});

test("notify on/off toggles the notice", () => {
  const doc = { schema: 1, eclipse: { releases: [{ version: "1.3.7", highlights: [] }] } };
  setNotify(doc, "eclipse", "1.3.7", false);
  assert.equal(doc.eclipse.releases[0].notify, false);
  setNotify(doc, "eclipse", "1.3.7", true);
  assert.equal(doc.eclipse.releases[0].notify, undefined);
  assert.throws(() => setNotify(doc, "eclipse", "9.9.9", true));
});

test("validation catches what clients cannot use", () => {
  const bad = {
    schema: 2,
    eclipse: {
      releases: [
        { version: "1.3.7", platforms: ["ps5"], highlights: ["x".repeat(200)] },
        { version: "1.3.7", notify: "no" },
      ],
    },
    other: {},
  };
  const errors = validate(bad).join("\n");
  assert.match(errors, /schema must be 1/);
  assert.match(errors, /unknown ps5/);
  assert.match(errors, /over 160/);
  assert.match(errors, /notify: not true\/false/);
  assert.match(errors, /other: unknown product/);
});

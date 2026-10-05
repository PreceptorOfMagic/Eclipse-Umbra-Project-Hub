import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { openDisclosureTarget } from '../../site/assets/disclosures.mjs';

test('deep links open the target and all containing disclosures', () => {
  const outer = { tagName: 'DETAILS', open: false, parentElement: null };
  const inner = { tagName: 'DETAILS', open: false, parentElement: outer };
  const target = { tagName: 'H3', parentElement: inner };
  const doc = { getElementById: id => id === 'pane detail' ? target : null };
  assert.equal(openDisclosureTarget(doc, '#pane%20detail'), target);
  assert.equal(inner.open, true);
  assert.equal(outer.open, true);
});

test('a link to a details element opens it without closing other content', () => {
  const target = { tagName: 'DETAILS', open: false, parentElement: null };
  assert.equal(openDisclosureTarget({ getElementById: () => target }, '#composition'), target);
  assert.equal(target.open, true);
});

test('missing, malformed and ordinary section fragments are harmless', () => {
  const doc = { getElementById: id => id === 'section' ? { tagName: 'SECTION', parentElement: null } : null };
  for (const hash of ['', '#', '#missing', '#%ZZ', '#section']) assert.equal(openDisclosureTarget(doc, hash), null);
});

for (const [page, count] of [['index.html', 6], ['development.html', 18]]) {
  test(`${page} uses labelled native disclosures, closed until chosen`, () => {
    const html = fs.readFileSync(new URL(`../../site/${page}`, import.meta.url), 'utf8');
    const details = [...html.matchAll(/<details\b([^>]*)>([\s\S]*?)<\/details>/g)];
    assert.equal(details.length, count);
    for (const [, attrs, body] of details) {
      assert.match(attrs, /\bid="[^"]+"/);
      assert.doesNotMatch(attrs, /\bopen\b/);
      assert.match(body, /^\s*<summary><span class="disclosure-title">[^<]+<\/span><span class="disclosure-hint">[^<]+<\/span><\/summary>/);
    }
    assert.match(html, /src="assets\/disclosures.mjs"/);
  });
}

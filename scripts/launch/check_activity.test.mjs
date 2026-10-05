import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderActivity, renderActivityMarkdown } from './activity_summary.mjs';

const snapshot = JSON.parse(fs.readFileSync(new URL('../../site/assets/development-activity.json', import.meta.url), 'utf8'));
const html = fs.readFileSync(new URL('../../site/development.html', import.meta.url), 'utf8');
const markdown = fs.readFileSync(new URL('../../docs/development.md', import.meta.url), 'utf8');

test('snapshot is a fixed, aggregate-only record with an explicit scope', () => {
  assert.equal(snapshot.schemaVersion, 1);
  assert.equal(snapshot.timezone, 'Australia/Brisbane');
  assert.match(snapshot.asOf, /^\d{4}-\d\d-\d\dT[\d:.]+Z$/);
  assert.match(snapshot.scope, /overlapping/);
  assert.deepEqual(Object.keys(snapshot).sort(), ['asOf', 'coverage', 'schemaVersion', 'scope', 'timezone', 'windows']);
  assert.equal(snapshot.windows.length, 5);
  assert.equal(new Set(snapshot.windows.map(window => window.id)).size, 5);
  assert.doesNotMatch(JSON.stringify(snapshot), /response_id|session_id|message_id|promptText|\/home\/|msg_[a-z0-9]|resp_[a-z0-9]/i);
});

for (const window of snapshot.windows) {
  test(`${window.id}: counts reconcile and missing tokens are not zero`, () => {
    assert.equal(window.prompts, Object.values(window.promptSources).reduce((a, b) => a + b, 0));
    assert.ok(Number.isSafeInteger(window.prompts) && window.prompts >= 0);
    assert.ok(window.from <= window.to);
    if (window.tokens === null) {
      assert.equal(window.models.length, 0);
      assert.equal(window.recordedUsageDates, null);
      assert.match(renderActivity(window), /Not retained/);
    } else {
      const { total, ...parts } = window.tokens;
      assert.equal(total, Object.values(parts).reduce((a, b) => a + b, 0));
      assert.ok(Object.values(window.tokens).every(value => Number.isSafeInteger(value) && value >= 0));
      assert.ok(window.models.length > 0);
      assert.ok(window.recordedUsageDates.first >= window.from);
      assert.ok(window.recordedUsageDates.last <= window.to);
    }
  });
  test(`${window.id}: site and GitHub guide match the reviewed snapshot`, () => {
    for (const [text, render] of [[html, renderActivity], [markdown, renderActivityMarkdown]]) {
      const start = `<!-- activity:${window.id}:start -->`;
      const end = `<!-- activity:${window.id}:end -->`;
      assert.equal(text.split(start).length, 2);
      assert.equal(text.split(end).length, 2);
      assert.equal(text.split(start)[1].split(end)[0].trim(), render(window).trim());
    }
  });
}

test('both guides explain cache inclusion, overlaps and missing coverage', () => {
  for (const text of [html, markdown]) {
    assert.match(text, /activity-method/);
    assert.match(text, /must not be added together/);
    assert.match(text, /not billions of unique words/);
    assert.match(text, /not a billing total/);
    assert.match(text, /not retained/i);
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderActivity, renderActivityMarkdown } from './activity_summary.mjs';

const snapshot = JSON.parse(fs.readFileSync(new URL('../../site/assets/development-activity.json', import.meta.url), 'utf8'));
const html = fs.readFileSync(new URL('../../site/index.html', import.meta.url), 'utf8');
const markdown = fs.readFileSync(new URL('../../README.md', import.meta.url), 'utf8');

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
    assert.equal(typeof window.recordsIncomplete, 'boolean');
    assert.equal(window.prompts, Object.values(window.promptSources).reduce((a, b) => a + b, 0));
    assert.ok(Number.isSafeInteger(window.prompts) && window.prompts >= 0);
    assert.ok(window.from <= window.to);
    if (window.tokens === null) {
      assert.equal(window.models.length, 0);
      assert.equal(window.recordedUsageDates, null);
      assert.equal(window.recordsIncomplete, true);
      assert.match(renderActivity(window), /Not available/);
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

for (const window of snapshot.windows) {
  test(`${window.id}: card sits at the end of its section and flags deleted records only where true`, () => {
    const end = `<!-- activity:${window.id}:end -->`;
    assert.match(html.split(end)[1], /^\s*<\/div><\/details>/);
    assert.match(markdown.split(end)[1], /^\s*<\/details>/);
    assert.match(html.split(`id="${window.id}"`)[1].split(end)[0], /<h3>/);
    for (const render of [renderActivity, renderActivityMarkdown]) {
      assert.equal(/some records from this period were deleted/.test(render(window)), window.recordsIncomplete);
    }
  });
}

test('the page carries the statistics only, without recovery notes', () => {
  for (const text of [html, markdown]) {
    assert.doesNotMatch(text, /activity-method|About the numbers|activity-breakdown|activity-scope/);
    assert.doesNotMatch(text, /recovered transcripts|prompt journal|log cleanup|disk block/i);
  }
});

test('the development guide carries the detailed history without activity cards', () => {
  for (const file of ['../../site/development.html', '../../docs/development.md']) {
    const text = fs.readFileSync(new URL(file, import.meta.url), 'utf8');
    assert.match(text, /detailed-history/);
    for (const window of snapshot.windows) assert.match(text, new RegExp(`detail-${window.id.replace('history-', '')}`));
    assert.doesNotMatch(text, /activity-card|<!-- activity:/);
  }
});

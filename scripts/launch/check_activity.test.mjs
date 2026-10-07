import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderActivity, renderActivityMarkdown, renderActivityDetail, renderActivityDetailMarkdown } from './activity_summary.mjs';

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

const devHtml = fs.readFileSync(new URL('../../site/development.html', import.meta.url), 'utf8');
const devMarkdown = fs.readFileSync(new URL('../../docs/development.md', import.meta.url), 'utf8');

for (const window of snapshot.windows) {
  test(`${window.id}: weeks cover the window exactly and add up to its totals`, () => {
    assert.ok(window.weeks.length > 0);
    assert.equal(window.weeks[0].from >= window.from, true);
    assert.equal(window.weeks.at(-1).to <= window.to, true);
    for (const [i, week] of window.weeks.entries()) {
      assert.ok(week.from <= week.to);
      if (i > 0) assert.ok(week.from > window.weeks[i - 1].to);
      assert.ok(Number.isSafeInteger(week.prompts) && Number.isSafeInteger(week.tokens) && week.tokens >= 0);
      assert.equal(typeof week.recordsIncomplete, 'boolean');
      assert.ok(week.models.every(model => window.models.includes(model)));
    }
    assert.equal(window.weeks.reduce((a, w) => a + w.prompts, 0), window.prompts);
    assert.equal(window.weeks.reduce((a, w) => a + w.tokens, 0), window.tokens.total);
    assert.equal(window.weeks.some(w => w.recordsIncomplete), window.recordsIncomplete);
    assert.deepEqual([...new Set(window.weeks.flatMap(w => w.models))].sort(), window.models);
  });
  test(`${window.id}: the detailed history carries the same totals, week by week, at the end of its era`, () => {
    const start = `<!-- activity-detail:${window.id}:start -->`;
    const end = `<!-- activity-detail:${window.id}:end -->`;
    for (const [text, render, close] of [[devHtml, renderActivityDetail, /^\s*<\/div><\/details>/], [devMarkdown, renderActivityDetailMarkdown, /^\s*<\/details>/]]) {
      assert.equal(text.split(start).length, 2);
      assert.equal(text.split(start)[1].split(end)[0].trim(), render(window).trim());
      assert.match(text.split(end)[1], close);
      assert.equal(/some records from this period were deleted/.test(render(window)), window.recordsIncomplete);
    }
    assert.match(devHtml.split(`id="detail-${window.id.replace('history-', '')}"`)[1].split(end)[0], /<h3>/);
    assert.match(renderActivityDetail(window), new RegExp(`<dd>${window.tokens.total.toLocaleString('en-AU')}</dd>`));
  });
}

test('the detailed history carries the statistics only, without recovery notes', () => {
  for (const text of [devHtml, devMarkdown]) {
    assert.match(text, /detailed-history/);
    assert.doesNotMatch(text, /activity-method|About the numbers|activity-breakdown|activity-scope/);
    assert.doesNotMatch(text, /recovered transcripts|prompt journal|log cleanup|disk block/i);
  }
});

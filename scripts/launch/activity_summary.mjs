// Static presentation of a reviewed aggregate snapshot. Never reads private logs.
const number = value => value.toLocaleString('en-AU');
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

export function renderActivity(window) {
  const tokens = window.tokens;
  const modelText = window.models.length
    ? window.models.map(model => `<code>${escape(model)}</code>`).join(' · ')
    : 'Claude prompt journal retained; model records not retained.';
  return `<aside class="activity-card" aria-label="Recorded AI activity for ${escape(window.label)}">
  <p class="activity-kicker">Behind the build · ${escape(window.label)}</p>
  <dl class="activity-numbers"><div><dt>Recorded user prompts</dt><dd>${number(window.prompts)}<small>human messages · partial coverage</small></dd></div><div><dt>Tokens processed</dt><dd>${tokens ? number(tokens.total) : 'Not retained'}<small>${tokens ? 'includes cached context and agent work' : 'missing records, not zero work'}</small></dd></div></dl>
  <p class="activity-models"><strong>Recorded models</strong><br>${modelText}</p>
  ${tokens ? `<p class="activity-breakdown">${number(tokens.cacheRead)} cached-input tokens · ${number(tokens.total - tokens.cacheRead)} other input/output tokens. Usage records in this window span ${escape(window.recordedUsageDates.first)} to ${escape(window.recordedUsageDates.last)}; coverage is incomplete.</p>` : ''}
  <p class="activity-scope">Project activity in this date window, not an exclusive total for these milestones. Windows overlap. <a href="#activity-method">How these figures are counted</a>.</p>
</aside>`.replace(/[ \t]+\n/g, '\n');
}

export function renderActivityMarkdown(window) {
  return `**Behind the build · ${window.label}**\n\n` +
    `- **Recorded user prompts:** ${number(window.prompts)} human messages (partial coverage).\n` +
    `- **Tokens processed:** ${window.tokens ? number(window.tokens.total) + ', including cached context and agent work.' : 'Not retained—not zero work.'}\n` +
    `- **Recorded models:** ${window.models.length ? window.models.map(model => '\x60' + model + '\x60').join(', ') : 'Claude prompt journal retained; model records not retained.'}\n\n` +
    (window.tokens ? `${number(window.tokens.cacheRead)} cached-input tokens; ${number(window.tokens.total - window.tokens.cacheRead)} other input/output tokens. Usage records span ${window.recordedUsageDates.first} to ${window.recordedUsageDates.last}; coverage is incomplete.\n\n` : '') +
    `Project activity in this date window, not an exclusive total for these milestones. Windows overlap. [How these figures are counted](#activity-method).`;
}

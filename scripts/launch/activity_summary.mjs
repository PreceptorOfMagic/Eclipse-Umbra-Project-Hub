// Static presentation of a reviewed aggregate snapshot. Never reads private logs.
const number = value => value.toLocaleString('en-AU');
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const INCOMPLETE = 'These numbers are incomplete because some records from this period were deleted.';

export function renderActivity(window) {
  const modelText = window.models.length
    ? window.models.map(model => `<code>${escape(model)}</code>`).join(' · ')
    : 'Not available';
  return `<aside class="activity-card" aria-label="AI activity for ${escape(window.label)}">
  <p class="activity-kicker">Behind the build · ${escape(window.label)}</p>
  <dl class="activity-numbers"><div><dt>User prompts</dt><dd>${number(window.prompts)}</dd></div><div><dt>Tokens processed</dt><dd>${window.tokens ? number(window.tokens.total) : 'Not available'}</dd></div></dl>
  <p class="activity-models"><strong>Models</strong><br>${modelText}</p>
  ${window.recordsIncomplete ? `<p class="activity-note">${INCOMPLETE}</p>` : ''}
</aside>`.replace(/\n\s*\n/g, '\n');
}

export function renderActivityMarkdown(window) {
  return `**Behind the build · ${window.label}**\n\n` +
    `- **User prompts:** ${number(window.prompts)}\n` +
    `- **Tokens processed:** ${window.tokens ? number(window.tokens.total) : 'Not available'}\n` +
    `- **Models:** ${window.models.length ? window.models.map(model => '\x60' + model + '\x60').join(', ') : 'Not available'}` +
    (window.recordsIncomplete ? `\n\n${INCOMPLETE}` : '');
}

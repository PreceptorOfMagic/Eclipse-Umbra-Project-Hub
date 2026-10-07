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

// The detailed history's card: the same totals, then week by week (Monday-start weeks clipped to the window).
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export function weekLabel(week) {
  const [, am, ad] = week.from.split('-').map(Number);
  const [, bm, bd] = week.to.split('-').map(Number);
  if (week.from === week.to) return `${ad} ${MONTHS[am - 1]}`;
  return am === bm ? `${ad}–${bd} ${MONTHS[bm - 1]}` : `${ad} ${MONTHS[am - 1]}–${bd} ${MONTHS[bm - 1]}`;
}
const WEEK_NOTE = 'Weeks marked † are incomplete because some records from this period were deleted.';

export function renderActivityDetail(window) {
  const rows = window.weeks.map(week => `<li><span class="activity-week">${escape(weekLabel(week))}${week.recordsIncomplete ? ' †' : ''}</span>` +
    `<span class="activity-week-n"><strong>${number(week.prompts)}</strong> prompts</span>` +
    `<span class="activity-week-n"><strong>${number(week.tokens)}</strong> tokens</span>` +
    `<span class="activity-week-models">${week.models.map(model => `<code>${escape(model)}</code>`).join(' · ')}</span></li>`).join('\n  ');
  return `<aside class="activity-card" aria-label="AI activity for ${escape(window.label)}">
  <p class="activity-kicker">Behind the build · ${escape(window.label)}</p>
  <dl class="activity-numbers"><div><dt>User prompts</dt><dd>${number(window.prompts)}</dd></div><div><dt>Tokens processed</dt><dd>${number(window.tokens.total)}</dd></div></dl>
  <p class="activity-models"><strong>Models</strong><br>${window.models.map(model => `<code>${escape(model)}</code>`).join(' · ')}</p>
  <p class="activity-weeks-title">Week by week</p>
  <ol class="activity-weeks">
  ${rows}
  </ol>
  ${window.recordsIncomplete ? `<p class="activity-note">${WEEK_NOTE}</p>` : ''}
</aside>`.replace(/\n\s*\n/g, '\n');
}

export function renderActivityDetailMarkdown(window) {
  return `**Behind the build · ${window.label}**\n\n` +
    `- **User prompts:** ${number(window.prompts)}\n` +
    `- **Tokens processed:** ${number(window.tokens.total)}\n` +
    `- **Models:** ${window.models.map(model => '\x60' + model + '\x60').join(', ')}\n\n` +
    `| Week | User prompts | Tokens processed | Models |\n|---|---:|---:|---|\n` +
    window.weeks.map(week => `| ${weekLabel(week)}${week.recordsIncomplete ? ' †' : ''} | ${number(week.prompts)} | ${number(week.tokens)} | ` +
      `${week.models.map(model => '\x60' + model + '\x60').join(', ')} |`).join('\n') +
    (window.recordsIncomplete ? `\n\n${WEEK_NOTE}` : '');
}

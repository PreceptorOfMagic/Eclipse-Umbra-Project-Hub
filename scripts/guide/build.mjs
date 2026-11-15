import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const data=JSON.parse(fs.readFileSync(path.join(root,'docs/site/release-data.json'),'utf8'));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const rel=data.release;
const releases={eclipse:`https://github.com/PreceptorOfMagic/Eclipse/releases/tag/eclipse-v${rel.eclipse}`,windows:`https://github.com/PreceptorOfMagic/Umbra/releases/tag/umbra-v${rel.windows}`,linux:`https://github.com/PreceptorOfMagic/Umbra/releases/tag/umbra-linux-v${rel.linux}`};
const title=`Eclipse ${rel.eclipse} · Umbra ${rel.windows} Windows / ${rel.linux} Linux`;
const releaseHtml=`<aside class="release-strip" id="release" aria-label="Latest release"><span class="release-tag">NEW · ${esc(rel.date)}</span><p><strong>${esc(title)}</strong></p><p>${esc(rel.summary)}</p><a href="${releases.eclipse}">What’s new in ${rel.eclipse} <span aria-hidden="true">↗</span></a></aside>`;
const releaseMd=n=>`## Latest release · ${rel.date}\n\n**${title}**\n\n${rel.summary}\n\n[Choose your setup](https://preceptorofmagic.github.io/Eclipse-Umbra-Project-Hub/setup.html#choose-setup) · [Co-op with this PC](${n==='README.md'?'docs/':''}installation.md#coop-this-pc) · [Eclipse release notes](${releases.eclipse}) · [Umbra Windows](${releases.windows}) · [Umbra Linux](${releases.linux})`;

function icon(mode){
 const screen='<rect x="7" y="10" width="50" height="30" rx="4"/><path d="M24 47h16M32 40v7"/>';
 return `<svg viewBox="0 0 64 56" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">${screen}${mode==='single'?'<path d="M18 25h28m-6-6 6 6-6 6"/>':`<path d="M32 11v28"/><circle cx="21" cy="25" r="4"/><${mode==='local'?'rect x="39" y="21" width="8" height="8" rx="1"':'circle cx="43" cy="25" r="4"'}/>`}</svg>`;
}
function chooser(){return `<section class="section setup-chooser" id="choose-setup"><div class="shell"><div class="section-head"><p class="eyebrow">Start here</p><h2>How do you want to play?</h2><p class="section-lede">Choose the setup you want. We’ll show the apps, downloads and steps for it.</p></div><form class="guide-form"><fieldset class="mode-options"><legend class="guide-sr">Choose your setup</legend>${[['single','Stream one PC','Your gaming PC → a TV or another computer.'],['remote','Two PCs on one screen','Two gaming PCs → one TV or separate client.'],['local','Play on one of the gaming PCs','This PC runs your half. Only the other PC is streamed.']].map(([value,label,desc],i)=>`<label class="mode-card"><input type="radio" name="setup-mode" value="${value}" ${i===0?'checked':''}>${icon(value)}<span class="mode-title">${label}</span><span class="mode-copy">${desc}</span>${value==='local'?'<span class="mode-new">NEW IN 1.3.7</span>':''}</label>`).join('')}</fieldset><div class="guide-selects"><label>Where will you play?<select name="client"><option value="webos">LG webOS TV</option><option value="shield">NVIDIA SHIELD TV</option><option value="windows">Windows PC</option><option value="linux">Linux PC</option></select></label><label><span data-host-label>Your gaming PC runs</span><select name="host"><option value="windows">Windows</option><option value="linux">Linux</option><option value="mixed" hidden>Windows and Linux</option></select></label></div></form><div class="guide-result" aria-live="polite" aria-atomic="false"></div><noscript><p>Install <a href="setup.html#umbra-windows">Umbra for Windows</a> or <a href="setup.html#umbra-linux">Umbra for Linux</a> on each gaming PC, then choose <a href="eclipse.html#downloads">Eclipse for your display</a>. Read <a href="setup.html#pairing">pairing</a> or <a href="setup.html#coop-this-pc">co-op with this PC</a>.</p></noscript><script type="application/json" class="guide-data">${JSON.stringify({release:rel,releases}).replaceAll('<','\\u003c')}</script></div></section>`;}
function hdrCell(x){
 if(!x.available) return `<td><div class="extra-unavailable"><span class="availability-label">Not available in ${esc(rel.linux)}</span><p>${esc(x.metadata.replace(/^Not available in [^:]+:\s*/,''))}</p></div></td>`;
 return `<td><div class="download-control" data-download="${x.key}"><a class="button-secondary" data-download-link href="${releases.linux}">Open the release</a><p data-download-status aria-live="polite"><code>${x.filename}</code></p></div><p class="extra-meta">${esc(x.metadata)}</p></td>`;
}
function hdrTable(){let rows='';for(const target of new Set(data.hdrExtras.map(x=>x.target))){const cells=data.hdrExtras.filter(x=>x.target===target);rows+=`<tr><th scope="row">${esc(cells[0].distribution)}</th>${cells.map(hdrCell).join('')}</tr>`;}return `<table class="status-table extra-table"><caption>HDR extras in Umbra ${rel.linux} for Linux — choose your distribution and desktop</caption><thead><tr><th scope="col">Distribution</th><th scope="col">KDE Plasma (KWin)</th><th scope="col">GNOME (Mutter)</th></tr></thead><tbody>${rows}</tbody></table>`;}
function hdrRows(){return [...new Set(data.hdrExtras.map(x=>x.target))].map(target=>{const cells=data.hdrExtras.filter(x=>x.target===target);return '| '+cells[0].distribution+' | '+cells.map(x=>{if(!x.available)return x.metadata;const url=`https://github.com/PreceptorOfMagic/Umbra/releases/download/umbra-linux-v${rel.linux}/${x.filename}`;return `[${x.filename}](${url}) ([checksum](${url}.sha256)) — ${x.metadata}`;}).join(' | ')+' |';}).join('\n');}
function localHtml(){return `<h3 id="coop-this-pc">Co-op with this PC as one of the two</h3>${data.localCoop.slice(0,5).map(p=>`<p>${esc(p)}</p>`).join('')}<details class="disclosure disclosure-wide" id="local-coop-limits"><summary><span class="disclosure-title">Known limitations and test coverage</span><span class="disclosure-hint">GNOME, controllers and desktop versions</span></summary>${data.localCoop.slice(5).map(p=>`<p>${esc(p)}</p>`).join('')}</details>`;}
const jobs={
 'site/index.html':{'release':releaseHtml,'chooser':chooser()},
 'site/eclipse.html':{'release':`<div class="shell release-page">${releaseHtml}</div>`},
 'site/umbra.html':{'release':`<div class="shell release-page">${releaseHtml}</div>`},
 'README.md':{'release':releaseMd('README.md')},
 'docs/eclipse.md':{'release':releaseMd('docs/eclipse.md')},
 'docs/umbra.md':{'release':releaseMd('docs/umbra.md')},
 'site/setup.html':{'chooser':chooser(),'hdr-table':hdrTable(),'local-coop':localHtml()},
 'docs/installation.md':{'hdr-rows':hdrRows(),'local-coop':'<a name="coop-this-pc"></a>\n\n### Co-op with this PC as one of the two\n\n'+data.localCoop.join('\n\n')},
};
let changed=0;
for(const [name,blocks] of Object.entries(jobs)){
 const target=path.join(root,name);let text=fs.readFileSync(target,'utf8');const original=text;
 for(const [key,body] of Object.entries(blocks)){
  const pattern=new RegExp(`(<!-- generated:${key}:start -->)[\\s\\S]*?(<!-- generated:${key}:end -->)`);
  if(!pattern.test(text))throw new Error(`Missing ${key} region in ${name}`);
  text=text.replace(pattern,(_,a,b)=>a+'\n'+body+'\n'+b);
 }
 if(text!==original){changed++;if(!process.argv.includes('--check'))fs.writeFileSync(target,text);else console.error('Out of date: '+name);}
}
if(process.argv.includes('--check')&&changed)process.exitCode=1;
else console.log(`Shared guide content ${process.argv.includes('--check')?'verified':'generated'} (${changed} changed files).`);

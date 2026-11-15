import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const site=path.join(root,'site');
const output=process.argv[2];
if(!output)throw new Error('Usage: node scripts/guide/export-preview.mjs <output.html>');
const publicBase='https://preceptorofmagic.github.io/Eclipse-Umbra-Project-Hub/';
const types={'.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.mp4':'video/mp4'};
function asset(url){
 if(/^(?:https?:|data:|#)/.test(url))return url;
 const file=path.join(site,url.split('?')[0]);
 if(!fs.existsSync(file))return new URL(url,publicBase).href;
 const ext=path.extname(file);
 if(ext==='.mp4'&&!url.includes('local-coop-startup'))return new URL(url,publicBase).href;
 if(!types[ext])return new URL(url,publicBase).href;
 return `data:${types[ext]};base64,${fs.readFileSync(file).toString('base64')}`;
}
const pages={};
for(const name of fs.readdirSync(site).filter(x=>x.endsWith('.html'))){
 let html=fs.readFileSync(path.join(site,name),'utf8');
 html=html.replace(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g,(tag,url)=>{
  if(!url.startsWith('assets/')||url.includes('count.mjs'))return '';
  const js=fs.readFileSync(path.join(site,url.split('?')[0]),'utf8');
  return `<script type="module">${js.replace(/<\/script/gi,'<\\/script')}</script>`;
 });
 html=html.replace(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g,(_,url)=>
  `<style>${fs.readFileSync(path.join(site,url.split('?')[0]),'utf8').replace(/url\(['"]?([^)'"\s]+)['"]?\)/g,(_,u)=>`url("${asset(path.posix.join(path.posix.dirname(url),u))}")`)}</style>`);
 html=html.replace(/\b(src|poster)="([^"<>]+)"/g,(all,key,url)=>`${key}="${asset(url)}"`);
 html=html.replace(/(<image\b[^>]*\bhref=")([^"]+)/g,(_,prefix,url)=>prefix+asset(url));
 html=html.replace(/<span class="support-control"[\s\S]*?<\/span>/,'<a class="text-link" href="https://www.buymeacoffee.com/PreceptorOfMagic">Support the project ↗</a>');
 html=html.replace('Visits are counted without cookies:', 'On the published site, visits are counted without cookies:');
 const key=name.slice(0,-5);
 html=html.replace('</body>',`<script>
 const pageKey=${JSON.stringify(key)};
 document.addEventListener('click',e=>{
  const a=e.target.closest('a[href]');
  if(!a||e.defaultPrevented||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||a.hasAttribute('download'))return;
  const href=a.getAttribute('href');
  const match=href.match(/^(?:(?:\\.\\/)?([a-z-]+)\\.html|\\.\\/)?(?:#(.*))?$/);
  if(!match)return;
  e.preventDefault();parent.postMessage({previewRoute:(match[1]||(href.startsWith('./')?'index':pageKey))+'/'+(match[2]||'')},'*');
 });
 addEventListener('message',e=>{
  if(e.source!==parent||typeof e.data?.previewAnchor!=='string')return;
  const target=document.getElementById(e.data.previewAnchor);
  if(target){for(let p=target;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;target.style.scrollMarginTop='10rem';target.scrollIntoView();}
  else scrollTo(0,0);
 });
 </script></body>`);
 pages[key]=html;
}
const payload=JSON.stringify(pages).replace(/</g,'\\u003c');
const result=`<!doctype html><html lang="en-AU"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Eclipse / Umbra — site review</title>
<style>html,body{margin:0;height:100%;background:#08070b;color:#d4bce7;font:12px system-ui}body{display:flex;flex-direction:column}.review-bar{padding:8px 16px;background:#20132c;border-bottom:1px solid #5a396d;display:flex;gap:14px;justify-content:space-between}.review-bar a{color:#eddaff}iframe{width:100%;flex:1;border:0;min-height:0}</style>
<div class="review-bar"><span>Local review · Eclipse 1.3.7 · Not published</span><a href="#eclipse/local-coop-demo">New mode walkthrough →</a></div>
<iframe title="Eclipse and Umbra website preview"></iframe><script>
const pages=${payload};const frame=document.querySelector('iframe');let current='';let anchor='';
function route(){let [page,...parts]=location.hash.slice(1).split('/');page=page||'index';if(!pages[page])page='index';anchor=decodeURIComponent(parts.join('/'));if(current!==page){current=page;frame.srcdoc=pages[page];}else frame.contentWindow.postMessage({previewAnchor:anchor},'*');}
frame.addEventListener('load',()=>frame.contentWindow.postMessage({previewAnchor:anchor},'*'));
addEventListener('message',e=>{if(e.source===frame.contentWindow&&typeof e.data?.previewRoute==='string'){const next='#'+e.data.previewRoute;if(location.hash===next)route();else location.hash=next;}});
addEventListener('hashchange',route);route();
</script></html>`;
fs.mkdirSync(path.dirname(path.resolve(output)),{recursive:true});fs.writeFileSync(output,result);
console.log(`Exported ${Object.keys(pages).length} pages to ${output} (${(Buffer.byteLength(result)/1024/1024).toFixed(1)} MB)`);

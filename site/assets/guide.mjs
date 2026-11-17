import {initialiseDownloads} from './downloads.mjs';
export function setupPlan(mode,client,host,release){
 const names={webos:'LG webOS TV',shield:'NVIDIA SHIELD TV',windows:'Windows PC',linux:'Linux PC'};
 if(!['single','remote','local'].includes(mode))mode='single';
 if(!names[client]||(mode==='local'&&!['windows','linux'].includes(client)))client=mode==='local'?'windows':'webos';
 if(!['windows','linux','mixed'].includes(host)||(mode!=='remote'&&host==='mixed'))host='windows';
 const operatingSystems=host==='mixed'?['windows','linux']:[host];
 if(mode==='local'&&!operatingSystems.includes(client))operatingSystems.unshift(client);
 const pairing=mode==='local'?'Keep Umbra running on this PC; it does not need to pair with itself. Pair the other PC with its PIN and check a Desktop stream.':'Pair Eclipse with '+(mode==='remote'?'each gaming PC':'your gaming PC')+': select the PC in Eclipse, then enter its PIN in Umbra. Check a Desktop stream first.';
 const steps=[`Install Umbra on ${mode==='single'?'the gaming PC':'both gaming PCs'} and open its local web interface to finish setup.`, `Install Eclipse ${release.eclipse} on your ${names[client]}.`,pairing];
 if(mode!=='single')steps.push('Open Co-op, choose the two PCs, pick side-by-side or stacked, and assign each controller to the PC it should control.');
 if(mode==='local')steps.push(client==='windows'?'Start co-op and read the administrator explanation. Approve the Windows prompt; then, if Eclipse lists apps holding a controller, choose Close and reopen.':'Start co-op and allow input capture (Share on GNOME, Allow on KDE). Approve the shortcut request when it first appears.');
 steps.push(mode==='single'?'Choose a game or Desktop and start streaming.':mode==='local'?'Both desktops appear. Your half runs directly on this PC; the other half is streamed. Move the mouse across the divider. Ctrl+Alt+Shift+Q ends the session.':'Both PCs appear on one screen. Launch the games on their respective desktops; each game keeps its own accounts and multiplayer requirements.');
 return {mode,client,host,operatingSystems,steps,title:mode==='single'?'One gaming PC. Play somewhere else.':mode==='remote'?'Two gaming PCs. One shared screen.':'Two gaming PCs. No separate client needed.',note:mode==='local'?(client==='linux'?'This mode requires GNOME or KDE Plasma on Wayland. Input capture is requested each session. Other desktops and X11 use the older self-streaming path.':'Use Umbra '+release.windows+' on this Windows PC for controller ownership. The Windows installer is per-user; the co-op session asks for administrator access separately.'):'Eclipse is the screen-side app. Umbra runs on each gaming PC. Use a wired home network where possible.'};
}
export function initGuides(root=document){
 for(const section of root.querySelectorAll('.setup-chooser')){
  if(section.dataset.ready)continue;section.dataset.ready='true';
  const data=JSON.parse(section.querySelector('.guide-data').textContent),form=section.querySelector('form'),client=form.elements.client,host=form.elements.host,result=section.querySelector('.guide-result');
  const labels={webos:'LG webOS TV',shield:'NVIDIA SHIELD TV',windows:'Windows x64',linux:'Linux x86_64'};
  const files={webos:`com.aurora.gamestream_${data.release.eclipse}_arm.ipk`,shield:'eclipse-android.apk',windows:'eclipse-windows-x64-setup-unsigned.exe',linux:`Eclipse-${data.release.eclipse}-linux-x86_64.flatpak`};
  const h=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
  function update(){
   const mode=form.elements['setup-mode'].value;
   for(const option of client.options){option.disabled=mode==='local'&&!['windows','linux'].includes(option.value);option.hidden=option.disabled;}
   if(client.selectedOptions[0].disabled)client.value='windows';
   const mixed=host.querySelector('[value="mixed"]');mixed.hidden=mode!=='remote';mixed.disabled=mode!=='remote';if(mode!=='remote'&&host.value==='mixed')host.value='windows';
   section.querySelector('[data-host-label]').textContent=mode==='single'?'Your gaming PC runs':mode==='local'?'The other gaming PC runs':'Your gaming PCs run';
   const plan=setupPlan(mode,client.value,host.value,data.release);
   const hostCards=plan.operatingSystems.map(os=>card(`Umbra ${data.release[os]} · ${labels[os]}`,`Install on ${mode==='local'&&os===client.value?'this PC'+(host.value===os?' and the other PC':''):'the gaming PC'+(mode==='remote'&&host.value!=='mixed'?'s':'')}.`,umbraPackage[os],data.releases[os],'Download Umbra',`setup.html#umbra-${os}`)).join('');
   const eclipseCard=card(`Eclipse ${data.release.eclipse} · ${labels[client.value]}`,`Install on ${mode==='local'?'this PC':'your '+labels[client.value]}: <code>${h(files[client.value])}</code>.`,eclipsePackage[client.value],data.releases.eclipse,'Download Eclipse',`setup.html#eclipse-${client.value}`);
   result.innerHTML=`<h3>${plan.title}</h3><p class="guide-result-intro">${mode==='local'?'Eclipse and Umbra on this PC. Umbra on the other.':'Umbra on the gaming '+(mode==='single'?'PC':'PCs')+'. Eclipse on your '+labels[client.value]+'.'}</p><div class="guide-downloads">${hostCards}${eclipseCard}</div><ol class="guide-steps">${plan.steps.map(step=>`<li>${h(step)}</li>`).join('')}</ol><p class="guide-note">${h(plan.note)} ${mode==='local'?'<a href="setup.html#local-coop-limits">Read known limitations and test coverage.</a>':''}</p>${mode==='local'?'<a class="text-link" href="eclipse.html#local-coop-demo">Watch the controller and startup walkthrough →</a>':''}`;
   initialiseDownloads(result,cachedFetch);
  }
  form.addEventListener('change',update);update();
 }
}
// Each download card is a download control (downloads.mjs): the button becomes the file itself once the release is read,
// with the release on GitHub linked underneath, like every other download button. Until then it opens the release page.
const umbraPackage={windows:'umbra-windows',linux:'umbra-linux'};
const eclipsePackage={webos:'webos',shield:'android',windows:'windows-setup',linux:'linux-flatpak'};
function card(title,note,platform,releasePage,label,steps){
 return `<div class="guide-download"><strong>${title}</strong><small>${note}</small><div class="download-control guide-control" data-download="${platform}"><a class="button-secondary" data-download-link href="${releasePage}">${label} ↗</a><p data-download-status aria-live="polite"></p></div><a class="guide-install" href="${steps}">Install steps</a></div>`;
}
// One GitHub lookup per release for the page's life: the chooser re-renders on every change, and GitHub limits lookups.
const lookups=new Map();
export function cachedFetch(url,options,fetcher=globalThis.fetch){
 if(!lookups.has(url))lookups.set(url,fetcher(url,options).then(async r=>({status:r.status,ok:r.ok,body:r.ok?await r.json():null})).catch(e=>{lookups.delete(url);throw e;}));
 return lookups.get(url).then(c=>({status:c.status,ok:c.ok,json:async()=>c.body}));
}
if(typeof document!=='undefined')initGuides();

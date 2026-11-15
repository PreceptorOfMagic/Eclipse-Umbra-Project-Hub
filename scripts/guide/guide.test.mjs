import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {setupPlan} from '../../site/assets/guide.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../../docs/site/release-data.json',import.meta.url),'utf8'));
test('a local co-op setup always installs Umbra on this PC and the other OS',()=>{
 for(const [client,host] of [['windows','linux'],['linux','windows']]){
  const p=setupPlan('local',client,host,data.release);
  assert.deepEqual(p.operatingSystems,[client,host]);
  assert.match(p.steps.join(' '),/does not need to pair with itself/);
 }
});
test('TVs cannot be selected for a local pane; one-PC mode cannot keep mixed hosts',()=>{
 assert.equal(setupPlan('local','webos','windows',data.release).client,'windows');
 assert.equal(setupPlan('single','shield','mixed',data.release).host,'windows');
});
test('remote co-op pairs both hosts; Linux local mode explains permission and desktop requirements',()=>{
 assert.match(setupPlan('remote','webos','mixed',data.release).steps.join(' '),/each gaming PC/);
 const linux=setupPlan('local','linux','linux',data.release);
 assert.deepEqual(linux.operatingSystems,['linux']);
 assert.match(linux.note,/Wayland/);assert.match(linux.steps.join(' '),/input capture/);
});
test('unavailable HDR packages have no clickable download control',()=>{
 const html=fs.readFileSync(new URL('../../site/setup.html',import.meta.url),'utf8');
 for(const extra of data.hdrExtras){
  assert.equal(html.includes(`data-download="${extra.key}"`),extra.available,extra.key);
 }
 assert.equal(data.hdrExtras.filter(x=>x.available).length,8);
});

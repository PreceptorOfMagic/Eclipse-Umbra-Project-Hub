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

test('the chooser looks each release up once, however often it re-renders', async () => {
  const { cachedFetch } = await import('../../site/assets/guide.mjs');
  let calls = 0;
  const fetcher = async () => { calls++; return { status: 200, ok: true, json: async () => ({ tag_name: 't' }) }; };
  const a = await cachedFetch('https://api.example/r1', {}, fetcher), b = await cachedFetch('https://api.example/r1', {}, fetcher);
  assert.equal(calls, 1);
  assert.deepEqual([a.ok, (await b.json()).tag_name], [true, 't']);
  const failing = async () => { calls++; throw new Error('offline'); };
  await assert.rejects(cachedFetch('https://api.example/r2', {}, failing));
  await cachedFetch('https://api.example/r2', {}, fetcher);
  assert.equal(calls, 3, 'a failed lookup is tried again');
});

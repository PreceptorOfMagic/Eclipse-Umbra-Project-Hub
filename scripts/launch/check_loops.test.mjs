import test from 'node:test';
import assert from 'node:assert/strict';
import { observeLoops } from '../../site/assets/loops.mjs';

function rig({ reduced = false, observerAvailable = true, queuedEvents = false } = {}) {
  const motion = new EventTarget();
  motion.matches = reduced;
  const pending = [];
  const emit = (video, type) => {
    const send = () => video.dispatchEvent(new Event(type));
    if (queuedEvents) pending.push(send); else send();
  };
  const videos = [0, 1].map(() => {
    const video = new EventTarget();
    Object.assign(video, { paused: true, starts: 0 });
    video.play = () => { video.paused = false; video.starts++; emit(video, 'play'); return Promise.resolve(); };
    video.pause = () => { if (!video.paused) { video.paused = true; emit(video, 'pause'); } };
    return video;
  });
  const root = new EventTarget();
  root.hidden = false;
  root.querySelectorAll = () => videos;
  let notify;
  const view = { matchMedia: () => motion };
  if (observerAvailable) view.IntersectionObserver = class {
    constructor(callback) { notify = callback; }
    observe() {}
  };
  observeLoops(root, view);
  return {
    videos, root,
    flush() { while (pending.length) pending.shift()(); },
    seen(index, ratio) { notify([{ target: videos[index], isIntersecting: ratio > 0, intersectionRatio: ratio }]); },
    motion(value) { motion.matches = value; motion.dispatchEvent(new Event('change')); },
    hidden(value) { root.hidden = value; root.dispatchEvent(new Event('visibilitychange')); },
  };
}

test('only sufficiently visible clips start; leaving view pauses them', () => {
  const r = rig();
  r.seen(0, .1); assert.equal(r.videos[0].starts, 0);
  r.seen(0, .45); assert.equal(r.videos[0].paused, false);
  r.seen(0, .3); assert.equal(r.videos[0].paused, true);
  r.seen(0, .8); assert.equal(r.videos[0].starts, 2);
});
test('a visitor pause survives scrolling, other clips, and tab visibility changes', () => {
  const r = rig(); r.seen(0, 1); r.videos[0].pause();
  r.seen(1, 1); r.seen(0, 0); r.seen(0, 1); r.hidden(true); r.hidden(false);
  assert.equal(r.videos[0].starts, 1); assert.equal(r.videos[0].paused, true);
});
test('hidden tabs pause automatic playback and resume visible clips on return', () => {
  const r = rig(); r.seen(0, 1); r.hidden(true);
  assert.equal(r.videos[0].paused, true);
  r.hidden(false); assert.equal(r.videos[0].starts, 2);
});
test('reduced motion prevents autoplay but permits native play controls', () => {
  const r = rig({ reduced: true }); r.seen(0, 1);
  assert.equal(r.videos[0].starts, 0);
  r.videos[0].play(); r.seen(1, .6);
  assert.equal(r.videos[0].paused, false);
  r.seen(0, 0); assert.equal(r.videos[0].paused, true);
  r.seen(0, 1); assert.equal(r.videos[0].starts, 1);
});
test('switching to reduced motion stops a clip; subsequent manual play works', () => {
  const r = rig(); r.seen(0, 1); r.motion(true);
  assert.equal(r.videos[0].paused, true);
  r.videos[0].play(); r.seen(1, 1);
  assert.equal(r.videos[0].paused, false);
});
test('missing observer support preserves native controls without an exception', () => {
  const r = rig({ observerAvailable: false }); r.videos[0].play();
  assert.equal(r.videos[0].paused, false);
});
test('a rejected autoplay request is handled and leaves controls usable', async () => {
  const r = rig();
  r.videos[0].play = () => Promise.reject(new Error('Autoplay blocked'));
  r.seen(0, 1); await Promise.resolve();
  assert.equal(r.videos[0].paused, true);
});

for (const transition of ['viewport', 'tab']) {
  test(`queued pause reconciles a rapid ${transition} return without losing user pause`, () => {
    const r = rig({ queuedEvents: true }); r.seen(0, 1); r.flush();
    if (transition === 'viewport') { r.seen(0, 0); r.seen(0, 1); }
    else { r.hidden(true); r.hidden(false); }
    r.flush();
    assert.equal(r.videos[0].paused, false);
    assert.equal(r.videos[0].starts, 2);
    r.videos[0].pause(); r.flush(); r.seen(1, 1);
    assert.equal(r.videos[0].paused, true);
  });
}

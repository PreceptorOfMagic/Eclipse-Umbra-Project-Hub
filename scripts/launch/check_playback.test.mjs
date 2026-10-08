import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { observePlayback } from '../../site/assets/playback.mjs';

function setup(observation = true) {
  const video = { paused: true, pauses: 0, pause() { this.paused = true; this.pauses++; },
    play() { assert.fail('Playback must require the native controls'); } };
  let observer;
  const events = {};
  const root = { hidden: false, fullscreenElement: null, querySelectorAll: () => [video],
    addEventListener: (name, handler) => { events[name] = handler; } };
  const view = observation ? { IntersectionObserver: class {
    constructor(handler) { observer = handler; } observe() {}
  } } : {};
  observePlayback(root, view);
  return { video, root, events, visible: value => observer([{target: video, isIntersecting: value}]) };
}

test('entering or re-entering the viewport never starts a demonstration', () => {
  const s = setup(); s.visible(true); s.visible(false); s.visible(true);
  assert.equal(s.video.paused, true);
});
test('leaving the viewport pauses user playback, returning does not resume it', () => {
  const s = setup(); s.video.paused = false; s.visible(false); s.visible(true);
  assert.equal(s.video.pauses, 1); assert.equal(s.video.paused, true);
});
test('a hidden tab pauses playback even without IntersectionObserver', () => {
  const s = setup(false); s.video.paused = false; s.root.hidden = true; s.events.visibilitychange();
  s.root.hidden = false; s.events.visibilitychange();
  assert.equal(s.video.pauses, 1); assert.equal(s.video.paused, true);
});
test('fullscreen playback survives a viewport intersection change', () => {
  const s = setup(); s.video.paused = false; s.root.fullscreenElement = s.video; s.visible(false);
  assert.equal(s.video.pauses, 0);
  s.root.hidden = true; s.events.visibilitychange(); assert.equal(s.video.pauses, 1);
});
test('every delivered HTML demonstration uses native, non-looping, opt-in playback', () => {
  const site = new URL('../../site/', import.meta.url);
  let count = 0;
  for (const file of fs.readdirSync(site).filter(name => name.endsWith('.html'))) {
    for (const [tag] of fs.readFileSync(new URL(file, site), 'utf8').matchAll(/<video\b[^>]*>/g)) {
      count++;
      assert.match(tag, /\bcontrols\b/);
      assert.match(tag, /\bpreload="none"/);
      assert.match(tag, /\bposter="/);
      assert.doesNotMatch(tag, /\b(?:autoplay|loop)\b/);
    }
  }
  assert.ok(count >= 4);
});

test('starting one demonstration pauses other players, including without viewport observation', () => {
  const s = setup(false);
  s.video.paused = false;
  s.events.play({ target: {} }); // Unrelated media must not interrupt it.
  assert.equal(s.video.pauses, 0);
  s.events.play({ target: s.video });
  assert.equal(s.video.pauses, 0);
  const first = { paused: false, pause() { this.paused = true; } };
  const second = { paused: false, pause() { this.paused = true; } };
  let onPlay;
  observePlayback({ querySelectorAll: () => [first, second],
    addEventListener(name, handler, capture) {
      if (name === 'play') { onPlay = handler; assert.equal(capture, true); }
    } }, {});
  onPlay({ target: second });
  assert.equal(first.paused, true);
  assert.equal(second.paused, false);
});

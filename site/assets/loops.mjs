// Native controls work without JavaScript, including when observation is unavailable.
// Automatic playback is an enhancement; a visitor's pause always takes precedence.
export function observeLoops(root, view) {
  if (!view.IntersectionObserver) return;
  const motion = view.matchMedia('(prefers-reduced-motion: reduce)');
  const states = new Map([...root.querySelectorAll('video[data-loop]')].map(video => [video, {
    visible: false, userPaused: false, automaticPausePending: false,
  }]));

  const stop = (video, state) => {
    if (!video.paused) {
      state.automaticPausePending = true;
      video.pause();
    }
  };
  const update = () => {
    for (const [video, state] of states) {
      if (root.hidden || !state.visible) stop(video, state);
      else if (!motion.matches && !state.userPaused && video.paused && !state.automaticPausePending) {
        video.play().catch(() => {}); // Browser autoplay policy may require a click.
      }
    }
  };
  for (const [video, state] of states) {
    video.addEventListener('pause', () => {
      if (state.automaticPausePending) {
        state.automaticPausePending = false;
        update(); // Media events are queued; visibility may already have changed again.
      }
      else state.userPaused = true;
    });
    video.addEventListener('play', () => {
      state.userPaused = false;
      if (root.hidden || !state.visible) stop(video, state);
    });
  }
  const observer = new view.IntersectionObserver(entries => {
    for (const entry of entries) {
      states.get(entry.target).visible = entry.isIntersecting && entry.intersectionRatio >= 0.45;
    }
    update();
  }, { threshold: [0, 0.45] });
  for (const video of states.keys()) observer.observe(video);
  root.addEventListener('visibilitychange', update);
  motion.addEventListener('change', () => {
    if (motion.matches) for (const [video, state] of states) stop(video, state);
    else update();
  });
}

if (typeof document !== 'undefined') observeLoops(document, window);

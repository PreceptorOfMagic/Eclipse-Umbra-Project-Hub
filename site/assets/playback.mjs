// Demonstrations start only through the native controls. Never resume automatically.
export function observePlayback(root, view) {
  const videos = [...root.querySelectorAll('video[data-demo]')];
  const pause = video => { if (!video.paused) video.pause(); };
  root.addEventListener('visibilitychange', () => {
    if (root.hidden) videos.forEach(pause);
  });
  if (!view.IntersectionObserver) return;
  const observer = new view.IntersectionObserver(entries => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting && root.fullscreenElement !== target) pause(target);
    }
  }, { threshold: 0 });
  videos.forEach(video => observer.observe(video));
}

if (typeof document !== 'undefined') observePlayback(document, window);

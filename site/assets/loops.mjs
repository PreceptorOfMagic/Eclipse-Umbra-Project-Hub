// Muted demonstration loops: play only while on screen, and never when the viewer prefers reduced motion.
// The <video> elements carry native controls and no autoplay attribute, so they work without this script.
const loops = [...document.querySelectorAll("video[data-loop]")];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const visible = new Set();

const update = () => {
  for (const video of loops) {
    if (!reducedMotion.matches && visible.has(video)) video.play().catch(() => {});
    else video.pause();
  }
};

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) visible.add(entry.target);
    else visible.delete(entry.target);
  }
  update();
}, { threshold: 0.45 });

loops.forEach((video) => observer.observe(video));
reducedMotion.addEventListener("change", update);

# Final media markup replacement sheet

This is a deferred launch sheet, not evidence that the media exists. Keep the
current site placeholders until `node scripts/launch/check_media.mjs` passes,
the recording run sheet is signed, and every `{{...}}` token below has been
replaced with a reviewed value. Copy changes must also be made in
`site/media/media-manifest.json` and re-reviewed.

All loop elements deliberately omit `autoplay`. They retain native controls,
start from reviewed posters and are played by the shared reduced-motion script
only while visible. The narrated walkthrough never autoplays.

## Shared loop behaviour

Add this once immediately before `</body>` on each page containing a reviewed
loop:

```html
<script>
  const reviewedLoops = [...document.querySelectorAll("video[data-reviewed-loop]")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const visibleLoops = new Set();

  const updateLoopPlayback = () => {
    reviewedLoops.forEach((video) => {
      if (reducedMotion.matches) {
        video.pause();
        video.currentTime = 0;
      } else if (visibleLoops.has(video)) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  };

  const loopObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visibleLoops.add(entry.target);
      else visibleLoops.delete(entry.target);
    });
    updateLoopPlayback();
  }, { threshold: 0.45 });

  reviewedLoops.forEach((video) => loopObserver.observe(video));
  reducedMotion.addEventListener("change", updateLoopPlayback);
</script>
```

## Homepage: `site/index.html`

Change the opening hero tag from `<section class="hero">` to:

```html
<section class="hero" id="hero">
```

Replace the existing `.hero-visual` placeholder with:

```html
<div class="hero-visual hero-proof">
  <figure class="architecture-figure">
    <video data-reviewed-loop muted loop playsinline controls preload="metadata"
           width="1920" height="1080"
           poster="media/coop-hero-poster.webp"
           aria-describedby="home-hero-description home-hero-caption">
      <source src="media/coop-hero-loop.webm" type="video/webm">
      <source src="media/coop-hero-loop.mp4" type="video/mp4">
    </video>
    <p class="visually-hidden" id="home-hero-description">Two different game views share one split screen while action continues in both panes.</p>
    <figcaption id="home-hero-caption">Eclipse combines two reviewed live Umbra sessions on one shared display.</figcaption>
  </figure>
</div>
```

In `#media`, use this exact launch-state heading copy:

```html
<p class="eyebrow">Reviewed live media</p>
<h2>See the shared-screen session in motion.</h2>
<p class="section-lede">These reviewed captures show the composed Eclipse output, independent input, a real layout change, the setup interface and the physical shared-screen context. Every delivery maps to a reviewed source in the public media record.</p>
```

Replace the independent-input mini-frame with:

```html
<figure class="media-proof">
  <video data-reviewed-loop muted loop playsinline controls preload="metadata"
         width="1280" height="720"
         poster="media/coop-independent-input-poster.webp"
         aria-describedby="home-independent-description home-independent-caption">
    <source src="media/coop-independent-input-loop.webm" type="video/webm">
    <source src="media/coop-independent-input-loop.mp4" type="video/mp4">
  </video>
  <p class="visually-hidden" id="home-independent-description">The left game view moves while the right remains still, then the right moves, followed by both views together.</p>
  <figcaption id="home-independent-caption">Each controller is shown affecting its assigned Umbra host before both players act together.</figcaption>
</figure>
```

Replace the layout-switch mini-frame with:

```html
<figure class="media-proof">
  <video data-reviewed-loop muted loop playsinline controls preload="metadata"
         width="1280" height="720"
         poster="media/coop-layout-switch-poster.webp"
         aria-describedby="home-layout-description home-layout-caption">
    <source src="media/coop-layout-switch-loop.webm" type="video/webm">
    <source src="media/coop-layout-switch-loop.mp4" type="video/mp4">
  </video>
  <p class="visually-hidden" id="home-layout-description">Two game views change from side by side to stacked while the session continues.</p>
  <figcaption id="home-layout-caption">The real Eclipse layout control changes the running co-op session without hiding the transition.</figcaption>
</figure>
```

Replace the host/input-picker mini-frame with:

```html
<figure class="media-proof">
  <img src="media/coop-picker.webp" width="1920" height="1080" loading="lazy"
       alt="Eclipse co-op setup showing two selected Umbra hosts, a layout choice and separate controller assignments.">
  <figcaption>The real host, layout and input picker used for the reviewed run.</figcaption>
</figure>
```

Replace the room mini-frame and the wide room placeholder with one retained
instance of this figure; do not show the same photograph twice in the section:

```html
<figure class="media-proof">
  <img src="media/living-room-wide.webp" width="1920" height="1080" loading="lazy"
       alt="A television showing two game panes with two controllers arranged in front of it.">
  <figcaption>The shared-screen setup used for the reviewed co-op demonstration.</figcaption>
</figure>
```

Change the walkthrough card label to `Walkthrough · reviewed`, its heading to
`Watch the complete co-op walkthrough`, and its link to:

```html
<a class="text-link" href="walkthrough.html">Watch with captions or read the transcript <span aria-hidden="true">→</span></a>
```

## Media page: `site/media.html`

Replace the pending notice text with:

```html
<span><strong>Reviewed live media.</strong> Every clip and still below maps to an accepted source, build record and accessibility review in the public media manifest.</span>
```

Use this page-hero copy:

```html
<p class="eyebrow">Reviewed launch media</p>
<h1>The co-op proof, from setup to play.</h1>
<p>Watch the composed live session first, then inspect the independent-input proof, real layout transition, setup flow, ordinary one-host path and physical-room context. Captions, transcript and source lineage accompany the full walkthrough.</p>
```

Replace the `#hero-reel` placeholder with:

```html
<figure class="architecture-figure">
  <video data-reviewed-loop muted loop playsinline controls preload="metadata"
         width="1920" height="1080"
         poster="media/coop-hero-poster.webp"
         aria-describedby="media-hero-description media-hero-caption">
    <source src="media/coop-hero-loop.webm" type="video/webm">
    <source src="media/coop-hero-loop.mp4" type="video/mp4">
  </video>
  <p class="visually-hidden" id="media-hero-description">Two different game views share one split screen while action continues in both panes.</p>
  <figcaption id="media-hero-caption">Eclipse combines two reviewed live Umbra sessions on one shared display.</figcaption>
</figure>
```

Replace the four mini-frames in `#feature-loops`, in their current order, with
these four figures:

```html
<figure class="media-proof">
  <video data-reviewed-loop muted loop playsinline controls preload="metadata"
         width="1280" height="720"
         poster="media/coop-independent-input-poster.webp"
         aria-describedby="media-independent-description media-independent-caption">
    <source src="media/coop-independent-input-loop.webm" type="video/webm">
    <source src="media/coop-independent-input-loop.mp4" type="video/mp4">
  </video>
  <p class="visually-hidden" id="media-independent-description">The left game view moves while the right remains still, then the right moves, followed by both views together.</p>
  <figcaption id="media-independent-caption">Each controller is shown affecting its assigned Umbra host before both players act together.</figcaption>
</figure>

<figure class="media-proof">
  <video data-reviewed-loop muted loop playsinline controls preload="metadata"
         width="1280" height="720"
         poster="media/coop-layout-switch-poster.webp"
         aria-describedby="media-layout-description media-layout-caption">
    <source src="media/coop-layout-switch-loop.webm" type="video/webm">
    <source src="media/coop-layout-switch-loop.mp4" type="video/mp4">
  </video>
  <p class="visually-hidden" id="media-layout-description">Two game views change from side by side to stacked while the session continues.</p>
  <figcaption id="media-layout-caption">The real Eclipse layout control changes the running co-op session without hiding the transition.</figcaption>
</figure>

<figure class="media-proof">
  <video data-reviewed-loop muted loop playsinline controls preload="metadata"
         width="1280" height="720"
         poster="media/coop-setup-flow-poster.webp"
         aria-describedby="media-setup-description media-setup-caption">
    <source src="media/coop-setup-flow-loop.webm" type="video/webm">
    <source src="media/coop-setup-flow-loop.mp4" type="video/mp4">
  </video>
  <p class="visually-hidden" id="media-setup-description">Eclipse selects two Umbra hosts, a layout and a separate controller for each host.</p>
  <figcaption id="media-setup-caption">The public-safe setup flow joins two selected hosts and makes input ownership explicit.</figcaption>
</figure>

<figure class="media-proof">
  <video data-reviewed-loop muted loop playsinline controls preload="metadata"
         width="1280" height="720"
         poster="media/single-host-poster.webp"
         aria-describedby="media-single-description media-single-caption">
    <source src="media/single-host-loop.webm" type="video/webm">
    <source src="media/single-host-loop.mp4" type="video/mp4">
  </video>
  <p class="visually-hidden" id="media-single-description">A single game fills the Eclipse client during a conventional one-host stream.</p>
  <figcaption id="media-single-caption">The ordinary Eclipse-to-Umbra streaming path remains available alongside co-op.</figcaption>
</figure>
```

Replace the two placeholders in `#photography`, in their current order, with:

```html
<figure class="media-proof">
  <img src="media/living-room-wide.webp" width="1920" height="1080" loading="lazy"
       alt="A television showing two game panes with two controllers arranged in front of it.">
  <figcaption>The shared-screen setup used for the reviewed co-op demonstration.</figcaption>
</figure>

<figure class="media-proof">
  <img src="media/coop-picker.webp" width="1920" height="1080" loading="lazy"
       alt="Eclipse co-op setup showing two selected Umbra hosts, a layout choice and separate controller assignments.">
  <figcaption>The real host, layout and input picker used for the reviewed run.</figcaption>
</figure>
```

Replace the `#walkthrough-film` placeholder with this launch block, substituting
the same reviewed URLs used on the walkthrough page:

```html
<div class="walkthrough-player" aria-describedby="media-walkthrough-description">
  <iframe src="{{FINAL EMBED HTTPS URL}}"
          title="Eclipse/Umbra co-op walkthrough"
          loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen></iframe>
</div>
<p id="media-walkthrough-description">A reviewed 90–105-second walkthrough showing the outcome, setup flow, independent input, both layouts, ordinary one-host streaming and creator credits.</p>
<div class="hero-actions">
  <a class="button" href="{{FINAL PUBLIC HTTPS URL}}">Watch on the video host</a>
  <a class="button-secondary" href="walkthrough.html#transcript">Read the transcript and visual description</a>
  <a class="button-secondary" href="media/coop-walkthrough.en.vtt">Download English captions</a>
</div>
```

## Walkthrough page: `site/walkthrough.html`

Replace the pending notice text with:

```html
<span><strong>Reviewed walkthrough available.</strong> The hosted film, English captions, semantic transcript, visual description and public build record have completed launch review.</span>
```

Use this page-hero copy and actions:

```html
<p class="eyebrow">Co-op demonstration · reviewed live recording</p>
<h1>Walkthrough, captions and transcript.</h1>
<p>This reviewed demonstration follows Eclipse/Umbra from two selected hosts to independently controlled play on one shared display, then records the build and creator credits behind the run.</p>
<div class="hero-actions">
  <a class="button" href="{{FINAL PUBLIC HTTPS URL}}">Watch the walkthrough</a>
  <a class="button-secondary" href="#transcript">Read the transcript</a>
</div>
```

Replace the film placeholder and its pending actions with:

```html
<div class="walkthrough-player" aria-describedby="walkthrough-description">
  <iframe src="{{FINAL EMBED HTTPS URL}}"
          title="Eclipse/Umbra co-op walkthrough"
          loading="lazy" allow="fullscreen; picture-in-picture" allowfullscreen></iframe>
</div>
<p id="walkthrough-description">A reviewed 90–105-second walkthrough showing the outcome, setup flow, independent input, side-by-side and stacked layouts, ordinary one-host streaming and creator credits.</p>
<div class="hero-actions">
  <a class="button" href="{{FINAL PUBLIC HTTPS URL}}">Open the video on its host</a>
  <a class="button-secondary" href="media/coop-walkthrough.en.vtt">Download English captions</a>
</div>
```

Replace the prepared transcript prose with the locked content from
`site/media/coop-walkthrough-transcript.md` inside this exact semantic shell:

```html
<article class="prose" id="transcript">
  <h2>Transcript</h2>
  {{RENDER THE REVIEWED SPEAKER-LABELLED TRANSCRIPT HERE}}

  <h2>Visual description</h2>
  {{RENDER THE REVIEWED SHOT-BY-SHOT VISUAL DESCRIPTION HERE}}

  <h2>Recording evidence</h2>
  <dl>
    <dt>Eclipse build</dt><dd>{{VERSION, FULL COMMIT AND ARTIFACT SHA-256}}</dd>
    <dt>Umbra host A build</dt><dd>{{VERSION, FULL COMMIT AND ARTIFACT SHA-256}}</dd>
    <dt>Umbra host B build</dt><dd>{{VERSION, FULL COMMIT AND ARTIFACT SHA-256}}</dd>
    <dt>Walkthrough master</dt><dd><code>eclipse-umbra-coop-walkthrough-1080p60.mp4</code> · SHA-256 {{SHA-256}}</dd>
  </dl>

  <h2>Credits</h2>
  <p>The film gives creator-first credit to Moonlight, Sunshine, Moonlight TV, Aurora and Apollo. Read the complete <a href="credits.html">acknowledgements and licence inventory</a>.</p>
</article>
```

Before publishing, search all three pages for `recording pending`, `planned`,
`placeholder`, `{{` and `}}`. Any remaining match in a media launch section is
a stop unless it describes unrelated future work.

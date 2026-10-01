# Public media delivery contract

This contract turns the recording storyboard into files that can be reviewed,
validated and integrated without guessing on launch day. It governs delivery
copies only; camera originals, editing projects and archival masters stay
outside Git.

## Required files

| File | Requirement | Repository budget |
|---|---|---|
| `site/media/coop-hero-loop.webm` / `.mp4` | VP9 Profile 0 and H.264 High, 1920×1080, 6–8 seconds, 30–60 fps, muted | 10 / 12 MiB maximum |
| `site/media/coop-hero-poster.webp` | Exact 1920×1080 frame from the accepted hero interval | 750 KiB maximum |
| `site/media/coop-independent-input-loop.webm` / `.mp4` | 1280×720, exactly 8 seconds at 60 fps: host A only, host B only, then both | 4 / 5 MiB maximum |
| `site/media/coop-independent-input-poster.webp` | Exact 1280×720 frame inside that loop interval | 400 KiB maximum |
| `site/media/coop-layout-switch-loop.webm` / `.mp4` | 1280×720, exactly 10 seconds at 60 fps: side by side → real switch → stacked | 4 / 5 MiB maximum |
| `site/media/coop-layout-switch-poster.webp` | Exact 1280×720 frame inside that loop interval | 400 KiB maximum |
| `site/media/coop-setup-flow-loop.webm` / `.mp4` | 1280×720, exactly 10 seconds at 60 fps: hosts, layout and input assignment | 4 / 5 MiB maximum |
| `site/media/coop-setup-flow-poster.webp` | Exact 1280×720 frame inside that loop interval | 400 KiB maximum |
| `site/media/single-host-loop.webm` / `.mp4` | 1280×720, exactly 6 seconds at 60 fps: ordinary one-host streaming | 4 / 5 MiB maximum |
| `site/media/single-host-poster.webp` | Exact 1280×720 frame inside that loop interval | 400 KiB maximum |
| `site/media/living-room-wide.webp` | Exact 1920×1080 real setup photograph | 1 MiB maximum |
| `site/media/coop-picker.webp` | Exact 1920×1080 real picker/layout/input screenshot | 1 MiB maximum |
| `site/media/coop-walkthrough.en.vtt` | Human-reviewed WebVTT captions for the hosted walkthrough | 100 KiB maximum |
| `site/media/coop-walkthrough-transcript.md` | Narration, meaningful sound cues, visual descriptions and final public links | 100 KiB maximum |
| `site/media/media-manifest.json` | Public-safe build, source-lineage, review and SHA-256 record for every delivery | 100 KiB maximum |

The full walkthrough upload master is
`eclipse-umbra-coop-walkthrough-1080p60.mp4`: target 100 seconds (90–105 seconds
accepted), 1920×1080 at 60 fps, H.264 High, `yuv420p`, SDR Rec.709 limited
range, AAC at 48 kHz. It is hosted on a video service rather than committed to
this repository. Record its SHA-256 as the `walkthrough-master` source before
upload, then add the public URL only after captions and signed-out playback have
been checked.

Start the provenance file from
[`templates/media-manifest.template.json`](templates/media-manifest.template.json).
It is deliberately full of validator-rejected placeholders; copy its schema,
not its unreviewed values.

## Image and video rules

- The hero loop must be a continuous live capture showing both panes moving;
  it may not be reconstructed from separate takes or diagnostic playback.
- Both video files must describe the same edit frame-for-frame. They contain no
  audio stream, title card, tracking metadata, private identifiers or tiny text.
- Every site loop is 8-bit 4:2:0 SDR Rec.709 (`bt709` primaries, transfer and
  matrix; limited `tv` range), starts on a keyframe and uses square pixels. VP9
  deliveries use Profile 0; H.264 deliveries use High profile and fast start.
- The paired WebM/MP4 files for each loop come from the identical source
  interval. Review the first-to-last transition at normal speed and frame by
  frame, then set `loopSeamReviewed` only when the repeat is not misleading or
  distracting.
- Crop and scale; do not stretch. Preserve square pixels and the 16:9 display
  geometry.
- The poster must be a real frame from the accepted run, not synthetic art.
- Photographs must have metadata stripped after the archival original is saved.
- Do not upscale a smaller capture merely to satisfy the pixel dimensions.
- Record the source build commits and media checksums in the private release
  record and the public-safe subset in `media-manifest.json`. Each visual
  delivery must identify an accepted source ID/hash and exact source interval or
  frame; the public manifest must not expose private paths, account names or
  location details. Keep a clean footage master without title cards; add the canonical
  **Eclipse/Umbra** suite lock-up and the Eclipse-client/Umbra-host roles only
  in editable graphics so a legal or factual correction never requires
  recreating the proof footage.

## Source decisions and handles

- Record the hero, independent-input and layout-switch deliveries from the
  actual composed Eclipse output in one uninterrupted live proof take. Do not
  combine separately captured host panes in the edit.
- Record the setup flow as a direct capture of the real Eclipse UI using
  public-safe aliases. Record the one-host loop from a real live Eclipse session.
- If direct composed-output capture is unavailable, document the chosen HDMI
  capture or locked-camera path before rolling; the camera image must still show
  the actual Eclipse display, not a reconstruction.
- Every continuous or screen-recorded source needs at least two seconds of clean
  pre-roll and post-roll beyond every selected interval. Preserve those handles
  in the source inventory even though the delivery uses only the declared in/out.

## Accessibility copy and placements

Copy is part of the delivery contract, not decoration added during integration.
Review it against the accepted pixels and keep it identical in the manifest,
run sheet and final markup. A WebM/MP4 pair uses the same description, caption,
poster and placements.

| Group | Loop description / poster alt text | Caption | Placements |
|---|---|---|---|
| Hero | Loop: “Two different game views share one split screen while action continues in both panes.” Poster: “Two different game views appear in the left and right panes of one split screen.” | “Eclipse combines two reviewed live Umbra sessions on one shared display.” | `site/index.html#hero`; `site/media.html#hero-reel` |
| Independent input | Loop: “The left game view moves while the right remains still, then the right moves, followed by both views together.” Poster: “A split screen shows a different game view in each of its two panes.” | “Each controller is shown affecting its assigned Umbra host before both players act together.” | `site/index.html#media`; `site/media.html#feature-loops` |
| Layout switch | Loop: “Two game views change from side by side to stacked while the session continues.” Poster: “Two game views are arranged one above the other in a stacked layout.” | “The real Eclipse layout control changes the running co-op session without hiding the transition.” | `site/index.html#media`; `site/media.html#feature-loops` |
| Setup flow | Loop: “Eclipse selects two Umbra hosts, a layout and a separate controller for each host.” Poster: “Eclipse co-op setup shows two selected hosts, a layout and separate controller assignments.” | “The public-safe setup flow joins two selected hosts and makes input ownership explicit.” | `site/media.html#feature-loops` |
| Single host | Loop: “A single game fills the Eclipse client during a conventional one-host stream.” Poster: “One game view fills the Eclipse client display during a single-host session.” | “The ordinary Eclipse-to-Umbra streaming path remains available alongside co-op.” | `site/media.html#feature-loops` |
| Living-room still | “A television showing two game panes with two controllers arranged in front of it.” | “The shared-screen setup used for the reviewed co-op demonstration.” | `site/index.html#media`; `site/media.html#photography` |
| Picker still | “Eclipse co-op setup showing two selected Umbra hosts, a layout choice and separate controller assignments.” | “The real host, layout and input picker used for the reviewed run.” | `site/index.html#media`; `site/media.html#photography` |

The captions and transcript both resolve to `walkthrough-master-01`. Review the
WebVTT against the final hosted audio, and publish the transcript's narration,
meaningful sounds and visual descriptions in `site/walkthrough.html#transcript`.
Keep the downloadable caption link visible on that page.

## HTML integration

Keep the current placeholders until the validator and every human review above
passes. Then apply the page-by-page replacement snippets and exact launch-state
copy in [final-media-markup.md](templates/final-media-markup.md). That sheet
covers the homepage hero and evidence gallery, all five media-page loops, both
stills, the external walkthrough, transcript and downloadable captions.

The architecture illustration remains in the lower architecture section; real
proof footage replaces only the above-fold placeholder. All loops retain visible
native controls and omit the `autoplay` attribute. The shared integration script
requests playback only for visible loops when reduced motion is off. The narrated
walkthrough never autoplays. A failed playback or embed leaves the reviewed poster,
direct hosted-video link and local accessibility links available.

`site/media/coop-walkthrough-transcript.md` remains the reviewed source record,
not the consumer destination. Copy its locked semantic content into
`site/walkthrough.html`; consumer links point to the HTML page, while the English
caption link points to `media/coop-walkthrough.en.vtt`.

## Acceptance and validation

Run:

```bash
node scripts/launch/check_media.mjs
```

The check enforces file presence and hashes, manifest lineage, size,
container/codec, dimensions, finite duration/frame rate/count, decoded-loop
similarity, square pixels, rotation, pixel format, absence of audio, WebP
animation/metadata chunks, ordered WebVTT cues and the required transcript
sections. Passing the script does not establish content truth, rights clearance
or visual quality, and automated metadata inspection does not replace the
manual privacy review. Complete the run sheet, then perform the human acceptance
steps in `recording-plan.md` and a fresh desktop/mobile site review.

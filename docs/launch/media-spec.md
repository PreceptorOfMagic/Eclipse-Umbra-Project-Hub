# Public media delivery contract

The current reviewed inventory is [site/media/media-manifest.json](../../site/media/media-manifest.json). Delivery descriptions are in [the media README](../../site/media/README.md). Capture masters and editing projects stay outside Git.

## Delivery formats and budgets

- Videos: 1920×1080, 60 fps, SDR Rec.709 primaries/matrix with Rec.709 or sRGB transfer, limited-range `yuv420p`. H.264 MP4 uses fast start; VP9 WebM is an alternative when it saves worthwhile bandwidth. Preserve the actual sequence and disclose edits if any.
- Interface demonstrations are silent; the two Halo gameplay excerpts retain audio (AAC stereo in MP4). Native controls start playback only on request; no autoplay or looping, and only one player runs at a time. Use `preload="none"`, a real WebP poster, a descriptive caption and duration.
- Screenshots and posters: static WebP, legible at their displayed size, with accurate dimensions and descriptive alternative text. Capture complete relevant panels, including status warnings.
- The default repository limit is 12 MiB per file. Only `site/media/eclipse-halo-vertical.mp4` and `site/media/eclipse-halo-horizontal.mp4` may use up to 40 MiB each. This is a budget, not a target; keep the showcase as short and small as useful.
- Retain factual source, artwork and recording credits. Do not publish private addresses, pairing credentials or capture masters.

GitHub Pages publishes these delivery copies directly. Avoid unnecessary duplicate formats and animated README previews; link a static preview to the website player instead.

## Verification

Update each delivery's SHA-256, codec, dimensions and video duration/frame rate/audio presence in the manifest **after visual review**. Then run:

```sh
node scripts/launch/check_hub_boundary.mjs
node scripts/launch/check_public_site.mjs
node scripts/launch/check_published_media.mjs --decode
node --test scripts/launch/*.test.mjs
```

The Pages workflow checks the real delivery inventory and decodes every media file. A checksum confirms that reviewed bytes remain unchanged; it does not replace human visual review or establish runtime correctness.

The older schema-v1 manifest templates and utility fixtures remain for historical test coverage. They do not define current recording requirements.

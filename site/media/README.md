# Public media drop zone

This directory holds only reviewed, web-ready delivery copies. The required files are enforced by `scripts/launch/check_media.mjs`; camera originals and editing masters do not belong here.

Expected lightweight deliverables:

- `coop-hero-loop.webm`, `coop-hero-loop.mp4` and
  `coop-hero-poster.webp` — 1920×1080 primary proof, 6–8 seconds.
- `coop-independent-input-loop.webm`,
  `coop-independent-input-loop.mp4` and
  `coop-independent-input-poster.webp` — 1280×720, exactly eight seconds at
  60 fps: host A only, host B only, then both.
- `coop-layout-switch-loop.webm`, `coop-layout-switch-loop.mp4` and
  `coop-layout-switch-poster.webp` — 1280×720, exactly ten seconds at 60 fps:
  side by side, the visible real switch, then stacked.
- `coop-setup-flow-loop.webm`, `coop-setup-flow-loop.mp4` and
  `coop-setup-flow-poster.webp` — 1280×720, exactly ten seconds at 60 fps:
  hosts, layout and separate controller assignment.
- `single-host-loop.webm`, `single-host-loop.mp4` and
  `single-host-poster.webp` — 1280×720, exactly six seconds at 60 fps of a
  conventional live one-host stream.
- `living-room-wide.webp` — exact 1920×1080 clean physical setup photograph.
- `coop-picker.webp` — exact 1920×1080 host/layout/input setup screen.
- `coop-walkthrough.en.vtt` — captions for the hosted walkthrough.
- `coop-walkthrough-transcript.md` — accessible transcript and visual description for the hosted walkthrough.
- `media-manifest.json` — public-safe build hashes, source lineage, review record and delivery SHA-256 values.

The external upload master is
`eclipse-umbra-coop-walkthrough-1080p60.mp4`: target 100 seconds, with 90–105
seconds accepted; 1920×1080 at 60 fps; H.264 High; `yuv420p`; SDR Rec.709
limited range; and AAC at 48 kHz. Keep it outside Git, hash the exact uploaded
file as `walkthrough-master-01`, and record the final public URL only after
captions and signed-out playback have been reviewed.

The hero, independent-input and layout-switch groups come from one continuous
capture of the actual composed Eclipse output. The setup group comes from the
real setup interface, and the single-host group comes from a conventional live
session. Retain at least two clean seconds of pre-roll and post-roll outside
every selected interval and record the final capture method and handles in the
run sheet and manifest.

Before replacing any planned site frame, review every loop seam at normal
speed and frame by frame. Confirm that each loop's WebM and MP4 use identical
accessible descriptions, captions, poster references and placements; review
the five poster alt texts and both still alt texts/captions against the final
pixels; and confirm that captions and the transcript match the hosted master.
The exact launch markup and copy are staged in
`docs/launch/templates/final-media-markup.md`.

The reviewed Markdown remains the source record. Copy its final content into the
shared-shell `site/walkthrough.html` page; the consumer link must not send people
to raw Markdown.

Keep camera originals, editing projects and full-quality masters outside Git. Do not use files from `scratchpad/`; they are diagnostic evidence rather than public assets. Follow `docs/launch/recording-plan.md` for the creative plan and complete `docs/launch/recording-run-sheet.md` during the real shoot so build identity, rights evidence, take selection and teardown remain auditable.

Technical delivery requirements and the intended HTML integration are defined in `docs/launch/media-spec.md`. From the repository root, run `node scripts/launch/check_media.mjs` before treating this directory as ready.

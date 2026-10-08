# Public media

Only reviewed delivery copies belong here. Masters, private capture notes and retired takes stay outside Git. [media-manifest.json](media-manifest.json) records the reviewed delivery hashes and measured formats; page captions carry recording and artwork credits.

## Delivered

| Media | Purpose and capture |
|---|---|
| `eclipse-coop-switch` MP4/WebM + poster | 42-second uncut Windows-client workflow: one live host, co-op configuration, then two hosts. Retains the real connection time. |
| `eclipse-coop-pause` MP4/WebM + poster | 39-second corrected Disconnect → Co-op Pane → Resume streaming → Quit game sequence. Retains real disconnect time. |
| `eclipse-coop-pointer.mp4` + poster | 19-second uncut Codex retake: one menu per host, slow crossing and return; real host cursors enlarged for visibility. Keeps the established Moon Light and KIKI&JIJI wallpapers. The MP4 is smaller than the reviewed WebM candidate. |
| `coop-test-pattern.mp4` + poster | 12-second technical illustration on Development. The MP4 preserves readable bands/counters and is smaller than the former WebM copy; the redundant WebM is retired. |
| `umbra-host-home.webp` | Complete 1410×890 host panel captured 8 October 2026: Umbra 0.4.6-umbra.4, Apollo base status and the separate unavailable published-Umbra comparison are all visible. |
| `eclipse-webos-app.webp` | Fresh 1920×1080 LG G5 / webOS 26 app-library capture for the TV platform card. |
| `eclipse-webos-launcher.webp` | Fresh 1920×1080 webOS launcher capture, with Eclipse selected, for the installation guide. |
| `eclipse-halo-vertical.mp4` + `eclipse-two-host.webp` | Approved 70.4-second side-by-side Halo excerpt, with audio. Starts at the island cutscene and ends before the death in the second vertical run. Poster/still: 45 seconds into the excerpt. Opening audio glitches need further co-op audio tuning. |
| `eclipse-halo-horizontal.mp4` + poster | Approved 85.4-second stacked Halo excerpt, with audio. Starts at the island cutscene and ends at the cleared-beach checkpoint. Poster: 54 seconds into the excerpt. |
| Other WebP stills | Host-monitor settings, Share logs location, disclosed virtual controller assignments, co-op dialog, ordinary desktop stream, Windows/Linux windows and Umbra applications. |

The switch, pause/resume and test-pattern clips were recorded by Claude; the pointer retake was recorded by Codex. All use planned inputs on live hosts, as disclosed alongside each player. These interface demonstrations are silent. All clips are 1920×1080 and 60 fps, with SDR Rec.709 primaries/matrix and sRGB transfer. Their delivery cadence does not certify the streaming renderer's unique-frame rate.

Videos use native controls, `preload="none"`, and static posters. They never autoplay, loop or automatically resume. Starting another player pauses the previous one. Playback pauses when the player leaves view or the tab is hidden. GitHub Markdown uses linked static previews; the former animated README preview is retired.

## Halo gameplay

Human-played Halo: Combat Evolved Anniversary, recorded on 8 October 2026. PC1 runs Eclipse on Windows and streams two live Umbra hosts, PC2 and VEGA. Codex operated capture and made the user-approved trims. Each delivery is a continuous excerpt with captured audio (AAC stereo); no interpolation or internal cuts were applied. These are editorial examples, not performance certification. Halo is a Microsoft game.

The vertical delivery uses the second run in the first capture (122.100–192.500 seconds); horizontal uses the second capture (47.800–133.200 seconds). Both were approved after review. All original recordings, full audio, masters and earlier edits remain outside this repository. Published MP4s are byte-for-byte copies of the approved review files. Posters come from the corresponding higher-quality edit masters.

The two-host still and linked README preview now show real Halo gameplay. The ordinary one-host desktop still remains accurate: no ordinary one-host Halo footage was recorded. The branded social image and explanatory hero diagrams remain. No additional animation, couch photograph or narrated walkthrough is required.

## Budget and validation

Keep each file below 12 MiB by default. Only `eclipse-halo-vertical.mp4` and `eclipse-halo-horizontal.mp4` have a 40 MiB ceiling each. Choose formats by visible quality and actual size; do not store capture masters on Pages.

Run `node scripts/launch/check_published_media.mjs --decode` from the repository root. The deployment workflow verifies the actual inventory, hashes, formats, references and full decoding. See [the delivery contract](../../docs/launch/media-spec.md).

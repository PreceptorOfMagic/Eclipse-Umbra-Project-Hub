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
| Other WebP stills | Host-monitor settings, Share logs location, disclosed virtual controller assignments, co-op dialog, ordinary/two-host streams, Windows/Linux windows and Umbra applications. |

The switch, pause/resume and test-pattern clips were recorded by Claude; the pointer retake was recorded by Codex. All use planned inputs on live hosts, as disclosed alongside each player. Current clips are silent, 1920×1080 and 60 fps, with SDR Rec.709 primaries/matrix and sRGB transfer. Their delivery cadence does not certify the streaming renderer's unique-frame rate.

Videos use native controls, `preload="none"`, and static posters. They never autoplay, loop or automatically resume. Playback pauses when the player leaves view or the tab is hidden. GitHub Markdown uses linked static previews; the former animated README preview is retired.

## Pending

The user will record the Halo showcase after these updates. Use accepted frames from that recording for the showcase poster and ordinary/two-host gameplay stills. Keep existing diagrams and imagery until that footage is available. No independent-controller animation, couch photograph or narrated walkthrough is required.

## Budget and validation

Keep each file below 12 MiB by default. Only the two future `eclipse-halo-showcase.mp4` and `.webm` deliveries have a 40 MiB ceiling each. Choose formats by visible quality and actual size; do not store capture masters on Pages.

Run `node scripts/launch/check_published_media.mjs --decode` from the repository root. The deployment workflow verifies the actual inventory, hashes, formats, references and full decoding. See [the delivery contract](../../docs/launch/media-spec.md).

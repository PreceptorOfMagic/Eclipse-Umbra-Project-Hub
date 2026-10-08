# Co-op launch recording plan

The launch footage must prove the central idea in a few seconds: **two independent PCs running the Umbra host respond to two players while the Eclipse client composes both live streams on one shared display**. It should feel like an Eclipse/Umbra product demonstration, not a laboratory capture, while remaining honest about preview status.

Use the selected hierarchy in every editable title and caption: Eclipse/Umbra is the project, Eclipse is the client application and Umbra is the host application. Record a clean master without burned-in branding so a later legal or factual correction does not invalidate the proof footage.

Use the fill-in [recording run sheet](recording-run-sheet.md) on the shoot. The delivery files must satisfy [media-spec.md](media-spec.md). Run `node scripts/launch/check_media.mjs` after export; the Pages launch gate will reject missing, oversized or technically incompatible media.

## Deliverables

| Asset | Purpose | Target content |
|---|---|---|
| `coop-hero-loop.webm` and `.mp4` | Silent site/social loop | 6–8 seconds, both panes moving, both inputs obvious, seamless loop |
| `coop-hero-poster.webp` | README/site fallback | Clean representative frame with two active panes |
| `coop-independent-input-loop.webm` and `.mp4` | Steam-style feature loop | Exactly 8 seconds at 60 fps: host A only, host B only, then both |
| `coop-independent-input-poster.webp` | Independent-input fallback | Clean frame from inside the accepted 8-second interval |
| `coop-layout-switch-loop.webm` and `.mp4` | Steam-style feature loop | Exactly 10 seconds at 60 fps: side by side, the visible real switch, then stacked |
| `coop-layout-switch-poster.webp` | Layout-switch fallback | Clean frame from inside the accepted 10-second interval |
| `coop-setup-flow-loop.webm` and `.mp4` | Steam-style feature loop | Exactly 10 seconds at 60 fps: two hosts, layout and separate controller assignment |
| `coop-setup-flow-poster.webp` | Setup-flow fallback | Public-safe setup frame from inside the accepted 10-second interval |
| `single-host-loop.webm` and `.mp4` | Steam-style feature loop | Exactly 6 seconds at 60 fps of an ordinary live one-host Eclipse session |
| `single-host-poster.webp` | Single-host fallback | Clean frame from inside the accepted 6-second interval |
| `living-room-wide.webp` | Context photograph | TV, two controllers and room; no private details |
| `coop-picker.webp` | Setup photograph/screenshot | Two hosts, layout and input ownership legible |
| `coop-walkthrough.en.vtt` | Accessibility | Accurate dialogue and meaningful sound cues |
| `coop-walkthrough-transcript.md` | Search/accessibility | Full narration plus visual descriptions and links |
| `eclipse-umbra-coop-walkthrough-1080p60.mp4` | External upload master | Reviewed 90–105-second film with the exact technical contract below; kept outside Git |
| `media-manifest.json` | Public provenance record | Delivery hashes, release-build hashes and public-safe source lineage |
| `site/walkthrough.html` | Consumer accessibility page | Hosted film link, semantic transcript, visual description, captions and build record in the shared site shell |

Keep raw camera files, edit projects and archival masters outside Git. Commit
the validated lightweight loop variants, posters, stills, captions, transcript
and manifest listed above. Host the full walkthrough on a video service and
embed/link it from the site.

The exact external upload master is
`eclipse-umbra-coop-walkthrough-1080p60.mp4`: target 100 seconds, with 90–105
seconds accepted; 1920×1080 at 60 fps; H.264 High; `yuv420p`; SDR Rec.709
primaries, transfer and matrix; limited `tv` range; and AAC audio at 48 kHz.
Hash that exact file, enter it as source `walkthrough-master-01`, and derive the
hosted upload, captions and transcript from it. Do not commit the upload master.

## Source-capture decision

Choose and record the capture path before rolling; do not decide it while
editing:

- `proof-take-01` supplies the hero, independent-input and layout-switch loops.
  Prefer direct capture of the composed Eclipse output from one uninterrupted
  live proof take. If that is unavailable, choose either HDMI capture or a
  locked camera showing the actual Eclipse display and record the reason.
- `setup-flow-01` is a direct screen capture of the real Eclipse setup UI using
  public-safe aliases. It supplies the setup-flow loop.
- `single-host-01` is a direct capture of a conventional live Eclipse-to-Umbra
  session. It supplies the single-host loop.
- `room-photo-01` is the locked-camera original for the living-room still;
  `picker-still-01` is a direct still of the real setup interface.
- Every continuous or screen-captured source must contain at least two seconds
  of clean pre-roll and two seconds of clean post-roll outside every selected
  interval. Record those handles and the final `captureMethod` in the run sheet
  and manifest. Do not trim the retained source down to the delivery interval.

## Storyboard: 100-second main film

| Time | Picture | Caption or narration purpose |
|---|---|---|
| 0–5 s | Wide shot: one TV, two controllers and two visibly different player viewpoints in the same match | “Two PCs. One screen.” Establish the outcome first. |
| 5–12 s | Close view of both players producing simultaneous, unmistakable movement | Prove that neither pane is a recording or spectator view. |
| 12–20 s | Simple two Umbra hosts → Eclipse client → display diagram | Explain the Eclipse/Umbra architecture without diving into protocols. |
| 20–32 s | Host picker, co-op entry, layout choice and input assignment | Show that the composition is deliberate and configurable. |
| 32–44 s | Side-by-side live play, including a visible simultaneous action | Demonstrate the primary layout. |
| 44–54 s | Switch to stacked layout and briefly swap the primary host | Show flexibility without turning the film into a settings tour. |
| 54–63 s | Single-host streaming and platform cards | Make clear that normal Moonlight-style streaming remains supported. |
| 63–75 s | Moonlight origin card naming Cameron Gutman, Diego Waxemberg, Aidan Campbell, Aaron Neyer, Michelle Bergeron and Andrew Hennessy | Put the original creators on screen at a readable size. |
| 75–85 s | Sunshine origin card naming creator @loki-47-6F-64 and the current LizardByte maintainers | Give the host foundation its own readable acknowledgement. |
| 85–95 s | Lineage card naming Moonlight TV by Mariotaku, Aurora by GuiDev1994 and Apollo by @ClassicOldSong | Distinguish the direct upstream lineage from the original foundations. |
| 95–100 s | Source/status link | Honest call to action; no funding appeal in the launch cut. |

The 6–8 second loop should be cut from the simultaneous-action shot, without UI chrome, camera movement, audio or text small enough to become unreadable.

## Recording-day preflight

- Follow the Eclipse source repository's [live-test conducting procedure](https://github.com/PreceptorOfMagic/eclipse/blob/main/docs/conducting-live-tests.md) for the live rig. The recording must use live host encodes, not playback files.
- Use a fresh, identified launch build on the client and compatible host builds. Record the exact commits separately from the public video.
- Complete the run sheet's rights/consent register and prepare clean demo accounts plus public-safe host aliases before rolling.
- Clear capture media and reserve at least twice the expected recording size; verify two independent backups by reading back a test file.
- Synchronise camera, screen-capture and audio clocks, use deterministic slate/take filenames, and keep spare power ready.
- Record a ten-second pilot and review it on the editing machine for cadence, dropped or duplicated frames, rolling bands, focus, exposure, white balance, audio sync and codec import.
- Confirm both panes show current content and react independently before rolling.
- Repeat the live/current-pane and privacy checks immediately before every take that may be accepted.
- Check the physical TV image directly. Healthy counters are not a substitute for a visible picture.
- Frame out notifications, account names, machine names, IP addresses, pairing codes, browser history and reflections that expose private information.
- Disable copyrighted in-game music and voice chat. Choose a game/demo whose publisher permits promotional gameplay, or use cleared/open content.
- Lock camera exposure and white balance for the OLED rather than allowing the room to pump brightness between cuts.
- Record room tone separately if the film has narration. The silent loop must remain useful with no audio.
- Photograph the setup only after cables, remotes, packaging and screens are deliberately arranged.
- When recording ends or aborts, close the test harness and verify it is gone on both host displays as required by the project rules.

## Proof shots that cannot be omitted

1. Both panes moving at the same time.
2. Player 1 moves only host 1 while player 2 moves only host 2.
3. Side-by-side and stacked composition.
4. The actual host/layout/input setup screen.
5. One wide physical shot showing this is a shared TV experience.

Avoid diagnostic overlays in the hero material. Capture a separate short technical insert if a detailed status overlay is useful for developers.

## Edit and accessibility checks

- Put the result before the explanation; do not open on logos or a long boot sequence.
- Label every mock-up, diagram or recreated screen. Gameplay footage must be a real run.
- Use burned-in text only for the few claims that survive without narration; keep it inside mobile-safe margins.
- Add human-reviewed captions, a text transcript and descriptive alt text for every poster/photo.
- Review each loop's accessible description, caption, poster, and exact page
  placement against the finished pixels. The WebM and MP4 in a pair must carry
  identical reviewed copy and placements in the manifest.
- Review every first-to-last loop transition at normal speed and frame by frame;
  record the result before setting `loopSeamReviewed` to true.
- Never use AI-generated gameplay or synthetic “proof” footage.
- Use only original, public-domain or appropriately licensed music, fonts, icons and sound effects. Keep the licence/receipt with the project records.
- Export one clean master, then derive web/social variants. Do not repeatedly transcode a delivery copy.
- Preserve raw-file hashes and an edit-decision/proof map, then make the public manifest resolve every delivery frame to a public-safe source ID.
- Use [final-media-markup.md](templates/final-media-markup.md) only after all
  files and copy have passed review; the live site must keep its explicit
  pre-recording placeholders until then.

## Final acceptance

The media is ready only when a viewer unfamiliar with the project can answer all four questions after one watch:

1. What is new? Two live host streams become one couch co-op display.
2. What runs where? The Umbra host runs on the gaming PCs; the Eclipse client runs at the shared display.
3. What has been tested? The video points to the status table of tested hardware rather than promising every combination works.
4. Who made the foundations? The video and description credit Moonlight, Sunshine, Moonlight TV, Aurora and Apollo with links.

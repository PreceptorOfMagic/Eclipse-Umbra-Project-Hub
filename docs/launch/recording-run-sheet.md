# Eclipse/Umbra launch recording run sheet

Use this sheet for the real launch shoot after the release candidates are frozen. It turns the [recording plan](recording-plan.md) into a take-by-take record and preserves the evidence needed to describe the footage honestly.

The editable title hierarchy is fixed: **Eclipse/Umbra** is the project, **Eclipse** is the client application and **Umbra** is the host application. **Moonlight**, **Sunshine**, **Moonlight TV**, **Aurora** and **Apollo** appear only in factual lineage and credit material.

Do not stage the proof with playback, duplicate one host into two panes, substitute a diagnostic recording or use synthetic gameplay. Record a clean, unbranded master before adding titles.

## 1. Production record

Complete every field before the first launch take. Preserve this completed sheet with the edit project, outside the public repository if it contains private details.

| Field | Recording value |
|---|---|
| Shoot date, local time and timezone | `[FILL]` |
| Producer/operator | `[FILL]` |
| Camera operator | `[FILL]` |
| Players and recorded consent | `[FILL — keep private names off public screens]` |
| Location/release for identifiable property | `[FILL]` |
| Eclipse commit, version and artifact SHA-256 | `[FILL]` |
| Umbra host A commit, version and artifact SHA-256 | `[FILL]` |
| Umbra host B commit, version and artifact SHA-256 | `[FILL]` |
| TV/client hardware and OS version | `[FILL]` |
| Host A CPU/GPU/OS | `[FILL]` |
| Host B CPU/GPU/OS | `[FILL]` |
| Network path used in the demonstration | `[FILL — public description only; no addresses]` |
| Game/demo and version | `[FILL]` |
| Gameplay promotional-use evidence | `[URL, licence or archived permission evidence]` |
| Music/sound effects and licence evidence | `[FILL or “none”]` |
| Fonts/icons/artwork and licence evidence | `[FILL]` |
| Voice/room audio consent | `[FILL or “no voices recorded”]` |
| Camera/phone and capture settings | `[FILL]` |
| Edit application and project location | `[FILL — outside Git]` |

### 1A. Rights and consent clearance register

One row is required for every person, voice, game, music cue, sound effect,
font, icon, artwork and recognisable private property that can appear in a raw
source or public delivery. “Free”, “owned” or a store receipt is not a usage
right. Archive the actual licence/release evidence; do not rely on a link that
may change.

| ID | Asset, person or property | Where it appears | Rights holder | Likeness, voice or guardian status | Exact licence/release scope | Required attribution | Restrictions/expiry | Evidence path or URL, captured date and SHA-256 | Reviewer/result |
|---|---|---|---|---|---|---|---|---|---|
| CLR-01 | `[FILL]` | `[FILL]` | `[FILL]` | `[FILL or N/A]` | `[FILL]` | `[FILL or none]` | `[FILL or none]` | `[FILL]` | `[FILL]` |

### 1B. Privacy review register

Prepare clean demonstration accounts and public-safe host aliases before the
shoot. Review every raw source and every delivery independently: cropping one
export does not clear the source used by another. Preserve private review
records outside Git and put only public-safe source IDs in the media manifest.

| Source/delivery ID | Review date and reviewer | IDs, chat, friends and save names | Account/machine names | QR/pairing codes, serials and addresses | Location clues/reflections | Voices | EXIF/XMP/IPTC/container metadata | Redaction timecodes or result |
|---|---|---|---|---|---|---|---|---|
| PRV-01 | `[FILL]` | `[FILL]` | `[FILL]` | `[FILL]` | `[FILL]` | `[FILL]` | `[FILL]` | `[FILL]` |

### 1C. Capture-source decision and handles

Choose the source path before rolling and copy the final wording into each
manifest source's `captureMethod`. For continuous and screen captures, the
accepted source must retain at least two clean seconds before and after every
selected interval. A delivery interval does not include those handles.

| Public source ID | Deliveries supplied | Preferred source | Selected source/capture method and reason | Clean pre-roll | Clean post-roll | Operator/reviewer |
|---|---|---|---|---:|---:|---|
| `proof-take-01` | Hero, independent-input and layout-switch loop pairs plus their posters | Direct capture of the composed Eclipse client output during one uninterrupted live run; fallback is documented HDMI capture or a locked camera showing that actual display | `[FILL before rolling]` | `[FILL; minimum 2.000 s]` | `[FILL; minimum 2.000 s]` | `[FILL]` |
| `setup-flow-01` | Setup-flow loop pair and poster | Direct capture of the real Eclipse setup interface using public-safe aliases | `[FILL before rolling]` | `[FILL; minimum 2.000 s]` | `[FILL; minimum 2.000 s]` | `[FILL]` |
| `single-host-01` | Single-host loop pair and poster | Direct capture of a conventional live Eclipse-to-Umbra session | `[FILL before rolling]` | `[FILL; minimum 2.000 s]` | `[FILL; minimum 2.000 s]` | `[FILL]` |
| `room-photo-01` | `living-room-wide.webp` | Locked-camera photograph of the actual television and controller arrangement | `[FILL before capture]` | N/A | N/A | `[FILL]` |
| `picker-still-01` | `coop-picker.webp` | Direct still capture of the real Eclipse setup interface using public-safe aliases | `[FILL before capture]` | N/A | N/A | `[FILL]` |
| `walkthrough-master-01` | Hosted walkthrough, captions and transcript | Reviewed upload master assembled only from accepted sources and editable credit graphics | `[FILL after picture lock]` | N/A | N/A | `[FILL]` |

## 2. Before rolling

- [ ] The exact Eclipse and Umbra release candidates above are installed, opened and visibly identified.
- [ ] Capture media have been cleared and every recorder has at least twice the expected shoot size free.
- [ ] Cameras, capture devices and audio recorders are on mains power or have charged spares within reach.
- [ ] Camera, screen-capture and audio-recorder clocks/timecode have been synchronised and the reference is recorded below.
- [ ] The deterministic naming pattern `[shoot]-[source]-[slate]-[take]` is configured before any source is created.
- [ ] Two independent backup destinations exist, accept a test file and have been read back successfully.
- [ ] Both hosts are live encodes. No playback-file test is armed.
- [ ] Host A and host B show distinguishable current content and each responds only to its assigned player.
- [ ] Both the side-by-side and stacked layouts have been exercised before recording.
- [ ] The physical TV image has been inspected; neither pane is black, stale, flat-colour or frozen.
- [ ] Notifications, overlays, account names, host names, IP addresses, pairing codes, browser history and private bookmarks are hidden.
- [ ] Reflections have been checked from the actual camera position.
- [ ] In-game licensed music and voice chat are disabled unless their public use is documented above.
- [ ] OLED exposure, focus, shutter and white balance are locked and a ten-second test does not flicker or roll.
- [ ] A ten-second pilot has been imported and watched on the actual editing machine for cadence, dropped/duplicate frames, rolling bands, focus, exposure, white balance, audio sync and codec support.
- [ ] Controllers, room and cabling are deliberately framed; unrelated branded packaging is removed.
- [ ] At least ten seconds of room tone is recorded if narration or live room audio will be used.
- [ ] A slate identifies the date, build record and take number, but will not appear in the public export.

Clock/timecode reference: `[FILL]`

Primary backup and read-back result: `[FILL]`

Secondary backup and read-back result: `[FILL]`
Pilot filename, SHA-256 and review result: `[FILL]`

Repeat these checks immediately before every take that may be accepted:

- [ ] Both panes are live, current, visibly distinct and independently controlled.
- [ ] No playback/test-file state is armed and the physical TV image has been viewed.
- [ ] Notifications, identifiers, codes, reflections and unintended voices remain absent.
- [ ] Slate/take ID, clocks, focus, exposure, white balance and audio state are correct.

## 3. Proof take — record this continuously

This uninterrupted take is the factual backbone. Capture it before beauty shots so editing cannot accidentally conceal whether both panes were truly live.

1. Begin on the real Eclipse co-op session with both Umbra hosts visible.
2. Player 1 performs a distinctive action while player 2 remains still.
3. Player 2 performs a different distinctive action while player 1 remains still.
4. Both players move simultaneously for at least five seconds.
5. Open the actual layout control and switch from side by side to stacked without stopping the capture.
6. Return to live play and repeat one brief simultaneous action.

| Take | Camera/capture filename | Start timecode | End timecode | Host A independent | Host B independent | Simultaneous action | Layout switch | Visual pass | Notes |
|---|---|---:|---:|---|---|---|---|---|---|
| 1 | `[FILL]` | `[FILL]` | `[FILL]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[FILL]` |
| 2 | `[FILL]` | `[FILL]` | `[FILL]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[FILL]` |
| 3 | `[FILL]` | `[FILL]` | `[FILL]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[ ]` | `[FILL]` |

### Footage inventory

Record every source as soon as it is copied. `Public source ID` is the neutral
identifier used by `site/media/media-manifest.json`; the public manifest must
not expose a private directory, account name or location. Rejected takes stay
in the private log so the selection cannot become ambiguous.

| Public source ID | Slate/take | Capture method | Private source filename | Bytes | SHA-256 | Start/end | Pre/post handles | Resolution, FPS, shutter and audio | Clock/sync reference | Backup locations and read-back | Accepted/rejected and reason |
|---|---|---|---|---:|---|---|---|---|---|---|---|
| SRC-01 | `[FILL]` | `[FILL — match section 1C]` | `[FILL]` | `[FILL]` | `[FILL]` | `[FILL]` | `[FILL; minimum 2.000 s each for continuous/screen captures]` | `[FILL]` | `[FILL]` | `[FILL]` | `[FILL]` |

## 4. Shot log

Do not mark a shot complete merely because the file exists. Review it at normal speed and frame by frame around transitions.

| ID | Planned picture | Target usable length | Required proof/detail | Best take/file | Result and notes |
|---|---|---:|---|---|---|
| S01 | Wide room: one TV and two controllers | 5 s | Shared physical setting; no private detail or distracting reflection | `[FILL]` | `[FILL]` |
| S02 | Close composed Eclipse output with both panes acting simultaneously | 6–8 s | Continuous live motion suitable for the hero loop | `[FILL]` | `[FILL]` |
| S03 | Player 1 action, player 2 action, then both | 8 s | One continuous interval for the exact independent-input loop | `[FILL]` | `[FILL]` |
| S04 | Additional isolated-input safety take | 8 s | Same order as S03; both panes remain continuously visible | `[FILL]` | `[FILL]` |
| S05 | Two-host picker | 4 s | Both intended Umbra hosts selected using public-safe aliases; any unavoidable redaction is logged below | `[FILL]` | `[FILL]` |
| S06 | Real setup flow: two hosts, layout and input assignment | 10 s | Public-safe aliases and separate controller ownership are legible | `[FILL]` | `[FILL]` |
| S07 | Side-by-side gameplay | 12 s | Both panes current; neither is spectating the other | `[FILL]` | `[FILL]` |
| S08 | Side-by-side to stacked layout switch | 10 s | Real transition remains visible; no hidden restart or playback cut | `[FILL]` | `[FILL]` |
| S09 | Normal one-host Eclipse session | 6 s | Exact live interval for the single-host loop | `[FILL]` | `[FILL]` |
| S10 | Clean still for `coop-hero-poster.webp` | 2 s | Representative, sharp frame with both panes active | `[FILL]` | `[FILL]` |
| S11 | Living-room still for `living-room-wide.webp` | still | TV, two controllers, intentional room composition | `[FILL]` | `[FILL]` |
| S12 | Setup still for `coop-picker.webp` | still | Host, layout and input choices readable at site size | `[FILL]` | `[FILL]` |

The architecture diagram is a separate, clearly illustrative asset—not evidence footage. It must read: **Umbra host A + Umbra host B → Eclipse client → shared display**.

### Required delivery cuts

The source timecodes below are the planned template mapping. Replace them in
both this sheet and the manifest if the accepted take differs; never adjust one
without the other. WebM and MP4 variants use the identical source interval.

| Delivery group | Required source | Exact delivery length | Accepted source in/out | Poster source time/frame | Content review |
|---|---|---:|---|---|---|
| Hero loop + `coop-hero-poster.webp` | `proof-take-01` | 6–8 s; template cut 7 s | `[FILL; template 00:00:10.000–00:00:17.000]` | `[FILL; template 00:00:12.000 / frame 720]` | Both panes visibly current and moving |
| Independent-input loop + poster | `proof-take-01` | Exactly 8.000 s | `[FILL; template 00:00:02.000–00:00:10.000]` | `[FILL; template 00:00:06.000 / frame 360]` | Host A only, host B only, then both |
| Layout-switch loop + poster | `proof-take-01` | Exactly 10.000 s | `[FILL; template 00:00:20.000–00:00:30.000]` | `[FILL; template 00:00:25.000 / frame 1500]` | Side by side, visible real switch, stacked |
| Setup-flow loop + poster | `setup-flow-01` | Exactly 10.000 s | `[FILL; template 00:00:03.000–00:00:13.000]` | `[FILL; template 00:00:08.000 / frame 480]` | Two hosts, layout and separate input ownership |
| Single-host loop + poster | `single-host-01` | Exactly 6.000 s | `[FILL; template 00:00:03.000–00:00:09.000]` | `[FILL; template 00:00:06.000 / frame 360]` | Conventional live one-host session |

### Edit-decision and proof map

Every factual claim in the final cut maps to an accepted source hash. Add one
row for every continuous output range and for every still. Treatments must
identify crops, speed changes, diagrams and redactions; never use a treatment
that hides a discontinuity in the proof take.

| Output timecode/delivery | Source ID and SHA-256 | Source in/out or exact frame | Shot/claim proved | Crop, redaction, diagram or other treatment | Reviewer/result |
|---|---|---|---|---|---|
| `[FILL]` | `[FILL]` | `[FILL]` | `[FILL]` | `[FILL or none]` | `[FILL]` |

| Public still | Accepted source ID and SHA-256 | Exact source timecode/frame | Proof-take ID, if applicable | Reviewer/result |
|---|---|---|---|---|
| `coop-hero-poster.webp` | `[FILL]` | `[FILL]` | `[FILL]` | `[FILL]` |
| `coop-independent-input-poster.webp` | `[FILL]` | `[FILL]` | `[FILL]` | `[FILL]` |
| `coop-layout-switch-poster.webp` | `[FILL]` | `[FILL]` | `[FILL]` | `[FILL]` |
| `coop-setup-flow-poster.webp` | `[FILL]` | `[FILL]` | N/A | `[FILL]` |
| `single-host-poster.webp` | `[FILL]` | `[FILL]` | N/A | `[FILL]` |
| `coop-picker.webp` | `[FILL]` | `[FILL]` | `[FILL or N/A]` | `[FILL]` |
| `living-room-wide.webp` | `[FILL]` | `[FILL]` | N/A | `[FILL]` |

## 5. One-hundred-second assembly script

This is a timing and fact scaffold. The final narration should be read naturally and adjusted to the actual footage; do not preserve a line that the finished cut does not prove.

| Time | Edit | Narration/caption seed |
|---|---|---|
| 0–5 s | S01 wide shot, then cut toward the TV | “Two gaming PCs. Two players. One shared screen.” |
| 5–12 s | S02 simultaneous live action | “Both pictures are live, and each player controls a different PC.” |
| 12–20 s | Simple architecture diagram | “Umbra runs on each gaming PC. Eclipse receives both streams and composes them at the TV.” |
| 20–32 s | S05 and S06 setup views | “Choose two hosts, choose a layout, then assign each controller to its player.” |
| 32–44 s | S07 side-by-side play | “Each game keeps its own instance and network session while the room gets a couch co-op view.” |
| 44–54 s | S08 stacked layout and primary change | “Place the panes side by side or stack them, then swap which host is left, top or primary.” |
| 54–63 s | S09 single-host session plus supported-platform cards | “Eclipse also remains a conventional one-host streaming client.” |
| 63–75 s | Text-only Moonlight origin card | Show Moonlight founders Cameron Gutman, Diego Waxemberg, Aidan Campbell, Aaron Neyer, Michelle Bergeron and Andrew Hennessy. Narration begins: “This exists because open-source creators shared the foundations first.” |
| 75–85 s | Text-only Sunshine origin card | Show Sunshine creator @loki-47-6F-64 and the current LizardByte maintainers; continue the acknowledgement without a product claim. |
| 85–95 s | Text-only lineage card | Show Moonlight TV by Mariotaku, Aurora by GuiDev1994 and Apollo by @ClassicOldSong. Link the complete acknowledgements in the video description. |
| 95–100 s | Project mark and source/status URL | “Eclipse/Umbra is free and open source.” |

Do not add a funding appeal to this cut. The source/status call to action and the credits are the only closing messages.

## 6. Edit and export record

- [ ] The proof sequence is drawn from a continuous live take identified above.
- [ ] No edit implies that a layout switch, host selection or input result happened differently from the recorded run.
- [ ] Every diagram/recreated screen is visibly distinguishable from live footage.
- [ ] Final names follow the Eclipse/Umbra hierarchy; inherited names appear only on the lineage card or in accurate inherited UI.
- [ ] The credits card remains readable for its full duration and the description links the complete acknowledgements.
- [ ] Each of the three credit cards remains readable at the smallest intended display size without pausing.
- [ ] Captions have been human-reviewed against the final audio and include meaningful non-speech sounds.
- [ ] The transcript describes the important visual proof, not only the spoken words.
- [ ] Poster/photo alt text says what is visibly present and does not add unproven performance claims.
- [ ] Each WebM/MP4 pair has identical accessible description, caption,
      poster reference and placements in the manifest.
- [ ] Delivery photographs have been inspected with an EXIF/XMP metadata tool; location, device, owner, timestamps and editing-history fields are absent.
- [ ] A clean archival master exists before web/social transcodes.
- [ ] The final clip has been watched with sound off and with captions on.

### Accessibility copy and placement review

These strings are the launch copy currently bound in the manifest template.
The reviewer must compare them with the accepted pixels, record any necessary
correction in both places, and approve the final text before integration.

| Delivery group | Accessible description or still alt text | Caption | Required placements | Reviewer/result |
|---|---|---|---|---|
| Hero loop | “Two different game views share one split screen while action continues in both panes.” | “Eclipse combines two reviewed live Umbra sessions on one shared display.” | `site/index.html#hero`; `site/media.html#hero-reel` | `[FILL]` |
| Hero poster | “Two different game views appear in the left and right panes of one split screen.” | “Eclipse combines two reviewed live Umbra sessions on one shared display.” | `site/index.html#hero`; `site/media.html#hero-reel` | `[FILL]` |
| Independent-input loop | “The left game view moves while the right remains still, then the right moves, followed by both views together.” | “Each controller is shown affecting its assigned Umbra host before both players act together.” | `site/index.html#media`; `site/media.html#feature-loops` | `[FILL]` |
| Independent-input poster | “A split screen shows a different game view in each of its two panes.” | Same as its loop | `site/index.html#media`; `site/media.html#feature-loops` | `[FILL]` |
| Layout-switch loop | “Two game views change from side by side to stacked while the session continues.” | “The real Eclipse layout control changes the running co-op session without hiding the transition.” | `site/index.html#media`; `site/media.html#feature-loops` | `[FILL]` |
| Layout-switch poster | “Two game views are arranged one above the other in a stacked layout.” | Same as its loop | `site/index.html#media`; `site/media.html#feature-loops` | `[FILL]` |
| Setup-flow loop | “Eclipse selects two Umbra hosts, a layout and a separate controller for each host.” | “The public-safe setup flow joins two selected hosts and makes input ownership explicit.” | `site/media.html#feature-loops` | `[FILL]` |
| Setup-flow poster | “Eclipse co-op setup shows two selected hosts, a layout and separate controller assignments.” | Same as its loop | `site/media.html#feature-loops` | `[FILL]` |
| Single-host loop | “A single game fills the Eclipse client during a conventional one-host stream.” | “The ordinary Eclipse-to-Umbra streaming path remains available alongside co-op.” | `site/media.html#feature-loops` | `[FILL]` |
| Single-host poster | “One game view fills the Eclipse client display during a single-host session.” | Same as its loop | `site/media.html#feature-loops` | `[FILL]` |
| `living-room-wide.webp` | “A television showing two game panes with two controllers arranged in front of it.” | “The shared-screen setup used for the reviewed co-op demonstration.” | `site/index.html#media`; `site/media.html#photography` | `[FILL]` |
| `coop-picker.webp` | “Eclipse co-op setup showing two selected Umbra hosts, a layout choice and separate controller assignments.” | “The real host, layout and input picker used for the reviewed run.” | `site/index.html#media`; `site/media.html#photography` | `[FILL]` |
| Captions and transcript | Human-reviewed dialogue, speakers, meaningful sounds, visual descriptions and final links | N/A | Hosted captions; `site/walkthrough.html#transcript`; downloadable `site/media/coop-walkthrough.en.vtt` | `[FILL]` |

### Loop-seam review

| Loop pair | Normal-speed repeat watched | First/last frames inspected | Repeat remains truthful and non-distracting | Reviewer/date |
|---|---|---|---|---|
| `coop-hero-loop` | `[ ]` | `[ ]` | `[ ]` | `[FILL]` |
| `coop-independent-input-loop` | `[ ]` | `[ ]` | `[ ]` | `[FILL]` |
| `coop-layout-switch-loop` | `[ ]` | `[ ]` | `[ ]` | `[FILL]` |
| `coop-setup-flow-loop` | `[ ]` | `[ ]` | `[ ]` | `[FILL]` |
| `single-host-loop` | `[ ]` | `[ ]` | `[ ]` | `[FILL]` |

Set `loopSeamReviewed: true` only after all three review cells in that row are
complete. A truthful but intentionally visible transition may pass; a repeat
that implies an action or state change that did not occur may not.

| Export | File or hosted URL | Duration | Dimensions/FPS | Codec | Size | SHA-256 | Review result |
|---|---|---:|---|---|---:|---|---|
| Clean archival master | `[FILL — outside Git]` | `[FILL]` | `[FILL]` | `[FILL]` | `[FILL]` | `[FILL]` | `[FILL]` |
| Walkthrough upload master | `[outside Git]/eclipse-umbra-coop-walkthrough-1080p60.mp4` and `[FINAL PUBLIC HTTPS URL]` | `[FILL; 90–105 s, target 100]` | 1920×1080 / 60 fps | H.264 High, `yuv420p`, Rec.709 limited range; AAC 48 kHz | `[FILL]` | `[FILL — source walkthrough-master-01]` | `[FILL; include signed-out playback and hosted-caption check]` |
| Hero WebM | `site/media/coop-hero-loop.webm` | `[FILL; 6–8 s]` | 1920×1080 / 30–60 fps | VP9 Profile 0, `yuv420p`, Rec.709 limited, no audio | `[FILL; ≤10 MiB]` | `[FILL]` | `[FILL]` |
| Hero MP4 | `site/media/coop-hero-loop.mp4` | `[FILL; same as WebM]` | 1920×1080 / same as WebM | H.264 High, `yuv420p`, Rec.709 limited, fast start, no audio | `[FILL; ≤12 MiB]` | `[FILL]` | `[FILL]` |
| Hero poster | `site/media/coop-hero-poster.webp` | — | 1920×1080 | WebP | `[FILL; ≤750 KiB]` | `[FILL]` | `[FILL]` |
| Independent-input WebM | `site/media/coop-independent-input-loop.webm` | 8.000 s | 1280×720 / 60 fps | VP9 Profile 0, `yuv420p`, Rec.709 limited, no audio | `[FILL; ≤4 MiB]` | `[FILL]` | `[FILL]` |
| Independent-input MP4 | `site/media/coop-independent-input-loop.mp4` | 8.000 s | 1280×720 / 60 fps | H.264 High, `yuv420p`, Rec.709 limited, fast start, no audio | `[FILL; ≤5 MiB]` | `[FILL]` | `[FILL]` |
| Independent-input poster | `site/media/coop-independent-input-poster.webp` | — | 1280×720 | WebP | `[FILL; ≤400 KiB]` | `[FILL]` | `[FILL]` |
| Layout-switch WebM | `site/media/coop-layout-switch-loop.webm` | 10.000 s | 1280×720 / 60 fps | VP9 Profile 0, `yuv420p`, Rec.709 limited, no audio | `[FILL; ≤4 MiB]` | `[FILL]` | `[FILL]` |
| Layout-switch MP4 | `site/media/coop-layout-switch-loop.mp4` | 10.000 s | 1280×720 / 60 fps | H.264 High, `yuv420p`, Rec.709 limited, fast start, no audio | `[FILL; ≤5 MiB]` | `[FILL]` | `[FILL]` |
| Layout-switch poster | `site/media/coop-layout-switch-poster.webp` | — | 1280×720 | WebP | `[FILL; ≤400 KiB]` | `[FILL]` | `[FILL]` |
| Setup-flow WebM | `site/media/coop-setup-flow-loop.webm` | 10.000 s | 1280×720 / 60 fps | VP9 Profile 0, `yuv420p`, Rec.709 limited, no audio | `[FILL; ≤4 MiB]` | `[FILL]` | `[FILL]` |
| Setup-flow MP4 | `site/media/coop-setup-flow-loop.mp4` | 10.000 s | 1280×720 / 60 fps | H.264 High, `yuv420p`, Rec.709 limited, fast start, no audio | `[FILL; ≤5 MiB]` | `[FILL]` | `[FILL]` |
| Setup-flow poster | `site/media/coop-setup-flow-poster.webp` | — | 1280×720 | WebP | `[FILL; ≤400 KiB]` | `[FILL]` | `[FILL]` |
| Single-host WebM | `site/media/single-host-loop.webm` | 6.000 s | 1280×720 / 60 fps | VP9 Profile 0, `yuv420p`, Rec.709 limited, no audio | `[FILL; ≤4 MiB]` | `[FILL]` | `[FILL]` |
| Single-host MP4 | `site/media/single-host-loop.mp4` | 6.000 s | 1280×720 / 60 fps | H.264 High, `yuv420p`, Rec.709 limited, fast start, no audio | `[FILL; ≤5 MiB]` | `[FILL]` | `[FILL]` |
| Single-host poster | `site/media/single-host-poster.webp` | — | 1280×720 | WebP | `[FILL; ≤400 KiB]` | `[FILL]` | `[FILL]` |
| Room photo | `site/media/living-room-wide.webp` | — | 1920×1080 | WebP, metadata stripped | `[FILL; ≤1 MiB]` | `[FILL]` | `[FILL]` |
| Picker image | `site/media/coop-picker.webp` | — | 1920×1080 | WebP, metadata stripped | `[FILL; ≤1 MiB]` | `[FILL]` | `[FILL]` |
| Captions | `site/media/coop-walkthrough.en.vtt` | `[FILL; match hosted master]` | — | WebVTT | `[FILL; ≤100 KiB]` | `[FILL]` | `[FILL]` |
| Transcript | `site/media/coop-walkthrough-transcript.md` | — | — | Markdown | `[FILL; ≤100 KiB]` | `[FILL]` | `[FILL]` |
| Public media manifest | `site/media/media-manifest.json` | — | — | JSON schema v2 | `[FILL; ≤100 KiB]` | `[FILL]` | `[FILL]` |

## 7. Acceptance and teardown

- [ ] `node scripts/launch/check_media.mjs` passes against the reviewed exports.
- [ ] All five loop pairs, all five posters, both stills, captions, transcript
      and manifest are present; every delivery hash matches its file.
- [ ] Every visual lineage entry resolves to the footage inventory, each paired
      loop uses one identical source interval, and every poster/still frame
      record matches the edit project.
- [ ] The exact walkthrough upload master name, SHA-256, technical properties,
      hosted URL, captions and signed-out playback reviews match the manifest.
- [ ] Accessibility descriptions, alt text, captions and placements match the
      final page markup and the accepted pixels.
- [ ] One unfamiliar viewer can explain that two independent live hosts are being combined at one client.
- [ ] That viewer can identify Umbra as the host application and Eclipse as the client application.
- [ ] That viewer notices the upstream credits.
- [ ] The public video description uses the verified project URLs and credits the upstream projects named in [ACKNOWLEDGEMENTS.md](../../ACKNOWLEDGEMENTS.md).
- [ ] The test harness and any auxiliary capture receiver are closed on both hosts after the final take or any aborted take.
- [ ] No recording-only control or playback state remains armed.

Final reviewer: `[FILL]`

Review date: `[FILL]`
Approved delivery commit: `[FILL]`

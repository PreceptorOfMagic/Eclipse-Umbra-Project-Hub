# Public feature-claim evidence ledger

This ledger ties consumer-facing Eclipse/Umbra copy to current implementation
evidence. It is not a substitute for release testing. A code path proves that a
capability is implemented; it does not prove that every hardware, driver, codec,
display or network combination works.

Evidence was reviewed on 30 September 2026. Eclipse paths are relative to this
repository. Umbra paths are relative to the Umbra source repository reviewed on
branch `codex/mixed-beta-profile` at commit `ae235282`. That Umbra worktree was
dirty and unpublished at review time, so its entries describe current development
source rather than a released artifact.

## Eclipse client

| Public claim | Source evidence | Boundary on the claim |
|---|---|---|
| Eclipse provides decoder-gated 720p, 1080p, 1440p, 3584×2016 “3.6K” and 4K presets, plus native/custom resolutions. | `src/app/ui/settings/panes/pref_res.c:39-46`, `:80-139`, `:376-390` | Do not claim that 3.6K is inherently more stable or lower-latency than 4K. It is 87.1% of 4K's pixel count. |
| Frame-rate presets run from 30 to 240 fps and custom fractional rates can be sent. | `src/app/ui/settings/panes/basic.pane.c:121-143`; `src/app/ui/settings/panes/pref_fps.c:163-239`; `core/moonlight-common-c/src/SdpGenerator.c:509-510` | The selected decoder, host, display and network still determine what works. |
| Automatic bitrate follows resolution and refresh rate; a 5–400 Mbps manual selector is exposed. | `src/app/ui/settings/panes/basic.pane.c:153-160`, `:210-246`; `src/app/app_settings.c:684-748` | Do not claim 400 Mbps of delivered video. Moonlight's current negotiation reserves FEC headroom and caps the video allocation at 100,000 kbps: `core/moonlight-common-c/src/SdpGenerator.c:369-405`. |
| Codec selection is capability-gated across H.264, HEVC/Main10 and AV1/Main8/Main10; HDR requires a capable decoder with HEVC or AV1. | `src/app/stream/session.c:789-806`; `src/app/ui/settings/panes/video.pane.c:245-262` | This is negotiation logic, not proof that every platform exposes every option. |
| Compatible webOS hardware can expose H.264, H.265, AV1 and HDR/BT.2020 paths. | `third_party/ss4s/modules/webos/ndl/webos5/ndl_video.c:13-31`, `:41-68` | The project has live HEVC Main10/HDR evidence on its LG G5 rig, but no equivalent live AV1 verdict. Do not generalise to all LG models. |
| Current desktop previews expose H.264 and HEVC decode. | `third_party/ss4s/modules/ffmpeg/ffmpegvid.c:196-224`, `:416-491` | Do not advertise desktop AV1 or HDR from this evidence. |
| The live overlay exposes keyboard, virtual mouse, disconnect/quit and detailed stream statistics. | `src/app/ui/streaming/streaming.view.c:84-215`; `src/app/ui/streaming/streaming.controller.c:259-410` | Statistics describe the active session; they are not independent compatibility proof. |
| Eclipse has a full on-screen keyboard and an opt-in gamepad virtual mouse. | `src/app/ui/streaming/soft_keyboard.c:46-131`, `:220-308`, `:374-434`; `src/app/stream/input/session_virt_mouse.c:22-69`; `src/app/stream/input/session_gamepad.c:222-248`, `:540-545` | Do not advertise the keyboard's unimplemented microphone key. In co-op, relative/virtual-mouse input targets the primary pane rather than the hovered pane. |
| Controller forwarding is capability-aware and can include touchpad, rumble, trigger rumble, accelerometer, gyro and RGB LED features. | `src/app/input/app_input.c:8-23`; `src/app/stream/input/session_gamepad.c:251-337`, `:382-456` | Support depends on controller, client platform and host. The optional webOS raw-HID bridge remains experimental and falls back to standard emulation. |
| Conventional single-host streaming remains a first-class path. | `src/app/ui/launcher/apps.controller.c:768-818`, `:998-1011`; `src/app/stream/session_worker.c:41-53`, `:93-95` | Do not present Eclipse solely as a two-host compositor. |

## Umbra host

| Public claim | Source evidence in the Umbra repository | Boundary on the claim |
|---|---|---|
| Umbra retains a Moonlight-compatible host/session stack and browser configuration interface. | `src/nvhttp.cpp:1893`; `src/main.cpp:400`; `src/confighttp.cpp:294`, `:1524` | These paths were reviewed in development source, not a public release artifact. |
| Browser PIN pairing and persistent paired-device records are implemented. | `src/confighttp.cpp:1263`; `src/nvhttp.cpp:635`; `src/crypto.h:42` | Pairing is not a claim that the host is safe to expose directly to the public internet. |
| Paired devices can receive granular input, clipboard, command, listing, viewing and launch permissions plus display overrides. | `src/nvhttp.cpp:662`; `src_assets/common/assets/web/pin.html:85`, `:552`; enforcement at `src/input.cpp:1579`, `src/nvhttp.cpp:1316`, `src/stream.cpp:1007`, `:1958` | Do not describe every paired device as having unrestricted access. |
| Umbra can create an on-demand Windows virtual display at the client-requested dimensions and refresh rate and remove it when the app/session is terminated. | `src/process.cpp:237`, `:282`, `:858`; `src/platform/windows/virtual_display.cpp:656` | A temporary disconnect can preserve the resumable session; do not say the virtual display is removed on every disconnect. |
| Client resolution, refresh rate and optional HDR requests feed the Windows display path. | `src/nvhttp.cpp:458`; `src/display_device.cpp:306`, `:364`, `:411`, `:523`; `src/process.cpp:540` | This proves implementation paths, not universal HDR or mode support. |
| Text clipboard synchronisation is implemented for a permitted active stream. | `src/nvhttp.cpp:1702`, `:1906`; `src/platform/windows/misc.cpp:1859` | It is text clipboard synchronisation, not file transfer. |
| Per-device connection/disconnection hooks and global/application preparation hooks remain available. | `src/nvhttp.cpp:496`; `src/stream.cpp:2053`, `:2132`; `src/process.cpp:463`, `:701` | Public copy should describe hooks, not promise a particular user script. |
| Umbra probes NVIDIA NVENC, Intel Quick Sync, AMD AMF and software encoders and selects a working path at runtime. | `src/video.cpp:491`, `:627`, `:736`, `:858`, `:2815` | Do not claim that every codec works on every GPU. |
| Optional input-only access, browser app management and stereo/5.1/7.1 low-delay Opus configurations remain implemented. | `src/process.cpp:1651`; `src/nvhttp.cpp:1411`; `src/confighttp.cpp:1535`; `src/audio.cpp:38` | The surround modes describe ordinary host sessions. Eclipse co-op requests stereo from both hosts and mixes or selects those two sources (`src/app/stream/audio/coop_audio.c:39,151-157`); availability still depends on the final release configuration and client. |

Umbra intentionally uses one stable built-in Virtual Display application identity
across clients (`src/process.cpp:1596`, where `use_app_identity = true` and
`per_client_app_identity = false`). Paired clients still have distinct UUIDs,
permissions, mode overrides and commands. Do **not** repeat Apollo wording that
implies a separate fixed virtual-display identity for each client.

## Eclipse/Umbra co-op

The core public description is supported by the co-op design and implementation
documentation: two independent PCs stream current frames to the Eclipse client,
which composes side-by-side or stacked panes and assigns input ownership. See
`docs/coop-split-DESIGN.md`, `docs/windows-coop-setup.md` and the implementation
surface identified in `README.md`.

Keep the following boundaries explicit:

- Current co-op sessions are HEVC-only. Known NVIDIA/NVIDIA pairs use the native
  HEVC path; known NVIDIA/AMD or AMD/AMD pairs automatically request the
  experimental GPU-HEVC encoder on both hosts. The retired H.264 compatibility
  value is normalised to HEVC rather than selecting an AVC session
  (`src/app/stream/video/coop_stream_mode.h:1-9,34-40,90`;
  `src/app/stream/video/coop_stream_mode.c:90-96`;
  `src/app/stream/session.c:848-853`).
- Player 1 is the primary pane: left in side-by-side mode and top in stacked
  mode (`src/app/ui/launcher/coop.dialog.c:1004-1010`). Relative mouse movement
  and the gamepad virtual mouse target that primary pane rather than following
  hover.
- Co-op does not add multiplayer to a single-player game. Each host runs its own
  game session, so licences, accounts and game networking remain game-specific.
- It is not prerecorded playback, a spectator feed or one host mirroring the
  other.
- The current public status is an engineering preview. Real-game acceptance,
  platform breadth and consumer packages remain release gates.

## Claims that must not be published

- “Works on every LG TV,” “works with every GPU” or equivalent universal support.
- Desktop AV1/HDR support based only on the current webOS capability paths.
- A delivered 400 Mbps video stream; 400 Mbps is the UI selector ceiling, not the
  current negotiated video allocation.
- A dedicated virtual-display identity for every Umbra client.
- Clipboard file transfer.
- An implemented microphone key in the Eclipse on-screen keyboard.
- “3.6K is faster,” “more stable” or “lower latency” without a release-specific
  measured comparison.

## Release re-verification

Before public copy is frozen:

1. Record the exact Eclipse and Umbra release commits and ensure this ledger points
   to those trees rather than dirty development worktrees.
2. Confirm each cited path still implements the stated behaviour after rebases or
   upstream merges.
3. Test the advertised codec, HDR, resolution, refresh-rate, controller and audio
   combinations on the hardware named in the public support matrix.
4. Replace implementation-only wording with measured compatibility wording only
   where a live test and visual verdict support it.
5. Reconcile the website, README, release notes and repository descriptions against
   this ledger, then remove any claim that lacks current evidence.

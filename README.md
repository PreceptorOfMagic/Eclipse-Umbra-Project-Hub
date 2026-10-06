<p align="center"><img src="site/assets/og-card.png" alt="Eclipse/Umbra — two PCs, one screen, with ordinary game streaming too" width="960"></p>

# Eclipse/Umbra Project Hub

## Two PCs. One screen. Couch co-op, re-engineered.

**Everyday game streaming, plus two independent PCs sharing one display.** Eclipse is the client on your TV or desktop; Umbra is the host on each Windows gaming PC. Use one host for ordinary streaming, or two for side-by-side or stacked co-op.

[Project Hub](https://github.com/PreceptorOfMagic/Eclipse-Umbra-Project-Hub) · [Installation Guide](https://github.com/PreceptorOfMagic/Eclipse-Umbra-Project-Hub/blob/main/docs/installation.md) · [Eclipse](https://github.com/PreceptorOfMagic/Eclipse) · [Umbra](https://github.com/PreceptorOfMagic/Umbra) · [Development](https://github.com/PreceptorOfMagic/Eclipse-Umbra-Project-Hub/blob/main/docs/development.md) · [Acknowledgements](https://github.com/PreceptorOfMagic/Eclipse-Umbra-Project-Hub/blob/main/ACKNOWLEDGEMENTS.md)

[Open the project website](https://preceptorofmagic.github.io/Eclipse-Umbra-Project-Hub/) · [Eclipse source](https://github.com/PreceptorOfMagic/Eclipse) · [Umbra source](https://github.com/PreceptorOfMagic/Umbra)

Eclipse/Umbra’s additions use AI-assisted coding, including Claude and Codex. [How the project is developed](docs/development.md#development-process).

## What Moonlight and Sunshine do

Moonlight receives video/audio from a PC and sends your controls back. Sunshine captures and encodes the PC’s games or desktop. Games run on your own hardware, not in a hosted cloud service.

Eclipse follows **Moonlight → Moonlight TV → Aurora**. Umbra follows **Sunshine → Apollo**. It is Apollo with the additions Eclipse needs for co-op, keeping other changes to a minimum. Apollo supplies the everyday host foundation; Umbra keeps its changes separate where possible to make upstream updates easier to integrate. The normal experience remains: discover a host, pair with a PIN, choose a game or desktop, configure streaming quality and play using controllers, keyboard or mouse. Codec, HDR, resolution and frame-rate options depend on the hardware at both ends.

## What co-op means here

Two PCs each run their own game session. Eclipse combines their streams side by side or stacked on one screen, keeps player/controller assignments separate, and mixes or selects audio. The game still decides whether its sessions can join the same multiplayer world. You provide the PCs, games and any required accounts.

Cross-vendor co-op needs a compatible stream structure. Umbra supplies the custom co-op encoder path and Eclipse coordinates the sessions and composition; this is why the work spans both applications rather than a client-only change. Anyone is welcome to adapt the functionality into Aurora, Apollo or other Moonlight/Sunshine forks.

## Streaming features

The [detailed feature catalogue](docs/features.md) separates the familiar Moonlight/Sunshine, Moonlight TV/Aurora and Apollo foundation from Eclipse/Umbra’s additions. It covers:

- Two-host layouts, automatic pane-sized desktops and compatible encoder selection.
- A shared bitrate budget, pause/resume and ending both host sessions.
- Remembered controllers, pane-aware mouse/keyboard routing, Nintendo layouts and media-remote handling.
- Stereo mixing, host-speaker restoration and shared sounds played once.
- Windows local-host play, remote-monitor control, wired-TV routing and desktop usability.
- Cross-platform diagnostic bundles, host evidence and crash/unclean-exit records.

These describe development capabilities, not a guarantee that every feature is in an available package or verified on every platform. The catalogue carries the limitations; the [testing matrix](#status) records actual coverage.

## System map

| On the gaming PCs | Across your network | On the shared display |
|---|---|---|
| Umbra captures and encodes one PC | One video/audio session + return input | Eclipse plays an ordinary stream |
| Umbra on two PCs encodes compatible co-op streams | Two sessions, with separate input destinations | Eclipse presents both games in one layout |

## Choose your platform

| Install here | Component | Installation |
|---|---|---|
| LG webOS TV | Eclipse client | [Developer Mode and IPK](docs/installation.md#eclipse-webos) |
| Windows x64 display PC | Eclipse client | [Portable ZIP](docs/installation.md#eclipse-windows) |
| Linux x86_64 desktop | Eclipse client | [Portable archive](docs/installation.md#eclipse-linux) |
| Windows x64 gaming PC (one or two) | Umbra host | [Bundled installer](docs/installation.md#umbra-windows) |

Use a reachable home network, preferably wired for co-op. Install games on their respective hosts. Start by testing a normal stream from each PC; then choose Co-op in Eclipse. No manual Co-op Pane creation or separate device-bridge download is part of installation.

<a name="status"></a>

## Current status

Test coverage as of October 2026—not a promise that all hardware combinations work.

| Area | Exercised | Still needed |
|---|---|---|
| LG webOS | LG G5, webOS 26 / 11.2.0, firmware 43.21.77, UE300 wired Ethernet | Other models, SoCs and firmware versions |
| Windows client | Windows 11 x64, Radeon RX Vega, D3D11VA; ordinary/co-op sessions and diagnostics | Windows 10, ARM, Intel and other driver/GPU combinations |
| Linux client | Ubuntu 22.04/26.04, Fedora 44 and Arch environments under WSL; NVDEC standard/co-op | Bare-metal Linux and native AMD/Intel VAAPI; experimental WSL VAAPI was unstable |
| Windows hosts | Windows 11, RTX 4070 / RTX 3070 / Radeon RX Vega | Other Windows versions, Intel hosts and newer AMD GPUs |
| NVIDIA × NVIDIA | Primary RTX pair, including HEVC/HDR path | Wider generations, resolutions and driver coverage |
| NVIDIA × AMD | Live custom GPU HEVC co-op | Fast-motion quality, high-bitrate stability and broader real-game coverage |
| AMD × AMD / Intel co-op | No representative physical pair | Community testing; do not infer co-op support from standard streaming |

Windows 4K presentation can be limited by GPU-to-CPU frame readback. [Development](docs/development.md#open-work) explains current issues. If your setup differs, try it and report successes or failures through GitHub or the project’s social thread. [Enable diagnostic logging and export a bundle](docs/installation.md#diagnostics) so reports include useful evidence.

## Gameplay and setup media

**Video placeholder — ordinary stream → co-op → both layouts.** Record 45–60 seconds using OBS on the desktop client and a locked-off camera on the TV. Show separate player control, hide accounts/PINs and export captioned MP4/WebM with a poster.

**GIF/short-loop placeholder — independent controls.** Record 8–12 seconds with one player moving and the other still, then swap. Export a silent loop and optional GIF.

**Photo placeholder — the whole couch setup.** Photograph the TV and controllers with both panes legible; match shutter to the display to avoid bands.

<a name="timeline"></a>

Development history · July–October 2026

## The route was not a straight line.

The useful history includes the dead ends. These are dated outcomes from project records, not fresh reproductions of every experiment. Credit is attached to documented contributions; where the record does not establish who first proposed an idea, the account does not invent an author. The [detailed history](docs/development.md#detailed-history) goes a level deeper, step by step.

<a name="history-first-path"></a>

<details>

<summary>22–30 July · Finding the core path — Dual decoding, the half-stream proposal and the header-alignment breakthrough</summary>

### 22 July · Building on existing clients and hosts

The Eclipse modification record begins with Aurora and Moonlight TV, rather than a new client from scratch. The goal was two independently running PCs on one TV while retaining normal streaming. Sunshine and Apollo provided the host foundation.

### 25–30 July · Two decoders were not a complete display solution

Early probes appeared to grant a second decoder, then suggested only one was usable. Further AI-led investigation corrected that conclusion: two decoders could survive together at a smaller combined workload. The unresolved obstacle was obtaining two usable native-app display/sink paths. The outcome was not “LG TVs physically have one decoder”; it was that this route did not yield the required composition/display solution.

### 28 July · PreceptorOfMagic proposes joining halves before decoding

The pivotal suggestion was for each PC to send its own half-picture and for the client to join the two into one decodable picture. Both PCs would keep their direct connection to the TV, without relaying one through the other. AI implementation first proved compatible-slice splicing from full-size source streams; true pane-sized host desktops followed.

### 28–30 July · Cropping is not a half-sized desktop

Early versions selected regions of full-resolution desktops and used blanking overlays. PreceptorOfMagic noticed the missing taskbar and pushed for Windows itself to see the pane-sized desktop. The implementation moved to half-height encoding, rewritten composite dimensions and relocated slice data, so the game and desktop could fit the visible pane.

### 29 July · A misleading codec error turns out to be bit alignment

Inserting a slice address shifted the header length and displaced entropy-coded payload, producing apparent QP/decode errors. AI diagnosis and implementation repaired complete-header parsing and byte alignment before copying the original payload. Component decoding then validated the rewrite. That was a structural proof, not yet proof of sustained live co-op.

<!-- activity:history-first-path:start -->
**Behind the build · 22–30 July 2026**

- **User prompts:** 53
- **Tokens processed:** 412,175,826
- **Models:** `claude-opus-4-8`, `claude-opus-5`

These numbers are incomplete because some records from this period were deleted.
<!-- activity:history-first-path:end -->

</details>

<a name="history-timing"></a>

<details>

<summary>Late July–August · Learning to preserve time and references — Ghosting, role reversal, queues, holds and corrected measurements</summary>

### Late July–early August · A still pane is not a reusable packet

Predictive pictures exposed why arbitrary drops or repeats were unsafe. Reapplying residuals could corrupt a held pane, while omitting a reference picture broke later prediction. Sequence tracking, bounded buffering, bootstrap/keyframe handling and synthetic all-skip holds became core architecture rather than optional smoothing.

### 3–4 August · Swapping primary hosts changes the fault

User observations during role swapping exposed a scheduling asymmetry: a slower or static primary did not drain a faster peer often enough. A deeper queue stored increasingly old content; high host floors produced more duplicates. The design direction changed to an independent composite picture count and extra catch-up pictures that advance the queued pane while safely holding the other. The initial design note was not itself an implementation result; current code supplies the bounded catch-up paths described above.

### Early August · AI conclusions needed retraction, not decoration

Some apparently successful tests had invalid inputs; a separate frame-extraction error made a correct hold look degraded. Fresh live capture and frame-accurate comparison reversed those findings. The improvement was methodological as well as technical: verify the actual input, the displayed picture and the effect of a setting instead of accepting healthy counters or a plausible explanation.

<!-- activity:history-timing:start -->
**Behind the build · 25 July–31 August 2026**

- **User prompts:** 286
- **Tokens processed:** 2,676,527,028
- **Models:** `claude-haiku-4-5-20251001`, `claude-opus-4-8`, `claude-opus-5`, `claude-sonnet-5`

These numbers are incomplete because some records from this period were deleted.
<!-- activity:history-timing:end -->

</details>

<a name="history-cross-vendor"></a>

<details>

<summary>Late August–16 September · The cross-vendor detour — Native HEVC mismatch, the abandoned AVC route and a shared encoder</summary>

### 30 August · Healthy counters, wrong picture

The investigated NVIDIA HEVC output used 32×32 coding-tree blocks while the AMD native output used 64×64. Their pane data could not simply share one composite picture’s structures. This explained a grey peer pane despite apparently healthy receive/decode counters. The finding applied to those native outputs, not to all possible AMD/NVIDIA co-op.

### Late August–15 September · AVC was explored, not casually dismissed

AVC’s fixed macroblock geometry offered a way around the HEVC block-size mismatch. A small side-by-side proof worked, but target-size composition met the tested NVIDIA encoder’s slice-count ceiling. Other parameter-compatibility and presentation problems followed. Later live controls showed stale content even without AMD or synthetic holds, invalidating explanations that blamed those alone.

The experimental co-op AVC route was retired on 16 September. The lesson was not that AVC can never express this layout, nor a universal decoder frame-rate limit. This implementation path did not meet the target constraints.

### 15–16 September · Keep the direct architecture; control both encoders

AI audits of vendor APIs and existing implementations did not produce a small native compatibility fix. With the user’s direct-host/no-relay requirement intact, work returned to HEVC: keep the established native NVIDIA-pair route, and use a shared programmable encoder on both hosts for affected pairings. Host prediction and client composition stayed separate responsibilities. This solution builds on upstream codec work, including x265.

<!-- activity:history-cross-vendor:start -->
**Behind the build · 18 August–16 September 2026**

- **User prompts:** 491
- **Tokens processed:** 4,403,521,774
- **Models:** `claude-haiku-4-5-20251001`, `claude-opus-4-8`, `claude-opus-5`, `claude-sonnet-5`, `gpt-6-astra`

These numbers are incomplete because some records from this period were deleted.
<!-- activity:history-cross-vendor:end -->

</details>

<a name="history-gpu"></a>

<details>

<summary>16–29 September · Correct bytes were only the start — Parallel CABAC, integration failures, quality work and rollbacks</summary>

### 16 September · An AI algorithmic contribution changes the GPU path

A correct but largely serial GPU CABAC port took tens to hundreds of milliseconds in component tests. The AI-developed context-grouping and finite-state-scan approach changed the algorithm rather than merely tuning that serial port. Predicted-frame CABAC fixtures reached roughly 1–2 ms with exact reference bytes. This was meaningful component progress, not an end-to-end latency claim.

### 16–18 September · Integrating a real encoder exposes new failures

Residual coding, transforms, quantisation, reconstruction, budgeting and live host capture were brought together. Tests then found capture-size mismatches, rough fine detail, stacked-layout failures, bitrate bursts and quantisation limits. PreceptorOfMagic rejected a special fixed frame-size ceiling; subsequent work returned budgeting to the requested bitrate and improved adaptive quantisation. Direction-setting and implementation both mattered.

### 17–29 September · Roll back a regression, keep the remaining problem visible

An extra quantisation attempt in one revision raised worst-case encode time and produced visible hopping. Rolling it back removed that symptom. Later lowering the QP floor improved some light static, but motion-related QP jumps remained in both older and newer versions. Cross-vendor composition had become real; native-encoder quality and performance parity had not been established.

<!-- activity:history-gpu:start -->
**Behind the build · 16–29 September 2026**

- **User prompts:** 215
- **Tokens processed:** 4,410,273,647
- **Models:** `claude-opus-5`, `claude-opus-5-5`, `claude-sonnet-5`, `gpt-5.6-sol`, `gpt-6-astra`
<!-- activity:history-gpu:end -->

</details>

<a name="history-product"></a>

<details>

<summary>Late September–October · Making it usable and maintainable — Desktop clients, a firmware crash, automatic setup and the thin Apollo fork</summary>

### Late September · Desktop clients and session recovery

Windows and Linux client work exercised mixed-vendor co-op beyond the TV. Packaging moved toward a portable Linux baseline and staged Windows dependencies. Local-host input/focus, resume, audio-endpoint restoration and shareable diagnostic bundles addressed everyday failures around the stream itself. WSL and container coverage remained distinct from native Linux driver validation.

### 26 September · A firmware update exposes a symbol collision

On webOS 26, first-stream media-plugin scanning resolved a library call to the application’s exported `g_log` data symbol. AI-led diagnosis identified that collision; renaming the symbol and adding a post-link export guard addressed the specific crash. The new test lesson was to exercise first use after install/firmware changes, not only repeated launches. This did not close every unrelated stream-start fault.

### Late September–3 October · Co-op becomes a coordinated launch

The built-in pane, capability-based encoder selection and divided default bitrate replaced manual host edits. Resume and Quit gained two-host semantics. Umbra’s branding and changes were then isolated into a smaller Apollo delta, preserving upstream documentation, translations and maintained everyday functionality instead of duplicating them.

### Early October · Smaller features, and experiments still in flight

Remote-monitor choices, remembered input assignments, Nintendo mapping, remote-device filtering, wired-TV routing and richer logs made the app fit more real setups. Duplicate-audio work explored several filtering strategies before settling on a passive gate, now the default way shared sounds are played once. Public package publication, wider clean-install coverage and motion-quality improvements remain separate release tasks.

<!-- activity:history-product:start -->
**Behind the build · 23 September–5 October 2026**

- **User prompts:** 247
- **Tokens processed:** 5,011,694,573
- **Models:** `claude-opus-4-8`, `claude-opus-5`, `claude-opus-5-5`, `claude-sonnet-5`, `claude-sonnet-5-5`, `gpt-5.6-sol`, `gpt-6-astra`
<!-- activity:history-product:end -->

</details>

## Where next?

- [Install and pair](docs/installation.md) — platform downloads and exact steps.
- [Eclipse repository](https://github.com/PreceptorOfMagic/Eclipse) / [Umbra repository](https://github.com/PreceptorOfMagic/Umbra) — source, release assets and component issues.
- [Development](docs/development.md) — architecture, dependencies, milestones and open work.
- [Acknowledgements](ACKNOWLEDGEMENTS.md) — Moonlight and Sunshine’s original creators, Aurora, Apollo and the wider stack.

[![Buy me a coffee](https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=PreceptorOfMagic&button_colour=BD5FFF&font_colour=ffffff&font_family=Cookie&outline_colour=000000&coffee_colour=FFDD00)](https://www.buymeacoffee.com/PreceptorOfMagic)

[Eclipse/Umbra licence & notices](LICENSES.md) · [GPL-3.0](LICENSE.txt)

[Project Hub](../README.md) · [Installation Guide](installation.md) · [Eclipse](https://github.com/PreceptorOfMagic/Eclipse) · [Umbra](https://github.com/PreceptorOfMagic/Umbra) · [Development](development.md) · [Acknowledgements](../ACKNOWLEDGEMENTS.md)

Development

# Understand the whole connection.

A contributor’s guide to the client, the thin Apollo host fork, and the experiments behind two-host composition. Open a section for implementation details; the overview stays short.

[Eclipse source](https://github.com/PreceptorOfMagic/Eclipse) · [Umbra source](https://github.com/PreceptorOfMagic/Umbra)

[Architecture](#architecture) · [Source map](#repositories) · [Builds](#build) · [Development history](#timeline) · [Open work](#open-work)

<a name="development-process"></a>

## How this project is developed

PreceptorOfMagic and AI coding tools, including Claude and Codex, develop Eclipse/Umbra’s additions together. PreceptorOfMagic sets goals, orchestrates the work, contributes high-level design and tests the results hands-on. The AI tools contribute implementation, research, instrumentation and diagnosis—including ideas that worked, experiments that failed and conclusions that needed correcting. This describes these forks, not the authorship of their upstream foundations.

The history below separates implementation from recorded test results and abandoned hypotheses. A component benchmark is not end-to-end latency; a successful decode counter is not proof of a correct screen. See the [hardware and testing matrix](https://preceptorofmagic.github.io/Eclipse-Umbra-Project-Hub/#status) for the scope of current evidence.

<a name="architecture"></a>

Architecture

## Two sessions. One decodable picture.

Each PC captures, encodes and sends its own pane directly to Eclipse. The client coordinates those streams, joins compatible HEVC picture data, then passes one composite stream to its decoder. Audio and input keep their separate host identities.

<a name="composition"></a>

<details>

<summary>1. Capture, pane geometry and compressed-frame composition — Why half-sized desktops and compatible headers matter</summary>

### The host supplies a pane, not a cropped full desktop

Eclipse requests the built-in Co-op Pane from each Umbra host. Its virtual desktop matches that host’s share of the chosen output: half-width for side-by-side, half-height for stacked. Windows and the game therefore see a usable desktop at that size. Coding dimensions still need alignment to the codec’s coding-tree grid; visible size and coded size need not be identical.

Each connection retains Moonlight-compatible discovery, pairing, launch/control, video/audio transport and return input. The secondary connection has its own session process; its encoded access units reach the compositor through inter-process communication. An access unit is the encoded data needed for a picture, not a decoded pixel buffer.

### What Eclipse changes

The HEVC parser reads sequence and picture parameter sets (SPS/PPS), picture order counts and slice headers. Composition describes one larger coded picture and relocates the second pane into the appropriate region, using rewritten slice addresses and, where required, tile geometry. Slice addresses and shared picture numbering must agree with that geometry. The encoded picture payload is retained; Eclipse does not decode and re-encode both games for the core composition path.

Changing a header’s bit length is not a byte-copy operation. The parser must find the original payload boundary, emit a complete new header and alignment, then append the payload at its correct byte boundary. The early half-stream prototype failed here before the alignment repair made the rewrite valid.

### Why there is a paired host fork

Both panes must satisfy a shared codec contract: compatible coding blocks, parameter sets, bit depth, reference behaviour and random-access handling. “Both are HEVC” is insufficient. In the investigated native NVIDIA/AMD pairing, their coding-tree sizes differed. Umbra can supply the compatible custom encoder on both hosts; Eclipse negotiates and composes it. Ordinary streaming retains the native host paths.

That coordinated requirement is why this work spans the Aurora-derived client and Apollo-derived host. Adapting it into Aurora, Apollo or another Moonlight/Sunshine fork is welcome.

Read: [HEVC parsing and rewriting](https://github.com/PreceptorOfMagic/Eclipse/blob/feat/coop-seamless/src/app/stream/video/coop_poc.c), [composition and decoder submission](https://github.com/PreceptorOfMagic/Eclipse/blob/feat/coop-seamless/src/app/stream/video/session_video.c), [pair-aware stream selection](https://github.com/PreceptorOfMagic/Eclipse/blob/feat/coop-seamless/src/app/stream/video/coop_stream_mode.c).

</details>

<a name="sequencing"></a>

<details>

<summary>2. Holds, reference frames, buffers and keyframes — Why repeating a compressed frame is not the same as holding a picture</summary>

### The reference-chain problem

An inter-predicted pane describes changes relative to a previous reconstructed picture. Replaying its compressed bytes can apply a residual again, rather than leave the picture unchanged. Dropping an encoded reference picture can make the next one refer to history the decoder never received. An ordinary “keep only the newest frame” video queue is therefore unsafe for this composition contract.

### A synthetic hold advances time without advancing that pane

When only one host has new content ready, Eclipse can create an all-skip slice for the other pane: the held region predicts from the previous composite picture without adding a new residual. The new host pane and the hold share the next composite picture order count (POC). Source POCs are tracked separately from that output numbering.

This relies on the supported encoder/reference structure. It is not a general-purpose transformation for arbitrary HEVC with unrestricted reference lists or reordering. Both the header rewrite and the reconstructed reference chain must remain correct.

### Bounded queues and a shared sequencer

The secondary receiver maintains a bounded queue. The sequencer judges queued units against the last accepted history: a valid next picture, an anchor, a discontinuity or a picture that cannot safely be used. Queue depth absorbs short arrival differences but also stores latency. Overflow, gaps and missing anchors need explicit recovery; there is no unconditional “never drops frames” guarantee.

An IDR resets picture-reference history for the composite, not merely one independent video surface. Other random-access pictures also need explicit handling. Bootstrap and recovery must establish valid panes and aligned history; a keyframe request alone does not prove that a usable replacement picture has arrived.

Read: [sequencer](https://github.com/PreceptorOfMagic/Eclipse/blob/feat/coop-seamless/src/app/stream/video/coop_seq.c), [synthetic hold slices](https://github.com/PreceptorOfMagic/Eclipse/blob/feat/coop-seamless/src/app/stream/video/coop_conceal.c), [peer queue and coordination](https://github.com/PreceptorOfMagic/Eclipse/blob/feat/coop-seamless/src/app/stream/video/coop_coord.c).

</details>

<a name="pacing"></a>

<details>

<summary>3. Primary roles, catch-up frames and frame-rate floors — How uneven host rates are handled—and what still depends on the primary</summary>

### Primary is a scheduling role

The primary video callback drives normal composite submission; the secondary stream supplies queued peer pictures. In the launcher, Player 1 occupies the primary left/top pane. Swapping which PC takes that role is useful when diagnosing asymmetry, but changing host roles is not evidence of automatic live primary switching. Controller ownership is configured separately; it should not be inferred from GPU speed.

### Catch up without discarding prediction history

If the peer gets ahead, the compositor can drain a bounded number of additional peer pictures during a primary callback. These catch-up composites advance the peer while holding the primary with a synthetic skip slice. Each accepted composite gets its own output POC, and the drain uses the same sequencer as normal consumption.

The loop is bounded and guarded around anchors. On the PC-decoder path it stops before consuming a queued peer IDR in catch-up, preserving that anchor for the normal path. Failed composition must not consume a picture number as though a valid frame had been submitted. Both orientations have catch-up handling, but this remains callback-driven: it is not an independent clock that guarantees output at the faster host’s exact rate when the primary stops producing callbacks.

### Floors solve a different problem

A host frame-rate floor asks for continued encoded output even when desktop capture is quiet. Duplicated capture content can keep a pipeline active, but it is not new game motion and costs encoding/network work. A larger peer buffer hides a short burst; it does not solve sustained rate mismatch. Catch-up, queue depth and host floors must be evaluated separately.

Do not copy an old floor number into a new test. Horizontal and vertical test controls have differed, and an accepted configuration value has previously failed to affect the encoder. For any tuning change, record the requested setting, its application evidence and the measurement expected to move: host encode cadence, queue age/depth, composite submissions or displayed motion. These are different rates.

Read: [normal and catch-up feed paths](https://github.com/PreceptorOfMagic/Eclipse/blob/feat/coop-seamless/src/app/stream/video/session_video.c). The [August rate-decoupling note](https://github.com/PreceptorOfMagic/Eclipse/blob/feat/coop-seamless/docs/coop-rate-decoupling.md) explains the turning point, but is a historical design proposal, not today’s implementation inventory.

</details>

<a name="encoder"></a>

<details>

<summary>4. The custom GPU HEVC encoder — Cross-vendor structure, prediction, parallel entropy coding and quality limits</summary>

For affected host pairings, both Umbra instances use the shared programmable GPU encoder rather than trying to splice incompatible vendor-native outputs. The host encoder still owns temporal prediction, residual generation, transforms, quantisation, reconstruction and rate control. Eclipse owns pane composition and sequence coordination; moving ordinary prediction into the client would blur that boundary.

### The entropy-coding turning point

The x265-derived CABAC work initially reproduced correct bytes with a mostly serial GPU port, but the runtime was far too high. The revised algorithm grouped bins by context, used finite-state scans for dependent context transitions, and parallelised range, low and carry processing. Recorded predicted-frame component fixtures reached roughly 1–2 ms while matching reference output. That measures one stage under those fixtures, not a complete encode or controller-to-display latency.

### Correctness, quality and speed are separate gates

Integration had to add real capture, residual/reconstruction work and rate budgeting. A decodable frame can still have poor fine detail, motion blockiness, excessive bitrate or late delivery. An extra quantisation attempt increased worst-case work and visibly disrupted motion; it was rolled back. Later quality changes reduced some static noise without establishing parity with mature native encoders.

Both bit-depth builds and the required kernels must accompany a host package. Packaging can otherwise succeed without the custom encoder, leaving a host unsuitable for the intended mixed-vendor mode. Verify advertised capabilities against the actual installed files, then verify the selected path in a real session. Source conformance tests are necessary, not sufficient.

Read: [GPU HEVC source and component tests](https://github.com/PreceptorOfMagic/Eclipse/tree/feat/coop-seamless/experimental/gpu-hevc), [host encoder packaging](https://github.com/PreceptorOfMagic/Umbra/blob/umbra/thin/cmake/packaging/windows.cmake). The encoder builds on upstream work, including x265; see [Acknowledgements](https://preceptorofmagic.github.io/Eclipse-Umbra-Project-Hub/credits.html).

</details>

<a name="input-routing"></a>

<details>

<summary>5. Session lifecycle, input ownership and local-host play — The two host identities remain separate even when the screen is shared</summary>

Co-op negotiates host capabilities, selects a compatible encoding route, requests each built-in pane and divides the default video budget between hosts. A disconnect preserves the resumable applications. Quit is an explicit end-both-hosts operation; an orientation change on resume rebuilds pane geometry. Linux has recorded end-both-hosts verification; do not silently extend that test result to every packaged platform.

Controller assignments associate remembered devices with host destinations. Pane-aware absolute pointing maps the composite coordinate into the selected host’s desktop. Button ownership stays fixed through a drag, and keyboard key-up events return to the destination of their key-down to avoid leaving keys stuck on a different PC. Explicit per-device mouse/keyboard assignment offers an alternative to pane routing; relative and virtual-mouse behaviour needs separate testing.

When the Windows client is also a host, focus and injected input can loop back into the client unless the local pane is treated specially. The game needs a separate captured display; putting Eclipse on the same virtual display risks recursive capture. Routing a controller in Eclipse also does not revoke a handle already held by Steam or another local application. Local-device isolation, particularly wireless devices, remains an engineering gap rather than an automatic consumer guarantee.

Monitor-off requests deliberately exclude the PC displaying Eclipse. Speaker restoration tracks the pre-stream playback endpoint and handles delayed/recreated endpoints. These are session-lifecycle behaviours that need disconnect, quit, crash, restart and upgrade coverage—not just a successful first launch.

Read: [input routing](https://github.com/PreceptorOfMagic/Eclipse/tree/feat/coop-seamless/src/app/stream/input), [co-op assignments and settings](https://github.com/PreceptorOfMagic/Eclipse/blob/feat/coop-seamless/src/app/ui/settings/panes/coop.pane.c), [host application lifecycle](https://github.com/PreceptorOfMagic/Umbra/blob/umbra/thin/src/process.cpp).

</details>

<a name="audio-routing"></a>

<details>

<summary>6. Audio mixing, duplicate suppression and diagnostics — Independent audio clocks, unfinished experiments and evidence collection</summary>

### Mixing is the stable job; deduplication is a separate experiment

Two stereo sources reach the client independently. The mixer buffers their arrivals and produces either a combined output or the selected host’s sound. Extra buffering can smooth uneven delivery but adds latency. This is not the ordinary host’s 5.1/7.1 path.

Shared narration or music can arrive from both games with a delay between them. The optional duplicate suppressor tries to detect matching content and reduce the later copy. Tests exposed false reductions of unrelated sound and difficulty with several simultaneous delays. Correlation or a good offline score cannot establish that the listener’s own effects remain untouched.

Subsequent work explored a passive gate, linked-channel decisions and a treble-sensitive envelope to avoid damaging consonants. The newest passive-gate revision was still a component prototype at this documentation review, not wired into the live mixer. It is a useful development direction, not a completed audio-quality claim.

### Evidence across both ends

Diagnostic bundles combine build identity, OS/firmware, capabilities, settings and session statistics with peer and capable-host logs. Crash/frozen-UI and unclean-exit records help preserve the previous failure on restart. Export is local on Windows, with network download routes on Linux and webOS. Redaction removes known secrets, not every name or address; review before posting.

For timing work, distinguish capture/encode cadence, packet arrival, queue delay, decoder submissions and actual presentation. Match records by session and clock domain. A visually wrong pane can coexist with healthy decode counters, so a screen observation remains part of the verdict.

Read: [mixer and experimental filters](https://github.com/PreceptorOfMagic/Eclipse/tree/feat/coop-seamless/src/app/stream/audio), [diagnostic bundle contents](https://github.com/PreceptorOfMagic/Eclipse/blob/feat/coop-seamless/docs/support-logs.md).

</details>

<a name="repositories"></a>

## Know which tree owns the change.

Source links may require repository access while the application repositories remain private. A development branch is not a release identifier; use the exact source commit recorded with a package.

<a name="source-map"></a>

<details>

<summary>Repository, module and dependency map — Client integration, current feature work, thin host fork and website</summary>

### Eclipse

[diag/feed-accounting](https://github.com/PreceptorOfMagic/Eclipse/tree/diag/feed-accounting) carries client integration work. [feat/coop-seamless](https://github.com/PreceptorOfMagic/Eclipse/tree/feat/coop-seamless) contains newer co-op/device/audio work. These branch names describe the reviewed development state, not a permanent release policy. Check divergence and working-tree changes before building; do not assume the default branch or a GitHub source ZIP contains every desktop feature.

- `src/app/ui/`: LVGL launcher, settings, co-op selection and stream interface.

- `src/app/stream/`: session workers and peer IPC; `video/` contains HEVC parsing, sequencing, concealment and submission; `audio/` contains mixing and experiments; `input/` owns host-directed input.

- `third_party/ss4s/` and platform modules: media backends, including webOS and desktop FFmpeg paths. Windows uses D3D11VA decode; Linux has NVDEC/VAAPI paths with different test coverage.

- `experimental/gpu-hevc/`: shared custom host encoder source, kernels and component tests. Its location in the client repository does not mean it runs as a client-side re-encoder.

- moonlight-common-c supplies connection/protocol foundations; LVGL, SDL, FFmpeg, Opus and network/crypto dependencies retain their own upstream roles and licences.

### Umbra

[umbra/thin](https://github.com/PreceptorOfMagic/Umbra/tree/umbra/thin) is the reviewed host integration branch. Apollo/Sunshine owns the ordinary host foundation: capture, encoding, sessions, virtual displays, input and browser configuration. Umbra adds the focused co-op contract and supporting lifecycle work.

### Project Hub

[The hub repository](https://github.com/PreceptorOfMagic/Eclipse-Umbra-Project-Hub) owns `site/`, mirrored documentation and `scripts/launch/` validation. Application packages belong in their application repositories, not this website. The six-destination navigation, shared branding and release selectors are maintained together.

Initialise recursive submodules at the chosen commit. Do not replace pinned dependencies with arbitrary latest versions. [Acknowledgements](https://preceptorofmagic.github.io/Eclipse-Umbra-Project-Hub/credits.html) records the wider stack and upstream creators.

</details>

<a name="build"></a>

## From source to a usable package.

These are the build entry points and their responsibilities. Follow the scripts at your selected commit for exact prerequisites. Building successfully does not replace clean-install, upgrade and live-session checks.

<a name="build-webos"></a>

<details>

<summary>Eclipse · LG webOS — Cross-toolchain → client/dependencies → symbol guard → IPK</summary>

Build from Linux/WSL using the webOS wrapper. It bootstraps client dependencies, locates or fetches the pinned buildroot-nc4 cross-toolchain and drives the CMake build through the project’s build wrapper. Use its required CMake/awk tooling and recursive submodules, not an unrelated generic ARM compiler.

```
./scripts/webos/build_for_lg.sh
```

The media integration links into webOS’s native playback environment. A post-link symbol-export guard protects against application symbols interposing on system libraries—the cause of the webOS 26 first-stream crash. Packaging produces an IPK in `dist/`, retaining the inherited live app identifier; the beta variant has its own identity and build directory.

A rebuild can overwrite the same versioned IPK filename, so preserve a known-good package first. Installation alone does not restart an already running app: close and relaunch it before evaluating new code. Test first stream after a fresh install or firmware update as well as later launches. Toolchain acquisition and dependency provenance still need release review; this is not a claim of a fully hermetic build.

[Build wrapper](https://github.com/PreceptorOfMagic/Eclipse/blob/feat/coop-seamless/scripts/webos/build_for_lg.sh) · [Firmware/symbol-collision investigation](https://github.com/PreceptorOfMagic/Eclipse/blob/feat/coop-seamless/docs/webos26-media-load.md) · [User installation](https://preceptorofmagic.github.io/Eclipse-Umbra-Project-Hub/setup.html#eclipse-webos)

</details>

<a name="build-windows"></a>

<details>

<summary>Eclipse · Windows portable client — PowerShell + MSYS2 MINGW64 → CMake/Ninja → dependency closure → ZIP</summary>

The Windows client uses the common LVGL client code, not a separate Qt rewrite. Run the portable builder from Windows PowerShell with its MSYS2 MINGW64 environment. This differs from Umbra’s UCRT64 host toolchain.

```
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/windows/build_portable.ps1
```

The script configures/builds with CMake and Ninja, installs into staging, then follows PE imports to collect the needed MinGW DLLs without bundling Windows system DLLs. It adds the runtime assets and produces the unsigned client ZIP and checksum in `dist/`. The executable retains its inherited `moonlight-tv.exe` name.

Preserve the whole extracted directory. Verify package provenance and dependencies on a clean Windows machine, then ordinary streaming, both co-op orientations, input, audio and reconnect/quit. Hardware decoding does not imply zero-copy display: the current readback/presentation path can bottleneck high-resolution output independently of the decoder.

[Portable builder](https://github.com/PreceptorOfMagic/Eclipse/blob/feat/coop-seamless/scripts/windows/build_portable.ps1) · [User installation](https://preceptorofmagic.github.io/Eclipse-Umbra-Project-Hub/setup.html#eclipse-windows)

</details>

<a name="build-linux"></a>

<details>

<summary>Eclipse · Linux portable client — Ubuntu 22.04 baseline → pinned dependencies → runtime staging → archive</summary>

The portable route targets an x86_64 glibc 2.35 baseline using an Ubuntu 22.04 sysroot. The sysroot and dependency builders prepare that environment; the portable script then configures the client with its toolchain, stages runtime libraries and inspects dynamic dependencies.

```
./scripts/linux/portable/make_sysroot.sh
./scripts/linux/portable/build_deps.sh
./scripts/linux/build_portable.sh
```

The bundle deliberately does not carry glibc or a replacement GPU driver. Its launcher establishes the intended library search paths and selective fallbacks; starting the internal executable directly is not equivalent. Packaging includes source/build state, licences and hashes so the archive can be traced to what was built.

Distribution-container and WSL checks help find dependency problems. They do not verify every native display server, compositor or GPU driver. Recorded co-op coverage uses NVDEC under WSL; native AMD/Intel VAAPI needs independent validation, and the experimental WSL VAAPI path showed instability.

[Portable builder](https://github.com/PreceptorOfMagic/Eclipse/blob/feat/coop-seamless/scripts/linux/build_portable.sh) · [Sysroot and dependency scripts](https://github.com/PreceptorOfMagic/Eclipse/tree/feat/coop-seamless/scripts/linux/portable) · [User installation](https://preceptorofmagic.github.io/Eclipse-Umbra-Project-Hub/setup.html#eclipse-linux)

</details>

<a name="build-umbra"></a>

<details>

<summary>Umbra · Windows host and minimal Apollo delta — UCRT64, web assets, custom encoder payload, installer and upstream checks</summary>

Use `umbra/thin` and recursive submodules. The host build uses MSYS2 UCRT64, CMake, Ninja, Node and NSIS alongside its documented capture/encoding, crypto, input and networking dependencies. The host build guide contains an older branch example; select the current integration branch explicitly rather than treating that example as the source of truth.

CMake builds the host and browser assets; CPack produces the NSIS installer or portable package. Build the shared GPU HEVC source for both supported bit depths and include the encoder DLLs plus kernels when configuring the host package. The packaging check rejects an explicitly supplied incomplete encoder directory, but omitting it can produce a package without that encoder. Verify the final payload and capability advertisement before labelling a release mixed-vendor capable.

### Keep Apollo maintainable

Umbra keeps new behaviour and identity in its own files with small integration points. Apollo’s root README, translations and resource cards remain intact. Umbra’s introduction lives in `.github/README.md`; its UI layer includes `umbra_identity.js`, `umbra.css` and `UmbraCard.vue`. The shared logo comes from the hub master.

```
node scripts/umbra_check.mjs
```

This checks the changed-file boundary against `scripts/umbra-delta.txt`. Follow the upstream-sync checklist and test ordinary streaming as well as co-op after merging Apollo. Versions use `<Apollo release>-umbra.<revision>`; preserve that version through reconfiguration. The updates panel compares published releases and records the installed Apollo base—it does not establish that every upstream commit is integrated.

The installer intentionally replaces Apollo in place and retains its installation/configuration identity. Switching back replaces Umbra. Test config and pairing preservation, upgrade, rollback and uninstall; do not describe the two hosts as independent side-by-side installations.

[Host build guide](https://github.com/PreceptorOfMagic/Umbra/blob/umbra/thin/docs/umbra-windows-build.md) · [Apollo update checklist](https://github.com/PreceptorOfMagic/Umbra/blob/umbra/thin/docs/umbra-upstream-sync.md) · [User installation](https://preceptorofmagic.github.io/Eclipse-Umbra-Project-Hub/setup.html#umbra-windows)

</details>

<a name="timeline"></a>

Development history · July–October 2026

## The route was not a straight line.

The useful history includes the dead ends. These are dated outcomes from project records, not fresh reproductions of every experiment. Credit is attached to documented contributions; where the record does not establish who first proposed an idea, the account does not invent an author.

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

Remote-monitor choices, remembered input assignments, Nintendo mapping, remote-device filtering, wired-TV routing and richer logs made the app fit more real setups. Duplicate-audio work explored several filtering strategies; false suppression and the newest unwired passive-gate prototype remain visible development work. Public package publication, wider clean-install coverage and motion-quality improvements remain separate release tasks.

<!-- activity:history-product:start -->
**Behind the build · 23 September–5 October 2026**

- **User prompts:** 247
- **Tokens processed:** 5,011,694,573
- **Models:** `claude-opus-4-8`, `claude-opus-5`, `claude-opus-5-5`, `claude-sonnet-5`, `claude-sonnet-5-5`, `gpt-5.6-sol`, `gpt-6-astra`
<!-- activity:history-product:end -->

</details>

<a name="open-work"></a>

## Useful work starts with a reproducible gap.

The [feature catalogue](https://preceptorofmagic.github.io/Eclipse-Umbra-Project-Hub/#features) explains the user-facing behaviour. These are engineering and release gaps, not hidden requirements for users to configure manually.

<a name="contribute"></a>

<details>

<summary>Open issues, acceptance checks and contributing — Image quality, presentation, platform breadth, audio and release completeness</summary>

- **Custom encoder:** fast-motion quality, bitrate/quality trade-offs and worst-case encode time. Record scene, hardware, build and both visual and timing evidence.

- **Windows presentation:** separate decode time from GPU-to-CPU readback and display time before attributing a 4K bottleneck to the encoder.

- **Linux and hardware breadth:** native NVIDIA/AMD/Intel, display servers and compositors; other LG models/firmware; Windows versions; physical AMD/AMD and Intel host pairings.

- **Local-host input:** focus, separate-display lifecycle and controllers already opened by other applications. Client routing is not complete device isolation.

- **Audio:** duplicate suppression without damaging unrelated sound; live integration and listening tests for new filters; endpoint restoration across disconnect/crash/restart.

- **Automatic setup:** clean-install and in-place upgrade checks with no manual hidden settings. Verify required encoder payload, advertised capabilities, both orientations and ordinary-stream regressions.

- **Release provenance:** matched client/host source, dependency notices, package contents, checksums and clean-machine tests. The website does not manufacture a downloadable release when no asset exists.

### A contribution that can be reviewed

1. Open an issue for the user-visible problem and identify the owning component. Cross-link a companion issue when a protocol change affects both repositories.

1. Make the smallest focused change. Include exact branch/commit, dirty-state information, build/toolchain and a reproducible case.

1. For a behavioural change, predict what observable evidence should differ, verify the setting reached its owner, and test a real host connection. Inspect the displayed result as well as counters.

1. Test normal streaming and the affected co-op paths. Record both host GPUs/drivers, client OS/firmware, geometry, roles and untested combinations. Do not convert a narrow pass into a universal claim.

1. Update the affected homepage features, installation instructions, app landing page, testing matrix and this guide. Review diagnostic bundles for personal data before publishing them.

For website changes, run the launch checks and unit tests, check keyboard operation and narrow layouts, then deploy through the existing GitHub Pages workflow. Keep the six shared navigation destinations and upstream acknowledgements intact.

</details>

[Eclipse/Umbra licence & notices](../LICENSES.md) · [GPL-3.0](../LICENSE.txt)

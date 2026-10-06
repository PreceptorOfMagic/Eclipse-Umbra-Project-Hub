[Project Hub](../README.md) · [Installation Guide](installation.md) · [Eclipse](https://github.com/PreceptorOfMagic/Eclipse) · [Umbra](https://github.com/PreceptorOfMagic/Umbra) · [Development](development.md) · [Acknowledgements](../ACKNOWLEDGEMENTS.md)

Development

# Understand the whole connection.

A contributor’s guide to the client, the thin Apollo host fork, and the experiments behind two-host composition. Open a section for implementation details; the overview stays short.

[Eclipse source](https://github.com/PreceptorOfMagic/Eclipse) · [Umbra source](https://github.com/PreceptorOfMagic/Umbra)

[Architecture](#architecture) · [Source map](#repositories) · [Builds](#build) · [Detailed history](#detailed-history) · [Open work](#open-work)

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

<a name="detailed-history"></a>

Detailed history · July–October 2026

## Step by step, including the retractions.

This goes a level below the [development history on the Project Hub](../README.md#timeline): the individual experiments, measurements, fixes and withdrawn conclusions in date order. Figures are the ones recorded at the time, on the project’s own hardware: an RTX 4070 host, an RTX 3070 host, a Radeon RX Vega host and an LG G5 television.

<a name="detail-first-path"></a>

<details>

<summary>22–30 July · Finding the core path — Groundwork, three spikes, exhausted display routes and the first spliced picture</summary>

### 22–25 July · Groundwork before co-op

The first changes were to ordinary streaming. Hosts are resolved at run time instead of being pinned to addresses that change after every power cycle. A woken Windows PC gets its sign-in PIN entered per host. Suspend and resume restore the physical monitor without tearing down the virtual display. Keyframe requests are throttled. Interrupted sessions record why they stopped. An Xbox controller and microphone transport was built for the optional device hub. Much of this later carried co-op launch.

### 25 July · The design is written down and probes are gated

The split-screen design and its open questions were recorded before any co-op code shipped. Each experiment sat behind a gate, so a probe could not change normal streaming. The first gated probe asked whether the G5 would run two independent decode pipelines.

### 26 July · Three spikes in a day

Spike 1, two decode pipelines, failed. Spike 2, positioning split-screen video planes, passed. Spike 3, a second audio output, was refused in-process, and its result invalidated Spike 1’s conclusion. The decoder question was reopened rather than closed.

### 28 July · Every TV-side display route is tried

AI-led probing worked through the TV’s native Multi-View, exporting a second window through the webOS foreign-surface protocol, surface groups, a headless secondary session and a directly created second media pipeline. Multi-View worked, but placing this app in a pane was blocked by app privileges. The second pipeline loaded but never displayed; two days later it was found to be connected to no video sink at all.

### 28 July · One decoder, two PCs

The same day, PreceptorOfMagic’s proposal to join the halves before decoding was built. An in-app HEVC access-unit splicer was validated on real host output. A coordinator process accepted a second session’s pictures and held the latest pane. By the evening, slices from two PCs were spliced into one stream and decoding on the television.

### 29 July · Half height, and a header that moved every bit after it

Encoding each host at half height, instead of cropping a full desktop, needed the peer’s slice placed in the lower half. Writing the new slice address changed the header’s length and misaligned the payload behind it. Re-emitting the complete slice header made the composed stream decode cleanly. A ghosting detector was added because no existing metric could see ghosting, and pane drift was bounded by re-bootstrapping after accumulated concealment.

### 30 July · Half-height composition goes live

Two hosts were composed from half-height streams on the panel. Raising the pane queue to a depth of four took the fresh-pane yield from 7% to 88%. A keyframe livelock was broken by anchoring on the first accepted pane. The client stopped dropping about 29% of pictures mid-session—necessary, but not the cure for the stutter.

Two other results closed doors. A vendor media-layer error ended the TV-side dual-display route. And the all-skip concealment slice, which had appeared broken, was correct: the test harness was at fault.

</details>

<a name="detail-timing"></a>

<details>

<summary>Late July–August · Learning to preserve time and references — Both split directions, bit-exact seams, holds, catch-up and a parameter register</summary>

### 31 July · The vertical split finds a route

NVENC limits a picture to 64 slices and does not offer 64×64 coding blocks, so slicing every block row of a 2160-line picture was blocked. HEVC tile columns solved it: 8 slices instead of 128, full height and bit-exact. Constraining encoding to one slice per block row cost about 4.7 QP, a measured price. The vertical split became its own module that handles independent keyframes from each host.

The same day, a “flashing” fault on both halves turned out to be a looping test file, proven by mirroring the panes.

### 1 August · Horizontal co-op works

Horizontal two-host composition reached 98.9% of pictures paired, with both PCs on the panel. NVENC’s constrained encoding fixed the horizontal seam bit-exactly for about 1.1% more bitrate. PreceptorOfMagic confirmed the vertical split working live. A one-megabyte stack array in the composition path, which had crashed every stream after one picture, was removed. And a left-over file-playback hook was found to have silently replaced two hours of live testing—the origin of the project’s rule to test live connections only.

### 2 August · The concealer becomes bit-exact

Two wrong arithmetic-coder initialisation values were found in the synthetic hold picture. Fixing them took it from 22.4 dB to an exact match. The composite was paced at the slower host, the queue was deepened, and a broken reference chain is now held rather than shown.

### 3–5 August · Role swapping changes the design

Swapping which PC was primary showed the peer’s picture quality was hostage to the primary’s frame rate, so the two were decoupled. Horizontal was rebuilt on the tile machinery, and catch-up pictures finally fired once a wrong re-addressing helper was replaced. A suspected concealer fault proved to be the test duplicating frames. By 5 August horizontal tiles worked end to end, with concealment, catch-up and no frame-rate cap.

### 5–7 August · Co-op becomes something you can start

Co-op moved under the server picker with its own session dialog. The second host’s audio is sent to the coordinator and mixed. Controllers can be routed to either PC; each belongs to a machine rather than a player slot; and every co-op setting sits in one place. A sign-in section stores each PC’s PIN or password. Either PC, or both, can be woken before the session.

### 8–14 August · Launch reliability

A locked PC still answers on the network, so “online” never proved it was usable. Wake and sign-in now confirm the second PC actually signed in. Co-op mode had stayed armed after a session, turning the next ordinary stream into a co-op pane; that was fixed. A two-week-old configuration backup had been silently reverting host settings on every restore.

### 15 August · A stress harness, and what it caught

A harness drove the two hosts at mismatched frame rates with computable test content. It showed the peer’s tile shredding because the catch-up budget was 6% short, and the tile path concealing forever without re-anchoring. NVENC intra refresh was reached and measured; it did not fix the peer decay.

### 16 August · Retractions and a parameter register

The peer-pane flicker turned out to be a timer acting on healthy holds, not damage. A reference-picture-set hypothesis was falsified when its instrumented fix fired and changed nothing. A tile artefact mechanism inferred from reading source was retracted. A register of every parameter in use was started, because a misread knob name had voided a test run.

</details>

<a name="detail-cross-vendor"></a>

<details>

<summary>Late August–16 September · The cross-vendor detour — An AMD host, the block-size mismatch, the AVC route and the return to HEVC</summary>

### 18–19 August · An AMD host joins, and the seam is measured

Co-op work with the Radeon RX Vega host began on 18 August. A software encoder with motion constraints fixed the seam in offline tests, but managed only about 50 frames per second at pane size on twelve CPU cores. Seam guard-band tests with eight kinds of content found that the band and the keyframe interval were two halves of one fix; neither worked alone.

### 30 August · The grey pane’s root cause

A live run read both hosts’ stream headers. NVENC coded the pane in 32×32 blocks, 120 wide by 34 rows; AMF coded it in 64×64 blocks, 60 by 17. Pictures built on different block grids cannot share one composite. Moving the AMD host to a software HEVC encoder was blocked: the host’s software encoder offered H.264 only. The same day, a one-second flash on every stream was traced to a short keyframe interval left applied from an earlier test.

### 30–31 August · The AVC route

H.264’s fixed 16×16 macroblocks sidestep the block-size mismatch. An AVC splice was proven offline, the television’s AVC limit was measured at exactly Level 5.2, and the splice module was ported to C and wired into the client after five review rounds. Half of an early cross-vendor pass was retracted because its peer comparison could not fail. On 31 August a mixed NVIDIA and AMD session passed a 15-minute stress test.

### 1–3 September · Measuring before fixing

“Guard of 32 rows is clean” was retracted: it was a sampling artefact, and a full-coverage run showed the AMD pane corrupt 48% of the time. A macroblock-rate threshold was withdrawn by its own falsification test. The Radeon host’s own framebuffer was clean, which put the fault in its capture or encode path. An eight-run batch showed that the guard band did not control the fault.

### 4–5 September · Holds, roles and the scheduled anchor

A bad frame-hold donor test was fixed, and composite bursts fell from 19.2% to 0.0%. The composite began synthesising its own picture parameters, so either host can be primary. The seam stopped being visible once the AMD host’s encoder scheduled its own periodic keyframe; client-forced keyframes had halved that host’s frame rate, while scheduled ones cost nothing. A supposed 60 fps ceiling was a stale virtual display, and a queue depth of 16 removed evictions at 120 fps.

### 6–10 September · The last AVC faults

The peer’s half was found to be emitted with an unspecified network unit type, which the decoder silently dropped. After the fix, that fault was gone across 15.5 minutes of live running. A separate failure, the beta app dying when it opened audio, cleared 48 AMD-related commits: the cause was the beta app identity, later traced to an exported-symbol collision in the TV’s media framework. A rate sweep put mixed AVC’s display limit at 115 fps.

### 10–16 September · Back to HEVC

A fresh check of NVIDIA’s and AMD’s current encoder interfaces found no supported way to match block sizes. Re-encoding the AMD pane on the RTX 4070 produced 32×32 blocks at about 650 fps, but needed an extra network hop. PreceptorOfMagic ruled that out—“Adding the extra hop is unacceptable”—and set the boundary for a custom encoder: adapt an existing one rather than build from scratch. The design settled on adapting x265, with PreceptorOfMagic’s pairing rule: NVIDIA pairs keep NVENC, and any pair containing AMD runs the adapted encoder on both hosts. The co-op AVC route was retired on 16 September.

</details>

<a name="detail-gpu"></a>

<details>

<summary>16–29 September · Correct bytes were only the start — Serial and parallel CABAC, live integration, rate control and quality</summary>

### 16 September · A correct port that was far too slow

The first x265-derived GPU component ported arithmetic coding to OpenCL with each slice as one dependent chain. It produced the reference bytes exactly. But predicted pictures took 58–82 ms on the RTX 4070 and 225–336 ms on the Radeon RX Vega, and intra pictures 0.3–1.6 seconds. It failed the latency requirement.

### 16 September · Parallel CABAC

The AI-developed replacement groups bins by context, composes 32-bin transition functions for every possible incoming state, resolves them with parallel scans, and assembles carries with a generate–propagate scan. The output stays one slice and byte-identical. Predicted-picture CABAC fell to about 1–2 ms on NVIDIA. AMD intra pictures still took more than 5 ms, so this was component progress, not a whole-encoder latency result.

### 16 September · From components to a live encoder

Residual, transform, quantisation, reconstruction and coefficient syntax were connected on the GPU. Motion prediction was kept on the host encoder, separate from the client’s composition. The restricted encoder codes 32×32 blocks, one slice and one reference. It was built into the host as a device and selected automatically for NVIDIA + AMD and AMD + AMD pairs. Before rate control, two-host streams matched pixel for pixel through the unchanged compositor.

### 16 September · Rate control in one evening

The first moving stress produced oversized pictures and visible damage. Versions 6–8 added a per-host bitrate budget, spatial adaptive quantisation and a corrected retry limit; version 8 passed live in both layouts. Version 11 cut dense-texture error by about 47% against version 9, but a third encode attempt doubled the AMD host’s worst case to about 40 ms, which showed on the panel as hopping. Version 10 was restored, and PreceptorOfMagic confirmed the hopping was gone.

### 19–22 September · Names, and the encoder on a desktop client

The client was renamed Eclipse and the host fork Umbra, as a branding change only. The Windows build of Eclipse’s own interface replaced the earlier experiments. On it, requesting the GPU encoder made the AMD pane’s block grid match the NVIDIA pane exactly, showing a clean peer tile. The block-size limit applies to the native vendor encoders, not to every AMD and NVIDIA pairing.

### 28 September · Static grain and motion blocks

Raising detail in still pictures meant lowering the encoder’s minimum QP from 18 to 12, then to 8, which roughly halved the flat-area noise on the AMD host. Motion was a separate problem. During fast scrolling the QP jumped from 8–18 to about 35 in both the older and newer versions, so the floor change did not cause it. At a very high bitrate the blocks disappeared, but pictures reached 500–718 KB and the host froze briefly: each host paces at a fixed share of gigabit Ethernet, and two of them can exceed one client port.

</details>

<a name="detail-product"></a>

<details>

<summary>Late September–October · Making it usable and maintainable — Desktop co-op, webOS 26, automatic setup, Umbra’s thin fork and co-op audio</summary>

### 22–28 September · Desktop co-op, issue by issue

The Windows client gained co-op with the local PC as one of the hosts. Its own panel stays on the client and the game moves to a virtual display. Issues were logged and closed one at a time. Catch-up stops in front of a peer keyframe instead of taking and losing it. The vertical loading dialog releases on the first anchored composite. Mouse and keyboard are assigned like controllers, and keys follow the pointer’s pane. Measured end-to-end latency of the local-host pane was about 33 ms at the median, validated against a same-display control.

### 26 September · A firmware update and one exported symbol

On webOS 26, every stream start failed. The first media-plugin scan for an app resolved a library logging call to Eclipse’s exported `g_log` data symbol. Renaming it fixed the crash. The build now fails after linking if the executable exports symbols, and a symbol-clash scan joined the checks to run after each firmware update.

### 28 September · Unpaired keyframes and pairing this PC

In vertical co-op, an unpaired keyframe from this PC is now folded into an ordinary picture instead of being rejected. That keeps its pane whole across an encoder restart, and it was verified in all four layouts. A fresh install can pair the local PC for co-op, and a virtual adapter’s address can no longer replace a real one.

### 1–2 October · Co-op out of the box

Fresh webOS 26 installs could not create their settings folder, so settings now fall back to a writable developer location. Co-op now starts from a built-in hidden pane, with capability-based encoder selection and the bitrate divided between hosts by default, instead of manual host edits. Disconnect pauses both PCs and Quit ends both. The portable Linux build was exercised on Ubuntu 22.04 and 26.04, Fedora and Arch under WSL.

### 2–4 October · Umbra becomes a thin layer

Umbra’s identity was layered on Apollo, with Apollo’s own files, documentation and translations restored, leaving a small delta to maintain. Umbra restores the host’s default speakers after a session and restarts itself when a sleeping GPU loses its runtime, which had stopped a slept host from starting co-op. A host-monitor setting can switch the physical monitor off for a stream on request.

### 3–4 October · Silent Windows audio and a frozen peer pane

Every Windows stream had been silent. The SDL audio callback used a mixing call that only works for a legacy device number. After copying samples directly, both hosts’ tones were heard. A peer pane that froze after a game launch came from a stale held keyframe. A 90-second-old keyframe is no longer paired, and the fix was seen firing live.

### 4–5 October · Duplicate audio

When both PCs play the same sound, the mix doubles it. Echo-gate prototypes were tested offline. PreceptorOfMagic then designed a passive gate, which went through five revisions on 5 October covering “S” sounds, dropouts and speech classes. Optimisation brought it to about 8% of one TV CPU core with the same output. It passed a Windows gameplay test PreceptorOfMagic accepted. Making it the default and a live TV test remain open.

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

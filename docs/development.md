[Project Hub](../README.md) · [Installation Guide](installation.md) · [Eclipse](https://github.com/PreceptorOfMagic/Eclipse) · [Umbra](https://github.com/PreceptorOfMagic/Umbra) · [Development](development.md) · [Acknowledgements](../ACKNOWLEDGEMENTS.md)

Development

# Understand the whole connection.

Eclipse and Umbra are separate application repositories with a shared protocol and co-op contract. The hub owns documentation and media, not application binaries.

[Eclipse source](https://github.com/PreceptorOfMagic/Eclipse) · [Umbra source](https://github.com/PreceptorOfMagic/Umbra)

<a name="architecture"></a>

## How the stream travels.

1. **Capture and encode · Umbra** — Each Windows host captures its game/display and audio. Ordinary sessions use the available host encoders; co-op negotiates a compatible HEVC path, including custom GPU encoding for cross-vendor compatibility.

1. **Transport and session control · both** — Moonlight-compatible discovery, pairing, control, video/audio and input transport underpin the connection. Each co-op host remains a separate session with its own identity and input destination.

1. **Join, decode and present · Eclipse** — The co-op path coordinates compatible HEVC bitstreams into the requested layout before presentation. Matching codec structures across vendors is why client layout work alone is insufficient. Platform backends handle decode and display on webOS, Windows and Linux.

1. **Audio, input and diagnostics · both** — The client mixes/selects audio and routes assigned controls. Session and capability records, host logs and recovery data make failures diagnosable across both ends.

This work was not kept solely in Aurora or Apollo because a combined client-and-host implementation was needed for broad cross-vendor co-op. Contributions adapting it into those projects or other Moonlight/Sunshine forks are welcome.

<a name="repositories"></a>

## Repository and dependency map.

| Area | Owner / source | Role |
| --- | --- | --- |
| Client UI and sessions | [Eclipse](https://github.com/PreceptorOfMagic/Eclipse) · `src/app/` | LVGL interface, stream lifecycle, co-op composition, input ownership and diagnostics. |
| Client platform backends | Eclipse · platform and video modules; webOS, Windows and Linux build scripts | webOS media integration; Windows D3D11VA and SDL presentation; Linux FFmpeg/NVDEC/VAAPI paths. |
| Client foundations | moonlight-common-c, LVGL, SDL, FFmpeg, Opus, network/crypto libraries | Protocol, interface, media, controller and secure connection plumbing. |
| Host and encoder work | [Umbra](https://github.com/PreceptorOfMagic/Umbra) · `src/` and Windows platform modules | Apollo/Sunshine host, capture, custom co-op encoder contract, virtual displays and session state. |
| Host foundations | FFmpeg, GPU SDK/API headers, display/input libraries, host web interface | Hardware encoding, devices, drivers and configuration UI. |
| Site and onboarding | [Project Hub](https://github.com/PreceptorOfMagic/Eclipse-Umbra-Project-Hub) · `site/`, `scripts/launch/` | Six-destination website, release selectors, media plan and automated page checks. |

Use each repository’s submodules and build scripts at the selected commit; do not substitute arbitrary dependency versions. [Acknowledgements](../ACKNOWLEDGEMENTS.md) lists the upstream creators and component inventory.

<a name="build"></a>

## Build and contribute.

### Eclipse

The public-facing default branch and the current integration branch can differ. Check the branch and commit before building. Desktop port work currently lives on the integration branch.

- [webOS build guide](https://github.com/PreceptorOfMagic/Eclipse/blob/main/docs/BUILD_WEBOS.md)

- [Current integration source](https://github.com/PreceptorOfMagic/Eclipse/tree/diag/feed-accounting)

- [Windows portable build script](https://github.com/PreceptorOfMagic/Eclipse/blob/diag/feed-accounting/scripts/windows/build_portable.ps1)

The Linux portable builder is maintained with the Linux client work; its final release-source commit must accompany a Linux package. Do not treat the main-branch source ZIP as a ready Linux installer.

### Umbra

Use the repository’s current `beta/vega-coop` branch and recursive submodules.

[Windows host build guide](https://github.com/PreceptorOfMagic/Umbra/blob/beta/vega-coop/docs/umbra-windows-build.md)

Keep source/build provenance with every package. Validate a clean installation, bundled components, host pairing, ordinary streaming and co-op together before publishing matching client/host releases.

### A useful contribution

1. Open an issue describing the user-visible problem, scope and affected component. Link any companion issue in the other repository.

1. Make the smallest focused change; include build information, relevant logs and a reproducible test.

1. For protocol/encoder changes, test both ends with matching commits and confirm standard streaming still works. State the exact hardware tested and what remains untested.

1. For UI/site changes, check links, keyboard navigation, narrow layouts and the relevant page checks. Keep shared navigation consistent.

<a name="timeline"></a>

## Project milestones.

### 22 July 2026 — Eclipse modifications begin

The client fork’s modification record starts here, building on Aurora and Moonlight TV.

### July–August 2026 — Two-host TV co-op

NVIDIA-pair co-op established the shared-screen client path, separate player ownership and live host coordination.

### August–September 2026 — Cross-vendor encoder work

AMD/NVIDIA stream-structure differences required custom encoding work. The experimental co-op AVC path was retired in September; the current mixed-vendor work uses custom GPU HEVC.

### 23–29 September 2026 — Desktop clients and current TV firmware

Windows co-op and Linux NVDEC co-op were exercised with AMD/NVIDIA hosts. A webOS 26 first-launch media-loading symbol conflict was fixed. Local-host use, audio restoration and portable packaging received further testing.

### 29–30 September 2026 — Diagnostics and recovery

Client/host logs, settings snapshots and unclean-session recovery were tested across Windows, Linux and TV paths.

### October 2026 — Release preparation and wider coverage

Unified documentation and platform installation routes. Public application packages are not yet attached to releases; source/build provenance and clean-install verification remain part of release preparation.

<a name="open-work"></a>

## Known issues and contribution opportunities.

| Area | Current gap | Useful evidence |
| --- | --- | --- |
| Cross-vendor image quality | Fast motion and bitrate/quality trade-offs in the custom HEVC encoder. | Exact hosts, game/scene, release, visual fault and matching diagnostic bundle. |
| Windows presentation | GPU-to-CPU readback can bottleneck 4K presentation; zero-copy work remains. | Decode vs presentation timing at multiple resolutions and GPU models. |
| Native Linux | WSL test coverage is not bare-metal validation. Experimental WSL VAAPI showed instability. | NVIDIA/AMD/Intel native driver, compositor, decoder and session reports. |
| Automatic co-op setup | The release installer must deliver working defaults and create the pane through first use, with separate co-op controls. | Clean-machine setup with no manual hidden settings, plus ordinary-stream regression checks. |
| Local-host desktop use | Keyboard/mouse focus and virtual-display lifecycle require wider testing. | Which PC runs Eclipse, controller ownership, monitor layout and reconnect behaviour. |
| Hardware coverage | AMD × AMD, Intel host combinations, other webOS TVs/versions and Windows versions. | Results outside the [current matrix](../README.md#status), including failures. |

[Eclipse/Umbra licence & notices](../LICENSES.md) · [GPL-3.0](../LICENSE.txt)

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

## Where next?

- [Install and pair](docs/installation.md) — platform downloads and exact steps.
- [Eclipse repository](https://github.com/PreceptorOfMagic/Eclipse) / [Umbra repository](https://github.com/PreceptorOfMagic/Umbra) — source, release assets and component issues.
- [Development](docs/development.md) — architecture, dependencies, milestones and open work.
- [Acknowledgements](ACKNOWLEDGEMENTS.md) — Moonlight and Sunshine’s original creators, Aurora, Apollo and the wider stack.

[![Buy me a coffee](https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=PreceptorOfMagic&button_colour=BD5FFF&font_colour=ffffff&font_family=Cookie&outline_colour=000000&coffee_colour=FFDD00)](https://www.buymeacoffee.com/PreceptorOfMagic)

[Eclipse/Umbra licence & notices](LICENSES.md) · [GPL-3.0](LICENSE.txt)

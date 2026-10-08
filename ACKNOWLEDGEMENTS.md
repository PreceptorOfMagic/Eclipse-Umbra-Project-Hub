[Project Hub](README.md) · [Installation Guide](docs/installation.md) · [Eclipse](docs/eclipse.md) · [Umbra](docs/umbra.md) · [Development](docs/development.md) · [Acknowledgements](ACKNOWLEDGEMENTS.md)

# Acknowledgements

## Credit is part of the architecture.

Eclipse and Umbra only exist because other people documented protocols, opened source, built clients and hosts, maintained libraries and solved the platform work first. Eclipse is the client application and Umbra is the host application; this record credits both lineages and the major projects used by the wider system.

This record does not replace the exact licences, notices and source references shipped with a particular release. The client fork's derivative and GPL-3.0-or-later declaration is recorded in the Eclipse source repository's [COPYRIGHT](https://github.com/PreceptorOfMagic/Eclipse/blob/main/COPYRIGHT); file-level and component notices remain in force.

## The lineage

```text
Moonlight
  ├─ moonlight-common-c
  └─ Moonlight Embedded → Moonlight TV → Aurora → Eclipse

Sunshine → Apollo → Umbra

SudoVDA provides companion virtual-display functionality.
```

Eclipse/Umbra is an independent project; see [Licences and notices](LICENSES.md#notices).

## People and projects at the foundation

### Moonlight

[Moonlight](https://moonlight-stream.org/) was created at MHacks in 2013 by **Cameron Gutman, Diego Waxemberg, Aidan Campbell, Aaron Neyer, Michelle Bergeron and Andrew Hennessy**, and has since been built by the wider Moonlight community. Moonlight’s own [Project and Community page](https://github.com/moonlight-stream/moonlight-docs/wiki/Project-and-Community) is the source for this attribution.

This client uses [moonlight-common-c](https://github.com/moonlight-stream/moonlight-common-c), the Moonlight community’s core protocol implementation, and descends through [Moonlight Embedded](https://github.com/moonlight-stream/moonlight-embedded), created by **Iwan Timmer** and contributors.

The desktop video module also incorporates and adapts decoding and presentation work from [Moonlight Qt](https://github.com/moonlight-stream/moonlight-qt) at commit [`032529d`](https://github.com/moonlight-stream/moonlight-qt/commit/032529d782242e3833e0b3b147dbbf96e878e3ca). Moonlight Qt is GPL-3.0-or-later work maintained by the Moonlight Game Streaming Project and contributors.

moonlight-common-c's Reed–Solomon forward-error-correction implementation credits **Luigi Rizzo, Alain Knaff and Iwan Timmer**, with portions derived from work by **Phil Karn, Robert Morelos-Zaragoza and Hari Thirumoorthy**. Its notice is BSD-style.

### Sunshine

[Sunshine](https://github.com/LizardByte/Sunshine) was originally created by **[@loki-47-6F-64](https://github.com/loki-47-6F-64/sunshine)** and is now maintained and developed by **[LizardByte](https://github.com/LizardByte)** and contributors. Sunshine is the open host foundation beneath Apollo and Umbra.

### Moonlight TV

[Moonlight TV](https://github.com/mariotaku/moonlight-tv) was created by **Mariotaku / Ningyuan Li** and contributors. Its LVGL large-screen client, webOS work and associated support libraries form the direct client foundation used by Aurora and Eclipse.

### Aurora

[Aurora](https://github.com/GuiDev1994/aurora-tv) was created by **[@GuiDev1994](https://github.com/GuiDev1994)** and contributors as the direct Moonlight TV derivative from which Eclipse descends. The Eclipse source repository retains Aurora-era compatibility names in parts of its source and packaging.

### Apollo

[Apollo](https://github.com/ClassicOldSong/Apollo) is developed by **[@ClassicOldSong](https://github.com/ClassicOldSong)** and contributors as a Sunshine-derived host with a virtual-display-oriented client workflow. It supplies Umbra’s everyday host functionality. Umbra is Apollo with the additions Eclipse needs for co-op and as little else changed as possible; its separate additions and branding are designed to make Apollo updates easier to integrate.

### Companion projects

- [SudoVDA](https://github.com/SudoMaker/SudoVDA), by **SudoMaker** and contributors, supplies virtual-display functionality while carrying inherited work and acknowledgements for **Roshkins, Baloukj, Anakngtokwa, Microsoft's Indirect Display Driver sample, AKATrevorJay's `edid-generator`, zjoasan, Bud, and the VirtualDrivers/MTT fork line**. SudoVDA describes SudoMaker's own changes as “MIT and CC0 or Public Domain” and directs readers to Microsoft and the inherited projects for their separate terms. SudoVDA-derived interface headers are compiled into Umbra.

### AI-assisted development

Claude and Codex are used to write and debug code and help with documentation for these forks. **[@PreceptorOfMagic](https://github.com/PreceptorOfMagic)** leads orchestration, high-level design and hands-on testing, alongside community reports and contributions. This is separate from the upstream authorship credited above.

## Client source and runtime dependencies

The exact set varies by platform and build. Licence entries describe the upstream project; a release's own notices cover the exact revision and configuration it distributes.

| Project | Role | Licence family / source |
|---|---|---|
| [moonlight-common-c](https://github.com/moonlight-stream/moonlight-common-c) | Core streaming protocol | GPL-3.0; [licence in the Eclipse tree](https://github.com/PreceptorOfMagic/Eclipse/blob/main/core/moonlight-common-c/LICENSE.txt) |
| [ENet](https://github.com/lsalzman/enet), by **Lee Salzman**, and [Cameron Gutman's Moonlight fork](https://github.com/cgutman/enet) | Network transport dependency | MIT; Eclipse pins fork revision `115a10b`; [licence in the Eclipse tree](https://github.com/PreceptorOfMagic/Eclipse/blob/main/core/moonlight-common-c/enet/LICENSE) |
| [SS4S](https://github.com/mariotaku/ss4s) | Streaming/media support | LGPL-3.0; [licence in the Eclipse tree](https://github.com/PreceptorOfMagic/Eclipse/blob/main/third_party/ss4s/LICENSE) |
| [commons-c](https://github.com/mariotaku/commons-c) | Shared C utilities | Upstream project is MIT. Its linked-list header attributes token-pasting macros to a Stack Overflow answer and `sortedinsert` to a GeeksforGeeks example. Its optional CEC loader contains [Pulse-Eight libCEC](https://github.com/Pulse-Eight/libcec)-derived material offered under GPL-2.0-or-later or separate commercial terms. |
| [LVGL](https://github.com/lvgl/lvgl) / [Mariotaku fork](https://github.com/mariotaku/lvgl) | User interface | MIT |
| [libmicrodns](https://github.com/videolabs/libmicrodns) | Local service discovery | LGPL-2.1-or-later, with a separate commercial option upstream; [copying file in the Eclipse tree](https://github.com/PreceptorOfMagic/Eclipse/blob/main/third_party/libmicrodns/COPYING) |
| [SDL](https://github.com/libsdl-org/SDL) and [SDL_image](https://github.com/libsdl-org/SDL_image) | Window, input and image support | zlib |
| [SDL-webOS](https://github.com/webosbrew/SDL-webOS) | webOS SDL port | Upstream project notices apply |
| [SDL_GameControllerDB](https://github.com/gabomdq/SDL_GameControllerDB) | Controller mappings | zlib |
| [Google Material Icons](https://github.com/google/material-design-icons) | Interface icon font | Apache-2.0 |
| [Montserrat 7.200](https://github.com/JulietaUla/Montserrat/releases/tag/v7.200) | Embedded LVGL text glyph data | Copyright 2011 The Montserrat Project Authors; SIL Open Font License 1.1; begun by Julieta Ulanovsky and developed by its contributors |
| [Font Awesome Free 5.9.0](https://github.com/FortAwesome/Font-Awesome/releases/tag/5.9.0) | Embedded Solid, Brands and Regular symbols in the LVGL font data | Font glyphs are SIL Open Font License 1.1; Copyright © Font Awesome |
| [Unscii 1.0](https://github.com/viznut/unscii) | Embedded LVGL 8-pixel font data | Unscii-8 by Ville-Matias “Viznut” Heikkilä; upstream offers this variant as public domain or CC0 |
| [Mbed TLS](https://github.com/Mbed-TLS/mbedtls) | TLS/cryptographic support | Apache-2.0 for relevant current versions |
| [Opus](https://github.com/xiph/opus) | Audio codec | BSD-style redistribution terms; its `COPYING` also records royalty-free patent-licence references |
| [curl/libcurl](https://github.com/curl/curl) | HTTP transport | curl licence |
| [Expat](https://github.com/libexpat/libexpat) | XML parsing | MIT |
| [FreeType](https://gitlab.freedesktop.org/freetype/freetype) | Font rendering | FreeType licence or GPL-2.0 |
| [Fontconfig](https://gitlab.freedesktop.org/fontconfig/fontconfig) | Font discovery | MIT-style |
| [inih](https://github.com/benhoyt/inih) | INI parsing | BSD-3-Clause |
| [FFmpeg](https://github.com/FFmpeg/FFmpeg) | Media pipeline components | LGPL/GPL depending on the exact configuration |
| [OpenSSL](https://github.com/openssl/openssl) | TLS in applicable desktop builds | Apache-2.0 for current versions |
| [h264bitstream](https://github.com/aizvorski/h264bitstream) | Tracked experimental/dormant codec tooling | LGPL-2.1; [licence in the Eclipse tree](https://github.com/PreceptorOfMagic/Eclipse/blob/main/third_party/h264bitstream/LICENSE) |
| [CMake](https://github.com/Kitware/CMake) | Copied build modules | BSD-3-Clause notices |
| [Unity](https://github.com/ThrowTheSwitch/Unity), by Mike Karlesky, Mark VanderVoord, Greg Williams and contributors | Client unit-test framework; development only | MIT; [licence in the Eclipse tree](https://github.com/PreceptorOfMagic/Eclipse/blob/main/third_party/Unity/LICENSE.txt), pinned submodule revision `8ba01386008196a92ef4fdbdb0b00f2434c79563` |
| [Sharp](https://github.com/lovell/sharp), by Lovell Fuller and contributors, with [libvips](https://github.com/libvips/libvips) and the colour-package contributors | Pinned launch-tool pipeline that renders the social card and webOS artwork; development only, not part of the static site or application runtime | Sharp Apache-2.0; the locked Linux libvips package declares LGPL-3.0-or-later; colour dependencies are MIT; exact versions are in `scripts/launch/package-lock.json` |

Platform and build projects also include [libpbnjson](https://github.com/webosose/libpbnjson), [webOS OSE](https://github.com/webosose), [webos-userland](https://github.com/webosbrew/webos-userland) and [buildroot-nc4](https://github.com/openlgtv/buildroot-nc4). This table records the major source, linked, vendored and generated-asset inputs; it is not an exhaustive list of build-time packages, system dependencies or workstation utilities.

## Umbra and Apollo dependencies

Major projects include:

- The ClassicOldSong fork of [moonlight-common-c](https://github.com/ClassicOldSong/moonlight-common-c) and its [ENet](https://github.com/lsalzman/enet) transport dependency. Umbra compiles/links these itself; they are not only Eclipse dependencies.
- [libdisplaydevice](https://github.com/LizardByte/libdisplaydevice) — its `LICENSE` file states AGPL-3.0 and its CMake metadata states GPL-3.0.
- [shared-web](https://github.com/LizardByte/shared-web) — the published `@lizardbyte/shared-web@2025.626.181239` metadata declares AGPL-3.0-only and dependencies including Bootstrap 5.3.7 and Font Awesome 6.7.2.
- [inputtino](https://github.com/games-on-whales/inputtino) — MIT.
- [Simple-Web-Server fork](https://github.com/ClassicOldSong/Simple-Web-Server) — MIT, by Ole Christian Eidheim and contributors.
- [ViGEmClient](https://github.com/LizardByte/Virtual-Gamepad-Emulation-Client) — MIT, Copyright © 2017–2023 **Benjamin “Nefarius” Höglinger-Stelzer**, Nefarius Software Solutions e.U. and contributors; client revision `8d71f674`.
- [ViGEmBus 1.21.442.0](https://github.com/nefarius/ViGEmBus/releases/tag/v1.21.442.0) — BSD-3-Clause, Nefarius Software Solutions. This is a separate signed driver installer.
- [qrcodejs](https://github.com/davidshimjs/qrcodejs) by David Shim — MIT. The bundled minified file matches upstream commit `04f46c6`.
- [nanors](https://github.com/sleepybishop/nanors), by **Joseph Calderon**, and [tray](https://github.com/LizardByte/tray), originally by **Serge Zaitsev** — permissive projects; nanors includes nested `sse2neon` material.
- [TPCircularBuffer](https://github.com/michaeltyson/TPCircularBuffer), by **Michael Tyson / A Tasty Pixel**, using a technique by **Philip Howard** adapted by **Kurt Revis** — its podspec says MIT, while the redistributed C/H files carry zlib-style terms including an altered-source marking condition.
- [Wayland protocols](https://gitlab.freedesktop.org/wayland/wayland-protocols) and [wlr protocols](https://gitlab.freedesktop.org/wlroots/wlr-protocols) — MIT-style, including per-file notices.
- [nv-codec-headers](https://github.com/FFmpeg/nv-codec-headers) and [NVAPI SDK fork](https://github.com/LizardByte/nvapi-open-source-sdk) — NVIDIA notices.
- Vue, Vue I18n, Bootstrap, Popper, Boost, nlohmann JSON, miniupnpc, MinHook, zlib, Opus, curl and OpenSSL — each under its own licence and notices. The static-curl link record also names libssh2, Brotli, zstd, libpsl, libunistring, libiconv and libidn2.
- Font Awesome Free — mixed CC-BY-4.0, OFL-1.1 and MIT terms depending on the redistributed asset. Bootstrap 5.3.7 and Font Awesome 6.7.2 are imported into the web application.
- FFmpeg, x264, x265, SVT-AV1, Intel VPL and AMD AMF — Umbra’s static media stack. The binary-distribution submodule is commit `cf5dffaf`; its commit points to [LizardByte build-deps recipe `6ad5cf8`](https://github.com/LizardByte/build-deps/tree/6ad5cf841f592f95be47fb401cde02ae621acd0f). That recipe pins FFmpeg `9373b442` (`n7.1.1-20`), x264 `ff620d0`/build 165, x265 `1d117be`/4.1, SVT-AV1 `08c18ba`/1.6.0, AMF `16f7d73` and nv-codec-headers `22441b5`.
- Umbra statically links x265 4.1's `dynamicHDR10`/HDR10+ library, Copyright © 2013–2020 MulticoreWare, Inc., authored by **Bhavna Hariharan and Kavitha Sampath**, offered under GPL-2.0-or-later or separate commercial terms. That archive includes [json11](https://github.com/dropbox/json11), Copyright © 2013 Dropbox, Inc., under the MIT License.
- Platform-specific inherited source includes GLAD/Khronos material and NVIDIA NvFBC/`helper_math` notices.
- Additional copied or adapted host sources include FrogTheFrog/Sunshine-derived Windows utility code, an Avahi example-derived Linux publisher, keylase/nvidia-patch-derived CUDA constants, a Stack Overflow-derived Linux input routine, `FindWayland.cmake` by Martin Gräßlin and Georges Basile Stavracas Neto, and `nocnokneo/cmake-git-versioning-example`.

## Experimental GPU HEVC work

The experimental encoder code records provenance from [x265 commit `b81f650`](https://bitbucket.org/multicoreware/x265_git/src/b81f650e21e8aacbe6a9ad04ce14aefc05b932c0/) and [Khronos OpenCL-Headers](https://github.com/KhronosGroup/OpenCL-Headers). Codec copyright licences do not themselves grant every patent right that may apply in every jurisdiction.

## Supporting upstream work

Supporting this project does not fund its upstreams. To support an upstream project, follow the funding links on that project’s own repository or maintainer profile. Support for Eclipse/Umbra is described in [SUPPORT.md](SUPPORT.md).

## Media on this site

The demonstration clips and screens were recorded by an AI assistant (Claude) as an unattended capability test while the developer was away. The host desktops in them show Wallpaper Engine wallpapers from the Steam Workshop: [“Moon Light”](https://steamcommunity.com/sharedfiles/filedetails/?id=1539918440) by Sir Crab and [“KIKI&JIJI”](https://steamcommunity.com/sharedfiles/filedetails/?id=2466412743) (art credited to Ayu) by 鬥丨Dou. They remain their creators’ work and appear only as each PC’s desktop background.

## Corrections

If an attribution is incomplete, please open an issue with a primary source and the affected release. This inventory is engineering documentation, not legal advice.

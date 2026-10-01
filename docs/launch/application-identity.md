# Eclipse/Umbra application identity matrix

Eclipse/Umbra is one project with two named applications:

- **Eclipse** is the client application.
- **Umbra** is the host application.

These names must be visible in the applications themselves. “Eclipse client” and
“Umbra host” are role descriptions, not replacement names, and the suite framing
must not leave a user installing software that still introduces this fork as
Aurora or Apollo.

The naming rule is intentionally narrow:

1. Replace user-facing **Aurora** branding with **Eclipse**.
2. Replace user-facing **Apollo** branding with **Umbra**.
3. Keep inherited **Moonlight** and **Sunshine** names where the Aurora and Apollo
   projects kept them, including compatibility and long-standing component names.
4. Keep factual references to the upstream Aurora and Apollo projects in lineage,
   credits, licences and compatibility choices.
5. Preserve a legacy ID, executable filename, service key or data path when changing
   it would break upgrades, scripts, settings or pairing. Such a value is an
   internal compatibility identifier, not the application's public name.

## Required visible presentation

| Surface | Required presentation | Deliberately retained naming |
|---|---|---|
| Public hub and social cards | `ECLIPSE / UMBRA` | Factual Moonlight → Moonlight TV → Aurora and Sunshine → Apollo lineage |
| Client launcher, window, installer and listing | `Eclipse` | Inherited Moonlight component/executable names; stable webOS ID and settings paths if migration would be destructive |
| Client About, quit/error prompts and support bundle | `Eclipse` | Upstream names used to identify compatibility or attribution |
| Host installer, Start menu, tray and browser UI | `Umbra` | `sunshine.exe` and Sunshine protocol/component terminology |
| Windows Services display name and description | `Umbra Host Service` | Service key `ApolloService` only if retaining it is needed for in-place upgrade and automation compatibility |
| Host About, logs and support bundle | `Umbra` | Upstream Apollo references used only for factual lineage or comparison |

## Current Eclipse client audit

| Surface | Current state | Release action |
|---|---|---|
| webOS launcher title | **Eclipse** is injected for live builds; **Eclipse Beta** for beta builds. | Retest both tiles after final artwork is installed. |
| webOS vendor and description | Updated to Eclipse/Umbra wording in `deploy/webos/appinfo.json`. | Inspect generated IPK metadata rather than trusting the template alone. |
| Windows executable metadata/package copy | Product name and file description are **Eclipse** and checked by `scripts/windows/build_portable.ps1`. | Verify Explorer metadata on the final archive and state its signing status. |
| Linux desktop entry | It retains the inherited **Moonlight TV** name. | Leave it under the naming rule unless the Linux release work establishes that Aurora had already branded this surface as Aurora. |
| Steam Link table of contents | The inherited Aurora label is replaced with **Eclipse**. | Ship only if Steam Link becomes a validated launch surface. |
| webOS Homebrew listing | Its visible title/copy now say Eclipse, but inherited URLs, performance copy, icons and ownership remain deliberately gated. | Regenerate all listing metadata from the final public release before submission. |
| Runtime translations and messages | The main English application title is Eclipse; historical catalogues and some diagnostics still contain Aurora. | Refresh the catalogue and replace shipped user-facing Aurora text, without rewriting factual upstream credits. |
| Icons and splash artwork | The source webOS icon and splash assets now use the shared Eclipse/Umbra mark, with a pinned renderer and hash manifest. Generated build output is still stale. | Rebuild, inspect the launcher tile and splash on-device, and verify the packaged hashes before release. |

## Current Umbra host audit

The reviewed Umbra development tree at `/mnt/c/Users/camer/apollo-build` now has
the first visible-name pass applied. These source changes are unbuilt and have not
yet passed clean-install or upgrade testing, so application identity remains a
release gate rather than an alternative branding plan.

| Surface | Current state | Release action |
|---|---|---|
| CMake project/package metadata | The project, package description and homepage now identify **Umbra**. | Build and inspect Windows metadata, installer filename, installed-app entry and Start menu; measure the install-directory/upgrade effect. |
| Windows service | The visible display name/description now say **Umbra Host Service**; the compatibility key remains `ApolloService`. | Test clean install, in-place upgrade, autostart, uninstall and rollback before accepting the retained key. |
| System tray and discovery | The tooltip/menu and default advertised host name now say Umbra. | Exercise tray relaunch and client discovery against the final build. |
| Browser UI and locales | Page title, navigation, controls, resource targets and all 20 locale files now pass the Umbra identity check. Shared Eclipse/Umbra source artwork has replaced the visible inherited artwork while compatibility filenames remain. | Build the web assets and inspect every principal page and icon state. Keep factual upstream links clearly labelled. |
| Installer, Start menu and firewall | CMake now derives Umbra package/shortcut names; firewall rules use Umbra and remove the legacy Apollo/Aurora-labelled rules. | Verify install, upgrade and uninstall leave exactly the intended shortcuts and firewall rules. |
| Companion audio/device labels | Host source now searches for `Eclipse Mic Bridge` first, then the legacy `Aurora Mic Bridge`, then the stock endpoint. Existing devices are deliberately not renamed yet. | After preserving an Eclipse-aware rollback build, perform the elevated in-place endpoint rename with GUID/readback/idempotency tests; keep the fallback through the migration window. |
| Executable/protocol internals | `sunshine.exe` and Sunshine terminology are inherited throughout the host. | Retain them under the naming rule; do not surface them as a competing application brand. |

## Acceptance checks

Before a release is called Eclipse/Umbra:

1. Install the client and host on clean machines and upgrade representative existing
   installs without losing pairing, settings, applications or rollback ability.
2. Inspect launcher tiles, installed-app listings, archive names, Start menu entries,
   window titles, browser tabs, system tray, service display names, About/Credits,
   quit/error dialogs and support bundles.
3. Search unpacked artifacts for `Aurora` and `Apollo`. Classify each match as a
   factual upstream reference, a deliberately retained internal compatibility value
   or a visible identity bug; do not waive unexplained matches.
4. Search for `Moonlight` and `Sunshine` only to confirm that each occurrence is an
   inherited name, compatibility statement or acknowledgement—not to remove it.
5. Confirm the client introduces itself as **Eclipse**, the host as **Umbra**, and
   every first-run or download surface connects both to the single
   **Eclipse/Umbra** project.
6. Repeat on both a clean install and an upgrade. A rename that works only on a clean
   machine is not release-ready.

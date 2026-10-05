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
2. Present the running host as **Umbra**, using its own identity layer rather than rewriting Apollo’s README, translations or resource cards. Label retained Apollo links as upstream resources.
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

The October 3 thin-fork work supersedes the earlier direct-edit branding pass.
Umbra is Apollo with the additions Eclipse needs for co-op and as little else
changed as possible. Keep identity in Umbra-owned files so Apollo updates are
easier to merge. See the [upstream sync guide](https://github.com/PreceptorOfMagic/Umbra/blob/umbra/thin/docs/umbra-upstream-sync.md).

| Surface | Current approach | Release action |
| --- | --- | --- |
| GitHub introduction | Umbra owns `.github/README.md`; the root README stays Apollo’s. | Do not replace the upstream root README with the Umbra landing copy. |
| Browser text and colours | `umbra_identity.js`, `umbra.css` and `UmbraCard.vue` layer Umbra identity over the retained Apollo UI. | Test rendered pages and languages after upstream merges; do not edit Apollo’s translation files to rename the host. |
| Host version panel | Shows the Umbra build, recorded Apollo release base and published-release comparison. | Check version metadata; a release notice does not establish that every newer upstream commit is included. |
| Artwork | Shared Project Hub mark, rendered into host icons by `scripts/umbra-artwork/render.cjs`. | Change the master and rerender; check installer, tray states and web UI rather than editing outputs by hand. |
| Installer and service identity | Visible product identity is Umbra; the Apollo install directory, registry identity and compatibility service key are retained. | Explain that Apollo and Umbra replace one another in place. Back up and test configuration/pairing preservation, upgrades and rollback. |
| Upstream resources | Apollo’s own links and attribution stay clearly identified as Apollo’s. | Direct Umbra support requests to Umbra, not Apollo’s maintainers. |
| Executable and protocol internals | Inherited Sunshine names and compatibility identifiers remain. | Retain them; a source filename containing Apollo is not by itself a visible identity defect. |

Run `node scripts/umbra_check.mjs` against the selected Apollo base and justify any
new upstream-file changes in `scripts/umbra-delta.txt`. Final release artifacts still
need their own clean-install and upgrade checks; source identity is not enough.

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

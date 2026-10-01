# Eclipse/Umbra repository unification

The public experience should feel like one project without forcing unrelated
histories, licences and release pipelines into one repository. The chosen hub
is the clean user-site repository
`PreceptorOfMagic/PreceptorOfMagic.github.io`, published at
`https://preceptorofmagic.github.io/`.

This is a deliberate release boundary. The existing Eclipse source history is
multi-gigabyte and includes diagnostic logs, frame captures, user-photo
evidence and IDE state that do not belong on a public marketing surface. The
hub starts from a new reviewed history and contains only the website, launch
documents, delivery-media tooling and accepted web media. It never imports the
client repository's Git history.

## Recommended structure

| Surface | Public role |
| --- | --- |
| `PreceptorOfMagic.github.io` hub | Canonical explanation, quick start, status, media, acknowledgements and support policy |
| Eclipse repository | Client source, platform builds, client issues and client releases |
| Umbra repository | Host source, host installation/configuration, host issues and host releases |
| CTM-USBIP repository | Clearly labelled optional advanced device transport; not part of the basic co-op path |
| Account or future organisation profile | Short project map pointing to the hub and the two applications |

An organisation can be added later, but it is not required for launch and must
not delay the clean public hub. If repositories are eventually transferred,
GitHub normally redirects old repository URLs, but every release, Pages,
workflow, badge, submodule and package URL must still be checked explicitly.
Do not combine the repositories merely for appearance: their inherited
histories, licensing, issue scopes and binary releases remain distinct.

## Repository boundary

The hub may contain:

- the static `site/` output and its original web artwork;
- public launch, recording and accessibility documentation;
- deterministic site/media validation scripts;
- the hub's funding configuration, support policy and acknowledgements; and
- final, rights-cleared delivery media listed in the reviewed media manifest.

It must not contain raw footage, private run sheets, diagnostic scratchpads,
test captures, credentials, machine or network identifiers, application
binaries, source-repository object history or user-photo evidence. Eclipse,
Umbra and CTM-USBIP each retain their own source, issues, packages, notices and
release evidence.

## Shared first-screen contract

Every repository landing page should show these facts before build internals:

1. **Eclipse/Umbra is one project.** Eclipse is the client application and
   Umbra is the host application.
2. The current repository's role, upstream lineage and licence.
3. A direct link to the canonical hub and consumer quick start.
4. A direct link to the sibling application.
5. Engineering-preview and package/signing status stated accurately.
6. Prominent acknowledgements and a factual non-affiliation statement.

The banner, terminology and link order should be identical; only the role,
lineage and repository-specific status change.

## Eclipse client repository header

```markdown
<p align="center">
  <a href="https://preceptorofmagic.github.io/">
    <img src="site/assets/og-card.png" alt="Eclipse/Umbra — two PCs, one screen" width="960">
  </a>
</p>

> **Eclipse/Umbra** is one free and open-source game-streaming project.
> This repository contains **Eclipse**, the client application and two-stream
> co-op composer, derived from Moonlight TV and Aurora. The matching
> **[Umbra host](https://github.com/PreceptorOfMagic/umbra)** is derived from
> Sunshine and Apollo.

**[Project hub](https://preceptorofmagic.github.io/)** ·
**[Quick start](https://preceptorofmagic.github.io/setup.html)** ·
**[Current status](https://preceptorofmagic.github.io/#status)** ·
**[Acknowledgements](ACKNOWLEDGEMENTS.md)**
```

## Umbra host repository header

The host repository should store a copy of the shared social card so its README
does not depend on a private or mutable raw-file URL.

```markdown
<p align="center">
  <a href="https://preceptorofmagic.github.io/">
    <img src="docs/assets/eclipse-umbra-card.png" alt="Eclipse/Umbra — two PCs, one screen" width="960">
  </a>
</p>

> **Eclipse/Umbra** is one free and open-source game-streaming project.
> This repository contains **Umbra**, the Windows host application derived
> from Sunshine and Apollo. The matching **[Eclipse client](https://github.com/PreceptorOfMagic/eclipse)**
> receives one or two live host sessions and presents them on the shared display.

**[Project hub](https://preceptorofmagic.github.io/)** ·
**[Quick start](https://preceptorofmagic.github.io/setup.html)** ·
**[Current status](https://preceptorofmagic.github.io/#status)** ·
**[Acknowledgements](ACKNOWLEDGEMENTS.md)**
```

## Organisation profile copy

> **Eclipse/Umbra** turns two independently running Windows game sessions into
> one shared couch co-op display. Install the Umbra host on the gaming PCs and
> use the Eclipse client on the TV or supported desktop. Start with the
> [project hub](https://preceptorofmagic.github.io/) and
> [quick start](https://preceptorofmagic.github.io/setup.html).

Do not enable these public links until both repositories and their default-
branch files are readable while signed out. After an organisation or URL move,
update this file and the public site once rather than allowing parallel old and
new link sets to drift.

## GitHub About fields and topics

Use the same canonical website URL on every repository:
`https://preceptorofmagic.github.io/`.

| Repository | About description | Topics |
|---|---|---|
| Eclipse | `Eclipse client for Eclipse/Umbra: Moonlight-derived streaming and two-host couch co-op for LG webOS and desktop.` | `game-streaming`, `couch-coop`, `moonlight`, `webos`, `lg-webos`, `desktop`, `open-source` |
| Umbra | `Umbra host for Eclipse/Umbra: Sunshine/Apollo-derived Windows streaming with virtual-display and co-op integration.` | `game-streaming`, `sunshine`, `moonlight`, `windows`, `virtual-display`, `couch-coop`, `open-source` |
| CTM-USBIP | `Optional USB/IP device transport for advanced Eclipse/Umbra setups; not required for basic co-op.` | `usbip`, `windows`, `raspberry-pi`, `controller`, `open-source` |

Do not put “official Moonlight” or “official Sunshine” in descriptions or
topics. Factual compatibility/lineage terms are enough.

## Organisation profile and pinned order

The organisation profile README should expose, in this order:

1. the one-project statement and co-op outcome;
2. **Project hub**, **Quick start**, **Current status** and **Acknowledgements**;
3. one sentence and one source link each for Eclipse and Umbra; and
4. CTM-USBIP under an “Optional advanced transport” label.

Pin repositories in the same reading order: **Eclipse**, **Umbra**, then
**CTM-USBIP**. The first two descriptions must say “client” and “host” so a
visitor does not have to infer the relationship from celestial names.

## Issue routing

| Report type | Intake repository |
|---|---|
| Eclipse UI, TV/desktop client, decode, composition or client input behaviour | Eclipse issues |
| Umbra pairing, capture, encoder, virtual display, service, installer or host web UI | Umbra issues |
| CTM-USBIP agent, Pi device hub or USB/IP transport | CTM-USBIP issues |
| Cross-component co-op failure where the owner is genuinely unknown | Eclipse `integration` issue form; maintainers transfer or link the host-side issue after triage |
| Security vulnerability | The verified private reporting route in `SECURITY.md`, never a public issue |

Every issue form should link the sibling tracker and briefly list what belongs
there. The hub and site footer must label **Eclipse issues** and **Umbra issues**
separately; never use a generic “Issues” link that silently lands in the client
repository.

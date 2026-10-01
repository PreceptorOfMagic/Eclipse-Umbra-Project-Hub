<p align="center">
  <a href="site/index.html">
    <img src="site/assets/og-card.png" alt="Eclipse/Umbra — two PCs, one screen" width="960">
  </a>
</p>

<p align="center">
  <strong>The public hub for Eclipse/Umbra: an Eclipse client, two Umbra hosts and two live PCs on one shared couch co-op display.</strong>
</p>

<p align="center">
  <a href="site/index.html">Review homepage</a> ·
  <a href="site/setup.html">Review setup</a> ·
  <a href="site/projects.html">Review project map</a> ·
  <a href="site/credits.html">Review acknowledgements</a> ·
  <a href="site/support.html">Review support</a>
</p>

Canonical Pages URL after publication: `https://preceptorofmagic.github.io/`

> [!NOTE]
> This repository contains the project website and launch documentation, not the client or host source histories. It remains private while the presentation and release material are reviewed.

## One project, two applications

**Eclipse/Umbra** is the project identity. **Eclipse** is the large-screen client application derived through Moonlight TV and Aurora. **Umbra** is the matching Windows host application derived through Sunshine and Apollo. The defining addition is a two-host mode that presents two independent live streams side by side or stacked on one TV or desktop display.

The repositories remain separate so their inherited histories, licences, release pipelines and issue scopes stay understandable:

| Surface | Responsibility |
|---|---|
| [Project hub source](site/index.html) | Consumer explanation, quick start, status, media, acknowledgements and support disclosures; the [canonical site](https://preceptorofmagic.github.io/) activates at publication |
| [Eclipse](https://github.com/PreceptorOfMagic/eclipse) | Client source, client releases and client issues |
| [Umbra](https://github.com/PreceptorOfMagic/umbra) | Host source, host releases and host issues |
| [CTM-USBIP](https://github.com/PreceptorOfMagic/CTM-USBIP) | Optional advanced controller/device transport |

This project exists because others shared their work first. Moonlight was created at MHacks 2013 by Cameron Gutman, Diego Waxemberg, Aidan Campbell, Aaron Neyer, Michelle Bergeron and Andrew Hennessy. Sunshine was originally created by `@loki-47-6F-64` and is now maintained by LizardByte and contributors. The direct lineages continue through Moonlight TV by Mariotaku and Aurora by GuiDev1994 to Eclipse, and through Apollo by `@ClassicOldSong` to Umbra. See the [full acknowledgements](ACKNOWLEDGEMENTS.md) for source links, licences and the wider dependency inventory.

## Website source

- `site/` is the complete static site uploaded to GitHub Pages.
- `docs/launch/` contains the publication, recording, media and community-post material.
- `scripts/launch/` validates the public site, support route and final media package.
- `.github/workflows/pages.yml` deploys only after this repository is public.

Run the private-safe checks with:

```bash
node scripts/launch/check_public_site.mjs
node scripts/launch/check_funding.mjs
node --test scripts/launch/check_media.test.mjs
node scripts/launch/check_hub_boundary.mjs
```

The stricter `node scripts/launch/check_launch_ready.mjs` is expected to remain red until compatible releases, real recorded footage, captions and the remaining identity/compliance evidence are complete.

## Publication boundary

This clean hub deliberately excludes application source history, diagnostic logs, test captures, private user photographs, raw recording masters and IDE state. `check_hub_boundary.mjs` enforces the top-level allowlist, rejects private-development directories, archives, binaries, raw capture formats, symlinks, oversized files and common credential/local-path patterns. Making this repository public therefore exposes only the reviewed website and launch material. The Eclipse and Umbra repositories have their own independent public-history and release reviews.

The first Pages deployment may require one enablement step immediately after the repository becomes public on GitHub Free; the exact sequence is recorded in [the publishing guide](docs/launch/publish-site.md). Nothing in the private workflow changes repository visibility.

## Support and independence

Optional reward-free support uses one [Buy Me a Coffee](https://buymeacoffee.com/preceptorofmagic) destination. One-time or monthly support buys no access, features, priority, exclusive content or influence. The Australian recipient, fees, currency, cancellation, privacy, tax and legal caveats are set out in [SUPPORT.md](SUPPORT.md).

Eclipse/Umbra is an independent community project, not affiliated with or endorsed by Moonlight, Sunshine, LG Electronics, NVIDIA, AMD, Amazon, DXC or the Eclipse Foundation. Third-party names identify lineage or compatibility; their names and marks remain the property of their respective owners.

The website source is provided under GPL-3.0-or-later unless a file states otherwise. Third-party projects and media retain their own notices and terms; see [LICENSE.txt](LICENSE.txt) and [ACKNOWLEDGEMENTS.md](ACKNOWLEDGEMENTS.md).

<p align="center">
  <a href="site/index.html"><img src="site/assets/og-card.png" alt="Eclipse/Umbra — two PCs, one screen" width="960"></a>
</p>

<p align="center"><strong>The website for Eclipse and Umbra: everyday game streaming plus two-PC couch co-op on one shared display.</strong></p>

<p align="center">
  <a href="site/index.html">Home</a> ·
  <a href="site/setup.html">Installation Guide</a> ·
  <a href="site/eclipse.html">Eclipse</a> ·
  <a href="site/umbra.html">Umbra</a> ·
  <a href="site/development.html">Development</a> ·
  <a href="site/credits.html">Acknowledgements</a>
</p>

Canonical Pages URL after publication: `https://preceptorofmagic.github.io/Eclipse-Umbra-Project-Hub/`

## One project, two applications

**Eclipse** is the LG webOS, Windows and Linux client. **Umbra** is the Windows host. Together they provide conventional one-host game streaming and a coordinated two-host mode that presents independent live games side by side or stacked on one television or desktop display.

The repositories remain separate so their histories, licences, releases and issue scopes stay clear:

| Repository | Responsibility |
|---|---|
| [Eclipse/Umbra Project Hub](https://github.com/PreceptorOfMagic/Eclipse-Umbra-Project-Hub) | Website, installation path, status, development overview and acknowledgements |
| [Eclipse](https://github.com/PreceptorOfMagic/Eclipse) | Client source, client releases and client issues |
| [Umbra](https://github.com/PreceptorOfMagic/Umbra) | Host source, host releases and host issues |

## Website source

- `site/` is the complete static GitHub Pages site.
- `docs/launch/` contains private-to-public publishing, recording and community-post material.
- `scripts/launch/` validates the site boundary, navigation, funding control, links and media contracts.
- `.github/workflows/pages.yml` validates private pushes and deploys only after the repository is public.

Run the private-safe checks with:

```bash
node scripts/launch/check_public_site.mjs
node scripts/launch/check_funding.mjs
node --test scripts/launch/check_media.test.mjs
node scripts/launch/check_hub_boundary.mjs
```

The stricter `node scripts/launch/check_launch_ready.mjs` remains a final-media and release-evidence gate; the website deliberately retains labelled media placeholders until the approved footage and images replace them.

## Publication boundary

The hub excludes application source history, diagnostic logs, test captures, private photographs, raw recording masters, packages and IDE state. `check_hub_boundary.mjs` enforces that boundary. Changing the repository to public triggers the deployment workflow; it does not change the visibility of Eclipse or Umbra.

Eclipse/Umbra is an independent community project, not affiliated with or endorsed by Moonlight, Sunshine, LG Electronics, NVIDIA, AMD, Intel, Amazon, DXC or the Eclipse Foundation. Third-party names identify lineage or compatibility. The website source is provided under GPL-3.0-or-later unless a file states otherwise; see [LICENSE.txt](LICENSE.txt) and [ACKNOWLEDGEMENTS.md](ACKNOWLEDGEMENTS.md).

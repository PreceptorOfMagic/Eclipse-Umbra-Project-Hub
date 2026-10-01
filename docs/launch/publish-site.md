# Publish the Eclipse/Umbra site

The hub repository is **PreceptorOfMagic/Eclipse-Umbra-Project-Hub**. Keep it and the two application repositories private during editing. The hub owns the site and documentation; Eclipse and Umbra own their source, issues and release attachments.

## Private review

The repository README and [Markdown installation](../installation.md) / [development](../development.md) guides render directly on GitHub for signed-in collaborators. They do not link to raw HTML as if it were a rendered website. The styled website is in `site/`; preview it locally.

GitHub’s normal Code view includes a file list above the README. A repository cannot hide that list through README content. Use the rendered GitHub Pages website as the external visitor destination. The site itself only offers application source links to Eclipse and Umbra in its visitor-facing overview.

## Validation

Run:

```sh
node scripts/launch/check_hub_boundary.mjs
node scripts/launch/check_public_site.mjs
node scripts/launch/check_funding.mjs
node --test scripts/launch/check_media.test.mjs scripts/launch/check_downloads.test.mjs
```

These checks also run on private pushes. The deployment job is skipped while the repository is private. Licence notices are in `LICENSES.md` and `site/licence.html`; canonical GPL files remain untouched so GitHub can continue detecting them. GitHub does not provide a custom extra repository licence tab; the README supplies the project-notice link beside GPL.

## Release assets

The download controls query the latest **stable, published** release of each application without credentials. While the repositories are private they retain links to the signed-in release lists. Do not embed a GitHub token in the website.

Recognised assets:

| Platform | Filename |
|---|---|
| Eclipse webOS | `com.aurora.gamestream_<version>_arm.ipk` (standard, not beta ID) |
| Eclipse Windows | `eclipse-windows-x64-unsigned.zip` or `eclipse-windows-x64.zip` |
| Eclipse Linux | `eclipse-linux-x86_64.tar.gz` |
| Umbra Windows | `Umbra-windows-x64.exe` or `Umbra.exe`; inherited `Apollo.exe` is also recognised |

Attach only one matching package per platform to the stable release. Multiple matches are deliberately not guessed: the button falls back to the release list. Publish checksum files, release notes and source/build provenance alongside packages. If package naming changes, update `site/assets/downloads.mjs`, its tests and the guide together. Release file availability is separate from site readiness.

## Publishing when the owner chooses

The canonical external destination is [Eclipse/Umbra Project Hub](https://preceptorofmagic.github.io/Eclipse-Umbra-Project-Hub/).

1. Make the component repositories and matching releases available to intended visitors. Verify their download/issue links signed out.
2. In hub **Settings → Pages**, choose **GitHub Actions** as the source when the account plan/visibility permits Pages.
3. Change the hub visibility only when the owner requests it. Its `public` event starts the deployment workflow; if Pages required post-visibility setup, complete step 2 and rerun **Deploy project site**.
4. Open all six destinations, a platform download and the licence link while signed out.
5. Link external posts to the hub; demonstrations link to `/#showcase`. Replace media placeholders with the finished recordings when available.

The workflow never changes repository visibility. Later public main-branch pushes redeploy automatically.

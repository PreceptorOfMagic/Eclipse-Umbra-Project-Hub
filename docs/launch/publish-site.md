# Publish the Eclipse/Umbra site

The publishing path is deliberately short. The dedicated
`PreceptorOfMagic/PreceptorOfMagic.github.io` hub remains private while the site
is edited. Its Pages workflow belongs on `main`, validates the static site, and
skips every private-repository run.

## Before changing visibility

1. Clone the hub into a fresh directory and audit its complete history, not only the Pages artifact. Run `node scripts/launch/check_hub_boundary.mjs` and confirm that it contains no raw footage, private run sheet, diagnostic log, test capture, user-photo evidence, credential, application binary or imported source-repository history.
2. Audit the Eclipse, Umbra and CTM-USBIP repositories separately before making any of them public. The hub's clean history does not make an application source history safe.
3. Make Eclipse and Umbra public first if their source, setup and issue links must work for signed-out visitors on day one. CTM-USBIP can remain private only if its links and launch copy are removed or explicitly marked unavailable.
4. Confirm `.github/workflows/pages.yml` is present on the default `main` branch and that its private validation job is green. Keep the walkthrough placeholder until the real recording is ready, or replace it with the public HTTPS video link; the community drafts point to the stable walkthrough page either way.
5. Check whether `gh api repos/PreceptorOfMagic/PreceptorOfMagic.github.io/pages` succeeds. GitHub Free does not provide Pages for a private repository, so a private preconfiguration may return `404` or a plan error.

## Publish

Change only `PreceptorOfMagic/PreceptorOfMagic.github.io` from private to public. GitHub's `public` event starts the Pages workflow. The validation job checks the site structure, media contract tests and funding recipient/link/disclosures; the separately permissioned deployment job then attempts to deploy `site/`. Pull requests and private pushes can never reach that deployment job.

If Pages could not be configured while private, perform this one-time setup immediately after the visibility change, then rerun the workflow:

```bash
gh api --method POST repos/PreceptorOfMagic/PreceptorOfMagic.github.io/pages -f build_type=workflow
gh workflow run pages.yml -R PreceptorOfMagic/PreceptorOfMagic.github.io
```

The official `configure-pages` action cannot create the Pages site with the ordinary `GITHUB_TOKEN`; automatic enablement would require a separately stored, narrowly scoped token. The repository does not store the current broad command-line credential as an Actions secret.

Later pushes to public `main` redeploy the site automatically. The canonical destination used by the README and community drafts is:

<https://preceptorofmagic.github.io/>

## After the first deployment

Open the hub, setup, walkthrough and credits pages while signed out. Then publish the prepared community posts; their hub, setup, source, status and acknowledgement links are already filled in.

Funding is independent of publishing the free project. `.github/FUNDING.yml` and the site both use the live `PreceptorOfMagic` Buy Me a Coffee destination. Recheck the provider biography, disclosures and colour while signed out before announcing the public launch.

# Contributing to the project hub

This repository holds the Eclipse/Umbra website, its documentation and the media-delivery tooling.

- Report or fix website copy, accessibility, navigation, documentation and reviewed delivery-media issues here.
- Send Eclipse client behaviour, build and packaging work to the [Eclipse repository](https://github.com/PreceptorOfMagic/Eclipse).
- Send Umbra capture, encoding, pairing, virtual-display, service and installer work to the [Umbra repository](https://github.com/PreceptorOfMagic/Umbra).
- Never attach pairing codes, credentials, account details, addresses, private logs, unredacted screenshots or raw recording masters.

The website in `site/` is the primary copy; the Markdown pages mirror it. For site changes, run the same checks as the deployment workflow:

```bash
node scripts/launch/check_hub_boundary.mjs
node scripts/launch/check_public_site.mjs
node scripts/launch/check_funding.mjs
node --test scripts/launch/check_media.test.mjs
node --test scripts/launch/check_downloads.test.mjs
node --test scripts/launch/check_disclosures.test.mjs
node --test scripts/launch/check_activity.test.mjs
```

Media may replace a placeholder only after it satisfies `docs/launch/media-spec.md`, has cleared rights and privacy review, and is registered in the reviewed media manifest. Acknowledgements do not replace licence, NOTICE, source-offer or other obligations attached to an application release.

See the [Development guide](docs/development.md#contribute) for application contributions.

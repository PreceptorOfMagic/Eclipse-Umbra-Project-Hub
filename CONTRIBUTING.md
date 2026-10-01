# Contributing to the project hub

This repository is limited to the Eclipse/Umbra website, launch documentation and media-delivery tooling.

- Report or fix website copy, accessibility, navigation, launch documentation and reviewed delivery-media issues here after the repository is public.
- Send Eclipse client behaviour, build and packaging work to the [Eclipse repository](https://github.com/PreceptorOfMagic/eclipse).
- Send Umbra capture, encoding, pairing, virtual-display, service and installer work to the [Umbra repository](https://github.com/PreceptorOfMagic/umbra).
- Never attach pairing codes, credentials, account details, addresses, private logs, unredacted screenshots or raw recording masters.

For site changes, run:

```bash
node scripts/launch/check_public_site.mjs
node scripts/launch/check_funding.mjs
node --test scripts/launch/check_media.test.mjs
node scripts/launch/check_hub_boundary.mjs
```

Media may replace a placeholder only after it satisfies `docs/launch/media-spec.md`, has cleared rights and privacy review, and is registered in the reviewed media manifest. Acknowledgements do not replace licence, NOTICE, source-offer or other obligations attached to an application release.

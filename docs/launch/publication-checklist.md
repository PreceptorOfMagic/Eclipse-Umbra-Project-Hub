# Public launch checklist

This is a quality and packaged-release worklist, not a website publication lock. The dedicated `PreceptorOfMagic.github.io` hub remains private during iteration; after its clean history is reviewed and Pages is configured, the workflow can publish the honest source-first site with clearly labelled media placeholders. Optional support is already connected and has its own maintenance section; it never changes access to the free project or website.

## 1. Identity and legal gates

- [ ] Apply the chosen hierarchy everywhere: **ECLIPSE / UMBRA** is the single project identity, **Eclipse** is its client application and **Umbra** is its host application. Every first reference, repository description, installer/listing, video and funding surface must establish that relationship. Owner permission is not being sought. Do not treat the slash or suite presentation as legal clearance: the review identifies live Australian ECLIPSE and UMBRA word registrations, with UMBRA expressly covering audiovisual streaming and related software.
- [ ] Make those the applications' real visible names, not website aliases. Replace user-facing Aurora branding with **Eclipse** and Apollo branding with **Umbra** across every shipped surface, following `application-identity.md`. Retain inherited Moonlight/Sunshine names and compatibility-sensitive identifiers where the upstream forks retained them or a measured migration would otherwise be required.
- [ ] Run `node scripts/launch/check_client_identity.mjs` in Eclipse and `node scripts/umbra_check.mjs` in Umbra, then perform the artifact-level inspection from `application-identity.md`; source-text checks do not replace clean-install and upgrade verification. Keep Umbra's identity layered on Apollo rather than editing upstream translations or resource cards.
- [ ] Search the exact composite and both named applications—including similar-looking and similar-sounding marks—in every intended launch market before locking domains, social handles, artwork or recordings.
- [ ] Confirm that the original artwork does not imitate an upstream/company mark.
- [ ] Rebuild the client and host from the new split-pane source artwork, then verify launcher, splash, tray-state, fresh-install and catalog rendering on each shipped surface; the source assets are replaced, but current generated artifacts are stale.
- [ ] Export one finalized shared banner/social-card set after naming clearance and use it on the hub plus the client and host repository landing pages.
The current Eclipse Foundation policy says third parties may not incorporate an Eclipse trademark into the name of a software product or service. Its fair-use sentence preserves rights supplied by applicable law; it is not a licence. The current product-name use is not an obvious fit for Australian statutory exceptions or United States descriptive or nominative fair use. Adding “Project,” “Link,” punctuation or a slash is not a safe harbour. A “not affiliated” footer is useful but does not resolve the names.

## 2. Public source and release gates

- [ ] Public visitors can open the client repository, host repository and every setup/status link while signed out.
- [ ] The default branch contains the launch site, concise README, complete licence files and acknowledgements.
- [ ] A reproducible client release and compatible host release exist at stable URLs.
- [ ] Checksums and signing status are stated without implying unsigned packages are signed.
- [ ] Artifact-specific licence, notice, SBOM and corresponding-source checks pass; only then remove the explicit `if: ${{ false }}` gates from the release/community-notification workflows and deliberately replace the private-repository-only snapshot upload gates for each approved platform.
- [ ] Before making the Eclipse source repository public, delete or let every private-CI snapshot artifact expire, including unsigned Windows artifact `10924630576` if it has not yet expired. Its snapshot-upload workflows are currently disabled manually and do not yet contain a visibility gate; either add and verify that gate or leave those workflows disabled. This source-repository artifact does not block publishing the separate clean hub.
- [ ] Inspect the final webOS IPK: its project `LICENSE.txt`, `COPYRIGHT` and `ACKNOWLEDGEMENTS.md` must byte-match the release tree, and its immutable corresponding-source archive/reference plus third-party notices must match that exact build.
- [ ] Pin and verify the webOS SDK archive digest in the build wrapper, and remove or repair the Windows Docker helper's unverified packaging-binary download before either path is described as release-approved.
- [ ] The public support matrix names only hardware/platform combinations backed by current evidence.
- [ ] Audit the hub's **entire repository and Git history**, not only the Pages artifact, from a fresh clone. Confirm that the clean hub contains no imported source history, diagnostic logs, raw footage, private run sheets, user-photo evidence, application binaries or IDE state. Audit the application repositories independently before changing their visibility.
- [ ] Issue forms and package/listing copy use the final names and current host terminology.
- [ ] Regenerate the webOS Homebrew metadata and manifest URLs from the final public repository; do not submit the gated inherited Aurora listing.
- [ ] Update and verify the generated Homebrew manifest and Debian metadata in `cmake/AresPackage.cmake` and `cmake/PackageDebian.cmake`; both still carry inherited owner/name links.
- [ ] Run a registrar-backed sweep of visible Windows/DEB/Steam Link application names and archive labels after identity review; preserve inherited Moonlight/Sunshine names, executable names, installed IDs, service keys, configuration paths and environment variables unless an explicit migration is measured.
- [ ] Decide whether Raspberry Pi and Steam Link are validated launch surfaces. Until then, keep their release jobs gated and omit them from consumer support selectors.
- [ ] Ensure Umbra's default branch includes its own `.github/README.md` landing page and thin-fork explanation. Preserve Apollo's root `README.md` for upstream merges; do not overwrite it with Umbra's introduction.
- [ ] Apply the shared first-screen blocks in `repository-unification.md` to the client, host and GitHub organisation profile, then verify every role/hub/sibling link while signed out.
- [ ] Publish `SECURITY.md` with a verified non-public reporting channel, and enable GitHub private vulnerability reporting if that is the chosen path.

## 3. Credits and compliance gates

- [ ] `ACKNOWLEDGEMENTS.md` matches the actual source tree and packaged runtime inventory.
- [ ] Required licence/NOTICE texts ship with each binary distribution; a web credits page is not a substitute.
- [ ] Moonlight and Sunshine origins are prominent, followed by Moonlight TV, Aurora and Apollo.
- [ ] Project-maintainer credit is visibly separated from upstream-maintainer credit.
- [ ] Names/logos are used only for factual lineage or compatibility unless explicit artwork permission exists.
- [ ] Links to upstream funding go to the relevant upstream recipient and cannot be confused with this project’s support link.
- [ ] Verify Moonlight Qt and the moonlight-common-c Reed–Solomon notices in every affected desktop artifact. Publish the pinned SS4S base plus `patches/client-deps/ss4s.patch` as immutable Corresponding Source: the applied submodule worktree materialises the Moonlight Qt-derived module as an untracked file, but the tracked patch reproduces it exactly and carries the source reference; keep its separate modification record beside the binary.
- [ ] Ship the exact Montserrat 7.200 and Font Awesome Free 5.9.0 OFL material, Font Awesome brand warning, and Unscii-8 1.0 provenance with the embedded LVGL glyph arrays.
- [ ] Ship x265 4.1 dynamicHDR10/HDR10+ source and notices, including MulticoreWare, Bhavna Hariharan, Kavitha Sampath and Dropbox json11; do not imply that this build holds separate commercial terms.
- [ ] Replace or independently reimplement the Stack Overflow- and GeeksforGeeks-attributed `commons-c` linked-list snippets; attribution alone does not resolve their current CC BY-SA/unlicensed provenance.
- [ ] Preserve Lee Salzman's ENet authorship plus Cameron Gutman's actual Moonlight fork/revision, and ship the Pulse-Eight libCEC-derived `ceccloader.h` GPL-2.0-or-later notice whenever that optional target is compiled.
- [ ] Complete Umbra's exhaustive file-level provenance for the Sunshine, Avahi, nvidia-patch, Stack Overflow, FindWayland and cmake-git-versioning-example adaptations; preserve the full SudoVDA/Microsoft/VirtualDrivers acknowledgement chain rather than labelling it generically MIT.
- [ ] Generate each release inventory from the actual dependency resolution and artifact: Umbra currently has no immutable npm lock, while Eclipse also declares resource-build packages, Python webOS requirements and platform system dependencies outside the headline table.

## 4. Media gates

- [ ] Record the live demonstration and photographs in `recording-plan.md`.
- [ ] Verify both panes are live, current and independently controlled in the final cut.
- [ ] Clear game footage, music, fonts, icons and every other non-project asset for promotional use.
- [ ] Remove personal notifications, account details, network identifiers, pairing codes and reflections.
- [ ] Produce poster images, accurate captions, transcript and alt text; publish the transcript and visual description as semantic `site/walkthrough.html`, not only raw Markdown.
- [ ] Keep raw/master media outside Git and check the delivery files against GitHub file and Pages bandwidth limits.
- [ ] Export every delivery in `media-spec.md` and pass `node scripts/launch/check_media.mjs`.
- [ ] Have one unfamiliar viewer explain what they saw; revise if they cannot identify the two-host idea.

## 5. Site and community gates

- [ ] Replace every planned-media placeholder with a real asset or remove the slot.
- [ ] Run `npm ci --prefix scripts/launch && npm run --prefix scripts/launch render-social-card`, inspect the rendered 1200×630 card, and update its name/URL after branding is settled. The renderer writes a checked source/output hash manifest so a stale PNG fails the launch gate.
- [ ] Run local desktop and narrow-screen visual review plus keyboard-only navigation.
- [ ] Check every internal and external link, metadata image, title, description and 404 page.
- [ ] Run `node scripts/launch/check_external_links.mjs` after both repositories are public; resolve every failure and manually inspect any 401/403/405/429 warning.
- [ ] After the repositories and releases become public, replace every prelaunch statement (including “source in preparation” and “no public package”) and add the verified download calls to action before deploying Pages.
- [ ] Re-read target community rules; exclude any community whose rules still restrict this promotion rather than seeking an exception.
- [ ] Fill every bracketed field in `community-posts.md`; never publish the AI-assisted LTT wording.
- [ ] Publish once, then respond transparently instead of dropping identical promotional posts across communities.

The Pages workflow runs `node scripts/launch/check_hub_boundary.mjs`, `node scripts/launch/check_public_site.mjs`, `node scripts/launch/check_funding.mjs` and the media-contract unit tests on private pushes and pull requests. Its deployment job is separately permissioned and runs only for a public default-branch event, so an honest source-first site can be reviewed privately without allowing private/source material, the recipient, payment link or required disclosures to drift. Run the stricter `node scripts/launch/check_launch_ready.mjs` manually for a full consumer-launch audit; it should remain red while required release media or other launch evidence is absent. Mark a box complete only when its evidence has been reviewed.

## 6. Deployment order

1. Apply the Eclipse/Umbra project hierarchy consistently across the Eclipse client, Umbra host, site and launch assets.
2. Make both source repositories and licence/credit links publicly readable.
3. Publish compatible releases and freeze their status claims.
4. Record the demo against those release builds.
5. Recheck the connected Buy Me a Coffee profile, disclosures and signed-out route; support remains optional and must not delay source/release access.
6. Run the site audit and configure the repository's Pages source for GitHub Actions. The `public` event deploys automatically only when Pages already exists; on GitHub Free, first create the Pages site immediately after making the repository public and then rerun `pages.yml`.
7. Verify the production URL while signed out.
8. Publish community posts in a paced order, starting with the best-fit technical community.

## 7. Live support configuration and follow-up

The button is active. Open post-transaction and profile-polish tasks do not require disabling it, but any change to the recipient, benefits or fundraising purpose must be reflected across the provider page, site and policy.

- [x] The public `preceptorofmagic` page is live, uses an Australian Stripe connection and has a stable canonical URL.
- [ ] Privately record the Stripe dashboard's actual entity classification and any ABN supplied. Correct any mismatch and resolve any applicable ASIC business-name requirement; completed onboarding is not itself an ABN ruling.
- [x] The public offer is reward-free one-time or monthly support. Memberships, Shop products, commissions, rewards and supporter-only access are not offered.
- [ ] After the first real payment and payout review, archive the gross amount, USD/AUD treatment, platform/processor/payout fees, refund/chargeback treatment and bank entry. This evidence cannot exist before support is received and is not a pre-link gate.
- [x] Publish the recipient, purpose, published fees, USD base currency/FX, recurring status, cancellation, refund, privacy and overseas processing, tax, contact and closure disclosures in `SUPPORT.md` and beside the site button. Keep records for at least five years and require separate marketing consent.
- [ ] Replace the generic Buy Me a Coffee biography with concise Eclipse/Umbra recipient/no-reward/recurring/refund/tax wording, and optionally change the provider-page blue to the shared purple `#BD5FFF` for visual consistency.
- [ ] Decide whether to request a written Queensland OFT section 5(2) classification before broad public promotion. In all cases, do not claim charity, DGR status or a ring-fenced community-purpose fund; obtain classification before changing to that model.
- [x] `.github/FUNDING.yml` contains exactly one native `buy_me_a_coffee: PreceptorOfMagic` entry and the site uses the matching canonical URL.
- [ ] Check the Buy Me a Coffee page, GitHub sponsor menu and project site while signed out, and ensure no organisation default, manifest or inherited entry adds another recipient.

## Primary policy references

- [Eclipse Foundation Trademark Usage Policy](https://www.eclipse.org/legal/logo-guidelines/)
- [Eclipse / Umbra name legal risk review](name-legal-review.md)
- [IP Australia record for ECLIPSE trade mark 1325375](https://search.ipaustralia.gov.au/trademarks/search/view/1325375/details)
- [IP Australia record for UMBRA trade mark 2196711](https://search.ipaustralia.gov.au/trademarks/search/view/2196711/details)
- [GitHub Pages custom workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- [GitHub repository file limits](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)
- [Buy Me a Coffee terms of use](https://buymeacoffee.com/terms)
- [Stripe Australia Services Agreement](https://stripe.com/au/legal/ssa)
- [Queensland Collections Act 1966](https://www.legislation.qld.gov.au/view/whole/html/current/act-1966-007)

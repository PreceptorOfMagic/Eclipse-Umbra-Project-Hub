# Updating the release website

Edit `release-data.json` for release versions, release copy, local co-op instructions and HDR availability. These facts are shared by the website, the setup chooser and GitHub Markdown guides.

Run `node scripts/guide/build.mjs` from the repository root. The generator updates only the named `generated:*` regions; edit other page content normally. Do not hand-edit a generated region.

Before publication, run `node scripts/guide/build.mjs --check`, `node --test scripts/guide/guide.test.mjs`, and the existing publication checks. Set an HDR extra's `available` field to false when it is absent: the website then shows an unavailable state with its reason, without a download button. Keep historical hardware results separate from the version of the downloadable package.

The local review export is a single HTML file with inline styles and scripts, embedded still images, and the new demo when available. Existing large video demonstrations may use their published media URLs. The export omits visit tracking and does not publish the draft.

Run `node scripts/guide/export-preview.mjs /absolute/path/Eclipse-Umbra-review.html` to build it. Open the file directly in a browser or serve its folder locally. Release download lookups and existing videos require an internet connection; all eight pages and the setup chooser are included in the file.

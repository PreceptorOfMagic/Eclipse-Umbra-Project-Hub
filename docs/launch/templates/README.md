# Recording delivery templates

These are working templates, not launch media. Copy them into the private edit
record, replace every `{{PLACEHOLDER}}`, and create the public delivery only
after human review. The launch validator deliberately rejects placeholder text.

- `walkthrough.en.vtt.template` defines caption timing and speaker/sound style.
- `walkthrough-transcript.template.md` preserves narration, sound and visual
  description as separate reviewed fields.
- `alt-text-and-caption-qc.md` is the image worksheet and caption review log.
- `media-manifest.template.json` defines the public-safe provenance/build record
  consumed by `scripts/launch/check_media.mjs`.

Do not put raw filenames containing private account, machine or location names
in the public manifest. Map them to the neutral source IDs in the run sheet.

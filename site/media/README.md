# Public media

This directory holds only reviewed, web-ready delivery copies. Camera originals, capture masters and editing
projects stay outside Git; GitHub blocks files over 100 MiB and the hub's own boundary check limits each file to
12 MiB.

## Delivered

- `eclipse-coop-switch.webm` (VP9) and `eclipse-coop-switch.mp4` (H.264 High, fast start), with
  `eclipse-coop-switch-poster.webp` — the Eclipse page clip (`eclipse.html#preview`). 1920×1080, 60 fps, about
  42 seconds, silent, SDR Rec.709. One continuous full-screen capture of the Eclipse Windows client streaming
  live from two Umbra hosts: a one-PC stream, then the co-op dialog and a two-PC session. Every input was a
  pre-timed sequence played at a natural pace, and the capture starts and ends with the shot, so the delivery is
  the master re-encoded without edits.

- `umbra-host-home.webp` — the Umbra page still (`umbra.html#preview`). 1920×726, cropped from a full-screen
  capture of a host's Umbra home page: the Umbra panel with its version, the Apollo release it is built on and
  the update notice.

## Planned

- The homepage showcase video (`index.html#showcase`): a full-screen recording on the PC client of an ordinary
  Halo stream, then co-op with two separate Halo games in both layouts.

Videos are embedded on the website with native controls and no `autoplay`; `assets/loops.mjs` plays a loop only
while it is on screen and never when the viewer prefers reduced motion. GitHub's Markdown pages cannot play a
video stored in the repository, so the Markdown mirror links the poster to the website instead.

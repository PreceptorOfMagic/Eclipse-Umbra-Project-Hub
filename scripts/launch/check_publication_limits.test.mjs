import test from 'node:test';
import assert from 'node:assert/strict';
import { publicationLimit } from './publication_limits.mjs';
test('only the two explicitly named Halo deliveries receive the larger budget', () => {
  for (const layout of ['vertical', 'horizontal']) {
    assert.equal(publicationLimit(`site/media/eclipse-halo-${layout}.mp4`), 40 * 1024 * 1024);
  }
  for (const name of ['site/media/eclipse-coop-pointer.mp4', 'site/media/other.mp4',
    'site/media/eclipse-halo-showcase.mkv', 'site/other/eclipse-halo-showcase.mp4',
    'site/media/eclipse-halo-showcase-extra.mp4', 'site/media/eclipse-halo-showcase.webp']) {
    assert.equal(publicationLimit(name), 12 * 1024 * 1024, name);
  }
});

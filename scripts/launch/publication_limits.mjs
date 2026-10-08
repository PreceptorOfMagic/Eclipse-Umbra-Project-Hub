export const DEFAULT_FILE_BYTES = 12 * 1024 * 1024;
const showcaseFiles = new Set([
  'site/media/eclipse-halo-showcase.mp4',
  'site/media/eclipse-halo-showcase.webm',
]);
export function publicationLimit(relativePath) {
  return showcaseFiles.has(relativePath.replaceAll('\\', '/'))
    ? 40 * 1024 * 1024 : DEFAULT_FILE_BYTES;
}

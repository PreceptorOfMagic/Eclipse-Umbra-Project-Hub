CREATE TABLE IF NOT EXISTS views (
  id TEXT PRIMARY KEY,       -- random per page load, made in the page's memory and never stored on the device
  day TEXT NOT NULL,         -- UTC date, YYYY-MM-DD
  ts INTEGER NOT NULL,       -- milliseconds since 1970
  page TEXT NOT NULL,
  ref TEXT NOT NULL,         -- referring site's host name, or ''
  visitor TEXT NOT NULL,     -- hash with that day's salt; meaningless once the salt is deleted
  ms INTEGER                 -- time the page was visible
);
CREATE INDEX IF NOT EXISTS views_day ON views (day);
CREATE TABLE IF NOT EXISTS salts (day TEXT PRIMARY KEY, salt TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS clicks (day TEXT NOT NULL, ts INTEGER NOT NULL, page TEXT NOT NULL, repo TEXT NOT NULL,
  file TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS clicks_day ON clicks (day);
CREATE TABLE IF NOT EXISTS assets (asset_id INTEGER PRIMARY KEY, repo TEXT NOT NULL, tag TEXT NOT NULL, file TEXT NOT NULL,
  count INTEGER NOT NULL, first_count INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS downloads (day TEXT NOT NULL, ts INTEGER NOT NULL, since INTEGER, repo TEXT NOT NULL,
  tag TEXT NOT NULL, file TEXT NOT NULL, n INTEGER NOT NULL);  -- n downloads seen between readings at since and ts
CREATE INDEX IF NOT EXISTS downloads_day ON downloads (day);
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);

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

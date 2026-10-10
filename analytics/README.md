# Visit counting

The Project Hub counts visits with its own small counter instead of a third-party analytics service. It uses no
cookies and no browser storage.

## What is sent

When a page opens, [`site/assets/count.mjs`](../site/assets/count.mjs) sends the page's file name and the host name of
the site you came from (for example `www.reddit.com`, never the full address). When you leave or switch away, it sends
how long the page was visible. A random number made in the page's memory ties the two together; it is not stored on
your device. Nothing is sent if your browser has Do Not Track or Global Privacy Control turned on.

## What is kept

[`worker.mjs`](worker.mjs) runs on Cloudflare Workers and stores each view in a Cloudflare D1 database: the page, the
referring site's host name, the UTC date and time, the visible time, and a visitor code used only to count unique
visitors per day. The code is a hash of that day's random secret, your IP address and your browser's user-agent. The
IP address is never stored, and each day's secret is deleted when the day ends, so codes cannot be linked across days
or turned back into an address. Bots are not counted. Views are deleted after 13 months.

## Deploying (maintainer)

With [Wrangler](https://developers.cloudflare.com/workers/wrangler/) logged in to the project's Cloudflare account:

```sh
wrangler d1 create hub-count                          # once; put the database_id in wrangler.toml
wrangler d1 execute hub-count --remote --file schema.sql
wrangler secret put STATS_PASSWORD                    # password for the stats page
wrangler deploy
```

Statistics are at `https://hub-count.preceptorofmagic.workers.dev/stats` (the browser asks for the password; any user
name works). Tests: `node --test scripts/launch/check_count.test.mjs`.

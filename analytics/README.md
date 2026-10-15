# Visit counting

The Project Hub counts visits with its own small counter instead of a third-party analytics service. It uses no
cookies and no browser storage. The counter itself (a Cloudflare Worker and its database) is kept in a private
repository; the part that runs in your browser is [`site/assets/count.mjs`](../site/assets/count.mjs).

## What is sent

When a page opens, [`site/assets/count.mjs`](../site/assets/count.mjs) sends the page's file name and the host name of
the site you came from (for example `www.reddit.com`, never the full address). When you leave or switch away, it sends
how long the page was visible. A random number made in the page's memory ties the two together; it is not stored on
your device. If you click a link to a release file, it sends that file's name and the page it was on. Nothing is sent
if your browser has Do Not Track or Global Privacy Control turned on.

## What is kept

The counter runs on Cloudflare Workers and stores each view in a Cloudflare D1 database: the page, the referring
site's host name, the UTC date and time, the visible time, and a visitor code used only to count unique visitors per
day. The code is a hash of that day's random secret, your IP address and your browser's user-agent. The IP address is
never stored, and each day's secret is deleted when the day ends (midnight UTC+10), so codes cannot be linked across
days or turned back into an address. Bots are not counted. Download clicks are stored with their time and page only,
with no visitor code. Once an hour the counter reads the public download counts GitHub shows for each release file, so
downloads from anywhere are counted to the nearest hour; that reading involves no visitor data at all. Views, clicks
and download readings are deleted after 13 months.

# Community launch material

The drafts below use stable project URLs now. They point demonstrations to the hub showcase section, so the hosted-video provider can be added or changed once on that page without editing every post. Before posting, recheck the destination community's current rules and confirm the links work while signed out.

The naming hierarchy is fixed for drafting: **Eclipse/Umbra** is one project, **Eclipse** is its client application and **Umbra** is its host application. Keep **Moonlight**, **Sunshine**, **Moonlight TV**, **Aurora** and **Apollo** when describing factual lineage; they are not alternate names for the two applications.

## Canonical destinations

The posts deliberately use project-owned routes rather than provider-specific video links:

| Purpose | Destination |
|---|---|
| Demonstration | <https://preceptorofmagic.github.io/Eclipse-Umbra-Project-Hub/#showcase> |
| Project hub | <https://preceptorofmagic.github.io/Eclipse-Umbra-Project-Hub/> |
| Setup guide | <https://preceptorofmagic.github.io/Eclipse-Umbra-Project-Hub/setup.html> |
| Tested configurations and status | <https://preceptorofmagic.github.io/Eclipse-Umbra-Project-Hub/#status> |
| Complete acknowledgements | <https://preceptorofmagic.github.io/Eclipse-Umbra-Project-Hub/credits.html> |
| Eclipse client source | <https://github.com/PreceptorOfMagic/Eclipse> |
| Umbra host source | <https://github.com/PreceptorOfMagic/Umbra> |

## Reddit publication rules

- State the maintainer relationship in the opening paragraph.
- Use native video only where the community supports it. `r/MoonlightStreaming` currently does; `r/cloudygamer` and `r/selfhosted` currently do not. On text-only routes, use the direct public demonstration URL and keep source/setup links to the minimum the community permits.
- Do not disguise promotion as a vague request for feedback. Ask one real, community-specific question whose answer can change the project.
- Do not ask for money, mention the support page or include a donation link.
- Do not publish identical copy across communities or post them in a burst.
- On publication day, test the actual posting account with Reddit's post-eligibility check. Communities may enforce account-age, karma or verified-email gates without publishing the numeric thresholds.
- Re-read the live community rules on publication day. If the rules have become more restrictive, do not post there.

## Draft A — `r/MoonlightStreaming`

Suggested title:

> I’m building a Moonlight-derived client that combines two live gaming PCs on one TV

Suggested body:

> I maintain Eclipse/Umbra, a free and open-source experiment for a problem in our living room: two PCs can run the same online-only multiplayer game, but the game no longer offers a shared-screen mode.
>
> **Live demonstration:** https://preceptorofmagic.github.io/Eclipse-Umbra-Project-Hub/#showcase
>
> Eclipse is the client application. In co-op mode it opens independent sessions to two PCs running the Umbra host, then composes those live streams side by side or stacked on one TV. Each player keeps a separate game instance and input path. The clip shows both players controlling their own game sessions at the same time.
>
> The current engineering preview has two-host pairing and selection, horizontal and vertical layouts, either host as the primary pane, explicit controller ownership and optional keyboard/mouse ownership. Eclipse also retains ordinary one-host Moonlight-style streaming.
>
> Moonlight was created by Cameron Gutman, Diego Waxemberg, Aidan Campbell, Aaron Neyer, Michelle Bergeron and Andrew Hennessy. Sunshine was created by @loki-47-6F-64 and is now maintained by LizardByte and contributors. The direct client lineage then continues through Moonlight TV by Mariotaku and Aurora by GuiDev1994 to Eclipse; the host lineage continues through Apollo by @ClassicOldSong to Umbra. Full credits and licences: https://preceptorofmagic.github.io/Eclipse-Umbra-Project-Hub/credits.html
>
> Source and setup: https://github.com/PreceptorOfMagic/Eclipse · https://github.com/PreceptorOfMagic/Umbra · https://preceptorofmagic.github.io/Eclipse-Umbra-Project-Hub/setup.html
>
> This is not a broad compatibility promise yet. The tested systems and current work are listed at https://preceptorofmagic.github.io/Eclipse-Umbra-Project-Hub/#status. For people who already use Moonlight/Sunshine-style streaming: which part of choosing two hosts and assigning the two controllers would you most want made clearer before starting a session?

## Draft B — `r/cloudygamer`

Suggested title:

> Two gaming PCs, two live streams, one couch co-op display — an open-source preview

Suggested body:

> I maintain Eclipse/Umbra, a free and open-source client/host project. I built its co-op mode so two people in the same room can play an online-only multiplayer game as though it had a shared-screen option.
>
> **Continuous live demo:** https://preceptorofmagic.github.io/Eclipse-Umbra-Project-Hub/#showcase
>
> Each gaming PC runs its own game and the Umbra host. The Eclipse client at the TV receives both live sessions and composes them side by side or stacked. Inputs are assigned deliberately, so player 1 controls only the first host and player 2 only the second. The demonstration includes simultaneous movement on both PCs and the actual host/layout/input picker.
>
> The same client still supports normal one-host streaming. Co-op currently adds two-host selection, layout switching, primary-pane selection and independent controller ownership. It is a source-first preview: packaging, the public hardware matrix and mixed-vendor real-game acceptance are tracked at https://preceptorofmagic.github.io/Eclipse-Umbra-Project-Hub/#status.
>
> Moonlight’s founders are Cameron Gutman, Diego Waxemberg, Aidan Campbell, Aaron Neyer, Michelle Bergeron and Andrew Hennessy. Sunshine was created by @loki-47-6F-64 and is now maintained by LizardByte and contributors. Eclipse then descends through Moonlight TV by Mariotaku and Aurora by GuiDev1994; Umbra descends through Apollo by @ClassicOldSong. Full contributor, dependency and licence credits: https://preceptorofmagic.github.io/Eclipse-Umbra-Project-Hub/credits.html
>
> Project hub, including source and setup links: https://preceptorofmagic.github.io/Eclipse-Umbra-Project-Hub/
>
> For people who stream games around the home: would the more useful default be equal panes, or one larger primary pane with the second player inset—and what screen size/viewing distance drives that answer?

## Deferred `r/selfhosted` variant

Do not use this route until the applications have public production-ready releases that visitors can actually deploy and complete public documentation. At initial public launch the project will be less than three months old by the community's public-presence measure, regardless of its older private commit history, so it belongs only in the current New Project Megathread rather than a standalone post.

When those conditions are actually met, write from the self-hosting angle rather than reusing either launch draft:

- lead with the two locally operated Umbra hosts and the absence of a required project cloud service;
- explain data flow, authentication/pairing, network assumptions and what leaves the LAN;
- link complete deployment, upgrade, backup and security documentation;
- disclose the maintainer relationship; and
- use the required AI flair and answer the moderation prompt truthfully about where AI assisted the code, documentation or launch preparation; and
- ask a concrete question about self-hosted deployment or threat modelling.

## Community routing snapshot

Rules were last checked on **1 October 2026**. The official rules pages remain the authority.

| Community | Current rule result | Launch decision |
|---|---|---|
| [`r/MoonlightStreaming`](https://www.reddit.com/r/MoonlightStreaming/about/rules) | Its rules endpoint currently exposes no community-specific rules; Reddit’s site-wide spam rules still apply. | Candidate 1. Use Draft A, disclose authorship and keep the post technically useful. |
| [`r/cloudygamer`](https://www.reddit.com/r/cloudygamer/about/rules) | Its rules endpoint is empty, but its official [sidebar/submit guidance](https://www.reddit.com/r/cloudygamer/about.json?raw_json=1) requires English, bars spam, referral/promo codes and outside surveys/subreddits/Discord, and requires identifying flair for company representatives. Native Reddit video is disabled. | Candidate 2. Use the shorter-link Draft B as a text post on a different day, with a direct external demo and real use-case question. Confirm whether maintainer identification needs a flair. |
| [`r/webos`](https://www.reddit.com/r/webos/about/rules) | “Promotions are not allowed” without prior approval. | Exclude from this launch while that rule remains. Do not seek an exception. |
| [`r/selfhosted`](https://www.reddit.com/r/selfhosted/about/rules) | Self-promotion must be limited; promoted apps must be released/tryable, production ready and documented; projects under three months belong only in the current weekly megathread. AI-written or AI-using apps require the AI flair and disclosure. Native Reddit video is disabled. | Defer until every stated condition is evidenced, then use the current New Project Megathread with a new self-hosting-specific, transparently disclosed post. |
| [`r/OLED_Gaming`](https://www.reddit.com/r/OLED_Gaming/about/rules) | The rules bar spam, referral links and personal sales; there is no clear project-showcase route. | Exclude from the launch rather than risk treating a hardware community as an advert channel. |

## Linus Tech Tips forum — human-authored GitHub-only route

The LTT forum’s current [Community Standards](https://linustechtips.com/topic/1381504-community-standards/) say **“No posts generated by AI,”** restrict external self-promotion and prohibit donation/fundraising requests. A moderator [clarified the research/reference boundary](https://linustechtips.com/topic/1381504-community-standards/page/4/#findComment-16113969): AI may be used as research only when the member supplies their own interpretation. Another moderator described a narrow [personal, non-profit project exception](https://linustechtips.com/topic/1461715-would-posting-about-my-own-userscript-count-as-self-promotion/#findComment-15611723) when the thread links directly to a common host such as GitHub rather than a personal site or social/video channel.

This assistant therefore cannot prepare publishable LTT prose. Funding is now active, so the forum's narrow personal, non-profit project exception is not a reliable route for this launch. Treat LTT as unavailable unless the rules or funding position change and current moderator guidance confirms a route. If it is revisited later, the maintainer must still write independently from their own experience and wording:

- do not paste, paraphrase or lightly rewrite this material into an LTT thread;
- write one original technical thread, likely in “Programs, Apps and Websites”, and link only the GitHub repository;
- do not link the Pages hub, hosted video/channel, support page or payment destination;
- do not request likes, shares, subscriptions, donations or other promotion;
- do not duplicate the topic elsewhere on the forum; and
- do not include a project, repository, video or donation link in an unrelated troubleshooting post; and
- treat the route as unavailable if funding is active or the project no longer fits the personal non-profit exception.

The facts below are retained solely as an internal accuracy sheet from which the maintainer may independently research and write. They are not LTT post copy:

- Problem: modern online-only multiplayer can leave two-PC households without a shared-screen experience.
- Result: Eclipse composes two independent live Umbra host streams on one TV or PC display.
- Evidence: a continuous clip with both players acting simultaneously, followed by the real setup screen.
- Architecture: Umbra on two Windows gaming PCs → Eclipse at the shared display → side-by-side or stacked output.
- Inherited work: Moonlight protocol/core and Moonlight TV client lineage; Sunshine/Apollo host lineage and Apollo virtual-display work.
- Project addition: co-op selection, composition, input ownership and the integration needed for a two-host session.
- Honest limitations: engineering preview, incomplete release packaging, a narrow tested-hardware matrix and active mixed-GPU quality work.

## Shared credit block for permitted video descriptions

> Built on Moonlight, founded by Cameron Gutman, Diego Waxemberg, Aidan Campbell, Aaron Neyer, Michelle Bergeron and Andrew Hennessy; Sunshine, created by @loki-47-6F-64 and now maintained by LizardByte and contributors; Moonlight TV by Mariotaku; Aurora by GuiDev1994; and Apollo by @ClassicOldSong. Full contributor, dependency and licence acknowledgements: https://preceptorofmagic.github.io/Eclipse-Umbra-Project-Hub/credits.html. No affiliation or endorsement is implied.

Use the full acknowledgements page rather than turning the description into an incomplete dependency list.

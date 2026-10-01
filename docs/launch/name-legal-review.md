# Eclipse / Umbra name legal risk review

**Status:** preliminary research, checked 30 September 2026
**Project decision:** retain **Eclipse/Umbra** as the name of one project, retain
**Eclipse** as its client application and **Umbra** as its host application, and
do not seek permission from the identified owners. The paired architecture is a
risk-control choice, not a finding that the names are cleared.

This memo answers whether the current name is protected by copyright or trade mark “fair use,” whether free and open-source distribution changes the analysis, and where action could be taken against an Australian maintainer. It records research for the launch decision; it is not legal advice or a substitute for a clearance opinion.

## Candidate result at a glance

| Candidate | Preliminary Australian risk | Main problem |
| --- | --- | --- |
| **Eclipse/Umbra** with named Eclipse and Umbra applications | **High and unresolved** | A consistent suite presentation may change the overall impression, but each application name can still be perceived as its own mark. The project contains two live Australian word marks in overlapping software fields, and the UMBRA specification expressly includes audiovisual streaming. |
| **UmbraLink** | **Very high** | UMBRA remains the first and memorable element, while “Link” is a weak connectivity description. Amazon's UMBRA registration expressly covers software, network transmission and streaming. |
| **Project Eclipse** | **High** | “Project” is a weak label and ECLIPSE remains the memorable software brand. DXC owns a live broad Australian ECLIPSE software registration; the Eclipse Foundation creates additional international and affiliation risk. |

These labels are risk triage, not predictions that a court would find infringement. Marks are compared as a whole and every use is fact-specific. “Project Eclipse” is the least direct of the three only in a relative sense; it is not sufficiently clear to recommend for a public repository, installer or product site.

## Chosen no-permission naming architecture

The project will use a single, consistent hierarchy:

| Surface | Canonical treatment |
| --- | --- |
| Project and public masthead | **`ECLIPSE / UMBRA`**, always in that order and with the same original device mark |
| Client application | **Eclipse**, described on first reference as “the Eclipse client in Eclipse/Umbra” |
| Host application | **Umbra**, described on first reference as “the Umbra host in Eclipse/Umbra” |
| Repository labels | `Eclipse/Umbra — Eclipse client source` and `Eclipse/Umbra — Umbra host source` |
| Downloads and instructions | `Install the Eclipse client` and `Install the Umbra host`, beneath an Eclipse/Umbra page or heading |
| App launchers | The application names are **Eclipse** and **Umbra**; installer/listing descriptions must identify their role in Eclipse/Umbra rather than replacing either name with generic “Client” or “Host” |
| Promotion and funding | One Eclipse/Umbra hub, one acknowledgements system and one support identity; no separately marketed Eclipse or Umbra campaign |

The first reference on each official page, repository README, release listing,
installer description and video description should establish the relationship.
After that, ordinary sentences can use “Eclipse client” and “Umbra host” without
repeating the suite name in every line. The individual names therefore remain
clear to users while the public presentation consistently treats them as two
parts of one project.

These are the **actual application names**, not aliases that appear only on the
website. A released client must say **Eclipse** wherever this fork currently
presents itself as Aurora; a released host must say **Umbra** wherever this fork
currently presents itself as Apollo. The words “client” and “host” explain each
application's role inside Eclipse/Umbra; they do not replace either name.

Inherited **Moonlight** and **Sunshine** names remain where Aurora and Apollo
themselves retained them. They identify upstream lineage, compatibility surfaces
or long-standing technical components, rather than a third new name for this
project. Compatibility-sensitive IDs, executable filenames, service keys and
configuration paths may also remain unchanged when renaming them would break an
upgrade. The exact boundary and the remaining visible-name gaps are recorded in
[the application identity matrix](application-identity.md).

Use one canonical separator, `/`, in searchable text. The original logo may
render the relationship graphically, but `×`, a slash, spacing or typography
must not be described as the reason the name is lawful. Do not imitate the
logos, colours or trade dress of DXC, Amazon, the Eclipse Foundation or other
projects with similar names. Keep a factual non-affiliation statement and use
the narrow truthful description “self-hosted open-source game streaming.”

### What this architecture does—and does not do

IP Australia compares marks as a whole, so a fixed paired identity and
consistent context can affect the overall impression. It also warns that a
shared element may retain its own identity or be perceived as a variant or
sub-brand. See its [mark-comparison
guidance](https://manuals.ipaustralia.gov.au/trademark/6.-factors-to-consider-when-comparing-trade-marks)
and [multiple-mark
guidance](https://manuals.ipaustralia.gov.au/trademark/8.-use-of-multiple-trade-marks).

Because the launcher, repositories and instructions still call the
applications Eclipse and Umbra, this is not literally one indivisible mark in
every context. It is a coherent suite architecture that reduces avoidable
confusion; it does not erase the two exact-word uses, create a fair-use defence
or provide the certainty of a clearance opinion. The public material must say
the names are under review rather than “legally safe,” “fair use” or “cleared.”

No request for owner permission is part of the project plan. This memo will not
present permission as the next step.

### Optional no-permission checks

[TM Headstart](https://www.ipaustralia.gov.au/trade-marks/how-to-apply-for-a-trade-mark/pre-application-service-tm-headstart)
can provide early examiner feedback on the exact composite word/device mark
and a narrow specification. IP Australia expressly says that the service does
not check infringement, give legal advice or guarantee registration, and an
accepted application remains open to opposition. A private written clearance
opinion can likewise assess the exact implementation without contacting any
owner.

### Remove or narrow blocking registrations

Anyone may seek complete or partial removal of an Australian registration for
qualifying non-use. IP Australia says an unopposed application currently costs
$350, has a two-month opposition window and may be simple; an opposed matter
can take at least 6–12 months and become expensive. The owner is notified, and
appeals can reach the courts. See [IP Australia's non-use option
guide](https://ipfirstresponse.ipaustralia.gov.au/options/request-ip-australia-remove-unused-trade-mark-defend-your-right).

This is only a solution after evidence shows the statutory three-year non-use
ground for the relevant goods or services. It cannot be inferred from an old
filing date or from difficulty finding a consumer webpage. Partial Australian
removal would not clear the Eclipse Foundation's rights, Amazon's overseas
registrations, unregistered reputation claims or other territories. It is a
litigation strategy, not the recommended first workaround for a free project.

### Honest concurrent use is not a strategy to manufacture now

The current Act includes honest-concurrent-use defences linked to section
44(3), but they are not a route to launch deliberately after discovering these
registrations. In [*Zip Co v Firstmac* [2026] HCA
16](https://www.hcourt.gov.au/cases-and-judgments/judgments/judgments-1998-current/zip-co-limited-v-firstmac-limited),
the High Court unanimously held that honesty must be affirmatively established
from the time of each alleged potential infringement and means a state of mind
honest by the standards of ordinary, decent people. The Court's [judgment
summary](https://www.hcourt.gov.au/sites/default/files/judgment-summaries/2026-05/hca-16-2026-05-13.pdf)
records that the defence failed on the facts after the user had received
adverse trade mark reports before first use.

Preserve evidence of any genuinely earlier innocent Australian use, but do not
publish now in an attempt to accumulate concurrent use. This memo and the
official-register results mean any new launch decision would be made with
actual knowledge of the impediments.

### Alterations that do not solve the problem by themselves

Do not rely on any of the following as clearance:

- `/`, `×`, a hyphen, a dot or joining the same words together;
- `Project`, `Link`, `Open`, `OSS`, `TV`, `Stream`, `Client`, `Host` or `Co-op`;
- lower-case text, unusual capitalisation, a different font or `ECL1PSE`-style
  misspelling;
- a decorative logo where the words remain what users say and search;
- a `™` symbol, which IP Australia says only communicates a claim and does not
  mean enforceable rights exist;
- a non-affiliation disclaimer, free distribution, open-source licensing,
  nonprofit status or removing the donation button; or
- describing public product brands as codenames or geoblocking only Australia.

The disclaimer should still be kept because it may reduce factual confusion.
It is simply not a licence or statutory defence. Deliberate look-alike spelling
is especially unattractive because deceptive similarity includes sound and
imperfect recollection, while conduct after notice can affect additional
damages.

## The name raises trade mark issues, not copyright fair use

The Australian Attorney-General’s Department says copyright does not usually protect names and titles. Australia’s copyright exceptions are purpose-specific **fair dealing** exceptions for matters such as research, criticism, news reporting, professional advice, parody and accessibility. Those copyright rules do not authorise using another party’s sign as the name of a software product. See [Copyright basics](https://www.ag.gov.au/rights-and-protections/copyright/copyright-basics).

Open-source licences grant copyright permissions for covered code, subject to their terms. They do not grant rights in an unrelated party’s product name. The naming question therefore remains a trade mark, passing off and misleading-conduct question even when the software is free and its source is available.

## Being a scientific or common term does not make a software brand free

This is the important distinction behind the Moonlight/Sunshine comparison:

- Copyright generally does not give anyone ownership of the bare words “eclipse,” “umbra,” “moonlight” or “sunshine.” Original logos, artwork and longer text can separately attract copyright.
- Trade mark law can protect an ordinary dictionary or scientific word **for particular goods or services** when the word distinguishes their commercial source.
- The question is therefore not whether the word exists in science. It is what the word ordinarily signifies to the relevant audience **in relation to the claimed goods or services**.

The High Court's test in [*Cantarella Bros v Modena Trading* [2014] HCA 48](https://www.hcourt.gov.au/cases-and-judgments/judgments/judgments-1998-current/cantarella-bros-pty-limited-v-modena-trading-pty-limited) asks about the word's ordinary signification to people concerned with the relevant goods and whether other traders would honestly want to use it for that meaning. [IP Australia's current examination guidance](https://manuals.ipaustralia.gov.au/trademark/7.-examination) says that a word with no meaning in relation to the goods, or only an allusive, metaphorical meaning, may be inherently distinctive.

“Eclipse” is necessary descriptive language for an astronomical event and “umbra” for the darkest part of a shadow. That could matter for astronomy, optics or eclipse-prediction goods. Neither word ordinarily describes a remote-gaming client, host, video transport or streaming service. Used on an app, download button, repository and package, the celestial meaning is an evocative theme rather than a description of the software. That makes the common-word argument materially weaker, not stronger, in this product category.

The fact that upstream projects chose the names Moonlight and Sunshine is not a legal precedent or a licence for another celestial word. Each name must be cleared against the owners, registrations, goods, territories and actual manner of use that apply to it.

A registration can in principle be challenged in court or, for qualifying non-use, through IP Australia. [IP Australia's non-use guidance](https://manuals.ipaustralia.gov.au/trademark/5.-grounds-on-which-a-non-use-application-may-be-made) describes the three-year non-use ground. But commonness in an unrelated scientific field is not by itself a cancellation ground, and a live registration should not be treated as unavailable to its owner unless and until it is actually restricted or removed. Funding a validity or non-use contest would be a much more expensive naming strategy than choosing a clear mark.

## The Eclipse Foundation fair-use sentence is not a licence

The [Eclipse Foundation Trademark Usage Policy](https://www.eclipse.org/legal/logo-guidelines/) is explicit in two relevant ways:

- Section 3 says an Eclipse Foundation trade mark may not be incorporated into a software product or service name without advance written agreement.
- Its fair-use paragraph only preserves fair uses that already exist under applicable law. It does not define every nonprofit or open-source use as fair, and it does not itself grant permission.

The chosen presentation uses Eclipse as this project’s own source identifier: examples include “ECLIPSE / UMBRA,” “Install the Eclipse client,” the repository name and the application title. That is branding use, not a factual reference to the Foundation, its IDE or another Eclipse project. IP Australia describes trade mark use as use that presents a sign to consumers as a brand or “badge of origin,” assessed objectively and in context. A descriptive purpose does not prevent trade mark use if one purpose is to distinguish the user’s goods. See [IP Australia’s use-as-a-trade-mark guidance](https://manuals.ipaustralia.gov.au/trademark/19a2-use-as-a-trade-mark) and the High Court’s decision in [*Self Care IP Holdings v Allergan* [2023] HCA 8](https://www.hcourt.gov.au/cases-and-judgments/judgments/judgments-1998-current/self-care-ip-holdings-pty-ltd-v-allergan-australia-pty-ltd).

### Australian exceptions

Sections 120, 122 and 124 of the current [*Trade Marks Act 1995* (Cth)](https://www.legislation.gov.au/C2004A04969/latest/text) make the relevant distinction. Section 120 addresses use of an identical or deceptively similar sign as a trade mark. Section 122 lists specific non-infringing uses, including good-faith use of a person’s own name, descriptive use, use to indicate intended purpose such as accessories or spare parts, and comparative advertising. Section 124 addresses continuous prior use.

None is an obvious fit for the current branding:

- Eclipse is not the maintainer’s own name or place of business.
- Eclipse does not describe the kind, quality, purpose or geographic origin of this game-streaming client.
- The client is not being described as compatible with or intended for the Foundation’s Eclipse product.
- The name is not being used in comparative advertising.
- The project’s recent use does not appear capable of supporting a prior-use defence against a registration dating from 2009.

A disclaimer that the project is not affiliated with the Foundation is a sensible factual statement. It may reduce confusion, but it is not one of the statutory exceptions and does not change the role of Eclipse as the product name.

### United States fair-use doctrines

The result is similar under the main United States doctrines that the Foundation’s policy may be referring to:

- Classic or descriptive fair use under [15 U.S.C. § 1115(b)(4)](https://www.law.cornell.edu/uscode/text/15/1115) requires fair, good-faith use **otherwise than as a mark** to describe the user’s goods or their geographic origin. The current product-name use is as a mark and is not descriptive of game streaming.
- Nominative fair use protects necessary references to the trade mark owner’s actual product, subject to limits on how much of the mark is used and whether sponsorship is suggested. See [*Toyota Motor Sales v Tabari*](https://cdn.ca9.uscourts.gov/datastore/opinions/2010/07/08/07-55344.pdf) and [*Adobe Systems v Christenson*](https://cdn.ca9.uscourts.gov/datastore/opinions/2015/12/30/12-17371.pdf). This project is naming its own client, not referring to the Foundation’s product.

Failing those fair-use tests does not by itself prove infringement. In any particular claim, ownership, territorial rights, registered goods or services, confusion, validity and possible defences still require analysis. The Foundation has active United States ECLIPSE registrations, including [registration 5,343,675](https://tsdr.uspto.gov/statusview/sn86246654) and [registration 7,674,472](https://tsdr.uspto.gov/statusview/sn79400618), but their listed software fields are not identical to game streaming. That is a reason for full clearance, not a conclusion that a United States claim would necessarily succeed.

## An Australian registration creates a separate local risk

A preliminary search of the official register found active Australian word mark **ECLIPSE**, trade mark **1325375**, owned by **DXC Technology Company**. The record lists a 13 October 2009 priority date, registered status, renewal due 13 October 2029, and classes 9 and 42. Class 9 includes broad wording such as “computer software,” “computer software packages” and “computer software programs,” subject to listed oil, gas and wool-market exclusions. See the [official IP Australia record for trade mark 1325375](https://search.ipaustralia.gov.au/trademarks/search/view/1325375/details).

That exact word registration for broad computer software is a serious Australian clearance issue for a downloadable software client. It does not establish infringement by itself: the precise scope of the registration, relevant goods, use, validity, non-use issues and defences must be assessed by a lawyer. IP Australia also warns that a register search is only preliminary and that an examiner may find material a searcher missed. See [Australian Trade Mark Search](https://search.ipaustralia.gov.au/trademarks/search).

The screen also found a registered figurative series, Australian trade mark **2079960**, containing **ECLIPSE CONNECT**, **ECLIPSE CONNECT CENTRE**, **ECLIPSE SWITCHBOARD**, **ECLIPSE UC** and related variants. It is owned by Channel UC Pty Ltd in class 38 and covers computer/data communications, audiovisual and video communications, and video conferencing. See the [official record](https://search.ipaustralia.gov.au/trademarks/search/view/2079960/details). It is not a plain-word monopoly and may carry a narrower visual scope, but it is another directly adjacent result a professional clearance search would need to analyse.

The Eclipse Foundation policy is not the only issue: the separate DXC Australian registration and any other applicable rights require their own analysis.

### UMBRA has an even closer Australian registration

The official register also contains the live plain-word mark **UMBRA**, Australian trade mark **2196711**, owned by **Amazon Technologies, Inc.** It has a 22 January 2021 convention priority date, is registered in classes 9, 38 and 42, and is due for renewal on 22 July 2031. See the [official IP Australia record for trade mark 2196711](https://search.ipaustralia.gov.au/trademarks/search/view/2196711/details).

Its specification is unusually close to this project. Among other things it expressly lists:

- computer software and software platforms;
- transmission of voice, data, graphics, sound and video over broadband or wireless networks;
- software for authoring, transmitting, sharing, streaming, receiving, encoding, decoding and displaying audiovisual works;
- provisioning and scaling video-processing, delivery and storage services;
- streaming data, software applications, audio and video; and
- access to remotely hosted operating systems, applications and cloud resources.

This is not merely a same-class result: the actual listed functions overlap audiovisual transport and remote software delivery. It makes standalone **Umbra** a poor choice and substantially undermines **UmbraLink**.

The collision is not confined to Australia. Amazon also has a live United States plain-word UMBRA registration, [US registration 6,988,688](https://tsdr.uspto.gov/statusview/sn90843939), in classes 9, 38 and 42 with materially similar video-processing, streaming, remote-application and software specifications, plus an older live stylised UMBRA registration, [US registration 5,182,088](https://tsdr.uspto.gov/statusview/sn86510552), for a computer-game software development tool for 3D graphics optimisation. The Australian UMBRA record itself claims convention priority from EUIPO application 018381644. These findings matter because the intended GitHub releases and promotion are globally accessible, although infringement remains territorial and market targeting still matters.

## Evaluation of the three proposed forms

The Australian quick search returned no exact record for `Eclipse Umbra`, `Eclipse/Umbra`, `UmbraLink`, `Umbra Link` or `Project Eclipse` on 30 September 2026. Those negative exact-string results are recorded only as search facts, not as clearance: IP Australia expressly cautions that an effective search must consider important components and visually or phonetically similar marks.

### Eclipse/Umbra

If **Eclipse** is the client and **Umbra** is the host, the slash presentation on a landing page does not change the fact that users will also encounter two standalone product names in headings, repositories, packages, installers and instructions. That is the highest-risk version: it puts the exact registered words on overlapping software.

If `Eclipse/Umbra` were instead used only as one indivisible composite mark, the whole-mark comparison could be different. It still cannot be treated as cleared. The slash visually preserves two complete words, the words have a recognised relationship in astronomy, and each is likely to remain independently memorable. A stylised logo would not remove the word-mark issue.

### UmbraLink

An exact Australian quick search returned no `UmbraLink` result on 30 September 2026, but exact-name absence is not clearance. IP Australia warns that searches must include similar marks and important constituent parts. Australian infringement and application analysis includes substantially identical and deceptively similar signs, not only exact duplicates. See [How to search existing trade marks](https://www.ipaustralia.gov.au/trade-marks/search-existing-trade-marks).

Here `UMBRA` is wholly incorporated at the beginning. “Link” naturally suggests network connectivity and is unlikely to dominate the whole. IP Australia's [mark-comparison guidance](https://manuals.ipaustralia.gov.au/trademark/6.-factors-to-consider-when-comparing-trade-marks) says that a shared element can remain essential, that consumers may perceive a longer mark as a variant or sub-brand, and that low-distinctiveness additions make deceptive similarity more likely. That does not predetermine a court's result, but it makes **UmbraLink** a weak alteration in precisely the streaming field covered by Amazon's registration.

There is also current exact-name market use. [Umbra Link](https://umbra-ai.link/) is presented by Umbra-Noesis LLC as an identity, routing and connection layer linking users, nodes and devices through a local-first private mesh. Its operator's [legal portal](https://umbra-noesis.net/) asserts `Umbra Link™`, although this review did not locate a supporting registration number. Separately, `umbralink.app` was indexed in July 2026 as “Umbra Link,” a commercial desktop application, and now redirects to a renamed product. These uses are not proof of Australian registered rights, but the active network-software use is close enough to create additional search, marketplace-confusion and possible unregistered-rights work.

### Project Eclipse

An exact Australian quick search likewise returned no `Project Eclipse` result, but DXC's exact ECLIPSE registration remains relevant. “Project” tells users that the thing is a project; it contributes little source identity. Under the same whole-mark principles, a court or examiner could still regard ECLIPSE as the essential and remembered element. This is a risk assessment, not a conclusion that the two marks are legally identical.

The name also cuts directly across the Eclipse Foundation's naming environment. The Foundation claims ECLIPSE and the names of its projects as trade marks. Its [Trademark Usage Policy](https://www.eclipse.org/legal/logo-guidelines/) says third parties may not incorporate an Eclipse Foundation trade mark into a software product or service name without advance written agreement, while its own handbook and sites routinely identify software as “Eclipse [project name].” **Project Eclipse** therefore creates an especially avoidable affiliation impression even though the live Australian ECLIPSE registration identified above belongs to DXC, not the Foundation.

The phrase is already crowded in software and games, including a current downloadable `Project-Eclipse` game service and several public repositories and games. Examples include [project-eclipse.org](https://project-eclipse.org/) and [Project Eclipse: The First Plague](https://ntfw23.itch.io/project-eclipse). Crowding can sometimes narrow the practical strength of a shared element, but it also makes the name harder to search, own and defend. It does not cancel DXC's registration.

Used only as a private, non-public development codename, **Project Eclipse** would present much less practical trade mark risk. A public GitHub organisation or repository, product page, installer, release and donation identity is different: that is the proposed consumer-facing brand use being assessed here.

## Free, nonprofit and open-source distribution is not a safe harbour

Charging a price is not a prerequisite for trade mark use. IP Australia expressly lists “I’m not charging for it” as a misconception because unauthorised use can still infringe. Its [course-of-trade guidance](https://manuals.ipaustralia.gov.au/trademark/3.-use-in-the-course-of-trade) records that free public distribution can be trade use where it promotes an operation. It also explains that charitable and nonprofit organisations can build commercial reputation through public exposure, advertising, fundraising and educational material. Donations or sponsorship can give those activities sufficiently commercial character. See [What is IP infringement?](https://ipfirstresponse.ipaustralia.gov.au/options/infringement-101-what-ip-infringement).

For this project, the intended combination of public releases, a consumer-facing site, Reddit and LTT promotion, repository and package branding, and a donation button is materially different from a private internal codename. The donation button could strengthen rather than weaken an argument that the sign is being used in the course of trade. Removing the button would not automatically make the product-name use safe.

## Where action could occur

Trade mark rights are territorial. An Australian registration protects in Australia, while rights in another country depend on that country’s registrations and law. IP Australia states both that Australian registration applies only inside Australia and that online activity makes jurisdictional boundaries less clear. See [Does my Australian IP work overseas?](https://ipfirstresponse.ipaustralia.gov.au/options/does-my-australian-ip-work-overseas) and [Understanding Trade Marks](https://www.ipaustralia.gov.au/news-and-community/webinars-and-podcasts/understanding-trade-marks/).

The practical position is:

- **Australia:** an Australian maintainer who publishes and promotes the project from Australia can be sued here for Australian infringement. Sections 125 and 190 of the *Trade Marks Act* permit proceedings in prescribed courts including the Federal Court, the Federal Circuit and Family Court of Australia (Division 2), and state or territory Supreme Courts. The [Federal Court](https://www.fedcourt.gov.au/about/jurisdiction) confirms that it hears trade mark and other intellectual-property matters.
- **Other countries:** a claimant needs an applicable local right and a basis for the court to exercise jurisdiction. Mere global accessibility is not automatically use in every country; targeting, local downloads, promotion, users and other contacts matter. IP Australia’s [Australian-use guidance](https://manuals.ipaustralia.gov.au/trademark/4.-australian-use) explains that a foreign-hosted website is generally not used in Australia without conduct directed or targeted here. The same territorial question must be assessed under each foreign country’s law.
- **Platforms and domains:** a rights owner can use private complaint processes without first obtaining a court judgment. [GitHub’s Trademark Policy](https://docs.github.com/en/site-policy/content-removal-policies/github-trademark-policy) allows registered owners to report confusing use; GitHub may require confusion to be cleared, release a username or suspend an account in cases of clear deceptive intent. Domain-name proceedings can result in transfer or cancellation under the UDRP or auDRP. See [IP Australia’s domain dispute guide](https://ipfirstresponse.ipaustralia.gov.au/options/challenge-use-international-domain-name).

## A territorial right does not guarantee a country-only removal

An Australian claim concerns Australian rights, but the remedy is an order directed to the defendant’s conduct. Section 126 of the *Trade Marks Act* permits an injunction on conditions the court thinks fit, as well as damages or an account of profits and, in appropriate cases, additional damages. The exact geographic and technical scope would depend on the pleaded conduct, evidence, parties, proportionality and wording of the final order or settlement.

It is therefore unsafe to assume the only possible outcome is blocking Australian visitors. At minimum, a court could require the Australian maintainer to stop using the mark in Australia. In *Redbubble*, for example, the Full Federal Court framed the restraint as infringement and trade mark use “in Australia,” while the compliance mechanism required prompt removal of notified images from the shared website. Justice Downes explains that the form of an injunction is moulded to the circumstances and evidence in [Remedies in Intellectual Property Law in Australia Post-Redbubble](https://www.fedcourt.gov.au/digital-law-library/judges-speeches/justice-downes/downes-j-20240901).

Where one GitHub repository, product identity, package set and website are published globally, the simplest reliable way to comply may therefore be a global rename or removal. Whether geoblocking alone would satisfy a particular order cannot be predicted in advance.

Platform consequences may also be global even when the underlying legal right is territorial: changing a GitHub username, repository identity or account status affects the shared global service rather than only Australian viewers.

Separate causes of action may exist even without a directly applicable registration. IP Australia explains that an owner with reputation in Australia may rely on passing off or the Australian Consumer Law for misleading origin, affiliation, sponsorship or approval. Those claims have their own proof requirements. See [Unregistered trade marks](https://ipfirstresponse.ipaustralia.gov.au/options/infringement-101-unregistered-trade-marks).

## Launch rule and next actions

1. Apply the **Eclipse/Umbra → Eclipse client + Umbra host** hierarchy to every official site, repository description, release, installer, video and funding surface before public promotion.
2. Keep the application names. Do not replace them with anonymous “Client” and “Host” labels; use those words as roles: **Eclipse client** and **Umbra host**.
3. Do not present `/`, a combined logo, nonprofit status, open-source licensing or a disclaimer as legal clearance. The Australian ECLIPSE and UMBRA results remain unresolved risks.
4. Do not contact the identified owners for permission. If an external legal check is later commissioned, scope it as a private clearance/risk opinion on the exact chosen architecture.
5. Search the exact composite, both component names and similar-looking or similar-sounding marks in each intended launch market before final artwork, domains or videos are locked.
6. Preserve the factual non-affiliation notice and prominent upstream acknowledgements. Factual credit does not imply affiliation or endorsement.

IP Australia’s domain-dispute guide links to the Institute of Patent and Trade Mark Attorneys Australia’s free initial consultation option. If professional review is chosen, a scoped written opinion on the actual suite and component presentation is more useful than relying on an informal conversation.

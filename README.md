# BerthVellum

**Turn shipping updates into actionable timelines.**

BerthVellum helps independent freight forwarders, shipping agents and import operations teams turn scattered shipment emails and documents into one operational timeline. AI extracts milestones, reconciles conflicting updates and flags shipments that need attention, and operations staff verify every extracted event.

> BerthVellum is a proposed product. Pricing is illustrative and the prototype uses fictional data. Founded by **Chukwudi Okeke** with co-founder **Yetunde Balogun**. The domain `berthvellum.site` and the email `chukwudi@berthvellum.site` are placeholders; confirm them before launch. Organisation types named on the site are prospective customers with no implied affiliation.

## Design

A nautical chart on vellum: Spectral display type, Public Sans text and Red Hat Mono for dates and container numbers. The palette is deep sea navy with chart magenta for routes and conflicts.

- **Hero**: carrier and agent emails slide into a single timeline, with the conflicting ETA marked.
- **Voyage chart**: an SVG chart with depth contours, land, a magenta route and a compass rose.
- **Conflicts**: two sources shown side by side.
- **Exception queue**: computed live from the prototype's rules.
- **Steps**: shown as buoys along a shipping lane.
- **Other sections**: ground rules, sourced statistics (UNCTAD, Sea-Intelligence, The Loadstar), pricing, a proposed AWS architecture (Bedrock, Textract, SageMaker AI, S3, DynamoDB, Lambda), team and FAQ.

## Shipment desk (`/app`)

The desk holds six fictional Lagos import shipments.

- **Extraction**: each event carries its source, a quote and a confidence score.
- **Review**: staff verify, correct or reject each event, and reconcile conflicting sources with a stated reason.
- **Exception queue**: ranks shipments with a transparent points-based delay risk, covering conflicts, demurrage, expiring free time, missing documents, unconfirmed transshipment and low-confidence events.
- **Closing exceptions**: only the Operations Lead can close one.
- **Roles**: Operations Lead, Shipment Coordinator, Customs Broker and Client Viewer.

Every decision needs a reason and is written to an exportable log. Changes persist in `localStorage`. Motion is skipped when the visitor prefers reduced motion, and every page is server-rendered so it reads without JavaScript.

## Develop

```bash
npm install
npm run dev
```

```bash
npm run build   # Vite build, server render, static prerender of /, /app, /privacy, /terms and 404.html
npm test        # rules and content tests (node --test)
```

The output in `dist/` is fully static. `public/_headers` and `public/_redirects` cover Netlify/Cloudflare Pages, and `vercel.json` covers Vercel. Until a form service is connected, the pilot form keeps requests in the browser and opens a pre-filled email. To send submissions to HubSpot instead, set `VITE_HUBSPOT_PORTAL_ID` and `VITE_HUBSPOT_FORM_GUID` at build time, and update the privacy notice first.

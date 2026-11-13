import React, {useState} from 'react';
import site from './content.js';
import {fmt, shipments, today} from './data.js';
import {queue} from './engine.js';
import Desk from './Desk.jsx';
import LeadForm from './LeadForm.jsx';

export function Compass({size = 34}) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="#f4efe3" stroke="#1b2a3a" strokeWidth="1.5" />
      <path d="M20 3 L23 20 L20 37 L17 20 Z" fill="#1b2a3a" /><path d="M3 20 L20 17 L37 20 L20 23 Z" fill="#b5179e" opacity=".85" />
      <circle cx="20" cy="20" r="2.5" fill="#f4efe3" stroke="#1b2a3a" />
    </svg>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const links = [['Sources', '/#sources'], ['Timeline', '/#timeline'], ['Conflicts', '/#conflicts'], ['Exceptions', '/#exceptions'], ['Pricing', '/#pricing'], ['Team', '/#team']];
  return (
    <header className="hdr">
      <a href="/" className="brand" aria-label="BerthVellum home"><Compass /><span>Berth<em>Vellum</em></span></a>
      <nav id="nav" className={open ? 'nav open' : 'nav'} aria-label="Main">
        {links.map(([t, h]) => <a key={t} href={h} onClick={() => setOpen(false)}>{t}</a>)}
        <a className="nav-app" href="/app" onClick={() => setOpen(false)}>Shipment desk</a>
      </nav>
      <a className="hdr-cta" href="/app">Open the shipment desk</a>
      <button className="menu" aria-expanded={open} aria-controls="nav" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Menu'}</button>
    </header>
  );
}

const MAILS = [
  ['Carrier · 2 Nov', 'MV Orion Bay sailed Shanghai 02/11.'],
  ['Agent · 10 Nov', 'Box loaded on feeder at Tema 09/11.'],
  ['Arrival notice (PDF)', 'ETA Apapa: 15-Nov-2026'],
  ['Agent · 12 Nov', 'Feeder delayed, now expecting the 18th.'],
];
const LINE = [['Departed origin', '2 Nov', 'ok'], ['Transshipped · Tema', '9 Nov', 'ok'], ['ETA Lagos', '15 or 18 Nov?', 'clash'], ['Berthed', '—', 'todo'], ['Customs released', '—', 'todo']];

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <svg className="contours" viewBox="0 0 1200 600" preserveAspectRatio="none" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M-20 ${380 + i * 34} C 220 ${330 + i * 30}, 420 ${470 + i * 26}, 700 ${400 + i * 30} S 1100 ${330 + i * 34}, 1240 ${380 + i * 30}`} />)}
      </svg>
      <div className="hero-copy">
        <p className="eyebrow">Freight forwarding operations</p>
        <h1 id="hero-title">Turn shipping updates into <em>actionable timelines.</em></h1>
        <p className="lede">{site.about}</p>
        <div className="actions"><a className="btn" href="/app">Open the shipment desk</a><a className="btn ghost" href="#pilot">Request a pilot</a></div>
      </div>
      <figure className="morph" data-plot aria-label="Four shipment emails turned into one timeline, with conflicting arrival dates flagged">
        <ul className="mails">{MAILS.map(([f, t], i) => <li key={f} style={{'--i': i}}><small>{f}</small><span>“{t}”</span></li>)}</ul>
        <div className="arrow" aria-hidden="true">→</div>
        <ol className="tl">{LINE.map(([m, d, s], i) => <li key={m} className={`tl-${s}`} style={{'--i': i}}><b>{m}</b><span>{d}</span></li>)}</ol>
        <figcaption>BV-2041 · MSKU 418273-5 · Shanghai → Tema → Lagos (fictional)</figcaption>
      </figure>
    </section>
  );
}

const SOURCES = [
  ['Carrier emails', '“Vessel departed Antwerp 01.11.”'],
  ['Agent messages', '“Northern Star don berth this morning.”'],
  ['Arrival notices', 'ETA Apapa: 15-Nov-2026'],
  ['Portal exports', 'Release status: PENDING'],
  ['Broker emails', '“Customs release obtained for HLXU3304182.”'],
];

function Sources() {
  return (
    <section className="sec" id="sources" aria-labelledby="src-title">
      <p className="eyebrow">The problem</p>
      <h2 id="src-title">A shipment’s real status is spread across five inboxes and a phone call.</h2>
      <p className="txt">Carriers, agents, terminals and brokers each send their own update, in their own format, on their own schedule. Teams rebuild the picture by hand — and a missed handoff becomes storage charges, demurrage or an unhappy client.</p>
      <div className="sources">{SOURCES.map(([t, q], i) => <article key={t} data-plot style={{'--r': `${[-1.2, .8, -.4, 1, -.8][i]}deg`}}><small>{t}</small><p>{q}</p></article>)}</div>
    </section>
  );
}

function Voyage() {
  const pts = [[110, 330, 'Shanghai', 'Departed 2 Nov', 'ok'], [560, 250, 'Tema', 'Transshipped 9 Nov', 'ok'], [820, 300, 'Lagos (Apapa)', 'ETA 15 or 18 Nov', 'clash']];
  return (
    <section className="sec chart-sec" id="timeline" aria-labelledby="tl-title">
      <div className="split">
        <div>
          <p className="eyebrow">Milestone extraction</p>
          <h2 id="tl-title">One timeline per shipment, with the source of every date.</h2>
          <p className="txt">BerthVellum reads correspondence and documents, extracts the milestones — departed, transshipped, ETA, berthed, discharged, released, delivered — and places them on one timeline. Every date links back to the email or document it came from, and operations staff verify it.</p>
          <ul className="legend"><li><i className="lg-ok" /> Verified</li><li><i className="lg-clash" /> Sources disagree</li><li><i className="lg-todo" /> Not yet reported</li></ul>
        </div>
        <figure className="chart" data-plot aria-label="Chart of the voyage from Shanghai via Tema to Lagos with milestones">
          <svg viewBox="0 0 900 460">
            <rect width="900" height="460" className="sea" />
            {[0, 1, 2, 3].map((i) => <path key={i} className="depth" d={`M0 ${90 + i * 90} C 200 ${60 + i * 90}, 420 ${140 + i * 80}, 900 ${80 + i * 95}`} />)}
            <path className="land" d="M650 0 H900 V140 C 860 160, 820 210, 760 205 C 720 200, 690 160, 650 120 Z" />
            <path className="land" d="M0 380 C 80 360, 150 400, 230 420 L 260 460 H0 Z" />
            <path className="route" d="M110 330 C 300 420, 430 230, 560 250 S 740 330, 820 300" pathLength="1" />
            {pts.map(([x, y, n, d, s]) => <g key={n} transform={`translate(${x} ${y})`}><circle r="9" className={`pt pt-${s}`} /><text y="-18" textAnchor="middle" className="pt-n">{n}</text><text y="30" textAnchor="middle" className="pt-d">{d}</text></g>)}
            <g transform="translate(820 400)"><Rose /></g>
            <text x="20" y="30" className="chart-title">BV-2041 · MV Orion Bay / feeder · not to scale</text>
          </svg>
        </figure>
      </div>
    </section>
  );
}

function Rose() {
  return <g className="rose"><circle r="32" /><path d="M0 -40 L6 0 L0 40 L-6 0 Z" /><path d="M-40 0 L0 -6 L40 0 L0 6 Z" opacity=".5" /><text y="-46" textAnchor="middle">N</text></g>;
}

function Conflicts() {
  return (
    <section className="sec" id="conflicts" aria-labelledby="cf-title">
      <p className="eyebrow">Conflict detection</p>
      <h2 id="cf-title">When two sources disagree, a person decides which is right.</h2>
      <div className="clash" data-plot>
        <article className="doc"><small>Carrier arrival notice · PDF · 11 Nov</small><p className="mono">ETA APAPA: <mark>15-NOV-2026</mark></p><span className="conf">extracted · 94% confidence</span></article>
        <div className="vs" aria-hidden="true"><span>disagree</span></div>
        <article className="doc"><small>Agent email · 12 Nov</small><p>“Feeder delayed by congestion, now expecting <mark>the 18th</mark>.”</p><span className="conf">extracted · 86% confidence</span></article>
      </div>
      <p className="txt">BerthVellum flags the conflict, shows both sources side by side and raises the shipment in the exception queue. The coordinator confirms with the agent or line, picks the correct update and records how they confirmed it. Nothing is overwritten silently.</p>
    </section>
  );
}

function Exceptions() {
  const q = queue(shipments, today);
  return (
    <section className="sec chart-sec" id="exceptions" aria-labelledby="ex-title">
      <p className="eyebrow">Exception queue</p>
      <h2 id="ex-title">Today’s follow-ups, most urgent first — with the reasons.</h2>
      <ol className="queue">{q.map((x) => { const s = shipments.find((y) => y.id === x.id); return (
        <li key={x.id} data-plot className={`q-${x.level}`}>
          <div className="q-head"><b>{x.id}</b><span>{s.client} · {s.route}</span><em>{x.level}</em></div>
          <ul>{x.reasons.map((r) => <li key={r.text}><span>{r.text}</span><b>+{r.points}</b></li>)}</ul>
        </li>); })}</ol>
      <p className="fine">Computed from the fictional shipments in the desk, as of {fmt(today)}. Scores come from rules teams recognise; a learning model for delay prediction is added only as enough history builds up.</p>
    </section>
  );
}

const STEPS = [['Forward', 'Shipment emails and documents are forwarded or uploaded for a set of workflows.'], ['Extract', 'Milestones, dates and references are read from emails and documents.'], ['Reconcile', 'Conflicting updates are flagged with both sources side by side.'], ['Verify', 'Operations staff confirm, correct or reject each extracted event.'], ['Act', 'Exceptions are queued by urgency; staff follow up and close them.']];

function Steps() {
  return (
    <section className="sec" aria-labelledby="st-title">
      <p className="eyebrow">How it works</p>
      <h2 id="st-title">From inbox to timeline in five steps.</h2>
      <ol className="lane">{STEPS.map(([t, d], i) => <li key={t} data-plot><span className="buoy">{i + 1}</span><h3>{t}</h3><p>{d}</p></li>)}</ol>
    </section>
  );
}

function Rules() {
  const r = [['Staff verify every event', 'Extracted dates are suggestions until someone in operations confirms them.'], ['No silent overwrites', 'When sources disagree, both stay on record and a person chooses.'], ['No automatic messages', 'BerthVellum never emails clients, carriers or agents on your behalf.'], ['Evidence travels with the date', 'Every milestone links to the email or document it came from.']];
  return (
    <section className="sec chart-sec" aria-labelledby="rl-title">
      <div className="split">
        <div><p className="eyebrow">Ground rules</p><h2 id="rl-title">Built to support the desk, not replace it.</h2></div>
        <div className="rules">{r.map(([t, d]) => <div key={t} data-plot><h3>{t}</h3><p>{d}</p></div>)}</div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="sec" aria-labelledby="sx-title">
      <p className="eyebrow">Why it matters</p>
      <h2 id="sx-title">Most trade moves by sea, and schedules slip.</h2>
      <div className="stats">{site.stats.map((s) => <figure key={s.label} data-plot><b>{s.value}</b><figcaption>{s.label}<a href={s.url} target="_blank" rel="noopener noreferrer">{s.source} ↗</a></figcaption></figure>)}</div>
      <p className="fine">Published figures from the sources linked. They describe the industry, not BerthVellum results.</p>
    </section>
  );
}

function Who() {
  const w = [['Independent freight forwarders', 'Many shipments, small teams, every client asking “where is it?”'], ['Shipping agents', 'Updates from lines, terminals and principals to reconcile.'], ['Import operations teams', 'Releases, documents and free time to watch across suppliers.']];
  return (
    <section className="sec chart-sec" aria-labelledby="who-title">
      <p className="eyebrow">Who it’s for</p>
      <h2 id="who-title">For the people who answer “where is my container?”</h2>
      <div className="who">{w.map(([t, d]) => <div key={t} data-plot><h3>{t}</h3><p>{d}</p></div>)}</div>
      <p className="fine">Organisation types are prospective customers; no affiliation is implied.</p>
    </section>
  );
}

function Pricing() {
  const t = [['Desk', '$290', 'per month', ['Up to 150 active shipments', 'Milestone extraction', 'Conflict detection', '5 users']], ['Operations', '$790', 'per month', ['Up to 600 active shipments', 'Exception queue & alerts', 'Document processing', 'Unlimited users'], true], ['Network', 'Custom', '', ['Multiple branches', 'Carrier & portal integrations', 'Delay prediction as history builds', 'Dedicated support']]];
  return (
    <section className="sec" id="pricing" aria-labelledby="pr-title">
      <p className="eyebrow">Pricing</p>
      <h2 id="pr-title">Priced by active shipments.</h2>
      <p className="txt">Illustrative pricing for a proposed product, agreed with pilot customers.</p>
      <div className="tiers">{t.map(([n, p, u, f, hot]) => <article key={n} className={hot ? 'tier hot' : 'tier'} data-plot><h3>{n}</h3><p className="price"><b>{p}</b> {u}</p><ul>{f.map((x) => <li key={x}>{x}</li>)}</ul><a className={hot ? 'btn' : 'btn ghost'} href="#pilot">{n === 'Network' ? 'Talk to us' : 'Request a pilot'}</a></article>)}</div>
    </section>
  );
}

function Stack() {
  const p = [['Amazon Bedrock', 'Extracting shipment updates'], ['Amazon Textract', 'Reading shipping documents'], ['Amazon SageMaker AI', 'Delay prediction, as history builds'], ['Amazon S3', 'Correspondence and documents'], ['Amazon DynamoDB', 'Shipment timelines'], ['AWS Lambda', 'Processing and alerts']];
  return (
    <section className="sec chart-sec" aria-labelledby="aws-title">
      <div className="split">
        <div><p className="eyebrow">Proposed platform</p><h2 id="aws-title">Proposed architecture on AWS.</h2><p className="txt">Not deployed. This website and the shipment desk run in your browser on fictional data.</p></div>
        <ul className="parts">{p.map(([a, b]) => <li key={a} data-plot><b>{a}</b><span>{b}</span></li>)}</ul>
      </div>
    </section>
  );
}

function Team() {
  return (
    <section className="sec" id="team" aria-labelledby="team-title">
      <p className="eyebrow">The team</p>
      <h2 id="team-title">The founders of BerthVellum.</h2>
      <div className="team">{site.team.map((p) => <article key={p.name} data-plot><span className="initials" aria-hidden="true">{p.initials}</span><p className="role">{p.role === 'Founder/CEO' ? 'Founder & CEO' : 'Co-founder'}</p><h3>{p.name}</h3><p>{p.bio}</p></article>)}</div>
    </section>
  );
}

const FAQ = [
  ['Which shipping workflows does the first version cover?', 'A limited set of import workflows: departure, transshipment, arrival, berthing, discharge, customs release and delivery, from customer-uploaded correspondence and documents.'],
  ['Does BerthVellum contact carriers or clients?', 'No. It organises and flags. Your team decides who to contact and what to say.'],
  ['How does delay prediction work?', 'At first, from rules teams already use — conflicting updates, free time running out, missing documents. A learning model is added only once enough of your own history exists to test it.'],
  ['Is BerthVellum live?', 'Not yet. It is a proposed product; the shipment desk is a prototype running in your browser on fictional data.'],
];

function Faq() {
  return (
    <section className="sec chart-sec" aria-labelledby="faq-title">
      <p className="eyebrow">FAQ</p>
      <h2 id="faq-title">Frequently asked questions.</h2>
      <div className="faq">{FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="ftr">
      <a href="/" className="brand light" aria-label="BerthVellum home"><Compass /><span>Berth<em>Vellum</em></span></a>
      <p>{site.tagline}</p>
      <nav aria-label="Footer"><a href="/app">Shipment desk</a><a href="/#pricing">Pricing</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href={`mailto:${site.email}`}>{site.email}</a></nav>
      <p className="fine">© 2026 BerthVellum. Founded by {site.team[0].name} with {site.team[1].name}. A proposed product: pricing is illustrative and the shipment desk uses fictional data.</p>
    </footer>
  );
}

function Home() {
  return (<><Hero /><Sources /><Voyage /><Conflicts /><Exceptions /><Steps /><Rules /><Stats /><Who /><Pricing /><Stack /><Team /><Faq /><LeadForm /></>);
}

const LEGAL = {
  privacy: ['Privacy notice', [
    ['This website', 'BerthVellum is a proposed product. This website and the shipment desk run in your browser on fictional data.'],
    ['Shipment desk', 'Your changes are kept in your browser’s local storage (key berthvellum-desk-v1) and never leave your device. “Reset” clears them.'],
    ['Pilot requests', `Until a form service is connected, the form keeps your request in this browser and opens a pre-filled email to ${site.email}. Nothing is sent until you send it. This notice will be updated before any customer-relationship service is connected.`],
    ['Cookies & analytics', 'None.'],
  ]],
  terms: ['Terms of use', [
    ['A proposed product', 'Nothing here is an offer of service. Pricing is illustrative.'],
    ['Demonstration only', 'The shipment desk uses fictional shipments and must not be used for real operations.'],
    ['People decide', 'BerthVellum extracts and flags; operations staff verify events and decide follow-ups.'],
    ['No affiliation', 'Organisation types named are prospective customers; no affiliation is implied.'],
  ]],
};

function Legal({kind}) {
  const [title, items] = LEGAL[kind];
  return <section className="sec legal"><p className="eyebrow">Review draft</p><h1>{title}</h1>{items.map(([t, d]) => <div key={t}><h2>{t}</h2><p>{d}</p></div>)}</section>;
}

function NotFound() {
  return <section className="sec legal"><p className="eyebrow">404</p><h1>This page missed its connection.</h1><p>It isn’t here.</p><p><a className="btn" href="/">Back to BerthVellum</a></p></section>;
}

export default function App({path = '/'}) {
  if (path.startsWith('/app')) return <Desk />;
  const page = path === '/' ? <Home /> : path === '/privacy' ? <Legal kind="privacy" /> : path === '/terms' ? <Legal kind="terms" /> : <NotFound />;
  return (<><a className="skip" href="#main">Skip to content</a><Header /><main id="main">{page}</main><Footer /></>);
}

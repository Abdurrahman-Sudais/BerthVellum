import React, {useState} from 'react';
import site from './content.js';

const blank = {name: '', email: '', studio: '', kind: '', pair: '', message: '', consent: false, website: ''}; // studio = company, pair = volume
const hubspot = () => {
  const env = (typeof import.meta !== 'undefined' && import.meta.env) || {};
  return env.VITE_HUBSPOT_PORTAL_ID && env.VITE_HUBSPOT_FORM_GUID ? {portal: env.VITE_HUBSPOT_PORTAL_ID, form: env.VITE_HUBSPOT_FORM_GUID} : null;
};

export function validate(f) {
  const e = {};
  if (f.name.trim().length < 2) e.name = 'Your name, please.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = 'A valid work email, please.';
  if (!f.studio.trim()) e.studio = 'Which company?';
  if (!f.kind) e.kind = 'Choose the closest match.';
  if (!f.consent) e.consent = 'Please confirm we may contact you.';
  return e;
}

export default function LeadForm() {
  const [f, setF] = useState(blank);
  const [err, setErr] = useState({});
  const [sent, setSent] = useState(null);
  const set = (k, v) => setF((x) => ({...x, [k]: v}));
  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate(f); setErr(e);
    if (Object.keys(e).length) { document.getElementById(`lf-${Object.keys(e)[0]}`)?.focus(); return; }
    if (f.website) { setSent('local'); return; }
    const hs = hubspot();
    if (hs) {
      try {
        const [firstname, ...rest] = f.name.trim().split(/\s+/);
        const res = await fetch(`https://api.hsforms.com/submissions/v3/integration/submit/${hs.portal}/${hs.form}`, {method: 'POST', headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({fields: [['firstname', firstname], ['lastname', rest.join(' ')], ['email', f.email], ['company', f.studio], ['message', `${f.kind} · volume: ${f.pair}\n${f.message}`]].filter(([, v]) => v).map(([name, value]) => ({name, value})),
            context: {pageUri: location.href, pageName: document.title}})});
        if (res.ok) { setSent('hubspot'); return; }
      } catch { /* fall back to email */ }
    }
    try { const k = 'berthvellum-pilot-requests'; localStorage.setItem(k, JSON.stringify([...JSON.parse(localStorage.getItem(k) || '[]'), {...f, website: undefined, at: new Date().toISOString()}])); } catch { /* storage unavailable */ }
    setSent('local');
  };
  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(`BerthVellum pilot — ${f.studio}`)}&body=${encodeURIComponent(`Name: ${f.name}\nEmail: ${f.email}\nCompany: ${f.studio}\nType: ${f.kind}\nShipments per month and main routes: ${f.pair}\n\n${f.message}`)}`;
  const field = (k) => ({id: `lf-${k}`, 'aria-invalid': err[k] ? true : undefined, 'aria-describedby': err[k] ? `lf-${k}-e` : undefined});
  const E = ({k}) => (err[k] ? <span className="err" id={`lf-${k}-e`} role="alert">{err[k]}</span> : null);
  return (
    <section className="sec chart-sec pilot" id="pilot" aria-labelledby="pilot-title">
      <div className="form-grid">
        <div className="form-intro">
          <p className="eyebrow">Pilot</p>
          <h2 id="pilot-title">Bring a month of shipment emails.</h2>
          <p>A pilot starts with correspondence and documents for a limited set of import workflows. Your team verifies every extracted event and compares the timelines and exception queue with what actually happened.</p>
          <p className="fine">Or write to <a href={`mailto:${site.email}`}>{site.email}</a> — {site.team[0].name} replies personally.</p>
        </div>
        {sent ? (
          <div className="sent" role="status">
            <h3>Thank you, {f.name.split(' ')[0] || 'there'}.</h3>
            {sent === 'hubspot' ? <p>Your request is on its way. Chukwudi will reply personally.</p> : <><p>Your request is saved in this browser. Send it as an email so it reaches us — it is pre-filled.</p><a className="btn" href={mailto}>Email {site.email}</a></>}
            <button type="button" className="link" onClick={() => setSent(null)}>Edit request</button>
          </div>
        ) : (
          <form noValidate onSubmit={submit} className="form">
            <label>Name<input {...field('name')} autoComplete="name" value={f.name} onChange={(e) => set('name', e.target.value)} /><E k="name" /></label>
            <label>Work email<input {...field('email')} type="email" autoComplete="email" value={f.email} onChange={(e) => set('email', e.target.value)} /><E k="email" /></label>
            <label>Company<input {...field('studio')} autoComplete="organization" value={f.studio} onChange={(e) => set('studio', e.target.value)} /><E k="studio" /></label>
            <label>Organisation type<select {...field('kind')} value={f.kind} onChange={(e) => set('kind', e.target.value)}><option value="">Choose…</option><option>Independent freight forwarder</option><option>Shipping agent</option><option>Import operations team</option><option>Other</option></select><E k="kind" /></label>
            <label className="wide">Shipments per month and main routes<input value={f.pair} placeholder="e.g. ~120 FCL imports · China & India → Lagos" onChange={(e) => set('pair', e.target.value)} /></label>
            <label className="wide">Anything else? (optional)<textarea rows="3" value={f.message} onChange={(e) => set('message', e.target.value)} /></label>
            <div className="hp" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set('website', e.target.value)} /></label></div>
            <label className="check wide"><input type="checkbox" {...field('consent')} checked={f.consent} onChange={(e) => set('consent', e.target.checked)} /> BerthVellum may contact me about this request.<E k="consent" /></label>
            <button className="btn wide" type="submit">Request a pilot</button>
            <p className="fine wide">Nothing is sent until you confirm. See the <a href="/privacy">privacy notice</a>.</p>
          </form>
        )}
      </div>
    </section>
  );
}

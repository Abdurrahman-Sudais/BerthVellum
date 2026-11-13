import React, {useEffect, useState} from 'react';
import site from './content.js';
import {fmt, milestones, people, roles, shipments, today} from './data.js';
import {act, can, conflicts, dateOf, initial, queue, risk} from './engine.js';
import {Compass} from './App.jsx';

const KEY = 'berthvellum-desk-v1';
const DOCS = {bl: 'Bill of lading', invoice: 'Invoice', packing: 'Packing list', form_m: 'Form M'};
const STATUS = {extracted: 'Extracted — not verified', verified: 'Verified', corrected: 'Corrected', rejected: 'Rejected', superseded: 'Superseded'};

export default function Desk() {
  const [state, setState] = useState(() => initial(shipments, roles));
  const [sel, setSel] = useState('BV-2045');
  const [msg, setMsg] = useState('');
  const [why, setWhy] = useState({});
  const [fix, setFix] = useState({});
  const [note, setNote] = useState('');
  const [tab, setTab] = useState('timeline');
  useEffect(() => { try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s?.shipments) setState(s); } catch { /* ignore */ } }, []);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ } }, [state]);

  const actor = people[state.role];
  const allow = (p) => can(roles, state.role, p);
  const run = (a, after) => { const r = act(state, a, {roles, actor, milestones}); setMsg(r.ok ? '' : r.error); if (r.ok) { setState(r.state); after?.(); } };
  const sh = state.shipments.find((s) => s.id === sel);
  const r = risk(sh, today);
  const cf = conflicts(sh);
  const q = queue(state.shipments, today);
  const w = (k) => why[`${sh.id}-${k}`] || '';
  const setW = (k, v) => setWhy({...why, [`${sh.id}-${k}`]: v});

  return (
    <div className="desk">
      <header className="dk-top">
        <a href="/" className="brand" aria-label="Back to the BerthVellum website"><Compass size={28} /> Berth<em>Vellum</em></a>
        <span className="dk-date">Lagos import desk · {fmt(today)}</span>
        <label className="dk-role">Signed in as <select value={state.role} onChange={(e) => run({type: 'role', role: e.target.value})}>{roles.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
        <button className="btn ghost sm" onClick={() => { setState(initial(shipments, roles)); setMsg(''); }}>Reset</button>
      </header>
      <p className="dk-banner">Fictional shipments. Extracted events are unverified until operations staff confirm them; BerthVellum never contacts anyone on your behalf.</p>
      <main className="dk-main">
        <h1>{site.app.title}</h1>
        <div className="dk-grid">
          <aside className="dk-card dk-queue" aria-label="Exception queue and shipments">
            <h2>Exception queue</h2>
            <ul>{[...state.shipments].sort((a, b) => (a.closed ? 1 : 0) - (b.closed ? 1 : 0) || risk(b, today).score - risk(a, today).score).map((s) => { const x = risk(s, today); const inQ = q.some((y) => y.id === s.id); return (
              <li key={s.id}><button className={s.id === sel ? 'on' : ''} onClick={() => { setSel(s.id); setMsg(''); }}>
                <span className={`lvl lvl-${s.closed ? 'closed' : x.level}`}>{s.closed ? 'closed' : x.level}</span>
                <span><b>{s.id}</b> · {s.client}<small>{s.closed ? `Closed by ${s.closed.by}` : inQ ? `${x.score} pts · ${x.reasons[0]?.text}` : 'No follow-up needed'}</small></span>
              </button></li>); })}</ul>
          </aside>

          <section className="dk-card" aria-labelledby="sh-title">
            <p className="eyebrow">{sh.route} · {sh.vessel}</p>
            <h2 id="sh-title">{sh.id} <small>{sh.container}</small></h2>
            <div className="dk-tabs">{[['timeline', 'Timeline'], ['evidence', `Extracted events (${sh.events.length})`], ['docs', 'Documents']].map(([id, t]) => <button key={id} aria-pressed={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{t}</button>)}</div>
            {msg && <p className="dk-err" role="alert">{msg}</p>}

            {tab === 'timeline' && (
              <ol className="vt">{milestones.map((m) => { const d = dateOf(sh, m); const clash = cf.find((c) => c.milestone === m); return (
                <li key={m} className={clash ? 'clash' : d === undefined ? 'todo' : 'ok'}>
                  <b>{m}</b><span>{clash ? clash.events.map((e) => fmt(e.day)).join(' vs ') : d === undefined ? 'not reported' : fmt(d)}</span>
                  {sh.resolved[m] && <small>Reconciled by {sh.resolved[m].by} — “{sh.resolved[m].reason}”</small>}
                </li>); })}</ol>
            )}

            {tab === 'evidence' && (
              <ul className="events">{sh.events.map((e) => (
                <li key={e.id} className={`ev ev-${e.status}`}>
                  <div className="ev-head"><b>{e.milestone}</b><span>{fmt(e.day)}</span><em>{STATUS[e.status]}</em></div>
                  <p className="ev-src">{e.source} · {Math.round(e.confidence * 100)}% confidence</p>
                  <blockquote>{e.quote}</blockquote>
                  {e.status === 'extracted' && (
                    <div className="row">
                      <button className="btn sm" disabled={!allow('verify')} onClick={() => run({type: 'verify', id: sh.id, event: e.id})}>Verify</button>
                      <input aria-label="Corrected day of month" placeholder="Day" className="day" value={fix[`${sh.id}-${e.id}`] ?? ''} onChange={(ev) => setFix({...fix, [`${sh.id}-${e.id}`]: ev.target.value})} disabled={!allow('verify')} />
                      <input aria-label="Reason" placeholder="Reason (to correct or reject)" value={w(e.id)} onChange={(ev) => setW(e.id, ev.target.value)} disabled={!allow('verify')} />
                      <button className="btn ghost sm" disabled={!allow('verify')} onClick={() => run({type: 'correct', id: sh.id, event: e.id, day: fix[`${sh.id}-${e.id}`] ?? '', reason: w(e.id)})}>Correct</button>
                      <button className="btn ghost sm" disabled={!allow('verify')} onClick={() => run({type: 'reject', id: sh.id, event: e.id, reason: w(e.id)})}>Reject</button>
                    </div>
                  )}
                  {e.reason && <p className="ev-why">“{e.reason}” — {e.by}</p>}
                </li>
              ))}</ul>
            )}

            {tab === 'docs' && (
              <ul className="docs">{Object.entries(sh.docs).map(([k, ok]) => <li key={k} className={ok ? 'ok' : 'miss'}><b>{DOCS[k]}</b><span>{ok ? 'Received' : 'Not received'}</span></li>)}</ul>
            )}

            {cf.map((c) => (
              <div key={c.milestone} className="dk-clash">
                <h3>Sources disagree: {c.milestone}</h3>
                <div className="cl-opts">{c.events.map((e) => (
                  <div key={e.id}><p><b>{fmt(e.day)}</b> · {e.source}</p><blockquote>{e.quote}</blockquote>
                    <button className="btn sm" disabled={!allow('resolve')} onClick={() => run({type: 'resolve', id: sh.id, milestone: c.milestone, event: e.id, reason: w(`r-${c.milestone}`)})}>This one is correct</button></div>
                ))}</div>
                <input aria-label="How it was confirmed" placeholder="How did you confirm it? (required)" value={w(`r-${c.milestone}`)} onChange={(ev) => setW(`r-${c.milestone}`, ev.target.value)} disabled={!allow('resolve')} />
                {!allow('resolve') && <p className="dk-fine">Coordinators and the operations lead reconcile conflicts.</p>}
              </div>
            ))}
          </section>

          <aside className="dk-card" aria-label="Delay risk and notes">
            <h2>Delay risk</h2>
            <p className={`risk risk-${r.level}`}><b>{r.score}</b> points · {r.level}</p>
            {r.reasons.length ? <ul className="reasons">{r.reasons.map((x) => <li key={x.text}><span>{x.text}</span><b>+{x.points}</b></li>)}</ul> : <p className="dk-fine">Nothing needs follow-up on this shipment.</p>}
            <p className="dk-fine">Rule-based score. A learning model is added only once enough history exists to test it.</p>
            <h3>Free time</h3>
            <p className="dk-fine">{sh.freeDays} free days at destination{dateOf(sh, 'Discharged') != null && dateOf(sh, 'Discharged') !== undefined ? ` · discharged ${fmt(dateOf(sh, 'Discharged'))}` : ''}</p>
            <h3>Close exception</h3>
            {sh.closed ? <p className="tag">Closed by {sh.closed.by} — “{sh.closed.reason}”</p> : (
              <><input aria-label="What was done" placeholder="What was done? (required)" value={w('close')} onChange={(ev) => setW('close', ev.target.value)} disabled={!allow('close')} />
                <button className="btn sm" disabled={!allow('close')} onClick={() => run({type: 'close', id: sh.id, reason: w('close')})}>Close</button>
                {!allow('close') && <p className="dk-fine">Only the operations lead closes exceptions.</p>}</>
            )}
            <h3>Notes</h3>
            <ul className="notes">{sh.notes.map((n, i) => <li key={i}><b>{n.actor}</b> {n.text}</li>)}{!sh.notes.length && <li className="dk-fine">No notes.</li>}</ul>
            <div className="row"><input aria-label="Add a note" placeholder="Note" value={note} onChange={(ev) => setNote(ev.target.value)} disabled={!allow('note')} /><button className="btn ghost sm" disabled={!allow('note')} onClick={() => run({type: 'note', id: sh.id, text: note}, () => setNote(''))}>Add</button></div>
            <h3>Log</h3>
            <ul className="log">{state.log.slice(0, 8).map((l, i) => <li key={i}><time>{new Date(l.at).toLocaleTimeString()}</time> <b>{l.actor}</b> · {l.id} · {l.summary}</li>)}{!state.log.length && <li className="dk-fine">Verifications, corrections and reconciliations appear here.</li>}</ul>
            {allow('export') && state.log.length > 0 && <button className="btn ghost sm" onClick={() => { const rows = [['time', 'person', 'role', 'shipment', 'change'], ...state.log.map((l) => [l.at, l.actor, l.role, l.id, l.summary])].map((x) => x.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')); const url = URL.createObjectURL(new Blob([rows.join('\n')], {type: 'text/csv'})); const a = document.createElement('a'); a.href = url; a.download = 'berthvellum-log.csv'; a.click(); URL.revokeObjectURL(url); }}>Export log</button>}
          </aside>
        </div>
      </main>
    </div>
  );
}

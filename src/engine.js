// Shipment desk rules: a timeline per shipment built from extracted events, conflicts where sources disagree,
// a delay-risk score with readable reasons, and an exception queue that staff work and close.

export const can = (roles, roleId, perm) => !!roles.find((r) => r.id === roleId)?.can.includes(perm);

const live = (e) => e.status !== 'rejected' && e.status !== 'superseded';

/** Milestones reported with different dates (or one dated and one undated) by different sources. */
export function conflicts(sh) {
  const by = {};
  for (const e of sh.events.filter(live)) (by[e.milestone] ||= []).push(e);
  return Object.entries(by).filter(([m, list]) => !sh.resolved[m] && new Set(list.map((e) => e.day)).size > 1).map(([milestone, list]) => ({milestone, events: list}));
}

/** The best-known date for a milestone: a resolved choice, else a verified event, else the most confident extraction. */
export function dateOf(sh, milestone) {
  const list = sh.events.filter((e) => live(e) && e.milestone === milestone);
  if (!list.length) return undefined;
  const chosen = sh.resolved[milestone] && list.find((e) => e.id === sh.resolved[milestone].event);
  if (chosen) return chosen.day;
  const verified = list.find((e) => e.status === 'verified' || e.status === 'corrected');
  return (verified || [...list].sort((a, b) => b.confidence - a.confidence)[0]).day;
}

const MISSING = {bl: 'Bill of lading', invoice: 'Commercial invoice', packing: 'Packing list', form_m: 'Form M'};

/** Delay risk from rules that operations teams recognise. Each reason carries its points so the score is explainable. */
export function risk(sh, today) {
  const reasons = [];
  const add = (points, text) => reasons.push({points, text});
  for (const c of conflicts(sh)) add(30, `Sources disagree on “${c.milestone}”`);
  const discharged = dateOf(sh, 'Discharged');
  const released = dateOf(sh, 'Customs released');
  if (discharged != null && discharged !== undefined && released == null) {
    const left = sh.freeDays - (today - discharged);
    if (left < 0) add(45, `In demurrage for ${-left} day${left === -1 ? '' : 's'}`);
    else if (left <= 2) add(35, `Free time ends in ${left} day${left === 1 ? '' : 's'}`);
  }
  const atPort = dateOf(sh, 'Berthed') != null || discharged != null;
  for (const [k, ok] of Object.entries(sh.docs)) if (!ok) add(k === 'bl' && atPort ? 25 : 10, `${MISSING[k]} not received${k === 'bl' && atPort ? ' — cargo is already at port' : ''}`);
  const ts = sh.events.filter((e) => live(e) && e.milestone === 'Transshipped');
  if (ts.length && ts.every((e) => e.day == null)) add(20, 'Transshipment not confirmed');
  const shaky = sh.events.filter((e) => live(e) && e.status === 'extracted' && e.confidence < 0.8).length;
  if (shaky) add(5 * shaky, `${shaky} low-confidence update${shaky > 1 ? 's' : ''} not yet verified`);
  const score = reasons.reduce((s, r) => s + r.points, 0);
  return {score, level: score >= 50 ? 'high' : score >= 25 ? 'medium' : 'low', reasons: reasons.sort((a, b) => b.points - a.points)};
}

export function queue(shipments, today) {
  return shipments.filter((s) => !s.closed).map((s) => ({id: s.id, ...risk(s, today)})).filter((x) => x.score >= 25).sort((a, b) => b.score - a.score);
}

export function initial(shipments, roles) {
  return {shipments: structuredClone(shipments), log: [], role: roles[0].id};
}

const now = () => new Date().toISOString();

export function act(state, a, {roles, actor, milestones}) {
  const fail = (error) => ({state, ok: false, error});
  if (a.type === 'role') return {state: {...state, role: a.role}, ok: true};
  const sh = state.shipments.find((s) => s.id === a.id);
  if (!sh) return fail('Shipment not found.');
  const allow = (p) => can(roles, state.role, p);
  const reason = (a.reason || '').trim();
  const put = (next, summary) => ({ok: true, state: {...state, shipments: state.shipments.map((s) => (s.id === sh.id ? next : s)), log: [{at: now(), actor, role: state.role, id: sh.id, summary}, ...state.log]}});
  const setEvent = (evId, patch) => ({...sh, events: sh.events.map((e) => (e.id === evId ? {...e, ...patch} : e))});
  const evt = a.event && sh.events.find((e) => e.id === a.event);

  switch (a.type) {
    case 'verify':
      if (!allow('verify')) return fail('Your role cannot verify events.');
      if (!evt) return fail('Event not found.');
      return put(setEvent(evt.id, {status: 'verified', by: actor}), `Verified “${evt.milestone}” from ${evt.source}`);
    case 'correct': {
      if (!allow('verify')) return fail('Your role cannot correct events.');
      if (!evt) return fail('Event not found.');
      const day = a.day === '' || a.day == null ? null : Number(a.day);
      if (day !== null && !Number.isInteger(day)) return fail('Enter the day of the month, or leave it blank if no date is known.');
      if (reason.length < 8) return fail('Say why the extracted date is wrong (at least 8 characters).');
      return put(setEvent(evt.id, {status: 'corrected', day, by: actor, reason}), `Corrected “${evt.milestone}” to ${day == null ? 'no date' : `day ${day}`} — “${reason}”`);
    }
    case 'reject':
      if (!allow('verify')) return fail('Your role cannot reject events.');
      if (!evt) return fail('Event not found.');
      if (reason.length < 8) return fail('Say why this update should be ignored (at least 8 characters).');
      return put(setEvent(evt.id, {status: 'rejected', by: actor, reason}), `Rejected “${evt.milestone}” from ${evt.source} — “${reason}”`);
    case 'resolve': {
      if (!allow('resolve')) return fail('Only coordinators and the operations lead reconcile conflicting updates.');
      if (!milestones.includes(a.milestone) || !evt) return fail('Choose which update is correct.');
      if (reason.length < 8) return fail('Record how you confirmed it (at least 8 characters) — for example, a call with the agent.');
      const next = {...sh, resolved: {...sh.resolved, [a.milestone]: {event: evt.id, by: actor, reason}},
        events: sh.events.map((e) => (e.milestone === a.milestone && live(e) && e.id !== evt.id ? {...e, status: 'superseded'} : e.id === evt.id ? {...e, status: 'verified', by: actor} : e))};
      return put(next, `Reconciled “${a.milestone}”: kept ${evt.source} — “${reason}”`);
    }
    case 'close':
      if (!allow('close')) return fail('Only the operations lead closes exceptions.');
      if (reason.length < 8) return fail('Record what was done (at least 8 characters).');
      return put({...sh, closed: {by: actor, reason}}, `Closed exception — “${reason}”`);
    case 'note': {
      if (!allow('note')) return fail('Your role cannot add notes.');
      const text = (a.text || '').trim();
      if (text.length < 3) return fail('Write a note first.');
      return put({...sh, notes: [...sh.notes, {at: now(), actor, text}]}, 'Added a note');
    }
    default:
      return fail('Unknown action.');
  }
}

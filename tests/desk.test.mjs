import test from 'node:test';
import assert from 'node:assert/strict';
import site from '../src/content.js';
import {milestones, roles, shipments, today} from '../src/data.js';
import {act, conflicts, dateOf, initial, queue, risk} from '../src/engine.js';

const ctx = {roles, actor: 'Test Coordinator', milestones};
const as = (s, role) => act(s, {type: 'role', role}, ctx).state;
const by = (st, id) => st.shipments.find((s) => s.id === id);

test('conflicts are found where sources disagree, including dated vs undated', () => {
  assert.deepEqual(conflicts(shipments.find((s) => s.id === 'BV-2041')).map((c) => c.milestone), ['ETA destination']);
  assert.deepEqual(conflicts(shipments.find((s) => s.id === 'BV-2043')).map((c) => c.milestone), ['Customs released']);
  assert.equal(conflicts(shipments.find((s) => s.id === 'BV-2044')).length, 0);
});

test('risk reasons explain the score and the queue is ordered by urgency', () => {
  const q = queue(shipments, today);
  assert.equal(q[0].id, 'BV-2045');
  for (const x of q) assert.equal(x.score, x.reasons.reduce((s, r) => s + r.points, 0));
  assert.ok(risk(shipments.find((s) => s.id === 'BV-2045'), today).reasons.some((r) => /Free time/.test(r.text)));
  assert.ok(!q.some((x) => x.id === 'BV-2044'));
});

test('reconciling keeps the chosen source, supersedes the other and needs a reason', () => {
  let s = as(initial(shipments, roles), 'customs');
  assert.equal(act(s, {type: 'resolve', id: 'BV-2041', milestone: 'ETA destination', event: 'e4', reason: 'Called the agent'}, ctx).ok, false);
  s = as(s, 'coordinator');
  assert.equal(act(s, {type: 'resolve', id: 'BV-2041', milestone: 'ETA destination', event: 'e4', reason: 'ok'}, ctx).ok, false);
  s = act(s, {type: 'resolve', id: 'BV-2041', milestone: 'ETA destination', event: 'e4', reason: 'Called the agent to confirm'}, ctx).state;
  assert.equal(dateOf(by(s, 'BV-2041'), 'ETA destination'), 18);
  assert.equal(conflicts(by(s, 'BV-2041')).length, 0);
  assert.equal(by(s, 'BV-2041').events.find((e) => e.id === 'e3').status, 'superseded');
  assert.ok(risk(by(s, 'BV-2041'), today).score < risk(shipments.find((x) => x.id === 'BV-2041'), today).score);
});

test('verification, corrections and closing respect roles; nothing changes for viewers', () => {
  let s = as(initial(shipments, roles), 'client');
  assert.equal(act(s, {type: 'verify', id: 'BV-2043', event: 'e2'}, ctx).ok, false);
  s = as(s, 'customs');
  s = act(s, {type: 'verify', id: 'BV-2043', event: 'e2'}, ctx).state;
  assert.equal(by(s, 'BV-2043').events.find((e) => e.id === 'e2').status, 'verified');
  assert.equal(act(s, {type: 'correct', id: 'BV-2046', event: 'e2', day: 'x', reason: 'Agent confirmed loading'}, ctx).ok, false);
  assert.equal(act(s, {type: 'close', id: 'BV-2045', reason: 'BL chased, release booked'}, ctx).ok, false);
  s = as(s, 'lead');
  const r = act(s, {type: 'close', id: 'BV-2045', reason: 'BL chased, release booked'}, ctx);
  assert.equal(r.ok, true); assert.ok(!queue(r.state.shipments, today).some((x) => x.id === 'BV-2045'));
  assert.equal(r.state.log.length, 2);
});

test('credits the founders', () => {
  assert.deepEqual(site.team.map((p) => [p.name, p.role]), [['Chukwudi Okeke', 'Founder/CEO'], ['Yetunde Balogun', 'Co-founder']]);
});

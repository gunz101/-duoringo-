// Unit tests for the pure part of src/store.js:  node tools/test-store.js
'use strict';
const St = require('../src/store.js');
let pass = 0, fail = 0;
function ok(cond, name) { if (cond) pass++; else { fail++; console.log('✗ ' + name); } }

// sanitize drops unknown fields and wrong types
const dirty = { pts: { '01-1-a': { s: true, w: 'yes', note: 'nota', evil: '<script>' }, '../x': { s: true } }, chk: { '01-1': [true, 1, false] }, hw: { '01-1': { done: true }, '01-2': { done: 'true' } }, notes: { '01-1': 'caderno', 'x y': 'bad' }, rot: { rev_0: true, 'rev_9': true, hack_1: 'x' }, last: '01-1', __proto__: { polluted: true }, extra: 1 };
const s = St.sanitize(dirty);
ok(s.pts['01-1-a'].s === true && !s.pts['01-1-a'].w && s.pts['01-1-a'].note === 'nota' && !('evil' in s.pts['01-1-a']), 'pts sanitized');
ok(!s.pts['../x'], 'bad id rejected');
ok(JSON.stringify(s.chk['01-1']) === '[true,false,false]', 'chk coerced to strict booleans');
ok(s.hw['01-1'] && !s.hw['01-2'], 'hw only true');
ok(s.notes['01-1'] === 'caderno' && !s.notes['x y'], 'notes sanitized');
ok(s.rot.rev_0 && !s.rot.rev_9 && !s.rot.hack_1, 'rot keys validated');
ok(!('extra' in s) && !({}).polluted, 'no extra keys / no prototype pollution');

// merge is monotonic and keeps both texts
const A = { pts: { a: { s: true } }, chk: { '01-1': [true, false, true] }, notes: { '01-1': 'minha nota' }, rot: { rev_0: true }, _ts: 100, last: '01-1' };
const B = { pts: { a: { w: true }, b: { s: true, note: 'nova' } }, chk: { '01-1': [false, true], '02-1': [true] }, hw: { '02-1': { done: true } }, notes: { '01-1': 'outra nota' }, _ts: 200, last: '02-1' };
const M = St.merge(A, B);
ok(M.pts.a.s && M.pts.a.w && M.pts.b.s && M.pts.b.note === 'nova', 'merge pts union');
ok(JSON.stringify(M.chk['01-1']) === '[true,true,true]' && M.chk['02-1'][0], 'merge chk OR');
ok(M.hw['02-1'] && M.rot.rev_0, 'merge hw/rot union');
ok(M.notes['01-1'].indexOf('outra nota') === 0 && M.notes['01-1'].indexOf('minha nota') > 0, 'merge keeps both notes (newer first)');
ok(M.last === '02-1' && M._ts === 200, 'merge takes newer last/_ts');
ok(JSON.stringify(St.sanitize(St.merge(M, M))) === JSON.stringify(St.sanitize(M)), 'merge idempotent');
ok(JSON.stringify(St.flatten(St.merge(St.merge(A, B), B))) === JSON.stringify(St.flatten(St.merge(A, B))), 'merge converges (no duplicated notes)');

// last-change-wins with tombstones (stamp detects set AND cleared fields)
{
  const dev1 = St.sanitize({ chk: { '01-1': [true, true] }, rot: { rev_0: true } });
  let prev = {}; prev = St.stamp(dev1, prev, 100);                 // device 1 marks at t=100
  const dev2 = JSON.parse(JSON.stringify(dev1));                     // device 2 syncs the same state…
  let prev2 = St.flatten(dev2);
  dev2.chk['01-1'][1] = false; delete dev2.rot.rev_0;                // …then UN-checks at t=200
  St.stamp(dev2, prev2, 200);
  const m = St.merge(dev1, dev2);
  ok(m.chk['01-1'][0] === true && !m.chk['01-1'][1], 'newer un-check wins over older check');
  ok(!m.rot.rev_0, 'newer week reset propagates (tombstone)');
  const m2 = St.merge(dev2, dev1);
  ok(JSON.stringify(St.flatten(m2)) === JSON.stringify(St.flatten(m)), 'merge is order-independent');
  dev1.chk['01-1'][1] = true; St.stamp(dev1, St.flatten(St.sanitize({ chk: { '01-1': [true, false] } })), 300);   // device 1 re-checks later
  ok(St.merge(dev1, dev2).chk['01-1'][1] === true, 'an even newer check wins again');
  const n1 = St.sanitize({ notes: { '01-1': 'versão A' } }); St.stamp(n1, {}, 10);
  const n2 = St.sanitize({ notes: { '01-1': 'versão B' } }); St.stamp(n2, {}, 20);
  const mn = St.merge(n1, n2).notes['01-1'];
  ok(mn.indexOf('versão B') === 0 && mn.indexOf('versão A') > 0, 'concurrent note edits: both kept, newer first');
}

// pack / unpack with checksum
const txt = St.pack(M, 123);
ok(JSON.stringify(St.unpack(txt)) === JSON.stringify(St.sanitize(M)), 'pack/unpack roundtrip');
const tampered = JSON.parse(txt); tampered.state.chk['01-1'][0] = false;
let threw = false; try { St.unpack(JSON.stringify(tampered)); } catch (e) { threw = /soma de verificação/.test(e.message); }
ok(threw, 'tampered backup rejected');
threw = false; try { St.unpack('{"app":"outro","state":{}}'); } catch (e) { threw = true; } ok(threw, 'foreign file rejected');
threw = false; try { St.unpack('não é json'); } catch (e) { threw = true; } ok(threw, 'non-JSON rejected');
ok(St.unpack(JSON.stringify({ app: 'curso-japones', version: '1.0.0', state: { chk: { '01-1': [true] } } })).chk['01-1'][0], 'legacy backup (v1, no hash) accepted');

// stats
const st = St.stats(M, [{ id: '01-1', n: 3 }, { id: '02-1', n: 2 }]);
ok(st.mastered === 1 && st.studied === 2 && st.practiced === 1, 'stats');

console.log(`store tests: ${pass} ok, ${fail} falharam`);
process.exit(fail ? 1 : 0);

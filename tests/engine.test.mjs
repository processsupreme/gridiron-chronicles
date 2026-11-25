// Regression + sanity tests for the stats engine.  Run:  node tests/engine.test.mjs
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { buildLeague, series, playoffRace, weekAwards, slug } from '../js/league.js';

const require = createRequire(import.meta.url);
const { makeFixture } = require('../tools/make-fixture.js');
const data = JSON.parse(fs.readFileSync(new URL('../data/league_data.json', import.meta.url)));
const base = JSON.parse(fs.readFileSync(new URL('./baseline.json', import.meta.url)));
// The baseline describes the 2014–2025 archive; later seasons are excluded here.
const archive = data.seasons.filter(s => s.season <= 2025);

let failed = 0, passed = 0;
const eq = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) passed++; else { failed++; console.log('FAIL ' + label + '\n   got  ' + JSON.stringify(got) + '\n   want ' + JSON.stringify(want)); }
};
const ok = (label, cond, detail = '') => { if (cond) passed++; else { failed++; console.log('FAIL ' + label + ' ' + detail); } };

// ── 1. Careers match the audited baseline ──
const L = buildLeague(archive);
for (const [nick, b] of Object.entries(base.mgrs)) {
  const c = L.career(slug(nick));
  ok(nick + ' exists', !!c); if (!c) continue;
  eq(nick + ' record', [c.w, c.l, c.t], [b.wins, b.losses, b.ties]);
  eq(nick + ' titles', c.titleYears, b.champYears);
  eq(nick + ' runner-ups', c.runnerUps, b.runnerUp);
  eq(nick + ' playoff apps', c.playoffApps, b.playoffAppearances);
  eq(nick + ' byes', c.byes, b.playoffByes);
  eq(nick + ' 10-win seasons', c.tenWin, b.tenWinSeasons);
  eq(nick + ' playoff wins', c.poW, b.playoffWins);
  eq(nick + ' seasons', c.seasonsPlayed, b.seasons);
  eq(nick + ' team name', c.teamName, b.teamName);
  eq(nick + ' yearly', c.seasons.map(r => [r.year, r.w, r.l, r.t, r.team.rank]), b.yearly.map(y => [y.year, y.w, y.l, y.t, y.rank]));
  ok(nick + ' points for', Math.abs(c.pf - b.pointsFor) < 0.01, c.pf + ' vs ' + b.pointsFor);
  ok(nick + ' points against', Math.abs(c.pa - b.pointsAgainst) < 0.01, c.pa + ' vs ' + b.pointsAgainst);
}

// ── 2. Championship chain + finals match the old backward trace ──
for (const b of base.seasons) {
  const S = L.season(b.year);
  const chain = S.games.filter(g => g.kind === 'playoff').map(g => g.id.replace(/^\d+:/, '').replace('|', ':')).sort();
  eq(b.year + ' chain games', chain, [...b.chain].sort());
  eq(b.year + ' champion', S.champion && S.champion.name, b.champ);
  eq(b.year + ' final score', S.finalScore && [S.finalScore.champ, S.finalScore.runner], [b.fin.cs, b.fin.rs]);
  eq(b.year + ' runner-up', S.runnerUp && S.runnerUp.name, b.fin.ru);
  ok(b.year + ' 5 chain games', chain.length === 5, 'got ' + chain.length);
  ok(b.year + ' two byes', [...S.teams.values()].filter(t => t.bye).length === 2);
}

// ── 3. Game-derived season lines agree with Yahoo's own standings ──
L.seasons.forEach(S => S.teams.forEach(T => {
  eq(S.year + ' ' + T.name + ' reg record', [T.reg.w, T.reg.l, T.reg.t], [T.yahoo.w, T.yahoo.l, T.yahoo.t]);
  ok(S.year + ' ' + T.name + ' reg PF', Math.abs(T.reg.pf - T.yahoo.pf) < 0.05, T.reg.pf + ' vs ' + T.yahoo.pf);
}));

// ── 4. Internal consistency ──
const totW = L.franchises.reduce((n, c) => n + c.allPlay.w, 0), totL = L.franchises.reduce((n, c) => n + c.allPlay.l, 0);
ok('no ghost duplicates', L.seasons.every(S => new Set(S.games.map(g => g.id)).size === S.games.length));
ok('every season has 13 or 14 reg weeks', L.seasons.every(S => S.poStart - 1 === Math.max(...S.games.filter(g => g.kind === 'reg').map(g => g.week))));
L.franchises.forEach(a => L.franchises.forEach(b => {
  if (a.fid >= b.fid) return;
  const ab = series(L, a.fid, b.fid), ba = series(L, b.fid, a.fid);
  eq('series symmetric ' + a.fid + '/' + b.fid, [ab.w, ab.l, ab.t], [ba.l, ba.w, ba.t]);
}));
ok('luck sums to ~0 across a full league season',
  L.seasons.every(S => Math.abs([...S.teams.values()].reduce((n, t) => n + t.luck, 0)) < 1e-6));
ok('era filter narrows', buildLeague(archive, { from: 2021 }).seasons.length === 5);
ok('era filter keeps identity', buildLeague(archive, { from: 2025, to: 2025 }).career('lvc').titles === 1);

// ── 5. A live season layered on top ──
for (const [week, phase] of [[1, 'pre'], [6, 'mid'], [12, 'mid'], [14, 'post'], [15, 'mid'], [16, 'post'], [17, 'mid'], [18, 'final']]) {
  const fx = makeFixture({ week, phase, source: { seasons: archive } });
  const LL = buildLeague([...archive, fx.season]);
  const S = LL.season(2026), tag = 'live wk' + week + '/' + phase + ': ';
  ok(tag + 'season present', !!S);
  ok(tag + 'archive titles untouched until a champion exists', LL.career('lvc').titles === (week >= 18 ? 6 : 5), 'titles ' + LL.career('lvc').titles);
  ok(tag + 'no playoff credit before the regular season ends', week >= 15 || [...S.teams.values()].every(t => !t.madePlayoffs));
  ok(tag + 'unplayed games do not count', S.games.filter(g => !g.played).every(g => !g.counts));
  const lvc = LL.career('lvc'), before = L.career('lvc');
  const played = S.games.filter(g => g.counts && (g.a.fid === 'lvc' || g.b.fid === 'lvc')).length;
  eq(tag + 'career games grow by played games only', lvc.g, before.g + played);
  if (!S.regDone) {
    const race = playoffRace(S);
    ok(tag + 'race rows', race.rows.length === 12);
    ok(tag + 'clinched and eliminated are disjoint', race.rows.every(r => !(r.clinched && r.eliminated)));
  }
  if (week >= 18) {
    eq(tag + 'replayed champion', S.champion && S.champion.name, 'LVC');
    ok(tag + 'complete', S.complete && !LL.current);
    eq(tag + 'replayed chain', S.games.filter(g => g.kind === 'playoff').length, 5);
  } else ok(tag + 'is the current season', LL.current === S && !S.complete);
  if (S.lastPlayedWeek) ok(tag + 'week awards', !!weekAwards(S, S.lastPlayedWeek).high);
}

console.log((failed ? 'FAILED ' : 'ok ') + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);

// ── THE LEDGER'S VOICE ──────────────────────────────────────
// Turns the engine's numbers into sentences: what is happening this week and
// what it means against every season on record. Pure functions returning plain
// text (the views escape and place it). Nothing here is hardcoded to a team —
// every line is derived, so it stays true as the league changes.

import { series, playoffRace, weekAwards, ordinal, CLOSE_MARGIN } from './league.js';

const pts = n => n.toFixed(n % 1 === 0 ? 1 : 2).replace(/(\.\d)0$/, '$1');
const rec = (w, l, t) => w + '–' + l + (t ? '–' + t : '');
const TAGGED = /^(.{12,}?)\s*\(([A-Z]{2,6})\)\s*$/; // a long name carrying its own abbreviation
export const shortName = name => { const m = String(name).match(TAGGED); return m ? m[2] : String(name); };
/** Full name minus a trailing parenthetical: "Make Joco Great Again (MJGA)" → "Make Joco Great Again". */
export const cleanName = name => { const m = String(name).match(TAGGED); return m ? m[1] : String(name); };
const nameOf = (L, fid, fallback) => { const c = fid && L.career(fid); return c ? shortName(c.teamName) : shortName(fallback || ''); };
const plural = (n, word) => n + ' ' + word + (n === 1 ? '' : 's');

/** Rank of a score among every counted score in league history (1 = highest). */
export const scoreRank = (L, p) => 1 + L.scores.filter(s => s.pts > p).length;
export const marginRank = (L, m) => 1 + L.margins.filter(x => x.margin > m).length;

const before = (m, g) => m.year < g.year || (m.year === g.year && m.week < g.week);

/** What history says about one matchup. Returns { line, more[] }. */
export function matchupNotes(L, g) {
  const A = g.a, B = g.b;
  if (!A.fid || !B.fid) return { line: '', more: [] };
  const s = series(L, A.fid, B.fid);
  const prior = s.counted.filter(m => before(m, g));
  const an = nameOf(L, A.fid, A.name), bn = nameOf(L, B.fid, B.name);
  if (!prior.length) return { line: 'First meeting that counts between these two.', more: [] };

  let w = 0, l = 0, t = 0;
  prior.forEach(m => { if (m.res === 'W') w++; else if (m.res === 'L') l++; else t++; });
  const line = w === l
    ? 'All-time series is level at ' + rec(w, l, t) + '.'
    : (w > l ? an : bn) + ' leads the all-time series ' + rec(Math.max(w, l), Math.min(w, l), t) + '.';

  const more = [];
  const last = prior[prior.length - 1];
  let run = 0;
  for (let i = prior.length - 1; i >= 0 && prior[i].res === last.res; i--) run++;
  if (run >= 2 && last.res !== 'T') more.push((last.res === 'W' ? an : bn) + ' has won the last ' + run + '.');
  else if (last.res !== 'T') {
    more.push('Last time: ' + (last.res === 'W' ? an : bn) + ' won ' + pts(Math.max(last.me.pts, last.opp.pts)) + '–' + pts(Math.min(last.me.pts, last.opp.pts)) + ' in Week ' + last.week + ', ' + last.year + '.');
  }
  const po = prior.filter(m => m.kind === 'playoff');
  if (g.kind === 'playoff') {
    if (!po.length) more.push('They have never met in the playoffs.');
    else {
      const pw = po.filter(m => m.res === 'W').length, pl = po.length - pw;
      more.push(ordinal(po.length + 1) + ' playoff meeting. ' + (pw === pl ? 'Split ' + pw + '–' + pl : (pw > pl ? an : bn) + ' leads ' + Math.max(pw, pl) + '–' + Math.min(pw, pl)) + ' in those.');
    }
  }
  return { line, more };
}

/** Longest regular-season streaks on record, for comparison. */
function streakRecords(L) {
  let win = { len: 0 }, loss = { len: 0 };
  L.franchises.forEach(c => {
    if (c.bestWinStreak.len > win.len) win = { ...c.bestWinStreak, fid: c.fid };
    if (c.bestLossStreak.len > loss.len) loss = { ...c.bestLossStreak, fid: c.fid };
  });
  return { win, loss };
}

const trailing = form => {
  if (!form.length) return { res: null, len: 0 };
  const res = form[form.length - 1];
  let len = 0;
  for (let i = form.length - 1; i >= 0 && form[i] === res; i--) len++;
  return { res, len };
};
export const currentStreak = T => trailing(T.form);

/** Storylines for a season in progress, most newsworthy first. */
export function seasonStorylines(L, S) {
  const out = [];
  const add = (weight, tone, text, href) => out.push({ weight, tone, text, href: href || null });
  const teams = [...S.teams.values()].filter(t => t.reg.g > 0);
  if (!teams.length) return out;
  const n = Math.max(...teams.map(t => t.reg.g));
  const regWeeks = S.poStart - S.startWeek;
  const priorLines = L.seasonLines.filter(x => x.year < S.year && x.team.reg.g > 0);
  const link = t => (t.fid ? '#/franchise/' + t.fid : null);

  // 1. Streaks against the record book.
  const sr = streakRecords(L);
  teams.forEach(t => {
    const st = currentStreak(t);
    if (st.res === 'W' && st.len >= 4) {
      const ties = st.len >= sr.win.len;
      add(40 + st.len * 4 + (ties ? 30 : 0), ties ? 'gold' : 'hot',
        shortName(t.name) + ' has won ' + st.len + ' straight. ' + (ties
          ? 'That ' + (st.len > sr.win.len ? 'breaks' : 'matches') + ' the longest regular-season win streak on record.'
          : 'The record is ' + sr.win.len + ' (' + nameOf(L, sr.win.fid) + ', ' + sr.win.year + ').'), link(t));
    }
    if (st.res === 'L' && st.len >= 4) {
      const ties = st.len >= sr.loss.len;
      add(34 + st.len * 4 + (ties ? 30 : 0), 'cold',
        shortName(t.name) + ' has lost ' + st.len + ' in a row. ' + (ties
          ? 'That ' + (st.len > sr.loss.len ? 'is a new' : 'ties the') + ' league record.'
          : 'The record skid is ' + sr.loss.len + ' (' + nameOf(L, sr.loss.fid) + ', ' + sr.loss.year + ').'), link(t));
    }
  });

  // 2. Best and worst starts in franchise history (through the same number of games).
  if (n >= 4) {
    teams.forEach(t => {
      if (!t.fid || t.reg.g < n) return;
      const c = L.career(t.fid);
      const past = c.seasons.filter(r => r.year < S.year && r.team.form.length >= n);
      if (past.length < 3) return;
      const winsThrough = r => r.team.form.slice(0, n).filter(x => x === 'W').length;
      const mine = t.form.slice(0, n).filter(x => x === 'W').length;
      const best = Math.max(...past.map(winsThrough)), worst = Math.min(...past.map(winsThrough));
      const record = rec(t.reg.w, t.reg.l, t.reg.t);
      if (mine > best) add(52 + mine, 'hot', shortName(t.name) + ' is ' + record + ', the best start through ' + n + ' games in ' + plural(past.length + 1, 'season') + ' as a franchise.', link(t));
      else if (mine < worst) add(44 + (n - mine), 'cold', shortName(t.name) + ' is ' + record + ', its worst start through ' + n + ' games in ' + plural(past.length + 1, 'season') + '.', link(t));
    });
  }

  // 3. Scoring pace against the single-season record.
  const topSeason = priorLines.filter(x => x.regDone).sort((a, b) => b.team.reg.pf - a.team.reg.pf)[0];
  if (topSeason && n >= 5 && !S.regDone) {
    const pacer = [...teams].sort((a, b) => b.reg.pf / b.reg.g - a.reg.pf / a.reg.g)[0];
    const pace = pacer.reg.pf / pacer.reg.g * regWeeks;
    if (pace >= topSeason.team.reg.pf * 0.97) {
      const over = pace > topSeason.team.reg.pf;
      add(over ? 70 : 46, over ? 'gold' : 'hot',
        shortName(pacer.name) + ' is on pace for ' + Math.round(pace).toLocaleString() + ' points. The regular-season record is ' +
        topSeason.team.reg.pf.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' (' + shortName(topSeason.team.name) + ', ' + topSeason.year + ').', link(pacer));
    }
  }

  // 4. This season's scores and blowouts that crack the all-time lists.
  const seasonScores = L.scores.filter(s => s.year === S.year);
  if (seasonScores.length) {
    const top = seasonScores[0], r = scoreRank(L, top.pts);
    if (r <= 25) {
      add(r === 1 ? 95 : 60 - r, r <= 3 ? 'gold' : 'plain',
        shortName(top.name) + ' put up ' + pts(top.pts) + ' in Week ' + top.week + ', ' + (r === 1 ? 'the highest score in league history.' : 'the ' + ordinal(r) + '-highest score in league history.'),
        '#/records/scores');
    }
  }
  const seasonMargins = L.margins.filter(m => m.year === S.year);
  if (seasonMargins.length) {
    const top = seasonMargins[0], r = marginRank(L, top.margin);
    if (r <= 10) {
      add(r === 1 ? 90 : 50 - r, r <= 3 ? 'gold' : 'plain',
        shortName(top.w.name) + ' beat ' + shortName(top.l.name) + ' by ' + pts(top.margin) + ' in Week ' + top.week + ', the ' + (r === 1 ? 'biggest' : ordinal(r) + '-biggest') + ' blowout on record.',
        '#/records/blowouts');
    }
  }

  // 5. The playoff race.
  if (!S.regDone && n >= Math.ceil(regWeeks / 2)) {
    const race = playoffRace(S);
    const clinched = race.rows.filter(r => r.clinched), out2 = race.rows.filter(r => r.eliminated);
    if (clinched.length) add(58, 'hot', (clinched.length === 1 ? shortName(clinched[0].team.name) + ' has' : clinched.map(r => shortName(r.team.name)).join(', ') + ' have') + ' clinched a playoff spot.', '#/now/standings');
    if (out2.length) add(40, 'cold', (out2.length === 1 ? shortName(out2[0].team.name) + ' is' : out2.map(r => shortName(r.team.name)).join(', ') + ' are') + ' mathematically out.', '#/now/standings');
    const bubble = race.rows.filter(r => !r.clinched && !r.eliminated && !r.inField && r.gamesBack <= 1);
    if (bubble.length && race.weeksLeft > 0) {
      add(48, 'plain', plural(bubble.length, 'team') + ' within a game of the last playoff spot with ' + plural(race.weeksLeft, 'week') + ' left: ' + bubble.map(r => shortName(r.team.name)).join(', ') + '.', '#/now/standings');
    }
  }

  // 6. Legacy stakes.
  const prev = L.latestComplete;
  if (prev && prev.champion && prev.champion.fid) {
    const champ = teams.find(t => t.fid === prev.champion.fid);
    if (champ) {
      const pos = S.table.indexOf(champ) + 1;
      const c = L.career(champ.fid);
      add(pos <= 2 || pos > S.numPlayoffTeams ? 56 : 44, pos > S.numPlayoffTeams ? 'cold' : 'plain',
        'Defending champion ' + shortName(champ.name) + ' is ' + rec(champ.reg.w, champ.reg.l, champ.reg.t) + ', ' + ordinal(pos) + ' in the standings' +
        (c.titles >= 2 ? ', chasing title number ' + (c.titles + 1) + '.' : '.'), link(champ));
    }
  }
  S.table.slice(0, 2).forEach((t, i) => {
    if (!t.fid || n < 6) return;
    const c = L.career(t.fid);
    if (c.titles === 0 && c.seasonsCompleted >= 3) {
      add(54, 'hot', shortName(t.name) + ' holds the ' + (i + 1) + ' seed. ' + plural(c.seasonsCompleted, 'season') + ', ' +
        (c.runnerUps ? plural(c.runnerUps, 'lost final') : 'no finals') + ', no ring.', link(t));
    }
  });

  // 7. Schedule luck (all-play).
  if (n >= 6) {
    const byLuck = [...teams].sort((a, b) => b.luck - a.luck);
    const lucky = byLuck[0], unlucky = byLuck[byLuck.length - 1];
    const others = (S.teams.size - 1) || 1;
    const apRec = t => rec(t.allPlay.w, t.allPlay.l, t.allPlay.t);
    if (lucky.luck >= 1.5) add(36 + lucky.luck * 4, 'plain', shortName(lucky.name) + ' is ' + rec(lucky.reg.w, lucky.reg.l, lucky.reg.t) + ' but only ' + apRec(lucky) + ' against the whole league each week. The schedule has been worth ' + lucky.luck.toFixed(1) + ' wins.', '#/now/standings');
    if (unlucky.luck <= -1.5) add(36 - unlucky.luck * 4, 'plain', shortName(unlucky.name) + ' is ' + rec(unlucky.reg.w, unlucky.reg.l, unlucky.reg.t) + ' despite going ' + apRec(unlucky) + ' against the field. The schedule has cost ' + Math.abs(unlucky.luck).toFixed(1) + ' wins.', '#/now/standings');
  }

  return out.sort((a, b) => b.weight - a.weight);
}

/** Storylines when no season is in progress: the state of the league. */
export function archiveStorylines(L) {
  const out = [];
  const S = L.latestComplete;
  if (!S) return out;
  const fr = L.franchises;
  const add = (tone, text, href) => out.push({ tone, text, href: href || null });

  if (S.champion) {
    const c = S.champion.fid && L.career(S.champion.fid);
    const backToBack = c && c.titleYears.includes(S.year - 1);
    add('gold', shortName(S.champion.name) + ' won the ' + S.year + ' title' + (S.finalScore && S.runnerUp ? ', beating ' + shortName(S.runnerUp.name) + ' ' + pts(S.finalScore.champ) + '–' + pts(S.finalScore.runner) : '') + '.' +
      (c && c.titles > 1 ? ' That is ' + plural(c.titles, 'championship') + (backToBack ? ', and two in a row.' : '.') : ''), '#/season/' + S.year);
  }
  const byTitles = [...fr].sort((a, b) => b.titles - a.titles || b.winPct - a.winPct);
  if (byTitles[0] && byTitles[0].titles >= 2) {
    const d = byTitles[0], others = fr.reduce((n, c) => n + c.titles, 0) - d.titles;
    add('plain', shortName(d.teamName) + ' owns ' + d.titles + ' of the ' + (others + d.titles) + ' titles won by current franchises, with a ' + (d.winPct * 100).toFixed(1) + '% win rate.', '#/franchise/' + d.fid);
  }
  const ringless = fr.filter(c => c.titles === 0).sort((a, b) => b.runnerUps - a.runnerUps || b.seasonsCompleted - a.seasonsCompleted);
  if (ringless[0]) {
    const c = ringless[0];
    add('cold', shortName(c.teamName) + ' is still waiting: ' + plural(c.seasonsCompleted, 'season') + ', ' + plural(c.runnerUps, 'lost final') + ', no ring. ' +
      (ringless.length > 1 ? plural(ringless.length, 'franchise') + ' have never won it.' : ''), '#/records/droughts');
  }
  const newMarks = L.scores.slice(0, 10).filter(s => s.year === S.year).length + L.margins.slice(0, 10).filter(m => m.year === S.year).length;
  if (newMarks) add('hot', 'The ' + S.year + ' season put ' + plural(newMarks, 'entry') .replace('entrys', 'entries') + ' into the all-time top 10 for scores and blowouts.', '#/records');
  return out;
}

/** One completed week, with each award placed in history. */
export function weekRecap(L, S, week) {
  const aw = weekAwards(S, week);
  if (!aw) return [];
  const out = [];
  const rankNote = p => { const r = scoreRank(L, p); return r <= 25 ? ' That is the ' + (r === 1 ? 'highest' : ordinal(r) + '-highest') + ' score on record.' : ''; };
  out.push({ label: 'High score', value: pts(aw.high.me.pts), text: shortName(aw.high.me.name) + '.' + (aw.high.g.counts ? rankNote(aw.high.me.pts) : '') });
  out.push({ label: 'Low score', value: pts(aw.low.me.pts), text: shortName(aw.low.me.name) + '.' });
  if (aw.blowout) out.push({ label: 'Biggest win', value: '+' + pts(aw.blowout.margin), text: shortName(aw.blowout.w.name) + ' over ' + shortName(aw.blowout.l.name) + '.' });
  if (aw.nailbiter && aw.nailbiter !== aw.blowout) out.push({ label: 'Closest game', value: pts(aw.nailbiter.margin), text: shortName(aw.nailbiter.w.name) + ' edged ' + shortName(aw.nailbiter.l.name) + '.' });
  if (aw.badBeat) out.push({ label: 'Bad beat', value: pts(aw.badBeat.me.pts), text: shortName(aw.badBeat.me.name) + ' had the ' + ordinal(aw.badBeat.rank) + '-best score of the week and lost.' });
  if (aw.luckyWin) out.push({ label: 'Got away with it', value: pts(aw.luckyWin.me.pts), text: shortName(aw.luckyWin.me.name) + ' won with the ' + ordinal(aw.luckyWin.rank) + '-best score of ' + aw.games.length * 2 + '.' });
  return out;
}

/** Notes for a franchise page. */
export function franchiseNotes(L, fid) {
  const c = L.career(fid);
  const out = [];
  if (!c) return out;
  const rows = L.franchises.filter(o => o.fid !== fid).map(o => ({ o, s: series(L, fid, o.fid) })).filter(x => x.s.g >= 5);
  const pct = s => (s.w + s.t / 2) / s.g;
  if (rows.length) {
    const best = [...rows].sort((a, b) => pct(b.s) - pct(a.s) || b.s.g - a.s.g)[0];
    const worst = [...rows].sort((a, b) => pct(a.s) - pct(b.s) || b.s.g - a.s.g)[0];
    if (pct(best.s) > 0.5) out.push({ label: 'Owns', text: shortName(best.o.teamName) + ', ' + rec(best.s.w, best.s.l, best.s.t) + ' all-time.', href: '#/versus/' + fid + '/' + best.o.fid });
    if (pct(worst.s) < 0.5) out.push({ label: 'Nemesis', text: shortName(worst.o.teamName) + ', ' + rec(worst.s.w, worst.s.l, worst.s.t) + ' all-time.', href: '#/versus/' + fid + '/' + worst.o.fid });
  }
  const done = c.seasons.filter(r => r.team.reg.g > 0 && (r.complete || r.team.result));
  if (done.length) {
    const score = r => (r.team.champion ? 100 : 0) + r.team.reg.w + r.team.reg.t / 2 + r.team.reg.pf / 10000;
    const best = [...done].sort((a, b) => score(b) - score(a))[0];
    const worst = [...done].sort((a, b) => (a.team.reg.w + a.team.reg.t / 2) - (b.team.reg.w + b.team.reg.t / 2) || a.team.reg.pf - b.team.reg.pf)[0];
    out.push({ label: 'Best season', text: best.year + ': ' + rec(best.team.reg.w, best.team.reg.l, best.team.reg.t) + (best.team.champion ? ', champion.' : best.team.madePlayoffs ? ', made the playoffs.' : '.'), href: '#/season/' + best.year });
    if (worst !== best) out.push({ label: 'Worst season', text: worst.year + ': ' + rec(worst.team.reg.w, worst.team.reg.l, worst.team.reg.t) + '.', href: '#/season/' + worst.year });
  }
  if (c.high) out.push({ label: 'Best game', text: pts(c.high.pts) + ' in Week ' + c.high.week + ', ' + c.high.year + ' (' + ordinal(scoreRank(L, c.high.pts)) + ' all-time).', href: '#/season/' + c.high.year });
  if (Math.abs(c.luck) >= 2) out.push({ label: 'Schedule luck', text: (c.luck > 0 ? 'Has ' + c.luck.toFixed(1) + ' more wins than its scoring earned.' : 'Has ' + Math.abs(c.luck).toFixed(1) + ' fewer wins than its scoring earned.'), href: '#/records/luck' });
  const closeG = c.close.w + c.close.l;
  if (closeG >= 8) out.push({ label: 'Close games', text: rec(c.close.w, c.close.l) + ' in games decided by ' + CLOSE_MARGIN + ' or fewer.', href: '#/records/close' });
  return out;
}

/** Notes for a head-to-head page (from A's side of `series`). */
export function versusNotes(L, s) {
  const an = nameOf(L, s.a), bn = nameOf(L, s.b);
  const out = [];
  if (!s.g) return ['These two have never played a game that counts.'];
  if (s.streak && s.streak.len >= 2 && s.streak.res !== 'T') out.push((s.streak.res === 'W' ? an : bn) + ' has won the last ' + s.streak.len + ' meetings.');
  if (s.last) out.push('Last meeting: Week ' + s.last.week + ', ' + s.last.year + '. ' + (s.last.res === 'T' ? 'A tie' : (s.last.res === 'W' ? an : bn) + ' won') + ', ' + pts(Math.max(s.last.me.pts, s.last.opp.pts)) + '–' + pts(Math.min(s.last.me.pts, s.last.opp.pts)) + '.');
  if (s.poW + s.poL) out.push('In the playoffs: ' + (s.poW === s.poL ? 'split ' + s.poW + '–' + s.poL : (s.poW > s.poL ? an : bn) + ' leads ' + Math.max(s.poW, s.poL) + '–' + Math.min(s.poW, s.poL)) + '.');
  else out.push('They have never met in the playoffs.');
  if (s.biggest.a) out.push(an + '’s biggest win: by ' + pts(s.biggest.a.margin) + ' in Week ' + s.biggest.a.week + ', ' + s.biggest.a.year + '.');
  if (s.biggest.b) out.push(bn + '’s biggest win: by ' + pts(s.biggest.b.margin) + ' in Week ' + s.biggest.b.week + ', ' + s.biggest.b.year + '.');
  const close = s.counted.filter(m => m.res !== 'T' && m.margin <= CLOSE_MARGIN).length;
  if (close >= 2) out.push(close + ' of their ' + s.g + ' games were decided by ' + CLOSE_MARGIN + ' points or fewer.');
  return out;
}

export { pts as fmtPts, rec as fmtRec, plural };

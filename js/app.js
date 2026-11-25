// ── THE BKGFFL LEDGER · app shell, router, and views ────────
// Data flow:  archive JSON + live feed → buildLeague() → views.
// Views are pure functions of the league object that return HTML strings; all
// stats come from js/league.js and all prose from js/insights.js. Every
// dynamic string passes through esc() — team names are typed by league-mates.

import { buildLeague, series, rankOf, playoffRace, ordinal, POLICY, CLOSE_MARGIN, BLOWOUT_MARGIN } from './league.js';
import { createLiveFeed, mergeSeasons, nflWindow } from './live.js';
import { matchupNotes, seasonStorylines, archiveStorylines, weekRecap, franchiseNotes, versusNotes, currentStreak, shortName, cleanName, scoreRank, plural } from './insights.js';

// League lore that no data feed knows. Keyed by season.
const SEASON_NOTES = { 2022: 'Aided by the Damar Hamlin injury.' };
// Best Seasons Ever: a standing league ruling pins this franchise's best year to 12th.
const PINNED_LAST = 'b-waite';

const state = {
  archive: null, live: null, liveState: { status: 'idle' }, L: null,
  era: { from: null, to: null }, eraL: null, eraKey: '',
  frSort: { key: 'winPct', dir: -1 },
  lastPath: null, lastSig: '', prevScores: new Map(),
  livePending: false, // first-ever visit: the live season hasn't answered yet
};
let feed = null;

// ── Formatting ───────────────────────────────────────────────
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pts = n => (Math.round(n * 100) % 10 === 0 ? n.toFixed(1) : n.toFixed(2));
const f1 = n => n.toFixed(1);
const big = n => n.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const rec = (w, l, t) => w + '–' + l + (t ? '–' + t : '');
const pct = x => (x * 100).toFixed(1) + '%';
const signed = (n, d = 1) => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n).toFixed(d);
const cls = (...xs) => xs.filter(Boolean).join(' ');
/** Games are actually being played right now (not merely "the week has started"). */
const isHot = S => !!S && S.liveNow && (nflWindow() || Date.now() - (state.liveState.movedAt || 0) < 6 * 60_000);
const person = fid => { const c = state.L.career(fid); return c ? c.person : ''; };
const ROUND_NAME = { R1: 'First round', SF: 'Semifinals', F: 'Championship' };
const RESULT_SHORT = { champion: 'Champion', 'runner-up': 'Runner-up', semifinal: 'Semis', 'first-round': 'Round one', playoffs: 'Playoffs', alive: 'Alive', missed: 'Missed' };
const RESULT_NAME = { champion: 'Champion', 'runner-up': 'Lost in the final', semifinal: 'Lost in the semis', 'first-round': 'Lost in round one', playoffs: 'Made the playoffs', alive: 'Still alive', missed: 'Missed the playoffs' };

const teamLink = (T, klass = 'tn') => T.fid
  ? '<a class="' + klass + '" href="#/franchise/' + T.fid + '">' + esc(cleanName(T.name)) + '</a>'
  : '<span class="' + klass + '">' + esc(cleanName(T.name)) + '</span>';
const ring = (year, alt) => '<img class="ring" src="assets/rings/ring_' + year + '.webp" width="320" height="320" loading="lazy" alt="' + esc(alt || year + ' championship ring') + '">';
const bar = (frac, kind = '') => '<span class="bar ' + kind + '"><i style="width:' + Math.max(0, Math.min(100, frac * 100)).toFixed(1) + '%"></i></span>';
const formDots = form => '<span class="form" aria-label="Last ' + form.length + ': ' + form.join(' ') + '">' + form.map(r => '<i class="' + r.toLowerCase() + '"></i>').join('') + '</span>';
const says = items => '<ul class="says">' + items.map(s => {
  const inner = '<span class="tick"></span><p>' + esc(s.text) + '</p>';
  return '<li class="tone-' + (s.tone || 'plain') + '">' + (s.href ? '<a href="' + s.href + '">' + inner + '</a>' : '<span class="says-item">' + inner + '</span>') + '</li>';
}).join('') + '</ul>';
// Module header: a yellow title tab, short context on the right, an optional
// action. A longer description drops under the header instead.
const sec = (title, sub, more) => {
  const short = sub && sub.length <= 26;
  return '<header class="mod-h"><h2>' + esc(title) + '</h2>' + (short ? '<span class="ctx">' + esc(sub) + '</span>' : '') + (more || '') + '</header>' +
    (sub && !short ? '<p class="mod-sub">' + esc(sub) + '</p>' : '');
};
// One badge style for every franchise: a monogram on the brand chip.
const mono = name => {
  const w = shortName(name).replace(/^The\s+/i, '').replace(/\(.*?\)/g, '').replace(/[^A-Za-z0-9 ]/g, '').trim().split(/\s+/);
  return (w.length === 1 ? w[0].slice(0, 2) : w[0][0] + w[1][0]).toUpperCase();
};
const badge = name => '<span class="badge" aria-hidden="true">' + esc(mono(name)) + '</span>';
const teamCell = (T, sub) => '<td class="team"><div class="tc">' + badge(T.name) + '<div class="tx">' + teamLink(T) + (sub ? '<span class="tp">' + sub + '</span>' : '') + '</div></div></td>';

// ── Now ──────────────────────────────────────────────────────
function gameCard(L, S, g, { minor = false } = {}) {
  const live = g.status === 'midevent' && (g.a.pts > 0 || g.b.pts > 0), pre = !g.played && !live;
  const side = (me, opp) => {
    const T = S.teams.get(me.key);
    const won = g.played && g.winner === me.key, lost = g.played && !g.tie && !won;
    const seed = S.regDone && T.madePlayoffs ? ', ' + ordinal(T.seed) + ' seed' : '';
    const score = pre
      ? (me.proj != null ? '<span class="score">' + f1(me.proj) + '</span>' : '<span class="score">–</span>')
      : '<span class="score" data-k="' + esc(g.id + me.key) + '" data-v="' + me.pts + '">' + pts(me.pts) + '</span>';
    return '<div class="' + cls('side', won && 'won', lost && 'lost', pre && 'pre') + '">' +
      badge(me.name) +
      '<span class="tname">' + esc(shortName(me.name)) + '<span class="trec">' + rec(T.reg.w, T.reg.l, T.reg.t) + seed + '</span></span>' +
      score +
      (live && me.proj != null ? '<span class="proj">projected ' + f1(me.proj) + '</span>' : pre && me.proj != null ? '<span class="proj">projected</span>' : '') +
      '</div>';
  };
  // Win probability: each end of the bar is labelled with its team, and the
  // favourite's side is the yellow one, so there's no guessing whose number it is.
  let prob = '';
  if (!g.played && g.a.prob != null && g.b.prob != null) {
    const pa = Math.round(g.a.prob * 100), pb = 100 - pa;
    const fa = pa >= pb ? ' fav' : '', fb = pb > pa ? ' fav' : '';
    const an = esc(shortName(g.a.name)), bn = esc(shortName(g.b.name));
    prob = '<div class="prob" role="img" aria-label="Win probability: ' + an + ' ' + pa + '%, ' + bn + ' ' + pb + '%"><i class="' + fa + '" style="width:' + pa + '%"></i><i class="' + fb + '" style="width:' + pb + '%"></i></div>' +
      '<div class="prob-cap" aria-hidden="true"><span class="pl' + fa + '"><b>' + pa + '%</b> ' + an + '</span><span class="pm">to win</span><span class="pr' + fb + '">' + bn + ' <b>' + pb + '%</b></span></div>';
  }
  const notes = g.kind === 'consolation' ? { line: '' } : matchupNotes(L, g);
  const noteText = [notes.line, ...(notes.more || []).slice(0, 1)].filter(Boolean).join(' ');
  const href = g.a.fid && g.b.fid ? '#/versus/' + g.a.fid + '/' + g.b.fid : '#/season/' + S.year;
  return '<article class="' + cls('game', live && isHot(S) && 'is-live', minor && 'minor') + '">' +
    '<a class="game-link" href="' + href + '" aria-label="' + esc(g.a.name + ' versus ' + g.b.name) + '">' + side(g.a, g.b) + side(g.b, g.a) + prob + '</a>' +
    (noteText ? '<p class="note">' + esc(noteText) + '</p>' : '') +
    '</article>';
}

function standingsTable(L, S) {
  const race = S.regDone ? null : playoffRace(S);
  const rows = race ? race.order : S.table.map(T => ({ team: T }));
  const showRace = race && rows.some(r => r.team.reg.g > 0);
  let html = '<div class="tbl-wrap"><table class="tbl"><thead><tr><th></th><th>Team</th><th class="n">W–L</th><th class="n">PF</th><th class="n hide-s">PA</th><th class="c">Streak</th><th class="c hide-s">Last 5</th><th class="n hide-m">vs. everyone</th><th class="n hide-m">Luck</th></tr></thead><tbody>';
  rows.forEach((r, i) => {
    const T = r.team, st = currentStreak(T);
    const mark = showRace ? (r.clinchedBye ? '<span class="mark z" title="Clinched a bye">z</span>' : r.clinched ? '<span class="mark x" title="Clinched a playoff spot">x</span>' : r.eliminated ? '<span class="mark e" title="Eliminated">e</span>' : '')
      : (S.regDone && T.bye ? '<span class="mark z">z</span>' : S.regDone && T.madePlayoffs ? '<span class="mark x">x</span>' : '');
    html += '<tr><td class="rank">' + (i + 1) + '</td>' +
      teamCell(T, T.fid ? esc(person(T.fid)) + mark : '') +
      '<td class="n strong">' + rec(T.reg.w, T.reg.l, T.reg.t) + '</td>' +
      '<td class="n">' + big(T.reg.pf) + '</td>' +
      '<td class="n hide-s">' + big(T.reg.pa) + '</td>' +
      '<td class="c">' + (st.len ? '<span class="st ' + st.res.toLowerCase() + '">' + st.res + st.len + '</span>' : '–') + '</td>' +
      '<td class="c hide-s">' + formDots(T.form.slice(-5)) + '</td>' +
      '<td class="n hide-m">' + rec(T.allPlay.w, T.allPlay.l, T.allPlay.t) + '</td>' +
      '<td class="n hide-m ' + (T.luck >= 0.75 ? 'pos' : T.luck <= -0.75 ? 'neg' : '') + '">' + (T.reg.g ? signed(T.luck) : '–') + '</td></tr>';
    if (i === 1 && S.rounds.length !== 2) html += '<tr class="cut"><td colspan="9"><span>First-round bye</span></td></tr>';
    if (i === S.numPlayoffTeams - 1) html += '<tr class="cut"><td colspan="9"><span>Playoff line</span></td></tr>';
  });
  html += '</tbody></table></div>';
  html += '<p class="legend"><span>Top ' + S.numPlayoffTeams + ' make the playoffs. The top two skip round one.</span><span><b class="mark z">z</b> clinched a bye</span><span><b class="mark x">x</b> clinched a playoff spot</span><span><b class="mark e">e</b> eliminated</span>' +
    '<span class="hide-m" style="display:inline">Luck = wins above what the team’s weekly scores earned against the whole league.</span></p>';
  return html;
}

function wireList(tx) {
  if (!tx || !tx.length) return '';
  const ago = ts => { const h = (Date.now() - ts) / 3600e3; return h < 1 ? 'just now' : h < 24 ? Math.round(h) + 'h ago' : Math.round(h / 24) + 'd ago'; };
  const items = tx.slice(0, 8).map(t => {
    const team = t.type === 'trade' ? '' : (t.moves.find(m => m.action === 'add') || {}).to || (t.moves.find(m => m.action === 'drop') || {}).from || '';
    const mv = t.moves.map(m => {
      const who = '<b>' + esc(m.player) + '</b> <span class="muted">' + esc([m.pos, (m.nfl || '').toUpperCase()].filter(Boolean).join(', ')) + '</span>';
      if (m.action === 'add') return '<span class="add">+</span> ' + who;
      if (m.action === 'drop') return '<span class="drop">−</span> ' + who;
      return '<span class="trade">⇄</span> ' + who + ' to ' + esc(shortName(m.to));
    }).join('<br>');
    return '<li><span>' + (t.type === 'trade' ? 'Trade' : esc(shortName(team))) + '</span><span class="when">' + ago(t.ts) + '</span><span class="mv">' + mv + '</span></li>';
  }).join('');
  return '<section class="section mod">' + sec('The wire', 'Adds, drops, trades') + '<ul class="wire">' + items + '</ul></section>';
}

function recapBlock(L, S, week) {
  const items = weekRecap(L, S, week);
  if (!items.length) return '';
  return '<dl class="awards">' + items.map(a => '<div class="award"><dt>' + esc(a.label) + '</dt><dd class="v">' + esc(a.value) + '</dd><dd class="t">' + esc(a.text) + '</dd></div>').join('') + '</dl>';
}

function viewNow(parts) {
  const L = state.L, S = L.current;
  // Don't call it the offseason while the first live answer is still on its way.
  if (!S && state.livePending) return { html: '<p class="boot">Checking this week\u2019s scores…</p>', title: '', tab: 'now' };
  if (!S) return viewOffseason();
  const asked = parts[1] === 'week' ? +parts[2] : null;
  const week = Math.max(S.startWeek, Math.min(S.endWeek, asked || S.currentWeek));
  const games = S.games.filter(g => g.week === week);
  const live = games.some(g => g.status === 'midevent' && (g.a.pts > 0 || g.b.pts > 0));
  const done = games.length > 0 && games.every(g => g.played);
  const post = week >= S.poStart;
  const roundIdx = S.postWeeks.indexOf(week);
  const phase = post ? (ROUND_NAME[S.rounds[roundIdx >= 0 ? roundIdx : week - S.poStart]] || 'Playoffs') : 'Regular season';
  const pill = live && isHot(S) ? '<span class="pill live">Live</span>' : live ? '<span class="pill">In progress</span>' : done ? '<span class="pill">Final</span>' : '<span class="pill">Upcoming</span>';
  const step = (w, label, glyph) => (w >= S.startWeek && w <= S.endWeek)
    ? '<a href="#/now/week/' + w + '" aria-label="' + label + '">' + glyph + '</a>' : '<span aria-hidden="true">' + glyph + '</span>';

  let html = '<section class="section"><div class="week-head"><div><h1 class="week-title">Week ' + week + '</h1>' +
    '<p class="week-meta">' + pill + '<span>' + S.year + ' ' + phase.toLowerCase() + '</span>' +
    (week !== S.currentWeek ? '<a class="more" href="#/">Back to this week</a>' : '') + '</p></div>' +
    '<div class="steps">' + step(week - 1, 'Previous week', '‹') + step(week + 1, 'Next week', '›') + '</div></div>';

  if (!games.length) {
    html += '<p class="empty">' + (post ? 'The bracket for this round isn’t set yet.' : 'No games on the schedule for this week.') + '</p>';
  } else if (post) {
    const real = games.filter(g => g.kind === 'playoff'), other = games.filter(g => g.kind !== 'playoff');
    if (real.length) html += '<h3 class="games-label">' + esc(phase) + '</h3><div class="games">' + real.map(g => gameCard(L, S, g)).join('') + '</div>';
    if (other.length) html += '<h3 class="games-label">Consolation, doesn’t count</h3><div class="games">' + other.map(g => gameCard(L, S, g, { minor: true })).join('') + '</div>';
  } else {
    html += '<div class="games">' + games.map(g => gameCard(L, S, g)).join('') + '</div>';
  }
  html += '</section>';

  if (done) html += '<section class="section mod">' + sec('Week ' + week + ' in the books') + recapBlock(L, S, week) + '</section>';

  let stories = seasonStorylines(L, S).slice(0, 7);
  const storyTitle = 'The Ledger says';
  if (!stories.length) stories = archiveStorylines(L);
  const storiesHtml = stories.length ? '<section class="section mod">' + sec(storyTitle, plural(L.seasons.filter(s => s.complete).length, 'season') + ' on record') + says(stories) + '</section>' : '';
  const standingsHtml = '<section class="section mod" id="standings">' + sec('Standings', S.regDone ? 'Final' : S.lastPlayedWeek ? 'Through week ' + S.lastPlayedWeek : 'Preseason',
    '<a class="more" href="#/season/' + S.year + '">Full season</a>') + standingsTable(L, S) + '</section>';

  const lastWeek = S.lastPlayedWeek;
  const lastRecap = !done && lastWeek && lastWeek !== week
    ? '<section class="section mod">' + sec('Last week', 'Week ' + lastWeek + ' awards', '<a class="more" href="#/now/week/' + lastWeek + '">Scores</a>') + recapBlock(L, S, lastWeek) + '</section>' : '';

  html += '<div class="cols"><div>' + standingsHtml + lastRecap + '</div><div>' + storiesHtml + wireList(state.live && state.live.transactions) + '</div></div>';
  return { html, title: 'Week ' + week, tab: 'now' };
}

function crownBlock(S) {
  if (!S.champion) return '';
  const c = S.champion.fid && state.L.career(S.champion.fid);
  const nth = c ? c.titleYears.filter(y => y <= S.year).length : 0;
  return '<div class="crown">' + ring(S.year, S.year + ' championship ring, ' + S.champion.name) +
    '<div><p class="lbl">' + S.year + ' champion' + (nth > 1 ? ', title number ' + nth : '') + '</p>' +
    '<p class="who">' + teamLink(S.champion, '') + '</p>' +
    (S.finalScore && S.runnerUp ? '<p class="fin"><b>' + pts(S.finalScore.champ) + '–' + pts(S.finalScore.runner) + '</b> over ' + esc(S.runnerUp.name) + '</p>' : '') +
    (SEASON_NOTES[S.year] ? '<p class="note">' + esc(SEASON_NOTES[S.year]) + '</p>' : '') +
    '</div></div>';
}

function finalTable(S, { compact = false } = {}) {
  let html = '<div class="tbl-wrap"><table class="tbl"><thead><tr><th></th><th>Team</th><th class="n">W–L</th><th class="n">PF</th><th class="n hide-s">PA</th><th class="n hide-m">Seed</th><th class="n hide-m">Luck</th><th class="n">' + (S.complete ? 'Finish' : 'Status') + '</th></tr></thead><tbody>';
  S.table.forEach((T, i) => {
    html += '<tr><td class="rank">' + (i + 1) + '</td>' + teamCell(T, T.fid ? esc(person(T.fid)) : 'Retired franchise') +
      '<td class="n strong">' + rec(T.reg.w, T.reg.l, T.reg.t) + '</td><td class="n">' + big(T.reg.pf) + '</td><td class="n hide-s">' + big(T.reg.pa) + '</td>' +
      '<td class="n hide-m">' + T.seed + (T.bye ? ' <span class="muted">bye</span>' : '') + '</td>' +
      '<td class="n hide-m ' + (T.luck >= 0.75 ? 'pos' : T.luck <= -0.75 ? 'neg' : '') + '">' + signed(T.luck) + '</td>' +
      '<td class="n"><span class="res-tag ' + (T.result || '') + '">' + (T.result ? RESULT_SHORT[T.result] : '–') + '</span></td></tr>';
  });
  return html + '</tbody></table></div>';
}

function viewOffseason() {
  const L = state.L, S = L.latestComplete;
  if (!S) return { html: '<p class="empty">No seasons on record yet.</p>', title: 'Home', tab: 'now' };
  const stories = archiveStorylines(L);
  let html = '<section class="section"><h1 class="page-title">The offseason</h1><p class="page-sub">' + plural(L.totals.seasons, 'season') + ' and ' + L.totals.games.toLocaleString() + ' games on record. Scores return when the next season kicks off.</p></section>';
  html += '<section class="section">' + crownBlock(S) + '</section>';
  html += '<div class="cols"><div><section class="section">' + sec('How ' + S.year + ' finished', null, '<a class="more" href="#/season/' + S.year + '">Full season</a>') + finalTable(S) + '</section></div>' +
    '<div><section class="section">' + sec('The Ledger says') + says(stories) + '</section></div></div>';
  return { html, title: 'Home', tab: 'now' };
}

// ── Seasons ──────────────────────────────────────────────────
function milestones(L) {
  const out = [], count = {};
  L.seasons.forEach(S => {
    if (!S.champion) return;
    const key = S.champion.fid || S.champion.name;
    count[key] = (count[key] || 0) + 1;
    const n = count[key], name = S.champion.name;
    out.push({ year: S.year, text: n === 1 ? name + ' wins a first title.' : n === 2 ? name + ' becomes a two-time champion.' : name + ' wins title number ' + n + '. Dynasty.', note: SEASON_NOTES[S.year] });
  });
  const top = L.scores[0];
  if (top) out.push({ year: top.year, text: top.name + ' scores ' + pts(top.pts) + ', the all-time record.' });
  out.push({ year: L.firstYear, text: 'The ledger opens.', first: true });
  return out.sort((a, b) => a.year - b.year || (a.first ? -1 : 1));
}

function viewSeasons() {
  const L = state.L;
  const tiles = [...L.seasons].reverse().map(S => {
    if (!S.champion) {
      return '<a class="ring-tile pending" href="#/season/' + S.year + '"><div class="ring-ph">Ring to be decided</div><p class="yr">' + S.year + '</p><p class="champ">In progress</p><p class="def">Week ' + S.currentWeek + ' of ' + S.endWeek + '</p></a>';
    }
    return '<a class="ring-tile" href="#/season/' + S.year + '">' + ring(S.year, S.year + ' ring, ' + S.champion.name) + '<p class="yr">' + S.year + '</p><p class="champ">' + esc(shortName(S.champion.name)) + '</p>' +
      '<p class="def">' + (S.finalScore && S.runnerUp ? pts(S.finalScore.champ) + '–' + pts(S.finalScore.runner) + ' over ' + esc(shortName(S.runnerUp.name)) : '') + '</p></a>';
  }).join('');
  const ms = milestones(L).map(m => '<li><span class="row"><span class="k">' + m.year + '</span><span class="t">' + esc(m.text) + (m.note ? ' <em class="muted">' + esc(m.note) + '</em>' : '') + '</span></span></li>').join('');
  const html = '<section class="section"><h1 class="page-title">Seasons</h1><p class="page-sub">' + plural(L.totals.seasons, 'season') + ', ' + plural(L.totals.champions, 'different champion') + '. Tap a ring for the bracket, standings, and every score.</p></section>' +
    '<section class="section"><div class="ring-wall">' + tiles + '</div></section>' +
    '<section class="section mod">' + sec('Milestones') + '<ul class="facts">' + ms + '</ul></section>';
  return { html, title: 'Seasons', tab: 'seasons' };
}

function bracketHtml(S) {
  if (!S.rounds.some(r => S.bracket[r].length)) return '';
  const game = (g, title) => {
    const row = me => {
      const T = S.teams.get(me.key), w = g.played && g.winner === me.key, l = g.played && !w && !g.tie;
      return '<div class="bt ' + (w ? 'w' : l ? 'l' : '') + '"><span class="sd">' + T.seed + '</span><span class="nm">' + esc(shortName(me.name)) + '</span><span class="sc">' + (g.played || g.status === 'midevent' ? pts(me.pts) : '–') + '</span></div>';
    };
    const [hi, lo] = S.teams.get(g.a.key).seed <= S.teams.get(g.b.key).seed ? [g.a, g.b] : [g.b, g.a];
    return '<div class="bgame ' + (title ? 'title' : '') + '">' + row(hi) + row(lo) + '</div>';
  };
  const byes = [...S.teams.values()].filter(t => t.bye).sort((a, b) => a.seed - b.seed);
  return '<div class="bracket">' + S.rounds.map((r, i) => {
    const gs = [...S.bracket[r]].sort((x, y) => Math.min(S.teams.get(x.a.key).seed, S.teams.get(x.b.key).seed) - Math.min(S.teams.get(y.a.key).seed, S.teams.get(y.b.key).seed));
    return '<div class="bround"><h4>' + ROUND_NAME[r] + (S.postWeeks[i] ? ' <small>Week ' + S.postWeeks[i] + '</small>' : '') + '</h4>' +
      (gs.length ? gs.map(g => game(g, r === 'F')).join('') : '<p class="byes">To be played.</p>') +
      (r === 'R1' && byes.length ? '<p class="byes">Byes: ' + byes.map(t => esc(shortName(t.name))).join(', ') + '</p>' : '') + '</div>';
  }).join('') + '</div>';
}

function viewSeason(parts) {
  const L = state.L, S = L.season(parts[1]);
  if (!S) return notFound('That season isn’t in the ledger.');
  const idx = L.seasons.indexOf(S), prev = L.seasons[idx - 1], next = L.seasons[idx + 1];
  const teams = [...S.teams.values()];
  const counted = S.games.filter(g => g.counts);
  const sides = counted.flatMap(g => [{ me: g.a, opp: g.b, g }, { me: g.b, opp: g.a, g }]).filter(s => s.me.pts > 0).sort((a, b) => b.me.pts - a.me.pts);
  const decided = counted.filter(g => !g.tie && g.a.pts > 0 && g.b.pts > 0).map(g => { const w = g.winner === g.a.key ? g.a : g.b, l = w === g.a ? g.b : g.a; return { g, w, l, m: w.pts - l.pts }; }).sort((a, b) => b.m - a.m);

  let html = '<a class="crumb" href="#/seasons">‹ All seasons</a>' +
    '<section class="section"><div class="week-head"><div><h1 class="week-title">' + S.year + '</h1><p class="week-meta">' +
    (S.complete ? '' : '<span class="pill live">In progress</span>') + '<span>Season ' + (idx + 1) + ' of ' + L.seasons.length + '</span>' +
    (S.complete ? '' : '<a class="more" href="#/">This week’s scores</a>') + '</p></div>' +
    '<div class="steps">' + (prev ? '<a href="#/season/' + prev.year + '" aria-label="' + prev.year + ' season">‹</a>' : '<span>‹</span>') + (next ? '<a href="#/season/' + next.year + '" aria-label="' + next.year + ' season">›</a>' : '<span>›</span>') + '</div></div>' +
    crownBlock(S) + '</section>';

  const br = bracketHtml(S);
  if (br) html += '<section class="section mod">' + sec('Playoff bracket', 'Seeds from the regular season. Placement and consolation games are left out; they don’t count.') + br + '</section>';

  html += '<section class="section mod">' + sec(S.complete ? 'Final standings' : 'Standings', S.complete ? 'Ordered by final finish. Records are regular season.' : 'Through Week ' + S.lastPlayedWeek + '.') + (S.complete ? finalTable(S) : standingsTable(L, S)) + '</section>';

  if (sides.length) {
    const byPF = [...teams].sort((a, b) => b.reg.pf - a.reg.pf)[0];
    const worst = [...teams].sort((a, b) => (a.reg.w + a.reg.t / 2) - (b.reg.w + b.reg.t / 2) || a.reg.pf - b.reg.pf)[0];
    const byLuck = [...teams].sort((a, b) => b.luck - a.luck);
    const hi = sides[0], lo = sides[sides.length - 1], blow = decided[0], close = decided[decided.length - 1];
    const aw = (k, v, t) => '<div class="award"><dt>' + k + '</dt><dd class="v">' + v + '</dd><dd class="t">' + t + '</dd></div>';
    const hiRank = scoreRank(L, hi.me.pts);
    html += '<section class="section mod">' + sec('Season marks') + '<dl class="awards">' +
      aw('Most points', big(byPF.reg.pf), esc(shortName(byPF.name)) + ', regular season.') +
      aw('Best single game', pts(hi.me.pts), esc(shortName(hi.me.name)) + ', Week ' + hi.g.week + '.' + (hiRank <= 25 ? ' ' + ordinal(hiRank) + ' all-time.' : '')) +
      (blow ? aw('Biggest blowout', '+' + pts(blow.m), esc(shortName(blow.w.name)) + ' over ' + esc(shortName(blow.l.name)) + ', Week ' + blow.g.week + '.') : '') +
      (close ? aw('Closest game', pts(close.m), esc(shortName(close.w.name)) + ' over ' + esc(shortName(close.l.name)) + ', Week ' + close.g.week + '.') : '') +
      aw('Worst single game', pts(lo.me.pts), esc(shortName(lo.me.name)) + ', Week ' + lo.g.week + '.') +
      aw('Worst record', rec(worst.reg.w, worst.reg.l, worst.reg.t), esc(shortName(worst.name)) + '.') +
      (byLuck[0].luck >= 1 ? aw('Luckiest', signed(byLuck[0].luck) + ' wins', esc(shortName(byLuck[0].name)) + ' went ' + rec(byLuck[0].allPlay.w, byLuck[0].allPlay.l, byLuck[0].allPlay.t) + ' against the whole league.') : '') +
      (byLuck[byLuck.length - 1].luck <= -1 ? aw('Unluckiest', signed(byLuck[byLuck.length - 1].luck) + ' wins', esc(shortName(byLuck[byLuck.length - 1].name)) + ' went ' + rec(byLuck[byLuck.length - 1].allPlay.w, byLuck[byLuck.length - 1].allPlay.l, byLuck[byLuck.length - 1].allPlay.t) + ' against the whole league.') : '') +
      '</dl></section>';
  }

  const weeks = [...new Set(S.games.filter(g => g.played || g.status === 'midevent').map(g => g.week))].sort((a, b) => a - b);
  if (weeks.length) {
    html += '<section class="section mod">' + sec('Every score', 'Week by week') + '<div class="weeks">' + weeks.map(w => {
      const gs = S.games.filter(g => g.week === w && (g.played || g.status === 'midevent'));
      const top = gs.flatMap(g => [g.a, g.b]).sort((a, b) => b.pts - a.pts)[0];
      const line = g => {
        const aw = g.winner === g.a.key, bw = g.winner === g.b.key;
        return '<span class="a ' + (bw ? 'dim' : '') + '">' + esc(shortName(g.a.name)) + '</span><span class="sa ' + (bw ? 'dim' : '') + '">' + pts(g.a.pts) + '</span><span class="sb ' + (aw ? 'dim' : '') + '">' + pts(g.b.pts) + '</span><span class="b ' + (aw ? 'dim' : '') + '">' + esc(shortName(g.b.name)) + '</span>';
      };
      const real = gs.filter(g => g.kind !== 'consolation'), cons = gs.filter(g => g.kind === 'consolation');
      const label = w >= S.poStart ? (ROUND_NAME[S.rounds[S.postWeeks.indexOf(w)]] || 'Playoffs') : 'Week ' + w;
      return '<details><summary><span>' + (w >= S.poStart ? 'Week ' + w + ', ' + label.toLowerCase() : label) + '</span><span class="s">High: ' + esc(shortName(top.name)) + ' ' + pts(top.pts) + '</span></summary><div class="res">' +
        real.map(line).join('') + (cons.length ? '<span class="tag">Consolation, doesn’t count</span>' + cons.map(line).join('') : '') + '</div></details>';
    }).join('') + '</div></section>';
  }
  return { html, title: S.year + ' season', tab: 'seasons' };
}

// ── Franchises ───────────────────────────────────────────────
const FR_COLS = [
  { key: 'winPct', label: 'Win %', fmt: c => pct(c.winPct) },
  { key: 'titles', label: 'Titles', fmt: c => (c.titles ? '<span class="gold strong">' + c.titles + '</span>' : '–') },
  { key: 'finals', label: 'Finals', fmt: c => c.finals || '–' },
  { key: 'playoffApps', label: 'Playoffs', fmt: c => c.playoffApps },
  { key: 'poW', label: 'Playoff W–L', fmt: c => rec(c.poW, c.poL) },
  { key: 'byes', label: 'Byes', fmt: c => c.byes || '–' },
  { key: 'tenWin', label: '10-win years', fmt: c => c.tenWin || '–' },
  { key: 'ppg', label: 'PPG', fmt: c => f1(c.ppg) },
  { key: 'luck', label: 'Luck', fmt: c => '<span class="' + (c.luck >= 2 ? 'pos' : c.luck <= -2 ? 'neg' : '') + '">' + signed(c.luck) + '</span>' },
];

function eraLeague() {
  const { from, to } = state.era;
  if (!from && !to) return state.L;
  const key = from + ':' + to + ':' + state.lastSig;
  if (state.eraKey !== key) {
    state.eraL = buildLeague(mergeSeasons(state.archive.seasons, state.live), { from: from || undefined, to: to || undefined });
    state.eraKey = key;
  }
  return state.eraL;
}
function eraControls() {
  const L = state.L, years = L.seasons.map(s => s.year);
  const from = state.era.from || L.firstYear, to = state.era.to || L.lastYear;
  const opts = sel => years.map(y => '<option value="' + y + '"' + (y === sel ? ' selected' : '') + '>' + y + '</option>').join('');
  const on = state.era.from || state.era.to;
  return '<div class="era"><label for="era-from">Seasons</label><select id="era-from" data-era="from" aria-label="From season">' + opts(from) + '</select><span>to</span><select data-era="to" aria-label="To season">' + opts(to) + '</select>' +
    (on ? '<button type="button" class="reset" data-era-reset>All-time</button>' : '') + '</div>';
}
function statusLine(c) {
  if (c.titles >= 3) return 'Dynasty, ' + c.titles + ' titles';
  if (c.titles === 2) return 'Two-time champion';
  if (c.titles === 1) return 'Champion, ' + c.titleYears[0];
  if (c.runnerUps) return plural(c.runnerUps, 'lost final') + ', no ring';
  return 'No titles in ' + plural(c.seasonsCompleted || c.seasonsPlayed, 'season');
}

function viewFranchises() {
  const L = state.L, E = eraLeague();
  const { key, dir } = state.frSort;
  const col = FR_COLS.find(c => c.key === key) || FR_COLS[0];
  const list = [...E.franchises].sort((a, b) => dir * (a[key] - b[key]) || b.winPct - a.winPct || b.w - a.w);
  const live = L.current;
  let html = '<section class="section"><h1 class="page-title">Franchises</h1><p class="page-sub">Career numbers for all ' + L.franchises.length + ' franchises. Records count the regular season and championship-bracket playoff games' +
    (live && live.lastPlayedWeek ? ', through Week ' + live.lastPlayedWeek + ' of ' + live.year : '') + '.</p></section>';
  html += '<section class="section">' +
    '<div class="chips only-m" role="group" aria-label="Stat to show">' + FR_COLS.map(c => '<button type="button" class="chip ' + (c.key === key ? 'on' : '') + '" data-sort="' + c.key + '">' + c.label + '</button>').join('') + '</div>' +
    '</section><section class="section mod">' + sec('Career table', null, eraControls()) + '<div class="tbl-wrap"><table class="tbl"><thead><tr><th></th><th>Franchise</th><th class="n">Record</th>' +
    FR_COLS.map(c => '<th class="' + cls('n', c.key !== key && 'hide-m', c.key === key && 'sorted', c.key === key && dir > 0 && 'asc') + '" data-sort="' + c.key + '">' + c.label + '</th>').join('') + '</tr></thead><tbody>';
  list.forEach((c, i) => {
    html += '<tr><td class="rank">' + (i + 1) + '</td>' + teamCell({ name: c.teamName, fid: c.fid }, esc(c.person) + ', ' + esc(statusLine(c).toLowerCase())) +
      '<td class="n">' + rec(c.w, c.l, c.t) + '</td>' +
      FR_COLS.map(k => '<td class="' + cls('n', k.key !== key && 'hide-m', k.key === key && 'strong') + '">' + k.fmt(c) + '</td>').join('') + '</tr>';
  });
  html += '</tbody></table></div><p class="legend"><span>Sorted by ' + col.label.toLowerCase() + '.</span><span>Luck = career wins above what weekly scores earned against the whole league.</span></p></section>';
  return { html, title: 'Franchises', tab: 'franchises' };
}

function viewFranchise(parts) {
  const L = state.L, E = eraLeague(), fid = parts[1];
  const full = L.career(fid), c = E.career(fid);
  if (!full || !full.seasonsPlayed) return notFound('No franchise by that name.');
  const n = E.franchises.length;
  const rk = (pick, low) => { const r = rankOf(E, fid, pick, { lowIsBest: !!low }); return '<td class="rk ' + (r <= 3 ? 'hi' : r > n - 3 ? 'lo' : '') + '">' + ordinal(r) + ' of ' + n + '</td>'; };
  const former = full.teamNames.slice(0, -1).map(t => t.name).filter((v, i, a) => a.indexOf(v) === i && v !== full.teamName);

  let html = '<a class="crumb" href="#/franchises">‹ All franchises</a><section class="section"><div class="fr-head"><div><h1 class="fr-name">' + esc(full.teamName) + '</h1>' +
    '<p class="fr-meta">' + esc(full.person) + ', since ' + full.firstYear + '. ' + esc(statusLine(full)) + '.' + (former.length ? ' Formerly ' + esc(former.slice(-4).join(', ')) + '.' : '') + '</p></div>' +
    (full.titleYears.length ? '<div class="rings-row">' + full.titleYears.map(y => '<a href="#/season/' + y + '">' + ring(y) + y + '</a>').join('') + '</div>' : '') + '</div></section>';

  // This season
  const S = L.current, T = S && [...S.teams.values()].find(t => t.fid === fid);
  if (T && T.reg.g) {
    const st = currentStreak(T), pos = S.table.indexOf(T) + 1;
    const nextG = S.games.find(g => !g.played && (g.a.fid === fid || g.b.fid === fid));
    let l2 = '';
    if (nextG) {
      const opp = nextG.a.fid === fid ? nextG.b : nextG.a;
      const note = matchupNotes(L, nextG).line;
      l2 = (nextG.status === 'midevent' ? 'Playing ' : 'Next: ') + esc(shortName(opp.name)) + ' in Week ' + nextG.week + '. ' + esc(note);
    }
    html += '<section class="section"><div class="now-strip"><p class="l1">' + S.year + ': ' + rec(T.reg.w, T.reg.l, T.reg.t) + ', ' + ordinal(pos) + ' of ' + S.teams.size + (st.len >= 2 ? '. ' + (st.res === 'W' ? 'Won ' : st.res === 'L' ? 'Lost ' : 'Tied ') + st.len + ' straight' : '') + '.</p>' + (l2 ? '<p class="l2">' + l2 + '</p>' : '') + '</div></section>';
  }

  if (!c || !c.seasonsPlayed) {
    html += '<section class="section">' + eraControls() + '<p class="empty" style="margin-top:14px">This franchise didn’t play in the seasons selected.</p></section>';
    return { html, title: full.teamName, tab: 'franchises' };
  }

  const row = (k, v, r) => '<tr><td>' + k + '</td><td class="v">' + v + '</td>' + (r || '<td class="rk"></td>') + '</tr>';
  html += '<section class="section mod">' + sec('Career sheet', null, eraControls()) + '<table class="sheet"><tbody>' +
    row('Record', rec(c.w, c.l, c.t) + ' <small>' + pct(c.winPct) + '</small>', rk(x => x.winPct)) +
    row('Championships', c.titles + (c.titleYears.length ? ' <small>' + c.titleYears.join(', ') + '</small>' : ''), rk(x => x.titles)) +
    row('Finals', c.finals + (c.runnerUps ? ' <small>' + plural(c.runnerUps, 'loss').replace('losss', 'losses') + '</small>' : ''), rk(x => x.finals)) +
    row('Playoff appearances', c.playoffApps + ' <small>of ' + c.seasons.filter(r => r.team.result).length + '</small>', rk(x => x.playoffApps)) +
    row('Playoff record', rec(c.poW, c.poL) + (c.upsets ? ' <small>' + plural(c.upsets, 'upset') + '</small>' : ''), rk(x => x.poW)) +
    row('First-round byes', c.byes, rk(x => x.byes)) +
    row('10-win seasons', c.tenWin, rk(x => x.tenWin)) +
    row('Points per game', f1(c.ppg), rk(x => x.ppg)) +
    row('Points against per game', f1(c.papg) + ' <small>' + signed(c.diff) + ' margin</small>', rk(x => x.diff)) +
    (c.high ? row('Highest score', pts(c.high.pts) + ' <small>Wk ' + c.high.week + ', ' + c.high.year + '</small>', rk(x => (x.high ? x.high.pts : 0))) : '') +
    (c.low ? row('Lowest score', pts(c.low.pts) + ' <small>Wk ' + c.low.week + ', ' + c.low.year + '</small>', rk(x => (x.low ? x.low.pts : 0))) : '') +
    row('Scoring swing', '±' + f1(c.stdev) + ' <small>week to week</small>', rk(x => x.stdev, true)) +
    row('Schedule luck', signed(c.luck) + ' <small>wins</small>', rk(x => x.luck)) +
    '</tbody></table></section>';

  // Season by season
  let seasonsHtml = '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Year</th><th>Team</th><th class="n">W–L</th><th class="n hide-s">PF</th><th class="n hide-s">Finish</th><th class="n">Result</th></tr></thead><tbody>';
  [...c.seasons].reverse().forEach(r => {
    const t = r.team;
    const dots = t.form.map(x => '<i class="' + x.toLowerCase() + '"></i>').join('') + (t.po.w ? '<i style="background:none;width:3px"></i>' + '<i class="pw"></i>'.repeat(t.po.w) : '');
    seasonsHtml += '<tr><td class="yr"><a href="#/season/' + r.year + '" class="strong">' + r.year + '</a></td><td><span class="tn">' + esc(cleanName(t.name)) + '</span><span class="winbar" aria-hidden="true">' + dots + '</span></td>' +
      '<td class="n strong">' + rec(t.reg.w, t.reg.l, t.reg.t) + '</td><td class="n hide-s">' + big(t.reg.pf) + '</td><td class="n hide-s">' + (r.complete ? ordinal(t.rank) : '–') + '</td>' +
      '<td class="n"><span class="res-tag ' + (t.result || '') + '">' + (t.result ? RESULT_SHORT[t.result] : 'In progress') + '</span></td></tr>';
  });
  seasonsHtml += '</tbody></table></div><p class="legend"><span>Each mark is a regular-season game; gold marks are playoff wins.</span></p>';

  // Head to head
  const h2hRows = E.franchises.filter(o => o.fid !== fid).map(o => ({ o, s: series(E, fid, o.fid) })).filter(x => x.s.g > 0)
    .sort((a, b) => (b.s.w + b.s.t / 2) / b.s.g - (a.s.w + a.s.t / 2) / a.s.g || b.s.g - a.s.g);
  let h2hHtml = '<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Opponent</th><th class="n">W–L</th><th class="n hide-s">Avg score</th><th style="width:28%"></th></tr></thead><tbody>';
  h2hRows.forEach(({ o, s }) => {
    const p = (s.w + s.t / 2) / s.g;
    h2hHtml += '<tr><td class="team"><div class="tc">' + badge(o.teamName) + '<div class="tx"><a class="tn" href="#/versus/' + fid + '/' + o.fid + '">' + esc(cleanName(o.teamName)) + '</a></div></div></td><td class="n strong ' + (s.w > s.l ? 'pos' : s.w < s.l ? 'neg' : '') + '">' + rec(s.w, s.l, s.t) + '</td>' +
      '<td class="n hide-s">' + f1(s.pf / s.g) + '–' + f1(s.pa / s.g) + '</td><td>' + bar(p, p >= 0.5 ? 'win' : 'loss') + '</td></tr>';
  });
  h2hHtml += '</tbody></table></div>';

  const notes = franchiseNotes(E, fid);
  const notesHtml = notes.length ? '<ul class="facts">' + notes.map(x => '<li><a href="' + x.href + '"><span class="k">' + esc(x.label) + '</span><span class="t">' + esc(x.text) + '</span></a></li>').join('') + '</ul>' : '';

  html += '<div class="cols even"><div><section class="section">' + sec('Season by season') + seasonsHtml + '</section></div>' +
    '<div><section class="section">' + sec('Against everyone', 'Tap for every meeting') + h2hHtml + '</section>' +
    (notesHtml ? '<section class="section mod">' + sec('In the margins') + notesHtml + '</section>' : '') + '</div></div>';
  return { html, title: full.teamName, tab: 'franchises' };
}

// ── Record book ──────────────────────────────────────────────
const plainName = h => h.split('<span')[0].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").trim();
const lbItem = (k, who, ctx, v, extra = '', klass = '') => '<li class="' + klass + '"><span class="k">' + k + '</span>' + badge(plainName(who)) + '<span class="who">' + who + (ctx ? '<span class="ctx">' + ctx + '</span>' : '') + '</span><span class="v">' + v + '</span>' + extra + '</li>';
const whoLink = (name, fid) => (fid ? '<a href="#/franchise/' + fid + '">' + esc(name) + '</a>' : esc(name));
const roundTag = x => (x.kind === 'playoff' ? ', ' + ROUND_NAME[x.round].toLowerCase() : '');

function viewRecords(parts) {
  const L = state.L, fr = L.franchises, liveYear = L.current ? L.current.year : null;
  const isNew = y => (y === liveYear ? 'is-new' : '');
  const chapters = [];
  const WIDE = new Set(['top', 'streaks', 'playoffs', 'strange']);
  const ORDER = ['top', 'scores', 'blowouts', 'streaks', 'totals', 'best', 'playoffs', 'shed', 'close', 'droughts', 'luck', 'strange'];
  const chap = (id, label, title, sub, body) => chapters.push({ id, label, html: '<section class="section mod' + (WIDE.has(id) ? ' wide' : '') + '" id="ch-' + id + '">' + sec(title, sub) + body + '</section>' });

  // Headlines
  const champ = [...fr].sort((a, b) => b.titles - a.titles || b.winPct - a.winPct)[0];
  const hi = L.scores[0], blow = L.margins[0];
  const frLines = L.seasonLines.filter(x => x.team.fid && x.regDone);
  const bestRec = [...frLines].sort((a, b) => b.team.reg.w - a.team.reg.w || a.team.reg.l - b.team.reg.l)[0];
  const losing = [...fr].sort((a, b) => b.losingSeasons - a.losingSeasons)[0];
  const head = (k, v, who, ctx, wide) => '<div class="head ' + (wide ? 'wide' : '') + '"><dt>' + k + '</dt><dd class="big">' + v + '</dd><dd class="who">' + who + '</dd><dd class="ctx">' + ctx + '</dd></div>';
  let heads = '<dl class="heads">';
  if (champ) heads += head('Most championships', '<span class="gold">' + champ.titles + '</span>', whoLink(champ.teamName, champ.fid), champ.titleYears.join(', '), true);
  if (hi) heads += head('Highest score', pts(hi.pts), whoLink(hi.name, hi.fid), 'Week ' + hi.week + ', ' + hi.year);
  if (blow) heads += head('Biggest blowout', pts(blow.margin), esc(shortName(blow.w.name)) + ' over ' + esc(shortName(blow.l.name)), pts(blow.w.pts) + '–' + pts(blow.l.pts) + ', Week ' + blow.week + ', ' + blow.year);
  if (bestRec) heads += head('Best regular season', rec(bestRec.team.reg.w, bestRec.team.reg.l, bestRec.team.reg.t), whoLink(bestRec.team.name, bestRec.team.fid), bestRec.year);
  if (losing) heads += head('Most losing seasons', losing.losingSeasons + ' <small>of ' + losing.seasonsPlayed + '</small>', whoLink(losing.teamName, losing.fid), 'Below .500 in ' + Math.round(losing.losingSeasons / losing.seasonsPlayed * 100) + '% of seasons');
  heads += '</dl>';
  chap('top', 'Headlines', 'The record book', plural(L.totals.seasons, 'season') + ' of receipts. Every list counts the regular season and championship-bracket playoff games only.', heads);

  // Scores
  chap('scores', 'High scores', 'Highest single-game scores', 'The ten best weeks anyone has had.',
    '<ol class="lb">' + L.scores.slice(0, 10).map((s, i) => lbItem(i + 1, whoLink(s.name, s.fid), s.year + ', Week ' + s.week + roundTag(s) + (s.won ? '' : '. Lost anyway'), pts(s.pts), '', isNew(s.year))).join('') + '</ol>');

  // Blowouts
  chap('blowouts', 'Blowouts', 'Biggest blowouts', 'Largest margins of victory.',
    '<ol class="lb">' + L.margins.slice(0, 10).map((m, i) => lbItem(i + 1, whoLink(shortName(m.w.name), m.w.fid) + ' <span class="over">over</span> ' + whoLink(shortName(m.l.name), m.l.fid), m.year + ', Week ' + m.week + roundTag(m) + '. ' + pts(m.w.pts) + '–' + pts(m.l.pts), '+' + pts(m.margin), '', isNew(m.year))).join('') + '</ol>');

  // Streaks
  const ws = [...fr].sort((a, b) => b.bestWinStreak.len - a.bestWinStreak.len).slice(0, 7);
  const ls = [...fr].sort((a, b) => b.bestLossStreak.len - a.bestLossStreak.len).slice(0, 7);
  chap('streaks', 'Streaks', 'Streaks', 'Longest runs inside one regular season.',
    '<div class="duo"><div><h3 class="sub-h">Longest win streaks</h3><ol class="lb">' + ws.map((c, i) => lbItem(i + 1, whoLink(c.teamName, c.fid), c.bestWinStreak.year, '<span class="pos">' + c.bestWinStreak.len + 'W</span>', '', isNew(c.bestWinStreak.year))).join('') + '</ol></div>' +
    '<div><h3 class="sub-h">Longest losing streaks</h3><ol class="lb">' + ls.map((c, i) => lbItem(i + 1, whoLink(c.teamName, c.fid), c.bestLossStreak.year, '<span class="neg">' + c.bestLossStreak.len + 'L</span>', '', isNew(c.bestLossStreak.year))).join('') + '</ol></div></div>');

  // Season totals
  const totals = [...L.seasonLines].filter(x => x.team.reg.g > 0).sort((a, b) => b.team.reg.pf - a.team.reg.pf).slice(0, 10);
  chap('totals', 'Season totals', 'Most points in a regular season', null,
    '<ol class="lb">' + totals.map((x, i) => lbItem(i + 1, whoLink(x.team.name, x.team.fid), x.year + ', ' + rec(x.team.reg.w, x.team.reg.l, x.team.reg.t) + (x.regDone ? '' : ' so far'), big(x.team.reg.pf), '', isNew(x.year))).join('') + '</ol>');

  // Playoffs
  const po = [...fr].filter(c => c.playoffApps > 0).sort((a, b) => b.titles - a.titles || b.poW - a.poW || b.poPct - a.poPct);
  chap('playoffs', 'Playoffs', 'When it matters', 'Championship-bracket games only. An upset is a win over a better seed.',
    '<div class="tbl-wrap"><table class="tbl"><thead><tr><th></th><th>Franchise</th><th class="n">W–L</th><th class="n">Win %</th><th class="n hide-s">Trips</th><th class="n">Titles</th><th class="n hide-s">Finals</th><th class="n hide-s">Upsets</th></tr></thead><tbody>' +
    po.map((c, i) => '<tr><td class="rank">' + (i + 1) + '</td>' + teamCell({ name: c.teamName, fid: c.fid }) + '<td class="n strong">' + rec(c.poW, c.poL) + '</td><td class="n ' + (c.poPct >= 0.6 ? 'gold' : c.poPct < 0.4 ? 'neg' : '') + '">' + (c.poG ? Math.round(c.poPct * 100) + '%' : '–') + '</td><td class="n hide-s">' + c.playoffApps + '</td><td class="n">' + (c.titles ? '<span class="gold strong">' + c.titles + '</span>' : '–') + '</td><td class="n hide-s">' + (c.finals || '–') + '</td><td class="n hide-s">' + (c.upsets || '–') + '</td></tr>').join('') +
    '</tbody></table></div>');

  // The shed
  const shed = [...fr].map(c => ({ c, net: c.blowouts.dealt - c.blowouts.received })).sort((a, b) => b.net - a.net || b.c.blowouts.dealt - a.c.blowouts.dealt);
  chap('shed', 'The shed', 'Taken to the shed', 'Regular-season games won or lost by ' + BLOWOUT_MARGIN + ' or more. Who does the taking, and who gets taken?',
    '<ol class="lb">' + shed.map(({ c, net }, i) => {
      const tot = c.blowouts.dealt + c.blowouts.received || 1;
      return lbItem(i + 1, whoLink(c.teamName, c.fid) + (net >= 10 ? ' <span class="tag champ">Bully</span>' : net <= -10 ? ' <span class="tag bad">Victim</span>' : ''),
        c.blowouts.dealt + ' dealt, ' + c.blowouts.received + ' taken. Biggest win +' + f1(c.blowouts.maxWin), signed(net, 0),
        '<span class="bar split"><i style="width:' + (c.blowouts.dealt / tot * 100).toFixed(1) + '%"></i><i style="width:' + (c.blowouts.received / tot * 100).toFixed(1) + '%"></i></span>');
    }).join('') + '</ol>');

  // Close games
  const close = [...fr].map(c => ({ c, g: c.close.w + c.close.l, p: (c.close.w + c.close.l) ? c.close.w / (c.close.w + c.close.l) : 0 })).filter(x => x.g > 0).sort((a, b) => b.p - a.p || b.g - a.g);
  chap('close', 'Close games', 'Close games', 'Regular-season games decided by ' + CLOSE_MARGIN + ' points or fewer. Ice in the veins, or heartbreak on repeat?',
    '<ol class="lb">' + close.map(({ c, g, p }, i) => lbItem(i + 1, whoLink(c.teamName, c.fid) + (p >= 0.6 ? ' <span class="tag good">Clutch</span>' : p < 0.4 ? ' <span class="tag bad">Heartbreak</span>' : ''), rec(c.close.w, c.close.l) + ' in ' + g + ' games', Math.round(p * 100) + '%', bar(p, p >= 0.5 ? 'win' : 'loss'))).join('') + '</ol>');

  // Best seasons ever (league ruling: one franchise is pinned to 12th)
  const scored = frLines.map(x => {
    const t = x.team, g = t.reg.w + t.reg.l + t.reg.t;
    return { x, t, comp: (g ? t.reg.w / g : 0) * 60 + (t.reg.pf / 100) * 0.2 + (t.champion ? 15 : 0) + (t.madePlayoffs ? 5 : 0) };
  }).sort((a, b) => b.comp - a.comp);
  const pinned = scored.find(r => r.t.fid === PINNED_LAST);
  const best12 = scored.filter(r => r.t.fid !== PINNED_LAST).slice(0, 11);
  if (pinned) best12.push(pinned);
  chap('best', 'Best seasons', 'Best seasons ever', 'Record, points, and how it ended, weighed together.',
    '<ol class="lb">' + best12.map((r, i) => lbItem(i + 1, whoLink(r.t.name, r.t.fid) + (r.t.champion ? ' <span class="tag champ">Champion</span>' : ''), r.x.year + '. ' + Math.round(r.t.reg.pf).toLocaleString() + ' points, finished ' + ordinal(r.t.rank), rec(r.t.reg.w, r.t.reg.l, r.t.reg.t))).join('') + '</ol>');

  // Droughts
  const dr = [...fr].sort((a, b) => (a.lastTitle ? 1 : 0) - (b.lastTitle ? 1 : 0) || (a.lastTitle ? b.drought - a.drought : b.winPct - a.winPct));
  const maxWait = Math.max(...fr.map(c => c.waiting), 1);
  chap('droughts', 'Droughts', 'Title droughts', 'Seasons since the last championship.',
    '<ol class="lb">' + dr.map((c, i) => lbItem(i + 1, whoLink(c.teamName, c.fid), c.lastTitle ? (c.drought === 0 ? 'Reigning champion' : 'Last won in ' + c.lastTitle) : plural(c.seasonsCompleted, 'season') + ' without one' + (c.runnerUps ? ', ' + plural(c.runnerUps, 'lost final') : ''),
      c.lastTitle ? (c.drought === 0 ? '<span class="gold">Reigning</span>' : c.drought + (c.drought === 1 ? ' yr' : ' yrs')) : '<span class="neg">Never</span>',
      bar(c.drought === 0 ? 1 : c.waiting / maxWait, c.drought === 0 ? 'gold' : c.lastTitle ? '' : 'loss'))).join('') + '</ol>');

  // Luck
  const luck = [...fr].sort((a, b) => b.luck - a.luck);
  const maxLuck = Math.max(...luck.map(c => Math.abs(c.luck)), 1);
  chap('luck', 'Luck', 'Schedule luck', 'Each week, how many of the other teams would you have beaten? Add that up and you get the wins a team earned. The difference from its real record is luck.',
    '<ol class="lb">' + luck.map((c, i) => lbItem(i + 1, whoLink(c.teamName, c.fid), c.regW + ' real wins, ' + f1(c.allPlay.exp) + ' earned', '<span class="' + (c.luck >= 0 ? 'pos' : 'neg') + '">' + signed(c.luck) + '</span>', bar(Math.abs(c.luck) / maxLuck, c.luck >= 0 ? 'win' : 'loss'))).join('') + '</ol>');

  // Strange but true
  const counted = L.seasons.flatMap(S => S.games.filter(g => g.counts && g.a.pts > 0 && g.b.pts > 0));
  const lossHi = L.scores.filter(s => !s.won && !s.game.tie)[0];
  const winLo = [...L.scores].reverse().find(s => s.won);
  const combined = [...counted].sort((a, b) => (b.a.pts + b.b.pts) - (a.a.pts + a.b.pts));
  const closest = [...L.margins].sort((a, b) => a.margin - b.margin)[0];
  const ties = counted.filter(g => g.tie);
  const voided = L.seasons.flatMap(S => S.games.filter(g => g.played && !g.counts).flatMap(g => [{ me: g.a, g }, { me: g.b, g }])).sort((a, b) => b.me.pts - a.me.pts)[0];
  const odd = (k, v, t) => '<div class="award"><dt>' + k + '</dt><dd class="v">' + v + '</dd><dd class="t">' + t + '</dd></div>';
  let odds = '<dl class="awards">';
  if (lossHi) odds += odd('Most points in a loss', pts(lossHi.pts), esc(shortName(lossHi.name)) + ' lost to ' + esc(shortName(lossHi.opp)) + ' (' + pts(lossHi.oppPts) + '). Week ' + lossHi.week + ', ' + lossHi.year + '.');
  if (winLo) odds += odd('Fewest points in a win', pts(winLo.pts), esc(shortName(winLo.name)) + ' beat ' + esc(shortName(winLo.opp)) + ' (' + pts(winLo.oppPts) + '). Week ' + winLo.week + ', ' + winLo.year + '.');
  if (combined[0]) { const g = combined[0]; odds += odd('Highest-scoring game', pts(g.a.pts + g.b.pts), esc(shortName(g.a.name)) + ' ' + pts(g.a.pts) + ', ' + esc(shortName(g.b.name)) + ' ' + pts(g.b.pts) + '. Week ' + g.week + ', ' + g.year + '.'); }
  if (combined.length) { const g = combined[combined.length - 1]; odds += odd('Lowest-scoring game', pts(g.a.pts + g.b.pts), esc(shortName(g.a.name)) + ' ' + pts(g.a.pts) + ', ' + esc(shortName(g.b.name)) + ' ' + pts(g.b.pts) + '. Week ' + g.week + ', ' + g.year + '.'); }
  if (closest) odds += odd('Closest game', pts(closest.margin), esc(shortName(closest.w.name)) + ' over ' + esc(shortName(closest.l.name)) + ', ' + pts(closest.w.pts) + '–' + pts(closest.l.pts) + '. Week ' + closest.week + ', ' + closest.year + '.');
  if (ties.length) odds += odd('Tied games', ties.length, ties.slice(0, 3).map(g => esc(shortName(g.a.name)) + ' and ' + esc(shortName(g.b.name)) + ', ' + g.year).join('. ') + '.');
  if (voided && hi && voided.me.pts > hi.pts) odds += odd('Best game that didn’t count', pts(voided.me.pts), esc(shortName(voided.me.name)) + ' in a consolation game. Week ' + voided.g.week + ', ' + voided.g.year + '. It would be the all-time record.');
  odds += '</dl>';
  chap('strange', 'Strange but true', 'Strange but true', 'The most painful and absurd lines in the ledger.', odds);

  chapters.sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
  const nav = '<nav class="chapnav" aria-label="Record book chapters"><div class="chips">' + chapters.map(c => '<a class="chip" href="#/records/' + c.id + '">' + c.label + '</a>').join('') + '</div></nav>';
  const html = '<h1 class="page-title" style="margin-bottom:12px">Records</h1>' + nav + chapters[0].html + '<div class="chapters">' + chapters.slice(1).map(c => c.html).join('') + '</div>';
  return { html, title: 'Records', tab: 'records', anchor: parts[1] ? 'ch-' + parts[1] : null };
}

// ── Versus ───────────────────────────────────────────────────
function viewVersus(parts) {
  const L = state.L, fr = [...L.franchises].sort((a, b) => a.teamName.localeCompare(b.teamName));
  let a = parts[1], b = parts[2];
  if (!L.career(a) || !L.career(b) || a === b) {
    // Default: this week's closest rivalry if a season is on, else the most-played series.
    let best = null;
    L.h2h.forEach((games, key) => { const n = games.filter(g => g.counts).length; if (!best || n > best.n) best = { key, n }; });
    [a, b] = best ? best.key.split('|') : [fr[0].fid, fr[1].fid];
  }
  const A = L.career(a), B = L.career(b), s = series(L, a, b);
  const opts = sel => fr.map(c => '<option value="' + c.fid + '"' + (c.fid === sel ? ' selected' : '') + '>' + esc(c.teamName) + '</option>').join('');
  const share = s.g ? (s.w + s.t / 2) / s.g : 0.5;

  let html = '<section class="section"><h1 class="page-title">Versus</h1><p class="page-sub">Pick two franchises. The ledger settles it.</p>' +
    '<div class="vs-pick" style="margin-top:16px"><select data-vs="a" aria-label="First franchise">' + opts(a) + '</select><span class="x">vs.</span><select data-vs="b" aria-label="Second franchise">' + opts(b) + '</select></div>' +
    '<div class="vs-score"><a class="nm ' + (s.w >= s.l ? 'lead' : 'trail') + '" href="#/franchise/' + a + '">' + esc(A.teamName) + '</a>' +
    '<div class="rec">' + s.w + '<span>–</span>' + s.l + (s.t ? '<span>–</span>' + s.t : '') + '</div>' +
    '<a class="nm ' + (s.l >= s.w ? 'lead' : 'trail') + '" href="#/franchise/' + b + '">' + esc(B.teamName) + '</a></div>' +
    '<div class="vs-bar" role="img" aria-label="Share of wins"><i style="width:' + (share * 100).toFixed(1) + '%"></i><i style="width:' + ((1 - share) * 100).toFixed(1) + '%"></i></div>' +
    '<div class="vs-cap"><span>' + (s.g ? f1(s.pf / s.g) + ' per game' : '') + '</span><span>' + plural(s.g, 'meeting') + ' that count</span><span>' + (s.g ? f1(s.pa / s.g) + ' per game' : '') + '</span></div></section>';

  const notes = versusNotes(L, s);
  const up = s.upcoming[0];
  const upNote = up ? (up.game.status === 'midevent' ? 'They are playing right now, Week ' + up.week + '.' : 'Next meeting: Week ' + up.week + ', ' + up.year + '.') : '';
  const notesHtml = '<section class="section mod">' + sec('The Ledger says') + (upNote ? '<p class="note next">' + esc(upNote) + '</p>' : '') + notes.map(n => '<p class="note">' + esc(n) + '</p>').join('') + '</section>';

  // Tale of the tape
  const tape = [
    ['Record', c => rec(c.w, c.l, c.t), c => c.winPct],
    ['Win %', c => pct(c.winPct), c => c.winPct],
    ['Championships', c => c.titles, c => c.titles],
    ['Finals', c => c.finals, c => c.finals],
    ['Playoff trips', c => c.playoffApps, c => c.playoffApps],
    ['Playoff record', c => rec(c.poW, c.poL), c => c.poW - c.poL],
    ['Points per game', c => f1(c.ppg), c => c.ppg],
    ['Highest score', c => (c.high ? pts(c.high.pts) : '–'), c => (c.high ? c.high.pts : 0)],
    ['10-win seasons', c => c.tenWin, c => c.tenWin],
    ['Schedule luck', c => signed(c.luck), null],
  ];
  let edgeA = 0, edgeB = 0, cats = 0;
  const tapeRows = tape.map(([k, show, val]) => {
    let ca = '', cb = '';
    if (val) { cats++; const va = val(A), vb = val(B); if (va > vb) { ca = 'best'; edgeA++; } else if (vb > va) { cb = 'best'; edgeB++; } }
    return '<tr><td class="a ' + ca + '">' + show(A) + '</td><td class="k">' + k + '</td><td class="b ' + cb + '">' + show(B) + '</td></tr>';
  }).join('');
  const edge = edgeA === edgeB ? 'Dead even across ' + cats + ' career categories.' : esc(shortName(edgeA > edgeB ? A.teamName : B.teamName)) + ' leads ' + Math.max(edgeA, edgeB) + ' of ' + cats + ' career categories.';
  const tapeHtml = '<section class="section mod">' + sec('Tale of the tape', edge) + '<table class="tape"><tbody>' + tapeRows + '</tbody></table></section>';

  // Game log
  const log = [...s.meetings].reverse().map(m => {
    const hiA = m.me.pts >= m.opp.pts;
    const tag = m.kind === 'playoff' ? ROUND_NAME[m.round] : m.kind === 'consolation' ? 'Consolation, doesn’t count' : '';
    return '<li class="' + (m.counts ? '' : 'void') + '"><span class="when">' + m.year + ' Wk ' + m.week + '</span><span class="sc"><b class="' + (hiA ? '' : 'lo') + '">' + pts(m.me.pts) + '</b> – <b class="' + (hiA ? 'lo' : '') + '">' + pts(m.opp.pts) + '</b>' + (tag ? '<small>' + tag + '</small>' : '') + '</span>' +
      '<span class="r ' + (m.counts ? m.res.toLowerCase() : 't') + '">' + (m.counts ? m.res : '·') + '</span></li>';
  }).join('');
  const logHtml = '<section class="section mod">' + sec('Every meeting', 'Newest first. W and L are from ' + shortName(A.teamName) + '’s side.') + (log ? '<ul class="log">' + log + '</ul>' : '<p class="empty">They haven’t played yet.</p>') + '</section>';

  html += '<div class="cols even"><div>' + notesHtml + tapeHtml + '</div><div>' + logHtml + '</div></div>';

  // The whole league at once
  const order = [...L.franchises].sort((x, y) => y.winPct - x.winPct);
  const abbr = n => { const s2 = shortName(n).replace(/^The /, ''); return s2.length > 9 ? s2.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 4) : s2; };
  let grid = '<div class="tbl-wrap"><table class="grid-h2h"><thead><tr><th></th>' + order.map(c => '<th title="' + esc(c.teamName) + '">' + esc(abbr(c.teamName)) + '</th>').join('') + '</tr></thead><tbody>';
  order.forEach(r => {
    grid += '<tr><th class="rowh">' + esc(shortName(r.teamName)) + '</th>' + order.map(c => {
      if (r === c) return '<td class="self">·</td>';
      const x = series(L, r.fid, c.fid);
      const k = x.w > x.l ? (x.w - x.l >= 5 ? 'own' : 'up') : x.w < x.l ? (x.l - x.w >= 5 ? 'owned' : 'dn') : '';
      return '<td class="' + k + '"><a href="#/versus/' + r.fid + '/' + c.fid + '" aria-label="' + esc(r.teamName + ' versus ' + c.teamName) + '">' + x.w + '–' + x.l + '</a></td>';
    }).join('') + '</tr>';
  });
  grid += '</tbody></table></div>';
  html += '<section class="section mod">' + sec('Everyone against everyone', 'Read across: the row’s record against the column. Shaded cells are a lead of five or more.') + grid + '</section>';

  return { html, title: shortName(A.teamName) + ' vs. ' + shortName(B.teamName), tab: 'versus' };
}

function notFound(msg) {
  return { html: '<p class="empty"><b>' + esc(msg) + '</b> <a class="more" href="#/">Back to the front page</a></p>', title: 'Not found', tab: '' };
}

// ── Router + rendering ───────────────────────────────────────
const ROUTES = { '': viewNow, now: viewNow, seasons: viewSeasons, season: viewSeason, franchises: viewFranchises, franchise: viewFranchise, records: viewRecords, versus: viewVersus };
const LEGACY_VIEWS = { home: '', champions: 'seasons', standings: 'franchises', records: 'records', seasons: 'seasons', managers: 'franchises', compare: 'versus' };

function currentParts() {
  return decodeURIComponent(location.hash.replace(/^#\/?/, '')).split('/').filter(Boolean);
}

function render({ keepScroll = false } = {}) {
  if (!state.L) return;
  const parts = currentParts();
  const view = ROUTES[parts[0] || ''] || (() => notFound('That page doesn’t exist.'));
  const out = view(parts);
  const el = document.getElementById('view');
  const path = parts.join('/');
  const samePage = keepScroll || path === state.lastPath;
  el.innerHTML = out.html;
  document.title = (out.title ? out.title + ' · ' : '') + 'The BKGFFL Ledger';
  document.querySelectorAll('#tabs a').forEach(a => {
    const on = a.dataset.tab === out.tab;
    a.classList.toggle('on', on);
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });

  // Flash any score that changed since the last paint.
  el.querySelectorAll('.score[data-k]').forEach(n => {
    const prev = state.prevScores.get(n.dataset.k);
    if (prev !== undefined && prev !== n.dataset.v) n.classList.add('flash');
    state.prevScores.set(n.dataset.k, n.dataset.v);
  });

  if (!samePage) {
    const target = out.anchor ? document.getElementById(out.anchor) : (parts[0] === 'now' && parts[1] === 'standings' ? document.getElementById('standings') : null);
    if (target) target.scrollIntoView(); else window.scrollTo(0, 0);
  }
  if (out.anchor) el.querySelectorAll('.chapnav .chip').forEach(c => c.classList.toggle('on', c.getAttribute('href') === '#/records/' + parts[1]));
  state.lastPath = path;
  renderChrome();
}

function renderChrome() {
  const L = state.L, S = L.current, st = state.liveState;
  const status = document.getElementById('status');
  const live = isHot(S);
  status.className = cls('status', live && 'is-live');
  status.innerHTML = S ? '<span class="dot"></span>' + (live ? 'Live, week ' : 'Week ') + S.currentWeek : '';
  status.title = S ? 'Refresh scores' : '';

  const when = st.fetchedAt ? new Date(st.fetchedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : null;
  const feedLine = st.status === 'ok' ? 'Live scores from Yahoo, updated ' + when + '.'
    : st.status === 'stale' ? 'Showing scores saved ' + when + '. Can’t reach the live feed right now.'
    : st.status === 'off' ? 'Live scores aren’t connected, so this is the archive only.' : '';
  const synced = state.archive.pulled_at ? new Date(state.archive.pulled_at.replace(' ', 'T') + 'Z') : null;
  const archived = synced && !isNaN(synced) ? ' Archive last synced ' + synced.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + '.' : '';
  document.getElementById('foot').innerHTML = '<p>The BKGFFL Ledger. ' + plural(L.totals.seasons, 'season') + ', ' + L.totals.games.toLocaleString() + ' games that count, since ' + L.firstYear + '.</p>' +
    '<p>' + feedLine + archived + '</p>' +
    '<p class="links"><a href="install.html">Add to your phone</a><button type="button" data-intro>Replay the intro</button></p>';
}

function rebuild() {
  state.L = buildLeague(mergeSeasons(state.archive.seasons, state.live));
}

// A content signature that ignores the fetch timestamp, so identical polls don't repaint.
const signature = snap => (snap && snap.season ? JSON.stringify([snap.season.current_week, snap.season.is_finished, snap.season.standings, snap.season.matchups, (snap.transactions || []).length]) : '');

function onLive(snapshot, liveState) {
  state.liveState = liveState;
  const wasPending = state.livePending;
  state.livePending = false;
  const sig = signature(snapshot);
  if (sig !== state.lastSig) {
    state.live = snapshot;
    state.lastSig = sig;
    if (state.archive) {
      rebuild();
      const editing = document.activeElement && document.activeElement.tagName === 'SELECT';
      if (!editing) render({ keepScroll: true });
    }
  } else if (state.L) { if (wasPending) render({ keepScroll: true }); else renderChrome(); }
  document.getElementById('status').classList.remove('is-busy');
}

// ── Intro film: first visit only, replayable from the footer ─
function playIntro() {
  if (document.getElementById('landing')) return;
  const el = document.createElement('div');
  el.className = 'landing'; el.id = 'landing';
  el.innerHTML = '<video class="hall-video" autoplay muted loop playsinline preload="metadata" aria-hidden="true" tabindex="-1"><source src="assets/videos/hall-intro.mp4" type="video/mp4"></video><div class="hall-scrim"></div>' +
    '<div class="landing-inner"><p class="landing-title">The <b>BKGFFL</b> Ledger</p><p class="landing-supporting">' + (state.L ? plural(state.L.totals.seasons, 'season') : 'Every season') + ' of wins, collapses, and disputed greatness.</p><button class="landing-cta" type="button">Enter the hall</button></div>';
  document.body.appendChild(el);
  const video = el.querySelector('video');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) video.pause();
  const leave = () => {
    try { localStorage.setItem('bkgffl-intro-seen', '1'); } catch (e) { /* private mode */ }
    el.classList.add('is-leaving');
    setTimeout(() => { video.pause(); el.remove(); }, 850);
  };
  el.querySelector('button').addEventListener('click', leave);
  el.querySelector('button').focus();
}

// ── Events ───────────────────────────────────────────────────
document.addEventListener('click', e => {
  const sortEl = e.target.closest('[data-sort]');
  if (sortEl) {
    const key = sortEl.dataset.sort;
    state.frSort = state.frSort.key === key && sortEl.tagName === 'TH' ? { key, dir: -state.frSort.dir } : { key, dir: -1 };
    return render({ keepScroll: true });
  }
  if (e.target.closest('[data-era-reset]')) { state.era = { from: null, to: null }; return render({ keepScroll: true }); }
  if (e.target.closest('[data-intro]')) return playIntro();
  if (e.target.closest('#status')) { document.getElementById('status').classList.add('is-busy'); feed && feed.refresh(); }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.era) {
    const L = state.L;
    let from = state.era.from || L.firstYear, to = state.era.to || L.lastYear;
    if (t.dataset.era === 'from') from = +t.value; else to = +t.value;
    if (from > to) { if (t.dataset.era === 'from') to = from; else from = to; }
    state.era = from === L.firstYear && to === L.lastYear ? { from: null, to: null } : { from, to };
    render({ keepScroll: true });
  }
  if (t.dataset.vs) {
    const parts = currentParts();
    const sels = document.querySelectorAll('[data-vs]');
    let a = sels[0].value, b = sels[1].value;
    if (a === b) { // picked the same team twice: swap rather than refuse
      const prevA = parts[1], prevB = parts[2];
      if (t.dataset.vs === 'a') b = prevA && prevA !== a ? prevA : state.L.franchises.find(c => c.fid !== a).fid;
      else a = prevB && prevB !== b ? prevB : state.L.franchises.find(c => c.fid !== b).fid;
    }
    location.hash = '#/versus/' + a + '/' + b;
  }
});
// A ring that hasn't been made yet shows a placeholder instead of a broken image.
document.addEventListener('error', e => {
  const img = e.target;
  if (img.tagName === 'IMG' && img.classList.contains('ring')) {
    const ph = document.createElement('div');
    ph.className = 'ring-ph'; ph.textContent = 'Ring to come';
    img.replaceWith(ph);
  }
}, true);
window.addEventListener('hashchange', () => render());

// ── Boot ─────────────────────────────────────────────────────
(async function boot() {
  // Old links (?view=standings) keep working.
  const legacy = new URLSearchParams(location.search).get('view');
  if (legacy && LEGACY_VIEWS[legacy] !== undefined && !location.hash) history.replaceState(null, '', location.pathname + '#/' + LEGACY_VIEWS[legacy]);

  const liveSrc = new URLSearchParams(location.search).get('feed'); // testing hook: ?feed=/api/live?week=9
  feed = createLiveFeed({ onUpdate: onLive, endpoint: liveSrc || '/api/live' });
  state.live = feed.cached();
  state.lastSig = signature(state.live);
  if (state.live) state.liveState = { status: 'stale', fetchedAt: state.live.fetched_at };
  state.livePending = !state.live;
  setTimeout(() => { if (state.livePending) { state.livePending = false; render({ keepScroll: true }); } }, 7000); // slow feed: fall back to the archive

  try {
    const resp = await fetch('data/league_data.json');
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    state.archive = await resp.json();
  } catch (err) {
    document.getElementById('view').innerHTML = '<p class="empty"><b>The ledger couldn’t be opened.</b> Check your connection and reload.</p>';
    return;
  }
  rebuild();
  render();
  let seen = false;
  try { seen = !!localStorage.getItem('bkgffl-intro-seen'); } catch (e) { seen = true; }
  if (!seen && !location.hash.replace(/^#\/?/, '')) playIntro();
  feed.start();
})();

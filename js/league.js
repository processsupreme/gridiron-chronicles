// ── THE LEAGUE ENGINE ───────────────────────────────────────
// One pass over the raw Yahoo data produces everything the app shows. Views
// never recompute a stat on their own, so a number can't disagree with itself
// between two pages. Pure functions, no DOM — runs in the browser and in Node
// (tests/engine.test.mjs).
//
// LEAGUE POLICY (the single source of truth — do not bypass):
//   · History starts in POLICY.minSeason.
//   · Only POLICY.franchises are franchises. Everyone else is a retired team:
//     their games still count for the franchises they played, and their scores
//     still appear in the record book, but they get no career page.
//   · THE CANONICAL RECORD: a game counts toward W/L/points iff it is a regular
//     season game OR on the championship chain (first round, semifinal, final).
//     Third/fifth/seventh-place games and the whole consolation bracket never
//     count for anyone.

export const POLICY = {
  minSeason: 2014,
  playoffTeams: 6,
  // Yahoo manager nickname → the human. Nicknames are how Yahoo identifies a
  // franchise across seasons (team names change yearly).
  franchises: {
    'LVC':            { person: 'Mike' },
    'Jonathan':       { person: 'Jonathan' },
    'mark':           { person: 'Mark' },
    'Bird':           { person: 'Trav' },
    'JG JR':          { person: 'JOCO' },
    'bubcon':         { person: 'Bub' },
    'B-waite':        { person: 'BensonWaite' },
    'Johnny Fantasy': { person: 'Johnny' },
    'Fuzzy':          { person: 'Fuzzy' },
    'andrew':         { person: 'Andrew' },
    'Ryan':           { person: 'Ryan' },
    'terry':          { person: 'Terry' },
  },
};

export const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const FID_BY_NICK = new Map(Object.keys(POLICY.franchises).map(n => [n, slug(n)]));
const FID_BY_NICK_LOWER = new Map(Object.keys(POLICY.franchises).map(n => [n.toLowerCase(), slug(n)]));
const NICK_BY_FID = new Map([...FID_BY_NICK].map(([n, f]) => [f, n]));

const pairKey = (k1, k2) => (k1 < k2 ? k1 + '|' + k2 : k2 + '|' + k1);
const half = t => t.w + t.t / 2; // record strength: wins + half-ties
const round2 = n => Math.round(n * 100) / 100;

// ── Season normalization ─────────────────────────────────────
function normalizeSeason(raw, nameToFid) {
  const year = raw.season;
  const poStart = raw.playoff_start_week || 15;
  const numPlayoffTeams = raw.num_playoff_teams || POLICY.playoffTeams;

  const teams = new Map();
  raw.standings.forEach(t => {
    const nick = (t.managers && t.managers[0]) || '';
    // Identity: exact nickname → case-insensitive → a team name this franchise
    // has used before (covers a manager renaming their Yahoo profile).
    const fid = FID_BY_NICK.get(nick) || FID_BY_NICK_LOWER.get(nick.toLowerCase()) || nameToFid.get(t.team_name) || null;
    teams.set(t.team_key, {
      key: t.team_key, name: t.team_name, nick, fid, year,
      rank: t.rank || 0,
      yahoo: { w: t.wins || 0, l: t.losses || 0, t: t.ties || 0, pf: t.points_for || 0, pa: t.points_against || 0 },
      playoffSeed: t.playoff_seed || null,
      clinchedFlag: !!t.clinched_playoffs,
      logo: t.logo || null,
    });
  });
  teams.forEach(t => { if (t.fid) nameToFid.set(t.name, t.fid); });

  // Games. The archive carries a known import bug: in 2021+ one week-16 playoff
  // game is repeated in week 17 with identical teams and scores. Drop repeats.
  const seenPostSig = new Set();
  const games = [];
  [...raw.matchups].sort((x, y) => x.week - y.week).forEach(m => {
    const A = teams.get(m.team1.team_key), B = teams.get(m.team2.team_key);
    if (!A || !B) return;
    const status = m.status || 'postevent';
    const ap = m.team1.points || 0, bp = m.team2.points || 0;
    const played = status === 'postevent' && (ap > 0 || bp > 0);
    const post = !!m.is_playoffs;
    if (post && played) {
      const sig = pairKey(A.key, B.key) + '|' + [ap, bp].sort((x, y) => x - y).join('|');
      if (seenPostSig.has(sig)) return;
      seenPostSig.add(sig);
    }
    const tie = played && ap === bp;
    const winner = !played || tie ? null : (m.winner_team_key || (ap > bp ? A.key : B.key));
    const side = (T, raw, pts) => ({ key: T.key, name: T.name, fid: T.fid, nick: T.nick, pts,
      proj: raw.projected ?? null, prob: raw.win_prob ?? null });
    games.push({
      id: year + ':' + m.week + ':' + pairKey(A.key, B.key),
      year, week: m.week, status, played, tie, winner,
      a: side(A, m.team1, ap), b: side(B, m.team2, bp),
      post, kind: post ? 'consolation' : 'reg', round: null,
      flaggedConsolation: !!m.is_consolation,
      counts: false, // set below
    });
  });

  // ── Championship chain (forward trace) ──
  // Start with the playoff field; each round, only games between two teams
  // still alive are real. Losers drop out, so placement games never qualify.
  const postGames = games.filter(g => g.post);
  const postWeeks = [...new Set(postGames.map(g => g.week))].sort((x, y) => x - y);
  const complete = !!raw.champion || !!raw.is_finished;
  const currentWeek = raw.current_week || (games.length ? games[games.length - 1].week : 1);
  const regGames = games.filter(g => !g.post);
  const regDone = complete || (regGames.length > 0 && regGames.every(g => g.played) && currentWeek >= poStart);

  const teamList = [...teams.values()];
  // Yahoo reports a provisional playoff_seed for every team all season long,
  // so the field only exists once the regular season is actually over.
  const anySeed = teamList.some(t => t.playoffSeed);
  let field = [];
  if (regDone) {
    if (anySeed) field = teamList.filter(t => t.playoffSeed && t.playoffSeed <= numPlayoffTeams);
    else if (complete) field = teamList.filter(t => t.rank && t.rank <= numPlayoffTeams);
    else field = [...teamList].sort((x, y) => (y.yahoo.w + y.yahoo.t / 2) - (x.yahoo.w + x.yahoo.t / 2) || y.yahoo.pf - x.yahoo.pf).slice(0, numPlayoffTeams);
  }
  const fieldKeys = new Set(field.map(t => t.key));
  const alive = new Set(fieldKeys);
  const rounds = fieldKeys.size > 4 ? ['R1', 'SF', 'F'] : ['SF', 'F'];
  const bracket = { R1: [], SF: [], F: [] };
  postWeeks.slice(0, rounds.length).forEach((wk, i) => {
    const round = rounds[i];
    const real = postGames.filter(g => g.week === wk && alive.has(g.a.key) && alive.has(g.b.key) && !g.flaggedConsolation);
    real.forEach(g => { g.kind = 'playoff'; g.round = round; bracket[round].push(g); });
    real.forEach(g => { if (g.played && g.winner) alive.delete(g.winner === g.a.key ? g.b.key : g.a.key); });
  });
  games.forEach(g => { g.counts = g.played && g.kind !== 'consolation'; });

  // Byes: playoff teams that sat out the first round.
  const r1Keys = new Set(bracket.R1.flatMap(g => [g.a.key, g.b.key]));
  const byeKeys = new Set(rounds.length === 3 && bracket.R1.length ? [...fieldKeys].filter(k => !r1Keys.has(k)) : []);

  // Champion / runner-up from the final itself.
  const final = bracket.F.find(g => g.played && g.winner) || null;
  let championKey = final ? final.winner : (raw.champion ? raw.champion.team_key : null);
  let runnerUpKey = final ? (final.winner === final.a.key ? final.b.key : final.a.key) : (raw.runner_up ? raw.runner_up.team_key : null);
  let finalScore = final
    ? { champ: final.winner === final.a.key ? final.a.pts : final.b.pts, runner: final.winner === final.a.key ? final.b.pts : final.a.pts }
    : (raw.champ_score > 0 ? { champ: raw.champ_score, runner: raw.runner_score } : null);

  // ── Per-team season line (from games, so it obeys the canonical rule) ──
  teamList.forEach(t => {
    Object.assign(t, {
      reg: { w: 0, l: 0, t: 0, pf: 0, pa: 0, g: 0 },
      po: { w: 0, l: 0, t: 0, pf: 0, pa: 0, g: 0 },
      form: [], // regular-season results in order: 'W' | 'L' | 'T'
      madePlayoffs: fieldKeys.has(t.key),
      bye: byeKeys.has(t.key),
      champion: t.key === championKey && (complete || !!final),
      runnerUp: t.key === runnerUpKey && (complete || !!final),
      allPlay: { w: 0, l: 0, t: 0, exp: 0 },
    });
  });
  games.forEach(g => {
    if (!g.counts) return;
    [[g.a, g.b], [g.b, g.a]].forEach(([me, opp]) => {
      const T = teams.get(me.key);
      const bucket = g.kind === 'reg' ? T.reg : T.po;
      bucket.g++; bucket.pf += me.pts; bucket.pa += opp.pts;
      const res = g.tie ? 'T' : g.winner === me.key ? 'W' : 'L';
      bucket[res.toLowerCase()]++;
      if (g.kind === 'reg') T.form.push(res);
    });
  });

  // All-play: each regular-season week, how many of the other teams would you have beaten?
  const byWeek = new Map();
  games.forEach(g => {
    if (g.kind !== 'reg' || !g.played) return;
    if (!byWeek.has(g.week)) byWeek.set(g.week, []);
    byWeek.get(g.week).push([g.a.key, g.a.pts], [g.b.key, g.b.pts]);
  });
  byWeek.forEach(scores => {
    scores.forEach(([key, pts]) => {
      const T = teams.get(key);
      let w = 0, t = 0;
      scores.forEach(([k2, p2]) => { if (k2 === key) return; if (pts > p2) w++; else if (pts === p2) t++; });
      const n = scores.length - 1;
      T.allPlay.w += w; T.allPlay.t += t; T.allPlay.l += n - w - t;
      T.allPlay.exp += n ? (w + t / 2) / n : 0;
    });
  });

  // Seeds and results.
  const seedOrder = [...teamList].sort((x, y) => half(y.reg) - half(x.reg) || y.reg.pf - x.reg.pf);
  teamList.forEach(t => { t.seed = (regDone && t.playoffSeed) || seedOrder.indexOf(t) + 1; });
  const lostIn = {};
  ['R1', 'SF', 'F'].forEach(r => bracket[r].forEach(g => {
    if (g.played && g.winner) lostIn[g.winner === g.a.key ? g.b.key : g.a.key] = r;
  }));
  teamList.forEach(t => {
    t.luck = t.reg.w + t.reg.t / 2 - t.allPlay.exp;
    if (t.champion) t.result = 'champion';
    else if (lostIn[t.key] === 'F') t.result = 'runner-up';
    else if (lostIn[t.key] === 'SF') t.result = 'semifinal';
    else if (lostIn[t.key] === 'R1') t.result = 'first-round';
    else if (t.madePlayoffs) t.result = complete ? 'playoffs' : 'alive';
    else t.result = regDone ? 'missed' : null;
  });

  // Standings order: final rank once Yahoo has one that means something, else by record.
  const table = [...teamList].sort((x, y) => (x.rank || 99) - (y.rank || 99) || half(y.reg) - half(x.reg) || y.reg.pf - x.reg.pf);

  const lastPlayedWeek = games.reduce((mx, g) => (g.played ? Math.max(mx, g.week) : mx), 0);
  // Yahoo marks the whole week "midevent" from Tuesday; it is only live once someone has scored.
  const weekUnderway = games.some(g => g.status === 'midevent');
  const liveNow = games.some(g => g.status === 'midevent' && (g.a.pts > 0 || g.b.pts > 0));

  return {
    year, leagueKey: raw.league_key || '', poStart, numPlayoffTeams,
    startWeek: raw.start_week || 1, endWeek: raw.end_week || (postWeeks.length ? postWeeks[postWeeks.length - 1] : poStart + 2),
    currentWeek, lastPlayedWeek, complete, regDone, liveNow, weekUnderway,
    teams, table, games, bracket, rounds, postWeeks,
    champion: championKey && (complete || final) ? teams.get(championKey) || null : null,
    runnerUp: runnerUpKey && (complete || final) ? teams.get(runnerUpKey) || null : null,
    championName: raw.champion ? raw.champion.team_name : null,
    final, finalScore,
  };
}

// ── Franchise careers ────────────────────────────────────────
function emptyCareer(fid) {
  const nick = NICK_BY_FID.get(fid);
  return {
    fid, nick, person: POLICY.franchises[nick].person,
    teamName: '', teamNames: [], // [{name, from, to}]
    seasons: [], // per-season rows, oldest first
    w: 0, l: 0, t: 0, g: 0, pf: 0, pa: 0,
    regW: 0, regL: 0, regT: 0, poW: 0, poL: 0, poG: 0,
    titles: 0, titleYears: [], runnerUps: 0, runnerUpYears: [], playoffApps: 0, byes: 0, tenWin: 0,
    seasonsPlayed: 0, seasonsCompleted: 0, losingSeasons: 0,
    high: null, low: null, scores: [],
    bestWinStreak: { len: 0, year: null }, bestLossStreak: { len: 0, year: null },
    allPlay: { w: 0, l: 0, t: 0, exp: 0 }, luck: 0,
    close: { w: 0, l: 0 }, blowouts: { dealt: 0, received: 0, maxWin: 0, maxLoss: 0 },
    upsets: 0,
  };
}

export const CLOSE_MARGIN = 5;
export const BLOWOUT_MARGIN = 20;

/**
 * Build the league.
 * @param rawSeasons  seasons[] in the archive shape (the live season, if any, already merged in)
 * @param opts.from / opts.to  restrict to a span of seasons (era filter)
 */
export function buildLeague(rawSeasons, opts = {}) {
  const from = Math.max(opts.from || POLICY.minSeason, POLICY.minSeason);
  const to = opts.to || 9999;
  const nameToFid = new Map();
  const seasons = [...rawSeasons]
    .filter(s => s.season >= POLICY.minSeason)
    .sort((a, b) => a.season - b.season)
    .map(s => normalizeSeason(s, nameToFid)) // normalize all, so name→franchise memory is complete
    .filter(s => s.year >= from && s.year <= to);

  const careers = new Map([...NICK_BY_FID.keys()].map(fid => [fid, emptyCareer(fid)]));
  const h2h = new Map(); // "fidA|fidB" (sorted) → meetings[]
  const scores = [];   // every counted team-score
  const margins = [];  // every counted decided game
  const seasonLines = []; // every team-season (incl. retired teams)

  seasons.forEach(S => {
    S.teams.forEach(T => {
      seasonLines.push({ year: S.year, team: T, complete: S.complete, regDone: S.regDone });
      if (!T.fid) return;
      const c = careers.get(T.fid);
      const row = {
        year: S.year, team: T, complete: S.complete,
        w: T.reg.w + T.po.w, l: T.reg.l + T.po.l, t: T.reg.t + T.po.t,
      };
      c.seasons.push(row);
      c.seasonsPlayed++;
      if (S.complete) c.seasonsCompleted++;
      c.teamName = T.name;
      const lastName = c.teamNames[c.teamNames.length - 1];
      if (lastName && lastName.name === T.name) lastName.to = S.year;
      else c.teamNames.push({ name: T.name, from: S.year, to: S.year });
      c.regW += T.reg.w; c.regL += T.reg.l; c.regT += T.reg.t;
      c.poW += T.po.w; c.poL += T.po.l; c.poG += T.po.g;
      c.w += row.w; c.l += row.l; c.t += row.t;
      c.g += T.reg.g + T.po.g;
      c.pf += T.reg.pf + T.po.pf; c.pa += T.reg.pa + T.po.pa;
      if (T.champion) { c.titles++; c.titleYears.push(S.year); }
      if (T.runnerUp) { c.runnerUps++; c.runnerUpYears.push(S.year); }
      if (T.madePlayoffs) c.playoffApps++;
      if (T.bye) c.byes++;
      if (T.reg.w >= 10) c.tenWin++;
      if (S.regDone && T.reg.l > T.reg.w) c.losingSeasons++;
      c.allPlay.w += T.allPlay.w; c.allPlay.l += T.allPlay.l; c.allPlay.t += T.allPlay.t; c.allPlay.exp += T.allPlay.exp;

      // Streaks live inside one regular season; a tie ends both kinds.
      let run = 0, kind = null;
      T.form.forEach(r => {
        if (r === kind) run++; else { kind = r; run = 1; }
        if (r === 'W' && run > c.bestWinStreak.len) c.bestWinStreak = { len: run, year: S.year };
        if (r === 'L' && run > c.bestLossStreak.len) c.bestLossStreak = { len: run, year: S.year };
      });
    });

    S.games.forEach(g => {
      const aF = g.a.fid, bF = g.b.fid;
      // Meetings between two franchises are logged even when they don't count
      // (consolation), so the head-to-head page can show them greyed out.
      if (aF && bF && aF !== bF && (g.played || g.status !== 'postevent')) {
        const k = pairKey(aF, bF);
        if (!h2h.has(k)) h2h.set(k, []);
        h2h.get(k).push(g);
      }
      if (!g.counts) return;

      [[g.a, g.b], [g.b, g.a]].forEach(([me, opp]) => {
        if (me.pts > 0) scores.push({ pts: me.pts, name: me.name, fid: me.fid, nick: me.nick, year: g.year, week: g.week, kind: g.kind, round: g.round, opp: opp.name, oppPts: opp.pts, won: g.winner === me.key, game: g });
        const c = me.fid && careers.get(me.fid);
        if (!c) return;
        if (me.pts > 0) {
          c.scores.push(me.pts);
          if (!c.high || me.pts > c.high.pts) c.high = { pts: me.pts, year: g.year, week: g.week, opp: opp.name, game: g };
          if (!c.low || me.pts < c.low.pts) c.low = { pts: me.pts, year: g.year, week: g.week, opp: opp.name, game: g };
        }
      });

      if (g.a.pts > 0 && g.b.pts > 0 && !g.tie) {
        const w = g.winner === g.a.key ? g.a : g.b, l = g.winner === g.a.key ? g.b : g.a;
        const margin = round2(w.pts - l.pts);
        margins.push({ margin, w, l, year: g.year, week: g.week, kind: g.kind, round: g.round, game: g });
        if (g.kind === 'reg') {
          const cw = w.fid && careers.get(w.fid), cl = l.fid && careers.get(l.fid);
          if (margin <= CLOSE_MARGIN) { if (cw) cw.close.w++; if (cl) cl.close.l++; }
          if (margin >= BLOWOUT_MARGIN) {
            if (cw) { cw.blowouts.dealt++; cw.blowouts.maxWin = Math.max(cw.blowouts.maxWin, margin); }
            if (cl) { cl.blowouts.received++; cl.blowouts.maxLoss = Math.max(cl.blowouts.maxLoss, margin); }
          }
        } else {
          // Playoff upset: the lower seed won.
          const ws = S.teams.get(w.key).seed, ls = S.teams.get(l.key).seed;
          if (ws > ls && w.fid) careers.get(w.fid).upsets++;
        }
      }
    });
  });

  careers.forEach(c => {
    c.winPct = c.g ? c.w / c.g : 0;
    c.ppg = c.g ? c.pf / c.g : 0;
    c.papg = c.g ? c.pa / c.g : 0;
    c.diff = c.ppg - c.papg;
    c.finals = c.titles + c.runnerUps;
    c.playoffRate = c.seasonsPlayed ? c.playoffApps / c.seasonsPlayed : 0;
    c.poPct = c.poG ? c.poW / c.poG : 0;
    c.luck = c.regW + c.regT / 2 - c.allPlay.exp;
    c.firstYear = c.seasons.length ? c.seasons[0].year : null;
    c.lastYear = c.seasons.length ? c.seasons[c.seasons.length - 1].year : null;
    const n = c.scores.length;
    const mean = n ? c.scores.reduce((a, b) => a + b, 0) / n : 0;
    c.stdev = n > 1 ? Math.sqrt(c.scores.reduce((s, v) => s + (v - mean) ** 2, 0) / n) : 0;
    c.lastTitle = c.titleYears.length ? Math.max(...c.titleYears) : null;
  });

  scores.sort((a, b) => b.pts - a.pts);
  margins.sort((a, b) => b.margin - a.margin);

  const active = [...careers.values()].filter(c => c.seasonsPlayed > 0);
  const latest = seasons[seasons.length - 1] || null;
  const completeSeasons = seasons.filter(s => s.complete);
  const latestComplete = completeSeasons[completeSeasons.length - 1] || null;
  // Title droughts are measured to the last season that crowned someone.
  const droughtYear = latestComplete ? latestComplete.year : (latest ? latest.year : POLICY.minSeason);
  active.forEach(c => {
    c.drought = c.lastTitle ? droughtYear - c.lastTitle : null; // null = never won
    c.waiting = c.lastTitle ? c.drought : c.seasonsCompleted;
  });

  const L = {
    policy: POLICY, seasons, careers, franchises: active, h2h, scores, margins, seasonLines,
    latest, latestComplete, current: latest && !latest.complete ? latest : null,
    firstYear: seasons.length ? seasons[0].year : POLICY.minSeason,
    lastYear: latest ? latest.year : POLICY.minSeason,
    season: y => seasons.find(s => s.year === +y) || null,
    career: fid => careers.get(fid) || null,
  };
  L.totals = {
    seasons: seasons.length,
    games: seasons.reduce((n, s) => n + s.games.filter(g => g.counts).length, 0),
    champions: new Set(completeSeasons.map(s => s.champion ? (s.champion.fid || s.champion.name) : null).filter(Boolean)).size,
  };
  return L;
}

// ── Queries ──────────────────────────────────────────────────

/** Head-to-head between two franchises, from A's point of view. */
export function series(L, fidA, fidB) {
  const all = (L.h2h.get(pairKey(fidA, fidB)) || []).slice().sort((x, y) => x.year - y.year || x.week - y.week);
  const out = { a: fidA, b: fidB, w: 0, l: 0, t: 0, pf: 0, pa: 0, g: 0, poW: 0, poL: 0, meetings: [], counted: [], streak: null, biggest: { a: null, b: null }, last: null, upcoming: [] };
  all.forEach(g => {
    const me = g.a.fid === fidA ? g.a : g.b, opp = g.a.fid === fidA ? g.b : g.a;
    const m = { game: g, year: g.year, week: g.week, me, opp, counts: g.counts, kind: g.kind, round: g.round,
      res: !g.played ? null : g.tie ? 'T' : g.winner === me.key ? 'W' : 'L', margin: round2(Math.abs(me.pts - opp.pts)) };
    if (!g.played) { out.upcoming.push(m); return; }
    out.meetings.push(m);
    if (!g.counts) return;
    out.counted.push(m);
    out.g++; out.pf += me.pts; out.pa += opp.pts;
    if (m.res === 'W') { out.w++; if (g.kind === 'playoff') out.poW++; if (!out.biggest.a || m.margin > out.biggest.a.margin) out.biggest.a = m; }
    else if (m.res === 'L') { out.l++; if (g.kind === 'playoff') out.poL++; if (!out.biggest.b || m.margin > out.biggest.b.margin) out.biggest.b = m; }
    else out.t++;
  });
  const c = out.counted;
  if (c.length) {
    out.last = c[c.length - 1];
    let n = 0;
    for (let i = c.length - 1; i >= 0 && c[i].res === out.last.res; i--) n++;
    out.streak = { res: out.last.res, len: n };
  }
  return out;
}

/** Rank of a franchise among all franchises for a numeric stat (1 = best). */
export function rankOf(L, fid, pick, { lowIsBest = false } = {}) {
  const mine = pick(L.career(fid));
  return 1 + L.franchises.filter(c => (lowIsBest ? pick(c) < mine : pick(c) > mine)).length;
}

/** Playoff-race status for an in-progress regular season. Conservative: only
 *  claims "clinched"/"eliminated" when it is certain on wins alone. */
export function playoffRace(S) {
  const spots = S.numPlayoffTeams;
  const remaining = new Map([...S.teams.keys()].map(k => [k, 0]));
  S.games.forEach(g => {
    if (g.kind !== 'reg' || g.played) return;
    remaining.set(g.a.key, remaining.get(g.a.key) + 1);
    remaining.set(g.b.key, remaining.get(g.b.key) + 1);
  });
  const rows = S.table.map(T => ({ team: T, now: half(T.reg), left: remaining.get(T.key) || 0 }));
  rows.forEach(r => { r.max = r.now + r.left; });
  const order = [...rows].sort((x, y) => y.now - x.now || y.team.reg.pf - x.team.reg.pf);
  const cut = order[spots - 1], firstOut = order[spots];
  rows.forEach(r => {
    const canCatch = rows.filter(o => o !== r && o.max >= r.now).length;   // teams that could finish level or ahead
    const alreadyAhead = rows.filter(o => o !== r && o.now > r.max).length; // teams out of reach
    const canCatchForBye = canCatch;
    r.clinched = S.regDone ? r.team.madePlayoffs : (r.team.clinchedFlag || canCatch < spots);
    r.clinchedBye = S.regDone ? r.team.bye : canCatchForBye < 2;
    r.eliminated = S.regDone ? !r.team.madePlayoffs : alreadyAhead >= spots;
    r.pos = order.indexOf(r) + 1;
    r.inField = r.pos <= spots;
    r.gamesBack = r.inField ? 0 : (cut ? cut.now - r.now : 0);
    r.cushion = r.inField && firstOut ? r.now - firstOut.now : 0;
  });
  return { rows, order, spots, weeksLeft: Math.max(0, ...rows.map(r => r.left)) };
}

/** Awards for one completed week of a season. */
export function weekAwards(S, week) {
  const gs = S.games.filter(g => g.week === week && g.played);
  if (!gs.length) return null;
  const sides = gs.flatMap(g => [{ me: g.a, opp: g.b, g }, { me: g.b, opp: g.a, g }]);
  const byPts = [...sides].sort((x, y) => y.me.pts - x.me.pts);
  const decided = gs.filter(g => !g.tie).map(g => {
    const w = g.winner === g.a.key ? g.a : g.b, l = g.winner === g.a.key ? g.b : g.a;
    return { g, w, l, margin: round2(w.pts - l.pts) };
  }).sort((x, y) => y.margin - x.margin);
  const rankOfSide = s => byPts.indexOf(s) + 1;
  const losers = sides.filter(s => !s.g.tie && s.g.winner !== s.me.key).sort((x, y) => y.me.pts - x.me.pts);
  const winners = sides.filter(s => !s.g.tie && s.g.winner === s.me.key).sort((x, y) => x.me.pts - y.me.pts);
  const n = sides.length;
  return {
    week, games: gs,
    high: byPts[0], low: byPts[n - 1],
    blowout: decided[0] || null, nailbiter: decided[decided.length - 1] || null,
    // Bad beat: outscored at least two-thirds of the league and still lost.
    badBeat: losers[0] && rankOfSide(losers[0]) <= Math.ceil(n / 3) ? { ...losers[0], rank: rankOfSide(losers[0]) } : null,
    // Lucky win: bottom third in scoring, but won.
    luckyWin: winners[0] && rankOfSide(winners[0]) > n - Math.ceil(n / 3) ? { ...winners[0], rank: rankOfSide(winners[0]) } : null,
  };
}

export const ordinal = n => {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

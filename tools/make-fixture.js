// Builds a realistic /api/live response WITHOUT talking to Yahoo, by replaying
// the most recent archived season as if it were next year's, frozen at a chosen
// moment. Used by `node tools/dev.js --fixture` and by the tests, so the live
// UI can be built and checked in the offseason or without credentials.
//
//   week   1..17  the "current" week
//   phase  pre | mid | post   state of that week's games
//   week 18 (or phase "final") means the season is over.

'use strict';

const fs = require('fs');
const path = require('path');

function makeFixture({ week = 12, phase = 'mid', source } = {}) {
  const data = source || JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'league_data.json'), 'utf8'));
  const base = data.seasons[data.seasons.length - 1];
  const season = base.season + 1;
  const prefix = '999.l.1';
  const rekey = k => prefix + '.t.' + k.split('.t.')[1];
  const finished = week > 17 || phase === 'final';
  if (finished) { week = 17; phase = 'post'; }

  // Drop the archive's ghost duplicates (a week-16 game repeated in week 17).
  const seenSig = new Set();
  const games = base.matchups.filter(m => {
    const sig = [m.team1.team_key, m.team2.team_key].sort().join('|') + '|' + [m.team1.points, m.team2.points].sort().join('|');
    if (seenSig.has(sig)) return false;
    seenSig.add(sig);
    return true;
  });

  const poStart = base.playoff_start_week;
  const stateOf = w => (w < week ? 'postevent' : w > week ? 'preevent' : { pre: 'preevent', mid: 'midevent', post: 'postevent' }[phase]);
  const finalRank = new Map(base.standings.map(t => [t.team_key, t.rank]));

  // Playoff games only exist once the bracket reaches them.
  const visible = games.filter(m => !m.is_playoffs || m.week <= week);

  const matchups = visible.map((m, i) => {
    const status = stateOf(m.week);
    const side = (t, share) => ({
      team_key: rekey(t.team_key),
      team_name: t.team_name,
      points: status === 'postevent' ? t.points : status === 'midevent' ? Math.round(t.points * share * 100) / 100 : 0,
      projected: status === 'postevent' ? t.points : Math.round((t.points * 0.9 + 12) * 100) / 100,
      win_prob: null,
    });
    // Mid-week: each team has banked a different share of its eventual score.
    const s1 = 0.35 + ((i * 37) % 50) / 100, s2 = 0.35 + ((i * 53) % 50) / 100;
    const t1 = side(m.team1, s1), t2 = side(m.team2, s2);
    if (status !== 'postevent') {
      const edge = (t1.projected - t2.projected) / 110;
      t1.win_prob = Math.max(0.03, Math.min(0.97, Math.round((0.5 + edge) * 100) / 100));
      t2.win_prob = Math.round((1 - t1.win_prob) * 100) / 100;
    }
    const tied = m.team1.points === m.team2.points;
    // Yahoo flags everything outside the title bracket as consolation.
    const consolation = m.is_playoffs && (finalRank.get(m.team1.team_key) > 6 || finalRank.get(m.team2.team_key) > 6);
    return {
      week: m.week, week_start: null, week_end: null, status,
      team1: t1, team2: t2,
      winner_team_key: status === 'postevent' && !tied ? rekey(m.winner_team_key) : '',
      is_tied: status === 'postevent' && tied,
      is_playoffs: !!m.is_playoffs, is_consolation: consolation, is_championship: false,
    };
  });

  // Standings through completed regular-season weeks.
  const rec = {};
  base.standings.forEach(t => { rec[rekey(t.team_key)] = { w: 0, l: 0, t: 0, pf: 0, pa: 0, run: [] }; });
  matchups.filter(m => m.status === 'postevent' && !m.is_playoffs).forEach(m => {
    const a = rec[m.team1.team_key], b = rec[m.team2.team_key];
    a.pf += m.team1.points; a.pa += m.team2.points; b.pf += m.team2.points; b.pa += m.team1.points;
    if (m.is_tied) { a.t++; b.t++; a.run.push('T'); b.run.push('T'); }
    else if (m.winner_team_key === m.team1.team_key) { a.w++; b.l++; a.run.push('W'); b.run.push('L'); }
    else { b.w++; a.l++; b.run.push('W'); a.run.push('L'); }
  });
  const regularSeasonDone = week >= poStart;
  const order = base.standings.map(t => rekey(t.team_key)).sort((x, y) =>
    (rec[y].w + rec[y].t / 2) - (rec[x].w + rec[x].t / 2) || rec[y].pf - rec[x].pf);
  const standings = base.standings.map(t => {
    const key = rekey(t.team_key), r = rec[key];
    const last = r.run[r.run.length - 1];
    let n = 0;
    for (let i = r.run.length - 1; i >= 0 && r.run[i] === last; i--) n++;
    const seed = order.indexOf(key) + 1;
    return {
      team_key: key, team_name: t.team_name, managers: t.managers, logo: null,
      rank: finished ? t.rank : seed,
      playoff_seed: regularSeasonDone && seed <= 6 ? seed : null,
      clinched_playoffs: regularSeasonDone && seed <= 6,
      wins: r.w, losses: r.l, ties: r.t,
      points_for: Math.round(r.pf * 100) / 100, points_against: Math.round(r.pa * 100) / 100,
      streak: last ? { type: last === 'W' ? 'win' : last === 'L' ? 'loss' : 'tie', value: n } : null,
    };
  }).sort((a, b) => a.rank - b.rank);

  const names = standings.map(t => t.team_name);
  const now = Date.now();
  const transactions = [
    { id: 'fx1', type: 'add/drop', status: 'successful', ts: now - 2 * 3600e3, moves: [
      { player: 'Rico Dowdle', pos: 'RB', nfl: 'CAR', action: 'add', from: 'waivers', to: names[3] },
      { player: 'Jerome Ford', pos: 'RB', nfl: 'CLE', action: 'drop', from: names[3], to: 'waivers' } ] },
    { id: 'fx2', type: 'trade', status: 'successful', ts: now - 26 * 3600e3, moves: [
      { player: 'George Pickens', pos: 'WR', nfl: 'DAL', action: 'trade', from: names[0], to: names[5] },
      { player: 'Kyren Williams', pos: 'RB', nfl: 'LAR', action: 'trade', from: names[5], to: names[0] } ] },
    { id: 'fx3', type: 'add', status: 'successful', ts: now - 50 * 3600e3, moves: [
      { player: 'Browns D/ST', pos: 'DEF', nfl: 'CLE', action: 'add', from: 'freeagents', to: names[8] } ] },
  ];

  return {
    ok: true,
    fixture: true,
    fetched_at: new Date().toISOString(),
    season: {
      season, league_key: prefix, league_name: base.league_name, num_teams: base.num_teams,
      playoff_start_week: poStart, num_playoff_teams: 6, start_week: 1, end_week: 17,
      current_week: week, is_finished: finished, draft_status: 'postdraft',
      champion: null, runner_up: null, standings, matchups, partial: false,
    },
    transactions,
  };
}

module.exports = { makeFixture };

if (require.main === module) {
  const [week, phase] = process.argv.slice(2);
  process.stdout.write(JSON.stringify(makeFixture({ week: week ? +week : 12, phase: phase || 'mid' }), null, 1));
}

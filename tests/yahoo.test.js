// Tests for the Yahoo client's parsing and the archive sync, using responses
// built in Yahoo's (odd) JSON shape. No network.  Run:  node tests/yahoo.test.js
'use strict';
const assert = require('assert');
const yahoo = require('../api/_yahoo');
const { makeFixture } = require('../tools/make-fixture');
const { toArchiveSeason } = require('../tools/sync-archive');

let n = 0;
const test = (name, fn) => Promise.resolve().then(fn).then(() => { n++; }, e => { console.log('FAIL ' + name + '\n  ' + e.message); process.exitCode = 1; });

// Yahoo collections: {"0": {...}, "1": {...}, "count": 2}
const coll = (items, key) => Object.assign({ count: items.length }, ...items.map((it, i) => ({ [i]: { [key]: it } })));
const teamMeta = (id, name, nick) => [
  { team_key: '999.l.1.t.' + id }, { team_id: String(id) }, { name }, [], { url: 'https://x' },
  { team_logos: [{ team_logo: { size: 'large', url: 'https://logo/' + id } }] }, [],
  { managers: [{ manager: { manager_id: '1', nickname: nick, guid: 'G' + id } }] },
];
const standTeam = (id, name, nick, rank, w, l, pf, pa) => [teamMeta(id, name, nick), { team_points: { coverage_type: 'season', total: String(pf) } },
  { team_standings: { rank: String(rank), playoff_seed: String(rank), outcome_totals: { wins: String(w), losses: String(l), ties: 0, percentage: '.5' }, streak: { type: 'win', value: '3' }, points_for: String(pf), points_against: String(pa) } }];
const boardTeam = (id, name, nick, pts, proj, prob) => [teamMeta(id, name, nick), { win_probability: prob, team_points: { coverage_type: 'week', week: '12', total: String(pts) }, team_projected_points: { coverage_type: 'week', week: '12', total: String(proj) } }];
const matchup = (week, status, a, b, extra = {}) => Object.assign({ week: String(week), week_start: '2026-11-24', week_end: '2026-11-30', status, is_playoffs: '0', is_consolation: '0', is_tied: 0,
  0: { teams: coll([a, b], 'team') } }, extra);

const leagueJson = { fantasy_content: { league: [
  { league_key: '999.l.1', league_id: '1', name: 'BKGFFL', num_teams: 2, current_week: '12', start_week: '1', end_week: '17', season: '2026', renewed: '' },
  { settings: [{ playoff_start_week: '15', num_playoff_teams: '6', uses_playoff: '1' }] },
  { standings: [{ teams: coll([standTeam(1, 'LVC', 'LVC', 1, 8, 3, 1300.5, 1100), standTeam(2, 'Team <b>Beef</b>', 'Bird', 2, 7, 4, 1250.25, 1150)], 'team') }] },
  { scoreboard: { week: '12', 0: { matchups: coll([matchup(12, 'midevent', boardTeam(1, 'LVC', 'LVC', 55.5, 120.1, 0.62), boardTeam(2, 'Team <b>Beef</b>', 'Bird', 40.25, 110, 0.38))], 'matchup') } } },
] } };

(async () => {
  await test('flat / list / find', () => {
    assert.deepStrictEqual(yahoo.flat([{ a: 1 }, [], [{ b: 2 }], { c: 3 }]), { a: 1, b: 2, c: 3 });
    assert.deepStrictEqual(yahoo.list({ 0: { team: 'x' }, 1: { team: 'y' }, count: 2 }, 'team'), ['x', 'y']);
    assert.deepStrictEqual(yahoo.list(null, 'team'), []);
    assert.strictEqual(yahoo.find({ a: [{ b: { c: 7 } }] }, 'c'), 7);
  });

  await test('standings', () => {
    const st = yahoo.parseStandings(leagueJson);
    assert.strictEqual(st.length, 2);
    assert.deepStrictEqual({ ...st[0], logo: null }, { team_key: '999.l.1.t.1', team_name: 'LVC', managers: ['LVC'], logo: null, rank: 1, playoff_seed: 1, clinched_playoffs: false, wins: 8, losses: 3, ties: 0, points_for: 1300.5, points_against: 1100, streak: { type: 'win', value: 3 } });
  });

  await test('scoreboard: live game has no winner yet', () => {
    const [m] = yahoo.parseScoreboard(leagueJson);
    assert.strictEqual(m.week, 12);
    assert.strictEqual(m.status, 'midevent');
    assert.strictEqual(m.winner_team_key, '');
    assert.strictEqual(m.team1.points, 55.5);
    assert.strictEqual(m.team1.projected, 120.1);
    assert.strictEqual(m.team1.win_prob, 0.62);
    assert.strictEqual(m.team2.team_name, 'Team <b>Beef</b>');
  });

  await test('finished and tied games', () => {
    const done = yahoo.parseMatchup(matchup(3, 'postevent', boardTeam(1, 'A', 'a', 100, 90, 1), boardTeam(2, 'B', 'b', 90, 95, 0), { winner_team_key: '999.l.1.t.1' }));
    assert.strictEqual(done.winner_team_key, '999.l.1.t.1');
    const tie = yahoo.parseMatchup(matchup(3, 'postevent', boardTeam(1, 'A', 'a', 100, 90, 1), boardTeam(2, 'B', 'b', 100, 95, 0), { is_tied: 1 }));
    assert.strictEqual(tie.winner_team_key, '');
    assert.strictEqual(tie.is_tied, true);
    const po = yahoo.parseMatchup(matchup(15, 'preevent', boardTeam(1, 'A', 'a', 0, 90, 0.5), boardTeam(2, 'B', 'b', 0, 95, 0.5), { is_playoffs: '1', is_consolation: '1' }));
    assert.ok(po.is_playoffs && po.is_consolation);
  });

  await test('each team\'s schedule de-duplicates into one game per pair per week', () => {
    const g = () => yahoo.parseMatchup(matchup(3, 'postevent', boardTeam(1, 'A', 'a', 100, 90, 1), boardTeam(2, 'B', 'b', 90, 95, 0), { winner_team_key: '999.l.1.t.1' }));
    const flipped = yahoo.parseMatchup(matchup(3, 'postevent', boardTeam(2, 'B', 'b', 90, 95, 0), boardTeam(1, 'A', 'a', 100, 90, 1), { winner_team_key: '999.l.1.t.1' }));
    assert.strictEqual(yahoo.dedupeMatchups([g(), flipped, g()]).length, 1);
  });

  await test('transactions: adds arrive as arrays, drops as objects', () => {
    const player = (name, td) => [[{ player_key: 'p' }, { name: { full: name } }, { editorial_team_abbr: 'CLE' }, { display_position: 'RB' }], { transaction_data: td }];
    const json = { fantasy_content: { league: [{}, { transactions: coll([[
      { transaction_key: 't1', type: 'add/drop', status: 'successful', timestamp: '1795000000' },
      { players: coll([
        player('Added Guy', [{ type: 'add', source_type: 'waivers', destination_type: 'team', destination_team_key: '999.l.1.t.1', destination_team_name: 'LVC' }]),
        player('Dropped Guy', { type: 'drop', source_type: 'team', source_team_key: '999.l.1.t.1', source_team_name: 'LVC', destination_type: 'waivers' }),
      ], 'player') },
    ]], 'transaction') }] } };
    const [tx] = yahoo.parseTransactions(json, {});
    assert.strictEqual(tx.type, 'add/drop');
    assert.deepStrictEqual(tx.moves.map(m => [m.player, m.action, m.from, m.to]), [['Added Guy', 'add', 'waivers', 'LVC'], ['Dropped Guy', 'drop', 'LVC', 'waivers']]);
    assert.deepStrictEqual(yahoo.parseTransactions({ nonsense: true }, {}), []);
  });

  await test('missing credentials are reported by name, never by value', () => {
    const { missing } = yahoo.readCreds({ YAHOO_CLIENT_ID: 'x' });
    assert.deepStrictEqual(missing, ['YAHOO_CLIENT_SECRET', 'YAHOO_REFRESH_TOKEN']);
  });

  await test('API handler answers 503 (not a crash) when unconfigured', async () => {
    const saved = { ...process.env };
    delete process.env.YAHOO_CLIENT_ID; delete process.env.YAHOO_CLIENT_SECRET; delete process.env.YAHOO_REFRESH_TOKEN;
    const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(b) { this.body = b; } };
    await require('../api/live')({ method: 'GET', url: '/api/live' }, res);
    Object.assign(process.env, saved);
    assert.strictEqual(res.statusCode, 503);
    assert.strictEqual(JSON.parse(res.body).error, 'not_configured');
    assert.strictEqual(res.headers['Cache-Control'], 'no-store');
  });

  await test('sync: a finished season is archived with its champion and survives a round trip', async () => {
    const { buildLeague } = await import('../js/league.js');
    const fs = require('fs'), path = require('path');
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'league_data.json'), 'utf8'));
    const archive = data.seasons.filter(s => s.season <= 2025);
    const fx = makeFixture({ week: 18, source: { seasons: archive } }).season;
    const eng = buildLeague([...archive, toArchiveSeason(fx, null)]).season(2026);
    const baked = toArchiveSeason(fx, eng);
    assert.strictEqual(baked.champion.team_name, 'LVC');
    assert.strictEqual(baked.matchups.filter(m => m.is_championship).length, 1);
    const again = buildLeague([...archive, JSON.parse(JSON.stringify(baked))]);
    assert.strictEqual(again.season(2026).complete, true);
    assert.strictEqual(again.career('lvc').titles, 6);
    assert.strictEqual(again.current, null);
  });

  await test('sync: a season in progress is archived without partial scores', async () => {
    const { buildLeague } = await import('../js/league.js');
    const fs = require('fs'), path = require('path');
    const archive = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'league_data.json'), 'utf8')).seasons.filter(s => s.season <= 2025);
    const fx = makeFixture({ week: 9, phase: 'mid', source: { seasons: archive } }).season;
    const baked = toArchiveSeason(fx, buildLeague([...archive, toArchiveSeason(fx, null)]).season(2026));
    assert.strictEqual(baked.champion, null);
    assert.ok(baked.matchups.filter(m => m.week === 9).every(m => m.team1.points === 0 && m.status === 'preevent'));
    const L = buildLeague([...archive, baked]);
    assert.strictEqual(L.current.year, 2026);
    assert.strictEqual(L.current.lastPlayedWeek, 8);
  });

  console.log(process.exitCode ? 'FAILED' : 'ok ' + n + ' passed');
})();

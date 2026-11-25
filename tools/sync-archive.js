#!/usr/bin/env node
// Bakes the league's current Yahoo season into data/league_data.json.
//
//   node tools/sync-archive.js            write the current season into the archive
//   node tools/sync-archive.js --dry-run  show what would change, write nothing
//   node tools/sync-archive.js --force    also overwrite a season that already has a champion
//
// The live API keeps the app current minute to minute; this keeps the permanent
// record current, so the app still has this season offline or if Yahoo is down,
// and so a finished season lands in the archive without anyone running a script.
// A GitHub Action runs it twice a week (.github/workflows/sync-archive.yml).
//
// Needs YAHOO_CLIENT_ID / YAHOO_CLIENT_SECRET / YAHOO_REFRESH_TOKEN, from the
// environment or from the gitignored yahoo_creds.py (see tools/yahoo-auth.js).

'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT, loadIntoEnv } = require('./_creds');
const yahoo = require('../api/_yahoo');

const DATA_FILE = path.join(ROOT, 'data', 'league_data.json');
const args = new Set(process.argv.slice(2));

/** Live-feed season → the archive's on-disk shape. */
function toArchiveSeason(live, engineSeason) {
  const done = m => m.status === 'postevent';
  const scores = [];
  const matchups = live.matchups.map(m => {
    const out = {
      week: m.week,
      team1: { team_key: m.team1.team_key, team_name: m.team1.team_name, points: done(m) ? m.team1.points : 0 },
      team2: { team_key: m.team2.team_key, team_name: m.team2.team_name, points: done(m) ? m.team2.points : 0 },
      winner_team_key: done(m) ? m.winner_team_key : '',
      is_playoffs: m.is_playoffs,
      is_consolation: m.is_consolation,
      is_championship: false,
    };
    // Unfinished games are stored as "not yet played" so the archive never holds a partial score.
    if (!done(m)) out.status = 'preevent';
    else [out.team1, out.team2].forEach(t => { if (t.points > 0) scores.push({ points: t.points, team: t.team_name, week: m.week }); });
    return out;
  });

  const season = {
    season: live.season,
    league_key: live.league_key,
    league_name: live.league_name,
    num_teams: live.num_teams,
    playoff_start_week: live.playoff_start_week,
    num_playoff_teams: live.num_playoff_teams,
    start_week: live.start_week,
    end_week: live.end_week,
    current_week: live.current_week,
    is_finished: live.is_finished,
    champion: null,
    runner_up: null,
    standings: live.standings.map(t => ({
      team_key: t.team_key, team_name: t.team_name, managers: t.managers, rank: t.rank,
      wins: t.wins, losses: t.losses, ties: t.ties, points_for: t.points_for, points_against: t.points_against,
      ...(t.playoff_seed ? { playoff_seed: t.playoff_seed } : {}),
    })),
    matchups,
    season_high_score: scores.length ? scores.reduce((a, b) => (b.points > a.points ? b : a)) : { points: 0, team: '', week: 0 },
    season_low_score: scores.length ? scores.reduce((a, b) => (b.points < a.points ? b : a)) : { points: 0, team: '', week: 0 },
  };

  // Crown the champion from the bracket the engine traced.
  const fin = engineSeason && engineSeason.final;
  if (fin && engineSeason.champion && engineSeason.runnerUp) {
    const champ = engineSeason.champion, ru = engineSeason.runnerUp;
    season.champion = { team_key: champ.key, team_name: champ.name, points: engineSeason.finalScore.champ };
    season.runner_up = { team_key: ru.key, team_name: ru.name, points: engineSeason.finalScore.runner };
    season.champ_score = engineSeason.finalScore.champ;
    season.runner_score = engineSeason.finalScore.runner;
    const flagged = matchups.find(m => m.week === fin.week && [m.team1.team_key, m.team2.team_key].sort().join() === [champ.key, ru.key].sort().join());
    if (flagged) flagged.is_championship = true;
  }
  return season;
}

async function main() {
  loadIntoEnv();
  const { creds, missing } = yahoo.readCreds();
  if (missing.length) {
    // Not an error: lets the scheduled job no-op cleanly until secrets are added.
    console.log('Skipping sync: ' + missing.join(', ') + ' not set. Run `node tools/yahoo-auth.js` first.');
    return;
  }

  const token = await yahoo.getAccessToken(creds);
  const leagueKey = await yahoo.discoverLeagueKey(token, process.env.YAHOO_LEAGUE_KEY);
  const { season: live } = await yahoo.fetchSeason(token, leagueKey, { full: true, transactions: false });

  const played = live.matchups.filter(m => m.status === 'postevent').length;
  console.log(live.league_name + ' ' + live.season + ' (' + leagueKey + '): week ' + live.current_week + ', ' + played + ' games final, ' + live.standings.length + ' teams' + (live.is_finished ? ', season finished' : ''));
  if (!live.standings.length || !played) return console.log('Nothing to archive yet.');

  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const existing = data.seasons.find(s => s.season === live.season);
  if (existing && existing.champion && !args.has('--force')) {
    return console.log(live.season + ' is already final in the archive (champion: ' + existing.champion.team_name + '). Use --force to overwrite.');
  }

  // Trace the bracket with the same engine the app uses.
  const { buildLeague } = await import('../js/league.js');
  const draft = toArchiveSeason(live, null);
  const others = data.seasons.filter(s => s.season !== live.season);
  const engineSeason = buildLeague([...others, draft]).season(live.season);
  const season = toArchiveSeason(live, engineSeason);

  const before = existing ? JSON.stringify(existing) : '';
  if (before === JSON.stringify(season)) return console.log('Archive already up to date.');

  data.seasons = [...others, season].sort((a, b) => a.season - b.season);
  data.pulled_at = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log((existing ? 'Updating ' : 'Adding ') + live.season + (season.champion ? ' — champion: ' + season.champion.team_name : ' (in progress)'));
  if (args.has('--dry-run')) return console.log('Dry run: nothing written.');
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + '\n');
  console.log('Wrote data/league_data.json');
}

module.exports = { toArchiveSeason };

if (require.main === module) main().catch(err => { console.error('Sync failed: ' + err.message); process.exit(1); });

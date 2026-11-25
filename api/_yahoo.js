// Yahoo Fantasy client shared by the live API function (api/live.js) and the
// archive sync tool (tools/sync-archive.js). Zero dependencies; needs Node 18+
// for global fetch. Files starting with "_" are not exposed as Vercel routes.
//
// Credentials never live in this repo. They come from the environment:
//   YAHOO_CLIENT_ID, YAHOO_CLIENT_SECRET, YAHOO_REFRESH_TOKEN
// Run `node tools/yahoo-auth.js` once to mint the refresh token.

'use strict';

const TOKEN_URL = 'https://api.login.yahoo.com/oauth2/get_token';
const BASE = 'https://fantasysports.yahooapis.com/fantasy/v2';

// The most recent league key we know for certain. Each Yahoo season gets a new
// key; the league's `renewed` field points at the next one, so we walk forward
// from here and never need to hardcode a new season.
const KNOWN_LEAGUE_KEY = '461.l.99849'; // BKGFFL 2025

// ── Yahoo JSON helpers ───────────────────────────────────────
// Yahoo's JSON is XML run through a blender: collections are objects keyed
// "0".."n-1" plus a `count`, and entities are arrays of single-key objects
// (with stray empty arrays mixed in). These helpers hide that.

/** Merge an "array of single-key objects" (any nesting) into one flat object. */
function flat(x) {
  const out = {};
  (function walk(v) {
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.assign(out, v);
  })(x);
  return out;
}

/** Turn {0:{key:..}, 1:{key:..}, count:n} (or an array of the same) into a plain array. */
function list(coll, key) {
  if (!coll || typeof coll !== 'object') return [];
  const pick = e => (e && e[key] !== undefined ? e[key] : null);
  if (Array.isArray(coll)) return coll.map(pick).filter(v => v !== null);
  const out = [];
  Object.keys(coll)
    .filter(k => /^\d+$/.test(k))
    .sort((a, b) => a - b)
    .forEach(k => { const v = pick(coll[k]); if (v !== null) out.push(v); });
  return out;
}

/** Depth-first search for the first value stored under `key`. */
function find(obj, key) {
  if (!obj || typeof obj !== 'object') return undefined;
  if (!Array.isArray(obj) && Object.prototype.hasOwnProperty.call(obj, key)) return obj[key];
  const kids = Array.isArray(obj) ? obj : Object.values(obj);
  for (const k of kids) {
    const hit = find(k, key);
    if (hit !== undefined) return hit;
  }
  return undefined;
}

const num = (v, d = 0) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };
const int = (v, d = 0) => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : d; };
const yes = v => v === 1 || v === '1' || v === true;

// ── Auth ─────────────────────────────────────────────────────
function readCreds(env = process.env) {
  const creds = {
    clientId: env.YAHOO_CLIENT_ID,
    clientSecret: env.YAHOO_CLIENT_SECRET,
    refreshToken: env.YAHOO_REFRESH_TOKEN,
  };
  const missing = Object.entries({
    YAHOO_CLIENT_ID: creds.clientId,
    YAHOO_CLIENT_SECRET: creds.clientSecret,
    YAHOO_REFRESH_TOKEN: creds.refreshToken,
  }).filter(([, v]) => !v).map(([k]) => k);
  return { creds, missing };
}

let _token = null; // { value, expiresAt } — survives warm invocations

async function getAccessToken(creds) {
  if (_token && _token.expiresAt > Date.now() + 60_000) return _token.value;
  const basic = Buffer.from(creds.clientId + ':' + creds.clientSecret).toString('base64');
  const resp = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { Authorization: 'Basic ' + basic, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: creds.refreshToken }),
  });
  if (!resp.ok) {
    const err = new Error('Yahoo token refresh failed (' + resp.status + ')');
    err.code = 'auth';
    throw err;
  }
  const json = await resp.json();
  _token = { value: json.access_token, expiresAt: Date.now() + int(json.expires_in, 3600) * 1000 };
  return _token.value;
}

async function yget(token, path) {
  const url = BASE + '/' + path + (path.includes('?') ? '&' : '?') + 'format=json';
  const resp = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
  if (!resp.ok) {
    const err = new Error('Yahoo API ' + resp.status + ' for ' + path);
    err.code = resp.status === 401 ? 'auth' : 'yahoo';
    err.status = resp.status;
    throw err;
  }
  return resp.json();
}

// ── League discovery ─────────────────────────────────────────
let _leagueKey = null; // { key, checkedAt }

/** Walk the `renewed` chain to the newest season of the league. */
async function discoverLeagueKey(token, startKey) {
  if (_leagueKey && Date.now() - _leagueKey.checkedAt < 6 * 3600_000) return _leagueKey.key;
  let key = startKey || KNOWN_LEAGUE_KEY;
  for (let hop = 0; hop < 8; hop++) {
    const meta = flat(find(await yget(token, 'league/' + key + '/metadata'), 'league'));
    const renewed = String(meta.renewed || '');
    const m = renewed.match(/^(\d+)_(\d+)$/);
    if (!m) break;
    key = m[1] + '.l.' + m[2];
  }
  _leagueKey = { key, checkedAt: Date.now() };
  return key;
}

// ── Parsers ──────────────────────────────────────────────────
function parseTeamMeta(teamArr) {
  const t = flat(teamArr);
  const managers = list(t.managers, 'manager').map(m => m.nickname).filter(Boolean);
  const logo = find(t.team_logos, 'url') || null;
  return { team_key: t.team_key || '', team_name: t.name || 'Unknown', managers, logo, raw: t };
}

function parseStandings(leagueJson) {
  const teams = list(find(leagueJson, 'standings') ? find(find(leagueJson, 'standings'), 'teams') : null, 'team');
  return teams.map(teamArr => {
    const { team_key, team_name, managers, logo, raw } = parseTeamMeta(teamArr);
    const ts = raw.team_standings || {};
    const ot = ts.outcome_totals || {};
    const streak = ts.streak ? { type: ts.streak.type || '', value: int(ts.streak.value) } : null;
    return {
      team_key, team_name, managers, logo,
      rank: int(ts.rank),
      playoff_seed: ts.playoff_seed ? int(ts.playoff_seed) : null,
      clinched_playoffs: yes(raw.clinched_playoffs),
      wins: int(ot.wins), losses: int(ot.losses), ties: int(ot.ties),
      points_for: num(ts.points_for), points_against: num(ts.points_against),
      streak,
    };
  });
}

function parseMatchup(m) {
  const sides = list(find(m, 'teams'), 'team').map(teamArr => {
    const { team_key, team_name, raw } = parseTeamMeta(teamArr);
    return {
      team_key, team_name,
      points: num(raw.team_points && raw.team_points.total),
      projected: raw.team_projected_points ? num(raw.team_projected_points.total, null) : null,
      win_prob: raw.win_probability !== undefined ? num(raw.win_probability, null) : null,
    };
  });
  if (sides.length !== 2) return null;
  const status = m.status || 'postevent';
  return {
    week: int(m.week),
    week_start: m.week_start || null,
    week_end: m.week_end || null,
    status, // preevent | midevent | postevent
    team1: sides[0],
    team2: sides[1],
    winner_team_key: status === 'postevent' && !yes(m.is_tied) ? (m.winner_team_key || '') : '',
    is_tied: yes(m.is_tied),
    is_playoffs: yes(m.is_playoffs),
    is_consolation: yes(m.is_consolation),
    is_championship: false, // derived client-side from the bracket
  };
}

const matchupId = m => m.week + ':' + [m.team1.team_key, m.team2.team_key].sort().join(':');

function dedupeMatchups(matchups) {
  const seen = new Map();
  matchups.forEach(m => { if (m && m.team1.team_key && m.team2.team_key && !seen.has(matchupId(m))) seen.set(matchupId(m), m); });
  return [...seen.values()].sort((a, b) => a.week - b.week || matchupId(a).localeCompare(matchupId(b)));
}

/** Every matchup of the season in one request (each team's full schedule, de-duplicated). */
async function fetchAllMatchups(token, leagueKey) {
  const json = await yget(token, 'league/' + leagueKey + '/teams/matchups');
  const out = [];
  list(find(json, 'teams'), 'team').forEach(teamArr => {
    list(find(teamArr, 'matchups'), 'matchup').forEach(m => out.push(parseMatchup(m)));
  });
  return dedupeMatchups(out);
}

/** Fallback: one scoreboard request per week. */
async function fetchMatchupsByWeek(token, leagueKey, weeks) {
  const pages = await Promise.all(weeks.map(w =>
    yget(token, 'league/' + leagueKey + '/scoreboard;week=' + w).catch(() => null)));
  const out = [];
  pages.forEach(json => {
    if (!json) return;
    list(find(json, 'matchups'), 'matchup').forEach(m => out.push(parseMatchup(m)));
  });
  return dedupeMatchups(out);
}

function parseScoreboard(leagueJson) {
  return dedupeMatchups(list(find(find(leagueJson, 'scoreboard') || {}, 'matchups'), 'matchup').map(parseMatchup));
}

function parseTransactions(json, teamNames) {
  const out = [];
  list(find(json, 'transactions'), 'transaction').forEach(txArr => {
    try {
      const tx = flat(txArr);
      const moves = list(tx.players, 'player').map(playerArr => {
        const p = flat(playerArr);
        const td = flat(p.transaction_data); // array for adds, object for drops
        const name = (p.name && (p.name.full || p.name.first + ' ' + p.name.last)) || 'Unknown';
        return {
          player: name,
          pos: p.display_position || '',
          nfl: p.editorial_team_abbr || '',
          action: td.type || '', // add | drop | trade
          from: td.source_type === 'team' ? (td.source_team_name || teamNames[td.source_team_key] || '') : (td.source_type || ''),
          to: td.destination_type === 'team' ? (td.destination_team_name || teamNames[td.destination_team_key] || '') : (td.destination_type || ''),
        };
      });
      if (!moves.length) return;
      out.push({
        id: tx.transaction_key || '',
        type: tx.type || '', // add | drop | add/drop | trade | commish
        status: tx.status || '',
        ts: int(tx.timestamp) * 1000,
        moves,
      });
    } catch (e) { /* skip anything unexpected; the wire is a nice-to-have */ }
  });
  return out;
}

// ── Season snapshot ──────────────────────────────────────────
/**
 * Fetch the league's current season.
 *   full=true  → every week's matchups (archive-shaped, plus live extras)
 *   full=false → standings + the current week's scoreboard only (cheap; for polling)
 */
async function fetchSeason(token, leagueKey, { full = true, transactions = true } = {}) {
  const league = await yget(token, 'league/' + leagueKey + ';out=settings,standings,scoreboard');
  const meta = flat((find(league, 'league') || [])[0] || find(league, 'league'));
  const settings = flat(find(league, 'settings') || {});
  const standings = parseStandings(league);
  const currentWeek = int(meta.current_week, 1);
  const startWeek = int(meta.start_week, 1);
  const endWeek = int(meta.end_week, 17);

  let matchups = parseScoreboard(league);
  if (full) {
    let all = [];
    try { all = await fetchAllMatchups(token, leagueKey); } catch (e) { all = []; }
    if (!all.length) {
      const weeks = [];
      for (let w = startWeek; w <= endWeek; w++) weeks.push(w);
      all = await fetchMatchupsByWeek(token, leagueKey, weeks);
    }
    // The scoreboard call is the freshest view of the current week — let it win.
    const fresh = new Map(matchups.map(m => [matchupId(m), m]));
    matchups = dedupeMatchups([...matchups, ...all.filter(m => !fresh.has(matchupId(m)))]);
  }

  const teamNames = {};
  standings.forEach(t => { teamNames[t.team_key] = t.team_name; });

  let wire = [];
  if (transactions) {
    try { wire = parseTransactions(await yget(token, 'league/' + leagueKey + '/transactions;count=25'), teamNames); }
    catch (e) { wire = []; }
  }

  return {
    season: {
      season: int(meta.season),
      league_key: meta.league_key || leagueKey,
      league_name: meta.name || 'BKGFFL',
      num_teams: int(meta.num_teams, standings.length),
      playoff_start_week: int(settings.playoff_start_week, 15),
      num_playoff_teams: int(settings.num_playoff_teams, 6),
      start_week: startWeek,
      end_week: endWeek,
      current_week: currentWeek,
      is_finished: yes(meta.is_finished),
      draft_status: meta.draft_status || '',
      champion: null,
      runner_up: null,
      standings,
      matchups,
      partial: !full,
    },
    transactions: wire,
  };
}

module.exports = {
  KNOWN_LEAGUE_KEY, readCreds, getAccessToken, yget, discoverLeagueKey, fetchSeason,
  // exported for tests
  flat, list, find, parseMatchup, parseStandings, parseScoreboard, parseTransactions, dedupeMatchups,
};

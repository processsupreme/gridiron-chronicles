// ── LEAGUE DATA POLICY ──────────────────────────────────────
// Centralized filter constants — the single source of truth.
const MIN_SEASON_YEAR = 2014;
const ALLOWED_MANAGERS = new Set([
  "LVC",              // LVC
  "JG JR",            // Make Joco Great Again (MJGA)
  "Bird",             // Team Beef
  "mark",             // The Greek
  "bubcon",           // Ohio City Cons
  "terry",            // The Edmund Fitzgerald
  "Fuzzy",            // Fuz Nuts U
  "Ryan",             // Doobie Bros
  "Jonathan",         // 98
  "Johnny Fantasy",   // Johnny Fantasy
  "andrew",           // Make List Avg Again
  "B-waite",          // Opolos
]);

// Exiled franchises — NOT in ALLOWED_MANAGERS
const RETIRED_MANAGERS = new Set([
  "A D",               // All Day
  "Clarke",            // Scott's Stars
  "Budman",            // Budman
  "Mike",              // Capone
  "Tom",               // Squeeks Squad
  "frank",             // Frankyyyyy
  "RealDeal-WhatWhat", // The Hurricane
]);

/** Central filter: returns clean dataset with only allowed seasons and franchises.
 *  ALL data consumers must use this instead of reading DATA.seasons directly. */
function applyLeagueFilters(rawSeasons) {
  return rawSeasons
    .filter(s => s.season >= MIN_SEASON_YEAR)
    .map(s => {
      // Filter standings to allowed managers only
      const filteredStandings = s.standings.filter(t => {
        const mgr = t.managers[0] || '';
        return ALLOWED_MANAGERS.has(mgr);
      });
      // Filter matchups: both teams must have allowed managers
      const filteredMatchups = s.matchups.filter(m => {
        const mgr1 = getMgrFromTeamKeyRaw(m.team1.team_key, s);
        const mgr2 = getMgrFromTeamKeyRaw(m.team2.team_key, s);
        if (!ALLOWED_MANAGERS.has(mgr1) || !ALLOWED_MANAGERS.has(mgr2)) {
          return false;
        }
        return true;
      });
      return { ...s, standings: filteredStandings, matchups: filteredMatchups, allStandings: s.standings, allMatchups: s.matchups };
    });
}

/** Raw team_key lookup that works on unfiltered season data (used by applyLeagueFilters). */
function getMgrFromTeamKeyRaw(teamKey, season) {
  if (!teamKey) return '';
  const found = season.standings.find(t => t.team_key === teamKey);
  return found ? (found.managers[0] || '') : '';
}





const RING_IMAGES = {};
RING_IMAGES['2014'] = 'rings/ring_2014.png';
RING_IMAGES['2015'] = 'rings/ring_2015.png';
RING_IMAGES['2016'] = 'rings/ring_2016.png';
RING_IMAGES['2017'] = 'rings/ring_2017.png';
RING_IMAGES['2018'] = 'rings/ring_2018.png';
RING_IMAGES['2019'] = 'rings/ring_2019.png';
RING_IMAGES['2020'] = 'rings/ring_2020.png';
RING_IMAGES['2021'] = 'rings/ring_2021.png';
RING_IMAGES['2022'] = 'rings/ring_2022.png';
RING_IMAGES['2023'] = 'rings/ring_2023.png';
RING_IMAGES['2024'] = 'rings/ring_2024.png';
RING_IMAGES['2025'] = 'rings/ring_2025.png';

// ── DATA LOADER ──────────────────────────────────────────────
let DATA = null;
let MANAGERS_MAP = {};   // nickname → aggregated stats
let SEASONS = [];

function loadData() {
DATA = {"league_name":"BKGFFL","pulled_at":"2026-02-20 14:33:11","seasons":[{"season":2013,"league_key":"314.l.324082","league_name":"BKGFFL","num_teams":12,"playoff_start_week":14,"champion":{"team_key":"314.l.324082.t.3","team_name":"ALL DAY","points":112.0},"runner_up":{"team_key":"314.l.324082.t.11","team_name":"Cleveland Breedens","points":52.0},"champ_score":112.0,"runner_score":52.0,"standings":[{"team_key":"314.l.324082.t.3","team_name":"ALL DAY","managers":["A D"],"rank":1,"wins":11,"losses":2,"ties":0,"points_for":1386.0,"points_against":1179.0},{"team_key":"314.l.324082.t.11","team_name":"Cleveland Breedens","managers":["Ryan"],"rank":2,"wins":8,"losses":5,"ties":0,"points_for":1315.0,"points_against":1311.0},{"team_key":"314.l.324082.t.8","team_name":"The Greek","managers":["mark"],"rank":3,"wins":10,"losses":3,"ties":0,"points_for":1292.0,"points_against":1059.0},{"team_key":"314.l.324082.t.4","team_name":"Squeek's Squad","managers":["Tom"],"rank":4,"wins":7,"losses":6,"ties":0,"points_for":1185.0,"points_against":1259.0},{"team_key":"314.l.324082.t.6","team_name":"Stars","managers":["Clarke"],"rank":5,"wins":7,"losses":6,"ties":0,"points_for":1278.0,"points_against":1233.0},{"team_key":"314.l.324082.t.5","team_name":"LVC","managers":["LVC"],"rank":6,"wins":6,"losses":7,"ties":0,"points_for":1300.0,"points_against":1269.0},{"team_key":"314.l.324082.t.10","team_name":"Johnny Fantasy","managers":["Johnny Fantasy"],"rank":7,"wins":5,"losses":8,"ties":0,"points_for":1194.0,"points_against":1275.0},{"team_key":"314.l.324082.t.9","team_name":"B-MAN","managers":["Budman"],"rank":8,"wins":5,"losses":8,"ties":0,"points_for":1236.0,"points_against":1210.0},{"team_key":"314.l.324082.t.2","team_name":"The HurricaneS","managers":["RealDeal-WhatWhat"],"rank":9,"wins":6,"losses":7,"ties":0,"points_for":1216.0,"points_against":1233.0},{"team_key":"314.l.324082.t.7","team_name":"98","managers":["Jonathan"],"rank":10,"wins":3,"losses":10,"ties":0,"points_for":991.0,"points_against":1283.0},{"team_key":"314.l.324082.t.12","team_name":"JG Peterson","managers":["JG JR"],"rank":11,"wins":5,"losses":8,"ties":0,"points_for":1206.0,"points_against":1258.0},{"team_key":"314.l.324082.t.1","team_name":"Santa Clara 49Cons","managers":["bubcon"],"rank":12,"wins":5,"losses":8,"ties":0,"points_for":1127.0,"points_against":1157.0}],"matchups":[{"week":1,"team1":{"team_key":"314.l.324082.t.1","team_name":"Santa Clara 49Cons","points":115.0},"team2":{"team_key":"314.l.324082.t.2","team_name":"The HurricaneS","points":101.0},"winner_team_key":"314.l.324082.t.1","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"314.l.324082.t.3","team_name":"ALL DAY","points":135.0},"team2":{"team_key":"314.l.324082.t.11","team_name":"Cleveland Breedens","points":103.0},"winner_team_key":"314.l.324082.t.3","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"314.l.324082.t.4","team_name":"Squeek's Squad","points":71.0},"team2":{"team_key":"314.l.324082.t.10","team_name":"Johnny Fantasy","points":129.0},"winner_team_key":"314.l.324082.t.10","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"314.l.324082.t.5","team_name":"LVC","points":111.0},"team2":{"team_key":"314.l.324082.t.9","team_name":"B-MAN","points":103.0},"winner_team_key":"314.l.324082.t.5","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"314.l.324082.t.6","team_name":"Stars","points":118.0},"team2":{"team_key":"314.l.324082.t.8","team_name":"The Greek","points":76.0},"winner_team_key":"314.l.324082.t.6","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"314.l.324082.t.7","team_name":"98","points":88.0},"team2":{"team_key":"314.l.324082.t.12","team_name":"JG Peterson","points":128.0},"winner_team_key":"314.l.324082.t.12","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"314.l.324082.t.1","team_name":"Santa Clara 49Cons","points":74.0},"team2":{"team_key":"314.l.324082.t.3","team_name":"ALL DAY","points":111.0},"winner_team_key":"314.l.324082.t.3","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"314.l.324082.t.2","team_name":"The HurricaneS","points":99.0},"team2":{"team_key":"314.l.324082.t.12","team_name":"JG Peterson","points":58.0},"winner_team_key":"314.l.324082.t.2","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"314.l.324082.t.4","team_name":"Squeek's Squad","points":116.0},"team2":{"team_key":"314.l.324082.t.11","team_name":"Cleveland Breedens","points":88.0},"winner_team_key":"314.l.324082.t.4","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"314.l.324082.t.5","team_name":"LVC","points":110.0},"team2":{"team_key":"314.l.324082.t.10","team_name":"Johnny Fantasy","points":73.0},"winner_team_key":"314.l.324082.t.5","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"314.l.324082.t.6","team_name":"Stars","points":111.0},"team2":{"team_key":"314.l.324082.t.9","team_name":"B-MAN","points":95.0},"winner_team_key":"314.l.324082.t.6","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"314.l.324082.t.7","team_name":"98","points":58.0},"team2":{"team_key":"314.l.324082.t.8","team_name":"The Greek","points":119.0},"winner_team_key":"314.l.324082.t.8","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"314.l.324082.t.1","team_name":"Santa Clara 49Cons","points":85.0},"team2":{"team_key":"314.l.324082.t.4","team_name":"Squeek's Squad","points":96.0},"winner_team_key":"314.l.324082.t.4","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"314.l.324082.t.2","team_name":"The HurricaneS","points":81.0},"team2":{"team_key":"314.l.324082.t.3","team_name":"ALL DAY","points":136.0},"winner_team_key":"314.l.324082.t.3","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"314.l.324082.t.5","team_name":"LVC","points":88.0},"team2":{"team_key":"314.l.324082.t.11","team_name":"Cleveland Breedens","points":100.0},"winner_team_key":"314.l.324082.t.11","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"314.l.324082.t.6","team_name":"Stars","points":109.0},"team2":{"team_key":"314.l.324082.t.10","team_name":"Johnny Fantasy","points":66.0},"winner_team_key":"314.l.324082.t.6","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"314.l.324082.t.7","team_name":"98","points":62.0},"team2":{"team_key":"314.l.324082.t.9","team_name":"B-MAN","points":96.0},"winner_team_key":"314.l.324082.t.9","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"314.l.324082.t.8","team_name":"The Greek","points":124.0},"team2":{"team_key":"314.l.324082.t.12","team_name":"JG Peterson","points":53.0},"winner_team_key":"314.l.324082.t.8","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"314.l.324082.t.1","team_name":"Santa Clara 49Cons","points":106.0},"team2":{"team_key":"314.l.324082.t.5","team_name":"LVC","points":127.0},"winner_team_key":"314.l.324082.t.5","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"314.l.324082.t.2","team_name":"The HurricaneS","points":78.0},"team2":{"team_key":"314.l.324082.t.4","team_name":"Squeek's Squad","points":92.0},"winner_team_key":"314.l.324082.t.4","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"314.l.324082.t.3","team_name":"ALL DAY","points":119.0},"team2":{"team_key":"314.l.324082.t.12","team_name":"JG Peterson","points":115.0},"winner_team_key":"314.l.324082.t.3","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"314.l.324082.t.6","team_name":"Stars","points":119.0},"team2":{"team_key":"314.l.324082.t.11","team_name":"Cleveland Breedens","points":152.0},"winner_team_key":"314.l.324082.t.11","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"314.l.324082.t.7","team_name":"98","points":63.0},"team2":{"team_key":"314.l.324082.t.10","team_name":"Johnny Fantasy","points":73.0},"winner_team_key":"314.l.324082.t.10","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"314.l.324082.t.8","team_name":"The Greek","points":106.0},"team2":{"team_key":"314.l.324082.t.9","team_name":"B-MAN","points":105.0},"winner_team_key":"314.l.324082.t.8","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"314.l.324082.t.1","team_name":"Santa Clara 49Cons","points":55.0},"team2":{"team_key":"314.l.324082.t.6","team_name":"Stars","points":106.0},"winner_team_key":"314.l.324082.t.6","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"314.l.324082.t.2","team_name":"The HurricaneS","points":83.0},"team2":{"team_key":"314.l.324082.t.5","team_name":"LVC","points":77.0},"winner_team_key":"314.l.324082.t.2","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"314.l.324082.t.3","team_name":"ALL DAY","points":100.0},"team2":{"team_key":"314.l.324082.t.4","team_name":"Squeek's Squad","points":128.0},"winner_team_key":"314.l.324082.t.4","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"314.l.324082.t.7","team_name":"98","points":92.0},"team2":{"team_key":"314.l.324082.t.11","team_name":"Cleveland Breedens","points":142.0},"winner_team_key":"314.l.324082.t.11","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"314.l.324082.t.8","team_name":"The Greek","points":95.0},"team2":{"team_key":"314.l.324082.t.10","team_name":"Johnny Fantasy","points":78.0},"winner_team_key":"314.l.324082.t.8","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"314.l.324082.t.9","team_name":"B-MAN","points":101.0},"team2":{"team_key":"314.l.324082.t.12","team_name":"JG Peterson","points":118.0},"winner_team_key":"314.l.324082.t.12","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"314.l.324082.t.1","team_name":"Santa Clara 49Cons","points":85.0},"team2":{"team_key":"314.l.324082.t.7","team_name":"98","points":26.0},"winner_team_key":"314.l.324082.t.1","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"314.l.324082.t.2","team_name":"The HurricaneS","points":86.0},"team2":{"team_key":"314.l.324082.t.6","team_name":"Stars","points":109.0},"winner_team_key":"314.l.324082.t.6","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"314.l.324082.t.3","team_name":"ALL DAY","points":67.0},"team2":{"team_key":"314.l.324082.t.5","team_name":"LVC","points":110.0},"winner_team_key":"314.l.324082.t.5","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"314.l.324082.t.4","team_name":"Squeek's Squad","points":65.0},"team2":{"team_key":"314.l.324082.t.12","team_name":"JG Peterson","points":108.0},"winner_team_key":"314.l.324082.t.12","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"314.l.324082.t.8","team_name":"The Greek","points":96.0},"team2":{"team_key":"314.l.324082.t.11","team_name":"Cleveland Breedens","points":60.0},"winner_team_key":"314.l.324082.t.8","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"314.l.324082.t.9","team_name":"B-MAN","points":124.0},"team2":{"team_key":"314.l.324082.t.10","team_name":"Johnny Fantasy","points":75.0},"winner_team_key":"314.l.324082.t.9","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"314.l.324082.t.1","team_name":"Santa Clara 49Cons","points":79.0},"team2":{"team_key":"314.l.324082.t.8","team_name":"The Greek","points":86.0},"winner_team_key":"314.l.324082.t.8","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"314.l.324082.t.2","team_name":"The HurricaneS","points":100.0},"team2":{"team_key":"314.l.324082.t.7","team_name":"98","points":93.0},"winner_team_key":"314.l.324082.t.2","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"314.l.324082.t.3","team_name":"ALL DAY","points":88.0},"team2":{"team_key":"314.l.324082.t.6","team_name":"Stars","points":62.0},"winner_team_key":"314.l.324082.t.3","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"314.l.324082.t.4","team_name":"Squeek's Squad","points":112.0},"team2":{"team_key":"314.l.324082.t.5","team_name":"LVC","points":75.0},"winner_team_key":"314.l.324082.t.4","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"314.l.324082.t.9","team_name":"B-MAN","points":75.0},"team2":{"team_key":"314.l.324082.t.11","team_name":"Cleveland Breedens","points":91.0},"winner_team_key":"314.l.324082.t.11","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"314.l.324082.t.10","team_name":"Johnny Fantasy","points":110.0},"team2":{"team_key":"314.l.324082.t.12","team_name":"JG Peterson","points":74.0},"winner_team_key":"314.l.324082.t.10","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"314.l.324082.t.1","team_name":"Santa Clara 49Cons","points":84.0},"team2":{"team_key":"314.l.324082.t.9","team_name":"B-MAN","points":64.0},"winner_team_key":"314.l.324082.t.1","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"314.l.324082.t.2","team_name":"The HurricaneS","points":102.0},"team2":{"team_key":"314.l.324082.t.8","team_name":"The Greek","points":58.0},"winner_team_key":"314.l.324082.t.2","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"314.l.324082.t.3","team_name":"ALL DAY","points":84.0},"team2":{"team_key":"314.l.324082.t.7","team_name":"98","points":73.0},"winner_team_key":"314.l.324082.t.3","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"314.l.324082.t.4","team_name":"Squeek's Squad","points":118.0},"team2":{"team_key":"314.l.324082.t.6","team_name":"Stars","points":97.0},"winner_team_key":"314.l.324082.t.4","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"314.l.324082.t.5","team_name":"LVC","points":98.0},"team2":{"team_key":"314.l.324082.t.12","team_name":"JG Peterson","points":77.0},"winner_team_key":"314.l.324082.t.5","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"314.l.324082.t.10","team_name":"Johnny Fantasy","points":134.0},"team2":{"team_key":"314.l.324082.t.11","team_name":"Cleveland Breedens","points":84.0},"winner_team_key":"314.l.324082.t.10","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"314.l.324082.t.1","team_name":"Santa Clara 49Cons","points":120.0},"team2":{"team_key":"314.l.324082.t.10","team_name":"Johnny Fantasy","points":88.0},"winner_team_key":"314.l.324082.t.1","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"314.l.324082.t.2","team_name":"The HurricaneS","points":110.0},"team2":{"team_key":"314.l.324082.t.9","team_name":"B-MAN","points":116.0},"winner_team_key":"314.l.324082.t.9","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"314.l.324082.t.3","team_name":"ALL DAY","points":103.0},"team2":{"team_key":"314.l.324082.t.8","team_name":"The Greek","points":83.0},"winner_team_key":"314.l.324082.t.3","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"314.l.324082.t.4","team_name":"Squeek's Squad","points":63.0},"team2":{"team_key":"314.l.324082.t.7","team_name":"98","points":104.0},"winner_team_key":"314.l.324082.t.7","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"314.l.324082.t.5","team_name":"LVC","points":125.0},"team2":{"team_key":"314.l.324082.t.6","team_name":"Stars","points":133.0},"winner_team_key":"314.l.324082.t.6","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"314.l.324082.t.11","team_name":"Cleveland Breedens","points":98.0},"team2":{"team_key":"314.l.324082.t.12","team_name":"JG Peterson","points":81.0},"winner_team_key":"314.l.324082.t.11","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"314.l.324082.t.1","team_name":"Santa Clara 49Cons","points":69.0},"team2":{"team_key":"314.l.324082.t.11","team_name":"Cleveland Breedens","points":70.0},"winner_team_key":"314.l.324082.t.11","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"314.l.324082.t.2","team_name":"The HurricaneS","points":100.0},"team2":{"team_key":"314.l.324082.t.10","team_name":"Johnny Fantasy","points":63.0},"winner_team_key":"314.l.324082.t.2","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"314.l.324082.t.3","team_name":"ALL DAY","points":89.0},"team2":{"team_key":"314.l.324082.t.9","team_name":"B-MAN","points":82.0},"winner_team_key":"314.l.324082.t.3","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"314.l.324082.t.4","team_name":"Squeek's Squad","points":62.0},"team2":{"team_key":"314.l.324082.t.8","team_name":"The Greek","points":95.0},"winner_team_key":"314.l.324082.t.8","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"314.l.324082.t.5","team_name":"LVC","points":71.0},"team2":{"team_key":"314.l.324082.t.7","team_name":"98","points":83.0},"winner_team_key":"314.l.324082.t.7","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"314.l.324082.t.6","team_name":"Stars","points":103.0},"team2":{"team_key":"314.l.324082.t.12","team_name":"JG Peterson","points":97.0},"winner_team_key":"314.l.324082.t.6","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"314.l.324082.t.1","team_name":"Santa Clara 49Cons","points":86.0},"team2":{"team_key":"314.l.324082.t.12","team_name":"JG Peterson","points":77.0},"winner_team_key":"314.l.324082.t.1","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"314.l.324082.t.2","team_name":"The HurricaneS","points":96.0},"team2":{"team_key":"314.l.324082.t.11","team_name":"Cleveland Breedens","points":131.0},"winner_team_key":"314.l.324082.t.11","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"314.l.324082.t.3","team_name":"ALL DAY","points":126.0},"team2":{"team_key":"314.l.324082.t.10","team_name":"Johnny Fantasy","points":90.0},"winner_team_key":"314.l.324082.t.3","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"314.l.324082.t.4","team_name":"Squeek's Squad","points":81.0},"team2":{"team_key":"314.l.324082.t.9","team_name":"B-MAN","points":77.0},"winner_team_key":"314.l.324082.t.4","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"314.l.324082.t.5","team_name":"LVC","points":112.0},"team2":{"team_key":"314.l.324082.t.8","team_name":"The Greek","points":117.0},"winner_team_key":"314.l.324082.t.8","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"314.l.324082.t.6","team_name":"Stars","points":61.0},"team2":{"team_key":"314.l.324082.t.7","team_name":"98","points":102.0},"winner_team_key":"314.l.324082.t.7","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"314.l.324082.t.1","team_name":"Santa Clara 49Cons","points":70.0},"team2":{"team_key":"314.l.324082.t.2","team_name":"The HurricaneS","points":92.0},"winner_team_key":"314.l.324082.t.2","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"314.l.324082.t.3","team_name":"ALL DAY","points":115.0},"team2":{"team_key":"314.l.324082.t.11","team_name":"Cleveland Breedens","points":79.0},"winner_team_key":"314.l.324082.t.3","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"314.l.324082.t.4","team_name":"Squeek's Squad","points":86.0},"team2":{"team_key":"314.l.324082.t.10","team_name":"Johnny Fantasy","points":106.0},"winner_team_key":"314.l.324082.t.10","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"314.l.324082.t.5","team_name":"LVC","points":83.0},"team2":{"team_key":"314.l.324082.t.9","team_name":"B-MAN","points":106.0},"winner_team_key":"314.l.324082.t.9","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"314.l.324082.t.6","team_name":"Stars","points":61.0},"team2":{"team_key":"314.l.324082.t.8","team_name":"The Greek","points":81.0},"winner_team_key":"314.l.324082.t.8","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"314.l.324082.t.7","team_name":"98","points":79.0},"team2":{"team_key":"314.l.324082.t.12","team_name":"JG Peterson","points":105.0},"winner_team_key":"314.l.324082.t.12","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"314.l.324082.t.1","team_name":"Santa Clara 49Cons","points":99.0},"team2":{"team_key":"314.l.324082.t.3","team_name":"ALL DAY","points":113.0},"winner_team_key":"314.l.324082.t.3","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"314.l.324082.t.2","team_name":"The HurricaneS","points":88.0},"team2":{"team_key":"314.l.324082.t.12","team_name":"JG Peterson","points":115.0},"winner_team_key":"314.l.324082.t.12","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"314.l.324082.t.4","team_name":"Squeek's Squad","points":95.0},"team2":{"team_key":"314.l.324082.t.11","team_name":"Cleveland Breedens","points":117.0},"winner_team_key":"314.l.324082.t.11","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"314.l.324082.t.5","team_name":"LVC","points":113.0},"team2":{"team_key":"314.l.324082.t.10","team_name":"Johnny Fantasy","points":109.0},"winner_team_key":"314.l.324082.t.5","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"314.l.324082.t.6","team_name":"Stars","points":89.0},"team2":{"team_key":"314.l.324082.t.9","team_name":"B-MAN","points":92.0},"winner_team_key":"314.l.324082.t.9","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"314.l.324082.t.7","team_name":"98","points":68.0},"team2":{"team_key":"314.l.324082.t.8","team_name":"The Greek","points":156.0},"winner_team_key":"314.l.324082.t.8","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"314.l.324082.t.1","team_name":"Santa Clara 49Cons","points":80.0},"team2":{"team_key":"314.l.324082.t.10","team_name":"Johnny Fantasy","points":121.0},"winner_team_key":"314.l.324082.t.10","is_playoffs":true,"is_championship":false},{"week":14,"team1":{"team_key":"314.l.324082.t.4","team_name":"Squeek's Squad","points":96.0},"team2":{"team_key":"314.l.324082.t.6","team_name":"Stars","points":83.0},"winner_team_key":"314.l.324082.t.4","is_playoffs":true,"is_championship":false},{"week":14,"team1":{"team_key":"314.l.324082.t.5","team_name":"LVC","points":74.0},"team2":{"team_key":"314.l.324082.t.11","team_name":"Cleveland Breedens","points":75.0},"winner_team_key":"314.l.324082.t.11","is_playoffs":true,"is_championship":false},{"week":14,"team1":{"team_key":"314.l.324082.t.7","team_name":"98","points":90.0},"team2":{"team_key":"314.l.324082.t.12","team_name":"JG Peterson","points":66.0},"winner_team_key":"314.l.324082.t.7","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"314.l.324082.t.1","team_name":"Santa Clara 49Cons","points":73.0},"team2":{"team_key":"314.l.324082.t.12","team_name":"JG Peterson","points":77.0},"winner_team_key":"314.l.324082.t.12","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"314.l.324082.t.2","team_name":"The HurricaneS","points":74.0},"team2":{"team_key":"314.l.324082.t.10","team_name":"Johnny Fantasy","points":88.0},"winner_team_key":"314.l.324082.t.10","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"314.l.324082.t.3","team_name":"ALL DAY","points":101.0},"team2":{"team_key":"314.l.324082.t.4","team_name":"Squeek's Squad","points":89.0},"winner_team_key":"314.l.324082.t.3","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"314.l.324082.t.5","team_name":"LVC","points":108.0},"team2":{"team_key":"314.l.324082.t.6","team_name":"Stars","points":112.0},"winner_team_key":"314.l.324082.t.6","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"314.l.324082.t.7","team_name":"98","points":110.0},"team2":{"team_key":"314.l.324082.t.9","team_name":"B-MAN","points":121.0},"winner_team_key":"314.l.324082.t.9","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"314.l.324082.t.8","team_name":"The Greek","points":102.0},"team2":{"team_key":"314.l.324082.t.11","team_name":"Cleveland Breedens","points":105.0},"winner_team_key":"314.l.324082.t.11","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"314.l.324082.t.2","team_name":"The HurricaneS","points":58.0},"team2":{"team_key":"314.l.324082.t.7","team_name":"98","points":55.0},"winner_team_key":"314.l.324082.t.2","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"314.l.324082.t.3","team_name":"ALL DAY","points":112.0},"team2":{"team_key":"314.l.324082.t.11","team_name":"Cleveland Breedens","points":52.0},"winner_team_key":"314.l.324082.t.3","is_playoffs":true,"is_championship":true},{"week":16,"team1":{"team_key":"314.l.324082.t.4","team_name":"Squeek's Squad","points":137.0},"team2":{"team_key":"314.l.324082.t.8","team_name":"The Greek","points":137.0},"winner_team_key":"","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"314.l.324082.t.9","team_name":"B-MAN","points":56.0},"team2":{"team_key":"314.l.324082.t.10","team_name":"Johnny Fantasy","points":111.0},"winner_team_key":"314.l.324082.t.10","is_playoffs":true,"is_championship":false}],"season_high_score":{"points":156.0,"team":"The Greek","week":13},"season_low_score":{"points":26.0,"team":"98","week":6}},{"season":2014,"league_key":"331.l.167219","league_name":"BKGFFL","num_teams":12,"playoff_start_week":14,"champion":{"team_key":"331.l.167219.t.3","team_name":"98","points":103.0},"runner_up":{"team_key":"331.l.167219.t.12","team_name":"BensonopoloWaite","points":96.0},"champ_score":103.0,"runner_score":96.0,"standings":[{"team_key":"331.l.167219.t.3","team_name":"98","managers":["Jonathan"],"rank":1,"wins":11,"losses":2,"ties":0,"points_for":1365.0,"points_against":1104.0},{"team_key":"331.l.167219.t.12","team_name":"BensonopoloWaite","managers":["B-waite"],"rank":2,"wins":8,"losses":5,"ties":0,"points_for":1172.0,"points_against":1197.0},{"team_key":"331.l.167219.t.7","team_name":"Johnny Fantasy","managers":["Johnny Fantasy"],"rank":3,"wins":9,"losses":4,"ties":0,"points_for":1402.0,"points_against":1188.0},{"team_key":"331.l.167219.t.6","team_name":"ALL DAY","managers":["A D"],"rank":4,"wins":7,"losses":6,"ties":0,"points_for":1139.0,"points_against":1153.0},{"team_key":"331.l.167219.t.2","team_name":"LVC","managers":["LVC"],"rank":5,"wins":7,"losses":6,"ties":0,"points_for":1281.0,"points_against":1238.0},{"team_key":"331.l.167219.t.4","team_name":"B-MAN","managers":["Budman"],"rank":6,"wins":6,"losses":7,"ties":0,"points_for":1275.0,"points_against":1286.0},{"team_key":"331.l.167219.t.10","team_name":"Scott Stars","managers":["Clarke"],"rank":7,"wins":6,"losses":7,"ties":0,"points_for":1180.0,"points_against":1200.0},{"team_key":"331.l.167219.t.9","team_name":"Capone","managers":["Mike"],"rank":8,"wins":6,"losses":7,"ties":0,"points_for":1210.0,"points_against":1253.0},{"team_key":"331.l.167219.t.1","team_name":"Boston Bubcons","managers":["bubcon","Josh"],"rank":9,"wins":4,"losses":9,"ties":0,"points_for":1174.0,"points_against":1303.0},{"team_key":"331.l.167219.t.11","team_name":"The Greek","managers":["mark"],"rank":10,"wins":4,"losses":9,"ties":0,"points_for":1142.0,"points_against":1264.0},{"team_key":"331.l.167219.t.5","team_name":"Cleveland Breedens","managers":["Ryan"],"rank":11,"wins":6,"losses":7,"ties":0,"points_for":1171.0,"points_against":1181.0},{"team_key":"331.l.167219.t.8","team_name":"Gaudio","managers":["JG JR"],"rank":12,"wins":4,"losses":9,"ties":0,"points_for":1207.0,"points_against":1351.0}],"matchups":[{"week":1,"team1":{"team_key":"331.l.167219.t.1","team_name":"Boston Bubcons","points":111.0},"team2":{"team_key":"331.l.167219.t.2","team_name":"LVC","points":117.0},"winner_team_key":"331.l.167219.t.2","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"331.l.167219.t.3","team_name":"98","points":99.0},"team2":{"team_key":"331.l.167219.t.11","team_name":"The Greek","points":73.0},"winner_team_key":"331.l.167219.t.3","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"331.l.167219.t.4","team_name":"B-MAN","points":90.0},"team2":{"team_key":"331.l.167219.t.10","team_name":"Scott Stars","points":108.0},"winner_team_key":"331.l.167219.t.10","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"331.l.167219.t.5","team_name":"Cleveland Breedens","points":87.0},"team2":{"team_key":"331.l.167219.t.9","team_name":"Capone","points":75.0},"winner_team_key":"331.l.167219.t.5","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"331.l.167219.t.6","team_name":"ALL DAY","points":98.0},"team2":{"team_key":"331.l.167219.t.8","team_name":"Gaudio","points":64.0},"winner_team_key":"331.l.167219.t.6","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"331.l.167219.t.7","team_name":"Johnny Fantasy","points":111.0},"team2":{"team_key":"331.l.167219.t.12","team_name":"BensonopoloWaite","points":92.0},"winner_team_key":"331.l.167219.t.7","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"331.l.167219.t.1","team_name":"Boston Bubcons","points":84.0},"team2":{"team_key":"331.l.167219.t.3","team_name":"98","points":125.0},"winner_team_key":"331.l.167219.t.3","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"331.l.167219.t.2","team_name":"LVC","points":67.0},"team2":{"team_key":"331.l.167219.t.12","team_name":"BensonopoloWaite","points":81.0},"winner_team_key":"331.l.167219.t.12","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"331.l.167219.t.4","team_name":"B-MAN","points":117.0},"team2":{"team_key":"331.l.167219.t.11","team_name":"The Greek","points":85.0},"winner_team_key":"331.l.167219.t.4","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"331.l.167219.t.5","team_name":"Cleveland Breedens","points":59.0},"team2":{"team_key":"331.l.167219.t.10","team_name":"Scott Stars","points":71.0},"winner_team_key":"331.l.167219.t.10","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"331.l.167219.t.6","team_name":"ALL DAY","points":79.0},"team2":{"team_key":"331.l.167219.t.9","team_name":"Capone","points":90.0},"winner_team_key":"331.l.167219.t.9","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"331.l.167219.t.7","team_name":"Johnny Fantasy","points":101.0},"team2":{"team_key":"331.l.167219.t.8","team_name":"Gaudio","points":105.0},"winner_team_key":"331.l.167219.t.8","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"331.l.167219.t.1","team_name":"Boston Bubcons","points":88.0},"team2":{"team_key":"331.l.167219.t.4","team_name":"B-MAN","points":99.0},"winner_team_key":"331.l.167219.t.4","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"331.l.167219.t.2","team_name":"LVC","points":100.0},"team2":{"team_key":"331.l.167219.t.3","team_name":"98","points":116.0},"winner_team_key":"331.l.167219.t.3","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"331.l.167219.t.5","team_name":"Cleveland Breedens","points":47.0},"team2":{"team_key":"331.l.167219.t.11","team_name":"The Greek","points":83.0},"winner_team_key":"331.l.167219.t.11","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"331.l.167219.t.6","team_name":"ALL DAY","points":84.0},"team2":{"team_key":"331.l.167219.t.10","team_name":"Scott Stars","points":95.0},"winner_team_key":"331.l.167219.t.10","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"331.l.167219.t.7","team_name":"Johnny Fantasy","points":96.0},"team2":{"team_key":"331.l.167219.t.9","team_name":"Capone","points":77.0},"winner_team_key":"331.l.167219.t.7","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"331.l.167219.t.8","team_name":"Gaudio","points":59.0},"team2":{"team_key":"331.l.167219.t.12","team_name":"BensonopoloWaite","points":68.0},"winner_team_key":"331.l.167219.t.12","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"331.l.167219.t.1","team_name":"Boston Bubcons","points":114.0},"team2":{"team_key":"331.l.167219.t.5","team_name":"Cleveland Breedens","points":87.0},"winner_team_key":"331.l.167219.t.1","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"331.l.167219.t.2","team_name":"LVC","points":84.0},"team2":{"team_key":"331.l.167219.t.4","team_name":"B-MAN","points":64.0},"winner_team_key":"331.l.167219.t.2","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"331.l.167219.t.3","team_name":"98","points":86.0},"team2":{"team_key":"331.l.167219.t.12","team_name":"BensonopoloWaite","points":72.0},"winner_team_key":"331.l.167219.t.3","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"331.l.167219.t.6","team_name":"ALL DAY","points":97.0},"team2":{"team_key":"331.l.167219.t.11","team_name":"The Greek","points":142.0},"winner_team_key":"331.l.167219.t.11","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"331.l.167219.t.7","team_name":"Johnny Fantasy","points":130.0},"team2":{"team_key":"331.l.167219.t.10","team_name":"Scott Stars","points":102.0},"winner_team_key":"331.l.167219.t.7","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"331.l.167219.t.8","team_name":"Gaudio","points":95.0},"team2":{"team_key":"331.l.167219.t.9","team_name":"Capone","points":102.0},"winner_team_key":"331.l.167219.t.9","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"331.l.167219.t.1","team_name":"Boston Bubcons","points":85.0},"team2":{"team_key":"331.l.167219.t.6","team_name":"ALL DAY","points":92.0},"winner_team_key":"331.l.167219.t.6","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"331.l.167219.t.2","team_name":"LVC","points":84.0},"team2":{"team_key":"331.l.167219.t.5","team_name":"Cleveland Breedens","points":96.0},"winner_team_key":"331.l.167219.t.5","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"331.l.167219.t.3","team_name":"98","points":114.0},"team2":{"team_key":"331.l.167219.t.4","team_name":"B-MAN","points":98.0},"winner_team_key":"331.l.167219.t.3","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"331.l.167219.t.7","team_name":"Johnny Fantasy","points":80.0},"team2":{"team_key":"331.l.167219.t.11","team_name":"The Greek","points":64.0},"winner_team_key":"331.l.167219.t.7","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"331.l.167219.t.8","team_name":"Gaudio","points":110.0},"team2":{"team_key":"331.l.167219.t.10","team_name":"Scott Stars","points":98.0},"winner_team_key":"331.l.167219.t.8","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"331.l.167219.t.9","team_name":"Capone","points":120.0},"team2":{"team_key":"331.l.167219.t.12","team_name":"BensonopoloWaite","points":130.0},"winner_team_key":"331.l.167219.t.12","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"331.l.167219.t.1","team_name":"Boston Bubcons","points":74.0},"team2":{"team_key":"331.l.167219.t.7","team_name":"Johnny Fantasy","points":155.0},"winner_team_key":"331.l.167219.t.7","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"331.l.167219.t.2","team_name":"LVC","points":50.0},"team2":{"team_key":"331.l.167219.t.6","team_name":"ALL DAY","points":135.0},"winner_team_key":"331.l.167219.t.6","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"331.l.167219.t.3","team_name":"98","points":81.0},"team2":{"team_key":"331.l.167219.t.5","team_name":"Cleveland Breedens","points":95.0},"winner_team_key":"331.l.167219.t.5","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"331.l.167219.t.4","team_name":"B-MAN","points":98.0},"team2":{"team_key":"331.l.167219.t.12","team_name":"BensonopoloWaite","points":101.0},"winner_team_key":"331.l.167219.t.12","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"331.l.167219.t.8","team_name":"Gaudio","points":102.0},"team2":{"team_key":"331.l.167219.t.11","team_name":"The Greek","points":104.0},"winner_team_key":"331.l.167219.t.11","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"331.l.167219.t.9","team_name":"Capone","points":93.0},"team2":{"team_key":"331.l.167219.t.10","team_name":"Scott Stars","points":75.0},"winner_team_key":"331.l.167219.t.9","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"331.l.167219.t.1","team_name":"Boston Bubcons","points":75.0},"team2":{"team_key":"331.l.167219.t.8","team_name":"Gaudio","points":106.0},"winner_team_key":"331.l.167219.t.8","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"331.l.167219.t.2","team_name":"LVC","points":86.0},"team2":{"team_key":"331.l.167219.t.7","team_name":"Johnny Fantasy","points":97.0},"winner_team_key":"331.l.167219.t.7","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"331.l.167219.t.3","team_name":"98","points":107.0},"team2":{"team_key":"331.l.167219.t.6","team_name":"ALL DAY","points":74.0},"winner_team_key":"331.l.167219.t.3","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"331.l.167219.t.4","team_name":"B-MAN","points":103.0},"team2":{"team_key":"331.l.167219.t.5","team_name":"Cleveland Breedens","points":92.0},"winner_team_key":"331.l.167219.t.4","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"331.l.167219.t.9","team_name":"Capone","points":102.0},"team2":{"team_key":"331.l.167219.t.11","team_name":"The Greek","points":90.0},"winner_team_key":"331.l.167219.t.9","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"331.l.167219.t.10","team_name":"Scott Stars","points":61.0},"team2":{"team_key":"331.l.167219.t.12","team_name":"BensonopoloWaite","points":79.0},"winner_team_key":"331.l.167219.t.12","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"331.l.167219.t.1","team_name":"Boston Bubcons","points":121.0},"team2":{"team_key":"331.l.167219.t.9","team_name":"Capone","points":61.0},"winner_team_key":"331.l.167219.t.1","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"331.l.167219.t.2","team_name":"LVC","points":156.0},"team2":{"team_key":"331.l.167219.t.8","team_name":"Gaudio","points":80.0},"winner_team_key":"331.l.167219.t.2","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"331.l.167219.t.3","team_name":"98","points":129.0},"team2":{"team_key":"331.l.167219.t.7","team_name":"Johnny Fantasy","points":126.0},"winner_team_key":"331.l.167219.t.3","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"331.l.167219.t.4","team_name":"B-MAN","points":127.0},"team2":{"team_key":"331.l.167219.t.6","team_name":"ALL DAY","points":83.0},"winner_team_key":"331.l.167219.t.4","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"331.l.167219.t.5","team_name":"Cleveland Breedens","points":96.0},"team2":{"team_key":"331.l.167219.t.12","team_name":"BensonopoloWaite","points":128.0},"winner_team_key":"331.l.167219.t.12","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"331.l.167219.t.10","team_name":"Scott Stars","points":126.0},"team2":{"team_key":"331.l.167219.t.11","team_name":"The Greek","points":96.0},"winner_team_key":"331.l.167219.t.10","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"331.l.167219.t.1","team_name":"Boston Bubcons","points":78.0},"team2":{"team_key":"331.l.167219.t.10","team_name":"Scott Stars","points":110.0},"winner_team_key":"331.l.167219.t.10","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"331.l.167219.t.2","team_name":"LVC","points":123.0},"team2":{"team_key":"331.l.167219.t.9","team_name":"Capone","points":122.0},"winner_team_key":"331.l.167219.t.2","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"331.l.167219.t.3","team_name":"98","points":108.0},"team2":{"team_key":"331.l.167219.t.8","team_name":"Gaudio","points":61.0},"winner_team_key":"331.l.167219.t.3","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"331.l.167219.t.4","team_name":"B-MAN","points":83.0},"team2":{"team_key":"331.l.167219.t.7","team_name":"Johnny Fantasy","points":132.0},"winner_team_key":"331.l.167219.t.7","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"331.l.167219.t.5","team_name":"Cleveland Breedens","points":55.0},"team2":{"team_key":"331.l.167219.t.6","team_name":"ALL DAY","points":69.0},"winner_team_key":"331.l.167219.t.6","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"331.l.167219.t.11","team_name":"The Greek","points":76.0},"team2":{"team_key":"331.l.167219.t.12","team_name":"BensonopoloWaite","points":85.0},"winner_team_key":"331.l.167219.t.12","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"331.l.167219.t.1","team_name":"Boston Bubcons","points":92.0},"team2":{"team_key":"331.l.167219.t.11","team_name":"The Greek","points":86.0},"winner_team_key":"331.l.167219.t.1","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"331.l.167219.t.2","team_name":"LVC","points":93.0},"team2":{"team_key":"331.l.167219.t.10","team_name":"Scott Stars","points":87.0},"winner_team_key":"331.l.167219.t.2","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"331.l.167219.t.3","team_name":"98","points":110.0},"team2":{"team_key":"331.l.167219.t.9","team_name":"Capone","points":78.0},"winner_team_key":"331.l.167219.t.3","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"331.l.167219.t.4","team_name":"B-MAN","points":117.0},"team2":{"team_key":"331.l.167219.t.8","team_name":"Gaudio","points":138.0},"winner_team_key":"331.l.167219.t.8","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"331.l.167219.t.5","team_name":"Cleveland Breedens","points":139.0},"team2":{"team_key":"331.l.167219.t.7","team_name":"Johnny Fantasy","points":85.0},"winner_team_key":"331.l.167219.t.5","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"331.l.167219.t.6","team_name":"ALL DAY","points":83.0},"team2":{"team_key":"331.l.167219.t.12","team_name":"BensonopoloWaite","points":68.0},"winner_team_key":"331.l.167219.t.6","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"331.l.167219.t.1","team_name":"Boston Bubcons","points":81.0},"team2":{"team_key":"331.l.167219.t.12","team_name":"BensonopoloWaite","points":88.0},"winner_team_key":"331.l.167219.t.12","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"331.l.167219.t.2","team_name":"LVC","points":87.0},"team2":{"team_key":"331.l.167219.t.11","team_name":"The Greek","points":92.0},"winner_team_key":"331.l.167219.t.11","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"331.l.167219.t.3","team_name":"98","points":92.0},"team2":{"team_key":"331.l.167219.t.10","team_name":"Scott Stars","points":81.0},"winner_team_key":"331.l.167219.t.3","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"331.l.167219.t.4","team_name":"B-MAN","points":56.0},"team2":{"team_key":"331.l.167219.t.9","team_name":"Capone","points":90.0},"winner_team_key":"331.l.167219.t.9","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"331.l.167219.t.5","team_name":"Cleveland Breedens","points":106.0},"team2":{"team_key":"331.l.167219.t.8","team_name":"Gaudio","points":92.0},"winner_team_key":"331.l.167219.t.5","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"331.l.167219.t.6","team_name":"ALL DAY","points":66.0},"team2":{"team_key":"331.l.167219.t.7","team_name":"Johnny Fantasy","points":64.0},"winner_team_key":"331.l.167219.t.6","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"331.l.167219.t.1","team_name":"Boston Bubcons","points":61.0},"team2":{"team_key":"331.l.167219.t.2","team_name":"LVC","points":94.0},"winner_team_key":"331.l.167219.t.2","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"331.l.167219.t.3","team_name":"98","points":115.0},"team2":{"team_key":"331.l.167219.t.11","team_name":"The Greek","points":52.0},"winner_team_key":"331.l.167219.t.3","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"331.l.167219.t.4","team_name":"B-MAN","points":108.0},"team2":{"team_key":"331.l.167219.t.10","team_name":"Scott Stars","points":72.0},"winner_team_key":"331.l.167219.t.4","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"331.l.167219.t.5","team_name":"Cleveland Breedens","points":124.0},"team2":{"team_key":"331.l.167219.t.9","team_name":"Capone","points":102.0},"winner_team_key":"331.l.167219.t.5","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"331.l.167219.t.6","team_name":"ALL DAY","points":112.0},"team2":{"team_key":"331.l.167219.t.8","team_name":"Gaudio","points":108.0},"winner_team_key":"331.l.167219.t.6","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"331.l.167219.t.7","team_name":"Johnny Fantasy","points":119.0},"team2":{"team_key":"331.l.167219.t.12","team_name":"BensonopoloWaite","points":84.0},"winner_team_key":"331.l.167219.t.7","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"331.l.167219.t.1","team_name":"Boston Bubcons","points":110.0},"team2":{"team_key":"331.l.167219.t.3","team_name":"98","points":83.0},"winner_team_key":"331.l.167219.t.1","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"331.l.167219.t.2","team_name":"LVC","points":140.0},"team2":{"team_key":"331.l.167219.t.12","team_name":"BensonopoloWaite","points":96.0},"winner_team_key":"331.l.167219.t.2","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"331.l.167219.t.4","team_name":"B-MAN","points":115.0},"team2":{"team_key":"331.l.167219.t.11","team_name":"The Greek","points":99.0},"winner_team_key":"331.l.167219.t.4","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"331.l.167219.t.5","team_name":"Cleveland Breedens","points":88.0},"team2":{"team_key":"331.l.167219.t.10","team_name":"Scott Stars","points":94.0},"winner_team_key":"331.l.167219.t.10","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"331.l.167219.t.6","team_name":"ALL DAY","points":67.0},"team2":{"team_key":"331.l.167219.t.9","team_name":"Capone","points":98.0},"winner_team_key":"331.l.167219.t.9","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"331.l.167219.t.7","team_name":"Johnny Fantasy","points":106.0},"team2":{"team_key":"331.l.167219.t.8","team_name":"Gaudio","points":87.0},"winner_team_key":"331.l.167219.t.7","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"331.l.167219.t.1","team_name":"Boston Bubcons","points":159.0},"team2":{"team_key":"331.l.167219.t.8","team_name":"Gaudio","points":107.0},"winner_team_key":"331.l.167219.t.1","is_playoffs":true,"is_championship":false},{"week":14,"team1":{"team_key":"331.l.167219.t.2","team_name":"LVC","points":74.0},"team2":{"team_key":"331.l.167219.t.6","team_name":"ALL DAY","points":122.0},"winner_team_key":"331.l.167219.t.6","is_playoffs":true,"is_championship":false},{"week":14,"team1":{"team_key":"331.l.167219.t.4","team_name":"B-MAN","points":74.0},"team2":{"team_key":"331.l.167219.t.12","team_name":"BensonopoloWaite","points":131.0},"winner_team_key":"331.l.167219.t.12","is_playoffs":true,"is_championship":false},{"week":14,"team1":{"team_key":"331.l.167219.t.5","team_name":"Cleveland Breedens","points":101.0},"team2":{"team_key":"331.l.167219.t.11","team_name":"The Greek","points":119.0},"winner_team_key":"331.l.167219.t.11","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"331.l.167219.t.1","team_name":"Boston Bubcons","points":67.0},"team2":{"team_key":"331.l.167219.t.9","team_name":"Capone","points":110.0},"winner_team_key":"331.l.167219.t.9","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"331.l.167219.t.2","team_name":"LVC","points":110.0},"team2":{"team_key":"331.l.167219.t.4","team_name":"B-MAN","points":98.0},"winner_team_key":"331.l.167219.t.2","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"331.l.167219.t.3","team_name":"98","points":84.0},"team2":{"team_key":"331.l.167219.t.6","team_name":"ALL DAY","points":72.0},"winner_team_key":"331.l.167219.t.3","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"331.l.167219.t.5","team_name":"Cleveland Breedens","points":95.0},"team2":{"team_key":"331.l.167219.t.8","team_name":"Gaudio","points":43.0},"winner_team_key":"331.l.167219.t.5","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"331.l.167219.t.7","team_name":"Johnny Fantasy","points":77.0},"team2":{"team_key":"331.l.167219.t.12","team_name":"BensonopoloWaite","points":80.0},"winner_team_key":"331.l.167219.t.12","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"331.l.167219.t.10","team_name":"Scott Stars","points":95.0},"team2":{"team_key":"331.l.167219.t.11","team_name":"The Greek","points":70.0},"winner_team_key":"331.l.167219.t.10","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"331.l.167219.t.1","team_name":"Boston Bubcons","points":111.0},"team2":{"team_key":"331.l.167219.t.11","team_name":"The Greek","points":47.0},"winner_team_key":"331.l.167219.t.1","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"331.l.167219.t.3","team_name":"98","points":103.0},"team2":{"team_key":"331.l.167219.t.12","team_name":"BensonopoloWaite","points":96.0},"winner_team_key":"331.l.167219.t.3","is_playoffs":true,"is_championship":true},{"week":16,"team1":{"team_key":"331.l.167219.t.6","team_name":"ALL DAY","points":60.0},"team2":{"team_key":"331.l.167219.t.7","team_name":"Johnny Fantasy","points":64.0},"winner_team_key":"331.l.167219.t.7","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"331.l.167219.t.9","team_name":"Capone","points":94.0},"team2":{"team_key":"331.l.167219.t.10","team_name":"Scott Stars","points":120.0},"winner_team_key":"331.l.167219.t.10","is_playoffs":true,"is_championship":false}],"season_high_score":{"points":159.0,"team":"Boston Bubcons","week":14},"season_low_score":{"points":43.0,"team":"Gaudio","week":15}},{"season":2015,"league_key":"348.l.69705","league_name":"BKGFFL","num_teams":12,"playoff_start_week":14,"champion":{"team_key":"348.l.69705.t.12","team_name":"Scott Stars","points":147.0},"runner_up":{"team_key":"348.l.69705.t.6","team_name":"LVC","points":85.0},"champ_score":147.0,"runner_score":85.0,"standings":[{"team_key":"348.l.69705.t.12","team_name":"Scott Stars","managers":["Clarke","Rich"],"rank":1,"wins":9,"losses":4,"ties":0,"points_for":1312.0,"points_against":1204.0},{"team_key":"348.l.69705.t.6","team_name":"LVC","managers":["LVC"],"rank":2,"wins":7,"losses":6,"ties":0,"points_for":1237.0,"points_against":1142.0},{"team_key":"348.l.69705.t.2","team_name":"Capone","managers":["Mike"],"rank":3,"wins":8,"losses":5,"ties":0,"points_for":1376.0,"points_against":1249.0},{"team_key":"348.l.69705.t.4","team_name":"ALL DAY","managers":["A D"],"rank":4,"wins":9,"losses":4,"ties":0,"points_for":1301.0,"points_against":1159.0},{"team_key":"348.l.69705.t.10","team_name":"Gaudio","managers":["JG JR"],"rank":5,"wins":8,"losses":5,"ties":0,"points_for":1170.0,"points_against":1236.0},{"team_key":"348.l.69705.t.7","team_name":"B-MAN","managers":["Budman"],"rank":6,"wins":8,"losses":5,"ties":0,"points_for":1459.0,"points_against":1167.0},{"team_key":"348.l.69705.t.11","team_name":"Cleveland Breedens","managers":["Ryan"],"rank":7,"wins":1,"losses":12,"ties":0,"points_for":893.0,"points_against":1170.0},{"team_key":"348.l.69705.t.5","team_name":"BensonopoloWaite","managers":["B-waite"],"rank":8,"wins":7,"losses":6,"ties":0,"points_for":1214.0,"points_against":1184.0},{"team_key":"348.l.69705.t.8","team_name":"Johnny Fantasy","managers":["Johnny Fantasy"],"rank":9,"wins":5,"losses":8,"ties":0,"points_for":1240.0,"points_against":1264.0},{"team_key":"348.l.69705.t.1","team_name":"Boston Bubcons","managers":["bubcon","Big Kletus"],"rank":10,"wins":7,"losses":6,"ties":0,"points_for":1190.0,"points_against":1219.0},{"team_key":"348.l.69705.t.3","team_name":"98","managers":["Jonathan"],"rank":11,"wins":3,"losses":10,"ties":0,"points_for":1034.0,"points_against":1275.0},{"team_key":"348.l.69705.t.9","team_name":"The Greek","managers":["mark"],"rank":12,"wins":6,"losses":7,"ties":0,"points_for":1083.0,"points_against":1240.0}],"matchups":[{"week":1,"team1":{"team_key":"348.l.69705.t.1","team_name":"Boston Bubcons","points":113.0},"team2":{"team_key":"348.l.69705.t.2","team_name":"Capone","points":104.0},"winner_team_key":"348.l.69705.t.1","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"348.l.69705.t.3","team_name":"98","points":90.0},"team2":{"team_key":"348.l.69705.t.11","team_name":"Cleveland Breedens","points":105.0},"winner_team_key":"348.l.69705.t.11","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"348.l.69705.t.4","team_name":"ALL DAY","points":91.0},"team2":{"team_key":"348.l.69705.t.10","team_name":"Gaudio","points":96.0},"winner_team_key":"348.l.69705.t.10","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"348.l.69705.t.5","team_name":"BensonopoloWaite","points":62.0},"team2":{"team_key":"348.l.69705.t.9","team_name":"The Greek","points":111.0},"winner_team_key":"348.l.69705.t.9","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"348.l.69705.t.6","team_name":"LVC","points":84.0},"team2":{"team_key":"348.l.69705.t.8","team_name":"Johnny Fantasy","points":53.0},"winner_team_key":"348.l.69705.t.6","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"348.l.69705.t.7","team_name":"B-MAN","points":155.0},"team2":{"team_key":"348.l.69705.t.12","team_name":"Scott Stars","points":62.0},"winner_team_key":"348.l.69705.t.7","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"348.l.69705.t.1","team_name":"Boston Bubcons","points":119.0},"team2":{"team_key":"348.l.69705.t.3","team_name":"98","points":83.0},"winner_team_key":"348.l.69705.t.1","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"348.l.69705.t.2","team_name":"Capone","points":39.0},"team2":{"team_key":"348.l.69705.t.12","team_name":"Scott Stars","points":89.0},"winner_team_key":"348.l.69705.t.12","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"348.l.69705.t.4","team_name":"ALL DAY","points":109.0},"team2":{"team_key":"348.l.69705.t.11","team_name":"Cleveland Breedens","points":63.0},"winner_team_key":"348.l.69705.t.4","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"348.l.69705.t.5","team_name":"BensonopoloWaite","points":81.0},"team2":{"team_key":"348.l.69705.t.10","team_name":"Gaudio","points":82.0},"winner_team_key":"348.l.69705.t.10","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"348.l.69705.t.6","team_name":"LVC","points":58.0},"team2":{"team_key":"348.l.69705.t.9","team_name":"The Greek","points":76.0},"winner_team_key":"348.l.69705.t.9","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"348.l.69705.t.7","team_name":"B-MAN","points":133.0},"team2":{"team_key":"348.l.69705.t.8","team_name":"Johnny Fantasy","points":150.0},"winner_team_key":"348.l.69705.t.8","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"348.l.69705.t.1","team_name":"Boston Bubcons","points":59.0},"team2":{"team_key":"348.l.69705.t.4","team_name":"ALL DAY","points":130.0},"winner_team_key":"348.l.69705.t.4","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"348.l.69705.t.2","team_name":"Capone","points":129.0},"team2":{"team_key":"348.l.69705.t.3","team_name":"98","points":98.0},"winner_team_key":"348.l.69705.t.2","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"348.l.69705.t.5","team_name":"BensonopoloWaite","points":74.0},"team2":{"team_key":"348.l.69705.t.11","team_name":"Cleveland Breedens","points":71.0},"winner_team_key":"348.l.69705.t.5","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"348.l.69705.t.6","team_name":"LVC","points":91.0},"team2":{"team_key":"348.l.69705.t.10","team_name":"Gaudio","points":87.0},"winner_team_key":"348.l.69705.t.6","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"348.l.69705.t.7","team_name":"B-MAN","points":115.0},"team2":{"team_key":"348.l.69705.t.9","team_name":"The Greek","points":65.0},"winner_team_key":"348.l.69705.t.7","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"348.l.69705.t.8","team_name":"Johnny Fantasy","points":149.0},"team2":{"team_key":"348.l.69705.t.12","team_name":"Scott Stars","points":107.0},"winner_team_key":"348.l.69705.t.8","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"348.l.69705.t.1","team_name":"Boston Bubcons","points":62.0},"team2":{"team_key":"348.l.69705.t.5","team_name":"BensonopoloWaite","points":75.0},"winner_team_key":"348.l.69705.t.5","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"348.l.69705.t.2","team_name":"Capone","points":135.0},"team2":{"team_key":"348.l.69705.t.4","team_name":"ALL DAY","points":68.0},"winner_team_key":"348.l.69705.t.2","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"348.l.69705.t.3","team_name":"98","points":66.0},"team2":{"team_key":"348.l.69705.t.12","team_name":"Scott Stars","points":90.0},"winner_team_key":"348.l.69705.t.12","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"348.l.69705.t.6","team_name":"LVC","points":95.0},"team2":{"team_key":"348.l.69705.t.11","team_name":"Cleveland Breedens","points":73.0},"winner_team_key":"348.l.69705.t.6","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"348.l.69705.t.7","team_name":"B-MAN","points":82.0},"team2":{"team_key":"348.l.69705.t.10","team_name":"Gaudio","points":83.0},"winner_team_key":"348.l.69705.t.10","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"348.l.69705.t.8","team_name":"Johnny Fantasy","points":67.0},"team2":{"team_key":"348.l.69705.t.9","team_name":"The Greek","points":79.0},"winner_team_key":"348.l.69705.t.9","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"348.l.69705.t.1","team_name":"Boston Bubcons","points":90.0},"team2":{"team_key":"348.l.69705.t.6","team_name":"LVC","points":122.0},"winner_team_key":"348.l.69705.t.6","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"348.l.69705.t.2","team_name":"Capone","points":129.0},"team2":{"team_key":"348.l.69705.t.5","team_name":"BensonopoloWaite","points":84.0},"winner_team_key":"348.l.69705.t.2","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"348.l.69705.t.3","team_name":"98","points":60.0},"team2":{"team_key":"348.l.69705.t.4","team_name":"ALL DAY","points":85.0},"winner_team_key":"348.l.69705.t.4","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"348.l.69705.t.7","team_name":"B-MAN","points":93.0},"team2":{"team_key":"348.l.69705.t.11","team_name":"Cleveland Breedens","points":42.0},"winner_team_key":"348.l.69705.t.7","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"348.l.69705.t.8","team_name":"Johnny Fantasy","points":89.0},"team2":{"team_key":"348.l.69705.t.10","team_name":"Gaudio","points":100.0},"winner_team_key":"348.l.69705.t.10","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"348.l.69705.t.9","team_name":"The Greek","points":73.0},"team2":{"team_key":"348.l.69705.t.12","team_name":"Scott Stars","points":106.0},"winner_team_key":"348.l.69705.t.12","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"348.l.69705.t.1","team_name":"Boston Bubcons","points":90.0},"team2":{"team_key":"348.l.69705.t.7","team_name":"B-MAN","points":132.0},"winner_team_key":"348.l.69705.t.7","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"348.l.69705.t.2","team_name":"Capone","points":111.0},"team2":{"team_key":"348.l.69705.t.6","team_name":"LVC","points":106.0},"winner_team_key":"348.l.69705.t.2","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"348.l.69705.t.3","team_name":"98","points":65.0},"team2":{"team_key":"348.l.69705.t.5","team_name":"BensonopoloWaite","points":94.0},"winner_team_key":"348.l.69705.t.5","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"348.l.69705.t.4","team_name":"ALL DAY","points":105.0},"team2":{"team_key":"348.l.69705.t.12","team_name":"Scott Stars","points":94.0},"winner_team_key":"348.l.69705.t.4","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"348.l.69705.t.8","team_name":"Johnny Fantasy","points":78.0},"team2":{"team_key":"348.l.69705.t.11","team_name":"Cleveland Breedens","points":66.0},"winner_team_key":"348.l.69705.t.8","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"348.l.69705.t.9","team_name":"The Greek","points":143.0},"team2":{"team_key":"348.l.69705.t.10","team_name":"Gaudio","points":128.0},"winner_team_key":"348.l.69705.t.9","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"348.l.69705.t.1","team_name":"Boston Bubcons","points":106.0},"team2":{"team_key":"348.l.69705.t.8","team_name":"Johnny Fantasy","points":92.0},"winner_team_key":"348.l.69705.t.1","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"348.l.69705.t.2","team_name":"Capone","points":133.0},"team2":{"team_key":"348.l.69705.t.7","team_name":"B-MAN","points":130.0},"winner_team_key":"348.l.69705.t.2","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"348.l.69705.t.3","team_name":"98","points":71.0},"team2":{"team_key":"348.l.69705.t.6","team_name":"LVC","points":120.0},"winner_team_key":"348.l.69705.t.6","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"348.l.69705.t.4","team_name":"ALL DAY","points":90.0},"team2":{"team_key":"348.l.69705.t.5","team_name":"BensonopoloWaite","points":88.0},"winner_team_key":"348.l.69705.t.4","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"348.l.69705.t.9","team_name":"The Greek","points":69.0},"team2":{"team_key":"348.l.69705.t.11","team_name":"Cleveland Breedens","points":68.0},"winner_team_key":"348.l.69705.t.9","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"348.l.69705.t.10","team_name":"Gaudio","points":106.0},"team2":{"team_key":"348.l.69705.t.12","team_name":"Scott Stars","points":78.0},"winner_team_key":"348.l.69705.t.10","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"348.l.69705.t.1","team_name":"Boston Bubcons","points":88.0},"team2":{"team_key":"348.l.69705.t.9","team_name":"The Greek","points":46.0},"winner_team_key":"348.l.69705.t.1","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"348.l.69705.t.2","team_name":"Capone","points":98.0},"team2":{"team_key":"348.l.69705.t.8","team_name":"Johnny Fantasy","points":91.0},"winner_team_key":"348.l.69705.t.2","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"348.l.69705.t.3","team_name":"98","points":97.0},"team2":{"team_key":"348.l.69705.t.7","team_name":"B-MAN","points":130.0},"winner_team_key":"348.l.69705.t.7","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"348.l.69705.t.4","team_name":"ALL DAY","points":109.0},"team2":{"team_key":"348.l.69705.t.6","team_name":"LVC","points":104.0},"winner_team_key":"348.l.69705.t.4","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"348.l.69705.t.5","team_name":"BensonopoloWaite","points":89.0},"team2":{"team_key":"348.l.69705.t.12","team_name":"Scott Stars","points":151.0},"winner_team_key":"348.l.69705.t.12","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"348.l.69705.t.10","team_name":"Gaudio","points":74.0},"team2":{"team_key":"348.l.69705.t.11","team_name":"Cleveland Breedens","points":71.0},"winner_team_key":"348.l.69705.t.10","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"348.l.69705.t.1","team_name":"Boston Bubcons","points":131.0},"team2":{"team_key":"348.l.69705.t.10","team_name":"Gaudio","points":89.0},"winner_team_key":"348.l.69705.t.1","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"348.l.69705.t.2","team_name":"Capone","points":109.0},"team2":{"team_key":"348.l.69705.t.9","team_name":"The Greek","points":120.0},"winner_team_key":"348.l.69705.t.9","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"348.l.69705.t.3","team_name":"98","points":68.0},"team2":{"team_key":"348.l.69705.t.8","team_name":"Johnny Fantasy","points":109.0},"winner_team_key":"348.l.69705.t.8","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"348.l.69705.t.4","team_name":"ALL DAY","points":115.0},"team2":{"team_key":"348.l.69705.t.7","team_name":"B-MAN","points":116.0},"winner_team_key":"348.l.69705.t.7","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"348.l.69705.t.5","team_name":"BensonopoloWaite","points":85.0},"team2":{"team_key":"348.l.69705.t.6","team_name":"LVC","points":98.0},"winner_team_key":"348.l.69705.t.6","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"348.l.69705.t.11","team_name":"Cleveland Breedens","points":78.0},"team2":{"team_key":"348.l.69705.t.12","team_name":"Scott Stars","points":109.0},"winner_team_key":"348.l.69705.t.12","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"348.l.69705.t.1","team_name":"Boston Bubcons","points":101.0},"team2":{"team_key":"348.l.69705.t.11","team_name":"Cleveland Breedens","points":48.0},"winner_team_key":"348.l.69705.t.1","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"348.l.69705.t.2","team_name":"Capone","points":78.0},"team2":{"team_key":"348.l.69705.t.10","team_name":"Gaudio","points":85.0},"winner_team_key":"348.l.69705.t.10","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"348.l.69705.t.3","team_name":"98","points":97.0},"team2":{"team_key":"348.l.69705.t.9","team_name":"The Greek","points":75.0},"winner_team_key":"348.l.69705.t.3","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"348.l.69705.t.4","team_name":"ALL DAY","points":111.0},"team2":{"team_key":"348.l.69705.t.8","team_name":"Johnny Fantasy","points":95.0},"winner_team_key":"348.l.69705.t.4","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"348.l.69705.t.5","team_name":"BensonopoloWaite","points":102.0},"team2":{"team_key":"348.l.69705.t.7","team_name":"B-MAN","points":93.0},"winner_team_key":"348.l.69705.t.5","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"348.l.69705.t.6","team_name":"LVC","points":82.0},"team2":{"team_key":"348.l.69705.t.12","team_name":"Scott Stars","points":107.0},"winner_team_key":"348.l.69705.t.12","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"348.l.69705.t.1","team_name":"Boston Bubcons","points":77.0},"team2":{"team_key":"348.l.69705.t.12","team_name":"Scott Stars","points":92.0},"winner_team_key":"348.l.69705.t.12","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"348.l.69705.t.2","team_name":"Capone","points":86.0},"team2":{"team_key":"348.l.69705.t.11","team_name":"Cleveland Breedens","points":67.0},"winner_team_key":"348.l.69705.t.2","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"348.l.69705.t.3","team_name":"98","points":83.0},"team2":{"team_key":"348.l.69705.t.10","team_name":"Gaudio","points":68.0},"winner_team_key":"348.l.69705.t.3","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"348.l.69705.t.4","team_name":"ALL DAY","points":83.0},"team2":{"team_key":"348.l.69705.t.9","team_name":"The Greek","points":59.0},"winner_team_key":"348.l.69705.t.4","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"348.l.69705.t.5","team_name":"BensonopoloWaite","points":105.0},"team2":{"team_key":"348.l.69705.t.8","team_name":"Johnny Fantasy","points":94.0},"winner_team_key":"348.l.69705.t.5","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"348.l.69705.t.6","team_name":"LVC","points":68.0},"team2":{"team_key":"348.l.69705.t.7","team_name":"B-MAN","points":83.0},"winner_team_key":"348.l.69705.t.7","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"348.l.69705.t.1","team_name":"Boston Bubcons","points":59.0},"team2":{"team_key":"348.l.69705.t.2","team_name":"Capone","points":124.0},"winner_team_key":"348.l.69705.t.2","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"348.l.69705.t.3","team_name":"98","points":74.0},"team2":{"team_key":"348.l.69705.t.11","team_name":"Cleveland Breedens","points":56.0},"winner_team_key":"348.l.69705.t.3","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"348.l.69705.t.4","team_name":"ALL DAY","points":87.0},"team2":{"team_key":"348.l.69705.t.10","team_name":"Gaudio","points":105.0},"winner_team_key":"348.l.69705.t.10","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"348.l.69705.t.5","team_name":"BensonopoloWaite","points":144.0},"team2":{"team_key":"348.l.69705.t.9","team_name":"The Greek","points":71.0},"winner_team_key":"348.l.69705.t.5","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"348.l.69705.t.6","team_name":"LVC","points":94.0},"team2":{"team_key":"348.l.69705.t.8","team_name":"Johnny Fantasy","points":101.0},"winner_team_key":"348.l.69705.t.8","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"348.l.69705.t.7","team_name":"B-MAN","points":84.0},"team2":{"team_key":"348.l.69705.t.12","team_name":"Scott Stars","points":88.0},"winner_team_key":"348.l.69705.t.12","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"348.l.69705.t.1","team_name":"Boston Bubcons","points":95.0},"team2":{"team_key":"348.l.69705.t.3","team_name":"98","points":82.0},"winner_team_key":"348.l.69705.t.1","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"348.l.69705.t.2","team_name":"Capone","points":101.0},"team2":{"team_key":"348.l.69705.t.12","team_name":"Scott Stars","points":139.0},"winner_team_key":"348.l.69705.t.12","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"348.l.69705.t.4","team_name":"ALL DAY","points":118.0},"team2":{"team_key":"348.l.69705.t.11","team_name":"Cleveland Breedens","points":85.0},"winner_team_key":"348.l.69705.t.4","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"348.l.69705.t.5","team_name":"BensonopoloWaite","points":131.0},"team2":{"team_key":"348.l.69705.t.10","team_name":"Gaudio","points":67.0},"winner_team_key":"348.l.69705.t.5","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"348.l.69705.t.6","team_name":"LVC","points":115.0},"team2":{"team_key":"348.l.69705.t.9","team_name":"The Greek","points":96.0},"winner_team_key":"348.l.69705.t.6","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"348.l.69705.t.7","team_name":"B-MAN","points":113.0},"team2":{"team_key":"348.l.69705.t.8","team_name":"Johnny Fantasy","points":72.0},"winner_team_key":"348.l.69705.t.7","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"348.l.69705.t.2","team_name":"Capone","points":92.0},"team2":{"team_key":"348.l.69705.t.10","team_name":"Gaudio","points":65.0},"winner_team_key":"348.l.69705.t.2","is_playoffs":true,"is_championship":false},{"week":14,"team1":{"team_key":"348.l.69705.t.3","team_name":"98","points":59.0},"team2":{"team_key":"348.l.69705.t.8","team_name":"Johnny Fantasy","points":75.0},"winner_team_key":"348.l.69705.t.8","is_playoffs":true,"is_championship":false},{"week":14,"team1":{"team_key":"348.l.69705.t.6","team_name":"LVC","points":125.0},"team2":{"team_key":"348.l.69705.t.7","team_name":"B-MAN","points":105.0},"winner_team_key":"348.l.69705.t.6","is_playoffs":true,"is_championship":false},{"week":14,"team1":{"team_key":"348.l.69705.t.9","team_name":"The Greek","points":49.0},"team2":{"team_key":"348.l.69705.t.11","team_name":"Cleveland Breedens","points":83.0},"winner_team_key":"348.l.69705.t.11","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"348.l.69705.t.1","team_name":"Boston Bubcons","points":103.0},"team2":{"team_key":"348.l.69705.t.11","team_name":"Cleveland Breedens","points":105.0},"winner_team_key":"348.l.69705.t.11","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"348.l.69705.t.2","team_name":"Capone","points":88.0},"team2":{"team_key":"348.l.69705.t.12","team_name":"Scott Stars","points":137.0},"winner_team_key":"348.l.69705.t.12","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"348.l.69705.t.3","team_name":"98","points":122.0},"team2":{"team_key":"348.l.69705.t.9","team_name":"The Greek","points":72.0},"winner_team_key":"348.l.69705.t.3","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"348.l.69705.t.4","team_name":"ALL DAY","points":84.0},"team2":{"team_key":"348.l.69705.t.6","team_name":"LVC","points":93.0},"winner_team_key":"348.l.69705.t.6","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"348.l.69705.t.5","team_name":"BensonopoloWaite","points":84.0},"team2":{"team_key":"348.l.69705.t.8","team_name":"Johnny Fantasy","points":83.0},"winner_team_key":"348.l.69705.t.5","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"348.l.69705.t.7","team_name":"B-MAN","points":81.0},"team2":{"team_key":"348.l.69705.t.10","team_name":"Gaudio","points":125.0},"winner_team_key":"348.l.69705.t.10","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"348.l.69705.t.1","team_name":"Boston Bubcons","points":64.0},"team2":{"team_key":"348.l.69705.t.8","team_name":"Johnny Fantasy","points":86.0},"winner_team_key":"348.l.69705.t.8","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"348.l.69705.t.2","team_name":"Capone","points":131.0},"team2":{"team_key":"348.l.69705.t.4","team_name":"ALL DAY","points":55.0},"winner_team_key":"348.l.69705.t.2","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"348.l.69705.t.5","team_name":"BensonopoloWaite","points":73.0},"team2":{"team_key":"348.l.69705.t.11","team_name":"Cleveland Breedens","points":75.0},"winner_team_key":"348.l.69705.t.11","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"348.l.69705.t.6","team_name":"LVC","points":85.0},"team2":{"team_key":"348.l.69705.t.12","team_name":"Scott Stars","points":147.0},"winner_team_key":"348.l.69705.t.12","is_playoffs":true,"is_championship":true}],"season_high_score":{"points":155.0,"team":"B-MAN","week":1},"season_low_score":{"points":39.0,"team":"Capone","week":2}},{"season":2016,"league_key":"359.l.153728","league_name":"BKGFFL","num_teams":12,"playoff_start_week":14,"champion":{"team_key":"359.l.153728.t.6","team_name":"LVC","points":148.0},"runner_up":{"team_key":"359.l.153728.t.5","team_name":"BensonopoloWaite","points":104.0},"champ_score":148.0,"runner_score":104.0,"standings":[{"team_key":"359.l.153728.t.6","team_name":"LVC","managers":["LVC"],"rank":1,"wins":8,"losses":5,"ties":0,"points_for":1353.0,"points_against":1215.0},{"team_key":"359.l.153728.t.5","team_name":"BensonopoloWaite","managers":["B-waite"],"rank":2,"wins":7,"losses":6,"ties":0,"points_for":1344.0,"points_against":1307.0},{"team_key":"359.l.153728.t.7","team_name":"B-MAN","managers":["Budman","Robert"],"rank":3,"wins":8,"losses":5,"ties":0,"points_for":1267.0,"points_against":1177.0},{"team_key":"359.l.153728.t.12","team_name":"Scott Stars","managers":["Clarke","Rich"],"rank":4,"wins":9,"losses":4,"ties":0,"points_for":1237.0,"points_against":1196.0},{"team_key":"359.l.153728.t.1","team_name":"Boston Bubcons","managers":["bubcon","Big Kletus"],"rank":5,"wins":8,"losses":5,"ties":0,"points_for":1186.0,"points_against":1175.0},{"team_key":"359.l.153728.t.9","team_name":"The Greek","managers":["mark"],"rank":6,"wins":7,"losses":6,"ties":0,"points_for":1252.0,"points_against":1226.0},{"team_key":"359.l.153728.t.3","team_name":"98","managers":["Jonathan"],"rank":7,"wins":6,"losses":7,"ties":0,"points_for":1206.0,"points_against":1171.0},{"team_key":"359.l.153728.t.11","team_name":"Cleveland Breedens","managers":["Ryan"],"rank":8,"wins":6,"losses":7,"ties":0,"points_for":1256.0,"points_against":1233.0},{"team_key":"359.l.153728.t.8","team_name":"Johnny Fantasy","managers":["Johnny Fantasy"],"rank":9,"wins":5,"losses":8,"ties":0,"points_for":1223.0,"points_against":1190.0},{"team_key":"359.l.153728.t.10","team_name":"Oppogado","managers":["JG JR"],"rank":10,"wins":6,"losses":7,"ties":0,"points_for":1133.0,"points_against":1171.0},{"team_key":"359.l.153728.t.4","team_name":"ALL DAY","managers":["A D"],"rank":11,"wins":4,"losses":9,"ties":0,"points_for":1109.0,"points_against":1350.0},{"team_key":"359.l.153728.t.2","team_name":"Team Terry","managers":["terry"],"rank":12,"wins":4,"losses":9,"ties":0,"points_for":1069.0,"points_against":1224.0}],"matchups":[{"week":1,"team1":{"team_key":"359.l.153728.t.1","team_name":"Boston Bubcons","points":122.0},"team2":{"team_key":"359.l.153728.t.2","team_name":"Team Terry","points":82.0},"winner_team_key":"359.l.153728.t.1","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"359.l.153728.t.3","team_name":"98","points":97.0},"team2":{"team_key":"359.l.153728.t.11","team_name":"Cleveland Breedens","points":93.0},"winner_team_key":"359.l.153728.t.3","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"359.l.153728.t.4","team_name":"ALL DAY","points":89.0},"team2":{"team_key":"359.l.153728.t.10","team_name":"Oppogado","points":79.0},"winner_team_key":"359.l.153728.t.4","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"359.l.153728.t.5","team_name":"BensonopoloWaite","points":124.0},"team2":{"team_key":"359.l.153728.t.9","team_name":"The Greek","points":106.0},"winner_team_key":"359.l.153728.t.5","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"359.l.153728.t.6","team_name":"LVC","points":96.0},"team2":{"team_key":"359.l.153728.t.8","team_name":"Johnny Fantasy","points":109.0},"winner_team_key":"359.l.153728.t.8","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"359.l.153728.t.7","team_name":"B-MAN","points":86.0},"team2":{"team_key":"359.l.153728.t.12","team_name":"Scott Stars","points":113.0},"winner_team_key":"359.l.153728.t.12","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"359.l.153728.t.1","team_name":"Boston Bubcons","points":72.0},"team2":{"team_key":"359.l.153728.t.3","team_name":"98","points":114.0},"winner_team_key":"359.l.153728.t.3","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"359.l.153728.t.2","team_name":"Team Terry","points":85.0},"team2":{"team_key":"359.l.153728.t.12","team_name":"Scott Stars","points":56.0},"winner_team_key":"359.l.153728.t.2","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"359.l.153728.t.4","team_name":"ALL DAY","points":128.0},"team2":{"team_key":"359.l.153728.t.11","team_name":"Cleveland Breedens","points":106.0},"winner_team_key":"359.l.153728.t.4","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"359.l.153728.t.5","team_name":"BensonopoloWaite","points":111.0},"team2":{"team_key":"359.l.153728.t.10","team_name":"Oppogado","points":96.0},"winner_team_key":"359.l.153728.t.5","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"359.l.153728.t.6","team_name":"LVC","points":83.0},"team2":{"team_key":"359.l.153728.t.9","team_name":"The Greek","points":80.0},"winner_team_key":"359.l.153728.t.6","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"359.l.153728.t.7","team_name":"B-MAN","points":74.0},"team2":{"team_key":"359.l.153728.t.8","team_name":"Johnny Fantasy","points":71.0},"winner_team_key":"359.l.153728.t.7","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"359.l.153728.t.1","team_name":"Boston Bubcons","points":76.0},"team2":{"team_key":"359.l.153728.t.4","team_name":"ALL DAY","points":70.0},"winner_team_key":"359.l.153728.t.1","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"359.l.153728.t.2","team_name":"Team Terry","points":87.0},"team2":{"team_key":"359.l.153728.t.3","team_name":"98","points":113.0},"winner_team_key":"359.l.153728.t.3","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"359.l.153728.t.5","team_name":"BensonopoloWaite","points":92.0},"team2":{"team_key":"359.l.153728.t.11","team_name":"Cleveland Breedens","points":125.0},"winner_team_key":"359.l.153728.t.11","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"359.l.153728.t.6","team_name":"LVC","points":85.0},"team2":{"team_key":"359.l.153728.t.10","team_name":"Oppogado","points":93.0},"winner_team_key":"359.l.153728.t.10","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"359.l.153728.t.7","team_name":"B-MAN","points":112.0},"team2":{"team_key":"359.l.153728.t.9","team_name":"The Greek","points":91.0},"winner_team_key":"359.l.153728.t.7","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"359.l.153728.t.8","team_name":"Johnny Fantasy","points":99.0},"team2":{"team_key":"359.l.153728.t.12","team_name":"Scott Stars","points":135.0},"winner_team_key":"359.l.153728.t.12","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"359.l.153728.t.1","team_name":"Boston Bubcons","points":96.0},"team2":{"team_key":"359.l.153728.t.5","team_name":"BensonopoloWaite","points":111.0},"winner_team_key":"359.l.153728.t.5","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"359.l.153728.t.2","team_name":"Team Terry","points":97.0},"team2":{"team_key":"359.l.153728.t.4","team_name":"ALL DAY","points":73.0},"winner_team_key":"359.l.153728.t.2","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"359.l.153728.t.3","team_name":"98","points":91.0},"team2":{"team_key":"359.l.153728.t.12","team_name":"Scott Stars","points":98.0},"winner_team_key":"359.l.153728.t.12","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"359.l.153728.t.6","team_name":"LVC","points":101.0},"team2":{"team_key":"359.l.153728.t.11","team_name":"Cleveland Breedens","points":106.0},"winner_team_key":"359.l.153728.t.11","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"359.l.153728.t.7","team_name":"B-MAN","points":93.0},"team2":{"team_key":"359.l.153728.t.10","team_name":"Oppogado","points":72.0},"winner_team_key":"359.l.153728.t.7","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"359.l.153728.t.8","team_name":"Johnny Fantasy","points":96.0},"team2":{"team_key":"359.l.153728.t.9","team_name":"The Greek","points":57.0},"winner_team_key":"359.l.153728.t.8","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"359.l.153728.t.1","team_name":"Boston Bubcons","points":83.0},"team2":{"team_key":"359.l.153728.t.6","team_name":"LVC","points":144.0},"winner_team_key":"359.l.153728.t.6","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"359.l.153728.t.2","team_name":"Team Terry","points":101.0},"team2":{"team_key":"359.l.153728.t.5","team_name":"BensonopoloWaite","points":120.0},"winner_team_key":"359.l.153728.t.5","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"359.l.153728.t.3","team_name":"98","points":66.0},"team2":{"team_key":"359.l.153728.t.4","team_name":"ALL DAY","points":89.0},"winner_team_key":"359.l.153728.t.4","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"359.l.153728.t.7","team_name":"B-MAN","points":88.0},"team2":{"team_key":"359.l.153728.t.11","team_name":"Cleveland Breedens","points":93.0},"winner_team_key":"359.l.153728.t.11","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"359.l.153728.t.8","team_name":"Johnny Fantasy","points":86.0},"team2":{"team_key":"359.l.153728.t.10","team_name":"Oppogado","points":109.0},"winner_team_key":"359.l.153728.t.10","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"359.l.153728.t.9","team_name":"The Greek","points":95.0},"team2":{"team_key":"359.l.153728.t.12","team_name":"Scott Stars","points":74.0},"winner_team_key":"359.l.153728.t.9","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"359.l.153728.t.1","team_name":"Boston Bubcons","points":118.0},"team2":{"team_key":"359.l.153728.t.7","team_name":"B-MAN","points":107.0},"winner_team_key":"359.l.153728.t.1","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"359.l.153728.t.2","team_name":"Team Terry","points":65.0},"team2":{"team_key":"359.l.153728.t.6","team_name":"LVC","points":95.0},"winner_team_key":"359.l.153728.t.6","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"359.l.153728.t.3","team_name":"98","points":74.0},"team2":{"team_key":"359.l.153728.t.5","team_name":"BensonopoloWaite","points":99.0},"winner_team_key":"359.l.153728.t.5","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"359.l.153728.t.4","team_name":"ALL DAY","points":80.0},"team2":{"team_key":"359.l.153728.t.12","team_name":"Scott Stars","points":120.0},"winner_team_key":"359.l.153728.t.12","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"359.l.153728.t.8","team_name":"Johnny Fantasy","points":97.0},"team2":{"team_key":"359.l.153728.t.11","team_name":"Cleveland Breedens","points":61.0},"winner_team_key":"359.l.153728.t.8","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"359.l.153728.t.9","team_name":"The Greek","points":87.0},"team2":{"team_key":"359.l.153728.t.10","team_name":"Oppogado","points":80.0},"winner_team_key":"359.l.153728.t.9","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"359.l.153728.t.1","team_name":"Boston Bubcons","points":103.0},"team2":{"team_key":"359.l.153728.t.8","team_name":"Johnny Fantasy","points":94.0},"winner_team_key":"359.l.153728.t.1","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"359.l.153728.t.2","team_name":"Team Terry","points":50.0},"team2":{"team_key":"359.l.153728.t.7","team_name":"B-MAN","points":82.0},"winner_team_key":"359.l.153728.t.7","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"359.l.153728.t.3","team_name":"98","points":96.0},"team2":{"team_key":"359.l.153728.t.6","team_name":"LVC","points":63.0},"winner_team_key":"359.l.153728.t.3","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"359.l.153728.t.4","team_name":"ALL DAY","points":65.0},"team2":{"team_key":"359.l.153728.t.5","team_name":"BensonopoloWaite","points":134.0},"winner_team_key":"359.l.153728.t.5","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"359.l.153728.t.9","team_name":"The Greek","points":113.0},"team2":{"team_key":"359.l.153728.t.11","team_name":"Cleveland Breedens","points":85.0},"winner_team_key":"359.l.153728.t.9","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"359.l.153728.t.10","team_name":"Oppogado","points":87.0},"team2":{"team_key":"359.l.153728.t.12","team_name":"Scott Stars","points":125.0},"winner_team_key":"359.l.153728.t.12","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"359.l.153728.t.1","team_name":"Boston Bubcons","points":108.0},"team2":{"team_key":"359.l.153728.t.9","team_name":"The Greek","points":65.0},"winner_team_key":"359.l.153728.t.1","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"359.l.153728.t.2","team_name":"Team Terry","points":97.0},"team2":{"team_key":"359.l.153728.t.8","team_name":"Johnny Fantasy","points":91.0},"winner_team_key":"359.l.153728.t.2","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"359.l.153728.t.3","team_name":"98","points":99.0},"team2":{"team_key":"359.l.153728.t.7","team_name":"B-MAN","points":122.0},"winner_team_key":"359.l.153728.t.7","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"359.l.153728.t.4","team_name":"ALL DAY","points":109.0},"team2":{"team_key":"359.l.153728.t.6","team_name":"LVC","points":103.0},"winner_team_key":"359.l.153728.t.4","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"359.l.153728.t.5","team_name":"BensonopoloWaite","points":87.0},"team2":{"team_key":"359.l.153728.t.12","team_name":"Scott Stars","points":92.0},"winner_team_key":"359.l.153728.t.12","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"359.l.153728.t.10","team_name":"Oppogado","points":43.0},"team2":{"team_key":"359.l.153728.t.11","team_name":"Cleveland Breedens","points":97.0},"winner_team_key":"359.l.153728.t.11","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"359.l.153728.t.1","team_name":"Boston Bubcons","points":69.0},"team2":{"team_key":"359.l.153728.t.10","team_name":"Oppogado","points":85.0},"winner_team_key":"359.l.153728.t.10","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"359.l.153728.t.2","team_name":"Team Terry","points":80.0},"team2":{"team_key":"359.l.153728.t.9","team_name":"The Greek","points":108.0},"winner_team_key":"359.l.153728.t.9","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"359.l.153728.t.3","team_name":"98","points":87.0},"team2":{"team_key":"359.l.153728.t.8","team_name":"Johnny Fantasy","points":69.0},"winner_team_key":"359.l.153728.t.3","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"359.l.153728.t.4","team_name":"ALL DAY","points":73.0},"team2":{"team_key":"359.l.153728.t.7","team_name":"B-MAN","points":123.0},"winner_team_key":"359.l.153728.t.7","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"359.l.153728.t.5","team_name":"BensonopoloWaite","points":98.0},"team2":{"team_key":"359.l.153728.t.6","team_name":"LVC","points":129.0},"winner_team_key":"359.l.153728.t.6","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"359.l.153728.t.11","team_name":"Cleveland Breedens","points":85.0},"team2":{"team_key":"359.l.153728.t.12","team_name":"Scott Stars","points":93.0},"winner_team_key":"359.l.153728.t.12","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"359.l.153728.t.1","team_name":"Boston Bubcons","points":98.0},"team2":{"team_key":"359.l.153728.t.11","team_name":"Cleveland Breedens","points":87.0},"winner_team_key":"359.l.153728.t.1","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"359.l.153728.t.2","team_name":"Team Terry","points":75.0},"team2":{"team_key":"359.l.153728.t.10","team_name":"Oppogado","points":94.0},"winner_team_key":"359.l.153728.t.10","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"359.l.153728.t.3","team_name":"98","points":105.0},"team2":{"team_key":"359.l.153728.t.9","team_name":"The Greek","points":121.0},"winner_team_key":"359.l.153728.t.9","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"359.l.153728.t.4","team_name":"ALL DAY","points":97.0},"team2":{"team_key":"359.l.153728.t.8","team_name":"Johnny Fantasy","points":114.0},"winner_team_key":"359.l.153728.t.8","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"359.l.153728.t.5","team_name":"BensonopoloWaite","points":127.0},"team2":{"team_key":"359.l.153728.t.7","team_name":"B-MAN","points":84.0},"winner_team_key":"359.l.153728.t.5","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"359.l.153728.t.6","team_name":"LVC","points":125.0},"team2":{"team_key":"359.l.153728.t.12","team_name":"Scott Stars","points":77.0},"winner_team_key":"359.l.153728.t.6","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"359.l.153728.t.1","team_name":"Boston Bubcons","points":74.0},"team2":{"team_key":"359.l.153728.t.12","team_name":"Scott Stars","points":77.0},"winner_team_key":"359.l.153728.t.12","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"359.l.153728.t.2","team_name":"Team Terry","points":107.0},"team2":{"team_key":"359.l.153728.t.11","team_name":"Cleveland Breedens","points":104.0},"winner_team_key":"359.l.153728.t.2","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"359.l.153728.t.3","team_name":"98","points":101.0},"team2":{"team_key":"359.l.153728.t.10","team_name":"Oppogado","points":85.0},"winner_team_key":"359.l.153728.t.3","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"359.l.153728.t.4","team_name":"ALL DAY","points":76.0},"team2":{"team_key":"359.l.153728.t.9","team_name":"The Greek","points":100.0},"winner_team_key":"359.l.153728.t.9","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"359.l.153728.t.5","team_name":"BensonopoloWaite","points":71.0},"team2":{"team_key":"359.l.153728.t.8","team_name":"Johnny Fantasy","points":117.0},"winner_team_key":"359.l.153728.t.8","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"359.l.153728.t.6","team_name":"LVC","points":94.0},"team2":{"team_key":"359.l.153728.t.7","team_name":"B-MAN","points":91.0},"winner_team_key":"359.l.153728.t.6","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"359.l.153728.t.1","team_name":"Boston Bubcons","points":84.0},"team2":{"team_key":"359.l.153728.t.2","team_name":"Team Terry","points":63.0},"winner_team_key":"359.l.153728.t.1","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"359.l.153728.t.3","team_name":"98","points":87.0},"team2":{"team_key":"359.l.153728.t.11","team_name":"Cleveland Breedens","points":90.0},"winner_team_key":"359.l.153728.t.11","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"359.l.153728.t.4","team_name":"ALL DAY","points":71.0},"team2":{"team_key":"359.l.153728.t.10","team_name":"Oppogado","points":108.0},"winner_team_key":"359.l.153728.t.10","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"359.l.153728.t.5","team_name":"BensonopoloWaite","points":88.0},"team2":{"team_key":"359.l.153728.t.9","team_name":"The Greek","points":120.0},"winner_team_key":"359.l.153728.t.9","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"359.l.153728.t.6","team_name":"LVC","points":120.0},"team2":{"team_key":"359.l.153728.t.8","team_name":"Johnny Fantasy","points":99.0},"winner_team_key":"359.l.153728.t.6","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"359.l.153728.t.7","team_name":"B-MAN","points":122.0},"team2":{"team_key":"359.l.153728.t.12","team_name":"Scott Stars","points":95.0},"winner_team_key":"359.l.153728.t.7","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"359.l.153728.t.1","team_name":"Boston Bubcons","points":83.0},"team2":{"team_key":"359.l.153728.t.3","team_name":"98","points":76.0},"winner_team_key":"359.l.153728.t.1","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"359.l.153728.t.2","team_name":"Team Terry","points":80.0},"team2":{"team_key":"359.l.153728.t.12","team_name":"Scott Stars","points":82.0},"winner_team_key":"359.l.153728.t.12","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"359.l.153728.t.4","team_name":"ALL DAY","points":89.0},"team2":{"team_key":"359.l.153728.t.11","team_name":"Cleveland Breedens","points":124.0},"winner_team_key":"359.l.153728.t.11","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"359.l.153728.t.5","team_name":"BensonopoloWaite","points":82.0},"team2":{"team_key":"359.l.153728.t.10","team_name":"Oppogado","points":102.0},"winner_team_key":"359.l.153728.t.10","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"359.l.153728.t.6","team_name":"LVC","points":115.0},"team2":{"team_key":"359.l.153728.t.9","team_name":"The Greek","points":109.0},"winner_team_key":"359.l.153728.t.6","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"359.l.153728.t.7","team_name":"B-MAN","points":83.0},"team2":{"team_key":"359.l.153728.t.8","team_name":"Johnny Fantasy","points":81.0},"winner_team_key":"359.l.153728.t.7","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"359.l.153728.t.1","team_name":"Boston Bubcons","points":62.0},"team2":{"team_key":"359.l.153728.t.5","team_name":"BensonopoloWaite","points":78.0},"winner_team_key":"359.l.153728.t.5","is_playoffs":true,"is_championship":false},{"week":14,"team1":{"team_key":"359.l.153728.t.2","team_name":"Team Terry","points":79.0},"team2":{"team_key":"359.l.153728.t.10","team_name":"Oppogado","points":105.0},"winner_team_key":"359.l.153728.t.10","is_playoffs":true,"is_championship":false},{"week":14,"team1":{"team_key":"359.l.153728.t.4","team_name":"ALL DAY","points":55.0},"team2":{"team_key":"359.l.153728.t.8","team_name":"Johnny Fantasy","points":74.0},"winner_team_key":"359.l.153728.t.8","is_playoffs":true,"is_championship":false},{"week":14,"team1":{"team_key":"359.l.153728.t.7","team_name":"B-MAN","points":105.0},"team2":{"team_key":"359.l.153728.t.9","team_name":"The Greek","points":74.0},"winner_team_key":"359.l.153728.t.7","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"359.l.153728.t.1","team_name":"Boston Bubcons","points":119.0},"team2":{"team_key":"359.l.153728.t.9","team_name":"The Greek","points":85.0},"winner_team_key":"359.l.153728.t.1","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"359.l.153728.t.2","team_name":"Team Terry","points":52.0},"team2":{"team_key":"359.l.153728.t.4","team_name":"ALL DAY","points":74.0},"winner_team_key":"359.l.153728.t.4","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"359.l.153728.t.3","team_name":"98","points":89.0},"team2":{"team_key":"359.l.153728.t.10","team_name":"Oppogado","points":60.0},"winner_team_key":"359.l.153728.t.3","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"359.l.153728.t.5","team_name":"BensonopoloWaite","points":97.0},"team2":{"team_key":"359.l.153728.t.12","team_name":"Scott Stars","points":91.0},"winner_team_key":"359.l.153728.t.5","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"359.l.153728.t.6","team_name":"LVC","points":113.0},"team2":{"team_key":"359.l.153728.t.7","team_name":"B-MAN","points":105.0},"winner_team_key":"359.l.153728.t.6","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"359.l.153728.t.8","team_name":"Johnny Fantasy","points":82.0},"team2":{"team_key":"359.l.153728.t.11","team_name":"Cleveland Breedens","points":120.0},"winner_team_key":"359.l.153728.t.11","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"359.l.153728.t.3","team_name":"98","points":107.0},"team2":{"team_key":"359.l.153728.t.11","team_name":"Cleveland Breedens","points":97.0},"winner_team_key":"359.l.153728.t.3","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"359.l.153728.t.5","team_name":"BensonopoloWaite","points":104.0},"team2":{"team_key":"359.l.153728.t.6","team_name":"LVC","points":148.0},"winner_team_key":"359.l.153728.t.6","is_playoffs":true,"is_championship":true},{"week":16,"team1":{"team_key":"359.l.153728.t.7","team_name":"B-MAN","points":101.0},"team2":{"team_key":"359.l.153728.t.12","team_name":"Scott Stars","points":84.0},"winner_team_key":"359.l.153728.t.7","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"359.l.153728.t.8","team_name":"Johnny Fantasy","points":134.0},"team2":{"team_key":"359.l.153728.t.10","team_name":"Oppogado","points":64.0},"winner_team_key":"359.l.153728.t.8","is_playoffs":true,"is_championship":false}],"season_high_score":{"points":148.0,"team":"LVC","week":16},"season_low_score":{"points":43.0,"team":"Oppogado","week":8}},{"season":2017,"league_key":"371.l.27635","league_name":"BKGFFL","num_teams":12,"playoff_start_week":14,"champion":{"team_key":"371.l.27635.t.12","team_name":"The Greek","points":74.0},"runner_up":{"team_key":"371.l.27635.t.7","team_name":"Johnny Fantasy","points":63.0},"champ_score":74.0,"runner_score":63.0,"standings":[{"team_key":"371.l.27635.t.12","team_name":"The Greek","managers":["mark","peter riccio"],"rank":1,"wins":8,"losses":5,"ties":0,"points_for":1276.0,"points_against":1072.0},{"team_key":"371.l.27635.t.7","team_name":"Johnny Fantasy","managers":["Johnny Fantasy"],"rank":2,"wins":7,"losses":6,"ties":0,"points_for":1151.0,"points_against":1186.0},{"team_key":"371.l.27635.t.4","team_name":"B-MAN","managers":["Budman","Robert"],"rank":3,"wins":8,"losses":5,"ties":0,"points_for":1294.0,"points_against":1114.0},{"team_key":"371.l.27635.t.10","team_name":"Scott Stars","managers":["Clarke","Rich"],"rank":4,"wins":10,"losses":3,"ties":0,"points_for":1224.0,"points_against":992.0},{"team_key":"371.l.27635.t.2","team_name":"98","managers":["Jonathan"],"rank":5,"wins":6,"losses":7,"ties":0,"points_for":1236.0,"points_against":1255.0},{"team_key":"371.l.27635.t.5","team_name":"Opolos","managers":["B-waite"],"rank":6,"wins":7,"losses":6,"ties":0,"points_for":1063.0,"points_against":1084.0},{"team_key":"371.l.27635.t.3","team_name":"ALL DAY","managers":["A D"],"rank":7,"wins":6,"losses":7,"ties":0,"points_for":1120.0,"points_against":1170.0},{"team_key":"371.l.27635.t.1","team_name":"Boston Bubcons","managers":["bubcon","Big Kletus"],"rank":8,"wins":4,"losses":9,"ties":0,"points_for":1030.0,"points_against":1149.0},{"team_key":"371.l.27635.t.8","team_name":"LVC","managers":["LVC"],"rank":9,"wins":5,"losses":8,"ties":0,"points_for":1029.0,"points_against":1172.0},{"team_key":"371.l.27635.t.6","team_name":"Cleveland Breedens","managers":["Ryan"],"rank":10,"wins":6,"losses":7,"ties":0,"points_for":1066.0,"points_against":1217.0},{"team_key":"371.l.27635.t.11","team_name":"Go lay in the grass","managers":["terry"],"rank":11,"wins":5,"losses":8,"ties":0,"points_for":1123.0,"points_against":1201.0},{"team_key":"371.l.27635.t.9","team_name":"Oppogado","managers":["JG JR"],"rank":12,"wins":6,"losses":7,"ties":0,"points_for":1030.0,"points_against":1030.0}],"matchups":[{"week":1,"team1":{"team_key":"371.l.27635.t.1","team_name":"Boston Bubcons","points":77.0},"team2":{"team_key":"371.l.27635.t.2","team_name":"98","points":86.0},"winner_team_key":"371.l.27635.t.2","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"371.l.27635.t.3","team_name":"ALL DAY","points":88.0},"team2":{"team_key":"371.l.27635.t.11","team_name":"Go lay in the grass","points":91.0},"winner_team_key":"371.l.27635.t.11","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"371.l.27635.t.4","team_name":"B-MAN","points":60.0},"team2":{"team_key":"371.l.27635.t.10","team_name":"Scott Stars","points":61.0},"winner_team_key":"371.l.27635.t.10","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"371.l.27635.t.5","team_name":"Opolos","points":68.0},"team2":{"team_key":"371.l.27635.t.9","team_name":"Oppogado","points":63.0},"winner_team_key":"371.l.27635.t.5","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"371.l.27635.t.6","team_name":"Cleveland Breedens","points":93.0},"team2":{"team_key":"371.l.27635.t.8","team_name":"LVC","points":73.0},"winner_team_key":"371.l.27635.t.6","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"371.l.27635.t.7","team_name":"Johnny Fantasy","points":90.0},"team2":{"team_key":"371.l.27635.t.12","team_name":"The Greek","points":119.0},"winner_team_key":"371.l.27635.t.12","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"371.l.27635.t.1","team_name":"Boston Bubcons","points":62.0},"team2":{"team_key":"371.l.27635.t.3","team_name":"ALL DAY","points":109.0},"winner_team_key":"371.l.27635.t.3","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"371.l.27635.t.2","team_name":"98","points":86.0},"team2":{"team_key":"371.l.27635.t.12","team_name":"The Greek","points":100.0},"winner_team_key":"371.l.27635.t.12","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"371.l.27635.t.4","team_name":"B-MAN","points":99.0},"team2":{"team_key":"371.l.27635.t.11","team_name":"Go lay in the grass","points":84.0},"winner_team_key":"371.l.27635.t.4","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"371.l.27635.t.5","team_name":"Opolos","points":56.0},"team2":{"team_key":"371.l.27635.t.10","team_name":"Scott Stars","points":91.0},"winner_team_key":"371.l.27635.t.10","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"371.l.27635.t.6","team_name":"Cleveland Breedens","points":92.0},"team2":{"team_key":"371.l.27635.t.9","team_name":"Oppogado","points":91.0},"winner_team_key":"371.l.27635.t.6","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"371.l.27635.t.7","team_name":"Johnny Fantasy","points":102.0},"team2":{"team_key":"371.l.27635.t.8","team_name":"LVC","points":75.0},"winner_team_key":"371.l.27635.t.7","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"371.l.27635.t.1","team_name":"Boston Bubcons","points":80.0},"team2":{"team_key":"371.l.27635.t.4","team_name":"B-MAN","points":96.0},"winner_team_key":"371.l.27635.t.4","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"371.l.27635.t.2","team_name":"98","points":90.0},"team2":{"team_key":"371.l.27635.t.3","team_name":"ALL DAY","points":92.0},"winner_team_key":"371.l.27635.t.3","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"371.l.27635.t.5","team_name":"Opolos","points":91.0},"team2":{"team_key":"371.l.27635.t.11","team_name":"Go lay in the grass","points":63.0},"winner_team_key":"371.l.27635.t.5","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"371.l.27635.t.6","team_name":"Cleveland Breedens","points":124.0},"team2":{"team_key":"371.l.27635.t.10","team_name":"Scott Stars","points":75.0},"winner_team_key":"371.l.27635.t.6","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"371.l.27635.t.7","team_name":"Johnny Fantasy","points":63.0},"team2":{"team_key":"371.l.27635.t.9","team_name":"Oppogado","points":109.0},"winner_team_key":"371.l.27635.t.9","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"371.l.27635.t.8","team_name":"LVC","points":45.0},"team2":{"team_key":"371.l.27635.t.12","team_name":"The Greek","points":103.0},"winner_team_key":"371.l.27635.t.12","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"371.l.27635.t.1","team_name":"Boston Bubcons","points":65.0},"team2":{"team_key":"371.l.27635.t.5","team_name":"Opolos","points":77.0},"winner_team_key":"371.l.27635.t.5","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"371.l.27635.t.2","team_name":"98","points":58.0},"team2":{"team_key":"371.l.27635.t.4","team_name":"B-MAN","points":127.0},"winner_team_key":"371.l.27635.t.4","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"371.l.27635.t.3","team_name":"ALL DAY","points":114.0},"team2":{"team_key":"371.l.27635.t.12","team_name":"The Greek","points":84.0},"winner_team_key":"371.l.27635.t.3","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"371.l.27635.t.6","team_name":"Cleveland Breedens","points":79.0},"team2":{"team_key":"371.l.27635.t.11","team_name":"Go lay in the grass","points":135.0},"winner_team_key":"371.l.27635.t.11","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"371.l.27635.t.7","team_name":"Johnny Fantasy","points":58.0},"team2":{"team_key":"371.l.27635.t.10","team_name":"Scott Stars","points":98.0},"winner_team_key":"371.l.27635.t.10","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"371.l.27635.t.8","team_name":"LVC","points":63.0},"team2":{"team_key":"371.l.27635.t.9","team_name":"Oppogado","points":78.0},"winner_team_key":"371.l.27635.t.9","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"371.l.27635.t.1","team_name":"Boston Bubcons","points":66.0},"team2":{"team_key":"371.l.27635.t.6","team_name":"Cleveland Breedens","points":52.0},"winner_team_key":"371.l.27635.t.1","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"371.l.27635.t.2","team_name":"98","points":105.0},"team2":{"team_key":"371.l.27635.t.5","team_name":"Opolos","points":92.0},"winner_team_key":"371.l.27635.t.2","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"371.l.27635.t.3","team_name":"ALL DAY","points":106.0},"team2":{"team_key":"371.l.27635.t.4","team_name":"B-MAN","points":93.0},"winner_team_key":"371.l.27635.t.3","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"371.l.27635.t.7","team_name":"Johnny Fantasy","points":92.0},"team2":{"team_key":"371.l.27635.t.11","team_name":"Go lay in the grass","points":71.0},"winner_team_key":"371.l.27635.t.7","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"371.l.27635.t.8","team_name":"LVC","points":67.0},"team2":{"team_key":"371.l.27635.t.10","team_name":"Scott Stars","points":105.0},"winner_team_key":"371.l.27635.t.10","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"371.l.27635.t.9","team_name":"Oppogado","points":49.0},"team2":{"team_key":"371.l.27635.t.12","team_name":"The Greek","points":103.0},"winner_team_key":"371.l.27635.t.12","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"371.l.27635.t.1","team_name":"Boston Bubcons","points":91.0},"team2":{"team_key":"371.l.27635.t.7","team_name":"Johnny Fantasy","points":102.0},"winner_team_key":"371.l.27635.t.7","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"371.l.27635.t.2","team_name":"98","points":128.0},"team2":{"team_key":"371.l.27635.t.6","team_name":"Cleveland Breedens","points":50.0},"winner_team_key":"371.l.27635.t.2","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"371.l.27635.t.3","team_name":"ALL DAY","points":65.0},"team2":{"team_key":"371.l.27635.t.5","team_name":"Opolos","points":115.0},"winner_team_key":"371.l.27635.t.5","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"371.l.27635.t.4","team_name":"B-MAN","points":96.0},"team2":{"team_key":"371.l.27635.t.12","team_name":"The Greek","points":94.0},"winner_team_key":"371.l.27635.t.4","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"371.l.27635.t.8","team_name":"LVC","points":97.0},"team2":{"team_key":"371.l.27635.t.11","team_name":"Go lay in the grass","points":79.0},"winner_team_key":"371.l.27635.t.8","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"371.l.27635.t.9","team_name":"Oppogado","points":50.0},"team2":{"team_key":"371.l.27635.t.10","team_name":"Scott Stars","points":82.0},"winner_team_key":"371.l.27635.t.10","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"371.l.27635.t.1","team_name":"Boston Bubcons","points":61.0},"team2":{"team_key":"371.l.27635.t.8","team_name":"LVC","points":66.0},"winner_team_key":"371.l.27635.t.8","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"371.l.27635.t.2","team_name":"98","points":98.0},"team2":{"team_key":"371.l.27635.t.7","team_name":"Johnny Fantasy","points":112.0},"winner_team_key":"371.l.27635.t.7","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"371.l.27635.t.3","team_name":"ALL DAY","points":94.0},"team2":{"team_key":"371.l.27635.t.6","team_name":"Cleveland Breedens","points":70.0},"winner_team_key":"371.l.27635.t.3","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"371.l.27635.t.4","team_name":"B-MAN","points":124.0},"team2":{"team_key":"371.l.27635.t.5","team_name":"Opolos","points":102.0},"winner_team_key":"371.l.27635.t.4","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"371.l.27635.t.9","team_name":"Oppogado","points":81.0},"team2":{"team_key":"371.l.27635.t.11","team_name":"Go lay in the grass","points":52.0},"winner_team_key":"371.l.27635.t.9","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"371.l.27635.t.10","team_name":"Scott Stars","points":92.0},"team2":{"team_key":"371.l.27635.t.12","team_name":"The Greek","points":78.0},"winner_team_key":"371.l.27635.t.10","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"371.l.27635.t.1","team_name":"Boston Bubcons","points":64.0},"team2":{"team_key":"371.l.27635.t.9","team_name":"Oppogado","points":60.0},"winner_team_key":"371.l.27635.t.1","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"371.l.27635.t.2","team_name":"98","points":102.0},"team2":{"team_key":"371.l.27635.t.8","team_name":"LVC","points":122.0},"winner_team_key":"371.l.27635.t.8","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"371.l.27635.t.3","team_name":"ALL DAY","points":64.0},"team2":{"team_key":"371.l.27635.t.7","team_name":"Johnny Fantasy","points":113.0},"winner_team_key":"371.l.27635.t.7","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"371.l.27635.t.4","team_name":"B-MAN","points":151.0},"team2":{"team_key":"371.l.27635.t.6","team_name":"Cleveland Breedens","points":87.0},"winner_team_key":"371.l.27635.t.4","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"371.l.27635.t.5","team_name":"Opolos","points":63.0},"team2":{"team_key":"371.l.27635.t.12","team_name":"The Greek","points":79.0},"winner_team_key":"371.l.27635.t.12","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"371.l.27635.t.10","team_name":"Scott Stars","points":103.0},"team2":{"team_key":"371.l.27635.t.11","team_name":"Go lay in the grass","points":69.0},"winner_team_key":"371.l.27635.t.10","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"371.l.27635.t.1","team_name":"Boston Bubcons","points":105.0},"team2":{"team_key":"371.l.27635.t.10","team_name":"Scott Stars","points":96.0},"winner_team_key":"371.l.27635.t.1","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"371.l.27635.t.2","team_name":"98","points":85.0},"team2":{"team_key":"371.l.27635.t.9","team_name":"Oppogado","points":104.0},"winner_team_key":"371.l.27635.t.9","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"371.l.27635.t.3","team_name":"ALL DAY","points":92.0},"team2":{"team_key":"371.l.27635.t.8","team_name":"LVC","points":70.0},"winner_team_key":"371.l.27635.t.3","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"371.l.27635.t.4","team_name":"B-MAN","points":82.0},"team2":{"team_key":"371.l.27635.t.7","team_name":"Johnny Fantasy","points":57.0},"winner_team_key":"371.l.27635.t.4","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"371.l.27635.t.5","team_name":"Opolos","points":50.0},"team2":{"team_key":"371.l.27635.t.6","team_name":"Cleveland Breedens","points":85.0},"winner_team_key":"371.l.27635.t.6","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"371.l.27635.t.11","team_name":"Go lay in the grass","points":80.0},"team2":{"team_key":"371.l.27635.t.12","team_name":"The Greek","points":95.0},"winner_team_key":"371.l.27635.t.12","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"371.l.27635.t.1","team_name":"Boston Bubcons","points":100.0},"team2":{"team_key":"371.l.27635.t.11","team_name":"Go lay in the grass","points":106.0},"winner_team_key":"371.l.27635.t.11","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"371.l.27635.t.2","team_name":"98","points":126.0},"team2":{"team_key":"371.l.27635.t.10","team_name":"Scott Stars","points":113.0},"winner_team_key":"371.l.27635.t.2","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"371.l.27635.t.3","team_name":"ALL DAY","points":80.0},"team2":{"team_key":"371.l.27635.t.9","team_name":"Oppogado","points":94.0},"winner_team_key":"371.l.27635.t.9","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"371.l.27635.t.4","team_name":"B-MAN","points":69.0},"team2":{"team_key":"371.l.27635.t.8","team_name":"LVC","points":70.0},"winner_team_key":"371.l.27635.t.8","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"371.l.27635.t.5","team_name":"Opolos","points":101.0},"team2":{"team_key":"371.l.27635.t.7","team_name":"Johnny Fantasy","points":70.0},"winner_team_key":"371.l.27635.t.5","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"371.l.27635.t.6","team_name":"Cleveland Breedens","points":82.0},"team2":{"team_key":"371.l.27635.t.12","team_name":"The Greek","points":78.0},"winner_team_key":"371.l.27635.t.6","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"371.l.27635.t.1","team_name":"Boston Bubcons","points":85.0},"team2":{"team_key":"371.l.27635.t.12","team_name":"The Greek","points":130.0},"winner_team_key":"371.l.27635.t.12","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"371.l.27635.t.2","team_name":"98","points":84.0},"team2":{"team_key":"371.l.27635.t.11","team_name":"Go lay in the grass","points":90.0},"winner_team_key":"371.l.27635.t.11","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"371.l.27635.t.3","team_name":"ALL DAY","points":75.0},"team2":{"team_key":"371.l.27635.t.10","team_name":"Scott Stars","points":91.0},"winner_team_key":"371.l.27635.t.10","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"371.l.27635.t.4","team_name":"B-MAN","points":91.0},"team2":{"team_key":"371.l.27635.t.9","team_name":"Oppogado","points":98.0},"winner_team_key":"371.l.27635.t.9","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"371.l.27635.t.5","team_name":"Opolos","points":107.0},"team2":{"team_key":"371.l.27635.t.8","team_name":"LVC","points":94.0},"winner_team_key":"371.l.27635.t.5","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"371.l.27635.t.6","team_name":"Cleveland Breedens","points":80.0},"team2":{"team_key":"371.l.27635.t.7","team_name":"Johnny Fantasy","points":97.0},"winner_team_key":"371.l.27635.t.7","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"371.l.27635.t.1","team_name":"Boston Bubcons","points":83.0},"team2":{"team_key":"371.l.27635.t.2","team_name":"98","points":87.0},"winner_team_key":"371.l.27635.t.2","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"371.l.27635.t.3","team_name":"ALL DAY","points":59.0},"team2":{"team_key":"371.l.27635.t.11","team_name":"Go lay in the grass","points":106.0},"winner_team_key":"371.l.27635.t.11","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"371.l.27635.t.4","team_name":"B-MAN","points":73.0},"team2":{"team_key":"371.l.27635.t.10","team_name":"Scott Stars","points":120.0},"winner_team_key":"371.l.27635.t.10","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"371.l.27635.t.5","team_name":"Opolos","points":90.0},"team2":{"team_key":"371.l.27635.t.9","team_name":"Oppogado","points":83.0},"winner_team_key":"371.l.27635.t.5","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"371.l.27635.t.6","team_name":"Cleveland Breedens","points":75.0},"team2":{"team_key":"371.l.27635.t.8","team_name":"LVC","points":109.0},"winner_team_key":"371.l.27635.t.8","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"371.l.27635.t.7","team_name":"Johnny Fantasy","points":89.0},"team2":{"team_key":"371.l.27635.t.12","team_name":"The Greek","points":120.0},"winner_team_key":"371.l.27635.t.12","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"371.l.27635.t.1","team_name":"Boston Bubcons","points":91.0},"team2":{"team_key":"371.l.27635.t.3","team_name":"ALL DAY","points":82.0},"winner_team_key":"371.l.27635.t.1","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"371.l.27635.t.2","team_name":"98","points":101.0},"team2":{"team_key":"371.l.27635.t.12","team_name":"The Greek","points":93.0},"winner_team_key":"371.l.27635.t.2","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"371.l.27635.t.4","team_name":"B-MAN","points":133.0},"team2":{"team_key":"371.l.27635.t.11","team_name":"Go lay in the grass","points":97.0},"winner_team_key":"371.l.27635.t.4","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"371.l.27635.t.5","team_name":"Opolos","points":51.0},"team2":{"team_key":"371.l.27635.t.10","team_name":"Scott Stars","points":97.0},"winner_team_key":"371.l.27635.t.10","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"371.l.27635.t.6","team_name":"Cleveland Breedens","points":97.0},"team2":{"team_key":"371.l.27635.t.9","team_name":"Oppogado","points":70.0},"winner_team_key":"371.l.27635.t.6","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"371.l.27635.t.7","team_name":"Johnny Fantasy","points":106.0},"team2":{"team_key":"371.l.27635.t.8","team_name":"LVC","points":78.0},"winner_team_key":"371.l.27635.t.7","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"371.l.27635.t.1","team_name":"Boston Bubcons","points":75.0},"team2":{"team_key":"371.l.27635.t.9","team_name":"Oppogado","points":49.0},"winner_team_key":"371.l.27635.t.1","is_playoffs":true,"is_championship":false},{"week":14,"team1":{"team_key":"371.l.27635.t.2","team_name":"98","points":85.0},"team2":{"team_key":"371.l.27635.t.12","team_name":"The Greek","points":130.0},"winner_team_key":"371.l.27635.t.12","is_playoffs":true,"is_championship":false},{"week":14,"team1":{"team_key":"371.l.27635.t.5","team_name":"Opolos","points":72.0},"team2":{"team_key":"371.l.27635.t.7","team_name":"Johnny Fantasy","points":83.0},"winner_team_key":"371.l.27635.t.7","is_playoffs":true,"is_championship":false},{"week":14,"team1":{"team_key":"371.l.27635.t.8","team_name":"LVC","points":98.0},"team2":{"team_key":"371.l.27635.t.11","team_name":"Go lay in the grass","points":64.0},"winner_team_key":"371.l.27635.t.8","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"371.l.27635.t.1","team_name":"Boston Bubcons","points":87.0},"team2":{"team_key":"371.l.27635.t.6","team_name":"Cleveland Breedens","points":56.0},"winner_team_key":"371.l.27635.t.1","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"371.l.27635.t.2","team_name":"98","points":116.0},"team2":{"team_key":"371.l.27635.t.5","team_name":"Opolos","points":61.0},"winner_team_key":"371.l.27635.t.2","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"371.l.27635.t.3","team_name":"ALL DAY","points":101.0},"team2":{"team_key":"371.l.27635.t.8","team_name":"LVC","points":78.0},"winner_team_key":"371.l.27635.t.3","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"371.l.27635.t.4","team_name":"B-MAN","points":87.0},"team2":{"team_key":"371.l.27635.t.12","team_name":"The Greek","points":108.0},"winner_team_key":"371.l.27635.t.12","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"371.l.27635.t.7","team_name":"Johnny Fantasy","points":92.0},"team2":{"team_key":"371.l.27635.t.10","team_name":"Scott Stars","points":72.0},"winner_team_key":"371.l.27635.t.7","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"371.l.27635.t.9","team_name":"Oppogado","points":56.0},"team2":{"team_key":"371.l.27635.t.11","team_name":"Go lay in the grass","points":106.0},"winner_team_key":"371.l.27635.t.11","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"371.l.27635.t.1","team_name":"Boston Bubcons","points":67.0},"team2":{"team_key":"371.l.27635.t.3","team_name":"ALL DAY","points":79.0},"winner_team_key":"371.l.27635.t.3","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"371.l.27635.t.4","team_name":"B-MAN","points":87.0},"team2":{"team_key":"371.l.27635.t.10","team_name":"Scott Stars","points":76.0},"winner_team_key":"371.l.27635.t.4","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"371.l.27635.t.6","team_name":"Cleveland Breedens","points":57.0},"team2":{"team_key":"371.l.27635.t.8","team_name":"LVC","points":84.0},"winner_team_key":"371.l.27635.t.8","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"371.l.27635.t.7","team_name":"Johnny Fantasy","points":63.0},"team2":{"team_key":"371.l.27635.t.12","team_name":"The Greek","points":74.0},"winner_team_key":"371.l.27635.t.12","is_playoffs":true,"is_championship":true}],"season_high_score":{"points":151.0,"team":"B-MAN","week":8},"season_low_score":{"points":45.0,"team":"LVC","week":3}},{"season":2018,"league_key":"380.l.240531","league_name":"BKGFFL","num_teams":12,"playoff_start_week":14,"champion":{"team_key":"380.l.240531.t.8","team_name":"LVC","points":149.0},"runner_up":{"team_key":"380.l.240531.t.12","team_name":"The Greek","points":147.5},"champ_score":149.0,"runner_score":147.5,"standings":[{"team_key":"380.l.240531.t.8","team_name":"LVC","managers":["LVC"],"rank":1,"wins":9,"losses":4,"ties":0,"points_for":1507.0,"points_against":1391.5},{"team_key":"380.l.240531.t.12","team_name":"The Greek","managers":["mark","David"],"rank":2,"wins":7,"losses":6,"ties":0,"points_for":1551.5,"points_against":1536.0},{"team_key":"380.l.240531.t.7","team_name":"Johnny Fantasy","managers":["Johnny Fantasy"],"rank":3,"wins":8,"losses":5,"ties":0,"points_for":1510.0,"points_against":1308.5},{"team_key":"380.l.240531.t.2","team_name":"98","managers":["Jonathan"],"rank":4,"wins":9,"losses":4,"ties":0,"points_for":1535.0,"points_against":1394.0},{"team_key":"380.l.240531.t.10","team_name":"Joco","managers":["JG JR"],"rank":5,"wins":7,"losses":6,"ties":0,"points_for":1390.0,"points_against":1466.5},{"team_key":"380.l.240531.t.11","team_name":"Scott Stars","managers":["Clarke","Rich"],"rank":6,"wins":7,"losses":6,"ties":0,"points_for":1500.5,"points_against":1424.5},{"team_key":"380.l.240531.t.1","team_name":"Zionsville Bubcons","managers":["bubcon","Big Kletus"],"rank":7,"wins":5,"losses":8,"ties":0,"points_for":1516.0,"points_against":1512.5},{"team_key":"380.l.240531.t.5","team_name":"Cleveland Breedens","managers":["Ryan"],"rank":8,"wins":7,"losses":6,"ties":0,"points_for":1365.0,"points_against":1389.0},{"team_key":"380.l.240531.t.4","team_name":"B-MAN","managers":["Budman","Robert"],"rank":9,"wins":5,"losses":8,"ties":0,"points_for":1461.5,"points_against":1601.0},{"team_key":"380.l.240531.t.3","team_name":"ALL DAY","managers":["A D"],"rank":10,"wins":5,"losses":8,"ties":0,"points_for":1286.0,"points_against":1374.0},{"team_key":"380.l.240531.t.9","team_name":"Opolos","managers":["B-waite"],"rank":11,"wins":4,"losses":9,"ties":0,"points_for":1374.5,"points_against":1553.0},{"team_key":"380.l.240531.t.6","team_name":"New Castle Sharks","managers":["terry"],"rank":12,"wins":5,"losses":8,"ties":0,"points_for":1421.0,"points_against":1467.5}],"matchups":[{"week":1,"team1":{"team_key":"380.l.240531.t.1","team_name":"Zionsville Bubcons","points":125.0},"team2":{"team_key":"380.l.240531.t.2","team_name":"98","points":146.0},"winner_team_key":"380.l.240531.t.2","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"380.l.240531.t.3","team_name":"ALL DAY","points":113.5},"team2":{"team_key":"380.l.240531.t.11","team_name":"Scott Stars","points":106.5},"winner_team_key":"380.l.240531.t.3","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"380.l.240531.t.4","team_name":"B-MAN","points":109.0},"team2":{"team_key":"380.l.240531.t.10","team_name":"Joco","points":83.0},"winner_team_key":"380.l.240531.t.4","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"380.l.240531.t.5","team_name":"Cleveland Breedens","points":90.5},"team2":{"team_key":"380.l.240531.t.9","team_name":"Opolos","points":105.0},"winner_team_key":"380.l.240531.t.9","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"380.l.240531.t.6","team_name":"New Castle Sharks","points":90.0},"team2":{"team_key":"380.l.240531.t.8","team_name":"LVC","points":106.0},"winner_team_key":"380.l.240531.t.8","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"380.l.240531.t.7","team_name":"Johnny Fantasy","points":105.5},"team2":{"team_key":"380.l.240531.t.12","team_name":"The Greek","points":140.0},"winner_team_key":"380.l.240531.t.12","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"380.l.240531.t.1","team_name":"Zionsville Bubcons","points":105.0},"team2":{"team_key":"380.l.240531.t.3","team_name":"ALL DAY","points":126.5},"winner_team_key":"380.l.240531.t.3","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"380.l.240531.t.2","team_name":"98","points":106.5},"team2":{"team_key":"380.l.240531.t.12","team_name":"The Greek","points":126.0},"winner_team_key":"380.l.240531.t.12","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"380.l.240531.t.4","team_name":"B-MAN","points":112.5},"team2":{"team_key":"380.l.240531.t.11","team_name":"Scott Stars","points":146.5},"winner_team_key":"380.l.240531.t.11","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"380.l.240531.t.5","team_name":"Cleveland Breedens","points":100.0},"team2":{"team_key":"380.l.240531.t.10","team_name":"Joco","points":104.5},"winner_team_key":"380.l.240531.t.10","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"380.l.240531.t.6","team_name":"New Castle Sharks","points":112.5},"team2":{"team_key":"380.l.240531.t.9","team_name":"Opolos","points":137.0},"winner_team_key":"380.l.240531.t.9","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"380.l.240531.t.7","team_name":"Johnny Fantasy","points":94.5},"team2":{"team_key":"380.l.240531.t.8","team_name":"LVC","points":96.5},"winner_team_key":"380.l.240531.t.8","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"380.l.240531.t.1","team_name":"Zionsville Bubcons","points":147.5},"team2":{"team_key":"380.l.240531.t.4","team_name":"B-MAN","points":106.0},"winner_team_key":"380.l.240531.t.1","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"380.l.240531.t.2","team_name":"98","points":119.5},"team2":{"team_key":"380.l.240531.t.3","team_name":"ALL DAY","points":89.5},"winner_team_key":"380.l.240531.t.2","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"380.l.240531.t.5","team_name":"Cleveland Breedens","points":100.0},"team2":{"team_key":"380.l.240531.t.11","team_name":"Scott Stars","points":99.0},"winner_team_key":"380.l.240531.t.5","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"380.l.240531.t.6","team_name":"New Castle Sharks","points":125.0},"team2":{"team_key":"380.l.240531.t.10","team_name":"Joco","points":121.0},"winner_team_key":"380.l.240531.t.6","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"380.l.240531.t.7","team_name":"Johnny Fantasy","points":127.0},"team2":{"team_key":"380.l.240531.t.9","team_name":"Opolos","points":86.0},"winner_team_key":"380.l.240531.t.7","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"380.l.240531.t.8","team_name":"LVC","points":128.5},"team2":{"team_key":"380.l.240531.t.12","team_name":"The Greek","points":123.0},"winner_team_key":"380.l.240531.t.8","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"380.l.240531.t.1","team_name":"Zionsville Bubcons","points":122.5},"team2":{"team_key":"380.l.240531.t.5","team_name":"Cleveland Breedens","points":143.5},"winner_team_key":"380.l.240531.t.5","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"380.l.240531.t.2","team_name":"98","points":144.5},"team2":{"team_key":"380.l.240531.t.4","team_name":"B-MAN","points":98.5},"winner_team_key":"380.l.240531.t.2","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"380.l.240531.t.3","team_name":"ALL DAY","points":117.5},"team2":{"team_key":"380.l.240531.t.12","team_name":"The Greek","points":77.0},"winner_team_key":"380.l.240531.t.3","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"380.l.240531.t.6","team_name":"New Castle Sharks","points":96.0},"team2":{"team_key":"380.l.240531.t.11","team_name":"Scott Stars","points":108.0},"winner_team_key":"380.l.240531.t.11","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"380.l.240531.t.7","team_name":"Johnny Fantasy","points":147.0},"team2":{"team_key":"380.l.240531.t.10","team_name":"Joco","points":98.0},"winner_team_key":"380.l.240531.t.7","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"380.l.240531.t.8","team_name":"LVC","points":143.0},"team2":{"team_key":"380.l.240531.t.9","team_name":"Opolos","points":107.0},"winner_team_key":"380.l.240531.t.8","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"380.l.240531.t.1","team_name":"Zionsville Bubcons","points":102.5},"team2":{"team_key":"380.l.240531.t.6","team_name":"New Castle Sharks","points":116.5},"winner_team_key":"380.l.240531.t.6","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"380.l.240531.t.2","team_name":"98","points":130.5},"team2":{"team_key":"380.l.240531.t.5","team_name":"Cleveland Breedens","points":88.0},"winner_team_key":"380.l.240531.t.2","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"380.l.240531.t.3","team_name":"ALL DAY","points":99.5},"team2":{"team_key":"380.l.240531.t.4","team_name":"B-MAN","points":105.5},"winner_team_key":"380.l.240531.t.4","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"380.l.240531.t.7","team_name":"Johnny Fantasy","points":147.0},"team2":{"team_key":"380.l.240531.t.11","team_name":"Scott Stars","points":99.5},"winner_team_key":"380.l.240531.t.7","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"380.l.240531.t.8","team_name":"LVC","points":77.0},"team2":{"team_key":"380.l.240531.t.10","team_name":"Joco","points":87.5},"winner_team_key":"380.l.240531.t.10","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"380.l.240531.t.9","team_name":"Opolos","points":107.0},"team2":{"team_key":"380.l.240531.t.12","team_name":"The Greek","points":128.5},"winner_team_key":"380.l.240531.t.12","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"380.l.240531.t.1","team_name":"Zionsville Bubcons","points":104.0},"team2":{"team_key":"380.l.240531.t.7","team_name":"Johnny Fantasy","points":150.5},"winner_team_key":"380.l.240531.t.7","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"380.l.240531.t.2","team_name":"98","points":112.5},"team2":{"team_key":"380.l.240531.t.6","team_name":"New Castle Sharks","points":74.0},"winner_team_key":"380.l.240531.t.2","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"380.l.240531.t.3","team_name":"ALL DAY","points":109.5},"team2":{"team_key":"380.l.240531.t.5","team_name":"Cleveland Breedens","points":117.5},"winner_team_key":"380.l.240531.t.5","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"380.l.240531.t.4","team_name":"B-MAN","points":89.5},"team2":{"team_key":"380.l.240531.t.12","team_name":"The Greek","points":147.5},"winner_team_key":"380.l.240531.t.12","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"380.l.240531.t.8","team_name":"LVC","points":103.0},"team2":{"team_key":"380.l.240531.t.11","team_name":"Scott Stars","points":126.0},"winner_team_key":"380.l.240531.t.11","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"380.l.240531.t.9","team_name":"Opolos","points":124.5},"team2":{"team_key":"380.l.240531.t.10","team_name":"Joco","points":103.0},"winner_team_key":"380.l.240531.t.9","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"380.l.240531.t.1","team_name":"Zionsville Bubcons","points":126.5},"team2":{"team_key":"380.l.240531.t.8","team_name":"LVC","points":127.5},"winner_team_key":"380.l.240531.t.8","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"380.l.240531.t.2","team_name":"98","points":114.0},"team2":{"team_key":"380.l.240531.t.7","team_name":"Johnny Fantasy","points":98.0},"winner_team_key":"380.l.240531.t.2","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"380.l.240531.t.3","team_name":"ALL DAY","points":124.0},"team2":{"team_key":"380.l.240531.t.6","team_name":"New Castle Sharks","points":118.5},"winner_team_key":"380.l.240531.t.3","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"380.l.240531.t.4","team_name":"B-MAN","points":116.5},"team2":{"team_key":"380.l.240531.t.5","team_name":"Cleveland Breedens","points":120.5},"winner_team_key":"380.l.240531.t.5","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"380.l.240531.t.9","team_name":"Opolos","points":91.5},"team2":{"team_key":"380.l.240531.t.11","team_name":"Scott Stars","points":108.5},"winner_team_key":"380.l.240531.t.11","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"380.l.240531.t.10","team_name":"Joco","points":112.0},"team2":{"team_key":"380.l.240531.t.12","team_name":"The Greek","points":92.0},"winner_team_key":"380.l.240531.t.10","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"380.l.240531.t.1","team_name":"Zionsville Bubcons","points":139.5},"team2":{"team_key":"380.l.240531.t.9","team_name":"Opolos","points":94.5},"winner_team_key":"380.l.240531.t.1","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"380.l.240531.t.2","team_name":"98","points":97.0},"team2":{"team_key":"380.l.240531.t.8","team_name":"LVC","points":121.5},"winner_team_key":"380.l.240531.t.8","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"380.l.240531.t.3","team_name":"ALL DAY","points":108.0},"team2":{"team_key":"380.l.240531.t.7","team_name":"Johnny Fantasy","points":87.5},"winner_team_key":"380.l.240531.t.3","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"380.l.240531.t.4","team_name":"B-MAN","points":81.5},"team2":{"team_key":"380.l.240531.t.6","team_name":"New Castle Sharks","points":124.0},"winner_team_key":"380.l.240531.t.6","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"380.l.240531.t.5","team_name":"Cleveland Breedens","points":112.5},"team2":{"team_key":"380.l.240531.t.12","team_name":"The Greek","points":125.0},"winner_team_key":"380.l.240531.t.12","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"380.l.240531.t.10","team_name":"Joco","points":97.0},"team2":{"team_key":"380.l.240531.t.11","team_name":"Scott Stars","points":168.0},"winner_team_key":"380.l.240531.t.11","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"380.l.240531.t.1","team_name":"Zionsville Bubcons","points":115.5},"team2":{"team_key":"380.l.240531.t.10","team_name":"Joco","points":146.5},"winner_team_key":"380.l.240531.t.10","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"380.l.240531.t.2","team_name":"98","points":121.5},"team2":{"team_key":"380.l.240531.t.9","team_name":"Opolos","points":112.5},"winner_team_key":"380.l.240531.t.2","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"380.l.240531.t.3","team_name":"ALL DAY","points":101.0},"team2":{"team_key":"380.l.240531.t.8","team_name":"LVC","points":136.5},"winner_team_key":"380.l.240531.t.8","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"380.l.240531.t.4","team_name":"B-MAN","points":80.5},"team2":{"team_key":"380.l.240531.t.7","team_name":"Johnny Fantasy","points":105.0},"winner_team_key":"380.l.240531.t.7","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"380.l.240531.t.5","team_name":"Cleveland Breedens","points":82.0},"team2":{"team_key":"380.l.240531.t.6","team_name":"New Castle Sharks","points":62.5},"winner_team_key":"380.l.240531.t.5","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"380.l.240531.t.11","team_name":"Scott Stars","points":97.5},"team2":{"team_key":"380.l.240531.t.12","team_name":"The Greek","points":116.5},"winner_team_key":"380.l.240531.t.12","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"380.l.240531.t.1","team_name":"Zionsville Bubcons","points":121.5},"team2":{"team_key":"380.l.240531.t.11","team_name":"Scott Stars","points":84.0},"winner_team_key":"380.l.240531.t.1","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"380.l.240531.t.2","team_name":"98","points":98.5},"team2":{"team_key":"380.l.240531.t.10","team_name":"Joco","points":135.5},"winner_team_key":"380.l.240531.t.10","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"380.l.240531.t.3","team_name":"ALL DAY","points":52.0},"team2":{"team_key":"380.l.240531.t.9","team_name":"Opolos","points":122.5},"winner_team_key":"380.l.240531.t.9","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"380.l.240531.t.4","team_name":"B-MAN","points":119.0},"team2":{"team_key":"380.l.240531.t.8","team_name":"LVC","points":109.5},"winner_team_key":"380.l.240531.t.4","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"380.l.240531.t.5","team_name":"Cleveland Breedens","points":100.5},"team2":{"team_key":"380.l.240531.t.7","team_name":"Johnny Fantasy","points":104.5},"winner_team_key":"380.l.240531.t.7","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"380.l.240531.t.6","team_name":"New Castle Sharks","points":172.0},"team2":{"team_key":"380.l.240531.t.12","team_name":"The Greek","points":184.5},"winner_team_key":"380.l.240531.t.12","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"380.l.240531.t.1","team_name":"Zionsville Bubcons","points":125.5},"team2":{"team_key":"380.l.240531.t.12","team_name":"The Greek","points":94.0},"winner_team_key":"380.l.240531.t.1","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"380.l.240531.t.2","team_name":"98","points":110.5},"team2":{"team_key":"380.l.240531.t.11","team_name":"Scott Stars","points":117.0},"winner_team_key":"380.l.240531.t.11","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"380.l.240531.t.3","team_name":"ALL DAY","points":90.5},"team2":{"team_key":"380.l.240531.t.10","team_name":"Joco","points":92.0},"winner_team_key":"380.l.240531.t.10","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"380.l.240531.t.4","team_name":"B-MAN","points":183.5},"team2":{"team_key":"380.l.240531.t.9","team_name":"Opolos","points":113.0},"winner_team_key":"380.l.240531.t.4","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"380.l.240531.t.5","team_name":"Cleveland Breedens","points":95.0},"team2":{"team_key":"380.l.240531.t.8","team_name":"LVC","points":129.5},"winner_team_key":"380.l.240531.t.8","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"380.l.240531.t.6","team_name":"New Castle Sharks","points":82.0},"team2":{"team_key":"380.l.240531.t.7","team_name":"Johnny Fantasy","points":112.0},"winner_team_key":"380.l.240531.t.7","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"380.l.240531.t.1","team_name":"Zionsville Bubcons","points":107.0},"team2":{"team_key":"380.l.240531.t.2","team_name":"98","points":107.5},"winner_team_key":"380.l.240531.t.2","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"380.l.240531.t.3","team_name":"ALL DAY","points":85.0},"team2":{"team_key":"380.l.240531.t.11","team_name":"Scott Stars","points":112.0},"winner_team_key":"380.l.240531.t.11","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"380.l.240531.t.4","team_name":"B-MAN","points":129.0},"team2":{"team_key":"380.l.240531.t.10","team_name":"Joco","points":132.5},"winner_team_key":"380.l.240531.t.10","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"380.l.240531.t.5","team_name":"Cleveland Breedens","points":124.5},"team2":{"team_key":"380.l.240531.t.9","team_name":"Opolos","points":102.5},"winner_team_key":"380.l.240531.t.5","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"380.l.240531.t.6","team_name":"New Castle Sharks","points":129.0},"team2":{"team_key":"380.l.240531.t.8","team_name":"LVC","points":125.0},"winner_team_key":"380.l.240531.t.6","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"380.l.240531.t.7","team_name":"Johnny Fantasy","points":135.5},"team2":{"team_key":"380.l.240531.t.12","team_name":"The Greek","points":96.0},"winner_team_key":"380.l.240531.t.7","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"380.l.240531.t.1","team_name":"Zionsville Bubcons","points":74.0},"team2":{"team_key":"380.l.240531.t.3","team_name":"ALL DAY","points":69.5},"winner_team_key":"380.l.240531.t.1","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"380.l.240531.t.2","team_name":"98","points":126.5},"team2":{"team_key":"380.l.240531.t.12","team_name":"The Greek","points":101.5},"winner_team_key":"380.l.240531.t.2","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"380.l.240531.t.4","team_name":"B-MAN","points":130.5},"team2":{"team_key":"380.l.240531.t.11","team_name":"Scott Stars","points":128.0},"winner_team_key":"380.l.240531.t.4","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"380.l.240531.t.5","team_name":"Cleveland Breedens","points":90.5},"team2":{"team_key":"380.l.240531.t.10","team_name":"Joco","points":77.5},"winner_team_key":"380.l.240531.t.5","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"380.l.240531.t.6","team_name":"New Castle Sharks","points":119.0},"team2":{"team_key":"380.l.240531.t.9","team_name":"Opolos","points":71.5},"winner_team_key":"380.l.240531.t.6","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"380.l.240531.t.7","team_name":"Johnny Fantasy","points":96.0},"team2":{"team_key":"380.l.240531.t.8","team_name":"LVC","points":103.5},"winner_team_key":"380.l.240531.t.8","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"380.l.240531.t.3","team_name":"ALL DAY","points":89.0},"team2":{"team_key":"380.l.240531.t.6","team_name":"New Castle Sharks","points":74.0},"winner_team_key":"380.l.240531.t.3","is_playoffs":true,"is_championship":false},{"week":14,"team1":{"team_key":"380.l.240531.t.4","team_name":"B-MAN","points":130.0},"team2":{"team_key":"380.l.240531.t.9","team_name":"Opolos","points":63.0},"winner_team_key":"380.l.240531.t.4","is_playoffs":true,"is_championship":false},{"week":14,"team1":{"team_key":"380.l.240531.t.7","team_name":"Johnny Fantasy","points":109.5},"team2":{"team_key":"380.l.240531.t.10","team_name":"Joco","points":101.0},"winner_team_key":"380.l.240531.t.7","is_playoffs":true,"is_championship":false},{"week":14,"team1":{"team_key":"380.l.240531.t.11","team_name":"Scott Stars","points":74.0},"team2":{"team_key":"380.l.240531.t.12","team_name":"The Greek","points":106.5},"winner_team_key":"380.l.240531.t.12","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"380.l.240531.t.1","team_name":"Zionsville Bubcons","points":97.0},"team2":{"team_key":"380.l.240531.t.4","team_name":"B-MAN","points":91.5},"winner_team_key":"380.l.240531.t.1","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"380.l.240531.t.2","team_name":"98","points":115.5},"team2":{"team_key":"380.l.240531.t.12","team_name":"The Greek","points":127.0},"winner_team_key":"380.l.240531.t.12","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"380.l.240531.t.3","team_name":"ALL DAY","points":44.5},"team2":{"team_key":"380.l.240531.t.5","team_name":"Cleveland Breedens","points":89.0},"winner_team_key":"380.l.240531.t.5","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"380.l.240531.t.6","team_name":"New Castle Sharks","points":63.5},"team2":{"team_key":"380.l.240531.t.9","team_name":"Opolos","points":67.5},"winner_team_key":"380.l.240531.t.9","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"380.l.240531.t.7","team_name":"Johnny Fantasy","points":55.5},"team2":{"team_key":"380.l.240531.t.8","team_name":"LVC","points":140.5},"winner_team_key":"380.l.240531.t.8","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"380.l.240531.t.10","team_name":"Joco","points":110.5},"team2":{"team_key":"380.l.240531.t.11","team_name":"Scott Stars","points":87.5},"winner_team_key":"380.l.240531.t.10","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"380.l.240531.t.1","team_name":"Zionsville Bubcons","points":128.0},"team2":{"team_key":"380.l.240531.t.5","team_name":"Cleveland Breedens","points":66.5},"winner_team_key":"380.l.240531.t.1","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"380.l.240531.t.2","team_name":"98","points":93.0},"team2":{"team_key":"380.l.240531.t.7","team_name":"Johnny Fantasy","points":130.0},"winner_team_key":"380.l.240531.t.7","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"380.l.240531.t.3","team_name":"ALL DAY","points":51.0},"team2":{"team_key":"380.l.240531.t.4","team_name":"B-MAN","points":122.5},"winner_team_key":"380.l.240531.t.4","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"380.l.240531.t.8","team_name":"LVC","points":149.0},"team2":{"team_key":"380.l.240531.t.12","team_name":"The Greek","points":147.5},"winner_team_key":"380.l.240531.t.8","is_playoffs":true,"is_championship":true}],"season_high_score":{"points":184.5,"team":"The Greek","week":10},"season_low_score":{"points":44.5,"team":"ALL DAY","week":15}},{"season":2019,"league_key":"390.l.236819","league_name":"BKGFFL","num_teams":12,"playoff_start_week":14,"champion":{"team_key":"390.l.236819.t.6","team_name":"Joco","points":92.5},"runner_up":{"team_key":"390.l.236819.t.7","team_name":"Johnny Fantasy","points":86.0},"champ_score":92.5,"runner_score":86.0,"standings":[{"team_key":"390.l.236819.t.6","team_name":"Joco","managers":["JG JR"],"rank":1,"wins":8,"losses":5,"ties":0,"points_for":1532.0,"points_against":1276.5},{"team_key":"390.l.236819.t.7","team_name":"Johnny Fantasy","managers":["Johnny Fantasy"],"rank":2,"wins":7,"losses":6,"ties":0,"points_for":1413.5,"points_against":1410.5},{"team_key":"390.l.236819.t.4","team_name":"B-MAN","managers":["Budman","Robert"],"rank":3,"wins":10,"losses":3,"ties":0,"points_for":1553.5,"points_against":1273.5},{"team_key":"390.l.236819.t.12","team_name":"The Greek","managers":["mark","David"],"rank":4,"wins":7,"losses":6,"ties":0,"points_for":1396.5,"points_against":1394.0},{"team_key":"390.l.236819.t.2","team_name":"98","managers":["Jonathan"],"rank":5,"wins":8,"losses":5,"ties":0,"points_for":1406.5,"points_against":1378.5},{"team_key":"390.l.236819.t.5","team_name":"Cleveland Breedens","managers":["Ryan"],"rank":6,"wins":7,"losses":6,"ties":0,"points_for":1401.5,"points_against":1470.5},{"team_key":"390.l.236819.t.3","team_name":"ALL DAY","managers":["A D"],"rank":7,"wins":7,"losses":6,"ties":0,"points_for":1340.5,"points_against":1336.0},{"team_key":"390.l.236819.t.8","team_name":"LVC","managers":["LVC"],"rank":8,"wins":2,"losses":10,"ties":1,"points_for":1167.5,"points_against":1517.0},{"team_key":"390.l.236819.t.1","team_name":"Zionsville Bubcons","managers":["bubcon","frank"],"rank":9,"wins":5,"losses":8,"ties":0,"points_for":1371.5,"points_against":1406.0},{"team_key":"390.l.236819.t.11","team_name":"Scott Stars","managers":["Clarke","Rich"],"rank":10,"wins":6,"losses":7,"ties":0,"points_for":1610.5,"points_against":1426.5},{"team_key":"390.l.236819.t.10","team_name":"Opolos","managers":["B-waite"],"rank":11,"wins":5,"losses":8,"ties":0,"points_for":1332.5,"points_against":1516.5},{"team_key":"390.l.236819.t.9","team_name":"GRIT U","managers":["terry"],"rank":12,"wins":5,"losses":7,"ties":1,"points_for":1292.0,"points_against":1412.5}],"matchups":[{"week":1,"team1":{"team_key":"390.l.236819.t.1","team_name":"Zionsville Bubcons","points":145.0},"team2":{"team_key":"390.l.236819.t.2","team_name":"98","points":95.5},"winner_team_key":"390.l.236819.t.1","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"390.l.236819.t.3","team_name":"ALL DAY","points":138.0},"team2":{"team_key":"390.l.236819.t.11","team_name":"Scott Stars","points":134.0},"winner_team_key":"390.l.236819.t.3","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"390.l.236819.t.4","team_name":"B-MAN","points":139.5},"team2":{"team_key":"390.l.236819.t.10","team_name":"Opolos","points":83.5},"winner_team_key":"390.l.236819.t.4","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"390.l.236819.t.5","team_name":"Cleveland Breedens","points":106.0},"team2":{"team_key":"390.l.236819.t.9","team_name":"GRIT U","points":126.0},"winner_team_key":"390.l.236819.t.9","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"390.l.236819.t.6","team_name":"Joco","points":138.0},"team2":{"team_key":"390.l.236819.t.8","team_name":"LVC","points":62.0},"winner_team_key":"390.l.236819.t.6","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"390.l.236819.t.7","team_name":"Johnny Fantasy","points":95.5},"team2":{"team_key":"390.l.236819.t.12","team_name":"The Greek","points":117.0},"winner_team_key":"390.l.236819.t.12","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"390.l.236819.t.1","team_name":"Zionsville Bubcons","points":65.5},"team2":{"team_key":"390.l.236819.t.3","team_name":"ALL DAY","points":156.0},"winner_team_key":"390.l.236819.t.3","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"390.l.236819.t.2","team_name":"98","points":112.5},"team2":{"team_key":"390.l.236819.t.12","team_name":"The Greek","points":83.0},"winner_team_key":"390.l.236819.t.2","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"390.l.236819.t.4","team_name":"B-MAN","points":125.5},"team2":{"team_key":"390.l.236819.t.11","team_name":"Scott Stars","points":121.0},"winner_team_key":"390.l.236819.t.4","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"390.l.236819.t.5","team_name":"Cleveland Breedens","points":99.0},"team2":{"team_key":"390.l.236819.t.10","team_name":"Opolos","points":83.5},"winner_team_key":"390.l.236819.t.5","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"390.l.236819.t.6","team_name":"Joco","points":90.0},"team2":{"team_key":"390.l.236819.t.9","team_name":"GRIT U","points":100.0},"winner_team_key":"390.l.236819.t.9","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"390.l.236819.t.7","team_name":"Johnny Fantasy","points":95.5},"team2":{"team_key":"390.l.236819.t.8","team_name":"LVC","points":77.5},"winner_team_key":"390.l.236819.t.7","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"390.l.236819.t.1","team_name":"Zionsville Bubcons","points":126.0},"team2":{"team_key":"390.l.236819.t.4","team_name":"B-MAN","points":122.0},"winner_team_key":"390.l.236819.t.1","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"390.l.236819.t.2","team_name":"98","points":89.5},"team2":{"team_key":"390.l.236819.t.3","team_name":"ALL DAY","points":104.0},"winner_team_key":"390.l.236819.t.3","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"390.l.236819.t.5","team_name":"Cleveland Breedens","points":106.0},"team2":{"team_key":"390.l.236819.t.11","team_name":"Scott Stars","points":159.5},"winner_team_key":"390.l.236819.t.11","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"390.l.236819.t.6","team_name":"Joco","points":135.5},"team2":{"team_key":"390.l.236819.t.10","team_name":"Opolos","points":61.0},"winner_team_key":"390.l.236819.t.6","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"390.l.236819.t.7","team_name":"Johnny Fantasy","points":117.5},"team2":{"team_key":"390.l.236819.t.9","team_name":"GRIT U","points":121.5},"winner_team_key":"390.l.236819.t.9","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"390.l.236819.t.8","team_name":"LVC","points":110.5},"team2":{"team_key":"390.l.236819.t.12","team_name":"The Greek","points":112.5},"winner_team_key":"390.l.236819.t.12","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"390.l.236819.t.1","team_name":"Zionsville Bubcons","points":64.5},"team2":{"team_key":"390.l.236819.t.5","team_name":"Cleveland Breedens","points":113.0},"winner_team_key":"390.l.236819.t.5","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"390.l.236819.t.2","team_name":"98","points":79.5},"team2":{"team_key":"390.l.236819.t.4","team_name":"B-MAN","points":89.0},"winner_team_key":"390.l.236819.t.4","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"390.l.236819.t.3","team_name":"ALL DAY","points":92.5},"team2":{"team_key":"390.l.236819.t.12","team_name":"The Greek","points":125.0},"winner_team_key":"390.l.236819.t.12","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"390.l.236819.t.6","team_name":"Joco","points":132.5},"team2":{"team_key":"390.l.236819.t.11","team_name":"Scott Stars","points":126.5},"winner_team_key":"390.l.236819.t.6","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"390.l.236819.t.7","team_name":"Johnny Fantasy","points":107.0},"team2":{"team_key":"390.l.236819.t.10","team_name":"Opolos","points":98.0},"winner_team_key":"390.l.236819.t.7","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"390.l.236819.t.8","team_name":"LVC","points":82.5},"team2":{"team_key":"390.l.236819.t.9","team_name":"GRIT U","points":82.5},"winner_team_key":"","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"390.l.236819.t.1","team_name":"Zionsville Bubcons","points":143.0},"team2":{"team_key":"390.l.236819.t.6","team_name":"Joco","points":136.0},"winner_team_key":"390.l.236819.t.1","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"390.l.236819.t.2","team_name":"98","points":177.0},"team2":{"team_key":"390.l.236819.t.5","team_name":"Cleveland Breedens","points":109.5},"winner_team_key":"390.l.236819.t.2","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"390.l.236819.t.3","team_name":"ALL DAY","points":90.5},"team2":{"team_key":"390.l.236819.t.4","team_name":"B-MAN","points":124.0},"winner_team_key":"390.l.236819.t.4","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"390.l.236819.t.7","team_name":"Johnny Fantasy","points":136.0},"team2":{"team_key":"390.l.236819.t.11","team_name":"Scott Stars","points":109.5},"winner_team_key":"390.l.236819.t.7","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"390.l.236819.t.8","team_name":"LVC","points":112.0},"team2":{"team_key":"390.l.236819.t.10","team_name":"Opolos","points":84.5},"winner_team_key":"390.l.236819.t.8","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"390.l.236819.t.9","team_name":"GRIT U","points":80.5},"team2":{"team_key":"390.l.236819.t.12","team_name":"The Greek","points":142.5},"winner_team_key":"390.l.236819.t.12","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"390.l.236819.t.1","team_name":"Zionsville Bubcons","points":94.0},"team2":{"team_key":"390.l.236819.t.7","team_name":"Johnny Fantasy","points":103.5},"winner_team_key":"390.l.236819.t.7","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"390.l.236819.t.2","team_name":"98","points":85.0},"team2":{"team_key":"390.l.236819.t.6","team_name":"Joco","points":129.0},"winner_team_key":"390.l.236819.t.6","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"390.l.236819.t.3","team_name":"ALL DAY","points":104.0},"team2":{"team_key":"390.l.236819.t.5","team_name":"Cleveland Breedens","points":104.5},"winner_team_key":"390.l.236819.t.5","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"390.l.236819.t.4","team_name":"B-MAN","points":86.5},"team2":{"team_key":"390.l.236819.t.12","team_name":"The Greek","points":124.5},"winner_team_key":"390.l.236819.t.12","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"390.l.236819.t.8","team_name":"LVC","points":98.0},"team2":{"team_key":"390.l.236819.t.11","team_name":"Scott Stars","points":136.5},"winner_team_key":"390.l.236819.t.11","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"390.l.236819.t.9","team_name":"GRIT U","points":107.5},"team2":{"team_key":"390.l.236819.t.10","team_name":"Opolos","points":133.0},"winner_team_key":"390.l.236819.t.10","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"390.l.236819.t.1","team_name":"Zionsville Bubcons","points":118.0},"team2":{"team_key":"390.l.236819.t.8","team_name":"LVC","points":52.5},"winner_team_key":"390.l.236819.t.1","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"390.l.236819.t.2","team_name":"98","points":109.5},"team2":{"team_key":"390.l.236819.t.7","team_name":"Johnny Fantasy","points":100.0},"winner_team_key":"390.l.236819.t.2","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"390.l.236819.t.3","team_name":"ALL DAY","points":90.0},"team2":{"team_key":"390.l.236819.t.6","team_name":"Joco","points":52.0},"winner_team_key":"390.l.236819.t.3","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"390.l.236819.t.4","team_name":"B-MAN","points":110.5},"team2":{"team_key":"390.l.236819.t.5","team_name":"Cleveland Breedens","points":129.0},"winner_team_key":"390.l.236819.t.5","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"390.l.236819.t.9","team_name":"GRIT U","points":84.0},"team2":{"team_key":"390.l.236819.t.11","team_name":"Scott Stars","points":123.0},"winner_team_key":"390.l.236819.t.11","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"390.l.236819.t.10","team_name":"Opolos","points":135.5},"team2":{"team_key":"390.l.236819.t.12","team_name":"The Greek","points":93.0},"winner_team_key":"390.l.236819.t.10","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"390.l.236819.t.1","team_name":"Zionsville Bubcons","points":123.0},"team2":{"team_key":"390.l.236819.t.9","team_name":"GRIT U","points":124.0},"winner_team_key":"390.l.236819.t.9","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"390.l.236819.t.2","team_name":"98","points":145.5},"team2":{"team_key":"390.l.236819.t.8","team_name":"LVC","points":136.5},"winner_team_key":"390.l.236819.t.2","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"390.l.236819.t.3","team_name":"ALL DAY","points":102.0},"team2":{"team_key":"390.l.236819.t.7","team_name":"Johnny Fantasy","points":122.5},"winner_team_key":"390.l.236819.t.7","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"390.l.236819.t.4","team_name":"B-MAN","points":104.5},"team2":{"team_key":"390.l.236819.t.6","team_name":"Joco","points":87.0},"winner_team_key":"390.l.236819.t.4","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"390.l.236819.t.5","team_name":"Cleveland Breedens","points":78.0},"team2":{"team_key":"390.l.236819.t.12","team_name":"The Greek","points":107.5},"winner_team_key":"390.l.236819.t.12","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"390.l.236819.t.10","team_name":"Opolos","points":94.0},"team2":{"team_key":"390.l.236819.t.11","team_name":"Scott Stars","points":159.5},"winner_team_key":"390.l.236819.t.11","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"390.l.236819.t.1","team_name":"Zionsville Bubcons","points":109.0},"team2":{"team_key":"390.l.236819.t.10","team_name":"Opolos","points":117.5},"winner_team_key":"390.l.236819.t.10","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"390.l.236819.t.2","team_name":"98","points":98.5},"team2":{"team_key":"390.l.236819.t.9","team_name":"GRIT U","points":87.0},"winner_team_key":"390.l.236819.t.2","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"390.l.236819.t.3","team_name":"ALL DAY","points":76.5},"team2":{"team_key":"390.l.236819.t.8","team_name":"LVC","points":122.0},"winner_team_key":"390.l.236819.t.8","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"390.l.236819.t.4","team_name":"B-MAN","points":129.5},"team2":{"team_key":"390.l.236819.t.7","team_name":"Johnny Fantasy","points":95.0},"winner_team_key":"390.l.236819.t.4","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"390.l.236819.t.5","team_name":"Cleveland Breedens","points":91.0},"team2":{"team_key":"390.l.236819.t.6","team_name":"Joco","points":147.5},"winner_team_key":"390.l.236819.t.6","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"390.l.236819.t.11","team_name":"Scott Stars","points":157.0},"team2":{"team_key":"390.l.236819.t.12","team_name":"The Greek","points":121.5},"winner_team_key":"390.l.236819.t.11","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"390.l.236819.t.1","team_name":"Zionsville Bubcons","points":75.5},"team2":{"team_key":"390.l.236819.t.11","team_name":"Scott Stars","points":117.5},"winner_team_key":"390.l.236819.t.11","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"390.l.236819.t.2","team_name":"98","points":96.0},"team2":{"team_key":"390.l.236819.t.10","team_name":"Opolos","points":119.0},"winner_team_key":"390.l.236819.t.10","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"390.l.236819.t.3","team_name":"ALL DAY","points":96.0},"team2":{"team_key":"390.l.236819.t.9","team_name":"GRIT U","points":94.0},"winner_team_key":"390.l.236819.t.3","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"390.l.236819.t.4","team_name":"B-MAN","points":170.0},"team2":{"team_key":"390.l.236819.t.8","team_name":"LVC","points":68.0},"winner_team_key":"390.l.236819.t.4","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"390.l.236819.t.5","team_name":"Cleveland Breedens","points":114.0},"team2":{"team_key":"390.l.236819.t.7","team_name":"Johnny Fantasy","points":98.0},"winner_team_key":"390.l.236819.t.5","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"390.l.236819.t.6","team_name":"Joco","points":85.0},"team2":{"team_key":"390.l.236819.t.12","team_name":"The Greek","points":110.0},"winner_team_key":"390.l.236819.t.12","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"390.l.236819.t.1","team_name":"Zionsville Bubcons","points":121.0},"team2":{"team_key":"390.l.236819.t.12","team_name":"The Greek","points":60.0},"winner_team_key":"390.l.236819.t.1","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"390.l.236819.t.2","team_name":"98","points":89.0},"team2":{"team_key":"390.l.236819.t.11","team_name":"Scott Stars","points":80.0},"winner_team_key":"390.l.236819.t.2","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"390.l.236819.t.3","team_name":"ALL DAY","points":87.5},"team2":{"team_key":"390.l.236819.t.10","team_name":"Opolos","points":133.5},"winner_team_key":"390.l.236819.t.10","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"390.l.236819.t.4","team_name":"B-MAN","points":91.0},"team2":{"team_key":"390.l.236819.t.9","team_name":"GRIT U","points":73.0},"winner_team_key":"390.l.236819.t.4","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"390.l.236819.t.5","team_name":"Cleveland Breedens","points":130.5},"team2":{"team_key":"390.l.236819.t.8","team_name":"LVC","points":100.0},"winner_team_key":"390.l.236819.t.5","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"390.l.236819.t.6","team_name":"Joco","points":158.0},"team2":{"team_key":"390.l.236819.t.7","team_name":"Johnny Fantasy","points":117.5},"winner_team_key":"390.l.236819.t.6","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"390.l.236819.t.1","team_name":"Zionsville Bubcons","points":105.5},"team2":{"team_key":"390.l.236819.t.2","team_name":"98","points":110.0},"winner_team_key":"390.l.236819.t.2","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"390.l.236819.t.3","team_name":"ALL DAY","points":105.0},"team2":{"team_key":"390.l.236819.t.11","team_name":"Scott Stars","points":88.0},"winner_team_key":"390.l.236819.t.3","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"390.l.236819.t.4","team_name":"B-MAN","points":140.0},"team2":{"team_key":"390.l.236819.t.10","team_name":"Opolos","points":98.0},"winner_team_key":"390.l.236819.t.4","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"390.l.236819.t.5","team_name":"Cleveland Breedens","points":90.0},"team2":{"team_key":"390.l.236819.t.9","team_name":"GRIT U","points":101.0},"winner_team_key":"390.l.236819.t.9","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"390.l.236819.t.6","team_name":"Joco","points":122.0},"team2":{"team_key":"390.l.236819.t.8","team_name":"LVC","points":75.0},"winner_team_key":"390.l.236819.t.6","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"390.l.236819.t.7","team_name":"Johnny Fantasy","points":120.5},"team2":{"team_key":"390.l.236819.t.12","team_name":"The Greek","points":109.0},"winner_team_key":"390.l.236819.t.7","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"390.l.236819.t.1","team_name":"Zionsville Bubcons","points":81.5},"team2":{"team_key":"390.l.236819.t.3","team_name":"ALL DAY","points":98.5},"winner_team_key":"390.l.236819.t.3","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"390.l.236819.t.2","team_name":"98","points":119.0},"team2":{"team_key":"390.l.236819.t.12","team_name":"The Greek","points":91.0},"winner_team_key":"390.l.236819.t.2","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"390.l.236819.t.4","team_name":"B-MAN","points":121.5},"team2":{"team_key":"390.l.236819.t.11","team_name":"Scott Stars","points":98.5},"winner_team_key":"390.l.236819.t.4","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"390.l.236819.t.5","team_name":"Cleveland Breedens","points":131.0},"team2":{"team_key":"390.l.236819.t.10","team_name":"Opolos","points":91.5},"winner_team_key":"390.l.236819.t.5","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"390.l.236819.t.6","team_name":"Joco","points":119.5},"team2":{"team_key":"390.l.236819.t.9","team_name":"GRIT U","points":111.0},"winner_team_key":"390.l.236819.t.6","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"390.l.236819.t.7","team_name":"Johnny Fantasy","points":105.0},"team2":{"team_key":"390.l.236819.t.8","team_name":"LVC","points":71.0},"winner_team_key":"390.l.236819.t.7","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"390.l.236819.t.1","team_name":"Zionsville Bubcons","points":111.5},"team2":{"team_key":"390.l.236819.t.10","team_name":"Opolos","points":102.0},"winner_team_key":"390.l.236819.t.1","is_playoffs":true,"is_championship":false},{"week":14,"team1":{"team_key":"390.l.236819.t.2","team_name":"98","points":100.5},"team2":{"team_key":"390.l.236819.t.12","team_name":"The Greek","points":113.5},"winner_team_key":"390.l.236819.t.12","is_playoffs":true,"is_championship":false},{"week":14,"team1":{"team_key":"390.l.236819.t.5","team_name":"Cleveland Breedens","points":98.0},"team2":{"team_key":"390.l.236819.t.7","team_name":"Johnny Fantasy","points":111.5},"winner_team_key":"390.l.236819.t.7","is_playoffs":true,"is_championship":false},{"week":14,"team1":{"team_key":"390.l.236819.t.8","team_name":"LVC","points":88.5},"team2":{"team_key":"390.l.236819.t.9","team_name":"GRIT U","points":70.5},"winner_team_key":"390.l.236819.t.8","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"390.l.236819.t.1","team_name":"Zionsville Bubcons","points":106.0},"team2":{"team_key":"390.l.236819.t.3","team_name":"ALL DAY","points":128.5},"winner_team_key":"390.l.236819.t.3","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"390.l.236819.t.2","team_name":"98","points":117.5},"team2":{"team_key":"390.l.236819.t.5","team_name":"Cleveland Breedens","points":93.0},"winner_team_key":"390.l.236819.t.2","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"390.l.236819.t.4","team_name":"B-MAN","points":117.0},"team2":{"team_key":"390.l.236819.t.7","team_name":"Johnny Fantasy","points":119.5},"winner_team_key":"390.l.236819.t.7","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"390.l.236819.t.6","team_name":"Joco","points":141.0},"team2":{"team_key":"390.l.236819.t.12","team_name":"The Greek","points":76.5},"winner_team_key":"390.l.236819.t.6","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"390.l.236819.t.8","team_name":"LVC","points":117.0},"team2":{"team_key":"390.l.236819.t.11","team_name":"Scott Stars","points":67.5},"winner_team_key":"390.l.236819.t.8","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"390.l.236819.t.9","team_name":"GRIT U","points":94.5},"team2":{"team_key":"390.l.236819.t.10","team_name":"Opolos","points":97.0},"winner_team_key":"390.l.236819.t.10","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"390.l.236819.t.1","team_name":"Zionsville Bubcons","points":111.5},"team2":{"team_key":"390.l.236819.t.11","team_name":"Scott Stars","points":74.0},"winner_team_key":"390.l.236819.t.1","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"390.l.236819.t.3","team_name":"ALL DAY","points":92.0},"team2":{"team_key":"390.l.236819.t.8","team_name":"LVC","points":72.5},"winner_team_key":"390.l.236819.t.3","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"390.l.236819.t.4","team_name":"B-MAN","points":118.5},"team2":{"team_key":"390.l.236819.t.12","team_name":"The Greek","points":78.0},"winner_team_key":"390.l.236819.t.4","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"390.l.236819.t.6","team_name":"Joco","points":92.5},"team2":{"team_key":"390.l.236819.t.7","team_name":"Johnny Fantasy","points":86.0},"winner_team_key":"390.l.236819.t.6","is_playoffs":true,"is_championship":true}],"season_high_score":{"points":177.0,"team":"98","week":5},"season_low_score":{"points":52.0,"team":"Joco","week":7}},{"season":2020,"league_key":"399.l.414649","league_name":"BKGFFL","num_teams":12,"playoff_start_week":14,"champion":{"team_key":"399.l.414649.t.8","team_name":"LVC","points":102.5},"runner_up":{"team_key":"399.l.414649.t.2","team_name":"98","points":101.5},"champ_score":102.5,"runner_score":101.5,"standings":[{"team_key":"399.l.414649.t.8","team_name":"LVC","managers":["LVC"],"rank":1,"wins":8,"losses":5,"ties":0,"points_for":1471.5,"points_against":1356.0},{"team_key":"399.l.414649.t.2","team_name":"98","managers":["Jonathan"],"rank":2,"wins":10,"losses":3,"ties":0,"points_for":1679.5,"points_against":1358.5},{"team_key":"399.l.414649.t.4","team_name":"Fuz Nuts U","managers":["Fuzzy"],"rank":3,"wins":7,"losses":6,"ties":0,"points_for":1503.0,"points_against":1368.5},{"team_key":"399.l.414649.t.10","team_name":"Opolos","managers":["B-waite"],"rank":4,"wins":8,"losses":5,"ties":0,"points_for":1513.0,"points_against":1464.5},{"team_key":"399.l.414649.t.11","team_name":"Frankyyyyy","managers":["frank"],"rank":5,"wins":7,"losses":6,"ties":0,"points_for":1329.0,"points_against":1437.5},{"team_key":"399.l.414649.t.12","team_name":"The Greek","managers":["mark","David"],"rank":6,"wins":8,"losses":5,"ties":0,"points_for":1463.0,"points_against":1467.0},{"team_key":"399.l.414649.t.5","team_name":"Cleveland Breedens","managers":["Ryan"],"rank":7,"wins":6,"losses":7,"ties":0,"points_for":1476.5,"points_against":1352.0},{"team_key":"399.l.414649.t.1","team_name":"Zionsville Bubcons","managers":["bubcon"],"rank":8,"wins":3,"losses":10,"ties":0,"points_for":1334.0,"points_against":1440.5},{"team_key":"399.l.414649.t.9","team_name":"Nothin But Assholes","managers":["terry"],"rank":9,"wins":7,"losses":6,"ties":0,"points_for":1294.5,"points_against":1336.5},{"team_key":"399.l.414649.t.7","team_name":"Johnny Fantasy","managers":["Johnny Fantasy"],"rank":10,"wins":7,"losses":6,"ties":0,"points_for":1316.0,"points_against":1424.0},{"team_key":"399.l.414649.t.3","team_name":"Team Beef","managers":["Bird"],"rank":11,"wins":6,"losses":7,"ties":0,"points_for":1275.5,"points_against":1331.5},{"team_key":"399.l.414649.t.6","team_name":"Joco","managers":["JG JR"],"rank":12,"wins":1,"losses":12,"ties":0,"points_for":1229.0,"points_against":1548.0}],"matchups":[{"week":1,"team1":{"team_key":"399.l.414649.t.1","team_name":"Zionsville Bubcons","points":101.0},"team2":{"team_key":"399.l.414649.t.2","team_name":"98","points":114.0},"winner_team_key":"399.l.414649.t.2","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"399.l.414649.t.3","team_name":"Team Beef","points":108.0},"team2":{"team_key":"399.l.414649.t.11","team_name":"Frankyyyyy","points":115.0},"winner_team_key":"399.l.414649.t.11","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"399.l.414649.t.4","team_name":"Fuz Nuts U","points":100.5},"team2":{"team_key":"399.l.414649.t.10","team_name":"Opolos","points":122.5},"winner_team_key":"399.l.414649.t.10","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"399.l.414649.t.5","team_name":"Cleveland Breedens","points":93.5},"team2":{"team_key":"399.l.414649.t.9","team_name":"Nothin But Assholes","points":109.0},"winner_team_key":"399.l.414649.t.9","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"399.l.414649.t.6","team_name":"Joco","points":111.0},"team2":{"team_key":"399.l.414649.t.8","team_name":"LVC","points":145.5},"winner_team_key":"399.l.414649.t.8","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"399.l.414649.t.7","team_name":"Johnny Fantasy","points":104.5},"team2":{"team_key":"399.l.414649.t.12","team_name":"The Greek","points":125.0},"winner_team_key":"399.l.414649.t.12","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"399.l.414649.t.1","team_name":"Zionsville Bubcons","points":100.0},"team2":{"team_key":"399.l.414649.t.3","team_name":"Team Beef","points":102.5},"winner_team_key":"399.l.414649.t.3","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"399.l.414649.t.2","team_name":"98","points":159.0},"team2":{"team_key":"399.l.414649.t.12","team_name":"The Greek","points":111.0},"winner_team_key":"399.l.414649.t.2","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"399.l.414649.t.4","team_name":"Fuz Nuts U","points":128.0},"team2":{"team_key":"399.l.414649.t.11","team_name":"Frankyyyyy","points":92.0},"winner_team_key":"399.l.414649.t.4","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"399.l.414649.t.5","team_name":"Cleveland Breedens","points":156.0},"team2":{"team_key":"399.l.414649.t.10","team_name":"Opolos","points":124.5},"winner_team_key":"399.l.414649.t.5","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"399.l.414649.t.6","team_name":"Joco","points":100.5},"team2":{"team_key":"399.l.414649.t.9","team_name":"Nothin But Assholes","points":107.5},"winner_team_key":"399.l.414649.t.9","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"399.l.414649.t.7","team_name":"Johnny Fantasy","points":79.5},"team2":{"team_key":"399.l.414649.t.8","team_name":"LVC","points":135.0},"winner_team_key":"399.l.414649.t.8","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"399.l.414649.t.1","team_name":"Zionsville Bubcons","points":107.5},"team2":{"team_key":"399.l.414649.t.4","team_name":"Fuz Nuts U","points":108.5},"winner_team_key":"399.l.414649.t.4","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"399.l.414649.t.2","team_name":"98","points":164.5},"team2":{"team_key":"399.l.414649.t.3","team_name":"Team Beef","points":124.5},"winner_team_key":"399.l.414649.t.2","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"399.l.414649.t.5","team_name":"Cleveland Breedens","points":153.5},"team2":{"team_key":"399.l.414649.t.11","team_name":"Frankyyyyy","points":113.5},"winner_team_key":"399.l.414649.t.5","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"399.l.414649.t.6","team_name":"Joco","points":104.0},"team2":{"team_key":"399.l.414649.t.10","team_name":"Opolos","points":142.0},"winner_team_key":"399.l.414649.t.10","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"399.l.414649.t.7","team_name":"Johnny Fantasy","points":122.0},"team2":{"team_key":"399.l.414649.t.9","team_name":"Nothin But Assholes","points":90.5},"winner_team_key":"399.l.414649.t.7","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"399.l.414649.t.8","team_name":"LVC","points":91.0},"team2":{"team_key":"399.l.414649.t.12","team_name":"The Greek","points":93.0},"winner_team_key":"399.l.414649.t.12","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"399.l.414649.t.1","team_name":"Zionsville Bubcons","points":82.5},"team2":{"team_key":"399.l.414649.t.5","team_name":"Cleveland Breedens","points":159.0},"winner_team_key":"399.l.414649.t.5","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"399.l.414649.t.2","team_name":"98","points":133.0},"team2":{"team_key":"399.l.414649.t.4","team_name":"Fuz Nuts U","points":112.5},"winner_team_key":"399.l.414649.t.2","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"399.l.414649.t.3","team_name":"Team Beef","points":115.5},"team2":{"team_key":"399.l.414649.t.12","team_name":"The Greek","points":82.5},"winner_team_key":"399.l.414649.t.3","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"399.l.414649.t.6","team_name":"Joco","points":131.0},"team2":{"team_key":"399.l.414649.t.11","team_name":"Frankyyyyy","points":115.5},"winner_team_key":"399.l.414649.t.6","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"399.l.414649.t.7","team_name":"Johnny Fantasy","points":74.5},"team2":{"team_key":"399.l.414649.t.10","team_name":"Opolos","points":133.5},"winner_team_key":"399.l.414649.t.10","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"399.l.414649.t.8","team_name":"LVC","points":86.0},"team2":{"team_key":"399.l.414649.t.9","team_name":"Nothin But Assholes","points":114.0},"winner_team_key":"399.l.414649.t.9","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"399.l.414649.t.1","team_name":"Zionsville Bubcons","points":102.0},"team2":{"team_key":"399.l.414649.t.6","team_name":"Joco","points":98.0},"winner_team_key":"399.l.414649.t.1","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"399.l.414649.t.2","team_name":"98","points":117.5},"team2":{"team_key":"399.l.414649.t.5","team_name":"Cleveland Breedens","points":109.5},"winner_team_key":"399.l.414649.t.2","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"399.l.414649.t.3","team_name":"Team Beef","points":85.0},"team2":{"team_key":"399.l.414649.t.4","team_name":"Fuz Nuts U","points":123.5},"winner_team_key":"399.l.414649.t.4","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"399.l.414649.t.7","team_name":"Johnny Fantasy","points":89.0},"team2":{"team_key":"399.l.414649.t.11","team_name":"Frankyyyyy","points":120.5},"winner_team_key":"399.l.414649.t.11","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"399.l.414649.t.8","team_name":"LVC","points":116.5},"team2":{"team_key":"399.l.414649.t.10","team_name":"Opolos","points":109.0},"winner_team_key":"399.l.414649.t.8","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"399.l.414649.t.9","team_name":"Nothin But Assholes","points":105.5},"team2":{"team_key":"399.l.414649.t.12","team_name":"The Greek","points":96.5},"winner_team_key":"399.l.414649.t.9","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"399.l.414649.t.1","team_name":"Zionsville Bubcons","points":110.0},"team2":{"team_key":"399.l.414649.t.7","team_name":"Johnny Fantasy","points":88.5},"winner_team_key":"399.l.414649.t.1","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"399.l.414649.t.2","team_name":"98","points":134.5},"team2":{"team_key":"399.l.414649.t.6","team_name":"Joco","points":76.0},"winner_team_key":"399.l.414649.t.2","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"399.l.414649.t.3","team_name":"Team Beef","points":74.0},"team2":{"team_key":"399.l.414649.t.5","team_name":"Cleveland Breedens","points":66.0},"winner_team_key":"399.l.414649.t.3","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"399.l.414649.t.4","team_name":"Fuz Nuts U","points":107.0},"team2":{"team_key":"399.l.414649.t.12","team_name":"The Greek","points":134.5},"winner_team_key":"399.l.414649.t.12","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"399.l.414649.t.8","team_name":"LVC","points":112.0},"team2":{"team_key":"399.l.414649.t.11","team_name":"Frankyyyyy","points":60.5},"winner_team_key":"399.l.414649.t.8","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"399.l.414649.t.9","team_name":"Nothin But Assholes","points":125.5},"team2":{"team_key":"399.l.414649.t.10","team_name":"Opolos","points":59.5},"winner_team_key":"399.l.414649.t.9","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"399.l.414649.t.1","team_name":"Zionsville Bubcons","points":104.5},"team2":{"team_key":"399.l.414649.t.8","team_name":"LVC","points":125.5},"winner_team_key":"399.l.414649.t.8","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"399.l.414649.t.2","team_name":"98","points":116.5},"team2":{"team_key":"399.l.414649.t.7","team_name":"Johnny Fantasy","points":118.0},"winner_team_key":"399.l.414649.t.7","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"399.l.414649.t.3","team_name":"Team Beef","points":121.0},"team2":{"team_key":"399.l.414649.t.6","team_name":"Joco","points":93.5},"winner_team_key":"399.l.414649.t.3","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"399.l.414649.t.4","team_name":"Fuz Nuts U","points":152.0},"team2":{"team_key":"399.l.414649.t.5","team_name":"Cleveland Breedens","points":103.5},"winner_team_key":"399.l.414649.t.4","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"399.l.414649.t.9","team_name":"Nothin But Assholes","points":78.5},"team2":{"team_key":"399.l.414649.t.11","team_name":"Frankyyyyy","points":111.0},"winner_team_key":"399.l.414649.t.11","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"399.l.414649.t.10","team_name":"Opolos","points":112.5},"team2":{"team_key":"399.l.414649.t.12","team_name":"The Greek","points":147.0},"winner_team_key":"399.l.414649.t.12","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"399.l.414649.t.1","team_name":"Zionsville Bubcons","points":82.5},"team2":{"team_key":"399.l.414649.t.9","team_name":"Nothin But Assholes","points":88.5},"winner_team_key":"399.l.414649.t.9","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"399.l.414649.t.2","team_name":"98","points":153.5},"team2":{"team_key":"399.l.414649.t.8","team_name":"LVC","points":81.0},"winner_team_key":"399.l.414649.t.2","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"399.l.414649.t.3","team_name":"Team Beef","points":65.0},"team2":{"team_key":"399.l.414649.t.7","team_name":"Johnny Fantasy","points":99.5},"winner_team_key":"399.l.414649.t.7","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"399.l.414649.t.4","team_name":"Fuz Nuts U","points":110.0},"team2":{"team_key":"399.l.414649.t.6","team_name":"Joco","points":51.5},"winner_team_key":"399.l.414649.t.4","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"399.l.414649.t.5","team_name":"Cleveland Breedens","points":84.5},"team2":{"team_key":"399.l.414649.t.12","team_name":"The Greek","points":88.0},"winner_team_key":"399.l.414649.t.12","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"399.l.414649.t.10","team_name":"Opolos","points":117.0},"team2":{"team_key":"399.l.414649.t.11","team_name":"Frankyyyyy","points":128.0},"winner_team_key":"399.l.414649.t.11","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"399.l.414649.t.1","team_name":"Zionsville Bubcons","points":118.0},"team2":{"team_key":"399.l.414649.t.10","team_name":"Opolos","points":119.0},"winner_team_key":"399.l.414649.t.10","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"399.l.414649.t.2","team_name":"98","points":125.0},"team2":{"team_key":"399.l.414649.t.9","team_name":"Nothin But Assholes","points":104.0},"winner_team_key":"399.l.414649.t.2","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"399.l.414649.t.3","team_name":"Team Beef","points":74.5},"team2":{"team_key":"399.l.414649.t.8","team_name":"LVC","points":90.0},"winner_team_key":"399.l.414649.t.8","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"399.l.414649.t.4","team_name":"Fuz Nuts U","points":104.0},"team2":{"team_key":"399.l.414649.t.7","team_name":"Johnny Fantasy","points":108.0},"winner_team_key":"399.l.414649.t.7","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"399.l.414649.t.5","team_name":"Cleveland Breedens","points":100.0},"team2":{"team_key":"399.l.414649.t.6","team_name":"Joco","points":93.0},"winner_team_key":"399.l.414649.t.5","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"399.l.414649.t.11","team_name":"Frankyyyyy","points":99.0},"team2":{"team_key":"399.l.414649.t.12","team_name":"The Greek","points":138.0},"winner_team_key":"399.l.414649.t.12","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"399.l.414649.t.1","team_name":"Zionsville Bubcons","points":92.5},"team2":{"team_key":"399.l.414649.t.11","team_name":"Frankyyyyy","points":100.5},"winner_team_key":"399.l.414649.t.11","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"399.l.414649.t.2","team_name":"98","points":91.0},"team2":{"team_key":"399.l.414649.t.10","team_name":"Opolos","points":111.5},"winner_team_key":"399.l.414649.t.10","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"399.l.414649.t.3","team_name":"Team Beef","points":121.0},"team2":{"team_key":"399.l.414649.t.9","team_name":"Nothin But Assholes","points":99.0},"winner_team_key":"399.l.414649.t.3","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"399.l.414649.t.4","team_name":"Fuz Nuts U","points":141.5},"team2":{"team_key":"399.l.414649.t.8","team_name":"LVC","points":101.5},"winner_team_key":"399.l.414649.t.4","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"399.l.414649.t.5","team_name":"Cleveland Breedens","points":119.0},"team2":{"team_key":"399.l.414649.t.7","team_name":"Johnny Fantasy","points":68.0},"winner_team_key":"399.l.414649.t.5","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"399.l.414649.t.6","team_name":"Joco","points":83.5},"team2":{"team_key":"399.l.414649.t.12","team_name":"The Greek","points":104.0},"winner_team_key":"399.l.414649.t.12","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"399.l.414649.t.1","team_name":"Zionsville Bubcons","points":146.5},"team2":{"team_key":"399.l.414649.t.12","team_name":"The Greek","points":101.5},"winner_team_key":"399.l.414649.t.1","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"399.l.414649.t.2","team_name":"98","points":135.5},"team2":{"team_key":"399.l.414649.t.11","team_name":"Frankyyyyy","points":84.5},"winner_team_key":"399.l.414649.t.2","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"399.l.414649.t.3","team_name":"Team Beef","points":89.0},"team2":{"team_key":"399.l.414649.t.10","team_name":"Opolos","points":115.0},"winner_team_key":"399.l.414649.t.10","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"399.l.414649.t.4","team_name":"Fuz Nuts U","points":112.5},"team2":{"team_key":"399.l.414649.t.9","team_name":"Nothin But Assholes","points":61.5},"winner_team_key":"399.l.414649.t.4","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"399.l.414649.t.5","team_name":"Cleveland Breedens","points":105.0},"team2":{"team_key":"399.l.414649.t.8","team_name":"LVC","points":151.0},"winner_team_key":"399.l.414649.t.8","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"399.l.414649.t.6","team_name":"Joco","points":99.0},"team2":{"team_key":"399.l.414649.t.7","team_name":"Johnny Fantasy","points":114.5},"winner_team_key":"399.l.414649.t.7","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"399.l.414649.t.1","team_name":"Zionsville Bubcons","points":82.5},"team2":{"team_key":"399.l.414649.t.2","team_name":"98","points":116.5},"winner_team_key":"399.l.414649.t.2","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"399.l.414649.t.3","team_name":"Team Beef","points":77.0},"team2":{"team_key":"399.l.414649.t.11","team_name":"Frankyyyyy","points":78.5},"winner_team_key":"399.l.414649.t.11","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"399.l.414649.t.4","team_name":"Fuz Nuts U","points":125.5},"team2":{"team_key":"399.l.414649.t.10","team_name":"Opolos","points":157.5},"winner_team_key":"399.l.414649.t.10","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"399.l.414649.t.5","team_name":"Cleveland Breedens","points":138.0},"team2":{"team_key":"399.l.414649.t.9","team_name":"Nothin But Assholes","points":89.5},"winner_team_key":"399.l.414649.t.5","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"399.l.414649.t.6","team_name":"Joco","points":99.5},"team2":{"team_key":"399.l.414649.t.8","team_name":"LVC","points":130.0},"winner_team_key":"399.l.414649.t.8","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"399.l.414649.t.7","team_name":"Johnny Fantasy","points":139.5},"team2":{"team_key":"399.l.414649.t.12","team_name":"The Greek","points":99.5},"winner_team_key":"399.l.414649.t.7","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"399.l.414649.t.1","team_name":"Zionsville Bubcons","points":104.5},"team2":{"team_key":"399.l.414649.t.3","team_name":"Team Beef","points":118.5},"winner_team_key":"399.l.414649.t.3","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"399.l.414649.t.2","team_name":"98","points":119.0},"team2":{"team_key":"399.l.414649.t.12","team_name":"The Greek","points":142.5},"winner_team_key":"399.l.414649.t.12","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"399.l.414649.t.4","team_name":"Fuz Nuts U","points":77.5},"team2":{"team_key":"399.l.414649.t.11","team_name":"Frankyyyyy","points":110.5},"winner_team_key":"399.l.414649.t.11","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"399.l.414649.t.5","team_name":"Cleveland Breedens","points":89.0},"team2":{"team_key":"399.l.414649.t.10","team_name":"Opolos","points":89.5},"winner_team_key":"399.l.414649.t.10","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"399.l.414649.t.6","team_name":"Joco","points":88.5},"team2":{"team_key":"399.l.414649.t.9","team_name":"Nothin But Assholes","points":121.5},"winner_team_key":"399.l.414649.t.9","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"399.l.414649.t.7","team_name":"Johnny Fantasy","points":110.5},"team2":{"team_key":"399.l.414649.t.8","team_name":"LVC","points":106.5},"winner_team_key":"399.l.414649.t.7","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"399.l.414649.t.1","team_name":"Zionsville Bubcons","points":101.5},"team2":{"team_key":"399.l.414649.t.3","team_name":"Team Beef","points":97.0},"winner_team_key":"399.l.414649.t.1","is_playoffs":true,"is_championship":false},{"week":14,"team1":{"team_key":"399.l.414649.t.4","team_name":"Fuz Nuts U","points":140.0},"team2":{"team_key":"399.l.414649.t.12","team_name":"The Greek","points":107.5},"winner_team_key":"399.l.414649.t.4","is_playoffs":true,"is_championship":false},{"week":14,"team1":{"team_key":"399.l.414649.t.5","team_name":"Cleveland Breedens","points":91.5},"team2":{"team_key":"399.l.414649.t.6","team_name":"Joco","points":53.0},"winner_team_key":"399.l.414649.t.5","is_playoffs":true,"is_championship":false},{"week":14,"team1":{"team_key":"399.l.414649.t.8","team_name":"LVC","points":145.5},"team2":{"team_key":"399.l.414649.t.11","team_name":"Frankyyyyy","points":100.5},"winner_team_key":"399.l.414649.t.8","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"399.l.414649.t.1","team_name":"Zionsville Bubcons","points":139.5},"team2":{"team_key":"399.l.414649.t.7","team_name":"Johnny Fantasy","points":106.5},"winner_team_key":"399.l.414649.t.1","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"399.l.414649.t.2","team_name":"98","points":127.0},"team2":{"team_key":"399.l.414649.t.4","team_name":"Fuz Nuts U","points":92.0},"winner_team_key":"399.l.414649.t.2","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"399.l.414649.t.3","team_name":"Team Beef","points":129.5},"team2":{"team_key":"399.l.414649.t.6","team_name":"Joco","points":87.0},"winner_team_key":"399.l.414649.t.3","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"399.l.414649.t.5","team_name":"Cleveland Breedens","points":104.0},"team2":{"team_key":"399.l.414649.t.9","team_name":"Nothin But Assholes","points":90.0},"winner_team_key":"399.l.414649.t.5","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"399.l.414649.t.8","team_name":"LVC","points":162.0},"team2":{"team_key":"399.l.414649.t.10","team_name":"Opolos","points":121.0},"winner_team_key":"399.l.414649.t.8","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"399.l.414649.t.11","team_name":"Frankyyyyy","points":97.5},"team2":{"team_key":"399.l.414649.t.12","team_name":"The Greek","points":95.5},"winner_team_key":"399.l.414649.t.11","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"399.l.414649.t.1","team_name":"Zionsville Bubcons","points":75.0},"team2":{"team_key":"399.l.414649.t.5","team_name":"Cleveland Breedens","points":118.0},"winner_team_key":"399.l.414649.t.5","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"399.l.414649.t.2","team_name":"98","points":101.5},"team2":{"team_key":"399.l.414649.t.8","team_name":"LVC","points":102.5},"winner_team_key":"399.l.414649.t.8","is_playoffs":true,"is_championship":true},{"week":16,"team1":{"team_key":"399.l.414649.t.4","team_name":"Fuz Nuts U","points":144.5},"team2":{"team_key":"399.l.414649.t.10","team_name":"Opolos","points":87.5},"winner_team_key":"399.l.414649.t.4","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"399.l.414649.t.7","team_name":"Johnny Fantasy","points":67.0},"team2":{"team_key":"399.l.414649.t.9","team_name":"Nothin But Assholes","points":110.5},"winner_team_key":"399.l.414649.t.9","is_playoffs":true,"is_championship":false}],"season_high_score":{"points":164.5,"team":"98","week":3},"season_low_score":{"points":51.5,"team":"Joco","week":8}},{"season":2021,"league_key":"406.l.301211","league_name":"BKGFFL","num_teams":12,"playoff_start_week":15,"champion":{"team_key":"406.l.301211.t.2","team_name":"98","points":155.0},"runner_up":{"team_key":"406.l.301211.t.3","team_name":"Doobie Bros","points":120.5},"champ_score":155.0,"runner_score":120.5,"standings":[{"team_key":"406.l.301211.t.2","team_name":"98","managers":["Jonathan"],"rank":1,"wins":8,"losses":6,"ties":0,"points_for":1499.5,"points_against":1544.0},{"team_key":"406.l.301211.t.3","team_name":"Doobie Bros","managers":["Ryan"],"rank":2,"wins":8,"losses":6,"ties":0,"points_for":1760.5,"points_against":1565.0},{"team_key":"406.l.301211.t.7","team_name":"LVC","managers":["LVC"],"rank":3,"wins":11,"losses":3,"ties":0,"points_for":1698.0,"points_against":1445.5},{"team_key":"406.l.301211.t.9","team_name":"Opolos","managers":["B-waite"],"rank":4,"wins":8,"losses":6,"ties":0,"points_for":1458.0,"points_against":1415.0},{"team_key":"406.l.301211.t.12","team_name":"Lilst","managers":["andrew"],"rank":5,"wins":8,"losses":6,"ties":0,"points_for":1516.0,"points_against":1410.5},{"team_key":"406.l.301211.t.6","team_name":"Johnny Fantasy","managers":["Johnny Fantasy"],"rank":6,"wins":8,"losses":6,"ties":0,"points_for":1542.5,"points_against":1523.5},{"team_key":"406.l.301211.t.5","team_name":"Joco","managers":["JG JR"],"rank":7,"wins":6,"losses":8,"ties":0,"points_for":1478.0,"points_against":1523.5},{"team_key":"406.l.301211.t.4","team_name":"Fuz Nuts U","managers":["Fuzzy"],"rank":8,"wins":7,"losses":7,"ties":0,"points_for":1652.0,"points_against":1635.5},{"team_key":"406.l.301211.t.1","team_name":"Zionsville Bubcons","managers":["bubcon"],"rank":9,"wins":5,"losses":9,"ties":0,"points_for":1480.5,"points_against":1525.0},{"team_key":"406.l.301211.t.8","team_name":"Nothin But Assholes","managers":["terry"],"rank":10,"wins":5,"losses":9,"ties":0,"points_for":1320.5,"points_against":1450.5},{"team_key":"406.l.301211.t.10","team_name":"Team Beef","managers":["Bird"],"rank":11,"wins":5,"losses":9,"ties":0,"points_for":1375.5,"points_against":1543.5},{"team_key":"406.l.301211.t.11","team_name":"The Greek","managers":["mark","David"],"rank":12,"wins":5,"losses":9,"ties":0,"points_for":1314.5,"points_against":1514.0}],"matchups":[{"week":1,"team1":{"team_key":"406.l.301211.t.1","team_name":"Zionsville Bubcons","points":135.5},"team2":{"team_key":"406.l.301211.t.2","team_name":"98","points":119.0},"winner_team_key":"406.l.301211.t.1","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"406.l.301211.t.3","team_name":"Doobie Bros","points":90.0},"team2":{"team_key":"406.l.301211.t.11","team_name":"The Greek","points":74.5},"winner_team_key":"406.l.301211.t.3","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"406.l.301211.t.4","team_name":"Fuz Nuts U","points":135.5},"team2":{"team_key":"406.l.301211.t.10","team_name":"Team Beef","points":131.5},"winner_team_key":"406.l.301211.t.4","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"406.l.301211.t.5","team_name":"Joco","points":102.5},"team2":{"team_key":"406.l.301211.t.9","team_name":"Opolos","points":120.5},"winner_team_key":"406.l.301211.t.9","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"406.l.301211.t.6","team_name":"Johnny Fantasy","points":126.0},"team2":{"team_key":"406.l.301211.t.8","team_name":"Nothin But Assholes","points":125.5},"winner_team_key":"406.l.301211.t.6","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"406.l.301211.t.7","team_name":"LVC","points":116.0},"team2":{"team_key":"406.l.301211.t.12","team_name":"Lilst","points":96.5},"winner_team_key":"406.l.301211.t.7","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"406.l.301211.t.1","team_name":"Zionsville Bubcons","points":101.0},"team2":{"team_key":"406.l.301211.t.3","team_name":"Doobie Bros","points":157.0},"winner_team_key":"406.l.301211.t.3","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"406.l.301211.t.2","team_name":"98","points":137.0},"team2":{"team_key":"406.l.301211.t.12","team_name":"Lilst","points":104.5},"winner_team_key":"406.l.301211.t.2","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"406.l.301211.t.4","team_name":"Fuz Nuts U","points":101.0},"team2":{"team_key":"406.l.301211.t.11","team_name":"The Greek","points":114.5},"winner_team_key":"406.l.301211.t.11","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"406.l.301211.t.5","team_name":"Joco","points":122.5},"team2":{"team_key":"406.l.301211.t.10","team_name":"Team Beef","points":102.5},"winner_team_key":"406.l.301211.t.5","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"406.l.301211.t.6","team_name":"Johnny Fantasy","points":100.0},"team2":{"team_key":"406.l.301211.t.9","team_name":"Opolos","points":78.0},"winner_team_key":"406.l.301211.t.6","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"406.l.301211.t.7","team_name":"LVC","points":124.5},"team2":{"team_key":"406.l.301211.t.8","team_name":"Nothin But Assholes","points":108.5},"winner_team_key":"406.l.301211.t.7","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"406.l.301211.t.1","team_name":"Zionsville Bubcons","points":130.0},"team2":{"team_key":"406.l.301211.t.4","team_name":"Fuz Nuts U","points":101.0},"winner_team_key":"406.l.301211.t.1","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"406.l.301211.t.2","team_name":"98","points":83.5},"team2":{"team_key":"406.l.301211.t.3","team_name":"Doobie Bros","points":136.0},"winner_team_key":"406.l.301211.t.3","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"406.l.301211.t.5","team_name":"Joco","points":157.0},"team2":{"team_key":"406.l.301211.t.11","team_name":"The Greek","points":122.0},"winner_team_key":"406.l.301211.t.5","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"406.l.301211.t.6","team_name":"Johnny Fantasy","points":121.0},"team2":{"team_key":"406.l.301211.t.10","team_name":"Team Beef","points":103.5},"winner_team_key":"406.l.301211.t.6","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"406.l.301211.t.7","team_name":"LVC","points":103.0},"team2":{"team_key":"406.l.301211.t.9","team_name":"Opolos","points":90.0},"winner_team_key":"406.l.301211.t.7","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"406.l.301211.t.8","team_name":"Nothin But Assholes","points":84.0},"team2":{"team_key":"406.l.301211.t.12","team_name":"Lilst","points":104.0},"winner_team_key":"406.l.301211.t.12","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"406.l.301211.t.1","team_name":"Zionsville Bubcons","points":109.0},"team2":{"team_key":"406.l.301211.t.5","team_name":"Joco","points":112.0},"winner_team_key":"406.l.301211.t.5","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"406.l.301211.t.2","team_name":"98","points":145.0},"team2":{"team_key":"406.l.301211.t.4","team_name":"Fuz Nuts U","points":92.0},"winner_team_key":"406.l.301211.t.2","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"406.l.301211.t.3","team_name":"Doobie Bros","points":131.5},"team2":{"team_key":"406.l.301211.t.12","team_name":"Lilst","points":143.5},"winner_team_key":"406.l.301211.t.12","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"406.l.301211.t.6","team_name":"Johnny Fantasy","points":94.0},"team2":{"team_key":"406.l.301211.t.11","team_name":"The Greek","points":141.0},"winner_team_key":"406.l.301211.t.11","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"406.l.301211.t.7","team_name":"LVC","points":76.0},"team2":{"team_key":"406.l.301211.t.10","team_name":"Team Beef","points":70.0},"winner_team_key":"406.l.301211.t.7","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"406.l.301211.t.8","team_name":"Nothin But Assholes","points":112.0},"team2":{"team_key":"406.l.301211.t.9","team_name":"Opolos","points":99.0},"winner_team_key":"406.l.301211.t.8","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"406.l.301211.t.1","team_name":"Zionsville Bubcons","points":122.5},"team2":{"team_key":"406.l.301211.t.6","team_name":"Johnny Fantasy","points":140.0},"winner_team_key":"406.l.301211.t.6","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"406.l.301211.t.2","team_name":"98","points":137.5},"team2":{"team_key":"406.l.301211.t.5","team_name":"Joco","points":134.5},"winner_team_key":"406.l.301211.t.2","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"406.l.301211.t.3","team_name":"Doobie Bros","points":177.5},"team2":{"team_key":"406.l.301211.t.4","team_name":"Fuz Nuts U","points":125.0},"winner_team_key":"406.l.301211.t.3","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"406.l.301211.t.7","team_name":"LVC","points":163.0},"team2":{"team_key":"406.l.301211.t.11","team_name":"The Greek","points":66.0},"winner_team_key":"406.l.301211.t.7","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"406.l.301211.t.8","team_name":"Nothin But Assholes","points":125.0},"team2":{"team_key":"406.l.301211.t.10","team_name":"Team Beef","points":134.0},"winner_team_key":"406.l.301211.t.10","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"406.l.301211.t.9","team_name":"Opolos","points":125.0},"team2":{"team_key":"406.l.301211.t.12","team_name":"Lilst","points":87.0},"winner_team_key":"406.l.301211.t.9","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"406.l.301211.t.1","team_name":"Zionsville Bubcons","points":98.0},"team2":{"team_key":"406.l.301211.t.7","team_name":"LVC","points":135.0},"winner_team_key":"406.l.301211.t.7","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"406.l.301211.t.2","team_name":"98","points":152.5},"team2":{"team_key":"406.l.301211.t.6","team_name":"Johnny Fantasy","points":130.5},"winner_team_key":"406.l.301211.t.2","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"406.l.301211.t.3","team_name":"Doobie Bros","points":115.5},"team2":{"team_key":"406.l.301211.t.5","team_name":"Joco","points":98.0},"winner_team_key":"406.l.301211.t.3","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"406.l.301211.t.4","team_name":"Fuz Nuts U","points":113.0},"team2":{"team_key":"406.l.301211.t.12","team_name":"Lilst","points":129.0},"winner_team_key":"406.l.301211.t.12","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"406.l.301211.t.8","team_name":"Nothin But Assholes","points":87.5},"team2":{"team_key":"406.l.301211.t.11","team_name":"The Greek","points":107.0},"winner_team_key":"406.l.301211.t.11","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"406.l.301211.t.9","team_name":"Opolos","points":115.0},"team2":{"team_key":"406.l.301211.t.10","team_name":"Team Beef","points":88.0},"winner_team_key":"406.l.301211.t.9","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"406.l.301211.t.1","team_name":"Zionsville Bubcons","points":68.0},"team2":{"team_key":"406.l.301211.t.8","team_name":"Nothin But Assholes","points":77.5},"winner_team_key":"406.l.301211.t.8","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"406.l.301211.t.2","team_name":"98","points":141.0},"team2":{"team_key":"406.l.301211.t.7","team_name":"LVC","points":108.0},"winner_team_key":"406.l.301211.t.2","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"406.l.301211.t.3","team_name":"Doobie Bros","points":108.5},"team2":{"team_key":"406.l.301211.t.6","team_name":"Johnny Fantasy","points":138.0},"winner_team_key":"406.l.301211.t.6","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"406.l.301211.t.4","team_name":"Fuz Nuts U","points":99.0},"team2":{"team_key":"406.l.301211.t.5","team_name":"Joco","points":140.5},"winner_team_key":"406.l.301211.t.5","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"406.l.301211.t.9","team_name":"Opolos","points":105.5},"team2":{"team_key":"406.l.301211.t.11","team_name":"The Greek","points":99.0},"winner_team_key":"406.l.301211.t.9","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"406.l.301211.t.10","team_name":"Team Beef","points":86.5},"team2":{"team_key":"406.l.301211.t.12","team_name":"Lilst","points":106.5},"winner_team_key":"406.l.301211.t.12","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"406.l.301211.t.1","team_name":"Zionsville Bubcons","points":102.0},"team2":{"team_key":"406.l.301211.t.9","team_name":"Opolos","points":117.0},"winner_team_key":"406.l.301211.t.9","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"406.l.301211.t.2","team_name":"98","points":77.0},"team2":{"team_key":"406.l.301211.t.8","team_name":"Nothin But Assholes","points":105.5},"winner_team_key":"406.l.301211.t.8","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"406.l.301211.t.3","team_name":"Doobie Bros","points":112.0},"team2":{"team_key":"406.l.301211.t.7","team_name":"LVC","points":135.0},"winner_team_key":"406.l.301211.t.7","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"406.l.301211.t.4","team_name":"Fuz Nuts U","points":133.5},"team2":{"team_key":"406.l.301211.t.6","team_name":"Johnny Fantasy","points":72.5},"winner_team_key":"406.l.301211.t.4","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"406.l.301211.t.5","team_name":"Joco","points":91.0},"team2":{"team_key":"406.l.301211.t.12","team_name":"Lilst","points":110.0},"winner_team_key":"406.l.301211.t.12","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"406.l.301211.t.10","team_name":"Team Beef","points":67.0},"team2":{"team_key":"406.l.301211.t.11","team_name":"The Greek","points":87.5},"winner_team_key":"406.l.301211.t.11","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"406.l.301211.t.1","team_name":"Zionsville Bubcons","points":66.5},"team2":{"team_key":"406.l.301211.t.10","team_name":"Team Beef","points":91.0},"winner_team_key":"406.l.301211.t.10","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"406.l.301211.t.2","team_name":"98","points":63.5},"team2":{"team_key":"406.l.301211.t.9","team_name":"Opolos","points":92.5},"winner_team_key":"406.l.301211.t.9","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"406.l.301211.t.3","team_name":"Doobie Bros","points":87.5},"team2":{"team_key":"406.l.301211.t.8","team_name":"Nothin But Assholes","points":116.5},"winner_team_key":"406.l.301211.t.8","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"406.l.301211.t.4","team_name":"Fuz Nuts U","points":125.0},"team2":{"team_key":"406.l.301211.t.7","team_name":"LVC","points":117.0},"winner_team_key":"406.l.301211.t.4","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"406.l.301211.t.5","team_name":"Joco","points":104.0},"team2":{"team_key":"406.l.301211.t.6","team_name":"Johnny Fantasy","points":75.0},"winner_team_key":"406.l.301211.t.5","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"406.l.301211.t.11","team_name":"The Greek","points":93.0},"team2":{"team_key":"406.l.301211.t.12","team_name":"Lilst","points":64.0},"winner_team_key":"406.l.301211.t.11","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"406.l.301211.t.1","team_name":"Zionsville Bubcons","points":120.0},"team2":{"team_key":"406.l.301211.t.11","team_name":"The Greek","points":61.0},"winner_team_key":"406.l.301211.t.1","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"406.l.301211.t.2","team_name":"98","points":116.0},"team2":{"team_key":"406.l.301211.t.10","team_name":"Team Beef","points":75.0},"winner_team_key":"406.l.301211.t.2","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"406.l.301211.t.3","team_name":"Doobie Bros","points":97.5},"team2":{"team_key":"406.l.301211.t.9","team_name":"Opolos","points":88.0},"winner_team_key":"406.l.301211.t.3","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"406.l.301211.t.4","team_name":"Fuz Nuts U","points":90.5},"team2":{"team_key":"406.l.301211.t.8","team_name":"Nothin But Assholes","points":72.0},"winner_team_key":"406.l.301211.t.4","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"406.l.301211.t.5","team_name":"Joco","points":95.5},"team2":{"team_key":"406.l.301211.t.7","team_name":"LVC","points":130.5},"winner_team_key":"406.l.301211.t.7","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"406.l.301211.t.6","team_name":"Johnny Fantasy","points":97.0},"team2":{"team_key":"406.l.301211.t.12","team_name":"Lilst","points":77.0},"winner_team_key":"406.l.301211.t.6","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"406.l.301211.t.1","team_name":"Zionsville Bubcons","points":108.0},"team2":{"team_key":"406.l.301211.t.12","team_name":"Lilst","points":75.5},"winner_team_key":"406.l.301211.t.1","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"406.l.301211.t.2","team_name":"98","points":72.0},"team2":{"team_key":"406.l.301211.t.11","team_name":"The Greek","points":70.5},"winner_team_key":"406.l.301211.t.2","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"406.l.301211.t.3","team_name":"Doobie Bros","points":141.5},"team2":{"team_key":"406.l.301211.t.10","team_name":"Team Beef","points":148.0},"winner_team_key":"406.l.301211.t.10","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"406.l.301211.t.4","team_name":"Fuz Nuts U","points":153.0},"team2":{"team_key":"406.l.301211.t.9","team_name":"Opolos","points":89.5},"winner_team_key":"406.l.301211.t.4","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"406.l.301211.t.5","team_name":"Joco","points":59.5},"team2":{"team_key":"406.l.301211.t.8","team_name":"Nothin But Assholes","points":99.5},"winner_team_key":"406.l.301211.t.8","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"406.l.301211.t.6","team_name":"Johnny Fantasy","points":106.0},"team2":{"team_key":"406.l.301211.t.7","team_name":"LVC","points":127.0},"winner_team_key":"406.l.301211.t.7","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"406.l.301211.t.1","team_name":"Zionsville Bubcons","points":73.0},"team2":{"team_key":"406.l.301211.t.2","team_name":"98","points":91.5},"winner_team_key":"406.l.301211.t.2","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"406.l.301211.t.3","team_name":"Doobie Bros","points":144.0},"team2":{"team_key":"406.l.301211.t.11","team_name":"The Greek","points":87.5},"winner_team_key":"406.l.301211.t.3","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"406.l.301211.t.4","team_name":"Fuz Nuts U","points":111.0},"team2":{"team_key":"406.l.301211.t.10","team_name":"Team Beef","points":117.0},"winner_team_key":"406.l.301211.t.10","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"406.l.301211.t.5","team_name":"Joco","points":69.0},"team2":{"team_key":"406.l.301211.t.9","team_name":"Opolos","points":122.5},"winner_team_key":"406.l.301211.t.9","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"406.l.301211.t.6","team_name":"Johnny Fantasy","points":84.0},"team2":{"team_key":"406.l.301211.t.8","team_name":"Nothin But Assholes","points":59.0},"winner_team_key":"406.l.301211.t.6","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"406.l.301211.t.7","team_name":"LVC","points":88.0},"team2":{"team_key":"406.l.301211.t.12","team_name":"Lilst","points":148.0},"winner_team_key":"406.l.301211.t.12","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"406.l.301211.t.1","team_name":"Zionsville Bubcons","points":143.5},"team2":{"team_key":"406.l.301211.t.3","team_name":"Doobie Bros","points":104.5},"winner_team_key":"406.l.301211.t.1","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"406.l.301211.t.2","team_name":"98","points":81.0},"team2":{"team_key":"406.l.301211.t.12","team_name":"Lilst","points":129.0},"winner_team_key":"406.l.301211.t.12","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"406.l.301211.t.4","team_name":"Fuz Nuts U","points":129.5},"team2":{"team_key":"406.l.301211.t.11","team_name":"The Greek","points":96.0},"winner_team_key":"406.l.301211.t.4","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"406.l.301211.t.5","team_name":"Joco","points":72.5},"team2":{"team_key":"406.l.301211.t.10","team_name":"Team Beef","points":85.0},"winner_team_key":"406.l.301211.t.10","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"406.l.301211.t.6","team_name":"Johnny Fantasy","points":111.5},"team2":{"team_key":"406.l.301211.t.9","team_name":"Opolos","points":115.0},"winner_team_key":"406.l.301211.t.9","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"406.l.301211.t.7","team_name":"LVC","points":148.0},"team2":{"team_key":"406.l.301211.t.8","team_name":"Nothin But Assholes","points":88.5},"winner_team_key":"406.l.301211.t.7","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"406.l.301211.t.1","team_name":"Zionsville Bubcons","points":103.5},"team2":{"team_key":"406.l.301211.t.4","team_name":"Fuz Nuts U","points":143.0},"winner_team_key":"406.l.301211.t.4","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"406.l.301211.t.2","team_name":"98","points":83.0},"team2":{"team_key":"406.l.301211.t.3","team_name":"Doobie Bros","points":157.5},"winner_team_key":"406.l.301211.t.3","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"406.l.301211.t.5","team_name":"Joco","points":119.5},"team2":{"team_key":"406.l.301211.t.11","team_name":"The Greek","points":95.0},"winner_team_key":"406.l.301211.t.5","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"406.l.301211.t.6","team_name":"Johnny Fantasy","points":147.0},"team2":{"team_key":"406.l.301211.t.10","team_name":"Team Beef","points":76.5},"winner_team_key":"406.l.301211.t.6","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"406.l.301211.t.7","team_name":"LVC","points":127.0},"team2":{"team_key":"406.l.301211.t.9","team_name":"Opolos","points":100.5},"winner_team_key":"406.l.301211.t.7","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"406.l.301211.t.8","team_name":"Nothin But Assholes","points":59.5},"team2":{"team_key":"406.l.301211.t.12","team_name":"Lilst","points":141.5},"winner_team_key":"406.l.301211.t.12","is_playoffs":false,"is_championship":false},{"week":15,"team1":{"team_key":"406.l.301211.t.1","team_name":"Zionsville Bubcons","points":104.0},"team2":{"team_key":"406.l.301211.t.11","team_name":"The Greek","points":67.5},"winner_team_key":"406.l.301211.t.1","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"406.l.301211.t.2","team_name":"98","points":75.0},"team2":{"team_key":"406.l.301211.t.12","team_name":"Lilst","points":74.5},"winner_team_key":"406.l.301211.t.2","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"406.l.301211.t.6","team_name":"Johnny Fantasy","points":62.0},"team2":{"team_key":"406.l.301211.t.9","team_name":"Opolos","points":70.5},"winner_team_key":"406.l.301211.t.9","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"406.l.301211.t.8","team_name":"Nothin But Assholes","points":91.0},"team2":{"team_key":"406.l.301211.t.10","team_name":"Team Beef","points":83.0},"winner_team_key":"406.l.301211.t.8","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"406.l.301211.t.1","team_name":"Zionsville Bubcons","points":75.0},"team2":{"team_key":"406.l.301211.t.5","team_name":"Joco","points":94.0},"winner_team_key":"406.l.301211.t.5","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"406.l.301211.t.2","team_name":"98","points":141.0},"team2":{"team_key":"406.l.301211.t.7","team_name":"LVC","points":85.0},"winner_team_key":"406.l.301211.t.2","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"406.l.301211.t.3","team_name":"Doobie Bros","points":153.5},"team2":{"team_key":"406.l.301211.t.9","team_name":"Opolos","points":144.5},"winner_team_key":"406.l.301211.t.3","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"406.l.301211.t.4","team_name":"Fuz Nuts U","points":82.0},"team2":{"team_key":"406.l.301211.t.8","team_name":"Nothin But Assholes","points":62.0},"winner_team_key":"406.l.301211.t.4","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"406.l.301211.t.6","team_name":"Johnny Fantasy","points":93.5},"team2":{"team_key":"406.l.301211.t.12","team_name":"Lilst","points":206.5},"winner_team_key":"406.l.301211.t.12","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"406.l.301211.t.10","team_name":"Team Beef","points":69.5},"team2":{"team_key":"406.l.301211.t.11","team_name":"The Greek","points":45.0},"winner_team_key":"406.l.301211.t.10","is_playoffs":true,"is_championship":false},{"week":17,"team1":{"team_key":"406.l.301211.t.2","team_name":"98","points":155.0},"team2":{"team_key":"406.l.301211.t.3","team_name":"Doobie Bros","points":120.5},"winner_team_key":"406.l.301211.t.2","is_playoffs":true,"is_championship":true},{"week":17,"team1":{"team_key":"406.l.301211.t.7","team_name":"LVC","points":110.5},"team2":{"team_key":"406.l.301211.t.9","team_name":"Opolos","points":87.0},"winner_team_key":"406.l.301211.t.7","is_playoffs":true,"is_championship":false},{"week":17,"team1":{"team_key":"406.l.301211.t.12","team_name":"Lilst","points":206.5},"team2":{"team_key":"406.l.301211.t.6","team_name":"Johnny Fantasy","points":93.5},"winner_team_key":"406.l.301211.t.12","is_playoffs":true,"is_championship":false}],"season_high_score":{"points":206.5,"team":"Lilst","week":16},"season_low_score":{"points":45.0,"team":"The Greek","week":16}},{"season":2022,"league_key":"414.l.747744","league_name":"BKGFFL","num_teams":12,"playoff_start_week":15,"champion":{"team_key":"414.l.747744.t.10","team_name":"Team Beef","points":114.0},"runner_up":{"team_key":"414.l.747744.t.6","team_name":"Johnny Fantasy","points":105.0},"champ_score":114.0,"runner_score":105.0,"standings":[{"team_key":"414.l.747744.t.10","team_name":"Team Beef","managers":["Bird"],"rank":1,"wins":9,"losses":5,"ties":0,"points_for":1531.0,"points_against":1480.5},{"team_key":"414.l.747744.t.6","team_name":"Johnny Fantasy","managers":["Johnny Fantasy"],"rank":2,"wins":9,"losses":4,"ties":1,"points_for":1561.0,"points_against":1406.5},{"team_key":"414.l.747744.t.2","team_name":"98","managers":["Jonathan"],"rank":3,"wins":7,"losses":6,"ties":1,"points_for":1522.5,"points_against":1495.5},{"team_key":"414.l.747744.t.11","team_name":"The Greek","managers":["mark","David"],"rank":4,"wins":10,"losses":3,"ties":1,"points_for":1670.5,"points_against":1390.5},{"team_key":"414.l.747744.t.7","team_name":"LVC","managers":["LVC"],"rank":5,"wins":8,"losses":6,"ties":0,"points_for":1477.0,"points_against":1447.0},{"team_key":"414.l.747744.t.5","team_name":"Joco","managers":["JG JR"],"rank":6,"wins":9,"losses":5,"ties":0,"points_for":1599.0,"points_against":1352.0},{"team_key":"414.l.747744.t.3","team_name":"Doobie Bros","managers":["Ryan"],"rank":7,"wins":3,"losses":11,"ties":0,"points_for":1447.5,"points_against":1694.0},{"team_key":"414.l.747744.t.12","team_name":"Lilst","managers":["andrew"],"rank":8,"wins":4,"losses":10,"ties":0,"points_for":1262.5,"points_against":1556.0},{"team_key":"414.l.747744.t.8","team_name":"Tig\u2019s Trail Mix","managers":["terry"],"rank":9,"wins":6,"losses":7,"ties":1,"points_for":1303.0,"points_against":1357.5},{"team_key":"414.l.747744.t.1","team_name":"Zionsville Bubcons","managers":["bubcon"],"rank":10,"wins":6,"losses":8,"ties":0,"points_for":1428.5,"points_against":1556.0},{"team_key":"414.l.747744.t.4","team_name":"Fuz Nuts U","managers":["Fuzzy"],"rank":11,"wins":5,"losses":9,"ties":0,"points_for":1412.0,"points_against":1533.0},{"team_key":"414.l.747744.t.9","team_name":"Opolos","managers":["B-waite"],"rank":12,"wins":6,"losses":8,"ties":0,"points_for":1416.0,"points_against":1362.0}],"matchups":[{"week":1,"team1":{"team_key":"414.l.747744.t.1","team_name":"Zionsville Bubcons","points":118.0},"team2":{"team_key":"414.l.747744.t.4","team_name":"Fuz Nuts U","points":106.0},"winner_team_key":"414.l.747744.t.1","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"414.l.747744.t.2","team_name":"98","points":126.0},"team2":{"team_key":"414.l.747744.t.10","team_name":"Team Beef","points":86.0},"winner_team_key":"414.l.747744.t.2","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"414.l.747744.t.3","team_name":"Doobie Bros","points":84.0},"team2":{"team_key":"414.l.747744.t.6","team_name":"Johnny Fantasy","points":173.0},"winner_team_key":"414.l.747744.t.6","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"414.l.747744.t.5","team_name":"Joco","points":114.0},"team2":{"team_key":"414.l.747744.t.8","team_name":"Tig\u2019s Trail Mix","points":86.5},"winner_team_key":"414.l.747744.t.5","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"414.l.747744.t.7","team_name":"LVC","points":92.0},"team2":{"team_key":"414.l.747744.t.11","team_name":"The Greek","points":118.5},"winner_team_key":"414.l.747744.t.11","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"414.l.747744.t.9","team_name":"Opolos","points":88.5},"team2":{"team_key":"414.l.747744.t.12","team_name":"Lilst","points":69.5},"winner_team_key":"414.l.747744.t.9","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"414.l.747744.t.1","team_name":"Zionsville Bubcons","points":155.5},"team2":{"team_key":"414.l.747744.t.3","team_name":"Doobie Bros","points":108.0},"winner_team_key":"414.l.747744.t.1","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"414.l.747744.t.2","team_name":"98","points":121.0},"team2":{"team_key":"414.l.747744.t.7","team_name":"LVC","points":122.5},"winner_team_key":"414.l.747744.t.7","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"414.l.747744.t.4","team_name":"Fuz Nuts U","points":132.5},"team2":{"team_key":"414.l.747744.t.5","team_name":"Joco","points":135.0},"winner_team_key":"414.l.747744.t.5","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"414.l.747744.t.6","team_name":"Johnny Fantasy","points":68.5},"team2":{"team_key":"414.l.747744.t.12","team_name":"Lilst","points":146.0},"winner_team_key":"414.l.747744.t.12","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"414.l.747744.t.8","team_name":"Tig\u2019s Trail Mix","points":72.5},"team2":{"team_key":"414.l.747744.t.11","team_name":"The Greek","points":133.5},"winner_team_key":"414.l.747744.t.11","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"414.l.747744.t.9","team_name":"Opolos","points":88.0},"team2":{"team_key":"414.l.747744.t.10","team_name":"Team Beef","points":104.5},"winner_team_key":"414.l.747744.t.10","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"414.l.747744.t.1","team_name":"Zionsville Bubcons","points":69.5},"team2":{"team_key":"414.l.747744.t.6","team_name":"Johnny Fantasy","points":110.5},"winner_team_key":"414.l.747744.t.6","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"414.l.747744.t.2","team_name":"98","points":82.0},"team2":{"team_key":"414.l.747744.t.8","team_name":"Tig\u2019s Trail Mix","points":97.0},"winner_team_key":"414.l.747744.t.8","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"414.l.747744.t.3","team_name":"Doobie Bros","points":118.0},"team2":{"team_key":"414.l.747744.t.5","team_name":"Joco","points":102.0},"winner_team_key":"414.l.747744.t.3","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"414.l.747744.t.4","team_name":"Fuz Nuts U","points":140.5},"team2":{"team_key":"414.l.747744.t.11","team_name":"The Greek","points":59.5},"winner_team_key":"414.l.747744.t.4","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"414.l.747744.t.7","team_name":"LVC","points":60.5},"team2":{"team_key":"414.l.747744.t.9","team_name":"Opolos","points":114.5},"winner_team_key":"414.l.747744.t.9","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"414.l.747744.t.10","team_name":"Team Beef","points":109.5},"team2":{"team_key":"414.l.747744.t.12","team_name":"Lilst","points":103.5},"winner_team_key":"414.l.747744.t.10","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"414.l.747744.t.1","team_name":"Zionsville Bubcons","points":132.5},"team2":{"team_key":"414.l.747744.t.12","team_name":"Lilst","points":67.0},"winner_team_key":"414.l.747744.t.1","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"414.l.747744.t.2","team_name":"98","points":127.0},"team2":{"team_key":"414.l.747744.t.4","team_name":"Fuz Nuts U","points":99.5},"winner_team_key":"414.l.747744.t.2","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"414.l.747744.t.3","team_name":"Doobie Bros","points":109.5},"team2":{"team_key":"414.l.747744.t.11","team_name":"The Greek","points":125.0},"winner_team_key":"414.l.747744.t.11","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"414.l.747744.t.5","team_name":"Joco","points":146.0},"team2":{"team_key":"414.l.747744.t.6","team_name":"Johnny Fantasy","points":95.5},"winner_team_key":"414.l.747744.t.5","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"414.l.747744.t.7","team_name":"LVC","points":108.0},"team2":{"team_key":"414.l.747744.t.10","team_name":"Team Beef","points":112.0},"winner_team_key":"414.l.747744.t.10","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"414.l.747744.t.8","team_name":"Tig\u2019s Trail Mix","points":108.5},"team2":{"team_key":"414.l.747744.t.9","team_name":"Opolos","points":66.0},"winner_team_key":"414.l.747744.t.8","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"414.l.747744.t.1","team_name":"Zionsville Bubcons","points":114.5},"team2":{"team_key":"414.l.747744.t.5","team_name":"Joco","points":152.5},"winner_team_key":"414.l.747744.t.5","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"414.l.747744.t.2","team_name":"98","points":134.0},"team2":{"team_key":"414.l.747744.t.3","team_name":"Doobie Bros","points":108.0},"winner_team_key":"414.l.747744.t.2","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"414.l.747744.t.4","team_name":"Fuz Nuts U","points":50.0},"team2":{"team_key":"414.l.747744.t.9","team_name":"Opolos","points":138.5},"winner_team_key":"414.l.747744.t.9","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"414.l.747744.t.6","team_name":"Johnny Fantasy","points":96.5},"team2":{"team_key":"414.l.747744.t.11","team_name":"The Greek","points":102.0},"winner_team_key":"414.l.747744.t.11","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"414.l.747744.t.7","team_name":"LVC","points":145.0},"team2":{"team_key":"414.l.747744.t.12","team_name":"Lilst","points":96.5},"winner_team_key":"414.l.747744.t.7","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"414.l.747744.t.8","team_name":"Tig\u2019s Trail Mix","points":77.0},"team2":{"team_key":"414.l.747744.t.10","team_name":"Team Beef","points":101.5},"winner_team_key":"414.l.747744.t.10","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"414.l.747744.t.1","team_name":"Zionsville Bubcons","points":124.0},"team2":{"team_key":"414.l.747744.t.11","team_name":"The Greek","points":119.5},"winner_team_key":"414.l.747744.t.1","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"414.l.747744.t.2","team_name":"98","points":79.5},"team2":{"team_key":"414.l.747744.t.6","team_name":"Johnny Fantasy","points":109.0},"winner_team_key":"414.l.747744.t.6","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"414.l.747744.t.3","team_name":"Doobie Bros","points":95.5},"team2":{"team_key":"414.l.747744.t.9","team_name":"Opolos","points":84.5},"winner_team_key":"414.l.747744.t.3","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"414.l.747744.t.4","team_name":"Fuz Nuts U","points":85.0},"team2":{"team_key":"414.l.747744.t.10","team_name":"Team Beef","points":120.0},"winner_team_key":"414.l.747744.t.10","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"414.l.747744.t.5","team_name":"Joco","points":100.5},"team2":{"team_key":"414.l.747744.t.12","team_name":"Lilst","points":73.0},"winner_team_key":"414.l.747744.t.5","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"414.l.747744.t.7","team_name":"LVC","points":101.0},"team2":{"team_key":"414.l.747744.t.8","team_name":"Tig\u2019s Trail Mix","points":58.5},"winner_team_key":"414.l.747744.t.7","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"414.l.747744.t.1","team_name":"Zionsville Bubcons","points":91.0},"team2":{"team_key":"414.l.747744.t.2","team_name":"98","points":71.5},"winner_team_key":"414.l.747744.t.1","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"414.l.747744.t.3","team_name":"Doobie Bros","points":133.0},"team2":{"team_key":"414.l.747744.t.10","team_name":"Team Beef","points":142.0},"winner_team_key":"414.l.747744.t.10","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"414.l.747744.t.4","team_name":"Fuz Nuts U","points":93.5},"team2":{"team_key":"414.l.747744.t.7","team_name":"LVC","points":101.5},"winner_team_key":"414.l.747744.t.7","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"414.l.747744.t.5","team_name":"Joco","points":95.0},"team2":{"team_key":"414.l.747744.t.11","team_name":"The Greek","points":131.5},"winner_team_key":"414.l.747744.t.11","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"414.l.747744.t.6","team_name":"Johnny Fantasy","points":122.5},"team2":{"team_key":"414.l.747744.t.9","team_name":"Opolos","points":97.5},"winner_team_key":"414.l.747744.t.6","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"414.l.747744.t.8","team_name":"Tig\u2019s Trail Mix","points":122.0},"team2":{"team_key":"414.l.747744.t.12","team_name":"Lilst","points":57.5},"winner_team_key":"414.l.747744.t.8","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"414.l.747744.t.1","team_name":"Zionsville Bubcons","points":87.0},"team2":{"team_key":"414.l.747744.t.9","team_name":"Opolos","points":166.0},"winner_team_key":"414.l.747744.t.9","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"414.l.747744.t.2","team_name":"98","points":63.5},"team2":{"team_key":"414.l.747744.t.5","team_name":"Joco","points":141.5},"winner_team_key":"414.l.747744.t.5","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"414.l.747744.t.3","team_name":"Doobie Bros","points":107.5},"team2":{"team_key":"414.l.747744.t.7","team_name":"LVC","points":118.0},"winner_team_key":"414.l.747744.t.7","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"414.l.747744.t.4","team_name":"Fuz Nuts U","points":99.5},"team2":{"team_key":"414.l.747744.t.8","team_name":"Tig\u2019s Trail Mix","points":130.0},"winner_team_key":"414.l.747744.t.8","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"414.l.747744.t.6","team_name":"Johnny Fantasy","points":147.5},"team2":{"team_key":"414.l.747744.t.10","team_name":"Team Beef","points":122.5},"winner_team_key":"414.l.747744.t.6","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"414.l.747744.t.11","team_name":"The Greek","points":147.5},"team2":{"team_key":"414.l.747744.t.12","team_name":"Lilst","points":85.0},"winner_team_key":"414.l.747744.t.11","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"414.l.747744.t.1","team_name":"Zionsville Bubcons","points":103.5},"team2":{"team_key":"414.l.747744.t.10","team_name":"Team Beef","points":86.0},"winner_team_key":"414.l.747744.t.1","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"414.l.747744.t.2","team_name":"98","points":138.5},"team2":{"team_key":"414.l.747744.t.11","team_name":"The Greek","points":138.5},"winner_team_key":"","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"414.l.747744.t.3","team_name":"Doobie Bros","points":95.0},"team2":{"team_key":"414.l.747744.t.8","team_name":"Tig\u2019s Trail Mix","points":97.0},"winner_team_key":"414.l.747744.t.8","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"414.l.747744.t.4","team_name":"Fuz Nuts U","points":105.5},"team2":{"team_key":"414.l.747744.t.12","team_name":"Lilst","points":92.0},"winner_team_key":"414.l.747744.t.4","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"414.l.747744.t.5","team_name":"Joco","points":83.0},"team2":{"team_key":"414.l.747744.t.9","team_name":"Opolos","points":91.5},"winner_team_key":"414.l.747744.t.9","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"414.l.747744.t.6","team_name":"Johnny Fantasy","points":98.5},"team2":{"team_key":"414.l.747744.t.7","team_name":"LVC","points":97.5},"winner_team_key":"414.l.747744.t.6","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"414.l.747744.t.1","team_name":"Zionsville Bubcons","points":47.0},"team2":{"team_key":"414.l.747744.t.7","team_name":"LVC","points":121.5},"winner_team_key":"414.l.747744.t.7","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"414.l.747744.t.2","team_name":"98","points":104.0},"team2":{"team_key":"414.l.747744.t.12","team_name":"Lilst","points":81.5},"winner_team_key":"414.l.747744.t.2","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"414.l.747744.t.3","team_name":"Doobie Bros","points":89.0},"team2":{"team_key":"414.l.747744.t.4","team_name":"Fuz Nuts U","points":127.5},"winner_team_key":"414.l.747744.t.4","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"414.l.747744.t.5","team_name":"Joco","points":95.5},"team2":{"team_key":"414.l.747744.t.10","team_name":"Team Beef","points":96.5},"winner_team_key":"414.l.747744.t.10","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"414.l.747744.t.6","team_name":"Johnny Fantasy","points":103.0},"team2":{"team_key":"414.l.747744.t.8","team_name":"Tig\u2019s Trail Mix","points":103.0},"winner_team_key":"","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"414.l.747744.t.9","team_name":"Opolos","points":86.5},"team2":{"team_key":"414.l.747744.t.11","team_name":"The Greek","points":147.5},"winner_team_key":"414.l.747744.t.11","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"414.l.747744.t.1","team_name":"Zionsville Bubcons","points":97.0},"team2":{"team_key":"414.l.747744.t.8","team_name":"Tig\u2019s Trail Mix","points":100.5},"winner_team_key":"414.l.747744.t.8","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"414.l.747744.t.2","team_name":"98","points":111.5},"team2":{"team_key":"414.l.747744.t.9","team_name":"Opolos","points":97.5},"winner_team_key":"414.l.747744.t.2","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"414.l.747744.t.3","team_name":"Doobie Bros","points":115.5},"team2":{"team_key":"414.l.747744.t.12","team_name":"Lilst","points":121.5},"winner_team_key":"414.l.747744.t.12","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"414.l.747744.t.4","team_name":"Fuz Nuts U","points":76.5},"team2":{"team_key":"414.l.747744.t.6","team_name":"Johnny Fantasy","points":106.5},"winner_team_key":"414.l.747744.t.6","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"414.l.747744.t.5","team_name":"Joco","points":135.0},"team2":{"team_key":"414.l.747744.t.7","team_name":"LVC","points":67.5},"winner_team_key":"414.l.747744.t.5","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"414.l.747744.t.10","team_name":"Team Beef","points":90.0},"team2":{"team_key":"414.l.747744.t.11","team_name":"The Greek","points":122.0},"winner_team_key":"414.l.747744.t.11","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"414.l.747744.t.1","team_name":"Zionsville Bubcons","points":105.5},"team2":{"team_key":"414.l.747744.t.4","team_name":"Fuz Nuts U","points":127.5},"winner_team_key":"414.l.747744.t.4","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"414.l.747744.t.2","team_name":"98","points":113.5},"team2":{"team_key":"414.l.747744.t.10","team_name":"Team Beef","points":129.5},"winner_team_key":"414.l.747744.t.10","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"414.l.747744.t.3","team_name":"Doobie Bros","points":84.5},"team2":{"team_key":"414.l.747744.t.6","team_name":"Johnny Fantasy","points":117.0},"winner_team_key":"414.l.747744.t.6","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"414.l.747744.t.5","team_name":"Joco","points":102.0},"team2":{"team_key":"414.l.747744.t.8","team_name":"Tig\u2019s Trail Mix","points":97.5},"winner_team_key":"414.l.747744.t.5","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"414.l.747744.t.7","team_name":"LVC","points":104.0},"team2":{"team_key":"414.l.747744.t.11","team_name":"The Greek","points":96.5},"winner_team_key":"414.l.747744.t.7","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"414.l.747744.t.9","team_name":"Opolos","points":88.5},"team2":{"team_key":"414.l.747744.t.12","team_name":"Lilst","points":101.0},"winner_team_key":"414.l.747744.t.12","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"414.l.747744.t.1","team_name":"Zionsville Bubcons","points":88.5},"team2":{"team_key":"414.l.747744.t.3","team_name":"Doobie Bros","points":105.5},"winner_team_key":"414.l.747744.t.3","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"414.l.747744.t.2","team_name":"98","points":152.0},"team2":{"team_key":"414.l.747744.t.7","team_name":"LVC","points":118.5},"winner_team_key":"414.l.747744.t.2","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"414.l.747744.t.4","team_name":"Fuz Nuts U","points":89.5},"team2":{"team_key":"414.l.747744.t.5","team_name":"Joco","points":88.5},"winner_team_key":"414.l.747744.t.4","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"414.l.747744.t.6","team_name":"Johnny Fantasy","points":99.0},"team2":{"team_key":"414.l.747744.t.12","team_name":"Lilst","points":103.0},"winner_team_key":"414.l.747744.t.12","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"414.l.747744.t.8","team_name":"Tig\u2019s Trail Mix","points":77.5},"team2":{"team_key":"414.l.747744.t.11","team_name":"The Greek","points":107.0},"winner_team_key":"414.l.747744.t.11","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"414.l.747744.t.9","team_name":"Opolos","points":112.5},"team2":{"team_key":"414.l.747744.t.10","team_name":"Team Beef","points":101.5},"winner_team_key":"414.l.747744.t.9","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"414.l.747744.t.1","team_name":"Zionsville Bubcons","points":95.0},"team2":{"team_key":"414.l.747744.t.6","team_name":"Johnny Fantasy","points":114.0},"winner_team_key":"414.l.747744.t.6","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"414.l.747744.t.2","team_name":"98","points":98.5},"team2":{"team_key":"414.l.747744.t.8","team_name":"Tig\u2019s Trail Mix","points":75.5},"winner_team_key":"414.l.747744.t.2","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"414.l.747744.t.3","team_name":"Doobie Bros","points":94.5},"team2":{"team_key":"414.l.747744.t.5","team_name":"Joco","points":108.5},"winner_team_key":"414.l.747744.t.5","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"414.l.747744.t.4","team_name":"Fuz Nuts U","points":79.0},"team2":{"team_key":"414.l.747744.t.11","team_name":"The Greek","points":122.0},"winner_team_key":"414.l.747744.t.11","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"414.l.747744.t.7","team_name":"LVC","points":119.5},"team2":{"team_key":"414.l.747744.t.9","team_name":"Opolos","points":96.0},"winner_team_key":"414.l.747744.t.7","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"414.l.747744.t.10","team_name":"Team Beef","points":129.5},"team2":{"team_key":"414.l.747744.t.12","team_name":"Lilst","points":65.5},"winner_team_key":"414.l.747744.t.10","is_playoffs":false,"is_championship":false},{"week":15,"team1":{"team_key":"414.l.747744.t.2","team_name":"98","points":103.0},"team2":{"team_key":"414.l.747744.t.5","team_name":"Joco","points":100.5},"winner_team_key":"414.l.747744.t.2","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"414.l.747744.t.3","team_name":"Doobie Bros","points":128.5},"team2":{"team_key":"414.l.747744.t.9","team_name":"Opolos","points":104.0},"winner_team_key":"414.l.747744.t.3","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"414.l.747744.t.4","team_name":"Fuz Nuts U","points":116.0},"team2":{"team_key":"414.l.747744.t.12","team_name":"Lilst","points":137.0},"winner_team_key":"414.l.747744.t.12","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"414.l.747744.t.7","team_name":"LVC","points":99.5},"team2":{"team_key":"414.l.747744.t.10","team_name":"Team Beef","points":127.0},"winner_team_key":"414.l.747744.t.10","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"414.l.747744.t.1","team_name":"Zionsville Bubcons","points":80.0},"team2":{"team_key":"414.l.747744.t.3","team_name":"Doobie Bros","points":126.0},"winner_team_key":"414.l.747744.t.3","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"414.l.747744.t.2","team_name":"98","points":83.5},"team2":{"team_key":"414.l.747744.t.6","team_name":"Johnny Fantasy","points":98.0},"winner_team_key":"414.l.747744.t.6","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"414.l.747744.t.4","team_name":"Fuz Nuts U","points":128.0},"team2":{"team_key":"414.l.747744.t.9","team_name":"Opolos","points":111.5},"winner_team_key":"414.l.747744.t.4","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"414.l.747744.t.5","team_name":"Joco","points":99.0},"team2":{"team_key":"414.l.747744.t.7","team_name":"LVC","points":101.0},"winner_team_key":"414.l.747744.t.7","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"414.l.747744.t.8","team_name":"Tig\u2019s Trail Mix","points":75.0},"team2":{"team_key":"414.l.747744.t.12","team_name":"Lilst","points":95.0},"winner_team_key":"414.l.747744.t.12","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"414.l.747744.t.10","team_name":"Team Beef","points":119.5},"team2":{"team_key":"414.l.747744.t.11","team_name":"The Greek","points":95.0},"winner_team_key":"414.l.747744.t.10","is_playoffs":true,"is_championship":false},{"week":17,"team1":{"team_key":"414.l.747744.t.10","team_name":"Team Beef","points":114.0},"team2":{"team_key":"414.l.747744.t.6","team_name":"Johnny Fantasy","points":105.0},"winner_team_key":"414.l.747744.t.10","is_playoffs":true,"is_championship":true},{"week":17,"team1":{"team_key":"414.l.747744.t.11","team_name":"The Greek","points":69.5},"team2":{"team_key":"414.l.747744.t.2","team_name":"98","points":77.0},"winner_team_key":"414.l.747744.t.2","is_playoffs":true,"is_championship":false},{"week":17,"team1":{"team_key":"414.l.747744.t.7","team_name":"LVC","points":101.0},"team2":{"team_key":"414.l.747744.t.5","team_name":"Joco","points":99.0},"winner_team_key":"414.l.747744.t.7","is_playoffs":true,"is_championship":false}],"season_high_score":{"points":173.0,"team":"Johnny Fantasy","week":1},"season_low_score":{"points":47.0,"team":"Zionsville Bubcons","week":10}},{"season":2023,"league_key":"423.l.186776","league_name":"BKGFFL","num_teams":12,"playoff_start_week":15,"champion":{"team_key":"423.l.186776.t.1","team_name":"Ohio City Cons","points":153.0},"runner_up":{"team_key":"423.l.186776.t.8","team_name":"LVC","points":130.0},"champ_score":153.0,"runner_score":130.0,"standings":[{"team_key":"423.l.186776.t.1","team_name":"Ohio City Cons","managers":["bubcon"],"rank":1,"wins":9,"losses":5,"ties":0,"points_for":1542.5,"points_against":1445.0},{"team_key":"423.l.186776.t.8","team_name":"LVC","managers":["LVC"],"rank":2,"wins":9,"losses":5,"ties":0,"points_for":1574.0,"points_against":1416.5},{"team_key":"423.l.186776.t.9","team_name":"Opolos","managers":["B-waite"],"rank":3,"wins":7,"losses":7,"ties":0,"points_for":1565.5,"points_against":1425.5},{"team_key":"423.l.186776.t.4","team_name":"Fuz Nuts U","managers":["Fuzzy"],"rank":4,"wins":9,"losses":5,"ties":0,"points_for":1372.0,"points_against":1290.0},{"team_key":"423.l.186776.t.7","team_name":"Lilst","managers":["andrew"],"rank":5,"wins":7,"losses":7,"ties":0,"points_for":1517.5,"points_against":1521.0},{"team_key":"423.l.186776.t.10","team_name":"Team Beef","managers":["Bird"],"rank":6,"wins":7,"losses":7,"ties":0,"points_for":1517.0,"points_against":1579.0},{"team_key":"423.l.186776.t.6","team_name":"Johnny Fantasy","managers":["Johnny Fantasy"],"rank":7,"wins":6,"losses":8,"ties":0,"points_for":1360.0,"points_against":1443.5},{"team_key":"423.l.186776.t.3","team_name":"Doobie Bros","managers":["Ryan"],"rank":8,"wins":7,"losses":7,"ties":0,"points_for":1446.0,"points_against":1488.0},{"team_key":"423.l.186776.t.12","team_name":"Terry\u2019s Fantasy Team","managers":["terry"],"rank":9,"wins":6,"losses":8,"ties":0,"points_for":1474.5,"points_against":1410.5},{"team_key":"423.l.186776.t.2","team_name":"98","managers":["Jonathan"],"rank":10,"wins":7,"losses":7,"ties":0,"points_for":1498.5,"points_against":1515.5},{"team_key":"423.l.186776.t.11","team_name":"The Greek","managers":["mark","David"],"rank":11,"wins":5,"losses":9,"ties":0,"points_for":1276.5,"points_against":1450.0},{"team_key":"423.l.186776.t.5","team_name":"Joco","managers":["JG JR"],"rank":12,"wins":5,"losses":9,"ties":0,"points_for":1349.0,"points_against":1508.5}],"matchups":[{"week":1,"team1":{"team_key":"423.l.186776.t.1","team_name":"Ohio City Cons","points":81.0},"team2":{"team_key":"423.l.186776.t.5","team_name":"Joco","points":114.5},"winner_team_key":"423.l.186776.t.5","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"423.l.186776.t.2","team_name":"98","points":80.0},"team2":{"team_key":"423.l.186776.t.12","team_name":"Terry\u2019s Fantasy Team","points":79.0},"winner_team_key":"423.l.186776.t.2","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"423.l.186776.t.3","team_name":"Doobie Bros","points":63.0},"team2":{"team_key":"423.l.186776.t.8","team_name":"LVC","points":127.5},"winner_team_key":"423.l.186776.t.8","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"423.l.186776.t.4","team_name":"Fuz Nuts U","points":83.0},"team2":{"team_key":"423.l.186776.t.6","team_name":"Johnny Fantasy","points":58.0},"winner_team_key":"423.l.186776.t.4","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"423.l.186776.t.7","team_name":"Lilst","points":81.0},"team2":{"team_key":"423.l.186776.t.11","team_name":"The Greek","points":106.0},"winner_team_key":"423.l.186776.t.11","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"423.l.186776.t.9","team_name":"Opolos","points":137.5},"team2":{"team_key":"423.l.186776.t.10","team_name":"Team Beef","points":88.0},"winner_team_key":"423.l.186776.t.9","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"423.l.186776.t.1","team_name":"Ohio City Cons","points":114.0},"team2":{"team_key":"423.l.186776.t.9","team_name":"Opolos","points":76.0},"winner_team_key":"423.l.186776.t.1","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"423.l.186776.t.2","team_name":"98","points":98.5},"team2":{"team_key":"423.l.186776.t.3","team_name":"Doobie Bros","points":124.0},"winner_team_key":"423.l.186776.t.3","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"423.l.186776.t.4","team_name":"Fuz Nuts U","points":89.5},"team2":{"team_key":"423.l.186776.t.12","team_name":"Terry\u2019s Fantasy Team","points":85.5},"winner_team_key":"423.l.186776.t.4","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"423.l.186776.t.5","team_name":"Joco","points":124.0},"team2":{"team_key":"423.l.186776.t.6","team_name":"Johnny Fantasy","points":103.5},"winner_team_key":"423.l.186776.t.5","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"423.l.186776.t.7","team_name":"Lilst","points":95.5},"team2":{"team_key":"423.l.186776.t.8","team_name":"LVC","points":99.0},"winner_team_key":"423.l.186776.t.8","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"423.l.186776.t.10","team_name":"Team Beef","points":149.5},"team2":{"team_key":"423.l.186776.t.11","team_name":"The Greek","points":83.0},"winner_team_key":"423.l.186776.t.10","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"423.l.186776.t.1","team_name":"Ohio City Cons","points":114.0},"team2":{"team_key":"423.l.186776.t.11","team_name":"The Greek","points":82.5},"winner_team_key":"423.l.186776.t.1","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"423.l.186776.t.2","team_name":"98","points":96.5},"team2":{"team_key":"423.l.186776.t.8","team_name":"LVC","points":113.0},"winner_team_key":"423.l.186776.t.8","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"423.l.186776.t.3","team_name":"Doobie Bros","points":85.5},"team2":{"team_key":"423.l.186776.t.4","team_name":"Fuz Nuts U","points":112.0},"winner_team_key":"423.l.186776.t.4","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"423.l.186776.t.5","team_name":"Joco","points":89.5},"team2":{"team_key":"423.l.186776.t.12","team_name":"Terry\u2019s Fantasy Team","points":120.0},"winner_team_key":"423.l.186776.t.12","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"423.l.186776.t.6","team_name":"Johnny Fantasy","points":81.5},"team2":{"team_key":"423.l.186776.t.9","team_name":"Opolos","points":163.0},"winner_team_key":"423.l.186776.t.9","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"423.l.186776.t.7","team_name":"Lilst","points":177.0},"team2":{"team_key":"423.l.186776.t.10","team_name":"Team Beef","points":126.0},"winner_team_key":"423.l.186776.t.7","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"423.l.186776.t.1","team_name":"Ohio City Cons","points":135.0},"team2":{"team_key":"423.l.186776.t.10","team_name":"Team Beef","points":109.0},"winner_team_key":"423.l.186776.t.1","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"423.l.186776.t.2","team_name":"98","points":104.0},"team2":{"team_key":"423.l.186776.t.7","team_name":"Lilst","points":85.5},"winner_team_key":"423.l.186776.t.2","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"423.l.186776.t.3","team_name":"Doobie Bros","points":120.5},"team2":{"team_key":"423.l.186776.t.5","team_name":"Joco","points":71.5},"winner_team_key":"423.l.186776.t.3","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"423.l.186776.t.4","team_name":"Fuz Nuts U","points":90.0},"team2":{"team_key":"423.l.186776.t.8","team_name":"LVC","points":56.0},"winner_team_key":"423.l.186776.t.4","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"423.l.186776.t.6","team_name":"Johnny Fantasy","points":119.0},"team2":{"team_key":"423.l.186776.t.11","team_name":"The Greek","points":84.0},"winner_team_key":"423.l.186776.t.6","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"423.l.186776.t.9","team_name":"Opolos","points":98.5},"team2":{"team_key":"423.l.186776.t.12","team_name":"Terry\u2019s Fantasy Team","points":159.5},"winner_team_key":"423.l.186776.t.12","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"423.l.186776.t.1","team_name":"Ohio City Cons","points":144.0},"team2":{"team_key":"423.l.186776.t.7","team_name":"Lilst","points":87.0},"winner_team_key":"423.l.186776.t.1","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"423.l.186776.t.2","team_name":"98","points":103.5},"team2":{"team_key":"423.l.186776.t.4","team_name":"Fuz Nuts U","points":125.0},"winner_team_key":"423.l.186776.t.4","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"423.l.186776.t.3","team_name":"Doobie Bros","points":78.5},"team2":{"team_key":"423.l.186776.t.9","team_name":"Opolos","points":123.0},"winner_team_key":"423.l.186776.t.9","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"423.l.186776.t.5","team_name":"Joco","points":113.5},"team2":{"team_key":"423.l.186776.t.8","team_name":"LVC","points":159.0},"winner_team_key":"423.l.186776.t.8","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"423.l.186776.t.6","team_name":"Johnny Fantasy","points":110.5},"team2":{"team_key":"423.l.186776.t.10","team_name":"Team Beef","points":111.5},"winner_team_key":"423.l.186776.t.10","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"423.l.186776.t.11","team_name":"The Greek","points":86.5},"team2":{"team_key":"423.l.186776.t.12","team_name":"Terry\u2019s Fantasy Team","points":66.0},"winner_team_key":"423.l.186776.t.11","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"423.l.186776.t.1","team_name":"Ohio City Cons","points":88.5},"team2":{"team_key":"423.l.186776.t.6","team_name":"Johnny Fantasy","points":70.5},"winner_team_key":"423.l.186776.t.1","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"423.l.186776.t.2","team_name":"98","points":94.5},"team2":{"team_key":"423.l.186776.t.5","team_name":"Joco","points":113.0},"winner_team_key":"423.l.186776.t.5","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"423.l.186776.t.3","team_name":"Doobie Bros","points":75.5},"team2":{"team_key":"423.l.186776.t.11","team_name":"The Greek","points":94.5},"winner_team_key":"423.l.186776.t.11","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"423.l.186776.t.4","team_name":"Fuz Nuts U","points":77.0},"team2":{"team_key":"423.l.186776.t.7","team_name":"Lilst","points":93.0},"winner_team_key":"423.l.186776.t.7","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"423.l.186776.t.8","team_name":"LVC","points":137.5},"team2":{"team_key":"423.l.186776.t.9","team_name":"Opolos","points":123.5},"winner_team_key":"423.l.186776.t.8","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"423.l.186776.t.10","team_name":"Team Beef","points":94.5},"team2":{"team_key":"423.l.186776.t.12","team_name":"Terry\u2019s Fantasy Team","points":111.5},"winner_team_key":"423.l.186776.t.12","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"423.l.186776.t.1","team_name":"Ohio City Cons","points":110.5},"team2":{"team_key":"423.l.186776.t.12","team_name":"Terry\u2019s Fantasy Team","points":117.5},"winner_team_key":"423.l.186776.t.12","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"423.l.186776.t.2","team_name":"98","points":83.0},"team2":{"team_key":"423.l.186776.t.9","team_name":"Opolos","points":117.5},"winner_team_key":"423.l.186776.t.9","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"423.l.186776.t.3","team_name":"Doobie Bros","points":87.5},"team2":{"team_key":"423.l.186776.t.10","team_name":"Team Beef","points":108.0},"winner_team_key":"423.l.186776.t.10","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"423.l.186776.t.4","team_name":"Fuz Nuts U","points":69.5},"team2":{"team_key":"423.l.186776.t.5","team_name":"Joco","points":126.0},"winner_team_key":"423.l.186776.t.5","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"423.l.186776.t.6","team_name":"Johnny Fantasy","points":118.5},"team2":{"team_key":"423.l.186776.t.7","team_name":"Lilst","points":81.5},"winner_team_key":"423.l.186776.t.6","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"423.l.186776.t.8","team_name":"LVC","points":112.5},"team2":{"team_key":"423.l.186776.t.11","team_name":"The Greek","points":70.0},"winner_team_key":"423.l.186776.t.8","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"423.l.186776.t.1","team_name":"Ohio City Cons","points":97.5},"team2":{"team_key":"423.l.186776.t.3","team_name":"Doobie Bros","points":148.0},"winner_team_key":"423.l.186776.t.3","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"423.l.186776.t.2","team_name":"98","points":111.0},"team2":{"team_key":"423.l.186776.t.11","team_name":"The Greek","points":103.0},"winner_team_key":"423.l.186776.t.2","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"423.l.186776.t.4","team_name":"Fuz Nuts U","points":129.5},"team2":{"team_key":"423.l.186776.t.9","team_name":"Opolos","points":119.0},"winner_team_key":"423.l.186776.t.4","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"423.l.186776.t.5","team_name":"Joco","points":104.0},"team2":{"team_key":"423.l.186776.t.7","team_name":"Lilst","points":109.0},"winner_team_key":"423.l.186776.t.7","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"423.l.186776.t.6","team_name":"Johnny Fantasy","points":86.0},"team2":{"team_key":"423.l.186776.t.12","team_name":"Terry\u2019s Fantasy Team","points":129.5},"winner_team_key":"423.l.186776.t.12","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"423.l.186776.t.8","team_name":"LVC","points":121.5},"team2":{"team_key":"423.l.186776.t.10","team_name":"Team Beef","points":132.5},"winner_team_key":"423.l.186776.t.10","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"423.l.186776.t.1","team_name":"Ohio City Cons","points":99.0},"team2":{"team_key":"423.l.186776.t.8","team_name":"LVC","points":89.5},"winner_team_key":"423.l.186776.t.1","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"423.l.186776.t.2","team_name":"98","points":127.0},"team2":{"team_key":"423.l.186776.t.10","team_name":"Team Beef","points":97.0},"winner_team_key":"423.l.186776.t.2","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"423.l.186776.t.3","team_name":"Doobie Bros","points":96.0},"team2":{"team_key":"423.l.186776.t.6","team_name":"Johnny Fantasy","points":120.5},"winner_team_key":"423.l.186776.t.6","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"423.l.186776.t.4","team_name":"Fuz Nuts U","points":91.0},"team2":{"team_key":"423.l.186776.t.11","team_name":"The Greek","points":92.0},"winner_team_key":"423.l.186776.t.11","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"423.l.186776.t.5","team_name":"Joco","points":64.5},"team2":{"team_key":"423.l.186776.t.9","team_name":"Opolos","points":60.5},"winner_team_key":"423.l.186776.t.5","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"423.l.186776.t.7","team_name":"Lilst","points":114.5},"team2":{"team_key":"423.l.186776.t.12","team_name":"Terry\u2019s Fantasy Team","points":71.5},"winner_team_key":"423.l.186776.t.7","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"423.l.186776.t.1","team_name":"Ohio City Cons","points":115.5},"team2":{"team_key":"423.l.186776.t.2","team_name":"98","points":127.0},"winner_team_key":"423.l.186776.t.2","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"423.l.186776.t.3","team_name":"Doobie Bros","points":108.0},"team2":{"team_key":"423.l.186776.t.12","team_name":"Terry\u2019s Fantasy Team","points":93.5},"winner_team_key":"423.l.186776.t.3","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"423.l.186776.t.4","team_name":"Fuz Nuts U","points":103.5},"team2":{"team_key":"423.l.186776.t.10","team_name":"Team Beef","points":83.5},"winner_team_key":"423.l.186776.t.4","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"423.l.186776.t.5","team_name":"Joco","points":80.5},"team2":{"team_key":"423.l.186776.t.11","team_name":"The Greek","points":100.5},"winner_team_key":"423.l.186776.t.11","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"423.l.186776.t.6","team_name":"Johnny Fantasy","points":101.0},"team2":{"team_key":"423.l.186776.t.8","team_name":"LVC","points":124.0},"winner_team_key":"423.l.186776.t.8","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"423.l.186776.t.7","team_name":"Lilst","points":131.5},"team2":{"team_key":"423.l.186776.t.9","team_name":"Opolos","points":125.0},"winner_team_key":"423.l.186776.t.7","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"423.l.186776.t.1","team_name":"Ohio City Cons","points":99.0},"team2":{"team_key":"423.l.186776.t.4","team_name":"Fuz Nuts U","points":89.5},"winner_team_key":"423.l.186776.t.1","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"423.l.186776.t.2","team_name":"98","points":92.5},"team2":{"team_key":"423.l.186776.t.6","team_name":"Johnny Fantasy","points":98.5},"winner_team_key":"423.l.186776.t.6","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"423.l.186776.t.3","team_name":"Doobie Bros","points":103.5},"team2":{"team_key":"423.l.186776.t.7","team_name":"Lilst","points":140.0},"winner_team_key":"423.l.186776.t.7","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"423.l.186776.t.5","team_name":"Joco","points":83.0},"team2":{"team_key":"423.l.186776.t.10","team_name":"Team Beef","points":108.5},"winner_team_key":"423.l.186776.t.10","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"423.l.186776.t.8","team_name":"LVC","points":100.5},"team2":{"team_key":"423.l.186776.t.12","team_name":"Terry\u2019s Fantasy Team","points":88.0},"winner_team_key":"423.l.186776.t.8","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"423.l.186776.t.9","team_name":"Opolos","points":94.0},"team2":{"team_key":"423.l.186776.t.11","team_name":"The Greek","points":89.5},"winner_team_key":"423.l.186776.t.9","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"423.l.186776.t.1","team_name":"Ohio City Cons","points":130.5},"team2":{"team_key":"423.l.186776.t.5","team_name":"Joco","points":98.0},"winner_team_key":"423.l.186776.t.1","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"423.l.186776.t.2","team_name":"98","points":144.5},"team2":{"team_key":"423.l.186776.t.12","team_name":"Terry\u2019s Fantasy Team","points":106.5},"winner_team_key":"423.l.186776.t.2","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"423.l.186776.t.3","team_name":"Doobie Bros","points":124.0},"team2":{"team_key":"423.l.186776.t.8","team_name":"LVC","points":110.5},"winner_team_key":"423.l.186776.t.3","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"423.l.186776.t.4","team_name":"Fuz Nuts U","points":112.0},"team2":{"team_key":"423.l.186776.t.6","team_name":"Johnny Fantasy","points":85.5},"winner_team_key":"423.l.186776.t.4","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"423.l.186776.t.7","team_name":"Lilst","points":124.5},"team2":{"team_key":"423.l.186776.t.11","team_name":"The Greek","points":103.5},"winner_team_key":"423.l.186776.t.7","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"423.l.186776.t.9","team_name":"Opolos","points":105.5},"team2":{"team_key":"423.l.186776.t.10","team_name":"Team Beef","points":87.0},"winner_team_key":"423.l.186776.t.9","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"423.l.186776.t.1","team_name":"Ohio City Cons","points":89.5},"team2":{"team_key":"423.l.186776.t.9","team_name":"Opolos","points":154.5},"winner_team_key":"423.l.186776.t.9","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"423.l.186776.t.2","team_name":"98","points":117.5},"team2":{"team_key":"423.l.186776.t.3","team_name":"Doobie Bros","points":138.5},"winner_team_key":"423.l.186776.t.3","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"423.l.186776.t.4","team_name":"Fuz Nuts U","points":127.0},"team2":{"team_key":"423.l.186776.t.12","team_name":"Terry\u2019s Fantasy Team","points":110.0},"winner_team_key":"423.l.186776.t.4","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"423.l.186776.t.5","team_name":"Joco","points":86.0},"team2":{"team_key":"423.l.186776.t.6","team_name":"Johnny Fantasy","points":115.0},"winner_team_key":"423.l.186776.t.6","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"423.l.186776.t.7","team_name":"Lilst","points":101.0},"team2":{"team_key":"423.l.186776.t.8","team_name":"LVC","points":124.0},"winner_team_key":"423.l.186776.t.8","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"423.l.186776.t.10","team_name":"Team Beef","points":107.0},"team2":{"team_key":"423.l.186776.t.11","team_name":"The Greek","points":100.0},"winner_team_key":"423.l.186776.t.10","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"423.l.186776.t.1","team_name":"Ohio City Cons","points":124.5},"team2":{"team_key":"423.l.186776.t.11","team_name":"The Greek","points":81.5},"winner_team_key":"423.l.186776.t.1","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"423.l.186776.t.2","team_name":"98","points":119.0},"team2":{"team_key":"423.l.186776.t.8","team_name":"LVC","points":99.5},"winner_team_key":"423.l.186776.t.2","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"423.l.186776.t.3","team_name":"Doobie Bros","points":93.5},"team2":{"team_key":"423.l.186776.t.4","team_name":"Fuz Nuts U","points":73.5},"winner_team_key":"423.l.186776.t.3","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"423.l.186776.t.5","team_name":"Joco","points":81.0},"team2":{"team_key":"423.l.186776.t.12","team_name":"Terry\u2019s Fantasy Team","points":136.5},"winner_team_key":"423.l.186776.t.12","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"423.l.186776.t.6","team_name":"Johnny Fantasy","points":92.0},"team2":{"team_key":"423.l.186776.t.9","team_name":"Opolos","points":68.0},"winner_team_key":"423.l.186776.t.6","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"423.l.186776.t.7","team_name":"Lilst","points":96.5},"team2":{"team_key":"423.l.186776.t.10","team_name":"Team Beef","points":115.0},"winner_team_key":"423.l.186776.t.10","is_playoffs":false,"is_championship":false},{"week":15,"team1":{"team_key":"423.l.186776.t.4","team_name":"Fuz Nuts U","points":120.5},"team2":{"team_key":"423.l.186776.t.10","team_name":"Team Beef","points":78.5},"winner_team_key":"423.l.186776.t.4","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"423.l.186776.t.5","team_name":"Joco","points":79.0},"team2":{"team_key":"423.l.186776.t.6","team_name":"Johnny Fantasy","points":102.5},"winner_team_key":"423.l.186776.t.6","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"423.l.186776.t.7","team_name":"Lilst","points":100.0},"team2":{"team_key":"423.l.186776.t.9","team_name":"Opolos","points":139.5},"winner_team_key":"423.l.186776.t.9","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"423.l.186776.t.11","team_name":"The Greek","points":68.0},"team2":{"team_key":"423.l.186776.t.12","team_name":"Terry\u2019s Fantasy Team","points":90.5},"winner_team_key":"423.l.186776.t.12","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"423.l.186776.t.1","team_name":"Ohio City Cons","points":103.5},"team2":{"team_key":"423.l.186776.t.4","team_name":"Fuz Nuts U","points":91.0},"winner_team_key":"423.l.186776.t.1","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"423.l.186776.t.2","team_name":"98","points":81.0},"team2":{"team_key":"423.l.186776.t.6","team_name":"Johnny Fantasy","points":97.5},"winner_team_key":"423.l.186776.t.6","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"423.l.186776.t.3","team_name":"Doobie Bros","points":152.0},"team2":{"team_key":"423.l.186776.t.12","team_name":"Terry\u2019s Fantasy Team","points":123.5},"winner_team_key":"423.l.186776.t.3","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"423.l.186776.t.5","team_name":"Joco","points":87.0},"team2":{"team_key":"423.l.186776.t.11","team_name":"The Greek","points":105.0},"winner_team_key":"423.l.186776.t.11","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"423.l.186776.t.7","team_name":"Lilst","points":106.0},"team2":{"team_key":"423.l.186776.t.10","team_name":"Team Beef","points":92.0},"winner_team_key":"423.l.186776.t.7","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"423.l.186776.t.8","team_name":"LVC","points":126.0},"team2":{"team_key":"423.l.186776.t.9","team_name":"Opolos","points":104.5},"winner_team_key":"423.l.186776.t.8","is_playoffs":true,"is_championship":false},{"week":17,"team1":{"team_key":"423.l.186776.t.1","team_name":"Ohio City Cons","points":153.0},"team2":{"team_key":"423.l.186776.t.8","team_name":"LVC","points":130.0},"winner_team_key":"423.l.186776.t.1","is_playoffs":true,"is_championship":true},{"week":17,"team1":{"team_key":"423.l.186776.t.9","team_name":"Opolos","points":120.0},"team2":{"team_key":"423.l.186776.t.4","team_name":"Fuz Nuts U","points":112.5},"winner_team_key":"423.l.186776.t.9","is_playoffs":true,"is_championship":false},{"week":17,"team1":{"team_key":"423.l.186776.t.7","team_name":"Lilst","points":106.0},"team2":{"team_key":"423.l.186776.t.10","team_name":"Team Beef","points":92.0},"winner_team_key":"423.l.186776.t.7","is_playoffs":true,"is_championship":false}],"season_high_score":{"points":177.0,"team":"Lilst","week":3},"season_low_score":{"points":56.0,"team":"LVC","week":4}},{"season":2024,"league_key":"449.l.93173","league_name":"BKGFFL","num_teams":12,"playoff_start_week":15,"champion":{"team_key":"449.l.93173.t.11","team_name":"LVC","points":128.0},"runner_up":{"team_key":"449.l.93173.t.9","team_name":"The Greek","points":124.5},"champ_score":128.0,"runner_score":124.5,"standings":[{"team_key":"449.l.93173.t.11","team_name":"LVC","managers":["LVC"],"rank":1,"wins":8,"losses":6,"ties":0,"points_for":1615.5,"points_against":1655.5},{"team_key":"449.l.93173.t.9","team_name":"The Greek","managers":["mark"],"rank":2,"wins":8,"losses":6,"ties":0,"points_for":1463.5,"points_against":1374.0},{"team_key":"449.l.93173.t.7","team_name":"Opolos","managers":["B-waite"],"rank":3,"wins":12,"losses":2,"ties":0,"points_for":1542.0,"points_against":1284.0},{"team_key":"449.l.93173.t.5","team_name":"Make Joco Great Again (MJGA)","managers":["JG JR"],"rank":4,"wins":7,"losses":7,"ties":0,"points_for":1671.0,"points_against":1514.0},{"team_key":"449.l.93173.t.8","team_name":"Team Beef","managers":["Bird"],"rank":5,"wins":8,"losses":6,"ties":0,"points_for":1556.0,"points_against":1494.0},{"team_key":"449.l.93173.t.12","team_name":"Lilst","managers":["andrew"],"rank":6,"wins":8,"losses":6,"ties":0,"points_for":1519.0,"points_against":1416.0},{"team_key":"449.l.93173.t.1","team_name":"Ohio City Cons","managers":["bubcon"],"rank":7,"wins":6,"losses":8,"ties":0,"points_for":1424.0,"points_against":1472.0},{"team_key":"449.l.93173.t.10","team_name":"Terry\u2019s Big Fantasy Team 2024","managers":["terry"],"rank":8,"wins":4,"losses":10,"ties":0,"points_for":1425.0,"points_against":1528.0},{"team_key":"449.l.93173.t.2","team_name":"98","managers":["Jonathan"],"rank":9,"wins":6,"losses":8,"ties":0,"points_for":1403.0,"points_against":1490.0},{"team_key":"449.l.93173.t.4","team_name":"Fuz Nuts U","managers":["Fuzzy"],"rank":10,"wins":7,"losses":7,"ties":0,"points_for":1453.5,"points_against":1455.0},{"team_key":"449.l.93173.t.3","team_name":"Doobie Bros","managers":["Ryan"],"rank":11,"wins":6,"losses":8,"ties":0,"points_for":1342.0,"points_against":1542.5},{"team_key":"449.l.93173.t.6","team_name":"Johnny Fantasy","managers":["Johnny Fantasy"],"rank":12,"wins":4,"losses":10,"ties":0,"points_for":1375.5,"points_against":1565.0}],"matchups":[{"week":1,"team1":{"team_key":"449.l.93173.t.1","team_name":"Ohio City Cons","points":123.5},"team2":{"team_key":"449.l.93173.t.5","team_name":"Make Joco Great Again (MJGA)","points":109.5},"winner_team_key":"449.l.93173.t.1","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"449.l.93173.t.2","team_name":"98","points":98.0},"team2":{"team_key":"449.l.93173.t.11","team_name":"LVC","points":65.5},"winner_team_key":"449.l.93173.t.2","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"449.l.93173.t.3","team_name":"Doobie Bros","points":120.0},"team2":{"team_key":"449.l.93173.t.6","team_name":"Johnny Fantasy","points":111.0},"winner_team_key":"449.l.93173.t.3","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"449.l.93173.t.4","team_name":"Fuz Nuts U","points":98.0},"team2":{"team_key":"449.l.93173.t.12","team_name":"Lilst","points":75.5},"winner_team_key":"449.l.93173.t.4","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"449.l.93173.t.7","team_name":"Opolos","points":92.5},"team2":{"team_key":"449.l.93173.t.8","team_name":"Team Beef","points":86.5},"winner_team_key":"449.l.93173.t.7","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"449.l.93173.t.9","team_name":"The Greek","points":103.5},"team2":{"team_key":"449.l.93173.t.10","team_name":"Terry\u2019s Big Fantasy Team 2024","points":114.5},"winner_team_key":"449.l.93173.t.10","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"449.l.93173.t.1","team_name":"Ohio City Cons","points":87.5},"team2":{"team_key":"449.l.93173.t.7","team_name":"Opolos","points":103.0},"winner_team_key":"449.l.93173.t.7","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"449.l.93173.t.2","team_name":"98","points":68.5},"team2":{"team_key":"449.l.93173.t.5","team_name":"Make Joco Great Again (MJGA)","points":104.0},"winner_team_key":"449.l.93173.t.5","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"449.l.93173.t.3","team_name":"Doobie Bros","points":114.5},"team2":{"team_key":"449.l.93173.t.9","team_name":"The Greek","points":78.0},"winner_team_key":"449.l.93173.t.3","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"449.l.93173.t.4","team_name":"Fuz Nuts U","points":117.0},"team2":{"team_key":"449.l.93173.t.6","team_name":"Johnny Fantasy","points":91.0},"winner_team_key":"449.l.93173.t.4","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"449.l.93173.t.8","team_name":"Team Beef","points":109.0},"team2":{"team_key":"449.l.93173.t.12","team_name":"Lilst","points":85.5},"winner_team_key":"449.l.93173.t.8","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"449.l.93173.t.10","team_name":"Terry\u2019s Big Fantasy Team 2024","points":139.5},"team2":{"team_key":"449.l.93173.t.11","team_name":"LVC","points":120.5},"winner_team_key":"449.l.93173.t.10","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"449.l.93173.t.1","team_name":"Ohio City Cons","points":87.5},"team2":{"team_key":"449.l.93173.t.12","team_name":"Lilst","points":94.5},"winner_team_key":"449.l.93173.t.12","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"449.l.93173.t.2","team_name":"98","points":92.5},"team2":{"team_key":"449.l.93173.t.7","team_name":"Opolos","points":122.5},"winner_team_key":"449.l.93173.t.7","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"449.l.93173.t.3","team_name":"Doobie Bros","points":101.5},"team2":{"team_key":"449.l.93173.t.10","team_name":"Terry\u2019s Big Fantasy Team 2024","points":89.5},"winner_team_key":"449.l.93173.t.3","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"449.l.93173.t.4","team_name":"Fuz Nuts U","points":77.0},"team2":{"team_key":"449.l.93173.t.9","team_name":"The Greek","points":116.0},"winner_team_key":"449.l.93173.t.9","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"449.l.93173.t.5","team_name":"Make Joco Great Again (MJGA)","points":132.0},"team2":{"team_key":"449.l.93173.t.11","team_name":"LVC","points":137.0},"winner_team_key":"449.l.93173.t.11","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"449.l.93173.t.6","team_name":"Johnny Fantasy","points":83.5},"team2":{"team_key":"449.l.93173.t.8","team_name":"Team Beef","points":153.5},"winner_team_key":"449.l.93173.t.8","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"449.l.93173.t.1","team_name":"Ohio City Cons","points":97.0},"team2":{"team_key":"449.l.93173.t.6","team_name":"Johnny Fantasy","points":121.0},"winner_team_key":"449.l.93173.t.6","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"449.l.93173.t.2","team_name":"98","points":90.5},"team2":{"team_key":"449.l.93173.t.12","team_name":"Lilst","points":150.5},"winner_team_key":"449.l.93173.t.12","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"449.l.93173.t.3","team_name":"Doobie Bros","points":80.5},"team2":{"team_key":"449.l.93173.t.4","team_name":"Fuz Nuts U","points":96.5},"winner_team_key":"449.l.93173.t.4","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"449.l.93173.t.5","team_name":"Make Joco Great Again (MJGA)","points":98.0},"team2":{"team_key":"449.l.93173.t.10","team_name":"Terry\u2019s Big Fantasy Team 2024","points":55.0},"winner_team_key":"449.l.93173.t.5","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"449.l.93173.t.7","team_name":"Opolos","points":117.5},"team2":{"team_key":"449.l.93173.t.11","team_name":"LVC","points":98.0},"winner_team_key":"449.l.93173.t.7","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"449.l.93173.t.8","team_name":"Team Beef","points":131.5},"team2":{"team_key":"449.l.93173.t.9","team_name":"The Greek","points":95.0},"winner_team_key":"449.l.93173.t.8","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"449.l.93173.t.1","team_name":"Ohio City Cons","points":109.5},"team2":{"team_key":"449.l.93173.t.9","team_name":"The Greek","points":79.5},"winner_team_key":"449.l.93173.t.1","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"449.l.93173.t.2","team_name":"98","points":94.5},"team2":{"team_key":"449.l.93173.t.6","team_name":"Johnny Fantasy","points":118.5},"winner_team_key":"449.l.93173.t.6","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"449.l.93173.t.3","team_name":"Doobie Bros","points":78.5},"team2":{"team_key":"449.l.93173.t.8","team_name":"Team Beef","points":116.0},"winner_team_key":"449.l.93173.t.8","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"449.l.93173.t.4","team_name":"Fuz Nuts U","points":109.0},"team2":{"team_key":"449.l.93173.t.10","team_name":"Terry\u2019s Big Fantasy Team 2024","points":108.5},"winner_team_key":"449.l.93173.t.4","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"449.l.93173.t.5","team_name":"Make Joco Great Again (MJGA)","points":91.5},"team2":{"team_key":"449.l.93173.t.7","team_name":"Opolos","points":132.0},"winner_team_key":"449.l.93173.t.7","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"449.l.93173.t.11","team_name":"LVC","points":137.5},"team2":{"team_key":"449.l.93173.t.12","team_name":"Lilst","points":131.0},"winner_team_key":"449.l.93173.t.11","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"449.l.93173.t.1","team_name":"Ohio City Cons","points":131.0},"team2":{"team_key":"449.l.93173.t.3","team_name":"Doobie Bros","points":109.5},"winner_team_key":"449.l.93173.t.1","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"449.l.93173.t.2","team_name":"98","points":101.0},"team2":{"team_key":"449.l.93173.t.9","team_name":"The Greek","points":74.0},"winner_team_key":"449.l.93173.t.2","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"449.l.93173.t.4","team_name":"Fuz Nuts U","points":104.0},"team2":{"team_key":"449.l.93173.t.8","team_name":"Team Beef","points":93.5},"winner_team_key":"449.l.93173.t.4","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"449.l.93173.t.5","team_name":"Make Joco Great Again (MJGA)","points":115.0},"team2":{"team_key":"449.l.93173.t.12","team_name":"Lilst","points":120.0},"winner_team_key":"449.l.93173.t.12","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"449.l.93173.t.6","team_name":"Johnny Fantasy","points":95.0},"team2":{"team_key":"449.l.93173.t.11","team_name":"LVC","points":114.0},"winner_team_key":"449.l.93173.t.11","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"449.l.93173.t.7","team_name":"Opolos","points":119.0},"team2":{"team_key":"449.l.93173.t.10","team_name":"Terry\u2019s Big Fantasy Team 2024","points":89.5},"winner_team_key":"449.l.93173.t.7","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"449.l.93173.t.1","team_name":"Ohio City Cons","points":107.5},"team2":{"team_key":"449.l.93173.t.4","team_name":"Fuz Nuts U","points":81.0},"winner_team_key":"449.l.93173.t.1","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"449.l.93173.t.2","team_name":"98","points":95.5},"team2":{"team_key":"449.l.93173.t.3","team_name":"Doobie Bros","points":61.5},"winner_team_key":"449.l.93173.t.2","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"449.l.93173.t.5","team_name":"Make Joco Great Again (MJGA)","points":89.5},"team2":{"team_key":"449.l.93173.t.6","team_name":"Johnny Fantasy","points":91.5},"winner_team_key":"449.l.93173.t.6","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"449.l.93173.t.7","team_name":"Opolos","points":81.5},"team2":{"team_key":"449.l.93173.t.12","team_name":"Lilst","points":126.0},"winner_team_key":"449.l.93173.t.12","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"449.l.93173.t.8","team_name":"Team Beef","points":123.5},"team2":{"team_key":"449.l.93173.t.10","team_name":"Terry\u2019s Big Fantasy Team 2024","points":113.0},"winner_team_key":"449.l.93173.t.8","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"449.l.93173.t.9","team_name":"The Greek","points":133.5},"team2":{"team_key":"449.l.93173.t.11","team_name":"LVC","points":84.0},"winner_team_key":"449.l.93173.t.9","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"449.l.93173.t.1","team_name":"Ohio City Cons","points":97.0},"team2":{"team_key":"449.l.93173.t.8","team_name":"Team Beef","points":120.5},"winner_team_key":"449.l.93173.t.8","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"449.l.93173.t.2","team_name":"98","points":84.5},"team2":{"team_key":"449.l.93173.t.4","team_name":"Fuz Nuts U","points":165.0},"winner_team_key":"449.l.93173.t.4","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"449.l.93173.t.3","team_name":"Doobie Bros","points":93.5},"team2":{"team_key":"449.l.93173.t.11","team_name":"LVC","points":139.0},"winner_team_key":"449.l.93173.t.11","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"449.l.93173.t.5","team_name":"Make Joco Great Again (MJGA)","points":105.5},"team2":{"team_key":"449.l.93173.t.9","team_name":"The Greek","points":126.5},"winner_team_key":"449.l.93173.t.9","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"449.l.93173.t.6","team_name":"Johnny Fantasy","points":96.0},"team2":{"team_key":"449.l.93173.t.7","team_name":"Opolos","points":111.5},"winner_team_key":"449.l.93173.t.7","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"449.l.93173.t.10","team_name":"Terry\u2019s Big Fantasy Team 2024","points":111.0},"team2":{"team_key":"449.l.93173.t.12","team_name":"Lilst","points":78.0},"winner_team_key":"449.l.93173.t.10","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"449.l.93173.t.1","team_name":"Ohio City Cons","points":103.5},"team2":{"team_key":"449.l.93173.t.10","team_name":"Terry\u2019s Big Fantasy Team 2024","points":83.5},"winner_team_key":"449.l.93173.t.1","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"449.l.93173.t.2","team_name":"98","points":119.0},"team2":{"team_key":"449.l.93173.t.8","team_name":"Team Beef","points":104.5},"winner_team_key":"449.l.93173.t.2","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"449.l.93173.t.3","team_name":"Doobie Bros","points":143.5},"team2":{"team_key":"449.l.93173.t.5","team_name":"Make Joco Great Again (MJGA)","points":119.0},"winner_team_key":"449.l.93173.t.3","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"449.l.93173.t.4","team_name":"Fuz Nuts U","points":113.5},"team2":{"team_key":"449.l.93173.t.11","team_name":"LVC","points":137.5},"winner_team_key":"449.l.93173.t.11","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"449.l.93173.t.6","team_name":"Johnny Fantasy","points":97.5},"team2":{"team_key":"449.l.93173.t.12","team_name":"Lilst","points":119.5},"winner_team_key":"449.l.93173.t.12","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"449.l.93173.t.7","team_name":"Opolos","points":81.0},"team2":{"team_key":"449.l.93173.t.9","team_name":"The Greek","points":70.5},"winner_team_key":"449.l.93173.t.7","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"449.l.93173.t.1","team_name":"Ohio City Cons","points":79.0},"team2":{"team_key":"449.l.93173.t.2","team_name":"98","points":114.5},"winner_team_key":"449.l.93173.t.2","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"449.l.93173.t.3","team_name":"Doobie Bros","points":91.0},"team2":{"team_key":"449.l.93173.t.7","team_name":"Opolos","points":85.0},"winner_team_key":"449.l.93173.t.3","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"449.l.93173.t.4","team_name":"Fuz Nuts U","points":96.5},"team2":{"team_key":"449.l.93173.t.5","team_name":"Make Joco Great Again (MJGA)","points":113.5},"winner_team_key":"449.l.93173.t.5","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"449.l.93173.t.6","team_name":"Johnny Fantasy","points":83.0},"team2":{"team_key":"449.l.93173.t.10","team_name":"Terry\u2019s Big Fantasy Team 2024","points":82.5},"winner_team_key":"449.l.93173.t.6","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"449.l.93173.t.8","team_name":"Team Beef","points":109.5},"team2":{"team_key":"449.l.93173.t.11","team_name":"LVC","points":122.0},"winner_team_key":"449.l.93173.t.11","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"449.l.93173.t.9","team_name":"The Greek","points":89.0},"team2":{"team_key":"449.l.93173.t.12","team_name":"Lilst","points":76.5},"winner_team_key":"449.l.93173.t.9","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"449.l.93173.t.1","team_name":"Ohio City Cons","points":121.0},"team2":{"team_key":"449.l.93173.t.11","team_name":"LVC","points":110.0},"winner_team_key":"449.l.93173.t.1","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"449.l.93173.t.2","team_name":"98","points":144.0},"team2":{"team_key":"449.l.93173.t.10","team_name":"Terry\u2019s Big Fantasy Team 2024","points":92.5},"winner_team_key":"449.l.93173.t.2","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"449.l.93173.t.3","team_name":"Doobie Bros","points":84.0},"team2":{"team_key":"449.l.93173.t.12","team_name":"Lilst","points":142.0},"winner_team_key":"449.l.93173.t.12","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"449.l.93173.t.4","team_name":"Fuz Nuts U","points":76.0},"team2":{"team_key":"449.l.93173.t.7","team_name":"Opolos","points":99.5},"winner_team_key":"449.l.93173.t.7","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"449.l.93173.t.5","team_name":"Make Joco Great Again (MJGA)","points":150.5},"team2":{"team_key":"449.l.93173.t.8","team_name":"Team Beef","points":56.0},"winner_team_key":"449.l.93173.t.5","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"449.l.93173.t.6","team_name":"Johnny Fantasy","points":90.5},"team2":{"team_key":"449.l.93173.t.9","team_name":"The Greek","points":150.5},"winner_team_key":"449.l.93173.t.9","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"449.l.93173.t.1","team_name":"Ohio City Cons","points":119.5},"team2":{"team_key":"449.l.93173.t.5","team_name":"Make Joco Great Again (MJGA)","points":123.5},"winner_team_key":"449.l.93173.t.5","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"449.l.93173.t.2","team_name":"98","points":75.5},"team2":{"team_key":"449.l.93173.t.11","team_name":"LVC","points":83.0},"winner_team_key":"449.l.93173.t.11","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"449.l.93173.t.3","team_name":"Doobie Bros","points":103.5},"team2":{"team_key":"449.l.93173.t.6","team_name":"Johnny Fantasy","points":88.0},"winner_team_key":"449.l.93173.t.3","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"449.l.93173.t.4","team_name":"Fuz Nuts U","points":99.0},"team2":{"team_key":"449.l.93173.t.12","team_name":"Lilst","points":118.5},"winner_team_key":"449.l.93173.t.12","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"449.l.93173.t.7","team_name":"Opolos","points":141.5},"team2":{"team_key":"449.l.93173.t.8","team_name":"Team Beef","points":113.0},"winner_team_key":"449.l.93173.t.7","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"449.l.93173.t.9","team_name":"The Greek","points":102.5},"team2":{"team_key":"449.l.93173.t.10","team_name":"Terry\u2019s Big Fantasy Team 2024","points":96.0},"winner_team_key":"449.l.93173.t.9","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"449.l.93173.t.1","team_name":"Ohio City Cons","points":76.0},"team2":{"team_key":"449.l.93173.t.7","team_name":"Opolos","points":128.0},"winner_team_key":"449.l.93173.t.7","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"449.l.93173.t.2","team_name":"98","points":135.0},"team2":{"team_key":"449.l.93173.t.5","team_name":"Make Joco Great Again (MJGA)","points":142.0},"winner_team_key":"449.l.93173.t.5","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"449.l.93173.t.3","team_name":"Doobie Bros","points":76.5},"team2":{"team_key":"449.l.93173.t.9","team_name":"The Greek","points":120.5},"winner_team_key":"449.l.93173.t.9","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"449.l.93173.t.4","team_name":"Fuz Nuts U","points":105.0},"team2":{"team_key":"449.l.93173.t.6","team_name":"Johnny Fantasy","points":104.5},"winner_team_key":"449.l.93173.t.4","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"449.l.93173.t.8","team_name":"Team Beef","points":132.0},"team2":{"team_key":"449.l.93173.t.12","team_name":"Lilst","points":107.5},"winner_team_key":"449.l.93173.t.8","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"449.l.93173.t.10","team_name":"Terry\u2019s Big Fantasy Team 2024","points":118.5},"team2":{"team_key":"449.l.93173.t.11","team_name":"LVC","points":158.0},"winner_team_key":"449.l.93173.t.11","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"449.l.93173.t.1","team_name":"Ohio City Cons","points":84.5},"team2":{"team_key":"449.l.93173.t.12","team_name":"Lilst","points":94.0},"winner_team_key":"449.l.93173.t.12","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"449.l.93173.t.2","team_name":"98","points":90.0},"team2":{"team_key":"449.l.93173.t.7","team_name":"Opolos","points":127.5},"winner_team_key":"449.l.93173.t.7","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"449.l.93173.t.3","team_name":"Doobie Bros","points":84.0},"team2":{"team_key":"449.l.93173.t.10","team_name":"Terry\u2019s Big Fantasy Team 2024","points":131.5},"winner_team_key":"449.l.93173.t.10","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"449.l.93173.t.4","team_name":"Fuz Nuts U","points":116.0},"team2":{"team_key":"449.l.93173.t.9","team_name":"The Greek","points":124.5},"winner_team_key":"449.l.93173.t.9","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"449.l.93173.t.5","team_name":"Make Joco Great Again (MJGA)","points":177.5},"team2":{"team_key":"449.l.93173.t.11","team_name":"LVC","points":109.5},"winner_team_key":"449.l.93173.t.5","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"449.l.93173.t.6","team_name":"Johnny Fantasy","points":104.5},"team2":{"team_key":"449.l.93173.t.8","team_name":"Team Beef","points":107.0},"winner_team_key":"449.l.93173.t.8","is_playoffs":false,"is_championship":false},{"week":15,"team1":{"team_key":"449.l.93173.t.2","team_name":"98","points":102.5},"team2":{"team_key":"449.l.93173.t.6","team_name":"Johnny Fantasy","points":71.5},"winner_team_key":"449.l.93173.t.2","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"449.l.93173.t.3","team_name":"Doobie Bros","points":64.5},"team2":{"team_key":"449.l.93173.t.10","team_name":"Terry\u2019s Big Fantasy Team 2024","points":149.5},"winner_team_key":"449.l.93173.t.10","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"449.l.93173.t.5","team_name":"Make Joco Great Again (MJGA)","points":162.0},"team2":{"team_key":"449.l.93173.t.8","team_name":"Team Beef","points":124.5},"winner_team_key":"449.l.93173.t.5","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"449.l.93173.t.9","team_name":"The Greek","points":135.5},"team2":{"team_key":"449.l.93173.t.12","team_name":"Lilst","points":110.0},"winner_team_key":"449.l.93173.t.9","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"449.l.93173.t.1","team_name":"Ohio City Cons","points":104.5},"team2":{"team_key":"449.l.93173.t.2","team_name":"98","points":83.5},"winner_team_key":"449.l.93173.t.1","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"449.l.93173.t.3","team_name":"Doobie Bros","points":76.0},"team2":{"team_key":"449.l.93173.t.6","team_name":"Johnny Fantasy","points":67.5},"winner_team_key":"449.l.93173.t.3","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"449.l.93173.t.4","team_name":"Fuz Nuts U","points":62.5},"team2":{"team_key":"449.l.93173.t.10","team_name":"Terry\u2019s Big Fantasy Team 2024","points":131.5},"winner_team_key":"449.l.93173.t.10","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"449.l.93173.t.5","team_name":"Make Joco Great Again (MJGA)","points":93.5},"team2":{"team_key":"449.l.93173.t.11","team_name":"LVC","points":147.5},"winner_team_key":"449.l.93173.t.11","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"449.l.93173.t.7","team_name":"Opolos","points":110.0},"team2":{"team_key":"449.l.93173.t.9","team_name":"The Greek","points":153.5},"winner_team_key":"449.l.93173.t.9","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"449.l.93173.t.8","team_name":"Team Beef","points":171.5},"team2":{"team_key":"449.l.93173.t.12","team_name":"Lilst","points":128.0},"winner_team_key":"449.l.93173.t.8","is_playoffs":true,"is_championship":false},{"week":17,"team1":{"team_key":"449.l.93173.t.9","team_name":"The Greek","points":124.5},"team2":{"team_key":"449.l.93173.t.11","team_name":"LVC","points":128.0},"winner_team_key":"449.l.93173.t.11","is_playoffs":true,"is_championship":true},{"week":17,"team1":{"team_key":"449.l.93173.t.7","team_name":"Opolos","points":117.5},"team2":{"team_key":"449.l.93173.t.5","team_name":"Make Joco Great Again (MJGA)","points":99.5},"winner_team_key":"449.l.93173.t.7","is_playoffs":true,"is_championship":false},{"week":17,"team1":{"team_key":"449.l.93173.t.12","team_name":"Lilst","points":128.0},"team2":{"team_key":"449.l.93173.t.8","team_name":"Team Beef","points":171.5},"winner_team_key":"449.l.93173.t.8","is_playoffs":true,"is_championship":false}],"season_high_score":{"points":177.5,"team":"Make Joco Great Again (MJGA)","week":14},"season_low_score":{"points":55.0,"team":"Terry\u2019s Big Fantasy Team 2024","week":4}},{"season":2025,"league_key":"461.l.99849","league_name":"BKGFFL","num_teams":12,"playoff_start_week":15,"champion":{"team_key":"461.l.99849.t.7","team_name":"LVC","points":121.3},"runner_up":{"team_key":"461.l.99849.t.8","team_name":"Make Joco Great Again (MJGA)","points":71.36},"champ_score":121.3,"runner_score":71.36,"standings":[{"team_key":"461.l.99849.t.7","team_name":"LVC","managers":["LVC"],"rank":1,"wins":8,"losses":6,"ties":0,"points_for":1580.12,"points_against":1366.6999999999998},{"team_key":"461.l.99849.t.8","team_name":"Make Joco Great Again (MJGA)","managers":["JG JR"],"rank":2,"wins":10,"losses":4,"ties":0,"points_for":1773.0,"points_against":1555.2199999999998},{"team_key":"461.l.99849.t.10","team_name":"Team Beef","managers":["Bird"],"rank":3,"wins":10,"losses":4,"ties":0,"points_for":1678.18,"points_against":1416.66},{"team_key":"461.l.99849.t.12","team_name":"The Greek","managers":["mark","David"],"rank":4,"wins":10,"losses":4,"ties":0,"points_for":1809.96,"points_against":1624.3},{"team_key":"461.l.99849.t.1","team_name":"Ohio City Cons","managers":["bubcon"],"rank":5,"wins":7,"losses":7,"ties":0,"points_for":1550.5,"points_against":1330.82},{"team_key":"461.l.99849.t.11","team_name":"The Edmund Fitzgerald","managers":["terry"],"rank":6,"wins":8,"losses":6,"ties":0,"points_for":1566.94,"points_against":1442.1999999999998},{"team_key":"461.l.99849.t.4","team_name":"Fuz Nuts U","managers":["Fuzzy"],"rank":7,"wins":5,"losses":9,"ties":0,"points_for":1482.32,"points_against":1616.66},{"team_key":"461.l.99849.t.3","team_name":"Doobie Bros","managers":["Ryan"],"rank":8,"wins":7,"losses":7,"ties":0,"points_for":1426.9,"points_against":1431.3000000000002},{"team_key":"461.l.99849.t.2","team_name":"98","managers":["Jonathan"],"rank":9,"wins":5,"losses":9,"ties":0,"points_for":1431.16,"points_against":1540.3999999999996},{"team_key":"461.l.99849.t.5","team_name":"Johnny Fantasy","managers":["Johnny Fantasy"],"rank":10,"wins":5,"losses":9,"ties":0,"points_for":1390.4,"points_against":1613.9399999999998},{"team_key":"461.l.99849.t.6","team_name":"Make Lilst Avg Again","managers":["andrew"],"rank":11,"wins":5,"losses":9,"ties":0,"points_for":1290.62,"points_against":1606.3},{"team_key":"461.l.99849.t.9","team_name":"Opolos","managers":["B-waite"],"rank":12,"wins":4,"losses":10,"ties":0,"points_for":1161.94,"points_against":1597.5400000000002}],"matchups":[{"week":1,"team1":{"team_key":"461.l.99849.t.1","team_name":"Ohio City Cons","points":76.38},"team2":{"team_key":"461.l.99849.t.6","team_name":"Make Lilst Avg Again","points":79.92},"winner_team_key":"461.l.99849.t.6","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"461.l.99849.t.2","team_name":"98","points":100.76},"team2":{"team_key":"461.l.99849.t.11","team_name":"The Edmund Fitzgerald","points":114.62},"winner_team_key":"461.l.99849.t.11","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"461.l.99849.t.3","team_name":"Doobie Bros","points":90.82},"team2":{"team_key":"461.l.99849.t.5","team_name":"Johnny Fantasy","points":106.28},"winner_team_key":"461.l.99849.t.5","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"461.l.99849.t.4","team_name":"Fuz Nuts U","points":103.66},"team2":{"team_key":"461.l.99849.t.7","team_name":"LVC","points":105.92},"winner_team_key":"461.l.99849.t.7","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"461.l.99849.t.8","team_name":"Make Joco Great Again (MJGA)","points":101.54},"team2":{"team_key":"461.l.99849.t.10","team_name":"Team Beef","points":108.78},"winner_team_key":"461.l.99849.t.10","is_playoffs":false,"is_championship":false},{"week":1,"team1":{"team_key":"461.l.99849.t.9","team_name":"Opolos","points":107.42},"team2":{"team_key":"461.l.99849.t.12","team_name":"The Greek","points":106.42},"winner_team_key":"461.l.99849.t.9","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"461.l.99849.t.1","team_name":"Ohio City Cons","points":84.34},"team2":{"team_key":"461.l.99849.t.5","team_name":"Johnny Fantasy","points":121.3},"winner_team_key":"461.l.99849.t.5","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"461.l.99849.t.2","team_name":"98","points":91.72},"team2":{"team_key":"461.l.99849.t.12","team_name":"The Greek","points":119.04},"winner_team_key":"461.l.99849.t.12","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"461.l.99849.t.3","team_name":"Doobie Bros","points":102.7},"team2":{"team_key":"461.l.99849.t.10","team_name":"Team Beef","points":93.48},"winner_team_key":"461.l.99849.t.3","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"461.l.99849.t.4","team_name":"Fuz Nuts U","points":120.8},"team2":{"team_key":"461.l.99849.t.11","team_name":"The Edmund Fitzgerald","points":111.6},"winner_team_key":"461.l.99849.t.4","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"461.l.99849.t.6","team_name":"Make Lilst Avg Again","points":109.94},"team2":{"team_key":"461.l.99849.t.9","team_name":"Opolos","points":98.04},"winner_team_key":"461.l.99849.t.6","is_playoffs":false,"is_championship":false},{"week":2,"team1":{"team_key":"461.l.99849.t.7","team_name":"LVC","points":102.48},"team2":{"team_key":"461.l.99849.t.8","team_name":"Make Joco Great Again (MJGA)","points":136.54},"winner_team_key":"461.l.99849.t.8","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"461.l.99849.t.1","team_name":"Ohio City Cons","points":109.34},"team2":{"team_key":"461.l.99849.t.3","team_name":"Doobie Bros","points":110.0},"winner_team_key":"461.l.99849.t.3","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"461.l.99849.t.2","team_name":"98","points":108.22},"team2":{"team_key":"461.l.99849.t.6","team_name":"Make Lilst Avg Again","points":94.38},"winner_team_key":"461.l.99849.t.2","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"461.l.99849.t.4","team_name":"Fuz Nuts U","points":113.82},"team2":{"team_key":"461.l.99849.t.12","team_name":"The Greek","points":113.84},"winner_team_key":"461.l.99849.t.12","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"461.l.99849.t.5","team_name":"Johnny Fantasy","points":125.62},"team2":{"team_key":"461.l.99849.t.9","team_name":"Opolos","points":109.12},"winner_team_key":"461.l.99849.t.5","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"461.l.99849.t.7","team_name":"LVC","points":102.66},"team2":{"team_key":"461.l.99849.t.10","team_name":"Team Beef","points":101.36},"winner_team_key":"461.l.99849.t.7","is_playoffs":false,"is_championship":false},{"week":3,"team1":{"team_key":"461.l.99849.t.8","team_name":"Make Joco Great Again (MJGA)","points":110.54},"team2":{"team_key":"461.l.99849.t.11","team_name":"The Edmund Fitzgerald","points":96.42},"winner_team_key":"461.l.99849.t.8","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"461.l.99849.t.1","team_name":"Ohio City Cons","points":112.3},"team2":{"team_key":"461.l.99849.t.9","team_name":"Opolos","points":76.58},"winner_team_key":"461.l.99849.t.1","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"461.l.99849.t.2","team_name":"98","points":127.16},"team2":{"team_key":"461.l.99849.t.5","team_name":"Johnny Fantasy","points":116.46},"winner_team_key":"461.l.99849.t.2","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"461.l.99849.t.3","team_name":"Doobie Bros","points":104.62},"team2":{"team_key":"461.l.99849.t.7","team_name":"LVC","points":106.4},"winner_team_key":"461.l.99849.t.7","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"461.l.99849.t.4","team_name":"Fuz Nuts U","points":89.48},"team2":{"team_key":"461.l.99849.t.6","team_name":"Make Lilst Avg Again","points":114.42},"winner_team_key":"461.l.99849.t.6","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"461.l.99849.t.8","team_name":"Make Joco Great Again (MJGA)","points":180.28},"team2":{"team_key":"461.l.99849.t.12","team_name":"The Greek","points":115.36},"winner_team_key":"461.l.99849.t.8","is_playoffs":false,"is_championship":false},{"week":4,"team1":{"team_key":"461.l.99849.t.10","team_name":"Team Beef","points":133.62},"team2":{"team_key":"461.l.99849.t.11","team_name":"The Edmund Fitzgerald","points":134.88},"winner_team_key":"461.l.99849.t.11","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"461.l.99849.t.1","team_name":"Ohio City Cons","points":124.4},"team2":{"team_key":"461.l.99849.t.2","team_name":"98","points":105.22},"winner_team_key":"461.l.99849.t.1","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"461.l.99849.t.3","team_name":"Doobie Bros","points":94.24},"team2":{"team_key":"461.l.99849.t.9","team_name":"Opolos","points":108.58},"winner_team_key":"461.l.99849.t.9","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"461.l.99849.t.4","team_name":"Fuz Nuts U","points":72.92},"team2":{"team_key":"461.l.99849.t.5","team_name":"Johnny Fantasy","points":131.66},"winner_team_key":"461.l.99849.t.5","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"461.l.99849.t.6","team_name":"Make Lilst Avg Again","points":133.42},"team2":{"team_key":"461.l.99849.t.8","team_name":"Make Joco Great Again (MJGA)","points":128.66},"winner_team_key":"461.l.99849.t.6","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"461.l.99849.t.7","team_name":"LVC","points":130.62},"team2":{"team_key":"461.l.99849.t.11","team_name":"The Edmund Fitzgerald","points":88.94},"winner_team_key":"461.l.99849.t.7","is_playoffs":false,"is_championship":false},{"week":5,"team1":{"team_key":"461.l.99849.t.10","team_name":"Team Beef","points":140.26},"team2":{"team_key":"461.l.99849.t.12","team_name":"The Greek","points":136.88},"winner_team_key":"461.l.99849.t.10","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"461.l.99849.t.1","team_name":"Ohio City Cons","points":86.42},"team2":{"team_key":"461.l.99849.t.4","team_name":"Fuz Nuts U","points":98.54},"winner_team_key":"461.l.99849.t.4","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"461.l.99849.t.2","team_name":"98","points":103.7},"team2":{"team_key":"461.l.99849.t.9","team_name":"Opolos","points":72.08},"winner_team_key":"461.l.99849.t.2","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"461.l.99849.t.3","team_name":"Doobie Bros","points":120.96},"team2":{"team_key":"461.l.99849.t.11","team_name":"The Edmund Fitzgerald","points":109.54},"winner_team_key":"461.l.99849.t.3","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"461.l.99849.t.5","team_name":"Johnny Fantasy","points":78.14},"team2":{"team_key":"461.l.99849.t.8","team_name":"Make Joco Great Again (MJGA)","points":132.08},"winner_team_key":"461.l.99849.t.8","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"461.l.99849.t.6","team_name":"Make Lilst Avg Again","points":77.72},"team2":{"team_key":"461.l.99849.t.10","team_name":"Team Beef","points":185.9},"winner_team_key":"461.l.99849.t.10","is_playoffs":false,"is_championship":false},{"week":6,"team1":{"team_key":"461.l.99849.t.7","team_name":"LVC","points":117.98},"team2":{"team_key":"461.l.99849.t.12","team_name":"The Greek","points":122.54},"winner_team_key":"461.l.99849.t.12","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"461.l.99849.t.1","team_name":"Ohio City Cons","points":166.54},"team2":{"team_key":"461.l.99849.t.8","team_name":"Make Joco Great Again (MJGA)","points":72.36},"winner_team_key":"461.l.99849.t.1","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"461.l.99849.t.2","team_name":"98","points":72.74},"team2":{"team_key":"461.l.99849.t.3","team_name":"Doobie Bros","points":120.3},"winner_team_key":"461.l.99849.t.3","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"461.l.99849.t.4","team_name":"Fuz Nuts U","points":138.38},"team2":{"team_key":"461.l.99849.t.9","team_name":"Opolos","points":83.68},"winner_team_key":"461.l.99849.t.4","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"461.l.99849.t.5","team_name":"Johnny Fantasy","points":69.02},"team2":{"team_key":"461.l.99849.t.10","team_name":"Team Beef","points":124.82},"winner_team_key":"461.l.99849.t.10","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"461.l.99849.t.6","team_name":"Make Lilst Avg Again","points":65.84},"team2":{"team_key":"461.l.99849.t.7","team_name":"LVC","points":150.44},"winner_team_key":"461.l.99849.t.7","is_playoffs":false,"is_championship":false},{"week":7,"team1":{"team_key":"461.l.99849.t.11","team_name":"The Edmund Fitzgerald","points":115.14},"team2":{"team_key":"461.l.99849.t.12","team_name":"The Greek","points":131.76},"winner_team_key":"461.l.99849.t.12","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"461.l.99849.t.1","team_name":"Ohio City Cons","points":116.56},"team2":{"team_key":"461.l.99849.t.10","team_name":"Team Beef","points":124.38},"winner_team_key":"461.l.99849.t.10","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"461.l.99849.t.2","team_name":"98","points":109.52},"team2":{"team_key":"461.l.99849.t.4","team_name":"Fuz Nuts U","points":140.28},"winner_team_key":"461.l.99849.t.4","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"461.l.99849.t.3","team_name":"Doobie Bros","points":107.38},"team2":{"team_key":"461.l.99849.t.12","team_name":"The Greek","points":132.02},"winner_team_key":"461.l.99849.t.12","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"461.l.99849.t.5","team_name":"Johnny Fantasy","points":61.68},"team2":{"team_key":"461.l.99849.t.7","team_name":"LVC","points":155.36},"winner_team_key":"461.l.99849.t.7","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"461.l.99849.t.6","team_name":"Make Lilst Avg Again","points":79.26},"team2":{"team_key":"461.l.99849.t.11","team_name":"The Edmund Fitzgerald","points":110.32},"winner_team_key":"461.l.99849.t.11","is_playoffs":false,"is_championship":false},{"week":8,"team1":{"team_key":"461.l.99849.t.8","team_name":"Make Joco Great Again (MJGA)","points":139.58},"team2":{"team_key":"461.l.99849.t.9","team_name":"Opolos","points":88.68},"winner_team_key":"461.l.99849.t.8","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"461.l.99849.t.1","team_name":"Ohio City Cons","points":129.94},"team2":{"team_key":"461.l.99849.t.7","team_name":"LVC","points":112.0},"winner_team_key":"461.l.99849.t.1","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"461.l.99849.t.2","team_name":"98","points":112.42},"team2":{"team_key":"461.l.99849.t.8","team_name":"Make Joco Great Again (MJGA)","points":134.14},"winner_team_key":"461.l.99849.t.8","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"461.l.99849.t.3","team_name":"Doobie Bros","points":143.58},"team2":{"team_key":"461.l.99849.t.4","team_name":"Fuz Nuts U","points":106.06},"winner_team_key":"461.l.99849.t.3","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"461.l.99849.t.5","team_name":"Johnny Fantasy","points":94.62},"team2":{"team_key":"461.l.99849.t.11","team_name":"The Edmund Fitzgerald","points":107.42},"winner_team_key":"461.l.99849.t.11","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"461.l.99849.t.6","team_name":"Make Lilst Avg Again","points":113.86},"team2":{"team_key":"461.l.99849.t.12","team_name":"The Greek","points":92.7},"winner_team_key":"461.l.99849.t.6","is_playoffs":false,"is_championship":false},{"week":9,"team1":{"team_key":"461.l.99849.t.9","team_name":"Opolos","points":76.78},"team2":{"team_key":"461.l.99849.t.10","team_name":"Team Beef","points":109.9},"winner_team_key":"461.l.99849.t.10","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"461.l.99849.t.1","team_name":"Ohio City Cons","points":83.62},"team2":{"team_key":"461.l.99849.t.11","team_name":"The Edmund Fitzgerald","points":94.62},"winner_team_key":"461.l.99849.t.11","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"461.l.99849.t.2","team_name":"98","points":85.24},"team2":{"team_key":"461.l.99849.t.10","team_name":"Team Beef","points":116.52},"winner_team_key":"461.l.99849.t.10","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"461.l.99849.t.3","team_name":"Doobie Bros","points":104.7},"team2":{"team_key":"461.l.99849.t.6","team_name":"Make Lilst Avg Again","points":90.6},"winner_team_key":"461.l.99849.t.3","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"461.l.99849.t.4","team_name":"Fuz Nuts U","points":121.84},"team2":{"team_key":"461.l.99849.t.8","team_name":"Make Joco Great Again (MJGA)","points":135.8},"winner_team_key":"461.l.99849.t.8","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"461.l.99849.t.5","team_name":"Johnny Fantasy","points":133.62},"team2":{"team_key":"461.l.99849.t.12","team_name":"The Greek","points":182.28},"winner_team_key":"461.l.99849.t.12","is_playoffs":false,"is_championship":false},{"week":10,"team1":{"team_key":"461.l.99849.t.7","team_name":"LVC","points":114.3},"team2":{"team_key":"461.l.99849.t.9","team_name":"Opolos","points":43.3},"winner_team_key":"461.l.99849.t.7","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"461.l.99849.t.1","team_name":"Ohio City Cons","points":102.6},"team2":{"team_key":"461.l.99849.t.12","team_name":"The Greek","points":117.22},"winner_team_key":"461.l.99849.t.12","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"461.l.99849.t.2","team_name":"98","points":109.18},"team2":{"team_key":"461.l.99849.t.7","team_name":"LVC","points":93.24},"winner_team_key":"461.l.99849.t.2","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"461.l.99849.t.3","team_name":"Doobie Bros","points":67.34},"team2":{"team_key":"461.l.99849.t.8","team_name":"Make Joco Great Again (MJGA)","points":99.0},"winner_team_key":"461.l.99849.t.8","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"461.l.99849.t.4","team_name":"Fuz Nuts U","points":72.82},"team2":{"team_key":"461.l.99849.t.10","team_name":"Team Beef","points":111.86},"winner_team_key":"461.l.99849.t.10","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"461.l.99849.t.5","team_name":"Johnny Fantasy","points":123.22},"team2":{"team_key":"461.l.99849.t.6","team_name":"Make Lilst Avg Again","points":99.2},"winner_team_key":"461.l.99849.t.5","is_playoffs":false,"is_championship":false},{"week":11,"team1":{"team_key":"461.l.99849.t.9","team_name":"Opolos","points":55.44},"team2":{"team_key":"461.l.99849.t.11","team_name":"The Edmund Fitzgerald","points":139.58},"winner_team_key":"461.l.99849.t.11","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"461.l.99849.t.1","team_name":"Ohio City Cons","points":120.76},"team2":{"team_key":"461.l.99849.t.6","team_name":"Make Lilst Avg Again","points":95.26},"winner_team_key":"461.l.99849.t.1","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"461.l.99849.t.2","team_name":"98","points":54.62},"team2":{"team_key":"461.l.99849.t.11","team_name":"The Edmund Fitzgerald","points":97.58},"winner_team_key":"461.l.99849.t.11","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"461.l.99849.t.3","team_name":"Doobie Bros","points":115.36},"team2":{"team_key":"461.l.99849.t.5","team_name":"Johnny Fantasy","points":82.14},"winner_team_key":"461.l.99849.t.3","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"461.l.99849.t.4","team_name":"Fuz Nuts U","points":110.22},"team2":{"team_key":"461.l.99849.t.7","team_name":"LVC","points":87.68},"winner_team_key":"461.l.99849.t.4","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"461.l.99849.t.8","team_name":"Make Joco Great Again (MJGA)","points":166.12},"team2":{"team_key":"461.l.99849.t.10","team_name":"Team Beef","points":127.02},"winner_team_key":"461.l.99849.t.8","is_playoffs":false,"is_championship":false},{"week":12,"team1":{"team_key":"461.l.99849.t.9","team_name":"Opolos","points":66.54},"team2":{"team_key":"461.l.99849.t.12","team_name":"The Greek","points":156.66},"winner_team_key":"461.l.99849.t.12","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"461.l.99849.t.1","team_name":"Ohio City Cons","points":124.6},"team2":{"team_key":"461.l.99849.t.5","team_name":"Johnny Fantasy","points":68.46},"winner_team_key":"461.l.99849.t.1","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"461.l.99849.t.2","team_name":"98","points":120.42},"team2":{"team_key":"461.l.99849.t.12","team_name":"The Greek","points":129.3},"winner_team_key":"461.l.99849.t.12","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"461.l.99849.t.3","team_name":"Doobie Bros","points":89.94},"team2":{"team_key":"461.l.99849.t.10","team_name":"Team Beef","points":102.42},"winner_team_key":"461.l.99849.t.10","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"461.l.99849.t.4","team_name":"Fuz Nuts U","points":80.24},"team2":{"team_key":"461.l.99849.t.11","team_name":"The Edmund Fitzgerald","points":126.74},"winner_team_key":"461.l.99849.t.11","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"461.l.99849.t.6","team_name":"Make Lilst Avg Again","points":68.74},"team2":{"team_key":"461.l.99849.t.9","team_name":"Opolos","points":87.24},"winner_team_key":"461.l.99849.t.9","is_playoffs":false,"is_championship":false},{"week":13,"team1":{"team_key":"461.l.99849.t.7","team_name":"LVC","points":117.24},"team2":{"team_key":"461.l.99849.t.8","team_name":"Make Joco Great Again (MJGA)","points":91.02},"winner_team_key":"461.l.99849.t.7","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"461.l.99849.t.1","team_name":"Ohio City Cons","points":112.7},"team2":{"team_key":"461.l.99849.t.3","team_name":"Doobie Bros","points":54.96},"winner_team_key":"461.l.99849.t.1","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"461.l.99849.t.2","team_name":"98","points":130.24},"team2":{"team_key":"461.l.99849.t.6","team_name":"Make Lilst Avg Again","points":68.06},"winner_team_key":"461.l.99849.t.2","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"461.l.99849.t.4","team_name":"Fuz Nuts U","points":113.26},"team2":{"team_key":"461.l.99849.t.12","team_name":"The Greek","points":153.94},"winner_team_key":"461.l.99849.t.12","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"461.l.99849.t.5","team_name":"Johnny Fantasy","points":78.18},"team2":{"team_key":"461.l.99849.t.9","team_name":"Opolos","points":88.46},"winner_team_key":"461.l.99849.t.9","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"461.l.99849.t.7","team_name":"LVC","points":83.8},"team2":{"team_key":"461.l.99849.t.10","team_name":"Team Beef","points":97.86},"winner_team_key":"461.l.99849.t.10","is_playoffs":false,"is_championship":false},{"week":14,"team1":{"team_key":"461.l.99849.t.8","team_name":"Make Joco Great Again (MJGA)","points":145.34},"team2":{"team_key":"461.l.99849.t.11","team_name":"The Edmund Fitzgerald","points":119.54},"winner_team_key":"461.l.99849.t.8","is_playoffs":false,"is_championship":false},{"week":15,"team1":{"team_key":"461.l.99849.t.1","team_name":"Ohio City Cons","points":97.5},"team2":{"team_key":"461.l.99849.t.10","team_name":"Team Beef","points":142.94},"winner_team_key":"461.l.99849.t.10","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"461.l.99849.t.2","team_name":"98","points":100.12},"team2":{"team_key":"461.l.99849.t.9","team_name":"Opolos","points":69.9},"winner_team_key":"461.l.99849.t.2","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"461.l.99849.t.5","team_name":"Johnny Fantasy","points":152.08},"team2":{"team_key":"461.l.99849.t.6","team_name":"Make Lilst Avg Again","points":123.92},"winner_team_key":"461.l.99849.t.5","is_playoffs":true,"is_championship":false},{"week":15,"team1":{"team_key":"461.l.99849.t.7","team_name":"LVC","points":102.56},"team2":{"team_key":"461.l.99849.t.11","team_name":"The Edmund Fitzgerald","points":89.64},"winner_team_key":"461.l.99849.t.7","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"461.l.99849.t.1","team_name":"Ohio City Cons","points":112.0},"team2":{"team_key":"461.l.99849.t.11","team_name":"The Edmund Fitzgerald","points":97.42},"winner_team_key":"461.l.99849.t.1","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"461.l.99849.t.2","team_name":"98","points":79.4},"team2":{"team_key":"461.l.99849.t.4","team_name":"Fuz Nuts U","points":96.54},"winner_team_key":"461.l.99849.t.4","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"461.l.99849.t.3","team_name":"Doobie Bros","points":126.6},"team2":{"team_key":"461.l.99849.t.5","team_name":"Johnny Fantasy","points":78.8},"winner_team_key":"461.l.99849.t.3","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"461.l.99849.t.6","team_name":"Make Lilst Avg Again","points":128.26},"team2":{"team_key":"461.l.99849.t.9","team_name":"Opolos","points":104.86},"winner_team_key":"461.l.99849.t.6","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"461.l.99849.t.7","team_name":"LVC","points":137.88},"team2":{"team_key":"461.l.99849.t.12","team_name":"The Greek","points":98.76},"winner_team_key":"461.l.99849.t.7","is_playoffs":true,"is_championship":false},{"week":16,"team1":{"team_key":"461.l.99849.t.8","team_name":"Make Joco Great Again (MJGA)","points":170.18},"team2":{"team_key":"461.l.99849.t.10","team_name":"Team Beef","points":151.0},"winner_team_key":"461.l.99849.t.8","is_playoffs":true,"is_championship":false},{"week":17,"team1":{"team_key":"461.l.99849.t.7","team_name":"LVC","points":121.3},"team2":{"team_key":"461.l.99849.t.8","team_name":"Make Joco Great Again (MJGA)","points":71.36},"winner_team_key":"461.l.99849.t.7","is_playoffs":true,"is_championship":true},{"week":17,"team1":{"team_key":"461.l.99849.t.12","team_name":"The Greek","points":97.98},"team2":{"team_key":"461.l.99849.t.10","team_name":"Team Beef","points":147.92},"winner_team_key":"461.l.99849.t.10","is_playoffs":true,"is_championship":false},{"week":17,"team1":{"team_key":"461.l.99849.t.11","team_name":"The Edmund Fitzgerald","points":97.42},"team2":{"team_key":"461.l.99849.t.1","team_name":"Ohio City Cons","points":112.0},"winner_team_key":"461.l.99849.t.1","is_playoffs":true,"is_championship":false}],"season_high_score":{"points":185.9,"team":"Team Beef","week":6},"season_low_score":{"points":43.3,"team":"Opolos","week":10}}]};
  try {
    processData();
    renderAll();
  } catch (err) {
    var cta = document.getElementById('landing-cta');
    if (cta) { cta.textContent = 'LOAD ERROR — REFRESH PAGE'; cta.disabled = true; }
    return;
  }

  // Update landing page stats from real data
  const activeMgrCount = Object.keys(MANAGERS_MAP).filter(m => ALLOWED_MANAGERS.has(m)).length;
  const totalMatchups = SEASONS.reduce((a, s) => a + s.matchups.length, 0);
  const uniqueChampCount = new Set(SEASONS.map(s => s.champion ? getMgrFromTeamKey(s.champion.team_key, s) : null).filter(Boolean)).size;
  const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  el('ls-seasons', SEASONS.length);
  el('ls-managers', activeMgrCount);
  el('ls-matchups', totalMatchups);
  el('ls-champions', uniqueChampCount);
  el('masthead-meta-2', 'EST. 2014 \u00b7 ' + SEASONS.length + ' SEASONS OF HISTORY');

  const landing = document.getElementById('landing');
  const app = document.getElementById('app');
  app.style.display = 'block';
  app.style.opacity = '0';
  function enterSite() {
    landing.classList.add('is-leaving');
    app.style.transition = 'opacity 0.5s ease 0.15s';
    app.style.opacity = '1';
    setTimeout(function() {
      landing.style.display = 'none';
      window.scrollTo(0, 0);
      if (typeof initMobileRouter === 'function') initMobileRouter();
    }, 500);
  }
  document.getElementById('landing-cta').addEventListener('click', enterSite);
}

// ── PROCESS RAW DATA ──────────────────────────────────────────
function processData() {
  SEASONS = applyLeagueFilters(DATA.seasons);

  // Build manager registry from FULL standings (allStandings) so stats reflect real 12-team seasons
  SEASONS.forEach(s => {
    const fullStandings = s.allStandings || s.standings;
    fullStandings.forEach(t => {
      const mgr = t.managers[0] || 'Unknown';
      if (!ALLOWED_MANAGERS.has(mgr)) return; // skip non-franchise managers
      if (!MANAGERS_MAP[mgr]) {
        MANAGERS_MAP[mgr] = {
          nickname: mgr, teamNames: new Set(), wins: 0, losses: 0, ties: 0,
          pointsFor: 0, pointsAgainst: 0, seasons: 0,
          championships: 0, champYears: [], runnerUp: 0, playoffAppearances: 0,
          highScore: 0, highScoreWeek: 0, highScoreYear: 0,
          lowScore: 9999, lowScoreWeek: 0, lowScoreYear: 0,
          weeklyScores: [], yearlyStats: [],
        };
      }
      const m = MANAGERS_MAP[mgr];
      m.teamNames.add(t.team_name);
      m.wins += t.wins;
      m.losses += t.losses;
      m.ties += t.ties;
      m.pointsFor += t.points_for;
      m.pointsAgainst += t.points_against;
      m.seasons++;
      const totalGames = t.wins + t.losses + t.ties;
      m.yearlyStats.push({ year: s.season, wins: t.wins, losses: t.losses, winPct: totalGames > 0 ? t.wins / totalGames : 0, rank: t.rank, pf: t.points_for });

      // Playoff appearances counted from actual matchup data below
    });

    // Championships & runner-up
    if (s.champion) {
      const champMgr = getMgrFromTeamKey(s.champion.team_key, s);
      if (champMgr && MANAGERS_MAP[champMgr]) {
        MANAGERS_MAP[champMgr].championships++;
        MANAGERS_MAP[champMgr].champYears.push(s.season);
      }
    }
    // Runner-up from resolved finals logic
    const finals = getSeasonFinalData(s);
    if (finals.runnerTeam) {
      const ruMgr = finals.runnerTeam.managers[0] || null;
      if (ruMgr && MANAGERS_MAP[ruMgr]) MANAGERS_MAP[ruMgr].runnerUp++;
    }

    // Playoff appearances = top 6 finishers by standings rank (reliable source of truth)
    fullStandings.forEach(t => {
      if (t.rank <= 6) {
        const mgr = t.managers[0] || null;
        if (mgr && MANAGERS_MAP[mgr]) MANAGERS_MAP[mgr].playoffAppearances++;
      }
    });

    // Weekly high/low from ALL matchups (not filtered) so game counts are accurate
    const allMu = s.allMatchups || s.matchups;
    allMu.forEach(m => {
      [m.team1, m.team2].forEach(t => {
        if (!t || t.points <= 0) return;
        const mgr = getMgrFromTeamKeyFull(t.team_key, fullStandings);
        if (!mgr || !MANAGERS_MAP[mgr]) return;
        const mm = MANAGERS_MAP[mgr];
        mm.weeklyScores.push(t.points);
        if (t.points > mm.highScore) { mm.highScore = t.points; mm.highScoreWeek = m.week; mm.highScoreYear = s.season; }
        if (t.points < mm.lowScore) { mm.lowScore = t.points; mm.lowScoreWeek = m.week; mm.lowScoreYear = s.season; }
      });
    });
  });

  // Calc avg
  Object.values(MANAGERS_MAP).forEach(m => {
    const total = m.wins + m.losses + m.ties;
    m.winPct = total > 0 ? m.wins / total : 0;
    m.avgPts = m.weeklyScores.length > 0 ? (m.weeklyScores.reduce((a,b)=>a+b,0)/m.weeklyScores.length) : 0;
    m.teamName = [...m.teamNames].slice(-1)[0] || '';
    if (m.lowScore === 9999) m.lowScore = 0;
  });

  // Compute league-wide averages for context
  const activeMgrs = Object.values(MANAGERS_MAP).filter(m => ALLOWED_MANAGERS.has(m.nickname));
  const la = { winPct: 0, avgPts: 0, playoffRate: 0, championships: 0 };
  if (activeMgrs.length > 0) {
    la.winPct = activeMgrs.reduce((s, m) => s + m.winPct, 0) / activeMgrs.length;
    la.avgPts = activeMgrs.reduce((s, m) => s + m.avgPts, 0) / activeMgrs.length;
    la.playoffRate = activeMgrs.reduce((s, m) => s + (m.seasons > 0 ? m.playoffAppearances / m.seasons : 0), 0) / activeMgrs.length;
    la.championships = activeMgrs.reduce((s, m) => s + m.championships, 0) / activeMgrs.length;
  }
  window.LEAGUE_AVGS = la;
}

function getMgrFromTeamKeyFull(teamKey, standings) {
  if (!teamKey) return null;
  const found = standings.find(t => t.team_key === teamKey);
  return found ? (found.managers[0] || null) : null;
}

function getMgrFromTeamKey(teamKey, season) {
  if (!teamKey) return null;
  const found = season.standings.find(t => t.team_key === teamKey);
  return found ? (found.managers[0] || null) : null;
}

function getMgrFromTeamName(teamName, season) {
  const found = season.standings.find(t => t.team_name === teamName);
  return found ? (found.managers[0] || null) : null;
}

// ── SHARED PLAYOFF HELPERS ──────────────────────────────────
// BKGFFL rule: top 6 seeds (by standings rank) are the championship bracket.
// Seeds 7+ play consolation games during playoff weeks — those are NOT playoffs.

/** Returns a Set of team_keys for the top-6 championship bracket in a given season. */
function getChampionshipBracketKeys(season) {
  const keys = new Set();
  season.standings.forEach(t => { if (t.rank <= 6) keys.add(t.team_key); });
  return keys;
}

/** Returns true only if this is a real championship-bracket playoff game:
 *  - is_playoffs flag is true
 *  - BOTH teams finished in the top 6 that season (i.e., not consolation) */
function isTruePlayoffGame(matchup, season) {
  if (!matchup.is_playoffs) return false;
  const bracketKeys = getChampionshipBracketKeys(season);
  return bracketKeys.has(matchup.team1.team_key) && bracketKeys.has(matchup.team2.team_key);
}

/** Returns true if a game is NOT a consolation game.
 *  Regular season games pass. Playoff games only pass if both teams are top-6. */
function isNonConsolationGame(matchup, season) {
  if (!matchup.is_playoffs) return true;
  return isTruePlayoffGame(matchup, season);
}

/** Build a stable game key for deduplication.
 *  Keys are ordered so team1/team2 swap doesn't create a different key. */
function gameKey(matchup, season) {
  const keys = [matchup.team1.team_key, matchup.team2.team_key].sort();
  return season.season + ':' + matchup.week + ':' + keys[0] + ':' + keys[1];
}

function getSeasonFinalData(season) {
  const champTeam = season.champion ? season.standings.find(t => t.team_key === season.champion.team_key) : null;
  let runnerTeam = season.runner_up ? season.standings.find(t => t.team_key === season.runner_up.team_key) : null;

  const champKey = champTeam?.team_key || season.champion?.team_key || null;
  const runnerKey = runnerTeam?.team_key || null;
  const playoffGames = season.matchups.filter(m => m.is_playoffs);

  // Find the championship game — prefer is_championship flag, fallback to last playoff matchup with champion
  let finalGame = playoffGames.find(m => m.is_championship) || null;
  if (!finalGame && champKey && runnerKey) {
    const directGames = playoffGames
      .filter(m => (
        (m.team1.team_key === champKey && m.team2.team_key === runnerKey) ||
        (m.team1.team_key === runnerKey && m.team2.team_key === champKey)
      ))
      .sort((a,b) => b.week - a.week);
    if (directGames.length) finalGame = directGames[0];
  }
  if (!finalGame && champKey) {
    const champGames = playoffGames
      .filter(m => m.team1.team_key === champKey || m.team2.team_key === champKey)
      .sort((a,b) => b.week - a.week);
    if (champGames.length) finalGame = champGames[0];
  }

  if (!runnerTeam && finalGame && champKey) {
    const oppKey = finalGame.team1.team_key === champKey ? finalGame.team2.team_key : finalGame.team1.team_key;
    runnerTeam = season.standings.find(t => t.team_key === oppKey) || null;
  }

  let champScore = null;
  let runnerScore = null;
  if (finalGame && champKey) {
    const champIsTeam1 = finalGame.team1.team_key === champKey;
    champScore = champIsTeam1 ? finalGame.team1.points : finalGame.team2.points;
    runnerScore = champIsTeam1 ? finalGame.team2.points : finalGame.team1.points;
  }
  if (champScore === null && season.champ_score > 0 && season.runner_score >= 0) {
    champScore = season.champ_score;
    runnerScore = season.runner_score;
  }

  return {
    champTeam,
    runnerTeam,
    champKey,
    runnerKey: runnerTeam?.team_key || null,
    champScore,
    runnerScore
  };
}

function buildSparkline(yearlyStats, width, height, champYears) {
  if (!yearlyStats || yearlyStats.length < 2) return '';
  const sorted = [...yearlyStats].sort((a, b) => a.year - b.year);
  const champSet = new Set(champYears || []);
  // Use a composite score: win% as base, boosted by playoff rank
  // rank 1-2 = championship contender, rank 7+ = bad season
  const vals = sorted.map(s => {
    let score = s.winPct;
    if (s.rank <= 2) score += 0.15;
    else if (s.rank <= 4) score += 0.08;
    else if (s.rank <= 6) score += 0.03;
    return Math.min(score, 1);
  });
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = max - min || 0.1;
  const pad = 4;
  const innerW = width - pad * 2;
  const step = innerW / (vals.length - 1);
  const coords = vals.map((v, i) => ({
    x: parseFloat((pad + i * step).toFixed(1)),
    y: parseFloat((height - ((v - min) / range) * (height - 6) - 3).toFixed(1)),
  }));
  const points = coords.map(c => c.x + ',' + c.y).join(' ');
  const lastVal = vals[vals.length - 1];
  const firstVal = vals[0];
  const trendColor = lastVal > firstVal ? '#4ade80' : lastVal < firstVal ? '#f87171' : '#c9a84c';

  // Build championship markers
  let champMarkers = '';
  sorted.forEach((s, i) => {
    if (champSet.has(s.year)) {
      champMarkers += '<circle cx="' + coords[i].x + '" cy="' + coords[i].y + '" r="3" fill="#c9a84c" stroke="#0A0A0A" stroke-width="1"/>';
    }
  });

  return '<svg width="' + width + '" height="' + height + '" style="display:block;margin-top:6px" aria-label="Performance trend with championship markers">' +
    '<polyline points="' + points + '" fill="none" stroke="' + trendColor + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>' +
    champMarkers +
    '<circle cx="' + coords[coords.length - 1].x + '" cy="' + coords[coords.length - 1].y + '" r="2.5" fill="' + trendColor + '"/>' +
    '</svg>';
}

function formatBracketScore(points) {
  return (typeof points === 'number' && Number.isFinite(points)) ? points.toFixed(1) : '—';
}

// ── RENDER ALL ───────────────────────────────────────────────
function renderAll() {
  renderMasthead();
  renderChampions();
  renderPower();
  renderH2H();
  renderRecords();
  renderTimeline();
  renderSeasons();
  renderManagers();
  renderRivalries();
  renderBlowoutDealers();
  renderPlayoffPerformance();
  renderCloseGames();
  renderSOS();
  renderConsistency();
  renderBestSeasons();
  renderLuckFactor();
  renderDrought();
  renderRecordsNav();
  renderCompare();
  document.getElementById('footnote').textContent =
    `BKGFFL · THE GRIDIRON CHRONICLES · ${SEASONS.length} SEASONS · ${SEASONS.reduce((a,s)=>a+s.matchups.length,0)} MATCHUPS · DATA PULLED ${DATA.pulled_at}`;
}

// ── MASTHEAD ─────────────────────────────────────────────────
function renderMasthead() {
  const firstYear = SEASONS[0]?.season;
  const lastYear = SEASONS[SEASONS.length-1]?.season;
  document.getElementById('masthead-vol').textContent = `EST. ${firstYear} · OFFICIAL RECORD · ${lastYear} EDITION`;
  const sub = document.querySelector('.masthead-subtitle');

  const allMatchups = SEASONS.reduce((a,s)=>a+s.matchups.length,0);
  const allScores = [];
  SEASONS.forEach(s => s.matchups.forEach(m => {
    if(m.team1.points>0) allScores.push(m.team1.points);
    if(m.team2.points>0) allScores.push(m.team2.points);
  }));
  const highScore = allScores.length ? Math.max(...allScores).toFixed(1) : '—';
  const managers = Object.keys(MANAGERS_MAP).length;
  const champCounts = {};
  SEASONS.forEach(s => { if(s.champion){ champCounts[s.champion.team_name]=(champCounts[s.champion.team_name]||0)+1; } });
  const uniqueChamps = Object.keys(champCounts).length;

  const strip = document.getElementById('stats-strip');
  strip.innerHTML = [
    [SEASONS.length, 'Seasons'],
    [managers, 'Managers'],
    [allMatchups, 'Matchups'],
    [uniqueChamps, 'Champions'],
    [highScore, 'High Score'],
  ].map(([n,l]) => `<div class="strip-stat"><div class="strip-stat-num">${n}</div><div class="strip-stat-label">${l}</div></div>`).join('');
}

// ── CHAMPIONS ────────────────────────────────────────────────
function renderChampions() {
  const grid = document.getElementById('champions-grid');
  grid.innerHTML = '';

  // Known ring years
  const RING_YEAR_SET = new Set([2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025]);

  // Dynasty callout — find most-titled
  const champCounts = {};
  SEASONS.forEach(s => {
    if (s.champion) {
      const name = s.champion.team_name;
      champCounts[name] = (champCounts[name]||0) + 1;
    }
  });
  const topChamp = Object.entries(champCounts).sort((a,b) => b[1]-a[1])[0];
  const callout = document.getElementById('dynasty-callout');
  if (callout && topChamp) {
    callout.innerHTML = '<span>' + topChamp[0] + ' \u2014 ' + topChamp[1] + 'x Champion</span><span class="dynasty-sep">|</span><span>' + SEASONS.length + ' Seasons</span>';
  }

  [...SEASONS].reverse().forEach(s => {
    if (!s.champion) return;
    const finals = getSeasonFinalData(s);
    const mgr = getMgrFromTeamKey(s.champion.team_key, s) || s.champion.team_name || '';
    const hasRing = RING_YEAR_SET.has(s.season);
    const champScore = finals.champScore;
    const runnerScore = finals.runnerScore;
    const margin = (champScore !== null && runnerScore !== null) ? champScore - runnerScore : null;
    const marginStr = margin !== null ? (margin % 1 === 0 ? '+' + margin : '+' + margin.toFixed(1)) : '';

    const card = document.createElement('div');
    card.className = 'champion-card';

    let ringHTML;
    if (hasRing) {
      ringHTML = '<div class="ring-wrapper ring-wrapper--md">' +
        '<img src="' + (RING_IMAGES[String(s.season)] || '') + '" alt="' + s.season + ' BKGFFL Championship Ring — ' + (mgr || 'Champion') + '" draggable="false">' +
        '<div class="ring-vignette"></div>' +
      '</div>';
    } else {
      ringHTML = '<div class="ring-wrapper ring-wrapper--md"><div class="ring-wrapper-tbd">Ring TBD</div></div>';
    }

    const scoreHTML = (champScore !== null && runnerScore !== null)
      ? '<div class="champ-score"><span class="score-for">' + champScore + '</span><span class="score-sep">\u2013</span><span class="score-against">' + runnerScore + '</span></div>' +
        '<div class="champ-margin">' + marginStr + '</div>'
      : '';

    card.innerHTML = ringHTML +
      '<div class="champ-year">' + s.season + '</div>' +
      '<div class="champ-name">' + s.champion.team_name + '</div>' +
      '<div class="champ-manager">' + mgr + '</div>' +
      scoreHTML;

    if (ALLOWED_MANAGERS.has(mgr)) {
      card.onclick = () => showManagerModal(mgr);
      card.style.cursor = 'pointer';
    }
    grid.appendChild(card);
  });
}

// ── ALL-TIME FRANCHISE STATS ─────────────────────────────────
function renderPower() {
  const tbody = document.getElementById('power-tbody');
  const allMgrs = Object.values(MANAGERS_MAP).filter(m => ALLOWED_MANAGERS.has(m.nickname));

  let currentSort = 'winPct';
  let currentDir = 'desc';

  // Legacy badge helper
  const getLegacy = (m) => {
    if (m.championships >= 3) return '<div class="legacy-badge legacy-dynasty">Dynasty</div>';
    if (m.championships >= 1) return '<div class="legacy-badge legacy-champion">Champion</div>';
    return '<div class="legacy-badge legacy-never">Never Won</div>';
  };

  // Win% tier class
  const getWpClass = (pct) => {
    if (pct >= 0.55) return 'wp-elite';
    if (pct >= 0.50) return 'wp-good';
    if (pct < 0.45) return 'wp-bad';
    return 'wp-neutral';
  };

  // Titles display
  const getTitles = (n, isDead) => {
    if (isDead) return `<span class="titles-display" style="opacity:0.5">${n > 0 ? n : '\u2014'}</span>`;
    if (n === 0) return '<span class="titles-display" style="color:var(--bone-muted)">\u2014</span>';
    return `<span class="titles-display"><span class="t-count">${n}</span><span class="t-icon">\ud83c\udfc6</span></span>`;
  };

  const renderRow = (m, rank, isDead) => {
    const rankClass = !isDead ? (rank===1?'r1':rank===2?'r2':rank===3?'r3':'') : '';
    const pedestalClass = !isDead ? (rank===1?'pedestal-1':rank===2?'pedestal-2':rank===3?'pedestal-3':'') : '';
    const dimStyle = isDead ? 'color:var(--bone-dim)' : '';
    const record = m.ties > 0 ? `${m.wins}W\u2013${m.losses}L\u2013${m.ties}T` : `${m.wins}W\u2013${m.losses}L`;
    const wpClass = !isDead ? getWpClass(m.winPct) : '';
    const tr = document.createElement('tr');
    if (pedestalClass) tr.className = pedestalClass;
    if (isDead) { tr.style.opacity = '0.55'; tr.style.filter = 'grayscale(40%)'; }
    tr.innerHTML = `
      <td><span class="rank-num ${rankClass}">${isDead?'—':rank}</span></td>
      <td>
        <div class="manager-name-cell" style="${dimStyle}">${m.teamName}</div>
        <div class="manager-team-cell">${m.nickname} \u00b7 ${m.seasons} yrs</div>
        ${!isDead ? getLegacy(m) : ''}
      </td>
      <td><span style="font-family:'IBM Plex Mono',monospace;font-size:13px;${dimStyle}">${record}</span></td>
      <td><span class="${wpClass}" style="font-family:'IBM Plex Mono',monospace;font-size:14px;${isDead?'color:var(--bone-dim)':''}">${(m.winPct*100).toFixed(1)}%</span></td>
      <td>${getTitles(m.championships, isDead)}</td>
      <td><span style="font-family:'IBM Plex Mono',monospace;font-size:13px;${dimStyle}">${m.playoffAppearances}</span></td>
      <td><span style="font-family:'IBM Plex Mono',monospace;font-size:13px;${dimStyle}">${m.avgPts.toFixed(1)}</span></td>
    `;
    tr.onclick = () => showManagerModal(m.nickname);
    tbody.appendChild(tr);
  };

  function sortAndRender() {
    const sorted = [...allMgrs].sort((a, b) => {
      let av = a[currentSort], bv = b[currentSort];
      if (currentSort === 'rank') { av = a.winPct; bv = b.winPct; }
      if (av !== bv) return currentDir === 'desc' ? bv - av : av - bv;
      return b.wins - a.wins;
    });
    tbody.innerHTML = '';
    sorted.forEach((m, i) => renderRow(m, i + 1, false));

    // Update header indicators
    document.querySelectorAll('.power-table th[data-sort]').forEach(th => {
      th.classList.remove('sort-active', 'sort-asc', 'sort-desc');
      if (th.dataset.sort === currentSort) {
        th.classList.add('sort-active', 'sort-' + currentDir);
      }
    });
  }

  // Click handlers for sortable headers
  document.querySelectorAll('.power-table th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.sort;
      if (currentSort === col) {
        currentDir = currentDir === 'desc' ? 'asc' : 'desc';
      } else {
        currentSort = col;
        currentDir = 'desc';
      }
      sortAndRender();
    });
  });

  sortAndRender();
}

// ── HEAD TO HEAD ─────────────────────────────────────────────
function renderH2H() {
  const table = document.getElementById('h2h-table');
  if (!table) return;
  const mgrs = Object.keys(MANAGERS_MAP).filter(m => ALLOWED_MANAGERS.has(m));

  // Build H2H matrix
  const h2h = {};
  mgrs.forEach(a => { h2h[a]={}; mgrs.forEach(b => h2h[a][b]=0); });

  SEASONS.forEach(s => {
    s.matchups.forEach(m => {
      if (!m.winner_team_key) return;
      const t1mgr = getMgrFromTeamKey(m.team1.team_key, s);
      const t2mgr = getMgrFromTeamKey(m.team2.team_key, s);
      if (!t1mgr || !t2mgr || t1mgr === t2mgr) return;
      if (!ALLOWED_MANAGERS.has(t1mgr) || !ALLOWED_MANAGERS.has(t2mgr)) return;
      if (m.winner_team_key === m.team1.team_key) {
        if(h2h[t1mgr]!==undefined) h2h[t1mgr][t2mgr]++;
      } else {
        if(h2h[t2mgr]!==undefined) h2h[t2mgr][t1mgr]++;
      }
    });
  });

  const sortedMgrs = [...mgrs].sort((a,b) => (MANAGERS_MAP[b]?.winPct||0) - (MANAGERS_MAP[a]?.winPct||0));

  // Abbreviation map for H2H grid
  function h2hName(name) {
    const abbrevs = {
      'Make Joco Great Again (MJGA)': 'MJGA',
      'The Edmund Fitzgerald': 'Edm Fitz',
      'Make Lilst Avg Again': 'Lilst Avg',
      'Zionsville Bubcons': 'Z Bubcons',
      'Santa Clara 49Cons': 'SC 49Cons',
      "Terry's Big Fantasy Team 2024": "Terry BFT",
      "Terry's Fantasy Team": "Terry FT",
      'Go lay in the grass': 'Grass',
      'Nothin But Assholes': 'NB A-holes',
      'New Castle Sharks': 'NC Sharks',
      'BensonopoloWaite': 'B-Waite',
      'Johnny Fantasy': 'J Fantasy',
      'Ohio City Cons': 'OH Cons',
      'Boston Bubcons': 'Bos Bubc',
      'Tig\u0027s Trail Mix': 'Tig Trail',
      'Doobie Bros': 'Doobie',
      'JG Peterson': 'JG P',
    };
    return abbrevs[name] || (name.length > 9 ? name.substring(0, 9) : name);
  }

  // Render header
  const thead = document.createElement('thead');
  let hHTML2 = '<tr><th style="text-align:left;padding-left:10px;width:100px;max-width:100px;">vs →</th>';
  sortedMgrs.forEach(n => {
    const colTeamName = MANAGERS_MAP[n]?.teamName || n;
    hHTML2 += `<th title="${colTeamName}">${h2hName(colTeamName)}</th>`;
  });
  hHTML2 += '<th>TOT</th></tr>';
  thead.innerHTML = hHTML2;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  sortedMgrs.forEach(mgr => {
    const tr = document.createElement('tr');
    let totalW = 0;
    const mgrTeamName = MANAGERS_MAP[mgr]?.teamName || mgr;
    let html = `<td class="h2h-row-header" title="${mgrTeamName}">${h2hName(mgrTeamName)}</td>`;
    sortedMgrs.forEach(opp => {
      if (mgr === opp) { html += `<td class="h2h-self">—</td>`; return; }
      const w = h2h[mgr][opp]||0;
      const l = h2h[opp][mgr]||0;
      totalW += w;
      let cls = 'h2h-even', cellCls = '';
      if (w > l) { cls='h2h-win'; if(w-l>=5) cellCls=' h2h-dominant'; }
      else if (w < l) { cls='h2h-loss'; if(l-w>=5) cellCls=' h2h-dominated'; }
      html += `<td class="${cellCls}" onclick="showH2HModal('${mgr}','${opp}')" style="cursor:pointer" title="Click for deep dive"><span class="${cls}">${w}-${l}</span></td>`;
    });
    html += `<td style="font-family:'IBM Plex Mono',monospace;font-weight:600;color:var(--wine)">${totalW}</td>`;
    tr.innerHTML = html;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
}

// ── RECORD BOOK ──────────────────────────────────────────────
function renderRecords() {
  const container = document.getElementById('records-container');

  // ── GATHER ALL DATA ──
  // Uses shared helpers: isNonConsolationGame(), isTruePlayoffGame(), gameKey()
  // RULE: "Single-Game Scores" and "Biggest Blowouts" include regular season + TRUE
  //       playoffs only. Consolation bracket games are excluded everywhere.
  //       Dedup by stable game key (year:week:sortedTeamKeys) prevents double-counting.

  const allWeeklyScores = [];
  const allMargins = [];
  const seasonPtsMap = {};
  const seenGameKeys = new Set();   // dedup by week: year:week:teams
  const seenScoreSigs = new Set();   // dedup by score signature: year:teams:pts (catches ghost Wk17 dups)
  let _qaDupSkipped = 0;

  // QA counters (dev only)
  let _qaTotal = 0, _qaConsolationSkipped = 0, _qaIncluded = 0, _qaTruePlayoff = 0;

  SEASONS.forEach(s => {
    // Process matchups in week order so earlier weeks win the dedup
    const sortedMu = [...s.matchups].sort((a,b) => a.week - b.week);
    sortedMu.forEach(m => {
      _qaTotal++;

      // Skip consolation games entirely
      if (!isNonConsolationGame(m, s)) { _qaConsolationSkipped++; return; }

      // ── DEDUP: Score-signature dedup ──
      // Data import bug: Wk16 playoff games are duplicated in Wk17 with identical
      // teams + scores (confirmed in 2021–2025). We build a score signature that
      // ignores the week: year + sorted team keys + sorted points.
      // If seen before, this is a ghost duplicate — skip it.
      const teamKeys = [m.team1.team_key, m.team2.team_key].sort();
      const pts = [m.team1.points, m.team2.points].sort((a,b) => a-b);
      const scoreSig = s.season + ':' + teamKeys.join(':') + ':' + pts.join(':');
      if (seenScoreSigs.has(scoreSig)) {
        _qaDupSkipped++;
        return;
      }
      seenScoreSigs.add(scoreSig);

      _qaIncluded++;
      const isPlayoff = isTruePlayoffGame(m, s);
      if (isPlayoff) _qaTruePlayoff++;

      const t1mgr = getMgrFromTeamKey(m.team1.team_key, s) || m.team1.team_name;
      const t2mgr = getMgrFromTeamKey(m.team2.team_key, s) || m.team2.team_name;
      const gk = gameKey(m, s);

      // Individual scores
      if (m.team1.points > 0) {
        allWeeklyScores.push({pts:m.team1.points, mgr:t1mgr, team:m.team1.team_name, week:m.week, year:s.season, playoff:isPlayoff});
      }
      if (m.team2.points > 0) {
        allWeeklyScores.push({pts:m.team2.points, mgr:t2mgr, team:m.team2.team_name, week:m.week, year:s.season, playoff:isPlayoff});
      }

      // Margins
      if (m.team1.points > 0 && m.team2.points > 0) {
        const w = m.team1.points > m.team2.points ? m.team1 : m.team2;
        const l = m.team1.points > m.team2.points ? m.team2 : m.team1;
        const wMgr = m.team1.points > m.team2.points ? t1mgr : t2mgr;
        const lMgr = m.team1.points > m.team2.points ? t2mgr : t1mgr;
        allMargins.push({margin:Math.abs(m.team1.points-m.team2.points), winner:wMgr, loser:lMgr, wTeam:w.team_name, lTeam:l.team_name, year:s.season, week:m.week, ws:w.points, ls:l.points, playoff:isPlayoff, _key:gk});
      }

      // Season point totals (regular season only)
      if (!seasonPtsMap[s.season]) seasonPtsMap[s.season]={};
      if (!m.is_playoffs) {
        [t1mgr, t2mgr].forEach((mg,idx) => {
          if (!seasonPtsMap[s.season][mg]) seasonPtsMap[s.season][mg]=0;
          seasonPtsMap[s.season][mg] += idx===0?m.team1.points:m.team2.points;
        });
      }
    });
  });

  allWeeklyScores.sort((a,b)=>b.pts-a.pts);
  allMargins.sort((a,b)=>b.margin-a.margin);


  // ── STREAKS (regular season only) ──
  const streakData = {};
  Object.keys(MANAGERS_MAP).forEach(mgr => { streakData[mgr] = {maxWin:0, maxLoss:0, curWin:0, curLoss:0, winDetails:'', lossDetails:''}; });
  SEASONS.forEach(s => {
    const seasonStreaks = {};
    Object.keys(MANAGERS_MAP).forEach(mgr => { seasonStreaks[mgr] = {w:0, l:0}; });
    const sortedMatchups = [...s.matchups].filter(m=>!m.is_playoffs).sort((a,b)=>a.week-b.week);
    sortedMatchups.forEach(m => {
      const t1mgr = getMgrFromTeamKey(m.team1.team_key, s);
      const t2mgr = getMgrFromTeamKey(m.team2.team_key, s);
      if (!t1mgr || !t2mgr) return;
      const t1Won = m.winner_team_key === m.team1.team_key;
      [{ mgr:t1mgr, won:t1Won }, { mgr:t2mgr, won:!t1Won }].forEach(({mgr, won}) => {
        if (!streakData[mgr]) return;
        if (won) {
          seasonStreaks[mgr].w++;
          seasonStreaks[mgr].l = 0;
          if (seasonStreaks[mgr].w > streakData[mgr].maxWin) {
            streakData[mgr].maxWin = seasonStreaks[mgr].w;
            streakData[mgr].winDetails = s.season + '';
          }
        } else {
          seasonStreaks[mgr].l++;
          seasonStreaks[mgr].w = 0;
          if (seasonStreaks[mgr].l > streakData[mgr].maxLoss) {
            streakData[mgr].maxLoss = seasonStreaks[mgr].l;
            streakData[mgr].lossDetails = s.season + '';
          }
        }
      });
    });
  });

  // ── PLAYOFF AGGREGATES ──
  // Uses isTruePlayoffGame() — top-6 bracket only, no consolation.
  // Also applies score-signature dedup to catch ghost Wk17 duplicates.
  const playoffWins = {};
  const playoffAppearances = {};
  const realPlayoffScores = [];
  const seenPlayoffSigs = new Set();
  SEASONS.forEach(s => {
    const appearedThisSeason = new Set();
    const sortedPO = [...s.matchups].filter(m => m.is_playoffs).sort((a,b) => a.week - b.week);
    sortedPO.forEach(m => {
      if (!isTruePlayoffGame(m, s)) return;

      // Score-signature dedup (same logic as main loop)
      const tkSorted = [m.team1.team_key, m.team2.team_key].sort();
      const ptsSorted = [m.team1.points, m.team2.points].sort((a,b) => a-b);
      const sig = s.season + ':' + tkSorted.join(':') + ':' + ptsSorted.join(':');
      if (seenPlayoffSigs.has(sig)) return;
      seenPlayoffSigs.add(sig);

      const t1m = getMgrFromTeamKey(m.team1.team_key, s);
      const t2m = getMgrFromTeamKey(m.team2.team_key, s);
      if (t1m) appearedThisSeason.add(t1m);
      if (t2m) appearedThisSeason.add(t2m);
      const winMgr = m.winner_team_key === m.team1.team_key ? t1m : t2m;
      if (winMgr) playoffWins[winMgr] = (playoffWins[winMgr]||0) + 1;

      // Real playoff scores
      if (m.team1.points > 0 && t1m) realPlayoffScores.push({pts:m.team1.points, mgr:t1m, team:m.team1.team_name, week:m.week, year:s.season});
      if (m.team2.points > 0 && t2m) realPlayoffScores.push({pts:m.team2.points, mgr:t2m, team:m.team2.team_name, week:m.week, year:s.season});
    });
    appearedThisSeason.forEach(mgr => {
      playoffAppearances[mgr] = (playoffAppearances[mgr]||0) + 1;
    });
  });
  realPlayoffScores.sort((a,b) => b.pts - a.pts);
  // Most championships
  const champMgr = Object.values(MANAGERS_MAP).sort((a,b)=>b.championships-a.championships)[0];

  // Best single season record
  let bestRecord = null;
  SEASONS.forEach(s => {
    s.standings.forEach(t => {
      const total = t.wins + t.losses;
      if (total === 0) return;
      const pct = t.wins / total;
      if (!bestRecord || t.wins > bestRecord.wins || (t.wins === bestRecord.wins && pct > bestRecord.pct)) {
        bestRecord = {wins:t.wins, losses:t.losses, pct, team:t.team_name, mgr:t.managers[0]||'', year:s.season};
      }
    });
  });

  // ══════ HEADLINE RECORDS ══════
  const high = allWeeklyScores[0];
  const biggest = allMargins[0];

  let html = '<div class="records-headlines">';

  // Featured: Most Championships (full width)
  if (champMgr) {
    html += `<div class="record-headline featured">
      <div>
        <div class="rh-eyebrow">Most Championships</div>
        <div class="rh-value" style="color:var(--wine-bright)">${champMgr.championships}×</div>
      </div>
      <div>
        <div class="rh-holder">${champMgr.teamName}</div>
        <div class="rh-context">${champMgr.champYears.join(' · ')}</div>
      </div>
    </div>`;
  }

  // Highest Score Ever
  if (high) {
    html += `<div class="record-headline">
      <div class="record-headline-accent" style="background:var(--green)"></div>
      <div class="rh-eyebrow">All-Time Highest Score</div>
      <div class="rh-value" style="color:var(--green)">${high.pts.toFixed(1)}</div>
      <div class="rh-holder">${high.team}</div>
      <div class="rh-context">${high.mgr} · Week ${high.week}, ${high.year}${high.playoff?' · Playoffs':''}</div>
    </div>`;
  }

  // Biggest Blowout
  if (biggest) {
    html += `<div class="record-headline">
      <div class="record-headline-accent" style="background:var(--yellow)"></div>
      <div class="rh-eyebrow">Biggest Blowout</div>
      <div class="rh-value" style="color:var(--yellow)">${biggest.margin.toFixed(1)}<span style="font-size:50%;color:var(--bone-dim);font-family:'IBM Plex Mono',monospace;font-weight:400"> pts</span></div>
      <div class="rh-holder">${biggest.wTeam} vs ${biggest.lTeam}</div>
      <div class="rh-context">${biggest.ws.toFixed(1)} – ${biggest.ls.toFixed(1)} · ${biggest.year} Wk ${biggest.week}</div>
    </div>`;
  }

  // Best Single Season Record
  if (bestRecord) {
    html += `<div class="record-headline">
      <div class="record-headline-accent" style="background:#5DADE2"></div>
      <div class="rh-eyebrow">Best Season Record</div>
      <div class="rh-value" style="color:#5DADE2">${bestRecord.wins}-${bestRecord.losses}</div>
      <div class="rh-holder">${bestRecord.team}</div>
      <div class="rh-context">${bestRecord.mgr} · ${bestRecord.year} · ${(bestRecord.pct*100).toFixed(1)}% win rate</div>
    </div>`;
  }

  // Most Losing Seasons
  const losingSeasonsMap = {};
  SEASONS.forEach(s => {
    s.standings.forEach(t => {
      const mg = t.managers[0] || null;
      if (!mg) return;
      if (!losingSeasonsMap[mg]) losingSeasonsMap[mg] = {count:0, total:0, years:[]};
      losingSeasonsMap[mg].total++;
      if (t.losses > t.wins) {
        losingSeasonsMap[mg].count++;
        losingSeasonsMap[mg].years.push(s.season);
      }
    });
  });
  const mostLosing = Object.entries(losingSeasonsMap)
    .map(([mgr, d]) => ({mgr, ...d, team: MANAGERS_MAP[mgr]?.teamName || mgr}))
    .sort((a,b) => b.count - a.count)[0];

  if (mostLosing) {
    html += `<div class="record-headline">
      <div class="record-headline-accent" style="background:#e74c3c"></div>
      <div class="rh-eyebrow">Most Losing Seasons</div>
      <div class="rh-value" style="color:#e74c3c">${mostLosing.count}<span style="font-size:40%;color:var(--bone-dim);font-family:'IBM Plex Mono',monospace;font-weight:400"> of ${mostLosing.total}</span></div>
      <div class="rh-holder">${mostLosing.team}</div>
      <div class="rh-context">${mostLosing.mgr} · Sub-.500 in ${((mostLosing.count/mostLosing.total)*100).toFixed(0)}% of seasons played</div>
    </div>`;
  }

  html += '</div>';

  // ══════ PLAYOFFS (first section after headlines) ══════
  html += '<div class="records-category">';
  html += '<div class="records-cat-header"><div class="records-cat-icon">🏆</div><div class="records-cat-title">Playoff Records</div><div class="records-cat-desc">When it matters most</div></div>';
  html += '<div class="records-dual">';

  // Most playoff wins
  const pWinsSorted = Object.entries(playoffWins).sort((a,b) => b[1] - a[1]);
  html += '<div><div style="font-family:\'IBM Plex Mono\',monospace;font-size:9px;letter-spacing:2px;color:var(--wine);margin-bottom:6px;padding-left:12px">MOST PLAYOFF WINS (ALL-TIME)</div>';
  html += '<div class="records-leaderboard">';
  pWinsSorted.slice(0, 7).forEach(([mgr, wins], i) => {
    const team = MANAGERS_MAP[mgr]?.teamName || mgr;
    html += `<div class="records-lb-row ${i===0?'gold':''}">
      <span class="lb-rank ${i===0?'r1':i<=2?'r2':''}">${i+1}</span>
      <span class="lb-name">${team}</span>
      <span class="lb-context">${mgr}</span>
      <span class="lb-value wine">${wins}</span>
    </div>`;
  });
  html += '</div></div>';

  // Top playoff single-game scores
  html += '<div><div style="font-family:\'IBM Plex Mono\',monospace;font-size:9px;letter-spacing:2px;color:var(--wine);margin-bottom:6px;padding-left:12px">TOP PLAYOFF PERFORMANCES</div>';
  html += '<div class="records-leaderboard">';
  realPlayoffScores.slice(0, 7).forEach((s, i) => {
    html += `<div class="records-lb-row ${i===0?'gold':''}">
      <span class="lb-rank ${i===0?'r1':i<=2?'r2':''}">${i+1}</span>
      <span class="lb-name">${s.team}</span>
      <span class="lb-context">${s.year} Wk${s.week}</span>
      <span class="lb-value green">${s.pts.toFixed(1)}</span>
    </div>`;
  });
  html += '</div></div>';
  html += '</div></div>';

  // ══════ TOP 10: HIGHEST SINGLE-GAME SCORES ══════
  html += '<div class="records-category">';
  html += '<div class="records-cat-header"><div class="records-cat-icon">🔥</div><div class="records-cat-title">Top 10 Single-Game Scores</div><div class="records-cat-desc">All-time best performances</div></div>';
  html += '<div class="records-leaderboard">';
  allWeeklyScores.slice(0, 10).forEach((s, i) => {
    html += `<div class="records-lb-row ${i===0?'gold':''}">
      <span class="lb-rank ${i===0?'r1':i<=2?'r2':''}">${i+1}</span>
      <span class="lb-name">${s.team}</span>
      <span class="lb-context">${s.mgr} · ${s.year} Wk${s.week}${s.playoff?' ⚡':''}</span>
      <span class="lb-value green">${s.pts.toFixed(1)}</span>
    </div>`;
  });
  html += '</div></div>';

  // ══════ TOP 10: BIGGEST BLOWOUTS ══════
  html += '<div class="records-category">';
  html += '<div class="records-cat-header"><div class="records-cat-icon">💀</div><div class="records-cat-title">Top 10 Biggest Blowouts</div><div class="records-cat-desc">Margin of victory</div></div>';
  html += '<div class="records-leaderboard">';
  allMargins.slice(0, 10).forEach((m, i) => {
    html += `<div class="records-lb-row ${i===0?'gold':''}">
      <span class="lb-rank ${i===0?'r1':i<=2?'r2':''}">${i+1}</span>
      <span class="lb-name">${m.wTeam} <span style="color:var(--bone-muted);font-weight:400;font-size:11px">over</span> ${m.lTeam}</span>
      <span class="lb-context">${m.year} Wk${m.week}${m.playoff?' ⚡':''}</span>
      <span class="lb-value wine">+${m.margin.toFixed(1)}</span>
    </div>`;
  });
  html += '</div></div>';

  // ══════ DUAL: WIN STREAKS + LOSS STREAKS ══════
  const winStreaks = Object.entries(streakData)
    .filter(([mgr]) => ALLOWED_MANAGERS.has(mgr))
    .map(([mgr,d]) => ({mgr, streak:d.maxWin, year:d.winDetails, team:MANAGERS_MAP[mgr]?.teamName||mgr}))
    .sort((a,b) => b.streak - a.streak);
  const lossStreaks = Object.entries(streakData)
    .filter(([mgr]) => ALLOWED_MANAGERS.has(mgr))
    .map(([mgr,d]) => ({mgr, streak:d.maxLoss, year:d.lossDetails, team:MANAGERS_MAP[mgr]?.teamName||mgr}))
    .sort((a,b) => b.streak - a.streak);

  html += '<div class="records-category">';
  html += '<div class="records-cat-header"><div class="records-cat-icon">📈</div><div class="records-cat-title">Streaks</div><div class="records-cat-desc">Longest runs of dominance and despair</div></div>';
  html += '<div class="records-dual">';

  // Win streaks
  html += '<div><div style="font-family:\'IBM Plex Mono\',monospace;font-size:9px;letter-spacing:2px;color:var(--green);margin-bottom:6px;padding-left:12px">LONGEST WIN STREAKS</div>';
  html += '<div class="records-leaderboard">';
  winStreaks.slice(0, 7).forEach((s, i) => {
    html += `<div class="records-lb-row ${i===0?'gold':''}">
      <span class="lb-rank ${i===0?'r1':i<=2?'r2':''}">${i+1}</span>
      <span class="lb-name">${s.team}</span>
      <span class="lb-context">${s.year}</span>
      <span><span class="streak-badge win">${s.streak}W</span></span>
    </div>`;
  });
  html += '</div></div>';

  // Loss streaks
  html += '<div><div style="font-family:\'IBM Plex Mono\',monospace;font-size:9px;letter-spacing:2px;color:#e74c3c;margin-bottom:6px;padding-left:12px">LONGEST LOSING STREAKS</div>';
  html += '<div class="records-leaderboard">';
  lossStreaks.slice(0, 7).forEach((s, i) => {
    html += `<div class="records-lb-row ${i===0?'gold':''}">
      <span class="lb-rank ${i===0?'r1':i<=2?'r2':''}">${i+1}</span>
      <span class="lb-name">${s.team}</span>
      <span class="lb-context">${s.year}</span>
      <span><span class="streak-badge loss">${s.streak}L</span></span>
    </div>`;
  });
  html += '</div></div>';
  html += '</div></div>';

  // ══════ SEASON TOTALS ══════
  const seasonTotals = [];
  Object.entries(seasonPtsMap).forEach(([year, teams]) => {
    Object.entries(teams).forEach(([mgr, pts]) => {
      if (pts > 0) seasonTotals.push({mgr, pts, year, team: MANAGERS_MAP[mgr]?.teamName || mgr});
    });
  });
  seasonTotals.sort((a,b) => b.pts - a.pts);

  html += '<div class="records-category">';
  html += '<div class="records-cat-header"><div class="records-cat-icon">📊</div><div class="records-cat-title">Top 10 Regular Season Totals</div><div class="records-cat-desc">Most points in a single regular season</div></div>';
  html += '<div class="records-leaderboard">';
  seasonTotals.slice(0, 10).forEach((s, i) => {
    html += `<div class="records-lb-row ${i===0?'gold':''}">
      <span class="lb-rank ${i===0?'r1':i<=2?'r2':''}">${i+1}</span>
      <span class="lb-name">${s.team}</span>
      <span class="lb-context">${s.mgr} · ${s.year}</span>
      <span class="lb-value green">${s.pts.toFixed(1)}</span>
    </div>`;
  });
  html += '</div></div>';

  container.innerHTML = html;
}

// ── SEASONS ──────────────────────────────────────────────────
function renderTimeline() {
  const container = document.getElementById('timeline');
  if (!container) return;

  // Build milestones from data
  const milestones = [];
  const champCount = {};
  let allTimeHigh = { pts: 0 };

  SEASONS.forEach(s => {
    const champMgr = s.champion ? getMgrFromTeamKey(s.champion.team_key, s) : null;
    const champTeam = s.champion ? s.champion.team_name : null;
    if (champMgr) {
      champCount[champMgr] = (champCount[champMgr] || 0) + 1;
      if (champCount[champMgr] === 1) {
        milestones.push({ year: s.season, type: 'champ', text: (champTeam || champMgr) + ' wins first title', icon: '\ud83c\udfc6' });
      } else if (champCount[champMgr] === 2) {
        milestones.push({ year: s.season, type: 'repeat', text: (champTeam || champMgr) + ' goes back-to-back? No \u2014 ' + champCount[champMgr] + 'x champ', icon: '\ud83c\udfc6\ud83c\udfc6' });
      } else if (champCount[champMgr] >= 3) {
        milestones.push({ year: s.season, type: 'dynasty', text: (champTeam || champMgr) + ' \u2014 DYNASTY (' + champCount[champMgr] + 'x)', icon: '\ud83d\udc51' });
      }
    }

    // Track all-time high score per season
    s.matchups.forEach(m => {
      if (!isNonConsolationGame(m, s)) return;
      [m.team1, m.team2].forEach(t => {
        const mgr = getMgrFromTeamKey(t.team_key, s);
        if (mgr && ALLOWED_MANAGERS.has(mgr) && t.points > allTimeHigh.pts) {
          allTimeHigh = { pts: t.points, team: t.team_name, mgr, year: s.season, week: m.week };
        }
      });
    });
  });

  // Add all-time high as a milestone
  if (allTimeHigh.pts > 0) {
    milestones.push({ year: allTimeHigh.year, type: 'record', text: allTimeHigh.team + ' scores ' + allTimeHigh.pts.toFixed(1) + ' \u2014 all-time record', icon: '\ud83d\udcaf' });
  }

  // Add league founding
  milestones.unshift({ year: SEASONS[0].season, type: 'founding', text: 'BKGFFL is founded', icon: '\u2b50' });

  // Sort by year
  milestones.sort((a, b) => a.year - b.year);

  let html = '<div class="timeline-track">';
  milestones.forEach(m => {
    const typeClass = 'timeline-dot--' + m.type;
    html += '<div class="timeline-item">' +
      '<div class="timeline-year">' + m.year + '</div>' +
      '<div class="timeline-dot ' + typeClass + '">' + m.icon + '</div>' +
      '<div class="timeline-text">' + m.text + '</div>' +
    '</div>';
  });
  html += '</div>';

  container.innerHTML = html;
}

function renderSeasons() {
  const list = document.getElementById('seasons-list');
  const champCounts = {};
  SEASONS.forEach(s => {
    if (s.champion) {
      const mgr = getMgrFromTeamKey(s.champion.team_key, s);
      if (mgr) champCounts[mgr] = (champCounts[mgr] || 0) + 1;
    }
  });

  [...SEASONS].reverse().forEach(s => {
    const finals = getSeasonFinalData(s);
    const mgr = s.champion ? getMgrFromTeamKey(s.champion.team_key, s) || '' : '';
    const champRecord = s.champion ? s.standings.find(t => t.team_key === s.champion.team_key) : null;
    const ringImg = RING_IMAGES[String(s.season)] || RING_IMAGES['2023'];

    // Find biggest blowout and closest game for this season
    let biggestMargin = 0, closestMargin = 9999;
    let biggestGame = null, closestGame = null;
    s.matchups.forEach(m => {
      if (m.team1.points <= 0 || m.team2.points <= 0) return;
      const margin = Math.abs(m.team1.points - m.team2.points);
      if (margin > biggestMargin) { biggestMargin = margin; biggestGame = m; }
      if (margin < closestMargin && margin > 0) { closestMargin = margin; closestGame = m; }
    });

    const row = document.createElement('div');
    row.className = 'season-row';
    row.onclick = () => showSeasonModal(s.season);

    let tags = '';
    // Tags (no dynasty)
    if (champRecord && champRecord.wins >= 10) tags += '<span class="season-record-tag">DOMINANT</span> ';

    row.innerHTML = `
      <div class="season-year-col">
        <div class="season-year-big">${s.season}</div>
        <img src="${ringImg}" alt="${s.season} ring" class="season-ring-thumb">
      </div>
      <div class="season-content">
        <div class="season-top-row">
          <span class="season-champ-name">${s.champion?.team_name||'TBD'}</span>
          <span class="season-champ-mgr">${mgr}</span>
          ${tags}
        </div>
        <div class="season-bottom-row">
          <div class="season-stat-pill">
            <span class="season-stat-pill-label">Final</span>
            <span class="season-stat-pill-val">${finals.champScore!==null&&finals.runnerScore!==null?finals.champScore+' – '+finals.runnerScore:'—'}</span>
            <span class="season-stat-pill-sub">vs ${finals.runnerTeam?.team_name||'—'}</span>
          </div>
          ${champRecord ? `<div class="season-stat-pill"><span class="season-stat-pill-label">Record</span><span style="color:var(--bone)">${champRecord.wins}-${champRecord.losses}</span></div>` : ''}
          <div class="season-stat-pill">
            <span class="season-stat-pill-label">High Score</span>
            <span style="color:var(--green)">${s.season_high_score.points.toFixed(1)}</span>
          </div>
          <button class="season-recap-btn" onclick="event.stopPropagation(); showSeasonModal(${s.season})">View Season Recap</button>
        </div>
      </div>
    `;
    list.appendChild(row);
  });
}

// ── MANAGERS ─────────────────────────────────────────────────
function renderManagers(sortKey) {
  sortKey = sortKey || 'titles';
  const grid = document.getElementById('managers-grid');
  grid.innerHTML = '';
  const currentYear = SEASONS[SEASONS.length-1].season;

  // Global sub-name mapping
  const NAME_MAP = {
    'LVC':'Mike', '98':'Jonathan', 'The Greek':'Mark', 'Team Beef':'Trav',
    'Make Joco Great Again (MJGA)':'JOCO', 'Make Joco Great Again':'JOCO',
    'Joco':'JOCO', 'Ohio City Cons':'Bub',
    'Opolos':'BensonWaite', 'Johnny Fantasy':'Johnny', 'Fuz Nuts U':'Fuzzy',
    'Make Lilist Avg Again':'Andrew', 'Make Lilst Avg Again':'Andrew',
    'Doobie Bros':'Ryan', 'The Edmund Fitzgerald':'Terry',
  };

  const allMgrs = Object.values(MANAGERS_MAP).filter(m => ALLOWED_MANAGERS.has(m.nickname));
  const activeMgrs = allMgrs;
  const retiredMgrs = [];

  // Compute drought for each
  activeMgrs.forEach(m => {
    const last = m.champYears.length ? Math.max(...m.champYears) : null;
    m._drought = last ? (currentYear - last) : (currentYear - MIN_SEASON_YEAR + 1);
  });

  // Sort
  const sortFns = {
    titles: (a,b) => b.championships !== a.championships ? b.championships - a.championships : b.winPct - a.winPct,
    winpct: (a,b) => b.winPct - a.winPct,
    playoffs: (a,b) => b.playoffAppearances !== a.playoffAppearances ? b.playoffAppearances - a.playoffAppearances : b.winPct - a.winPct,
    avgpts: (a,b) => b.avgPts - a.avgPts,
    drought: (a,b) => b._drought - a._drought,
  };
  const sorted = [...activeMgrs].sort(sortFns[sortKey] || sortFns.titles);

  // Sort chips
  const chipBox = document.getElementById('mgr-sort-chips');
  if (chipBox && !chipBox.dataset.init) {
    chipBox.dataset.init = '1';
    const chipLabel = document.createElement('span');
    chipLabel.style.cssText = "font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:0.15em;color:rgba(232,220,200,0.35);text-transform:uppercase;";
    chipLabel.textContent = 'Sort by';
    chipBox.appendChild(chipLabel);
    [{k:'titles',l:'Titles'},{k:'winpct',l:'Win%'},{k:'playoffs',l:'Playoffs'},{k:'avgpts',l:'Avg Pts'},{k:'drought',l:'Drought'}].forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'mgr-sort-chip' + (opt.k === 'titles' ? ' active' : '');
      btn.textContent = opt.l;
      btn.dataset.sort = opt.k;
      btn.onclick = () => {
        chipBox.querySelectorAll('.mgr-sort-chip').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        renderManagers(opt.k);
      };
      chipBox.appendChild(btn);
    });
  } else if (chipBox) {
    chipBox.querySelectorAll('.mgr-sort-chip').forEach(c => {
      c.classList.toggle('active', c.dataset.sort === sortKey);
    });
  }

  // Status logic
  const getStatus = (m) => {
    if (m.championships >= 3) return { label:'DYNASTY', cls:'status-dynasty' };
    if (m.championships >= 1) return { label:'CHAMPION', cls:'status-champion' };
    if (m.winPct >= 0.52 && m.playoffAppearances >= 3) return { label:'CONTENDER', cls:'status-contender' };
    if (m.championships === 0 && m.winPct < 0.48 && m.seasons >= 3) return { label:'REBUILD', cls:'status-rebuild' };
    if (m.championships === 0) return { label:'NEVER WON', cls:'status-never' };
    return { label:'CONTENDER', cls:'status-contender' };
  };

  // Glow class
  const getGlow = (m) => {
    if (m.championships >= 1) return 'glow-gold';
    if (m.winPct > 0.52) return 'glow-green';
    return 'glow-gray';
  };

  // Signature line generator
  const getSig = (m) => {
    if (m.championships >= 3) return m.championships + '\u00d7 CHAMPION \u00b7 DYNASTY';
    if (m.championships === 2) return '2\u00d7 CHAMPION';
    if (m.championships === 1) return 'CHAMPION';
    if (m.playoffAppearances >= 6) return 'PLAYOFF REGULAR \u00b7 NO TITLES';
    if (m.playoffAppearances >= 4) return 'CONTENDER \u00b7 NO TITLES';
    if (m.winPct >= 0.50) return 'ABOVE .500 \u00b7 NO TITLES';
    if (m.winPct < 0.47 && m.seasons >= 3) return 'REBUILD MODE';
    return 'STILL SEARCHING';
  };

  sorted.forEach(m => {
    const card = document.createElement('div');
    const glow = getGlow(m);
    const status = getStatus(m);
    card.className = 'manager-card ' + glow;
    const sig = getSig(m);
    const finalsApp = m.championships + (m.runnerUp || 0);
    const resumeStr = 'Titles ' + m.championships + ' · Finals ' + finalsApp + ' · Playoffs ' + m.playoffAppearances;
    const subName = NAME_MAP[m.teamName] || m.nickname;

    card.innerHTML =
      '<div class="manager-header">' +
        '<div class="manager-full-name">' + m.teamName + '</div>' +
        '<div class="manager-sub-name">' + subName + ' · ' + m.seasons + ' yrs</div>' +
        '<div class="manager-status ' + status.cls + '">' + status.label + '</div>' +
      '</div>' +
      '<div class="manager-stats">' +
        '<span class="stat-pill pill-titles">' +
          '<span class="trophy-icon">🏆</span>' +
          '<span>' + m.championships + '</span>' +
          '<span class="stat-pill-label">Titles</span>' +
        '</span>' +
        '<span class="stat-pill pill-winpct">' +
          '<span>' + (m.winPct*100).toFixed(1) + '%</span>' +
          '<span class="stat-pill-label">Win%</span>' +
        '</span>' +
        '<span class="stat-pill pill-playoffs">' +
          '<span>' + m.playoffAppearances + '</span>' +
          '<span class="stat-pill-label">Playoffs</span>' +
        '</span>' +
        '<span class="stat-pill pill-avgpf">' +
          '<span>' + m.avgPts.toFixed(1) + '</span>' +
          '<span class="stat-pill-label">Avg PF</span>' +
        '</span>' +
      '</div>' +
      '<div class="manager-sparkline">' +
        '<div class="sparkline-label">WIN% TREND</div>' +
        buildSparkline(m.yearlyStats, 120, 28, m.champYears) +
      '</div>' +
      (function() {
        if (!m.yearlyStats || m.yearlyStats.length < 2) return '';
        const sorted = [...m.yearlyStats].sort((a, b) => b.year - a.year);
        const last = sorted[0];
        const prev = sorted[1];
        const arrow = last.winPct > prev.winPct ? '\u25b2' : last.winPct < prev.winPct ? '\u25bc' : '\u25ac';
        const arrowColor = last.winPct > prev.winPct ? '#4ade80' : last.winPct < prev.winPct ? '#f87171' : 'var(--bone-dim)';
        const lastRecord = last.wins + 'W\u2013' + last.losses + 'L';
        const playoffStr = last.rank <= 6 ? 'Playoff' : 'Missed';
        const playoffColor = last.rank <= 6 ? 'var(--wine)' : 'var(--bone-muted)';
        return '<div style="padding:0 ' + 'clamp(14px,3vw,18px)' + ' 6px;font-family:\'IBM Plex Mono\',monospace;font-size:10px;color:var(--bone-dim);letter-spacing:0.5px">' +
          '<span style="color:' + arrowColor + '">' + arrow + '</span> ' +
          last.year + ': ' + lastRecord + ' · #' + last.rank + ' · <span style="color:' + playoffColor + '">' + playoffStr + '</span>' +
        '</div>';
      })() +
      (sig ? '<div class="manager-sig">' + sig + '</div>' : '') +
      '<div class="manager-resume">' + resumeStr + '</div>';

    card.onclick = () => showManagerModal(m.nickname);
    grid.appendChild(card);
  });

  // Retired
  if (retiredMgrs.length > 0) {
    const divider = document.createElement('div');
    divider.style.cssText = 'grid-column:1/-1;padding:28px 0 16px;';
    divider.innerHTML = '<div style="display:flex;align-items:center;gap:16px"><div style="flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(232,220,200,0.1))"></div><div style="font-family:\'Bebas Neue\',sans-serif;font-size:18px;letter-spacing:4px;color:rgba(232,220,200,0.3)">ARCHIVED</div><div style="flex:1;height:1px;background:linear-gradient(90deg,rgba(232,220,200,0.1),transparent)"></div></div>';
    grid.appendChild(divider);

    retiredMgrs.sort((a,b) => b.winPct - a.winPct).forEach(m => {
      const card = document.createElement('div');
      card.className = 'manager-card glow-gray';
      card.style.cssText = 'opacity:0.45;border-style:dashed;';
      const subName = NAME_MAP[m.teamName] || m.nickname;
      card.innerHTML =
        '<div class="manager-header" style="background:linear-gradient(135deg,#0e1018,#0a0e1a)">' +
          '<div class="manager-full-name" style="color:rgba(232,220,200,0.5)">' + m.teamName + '</div>' +
          '<div class="manager-sub-name">' + subName + ' · ' + m.seasons + ' yrs</div>' +
        '</div>' +
        '<div class="manager-stats">' +
          '<span class="stat-pill pill-titles" style="opacity:0.5">' +
            '<span class="trophy-icon">🏆</span>' +
            '<span>' + m.championships + '</span>' +
            '<span class="stat-pill-label">Titles</span>' +
          '</span>' +
          '<span class="stat-pill pill-winpct" style="opacity:0.5">' +
            '<span>' + (m.winPct*100).toFixed(1) + '%</span>' +
            '<span class="stat-pill-label">Win%</span>' +
          '</span>' +
        '</div>';
      card.onclick = () => showManagerModal(m.nickname);
      grid.appendChild(card);
    });
  }
}

// ── MODALS ───────────────────────────────────────────────────
function showManagerModal(nickname, highlightYear) {
  const m = MANAGERS_MAP[nickname];
  if (!m) return;

  // State
  let filterFrom = SEASONS[0].season;
  let filterTo = SEASONS[SEASONS.length-1].season;
  let includePlayoffs = true;
  let viewMode = 'seasons'; // 'seasons' | 'h2h' | 'awards'
  let h2hSort = 'winpct'; // 'winpct' | 'games' | 'alpha'

  function render() {
    // ── Filter matchups ──
    const filteredSeasons = SEASONS.filter(s => s.season >= filterFrom && s.season <= filterTo);
    let totalW=0, totalL=0, totalPts=0, totalGames=0, highScore=0, lowScore=Infinity, highMeta='', lowMeta='';
    const champYearsInRange = [];
    const numPlayoff = 6;

    filteredSeasons.forEach(s => {
      const standing = s.standings.find(t => (t.managers[0]||'')===nickname);
      if (!standing) return;
      const isChamp = s.champion && getMgrFromTeamKey(s.champion.team_key, s)===nickname;
      if (isChamp) champYearsInRange.push(s.season);

      // Determine real playoff team keys for this season
      const realPlayoffKeys = new Set();
      s.standings.forEach(t => { if (t.rank <= numPlayoff) realPlayoffKeys.add(t.team_key); });

      s.matchups.forEach(mu => {
        const t1m = getMgrFromTeamKey(mu.team1.team_key, s);
        const t2m = getMgrFromTeamKey(mu.team2.team_key, s);
        if (t1m !== nickname && t2m !== nickname) return;

        // Playoff filter: if is_playoffs, only include if BOTH teams are real playoff (not consolation)
        if (mu.is_playoffs) {
          if (!includePlayoffs) return;
          const t1Real = realPlayoffKeys.has(mu.team1.team_key);
          const t2Real = realPlayoffKeys.has(mu.team2.team_key);
          if (!t1Real || !t2Real) return; // skip consolation
        }

        const myPts = t1m===nickname ? mu.team1.points : mu.team2.points;
        const myKey = t1m===nickname ? mu.team1.team_key : mu.team2.team_key;
        const won = mu.winner_team_key === myKey;
        if (won) totalW++; else totalL++;
        totalPts += myPts;
        totalGames++;
        if (myPts > highScore) { highScore = myPts; highMeta = 'Wk '+mu.week+', '+s.season; }
        if (myPts < lowScore && myPts > 0) { lowScore = myPts; lowMeta = 'Wk '+mu.week+', '+s.season; }
      });
    });

    const winPct = totalGames > 0 ? (totalW/totalGames*100).toFixed(1) : '0.0';
    const avgPts = totalGames > 0 ? (totalPts/totalGames).toFixed(1) : '0.0';
    if (lowScore === Infinity) { lowScore = 0; lowMeta = '\u2014'; }

    // ── Trophy line ──
    const allChampYears = m.champYears || [];
    const trophyLine = allChampYears.length > 0
      ? allChampYears.map(y => `<span style="display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:4px;background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.2);font-family:'IBM Plex Mono',monospace;font-size:11px;color:#c9a84c;margin:2px">\ud83c\udfc6 ${y}</span>`).join('')
      : '<span style="font-family:\'IBM Plex Mono\',monospace;font-size:11px;color:var(--bone-muted)">No championships</span>';

    // ── Year selects ──
    const yearOpts = SEASONS.map(s => s.season);
    const fromOpts = yearOpts.map(y => `<option value="${y}" ${y===filterFrom?'selected':''}>${y}</option>`).join('');
    const toOpts = yearOpts.map(y => `<option value="${y}" ${y===filterTo?'selected':''}>${y}</option>`).join('');

    // ── HEADER ──
    document.getElementById('modal-header').innerHTML = `
      <div style="font-family:'Bebas Neue',sans-serif;font-size:clamp(32px,8vw,42px);color:var(--bone);letter-spacing:2px;line-height:1">${m.teamName}</div>
      <div style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--bone-muted);margin-top:6px;letter-spacing:1px">${m.nickname} \u00b7 ${m.seasons} SEASONS</div>
      <div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:4px">${trophyLine}</div>
    `;

    // ── FILTERS BAR ──
    const filtersHTML = `
      <div class="mgr-modal-filters">
        <div class="mgr-filter-group">
          <label class="mgr-filter-label">From</label>
          <select class="mgr-filter-select" id="mgr-f-from">${fromOpts}</select>
        </div>
        <div class="mgr-filter-group">
          <label class="mgr-filter-label">To</label>
          <select class="mgr-filter-select" id="mgr-f-to">${toOpts}</select>
        </div>
        <div class="mgr-filter-group">
          <label class="mgr-filter-label">Playoffs</label>
          <button class="mgr-filter-toggle ${includePlayoffs?'active':''}" id="mgr-f-playoffs">${includePlayoffs?'ON':'OFF'}</button>
        </div>
        <div class="mgr-filter-tabs">
          <button class="mgr-view-tab ${viewMode==='seasons'?'active':''}" data-view="seasons">Seasons</button>
          <button class="mgr-view-tab ${viewMode==='h2h'?'active':''}" data-view="h2h">H2H</button>
          <button class="mgr-view-tab ${viewMode==='awards'?'active':''}" data-view="awards">Awards</button>
        </div>
      </div>
    `;

    // ── STAT CARDS ──
    const statsHTML = `
      <div class="stat-grid-3" style="margin-bottom:16px">
        <div class="stat-box"><div class="stat-box-label">Record</div><div class="stat-box-num" style="font-size:clamp(22px,5vw,28px)">${winPct}%</div><div class="stat-box-sub">${totalW}W\u2013${totalL}L</div><div class="stat-box-sub" style="font-size:9px;color:var(--bone-muted);margin-top:2px">Lg avg: ${(window.LEAGUE_AVGS.winPct*100).toFixed(1)}%</div></div>
        <div class="stat-box"><div class="stat-box-label">Avg Pts</div><div class="stat-box-num" style="font-size:clamp(22px,5vw,28px)">${avgPts}</div><div class="stat-box-sub">${totalGames} games</div><div class="stat-box-sub" style="font-size:9px;color:var(--bone-muted);margin-top:2px">Lg avg: ${window.LEAGUE_AVGS.avgPts.toFixed(1)}</div></div>
        <div class="stat-box"><div class="stat-box-label">Titles</div><div class="stat-box-num" style="font-size:clamp(22px,5vw,28px);color:var(--wine)">${champYearsInRange.length}</div><div class="stat-box-sub">${champYearsInRange.join(', ')||'\u2014'}</div></div>
      </div>
      <div class="stat-grid-2" style="margin-bottom:16px">
        <div class="stat-box"><div class="stat-box-label">Season High</div><div class="stat-box-num" style="color:var(--green);font-size:22px">${highScore.toFixed(1)}</div><div class="stat-box-sub">${highMeta}</div></div>
        <div class="stat-box"><div class="stat-box-label">Season Low</div><div class="stat-box-num" style="color:#e74c3c;font-size:22px">${lowScore.toFixed(1)}</div><div class="stat-box-sub">${lowMeta}</div></div>
      </div>
      ${(function() {
        // Compute advanced stats for this manager
        const ws = m.weeklyScores;
        const avg = ws.length > 0 ? ws.reduce((a,b)=>a+b,0)/ws.length : 0;
        const variance = ws.length > 1 ? ws.reduce((s,v)=>s+(v-avg)**2,0)/ws.length : 0;
        const stdDev = Math.sqrt(variance);
        const cv = avg > 0 ? (stdDev/avg)*100 : 0;
        const consistLabel = cv < 18 ? 'Steady' : cv > 24 ? 'Volatile' : 'Average';
        const consistColor = cv < 18 ? 'var(--green)' : cv > 24 ? '#e74c3c' : 'var(--bone)';
        const tg = m.wins+m.losses+m.ties;
        const avgPA = tg > 0 ? (m.pointsAgainst/tg).toFixed(1) : '\u2014';
        const pfPa = tg > 0 ? (m.avgPts - m.pointsAgainst/tg) : 0;
        const pfPaStr = (pfPa >= 0 ? '+' : '') + pfPa.toFixed(1);
        const pfPaColor = pfPa >= 0 ? 'var(--green)' : '#e74c3c';
        return '<div class="stat-grid-3" style="margin-bottom:20px">' +
          '<div class="stat-box"><div class="stat-box-label">Consistency</div><div class="stat-box-num" style="font-size:18px;color:' + consistColor + '">' + consistLabel + '</div><div class="stat-box-sub">\u00b1' + stdDev.toFixed(1) + ' pts/wk</div></div>' +
          '<div class="stat-box"><div class="stat-box-label">Avg Opp Score</div><div class="stat-box-num" style="font-size:18px">' + avgPA + '</div><div class="stat-box-sub">PF/PA diff: <span style="color:' + pfPaColor + '">' + pfPaStr + '</span></div></div>' +
          '<div class="stat-box"><div class="stat-box-label">Playoff Rate</div><div class="stat-box-num" style="font-size:18px">' + (m.seasons > 0 ? (m.playoffAppearances/m.seasons*100).toFixed(0) + '%' : '\u2014') + '</div><div class="stat-box-sub">' + m.playoffAppearances + ' of ' + m.seasons + ' seasons</div></div>' +
        '</div>';
      })()}
    `;

    // ── VIEW: SEASONS ──
    let viewHTML = '';
    if (viewMode === 'seasons') {
      let rows = '';
      filteredSeasons.forEach(s => {
        const standing = s.standings.find(t => (t.managers[0]||'')===nickname);
        if (!standing) return;
        const isChamp = s.champion && getMgrFromTeamKey(s.champion.team_key, s)===nickname;
        const rank2 = s.standings.find(t => t.rank === 2);
        const isRU = rank2 && (rank2.managers[0] || '') === nickname;
        const isHl = highlightYear && s.season === highlightYear;
        const rowClass = isHl ? 'mgr-season-row mgr-season-hl' : isChamp ? 'mgr-season-row mgr-season-champ' : 'mgr-season-row';
        const badge = isChamp ? '<span class="mgr-season-badge mgr-badge-champ">\ud83c\udfc6 CHAMP</span>' : isRU ? '<span class="mgr-season-badge mgr-badge-ru">\ud83e\udd48 FINALS</span>' : '';
        rows += `<div class="${rowClass}" id="modal-yr-${s.season}">
          <span class="mgr-season-year">${s.season}</span>
          <span class="mgr-season-team">${standing.team_name}</span>
          <span class="mgr-season-record">${standing.wins}W\u2013${standing.losses}L</span>
          <span class="mgr-season-pts">${standing.points_for.toFixed(0)}</span>
          <span class="mgr-season-finish">#${standing.rank}</span>
          ${badge}
        </div>`;
      });
      viewHTML = `
        <div class="mgr-section-head">Season by Season</div>
        <div class="mgr-section-subhead">
          <span>Year</span><span>Team</span><span>Record</span><span>PF</span><span>Finish</span><span></span>
        </div>
        <div class="mgr-season-list">${rows}</div>`;
    }

    // ── VIEW: H2H ──
    if (viewMode === 'h2h') {
      const mgrs = Object.keys(MANAGERS_MAP).filter(o=>o!==nickname);
      const h2h = {};
      mgrs.forEach(o => { h2h[o] = {w:0, l:0}; });

      filteredSeasons.forEach(s => {
        const realPlayoffKeys = new Set();
        s.standings.forEach(t => { if (t.rank <= numPlayoff) realPlayoffKeys.add(t.team_key); });

        s.matchups.forEach(mu => {
          const t1m = getMgrFromTeamKey(mu.team1.team_key, s);
          const t2m = getMgrFromTeamKey(mu.team2.team_key, s);
          if (mu.is_playoffs) {
            if (!includePlayoffs) return;
            if (!realPlayoffKeys.has(mu.team1.team_key) || !realPlayoffKeys.has(mu.team2.team_key)) return;
          }
          if (t1m===nickname && h2h[t2m]) {
            if (mu.winner_team_key===mu.team1.team_key) h2h[t2m].w++; else h2h[t2m].l++;
          } else if (t2m===nickname && h2h[t1m]) {
            if (mu.winner_team_key===mu.team2.team_key) h2h[t1m].w++; else h2h[t1m].l++;
          }
        });
      });

      const entries = mgrs.map(o => ({opp:o, ...h2h[o], total:h2h[o].w+h2h[o].l, pct:h2h[o].w+h2h[o].l>0?h2h[o].w/(h2h[o].w+h2h[o].l):0})).filter(e=>e.total>0);
      if (h2hSort==='winpct') entries.sort((a,b)=>b.pct-a.pct);
      else if (h2hSort==='games') entries.sort((a,b)=>b.total-a.total);
      else entries.sort((a,b)=>a.opp.localeCompare(b.opp));

      const h2hRows = entries.map(e => {
        const oppTeam = MANAGERS_MAP[e.opp] ? MANAGERS_MAP[e.opp].teamName : e.opp;
        const color = e.w>e.l?'var(--green)':e.w<e.l?'#e74c3c':'var(--bone-dim)';
        const barW = e.total>0?Math.round(e.w/e.total*100):50;
        return `<div class="mgr-h2h-row">
          <span class="mgr-h2h-name">${oppTeam}</span>
          <span class="mgr-h2h-record" style="color:${color}">${e.w}-${e.l}</span>
          <div class="mgr-h2h-bar"><div class="mgr-h2h-fill" style="width:${barW}%;background:${color}"></div></div>
          <span class="mgr-h2h-pct">${(e.pct*100).toFixed(0)}%</span>
        </div>`;
      }).join('');

      viewHTML = `
        <div class="mgr-section-head" style="display:flex;align-items:center;justify-content:space-between">
          <span><span style="font-weight:700;letter-spacing:2px">${m.teamName}</span> HEAD-TO-HEAD</span>
          <div class="mgr-h2h-sorts">
            <button class="mgr-sort-btn ${h2hSort==='winpct'?'active':''}" data-sort="winpct">Win%</button>
            <button class="mgr-sort-btn ${h2hSort==='games'?'active':''}" data-sort="games">GP</button>
            <button class="mgr-sort-btn ${h2hSort==='alpha'?'active':''}" data-sort="alpha">A-Z</button>
          </div>
        </div>
        <div class="mgr-h2h-list">${h2hRows}</div>`;
    }

    // ── VIEW: AWARDS ──
    if (viewMode === 'awards') {
      let awardsRows = '';
      filteredSeasons.forEach(s => {
        const standing = s.standings.find(t => (t.managers[0]||'')===nickname);
        if (!standing) return;
        const isChamp = s.champion && getMgrFromTeamKey(s.champion.team_key, s)===nickname;
        // Best PF in season — compare against ALL teams, not just filtered
        const allSt = s.allStandings || s.standings;
        const bestPF = [...allSt].sort((a,b)=>b.points_for-a.points_for)[0];
        const isBestPF = bestPF && (bestPF.managers[0]||'')===nickname;
        // Worst PF
        const worstPF = [...allSt].sort((a,b)=>a.points_for-b.points_for)[0];
        const isWorstPF = worstPF && (worstPF.managers[0]||'')===nickname;
        const badges = [];
        if (isChamp) badges.push('\ud83c\udfc6 Champion');
        if (isBestPF) badges.push('\ud83d\udcc8 Most Points');
        if (isWorstPF) badges.push('\ud83d\udcc9 Fewest Points');
        if (standing.rank <= 6 && !isChamp) badges.push('Playoff Qualifier');
        if (badges.length > 0) {
          awardsRows += `<div class="mgr-award-row"><span class="mgr-award-year">${s.season}</span><span class="mgr-award-list">${badges.join(' \u00b7 ')}</span></div>`;
        }
      });
      viewHTML = `
        <div class="mgr-section-head">Awards & Records</div>
        <div class="mgr-award-list-wrap">${awardsRows || '<div style="color:var(--bone-muted);font-size:13px;padding:12px">No awards in selected range.</div>'}</div>`;
    }

    // ── ASSEMBLE BODY ──
    document.getElementById('modal-body').innerHTML = filtersHTML + statsHTML + viewHTML;

    // ── BIND EVENTS ──
    document.getElementById('mgr-f-from').onchange = (e) => { filterFrom = +e.target.value; render(); };
    document.getElementById('mgr-f-to').onchange = (e) => { filterTo = +e.target.value; render(); };
    document.getElementById('mgr-f-playoffs').onclick = () => { includePlayoffs = !includePlayoffs; render(); };
    document.querySelectorAll('.mgr-view-tab').forEach(btn => {
      btn.onclick = () => { viewMode = btn.dataset.view; render(); };
    });
    document.querySelectorAll('.mgr-sort-btn').forEach(btn => {
      btn.onclick = () => { h2hSort = btn.dataset.sort; render(); };
    });
  }

  render();
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => { const mc = document.querySelector('.modal-close'); if(mc) mc.focus(); }, 50);
  if (highlightYear) {
    setTimeout(() => {
      const el = document.getElementById('modal-yr-' + highlightYear);
      if (el) el.scrollIntoView({behavior:'smooth', block:'center'});
    }, 200);
  }
}

function buildH2HForManager(nickname) {
  // Legacy compat — kept for any external callers
  return '';
}

function showSeasonModal(year) {
  const s = SEASONS.find(x => x.season === year);
  if (!s) return;
  const finals = getSeasonFinalData(s);
  const mgr = s.champion ? getMgrFromTeamKey(s.champion.team_key, s) || '' : '';
  const championRecord = finals.champTeam || null;
    const ringImg = RING_IMAGES[String(s.season)] || RING_IMAGES['2023'];

  // ── PLAYOFF BRACKET (championship bracket only, no consolation) ──
  const playoffTeamCount = s.num_teams >= 12 ? 6 : 4;
  const regularSeasonSeeded = [...s.standings].sort((a,b) => a.rank - b.rank);
  const playoffSeeds = regularSeasonSeeded.slice(0, playoffTeamCount);
  const seedByKey = new Map(playoffSeeds.map((t, idx) => [t.team_key, idx + 1]));
  const realPlayoffKeys = new Set(playoffSeeds.map(t => t.team_key));
  const playoffMatchups = s.matchups
    .filter(m =>
      m.is_playoffs &&
      realPlayoffKeys.has(m.team1.team_key) &&
      realPlayoffKeys.has(m.team2.team_key)
    )
    .sort((a,b) => a.week - b.week);
  const playoffWeeks = [...new Set(playoffMatchups.map(m => m.week))].sort((a,b) => a - b);
  const bySeed = (a, b) => {
    const aMin = Math.min(seedByKey.get(a.team1.team_key) || 99, seedByKey.get(a.team2.team_key) || 99);
    const bMin = Math.min(seedByKey.get(b.team1.team_key) || 99, seedByKey.get(b.team2.team_key) || 99);
    if (aMin !== bMin) return aMin - bMin;
    const aMax = Math.max(seedByKey.get(a.team1.team_key) || 99, seedByKey.get(a.team2.team_key) || 99);
    const bMax = Math.max(seedByKey.get(b.team1.team_key) || 99, seedByKey.get(b.team2.team_key) || 99);
    return aMax - bMax;
  };

  let bracketHTML = '';
  if (playoffMatchups.length > 0) {
    const winnerKeyOf = (g) => {
      if (g.winner_team_key) return g.winner_team_key;
      if ((g.team1.points || 0) >= (g.team2.points || 0)) return g.team1.team_key;
      return g.team2.team_key;
    };
    const renderRound = (label, wk, games, note = '') => {
      if (!games.length && !note) return;
      bracketHTML += '<div style="margin-bottom:12px">';
      bracketHTML += '<div style="font-family:\'IBM Plex Mono\',monospace;font-size:9px;letter-spacing:2px;color:var(--bone-muted);margin-bottom:6px">' + label + (wk ? ' · WK ' + wk : '') + '</div>';
      if (note) bracketHTML += '<div style="font-family:\'IBM Plex Mono\',monospace;font-size:10px;color:var(--bone-muted);margin-bottom:6px">' + note + '</div>';
      games.forEach(g => {
        const winner = winnerKeyOf(g);
        const t1Won = winner === g.team1.team_key;
        const t2Won = winner === g.team2.team_key;
        bracketHTML += '<div class="bracket-game" style="margin-bottom:4px">' +
          '<div class="bracket-team ' + (t1Won?'winner':'') + '">' +
            '<span class="bracket-team-name">' + g.team1.team_name + '</span>' +
            '<span class="bracket-team-score">' + formatBracketScore(g.team1.points) + '</span>' +
          '</div>' +
          '<div class="bracket-team ' + (t2Won?'winner':'') + '">' +
            '<span class="bracket-team-name">' + g.team2.team_name + '</span>' +
            '<span class="bracket-team-score">' + formatBracketScore(g.team2.points) + '</span>' +
          '</div>' +
        '</div>';
      });
      bracketHTML += '</div>';
    };

    if (playoffTeamCount === 6) {
      const wk1 = playoffWeeks[0];
      const wk2 = playoffWeeks[1] || playoffWeeks[0];
      const wk3 = playoffWeeks[2] || null;
      const seed1 = playoffSeeds[0]?.team_key || null;
      const seed2 = playoffSeeds[1]?.team_key || null;
      const seed3to6 = new Set(playoffSeeds.slice(2).map(t => t.team_key));
      const isFinalsPair = (g) => (
        finals.champKey && finals.runnerKey && (
          (g.team1.team_key === finals.champKey && g.team2.team_key === finals.runnerKey) ||
          (g.team1.team_key === finals.runnerKey && g.team2.team_key === finals.champKey)
        )
      );

      const round1Games = playoffMatchups
        .filter(g => g.week === wk1 && seed3to6.has(g.team1.team_key) && seed3to6.has(g.team2.team_key))
        .sort(bySeed)
        .slice(0, 2);
      const round1Winners = new Set(round1Games.map(g => winnerKeyOf(g)));

      let semifinalGames = playoffMatchups
        .filter(g =>
          g.week === wk2 &&
          !isFinalsPair(g) &&
          (
            ((g.team1.team_key === seed1 || g.team1.team_key === seed2) && round1Winners.has(g.team2.team_key)) ||
            ((g.team2.team_key === seed1 || g.team2.team_key === seed2) && round1Winners.has(g.team1.team_key))
          )
        )
        .sort(bySeed)
        .slice(0, 2);

      if (semifinalGames.length < 2) {
        semifinalGames = playoffMatchups
          .filter(g =>
            g.week === wk2 &&
            !isFinalsPair(g) &&
            (g.team1.team_key === seed1 || g.team2.team_key === seed1 || g.team1.team_key === seed2 || g.team2.team_key === seed2)
          )
          .sort(bySeed)
          .slice(0, 2);
      }

      // Championship should always use resolved finals pair when available.
      let championshipGame = null;
      if (finals.champTeam && finals.runnerTeam) {
        championshipGame = {
          week: wk3 || wk2,
          team1: { team_key: finals.champTeam.team_key, team_name: finals.champTeam.team_name, points: finals.champScore },
          team2: { team_key: finals.runnerTeam.team_key, team_name: finals.runnerTeam.team_name, points: finals.runnerScore },
          winner_team_key: finals.champKey || finals.champTeam.team_key
        };
      } else {
        const semiWinners = new Set(semifinalGames.map(g => winnerKeyOf(g)));
        if (wk3) {
          championshipGame = playoffMatchups.find(g =>
            g.week === wk3 &&
            semiWinners.has(g.team1.team_key) &&
            semiWinners.has(g.team2.team_key)
          ) || null;
        }
      }

      if (round1Games.length >= 2) {
        renderRound('ROUND 1', wk1, round1Games);
      }
      renderRound('SEMIFINALS', wk2, semifinalGames, semifinalGames.length < 2 ? 'Semifinal data is incomplete in source feed' : '');
      renderRound('CHAMPIONSHIP', wk3 || wk2, championshipGame ? [championshipGame] : [], championshipGame ? '' : 'Championship game not present in source feed');
    } else {
      const wk1 = playoffWeeks[0];
      const wk2 = playoffWeeks[1] || playoffWeeks[0];
      const semis = playoffMatchups.filter(g => g.week === wk1).sort(bySeed).slice(0, 2);
      const winners = new Set(semis.map(g => winnerKeyOf(g)));
      let champ = playoffMatchups.find(g =>
        g.week === wk2 &&
        winners.has(g.team1.team_key) &&
        winners.has(g.team2.team_key)
      ) || null;
      if (!champ && semis.length === 2) {
        const winnerArr = semis.map(g => winnerKeyOf(g));
        const t1 = s.standings.find(t => t.team_key === winnerArr[0]);
        const t2 = s.standings.find(t => t.team_key === winnerArr[1]);
        if (t1 && t2) {
          champ = {
            week: wk2,
            team1: { team_key: t1.team_key, team_name: t1.team_name, points: null },
            team2: { team_key: t2.team_key, team_name: t2.team_name, points: null },
            winner_team_key: finals.champKey || t1.team_key
          };
        }
      }
      renderRound('SEMIFINALS', wk1, semis);
      renderRound('CHAMPIONSHIP', wk2, champ ? [champ] : []);
    }
  }

  // ── SEASON AWARDS ──
  const regSeason = s.matchups.filter(m => !m.is_playoffs);
  let allScores = [];
  let allMargins = [];
  const teamTotals = {};

  s.matchups.forEach(m => {
    if (m.team1.points > 0) allScores.push({pts:m.team1.points, team:m.team1.team_name, week:m.week, playoff:m.is_playoffs});
    if (m.team2.points > 0) allScores.push({pts:m.team2.points, team:m.team2.team_name, week:m.week, playoff:m.is_playoffs});
    if (m.team1.points > 0 && m.team2.points > 0) {
      const margin = Math.abs(m.team1.points - m.team2.points);
      const winner = m.team1.points > m.team2.points ? m.team1 : m.team2;
      const loser = m.team1.points > m.team2.points ? m.team2 : m.team1;
      allMargins.push({margin, winner:winner.team_name, loser:loser.team_name, wScore:winner.points, lScore:loser.points, week:m.week});
    }
  });

  // Regular season point totals per team
  regSeason.forEach(m => {
    [m.team1, m.team2].forEach(t => {
      if (t.points > 0) teamTotals[t.team_name] = (teamTotals[t.team_name]||0) + t.points;
    });
  });

  allScores.sort((a,b) => b.pts - a.pts);
  allMargins.sort((a,b) => b.margin - a.margin);
  const closestGames = [...allMargins].sort((a,b) => a.margin - b.margin);

  const weekHigh = allScores[0];
  const weekLow = allScores[allScores.length-1];
  const bigBlowout = allMargins[0];
  const nailbiter = closestGames[0];

  // Regular-season order (for season awards context)
  const regularSeasonStandings = [...s.standings].sort((a,b) => a.rank - b.rank);
  const allSt = s.allStandings || s.standings;
  const byRecord = [...allSt].sort((a,b) => {
    const gpA = (a.wins || 0) + (a.losses || 0) + (a.ties || 0);
    const gpB = (b.wins || 0) + (b.losses || 0) + (b.ties || 0);
    const pctA = gpA ? ((a.wins || 0) + 0.5 * (a.ties || 0)) / gpA : 0;
    const pctB = gpB ? ((b.wins || 0) + 0.5 * (b.ties || 0)) / gpB : 0;
    if (pctA !== pctB) return pctB - pctA;
    return (b.points_for || 0) - (a.points_for || 0);
  });
  const bestRecord = byRecord[0];
  const worstRecord = byRecord[byRecord.length - 1];

  // MVP = most total points (reg season) — compare against ALL teams
  const mvpSorted = [...allSt].sort((a,b) => b.points_for - a.points_for);
  const mvp = mvpSorted[0] ? [mvpSorted[0].team_name, mvpSorted[0].points_for] : null;

  let awardsHTML = '';
  awardsHTML += '<div class="season-awards-grid">';
  if (mvp) awardsHTML += '<div class="season-award"><div class="season-award-label">Season MVP</div><div class="season-award-value">' + mvp[1].toFixed(1) + '</div><div class="season-award-holder">' + mvp[0] + '</div><div class="season-award-context">Most total points (reg. season)</div></div>';
  if (weekHigh) awardsHTML += '<div class="season-award"><div class="season-award-label">Best Single Week</div><div class="season-award-value">' + weekHigh.pts.toFixed(1) + '</div><div class="season-award-holder">' + weekHigh.team + '</div><div class="season-award-context">Week ' + weekHigh.week + (weekHigh.playoff?' · Playoffs':'') + '</div></div>';
  if (bigBlowout) awardsHTML += '<div class="season-award"><div class="season-award-label">Biggest Blowout</div><div class="season-award-value">' + bigBlowout.margin.toFixed(1) + ' pts</div><div class="season-award-holder">' + bigBlowout.winner + '</div><div class="season-award-context">' + bigBlowout.wScore.toFixed(1) + ' – ' + bigBlowout.lScore.toFixed(1) + ' · Wk ' + bigBlowout.week + '</div></div>';
  if (nailbiter) awardsHTML += '<div class="season-award"><div class="season-award-label">Closest Game</div><div class="season-award-value">' + nailbiter.margin.toFixed(2) + ' pts</div><div class="season-award-holder">' + nailbiter.winner + ' vs ' + nailbiter.loser + '</div><div class="season-award-context">' + nailbiter.wScore.toFixed(2) + ' – ' + nailbiter.lScore.toFixed(2) + ' · Wk ' + nailbiter.week + '</div></div>';
  if (weekLow) awardsHTML += '<div class="season-award"><div class="season-award-label">Worst Single Week</div><div class="season-award-value" style="color:#e74c3c">' + weekLow.pts.toFixed(1) + '</div><div class="season-award-holder">' + weekLow.team + '</div><div class="season-award-context">Week ' + weekLow.week + '</div></div>';
  if (worstRecord) awardsHTML += '<div class="season-award"><div class="season-award-label">Worst Record</div><div class="season-award-value" style="color:#e74c3c">' + worstRecord.wins + '-' + worstRecord.losses + '</div><div class="season-award-holder">' + worstRecord.team_name + '</div></div>';
  awardsHTML += '</div>';

  // ── ASSEMBLE MODAL ──
  document.getElementById('modal-header').innerHTML = `
    <div style="display:flex;align-items:flex-start;gap:20px">
      <div>
        <div style="font-family:'Playfair Display',serif;font-weight:900;font-size:clamp(48px,12vw,72px);color:var(--wine-bright);line-height:0.9">${year}</div>
        <div style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--bone-muted);letter-spacing:3px;margin-top:14px">BKGFFL · SEASON ${year - 2012} OF 13</div>
      </div>
    </div>
  `;

  document.getElementById('modal-body').innerHTML = `
    <!-- Championship Banner -->
    <div style="background:linear-gradient(135deg,rgba(114,47,55,0.12) 0%,rgba(201,168,76,0.06) 100%);border:1px solid rgba(114,47,55,0.25);border-radius:var(--radius);padding:clamp(16px,4vw,24px);margin-bottom:20px;text-align:center">
      <div><img src="${ringImg}" alt="${s.season} Championship Ring" style="width:clamp(72px,18vw,96px);height:clamp(72px,18vw,96px);object-fit:cover;border-radius:12px;box-shadow:0 4px 20px rgba(114,47,55,0.4), 0 0 40px rgba(201,168,76,0.15);margin:4px 0;"></div>
      <div style="font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:3px;color:var(--bone-muted);margin-top:10px">CHAMPION</div>
      <div style="font-family:'Playfair Display',serif;font-weight:900;font-size:clamp(22px,6vw,32px);color:var(--bone);margin-top:4px">${s.champion?.team_name||'TBD'}</div>
      <div style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--bone-dim);margin-top:4px">${mgr}${championRecord?' · '+championRecord.wins+'-'+championRecord.losses+' regular season':''}</div>
      ${finals.champScore!==null&&finals.runnerScore!==null?`<div style="font-family:'IBM Plex Mono',monospace;font-size:clamp(18px,5vw,24px);color:var(--wine-bright);margin-top:12px;font-weight:600">${finals.champScore} – ${finals.runnerScore}</div><div style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--bone-muted);margin-top:2px">defeated ${finals.runnerTeam?.team_name||'—'}</div>`:''}
    </div>

    <!-- Season Extremes -->
    <div class="stat-grid-2" style="margin-bottom:20px">
      <div class="stat-box"><div class="stat-box-label">Season High</div><div class="stat-box-num" style="color:var(--green);font-size:clamp(22px,6vw,28px)">${s.season_high_score.points.toFixed(1)}</div><div class="stat-box-sub">${s.season_high_score.team} · Wk ${s.season_high_score.week}</div></div>
      <div class="stat-box"><div class="stat-box-label">Season Low</div><div class="stat-box-num" style="color:#e74c3c;font-size:clamp(22px,6vw,28px)">${s.season_low_score.points.toFixed(1)}</div><div class="stat-box-sub">${s.season_low_score.team} · Wk ${s.season_low_score.week}</div></div>
    </div>

    <!-- Playoff Bracket -->
    ${bracketHTML ? `
    <div style="margin-bottom:24px">
      <div style="font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--wine);letter-spacing:3px;margin-bottom:12px">PLAYOFF BRACKET</div>
      ${bracketHTML}
    </div>
    ` : ''}


    <!-- Season Awards -->
    <div style="margin-bottom:24px">
      <div style="font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--wine);letter-spacing:3px;margin-bottom:10px">SEASON AWARDS</div>
      ${awardsHTML}
    </div>

  `;
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function showTab(tab, btn) {
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('tab-'+tab).classList.add('active');
  if(btn) btn.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


// ── RIVALRIES ────────────────────────────────────────────────
function renderRivalries() {
  const container = document.getElementById('rivalries-container');
  if (!container) return;
  const mgrs = Object.keys(MANAGERS_MAP).filter(m => ALLOWED_MANAGERS.has(m));

  // Pre-index all matchups by manager pair (single pass over all data)
  const pairIndex = {};
  const pairKey = (a, b) => a < b ? a + '|' + b : b + '|' + a;
  SEASONS.forEach(s => {
    s.matchups.forEach(m => {
      const t1 = getMgrFromTeamKey(m.team1.team_key, s);
      const t2 = getMgrFromTeamKey(m.team2.team_key, s);
      if (!t1 || !t2 || !ALLOWED_MANAGERS.has(t1) || !ALLOWED_MANAGERS.has(t2)) return;
      const pk = pairKey(t1, t2);
      if (!pairIndex[pk]) pairIndex[pk] = { a: t1 < t2 ? t1 : t2, b: t1 < t2 ? t2 : t1, aW: 0, bW: 0, games: 0, margins: [], totalPts: 0 };
      const p = pairIndex[pk];
      p.games++;
      if (m.team1.points > 0 && m.team2.points > 0) {
        p.margins.push(Math.abs(m.team1.points - m.team2.points));
        p.totalPts += m.team1.points + m.team2.points;
      }
      if (m.winner_team_key === m.team1.team_key) { if (t1 === p.a) p.aW++; else p.bW++; }
      else if (m.winner_team_key === m.team2.team_key) { if (t2 === p.a) p.aW++; else p.bW++; }
    });
  });

  // Build rivalries from index
  const rivalries = Object.values(pairIndex)
    .filter(p => p.games >= 5)
    .map(p => ({ ...p, avgMargin: p.margins.length ? p.margins.reduce((x, y) => x + y, 0) / p.margins.length : 0 }));

  // Sort by total games played
  rivalries.sort((x,y) => y.games - x.games);
  const top10 = rivalries.slice(0, 10);

  top10.forEach((r, idx) => {
    const aTeam = MANAGERS_MAP[r.a]?.teamName || r.a;
    const bTeam = MANAGERS_MAP[r.b]?.teamName || r.b;
    const aLead = r.aW > r.bW;
    const tied = r.aW === r.bW;
    const card = document.createElement('div');
    card.className = 'rivalry-card';
    card.innerHTML = `
      <div>
        <div class="rivalry-team" style="color:${aLead?'var(--wine)':tied?'var(--bone)':'var(--bone-dim)'}">${aTeam}</div>
        <div class="rivalry-stat">${r.aW} wins · ${(r.aW/r.games*100).toFixed(0)}%</div>
      </div>
      <div>
        <div class="rivalry-vs">VS</div>
        <div class="rivalry-record">${r.aW} – ${r.bW}</div>
        <div style="font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--bone-dim);text-align:center;margin-top:4px">${r.games} GAMES · AVG MARGIN ${r.avgMargin.toFixed(1)}</div>
      </div>
      <div style="text-align:right">
        <div class="rivalry-team" style="color:${!aLead&&!tied?'var(--wine)':tied?'var(--bone)':'var(--bone-dim)'}">${bTeam}</div>
        <div class="rivalry-stat" style="text-align:right">${r.bW} wins · ${(r.bW/r.games*100).toFixed(0)}%</div>
      </div>
    `;
    card.onclick = () => showH2HModal(r.a, r.b);
    container.appendChild(card);
  });
}

// ── DROUGHT (merged into Records tab) ─────────────────────────
// ── PLAYOFF PERFORMANCE ─────────────────────────────────────
function renderPlayoffPerformance() {
  const container = document.getElementById('records-playoffs');
  if (!container) return;

  const stats = {};
  Object.keys(MANAGERS_MAP).forEach(mgr => {
    if (!ALLOWED_MANAGERS.has(mgr)) return;
    stats[mgr] = { wins: 0, losses: 0, appearances: 0, titles: 0, runnerUps: 0, bestWeek: 0, seeds: [], upsets: 0 };
  });

  SEASONS.forEach(s => {
    const fullSt = s.allStandings || s.standings;
    const fullMu = s.allMatchups || s.matchups;
    const bracketKeys = new Set();
    fullSt.forEach(t => { if (t.rank <= 6) bracketKeys.add(t.team_key); });

    const champMgr = s.champion ? getMgrFromTeamKeyFull(s.champion.team_key, fullSt) : null;
    const runnerMgr = s.runner_up ? getMgrFromTeamKeyFull(s.runner_up.team_key, fullSt) : null;

    // Track appearances and seeds
    fullSt.forEach(t => {
      if (t.rank > 6) return;
      const mgr = t.managers[0] || null;
      if (mgr && stats[mgr]) {
        stats[mgr].appearances++;
        stats[mgr].seeds.push(t.rank);
      }
    });

    if (champMgr && stats[champMgr]) stats[champMgr].titles++;
    if (runnerMgr && stats[runnerMgr]) stats[runnerMgr].runnerUps++;

    // Compute true seeding from regular season record (not post-playoff rank)
    const seeding = [...fullSt].sort((a, b) => b.wins - a.wins || b.points_for - a.points_for);
    const seedMap = {};
    seeding.forEach((t, i) => { seedMap[t.team_key] = i + 1; });

    // Track playoff wins/losses and upsets from ALL matchups
    fullMu.forEach(m => {
      if (!m.is_playoffs) return;
      if (!bracketKeys.has(m.team1.team_key) || !bracketKeys.has(m.team2.team_key)) return;
      if (!m.winner_team_key) return;
      const mgr1 = getMgrFromTeamKeyFull(m.team1.team_key, fullSt);
      const mgr2 = getMgrFromTeamKeyFull(m.team2.team_key, fullSt);

      const winnerMgr = m.winner_team_key === m.team1.team_key ? mgr1 : mgr2;
      const loserMgr = m.winner_team_key === m.team1.team_key ? mgr2 : mgr1;
      if (stats[winnerMgr]) stats[winnerMgr].wins++;
      if (stats[loserMgr]) stats[loserMgr].losses++;

      // Track best playoff week (only for allowed managers)
      const winnerPts = m.winner_team_key === m.team1.team_key ? m.team1.points : m.team2.points;
      const loserPts = m.winner_team_key === m.team1.team_key ? m.team2.points : m.team1.points;
      if (stats[winnerMgr] && winnerPts > stats[winnerMgr].bestWeek) stats[winnerMgr].bestWeek = winnerPts;
      if (stats[loserMgr] && loserPts > stats[loserMgr].bestWeek) stats[loserMgr].bestWeek = loserPts;

      // Check upset: winner had a worse seed (higher number) than loser
      const winnerKey = m.winner_team_key === m.team1.team_key ? m.team1.team_key : m.team2.team_key;
      const loserKey = m.winner_team_key === m.team1.team_key ? m.team2.team_key : m.team1.team_key;
      if (seedMap[winnerKey] > seedMap[loserKey]) {
        if (stats[winnerMgr]) stats[winnerMgr].upsets++;
      }
    });
  });

  const results = Object.entries(stats)
    .filter(([,d]) => d.appearances > 0)
    .map(([mgr, d]) => {
      const totalGames = d.wins + d.losses;
      const winPct = totalGames > 0 ? d.wins / totalGames : 0;
      const avgSeed = d.seeds.length > 0 ? d.seeds.reduce((a,b) => a+b, 0) / d.seeds.length : 0;
      return { mgr, teamName: MANAGERS_MAP[mgr].teamName, ...d, totalGames, winPct, avgSeed };
    })
    .sort((a, b) => {
      if (b.titles !== a.titles) return b.titles - a.titles;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.winPct - a.winPct;
    });

  let html = '<div class="records-chapter-header">';
  html += '<div class="records-chapter-label">Chapter</div>';
  html += '<div class="records-chapter-title">Playoff Performance</div>';
  html += '<div class="records-chapter-sub">When it matters most \u2014 who shows up and who folds?</div>';
  html += '</div>';

  // Column headers
  html += '<div class="drought-row" style="background:none;border:none;padding:4px 14px;opacity:0.5">';
  html += '<div class="drought-row-rank"></div>';
  html += '<div class="drought-row-name" style="font-size:9px;letter-spacing:2px">FRANCHISE</div>';
  html += '<div style="min-width:60px;text-align:center;font-family:\'IBM Plex Mono\',monospace;font-size:8px;letter-spacing:1.5px;color:var(--bone-muted)">WIN%</div>';
  html += '<div style="min-width:70px;text-align:center;font-family:\'IBM Plex Mono\',monospace;font-size:8px;letter-spacing:1.5px;color:var(--bone-muted)">RECORD</div>';
  html += '<div style="min-width:40px;text-align:center;font-family:\'IBM Plex Mono\',monospace;font-size:8px;letter-spacing:1.5px;color:var(--bone-muted)">APPS</div>';
  html += '<div style="min-width:50px;text-align:center;font-family:\'IBM Plex Mono\',monospace;font-size:8px;letter-spacing:1.5px;color:var(--bone-muted)">UPSETS</div>';
  html += '<div style="min-width:55px;text-align:center;font-family:\'IBM Plex Mono\',monospace;font-size:8px;letter-spacing:1.5px;color:var(--bone-muted)">BEST WK</div>';
  html += '</div>';

  html += '<div class="luck-list">';
  results.forEach((r, i) => {
    const trophies = '\ud83c\udfc6'.repeat(r.titles) + '\ud83e\udd48'.repeat(r.runnerUps);
    const pctColor = r.winPct >= 0.600 ? '#c9a84c' : r.winPct >= 0.500 ? '#4ade80' : r.winPct >= 0.400 ? 'var(--bone)' : 'rgba(248,113,113,0.8)';
    const pctLabel = r.totalGames > 0 ? (r.winPct * 100).toFixed(0) + '%' : '\u2014';

    html += `<div class="drought-row${i < 3 ? ' drought-row--top' : ''}">
      <div class="drought-row-rank">${i + 1}</div>
      <div class="drought-row-name">${r.teamName} ${trophies}</div>
      <div style="min-width:60px;text-align:center;font-family:'IBM Plex Mono',monospace;font-size:14px;font-weight:600;color:${pctColor}">${pctLabel}</div>
      <div style="min-width:70px;text-align:center;font-family:'IBM Plex Mono',monospace;font-size:13px;color:var(--bone)">${r.wins}W\u2013${r.losses}L</div>
      <div style="min-width:40px;text-align:center;font-family:'IBM Plex Mono',monospace;font-size:13px;color:var(--bone-dim)">${r.appearances}</div>
      <div style="min-width:50px;text-align:center;font-family:'IBM Plex Mono',monospace;font-size:13px;color:${r.upsets > 0 ? '#c9a84c' : 'var(--bone-dim)'}">${r.upsets}</div>
      <div style="min-width:55px;text-align:center;font-family:'IBM Plex Mono',monospace;font-size:13px;color:var(--bone-dim)">${r.bestWeek > 0 ? r.bestWeek.toFixed(1) : '\u2014'}</div>
    </div>`;
  });
  html += '</div>';

  container.innerHTML = html;
}

// ── CLOSE GAMES ─────────────────────────────────────────────
function renderCloseGames() {
  const container = document.getElementById('records-close');
  if (!container) return;

  const CLOSE_MARGIN = 5;
  const stats = {};
  Object.keys(MANAGERS_MAP).forEach(mgr => {
    if (!ALLOWED_MANAGERS.has(mgr)) return;
    stats[mgr] = { closeWins: 0, closeLosses: 0 };
  });

  const closestGames = [];

  SEASONS.forEach(s => {
    s.matchups.forEach(m => {
      if (!isNonConsolationGame(m, s)) return;
      if (!m.winner_team_key) return;
      const mgr1 = getMgrFromTeamKey(m.team1.team_key, s);
      const mgr2 = getMgrFromTeamKey(m.team2.team_key, s);
      if (!mgr1 || !mgr2 || !stats[mgr1] || !stats[mgr2]) return;

      const margin = Math.abs(m.team1.points - m.team2.points);
      if (margin > CLOSE_MARGIN) return;

      const winnerMgr = m.winner_team_key === m.team1.team_key ? mgr1 : mgr2;
      const loserMgr = m.winner_team_key === m.team1.team_key ? mgr2 : mgr1;
      stats[winnerMgr].closeWins++;
      stats[loserMgr].closeLosses++;

      closestGames.push({
        margin,
        winner: MANAGERS_MAP[winnerMgr].teamName,
        loser: MANAGERS_MAP[loserMgr].teamName,
        score: m.team1.points > m.team2.points
          ? m.team1.points.toFixed(1) + '\u2013' + m.team2.points.toFixed(1)
          : m.team2.points.toFixed(1) + '\u2013' + m.team1.points.toFixed(1),
        week: m.week, year: s.season,
        isPlayoff: isTruePlayoffGame(m, s),
      });
    });
  });

  const results = Object.entries(stats)
    .filter(([,d]) => d.closeWins + d.closeLosses > 0)
    .map(([mgr, d]) => {
      const total = d.closeWins + d.closeLosses;
      const winPct = total > 0 ? d.closeWins / total : 0;
      return { mgr, teamName: MANAGERS_MAP[mgr].teamName, ...d, total, winPct };
    })
    .sort((a, b) => b.winPct !== a.winPct ? b.winPct - a.winPct : b.total - a.total);

  closestGames.sort((a, b) => a.margin - b.margin);

  let html = '<div class="records-chapter-header">';
  html += '<div class="records-chapter-label">Chapter</div>';
  html += '<div class="records-chapter-title">Close Games</div>';
  html += '<div class="records-chapter-sub">Games decided by 5 points or less \u2014 ice in the veins or heartbreak on repeat?</div>';
  html += '</div>';

  // Leaderboard
  html += '<div class="luck-list">';
  results.forEach((r, i) => {
    const barWidth = r.total > 0 ? r.winPct * 100 : 50;
    const pctColor = r.winPct >= 0.600 ? '#4ade80' : r.winPct < 0.400 ? '#f87171' : 'var(--bone)';
    const label = r.winPct >= 0.600 ? 'CLUTCH' : r.winPct < 0.400 ? 'HEARTBREAK' : '';
    html += `<div class="drought-row${i < 3 ? ' drought-row--top' : ''}">
      <div class="drought-row-rank">${i+1}</div>
      <div class="drought-row-name">${r.teamName}</div>
      <div class="drought-row-bar">
        <div style="width:${barWidth}%;height:100%;background:${r.winPct >= 0.5 ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)'};border-radius:4px;transition:width 0.3s"></div>
      </div>
      <div class="drought-row-tag" style="color:${pctColor};min-width:55px">${(r.winPct*100).toFixed(0)}%</div>
      <div class="drought-row-last">${r.closeWins}W\u2013${r.closeLosses}L (${r.total} games)</div>
    </div>`;
  });
  html += '</div>';

  // Top 5 closest games of all time
  if (closestGames.length > 0) {
    html += '<div style="margin-top:24px;font-family:\'IBM Plex Mono\',monospace;font-size:10px;letter-spacing:2px;color:var(--bone-muted)">CLOSEST GAMES OF ALL TIME (EXCLUDING TIES)</div>';
    html += '<div class="luck-list" style="margin-top:8px">';
    closestGames.slice(0, 7).forEach((g, i) => {
      const poTag = g.isPlayoff ? ' <span style="color:var(--wine-bright);font-size:9px">PLAYOFF</span>' : '';
      html += `<div class="drought-row">
        <div class="drought-row-rank">${i+1}</div>
        <div class="drought-row-name">${g.winner} def. ${g.loser}${poTag}</div>
        <div class="drought-row-tag" style="color:#c9a84c">+${g.margin.toFixed(1)}</div>
        <div class="drought-row-last">${g.score} \u00b7 Wk${g.week}, ${g.year}</div>
      </div>`;
    });
    html += '</div>';
  }

  container.innerHTML = html;
}

// ── BLOWOUT DEALERS ─────────────────────────────────────────
function renderBlowoutDealers() {
  const container = document.getElementById('records-blowouts');
  if (!container) return;

  const BLOWOUT_MARGIN = 20;
  const stats = {};
  Object.keys(MANAGERS_MAP).forEach(mgr => {
    if (!ALLOWED_MANAGERS.has(mgr)) return;
    stats[mgr] = { dealt: 0, received: 0, biggestWin: 0, biggestLoss: 0 };
  });

  SEASONS.forEach(s => {
    s.matchups.forEach(m => {
      if (!isNonConsolationGame(m, s)) return;
      if (!m.winner_team_key) return;
      const mgr1 = getMgrFromTeamKey(m.team1.team_key, s);
      const mgr2 = getMgrFromTeamKey(m.team2.team_key, s);
      if (!mgr1 || !mgr2 || !stats[mgr1] || !stats[mgr2]) return;

      const margin = Math.abs(m.team1.points - m.team2.points);
      if (margin < BLOWOUT_MARGIN) return;

      const winnerMgr = m.winner_team_key === m.team1.team_key ? mgr1 : mgr2;
      const loserMgr = m.winner_team_key === m.team1.team_key ? mgr2 : mgr1;
      stats[winnerMgr].dealt++;
      stats[loserMgr].received++;
      if (margin > stats[winnerMgr].biggestWin) stats[winnerMgr].biggestWin = margin;
      if (margin > stats[loserMgr].biggestLoss) stats[loserMgr].biggestLoss = margin;
    });
  });

  const results = Object.entries(stats)
    .filter(([, d]) => d.dealt + d.received > 0)
    .map(([mgr, d]) => ({ mgr, teamName: MANAGERS_MAP[mgr].teamName, ...d, ratio: d.dealt / (d.received || 1) }))
    .sort((a, b) => b.dealt !== a.dealt ? b.dealt - a.dealt : a.received - b.received);

  let html = '<div class="records-chapter-header">';
  html += '<div class="records-chapter-label">Chapter</div>';
  html += '<div class="records-chapter-title">Taken to the Shed</div>';
  html += '<div class="records-chapter-sub">Games won or lost by 20+ points \u2014 who does the taking and who gets taken?</div>';
  html += '</div>';

  html += '<div class="luck-list">';
  results.forEach((r, i) => {
    const total = r.dealt + r.received;
    const dealPct = total > 0 ? (r.dealt / total) * 100 : 50;
    const isDominant = r.dealt > r.received * 1.5;
    const isVictim = r.received > r.dealt * 1.5;
    const color = isDominant ? '#c9a84c' : isVictim ? '#f87171' : 'var(--bone)';
    const tag = isDominant ? 'BULLY' : isVictim ? 'VICTIM' : '';

    html += `<div class="drought-row${i < 3 ? ' drought-row--top' : ''}">
      <div class="drought-row-rank">${i + 1}</div>
      <div class="drought-row-name">${r.teamName}</div>
      <div class="drought-row-bar">
        <div style="width:${dealPct}%;height:100%;background:rgba(201,168,76,0.4);border-radius:4px 0 0 4px"></div>
        <div style="width:${100 - dealPct}%;height:100%;background:rgba(248,113,113,0.3);border-radius:0 4px 4px 0"></div>
      </div>
      <div class="drought-row-tag" style="color:${color};min-width:55px">${tag}</div>
      <div class="drought-row-last">${r.dealt} dealt \u00b7 ${r.received} received \u00b7 max +${r.biggestWin.toFixed(1)}</div>
    </div>`;
  });
  html += '</div>';

  container.innerHTML = html;
}

// ── STRENGTH OF SCHEDULE ────────────────────────────────────
function renderSOS() {
  const container = document.getElementById('records-sos');
  if (!container) return;

  const results = Object.values(MANAGERS_MAP)
    .filter(m => ALLOWED_MANAGERS.has(m.nickname) && m.seasons > 0)
    .map(m => {
      const totalGames = m.wins + m.losses + m.ties;
      const avgPA = totalGames > 0 ? m.pointsAgainst / totalGames : 0;
      const avgPF = m.avgPts;
      const pfPaDelta = avgPF - avgPA;
      return { mgr: m.nickname, teamName: m.teamName, avgPA, avgPF, pfPaDelta, totalPA: m.pointsAgainst, seasons: m.seasons, totalGames };
    });

  // Sort by hardest schedule (highest avg PA = toughest opponents)
  results.sort((a, b) => b.avgPA - a.avgPA);
  const maxPA = results.length > 0 ? results[0].avgPA : 100;
  const minPA = results.length > 0 ? results[results.length - 1].avgPA : 80;
  const range = maxPA - minPA || 1;

  let html = '<div class="records-chapter-header">';
  html += '<div class="records-chapter-label">Chapter</div>';
  html += '<div class="records-chapter-title">Strength of Schedule</div>';
  html += '<div class="records-chapter-sub">Average points scored against you per week \u2014 who draws the hardest matchups?</div>';
  html += '</div>';

  html += '<div class="luck-list">';
  results.forEach((r, i) => {
    const barWidth = range > 0 ? ((r.avgPA - minPA) / range) * 100 : 50;
    const isHard = i < 4;
    const isEasy = i >= results.length - 4;
    const color = isHard ? '#f87171' : isEasy ? '#4ade80' : 'var(--bone)';
    const tag = isHard ? 'HARD' : isEasy ? 'EASY' : '';
    const deltaStr = (r.pfPaDelta >= 0 ? '+' : '') + r.pfPaDelta.toFixed(1);
    const deltaColor = r.pfPaDelta >= 0 ? '#4ade80' : '#f87171';

    html += `<div class="drought-row${i < 3 ? ' drought-row--top' : ''}">
      <div class="drought-row-rank">${i + 1}</div>
      <div class="drought-row-name">${r.teamName}</div>
      <div class="drought-row-bar">
        <div style="width:${barWidth}%;height:100%;background:${isHard ? 'rgba(248,113,113,0.4)' : isEasy ? 'rgba(74,222,128,0.3)' : 'rgba(232,220,200,0.15)'};border-radius:4px;transition:width 0.3s"></div>
      </div>
      <div class="drought-row-tag" style="color:${color};min-width:50px">${r.avgPA.toFixed(1)}</div>
      <div class="drought-row-last">PF/PA diff: <span style="color:${deltaColor}">${deltaStr}</span> ppg</div>
    </div>`;
  });
  html += '</div>';
  html += '<div style="font-family:\'IBM Plex Mono\',monospace;font-size:9px;color:var(--bone-muted);letter-spacing:1.5px;padding:16px 0 0;text-align:center">AVG POINTS AGAINST PER GAME \u2014 HIGHER = TOUGHER OPPONENTS FACED</div>';

  container.innerHTML = html;
}

// ── SCORING CONSISTENCY ─────────────────────────────────────
function renderConsistency() {
  const container = document.getElementById('records-consistency');
  if (!container) return;

  const results = Object.values(MANAGERS_MAP)
    .filter(m => ALLOWED_MANAGERS.has(m.nickname) && m.weeklyScores.length >= 10)
    .map(m => {
      const scores = m.weeklyScores;
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const variance = scores.reduce((sum, s) => sum + (s - avg) ** 2, 0) / scores.length;
      const stdDev = Math.sqrt(variance);
      const cv = avg > 0 ? (stdDev / avg) * 100 : 0; // coefficient of variation
      const boom = scores.filter(s => s >= avg * 1.25).length; // 25%+ above avg
      const bust = scores.filter(s => s <= avg * 0.75).length; // 25%+ below avg
      return { mgr: m.nickname, teamName: m.teamName, avg, stdDev, cv, boom, bust, games: scores.length };
    });

  // Sort by consistency (low CV = most consistent)
  const consistent = [...results].sort((a, b) => a.cv - b.cv);

  let html = '<div class="records-chapter-header">';
  html += '<div class="records-chapter-label">Chapter</div>';
  html += '<div class="records-chapter-title">Scoring Consistency</div>';
  html += '<div class="records-chapter-sub">Who delivers every week vs. who gives you 150 one week and 60 the next?</div>';
  html += '</div>';

  html += '<div class="luck-list">';
  consistent.forEach((r, i) => {
    const barWidth = 100 - Math.min(r.cv, 30) / 30 * 100; // lower CV = wider bar
    const isConsistent = r.cv < 18;
    const isVolatile = r.cv > 24;
    const color = isConsistent ? '#4ade80' : isVolatile ? '#f87171' : 'var(--bone)';
    const tag = isConsistent ? 'STEADY' : isVolatile ? 'VOLATILE' : '';
    html += `<div class="drought-row${i < 3 ? ' drought-row--top' : ''}">
      <div class="drought-row-rank">${i+1}</div>
      <div class="drought-row-name">${r.teamName}</div>
      <div class="drought-row-bar">
        <div style="width:${barWidth}%;height:100%;background:${isConsistent ? 'rgba(74,222,128,0.4)' : isVolatile ? 'rgba(248,113,113,0.4)' : 'rgba(232,220,200,0.15)'};border-radius:4px;transition:width 0.3s"></div>
      </div>
      <div class="drought-row-tag" style="color:${color};min-width:70px">${tag}</div>
      <div class="drought-row-last">\u00b1${r.stdDev.toFixed(1)} pts \u00b7 ${r.boom} booms \u00b7 ${r.bust} busts</div>
    </div>`;
  });
  html += '</div>';
  html += '<div style="font-family:\'IBM Plex Mono\',monospace;font-size:9px;color:var(--bone-muted);letter-spacing:1.5px;padding:16px 0 0;text-align:center">RANKED BY COEFFICIENT OF VARIATION (LOWER = MORE CONSISTENT)</div>';

  container.innerHTML = html;
}

// ── BEST SEASONS EVER ───────────────────────────────────────
function renderBestSeasons() {
  const container = document.getElementById('records-bestseason');
  if (!container) return;

  const allSeasons = [];
  SEASONS.forEach(s => {
    s.standings.forEach(t => {
      const mgr = getMgrFromTeamKey(t.team_key, s);
      if (!mgr || !ALLOWED_MANAGERS.has(mgr)) return;
      const totalGames = t.wins + t.losses + t.ties;
      const winPct = totalGames > 0 ? t.wins / totalGames : 0;
      const isChamp = s.champion && getMgrFromTeamKey(s.champion.team_key, s) === mgr;
      const madePlayoffs = t.rank <= 6;
      // Composite score: winPct weighted heavily, bonus for championship/playoffs
      const composite = winPct * 60 + (t.points_for / 100) * 0.2 + (isChamp ? 15 : 0) + (madePlayoffs ? 5 : 0);
      allSeasons.push({
        mgr, teamName: MANAGERS_MAP[mgr].teamName, year: s.season,
        wins: t.wins, losses: t.losses, ties: t.ties, winPct,
        pf: t.points_for, rank: t.rank, isChamp, madePlayoffs, composite,
      });
    });
  });

  allSeasons.sort((a, b) => b.composite - a.composite);
  const top12 = allSeasons.slice(0, 12);

  let html = '<div class="records-chapter-header">';
  html += '<div class="records-chapter-label">Chapter</div>';
  html += '<div class="records-chapter-title">Best Seasons Ever</div>';
  html += '<div class="records-chapter-sub">The most dominant individual seasons in league history</div>';
  html += '</div>';

  html += '<div class="luck-list">';
  top12.forEach((r, i) => {
    const record = r.ties > 0 ? r.wins + 'W\u2013' + r.losses + 'L\u2013' + r.ties + 'T' : r.wins + 'W\u2013' + r.losses + 'L';
    const champBadge = r.isChamp ? ' <span style="color:#c9a84c">\ud83c\udfc6</span>' : '';
    const playoffTag = r.madePlayoffs ? '<span style="color:var(--wine-bright);font-size:9px;margin-left:4px">PLAYOFF</span>' : '';
    const borderColor = i === 0 ? 'border-color:rgba(201,168,76,0.3)' : i === 1 ? 'border-color:rgba(192,192,192,0.2)' : i === 2 ? 'border-color:rgba(180,130,70,0.2)' : '';

    html += `<div class="drought-row${i < 3 ? ' drought-row--top' : ''}" style="${borderColor}">
      <div class="drought-row-rank">${i+1}</div>
      <div class="drought-row-name">${r.teamName}${champBadge}</div>
      <div class="drought-row-tag" style="color:var(--bone);min-width:55px">${record}</div>
      <div class="drought-row-last">${r.year} \u00b7 ${r.pf.toFixed(0)} PF \u00b7 #${r.rank} finish${playoffTag}</div>
    </div>`;
  });
  html += '</div>';

  container.innerHTML = html;
}

// ── STRANGE BUT TRUE ────────────────────────────────────────
function renderOddities() {
  const container = document.getElementById('records-oddities');
  if (!container) return;

  let highLoss = null;   // Most points scored in a loss
  let lowWin = null;     // Fewest points scored in a win
  let bigComeback = null; // Biggest margin overcome (won despite trailing in pts? — reframe as closest game where lower scorer won doesn't apply, so: biggest blowout WIN while having lower season rank)
  let ties = [];         // All tied games
  let scoreless = null;  // Lowest combined score in a game
  let shootout = null;   // Highest combined score in a game
  let sameLine = null;   // Closest non-tie game (smallest margin)

  SEASONS.forEach(s => {
    s.matchups.forEach(m => {
      if (!isNonConsolationGame(m, s)) return;
      const mgr1 = getMgrFromTeamKey(m.team1.team_key, s);
      const mgr2 = getMgrFromTeamKey(m.team2.team_key, s);
      if (!mgr1 || !mgr2 || !ALLOWED_MANAGERS.has(mgr1) || !ALLOWED_MANAGERS.has(mgr2)) return;

      const p1 = m.team1.points, p2 = m.team2.points;
      if (p1 <= 0 || p2 <= 0) return;
      const combined = p1 + p2;
      const margin = Math.abs(p1 - p2);

      // Tied games
      if (p1 === p2) {
        ties.push({ t1: MANAGERS_MAP[mgr1]?.teamName || mgr1, t2: MANAGERS_MAP[mgr2]?.teamName || mgr2, pts: p1, week: m.week, year: s.season });
      }

      // Most points in a loss
      if (m.winner_team_key) {
        const loserPts = m.winner_team_key === m.team1.team_key ? p2 : p1;
        const loserMgr = m.winner_team_key === m.team1.team_key ? mgr2 : mgr1;
        const winnerPts = m.winner_team_key === m.team1.team_key ? p1 : p2;
        const winnerMgr = m.winner_team_key === m.team1.team_key ? mgr1 : mgr2;
        if (!highLoss || loserPts > highLoss.pts) {
          highLoss = { team: MANAGERS_MAP[loserMgr]?.teamName || loserMgr, pts: loserPts, oppPts: winnerPts, opp: MANAGERS_MAP[winnerMgr]?.teamName || winnerMgr, week: m.week, year: s.season };
        }
        // Fewest points in a win
        if (!lowWin || winnerPts < lowWin.pts) {
          lowWin = { team: MANAGERS_MAP[winnerMgr]?.teamName || winnerMgr, pts: winnerPts, oppPts: loserPts, opp: MANAGERS_MAP[loserMgr]?.teamName || loserMgr, week: m.week, year: s.season };
        }
      }

      // Shootout (highest combined)
      if (!shootout || combined > shootout.combined) {
        shootout = { t1: MANAGERS_MAP[mgr1]?.teamName || mgr1, t2: MANAGERS_MAP[mgr2]?.teamName || mgr2, p1, p2, combined, week: m.week, year: s.season };
      }

      // Lowest combined
      if (!scoreless || combined < scoreless.combined) {
        scoreless = { t1: MANAGERS_MAP[mgr1]?.teamName || mgr1, t2: MANAGERS_MAP[mgr2]?.teamName || mgr2, p1, p2, combined, week: m.week, year: s.season };
      }

      // Closest non-tie
      if (margin > 0 && (!sameLine || margin < sameLine.margin)) {
        sameLine = { t1: MANAGERS_MAP[mgr1]?.teamName || mgr1, t2: MANAGERS_MAP[mgr2]?.teamName || mgr2, p1, p2, margin, week: m.week, year: s.season };
      }
    });
  });

  let html = '<div class="records-chapter-header">';
  html += '<div class="records-chapter-label">Chapter</div>';
  html += '<div class="records-chapter-title">Strange But True</div>';
  html += '<div class="records-chapter-sub">The weirdest, most painful, and most absurd stats in league history</div>';
  html += '</div>';

  const oddities = [];
  if (highLoss) oddities.push({ icon: '\ud83d\ude29', title: 'Most Points in a Loss', main: highLoss.pts.toFixed(1) + ' pts', sub: highLoss.team + ' lost to ' + highLoss.opp + ' (' + highLoss.oppPts.toFixed(1) + ')', ctx: 'Wk ' + highLoss.week + ', ' + highLoss.year });
  if (lowWin) oddities.push({ icon: '\ud83d\ude2c', title: 'Fewest Points in a Win', main: lowWin.pts.toFixed(1) + ' pts', sub: lowWin.team + ' beat ' + lowWin.opp + ' (' + lowWin.oppPts.toFixed(1) + ')', ctx: 'Wk ' + lowWin.week + ', ' + lowWin.year });
  if (shootout) oddities.push({ icon: '\ud83d\udca5', title: 'Highest-Scoring Game', main: shootout.combined.toFixed(1) + ' combined', sub: shootout.t1 + ' (' + shootout.p1.toFixed(1) + ') vs ' + shootout.t2 + ' (' + shootout.p2.toFixed(1) + ')', ctx: 'Wk ' + shootout.week + ', ' + shootout.year });
  if (scoreless) oddities.push({ icon: '\ud83d\udca4', title: 'Lowest-Scoring Game', main: scoreless.combined.toFixed(1) + ' combined', sub: scoreless.t1 + ' (' + scoreless.p1.toFixed(1) + ') vs ' + scoreless.t2 + ' (' + scoreless.p2.toFixed(1) + ')', ctx: 'Wk ' + scoreless.week + ', ' + scoreless.year });
  if (sameLine) oddities.push({ icon: '\ud83e\udea2', title: 'Closest Game Ever', main: '+' + sameLine.margin.toFixed(1) + ' margin', sub: sameLine.t1 + ' (' + sameLine.p1.toFixed(1) + ') vs ' + sameLine.t2 + ' (' + sameLine.p2.toFixed(1) + ')', ctx: 'Wk ' + sameLine.week + ', ' + sameLine.year });
  if (ties.length > 0) oddities.push({ icon: '\ud83e\udd1d', title: 'Total Tied Games', main: ties.length + ' ties', sub: ties.map(t => t.t1 + ' vs ' + t.t2 + ' (' + t.pts.toFixed(1) + ')').slice(0, 3).join(' \u00b7 '), ctx: 'Across all seasons' });

  html += '<div class="oddities-grid">';
  oddities.forEach(o => {
    html += '<div class="oddity-card">' +
      '<div class="oddity-icon">' + o.icon + '</div>' +
      '<div class="oddity-content">' +
        '<div class="oddity-title">' + o.title + '</div>' +
        '<div class="oddity-main">' + o.main + '</div>' +
        '<div class="oddity-sub">' + o.sub + '</div>' +
        '<div class="oddity-ctx">' + o.ctx + '</div>' +
      '</div>' +
    '</div>';
  });
  html += '</div>';

  container.innerHTML = html;
}

// ── LUCK FACTOR ─────────────────────────────────────────────
function renderLuckFactor() {
  const container = document.getElementById('records-luck');
  if (!container) return;

  // Accumulate all-play expected wins vs actual wins per manager
  const luckData = {};
  Object.keys(MANAGERS_MAP).forEach(mgr => {
    if (!ALLOWED_MANAGERS.has(mgr)) return;
    luckData[mgr] = { expectedWins: 0, actualWins: 0, actualLosses: 0, seasons: 0 };
  });

  SEASONS.forEach(s => {
    const playoffStart = s.playoff_start_week || 14;

    // Gather regular-season weekly scores per team
    const weeklyScores = {};
    s.matchups.forEach(m => {
      if (m.week >= playoffStart) return; // regular season only
      const mgr1 = getMgrFromTeamKey(m.team1.team_key, s);
      const mgr2 = getMgrFromTeamKey(m.team2.team_key, s);
      if (!mgr1 || !mgr2) return;
      if (!ALLOWED_MANAGERS.has(mgr1) || !ALLOWED_MANAGERS.has(mgr2)) return;

      if (!weeklyScores[m.week]) weeklyScores[m.week] = [];
      weeklyScores[m.week].push({ mgr: mgr1, pts: m.team1.points });
      weeklyScores[m.week].push({ mgr: mgr2, pts: m.team2.points });
    });

    // Track which managers participated this season
    const seasonMgrs = new Set();

    // For each week, compute all-play record
    Object.values(weeklyScores).forEach(scores => {
      scores.forEach(entry => {
        if (!luckData[entry.mgr]) return;
        seasonMgrs.add(entry.mgr);
        const opponents = scores.filter(o => o.mgr !== entry.mgr);
        const wins = opponents.filter(o => entry.pts > o.pts).length;
        const ties = opponents.filter(o => entry.pts === o.pts).length;
        luckData[entry.mgr].expectedWins += (wins + ties * 0.5) / (opponents.length || 1);
      });
    });

    // Actual wins from standings
    s.standings.forEach(t => {
      const mgr = getMgrFromTeamKey(t.team_key, s);
      if (mgr && luckData[mgr] && seasonMgrs.has(mgr)) {
        luckData[mgr].actualWins += t.wins;
        luckData[mgr].actualLosses += t.losses;
        luckData[mgr].seasons++;
      }
    });
  });

  // Build sorted array by luck index (actual - expected)
  const results = Object.entries(luckData)
    .filter(([,d]) => d.seasons > 0)
    .map(([mgr, d]) => ({
      mgr,
      teamName: MANAGERS_MAP[mgr].teamName,
      expectedWins: d.expectedWins,
      actualWins: d.actualWins,
      delta: d.actualWins - d.expectedWins,
      seasons: d.seasons,
    }))
    .sort((a, b) => b.delta - a.delta);

  const maxDelta = Math.max(...results.map(r => Math.abs(r.delta)), 1);

  // Render
  let html = '<div class="records-chapter-header">';
  html += '<div class="records-chapter-label">Chapter</div>';
  html += '<div class="records-chapter-title">Luck Factor</div>';
  html += '<div class="records-chapter-sub">All-play expected wins vs. actual record \u2014 who got carried by the schedule?</div>';
  html += '</div>';

  html += '<div class="luck-list">';
  results.forEach((r, i) => {
    const isLucky = r.delta > 0;
    const barWidth = Math.min(Math.abs(r.delta) / maxDelta * 100, 100);
    const barColor = isLucky ? 'rgba(74,222,128,0.5)' : 'rgba(248,113,113,0.5)';
    const deltaStr = (r.delta > 0 ? '+' : '') + r.delta.toFixed(1);
    const label = isLucky ? 'LUCKY' : 'UNLUCKY';
    const labelColor = isLucky ? '#4ade80' : '#f87171';

    html += `<div class="drought-row${i < 3 ? ' drought-row--top' : ''}">
      <div class="drought-row-rank">${i+1}</div>
      <div class="drought-row-name">${r.teamName}</div>
      <div class="drought-row-bar">
        <div style="width:${barWidth}%;height:100%;background:${barColor};border-radius:4px;transition:width 0.3s"></div>
      </div>
      <div class="drought-row-tag" style="color:${labelColor};min-width:70px">${deltaStr} W</div>
      <div class="drought-row-last" style="min-width:100px">${r.actualWins}W actual / ${r.expectedWins.toFixed(0)}W exp.</div>
    </div>`;
  });
  html += '</div>';

  html += '<div style="font-family:\'IBM Plex Mono\',monospace;font-size:9px;color:var(--bone-muted);letter-spacing:1.5px;padding:16px 0 0;text-align:center">ALL-PLAY METHOD: EACH WEEK, HOW MANY OPPONENTS WOULD YOU HAVE BEATEN?</div>';

  container.innerHTML = html;
}

function renderDrought() {
  const container = document.getElementById('records-drought');
  if (!container) return;
  const currentYear = SEASONS[SEASONS.length-1].season;
  const activeMgrs = Object.values(MANAGERS_MAP).filter(m => ALLOWED_MANAGERS.has(m.nickname));

  const droughts = activeMgrs.map(m => {
    const lastChamp = m.champYears.length ? Math.max(...m.champYears) : null;
    const drought = lastChamp ? currentYear - lastChamp : null;
    return { ...m, lastChamp, drought };
  });

  droughts.sort((a,b) => {
    if (!a.lastChamp && !b.lastChamp) return b.winPct - a.winPct;
    if (!a.lastChamp) return -1;
    if (!b.lastChamp) return 1;
    return b.drought - a.drought;
  });

  const maxDrought = currentYear - MIN_SEASON_YEAR;
  const reigning = droughts.find(m => m.drought === 0);
  const longestActive = droughts.find(m => !m.lastChamp) || droughts[0];

  // Chapter header
  let html = '<div class="records-chapter-header">';
  html += '<div class="records-chapter-label">Chapter</div>';
  html += '<div class="records-chapter-title">Championship Drought</div>';
  html += '<div class="records-chapter-sub">Years since last title \u2014 the hunger is real</div>';
  html += '</div>';

  // Summary strip
  html += '<div class="drought-summary">';
  if (reigning) {
    html += `<div class="drought-summary-stat"><div class="drought-summary-label">Reigning Champion</div><div class="drought-summary-value" style="color:#c9a84c">\ud83c\udfc6 ${reigning.teamName}</div></div>`;
  }
  html += `<div class="drought-summary-stat"><div class="drought-summary-label">Longest Active Drought</div><div class="drought-summary-value" style="color:var(--red)">${longestActive.teamName}</div></div>`;
  html += '</div>';

  // Drought rows
  html += '<div class="drought-list">';
  droughts.forEach((m, i) => {
    const neverWon = !m.lastChamp;
    const droughtYears = neverWon ? (currentYear - MIN_SEASON_YEAR + 1) : m.drought;
    const barWidth = Math.min((droughtYears / maxDrought) * 100, 100);
    const isReigning = m.drought === 0;
    const barClass = neverWon ? 'drought-fill--never'
      : isReigning ? 'drought-fill--reigning'
      : droughtYears >= 8 ? 'drought-fill--severe'
      : droughtYears >= 5 ? 'drought-fill--long'
      : droughtYears >= 2 ? 'drought-fill--mid'
      : 'drought-fill--short';
    const label = neverWon ? 'NEVER WON' : isReigning ? '\ud83c\udfc6 REIGNING' : `${m.drought} YRS`;
    const labelClass = neverWon ? 'drought-tag--never' : isReigning ? 'drought-tag--reigning' : '';

    html += `<div class="drought-row${i < 3 ? ' drought-row--top' : ''}">
      <div class="drought-row-rank">${i+1}</div>
      <div class="drought-row-name">${m.teamName}</div>
      <div class="drought-row-bar"><div class="drought-row-fill ${barClass}" style="width:${barWidth}%"></div></div>
      <div class="drought-row-tag ${labelClass}">${label}</div>
      <div class="drought-row-last">${neverWon ? 'Est. ' + MIN_SEASON_YEAR : isReigning ? currentYear : 'Last: '+m.lastChamp}</div>
    </div>`;
  });
  html += '</div>';

  container.innerHTML = html;
}

// ── RECORDS CHAPTER NAV ──────────────────────────────────────
function renderRecordsNav() {
  const nav = document.getElementById('records-nav');
  if (!nav) return;
  const chapters = [
    { id: 'records-container', label: 'Records' },
    { id: 'records-blowouts', label: 'The Shed' },
    { id: 'records-playoffs', label: 'Playoffs' },
    { id: 'records-close', label: 'Close Games' },
    { id: 'records-sos', label: 'Schedule' },
    { id: 'records-consistency', label: 'Consistency' },
    { id: 'records-bestseason', label: 'Best Seasons' },
    { id: 'records-luck', label: 'Luck' },
    { id: 'records-drought', label: 'Drought' },
  ];
  nav.innerHTML = chapters.map(c =>
    '<a class="records-nav-link" href="#' + c.id + '">' + c.label + '</a>'
  ).join('');
}

// ── COMPARE MODE ─────────────────────────────────────────────
function renderCompare() {
  const activeMgrs = Object.values(MANAGERS_MAP)
    .filter(m => ALLOWED_MANAGERS.has(m.nickname))
    .sort((a,b) => b.winPct !== a.winPct ? b.winPct - a.winPct : b.wins - a.wins);

  // Setup custom selects
  ['a','b'].forEach((id, idx) => {
    const wrap = document.getElementById(`cmp-${id}-wrap`);
    const display = document.getElementById(`cmp-${id}-display`);
    const optionsEl = document.getElementById(`cmp-${id}-options`);
    const hidden = document.getElementById(`cmp-${id}`);
    optionsEl.innerHTML = '';

    activeMgrs.forEach(m => {
      const opt = document.createElement('div');
      opt.className = 'custom-select-option';
      opt.dataset.value = m.nickname;
      opt.textContent = m.teamName;
      opt.onclick = (e) => {
        e.stopPropagation();
        hidden.value = m.nickname;
        display.textContent = m.teamName;
        optionsEl.querySelectorAll('.custom-select-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        wrap.classList.remove('open');
        drawComparison();
      };
      optionsEl.appendChild(opt);
    });

    // Default: #1 vs #2
    if (activeMgrs.length >= 2) {
      const def = activeMgrs[idx];
      hidden.value = def.nickname;
      display.textContent = def.teamName;
      optionsEl.querySelector(`[data-value="${def.nickname}"]`)?.classList.add('selected');
    }

    // Toggle dropdown
    display.onclick = (e) => {
      e.stopPropagation();
      const otherId = id === 'a' ? 'b' : 'a';
      const otherWrap = document.getElementById(`cmp-${otherId}-wrap`);
      otherWrap.classList.remove('open');
      document.getElementById(`cmp-${otherId}-display`).setAttribute('aria-expanded', 'false');
      wrap.classList.toggle('open');
      display.setAttribute('aria-expanded', wrap.classList.contains('open') ? 'true' : 'false');
    };

    // Keyboard support
    display.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        display.click();
      } else if (e.key === 'Escape') {
        wrap.classList.remove('open');
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!wrap.classList.contains('open')) { display.click(); return; }
        const opts = Array.from(optionsEl.querySelectorAll('.custom-select-option'));
        const cur = optionsEl.querySelector('.custom-select-option.selected');
        let idx2 = cur ? opts.indexOf(cur) : -1;
        idx2 += e.key === 'ArrowDown' ? 1 : -1;
        idx2 = Math.max(0, Math.min(idx2, opts.length - 1));
        opts[idx2].click();
      }
    });
  });

  // Close dropdowns on outside click
  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-select').forEach(s => s.classList.remove('open'));
  });

  drawComparison();
}

function drawComparison() {
  const valA = document.getElementById('cmp-a').value;
  const valB = document.getElementById('cmp-b').value;
  const container = document.getElementById('compare-container');
  container.innerHTML = '';
  const mA = MANAGERS_MAP[valA];
  const mB = MANAGERS_MAP[valB];
  if (!mA || !mB) {
    container.innerHTML = '<div style="text-align:center;color:var(--bone-dim);padding:40px 20px;font-family:\'IBM Plex Mono\',monospace;font-size:12px;letter-spacing:2px">PICK TWO MANAGERS TO COMPARE</div>';
    return;
  }
  if (mA === mB) {
    container.innerHTML = '<div style="text-align:center;color:var(--bone-dim);padding:40px 20px;font-family:\'IBM Plex Mono\',monospace;font-size:12px;letter-spacing:2px">SELECT TWO DIFFERENT MANAGERS</div>';
    return;
  }

  // ── Gather all head-to-head games ──
  const h2hGames = [];
  SEASONS.forEach(s => {
    const realPlayoffKeys = new Set();
    s.standings.forEach(t => { if (t.rank <= 6) realPlayoffKeys.add(t.team_key); });
    s.matchups.forEach(mu => {
      const t1 = getMgrFromTeamKey(mu.team1.team_key, s);
      const t2 = getMgrFromTeamKey(mu.team2.team_key, s);
      const aIsT1 = t1 === mA.nickname && t2 === mB.nickname;
      const bIsT1 = t1 === mB.nickname && t2 === mA.nickname;
      if (!aIsT1 && !bIsT1) return;
      const aPts = aIsT1 ? mu.team1.points : mu.team2.points;
      const bPts = aIsT1 ? mu.team2.points : mu.team1.points;
      const aKey = aIsT1 ? mu.team1.team_key : mu.team2.team_key;
      const aWon = mu.winner_team_key === aKey;
      const isRealPlayoff = mu.is_playoffs && realPlayoffKeys.has(mu.team1.team_key) && realPlayoffKeys.has(mu.team2.team_key);
      h2hGames.push({ season: s.season, week: mu.week, aPts, bPts, aWon, isPlayoff: mu.is_playoffs, isRealPlayoff });
    });
  });

  let h2hA = 0, h2hB = 0, playoffA = 0, playoffB = 0;
  let biggestWin = null; // from A perspective
  let streak = { who: null, count: 0 };
  h2hGames.forEach(g => {
    if (g.aWon) h2hA++; else h2hB++;
    if (g.isRealPlayoff) { if (g.aWon) playoffA++; else playoffB++; }
    const margin = Math.abs(g.aPts - g.bPts);
    if (!biggestWin || margin > biggestWin.margin) {
      biggestWin = { margin, winner: g.aWon ? mA.teamName : mB.teamName, score: g.aWon ? g.aPts.toFixed(1)+'\u2013'+g.bPts.toFixed(1) : g.bPts.toFixed(1)+'\u2013'+g.aPts.toFixed(1), season: g.season, week: g.week };
    }
  });
  // Current streak (from most recent game backwards)
  for (let i = h2hGames.length - 1; i >= 0; i--) {
    const g = h2hGames[i];
    const who = g.aWon ? 'a' : 'b';
    if (streak.count === 0) { streak.who = who; streak.count = 1; }
    else if (who === streak.who) streak.count++;
    else break;
  }

  // ── Build stat sections ──
  const sections = [
    { title: 'SUCCESS', stats: [
      { label: 'Wins', a: mA.wins, b: mB.wins },
      { label: 'Titles', a: mA.championships, b: mB.championships },
      { label: 'Runner-Ups', a: mA.runnerUp, b: mB.runnerUp },
      { label: 'Playoff Apps', a: mA.playoffAppearances, b: mB.playoffAppearances },
    ]},
    { title: 'PERFORMANCE', stats: [
      { label: 'Win %', a: parseFloat((mA.winPct*100).toFixed(1)), b: parseFloat((mB.winPct*100).toFixed(1)), fmt: v => v.toFixed(1)+'%', pctTie: true },
      { label: 'Avg PPG', a: parseFloat(mA.avgPts.toFixed(1)), b: parseFloat(mB.avgPts.toFixed(1)), fmt: v => v.toFixed(1), pctTie: true },
      { label: 'High Score', a: parseFloat(mA.highScore.toFixed(1)), b: parseFloat(mB.highScore.toFixed(1)), fmt: v => v.toFixed(1) },
    ]},
  ];

  // Flatten for edge calc
  const allStats = sections.flatMap(sec => sec.stats);
  let aEdge = 0, bEdge = 0;
  const edgeDetails = [];
  allStats.forEach(s => {
    if (s.a > s.b) { aEdge++; edgeDetails.push({ label: s.label, who: 'a', delta: s.a - s.b, fmt: s.fmt }); }
    else if (s.b > s.a) { bEdge++; edgeDetails.push({ label: s.label, who: 'b', delta: s.b - s.a, fmt: s.fmt }); }
  });

  const edgeScore = aEdge - bEdge;
  const edgeWinnerName = edgeScore > 0 ? mA.teamName : edgeScore < 0 ? mB.teamName : null;
  const edgeWinnerSide = edgeScore > 0 ? 'a' : edgeScore < 0 ? 'b' : null;

  // Top deltas for edge bullets
  const topDeltas = edgeDetails
    .filter(d => d.who === edgeWinnerSide)
    .sort((a,b) => b.delta - a.delta)
    .slice(0, 4);

  // ══════════════════════════════════════
  //  1) EDGE SUMMARY PANEL
  // ══════════════════════════════════════
  const edgeBorderColor = edgeWinnerSide ? 'rgba(201,168,76,0.25)' : 'var(--wine-border)';
  let edgeBullets = '';
  if (topDeltas.length > 0) {
    edgeBullets = topDeltas.map(d => {
      const val = d.fmt ? '+' + d.fmt(d.delta) : '+' + d.delta;
      return `<span class="cmp-edge-bullet"><span class="cmp-edge-bullet-val">${val}</span> ${d.label}</span>`;
    }).join('');
  }

  let edgeCenterHTML;
  if (edgeWinnerName) {
    edgeCenterHTML = `
      <div class="cmp-edge-label">EDGE</div>
      <div class="cmp-edge-winner">${edgeWinnerName}</div>
      <div class="cmp-edge-score">EDGE SCORE: ${edgeWinnerName} +${Math.abs(edgeScore)}</div>
      <div class="cmp-edge-cats">Leads ${Math.max(aEdge,bEdge)} of ${allStats.length} categories</div>
      ${edgeBullets ? '<div class="cmp-edge-bullets">' + edgeBullets + '</div>' : ''}`;
  } else {
    edgeCenterHTML = `
      <div class="cmp-edge-label">EDGE SCORE</div>
      <div class="cmp-edge-winner" style="color:var(--bone-dim)">TIED</div>
      <div class="cmp-edge-cats">${aEdge}\u2013${bEdge} categories</div>`;
  }

  container.innerHTML += `
    <div class="cmp-edge-panel" style="border-color:${edgeBorderColor}">
      <div class="cmp-edge-side">
        <div class="cmp-edge-name">${mA.teamName}</div>
        <div class="cmp-edge-meta">${(mA.winPct*100).toFixed(1)}% WIN \u00b7 ${mA.championships}\u00d7 CHAMP</div>
      </div>
      <div class="cmp-edge-center">${edgeCenterHTML}</div>
      <div class="cmp-edge-side">
        <div class="cmp-edge-name">${mB.teamName}</div>
        <div class="cmp-edge-meta">${(mB.winPct*100).toFixed(1)}% WIN \u00b7 ${mB.championships}\u00d7 CHAMP</div>
      </div>
    </div>`;

  // ══════════════════════════════════════
  //  2) HEAD-TO-HEAD MATCHUP BLOCK
  // ══════════════════════════════════════
  const totalH2H = h2hA + h2hB;
  const streakTeam = streak.who === 'a' ? mA.teamName : mB.teamName;
  const streakLabel = streak.count > 0 ? streakTeam + ' W' + streak.count : '\u2014';

  let h2hDetailLines = '';
  if (biggestWin) {
    h2hDetailLines += `<div class="cmp-h2h-detail"><span class="cmp-h2h-detail-label">Biggest Win</span><span class="cmp-h2h-detail-val">${biggestWin.winner} \u00b7 ${biggestWin.score} \u00b7 +${biggestWin.margin.toFixed(1)}</span><span class="cmp-h2h-detail-ctx">Wk ${biggestWin.week}, ${biggestWin.season}</span></div>`;
  }
  if (streak.count > 0) {
    h2hDetailLines += `<div class="cmp-h2h-detail"><span class="cmp-h2h-detail-label">Current Streak</span><span class="cmp-h2h-detail-val">${streakLabel}</span></div>`;
  }
  const totalPlayoffH2H = playoffA + playoffB;
  if (totalPlayoffH2H > 0) {
    h2hDetailLines += `<div class="cmp-h2h-detail"><span class="cmp-h2h-detail-label">Playoff H2H</span><span class="cmp-h2h-detail-val">${mA.teamName} ${playoffA}\u2013${playoffB} ${mB.teamName}</span></div>`;
  }

  const h2hBarA = totalH2H > 0 ? Math.round(h2hA / totalH2H * 100) : 50;

  container.innerHTML += `
    <div class="cmp-h2h-block">
      <div class="cmp-section-label">HEAD-TO-HEAD MATCHUPS</div>
      <div class="cmp-h2h-record">
        <span class="cmp-h2h-team ${h2hA>=h2hB?'cmp-h2h-lead':''}">${mA.teamName}</span>
        <span class="cmp-h2h-score">${h2hA}\u2013${h2hB}</span>
        <span class="cmp-h2h-team ${h2hB>h2hA?'cmp-h2h-lead':''}" style="text-align:right">${mB.teamName}</span>
      </div>
      <div class="cmp-h2h-bar-wrap">
        <div class="cmp-h2h-bar-fill cmp-h2h-bar-a" style="width:${h2hBarA}%"></div>
        <div class="cmp-h2h-bar-fill cmp-h2h-bar-b" style="width:${100-h2hBarA}%"></div>
      </div>
      <div class="cmp-h2h-sub">${totalH2H} all-time meetings</div>
      ${h2hDetailLines ? '<div class="cmp-h2h-details">' + h2hDetailLines + '</div>' : ''}
    </div>`;

  // ══════════════════════════════════════
  //  3 & 4) SECTIONED STAT BARS
  // ══════════════════════════════════════
  sections.forEach(sec => {
    let rowsHTML = '';
    sec.stats.forEach(s => {
      const aWins = s.a > s.b, bWins = s.b > s.a, tied = s.a === s.b;
      const fmt = s.fmt || (v => v);

      // Near-tie detection
      let nearTie = false;
      if (!tied) {
        if (s.pctTie) { nearTie = Math.abs(s.a - s.b) < 2; }
        else { nearTie = (s.a + s.b > 0) && Math.abs(s.a - s.b) <= 1; }
      }
      const tieTag = tied ? '<span class="cmp-bar-tag">EVEN</span>' : nearTie ? '<span class="cmp-bar-tag">TIGHT</span>' : '';

      // Bar widths
      const total = s.a + s.b;
      const aBar = total === 0 ? 50 : Math.round(s.a / total * 100);

      // Colors: winner gets gold, loser dim
      const aValCls = aWins ? 'cmp-val-win' : bWins ? 'cmp-val-lose' : 'cmp-val-even';
      const bValCls = bWins ? 'cmp-val-win' : aWins ? 'cmp-val-lose' : 'cmp-val-even';
      const aBarCls = aWins ? 'cmp-fill-win' : 'cmp-fill-lose';
      const bBarCls = bWins ? 'cmp-fill-win' : 'cmp-fill-lose';

      rowsHTML += `
        <div class="cmp-stat-row">
          <div class="cmp-stat-val ${aValCls}">${fmt(s.a)}</div>
          <div class="cmp-stat-center">
            <div class="cmp-stat-label">${s.label}${tieTag}</div>
            <div class="cmp-stat-track">
              <div class="cmp-stat-fill ${aBarCls}" style="width:${aBar}%"></div>
              <div class="cmp-stat-divider"></div>
              <div class="cmp-stat-fill ${bBarCls}" style="width:${100-aBar}%"></div>
            </div>
          </div>
          <div class="cmp-stat-val ${bValCls}">${fmt(s.b)}</div>
        </div>`;
    });

    container.innerHTML += `
      <div class="cmp-section">
        <div class="cmp-section-label">${sec.title}</div>
        ${rowsHTML}
      </div>`;
  });

}


// ── H2H DEEP DIVE MODAL ───────────────────────────────────────
function showH2HModal(mgrA, mgrB) {
  const mA = MANAGERS_MAP[mgrA];
  const mB = MANAGERS_MAP[mgrB];
  if (!mA || !mB) return;

  const games = [];
  SEASONS.forEach(s => {
    s.matchups.forEach(m => {
      const t1 = getMgrFromTeamKey(m.team1.team_key, s);
      const t2 = getMgrFromTeamKey(m.team2.team_key, s);
      if (!((t1===mgrA&&t2===mgrB)||(t1===mgrB&&t2===mgrA))) return;
      const aIsT1 = t1===mgrA;
      const aPts = aIsT1 ? m.team1.points : m.team2.points;
      const bPts = aIsT1 ? m.team2.points : m.team1.points;
      const aWon = m.winner_team_key === (aIsT1 ? m.team1.team_key : m.team2.team_key);
      games.push({season:s.season, week:m.week, aPts, bPts, aWon, isPlayoffs:m.is_playoffs});
    });
  });

  games.sort((a,b) => a.season===b.season ? a.week-b.week : a.season-b.season);
  const aW = games.filter(g=>g.aWon).length;
  const bW = games.filter(g=>!g.aWon).length;
  const aPts = games.reduce((s,g)=>s+g.aPts,0);
  const bPts = games.reduce((s,g)=>s+g.bPts,0);

  function playoffBadge(isP) {
    return isP ? '<span style="background:rgba(201,168,76,0.15);color:var(--wine);padding:2px 5px;font-size:9px;border:1px solid rgba(201,168,76,0.3);">PLAYOFF</span>' : '';
  }
  const gamesHTML = games.map(g => {
    const aColor = g.aWon ? 'var(--green)' : 'var(--bone-dim)';
    const bColor = g.aWon ? 'var(--bone-dim)' : 'var(--green)';
    const bg = g.aWon ? 'rgba(39,174,96,0.05)' : 'rgba(192,57,43,0.05)';
    const border = g.aWon ? 'rgba(39,174,96,0.15)' : 'rgba(192,57,43,0.1)';
    return `<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:${bg};border:1px solid ${border};margin-bottom:4px;">
      <span style="font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--bone-muted);width:70px">${g.season} Wk${g.week}</span>
      <span style="font-family:'Bebas Neue',sans-serif;font-size:16px;flex:1;color:${aColor}">${mA.teamName}</span>
      <span style="font-family:'IBM Plex Mono',monospace;font-size:13px;color:${aColor}">${g.aPts.toFixed(1)}</span>
      <span style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--bone-dim);margin:0 4px">—</span>
      <span style="font-family:'IBM Plex Mono',monospace;font-size:13px;color:${bColor}">${g.bPts.toFixed(1)}</span>
      <span style="font-family:'Bebas Neue',sans-serif;font-size:16px;flex:1;text-align:right;color:${bColor}">${mB.teamName}</span>
      ${playoffBadge(g.isPlayoffs)}
    </div>`;
  }).join('');

  document.getElementById('modal-header').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:16px;align-items:center">
      <div>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:30px;color:${aW>bW?'var(--wine)':'var(--bone)'}">${mA.teamName}</div>
        <div style="font-family:'IBM Plex Mono',monospace;font-size:24px;color:${aW>bW?'var(--wine)':'var(--bone-dim)'}">${aW}W</div>
      </div>
      <div style="text-align:center">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:22px;color:var(--bone-muted)">ALL-TIME</div>
        <div style="font-family:'IBM Plex Mono',monospace;font-size:13px;color:var(--bone-dim)">${games.length} GAMES</div>
      </div>
      <div style="text-align:right">
        <div style="font-family:'Bebas Neue',sans-serif;font-size:30px;color:${bW>aW?'var(--wine)':'var(--bone)'}">${mB.teamName}</div>
        <div style="font-family:'IBM Plex Mono',monospace;font-size:24px;color:${bW>aW?'var(--wine)':'var(--bone-dim)'}">${bW}W</div>
      </div>
    </div>
  `;
  document.getElementById('modal-body').innerHTML = `
    <div class="stat-grid-2" style="margin-bottom:20px">
      <div class="stat-box"><div class="stat-box-label">Avg Score (${mA.teamName})</div><div class="stat-box-num" style="font-size:26px">${games.length ? (aPts/games.length).toFixed(1) : '—'}</div></div>
      <div class="stat-box"><div class="stat-box-label">Avg Score (${mB.teamName})</div><div class="stat-box-num" style="font-size:26px">${games.length ? (bPts/games.length).toFixed(1) : '—'}</div></div>
    </div>
    <div style="font-family:'IBM Plex Mono',monospace;font-size:10px;color:var(--bone-muted);letter-spacing:2px;margin-bottom:10px">EVERY MATCHUP</div>
    <div style="max-height:380px;overflow-y:auto">${gamesHTML}</div>
  `;
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

// ── MOBILE ROUTER ─────────────────────────────────────────────
const MOBILE_BP = 768;
const VIEW_META = {
  home:       { tab: 'champions', title: 'HALL OF CHAMPIONS', sub: '' },
  champions:  { tab: 'champions', title: 'CHAMPIONS', sub: 'Every title. Every ring.' },
  standings:  { tab: 'power',     title: 'STANDINGS', sub: 'All-time franchise stats' },
  records:    { tab: 'records',   title: 'RECORDS',   sub: 'Single-game and season marks' },
  seasons:    { tab: 'seasons',   title: 'SEASONS',   sub: 'Year-by-year results' },
  managers:   { tab: 'managers',  title: 'MANAGERS',  sub: 'Career profiles' },
  compare:    { tab: 'compare',   title: 'COMPARE',   sub: 'Head-to-head careers' },
};

function isMobile() { return window.innerWidth <= MOBILE_BP; }

function getViewFromURL() {
  const p = new URLSearchParams(window.location.search);
  const v = p.get('view');
  return (v && VIEW_META[v]) ? v : 'home';
}

function renderView(view) {
  if (!isMobile()) return;
  const meta = VIEW_META[view] || VIEW_META.home;
  const heroHeader = document.getElementById('heroHeader');
  const mph = document.getElementById('mobilePageHeader');
  const isHome = (view === 'home');

  if (isHome) {
    document.body.classList.remove('mobile-view');
    heroHeader.style.display = '';
    mph.style.display = 'none';
  } else {
    document.body.classList.add('mobile-view');
    heroHeader.style.display = 'none';
    mph.style.display = 'block';
    document.getElementById('mphKicker').textContent = 'BKGFFL';
    document.getElementById('mphTitle').textContent = meta.title;
    document.getElementById('mphSub').textContent = meta.sub;
  }

  document.querySelectorAll('.section[data-view]').forEach(function(s) {
    s.classList.remove('active');
  });
  var activeSection = document.getElementById('tab-' + meta.tab);
  if (activeSection) {
    activeSection.classList.add('active');
  }

  document.querySelectorAll('.drawer-link').forEach(function(l) {
    l.classList.toggle('active', l.dataset.nav === view);
  });

  requestAnimationFrame(function() { window.scrollTo(0, 0); });
}

function setView(view, opts) {
  var replace = opts && opts.replace;
  var url = view === 'home' ? window.location.pathname : '?view=' + view;
  if (replace) {
    history.replaceState({ view: view }, '', url);
  } else {
    history.pushState({ view: view }, '', url);
  }
  renderView(view);
}

var _origShowTab = showTab;
showTab = function(tab, btn) {
  if (isMobile()) {
    var tabToView = { champions:'champions', power:'standings', records:'records',
                      seasons:'seasons', managers:'managers', compare:'compare' };
    var view = tabToView[tab] || 'home';
    setView(view);
    return;
  }
  _origShowTab(tab, btn);
};

// ── BACK TO TOP ──
(function initBackToTop() {
  var btn = document.getElementById('back-to-top');
  if (!btn) return;
  var ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(function() {
        btn.classList.toggle('visible', window.scrollY > 400);
        ticking = false;
      });
      ticking = true;
    }
  });
})();

(function initDrawer() {
  var hamburger = document.getElementById('hamburger');
  var overlay = document.getElementById('drawer-overlay');
  if (!hamburger || !overlay) return;

  function openDrawer() {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function() {
    overlay.classList.contains('open') ? closeDrawer() : openDrawer();
  });
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeDrawer();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeDrawer();
  });
  overlay.querySelectorAll('.drawer-link').forEach(function(link) {
    link.addEventListener('click', function() {
      closeDrawer();
      setView(link.dataset.nav);
    });
  });
})();

window.addEventListener('popstate', function(e) {
  if (isMobile()) {
    var view = (e.state && e.state.view) ? e.state.view : getViewFromURL();
    renderView(view);
  }
});

function initMobileRouter() {
  if (isMobile()) {
    var view = getViewFromURL();
    renderView(view);
    history.replaceState({ view: view }, '', view === 'home' ? window.location.pathname : '?view=' + view);
  } else {
    document.body.classList.remove('mobile-view');
    var hh = document.getElementById('heroHeader');
    if (hh) hh.style.display = '';
    var mp = document.getElementById('mobilePageHeader');
    if (mp) mp.style.display = 'none';
    document.querySelectorAll('.section[data-view]').forEach(function(s) {
      s.style.display = '';
    });
  }
}

var _resizeTimer;
window.addEventListener('resize', function() {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(initMobileRouter, 150);
});

setTimeout(initMobileRouter, 200);

setTimeout(loadData, 100);

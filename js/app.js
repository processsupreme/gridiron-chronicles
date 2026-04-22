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
  fetch('data/league_data.json')
    .then(function(response) {
      if (!response.ok) throw new Error('Failed to load data');
      return response.json();
    })
    .then(function(json) {
      DATA = json;
      try {
        processData();
        renderAll();
      } catch (err) {
        var cta = document.getElementById('landing-cta');
        if (cta) { cta.textContent = 'LOAD ERROR — REFRESH PAGE'; cta.disabled = true; }
        return;
      }

      // Update landing page & masthead from real data
      var totalMatchups = SEASONS.reduce(function(a, s) { return a + s.matchups.length; }, 0);
      var el = function(id, val) { var e = document.getElementById(id); if (e) e.textContent = val; };
      el('masthead-meta-2', 'EST. 2014 · ' + SEASONS.length + ' SEASONS OF HISTORY');

      var landing = document.getElementById('landing');
      var app = document.getElementById('app');
      app.style.display = 'block';
      app.style.opacity = '0';
      // Respect reduced-motion: hold the video on the first frame
      try {
        var v = document.getElementById('landing-video');
        if (v && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          v.pause();
        }
      } catch (e) {}

      function enterSite() {
        landing.classList.add('is-leaving');
        // Let the camera-push read, then cross-fade into the app
        app.style.transition = 'opacity 0.6s ease 0.4s';
        app.style.opacity = '1';
        setTimeout(function() {
          landing.style.display = 'none';
          var v = document.getElementById('landing-video');
          if (v) { try { v.pause(); v.removeAttribute('src'); v.load(); } catch (e) {} }
          window.scrollTo(0, 0);
          if (typeof initMobileRouter === 'function') initMobileRouter();
          setTimeout(function() {
            if (typeof showInstallBanner === 'function') showInstallBanner();
            if (typeof showIOSInstallHint === 'function') showIOSInstallHint();
          }, 2000);
        }, 1000);
      }
      document.getElementById('landing-cta').addEventListener('click', enterSite);
    })
    .catch(function(err) {
      var cta = document.getElementById('landing-cta');
      if (cta) { cta.textContent = 'LOAD ERROR — REFRESH PAGE'; cta.disabled = true; }
    });
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
          playoffByes: 0, tenWinSeasons: 0, playoffWins: 0,
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
      // Canonical fields (wins/losses/ties/winPct/pf) are patched after the
      // championship-chain pass below to include real playoff games.
      m.yearlyStats.push({
        year: s.season,
        regWins: t.wins, regLosses: t.losses, regTies: t.ties,
        chainWins: 0, chainLosses: 0, chainTies: 0,
        wins: t.wins, losses: t.losses, ties: t.ties,
        winPct: totalGames > 0 ? t.wins / totalGames : 0,
        rank: t.rank, pf: t.points_for, pa: t.points_against,
      });

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

    // Playoff appearances = top 6 finishers by standings rank (reliable source of truth).
    // Playoff byes = top 2 REGULAR-SEASON seeds — record first (wins + 0.5·ties),
    // points for as tiebreaker. NOT top 2 by final rank: playoff outcomes
    // reshuffle those (e.g. 2024 Opolos had a bye at 12-2 but finished rank 3
    // after losing in the semis; 2022 Johnny Fantasy 9-4-1 had a bye over
    // Joco 9-5-0 despite Joco's higher PF, because JF's record was better).
    // 10+ win seasons = regular-season win total of 10 or more.
    const seedRecord = (t) => (t.wins || 0) + 0.5 * (t.ties || 0);
    const byeTeamKeys = new Set(
      [...fullStandings]
        .filter(t => t.rank <= 6)
        .sort((a, b) => {
          const r = seedRecord(b) - seedRecord(a);
          if (r !== 0) return r;
          return (b.points_for || 0) - (a.points_for || 0);
        })
        .slice(0, 2)
        .map(t => t.team_key)
    );
    fullStandings.forEach(t => {
      const mgr = t.managers[0] || null;
      if (!mgr || !MANAGERS_MAP[mgr]) return;
      const mm = MANAGERS_MAP[mgr];
      if (t.rank <= 6) mm.playoffAppearances++;
      if (byeTeamKeys.has(t.team_key)) mm.playoffByes++;
      if (t.wins >= 10) mm.tenWinSeasons++;
    });

    // ── CANONICAL RECORD: championship-chain playoff W/L/T ──
    // League rule: a W/L counts iff the game is (a) regular season OR (b) on the
    // championship chain — final + semis + R1 games that feed the semis.
    // 3rd/5th/7th-place and all consolation-bracket games never count for anyone.
    // Games vs retired franchises DO count when they meet those criteria.
    // Reg-season W/L/T/PF/PA were already added above from Yahoo's standings
    // (reg-season-only in BKGFFL). Here we add chain playoff games on top.
    const chainKeys = getChampionshipChainGameKeys(s);
    const perMgrChain = {}; // mgr -> {w,l,t}
    (s.allMatchups || s.matchups).forEach(mu => {
      if (!chainKeys.has(_gameKeyFor(mu))) return;
      ['team1','team2'].forEach((side, idx) => {
        const myT = mu[side];
        const oppT = mu[idx === 0 ? 'team2' : 'team1'];
        const mgr = getMgrFromTeamKeyFull(myT.team_key, fullStandings);
        if (!mgr || !MANAGERS_MAP[mgr]) return;
        const mm = MANAGERS_MAP[mgr];
        const wk = mu.winner_team_key;
        let res;
        if (wk === myT.team_key) res = 'W';
        else if (!wk && myT.points > 0 && oppT.points > 0 && myT.points === oppT.points) res = 'T';
        else res = 'L';
        if (res === 'W') { mm.wins++; mm.playoffWins++; }
        else if (res === 'L') { mm.losses++; }
        else { mm.ties++; }
        mm.pointsFor += myT.points || 0;
        mm.pointsAgainst += oppT.points || 0;
        if (!perMgrChain[mgr]) perMgrChain[mgr] = { w:0, l:0, t:0 };
        perMgrChain[mgr][res === 'W' ? 'w' : res === 'L' ? 'l' : 't']++;
      });
    });
    // Back-patch yearlyStats with chain numbers so per-season rows sum to the all-time total.
    Object.entries(perMgrChain).forEach(([mgr, cs]) => {
      const mm = MANAGERS_MAP[mgr];
      const ye = mm && mm.yearlyStats.find(y => y.year === s.season);
      if (!ye) return;
      ye.chainWins = cs.w; ye.chainLosses = cs.l; ye.chainTies = cs.t;
      ye.wins = ye.regWins + cs.w;
      ye.losses = ye.regLosses + cs.l;
      ye.ties = ye.regTies + cs.t;
      const tg = ye.wins + ye.losses + ye.ties;
      ye.winPct = tg > 0 ? ye.wins / tg : 0;
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
// BKGFFL rule: top 6 seeds make the playoffs. Seeds 1-2 get a bye; seeds 3-6
// play Round 1; the 4 R1 survivors play semis vs the byes; finalists play for
// the title. That's the ENTIRE playoffs (5 games total). Everything else —
// consolation games among seeds 7-12, and 3rd/5th/7th-place placement games —
// is consolation and does NOT count for any franchise, ever.

/** Returns a Set of team_keys for the top-6 championship bracket in a given season. */
function getChampionshipBracketKeys(season) {
  const keys = new Set();
  (season.allStandings || season.standings).forEach(t => { if (t.rank <= 6) keys.add(t.team_key); });
  return keys;
}

/** Returns a stable game key (week + sorted team keys) — for dedup across the app. */
function _gameKeyFor(matchup) {
  const pair = [matchup.team1.team_key, matchup.team2.team_key].sort();
  return matchup.week + ':' + pair[0] + ':' + pair[1];
}

/** Per-season cache of the 5 championship-chain game keys (final + semis + R1).
 *  EXCLUDES 3rd-place, 5th-place, and 7th-place "placement" games even when
 *  those games involve top-6 teams. */
const _champChainCache = new Map();
function getChampionshipChainGameKeys(season) {
  const cacheKey = season.league_key || season.season;
  if (_champChainCache.has(cacheKey)) return _champChainCache.get(cacheKey);

  const fullMu = season.allMatchups || season.matchups;
  const bracketKeys = getChampionshipBracketKeys(season);
  const poWeeks = [...new Set(fullMu.filter(m => m.is_playoffs).map(m => m.week))].sort((a,b)=>a-b);
  const result = new Set();

  if (poWeeks.length >= 3) {
    const wk1 = poWeeks[0], wk2 = poWeeks[1], wk3 = poWeeks[2];
    const top6Games = (wk) => fullMu.filter(m =>
      m.is_playoffs && m.week === wk &&
      bracketKeys.has(m.team1.team_key) && bracketKeys.has(m.team2.team_key));

    const finalGames = top6Games(wk3);
    const champKey = season.champion ? season.champion.team_key : null;
    const champGame = finalGames.find(m => m.is_championship)
      || finalGames.find(m => champKey && (m.team1.team_key === champKey || m.team2.team_key === champKey))
      || null;

    if (champGame) {
      result.add(_gameKeyFor(champGame));
      const semiTeams = new Set([champGame.team1.team_key, champGame.team2.team_key]);
      const realSemis = top6Games(wk2).filter(m =>
        semiTeams.has(m.team1.team_key) || semiTeams.has(m.team2.team_key));
      const qfTeams = new Set(semiTeams);
      realSemis.forEach(m => {
        result.add(_gameKeyFor(m));
        qfTeams.add(m.team1.team_key);
        qfTeams.add(m.team2.team_key);
      });
      top6Games(wk1)
        .filter(m => qfTeams.has(m.team1.team_key) || qfTeams.has(m.team2.team_key))
        .forEach(m => result.add(_gameKeyFor(m)));
    }
  }

  _champChainCache.set(cacheKey, result);
  return result;
}

/** Returns true only if this game is in the true championship chain:
 *  final, semis, or R1. 3rd-place and 5th-place games return false. */
function isTruePlayoffGame(matchup, season) {
  if (!matchup.is_playoffs) return false;
  return getChampionshipChainGameKeys(season).has(_gameKeyFor(matchup));
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
  renderCloseGames();
  renderBestSeasons();
  renderDrought();
  renderRecordsNav();
  renderCompare();
  renderHomepage();
  document.getElementById('footnote').textContent =
    `BKGFFL · THE BKGFFL LEDGER · ${SEASONS.length} SEASONS · ${SEASONS.reduce((a,s)=>a+s.matchups.length,0)} MATCHUPS · DATA PULLED ${DATA.pulled_at}`;
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

// ── HOMEPAGE ────────────────────────────────────────────────
function renderHomepage() {
  // ── Snapshot Cards ──
  const snapshotEl = document.getElementById('snapshot-cards');
  if (!snapshotEl) return;

  // Find LVC stats
  const lvc = MANAGERS_MAP['LVC'];
  const lvcWinPct = lvc ? (lvc.winPct * 100).toFixed(1) + '% Win Rate' : '';
  const lvcChamps = lvc ? lvc.championships + '\u00d7 Champion' : '';

  // Find Johnny Fantasy stats
  const johnny = MANAGERS_MAP['Johnny Fantasy'];
  const johnnyRU = johnny ? (johnny.runnerUp || 0) : 0;
  const johnnySzns = johnny ? johnny.seasons : 0;

  // Find best regular season
  let bestRecord = { wins: 0, losses: 0, mgr: '', year: 0 };
  SEASONS.forEach(function(s) {
    s.standings.forEach(function(t) {
      if (t.wins > bestRecord.wins || (t.wins === bestRecord.wins && t.losses < bestRecord.losses)) {
        bestRecord = { wins: t.wins, losses: t.losses, mgr: t.managers[0] || '', year: s.season };
      }
    });
  });
  const bestTeamName = MANAGERS_MAP[bestRecord.mgr] ? MANAGERS_MAP[bestRecord.mgr].teamName : bestRecord.mgr;

  // Longest regular-season win and losing streaks (within a single season),
  // plus highest single-game score by an allowed franchise.
  // (Playoff wins are already aggregated in processData -> MANAGERS_MAP.)
  let bestStreak = { len: 0, mgr: '', year: 0 };
  let worstStreak = { len: 0, mgr: '', year: 0 };
  let topGame = { pts: 0, mgr: '', year: 0, week: 0 };
  SEASONS.forEach(function(s) {
    const fullMu = s.allMatchups || s.matchups;
    const fullSt = s.allStandings || s.standings;
    const winRun = {};
    const lossRun = {};
    [...fullMu].filter(function(m) { return !m.is_playoffs; })
      .sort(function(a, b) { return a.week - b.week; })
      .forEach(function(m) {
        const t1mgr = getMgrFromTeamKeyFull(m.team1.team_key, fullSt);
        const t2mgr = getMgrFromTeamKeyFull(m.team2.team_key, fullSt);
        if (!t1mgr || !t2mgr) return;
        const t1Won = m.winner_team_key === m.team1.team_key;
        [{ mgr: t1mgr, won: t1Won }, { mgr: t2mgr, won: !t1Won }].forEach(function(e) {
          if (!ALLOWED_MANAGERS.has(e.mgr)) return;
          if (e.won) {
            winRun[e.mgr] = (winRun[e.mgr] || 0) + 1;
            lossRun[e.mgr] = 0;
            if (winRun[e.mgr] > bestStreak.len) bestStreak = { len: winRun[e.mgr], mgr: e.mgr, year: s.season };
          } else {
            lossRun[e.mgr] = (lossRun[e.mgr] || 0) + 1;
            winRun[e.mgr] = 0;
            if (lossRun[e.mgr] > worstStreak.len) worstStreak = { len: lossRun[e.mgr], mgr: e.mgr, year: s.season };
          }
        });
      });

    // Highest single-game score (reg season + real playoff games, no consolation)
    fullMu.forEach(function(m) {
      if (!isNonConsolationGame(m, s)) return;
      [m.team1, m.team2].forEach(function(t) {
        const mgr = getMgrFromTeamKeyFull(t.team_key, fullSt);
        if (!mgr || !ALLOWED_MANAGERS.has(mgr)) return;
        if (t.points > topGame.pts) {
          topGame = { pts: t.points, mgr: mgr, year: s.season, week: m.week };
        }
      });
    });
  });
  const streakTeamName = MANAGERS_MAP[bestStreak.mgr] ? MANAGERS_MAP[bestStreak.mgr].teamName : bestStreak.mgr;
  const worstStreakTeam = MANAGERS_MAP[worstStreak.mgr] ? MANAGERS_MAP[worstStreak.mgr].teamName : worstStreak.mgr;
  const topGameTeam = MANAGERS_MAP[topGame.mgr] ? MANAGERS_MAP[topGame.mgr].teamName : topGame.mgr;

  // Most points in a single regular season (single franchise, reg-season only)
  let topSeasonPF = { pts: 0, mgr: '', year: 0, wins: 0, losses: 0 };
  SEASONS.forEach(function(s) {
    const fullMu = s.allMatchups || s.matchups;
    const fullSt = s.allStandings || s.standings;
    const regPF = {};
    fullMu.forEach(function(m) {
      if (m.is_playoffs) return;
      [m.team1, m.team2].forEach(function(t) {
        const mgr = getMgrFromTeamKeyFull(t.team_key, fullSt);
        if (!mgr || !ALLOWED_MANAGERS.has(mgr)) return;
        regPF[mgr] = (regPF[mgr] || 0) + (t.points || 0);
      });
    });
    Object.keys(regPF).forEach(function(mgr) {
      if (regPF[mgr] > topSeasonPF.pts) {
        const stRow = fullSt.find(function(t) { return (t.managers && t.managers[0]) === mgr; });
        topSeasonPF = {
          pts: regPF[mgr], mgr: mgr, year: s.season,
          wins: stRow ? stRow.wins : 0, losses: stRow ? stRow.losses : 0,
        };
      }
    });
  });
  const topSeasonPFTeam = MANAGERS_MAP[topSeasonPF.mgr] ? MANAGERS_MAP[topSeasonPF.mgr].teamName : topSeasonPF.mgr;

  // Playoff bye leaders — every franchise with at least one top-2 finish
  const byeLeaders = Object.values(MANAGERS_MAP)
    .filter(function(m) { return ALLOWED_MANAGERS.has(m.nickname) && (m.playoffByes || 0) > 0; })
    .sort(function(a, b) {
      var d = (b.playoffByes || 0) - (a.playoffByes || 0);
      if (d !== 0) return d;
      return b.championships - a.championships;
    });
  var totalByes = byeLeaders.reduce(function(s, m) { return s + (m.playoffByes || 0); }, 0);
  var byesRowsHTML = byeLeaders.map(function(m) {
    return '<div class="bye-row">' +
      '<span class="bye-team">' + m.teamName + '</span>' +
      '<span class="bye-count">' + m.playoffByes + '</span>' +
    '</div>';
  }).join('');

  // 10+ win season leaders — every franchise with at least one double-digit regular season
  const tenWinLeaders = Object.values(MANAGERS_MAP)
    .filter(function(m) { return ALLOWED_MANAGERS.has(m.nickname) && (m.tenWinSeasons || 0) > 0; })
    .sort(function(a, b) {
      var d = (b.tenWinSeasons || 0) - (a.tenWinSeasons || 0);
      if (d !== 0) return d;
      return b.championships - a.championships;
    });
  var totalTenWin = tenWinLeaders.reduce(function(s, m) { return s + (m.tenWinSeasons || 0); }, 0);
  var tenWinRowsHTML = tenWinLeaders.map(function(m) {
    return '<div class="bye-row">' +
      '<span class="bye-team">' + m.teamName + '</span>' +
      '<span class="bye-count">' + m.tenWinSeasons + '</span>' +
    '</div>';
  }).join('');

  // Playoff wins per franchise — read from MANAGERS_MAP (populated in processData).
  // Include every allowed franchise so teams with 0 wins (e.g. Edmund Fitz) still appear.
  const playoffWinLeaders = Object.values(MANAGERS_MAP)
    .filter(function(m) { return ALLOWED_MANAGERS.has(m.nickname); })
    .map(function(m) { return { mgr: m.nickname, teamName: m.teamName, wins: m.playoffWins || 0 }; })
    .sort(function(a, b) {
      var d = b.wins - a.wins;
      if (d !== 0) return d;
      return (MANAGERS_MAP[b.mgr].championships || 0) - (MANAGERS_MAP[a.mgr].championships || 0);
    });
  var playoffWinRowsHTML = playoffWinLeaders.map(function(m) {
    return '<div class="bye-row">' +
      '<span class="bye-team">' + m.teamName + '</span>' +
      '<span class="bye-count">' + m.wins + '</span>' +
    '</div>';
  }).join('');

  // Finals appearances = championships + runner-ups. Every allowed franchise is
  // listed, including those with 0 so the leaderboard shows a complete field.
  // Sorted by total finals desc, then championships as tiebreaker.
  const finalsLeaders = Object.values(MANAGERS_MAP)
    .filter(function(m) { return ALLOWED_MANAGERS.has(m.nickname); })
    .map(function(m) {
      return {
        mgr: m.nickname,
        teamName: m.teamName,
        finals: (m.championships || 0) + (m.runnerUp || 0),
        champs: m.championships || 0,
      };
    })
    .sort(function(a, b) {
      var d = b.finals - a.finals;
      if (d !== 0) return d;
      return b.champs - a.champs;
    });
  var totalFinals = finalsLeaders.reduce(function(s, m) { return s + m.finals; }, 0);
  var finalsWithAppearance = finalsLeaders.filter(function(m) { return m.finals > 0; }).length;
  var finalsRowsHTML = finalsLeaders.map(function(m) {
    return '<div class="bye-row">' +
      '<span class="bye-team">' + m.teamName + '</span>' +
      '<span class="bye-count">' + m.finals + '</span>' +
    '</div>';
  }).join('');

  snapshotEl.innerHTML =
    '<div class="snapshot-card">' +
      '<div class="snapshot-card-label">The Standard</div>' +
      '<div class="snapshot-card-primary">LVC</div>' +
      '<div class="snapshot-card-supporting">' + lvcChamps + ' \u00b7 ' + lvcWinPct + '</div>' +
      '<div class="snapshot-card-tag snapshot-tag--dynasty">Dynasty</div>' +
    '</div>' +
    '<div class="snapshot-card">' +
      '<div class="snapshot-card-label">Best Regular Season Ever</div>' +
      '<div class="snapshot-card-primary">' + bestRecord.wins + '\u2013' + bestRecord.losses + '</div>' +
      '<div class="snapshot-card-supporting">' + bestTeamName + ' \u00b7 ' + bestRecord.year + '</div>' +
      '<div class="snapshot-card-tag snapshot-tag--rate">Highest Win Rate</div>' +
    '</div>' +
    '<div class="snapshot-card">' +
      '<div class="snapshot-card-label">Most Points in a Regular Season</div>' +
      '<div class="snapshot-card-primary snapshot-card-primary--num">' + topSeasonPF.pts.toFixed(1) + '</div>' +
      '<div class="snapshot-card-supporting">' + topSeasonPFTeam + ' \u00b7 ' + topSeasonPF.year + ' \u00b7 ' + topSeasonPF.wins + '\u2013' + topSeasonPF.losses + '</div>' +
      '<div class="snapshot-card-tag snapshot-tag--rate">Season PF</div>' +
    '</div>' +
    '<div class="snapshot-card">' +
      '<div class="snapshot-card-label">Most Points in a Single Game</div>' +
      '<div class="snapshot-card-primary snapshot-card-primary--num">' + topGame.pts.toFixed(1) + '</div>' +
      '<div class="snapshot-card-supporting">' + topGameTeam + ' \u00b7 Wk ' + topGame.week + ', ' + topGame.year + '</div>' +
      '<div class="snapshot-card-tag snapshot-tag--rate">Game High</div>' +
    '</div>' +
    '<div class="snapshot-card">' +
      '<div class="snapshot-card-label">Longest Regular Season Win Streak</div>' +
      '<div class="snapshot-card-primary">' + bestStreak.len + '</div>' +
      '<div class="snapshot-card-supporting">' + streakTeamName + ' \u00b7 ' + bestStreak.year + '</div>' +
      '<div class="snapshot-card-tag snapshot-tag--streak">Win Streak</div>' +
    '</div>' +
    '<div class="snapshot-card">' +
      '<div class="snapshot-card-label">Longest Regular Season Losing Streak</div>' +
      '<div class="snapshot-card-primary">' + worstStreak.len + '</div>' +
      '<div class="snapshot-card-supporting">' + worstStreakTeam + ' \u00b7 ' + worstStreak.year + '</div>' +
      '<div class="snapshot-card-tag snapshot-tag--never">Losing Streak</div>' +
    '</div>' +
    '<div class="snapshot-card snapshot-card--byes">' +
      '<div class="snapshot-card-label">Playoff Wins \u00b7 All-Time</div>' +
      '<div class="bye-list">' + playoffWinRowsHTML + '</div>' +
    '</div>' +
    '<div class="snapshot-card snapshot-card--byes">' +
      '<div class="snapshot-card-label">Playoff Byes \u00b7 All-Time</div>' +
      '<div class="bye-list">' + byesRowsHTML + '</div>' +
      '<div class="snapshot-card-supporting">' + byeLeaders.length + ' franchises</div>' +
      '<div class="snapshot-card-tag snapshot-tag--seeds">Top-2 Seeds</div>' +
    '</div>' +
    '<div class="snapshot-card snapshot-card--byes">' +
      '<div class="snapshot-card-label">Finals Appearances \u00b7 All-Time</div>' +
      '<div class="bye-list">' + finalsRowsHTML + '</div>' +
      '<div class="snapshot-card-supporting">' + finalsWithAppearance + ' franchises</div>' +
      '<div class="snapshot-card-tag snapshot-tag--rate">Champs + RUs</div>' +
    '</div>' +
    '<div class="snapshot-card snapshot-card--byes">' +
      '<div class="snapshot-card-label">10+ Win Seasons \u00b7 All-Time</div>' +
      '<div class="bye-list">' + tenWinRowsHTML + '</div>' +
      '<div class="snapshot-card-supporting">' + tenWinLeaders.length + ' franchises</div>' +
      '<div class="snapshot-card-tag snapshot-tag--digits">Double Digits</div>' +
    '</div>' +
    '<div class="snapshot-card">' +
      '<div class="snapshot-card-label">Still Waiting</div>' +
      '<div class="snapshot-card-primary">Johnny Fantasy</div>' +
      '<div class="snapshot-card-supporting">' + johnnyRU + ' Runner-Ups \u00b7 ' + johnnySzns + ' Seasons \u00b7 0 Titles</div>' +
      '<div class="snapshot-card-tag snapshot-tag--never">Never Won</div>' +
    '</div>';

  // ── Archive Navigation Cards ──
  const archiveEl = document.getElementById('archive-cards');
  var uniqueChamps = new Set(SEASONS.map(function(s) { return s.champion ? s.champion.team_name : null; }).filter(Boolean)).size;

  var archiveItems = [
    { title: 'Standings', desc: 'Who actually runs this league.', teaser: 'LVC leads all-time win %', tab: 'power' },
    { title: 'Champions', desc: 'Every title. Every winner. Every year it mattered.', teaser: uniqueChamps + ' total champions', tab: 'champions' },
    { title: 'Seasons', desc: 'The most dominant single-season runs in league history.', teaser: '#1: 98 (2014)', tab: 'seasons' },
    { title: 'Record Book', desc: 'The moments that actually matter.', teaser: 'Best Regular Season: ' + bestRecord.wins + '\u2013' + bestRecord.losses + ' (' + bestTeamName + ')', tab: 'records' },
    { title: 'Managers', desc: 'Legacies, records, and receipts.', teaser: '12 franchises. One pecking order.', tab: 'managers' },
    { title: 'Compare', desc: 'Settle it with the numbers.', teaser: 'Pick two. Find out who really owns the rivalry.', tab: 'compare' },
  ];

  archiveEl.innerHTML = archiveItems.map(function(item) {
    return '<div class="archive-card" data-nav-tab="' + item.tab + '">' +
      '<div class="archive-card-title">' + item.title + '</div>' +
      '<div class="archive-card-desc">' + item.desc + '</div>' +
      '<div class="archive-card-teaser">' + item.teaser + '</div>' +
    '</div>';
  }).join('');

  archiveEl.querySelectorAll('.archive-card').forEach(function(card) {
    card.addEventListener('click', function() {
      var tab = card.dataset.navTab;
      if (isMobile()) {
        var tabToView = { champions:'champions', power:'standings', records:'records',
                          seasons:'seasons', managers:'managers', compare:'compare' };
        setView(tabToView[tab] || tab);
      } else {
        var btn = document.querySelector('.nav-btn[onclick*="' + tab + '"]');
        showTab(tab, btn);
      }
    });
  });

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

    // Strip trailing parentheticals like "Make Joco Great Again (MJGA)" so the
    // card doesn't blow out mobile widths. Safe: only MJGA matches today.
    const stripParen = (n) => n ? n.replace(/\s*\([^)]*\)\s*$/, '') : '';
    const opponentName = stripParen(finals.runnerTeam ? finals.runnerTeam.team_name : '');
    const defeatedLine = opponentName
      ? '<div class="champ-manager">defeated ' + opponentName + '</div>'
      : '';

    card.innerHTML = ringHTML +
      '<div class="champ-year">' + s.season + '</div>' +
      '<div class="champ-name">' + stripParen(s.champion.team_name) + '</div>' +
      defeatedLine +
      scoreHTML;

    if (ALLOWED_MANAGERS.has(mgr)) {
      card.onclick = () => showManagerModal(mgr);
      card.style.cursor = 'pointer';
    } else {
      // Retired franchise (e.g. Scott Stars 2015) — no manager profile to open,
      // but the season recap is still worth seeing.
      card.onclick = () => showSeasonModal(s.season);
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

  // Legacy badge helper — unified global badge system
  const getLegacy = (m) => {
    const badges = [];
    // Primary badge: championship status
    if (m.championships >= 3) {
      badges.push('<span class="badge badge--dynasty">Dynasty</span>');
    } else if (m.championships >= 1) {
      badges.push('<span class="badge badge--champion">Champion</span>');
    } else {
      badges.push('<span class="badge badge--never">Never Won</span>');
    }
    // Secondary badge: performance tier (only if relevant, max 2 total)
    if (badges.length < 2 && m.championships === 0) {
      const currentYear = SEASONS[SEASONS.length - 1]?.season || 2025;
      const lastChamp = m.champYears && m.champYears.length ? Math.max(...m.champYears) : null;
      const drought = lastChamp ? (currentYear - lastChamp) : m.seasons;
      if (drought >= 8 && m.championships === 0) {
        badges.push('<span class="badge badge--drought">Long Drought</span>');
      } else if (m.winPct < 0.42) {
        badges.push('<span class="badge badge--cellar">Cellar</span>');
      } else if (m.winPct < 0.46) {
        badges.push('<span class="badge badge--struggling">Struggling</span>');
      }
    }
    return '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">' + badges.join('') + '</div>';
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
        <div class="manager-team-cell">${m.seasons} yrs</div>
        ${!isDead ? getLegacy(m) : ''}
      </td>
      <td><span style="font-family:'IBM Plex Mono',monospace;font-size:13px;${dimStyle}">${record}</span></td>
      <td><span class="${wpClass}" style="font-family:'IBM Plex Mono',monospace;font-size:14px;${isDead?'color:var(--bone-dim)':''}">${(m.winPct*100).toFixed(1)}%</span></td>
      <td>${getTitles(m.championships, isDead)}</td>
      <td><span style="font-family:'IBM Plex Mono',monospace;font-size:13px;${dimStyle}">${m.playoffAppearances}</span></td>
      <td><span style="font-family:'IBM Plex Mono',monospace;font-size:13px;${dimStyle}">${m.playoffByes || 0}</span></td>
      <td><span style="font-family:'IBM Plex Mono',monospace;font-size:13px;${dimStyle}">${m.tenWinSeasons || 0}</span></td>
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
    // Use ALL matchups (including vs non-franchise managers) for accurate records
    const fullMu = s.allMatchups || s.matchups;
    const fullSt = s.allStandings || s.standings;
    const sortedMu = [...fullMu].sort((a,b) => a.week - b.week);
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

      const t1mgr = getMgrFromTeamKeyFull(m.team1.team_key, fullSt) || m.team1.team_name;
      const t2mgr = getMgrFromTeamKeyFull(m.team2.team_key, fullSt) || m.team2.team_name;
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
    const fullMu = s.allMatchups || s.matchups;
    const fullSt = s.allStandings || s.standings;
    const sortedMatchups = [...fullMu].filter(m=>!m.is_playoffs).sort((a,b)=>a.week-b.week);
    sortedMatchups.forEach(m => {
      const t1mgr = getMgrFromTeamKeyFull(m.team1.team_key, fullSt);
      const t2mgr = getMgrFromTeamKeyFull(m.team2.team_key, fullSt);
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

  // Featured: Most Championships (full width, same vertical stack as the other cards)
  if (champMgr) {
    html += `<div class="record-headline featured">
      <div class="record-headline-accent" style="background:var(--wine-bright)"></div>
      <div class="rh-eyebrow">Most Championships</div>
      <div class="rh-value" style="color:var(--wine-bright)">${champMgr.championships}×</div>
      <div class="rh-holder">${champMgr.teamName}</div>
      <div class="rh-context">${champMgr.champYears.join(' · ')}</div>
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
  html += '</div>';

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
  html += '<div class="records-cat-header"><div class="records-cat-icon">📈</div><div class="records-cat-title">Streaks</div></div>';
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
      // Custom milestone overrides
      const customMilestones = {
        '2018': { text: 'LVC becomes 2x champ', icon: '\ud83c\udfc6\ud83c\udfc6', type: 'repeat' },
        '2021': { text: '98 becomes 2x champion', icon: '\ud83c\udfc6\ud83c\udfc6', type: 'repeat' },
        '2022': { text: 'Team Beef wins first title (Aided by Damar Hamlin Injury)', icon: '\ud83c\udfc6', type: 'champ' },
      };
      const custom = customMilestones[String(s.season)];
      if (custom) {
        milestones.push({ year: s.season, ...custom });
      } else if (champCount[champMgr] === 1) {
        milestones.push({ year: s.season, type: 'champ', text: (champTeam || champMgr) + ' wins first title', icon: '\ud83c\udfc6' });
      } else if (champCount[champMgr] === 2) {
        milestones.push({ year: s.season, type: 'repeat', text: (champTeam || champMgr) + ' becomes 2x champ', icon: '\ud83c\udfc6\ud83c\udfc6' });
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

  // Status logic — unified badge system
  const getStatus = (m) => {
    if (m.championships >= 3) return { label:'DYNASTY', cls:'status-dynasty' };
    if (m.championships >= 1) return { label:'CHAMPION', cls:'status-champion' };
    if (m.winPct >= 0.52 && m.playoffAppearances >= 3) return { label:'CONTENDER', cls:'status-contender' };
    if (m.winPct >= 0.46 && m.winPct < 0.52) return { label:'MID PACK', cls:'status-rebuild' };
    if (m.winPct < 0.42) return { label:'CELLAR', cls:'status-never' };
    if (m.winPct < 0.46 && m.seasons >= 3) return { label:'STRUGGLING', cls:'status-struggling' };
    if (m.championships === 0) return { label:'NEVER WON', cls:'status-never' };
    return { label:'MID PACK', cls:'status-rebuild' };
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
  let viewMode = 'seasons'; // 'seasons' | 'h2h' | 'awards'
  let h2hSort = 'winpct'; // 'winpct' | 'games' | 'alpha'

  function render() {
    // ── Filter matchups ──
    // Canonical record rule: regular season + championship-chain playoff games only.
    // 3rd/5th/7th-place and all consolation games never count. Games vs retired
    // franchises DO count. Same rule applied in processData, so these numbers
    // must match the Standings page record exactly.
    const filteredSeasons = SEASONS.filter(s => s.season >= filterFrom && s.season <= filterTo);
    let totalW=0, totalL=0, totalT=0, totalPts=0, totalGames=0, highScore=0, lowScore=Infinity, highMeta='', lowMeta='';
    const champYearsInRange = [];

    filteredSeasons.forEach(s => {
      const fullSt = s.allStandings || s.standings;
      const fullMu = s.allMatchups || s.matchups;
      const standing = fullSt.find(t => (t.managers[0]||'')===nickname);
      if (!standing) return;
      const isChamp = s.champion && getMgrFromTeamKeyFull(s.champion.team_key, fullSt)===nickname;
      if (isChamp) champYearsInRange.push(s.season);

      const chainKeys = getChampionshipChainGameKeys(s);

      fullMu.forEach(mu => {
        // Canonical rule: keep if regular season OR on the championship chain.
        if (mu.is_playoffs && !chainKeys.has(_gameKeyFor(mu))) return;

        const t1m = getMgrFromTeamKeyFull(mu.team1.team_key, fullSt);
        const t2m = getMgrFromTeamKeyFull(mu.team2.team_key, fullSt);
        if (t1m !== nickname && t2m !== nickname) return;

        const myT = t1m===nickname ? mu.team1 : mu.team2;
        const oppT = t1m===nickname ? mu.team2 : mu.team1;
        const myPts = myT.points;
        const oppPts = oppT.points;
        if (myPts <= 0 && oppPts <= 0) return;

        const wk = mu.winner_team_key;
        if (wk === myT.team_key) totalW++;
        else if (!wk && myPts > 0 && oppPts > 0 && myPts === oppPts) totalT++;
        else totalL++;
        totalPts += myPts;
        totalGames++;
        if (myPts > highScore) { highScore = myPts; highMeta = 'Wk '+mu.week+', '+s.season; }
        if (myPts < lowScore && myPts > 0) { lowScore = myPts; lowMeta = 'Wk '+mu.week+', '+s.season; }
      });
    });

    const winPct = totalGames > 0 ? (totalW/totalGames*100).toFixed(1) : '0.0';
    const avgPts = totalGames > 0 ? (totalPts/totalGames).toFixed(1) : '0.0';
    const recordStr = totalT > 0 ? (totalW + 'W–' + totalL + 'L–' + totalT + 'T') : (totalW + 'W–' + totalL + 'L');
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
        <div class="stat-box"><div class="stat-box-label">Record</div><div class="stat-box-num" style="font-size:clamp(22px,5vw,28px)">${winPct}%</div><div class="stat-box-sub">${recordStr}</div><div class="stat-box-sub" style="font-size:9px;color:var(--bone-muted);margin-top:2px">Lg avg: ${(window.LEAGUE_AVGS.winPct*100).toFixed(1)}%</div></div>
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
        const byes = m.playoffByes || 0;
        const tenW = m.tenWinSeasons || 0;
        const poWins = m.playoffWins || 0;
        return '<div class="stat-grid-3" style="margin-bottom:20px">' +
          '<div class="stat-box"><div class="stat-box-label">Consistency</div><div class="stat-box-num" style="font-size:18px;color:' + consistColor + '">' + consistLabel + '</div><div class="stat-box-sub">\u00b1' + stdDev.toFixed(1) + ' pts/wk</div></div>' +
          '<div class="stat-box"><div class="stat-box-label">Avg Opp Score</div><div class="stat-box-num" style="font-size:18px">' + avgPA + '</div><div class="stat-box-sub">PF/PA diff: <span style="color:' + pfPaColor + '">' + pfPaStr + '</span></div></div>' +
          '<div class="stat-box"><div class="stat-box-label">Playoff Rate</div><div class="stat-box-num" style="font-size:18px">' + (m.seasons > 0 ? (m.playoffAppearances/m.seasons*100).toFixed(0) + '%' : '\u2014') + '</div><div class="stat-box-sub">' + m.playoffAppearances + ' of ' + m.seasons + ' seasons</div></div>' +
        '</div>' +
        '<div class="stat-grid-3" style="margin-bottom:20px">' +
          '<div class="stat-box"><div class="stat-box-label">Playoff Wins</div><div class="stat-box-num" style="font-size:22px">' + poWins + '</div><div class="stat-box-sub">Championship bracket only</div></div>' +
          '<div class="stat-box"><div class="stat-box-label">Playoff Byes</div><div class="stat-box-num" style="font-size:22px">' + byes + '</div><div class="stat-box-sub">Top-2 seed finishes</div></div>' +
          '<div class="stat-box"><div class="stat-box-label">10+ Win Seasons</div><div class="stat-box-num" style="font-size:22px">' + tenW + '</div><div class="stat-box-sub">Double-digit regular season</div></div>' +
        '</div>';
      })()}
    `;

    // ── VIEW: SEASONS ──
    let viewHTML = '';
    if (viewMode === 'seasons') {
      let rows = '';
      filteredSeasons.forEach(s => {
        const fullSt = s.allStandings || s.standings;
        const standing = fullSt.find(t => (t.managers[0]||'')===nickname);
        if (!standing) return;
        const isChamp = s.champion && getMgrFromTeamKeyFull(s.champion.team_key, fullSt)===nickname;
        const rank2 = fullSt.find(t => t.rank === 2);
        const isRU = rank2 && (rank2.managers[0] || '') === nickname;
        const isHl = highlightYear && s.season === highlightYear;
        const rowClass = isHl ? 'mgr-season-row mgr-season-hl' : isChamp ? 'mgr-season-row mgr-season-champ' : 'mgr-season-row';
        const badge = isChamp ? '<span class="mgr-season-badge mgr-badge-champ">\ud83c\udfc6 CHAMP</span>' : isRU ? '<span class="mgr-season-badge mgr-badge-ru">\ud83e\udd48 FINALS</span>' : '';
        // Canonical per-season record = reg season + championship chain (from yearlyStats).
        const ye = m.yearlyStats.find(y => y.year === s.season);
        const recStr = ye
          ? (ye.ties > 0 ? `${ye.wins}W\u2013${ye.losses}L\u2013${ye.ties}T` : `${ye.wins}W\u2013${ye.losses}L`)
          : `${standing.wins}W\u2013${standing.losses}L`;
        rows += `<div class="${rowClass}" id="modal-yr-${s.season}">
          <span class="mgr-season-year">${s.season}</span>
          <span class="mgr-season-team">${standing.team_name}</span>
          <span class="mgr-season-record">${recStr}</span>
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
        const fullSt = s.allStandings || s.standings;
        const fullMu = s.allMatchups || s.matchups;
        const chainKeys = getChampionshipChainGameKeys(s);

        fullMu.forEach(mu => {
          // Canonical rule: regular season OR championship chain only.
          if (mu.is_playoffs && !chainKeys.has(_gameKeyFor(mu))) return;
          const t1m = getMgrFromTeamKeyFull(mu.team1.team_key, fullSt);
          const t2m = getMgrFromTeamKeyFull(mu.team2.team_key, fullSt);
          const wk = mu.winner_team_key;
          if (t1m===nickname && h2h[t2m]) {
            if (wk===mu.team1.team_key) h2h[t2m].w++;
            else if (wk===mu.team2.team_key) h2h[t2m].l++;
          } else if (t2m===nickname && h2h[t1m]) {
            if (wk===mu.team2.team_key) h2h[t1m].w++;
            else if (wk===mu.team1.team_key) h2h[t1m].l++;
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
  // Season recaps use the full, unfiltered 12-team data — retired
  // franchises (e.g. Scott Stars 2015) still belong in the history.
  const seasonSt = s.allStandings || s.standings;
  const seasonMu = s.allMatchups || s.matchups;
  const finals = getSeasonFinalData(s);
  const mgr = s.champion ? getMgrFromTeamKeyFull(s.champion.team_key, seasonSt) || '' : '';
  const championRecord = finals.champTeam || null;
    const ringImg = RING_IMAGES[String(s.season)] || RING_IMAGES['2023'];

  // ── PLAYOFF BRACKET (championship bracket only, no consolation) ──
  const playoffTeamCount = s.num_teams >= 12 ? 6 : 4;
  // Qualifiers = top N by final rank. Bracket seeds = regular-season record
  // (wins + 0.5·ties DESC), points for as tiebreaker. Final rank reshuffles
  // by playoff outcome — e.g. 2024 Opolos was 12-2 (true #1 seed, bye) but
  // finished rank 3 after losing in the semis, which would mis-identify
  // LVC/Greek as the bye seeds. Ties must be half-counted because seasons
  // like 2022 had tied games (Greek 10-3-1, Johnny Fantasy 9-4-1).
  const playoffQualifiers = [...seasonSt]
    .sort((a,b) => a.rank - b.rank)
    .slice(0, playoffTeamCount);
  const seedRecord = (t) => (t.wins || 0) + 0.5 * (t.ties || 0);
  const playoffSeeds = [...playoffQualifiers].sort((a,b) => {
    const r = seedRecord(b) - seedRecord(a);
    if (r !== 0) return r;
    return (b.points_for || 0) - (a.points_for || 0);
  });
  const seedByKey = new Map(playoffSeeds.map((t, idx) => [t.team_key, idx + 1]));
  const realPlayoffKeys = new Set(playoffSeeds.map(t => t.team_key));
  const playoffMatchups = seasonMu
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
        const t1 = seasonSt.find(t => t.team_key === winnerArr[0]);
        const t2 = seasonSt.find(t => t.team_key === winnerArr[1]);
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
  const seasonFullMu = seasonMu;
  const regSeason = seasonFullMu.filter(m => !m.is_playoffs);
  let allScores = [];
  let allMargins = [];
  const teamTotals = {};

  seasonFullMu.forEach(m => {
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
  const regularSeasonStandings = [...seasonSt].sort((a,b) => a.rank - b.rank);
  const allSt = seasonSt;
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

    // Trace championship bracket by working backwards from the final
    const playoffWeeks = [...new Set(fullMu.filter(m => m.is_playoffs).map(m => m.week))].sort((a, b) => a - b);
    if (playoffWeeks.length < 3) return;
    const [wk1, wk2, wk3] = playoffWeeks;
    const top6Games = (wk) => fullMu.filter(m => m.is_playoffs && m.week === wk && bracketKeys.has(m.team1.team_key) && bracketKeys.has(m.team2.team_key));

    // Identify championship game from final week. Do NOT include 3rd-place
    // or any other placement game — they are consolation, not playoffs.
    const finalGames = top6Games(wk3);
    const champGame = finalGames.find(m => m.is_championship) ||
      finalGames.find(m => m.team1.team_key === s.champion?.team_key || m.team2.team_key === s.champion?.team_key);

    // Semi-finalists = the two teams in the final. (The other two semi losers
    // play the 3rd-place game, but that is consolation and excluded.)
    const semiFinalTeams = new Set();
    if (champGame) { semiFinalTeams.add(champGame.team1.team_key); semiFinalTeams.add(champGame.team2.team_key); }

    // Real semis = wk2 top-6 games that sent a team into the final.
    const realSemis = top6Games(wk2).filter(m => semiFinalTeams.has(m.team1.team_key) || semiFinalTeams.has(m.team2.team_key));

    // Collect all quarter-finalists from semis
    const qfTeams = new Set(semiFinalTeams);
    realSemis.forEach(m => { qfTeams.add(m.team1.team_key); qfTeams.add(m.team2.team_key); });

    // Real R1 = wk1 top-6 games where at least one team advanced to the semis.
    const realRd1 = top6Games(wk1).filter(m => qfTeams.has(m.team1.team_key) || qfTeams.has(m.team2.team_key));

    // True regular-season seeding for upset detection: record (wins + 0.5·ties),
    // points for as tiebreaker. Matches the league's bye-seed rule.
    const seedingRecord = (t) => (t.wins || 0) + 0.5 * (t.ties || 0);
    const seeding = [...fullSt].sort((a, b) => seedingRecord(b) - seedingRecord(a) || (b.points_for || 0) - (a.points_for || 0));
    const seedMap = {};
    seeding.forEach((t, i) => { seedMap[t.team_key] = i + 1; });

    // All real championship-chain games (final + semis + R1). No 3rd-place.
    const allChampGames = [...(champGame ? [champGame] : []), ...realSemis, ...realRd1];
    // Deduplicate by week+teams
    const seen = new Set();
    allChampGames.filter(m => {
      const k = m.week + ':' + [m.team1.team_key, m.team2.team_key].sort().join(':');
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    }).forEach(m => {
      if (!m.winner_team_key) return;
      const mgr1 = getMgrFromTeamKeyFull(m.team1.team_key, fullSt);
      const mgr2 = getMgrFromTeamKeyFull(m.team2.team_key, fullSt);
      const winnerMgr = m.winner_team_key === m.team1.team_key ? mgr1 : mgr2;
      const loserMgr = m.winner_team_key === m.team1.team_key ? mgr2 : mgr1;
      if (stats[winnerMgr]) stats[winnerMgr].wins++;
      if (stats[loserMgr]) stats[loserMgr].losses++;

      const winnerPts = m.winner_team_key === m.team1.team_key ? m.team1.points : m.team2.points;
      const loserPts = m.winner_team_key === m.team1.team_key ? m.team2.points : m.team1.points;
      if (stats[winnerMgr] && winnerPts > stats[winnerMgr].bestWeek) stats[winnerMgr].bestWeek = winnerPts;
      if (stats[loserMgr] && loserPts > stats[loserMgr].bestWeek) stats[loserMgr].bestWeek = loserPts;

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

  html += '<div class="luck-list">';
  results.forEach((r, i) => {
    const trophies = '\ud83c\udfc6'.repeat(r.titles) + '\ud83e\udd48'.repeat(r.runnerUps);
    const pctColor = r.winPct >= 0.600 ? '#c9a84c' : r.winPct >= 0.500 ? '#4ade80' : r.winPct >= 0.400 ? 'var(--bone)' : 'rgba(248,113,113,0.8)';
    const pctLabel = r.totalGames > 0 ? (r.winPct * 100).toFixed(0) + '%' : '\u2014';

    html += `<div class="drought-row${i < 3 ? ' drought-row--top' : ''}">
      <div class="drought-row-rank">${i + 1}</div>
      <div class="drought-row-name">${r.teamName} ${trophies}</div>
      <div class="drought-row-tag" style="color:${pctColor};font-weight:600;font-size:14px">${pctLabel}</div>
      <div class="drought-row-last">${r.wins}W\u2013${r.losses}L \u00b7 ${r.appearances} apps \u00b7 ${r.upsets} upsets</div>
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
    const cgFullMu = s.allMatchups || s.matchups;
    const cgFullSt = s.allStandings || s.standings;
    cgFullMu.forEach(m => {
      if (m.is_playoffs) return; // regular season only
      if (!m.winner_team_key) return;
      const mgr1 = getMgrFromTeamKeyFull(m.team1.team_key, cgFullSt);
      const mgr2 = getMgrFromTeamKeyFull(m.team2.team_key, cgFullSt);
      if (!mgr1 || !mgr2) return;
      // Only track stats for allowed managers
      const mgr1Allowed = stats[mgr1] !== undefined;
      const mgr2Allowed = stats[mgr2] !== undefined;
      if (!mgr1Allowed && !mgr2Allowed) return;

      const margin = Math.abs(m.team1.points - m.team2.points);
      if (margin > CLOSE_MARGIN) return;

      const winnerMgr = m.winner_team_key === m.team1.team_key ? mgr1 : mgr2;
      const loserMgr = m.winner_team_key === m.team1.team_key ? mgr2 : mgr1;
      if (stats[winnerMgr]) stats[winnerMgr].closeWins++;
      if (stats[loserMgr]) stats[loserMgr].closeLosses++;

      closestGames.push({
        margin,
        winner: (MANAGERS_MAP[winnerMgr]?.teamName) || winnerMgr || m.team1.team_name,
        loser: (MANAGERS_MAP[loserMgr]?.teamName) || loserMgr || m.team2.team_name,
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
      <div class="drought-row-tag" style="color:${pctColor}">${(r.winPct*100).toFixed(0)}%</div>
      <div class="drought-row-last">${r.closeWins}W\u2013${r.closeLosses}L (${r.total} games)</div>
    </div>`;
  });
  html += '</div>';

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
    const boFullMu = s.allMatchups || s.matchups;
    const boFullSt = s.allStandings || s.standings;
    boFullMu.forEach(m => {
      if (m.is_playoffs) return; // regular season only
      if (!m.winner_team_key) return;
      const mgr1 = getMgrFromTeamKeyFull(m.team1.team_key, boFullSt);
      const mgr2 = getMgrFromTeamKeyFull(m.team2.team_key, boFullSt);
      if (!mgr1 || !mgr2) return;

      const margin = Math.abs(m.team1.points - m.team2.points);
      if (margin < BLOWOUT_MARGIN) return;

      const winnerMgr = m.winner_team_key === m.team1.team_key ? mgr1 : mgr2;
      const loserMgr = m.winner_team_key === m.team1.team_key ? mgr2 : mgr1;
      if (stats[winnerMgr]) stats[winnerMgr].dealt++;
      if (stats[loserMgr]) stats[loserMgr].received++;
      if (stats[winnerMgr] && margin > stats[winnerMgr].biggestWin) stats[winnerMgr].biggestWin = margin;
      if (stats[loserMgr] && margin > stats[loserMgr].biggestLoss) stats[loserMgr].biggestLoss = margin;
    });
  });

  const results = Object.entries(stats)
    .filter(([, d]) => d.dealt + d.received > 0)
    .map(([mgr, d]) => {
      const net = d.dealt - d.received;
      return { mgr, teamName: MANAGERS_MAP[mgr].teamName, ...d, net };
    })
    .sort((a, b) => b.net !== a.net ? b.net - a.net : b.dealt - a.dealt);

  let html = '<div class="records-chapter-header">';
  html += '<div class="records-chapter-label">Chapter</div>';
  html += '<div class="records-chapter-title">Taken to the Shed</div>';
  html += '<div class="records-chapter-sub">Games won or lost by 20+ points \u2014 who does the taking and who gets taken?</div>';
  html += '</div>';

  html += '<div class="luck-list">';
  results.forEach((r, i) => {
    const total = r.dealt + r.received;
    const dealPct = total > 0 ? (r.dealt / total) * 100 : 50;
    const isBully = r.net >= 10;
    const isVictim = r.net <= -10;
    const color = isBully ? '#c9a84c' : isVictim ? '#f87171' : 'var(--bone)';
    const tag = isBully ? 'BULLY' : isVictim ? 'VICTIM' : '';

    html += `<div class="drought-row${i < 3 ? ' drought-row--top' : ''}">
      <div class="drought-row-rank">${i + 1}</div>
      <div class="drought-row-name">${r.teamName}</div>
      <div class="drought-row-bar">
        <div style="width:${dealPct}%;height:100%;background:rgba(201,168,76,0.4);border-radius:4px 0 0 4px"></div>
        <div style="width:${100 - dealPct}%;height:100%;background:rgba(248,113,113,0.3);border-radius:0 4px 4px 0"></div>
      </div>
      <div class="drought-row-tag" style="color:${color}">${tag}</div>
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
      <div class="drought-row-tag" style="color:${color}">${r.avgPA.toFixed(1)}</div>
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
      <div class="drought-row-tag" style="color:${color}">${tag}</div>
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
  // Opolos (B-waite) is pinned to rank 12 regardless of composite score.
  const opolosMgr = 'B-waite';
  const nonOpolos = allSeasons.filter(r => r.mgr !== opolosMgr);
  const opolosBest = allSeasons.find(r => r.mgr === opolosMgr);
  const top12 = nonOpolos.slice(0, 11);
  if (opolosBest) top12.push(opolosBest);

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
      <div class="drought-row-tag" style="color:var(--bone)">${record}</div>
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
    const lfFullMu = s.allMatchups || s.matchups;
    const lfFullSt = s.allStandings || s.standings;
    const playoffStart = s.playoff_start_week || 14;

    // Gather regular-season weekly scores for ALL teams (full 12-team pool)
    const weeklyScores = {};
    lfFullMu.forEach(m => {
      if (m.week >= playoffStart) return;
      const mgr1 = getMgrFromTeamKeyFull(m.team1.team_key, lfFullSt);
      const mgr2 = getMgrFromTeamKeyFull(m.team2.team_key, lfFullSt);
      if (!mgr1 || !mgr2) return;

      if (!weeklyScores[m.week]) weeklyScores[m.week] = [];
      weeklyScores[m.week].push({ mgr: mgr1, pts: m.team1.points });
      weeklyScores[m.week].push({ mgr: mgr2, pts: m.team2.points });
    });

    // Track which allowed managers participated this season
    const seasonMgrs = new Set();

    // For each week, compute all-play record against ALL 11 opponents
    Object.values(weeklyScores).forEach(scores => {
      scores.forEach(entry => {
        if (!luckData[entry.mgr]) return; // only track allowed managers
        seasonMgrs.add(entry.mgr);
        const opponents = scores.filter(o => o.mgr !== entry.mgr);
        const wins = opponents.filter(o => entry.pts > o.pts).length;
        const ties = opponents.filter(o => entry.pts === o.pts).length;
        luckData[entry.mgr].expectedWins += (wins + ties * 0.5) / (opponents.length || 1);
      });
    });

    // Actual wins from full standings
    lfFullSt.forEach(t => {
      const mgr = t.managers[0] || null;
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
      <div class="drought-row-tag" style="color:${labelColor}">${deltaStr} W</div>
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
    { id: 'records-close', label: 'Close Games' },
    { id: 'records-bestseason', label: 'Best Seasons' },
    { id: 'records-drought', label: 'Drought' },
  ];
  nav.innerHTML = chapters.map(c =>
    '<a class="records-nav-link" href="#' + c.id + '">' + c.label + '</a>'
  ).join('');

  // Click handler for smooth scrolling with offset
  nav.querySelectorAll('.records-nav-link').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      var targetId = link.getAttribute('href').substring(1);
      var target = document.getElementById(targetId);
      if (target) {
        var offset = 60;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });
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
  home:       { tab: 'home',      title: '', sub: '' },
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
    var tabToView = { home:'home', champions:'champions', power:'standings', records:'records',
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

  // Mobile back button → Home
  var backBtn = document.getElementById('mphBack');
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      setView('home');
    });
  }
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

// ── PWA INSTALL PROMPT ──────────────────────────────────────
var deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  deferredInstallPrompt = e;
});

function showInstallBanner() {
  if (!deferredInstallPrompt) return;
  if (localStorage.getItem('bkgffl-install-dismissed')) return;
  var banner = document.getElementById('install-banner');
  if (!banner) return;
  banner.style.display = 'flex';
  document.getElementById('install-btn').addEventListener('click', function() {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then(function() {
      deferredInstallPrompt = null;
      banner.style.display = 'none';
    });
  });
  document.getElementById('install-dismiss').addEventListener('click', function() {
    banner.style.display = 'none';
    localStorage.setItem('bkgffl-install-dismissed', '1');
  });
}

function showIOSInstallHint() {
  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  var isStandalone = window.navigator.standalone === true;
  if (!isIOS || isStandalone || localStorage.getItem('bkgffl-ios-hint')) return;
  var banner = document.getElementById('install-banner');
  if (!banner) return;
  banner.querySelector('.install-banner-text').textContent = 'Tap the share button, then "Add to Home Screen" for the full app experience';
  banner.querySelector('#install-btn').style.display = 'none';
  banner.style.display = 'flex';
  document.getElementById('install-dismiss').addEventListener('click', function() {
    banner.style.display = 'none';
    localStorage.setItem('bkgffl-ios-hint', '1');
  });
}

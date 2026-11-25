// ── LIVE SEASON FEED ────────────────────────────────────────
// Talks to /api/live (a serverless function that reads the league's current
// Yahoo season) and keeps the freshest copy on the device, so the app opens
// instantly with the last-known scores and then catches up.
//
// The archive (data/league_data.json) is the permanent record; this layers the
// season in progress on top of it. If the feed is unreachable or not set up,
// the app simply runs on the archive.

const STORE_KEY = 'bkgffl-live-v1';
const FAST = 45_000;        // games in progress
const NORMAL = 5 * 60_000;  // in season, nothing live
const SLOW = 30 * 60_000;   // offseason / feed down

function readStore() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) { return null; }
}
function writeStore(snapshot) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(snapshot)); } catch (e) { /* storage full or blocked: fine */ }
}

/** True during the usual NFL game windows (US Eastern time). Yahoo flags a
 *  week as in progress from Tuesday on, so this is how we tell "games are on"
 *  from "the week has started". */
export function nflWindow(now = new Date()) {
  const p = {};
  new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: 'numeric', hourCycle: 'h23', month: 'numeric', day: 'numeric' })
    .formatToParts(now).forEach(x => { p[x.type] = x.value; });
  const h = +p.hour, d = p.weekday, mo = +p.month, day = +p.day;
  const lateSeason = mo === 12 || mo === 1;
  if (h < 1) return ['Mon', 'Tue', 'Fri', 'Sun'].includes(d) || (d === 'Sat' && mo === 11); // night games running past midnight
  if (d === 'Sun') return h >= 9;
  if (d === 'Mon') return h >= 19;
  if (d === 'Thu') return h >= (mo === 11 && day >= 22 && day <= 28 ? 12 : 19); // Thanksgiving starts at lunch
  if (d === 'Fri') return mo === 11 && day >= 23 && day <= 29 && h >= 14;      // Black Friday game
  if (d === 'Sat') return lateSeason && h >= 12;
  return false;
}

const weekPoints = snap => (snap && snap.season ? snap.season.matchups.filter(m => m.week === snap.season.current_week).reduce((n, m) => n + m.team1.points + m.team2.points, 0) : 0);

const matchupId = m => m.week + ':' + [m.team1.team_key, m.team2.team_key].sort().join(':');

/** Fold a "this week only" response into the last full snapshot. */
function mergePartial(full, part) {
  if (!full || !full.season || full.season.league_key !== part.season.league_key) return null;
  const fresh = new Map(part.season.matchups.map(m => [matchupId(m), m]));
  const matchups = full.season.matchups.map(m => fresh.get(matchupId(m)) || m);
  const known = new Set(matchups.map(matchupId));
  part.season.matchups.forEach(m => { if (!known.has(matchupId(m))) matchups.push(m); });
  return {
    ...full,
    fetched_at: part.fetched_at,
    season: { ...full.season, ...part.season, matchups, partial: false },
  };
}

export function createLiveFeed({ onUpdate, endpoint = '/api/live' }) {
  let snapshot = readStore();
  let state = { status: snapshot ? 'stale' : 'idle', fetchedAt: snapshot ? snapshot.fetched_at : null, error: null };
  let timer = null;
  let fullFetchedAt = 0;
  let movedAt = 0; // last time a score changed between two polls

  const emit = () => onUpdate(snapshot, { ...state });

  async function pull() {
    // A full pull (every week + the wire) on first load and every 15 minutes;
    // in between, the cheap "this week" poll.
    const wantFull = !snapshot || !snapshot.season || snapshot.season.partial || Date.now() - fullFetchedAt > 15 * 60_000;
    const url = endpoint + (wantFull ? '' : (endpoint.includes('?') ? '&' : '?') + 'scope=now');
    try {
      const resp = await fetch(url, { headers: { Accept: 'application/json' } });
      const json = await resp.json().catch(() => null);
      if (!resp.ok || !json || !json.ok || !json.season) {
        state = { ...state, status: snapshot ? 'stale' : 'off', error: (json && json.error) || 'unavailable' };
        return emit();
      }
      let next = json;
      if (json.season.partial) next = mergePartial(snapshot, json);
      if (!next) { fullFetchedAt = 0; return pull(); } // season rolled over: start again with a full pull
      if (!json.season.partial) fullFetchedAt = Date.now();
      if (snapshot && weekPoints(next) !== weekPoints(snapshot) && next.season.league_key === snapshot.season.league_key) movedAt = Date.now();
      snapshot = next;
      writeStore(snapshot);
      state = { status: 'ok', fetchedAt: snapshot.fetched_at, error: null, movedAt };
      emit();
    } catch (e) {
      state = { ...state, status: snapshot ? 'stale' : 'off', error: 'offline' };
      emit();
    }
  }

  function interval() {
    if (state.status === 'off') return SLOW;
    const s = snapshot && snapshot.season;
    if (!s || s.is_finished) return SLOW;
    const underway = s.matchups.some(m => m.status === 'midevent');
    return underway && (nflWindow() || Date.now() - movedAt < 6 * 60_000) ? FAST : NORMAL;
  }

  function schedule() {
    clearTimeout(timer);
    if (document.hidden) return;
    timer = setTimeout(async () => { await pull(); schedule(); }, interval());
  }

  document.addEventListener('visibilitychange', async () => {
    if (document.hidden) return clearTimeout(timer);
    await pull(); // coming back to the app: catch up immediately
    schedule();
  });
  window.addEventListener('online', async () => { await pull(); schedule(); });

  return {
    /** Last-known snapshot from this device, available synchronously. */
    cached: () => snapshot,
    state: () => ({ ...state }),
    async start() { await pull(); schedule(); },
    async refresh() { fullFetchedAt = 0; await pull(); schedule(); },
  };
}

/** Archive seasons + the live season, newest version of each year winning. */
export function mergeSeasons(archiveSeasons, liveSnapshot) {
  const live = liveSnapshot && liveSnapshot.season;
  if (!live || !live.season || !Array.isArray(live.standings) || !live.standings.length) return archiveSeasons;
  const archived = archiveSeasons.find(s => s.season === live.season);
  // A finished, crowned season in the archive is final; never let a feed overwrite it.
  if (archived && archived.champion) return archiveSeasons;
  return [...archiveSeasons.filter(s => s.season !== live.season), live];
}

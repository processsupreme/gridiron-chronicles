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
      snapshot = next;
      writeStore(snapshot);
      state = { status: 'ok', fetchedAt: snapshot.fetched_at, error: null };
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
    return s.matchups.some(m => m.status === 'midevent') ? FAST : NORMAL;
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

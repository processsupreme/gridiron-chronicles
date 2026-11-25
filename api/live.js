// GET /api/live          → the current season: standings, every matchup, recent transactions
// GET /api/live?scope=now → standings + this week's scoreboard only (what the app polls)
//
// Vercel serverless function. Reads Yahoo credentials from environment
// variables (see api/_yahoo.js) and is cached at the edge, so twelve phones
// refreshing on a Sunday cost one Yahoo request per cache window, not twelve.

'use strict';

const yahoo = require('./_yahoo');

function cacheHeader(season) {
  // max-age=0: browsers always ask; the edge (s-maxage) is what absorbs the load.
  if (season.is_finished) return 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400';
  const live = season.matchups.some(m => m.week === season.current_week && m.status === 'midevent');
  return live
    ? 'public, max-age=0, s-maxage=30, stale-while-revalidate=120'
    : 'public, max-age=0, s-maxage=120, stale-while-revalidate=600';
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ ok: false, error: 'method_not_allowed' }));
  }

  const { creds, missing } = yahoo.readCreds();
  if (missing.length) {
    res.statusCode = 503;
    res.setHeader('Cache-Control', 'no-store');
    return res.end(JSON.stringify({ ok: false, error: 'not_configured', missing }));
  }

  const url = new URL(req.url, 'http://localhost');
  const full = url.searchParams.get('scope') !== 'now';

  try {
    const token = await yahoo.getAccessToken(creds);
    const leagueKey = await yahoo.discoverLeagueKey(token, process.env.YAHOO_LEAGUE_KEY);
    const snapshot = await yahoo.fetchSeason(token, leagueKey, { full, transactions: full });
    res.statusCode = 200;
    res.setHeader('Cache-Control', cacheHeader(snapshot.season));
    return res.end(JSON.stringify({ ok: true, fetched_at: new Date().toISOString(), ...snapshot }));
  } catch (err) {
    // Never echo upstream bodies or anything credential-shaped back to the client.
    res.statusCode = err.code === 'auth' ? 503 : 502;
    res.setHeader('Cache-Control', 'no-store');
    return res.end(JSON.stringify({ ok: false, error: err.code === 'auth' ? 'yahoo_auth_failed' : 'yahoo_unavailable' }));
  }
};

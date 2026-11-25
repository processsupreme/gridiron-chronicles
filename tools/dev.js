#!/usr/bin/env node
// Local dev server: static files + the /api/live function, no dependencies.
//
//   node tools/dev.js                     real Yahoo data (needs REFRESH_TOKEN in yahoo_creds.py)
//   node tools/dev.js --fixture           simulated season, week 12, games in progress
//   node tools/dev.js --fixture 16 post   simulated: week 16 finished (playoffs under way)
//   node tools/dev.js --fixture 18        simulated: season complete
//   node tools/dev.js --no-live           /api/live answers 503, like an unconfigured deploy
//   PORT=9000 node tools/dev.js
//
// While running with --fixture, /api/live?week=9&phase=pre overrides the moment per request.

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { ROOT, loadIntoEnv } = require('./_creds');
const { makeFixture } = require('./make-fixture');

const args = process.argv.slice(2);
const fixtureAt = args.indexOf('--fixture');
const useFixture = fixtureAt >= 0;
const noLive = args.includes('--no-live');
const fxWeek = useFixture && /^\d+$/.test(args[fixtureAt + 1] || '') ? +args[fixtureAt + 1] : 12;
const fxPhase = useFixture && /^(pre|mid|post|final)$/.test(args[fixtureAt + 2] || '') ? args[fixtureAt + 2] : 'mid';
const PORT = +process.env.PORT || 8765;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.mp4': 'video/mp4', '.ico': 'image/x-icon', '.webmanifest': 'application/manifest+json',
};

if (!useFixture && !noLive) loadIntoEnv();
const liveHandler = require('../api/live');

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/live') {
    if (noLive) { res.writeHead(503, { 'Content-Type': 'application/json' }); return res.end('{"ok":false,"error":"not_configured"}'); }
    if (useFixture) {
      const week = +(url.searchParams.get('week') || fxWeek);
      const phase = url.searchParams.get('phase') || fxPhase;
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      return res.end(JSON.stringify(makeFixture({ week, phase })));
    }
    return liveHandler(req, res);
  }

  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(buf);
  });
}).listen(PORT, () => {
  const mode = noLive ? 'live feed disabled' : useFixture ? 'fixture: week ' + fxWeek + ' (' + fxPhase + ')' : 'live Yahoo data';
  console.log('BKGFFL Ledger → http://localhost:' + PORT + '  [' + mode + ']');
});

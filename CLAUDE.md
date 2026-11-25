# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The BKGFFL Ledger — an installable PWA for the BKGFFL Yahoo fantasy football league. It does two jobs: show the season in progress (live scores, standings, playoff race, with every number annotated against league history) and serve as the permanent record since 2014 (champions, records, franchise pages, head-to-head). Its users are the league's 12 managers, mostly on phones. Deployed on Vercel from a public repo.

## Stack and running locally

No framework, no bundler, no package manager, no dependencies. Plain HTML + CSS + vanilla JS (native ES modules), one Vercel serverless function, and Node scripts (Node 18+).

- Run the app: `node tools/dev.js` then open http://localhost:8765. It serves the static files and the `/api/live` function.
  - `node tools/dev.js --fixture [week] [pre|mid|post]` simulates a season without touching Yahoo (replays the last archived season as next year's). `--fixture 18` is a finished season. Use this to work on anything live-related.
  - `node tools/dev.js --no-live` behaves like a deploy with no credentials (archive only).
  - With no flag it uses real Yahoo data and needs `REFRESH_TOKEN` in `yahoo_creds.py`.
  - A plain static server (`python3 -m http.server`) also works; the app just runs on the archive.
- Tests: `node tests/engine.test.mjs && node tests/yahoo.test.js`. Run both after touching `js/league.js`, `api/`, or the data.
- Yahoo auth (one time): `node tools/yahoo-auth.js` mints a long-lived refresh token into the gitignored `yahoo_creds.py`. `--check` verifies it; `--publish` copies the three secrets to Vercel env and GitHub Actions secrets.
- Archive sync: `node tools/sync-archive.js [--dry-run]` writes the current Yahoo season into `data/league_data.json`. `.github/workflows/sync-archive.yml` runs it twice a week and commits the result.

## Architecture

Data flow: `data/league_data.json` (archive) + `/api/live` (current season) → `buildLeague()` → views.

- `js/league.js` — the stats engine. One pass over the raw seasons produces every number in the app; views never compute stats themselves. Holds `POLICY` (which seasons and franchises count) and the canonical record rule. Pure, runs in Node.
- `js/insights.js` — turns engine output into sentences (matchup history, storylines, weekly awards, franchise notes). Everything is derived; nothing names a specific team.
- `js/live.js` — client for `/api/live`: polling (45s when games are live, 5 min otherwise, paused when hidden), a last-known snapshot in localStorage, and merging the live season over the archive.
- `js/app.js` — hash router (`#/`, `#/now/week/8`, `#/seasons`, `#/season/2025`, `#/franchises`, `#/franchise/lvc`, `#/records/shed`, `#/versus/lvc/mark`) and the views, which return HTML strings.
- `css/styles.css` — the design system, "Sunday Broadcast": royal-blue field, signal yellow, Barlow Condensed (heavy italic for display) plus Barlow for sentences. Yellow is the brand, the leader, and the champion; red is live and the playoff line. Nothing floats: every list, table, and stat goes in a `.mod` with a yellow header tab (use the `sec()` helper in `js/app.js`), and every franchise row starts with the same `.badge` monogram. Do not give franchises individual colors.
- `api/live.js` + `api/_yahoo.js` — serverless function and Yahoo client. Reads `YAHOO_CLIENT_ID`, `YAHOO_CLIENT_SECRET`, `YAHOO_REFRESH_TOKEN` from the environment, finds the newest season by following the league's `renewed` chain from the last known league key, and is edge-cached (30s while games are live).
- `sw.js` — service worker: network-first shell and data, cache-first media, never caches `/api/`.
- `tests/baseline.json` — career numbers from the pre-2026 app, verified in `.audit-career.md`. The engine test asserts the engine still reproduces them.
- Legacy Python (`yahoo_pull_v3.py`, `fix_*.py`, `fetch_drafts.py`) built the original archive with single-use auth codes. Kept for reference; the Node tools replace them.

## League rules encoded in the engine

- History starts in 2014 (`POLICY.minSeason`). Only the 12 franchises in `POLICY.franchises` (keyed by Yahoo manager nickname) get career stats. Retired teams' games still count for the franchises that played them, and their scores stay in the record book.
- The canonical record: a game counts toward W/L/points iff it is regular season or on the championship chain (round one, semis, final). Third-place, placement, and consolation games never count, for anyone. Points per game uses the same games.
- A season in progress counts toward career W/L as games go final, but gives no playoff credit until the regular season ends and no title until the final is played.
- League lore lives in `js/app.js`: `SEASON_NOTES` (the 2022 note) and `PINNED_LAST` (the Best Seasons ruling).

## Validating changes

Run the two test files, then look at the app: `node tools/dev.js --fixture 12 mid`, click through all five tabs at phone width and desktop width, and check the console. Also check `--fixture 16 mid` (playoffs), `--fixture 18` (season complete), and `--no-live` (offseason). Team names come from league members and are rendered through `esc()`; keep it that way.

`index.html` loads `css/styles.css?v=64` and `js/app.js?v=64` — bump the `?v=` when editing those files.

## Non-negotiables

- `yahoo_creds.py` is gitignored and must NEVER be committed. This is a PUBLIC repo — never hardcode Yahoo client IDs, secrets, auth codes, or refresh tokens anywhere. Tools read them from `yahoo_creds.py` or the environment; never print them.
- Do not bypass the engine's policy: no view should read raw seasons or decide for itself whether a game counts.
- `data/league_data.json` is the single canonical archive. A season with a champion in it is final; the sync and the live merge both refuse to overwrite it without `--force`.
- Do not commit `.vercel/`, `.DS_Store`, or `*.bak` (already gitignored).

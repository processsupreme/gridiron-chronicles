# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The BKGFFL Ledger — a static, installable PWA archiving 12 seasons (2014–present) of the BKGFFL Yahoo fantasy football league: champions, standings, records, seasons, manager pages, and head-to-head compare. Its users are the league's 12 managers. Deployed on Vercel as a plain static site (public repo).

## Stack and running locally

No framework, no bundler, no package manager. Plain HTML + CSS + vanilla JS, plus standalone Python 3 scripts (only external dep: `requests`) for pulling data from the Yahoo Fantasy API.

- Run the site: any static file server from the repo root, e.g. `python3 -m http.server 8000`, then open http://localhost:8000. (Opening `index.html` via `file://` breaks the `fetch` of the data JSON and the service worker.)
- Refresh league data: `python3 yahoo_pull_v3.py` — requires a gitignored `yahoo_creds.py` providing `CLIENT_ID`, `CLIENT_SECRET`, and a fresh `AUTH_CODE`. Writes `./league_data.json` at the repo root.
- One-off data repair scripts: `python3 fix_championship_flags.py`, `python3 fix_week17.py`, `python3 fix_and_filter.py`, `python3 fetch_drafts.py` — these also read/write the root `league_data.json`.

Note the two copies of the dataset: Python scripts operate on root `league_data.json` (a working copy); the app actually fetches `data/league_data.json`. After regenerating, copy the root file into `data/` for the site to see it.

## Key files

- `index.html` — all markup for the single-page app (landing, tab shell, drawer nav).
- `js/app.js` — the entire application (~3,800 lines). Starts with the league data policy: `MIN_SEASON_YEAR`, `ALLOWED_MANAGERS`, `RETIRED_MANAGERS`, and `applyLeagueFilters()` — the single source of truth for which seasons/franchises count. All data consumers must go through `applyLeagueFilters()`, never read `DATA.seasons` directly.
- `css/styles.css` — all styling.
- `sw.js` — service worker: network-first for shell and data, cache-first for media; designed so Vercel deploys auto-propagate without cache-version bumps.
- `data/league_data.json` — the dataset the app serves. Root `league_data.json` — script working copy.
- `vercel.json` — cache headers and SPA rewrite to `index.html`.
- `manifest.json`, `icons/`, `favicon.svg` — PWA install assets; `rings/`, `assets/` — championship-ring images and media; `install.html` — install guide.
- `.audit-career.md` — verified career-stats audit; documents that `avgPts` intentionally includes playoff games.

## Validating changes

There are no tests, linters, or build steps. Validate manually: serve locally, click through every tab (Champions, Standings, Records, Seasons, Managers, Compare), and check the browser console. `index.html` loads `css/styles.css?v=40` and `js/app.js?v=44` — bump the `?v=` query when editing those files. For data changes, sanity-check totals against `.audit-career.md`.

## Non-negotiables

- `yahoo_creds.py` is gitignored and must NEVER be committed. This is a PUBLIC repo — never hardcode Yahoo client IDs, secrets, or auth codes in any script; always import them from `yahoo_creds.py`.
- Do not bypass `applyLeagueFilters()` in `js/app.js` — it enforces which seasons and managers are part of league history.
- Do not commit `.vercel/`, `.DS_Store`, or `*.bak` (already gitignored).

#!/usr/bin/env node
// One-time Yahoo authorization for the BKGFFL Ledger.
//
//   node tools/yahoo-auth.js              interactive: opens Yahoo, asks for the code
//   node tools/yahoo-auth.js --code XXXX  non-interactive
//   node tools/yahoo-auth.js --check      verify the saved token still works
//   node tools/yahoo-auth.js --publish    also copy the three secrets to Vercel + GitHub
//
// It trades a single-use Yahoo code for a long-lived REFRESH token and saves
// it in the gitignored yahoo_creds.py. After this, nothing needs a pasted code
// again: the live API and the archive sync both mint their own access tokens.

'use strict';

const readline = require('readline');
const { execFileSync, spawnSync } = require('child_process');
const { readCredsFile, writeCred, loadIntoEnv, CREDS_FILE } = require('./_creds');
const yahoo = require('../api/_yahoo');

const args = process.argv.slice(2);
const flag = name => args.includes('--' + name);
const opt = name => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : null; };

const REDIRECT = opt('redirect') || 'oob';

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, a => { rl.close(); resolve(a.trim()); }));
}

async function exchange(clientId, clientSecret, code) {
  const basic = Buffer.from(clientId + ':' + clientSecret).toString('base64');
  const resp = await fetch('https://api.login.yahoo.com/oauth2/get_token', {
    method: 'POST',
    headers: { Authorization: 'Basic ' + basic, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT }),
  });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok || !json.refresh_token) {
    throw new Error('Yahoo rejected the code (' + resp.status + (json.error ? ': ' + json.error : '') + '). Codes are single-use and expire in minutes — get a fresh one and try again.');
  }
  return json.refresh_token;
}

async function check() {
  loadIntoEnv();
  const { creds, missing } = yahoo.readCreds();
  if (missing.length) throw new Error('Missing ' + missing.join(', ') + '. Run this tool without --check first.');
  const token = await yahoo.getAccessToken(creds);
  const key = await yahoo.discoverLeagueKey(token, process.env.YAHOO_LEAGUE_KEY);
  const { season } = await yahoo.fetchSeason(token, key, { full: false, transactions: false });
  console.log('Connected: ' + season.league_name + ' ' + season.season + ' (' + key + '), week ' + season.current_week +
    ', ' + season.standings.length + ' teams, ' + season.matchups.length + ' matchups on this week\'s scoreboard.');
}

function publish() {
  loadIntoEnv();
  const names = ['YAHOO_CLIENT_ID', 'YAHOO_CLIENT_SECRET', 'YAHOO_REFRESH_TOKEN'];
  names.forEach(name => {
    const value = process.env[name];
    if (!value) throw new Error(name + ' is not set');
    // Values go over stdin so they never appear in argv or shell history.
    const gh = spawnSync('gh', ['secret', 'set', name], { input: value, stdio: ['pipe', 'inherit', 'inherit'] });
    console.log(gh.status === 0 ? 'GitHub secret set: ' + name : 'GitHub: could not set ' + name + ' (is `gh` logged in?)');
    ['production', 'preview'].forEach(target => {
      spawnSync('vercel', ['env', 'rm', name, target, '--yes'], { stdio: 'ignore' });
      const vc = spawnSync('vercel', ['env', 'add', name, target], { input: value, stdio: ['pipe', 'ignore', 'inherit'] });
      console.log(vc.status === 0 ? 'Vercel env set: ' + name + ' (' + target + ')' : 'Vercel: could not set ' + name + ' for ' + target + ' (run `vercel login` and `vercel link` first)');
    });
  });
  console.log('\nRedeploy for Vercel to pick up the new variables.');
}

(async () => {
  if (flag('check')) return check();
  if (flag('publish') && !opt('code') && readCredsFile().REFRESH_TOKEN) { await check(); return publish(); }

  const file = readCredsFile();
  if (!file.CLIENT_ID || !file.CLIENT_SECRET) {
    throw new Error('CLIENT_ID and CLIENT_SECRET must be set in ' + CREDS_FILE + ' (gitignored).');
  }

  let code = opt('code');
  if (!code) {
    const url = 'https://api.login.yahoo.com/oauth2/request_auth?client_id=' + encodeURIComponent(file.CLIENT_ID) +
      '&redirect_uri=' + encodeURIComponent(REDIRECT) + '&response_type=code';
    console.log('\n1. Sign in to Yahoo and click Agree:\n\n   ' + url + '\n');
    try { execFileSync(process.platform === 'darwin' ? 'open' : 'xdg-open', [url], { stdio: 'ignore' }); } catch (e) { /* print-only is fine */ }
    code = await ask('2. Paste the code Yahoo shows you (or the full redirect URL): ');
  }
  const fromUrl = code.match(/[?&]code=([^&\s]+)/);
  if (fromUrl) code = decodeURIComponent(fromUrl[1]);
  if (!code) throw new Error('No code entered.');

  const refreshToken = await exchange(file.CLIENT_ID, file.CLIENT_SECRET, code);
  writeCred('REFRESH_TOKEN', refreshToken);
  console.log('\nSaved a refresh token to yahoo_creds.py (gitignored).');
  await check();

  if (flag('publish')) publish();
  else console.log('\nNext: `node tools/yahoo-auth.js --publish` copies the secrets to Vercel and GitHub so the deployed app and the weekly archive sync can use them.');
})().catch(err => { console.error('\n' + err.message); process.exit(1); });

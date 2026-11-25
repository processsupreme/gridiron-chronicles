// Loads Yahoo credentials for local tools from the gitignored yahoo_creds.py
// (the same file the legacy Python scripts use) and/or the environment.
// Environment variables win, so CI can inject secrets without the file.

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CREDS_FILE = path.join(ROOT, 'yahoo_creds.py');

function readCredsFile() {
  const out = {};
  if (!fs.existsSync(CREDS_FILE)) return out;
  fs.readFileSync(CREDS_FILE, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(["'])(.*?)\2\s*(#.*)?$/);
    if (m) out[m[1]] = m[3];
  });
  return out;
}

/** Populate process.env.YAHOO_* from yahoo_creds.py where not already set. */
function loadIntoEnv() {
  const file = readCredsFile();
  const map = { YAHOO_CLIENT_ID: 'CLIENT_ID', YAHOO_CLIENT_SECRET: 'CLIENT_SECRET', YAHOO_REFRESH_TOKEN: 'REFRESH_TOKEN' };
  Object.entries(map).forEach(([envName, fileName]) => {
    if (!process.env[envName] && file[fileName]) process.env[envName] = file[fileName];
  });
  return file;
}

/** Insert or replace `NAME = "value"` in yahoo_creds.py without touching other lines. */
function writeCred(name, value) {
  const line = name + ' = ' + JSON.stringify(value);
  let text = fs.existsSync(CREDS_FILE) ? fs.readFileSync(CREDS_FILE, 'utf8') : '';
  const re = new RegExp('^\\s*' + name + '\\s*=.*$', 'm');
  if (re.test(text)) text = text.replace(re, line);
  else text = text.replace(/\n*$/, '\n') + '\n# Long-lived token minted by tools/yahoo-auth.js. Treat it like a password.\n' + line + '\n';
  fs.writeFileSync(CREDS_FILE, text, { mode: 0o600 });
}

module.exports = { ROOT, CREDS_FILE, readCredsFile, loadIntoEnv, writeCred };

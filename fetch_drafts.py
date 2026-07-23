import requests
import json
import time
import xml.etree.ElementTree as ET

from yahoo_creds import CLIENT_ID, CLIENT_SECRET  # creds live in gitignored yahoo_creds.py
_ = CLIENT_ID
from yahoo_creds import AUTH_CODE  # paste each fresh auth code into yahoo_creds.py
REDIRECT_URI = "oob"

token_resp = requests.post("https://api.login.yahoo.com/oauth2/get_token", data={
    "client_id": CLIENT_ID, "client_secret": CLIENT_SECRET,
    "redirect_uri": REDIRECT_URI, "code": AUTH_CODE, "grant_type": "authorization_code"
})
print("Token status:", token_resp.status_code)
if token_resp.status_code != 200:
    print(token_resp.text); exit()
token = token_resp.json()["access_token"]
print("Got token!")

LEAGUE_KEYS = [
    ("314.l.324082",2013),("331.l.167219",2014),("348.l.69705",2015),
    ("359.l.153728",2016),("371.l.27635",2017),("380.l.240531",2018),
    ("390.l.236819",2019),("399.l.414649",2020),("406.l.301211",2021),
    ("414.l.747744",2022),("423.l.186776",2023),("449.l.93173",2024),
    ("461.l.99849",2025)
]
NS = "http://fantasysports.yahooapis.com/fantasy/v2/base.rng"

draft_positions = {}

for lk, year in LEAGUE_KEYS:
    print(f"Fetching {year}...")
    r = requests.get(f"https://fantasysports.yahooapis.com/fantasy/v2/league/{lk}/teams",
                     headers={"Authorization": f"Bearer {token}"})
    time.sleep(0.3)
    if r.status_code != 200:
        print(f"  Error {r.status_code}"); continue
    try:
        root = ET.fromstring(r.text)
        teams = []
        for team in root.iter(f"{{{NS}}}team"):
            tk = team.findtext(f"{{{NS}}}team_key")
            dp = team.findtext(f"{{{NS}}}draft_position")
            name = team.findtext(f".//{{{NS}}}full")
            managers = []
            for mgr in team.iter(f"{{{NS}}}manager"):
                nn = mgr.findtext(f"{{{NS}}}nickname")
                if nn: managers.append(nn)
            if tk and dp:
                teams.append({"team_key": tk, "team_name": name, "managers": managers, "draft_position": int(dp)})
        draft_positions[str(year)] = teams
        print(f"  {len(teams)} teams, draft positions captured")
    except Exception as e:
        print(f"  Error: {e}")

with open("draft_data.json", "w") as f:
    json.dump(draft_positions, f, indent=2)
print(f"\nSaved draft_data.json!")
print(json.dumps({str(y): len(t) for y,t in [(int(k),v) for k,v in draft_positions.items()]}, indent=2))

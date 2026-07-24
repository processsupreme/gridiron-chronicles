#!/usr/bin/env python3
"""
GRIDIRON CHRONICLES — Yahoo Fantasy Data Puller v3
"""
import json, sys, time, requests

from yahoo_creds import CLIENT_ID, CLIENT_SECRET  # creds live in gitignored yahoo_creds.py
_ = CLIENT_ID
REDIRECT_URI  = "https://localhost:8080/callback"
from yahoo_creds import AUTH_CODE  # paste each fresh auth code into yahoo_creds.py
BASE          = "https://fantasysports.yahooapis.com/fantasy/v2"

def get_access_token():
    print("\n🔐 Exchanging auth code for access token...")
    resp = requests.post(
        "https://api.login.yahoo.com/oauth2/get_token",
        data={
            "grant_type":    "authorization_code",
            "code":          AUTH_CODE,
            "redirect_uri":  REDIRECT_URI,
            "client_id":     CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        }
    )
    if resp.status_code != 200:
        print(f"❌ Token exchange failed ({resp.status_code}): {resp.text}")
        sys.exit(1)
    print("✅ Access token obtained!\n")
    return resp.json()["access_token"]

def yahoo_get(token, path):
    """GET from Yahoo Fantasy API - path should NOT include ?format=json"""
    sep = "&" if "?" in path else "?"
    url = f"{BASE}/{path}{sep}format=json"
    resp = requests.get(url, headers={"Authorization": f"Bearer {token}"})
    if resp.status_code == 401:
        print("❌ Token expired."); sys.exit(1)
    if not resp.ok:
        print(f"    ⚠️  API error {resp.status_code} for {url}")
        return None
    return resp.json()

def get_user_leagues(token):
    print("📋 Fetching your NFL league history...")
    data = yahoo_get(token, "users;use_login=1/games;game_codes=nfl/leagues")
    leagues = []
    if not data:
        return leagues
    try:
        games = data["fantasy_content"]["users"]["0"]["user"][1]["games"]
        for i in range(games["count"]):
            game = games[str(i)]["game"]
            season = int(game[0]["season"])
            if "leagues" in game[1]:
                league_list = game[1]["leagues"]
                for j in range(league_list["count"]):
                    lg = league_list[str(j)]["league"][0]
                    leagues.append({
                        "season":     season,
                        "league_key": lg["league_key"],
                        "name":       lg["name"],
                        "num_teams":  lg.get("num_teams", 0),
                    })
    except Exception as e:
        print(f"⚠️  Parse error: {e}")
    return leagues

def get_standings(token, league_key):
    data = yahoo_get(token, f"league/{league_key}/standings")
    if not data:
        return []
    try:
        teams = data["fantasy_content"]["league"][1]["standings"][0]["teams"]
        out = []
        for i in range(teams["count"]):
            td = teams[str(i)]["team"]
            ti = td[0]
            ts = td[2]["team_standings"]
            mgrs = []
            for item in ti:
                if isinstance(item, dict) and "managers" in item:
                    for m in item["managers"]:
                        if "manager" in m:
                            mgrs.append(m["manager"].get("nickname", "Unknown"))
            out.append({
                "team_key":       ti[0].get("team_key",""),
                "team_name":      next((x["name"] for x in ti if isinstance(x,dict) and "name" in x), "Unknown"),
                "managers":       mgrs,
                "rank":           int(ts.get("rank", 0)),
                "wins":           int(ts.get("outcome_totals",{}).get("wins", 0)),
                "losses":         int(ts.get("outcome_totals",{}).get("losses", 0)),
                "ties":           int(ts.get("outcome_totals",{}).get("ties", 0)),
                "points_for":     float(ts.get("points_for", 0)),
                "points_against": float(ts.get("points_against", 0)),
            })
        return out
    except Exception as e:
        print(f"    ⚠️  Standings error: {e}")
        return []

def get_week(token, league_key, week):
    data = yahoo_get(token, f"league/{league_key}/scoreboard;week={week}")
    if not data:
        return []
    try:
        matchups_raw = data["fantasy_content"]["league"][1]["scoreboard"]["0"]["matchups"]
        out = []
        for i in range(matchups_raw["count"]):
            m = matchups_raw[str(i)]["matchup"]
            teams = []
            for j in range(2):
                t  = m["0"]["teams"][str(j)]["team"]
                ti = t[0]
                teams.append({
                    "team_key":  ti[0].get("team_key",""),
                    "team_name": next((x["name"] for x in ti if isinstance(x,dict) and "name" in x), "Unknown"),
                    "points":    float(t[1].get("team_points",{}).get("total", 0)),
                })
            if len(teams) == 2:
                out.append({
                    "week":            week,
                    "team1":           teams[0],
                    "team2":           teams[1],
                    "winner_team_key": m.get("winner_team_key",""),
                    "is_playoffs":     m.get("is_playoffs","0") == "1",
                    "is_championship": m.get("is_championship_matchup","0") == "1",
                })
        return out
    except:
        return []

def get_settings(token, league_key):
    data = yahoo_get(token, f"league/{league_key}/settings")
    if not data:
        return {"playoff_start_week": 14, "num_playoff_teams": 4}
    try:
        s = data["fantasy_content"]["league"][1]["settings"][0]
        return {
            "playoff_start_week": int(s.get("playoff_start_week", 14)),
            "num_playoff_teams":  int(s.get("num_playoff_teams", 4)),
        }
    except:
        return {"playoff_start_week": 14, "num_playoff_teams": 4}

def main():
    print("="*60)
    print("  🏈  GRIDIRON CHRONICLES — Yahoo Data Puller v3")
    print("="*60)

    token   = get_access_token()
    leagues = get_user_leagues(token)

    if not leagues:
        print("❌ No leagues found. Make sure Fantasy Sports Read is enabled.")
        sys.exit(1)

    print(f"✅ Found {len(leagues)} league season(s):\n")
    for lg in leagues:
        print(f"   {lg['season']} — {lg['name']}  (key: {lg['league_key']})")

    output = {
        "league_name": leagues[0]["name"],
        "pulled_at":   time.strftime("%Y-%m-%d %H:%M:%S"),
        "seasons":     []
    }

    for lg in sorted(leagues, key=lambda x: x["season"]):
        season, league_key = lg["season"], lg["league_key"]
        print(f"\n📅 Pulling {season} — {lg['name']}...")

        settings  = get_settings(token, league_key)
        print("   → Standings...")
        standings = get_standings(token, league_key)

        print("   → Matchups (weeks 1–17)...")
        all_matchups = []
        for week in range(1, 18):
            all_matchups.extend(get_week(token, league_key, week))
            time.sleep(0.25)

        champion = runner_up = None
        for m in all_matchups:
            if m.get("is_championship"):
                if m["winner_team_key"] == m["team1"]["team_key"]:
                    champion, runner_up = m["team1"], m["team2"]
                else:
                    champion, runner_up = m["team2"], m["team1"]
                break

        all_scores = (
            [(m["team1"]["points"], m["team1"]["team_name"], m["week"]) for m in all_matchups] +
            [(m["team2"]["points"], m["team2"]["team_name"], m["week"]) for m in all_matchups]
        )
        all_scores = [(s,n,w) for s,n,w in all_scores if s > 0]
        high = max(all_scores, key=lambda x: x[0]) if all_scores else (0,"Unknown",0)
        low  = min(all_scores, key=lambda x: x[0]) if all_scores else (0,"Unknown",0)

        output["seasons"].append({
            "season":             season,
            "league_key":         league_key,
            "league_name":        lg["name"],
            "num_teams":          lg["num_teams"],
            "playoff_start_week": settings["playoff_start_week"],
            "champion":           champion,
            "runner_up":          runner_up,
            "standings":          standings,
            "matchups":           all_matchups,
            "season_high_score":  {"points": high[0], "team": high[1], "week": high[2]},
            "season_low_score":   {"points": low[0],  "team": low[1],  "week": low[2]},
        })
        print(f"   ✅ Done — Champion: {champion['team_name'] if champion else 'TBD'}")

    with open("data/league_data.json", "w") as f:
        json.dump(output, f, indent=2)

    total_matchups = sum(len(s["matchups"]) for s in output["seasons"])
    print(f"\n{'='*60}")
    print(f"  ✅ SUCCESS! Saved to data/league_data.json")
    print(f"  📊 {len(output['seasons'])} seasons pulled")
    print(f"  🏈 {total_matchups} total matchups captured")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
GRIDIRON CHRONICLES — Filter to BKGFFL only + fix champion detection
Run this in your gridiron-chronicles folder:
    python3 fix_and_filter.py
"""
import json, requests, sys, time

from yahoo_creds import CLIENT_ID, CLIENT_SECRET  # creds live in gitignored yahoo_creds.py
REDIRECT_URI  = "https://localhost:8080/callback"
BASE          = "https://fantasysports.yahooapis.com/fantasy/v2"

# All BKGFFL league keys identified from your data
BKGFFL_KEYS = {
    "314.l.324082", "331.l.167219", "348.l.69705", "359.l.153728",
    "371.l.27635",  "380.l.240531", "390.l.236819", "399.l.414649",
    "406.l.301211", "414.l.747744", "423.l.186776", "449.l.93173",
    "461.l.99849"
}

def get_access_token(auth_code):
    print("🔐 Getting access token...")
    resp = requests.post(
        "https://api.login.yahoo.com/oauth2/get_token",
        data={"grant_type": "authorization_code", "code": auth_code,
              "redirect_uri": REDIRECT_URI, "client_id": CLIENT_ID, "client_secret": CLIENT_SECRET}
    )
    if resp.status_code != 200:
        print(f"❌ Failed: {resp.text}"); sys.exit(1)
    print("✅ Token obtained!\n")
    return resp.json()["access_token"]

def yget(token, path):
    sep = "&" if "?" in path else "?"
    url = f"{BASE}/{path}{sep}format=json"
    resp = requests.get(url, headers={"Authorization": f"Bearer {token}"})
    if not resp.ok:
        return None
    return resp.json()

def get_standings(token, league_key):
    data = yget(token, f"league/{league_key}/standings")
    if not data: return []
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
        print(f"    ⚠️  Standings error: {e}"); return []

def get_week(token, league_key, week):
    data = yget(token, f"league/{league_key}/scoreboard;week={week}")
    if not data: return []
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
    except: return []

def get_settings(token, league_key):
    data = yget(token, f"league/{league_key}/settings")
    if not data: return {"playoff_start_week": 14, "num_playoff_teams": 4, "end_week": 16}
    try:
        s = data["fantasy_content"]["league"][1]["settings"][0]
        return {
            "playoff_start_week": int(s.get("playoff_start_week", 14)),
            "num_playoff_teams":  int(s.get("num_playoff_teams", 4)),
            "end_week":           int(s.get("end_week", 16)),
        }
    except: return {"playoff_start_week": 14, "num_playoff_teams": 4, "end_week": 16}

def find_champion(standings, all_matchups, league_key):
    """Multiple strategies to find champion"""
    # Strategy 1: championship matchup flag
    for m in all_matchups:
        if m.get("is_championship") and m["winner_team_key"]:
            if m["winner_team_key"] == m["team1"]["team_key"]:
                return m["team1"], m["team2"], m["team1"]["points"], m["team2"]["points"]
            else:
                return m["team2"], m["team1"], m["team2"]["points"], m["team1"]["points"]

    # Strategy 2: rank 1 from standings = champion
    if standings:
        champ_standing = next((s for s in standings if s["rank"] == 1), None)
        runner_standing = next((s for s in standings if s["rank"] == 2), None)
        if champ_standing:
            # Find their last playoff matchup score
            champ_key = champ_standing["team_key"]
            champ = {"team_key": champ_key, "team_name": champ_standing["team_name"], "points": 0}
            runner = {"team_key": runner_standing["team_key"] if runner_standing else "", 
                     "team_name": runner_standing["team_name"] if runner_standing else "Unknown", "points": 0}
            # Find actual championship game scores from last week of playoffs
            playoff_matchups = [m for m in all_matchups if m.get("is_playoffs")]
            if playoff_matchups:
                last_week = max(m["week"] for m in playoff_matchups)
                final_games = [m for m in playoff_matchups if m["week"] == last_week]
                for game in final_games:
                    if game["team1"]["team_key"] == champ_key:
                        champ["points"] = game["team1"]["points"]
                        runner["points"] = game["team2"]["points"]
                        runner["team_key"] = game["team2"]["team_key"]
                        runner["team_name"] = game["team2"]["team_name"]
                        break
                    elif game["team2"]["team_key"] == champ_key:
                        champ["points"] = game["team2"]["points"]
                        runner["points"] = game["team1"]["points"]
                        runner["team_key"] = game["team1"]["team_key"]
                        runner["team_name"] = game["team1"]["team_name"]
                        break
            return champ, runner, champ["points"], runner["points"]

    return None, None, 0, 0

def main():
    print("="*60)
    print("  🏈  BKGFFL Filter + Champion Fix")
    print("="*60)

    # Get fresh auth code
    print("\nPaste your fresh Yahoo auth code (the ?code= part from the URL):")
    auth_code = input("Auth code: ").strip()
    if "code=" in auth_code:
        auth_code = auth_code.split("code=")[1].split("&")[0]

    token = get_access_token(auth_code)

    # Load existing data
    with open("data/league_data.json") as f:
        existing = json.load(f)

    # Filter to BKGFFL only
    bkgffl_seasons = [s for s in existing["seasons"] if s["league_key"] in BKGFFL_KEYS]
    print(f"✅ Filtered to {len(bkgffl_seasons)} BKGFFL seasons\n")

    output = {
        "league_name": "BKGFFL",
        "pulled_at":   existing["pulled_at"],
        "seasons":     []
    }

    for s in sorted(bkgffl_seasons, key=lambda x: x["season"]):
        season, league_key = s["season"], s["league_key"]
        print(f"📅 Processing {season} (key: {league_key})...")

        # Re-pull matchups with fresh token to fix champion detection
        print("   → Re-pulling matchups...")
        settings = get_settings(token, league_key)
        end_week = settings.get("end_week", 17)

        all_matchups = []
        for week in range(1, end_week + 1):
            all_matchups.extend(get_week(token, league_key, week))
            time.sleep(0.2)

        # Re-pull standings
        standings = get_standings(token, league_key)

        champion, runner_up, champ_pts, runner_pts = find_champion(standings, all_matchups, league_key)

        all_scores = (
            [(m["team1"]["points"], m["team1"]["team_name"], m["week"]) for m in all_matchups] +
            [(m["team2"]["points"], m["team2"]["team_name"], m["week"]) for m in all_matchups]
        )
        all_scores = [(sc,n,w) for sc,n,w in all_scores if sc > 0]
        high = max(all_scores, key=lambda x: x[0]) if all_scores else (0,"Unknown",0)
        low  = min(all_scores, key=lambda x: x[0]) if all_scores else (0,"Unknown",0)

        output["seasons"].append({
            "season":             season,
            "league_key":         league_key,
            "league_name":        "BKGFFL",
            "num_teams":          s["num_teams"],
            "playoff_start_week": settings["playoff_start_week"],
            "champion":           champion,
            "runner_up":          runner_up,
            "champ_score":        round(champ_pts, 2),
            "runner_score":       round(runner_pts, 2),
            "standings":          standings,
            "matchups":           all_matchups,
            "season_high_score":  {"points": high[0], "team": high[1], "week": high[2]},
            "season_low_score":   {"points": low[0],  "team": low[1],  "week": low[2]},
        })
        champ_name = champion["team_name"] if champion else "TBD"
        print(f"   ✅ {season} — Champion: {champ_name}")

    with open("data/league_data.json", "w") as f:
        json.dump(output, f, indent=2)

    total_matchups = sum(len(s["matchups"]) for s in output["seasons"])
    print(f"\n{'='*60}")
    print(f"  ✅ Done! data/league_data.json updated")
    print(f"  📊 {len(output['seasons'])} BKGFFL seasons")
    print(f"  🏈 {total_matchups} matchups")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    main()

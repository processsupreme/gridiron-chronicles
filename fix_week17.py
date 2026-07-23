#!/usr/bin/env python3
"""
Fix missing Week 17 championship data for 2021-2025.
Data sourced directly from Yahoo Fantasy playoff brackets.
"""
import json

with open("league_data.json") as f:
    data = json.load(f)

# Helper to find team_key by team_name in a season's standings
def find_key(season, name):
    for t in season["standings"]:
        if t["team_name"] == name:
            return t["team_key"]
    return None

# Week 17 matchups from Yahoo screenshots (championship bracket games only)
# Each entry: (year, week, team1_name, team1_pts, team2_name, team2_pts, is_playoffs, is_championship)
WEEK_17_GAMES = {
    2021: [
        # Final: 98 (155.00) vs Doobie Bros (120.50) → 98 wins
        (17, "98", 155.0, "Doobie Bros", 120.50, True, True),
        # 3rd Place: LVC (110.50) vs Opolos (87.00)
        (17, "LVC", 110.50, "Opolos", 87.00, True, False),
        # 5th Place: Lilst (206.50) vs Johnny Fantasy (93.50)
        (17, "Lilst", 206.50, "Johnny Fantasy", 93.50, True, False),
    ],
    2022: [
        # Final: Team Beef (114.00) vs Johnny Fantasy (105.00) → Team Beef wins
        (17, "Team Beef", 114.0, "Johnny Fantasy", 105.0, True, True),
        # 3rd Place: The Greek (69.50) vs 98 (77.00)
        (17, "The Greek", 69.50, "98", 77.00, True, False),
        # 5th Place: LVC (101.00) vs Joco (99.00)
        (17, "LVC", 101.00, "Joco", 99.00, True, False),
    ],
    2023: [
        # Final: Ohio City Cons (153.00) vs LVC (130.00) → Ohio City Cons wins
        (17, "Ohio City Cons", 153.0, "LVC", 130.0, True, True),
        # 3rd Place: Opolos (120.00) vs Fuz Nuts U (112.50)
        (17, "Opolos", 120.00, "Fuz Nuts U", 112.50, True, False),
        # 5th Place: Lilst (106.00) vs Team Beef (92.00)
        (17, "Lilst", 106.00, "Team Beef", 92.00, True, False),
    ],
    2024: [
        # Final: The Greek (124.50) vs LVC (128.00) → LVC wins
        (17, "The Greek", 124.50, "LVC", 128.0, True, True),
        # 3rd Place: Opolos (117.50) vs Make Joco Great Again (MJGA) (99.50)
        (17, "Opolos", 117.50, "Make Joco Great Again (MJGA)", 99.50, True, False),
        # 5th Place: Lilst (128.00) vs Team Beef (171.50)
        (17, "Lilst", 128.00, "Team Beef", 171.50, True, False),
    ],
    2025: [
        # Final: LVC (121.30) vs Make Joco Great Again (MJGA) (71.36) → LVC wins
        (17, "LVC", 121.30, "Make Joco Great Again (MJGA)", 71.36, True, True),
        # 3rd Place: The Greek (97.98) vs Team Beef (147.92)
        (17, "The Greek", 97.98, "Team Beef", 147.92, True, False),
        # 5th Place: The Edmund Fitzgerald (97.42) vs Ohio City Cons (112.00)
        (17, "The Edmund Fitzgerald", 97.42, "Ohio City Cons", 112.00, True, False),
    ],
}

# Correct champion/runner-up info from Yahoo
CORRECTIONS = {
    2021: {"champion_name": "98",               "runner_up_name": "Doobie Bros",                    "champ_score": 155.0,  "runner_score": 120.50},
    2022: {"champion_name": "Team Beef",         "runner_up_name": "Johnny Fantasy",                 "champ_score": 114.0,  "runner_score": 105.0},
    2023: {"champion_name": "Ohio City Cons",    "runner_up_name": "LVC",                            "champ_score": 153.0,  "runner_score": 130.0},
    2024: {"champion_name": "LVC",               "runner_up_name": "The Greek",                      "champ_score": 128.0,  "runner_score": 124.50},
    2025: {"champion_name": "LVC",               "runner_up_name": "Make Joco Great Again (MJGA)",   "champ_score": 121.30, "runner_score": 71.36},
}

for season in data["seasons"]:
    year = season["season"]
    if year not in WEEK_17_GAMES:
        continue

    print(f"\n=== {year} ===")

    # 1. Remove incorrect is_championship flag from Week 16 semifinal
    for m in season["matchups"]:
        if m.get("is_championship"):
            print(f"  Removing is_championship from Wk{m['week']}: {m['team1']['team_name']} vs {m['team2']['team_name']}")
            m["is_championship"] = False

    # 2. Add Week 17 matchups
    for game in WEEK_17_GAMES[year]:
        week, t1_name, t1_pts, t2_name, t2_pts, is_playoffs, is_champ = game
        t1_key = find_key(season, t1_name)
        t2_key = find_key(season, t2_name)

        if not t1_key:
            print(f"  WARNING: Could not find team_key for '{t1_name}'")
        if not t2_key:
            print(f"  WARNING: Could not find team_key for '{t2_name}'")

        # Determine winner
        winner_key = t1_key if t1_pts > t2_pts else t2_key

        matchup = {
            "week": week,
            "team1": {"team_key": t1_key or "", "team_name": t1_name, "points": t1_pts},
            "team2": {"team_key": t2_key or "", "team_name": t2_name, "points": t2_pts},
            "winner_team_key": winner_key or "",
            "is_playoffs": is_playoffs,
            "is_championship": is_champ,
        }
        season["matchups"].append(matchup)
        label = "CHAMPIONSHIP" if is_champ else "playoff"
        print(f"  Added Wk{week} {label}: {t1_name} ({t1_pts}) vs {t2_name} ({t2_pts})")

    # 3. Fix champion/runner-up at the season level
    corr = CORRECTIONS[year]
    champ_key = find_key(season, corr["champion_name"])
    runner_key = find_key(season, corr["runner_up_name"])

    old_runner = season.get("runner_up", {}).get("team_name", "?")
    old_champ_score = season.get("champ_score", "?")

    season["champion"] = {
        "team_key": champ_key or "",
        "team_name": corr["champion_name"],
        "points": corr["champ_score"],
    }
    season["runner_up"] = {
        "team_key": runner_key or "",
        "team_name": corr["runner_up_name"],
        "points": corr["runner_score"],
    }
    season["champ_score"] = corr["champ_score"]
    season["runner_score"] = corr["runner_score"]

    print(f"  Champion: {corr['champion_name']} ({corr['champ_score']})")
    print(f"  Runner-up: {old_runner} → {corr['runner_up_name']} ({corr['runner_score']})")

with open("league_data.json", "w") as f:
    json.dump(data, f, indent=2)

print("\n✅ Done! Week 17 data added and championship results corrected for 2021-2025.")

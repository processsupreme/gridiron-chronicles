#!/usr/bin/env python3
"""Fix is_championship flags in league_data.json.

For each season, finds the championship matchup (champion vs runner_up in the
final playoff week) and sets is_championship = True.
"""
import json

with open("league_data.json") as f:
    data = json.load(f)

fixed = 0
for season in data["seasons"]:
    year = season["season"]
    champ = season.get("champion")
    runner = season.get("runner_up")
    if not champ or not runner:
        print(f"  {year}: No champion/runner-up data, skipping")
        continue

    champ_key = champ["team_key"]
    runner_key = runner["team_key"]

    # Find playoff matchups and get the final week
    playoff_matchups = [m for m in season["matchups"] if m.get("is_playoffs")]
    if not playoff_matchups:
        print(f"  {year}: No playoff matchups found, skipping")
        continue

    final_week = max(m["week"] for m in playoff_matchups)

    # Find the championship game in the final week
    found = False
    for m in season["matchups"]:
        if not m.get("is_playoffs") or m["week"] != final_week:
            continue
        keys = {m["team1"]["team_key"], m["team2"]["team_key"]}
        if champ_key in keys and runner_key in keys:
            m["is_championship"] = True
            found = True
            t1 = m["team1"]
            t2 = m["team2"]
            print(f"  {year}: Set is_championship=True — {t1['team_name']} ({t1['points']}) vs {t2['team_name']} ({t2['points']}) [Wk {final_week}]")
            fixed += 1
            break

    if not found:
        # Fallback: find any game with the champion in the final week
        for m in season["matchups"]:
            if not m.get("is_playoffs") or m["week"] != final_week:
                continue
            keys = {m["team1"]["team_key"], m["team2"]["team_key"]}
            if champ_key in keys:
                m["is_championship"] = True
                t1 = m["team1"]
                t2 = m["team2"]
                print(f"  {year}: Set is_championship=True (fallback, champ only) — {t1['team_name']} ({t1['points']}) vs {t2['team_name']} ({t2['points']}) [Wk {final_week}]")
                fixed += 1
                break
        else:
            print(f"  {year}: WARNING — Could not find championship matchup!")

with open("league_data.json", "w") as f:
    json.dump(data, f, indent=2)

print(f"\nDone! Fixed {fixed} of {len(data['seasons'])} seasons.")

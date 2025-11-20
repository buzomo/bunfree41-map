import json

# 1. 現在のbooth_new.jsonを読み込む
with open("booth_new.json", "r", encoding="utf-8") as f:
    booth_data = json.load(f)

# 2. サークル名でグループ化（共通情報をまとめる）
circle_data = {}
for booth_id, info in booth_data.items():
    circle_name = info["name"]
    if circle_name not in circle_data:
        circle_data[circle_name] = {
            "groupId": info["groupId"],
            "url": info["url"],
            "genre": info["genre"],
            "booths": [],
        }
    circle_data[circle_name]["booths"].append(booth_id)

# 3. 新しいフォーマットで保存
with open("booths_by_circle_optimized.json", "w", encoding="utf-8") as f:
    json.dump(circle_data, f, ensure_ascii=False, indent=4)

print("最適化されたbooths_by_circle_optimized.jsonを生成しました。")

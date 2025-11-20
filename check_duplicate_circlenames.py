# import json
# from collections import defaultdict

# # 1. booth.jsonを読み込む
# with open("booth.json", "r", encoding="utf-8") as f:
#     booth_data = json.load(f)

# # 2. サークル名の出現回数をカウント
# circle_counts = defaultdict(int)
# for booth_id, info in booth_data.items():
#     circle_name = info["name"]
#     circle_counts[circle_name] += 1

# # 3. 結果を表示
# duplicate_circles = {name: count for name, count in circle_counts.items() if count > 1}

# if duplicate_circles:
#     print("同名のサークルが見つかりました:")
#     for name, count in duplicate_circles.items():
#         print(f"- {name}: {count} ブース")
# else:
#     print("同名のサークルは見つかりませんでした。groupIdは不要です。")
# import json

# # 1. booths_by_circle_optimized.jsonを読み込む
# with open("booths_by_circle_optimized.json", "r", encoding="utf-8") as f:
#     optimized_data = json.load(f)

# # 2. キー（サークル名）の重複を確認
# keys = optimized_data.keys()
# if len(keys) == len(set(keys)):
#     print("キー（サークル名）の重複はありません。")
# else:
#     print("キー（サークル名）に重複があります。")


# import json

# # 1. booths_by_circle_optimized.jsonを読み込む
# with open('booths_by_circle_optimized.json', 'r', encoding='utf-8') as f:
#     optimized_data = json.load(f)

# # 2. groupIdフィールドを削除
# for circle_name in optimized_data:
#     if 'groupId' in optimized_data[circle_name]:
#         del optimized_data[circle_name]['groupId']

# # 3. 更新したデータを保存
# with open('booths_by_circle_no_groupid.json', 'w', encoding='utf-8') as f:
#     json.dump(optimized_data, f, ensure_ascii=False, indent=4)

# print("groupIdを削除したbooths_by_circle_no_groupid.jsonを生成しました。")


import json

# 1. booths_by_circle.jsonを読み込む
with open("booths_by_circle.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# 2. 2ブース以上を占めているサークルを抽出
for circle_name, info in data.items():
    booth_count = len(info["booths"])
    if booth_count >= 2:
        print(f"{circle_name}: {booth_count} ブース")

import json
from collections import defaultdict

# 1. booths_by_circle.jsonを読み込む
with open('booths_by_circle.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 2. ブース数ごとのサークル数をカウント
booth_counts = defaultdict(int)
for circle_name, info in data.items():
    booth_count = len(info['booths'])
    if booth_count >= 2:
        booth_counts[booth_count] += 1

# 3. 結果を表示
for booth_count, circle_count in sorted(booth_counts.items()):
    print(f"{booth_count}ブース: {circle_count}サークル")

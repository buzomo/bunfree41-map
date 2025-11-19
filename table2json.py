from bs4 import BeautifulSoup
import json

# table.html を読み込む
with open("table3-4.html", "r", encoding="utf-8") as f:
    html_content = f.read()

soup = BeautifulSoup(html_content, "html.parser")
booth_info = {}

# 各行を処理
for row in soup.select("tr"):
    cols = row.find_all("td")
    if len(cols) >= 4:
        # ブースIDの抽出
        location = cols[1].get_text(strip=True)
        if "ホール" not in location:
            continue  # ホール情報がない場合はスキップ

        booth_part = location.split("ホール")[1].strip()

        # 「〜」を含む場合（例: A-01〜02）
        if "〜" in booth_part:
            parts = booth_part.split("〜")
            if len(parts) != 2:
                continue  # フォーマットが異なる場合はスキップ

            # プレフィックス（例: A-）と番号部分を分離
            prefix_part = parts[0].split("-")
            if len(prefix_part) != 2:
                continue  # フォーマットが異なる場合はスキップ

            prefix = prefix_part[0]  # 例: A
            try:
                start_num = int(prefix_part[1])
                end_num = int(parts[1].split("-")[0])  # 例: 02
            except (ValueError, IndexError):
                continue  # 数値変換に失敗した場合はスキップ

            # ブースIDを生成（例: A01, A02）
            booth_ids = [f"{prefix}{i:02d}" for i in range(start_num, end_num + 1)]

        # 「〜」を含まない場合（例: A-01）
        else:
            # プレフィックス（例: A-）と番号部分を分離
            prefix_part = booth_part.split("-")
            if len(prefix_part) != 2:
                continue  # フォーマットが異なる場合はスキップ

            prefix = prefix_part[0]  # 例: A
            try:
                num = int(prefix_part[1])
                booth_ids = [f"{prefix}{num:02d}"]
            except ValueError:
                continue  # 数値変換に失敗した場合はスキップ

        # ジャンルの抽出
        genre = [
            g.strip() for g in cols[2].get_text(strip=True).split("|") if g.strip()
        ]

        # 名称とURLの抽出
        name = cols[3].get_text(strip=True)
        url = cols[3].find("a")["href"] if cols[3].find("a") else ""

        # 各ブースIDに情報を割り当て
        for booth_id in booth_ids:
            booth_info[booth_id] = {
                "name": name,
                "url": f"https://literature-fleamarket.com{url}",
                "genre": genre,
            }

# キーをソート（アルファベット順、ひらがな順）
sorted_booth_info = {
    k: booth_info[k] for k in sorted(booth_info, key=lambda x: (not x[0].isalpha(), x))
}

# JSONファイルに出力
with open("booth_info.json", "w", encoding="utf-8") as f:
    json.dump(sorted_booth_info, f, ensure_ascii=False, indent=2)

print("JSONファイルを出力しました: booth_info.json")

from bs4 import BeautifulSoup
import json
from datetime import datetime


def extract_booth_info_from_html(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        html_content = f.read()

    soup = BeautifulSoup(html_content, "html.parser")
    booth_info = {}

    for row in soup.select("tr"):
        cols = row.find_all("td")
        if len(cols) >= 4:
            location = cols[1].get_text(strip=True)
            if "ホール" not in location:
                continue

            booth_part = location.split("ホール")[1].strip()

            if "〜" in booth_part:
                parts = booth_part.split("〜")
                if len(parts) != 2:
                    continue

                prefix_part = parts[0].split("-")
                if len(prefix_part) != 2:
                    continue

                prefix = prefix_part[0]
                try:
                    start_num = int(prefix_part[1])
                    end_num = int(parts[1].split("-")[0])
                except (ValueError, IndexError):
                    continue

                booth_ids = [f"{prefix}{i:02d}" for i in range(start_num, end_num + 1)]
            else:
                prefix_part = booth_part.split("-")
                if len(prefix_part) != 2:
                    continue

                prefix = prefix_part[0]
                try:
                    num = int(prefix_part[1])
                    booth_ids = [f"{prefix}{num:02d}"]
                except ValueError:
                    continue

            genre = [
                g.strip() for g in cols[2].get_text(strip=True).split("|") if g.strip()
            ]
            name = cols[3].get_text(strip=True)
            url_suffix = cols[3].find("a")["href"] if cols[3].find("a") else ""

            for booth_id in booth_ids:
                booth_info[booth_id] = {
                    "name": name,
                    "url": f"https://c.bunfree.net{url_suffix}",
                    "genre": genre,
                }

    return booth_info


def main():
    file_path = "tokyo41_booth_tables.html"
    booth_info_all = extract_booth_info_from_html(file_path)

    booths_by_circle = {}
    for booth_id, info in booth_info_all.items():
        name = info["name"]
        if name not in booths_by_circle:
            booths_by_circle[name] = {
                "url": info["url"],
                "genre": info["genre"],
                "booths": [],
            }
        booths_by_circle[name]["booths"].append(booth_id)

    # 現在の日時とブース数を取得
    now = datetime.now().strftime("%Y-%m-%d %H-%M")
    booth_count = len(booth_info_all)

    # JSONファイルに出力
    with open("booths_by_circle.json", "w", encoding="utf-8") as f:
        f.write(f"// {now}取得、ブース数: {booth_count}\n")
        json.dump(booths_by_circle, f, ensure_ascii=False, indent=2)

    print(f"booths_by_circle.json を出力しました。ブース数: {booth_count}")


main()

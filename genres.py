from bs4 import BeautifulSoup

# table.html を読み込む
with open("table3-4.html", "r", encoding="utf-8") as f:
    html_content = f.read()

soup = BeautifulSoup(html_content, "html.parser")

# 大分類と小分類の辞書を作成
genre_dict = {}

# 各行を処理
for row in soup.select("tr"):
    cols = row.find_all("td")
    if len(cols) >= 4:
        # ジャンルの抽出
        genre_text = cols[2].get_text(strip=True)
        if not genre_text:
            continue  # ジャンルが空の場合はスキップ

        # ジャンルをパイプ（|）で分割
        genres = [g.strip() for g in genre_text.split("|") if g.strip()]

        if genres:
            # 1つ目を大分類として追加
            main_genre = genres[0]

            # 大分類が辞書にない場合は初期化
            if main_genre not in genre_dict:
                genre_dict[main_genre] = set()

            # 2つ目以降を小分類として追加
            if len(genres) > 1:
                for sub_genre in genres[1:]:
                    genre_dict[main_genre].add(sub_genre)

# 大分類ごとに見出しを切って小分類を出力
for main_genre in sorted(genre_dict.keys()):
    print(f"=== {main_genre} ===")
    for sub_genre in sorted(genre_dict[main_genre]):
        print(f"- {sub_genre}")
    print()  # 改行

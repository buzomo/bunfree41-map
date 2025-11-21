window.onload = async function () {
    // 1. PWAのインストールプロンプトを無効化
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        return false;
    });

    // 2. boothsByCircleを先に読み込む
    await loadBoothInfo();

    // 3. ハッシュデータを処理
    const hash = window.location.hash;
    console.log('ハッシュデータ:', hash);

    let boothState = {};
    if (hash.startsWith('#mydata=')) {
        console.log('mydataモードで復元を試みます');
        const compressedData = hash.substring(8);
        console.log('圧縮データ:', compressedData);
        try {
            const decompressedData = LZString.decompressFromBase64(compressedData);
            console.log('解凍データ:', decompressedData);
            if (decompressedData) {
                boothState = JSON.parse(decompressedData);
                localStorage.setItem('boothState', decompressedData);
                console.log('ハッシュデータをlocalStorageに保存しました');
            }
        } catch (e) {
            console.error('データの復元に失敗しました:', e);
        }
    } else if (hash.startsWith('#showdata=')) {
        console.log('showdataモードで復元を試みます');
        isReadOnly = true;
        showReadOnlyNotice();
        if (confirm('このURLには共有データが含まれています。復元しますか？')) {
            const compressedData = hash.substring(10);
            console.log('圧縮データ:', compressedData);
            try {
                const decompressedData = LZString.decompressFromBase64(compressedData);
                console.log('解凍データ:', decompressedData);
                if (decompressedData) {
                    boothState = JSON.parse(decompressedData);
                    console.log('ハッシュデータを一時的に保存しました');
                }
            } catch (e) {
                console.error('データの復元に失敗しました:', e);
            }
        }
    } else {
        // ハッシュがない場合はlocalStorageから読み込む
        const savedState = localStorage.getItem('boothState');
        if (savedState) {
            boothState = JSON.parse(savedState);
        }
    }

    // 4. 地図の初期化
    const islandsContainer1F = document.getElementById('islands-container-1F');
    const islandsContainer4F = document.getElementById('islands-container-4F');
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W'];
    letters.forEach(letter => {
        const islandRow = document.createElement('div');
        islandRow.className = 'island-row';
        const { left: leftIsland, right: rightIsland } = createIslandContainer(letter);
        islandRow.appendChild(leftIsland);
        if (rightIsland) {
            islandRow.appendChild(rightIsland);
        }
        if (['U', 'V', 'W'].includes(letter)) {
            const readingArea = document.createElement('div');
            readingArea.className = 'reading-area';
            if (letter === 'V') {
                readingArea.textContent = '試し読みコーナー';
            }
            islandRow.appendChild(readingArea);
        }
        islandsContainer1F.appendChild(islandRow);
    });
    islandsContainer1F.appendChild(createXRow());

    const hiraganaLetters = ['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ', 'さ', 'し', 'す', 'せ', 'そ', 'た', 'ち', 'つ', 'て', 'と', 'な', 'に', 'ぬ', 'ね'];
    letters.forEach((letter, index) => {
        if (index < hiraganaLetters.length) {
            const hiraganaLetter = hiraganaLetters[index];
            const islandRow = document.createElement('div');
            islandRow.className = 'island-row';
            const { left: leftIsland, right: rightIsland } = createIslandContainer(hiraganaLetter, true);
            leftIsland.querySelectorAll('.booth').forEach(booth => {
                const id = booth.dataset.id;
                if (id) {
                    booth.dataset.id = id.replace(letter, hiraganaLetter);
                }
            });
            if (rightIsland && !['な', 'に', 'ぬ'].includes(hiraganaLetter)) {
                rightIsland.querySelectorAll('.booth').forEach(booth => {
                    const id = booth.dataset.id;
                    if (id) {
                        booth.dataset.id = id.replace(letter, hiraganaLetter);
                    }
                });
                islandRow.appendChild(rightIsland);
            }
            islandRow.appendChild(leftIsland);
            if (rightIsland && !['な', 'に', 'ぬ'].includes(hiraganaLetter)) {
                islandRow.appendChild(rightIsland);
            }
            if (['U', 'V', 'W'].includes(letter)) {
                const readingArea = document.createElement('div');
                readingArea.className = 'reading-area';
                if (letter === 'V') {
                    readingArea.textContent = '試し読みコーナー';
                }
                islandRow.appendChild(readingArea);
            }
            islandsContainer4F.appendChild(islandRow);
            if (hiraganaLetter === 'ぬ') {
                islandsContainer4F.appendChild(createNERow());
            }
        }
    });
    // 5. ブースの状態を反映
    Object.entries(boothState).forEach(([id, status]) => {
        updateBoothVisually(id, status);
    });

    // 6. その他の初期化処理
    // ブースのイベントリスナーを設定
    document.querySelectorAll('.booth').forEach(booth => {
        const id = booth.dataset.id;
        if (boothInfo[id]) {
            booth.dataset.mainGenre = boothInfo[id].genre[0] || "その他";
            booth.dataset.subGenre = boothInfo[id].genre.slice(1).join(',') || "その他";
            booth.dataset.genre = boothInfo[id].genre.join(',');
            booth.dataset.name = boothInfo[id].name;
        }
        booth.dataset.status = boothState[id] || '0';
        booth.addEventListener('mouseover', () => booth.textContent = id);
        booth.addEventListener('mouseout', () => {
            if (booth.dataset.status != 1 && booth.dataset.status != 2) {
                booth.textContent = id.replace(/[A-Za-zあ-ん]/, '');
            }
        });
    });
    document.querySelectorAll('.left-wall .booth').forEach(booth => {
        const id = booth.dataset.id;
        booth.addEventListener('mouseover', () => booth.textContent = id);
        booth.addEventListener('mouseout', () => booth.textContent = id.replace(/[A-Za-zあ-ん]/, ''));
    });

    // 6. ハッシュデータがあれば、ブースの状態を反映
    Object.entries(boothState).forEach(([id, status]) => {
        updateBoothVisually(id, status);
    });

    // 7. ステータス部分のクリックイベントを追加
    document.querySelectorAll('.tab-stats').forEach(stats => {
        stats.addEventListener('click', function (e) {
            e.stopPropagation();
            const floor = this.closest('.tab').dataset.floor;
            showWishlist(floor);
        });
    });

    // 8. タブのクリックイベント
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function () {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const floor = this.dataset.floor;
            document.querySelectorAll('#map-container-1F, #map-container-4F').forEach(container => {
                container.classList.remove('active');
            });
            document.getElementById(`map-container-${floor}`).classList.add('active');
            localStorage.setItem('activeTab', floor);
            document.getElementById('wishlist-container').style.display = 'none';
        });
    });

    // 9. タブの初期状態を設定
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.floor === activeTab) {
            tab.classList.add('active');
        }
    });
    document.querySelectorAll('#map-container-1F, #map-container-4F').forEach(container => {
        container.classList.remove('active');
        if (container.id === `map-container-${activeTab}`) {
            container.classList.add('active');
        }
    });

    // 10. モーダルのクリックイベント
    document.getElementById('booth-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('booth-modal')) {
            const boothId = document.getElementById('booth-modal-id').textContent.split(',')[0];
            const memo = document.getElementById('booth-modal-memo').value;
            const amount = document.getElementById('booth-modal-amount').value;
            saveBoothMemoAndAmount(boothId, memo, amount);
            document.getElementById('booth-modal').style.display = 'none';
            document.querySelectorAll('.booth.highlight').forEach(el => {
                el.classList.remove('highlight');
            });
        }
    });

    // 11. スクロールコンテナの初期化
    document.querySelectorAll('.scroll-container').forEach(container => {
        container.style.transform = 'scale(0.7)';
        container.style.left = '0';
        container.style.top = '0';
    });

    // 12. タイマーの開始
    startTimer();

    // 13. 集計エリアの更新
    updateStats();

    // 14. ジャンル色分けのトグル
    document.getElementById('toggle-genre-colors').addEventListener('click', toggleGenreColors);
    if (!isGenreColorEnabled) {
        resetBoothStyles();
    }

    // 15. タッチ/ズーム/パン操作の初期化
    initTouchZoomPan();

    // 16. 読み取り専用モードの無効化
    document.querySelectorAll('.booth').forEach(booth => {
        booth.addEventListener('click', function (e) {
            if (window.isReadOnly) {
                e.stopPropagation();
                alert('読み取り専用モードです。自分のデータを見るには「自分のデータを見る」をクリックしてください。');
                return;
            }
        });
    });

    // 17. 合計金額の表示
    document.getElementById('total-amount').textContent = calculateTotalAmount();

    // 18. ダウンロードボタンのイベント
    document.getElementById('download-memos').addEventListener('click', downloadMemos);

    // 19. Service Workerの登録（最後に実行）
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('ServiceWorker登録成功:', registration.scope);
                registration.update();
            })
            .catch((error) => {
                console.log('ServiceWorker登録失敗:', error);
            });
    }
};

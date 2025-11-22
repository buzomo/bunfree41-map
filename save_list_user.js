// ==UserScript==
// @name         Tokyo41 Booth Table Saver
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Save combined booth tables as HTML
// @author       You
// @match        https://c.bunfree.net/c/tokyo41/all/booth
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 保存ボタンを追加
    function addSaveButton() {
        const saveButton = document.createElement('button');
        saveButton.textContent = 'テーブルを保存';
        saveButton.style.position = 'fixed';
        saveButton.style.bottom = '20px';
        saveButton.style.right = '20px';
        saveButton.style.zIndex = '9999';
        saveButton.style.padding = '10px';
        saveButton.style.backgroundColor = '#4CAF50';
        saveButton.style.color = 'white';
        saveButton.style.border = 'none';
        saveButton.style.borderRadius = '5px';
        saveButton.style.cursor = 'pointer';

        saveButton.addEventListener('click', saveTablesAsHTML);
        document.body.appendChild(saveButton);
    }

    // テーブルを連結してHTMLとして保存
    function saveTablesAsHTML() {
        const tables = document.querySelectorAll('table.table');
        if (tables.length < 2) {
            alert('テーブルが2つ見つかりませんでした。');
            return;
        }

        // 連結用の新しいテーブルを作成
        const combinedTable = document.createElement('table');
        combinedTable.className = 'table';

        // ヘッダーをコピー
        const thead = tables[0].querySelector('thead').cloneNode(true);
        combinedTable.appendChild(thead);

        // ボディを連結
        const tbody = document.createElement('tbody');
        tables.forEach(table => {
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(row => {
                tbody.appendChild(row.cloneNode(true));
            });
        });
        combinedTable.appendChild(tbody);

        // HTMLとして保存
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Tokyo41 Booth Tables</title>
            </head>
            <body>
                ${combinedTable.outerHTML}
            </body>
            </html>
        `;

        // Blob を作成してダウンロード
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tokyo41_booth_tables.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ページ読み込み完了後にボタンを追加
    window.addEventListener('load', addSaveButton);
})();

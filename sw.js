// sw.js
const CACHE_NAME = 'bft41-map-v6'; // バージョンを更新
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/booth.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/icon-32x32.png',
  '/icon-16x16.png',
  'https://cdn.jsdelivr.net/npm/lz-string@1.5.0/libs/lz-string.min.js',
  'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js'
];

// オフライン時のキャッシュからの読み込みを有効化
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュにヒットしたら返す
        if (response) {
          return response;
        }
        // ネットワークから取得
        return fetch(event.request).then((networkResponse) => {
          // ネットワークから取得できたらキャッシュに保存
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          return networkResponse;
        }).catch(() => {
          // オフライン時はキャッシュからフォールバック
          return caches.match('/index.html');
        });
      })
  );
});
// オフライン時のフォールバックページ
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/index.html');
        })
    );
  }
});


// 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

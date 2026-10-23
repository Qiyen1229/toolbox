/**
 * Qiyen Toolbox — Service Worker
 * 支援離線執行、極速快取靜態資源與 PWA 獨立運行
 */

const CACHE_NAME = 'qiyen-toolbox-v2';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/css/global.css',
  '/css/components.css',
  '/css/tool-layout.css',
  '/js/theme.js',
  '/js/storage.js',
  '/js/utils.js',
  '/js/tools-registry.js',
  '/js/app.js',
  '/assets/favicon.svg',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/apple-touch-icon.png'
];

// 安裝 Service Worker 並預先快取核心資源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache non-critical warning:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 啟動階段：立即生效並清除所有過期的舊版本快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting legacy cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 攔截網路請求：採用 Network-First 策略，保證獲取最新代碼，離線時自動回退快取
self.addEventListener('fetch', (event) => {
  // 只處理 GET 請求
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 忽略外站非靜態 API 請求
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // 網路不可用時，嘗試從快取讀取
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // 離線且無快取時回傳 index.html（若是頁面導航）
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

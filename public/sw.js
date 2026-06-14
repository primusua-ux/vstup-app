const CACHE_NAME = 'vstup-app-cache-v1';
const OFFLINE_URL = '/index.html';

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/icon-192.png',
        '/icon-512.png'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Обробляємо лише GET запити
  if (e.request.method !== 'GET') return;
  
  const url = new URL(e.request.url);
  
  // Ігноруємо запити до локального проксі API Google Sheets
  if (url.pathname.startsWith('/api-sheets')) {
    return;
  }
  
  // Для зовнішніх ресурсів (наприклад, запити до Google Sheets чи Google Fonts)
  if (url.origin !== self.location.origin) {
    // Не кешуємо самі Google Sheets CSV, оскільки вони мають бути завжди актуальними
    if (url.href.includes('docs.google.com/spreadsheets')) {
      return;
    }
    // Інші зовнішні ресурси (наприклад, фото з unsplash чи google drive) вантажимо стандартно
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Стратегія Stale-While-Revalidate: повертаємо кеш, але оновлюємо його у фоні
        fetch(e.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(e.request, networkResponse);
              });
            }
          })
          .catch(() => {/* ігноруємо помилки мережі при офлайні */});
          
        return cachedResponse;
      }

      // Якщо немає в кеші — робимо звичайний запит в мережу
      return fetch(e.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Якщо мережа недоступна та запит є навігаційним (перехід на сторінку)
          if (e.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
        });
    })
  );
});

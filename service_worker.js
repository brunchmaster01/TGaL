const CACHE_NAME = 'hello-TGaL-v1';
const FILES_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './app.js',
    './sounds/happy_home.mp3'
];

// 서비스 워커 설치 및 캐싱
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('파일을 캐시에 저장함!');
                return cache.addAll(FILES_TO_CACHE);
            })
            .catch(error => console.error('캐시 저장 실패:', error))
    );
});

// 활성화 이벤트 - 오래된 캐시 삭제
self.addEventListener('activate', event => {
  event.waitUntil(
      caches.keys().then(cacheNames => {
          return Promise.all(
              cacheNames.map(cacheName => caches.delete(cacheName))
          );
      })
  );
  self.clients.claim();
});


// 네트워크 요청 처리 - 캐시 우선, 없으면 네트워크 요청
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // 캐시된 응답 반환
                }
                return fetch(event.request) // 네트워크 요청 수행
                    .then(networkResponse => {
                        return networkResponse;
                    })
                    .catch(error => {
                        console.error('Fetch failed:', error);
                        return new Response('네트워크 오류', { status: 408, statusText: 'Request Timeout' });
                    });
            })
    );
});

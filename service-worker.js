const CACHE_NAME = "natura-link-cache-v3";

const STATIC_ASSETS = [
    "/NaturaLink/index.html",
    "/NaturaLink/offline.html",
    "/NaturaLink/js/script.js",
    "/NaturaLink/js/chat.js",
    "/NaturaLink/js/pwa.js",
    "/NaturaLink/js/setting.js",
    "/NaturaLink/manifest.json",
    "/NaturaLink/service-worker.js",
    "/NaturaLink/css/base.css",
    "/NaturaLink/css/layout.css",
    "/NaturaLink/css/components.css",
    "/NaturaLink/css/chat.css",
    "/NaturaLink/favicons/favicon-16x16.png",
    "/NaturaLink/favicons/favicon-32x32.png",
    "/NaturaLink/favicons/favicon.ico",
    "/NaturaLink/assets/icon/android-chrome-192x192.png",
    "/NaturaLink/assets/icon/android-chrome-512x512.png",
    "/NaturaLink/css/setting.css"
];

// 🔥 서비스 워커 설치 및 캐시 저장
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("📦 정적 파일 캐싱 중...");
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// 🚀 서비스 워커 활성화 & 오래된 캐시 삭제
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log("🔄 오래된 캐시 삭제: ", cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 🌐 네트워크 요청 가로채기
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => caches.match("/NaturaLink/offline.html"));
        })
    );
});

// 📢 서비스 워커 업데이트 적용 메시지 처리
self.addEventListener("message", (event) => {
    if (event.data.action === "skipWaiting") {
        self.skipWaiting();
    }
});

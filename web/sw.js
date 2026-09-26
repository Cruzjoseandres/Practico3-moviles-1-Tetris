const CACHE_NAME = 'tetrisjacp-v7';
const ASSETS_TO_CACHE = [
    './',
    './manifest.json',
    './css/style.css',
    './js/app.js',
    './js/audio/SoundEffects.js',
    './js/models/Square.js',
    './js/models/Pieza.js',
    './js/models/Piezas.js',
    './js/models/FabricarPiezas.js',
    './js/models/TableroJuego.js',
    './js/storage/PuntajeStorage.js',
    './js/ui/Controller.js',
    './js/ui/Renderer.js',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-1024.png',
    'https://cdn.tailwindcss.com'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.all(
                ASSETS_TO_CACHE.map((url) => {
                    return cache.add(url).catch((err) => {
                        console.warn(`[SW] No se pudo cachear ${url}:`, err);
                    });
                })
            );
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    if (!event.request.url.startsWith('http')) return;

    const url = new URL(event.request.url);

    // Si la solicitud es para /index.html, resolver con la raíz '/' para evitar el 307 de Cloudflare
    if (url.pathname.endsWith('/index.html')) {
        event.respondWith(
            caches.match('./').then((cached) => {
                if (cached) return cached;
                return fetch('./').then((networkRes) => {
                    if (networkRes && networkRes.status === 200) {
                        const clone = networkRes.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put('./', clone));
                    }
                    return networkRes;
                });
            }).catch(() => {
                return caches.match('./') || new Response('Offline', { status: 503 });
            })
        );
        return;
    }

    // Estrategia Network-First con fallback a Cache y actualización silenciosa
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const clone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return networkResponse;
            })
            .catch(() => {
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) return cachedResponse;
                    if (event.request.mode === 'navigate') {
                        return caches.match('./');
                    }
                    return new Response('Offline', { status: 503, statusText: 'Offline' });
                });
            })
    );
});

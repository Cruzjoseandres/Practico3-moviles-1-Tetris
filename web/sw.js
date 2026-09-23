const CACHE_NAME = 'tetrisjacp-v2';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
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
    './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.all(
                ASSETS_TO_CACHE.map((url) => {
                    return cache.add(url).catch((err) => {
                        console.warn(`No se pudo cachear ${url} durante la instalación:`, err);
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

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Actualizar en segundo plano si hay red disponible
                fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const clone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    }
                }).catch(() => {});
                return cachedResponse;
            }

            return fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const clone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return networkResponse;
            }).catch(() => {
                // Fallback seguro contra ERR_FAILED si falla la red en navegación
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html') || caches.match('./');
                }
                return new Response('Sin conexión', { status: 503, statusText: 'Offline' });
            });
        })
    );
});

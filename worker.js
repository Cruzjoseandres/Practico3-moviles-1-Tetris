export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // Si la URL solicita /index.html, servir la raíz (/) directamente con 200 OK sin redirección 307
        if (url.pathname === '/index.html') {
            const rootUrl = new URL('/', request.url);
            rootUrl.search = url.search;
            return env.ASSETS.fetch(new Request(rootUrl.toString(), request));
        }

        return env.ASSETS.fetch(request);
    }
};

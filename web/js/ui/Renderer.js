/**
 * Renderizador de Canvas para el tablero principal y la siguiente pieza
 * Replica y mejora el dibujado de TableroTetris.kt y SiguientePiezaView.kt
 */
export class Renderer {
    constructor(canvasTablero, canvasSiguiente, canvasSiguienteDesk = null) {
        this.canvasTablero = canvasTablero;
        this.ctxTablero = canvasTablero.getContext('2d');

        this.canvasSiguiente = canvasSiguiente;
        this.ctxSiguiente = canvasSiguiente ? canvasSiguiente.getContext('2d') : null;

        this.canvasSiguienteDesk = canvasSiguienteDesk;
        this.ctxSiguienteDesk = canvasSiguienteDesk ? canvasSiguienteDesk.getContext('2d') : null;

        this.anchoTablero = 10;
        this.altoTablero = 20;

        this.ajustarResolucion();
        window.addEventListener('resize', () => this.ajustarResolucion());
    }

    ajustarResolucion() {
        const dpr = window.devicePixelRatio || 1;

        // Canvas tablero principal
        if (this.canvasTablero) {
            const rect = this.canvasTablero.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                this.canvasTablero.width = rect.width * dpr;
                this.canvasTablero.height = rect.height * dpr;
                this.ctxTablero.setTransform(1, 0, 0, 1, 0, 0);
                this.ctxTablero.scale(dpr, dpr);
                this.anchoPx = rect.width;
                this.altoPx = rect.height;
            }
        }

        // Canvas siguiente móvil
        if (this.canvasSiguiente) {
            const rectSig = this.canvasSiguiente.getBoundingClientRect();
            if (rectSig.width > 0 && rectSig.height > 0) {
                this.canvasSiguiente.width = rectSig.width * dpr;
                this.canvasSiguiente.height = rectSig.height * dpr;
                this.ctxSiguiente.setTransform(1, 0, 0, 1, 0, 0);
                this.ctxSiguiente.scale(dpr, dpr);
                this.anchoSigPx = rectSig.width;
                this.altoSigPx = rectSig.height;
            }
        }

        // Canvas siguiente desktop
        if (this.canvasSiguienteDesk) {
            const rectDesk = this.canvasSiguienteDesk.getBoundingClientRect();
            if (rectDesk.width > 0 && rectDesk.height > 0) {
                this.canvasSiguienteDesk.width = rectDesk.width * dpr;
                this.canvasSiguienteDesk.height = rectDesk.height * dpr;
                this.ctxSiguienteDesk.setTransform(1, 0, 0, 1, 0, 0);
                this.ctxSiguienteDesk.scale(dpr, dpr);
                this.anchoSigDeskPx = rectDesk.width;
                this.altoSigDeskPx = rectDesk.height;
            }
        }
    }

    renderizar(tableroJuego) {
        if (!this.anchoPx || !this.altoPx) {
            this.ajustarResolucion();
        }

        this.dibujarTableroPrincipal(tableroJuego);

        const sigPieza = tableroJuego.obtenerSiguientePieza();
        if (this.ctxSiguiente && this.canvasSiguiente) {
            this._dibujarPiezaEnCanvas(this.ctxSiguiente, this.canvasSiguiente, this.anchoSigPx, this.altoSigPx, sigPieza);
        }
        if (this.ctxSiguienteDesk && this.canvasSiguienteDesk) {
            this._dibujarPiezaEnCanvas(this.ctxSiguienteDesk, this.canvasSiguienteDesk, this.anchoSigDeskPx, this.altoSigDeskPx, sigPieza);
        }
    }

    dibujarTableroPrincipal(tableroJuego) {
        const ctx = this.ctxTablero;
        const w = this.anchoPx || this.canvasTablero.clientWidth;
        const h = this.altoPx || this.canvasTablero.clientHeight;

        ctx.clearRect(0, 0, w, h);

        const escalaX = w / this.anchoTablero;
        const escalaY = h / this.altoTablero;
        const cellSize = Math.min(escalaX, escalaY);

        const offsetX = (w - (this.anchoTablero * cellSize)) / 2;
        const offsetY = (h - (this.altoTablero * cellSize)) / 2;

        ctx.save();
        ctx.translate(offsetX, offsetY);

        // 1. Dibujar fondo de cuadrícula
        ctx.fillStyle = '#0f111a';
        ctx.fillRect(0, 0, this.anchoTablero * cellSize, this.altoTablero * cellSize);

        // Cuadrícula sutil
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= this.anchoTablero; x++) {
            ctx.beginPath();
            ctx.moveTo(x * cellSize, 0);
            ctx.lineTo(x * cellSize, this.altoTablero * cellSize);
            ctx.stroke();
        }
        for (let y = 0; y <= this.altoTablero; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * cellSize);
            ctx.lineTo(this.anchoTablero * cellSize, y * cellSize);
            ctx.stroke();
        }

        // 2. Dibujar bloques fijados en el tablero
        const matriz = tableroJuego.obtenerTablero();
        for (let y = 0; y < this.altoTablero; y++) {
            for (let x = 0; x < this.anchoTablero; x++) {
                const celda = matriz[y][x];
                if (celda) {
                    this.dibujarBloque(ctx, x * cellSize, y * cellSize, cellSize, celda.color);
                }
            }
        }

        // 3. Dibujar sombra / pieza fantasma (obtenerSombraPieza)
        const sombra = tableroJuego.obtenerSombraPieza();
        if (sombra) {
            for (const cuadrado of sombra) {
                this.dibujarBloqueFantasma(
                    ctx,
                    cuadrado.x * cellSize,
                    cuadrado.y * cellSize,
                    cellSize,
                    cuadrado.color
                );
            }
        }

        // 4. Dibujar pieza activa
        const piezaActiva = tableroJuego.obtenerPiezaActual();
        if (piezaActiva) {
            for (const cuadrado of piezaActiva.obtenerCuadrados()) {
                this.dibujarBloque(
                    ctx,
                    cuadrado.x * cellSize,
                    cuadrado.y * cellSize,
                    cellSize,
                    cuadrado.color
                );
            }
        }

        // Borde exterior del tablero neón
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, this.anchoTablero * cellSize, this.altoTablero * cellSize);

        ctx.restore();
    }

    dibujarSiguientePieza(pieza) {
        if (this.ctxSiguiente && this.canvasSiguiente) {
            this._dibujarPiezaEnCanvas(this.ctxSiguiente, this.canvasSiguiente, this.anchoSigPx, this.altoSigPx, pieza);
        }
        if (this.ctxSiguienteDesk && this.canvasSiguienteDesk) {
            this._dibujarPiezaEnCanvas(this.ctxSiguienteDesk, this.canvasSiguienteDesk, this.anchoSigDeskPx, this.altoSigDeskPx, pieza);
        }
    }

    _dibujarPiezaEnCanvas(ctx, canvas, wPx, hPx, pieza) {
        const w = wPx || canvas.clientWidth || 44;
        const h = hPx || canvas.clientHeight || 44;

        ctx.clearRect(0, 0, w, h);

        if (!pieza) return;

        const cuadrados = pieza.obtenerCuadrados();
        if (!cuadrados || cuadrados.length === 0) return;

        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        for (const c of cuadrados) {
            if (c.x < minX) minX = c.x;
            if (c.x + 1 > maxX) maxX = c.x + 1;
            if (c.y < minY) minY = c.y;
            if (c.y + 1 > maxY) maxY = c.y + 1;
        }

        const piezaAncho = maxX - minX;
        const piezaAlto = maxY - minY;

        const cellSize = Math.min((w * 0.75) / piezaAncho, (h * 0.75) / piezaAlto);
        const totalW = piezaAncho * cellSize;
        const totalH = piezaAlto * cellSize;

        const startX = (w - totalW) / 2;
        const startY = (h - totalH) / 2;

        ctx.save();
        ctx.translate(startX, startY);

        for (const c of cuadrados) {
            const px = (c.x - minX) * cellSize;
            const py = (c.y - minY) * cellSize;
            this.dibujarBloque(ctx, px, py, cellSize, c.color);
        }

        ctx.restore();
    }

    dibujarBloque(ctx, x, y, size, color) {
        const padding = 1;
        const bx = x + padding;
        const by = y + padding;
        const bSize = size - (padding * 2);

        // Relleno principal
        ctx.fillStyle = color;
        ctx.fillRect(bx, by, bSize, bSize);

        // Brillo superior e izquierdo estilo cristal/arcade
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + bSize, by);
        ctx.lineTo(bx + bSize - 3, by + 3);
        ctx.lineTo(bx + 3, by + 3);
        ctx.lineTo(bx + 3, by + bSize - 3);
        ctx.lineTo(bx, by + bSize);
        ctx.closePath();
        ctx.fill();

        // Sombra inferior y derecha
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.moveTo(bx + bSize, by);
        ctx.lineTo(bx + bSize, by + bSize);
        ctx.lineTo(bx, by + bSize);
        ctx.lineTo(bx + 3, by + bSize - 3);
        ctx.lineTo(bx + bSize - 3, by + bSize - 3);
        ctx.lineTo(bx + bSize - 3, by + 3);
        ctx.closePath();
        ctx.fill();

        // Borde negro exterior de la celda
        ctx.strokeStyle = '#050508';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bx, by, bSize, bSize);
    }

    dibujarBloqueFantasma(ctx, x, y, size, color) {
        const padding = 1;
        const bx = x + padding;
        const by = y + padding;
        const bSize = size - (padding * 2);

        // Convertir color a RGBA semitransparente
        ctx.fillStyle = this._convertirColorConOpacidad(color, 0.25);
        ctx.fillRect(bx, by, bSize, bSize);

        ctx.strokeStyle = this._convertirColorConOpacidad(color, 0.85);
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 2]);
        ctx.strokeRect(bx, by, bSize, bSize);
        ctx.setLineDash([]);
    }

    _convertirColorConOpacidad(color, alpha) {
        if (color.startsWith('rgb(')) {
            return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
        }
        return color;
    }
}

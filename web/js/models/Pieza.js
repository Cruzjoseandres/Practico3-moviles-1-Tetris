import { Square } from './Square.js';

/**
 * Clase base para todas las piezas de Tetris
 * Con soporte de rotación canónica, centro de gravedad y wall kicks universales
 */
export class Pieza {
    constructor(tableroJuego) {
        this.tableroJuego = tableroJuego;
        this.cuadrados = [];
        this.posicionActual = { x: 4, y: 0 };
        this.rotacionIndex = 0;
        this.rotaciones = []; // Definido en cada subclase
        this.color = '#00e5ff';
    }

    _inicializarCuadrados(color) {
        this.color = color;
        this.cuadrados = [];
        for (let i = 0; i < 4; i++) {
            this.cuadrados.push(new Square(0, 0, this.color));
        }
        this.actualizarPosicionesCuadrados();
    }

    rotar() {
        if (!this.rotaciones || this.rotaciones.length <= 1) {
            return true; // Piezas como la O no rotan
        }

        const proximaRotacion = (this.rotacionIndex + 1) % this.rotaciones.length;
        const coordsRelativas = this.rotaciones[proximaRotacion];

        // Lista de Wall Kicks universales (desplazamientos de corrección)
        // Prueba primero en la posición actual, luego izquierda/derecha, arriba/abajo
        const kicks = [
            [0, 0],
            [-1, 0],  // Empujar 1 a la izquierda
            [1, 0],   // Empujar 1 a la derecha
            [-2, 0],  // Empujar 2 a la izquierda (útil para pieza I)
            [2, 0],   // Empujar 2 a la derecha
            [0, -1],  // Empujar 1 hacia arriba (si toca fondo)
            [0, -2],  // Empujar 2 hacia arriba
            [0, 1],   // Empujar 1 hacia abajo (si toca techo al rotar)
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1]
        ];

        for (const [dx, dy] of kicks) {
            const posX = this.posicionActual.x + dx;
            const posY = this.posicionActual.y + dy;

            if (this._puedeColocarseEn(coordsRelativas, posX, posY)) {
                this.posicionActual.x = posX;
                this.posicionActual.y = posY;
                this.rotacionIndex = proximaRotacion;
                this.actualizarPosicionesCuadrados();
                return true;
            }
        }

        return false; // No hay espacio libre para rotar
    }

    _puedeColocarseEn(coordsRelativas, posX, posY) {
        for (const [rx, ry] of coordsRelativas) {
            const x = posX + rx;
            const y = posY + ry;

            // Verificar límites del tablero (10 columnas x 20 filas)
            if (x < 0 || x >= this.tableroJuego.ancho || y < 0 || y >= this.tableroJuego.alto) {
                return false;
            }

            // Verificar si choca con bloques ya fijados
            if (this.tableroJuego.tablero[y][x] !== null) {
                return false;
            }
        }
        return true;
    }

    actualizarPosicionesCuadrados() {
        const coordsRelativas = this.rotaciones[this.rotacionIndex];
        if (!coordsRelativas) return;

        for (let i = 0; i < 4; i++) {
            this.cuadrados[i].x = this.posicionActual.x + coordsRelativas[i][0];
            this.cuadrados[i].y = this.posicionActual.y + coordsRelativas[i][1];
            this.cuadrados[i].color = this.color;
        }
    }

    moverIzquierda() {
        if (this.tableroJuego.puedeMoverPieza(this, -1, 0)) {
            this.posicionActual.x -= 1;
            this.actualizarPosicionesCuadrados();
            return true;
        }
        return false;
    }

    moverDerecha() {
        if (this.tableroJuego.puedeMoverPieza(this, 1, 0)) {
            this.posicionActual.x += 1;
            this.actualizarPosicionesCuadrados();
            return true;
        }
        return false;
    }

    moverAbajo() {
        if (this.tableroJuego.puedeMoverPieza(this, 0, 1)) {
            this.posicionActual.y += 1;
            this.actualizarPosicionesCuadrados();
            return true;
        }
        return false;
    }

    obtenerCuadrados() {
        return this.cuadrados;
    }
}

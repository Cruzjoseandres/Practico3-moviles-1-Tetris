import { FabricarPiezas } from './FabricarPiezas.js';
import { Square } from './Square.js';

/**
 * Tablero principal del juego de Tetris
 * Replicación 1:1 de TableroJuego.kt
 */
export class TableroJuego {
    constructor(ancho = 10, alto = 20) {
        this.ancho = ancho;
        this.alto = alto;
        this.tablero = Array.from({ length: alto }, () => Array(ancho).fill(null));
        this.observadores = [];
        this.piezaActual = null;
        this.siguientePieza = FabricarPiezas.crearPiezaAleatoria(this);
        this.puntaje = 0;
        this.nivel = 1;
        this.velocidadCaida = 1000; // Milisegundos
        this.juegoActivo = true;
    }

    addObserver(fn) {
        this.observadores.push(fn);
    }

    notifyObservers(evento = null) {
        for (const obs of this.observadores) {
            obs(this, evento);
        }
    }

    generarNuevaPieza() {
        this.piezaActual = this.siguientePieza || FabricarPiezas.crearPiezaAleatoria(this);
        this.siguientePieza = FabricarPiezas.crearPiezaAleatoria(this);

        // Si la nueva pieza colisiona nada más salir, termina el juego
        const colisiona = this.verificarColision(this.piezaActual, 0, 0);
        this.notifyObservers({ tipo: 'nueva_pieza' });
        return !colisiona;
    }

    moverPiezaIzquierda() {
        if (this.piezaActual && this.puedeMoverPieza(this.piezaActual, -1, 0)) {
            this.piezaActual.moverIzquierda();
            this.notifyObservers({ tipo: 'movimiento' });
            return true;
        }
        return false;
    }

    moverPiezaDerecha() {
        if (this.piezaActual && this.puedeMoverPieza(this.piezaActual, 1, 0)) {
            this.piezaActual.moverDerecha();
            this.notifyObservers({ tipo: 'movimiento' });
            return true;
        }
        return false;
    }

    moverPiezaAbajo() {
        if (this.piezaActual && this.puedeMoverPieza(this.piezaActual, 0, 1)) {
            this.piezaActual.moverAbajo();
            this.notifyObservers({ tipo: 'movimiento_abajo' });
            return true;
        } else if (this.piezaActual) {
            const lineasEliminadas = this.fijarPieza();
            return false;
        }
        return false;
    }

    rotarPieza() {
        if (this.piezaActual) {
            const exito = this.piezaActual.rotar();
            this.notifyObservers({ tipo: 'rotacion', exito });
            return exito;
        }
        return false;
    }

    puedeMoverPieza(pieza, dx, dy) {
        const cuadrados = pieza.obtenerCuadrados();
        for (const cuadrado of cuadrados) {
            const x = cuadrado.x + dx;
            const y = cuadrado.y + dy;

            if (x < 0 || x >= this.ancho || y < 0 || y >= this.alto) {
                return false;
            }

            if (y >= 0 && this.tablero[y][x] !== null) {
                return false;
            }
        }
        return true;
    }

    verificarColision(pieza, dx, dy) {
        const cuadrados = pieza.obtenerCuadrados();
        for (const cuadrado of cuadrados) {
            const x = cuadrado.x + dx;
            const y = cuadrado.y + dy;

            if (x < 0 || x >= this.ancho || y >= this.alto || (y >= 0 && this.tablero[y][x] !== null)) {
                return true;
            }
        }
        return false;
    }

    fijarPieza() {
        if (!this.piezaActual) return 0;

        const cuadrados = this.piezaActual.obtenerCuadrados();
        for (const cuadrado of cuadrados) {
            const x = cuadrado.x;
            const y = cuadrado.y;
            if (y >= 0 && y < this.alto && x >= 0 && x < this.ancho) {
                this.tablero[y][x] = new Square(x, y, cuadrado.color);
            }
        }

        const lineasEliminadas = this.eliminarLineasCompletas();
        this.actualizarPuntuacion(lineasEliminadas);
        this.piezaActual = null;
        this.notifyObservers({ tipo: 'fijar_pieza', lineasEliminadas });
        return lineasEliminadas;
    }

    eliminarLineasCompletas() {
        const filasCompletas = [];
        for (let y = this.alto - 1; y >= 0; y--) {
            if (this.tablero[y].every(celda => celda !== null)) {
                filasCompletas.push(y);
            }
        }

        if (filasCompletas.length === 0) return 0;

        const nuevoTablero = Array.from({ length: this.alto }, () => Array(this.ancho).fill(null));
        let nuevaFila = this.alto - 1;

        for (let y = this.alto - 1; y >= 0; y--) {
            if (!filasCompletas.includes(y)) {
                for (let x = 0; x < this.ancho; x++) {
                    if (this.tablero[y][x] !== null) {
                        nuevoTablero[nuevaFila][x] = new Square(x, nuevaFila, this.tablero[y][x].color);
                    }
                }
                nuevaFila--;
            }
        }

        this.tablero = nuevoTablero;
        this.notifyObservers({ tipo: 'lineas_eliminadas', cantidad: filasCompletas.length });
        return filasCompletas.length;
    }

    actualizarPuntuacion(lineasEliminadas) {
        if (lineasEliminadas === 0) return;

        // Fórmula idéntica a Kotlin: (100 * 2^(n-1)) * (nivel * 2)
        const incremento = (100 * Math.pow(2, lineasEliminadas - 1)) * (this.nivel * 2);
        this.puntaje += Math.floor(incremento);

        const nivelPrevio = this.nivel;
        this.nivel = Math.floor(this.puntaje / 5000) + 1;
        const subioNivel = this.nivel > nivelPrevio;

        // Velocidad: maxOf(1000L - (nivel - 1) * 200L, 100L)
        this.velocidadCaida = Math.max(1000 - (this.nivel - 1) * 200, 100);

        this.notifyObservers({
            tipo: 'puntuacion_actualizada',
            lineasEliminadas,
            incremento,
            subioNivel
        });
    }

    obtenerTablero() {
        return this.tablero.map(fila => [...fila]);
    }

    obtenerPiezaActual() {
        return this.piezaActual;
    }

    obtenerSiguientePieza() {
        return this.siguientePieza;
    }

    obtenerPuntaje() {
        return this.puntaje;
    }

    obtenerNivel() {
        return this.nivel;
    }

    obtenerVelocidadCaida() {
        return this.velocidadCaida;
    }

    desactivarJuego() {
        this.juegoActivo = false;
    }

    establecerNivel(nuevoNivel) {
        this.nivel = nuevoNivel;
    }

    reiniciar() {
        for (let y = 0; y < this.alto; y++) {
            for (let x = 0; x < this.ancho; x++) {
                this.tablero[y][x] = null;
            }
        }
        this.puntaje = 0;
        this.nivel = 1;
        this.velocidadCaida = 1000;
        this.juegoActivo = true;
        this.piezaActual = null;
        this.siguientePieza = FabricarPiezas.crearPiezaAleatoria(this);
        this.notifyObservers({ tipo: 'reiniciar' });
    }

    obtenerSombraPieza() {
        const pieza = this.piezaActual;
        if (!pieza) return null;

        let dy = 0;
        while (this.puedeMoverPieza(pieza, 0, dy + 1)) {
            dy++;
        }

        return pieza.obtenerCuadrados().map(sq => new Square(sq.x, sq.y + dy, sq.color));
    }
}

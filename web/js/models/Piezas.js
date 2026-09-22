import { Pieza } from './Pieza.js';
import { FabricarPiezas } from './FabricarPiezas.js';

// --- PIEZA I ---
export class PiezaI extends Pieza {
    constructor(tableroJuego) {
        super(tableroJuego);
        this.rotaciones = [
            [[-1, 0], [0, 0], [1, 0], [2, 0]],   // Horizontal
            [[0, -1], [0, 0], [0, 1], [0, 2]]    // Vertical
        ];
        this._inicializarCuadrados(FabricarPiezas.obtenerColor());
    }
}

// --- PIEZA T ---
export class PiezaT extends Pieza {
    constructor(tableroJuego) {
        super(tableroJuego);
        this.rotaciones = [
            [[-1, 0], [0, 0], [1, 0], [0, 1]],   // Apuntando abajo
            [[0, -1], [0, 0], [-1, 0], [0, 1]],  // Apuntando izquierda
            [[-1, 0], [0, 0], [1, 0], [0, -1]],  // Apuntando arriba
            [[0, -1], [0, 0], [1, 0], [0, 1]]    // Apuntando derecha
        ];
        this._inicializarCuadrados(FabricarPiezas.obtenerColor());
    }
}

// --- PIEZA J ---
export class PiezaJ extends Pieza {
    constructor(tableroJuego) {
        super(tableroJuego);
        this.rotaciones = [
            [[-1, 0], [0, 0], [1, 0], [1, 1]],   // Base horizontal, cola abajo derecha
            [[0, -1], [0, 0], [0, 1], [-1, 1]],  // Base vertical, cola abajo izquierda
            [[-1, -1], [-1, 0], [0, 0], [1, 0]], // Base horizontal, cola arriba izquierda
            [[1, -1], [0, -1], [0, 0], [0, 1]]   // Base vertical, cola arriba derecha
        ];
        this._inicializarCuadrados(FabricarPiezas.obtenerColor());
    }
}

// --- PIEZA L ---
export class PiezaL extends Pieza {
    constructor(tableroJuego) {
        super(tableroJuego);
        this.rotaciones = [
            [[-1, 0], [0, 0], [1, 0], [-1, 1]],  // Base horizontal, cola abajo izquierda
            [[0, -1], [0, 0], [0, 1], [-1, -1]], // Base vertical, cola arriba izquierda
            [[1, -1], [-1, 0], [0, 0], [1, 0]],  // Base horizontal, cola arriba derecha
            [[1, 1], [0, -1], [0, 0], [0, 1]]    // Base vertical, cola abajo derecha
        ];
        this._inicializarCuadrados(FabricarPiezas.obtenerColor());
    }
}

// --- PIEZA O ---
export class PiezaO extends Pieza {
    constructor(tableroJuego) {
        super(tableroJuego);
        this.rotaciones = [
            [[0, 0], [1, 0], [0, 1], [1, 1]]     // Cuadrado no cambia al rotar
        ];
        this._inicializarCuadrados(FabricarPiezas.obtenerColor());
    }
}

// --- PIEZA S ---
export class PiezaS extends Pieza {
    constructor(tableroJuego) {
        super(tableroJuego);
        this.rotaciones = [
            [[0, 0], [1, 0], [-1, 1], [0, 1]],   // Horizontal
            [[0, -1], [0, 0], [1, 0], [1, 1]]    // Vertical
        ];
        this._inicializarCuadrados(FabricarPiezas.obtenerColor());
    }
}

// --- PIEZA Z ---
export class PiezaZ extends Pieza {
    constructor(tableroJuego) {
        super(tableroJuego);
        this.rotaciones = [
            [[-1, 0], [0, 0], [0, 1], [1, 1]],   // Horizontal
            [[1, -1], [1, 0], [0, 0], [0, 1]]    // Vertical
        ];
        this._inicializarCuadrados(FabricarPiezas.obtenerColor());
    }
}

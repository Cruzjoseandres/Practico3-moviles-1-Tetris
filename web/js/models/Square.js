/**
 * Modelo de celda/cuadrado individual en el juego de Tetris
 */
export class Square {
    constructor(x, y, color) {
        this.x = x; // Coordenada X en la cuadrícula (0..9)
        this.y = y; // Coordenada Y en la cuadrícula (0..19)
        this.color = color;
    }

    clone() {
        return new Square(this.x, this.y, this.color);
    }
}

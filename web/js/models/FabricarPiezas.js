import { PiezaI, PiezaJ, PiezaL, PiezaO, PiezaS, PiezaT, PiezaZ } from './Piezas.js';

export const COLORES_BRILLANTES = [
    'rgb(255, 0, 0)',      // Rojo
    'rgb(0, 255, 0)',      // Verde
    'rgb(0, 0, 255)',      // Azul
    'rgb(255, 255, 0)',    // Amarillo
    'rgb(255, 0, 255)',    // Magenta
    'rgb(0, 255, 255)',    // Cian
    'rgb(255, 165, 0)',    // Naranja
    'rgb(128, 0, 128)',    // Morado
    'rgb(0, 128, 128)',    // Verde azulado / Teal
    'rgb(255, 105, 180)'   // Rosa chillón / Hot Pink
];

export class FabricarPiezas {
    static obtenerColor() {
        const index = Math.floor(Math.random() * COLORES_BRILLANTES.length);
        return COLORES_BRILLANTES[index];
    }

    static crearPiezaAleatoria(tableroJuego) {
        const tipo = Math.floor(Math.random() * 7);
        let pieza;

        switch (tipo) {
            case 0: pieza = new PiezaI(tableroJuego); break;
            case 1: pieza = new PiezaJ(tableroJuego); break;
            case 2: pieza = new PiezaL(tableroJuego); break;
            case 3: pieza = new PiezaO(tableroJuego); break;
            case 4: pieza = new PiezaS(tableroJuego); break;
            case 5: pieza = new PiezaT(tableroJuego); break;
            default: pieza = new PiezaZ(tableroJuego); break;
        }

        // Aplicar rotaciones iniciales aleatorias (0..3) como en Android
        const rotaciones = Math.floor(Math.random() * 4);
        for (let i = 0; i < rotaciones; i++) {
            pieza.rotar();
        }

        return pieza;
    }
}

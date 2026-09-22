import { SoundEffects } from '../audio/SoundEffects.js';

/**
 * Gestor de eventos de entrada (Teclado, Táctil, Arrastre)
 * Clics directos en pantalla para izquierda/derecha y arrastre hacia abajo para bajar
 */
export class Controller {
    constructor(gameEngine) {
        this.engine = gameEngine;
        this.teclasPresionadas = new Set();

        // Variables para tracking de gestos táctiles y ratón
        this.startX = 0;
        this.startY = 0;
        this.lastDragY = 0;
        this.haArrastrado = false;
        this.arrastreThreshold = 22; // Pixeles para activar un paso hacia abajo

        this.initTeclado();
        this.initTouchYArrastre();
        this.initBotones();
    }

    initTeclado() {
        window.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }

            if (this.teclasPresionadas.has(e.key)) return;
            this.teclasPresionadas.add(e.key);

            if (this.engine.estaPausado && !['p', 'P', 'Escape'].includes(e.key)) {
                return;
            }

            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (this.engine.moverIzquierda()) SoundEffects.playMove();
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (this.engine.moverDerecha()) SoundEffects.playMove();
                    break;
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (this.engine.rotar()) SoundEffects.playRotate();
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (this.engine.moverAbajo()) SoundEffects.playMove();
                    break;
                case ' ': // Barra espaciadora = Hard Drop
                    SoundEffects.playDrop();
                    this.engine.bajarHardDrop();
                    break;
                case 'p':
                case 'P':
                case 'Escape':
                    this.engine.alternarPausa();
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            this.teclasPresionadas.delete(e.key);
        });
    }

    initTouchYArrastre() {
        const contenedor = document.getElementById('tableroTouchZone');
        const canvas = document.getElementById('tableroCanvas');
        if (!contenedor || !canvas) return;

        // Soporte universal: Pointer Events (cubre Touch en móviles y Ratón en PC)
        contenedor.addEventListener('pointerdown', (e) => {
            if (this.engine.estaPausado || !this.engine.juegoActivo) return;

            this.startX = e.clientX;
            this.startY = e.clientY;
            this.lastDragY = e.clientY;
            this.haArrastrado = false;
        });

        contenedor.addEventListener('pointermove', (e) => {
            if (this.engine.estaPausado || !this.engine.juegoActivo) return;
            if (e.buttons !== 1 && e.pointerType === 'mouse') return; // En ratón solo si está presionado

            const deltaYDesdeUltimo = e.clientY - this.lastDragY;
            const deltaTotalY = e.clientY - this.startY;

            // Si arrastra hacia abajo
            if (deltaTotalY > 12) {
                this.haArrastrado = true;

                // Cada cierto número de píxeles arrastrados hacia abajo, baja un bloque
                if (deltaYDesdeUltimo >= this.arrastreThreshold) {
                    if (this.engine.moverAbajo()) {
                        SoundEffects.playMove();
                    }
                    this.lastDragY = e.clientY;
                }
            }
        });

        contenedor.addEventListener('pointerup', (e) => {
            if (this.engine.estaPausado || !this.engine.juegoActivo) return;

            // Si fue un toque o clic limpio (sin arrastre vertical)
            const deltaX = Math.abs(e.clientX - this.startX);
            const deltaY = Math.abs(e.clientY - this.startY);

            if (!this.haArrastrado && deltaY < 15 && deltaX < 25) {
                const rect = canvas.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const mitad = rect.width / 2;

                if (clickX < mitad) {
                    if (this.engine.moverIzquierda()) SoundEffects.playMove();
                } else {
                    if (this.engine.moverDerecha()) SoundEffects.playMove();
                }
            }
        });

        contenedor.addEventListener('pointercancel', () => {
            this.haArrastrado = false;
        });
    }

    initBotones() {
        // Botón Rotar
        const btnRotar = document.getElementById('btnRotar');
        if (btnRotar) {
            btnRotar.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.engine.rotar()) {
                    SoundEffects.playRotate();
                }
            });
        }

        // Botón Bajar (Hard Drop instantáneo)
        const btnBajar = document.getElementById('btnBajar');
        if (btnBajar) {
            btnBajar.addEventListener('click', (e) => {
                e.stopPropagation();
                SoundEffects.playDrop();
                this.engine.bajarHardDrop();
            });
        }

        // Botón Pausa
        const btnPausa = document.getElementById('btnPausa');
        if (btnPausa) {
            btnPausa.addEventListener('click', (e) => {
                e.stopPropagation();
                this.engine.alternarPausa();
            });
        }

        // Botón Reiniciar
        const btnReiniciar = document.getElementById('btnReiniciar');
        if (btnReiniciar) {
            btnReiniciar.addEventListener('click', (e) => {
                e.stopPropagation();
                this.engine.reiniciar();
            });
        }

        // Botón Sonido
        const btnSonido = document.getElementById('btnSonido');
        if (btnSonido) {
            const actualizarIconoSonido = () => {
                btnSonido.textContent = SoundEffects.estaHabilitado() ? '🔊' : '🔇';
                btnSonido.setAttribute('aria-label', SoundEffects.estaHabilitado() ? 'Silenciar sonido' : 'Activar sonido');
            };
            actualizarIconoSonido();

            btnSonido.addEventListener('click', (e) => {
                e.stopPropagation();
                SoundEffects.alternarSonido();
                actualizarIconoSonido();
            });
        }
    }
}

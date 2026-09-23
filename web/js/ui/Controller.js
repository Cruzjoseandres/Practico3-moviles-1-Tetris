import { SoundEffects } from '../audio/SoundEffects.js';

/**
 * Gestor de eventos de entrada (Teclado, Táctil, Arrastre)
 * Con prevención estricta de doble toque / zoom para iOS Safari y WebKit
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

        this.initAntiZoomIOS();
        this.initTeclado();
        this.initTouchYArrastre();
        this.initBotones();
    }

    /**
     * Bloquea completamente el zoom por doble toque y gestos de pellizco en iOS Safari
     */
    initAntiZoomIOS() {
        // 1. Prevenir zoom por doble toque en iOS
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 320) {
                // Solo permitimos comportamiento por defecto en inputs de texto
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                }
            }
            lastTouchEnd = now;
        }, { passive: false });

        // 2. Prevenir zoom con dos o más dedos (pinch-to-zoom)
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });

        // 3. Prevenir gestos nativos de Safari
        document.addEventListener('gesturestart', (e) => e.preventDefault());
        document.addEventListener('gesturechange', (e) => e.preventDefault());
        document.addEventListener('gestureend', (e) => e.preventDefault());
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

        contenedor.addEventListener('pointerdown', (e) => {
            if (this.engine.estaPausado || !this.engine.juegoActivo) return;

            this.startX = e.clientX;
            this.startY = e.clientY;
            this.lastDragY = e.clientY;
            this.haArrastrado = false;
        });

        contenedor.addEventListener('pointermove', (e) => {
            if (this.engine.estaPausado || !this.engine.juegoActivo) return;
            if (e.buttons !== 1 && e.pointerType === 'mouse') return;

            const deltaYDesdeUltimo = e.clientY - this.lastDragY;
            const deltaTotalY = e.clientY - this.startY;

            // Si arrastra hacia abajo
            if (deltaTotalY > 12) {
                this.haArrastrado = true;

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

            const deltaX = Math.abs(e.clientX - this.startX);
            const deltaY = Math.abs(e.clientY - this.startY);

            // Toque limpio (sin arrastre vertical)
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

    /**
     * Vincula botones táctiles con respuesta inmediata en pointerdown
     * para eliminar cualquier retardo de 300ms y evitar zoom en iOS
     */
    _vincularBotonRapido(boton, accion) {
        if (!boton) return;

        let ejecutado = false;

        boton.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            ejecutado = true;
            accion();
        });

        boton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!ejecutado) {
                accion();
            }
            ejecutado = false;
        });
    }

    initBotones() {
        // Botón Rotar rápido
        const btnRotar = document.getElementById('btnRotar');
        this._vincularBotonRapido(btnRotar, () => {
            if (this.engine.rotar()) {
                SoundEffects.playRotate();
            }
        });

        // Botón Bajar rápido (Hard Drop)
        const btnBajar = document.getElementById('btnBajar');
        this._vincularBotonRapido(btnBajar, () => {
            SoundEffects.playDrop();
            this.engine.bajarHardDrop();
        });

        // Botón Pausa
        const btnPausa = document.getElementById('btnPausa');
        this._vincularBotonRapido(btnPausa, () => {
            this.engine.alternarPausa();
        });

        // Botón Reiniciar
        const btnReiniciar = document.getElementById('btnReiniciar');
        this._vincularBotonRapido(btnReiniciar, () => {
            this.engine.reiniciar();
        });

        // Botón Sonido
        const btnSonido = document.getElementById('btnSonido');
        if (btnSonido) {
            const actualizarIconoSonido = () => {
                btnSonido.textContent = SoundEffects.estaHabilitado() ? '🔊' : '🔇';
                btnSonido.setAttribute('aria-label', SoundEffects.estaHabilitado() ? 'Silenciar sonido' : 'Activar sonido');
            };
            actualizarIconoSonido();

            this._vincularBotonRapido(btnSonido, () => {
                SoundEffects.alternarSonido();
                actualizarIconoSonido();
            });
        }
    }
}

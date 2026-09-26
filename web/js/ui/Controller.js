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
        // 1. Bloqueo estricto del evento nativo dblclick (doble clic)
        window.addEventListener('dblclick', (e) => {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                e.stopPropagation();
            }
        }, { passive: false, capture: true });

        // 2. Prevenir zoom por doble toque rápido en iOS en touchstart (se captura antes de que Safari inicie el gesto)
        let lastTouchStartTime = 0;
        window.addEventListener('touchstart', (e) => {
            const now = Date.now();
            // Bloquear pellizco de 2 o más dedos
            if (e.touches && e.touches.length > 1) {
                e.preventDefault();
                return;
            }
            // Bloquear doble toque rápido dentro de 500ms
            if (now - lastTouchStartTime <= 500) {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                }
            }
            lastTouchStartTime = now;
        }, { passive: false, capture: true });

        // 3. Prevenir zoom en touchend rápido
        let lastTouchEndTime = 0;
        window.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEndTime <= 500) {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                }
            }
            lastTouchEndTime = now;
        }, { passive: false, capture: true });

        // 4. Bloqueo de gestos de escala y rotación específicos de Safari iOS
        window.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false, capture: true });
        window.addEventListener('gesturechange', (e) => e.preventDefault(), { passive: false, capture: true });
        window.addEventListener('gestureend', (e) => e.preventDefault(), { passive: false, capture: true });

        // 5. Prevenir zoom de arrastre multitáctil
        window.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false, capture: true });

        // 6. Restablecer escala del viewport a 1.0 si el navegador intenta hacer zoom
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                if (window.visualViewport.scale > 1.01) {
                    document.body.style.zoom = '0.9999';
                    setTimeout(() => {
                        document.body.style.zoom = '1';
                        window.scrollTo(0, 0);
                    }, 50);
                }
            });
        }
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

        // Prevenir doble toque y zoom nativo en el contenedor del tablero
        contenedor.addEventListener('dblclick', (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, { passive: false });

        contenedor.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            if (this.engine.estaPausado || !this.engine.juegoActivo) return;

            this.startX = e.clientX;
            this.startY = e.clientY;
            this.lastDragY = e.clientY;
            this.haArrastrado = false;
        }, { passive: false });

        contenedor.addEventListener('pointermove', (e) => {
            e.preventDefault();
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
        }, { passive: false });

        contenedor.addEventListener('pointerup', (e) => {
            e.preventDefault();
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
        }, { passive: false });

        contenedor.addEventListener('pointercancel', () => {
            this.haArrastrado = false;
        });
    }

    /**
     * Vincula botones táctiles con respuesta inmediata en pointerdown/touchstart
     * para eliminar cualquier retardo y bloquear 100% el zoom en iOS Safari
     */
    _vincularBotonRapido(boton, accion) {
        if (!boton) return;

        let ejecutado = false;

        const disparar = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            if (!ejecutado) {
                ejecutado = true;
                accion();
                setTimeout(() => { ejecutado = false; }, 40);
            }
        };

        boton.addEventListener('pointerdown', (e) => {
            disparar(e);
        }, { passive: false });

        boton.addEventListener('touchstart', (e) => {
            disparar(e);
        }, { passive: false });

        boton.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, { passive: false });

        boton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            disparar(e);
        });

        boton.addEventListener('dblclick', (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, { passive: false });
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

        // Botón Pausa (móvil y desktop)
        const btnPausa = document.getElementById('btnPausa');
        this._vincularBotonRapido(btnPausa, () => this.engine.alternarPausa());
        const btnPausaDesk = document.getElementById('btnPausaDesk');
        this._vincularBotonRapido(btnPausaDesk, () => this.engine.alternarPausa());

        // Botón Reiniciar (móvil y desktop)
        const btnReiniciar = document.getElementById('btnReiniciar');
        this._vincularBotonRapido(btnReiniciar, () => this.engine.reiniciar());
        const btnReiniciarDesk = document.getElementById('btnReiniciarDesk');
        this._vincularBotonRapido(btnReiniciarDesk, () => this.engine.reiniciar());

        // Botón Sonido (móvil y desktop)
        const btnSonido = document.getElementById('btnSonido');
        const btnSonidoDesk = document.getElementById('btnSonidoDesk');
        const actualizarIconosSonido = () => {
            const ico = SoundEffects.estaHabilitado() ? '🔊' : '🔇';
            const label = SoundEffects.estaHabilitado() ? 'Silenciar sonido' : 'Activar sonido';
            if (btnSonido) {
                btnSonido.textContent = ico;
                btnSonido.setAttribute('aria-label', label);
            }
            if (btnSonidoDesk) {
                btnSonidoDesk.textContent = ico;
                btnSonidoDesk.setAttribute('aria-label', label);
            }
        };
        actualizarIconosSonido();

        if (btnSonido) {
            this._vincularBotonRapido(btnSonido, () => {
                SoundEffects.alternarSonido();
                actualizarIconosSonido();
            });
        }
        if (btnSonidoDesk) {
            this._vincularBotonRapido(btnSonidoDesk, () => {
                SoundEffects.alternarSonido();
                actualizarIconosSonido();
            });
        }
    }
}

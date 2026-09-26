import { TableroJuego } from './models/TableroJuego.js';
import { Renderer } from './ui/Renderer.js';
import { Controller } from './ui/Controller.js';
import { PuntajeStorage } from './storage/PuntajeStorage.js';
import { SoundEffects } from './audio/SoundEffects.js';

class TetrisApp {
    constructor() {
        this.tablero = new TableroJuego();
        this.juegoActivo = false;
        this.estaPausado = false;
        this.timerCaida = null;
        this.puntajeFinal = 0;
        this.nivelFinal = 1;
        this.deferredPrompt = null;

        // Elementos del DOM
        this.pantallaMenu = document.getElementById('pantallaMenu');
        this.pantallaJuego = document.getElementById('pantallaJuego');
        this.pantallaPuntuaciones = document.getElementById('pantallaPuntuaciones');

        this.txtPuntaje = document.getElementById('txtPuntaje');
        this.txtPuntajeDesk = document.getElementById('txtPuntajeDesk');
        this.txtNivel = document.getElementById('txtNivel');
        this.txtNivelDesk = document.getElementById('txtNivelDesk');
        this.txtRecord = document.getElementById('txtRecord');
        this.btnPausa = document.getElementById('btnPausa');
        this.btnPausaDesk = document.getElementById('btnPausaDesk');

        // Modales
        this.modalGameOver = document.getElementById('modalGameOver');
        this.txtPuntajeFinal = document.getElementById('txtPuntajeFinal');
        this.inputNombreJugador = document.getElementById('inputNombreJugador');
        this.btnGuardarPuntaje = document.getElementById('btnGuardarPuntaje');
        this.btnCancelarGameOver = document.getElementById('btnCancelarGameOver');

        this.modalPausa = document.getElementById('modalPausa');
        this.btnReanudarPausa = document.getElementById('btnReanudarPausa');
        this.btnReiniciarPausa = document.getElementById('btnReiniciarPausa');
        this.btnMenuDesdePausa = document.getElementById('btnMenuDesdePausa');

        // Modal PWA
        this.modalPWA = document.getElementById('modalPWA');
        this.pwaInstrucciones = document.getElementById('pwaInstrucciones');
        this.btnAccionInstalarPWA = document.getElementById('btnAccionInstalarPWA');
        this.btnCerrarModalPWA = document.getElementById('btnCerrarModalPWA');
        this.btnInstalarApp = document.getElementById('btnInstalarApp');

        // Tabla de puntuaciones
        this.tablaPuntuacionesBody = document.getElementById('tablaPuntuacionesBody');
        this.btnLimpiarPuntajes = document.getElementById('btnLimpiarPuntajes');

        // Inicializar Renderizador (con soporte de canvas siguiente móvil y desktop)
        const canvasTablero = document.getElementById('tableroCanvas');
        const canvasSiguiente = document.getElementById('siguientePiezaCanvas');
        const canvasSiguienteDesk = document.getElementById('siguientePiezaCanvasDesk');
        this.renderer = new Renderer(canvasTablero, canvasSiguiente, canvasSiguienteDesk);

        // Inicializar Controlador de entradas (con soporte anti-zoom para iOS)
        this.controller = new Controller(this);

        this.initEventosUI();
        this.initObservadoresTablero();
        this.actualizarHUDRecord();
        this.initPWA();
    }

    initEventosUI() {
        // Botones del Menú Principal
        document.getElementById('btnIniciarJuego')?.addEventListener('click', () => {
            this.irAPantalla('juego');
            this.iniciarJuego();
        });

        document.getElementById('btnScore')?.addEventListener('click', () => {
            this.cargarYMostrarPuntuaciones();
            this.irAPantalla('puntuaciones');
        });

        // Botones de Navegación desde el juego (móvil y desktop)
        const volverAlMenu = () => {
            this.pausarJuego();
            if (confirm('¿Seguro que deseas salir al menú principal? Se perderá el juego actual.')) {
                this.detenerJuego();
                this.irAPantalla('menu');
            } else {
                this.reanudarJuego();
            }
        };
        document.getElementById('btnVolverMenu')?.addEventListener('click', volverAlMenu);
        document.getElementById('btnVolverMenuDesk')?.addEventListener('click', volverAlMenu);

        // Botones desde la pantalla de puntuaciones
        document.getElementById('btnVolverDesdeScore')?.addEventListener('click', () => {
            this.irAPantalla('menu');
        });

        document.getElementById('btnJugarDesdeScore')?.addEventListener('click', () => {
            this.irAPantalla('juego');
            this.iniciarJuego();
        });

        // Limpiar puntuaciones
        this.btnLimpiarPuntajes?.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas borrar todas las puntuaciones guardadas?')) {
                PuntajeStorage.limpiar();
                this.cargarYMostrarPuntuaciones();
                this.actualizarHUDRecord();
            }
        });

        // Acciones del modal Game Over
        this.btnGuardarPuntaje?.addEventListener('click', () => {
            const nombre = (this.inputNombreJugador.value || '').trim() || 'Anónimo';
            PuntajeStorage.guardarPuntaje(nombre, this.puntajeFinal, this.nivelFinal);
            this.cerrarModalGameOver();
            this.cargarYMostrarPuntuaciones();
            this.irAPantalla('puntuaciones');
        });

        this.inputNombreJugador?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.btnGuardarPuntaje.click();
            }
        });

        this.btnCancelarGameOver?.addEventListener('click', () => {
            this.cerrarModalGameOver();
            this.irAPantalla('menu');
        });

        // Acciones del modal Pausa
        this.btnReanudarPausa?.addEventListener('click', () => {
            this.reanudarJuego();
        });

        this.btnReiniciarPausa?.addEventListener('click', () => {
            this.cerrarModalPausa();
            this.reiniciar();
        });

        this.btnMenuDesdePausa?.addEventListener('click', () => {
            this.cerrarModalPausa();
            this.detenerJuego();
            this.irAPantalla('menu');
        });

        // Modal PWA
        this.btnCerrarModalPWA?.addEventListener('click', () => {
            this.modalPWA.classList.add('oculto');
        });
    }

    initPWA() {
        // Registrar Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js').catch((err) => {
                    console.log('Error registrando Service Worker:', err);
                });
            });
        }

        // Capturar evento de instalación en Android / Chrome
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
        });

        // Evento botón instalar PWA
        this.btnInstalarApp?.addEventListener('click', () => {
            const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            const esStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

            if (esStandalone) {
                alert('¡Ya tienes la app instalada en tu dispositivo!');
                return;
            }

            if (this.deferredPrompt) {
                // Instalación directa de Chrome/Android
                this.deferredPrompt.prompt();
                this.deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('El usuario aceptó la instalación');
                    }
                    this.deferredPrompt = null;
                });
            } else if (esIOS) {
                // Guía específica para iPhone / iPad en Safari
                this.pwaInstrucciones.innerHTML = `
                    <p style="margin-bottom: 8px; font-weight: bold; color: var(--neon-cyan);">Cómo instalar en tu iPhone / iPad:</p>
                    <ol style="list-style: none; padding-left: 0; display: flex; flex-direction: column; gap: 8px;">
                        <li>1. Pulsa el botón <strong>Compartir</strong> (icono de recuadro con flecha arriba en la barra de Safari).</li>
                        <li>2. Desplázate hacia abajo y selecciona <strong>"Añadir a la pantalla de inicio"</strong>.</li>
                        <li>3. Pulsa <strong>"Añadir"</strong> en la esquina superior derecha.</li>
                    </ol>
                    <p style="margin-top: 10px; font-size: 0.85rem; color: #94a3b8;">¡Se iniciará a pantalla completa como una aplicación nativa!</p>
                `;
                this.btnAccionInstalarPWA.classList.add('oculto');
                this.modalPWA.classList.remove('oculto');
            } else {
                // Navegadores de escritorio u otros
                this.pwaInstrucciones.innerHTML = `
                    <p style="margin-bottom: 8px; font-weight: bold; color: var(--neon-cyan);">Instalar en tu dispositivo:</p>
                    <p>Puedes instalar Tetris haciendo clic en el icono de instalación en la barra de direcciones de tu navegador, o desde el menú de opciones seleccionando <strong>"Instalar TetrisJACP"</strong>.</p>
                `;
                this.btnAccionInstalarPWA.classList.add('oculto');
                this.modalPWA.classList.remove('oculto');
            }
        });
    }

    initObservadoresTablero() {
        this.tablero.addObserver((tablero, evento) => {
            const pts = tablero.obtenerPuntaje();
            const lvl = tablero.obtenerNivel();

            if (this.txtPuntaje) this.txtPuntaje.textContent = pts;
            if (this.txtPuntajeDesk) this.txtPuntajeDesk.textContent = pts;
            if (this.txtNivel) this.txtNivel.textContent = lvl;
            if (this.txtNivelDesk) this.txtNivelDesk.textContent = lvl;

            if (evento) {
                if (evento.tipo === 'puntuacion_actualizada') {
                    if (evento.lineasEliminadas > 0) {
                        SoundEffects.playLineClear(evento.lineasEliminadas);
                    }
                    if (evento.subioNivel) {
                        SoundEffects.playLevelUp();
                    }
                }
            }

            this.renderer.renderizar(this.tablero);
        });
    }

    irAPantalla(pantalla) {
        this.pantallaMenu.classList.add('oculto');
        this.pantallaJuego.classList.add('oculto');
        this.pantallaPuntuaciones.classList.add('oculto');

        if (pantalla === 'menu') {
            this.pantallaMenu.classList.remove('oculto');
            this.actualizarHUDRecord();
        } else if (pantalla === 'juego') {
            this.pantallaJuego.classList.remove('oculto');
            this.renderer.ajustarResolucion();
            this.renderer.renderizar(this.tablero);
        } else if (pantalla === 'puntuaciones') {
            this.pantallaPuntuaciones.classList.remove('oculto');
        }
    }

    iniciarJuego() {
        this.detenerJuego();
        this.tablero.reiniciar();
        this.juegoActivo = true;
        this.estaPausado = false;
        this.actualizarBotonPausa();

        if (this.txtPuntaje) this.txtPuntaje.textContent = '0';
        if (this.txtPuntajeDesk) this.txtPuntajeDesk.textContent = '0';
        if (this.txtNivel) this.txtNivel.textContent = '1';
        if (this.txtNivelDesk) this.txtNivelDesk.textContent = '1';

        const inicioExitoso = this.tablero.generarNuevaPieza();
        if (!inicioExitoso) {
            this.finalizarJuego();
            return;
        }

        this.renderer.renderizar(this.tablero);
        this.programarSiguienteTick();
    }

    programarSiguienteTick() {
        if (!this.juegoActivo || this.estaPausado) return;

        if (this.timerCaida) clearTimeout(this.timerCaida);

        this.timerCaida = setTimeout(() => {
            this.ejecutarTick();
        }, this.tablero.obtenerVelocidadCaida());
    }

    ejecutarTick() {
        if (!this.juegoActivo || this.estaPausado) return;

        const seMovio = this.tablero.moverPiezaAbajo();
        if (!seMovio) {
            const generacionExitosa = this.tablero.generarNuevaPieza();
            if (!generacionExitosa) {
                this.finalizarJuego();
                return;
            }
        }

        this.renderer.renderizar(this.tablero);
        this.programarSiguienteTick();
    }

    moverIzquierda() {
        if (!this.juegoActivo || this.estaPausado) return false;
        return this.tablero.moverPiezaIzquierda();
    }

    moverDerecha() {
        if (!this.juegoActivo || this.estaPausado) return false;
        return this.tablero.moverPiezaDerecha();
    }

    moverAbajo() {
        if (!this.juegoActivo || this.estaPausado) return false;
        const movido = this.tablero.moverPiezaAbajo();
        if (!movido) {
            const exito = this.tablero.generarNuevaPieza();
            if (!exito) {
                this.finalizarJuego();
                return false;
            }
        }
        return movido;
    }

    rotar() {
        if (!this.juegoActivo || this.estaPausado) return false;
        return this.tablero.rotarPieza();
    }

    bajarHardDrop() {
        if (!this.juegoActivo || this.estaPausado) return;

        let movido = false;
        do {
            movido = this.tablero.moverPiezaAbajo();
        } while (movido);

        const generacionExitosa = this.tablero.generarNuevaPieza();
        if (!generacionExitosa) {
            this.finalizarJuego();
            return;
        }

        this.renderer.renderizar(this.tablero);
        this.programarSiguienteTick();
    }

    alternarPausa() {
        if (!this.juegoActivo) return;

        if (this.estaPausado) {
            this.reanudarJuego();
        } else {
            this.pausarJuego();
        }
    }

    pausarJuego() {
        if (!this.juegoActivo) return;
        this.estaPausado = true;
        if (this.timerCaida) clearTimeout(this.timerCaida);
        this.actualizarBotonPausa();
        this.mostrarModalPausa();
    }

    reanudarJuego() {
        if (!this.juegoActivo) return;
        this.estaPausado = false;
        this.cerrarModalPausa();
        this.actualizarBotonPausa();
        this.programarSiguienteTick();
    }

    reiniciar() {
        this.cerrarModalGameOver();
        this.cerrarModalPausa();
        this.iniciarJuego();
    }

    detenerJuego() {
        this.juegoActivo = false;
        if (this.timerCaida) clearTimeout(this.timerCaida);
        this.tablero.desactivarJuego();
    }

    finalizarJuego() {
        this.detenerJuego();
        this.puntajeFinal = this.tablero.obtenerPuntaje();
        this.nivelFinal = this.tablero.obtenerNivel();

        SoundEffects.playGameOver();
        this.mostrarModalGameOver(this.puntajeFinal);
    }

    mostrarModalGameOver(puntaje) {
        if (this.txtPuntajeFinal) {
            this.txtPuntajeFinal.textContent = `Tu puntaje final es: ${puntaje}`;
        }
        if (this.inputNombreJugador) {
            this.inputNombreJugador.value = '';
            setTimeout(() => this.inputNombreJugador.focus(), 150);
        }
        this.modalGameOver.classList.remove('oculto');
    }

    cerrarModalGameOver() {
        this.modalGameOver.classList.add('oculto');
    }

    mostrarModalPausa() {
        this.modalPausa.classList.remove('oculto');
    }

    cerrarModalPausa() {
        this.modalPausa.classList.add('oculto');
    }

    actualizarBotonPausa() {
        const svgPlay = '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
        const svgPause = '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>';
        const iconSvg = this.estaPausado ? svgPlay : svgPause;
        const titleText = this.estaPausado ? 'Reanudar' : 'Pausar';
        const labelText = this.estaPausado ? 'Reanudar' : 'Pausa';

        if (this.btnPausa) {
            this.btnPausa.innerHTML = iconSvg;
            this.btnPausa.setAttribute('title', titleText);
            this.btnPausa.setAttribute('aria-label', titleText);
        }
        if (this.btnPausaDesk) {
            const iconHolder = this.btnPausaDesk.querySelector('.icon-holder');
            if (iconHolder) {
                iconHolder.innerHTML = iconSvg;
            } else {
                this.btnPausaDesk.innerHTML = iconSvg;
            }
            const labelSpan = this.btnPausaDesk.querySelector('span:not(.icon-holder)');
            if (labelSpan) {
                labelSpan.textContent = labelText;
            }
            this.btnPausaDesk.setAttribute('title', titleText);
            this.btnPausaDesk.setAttribute('aria-label', titleText);
        }
    }

    actualizarHUDRecord() {
        const record = PuntajeStorage.obtenerRecordMaximo();
        if (this.txtRecord) {
            this.txtRecord.textContent = `Récord: ${record}`;
        }
    }

    cargarYMostrarPuntuaciones() {
        const top10 = PuntajeStorage.obtenerTopPuntajes(10);
        this.tablaPuntuacionesBody.innerHTML = '';

        if (top10.length === 0) {
            this.tablaPuntuacionesBody.innerHTML = `
                <tr>
                    <td colspan="5" class="sin-datos text-center py-6 text-slate-400">No hay puntuaciones registradas aún. ¡Juega una partida para empezar!</td>
                </tr>
            `;
            return;
        }

        top10.forEach((item, index) => {
            const tr = document.createElement('tr');
            let medallaHtml = `<span class="inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold text-slate-400 bg-white/5 border border-white/10">${index + 1}</span>`;
            if (index === 0) {
                medallaHtml = `<span class="inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-black text-slate-900 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]">1</span>`;
            } else if (index === 1) {
                medallaHtml = `<span class="inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-black text-slate-900 bg-slate-300 shadow-[0_0_8px_rgba(203,213,225,0.4)]">2</span>`;
            } else if (index === 2) {
                medallaHtml = `<span class="inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-black text-white bg-amber-700 shadow-[0_0_8px_rgba(180,83,9,0.4)]">3</span>`;
            }

            tr.innerHTML = `
                <td class="posicion p-2.5">${medallaHtml}</td>
                <td class="nombre p-2.5 font-medium">${this.escaparHtml(item.nombre)}</td>
                <td class="puntaje p-2.5 font-['Orbitron'] font-bold text-cyan-400">${item.puntaje.toLocaleString()}</td>
                <td class="nivel p-2.5 font-['Orbitron'] text-fuchsia-400">${item.nivel}</td>
                <td class="fecha p-2.5 text-slate-400 text-xs">${item.fecha || '-'}</td>
            `;
            this.tablaPuntuacionesBody.appendChild(tr);
        });
    }

    escaparHtml(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }
}

// Iniciar aplicación al cargar el DOM
window.addEventListener('DOMContentLoaded', () => {
    new TetrisApp();
});

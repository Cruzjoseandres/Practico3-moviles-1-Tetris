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

        // Elementos del DOM
        this.pantallaMenu = document.getElementById('pantallaMenu');
        this.pantallaJuego = document.getElementById('pantallaJuego');
        this.pantallaPuntuaciones = document.getElementById('pantallaPuntuaciones');

        this.txtPuntaje = document.getElementById('txtPuntaje');
        this.txtNivel = document.getElementById('txtNivel');
        this.txtRecord = document.getElementById('txtRecord');
        this.btnPausa = document.getElementById('btnPausa');

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

        // Tabla de puntuaciones
        this.tablaPuntuacionesBody = document.getElementById('tablaPuntuacionesBody');
        this.btnLimpiarPuntajes = document.getElementById('btnLimpiarPuntajes');

        // Inicializar Renderizador
        const canvasTablero = document.getElementById('tableroCanvas');
        const canvasSiguiente = document.getElementById('siguientePiezaCanvas');
        this.renderer = new Renderer(canvasTablero, canvasSiguiente);

        // Inicializar Controlador de entradas
        this.controller = new Controller(this);

        this.initEventosUI();
        this.initObservadoresTablero();
        this.actualizarHUDRecord();
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

        // Botones de Navegación desde el juego
        document.getElementById('btnVolverMenu')?.addEventListener('click', () => {
            this.pausarJuego();
            if (confirm('¿Seguro que deseas salir al menú principal? Se perderá el juego actual.')) {
                this.detenerJuego();
                this.irAPantalla('menu');
            } else {
                this.reanudarJuego();
            }
        });

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
    }

    initObservadoresTablero() {
        this.tablero.addObserver((tablero, evento) => {
            // Actualizar datos del HUD
            this.txtPuntaje.textContent = `Puntaje: ${tablero.obtenerPuntaje()}`;
            this.txtNivel.textContent = `Nivel: ${tablero.obtenerNivel()}`;

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

            // Redibujar el canvas
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
            // Se fijó la pieza; intentar generar una nueva
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
        if (!this.btnPausa) return;
        if (this.estaPausado) {
            this.btnPausa.innerHTML = '<span class="icon">▶</span>';
            this.btnPausa.setAttribute('title', 'Reanudar');
        } else {
            this.btnPausa.innerHTML = '<span class="icon">⏸</span>';
            this.btnPausa.setAttribute('title', 'Pausar');
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
                    <td colspan="5" class="sin-datos">No hay puntuaciones registradas aún. ¡Juega una partida para empezar!</td>
                </tr>
            `;
            return;
        }

        top10.forEach((item, index) => {
            const tr = document.createElement('tr');
            let medalla = `${index + 1}`;
            if (index === 0) medalla = '🥇 1';
            else if (index === 1) medalla = '🥈 2';
            else if (index === 2) medalla = '🥉 3';

            tr.innerHTML = `
                <td class="posicion">${medalla}</td>
                <td class="nombre">${this.escaparHtml(item.nombre)}</td>
                <td class="puntaje">${item.puntaje.toLocaleString()}</td>
                <td class="nivel">${item.nivel}</td>
                <td class="fecha">${item.fecha || '-'}</td>
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

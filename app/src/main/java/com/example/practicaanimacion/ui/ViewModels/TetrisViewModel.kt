package com.example.practicaanimacion.viewmodels

import android.content.Context
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.practicaanimacion.db.models.Puntaje
import com.example.practicaanimacion.models.EstadoJuego
import com.example.practicaanimacion.models.EventoJuego
import com.example.practicaanimacion.models.TableroJuego
import com.example.practicaanimacion.observer.Observer
import com.example.practicaanimacion.repositories.PuntajeRepository
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.launch
import java.util.Date

class TetrisViewModel : ViewModel() {
    // Estado observable del juego
    private val _estadoJuego = MutableLiveData<EstadoJuego>()
    val estadoJuego: LiveData<EstadoJuego> = _estadoJuego

    // Puntuación
    private val _puntaje = MutableLiveData(0)
    val puntaje: LiveData<Int> = _puntaje

    // Eventos de una sola vez (para mostrar diálogos, etc)
    private val _eventos = MutableSharedFlow<EventoJuego>()
    val eventos = _eventos.asSharedFlow()

    // Instancia del tablero
    private val tableroJuego = TableroJuego()

    // Variable para controlar el bucle del juego
    private var juegoActivo = false

    // Puntuación final guardada
    private var puntajeFinal = 0

    init {
        inicializarObservadores()
    }

    private fun inicializarObservadores() {
        // Añadir un observador al tablero para actualizar la puntuación y el estado
        tableroJuego.addObserver(object : Observer {
            override fun update() {
                // Actualizar puntuación
                actualizarPuntaje(tableroJuego.obtenerPuntaje())

                // Actualizar estado del juego
                _estadoJuego.postValue(
                    EstadoJuego(
                        tableroActual = obtenerEstadoTablero(),
                        piezaActual = tableroJuego.obtenerPiezaActual(),
                        nivel = tableroJuego.obtenerNivel(),
                        activo = juegoActivo
                    )
                )
            }
        })
    }


    private fun obtenerEstadoTablero(): Array<Array<com.example.practicaanimacion.models.Square?>> {
        return tableroJuego.obtenerTablero()
    }

    private fun obtenerNivelActual(): Int {
        return tableroJuego.obtenerNivel()
    }

    fun iniciarJuego() {
        viewModelScope.launch {
            juegoActivo = true

            // Generar la primera pieza
            val inicioExitoso = tableroJuego.generarNuevaPieza()
            if (!inicioExitoso) {
                finalizarJuego()
                return@launch
            }

            // Iniciar bucle de juego
            iniciarBucleJuego()
        }
    }

    fun moverIzquierda() = viewModelScope.launch {
        if (juegoActivo) tableroJuego.moverPiezaIzquierda()
    }

    fun moverDerecha() = viewModelScope.launch {
        if (juegoActivo) tableroJuego.moverPiezaDerecha()
    }

    fun rotar() = viewModelScope.launch {
        if (juegoActivo) tableroJuego.rotarPieza()
    }

    fun bajar() = viewModelScope.launch {
        if (!juegoActivo) return@launch

        // Implementar bajarRápido como función del ViewModel
        var movido: Boolean
        do {
            movido = tableroJuego.moverPiezaAbajo()
        } while (movido)
    }

    private suspend fun iniciarBucleJuego() {
        while (juegoActivo) {
            val movido = tableroJuego.moverPiezaAbajo()
            if (!movido) {
                val generacionExitosa = tableroJuego.generarNuevaPieza()
                if (!generacionExitosa) {
                    finalizarJuego()
                    return
                }
            }
            delay(tableroJuego.obtenerVelocidadCaida())
        }
    }

    private suspend fun finalizarJuego() {
        juegoActivo = false
        puntajeFinal = tableroJuego.obtenerPuntaje()
        tableroJuego.desactivarJuego()
        _eventos.emit(EventoJuego.FinJuego(puntajeFinal))
    }

    fun actualizarPuntaje(nuevoPuntaje: Int) {
        _puntaje.value = nuevoPuntaje
    }

    fun guardarPuntaje(context: Context, nombre: String) {
        viewModelScope.launch {
            val puntaje = Puntaje(
                nombre,
                puntajeFinal
            )
            PuntajeRepository.insertPuntaje(context, puntaje)
        }
    }

    fun detenerJuego() {
        juegoActivo = false
        tableroJuego.desactivarJuego()
    }

    override fun onCleared() {
        super.onCleared()
        detenerJuego()
    }
}
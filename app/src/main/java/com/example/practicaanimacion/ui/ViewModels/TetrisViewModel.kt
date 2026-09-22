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


class TetrisViewModel : ViewModel() {

    private val _estadoJuego = MutableLiveData<EstadoJuego>()
    val estadoJuego: LiveData<EstadoJuego> = _estadoJuego


    private val _puntaje = MutableLiveData(0)
    val puntaje: LiveData<Int> = _puntaje


    private val _eventos = MutableSharedFlow<EventoJuego>()
    val eventos = _eventos.asSharedFlow()

    private val tableroJuego = TableroJuego()


    private var juegoActivo = false


    private var puntajeFinal = 0
    private var nivelFinal = 1


    private val _nivel = MutableLiveData(1)
    val nivel: LiveData<Int> = _nivel

    var estaPausado = false


    init {
        inicializarObservadores()
    }

    private fun inicializarObservadores() {
        tableroJuego.addObserver(object : Observer {
            override fun update() {

                actualizarPuntaje(tableroJuego.obtenerPuntaje())


                _estadoJuego.postValue(
                    EstadoJuego(
                        tableroActual = obtenerEstadoTablero(),
                        piezaActual = tableroJuego.obtenerPiezaActual(),
                        siguientePieza = tableroJuego.obtenerSiguientePieza(),
                        sombraPieza = tableroJuego.obtenerSombraPieza(),
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

    fun iniciarJuego() {
        viewModelScope.launch {
            juegoActivo = true

            val inicioExitoso = tableroJuego.generarNuevaPieza()
            if (!inicioExitoso) {
                finalizarJuego()
                return@launch
            }

            iniciarBucleJuego()
        }
    }

    fun moverIzquierda() = viewModelScope.launch {
        if (juegoActivo && !estaPausado) tableroJuego.moverPiezaIzquierda()
    }

    fun moverDerecha() = viewModelScope.launch {
        if (juegoActivo && !estaPausado) tableroJuego.moverPiezaDerecha()
    }

    fun rotar() = viewModelScope.launch {
        if (juegoActivo && !estaPausado) tableroJuego.rotarPieza()
    }

    fun bajar() = viewModelScope.launch {
        if (!juegoActivo || estaPausado) return@launch

        var movido: Boolean
        do {
            movido = tableroJuego.moverPiezaAbajo()
        } while (movido)
    }

    private suspend fun iniciarBucleJuego() {
        while (juegoActivo) {
            if (!estaPausado) {
                val movido = tableroJuego.moverPiezaAbajo()
                if (!movido) {
                    val generacionExitosa = tableroJuego.generarNuevaPieza()
                    if (!generacionExitosa) {
                        finalizarJuego()
                        return
                    }
                }
            }
            delay(if (estaPausado) 100L else tableroJuego.obtenerVelocidadCaida())
        }
    }

    private suspend fun finalizarJuego() {
        juegoActivo = false
        puntajeFinal = tableroJuego.obtenerPuntaje()
        nivelFinal = tableroJuego.obtenerNivel()
        tableroJuego.desactivarJuego()
        _eventos.emit(EventoJuego.FinJuego(puntajeFinal))
    }

    fun actualizarPuntaje(nuevoPuntaje: Int) {
        _puntaje.value = nuevoPuntaje
        val nuevoNivel = (nuevoPuntaje / 5000) + 1
        _nivel.value = nuevoNivel
        tableroJuego.establecerNivel(nuevoNivel)
    }

    fun guardarPuntaje(context: Context, nombre: String) {
        viewModelScope.launch {
            val puntaje = Puntaje(
                nombre,
                puntajeFinal,
                nivelFinal
            )
            PuntajeRepository.insertPuntaje(context, puntaje)
        }
    }

    fun detenerJuego() {
        juegoActivo = false
        tableroJuego.desactivarJuego()
    }

    fun pausarJuego() {
        if (juegoActivo) {
            estaPausado = !estaPausado
        }
    }

    fun reiniciarJuego() {
        estaPausado = false
        juegoActivo = true
        tableroJuego.reiniciar()
        
        viewModelScope.launch {
            val inicioExitoso = tableroJuego.generarNuevaPieza()
            if (!inicioExitoso) {
                finalizarJuego()
                return@launch
            }
            // Solo iniciar bucle si no estaba activo
            // Pero en reiniciarJuego asumimos que la vista puede o no haber terminado.
            // Para simplificar, reiniciarJuego() siempre debería reactivar todo.
        }
    }

    override fun onCleared() {
        super.onCleared()
        detenerJuego()
    }

}
package com.example.practicaanimacion.models

data class EstadoJuego(
    val tableroActual: Array<Array<Square?>>,
    val piezaActual: Pieza?,
    val nivel: Int,
    val activo: Boolean
)

sealed class EventoJuego {
    data class FinJuego(val puntajeFinal: Int) : EventoJuego()
}

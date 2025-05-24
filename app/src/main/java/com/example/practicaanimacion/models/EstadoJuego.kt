package com.example.practicaanimacion.models

// Representa el estado del tablero para la UI
data class EstadoJuego(
    val tableroActual: Array<Array<Square?>>,
    val piezaActual: Pieza?,
    val nivel: Int,
    val activo: Boolean
)

// Eventos que ocurren durante el juego
sealed class EventoJuego {
    data class FinJuego(val puntajeFinal: Int) : EventoJuego()
    // Otros eventos si son necesarios
}

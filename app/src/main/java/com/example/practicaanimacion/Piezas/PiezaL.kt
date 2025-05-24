package com.example.practicaanimacion.Piezas

import com.example.practicaanimacion.models.FabricarPiezas.obtenerColor
import com.example.practicaanimacion.models.Pieza
import com.example.practicaanimacion.models.Square
import com.example.practicaanimacion.models.TableroJuego
import com.example.practicaanimacion.models.TipoPieza

class PiezaL(tableroJuego: TableroJuego) : Pieza(tableroJuego) {
    private var rotacionActual = 0

    init {
        val color = obtenerColor()
        for (i in 0..3) {
            cuadrados.add(Square(0f, 0f, color))
        }
        actualizarPosicionesCuadrados()
    }

    override fun rotar() {
        val nuevaRotacion = (rotacionActual + 1) % 4
        val tempCuadrados = cuadrados.map { Square(it.x, it.y, it.color) }
        val posicionOriginal = Pair(posicionActual.first, posicionActual.second)

        // Intentar rotación normal
        rotacionActual = nuevaRotacion
        actualizarPosicionesCuadrados()

        // Verificar si la rotación normal es posible
        if (!tableroJuego.puedeMoverPieza(this, 0, 0)) {
            // Intentar con desplazamientos (wall kicks)
            val desplazamientos = listOf(
                Pair(1, 0),   // Derecha
                Pair(-1, 0),  // Izquierda
                Pair(0, -1),  // Arriba
                Pair(2, 0),   // 2 a la derecha
                Pair(-2, 0),  // 2 a la izquierda
                Pair(1, 1),   // Diagonal derecha abajo
                Pair(-1, 1),  // Diagonal izquierda abajo
                Pair(0, 2)    // 2 abajo
            )

            var rotacionExitosa = false

            for (offset in desplazamientos) {
                if (tableroJuego.puedeMoverPieza(this, offset.first, offset.second)) {
                    // Actualizar la posición si el desplazamiento funciona
                    posicionActual = Pair(posicionActual.first + offset.first, posicionActual.second + offset.second)
                    actualizarPosicionesCuadrados() // Actualizar posiciones con el nuevo offset
                    rotacionExitosa = true
                    break
                }
            }

            // Si ningún desplazamiento funciona, revertir la rotación
            if (!rotacionExitosa) {
                cuadrados.clear()
                cuadrados.addAll(tempCuadrados)
                posicionActual = posicionOriginal
                rotacionActual = (rotacionActual + 3) % 4
            }
        }

        notifyObservers()
    }

    override fun actualizarPosicionesCuadrados() {
        val centroX = posicionActual.first
        val centroY = posicionActual.second

        when (rotacionActual) {
            0 -> { // Rotación 1: L vertical con extensión a la derecha abajo
                cuadrados[0].x = centroX * Square.ANCHO_CUADRADO
                cuadrados[0].y = centroY * Square.ALTO_CUADRADO
                cuadrados[1].x = centroX * Square.ANCHO_CUADRADO
                cuadrados[1].y = (centroY + 1) * Square.ALTO_CUADRADO
                cuadrados[2].x = centroX * Square.ANCHO_CUADRADO
                cuadrados[2].y = (centroY + 2) * Square.ALTO_CUADRADO
                cuadrados[3].x = (centroX + 1) * Square.ANCHO_CUADRADO
                cuadrados[3].y = (centroY + 2) * Square.ALTO_CUADRADO
            }
            1 -> { // Rotación 2: L horizontal con extensión hacia abajo a la izquierda
                cuadrados[0].x = centroX * Square.ANCHO_CUADRADO
                cuadrados[0].y = centroY * Square.ALTO_CUADRADO
                cuadrados[1].x = (centroX + 1) * Square.ANCHO_CUADRADO
                cuadrados[1].y = centroY * Square.ALTO_CUADRADO
                cuadrados[2].x = (centroX + 2) * Square.ANCHO_CUADRADO
                cuadrados[2].y = centroY * Square.ALTO_CUADRADO
                cuadrados[3].x = centroX * Square.ANCHO_CUADRADO
                cuadrados[3].y = (centroY + 1) * Square.ALTO_CUADRADO
            }
            2 -> { // Rotación 3: L invertida vertical
                cuadrados[0].x = (centroX + 1) * Square.ANCHO_CUADRADO
                cuadrados[0].y = centroY * Square.ALTO_CUADRADO
                cuadrados[1].x = (centroX + 2) * Square.ANCHO_CUADRADO
                cuadrados[1].y = centroY * Square.ALTO_CUADRADO
                cuadrados[2].x = (centroX + 2) * Square.ANCHO_CUADRADO
                cuadrados[2].y = (centroY + 1) * Square.ALTO_CUADRADO
                cuadrados[3].x = (centroX + 2) * Square.ANCHO_CUADRADO
                cuadrados[3].y = (centroY + 2) * Square.ALTO_CUADRADO
            }
            3 -> { // Rotación 4: L horizontal con extensión hacia arriba a la derecha
                cuadrados[0].x = (centroX + 2) * Square.ANCHO_CUADRADO
                cuadrados[0].y = (centroY + 1) * Square.ALTO_CUADRADO
                cuadrados[1].x = centroX * Square.ANCHO_CUADRADO
                cuadrados[1].y = (centroY + 2) * Square.ALTO_CUADRADO
                cuadrados[2].x = (centroX + 1) * Square.ANCHO_CUADRADO
                cuadrados[2].y = (centroY + 2) * Square.ALTO_CUADRADO
                cuadrados[3].x = (centroX + 2) * Square.ANCHO_CUADRADO
                cuadrados[3].y = (centroY + 2) * Square.ALTO_CUADRADO
            }
        }
    }
}
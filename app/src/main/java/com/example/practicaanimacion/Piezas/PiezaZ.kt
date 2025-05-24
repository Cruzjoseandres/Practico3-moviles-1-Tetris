package com.example.practicaanimacion.Piezas


import com.example.practicaanimacion.models.FabricarPiezas.obtenerColor
import com.example.practicaanimacion.models.Pieza
import com.example.practicaanimacion.models.Square
import com.example.practicaanimacion.models.TableroJuego
import com.example.practicaanimacion.models.TipoPieza
import kotlin.collections.get
import kotlin.times

class PiezaZ(tableroJuego: TableroJuego) : Pieza(tableroJuego) {
    private var rotacion = 0

    init {
        val color = obtenerColor()
        for (i in 0..3) {
            cuadrados.add(Square(0f, 0f, color))
        }
        actualizarPosicionesCuadrados()
    }

    override fun rotar() {
        val nuevaRotacion = (rotacion + 1) % 2
        val tempCuadrados = cuadrados.map { Square(it.x, it.y, it.color) }
        val posicionOriginal = Pair(posicionActual.first, posicionActual.second)

        // Intentar rotación normal
        rotacion = nuevaRotacion
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
                Pair(0, 1),   // 1 abajo
                Pair(1, 1),   // Diagonal derecha abajo
                Pair(-1, 1),  // Diagonal izquierda abajo
                Pair(0, 2)    // 2 abajo
            )

            var rotacionExitosa = false

            for (offset in desplazamientos) {
                if (tableroJuego.puedeMoverPieza(this, offset.first, offset.second)) {
                    // Actualizar la posición si el desplazamiento funciona
                    posicionActual = Pair(posicionActual.first + offset.first,
                        posicionActual.second + offset.second)
                    actualizarPosicionesCuadrados()
                    rotacionExitosa = true
                    break
                }
            }

            // Si ningún desplazamiento funciona, revertir la rotación
            if (!rotacionExitosa) {
                cuadrados.clear()
                cuadrados.addAll(tempCuadrados)
                posicionActual = posicionOriginal
                rotacion = (rotacion + 1) % 2
            }
        }

        notifyObservers()
    }

    override fun actualizarPosicionesCuadrados() {
        val centroX = posicionActual.first
        val centroY = posicionActual.second

        if (rotacion == 0) { // Horizontal
            cuadrados[0].x = (centroX - 1) * Square.ANCHO_CUADRADO
            cuadrados[0].y = centroY * Square.ALTO_CUADRADO
            cuadrados[1].x = centroX * Square.ANCHO_CUADRADO
            cuadrados[1].y = centroY * Square.ALTO_CUADRADO
            cuadrados[2].x = centroX * Square.ANCHO_CUADRADO
            cuadrados[2].y = (centroY + 1) * Square.ALTO_CUADRADO
            cuadrados[3].x = (centroX + 1) * Square.ANCHO_CUADRADO
            cuadrados[3].y = (centroY + 1) * Square.ALTO_CUADRADO
        } else { // Vertical
            cuadrados[0].x = (centroX + 1) * Square.ANCHO_CUADRADO
            cuadrados[0].y = centroY * Square.ALTO_CUADRADO
            cuadrados[1].x = (centroX + 1) * Square.ANCHO_CUADRADO
            cuadrados[1].y = (centroY + 1) * Square.ALTO_CUADRADO
            cuadrados[2].x = centroX * Square.ANCHO_CUADRADO
            cuadrados[2].y = (centroY + 1) * Square.ALTO_CUADRADO
            cuadrados[3].x = centroX * Square.ANCHO_CUADRADO
            cuadrados[3].y = (centroY + 2) * Square.ALTO_CUADRADO
        }
    }
}
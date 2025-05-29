package com.example.practicaanimacion.Piezas


import com.example.practicaanimacion.models.FabricarPiezas.obtenerColor
import com.example.practicaanimacion.models.Pieza
import com.example.practicaanimacion.models.Square
import com.example.practicaanimacion.models.TableroJuego

class PiezaJ(tableroJuego: TableroJuego) : Pieza(tableroJuego) {
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


        rotacionActual = nuevaRotacion
        actualizarPosicionesCuadrados()


        if (!tableroJuego.puedeMoverPieza(this, 0, 0)) {

            val desplazamientos = listOf(
                Pair(1, 0),
                Pair(-1, 0),
                Pair(0, -1),
                Pair(2, 0),
                Pair(-2, 0),
                Pair(0, 2)
            )

            var rotacionExitosa = false

            for (offset in desplazamientos) {
                if (tableroJuego.puedeMoverPieza(this, offset.first, offset.second)) {
                    // Actualizar posición si el desplazamiento funciona
                    posicionActual = Pair(posicionActual.first + offset.first,
                        posicionActual.second + offset.second)
                    actualizarPosicionesCuadrados()
                    rotacionExitosa = true
                    break
                }
            }

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
            0 -> {
                cuadrados[0].x = (centroX - 1) * Square.ANCHO_CUADRADO
                cuadrados[0].y = centroY * Square.ALTO_CUADRADO
                cuadrados[1].x = centroX * Square.ANCHO_CUADRADO
                cuadrados[1].y = centroY * Square.ALTO_CUADRADO
                cuadrados[2].x = (centroX + 1) * Square.ANCHO_CUADRADO
                cuadrados[2].y = centroY * Square.ALTO_CUADRADO
                cuadrados[3].x = (centroX + 1) * Square.ANCHO_CUADRADO
                cuadrados[3].y = (centroY + 1) * Square.ALTO_CUADRADO
            }
            1 -> {
                cuadrados[0].x = centroX * Square.ANCHO_CUADRADO
                cuadrados[0].y = (centroY - 1) * Square.ALTO_CUADRADO
                cuadrados[1].x = centroX * Square.ANCHO_CUADRADO
                cuadrados[1].y = centroY * Square.ALTO_CUADRADO
                cuadrados[2].x = centroX * Square.ANCHO_CUADRADO
                cuadrados[2].y = (centroY + 1) * Square.ALTO_CUADRADO
                cuadrados[3].x = (centroX - 1) * Square.ANCHO_CUADRADO
                cuadrados[3].y = (centroY + 1) * Square.ALTO_CUADRADO
            }
            2 -> {
                cuadrados[0].x = (centroX - 1) * Square.ANCHO_CUADRADO
                cuadrados[0].y = (centroY - 1) * Square.ALTO_CUADRADO
                cuadrados[1].x = (centroX - 1) * Square.ANCHO_CUADRADO
                cuadrados[1].y = centroY * Square.ALTO_CUADRADO
                cuadrados[2].x = centroX * Square.ANCHO_CUADRADO
                cuadrados[2].y = centroY * Square.ALTO_CUADRADO
                cuadrados[3].x = (centroX + 1) * Square.ANCHO_CUADRADO
                cuadrados[3].y = centroY * Square.ALTO_CUADRADO
            }
            3 -> {
                cuadrados[0].x = (centroX + 1) * Square.ANCHO_CUADRADO
                cuadrados[0].y = (centroY - 1) * Square.ALTO_CUADRADO
                cuadrados[1].x = centroX * Square.ANCHO_CUADRADO
                cuadrados[1].y = (centroY - 1) * Square.ALTO_CUADRADO
                cuadrados[2].x = centroX * Square.ANCHO_CUADRADO
                cuadrados[2].y = centroY * Square.ALTO_CUADRADO
                cuadrados[3].x = centroX * Square.ANCHO_CUADRADO
                cuadrados[3].y = (centroY + 1) * Square.ALTO_CUADRADO
            }
        }
    }
}
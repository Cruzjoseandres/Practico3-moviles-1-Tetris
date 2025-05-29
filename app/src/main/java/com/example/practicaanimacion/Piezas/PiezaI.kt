package com.example.practicaanimacion.Piezas

import com.example.practicaanimacion.models.FabricarPiezas.obtenerColor
import com.example.practicaanimacion.models.Pieza
import com.example.practicaanimacion.models.Square
import com.example.practicaanimacion.models.TableroJuego

class PiezaI(tableroJuego: TableroJuego) : Pieza(tableroJuego) {
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

        rotacion = nuevaRotacion
        actualizarPosicionesCuadrados()

        if (!tableroJuego.puedeMoverPieza(this, 0, 0)) {
            cuadrados.clear()
            cuadrados.addAll(tempCuadrados)
            rotacion = (rotacion + 1) % 2
        }

        notifyObservers()
    }

    override fun actualizarPosicionesCuadrados() {
        val centroX = posicionActual.first
        val centroY = posicionActual.second

        if (rotacion == 0) {
            cuadrados[0].x = (centroX - 1) * Square.ANCHO_CUADRADO
            cuadrados[0].y = centroY * Square.ALTO_CUADRADO
            cuadrados[1].x = centroX * Square.ANCHO_CUADRADO
            cuadrados[1].y = centroY * Square.ALTO_CUADRADO
            cuadrados[2].x = (centroX + 1) * Square.ANCHO_CUADRADO
            cuadrados[2].y = centroY * Square.ALTO_CUADRADO
            cuadrados[3].x = (centroX + 2) * Square.ANCHO_CUADRADO
            cuadrados[3].y = centroY * Square.ALTO_CUADRADO
        } else {
            cuadrados[0].x = centroX * Square.ANCHO_CUADRADO
            cuadrados[0].y = (centroY - 1) * Square.ALTO_CUADRADO
            cuadrados[1].x = centroX * Square.ANCHO_CUADRADO
            cuadrados[1].y = centroY * Square.ALTO_CUADRADO
            cuadrados[2].x = centroX * Square.ANCHO_CUADRADO
            cuadrados[2].y = (centroY + 1) * Square.ALTO_CUADRADO
            cuadrados[3].x = centroX * Square.ANCHO_CUADRADO
            cuadrados[3].y = (centroY + 2) * Square.ALTO_CUADRADO
        }
    }

}
package com.example.practicaanimacion.Piezas


import com.example.practicaanimacion.models.FabricarPiezas.obtenerColor
import com.example.practicaanimacion.models.Pieza
import com.example.practicaanimacion.models.Square
import com.example.practicaanimacion.models.TableroJuego
import com.example.practicaanimacion.models.TipoPieza


class PiezaO(tableroJuego: TableroJuego) : Pieza(tableroJuego) {
    init {
        val color = obtenerColor()
        for (i in 0..3) {
            cuadrados.add(Square(0f, 0f, color))
        }
        actualizarPosicionesCuadrados()
    }

    override fun rotar() {
        // La pieza O no rota (es un cuadrado)
        notifyObservers()
    }

    override fun actualizarPosicionesCuadrados() {
        val centroX = posicionActual.first
        val centroY = posicionActual.second

        // Forma de cuadrado 2x2
        cuadrados[0].x = centroX * Square.ANCHO_CUADRADO
        cuadrados[0].y = centroY * Square.ALTO_CUADRADO
        cuadrados[1].x = (centroX + 1) * Square.ANCHO_CUADRADO
        cuadrados[1].y = centroY * Square.ALTO_CUADRADO
        cuadrados[2].x = centroX * Square.ANCHO_CUADRADO
        cuadrados[2].y = (centroY + 1) * Square.ALTO_CUADRADO
        cuadrados[3].x = (centroX + 1) * Square.ANCHO_CUADRADO
        cuadrados[3].y = (centroY + 1) * Square.ALTO_CUADRADO
    }
}
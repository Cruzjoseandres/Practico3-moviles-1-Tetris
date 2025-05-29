package com.example.practicaanimacion.models

import android.graphics.Canvas
import android.graphics.Paint
import com.example.practicaanimacion.observer.Observable
import com.example.practicaanimacion.observer.Observer

abstract class Pieza(val tableroJuego: TableroJuego) : Observable {
    protected var cuadrados = mutableListOf<Square>()
    private val observadores = mutableListOf<Observer>()
    var posicionActual = Pair(4, 0)

    abstract fun rotar()

    fun moverIzquierda() {
        if (puedeMover(-1, 0)) {
            posicionActual = Pair(posicionActual.first - 1, posicionActual.second)
            cuadrados.forEach { it.animate(Direction.LEFT) }
            notifyObservers()
        }
    }

    fun moverDerecha() {
        if (puedeMover(1, 0)) {
            posicionActual = Pair(posicionActual.first + 1, posicionActual.second)
            cuadrados.forEach { it.animate(Direction.RIGHT) } // Cambiado de LEFT a RIGHT
            notifyObservers()
        }
    }

    fun moverAbajo(): Boolean {
        if (puedeMover(0, 1)) {
            posicionActual = Pair(posicionActual.first, posicionActual.second + 1)
            cuadrados.forEach { it.animate(Direction.DOWN) }
            notifyObservers()
            return true
        }
        return false
    }

    private fun puedeMover(dx: Int, dy: Int): Boolean {
        return tableroJuego.puedeMoverPieza(this, dx, dy)
    }

    protected abstract fun actualizarPosicionesCuadrados()

    fun obtenerCuadrados(): List<Square> = cuadrados

    fun dibujar(canvas: Canvas, paint: Paint) {
        cuadrados.forEach { it.draw(canvas, paint) }
    }

    override fun addObserver(observer: Observer) {
        observadores.add(observer)
    }

    override fun notifyObservers() {
        observadores.forEach { it.update() }
    }

}
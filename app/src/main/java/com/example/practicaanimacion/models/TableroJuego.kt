package com.example.practicaanimacion.models

import com.example.practicaanimacion.observer.Observable
import com.example.practicaanimacion.observer.Observer
import kotlin.math.pow

class TableroJuego(private val ancho: Int = 10, private val alto: Int = 20) : Observable {
    private val tablero = Array(alto) { Array(ancho) { null as Square? } }
    private val observadores = mutableListOf<Observer>()
    private var piezaActual: Pieza? = null
    private var puntaje = 0
    private var nivel = 1
    private var velocidadCaida = 1000L
    private var juegoActivo = true


    fun generarNuevaPieza(): Boolean {
        piezaActual = FabricarPiezas.crearPiezaAleatoria(this)
        return !verificarColision(piezaActual!!, 0, 0)
    }

    fun moverPiezaIzquierda(): Boolean {
        if (piezaActual != null && puedeMoverPieza(piezaActual!!, -1, 0)) {
            piezaActual?.moverIzquierda()
            notifyObservers()
            return true
        }
        return false
    }

    fun moverPiezaDerecha(): Boolean {
        if (piezaActual != null && puedeMoverPieza(piezaActual!!, 1, 0)) {
            piezaActual?.moverDerecha()
            notifyObservers()
            return true
        }
        return false
    }

    fun moverPiezaAbajo(): Boolean {
        if (piezaActual != null && puedeMoverPieza(piezaActual!!, 0, 1)) {
            piezaActual?.moverAbajo()
            notifyObservers()
            return true
        } else if (piezaActual != null) {
            fijarPieza()
            return false
        }
        return false
    }

    fun rotarPieza(): Boolean {
        piezaActual?.rotar()
        notifyObservers()
        return true
    }

    fun puedeMoverPieza(pieza: Pieza, dx: Int, dy: Int): Boolean {
        val cuadrados = pieza.obtenerCuadrados()

        for (cuadrado in cuadrados) {
            val x = (cuadrado.x / Square.ANCHO_CUADRADO).toInt() + dx
            val y = (cuadrado.y / Square.ALTO_CUADRADO).toInt() + dy

            if (x < 0 || x >= ancho || y < 0 || y >= alto) {
                return false
            }

            if (y >= 0 && tablero[y][x] != null) {
                return false
            }
        }

        return true
    }


    private fun verificarColision(pieza: Pieza, dx: Int, dy: Int): Boolean {
        val cuadrados = pieza.obtenerCuadrados()

        for (cuadrado in cuadrados) {
            val x = (cuadrado.x / Square.ANCHO_CUADRADO).toInt() + dx
            val y = (cuadrado.y / Square.ALTO_CUADRADO).toInt() + dy


            if (x < 0 || x >= ancho || y >= alto || (y >= 0 && tablero[y][x] != null)) {
                return true
            }
        }

        return false
    }

   private fun fijarPieza() {
       piezaActual?.let { pieza ->
           val cuadrados = pieza.obtenerCuadrados()
           for (cuadrado in cuadrados) {
               val x = (cuadrado.x / Square.ANCHO_CUADRADO).toInt()
               val y = (cuadrado.y / Square.ALTO_CUADRADO).toInt()
               if (y >= 0 && y < alto && x >= 0 && x < ancho) {
                   tablero[y][x] = Square(
                       x * Square.ANCHO_CUADRADO,
                       y * Square.ALTO_CUADRADO,
                       cuadrado.color
                   )
               }
           }
           val lineasEliminadas = eliminarLineasCompletas()
           actualizarPuntuacion(lineasEliminadas)
       }
       piezaActual = null
       notifyObservers()
   }


    private fun eliminarLineasCompletas(): Int {
        val filasCompletas = mutableListOf<Int>()

        for (y in alto - 1 downTo 0) {
            if (tablero[y].all { it != null }) {
                filasCompletas.add(y)
            }
        }
        if (filasCompletas.isEmpty()) return 0

        val nuevoTablero = Array(alto) { Array<Square?>(ancho) { null } }
        var nuevaFila = alto - 1

        for (y in alto - 1 downTo 0) {
            if (y !in filasCompletas) {
                for (x in 0 until ancho) {
                    nuevoTablero[nuevaFila][x] = tablero[y][x]
                    nuevoTablero[nuevaFila][x]?.y = nuevaFila * Square.ALTO_CUADRADO
                }
                nuevaFila--
            }
        }

        for (y in 0 until alto) {
            for (x in 0 until ancho) {
                tablero[y][x] = nuevoTablero[y][x]
            }
        }
        notifyObservers()
        return filasCompletas.size
    }




    private fun actualizarPuntuacion(lineasEliminadas: Int) {
        if (lineasEliminadas == 0) return

        puntaje += (100 * 2.0.pow(lineasEliminadas - 1).toInt()) * (nivel*2)

        nivel = (puntaje / 5000) + 1

        velocidadCaida = maxOf(1000L - (nivel - 1) * 200L, 100L)

        notifyObservers()
    }


    fun obtenerTablero(): Array<Array<Square?>> {
        return tablero.map { it.clone() }.toTypedArray()
    }

    fun obtenerPiezaActual(): Pieza? = piezaActual

    fun obtenerPuntaje(): Int = puntaje

    fun obtenerNivel(): Int = nivel

    fun obtenerVelocidadCaida(): Long = velocidadCaida

    fun desactivarJuego() {
        juegoActivo = false
    }

    override fun addObserver(observer: Observer) {
        observadores.add(observer)
    }

    override fun notifyObservers() {
        observadores.forEach { it.update() }
    }

    fun establecerNivel(nivel: Int) {
        this.nivel = nivel
    }
}
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
    private var velocidadCaida = 1000L // milisegundos
    private var juegoActivo = true

    // Método para generar una nueva pieza
    fun generarNuevaPieza(): Boolean {
        piezaActual = FabricarPiezas.crearPiezaAleatoria(this)
        return !verificarColision(piezaActual!!, 0, 0)
    }

    // Métodos de movimiento de pieza
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

    // Verificar si una pieza puede moverse
    fun puedeMoverPieza(pieza: Pieza, dx: Int, dy: Int): Boolean {
        val cuadrados = pieza.obtenerCuadrados()

        for (cuadrado in cuadrados) {
            val x = (cuadrado.x / Square.ANCHO_CUADRADO).toInt() + dx
            val y = (cuadrado.y / Square.ALTO_CUADRADO).toInt() + dy

            // Verificar límites del tablero
            if (x < 0 || x >= ancho || y < 0 || y >= alto) {
                return false
            }

            // Verificar colisión con otras piezas
            if (y >= 0 && tablero[y][x] != null) {
                return false
            }
        }

        return true
    }

    // Verificar colisión en la posición actual
    private fun verificarColision(pieza: Pieza, dx: Int, dy: Int): Boolean {
        val cuadrados = pieza.obtenerCuadrados()

        for (cuadrado in cuadrados) {
            val x = (cuadrado.x / Square.ANCHO_CUADRADO).toInt() + dx
            val y = (cuadrado.y / Square.ALTO_CUADRADO).toInt() + dy

            // Verificar límites o colisiones con piezas fijas
            if (x < 0 || x >= ancho || y >= alto || (y >= 0 && tablero[y][x] != null)) {
                return true
            }
        }

        return false
    }

    // Fijar la pieza actual en el tablero
    private fun fijarPieza() {
        piezaActual?.let { pieza ->
            val cuadrados = pieza.obtenerCuadrados()

            // Agregar los cuadrados de la pieza al tablero
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

            // Buscar líneas completas y actualizar puntuación
            val lineasEliminadas = eliminarLineasCompletas()
            actualizarPuntuacion(lineasEliminadas)
        }

        notifyObservers()
    }

   /* // Eliminar líneas completas y desplazar el tablero
    private fun eliminarLineasCompletass(): Int {
        var lineasEliminadas = 0

        // Cambiamos el bucle for por un while para poder controlar la variable y
        var y = alto - 1
        while (y >= 0) {
            var lineaCompleta = true

            // Verificar si la línea está completa
            for (x in 0 until ancho) {
                if (tablero[y][x] == null) {
                    lineaCompleta = false
                    break
                }
            }

            if (lineaCompleta) {
                lineasEliminadas++

                // Desplazar todas las líneas superiores hacia abajo
                for (y2 in y downTo 1) {
                    for (x in 0 until ancho) {
                        tablero[y2][x] = tablero[y2 - 1][x]
                        tablero[y2][x]?.let {
                            it.y = y2 * Square.ALTO_CUADRADO
                        }
                    }
                }

                // Limpiar la línea superior
                for (x in 0 until ancho) {
                    tablero[0][x] = null
                }
                // No decrementar y para revisar la misma posición nuevamente
            } else {
                // Solo decrementamos y si la línea no estaba completa
                y--
            }
        }

        return lineasEliminadas
    }*/
    /**
     * Elimina todas las líneas completas y desplaza correctamente los bloques superiores.
     * @return Número de líneas eliminadas
     */
    private fun eliminarLineasCompletas(): Int {
        val filasCompletas = mutableListOf<Int>()

        // 1. Identificar todas las filas completas
        for (y in alto - 1 downTo 0) {
            var filaCompleta = true
            for (x in 0 until ancho) {
                if (tablero[y][x] == null) {
                    filaCompleta = false
                    break
                }
            }
            if (filaCompleta) {
                filasCompletas.add(y)
            }
        }

        // Si no hay filas completas, retornar 0
        if (filasCompletas.isEmpty()) return 0

        // 2. Eliminar todas las filas completas y contar los puntos
        for (fila in filasCompletas) {
            for (x in 0 until ancho) {
                tablero[fila][x] = null
            }
        }

        // 3. Crear un nuevo tablero temporal para el desplazamiento
        val nuevoTablero = Array(alto) { Array<Square?>(ancho) { null } }

        // 4. Copiar las filas no eliminadas al nuevo tablero (desde abajo hacia arriba)
        var nuevaFila = alto - 1
        for (y in alto - 1 downTo 0) {
            if (y !in filasCompletas) {
                // Copiar toda la fila al nuevo tablero
                for (x in 0 until ancho) {
                    nuevoTablero[nuevaFila][x] = tablero[y][x]
                    // Actualizar la posición Y del cuadrado si existe
                    nuevoTablero[nuevaFila][x]?.y = nuevaFila * Square.ALTO_CUADRADO
                }
                nuevaFila--
            }
        }

        // 5. Reemplazar el tablero original con el nuevo tablero
        for (y in 0 until alto) {
            for (x in 0 until ancho) {
                tablero[y][x] = nuevoTablero[y][x]
            }
        }

        // Notificar cambios y retornar el número de líneas eliminadas
        notifyObservers()
        return filasCompletas.size
    }

    /**
     * Mueve un bloque hacia abajo hasta que encuentre otro bloque o llegue al fondo
     */
    private fun moverBloqueHaciaAbajo(x: Int, y: Int) {
        if (y >= alto - 1 || tablero[y][x] == null) return

        var yActual = y
        // Mientras haya espacio debajo y el espacio actual no esté vacío
        while (yActual < alto - 1 && tablero[yActual][x] != null && tablero[yActual + 1][x] == null) {
            // Mover el bloque una posición hacia abajo
            tablero[yActual + 1][x] = tablero[yActual][x]
            tablero[yActual][x] = null
            // Actualizar la posición del bloque en el objeto Square
            tablero[yActual + 1][x]?.let { square ->
                square.y = (yActual + 1) * Square.ALTO_CUADRADO
            }
            yActual++
        }
    }

    // Actualizar puntuación basada en líneas eliminadas
    private fun actualizarPuntuacion(lineasEliminadas: Int) {
        if (lineasEliminadas == 0) return

        // Fórmula de puntuación: 100 * 2^(líneas - 1) * nivel
        puntaje += (100 * 2.0.pow(lineasEliminadas - 1).toInt()) * nivel

        // Actualizar nivel según puntuación
        nivel = (puntaje / 1000) + 1

        // Actualizar velocidad de caída basada en nivel
        velocidadCaida = maxOf(1000L - (nivel - 1) * 100L, 100L)

        notifyObservers()
    }

    // Métodos para acceder al estado del juego
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

    // Implementación de Observable
    override fun addObserver(observer: Observer) {
        observadores.add(observer)
    }

    override fun notifyObservers() {
        observadores.forEach { it.update() }
    }
}
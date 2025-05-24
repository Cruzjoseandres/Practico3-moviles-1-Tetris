package com.example.practicaanimacion.models


import android.graphics.Canvas
import android.graphics.Paint
import com.example.practicaanimacion.observer.Observable
import com.example.practicaanimacion.observer.Observer


class Square(var x: Float, var y: Float, var color: Int) : Observable {
    private var observer: Observer? = null
    private var direction: Direction = Direction.NONE
    private var isMoving: Boolean = false
    var screenHeight: Int = 0
    var screenWidth: Int = 0

    fun draw(canvas: Canvas, paint: Paint) {
        val originalColor = paint.color
        paint.color = color
        canvas.drawRect(x, y, x + ANCHO_CUADRADO, y + ALTO_CUADRADO, paint)
        paint.color = originalColor
    }

    private fun changeDirection(direction: Direction) {
        this.isMoving = true
        this.direction = direction
    }


    private fun move() {
        when (direction) {
            Direction.UP -> {
                if (y < 0) {
                    isMoving = false
                    return
                }
                y -= ANIMATION_SPEED
            }

            Direction.DOWN -> {
                if (y + ALTO_CUADRADO > screenHeight) {
                    isMoving = false
                    return
                }
                y += ANIMATION_SPEED
            }

            Direction.LEFT -> {
                if (x < 0) {
                    isMoving = false
                    return
                }
                x -= ANIMATION_SPEED
            }

            Direction.RIGHT -> {
                if (x + ANCHO_CUADRADO > screenWidth) {
                    isMoving = false
                    return
                }
                x += ANIMATION_SPEED
            }

            Direction.NONE -> {}
        }
    }

    fun changeScreenSize(width: Int, height: Int) {
        this.screenWidth = width
        this.screenHeight = height
    }



    fun animate(direction: Direction) {
        // Calcular la posición final exacta (sin animación gradual)
        when (direction) {
            Direction.UP -> y -= ALTO_CUADRADO
            Direction.DOWN -> y += ALTO_CUADRADO
            Direction.LEFT -> x -= ANCHO_CUADRADO
            Direction.RIGHT -> x += ANCHO_CUADRADO
            Direction.NONE -> {}
        }

        // Notificar solo una vez al terminar el movimiento
        notifyObservers()
    }

    override fun addObserver(observer: Observer) {
        this.observer = observer
    }

    override fun notifyObservers() {
        this.observer?.update()
    }

    companion object {
        const val ANCHO_CUADRADO = 100f
        const val ALTO_CUADRADO = 100f
        const val MOVEMENT_SPEED = 10f
        const val ANIMATION_SPEED = 50L
    }
}
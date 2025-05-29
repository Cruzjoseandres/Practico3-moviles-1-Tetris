package com.example.practicaanimacion.models


import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import com.example.practicaanimacion.observer.Observable
import com.example.practicaanimacion.observer.Observer


class Square(var x: Float, var y: Float, var color: Int) : Observable {
    private var observer: Observer? = null

    fun draw(canvas: Canvas, paint: Paint) {

        paint.style = Paint.Style.FILL
        paint.color = this.color
        canvas.drawRect(x, y, x + ANCHO_CUADRADO, y + ALTO_CUADRADO, paint)


        paint.style = Paint.Style.STROKE
        paint.color = Color.BLACK
        paint.strokeWidth = 4f
        canvas.drawRect(x, y, x + ANCHO_CUADRADO, y + ALTO_CUADRADO, paint)
    }



    fun animate(direction: Direction) {
        when (direction) {
            Direction.UP -> y -= ALTO_CUADRADO
            Direction.DOWN -> y += ALTO_CUADRADO
            Direction.LEFT -> x -= ANCHO_CUADRADO
            Direction.RIGHT -> x += ANCHO_CUADRADO
            Direction.NONE -> {}
        }
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
    }
}
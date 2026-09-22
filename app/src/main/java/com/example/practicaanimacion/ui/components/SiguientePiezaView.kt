package com.example.practicaanimacion.ui.components

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.util.AttributeSet
import android.view.View
import com.example.practicaanimacion.models.Pieza
import com.example.practicaanimacion.models.Square

class SiguientePiezaView(context: Context?, attrs: AttributeSet?) : View(context, attrs) {
    private var pieza: Pieza? = null
    private val pincel = Paint().apply {
        isAntiAlias = true
        style = Paint.Style.FILL
        color = Color.BLACK
    }

    fun actualizarPieza(nuevaPieza: Pieza?) {
        this.pieza = nuevaPieza
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        pieza?.let { p ->
            var minX = Float.MAX_VALUE
            var maxX = Float.MIN_VALUE
            var minY = Float.MAX_VALUE
            var maxY = Float.MIN_VALUE

            for (square in p.obtenerCuadrados()) {
                if (square.x < minX) minX = square.x
                if (square.x + Square.ANCHO_CUADRADO > maxX) maxX = square.x + Square.ANCHO_CUADRADO
                if (square.y < minY) minY = square.y
                if (square.y + Square.ALTO_CUADRADO > maxY) maxY = square.y + Square.ALTO_CUADRADO
            }

            val pieceWidth = maxX - minX
            val pieceHeight = maxY - minY

            val scaleX = width.toFloat() / maxOf(pieceWidth, 1f)
            val scaleY = height.toFloat() / maxOf(pieceHeight, 1f)
            val scale = minOf(scaleX, scaleY) * 0.8f 

            val scaledWidth = pieceWidth * scale
            val scaledHeight = pieceHeight * scale

            canvas.save()
            canvas.translate((width - scaledWidth) / 2f, (height - scaledHeight) / 2f)
            canvas.scale(scale, scale)
            canvas.translate(-minX, -minY)

            p.dibujar(canvas, pincel)
            canvas.restore()
        }
    }
}

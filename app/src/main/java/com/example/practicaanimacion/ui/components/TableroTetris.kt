package com.example.practicaanimacion.ui.components

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.util.AttributeSet
import android.view.View
import com.example.practicaanimacion.models.EstadoJuego
import com.example.practicaanimacion.models.Square

class TableroTetris(context: Context?, attrs: AttributeSet?) : View(context, attrs) {

    private var estadoActual: EstadoJuego? = null
    private val anchoTablero = 10
    private val altoTablero = 20
    private val tamanioCelda = 100f

    private val pincel = Paint().apply {
        isAntiAlias = true
        style = Paint.Style.FILL
        color = Color.BLACK
    }

    private val pincelCuadricula = Paint().apply {
        color = Color.DKGRAY
        style = Paint.Style.STROKE
        strokeWidth = 1f
    }

    private val pincelFantasma = Paint().apply {
        isAntiAlias = true
        style = Paint.Style.STROKE
        strokeWidth = 5f
        color = Color.argb(128, 255, 255, 255)
    }


    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        invalidate()
    }

    fun actualizarEstado(estado: EstadoJuego) {
        this.estadoActual = estado
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)

        val scaleX = width.toFloat() / (anchoTablero * tamanioCelda)
        val scaleY = height.toFloat() / (altoTablero * tamanioCelda)
        val scale = minOf(scaleX, scaleY)

        val boardWidth = anchoTablero * tamanioCelda * scale
        val boardHeight = altoTablero * tamanioCelda * scale

        canvas.save()
        canvas.translate((width - boardWidth) / 2f, (height - boardHeight) / 2f)
        canvas.scale(scale, scale)

        dibujarCuadricula(canvas)

        estadoActual?.let { estado ->

            dibujarTablero(canvas, estado.tableroActual)

            estado.sombraPieza?.forEach { square ->
                // Guardar el color original para configurarlo semitransparente
                pincelFantasma.color = Color.argb(80, Color.red(square.color), Color.green(square.color), Color.blue(square.color))
                // Dibujar el interior
                pincelFantasma.style = Paint.Style.FILL
                canvas.drawRect(square.x, square.y, square.x + Square.ANCHO_CUADRADO, square.y + Square.ALTO_CUADRADO, pincelFantasma)
                // Dibujar el borde
                pincelFantasma.style = Paint.Style.STROKE
                pincelFantasma.color = Color.argb(180, Color.red(square.color), Color.green(square.color), Color.blue(square.color))
                canvas.drawRect(square.x, square.y, square.x + Square.ANCHO_CUADRADO, square.y + Square.ALTO_CUADRADO, pincelFantasma)
            }

            estado.piezaActual?.let { pieza ->
                pieza.dibujar(canvas, pincel)
            }
        }
        
        canvas.restore()
    }

    private fun dibujarTablero(canvas: Canvas, tableroActual: Array<Array<Square?>>) {
        for (y in tableroActual.indices) {
            for (x in tableroActual[y].indices) {
                tableroActual[y][x]?.draw(canvas, pincel)
            }
        }
    }

    private fun dibujarCuadricula(canvas: Canvas) {
        for (y in 0..altoTablero) {
            canvas.drawLine(
                0f,
                y * tamanioCelda,
                anchoTablero * tamanioCelda,
                y * tamanioCelda,
                pincelCuadricula
            )
        }
        for (x in 0..anchoTablero) {
            canvas.drawLine(
                x * tamanioCelda,
                0f,
                x * tamanioCelda,
                altoTablero * tamanioCelda,
                pincelCuadricula
            )
        }
    }


}
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

        canvas.drawColor(Color.LTGRAY)

        dibujarCuadricula(canvas)

        estadoActual?.let { estado ->

            dibujarTablero(canvas, estado.tableroActual)

            estado.piezaActual?.let { pieza ->
                pieza.dibujar(canvas, pincel)
            }
        }
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
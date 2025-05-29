package com.example.practicaanimacion.models

import android.graphics.Color
import com.example.practicaanimacion.Piezas.PiezaI
import com.example.practicaanimacion.Piezas.PiezaJ
import com.example.practicaanimacion.Piezas.PiezaL
import com.example.practicaanimacion.Piezas.PiezaO
import com.example.practicaanimacion.Piezas.PiezaS
import com.example.practicaanimacion.Piezas.PiezaT
import com.example.practicaanimacion.Piezas.PiezaZ


object FabricarPiezas {

    fun crearPiezaAleatoria(tableroJuego: TableroJuego): Pieza {
        return when ((0..6).random()) {
            0 -> PiezaI(tableroJuego)
            1 -> PiezaJ(tableroJuego)
            2 -> PiezaL(tableroJuego)
            3 -> PiezaO(tableroJuego)
            4 -> PiezaS(tableroJuego)
            5 -> PiezaT(tableroJuego)
            else -> PiezaZ(tableroJuego)
        }
    }

    fun obtenerColor(): Int {
        val coloresBrillantes = listOf(
            Color.rgb(255, 0, 0),
            Color.rgb(0, 255, 0),
            Color.rgb(0, 0, 255),
            Color.rgb(255, 255, 0),
            Color.rgb(255, 0, 255),
            Color.rgb(0, 255, 255),
            Color.rgb(255, 165, 0),
            Color.rgb(128, 0, 128),
            Color.rgb(0, 128, 128),
            Color.rgb(255, 105, 180)
        )

        return coloresBrillantes.random()
    }
}
















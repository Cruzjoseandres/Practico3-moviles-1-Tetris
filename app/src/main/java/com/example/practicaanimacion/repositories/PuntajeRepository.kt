package com.example.practicaanimacion.repositories

import android.content.Context
import com.example.practicaanimacion.db.AppDatabase
import com.example.practicaanimacion.db.models.Puntaje

object PuntajeRepository {

    suspend fun insertPuntaje(context: Context,puntaje: Puntaje): Long {
        return AppDatabase.getInstance(context).puntajeDao().insertPuntaje(puntaje)
    }
}
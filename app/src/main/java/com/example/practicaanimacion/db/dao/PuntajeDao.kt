package com.example.practicaanimacion.db.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Update
import com.example.practicaanimacion.db.models.Puntaje

@Dao
interface PuntajeDao {
    @Query("SELECT * FROM puntaje ORDER BY puntaje DESC LIMIT 10")
    suspend fun getAllPuntajes(): List<Puntaje>

    @Insert
    suspend fun insertPuntaje(puntaje: Puntaje): Long

    @Delete
    suspend fun deletePuntaje(puntaje: Puntaje)

    @Update
    suspend fun updatePuntaje(puntaje: Puntaje)


}
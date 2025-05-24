package com.example.practicaanimacion.db.models

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.io.Serializable

@Entity
data class Puntaje(
    var nombre : String,
    var puntaje : Int
): Serializable {
    @PrimaryKey(autoGenerate = true)
    var id: Int = 0
}

package com.example.practicaanimacion.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.example.practicaanimacion.db.dao.PuntajeDao
import com.example.practicaanimacion.db.migration.Migration1to2
import com.example.practicaanimacion.db.models.Puntaje


@Database(
    entities = [Puntaje::class],
    version = 2,
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun puntajeDao(): PuntajeDao

    companion object {
        fun getInstance(context: Context): AppDatabase {
            return Room.databaseBuilder(
                context,
                AppDatabase::class.java,
                "TetrisDB"
            ).addMigrations(
                Migration1to2()
            ).build()
        }
    }

}
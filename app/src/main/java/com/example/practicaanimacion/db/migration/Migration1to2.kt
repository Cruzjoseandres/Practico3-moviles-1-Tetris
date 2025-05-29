package com.example.practicaanimacion.db.migration

import androidx.room.migration.Migration

class Migration1to2: Migration(1,2) {
    override fun migrate(database: androidx.sqlite.db.SupportSQLiteDatabase) {
        database.execSQL("ALTER TABLE Puntaje ADD COLUMN nivel INTEGER NOT NULL DEFAULT 1")
    }
}
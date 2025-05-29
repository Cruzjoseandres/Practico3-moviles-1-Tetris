package com.example.practicaanimacion.ui.activities

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.example.practicaanimacion.R
import com.example.practicaanimacion.databinding.ActivityMenuPrincipalBinding
import com.google.android.material.dialog.MaterialAlertDialogBuilder

class MenuPrincipal : AppCompatActivity() {
    private lateinit var binding: ActivityMenuPrincipalBinding
    private lateinit var btnIniciarJuego: Button
    private lateinit var btnScore: Button
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivityMenuPrincipalBinding.inflate(layoutInflater)
        setContentView(binding.root)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
        btnIniciarJuego = binding.btnIniciarJuego
        btnScore = binding.btnScore
        setupEventListeners()

    }

    private fun setupEventListeners() {
        btnIniciarJuego.setOnClickListener {
            val intent = MainActivity.newIntent(this)
            startActivity(intent)
        }
        btnScore.setOnClickListener {
            val intent = PuntajeList.newIntent(this)
            startActivity(intent)
        }
    }
    override fun onBackPressed() {
        MaterialAlertDialogBuilder(this)
            .setTitle("Salir")
            .setMessage("¿Estás seguro de que quieres salir del juego?")
            .setPositiveButton("Sí") { _, _ ->
                super.onBackPressed()
                finishAffinity()
            }
            .setNegativeButton("No", null)
            .show()

    }



    companion object {
        fun newIntent(context: Context) : Intent {
            return Intent(context, MenuPrincipal::class.java)
        }
    }
}
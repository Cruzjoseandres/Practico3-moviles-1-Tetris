package com.example.practicaanimacion.ui.activities

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.MotionEvent
import android.widget.EditText
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.practicaanimacion.databinding.ActivityMainBinding
import com.example.practicaanimacion.models.EventoJuego
import com.example.practicaanimacion.viewmodels.TetrisViewModel
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private val viewModel: TetrisViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupEventListeners()
        setupObservers()

        // Iniciar el juego automáticamente
        viewModel.iniciarJuego()
    }

    private fun setupObservers() {
        // Observar estado del juego
        viewModel.estadoJuego.observe(this) { estado ->
            binding.tableroTetris.actualizarEstado(estado)
        }

        // Observar puntuación
        viewModel.puntaje.observe(this) { puntaje ->
            binding.txtPuntaje.text = "Puntaje: $puntaje"
        }

        // Observar eventos (fin de juego, etc)
        lifecycleScope.launch {
            viewModel.eventos.collect { evento ->
                when (evento) {
                    is EventoJuego.FinJuego -> mostrarDialogoFinJuego(evento.puntajeFinal)
                }
            }
        }
    }

    @SuppressLint("ClickableViewAccessibility")
    private fun setupEventListeners() {
        // Configurar botones
        binding.btnRotar.setOnClickListener { viewModel.rotar() }
        binding.btnBajar.setOnClickListener { viewModel.bajar() }

        // Configurar gestos en el tablero
        binding.tableroTetris.setOnTouchListener { _, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    val x = event.x
                    val mitadPantalla = binding.tableroTetris.width / 2

                    if (x < mitadPantalla) viewModel.moverIzquierda()
                    else viewModel.moverDerecha()

                    true
                }
                else -> false
            }
        }
    }

    private fun mostrarDialogoFinJuego(puntajeFinal: Int) {
        val nombreEditText = EditText(this)
        nombreEditText.hint = "Ingresa tu nombre"

        MaterialAlertDialogBuilder(this)
            .setTitle("Juego Terminado")
            .setMessage("Tu puntaje final es: $puntajeFinal")
            .setView(nombreEditText)
            .setPositiveButton("Guardar") { _, _ ->
                val nombre = nombreEditText.text.toString().ifEmpty { "Anónimo" }
                viewModel.guardarPuntaje(this, nombre)
            }
            .setNegativeButton("Cancelar", null)
            .setCancelable(false)
            .show()
    }

    override fun onDestroy() {
        super.onDestroy()
        // Detener el juego cuando se destruye la actividad
        viewModel.detenerJuego()
    }
}
package com.example.practicaanimacion.ui.activities

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
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

        viewModel.iniciarJuego()
    }

    private fun setupObservers() {

        viewModel.estadoJuego.observe(this) { estado ->
            binding.tableroTetris.actualizarEstado(estado)
        }


        viewModel.puntaje.observe(this) { puntaje ->
            binding.txtPuntaje.text = "Puntaje: $puntaje"

        }

        viewModel.nivel.observe(this) { nivel ->
            binding.txtlevel.text = "Nivel: $nivel"

        }


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
        binding.btnRotar.setOnClickListener { viewModel.rotar() }
        binding.btnBajar.setOnClickListener { viewModel.bajar() }

        binding.tableroTetris.setOnTouchListener { _, event ->
            if (event.action == MotionEvent.ACTION_DOWN) {
                val mitad = binding.tableroTetris.width / 2
                if (event.x < mitad) viewModel.moverIzquierda()
                if (event.x >= mitad) viewModel.moverDerecha()
                true
            }
            else false
        }
    }

    override fun onBackPressed() {
        MaterialAlertDialogBuilder(this)
            .setTitle("Salir")
            .setMessage("¿Estás seguro de que quieres salir del juego?")
            .setPositiveButton("Sí") { _, _ ->
                super.onBackPressed()
            }
            .setNegativeButton("No", null)
            .show()

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
                val intent = PuntajeList.newIntent(this)
                startActivity(intent)
            }
            .setNegativeButton("Cancelar", null)
            .setCancelable(false)
            .show()
    }

    override fun onDestroy() {
        super.onDestroy()
        viewModel.detenerJuego()
    }


    companion object {
        fun newIntent(context: Context): Intent {
            return Intent(context, MainActivity::class.java)
        }


    }
}
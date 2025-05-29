package com.example.practicaanimacion.ui.activities

import android.os.Bundle
import android.widget.VideoView
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import com.example.practicaanimacion.R
import com.example.practicaanimacion.databinding.ActivityInicioBinding
import kotlinx.coroutines.delay

class InicioActivity : AppCompatActivity() {
    private lateinit var binding: ActivityInicioBinding
    private lateinit var intro: VideoView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivityInicioBinding.inflate(layoutInflater)
        setContentView(binding.root)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
        intro = binding.intro

        val videoUri = "android.resource://${packageName}/${R.raw.intro_supercell_1080p_60fps}"
        intro.setVideoPath(videoUri)
        intro.start()
        waitXseconds()
    }
    private fun waitXseconds() {
        lifecycleScope.launchWhenCreated {

            delay(2000)
            val menuPrincipal = MenuPrincipal.newIntent(this@InicioActivity)
            startActivity(menuPrincipal)
        }


    }
}
package com.example.practicaanimacion.ui.activities

import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.recyclerview.widget.DividerItemDecoration
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.practicaanimacion.R
import com.example.practicaanimacion.databinding.ActivityPuntajeListBinding
import com.example.practicaanimacion.db.models.Puntaje
import com.example.practicaanimacion.ui.Adapter.PuntajeAdapter
import com.example.practicaanimacion.ui.ViewModels.PuntajeListViewModel

class PuntajeList : AppCompatActivity() {
    private lateinit var  binding : ActivityPuntajeListBinding
    private val viewModel : PuntajeListViewModel by viewModels()
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        binding = ActivityPuntajeListBinding.inflate(layoutInflater)
        setContentView(binding.root)
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main)) { v, insets ->
            val systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom)
            insets
        }
        setupRecyclerView()
        setupViewModelObservers()
        setupEventListeners()
        viewModel.loadPuntajes(this)

    }

    private fun setupEventListeners() {

        binding.btnInicio.setOnClickListener {
            val intent = MainActivity.newIntent(this)
            startActivity(intent)

        }
    }

    private fun setupViewModelObservers() {
        viewModel.puntajes.observe(this) {
            val adapter = binding.rvScore.adapter as PuntajeAdapter
            adapter.setData(it)
        }
    }

    private fun setupRecyclerView() {
        val adapter = PuntajeAdapter(arrayListOf())
        binding.rvScore.apply {
            this.adapter = adapter
            layoutManager = LinearLayoutManager(this@PuntajeList).apply {
                orientation = RecyclerView.VERTICAL
            }
            addItemDecoration(
                DividerItemDecoration(
                    this@PuntajeList,
                    LinearLayoutManager.VERTICAL
                )
            )
        }
    }

    companion object {

        fun newIntent(context: Context): Intent {
            val intent = Intent(context, PuntajeList::class.java)
            return intent
        }
    }
}
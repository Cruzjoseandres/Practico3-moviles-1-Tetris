package com.example.practicaanimacion.ui.Adapter

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.practicaanimacion.databinding.PuntajeitemBinding
import com.example.practicaanimacion.db.models.Puntaje

class PuntajeAdapter(
    var score: ArrayList<Puntaje>
): RecyclerView.Adapter<PuntajeAdapter.ViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup,viewType: Int): ViewHolder {
        val inflater = LayoutInflater.from(parent.context)
        val binding = PuntajeitemBinding.inflate(
            inflater,
            parent,
            false
        )
        return ViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val item = score[position]
        holder.bind(item)
    }

    override fun getItemCount(): Int {
        return score.size
    }

    fun setData(score: ArrayList<Puntaje>) {
        this.score = score
        notifyDataSetChanged()
    }


    class ViewHolder(private val binding: PuntajeitemBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(puntaje: Puntaje) {
            binding.txtnombre.text = puntaje.nombre
            binding.txtPuntaje.text = puntaje.puntaje.toString()
            binding.txtNivel.text = puntaje.nivel.toString()
        }

    }

}
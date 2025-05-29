package com.example.practicaanimacion.ui.ViewModels

import android.content.Context
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.practicaanimacion.db.models.Puntaje
import com.example.practicaanimacion.repositories.PuntajeRepository
import kotlinx.coroutines.launch

class PuntajeListViewModel: ViewModel() {
    private val _puntajes: MutableLiveData<ArrayList<Puntaje>> = MutableLiveData(arrayListOf())
    val puntajes: MutableLiveData<ArrayList<Puntaje>> = _puntajes

    fun loadPuntajes(context: Context) {
     viewModelScope.launch {
         puntajes.postValue(
             PuntajeRepository.getPuntajes(context) as ArrayList<Puntaje>
         )
     }
    }
}
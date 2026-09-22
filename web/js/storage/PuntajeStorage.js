/**
 * Gestor de persistencia de puntuaciones en LocalStorage
 * Replica el comportamiento de PuntajeDao.kt (SELECT * FROM puntaje ORDER BY puntaje DESC LIMIT 10)
 */
const CLAVE_STORAGE = 'tetris_puntuaciones_v1';

export class PuntajeStorage {
    /**
     * Obtiene las 10 mejores puntuaciones ordenadas descendentemente
     */
    static obtenerTopPuntajes(limite = 10) {
        try {
            const data = localStorage.getItem(CLAVE_STORAGE);
            if (!data) return [];
            const lista = JSON.parse(data);
            if (!Array.isArray(lista)) return [];

            return lista
                .sort((a, b) => b.puntaje - a.puntaje)
                .slice(0, limite);
        } catch (error) {
            console.error('Error al leer puntuaciones de localStorage:', error);
            return [];
        }
    }

    /**
     * Guarda un nuevo puntaje
     * @param {string} nombre Nombre del jugador
     * @param {number} puntaje Puntos obtenidos
     * @param {number} nivel Nivel alcanzado
     */
    static guardarPuntaje(nombre, puntaje, nivel) {
        try {
            const nombreLimpio = (nombre || '').trim() || 'Anónimo';
            const lista = PuntajeStorage.obtenerTopPuntajes(50); // Mantenemos historial

            const nuevoItem = {
                id: Date.now(),
                nombre: nombreLimpio,
                puntaje: Number(puntaje) || 0,
                nivel: Number(nivel) || 1,
                fecha: new Date().toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };

            lista.push(nuevoItem);
            lista.sort((a, b) => b.puntaje - a.puntaje);

            localStorage.setItem(CLAVE_STORAGE, JSON.stringify(lista));
            return nuevoItem;
        } catch (error) {
            console.error('Error al guardar puntaje en localStorage:', error);
            return null;
        }
    }

    /**
     * Obtiene el récord histórico más alto
     */
    static obtenerRecordMaximo() {
        const top = PuntajeStorage.obtenerTopPuntajes(1);
        return top.length > 0 ? top[0].puntaje : 0;
    }

    /**
     * Limpia todas las puntuaciones guardadas
     */
    static limpiar() {
        try {
            localStorage.removeItem(CLAVE_STORAGE);
            return true;
        } catch (error) {
            console.error('Error al limpiar localStorage:', error);
            return false;
        }
    }
}

/**
 * Sintetizador de efectos de sonido retro usando Web Audio API
 * No requiere archivos externos y funciona sin latencia.
 */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.habilitado = localStorage.getItem('tetris_sonido_habilitado') !== 'false';
    }

    _initContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    alternarSonido() {
        this.habilitado = !this.habilitado;
        localStorage.setItem('tetris_sonido_habilitado', this.habilitado);
        return this.habilitado;
    }

    estaHabilitado() {
        return this.habilitado;
    }

    _tone(freq, type, duration, gainStart = 0.15, gainEnd = 0.001) {
        if (!this.habilitado) return;
        this._initContext();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            gain.gain.setValueAtTime(gainStart, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(gainEnd, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            // Audio context policy fallback
        }
    }

    playMove() {
        if (!this.habilitado) return;
        this._initContext();
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(280, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.04);

            gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.04);
        } catch (e) {}
    }

    playRotate() {
        if (!this.habilitado) return;
        this._initContext();
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(320, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(520, this.ctx.currentTime + 0.06);

            gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.06);
        } catch (e) {}
    }

    playDrop() {
        if (!this.habilitado) return;
        this._initContext();
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(140, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.1);
        } catch (e) {}
    }

    playLineClear(numLineas = 1) {
        if (!this.habilitado) return;
        this._initContext();
        if (!this.ctx) return;

        const baseFreqs = [440, 554.37, 659.25, 880]; // Acorde A Mayor brillante
        const linesToPlay = Math.min(Math.max(numLineas, 1), 4);

        for (let i = 0; i < linesToPlay; i++) {
            setTimeout(() => {
                this._tone(baseFreqs[i], 'square', 0.18, 0.15);
            }, i * 60);
        }
    }

    playLevelUp() {
        if (!this.habilitado) return;
        this._initContext();
        if (!this.ctx) return;

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this._tone(freq, 'sine', 0.14, 0.2);
            }, index * 70);
        });
    }

    playGameOver() {
        if (!this.habilitado) return;
        this._initContext();
        if (!this.ctx) return;

        const freqs = [350, 310, 270, 200];
        freqs.forEach((freq, index) => {
            setTimeout(() => {
                this._tone(freq, 'sawtooth', 0.25, 0.18);
            }, index * 120);
        });
    }
}

export const SoundEffects = new SoundEngine();

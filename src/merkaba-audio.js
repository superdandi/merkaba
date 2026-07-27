import { MODES } from './merkaba.js';

const CHAKRA_FREQUENCIES = {
  raiz: 396,
  sacro: 417,
  plexo: 528,
  corazon: 639,
  garganta: 741,
  tercera: 852,
  corona: 963
};

export class MerkabaAudio {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.volume = 0.3;
    this.baseFreq = 528;
    this.binauralEnabled = true;
    this.binauralDelta = 4;
    this.mode = MODES.SYNC_OPPOSITE;

    this._topOsc = null;
    this._topGain = null;
    this._bottomOsc = null;
    this._bottomGain = null;
    this._binauralOscL = null;
    this._binauralOscR = null;
    this._binauralGainL = null;
    this._binauralGainR = null;
    this._masterGain = null;
    this._lfo = null;
    this._lfoGain = null;
    this._analyser = null;
  }

  start() {
    if (this.isPlaying) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();

    this._masterGain = this.ctx.createGain();
    this._masterGain.gain.value = this.volume;
    this._masterGain.connect(this.ctx.destination);

    this._analyser = this.ctx.createAnalyser();
    this._analyser.fftSize = 256;
    this._masterGain.connect(this._analyser);

    this._topOsc = this.ctx.createOscillator();
    this._topGain = this.ctx.createGain();
    this._topOsc.type = 'sine';
    this._topOsc.frequency.value = this.baseFreq;
    this._topGain.gain.value = 0.15;
    this._topOsc.connect(this._topGain);
    this._topGain.connect(this._masterGain);
    this._topOsc.start();

    this._bottomOsc = this.ctx.createOscillator();
    this._bottomGain = this.ctx.createGain();
    this._bottomOsc.type = 'sine';
    this._bottomOsc.frequency.value = this.baseFreq;
    this._bottomGain.gain.value = 0.15;
    this._bottomOsc.connect(this._bottomGain);
    this._bottomGain.connect(this._masterGain);
    this._bottomOsc.start();

    this._lfo = this.ctx.createOscillator();
    this._lfoGain = this.ctx.createGain();
    this._lfo.type = 'sine';
    this._lfo.frequency.value = 0.5;
    this._lfoGain.gain.value = 0;
    this._lfo.connect(this._lfoGain);
    this._lfoGain.connect(this._topGain.gain);
    this._lfo.start();

    if (this.binauralEnabled) {
      this._startBinaural();
    }

    this.isPlaying = true;
  }

  stop() {
    if (!this.isPlaying || !this.ctx) return;
    this._topOsc.stop();
    this._bottomOsc.stop();
    this._lfo.stop();
    if (this._binauralOscL) this._binauralOscL.stop();
    if (this._binauralOscR) this._binauralOscR.stop();
    this.ctx.close();
    this.ctx = null;
    this.isPlaying = false;
  }

  _startBinaural() {
    if (!this.ctx) return;
    this._binauralOscL = this.ctx.createOscillator();
    this._binauralOscR = this.ctx.createOscillator();
    this._binauralGainL = this.ctx.createGain();
    this._binauralGainR = this.ctx.createGain();

    const merger = this.ctx.createChannelMerger(2);

    this._binauralOscL.type = 'sine';
    this._binauralOscL.frequency.value = this.baseFreq;
    this._binauralGainL.gain.value = 0.08;

    this._binauralOscR.type = 'sine';
    this._binauralOscR.frequency.value = this.baseFreq + this.binauralDelta;
    this._binauralGainR.gain.value = 0.08;

    this._binauralOscL.connect(this._binauralGainL);
    this._binauralGainL.connect(merger, 0, 0);
    this._binauralOscR.connect(this._binauralGainR);
    this._binauralGainR.connect(merger, 0, 1);
    merger.connect(this._masterGain);

    this._binauralOscL.start();
    this._binauralOscR.start();
  }

  _stopBinaural() {
    if (this._binauralOscL) {
      this._binauralOscL.stop();
      this._binauralOscL = null;
    }
    if (this._binauralOscR) {
      this._binauralOscR.stop();
      this._binauralOscR = null;
    }
  }

  setVolume(v) {
    this.volume = v;
    if (this._masterGain) {
      this._masterGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05);
    }
  }

  setFrequency(hz) {
    this.baseFreq = hz;
    if (this._topOsc) {
      this._topOsc.frequency.setTargetAtTime(hz, this.ctx.currentTime, 0.05);
    }
    if (this._bottomOsc) {
      this._bottomOsc.frequency.setTargetAtTime(hz, this.ctx.currentTime, 0.05);
    }
    if (this._binauralOscL) {
      this._binauralOscL.frequency.setTargetAtTime(hz, this.ctx.currentTime, 0.05);
    }
    if (this._binauralOscR) {
      this._binauralOscR.frequency.setTargetAtTime(hz + this.binauralDelta, this.ctx.currentTime, 0.05);
    }
  }

  setBinauralDelta(hz) {
    this.binauralDelta = hz;
    if (this._binauralOscR) {
      this._binauralOscR.frequency.setTargetAtTime(this.baseFreq + hz, this.ctx.currentTime, 0.05);
    }
  }

  toggleBinaural(enabled) {
    this.binauralEnabled = enabled;
    if (enabled && this.isPlaying) {
      this._startBinaural();
    } else {
      this._stopBinaural();
    }
  }

  setMode(mode) {
    this.mode = mode;
  }

  update(dt, merkaba) {
    if (!this.isPlaying || !this.ctx) return;
    const t = merkaba.t;
    const now = this.ctx.currentTime;

    switch (this.mode) {
      case 'SYNC_SAME':
      case 'SYNC_OPPOSITE':
      case 'TOP_ONLY':
      case 'BOTTOM_ONLY':
        this._topGain.gain.setTargetAtTime(0.15, now, 0.1);
        this._bottomGain.gain.setTargetAtTime(0.15, now, 0.1);
        break;

      case 'SYNC_RATIO':
        this._topGain.gain.setTargetAtTime(0.15, now, 0.1);
        this._bottomGain.gain.setTargetAtTime(0.1, now, 0.1);
        this._bottomOsc.frequency.setTargetAtTime(
          this.baseFreq * merkaba.ratio, now, 0.1
        );
        break;

      case 'INDEPENDENT':
        this._topOsc.frequency.setTargetAtTime(
          this.baseFreq * (merkaba.topSpeed / 0.8), now, 0.1
        );
        this._bottomOsc.frequency.setTargetAtTime(
          this.baseFreq * (merkaba.bottomSpeed / 0.8), now, 0.1
        );
        break;

      case 'PULSE': {
        const envelope = 0.5 + 0.5 * Math.sin(t * merkaba.pulseFreq * Math.PI * 2);
        this._topGain.gain.setTargetAtTime(0.2 * envelope, now, 0.02);
        this._bottomGain.gain.setTargetAtTime(0.2 * envelope, now, 0.02);
        break;
      }

      case 'PENDULUM': {
        const vibrato = Math.sin(t * merkaba.pendulumFreq * Math.PI * 2) * 15;
        this._topOsc.frequency.setTargetAtTime(this.baseFreq + vibrato, now, 0.02);
        this._bottomOsc.frequency.setTargetAtTime(this.baseFreq - vibrato, now, 0.02);
        this._topGain.gain.setTargetAtTime(0.15, now, 0.1);
        this._bottomGain.gain.setTargetAtTime(0.15, now, 0.1);
        break;
      }

      case 'SPIRAL': {
        const spiralMod = Math.sin(t * merkaba.spiralFreq * Math.PI * 2) * 30;
        this._topOsc.frequency.setTargetAtTime(this.baseFreq + spiralMod, now, 0.05);
        this._bottomOsc.frequency.setTargetAtTime(this.baseFreq - spiralMod, now, 0.05);
        this._topGain.gain.setTargetAtTime(0.15, now, 0.1);
        this._bottomGain.gain.setTargetAtTime(0.15, now, 0.1);
        break;
      }

      case 'ACCEL': {
        const env = 0.2 + 0.8 * Math.abs(Math.sin(t * merkaba.accelFreq * Math.PI * 2));
        this._topGain.gain.setTargetAtTime(0.2 * env, now, 0.05);
        this._bottomGain.gain.setTargetAtTime(0.2 * env, now, 0.05);
        this._topOsc.frequency.setTargetAtTime(this.baseFreq * (0.8 + 0.4 * env), now, 0.05);
        this._bottomOsc.frequency.setTargetAtTime(this.baseFreq * (0.8 + 0.4 * env), now, 0.05);
        break;
      }

      case 'CHAOS': {
        const cTop = merkaba.chaosTop;
        const cBot = merkaba.chaosBottom;
        this._topOsc.frequency.setTargetAtTime(this.baseFreq * (1 + cTop * 0.1), now, 0.1);
        this._bottomOsc.frequency.setTargetAtTime(this.baseFreq * (1 + cBot * 0.1), now, 0.1);
        this._topGain.gain.setTargetAtTime(0.15 + Math.abs(cTop) * 0.03, now, 0.1);
        this._bottomGain.gain.setTargetAtTime(0.15 + Math.abs(cBot) * 0.03, now, 0.1);
        break;
      }

      case 'BREATH': {
        const impulse = merkaba.breathImpulse;
        const breathVol = 0.1 + impulse * 0.3;
        this._topGain.gain.setTargetAtTime(breathVol, now, 0.02);
        this._bottomGain.gain.setTargetAtTime(breathVol, now, 0.02);
        this._topOsc.frequency.setTargetAtTime(this.baseFreq * (1 + impulse * 0.2), now, 0.05);
        this._bottomOsc.frequency.setTargetAtTime(this.baseFreq * (1 + impulse * 0.2), now, 0.05);
        break;
      }

      case 'AXIS_X':
        this._topGain.gain.setTargetAtTime(0.15, now, 0.1);
        this._bottomGain.gain.setTargetAtTime(0.15, now, 0.1);
        this._topOsc.frequency.setTargetAtTime(this.baseFreq * 0.9, now, 0.1);
        this._bottomOsc.frequency.setTargetAtTime(this.baseFreq * 1.1, now, 0.1);
        break;

      case 'AXIS_Z':
        this._topGain.gain.setTargetAtTime(0.15, now, 0.1);
        this._bottomGain.gain.setTargetAtTime(0.15, now, 0.1);
        this._topOsc.frequency.setTargetAtTime(this.baseFreq * 1.1, now, 0.1);
        this._bottomOsc.frequency.setTargetAtTime(this.baseFreq * 0.9, now, 0.1);
        break;

      case 'FREE_3D':
        this._topGain.gain.setTargetAtTime(0.12, now, 0.1);
        this._bottomGain.gain.setTargetAtTime(0.12, now, 0.1);
        this._lfoGain.gain.setTargetAtTime(8, now, 0.1);
        this._lfo.frequency.setTargetAtTime(0.3, now, 0.1);
        break;

      default:
        this._topGain.gain.setTargetAtTime(0.15, now, 0.1);
        this._bottomGain.gain.setTargetAtTime(0.15, now, 0.1);
    }
  }

  getAnalyserData() {
    if (!this._analyser) return null;
    const data = new Uint8Array(this._analyser.frequencyBinCount);
    this._analyser.getByteFrequencyData(data);
    return data;
  }
}

export { CHAKRA_FREQUENCIES };

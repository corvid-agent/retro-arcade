import { Injectable, signal } from '@angular/core';

type SoundName =
  | 'move' | 'rotate' | 'drop' | 'line-clear' | 'tetris'
  | 'eat' | 'die' | 'game-over' | 'game-start'
  | 'shoot' | 'hit' | 'explosion' | 'brick-break'
  | 'match' | 'flip' | 'merge' | 'slide'
  | 'achievement' | 'high-score' | 'pause';

interface SoundDef {
  freq: number;
  duration: number;
  type: OscillatorType;
  ramp?: number;
  volume?: number;
}

const SOUNDS: Record<SoundName, SoundDef[]> = {
  move:        [{ freq: 200, duration: 0.05, type: 'square' }],
  rotate:      [{ freq: 300, duration: 0.06, type: 'square' }],
  drop:        [{ freq: 150, duration: 0.1, type: 'triangle', ramp: 80 }],
  'line-clear':[{ freq: 523, duration: 0.1, type: 'square' }, { freq: 659, duration: 0.1, type: 'square' }, { freq: 784, duration: 0.15, type: 'square' }],
  tetris:      [{ freq: 523, duration: 0.08, type: 'square' }, { freq: 659, duration: 0.08, type: 'square' }, { freq: 784, duration: 0.08, type: 'square' }, { freq: 1047, duration: 0.2, type: 'square' }],
  eat:         [{ freq: 440, duration: 0.05, type: 'square' }, { freq: 660, duration: 0.08, type: 'square' }],
  die:         [{ freq: 400, duration: 0.15, type: 'sawtooth', ramp: 100 }, { freq: 200, duration: 0.2, type: 'sawtooth', ramp: 50 }],
  'game-over': [{ freq: 392, duration: 0.2, type: 'square' }, { freq: 330, duration: 0.2, type: 'square' }, { freq: 262, duration: 0.4, type: 'square' }],
  'game-start':[{ freq: 262, duration: 0.1, type: 'square' }, { freq: 330, duration: 0.1, type: 'square' }, { freq: 392, duration: 0.1, type: 'square' }, { freq: 523, duration: 0.2, type: 'square' }],
  shoot:       [{ freq: 800, duration: 0.08, type: 'square', ramp: 200 }],
  hit:         [{ freq: 300, duration: 0.06, type: 'square' }, { freq: 500, duration: 0.06, type: 'square' }],
  explosion:   [{ freq: 100, duration: 0.3, type: 'sawtooth', volume: 0.15 }],
  'brick-break':[{ freq: 500, duration: 0.05, type: 'square' }, { freq: 700, duration: 0.05, type: 'square' }],
  match:       [{ freq: 523, duration: 0.08, type: 'triangle' }, { freq: 784, duration: 0.12, type: 'triangle' }],
  flip:        [{ freq: 400, duration: 0.04, type: 'triangle' }],
  merge:       [{ freq: 350, duration: 0.06, type: 'square' }, { freq: 500, duration: 0.08, type: 'square' }],
  slide:       [{ freq: 250, duration: 0.04, type: 'triangle' }],
  achievement: [{ freq: 523, duration: 0.1, type: 'square' }, { freq: 659, duration: 0.1, type: 'square' }, { freq: 784, duration: 0.1, type: 'square' }, { freq: 1047, duration: 0.3, type: 'square' }],
  'high-score':[{ freq: 784, duration: 0.15, type: 'square' }, { freq: 1047, duration: 0.15, type: 'square' }, { freq: 1319, duration: 0.25, type: 'square' }],
  pause:       [{ freq: 200, duration: 0.1, type: 'triangle' }],
};

const STORAGE_KEY = 'retro-arcade-muted';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private ctx: AudioContext | null = null;
  readonly muted = signal(this.loadMuted());

  /** Must be called from a user gesture to satisfy autoplay policy. */
  init(): void {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  play(name: SoundName): void {
    if (this.muted() || !this.ctx) return;
    const notes = SOUNDS[name];
    if (!notes) return;

    let offset = 0;
    for (const note of notes) {
      this.playNote(note, offset);
      offset += note.duration;
    }
  }

  toggleMute(): void {
    this.muted.update((m) => !m);
    this.saveMuted();
  }

  private playNote(def: SoundDef, delay: number): void {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = def.type;
    osc.frequency.setValueAtTime(def.freq, ctx.currentTime + delay);
    if (def.ramp) {
      osc.frequency.linearRampToValueAtTime(def.ramp, ctx.currentTime + delay + def.duration);
    }

    gain.gain.setValueAtTime(def.volume ?? 0.12, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + def.duration);

    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + def.duration + 0.01);
  }

  private loadMuted(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }

  private saveMuted(): void {
    try {
      localStorage.setItem(STORAGE_KEY, String(this.muted()));
    } catch { /* ignore */ }
  }
}

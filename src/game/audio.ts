/**
 * High-fidelity Cyber-Ninja Web Audio Synthesizer
 * Zero external audio files required - works instantly and reliably offline.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private isMuted: boolean = false;
  private musicPlaying: boolean = false;
  private musicInterval: number | null = null;
  private musicStep: number = 0;
  private isBossTheme: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.8, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.setMute(!this.isMuted);
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // --- Sound Effects ---

  /** Strider Plasma Cypher Slash (Iconic razor arc) */
  public playSlash(comboStep: number = 0) {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Noise buffer for the blade whoosh cut
    const bufferSize = this.ctx.sampleRate * 0.12;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(2000 + comboStep * 600, t);
    noiseFilter.frequency.exponentialRampToValueAtTime(300, t + 0.12);
    noiseFilter.Q.setValueAtTime(3, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    // High pitch laser tone
    osc.type = comboStep === 2 ? 'triangle' : 'sawtooth';
    const baseFreq = comboStep === 0 ? 800 : comboStep === 1 ? 1100 : 1500;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.15);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(4500, t);
    filter.frequency.exponentialRampToValueAtTime(600, t + 0.15);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    noise.start(t);
    osc.stop(t + 0.16);
    noise.stop(t + 0.13);
  }

  /** Perfect Parry / Deflect - Loud crystal-metallic CLANG */
  public playParry() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    
    // High metallic harmonic ring
    [1200, 1850, 2450, 3700].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      
      const decay = 0.35 + idx * 0.1;
      gain.gain.setValueAtTime(0.35 / (idx + 1), t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + decay);
    });

    // Sub punch
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(180, t);
    sub.frequency.exponentialRampToValueAtTime(40, t + 0.2);
    subGain.gain.setValueAtTime(0.4, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    sub.connect(subGain);
    subGain.connect(this.sfxGain);
    sub.start(t);
    sub.stop(t + 0.2);
  }

  /** Shuriken / Kunai Throw */
  public playShuriken() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(2200, t);
    osc.frequency.exponentialRampToValueAtTime(700, t + 0.08);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  /** Cyber Dash */
  public playDash() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.18);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, t);
    filter.frequency.exponentialRampToValueAtTime(300, t + 0.18);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  /** Jump / Flip */
  public playJump() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(650, t + 0.12);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  /** Hit Flesh / Impact */
  public playHit(heavy: boolean = false) {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = heavy ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(heavy ? 220 : 350, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + (heavy ? 0.25 : 0.12));

    gain.gain.setValueAtTime(heavy ? 0.5 : 0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (heavy ? 0.25 : 0.12));

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + (heavy ? 0.26 : 0.13));
  }

  /** Enemy Sliced In Half / Death */
  public playEnemyDeath() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Cyber burst / zap
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.25);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.26);
  }

  /** Ninjutsu Dragon Overdrive */
  public playNinjutsu() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Low rumble + climbing crescendo
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.linearRampToValueAtTime(450, t + 0.4);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.9);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.linearRampToValueAtTime(0.5, t + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.95);
  }

  /** Drone Laser Shot */
  public playDroneLaser() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1600, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.07);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  /** Pickup Sound */
  public playPickup() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);
      gain.gain.setValueAtTime(0.15, t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.1);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 0.1);
    });
  }

  // --- Dynamic Procedural Synthwave BGM ---

  public startMusic(bossTheme: boolean = false) {
    this.initCtx();
    this.isBossTheme = bossTheme;
    if (this.musicPlaying) return;
    this.musicPlaying = true;
    this.musicStep = 0;

    const tempo = bossTheme ? 144 : 126;
    const stepInterval = (60 / tempo / 4) * 1000; // 16th notes

    this.musicInterval = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || this.isMuted) {
        this.musicStep++;
        return;
      }
      this.playMusicStep(this.musicStep);
      this.musicStep++;
    }, stepInterval);
  }

  public setBossTheme(isBoss: boolean) {
    if (this.isBossTheme !== isBoss) {
      this.stopMusic();
      this.startMusic(isBoss);
    }
  }

  public stopMusic() {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.musicPlaying = false;
  }

  private playMusicStep(step: number) {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;
    const barStep = step % 16;
    const bar = Math.floor(step / 16) % 8;

    // Japanese In-sen & Cyber Minor Scale Frequencies:
    // D, Eb, G, A, C (D minor / Japanese Yo/In scale mix)
    const scale = this.isBossTheme
      ? [146.83, 155.56, 196.00, 220.00, 246.94, 293.66, 311.13, 392.00] // D phrygian / In-sen
      : [146.83, 174.61, 196.00, 220.00, 261.63, 293.66, 349.23, 392.00];

    // 1. Kick Drum (Steps 0, 4, 8, 12 - 4-on-the-floor)
    if (barStep % 4 === 0) {
      const kick = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kick.frequency.setValueAtTime(140, t);
      kick.frequency.exponentialRampToValueAtTime(38, t + 0.08);
      kickGain.gain.setValueAtTime(0.4, t);
      kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      kick.connect(kickGain);
      kickGain.connect(this.musicGain);
      kick.start(t);
      kick.stop(t + 0.1);
    }

    // 2. Hi-Hat (Every 2 steps, accented on off-beats)
    if (barStep % 2 === 0) {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.03);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const hat = this.ctx.createBufferSource();
      hat.buffer = buffer;
      const hatFilter = this.ctx.createBiquadFilter();
      hatFilter.type = 'highpass';
      hatFilter.frequency.setValueAtTime(7000, t);
      const hatGain = this.ctx.createGain();
      const isOff = barStep % 4 === 2;
      hatGain.gain.setValueAtTime(isOff ? 0.12 : 0.05, t);
      hatGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      hat.connect(hatFilter);
      hatFilter.connect(hatGain);
      hatGain.connect(this.musicGain);
      hat.start(t);
      hat.stop(t + 0.04);
    }

    // 3. Cyber Bass Arpeggio (16th notes running line)
    const rootNotes = this.isBossTheme ? [0, 0, 1, 1, 3, 3, 2, 4] : [0, 0, 3, 3, 2, 2, 4, 3];
    const rootIndex = rootNotes[bar % rootNotes.length];
    const bassFreq = scale[rootIndex] * 0.5;

    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    const bassFilter = this.ctx.createBiquadFilter();

    bassOsc.type = 'sawtooth';
    const octaveShift = (barStep % 4 === 2 || barStep % 4 === 3) ? 2 : 1;
    bassOsc.frequency.setValueAtTime(bassFreq * octaveShift, t);

    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(650 + (barStep % 4) * 200, t);
    bassFilter.Q.setValueAtTime(4, t);

    bassGain.gain.setValueAtTime(0.18, t);
    bassGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(this.musicGain);
    bassOsc.start(t);
    bassOsc.stop(t + 0.11);

    // 4. Synth Ninja Lead Melody (Plays on key syncopated steps)
    const melodyPattern = [0, -1, 3, -1, 2, -1, 4, 5, -1, 3, -1, 2, 1, -1, 0, -1];
    const noteIdx = melodyPattern[barStep];
    if (noteIdx !== -1) {
      const leadOsc = this.ctx.createOscillator();
      const leadGain = this.ctx.createGain();
      leadOsc.type = 'square';
      const freq = scale[noteIdx] * 2;
      leadOsc.frequency.setValueAtTime(freq, t);

      leadGain.gain.setValueAtTime(0.08, t);
      leadGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      leadOsc.connect(leadGain);
      leadGain.connect(this.musicGain);
      leadOsc.start(t);
      leadOsc.stop(t + 0.25);
    }
  }
}

export const soundEngine = new SoundEngine();

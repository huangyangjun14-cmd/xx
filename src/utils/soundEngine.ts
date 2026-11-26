import { SoundscapeType } from '../types/cultivation';

class CultivationSoundEngine {
  private ctx: AudioContext | null = null;
  private ambientNodes: AudioNode[] = [];
  private ambientGain: GainNode | null = null;
  private rainTimer: number | null = null;
  private currentSoundscape: SoundscapeType = 'none';
  private volume = 0.4;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Synthesizes a multi-partial bronze temple bell / singing bowl chime.
   */
  public playBronzeBell(pitchScale = 1.0, volumeScale = 0.35): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.exponentialRampToValueAtTime(Math.max(0.05, volumeScale * this.volume + 0.12), now + 0.025);
    masterGain.gain.exponentialRampToValueAtTime(0.0008, now + 4.2);
    masterGain.connect(ctx.destination);

    // Harmonic partials reminiscent of an antique bronze singing bowl
    const partials = [
      { freq: 220 * pitchScale, gain: 0.55, decay: 4.0 },
      { freq: 440 * pitchScale, gain: 0.28, decay: 3.1 },
      { freq: 658 * pitchScale, gain: 0.16, decay: 2.4 },
      { freq: 1188 * pitchScale, gain: 0.08, decay: 1.5 },
    ];

    partials.forEach((p) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(p.freq, now);
      g.gain.setValueAtTime(p.gain, now);
      g.gain.exponentialRampToValueAtTime(0.0005, now + p.decay);

      osc.connect(g);
      g.connect(masterGain);
      osc.start(now);
      osc.stop(now + p.decay + 0.1);
    });
  }

  /**
   * Gentle wooden-fish / jade chime tap for subtle UI confirmation or breath transition.
   */
  public playBreathCue(isInhale: boolean): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const baseFreq = isInhale ? 396 : 297;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(isInhale ? baseFreq * 1.04 : baseFreq * 0.96, now + 0.6);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.09 * Math.max(0.3, this.volume), now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 1.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.2);
  }

  /**
   * Escalating ceremonial soundscape for realm breakthroughs (1..9).
   */
  public playBreakthroughSound(realmLevel: number): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const vol = Math.max(0.18, this.volume * 0.55);

    // Deep resonant foundation boom for realms >= 3
    if (realmLevel >= 3) {
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(110, now);
      subOsc.frequency.exponentialRampToValueAtTime(42, now + 1.4);
      subGain.gain.setValueAtTime(0.001, now);
      subGain.gain.linearRampToValueAtTime(vol * 0.85, now + 0.05);
      subGain.gain.exponentialRampToValueAtTime(0.0008, now + 1.8);
      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(now);
      subOsc.stop(now + 1.9);
    }

    // Pentatonic ascending chime arpeggio (more notes & higher shimmer for higher realms)
    const pentatonic = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99];
    const noteCount = Math.min(pentatonic.length, 2 + realmLevel);
    for (let i = 0; i < noteCount; i++) {
      const t = now + i * 0.09;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(pentatonic[i], t);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(vol * 0.32, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0005, t + 2.2);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 2.3);
    }

    // Thunder crackle shimmer for 大乘期 (8) and 真仙境 (9)
    if (realmLevel >= 8) {
      const bufLen = ctx.sampleRate * 0.9;
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        ch[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.25));
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(realmLevel === 8 ? 1400 : 2200, now);
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(vol * 0.45, now + 0.12);
      nGain.gain.exponentialRampToValueAtTime(0.0008, now + 1.0);
      src.connect(filter);
      filter.connect(nGain);
      nGain.connect(ctx.destination);
      src.start(now + 0.12);
    }

    // Closing ceremonial bronze bell
    window.setTimeout(() => {
      this.playBronzeBell(0.85 + realmLevel * 0.04, 0.42);
    }, 320);
  }

  public setVolume(vol: number): void {
    this.volume = Math.min(1, Math.max(0, vol));
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(this.getTargetGain(this.currentSoundscape), this.ctx.currentTime, 0.15);
    }
  }

  private getTargetGain(type: SoundscapeType): number {
    if (type === 'none') return 0;
    if (type === 'drone') return this.volume * 0.18;
    if (type === 'wind') return this.volume * 0.25;
    if (type === 'stream') return this.volume * 0.22;
    return this.volume * 0.22;
  }

  public stopAmbient(): void {
    if (this.rainTimer !== null) {
      window.clearInterval(this.rainTimer);
      this.rainTimer = null;
    }
    this.ambientNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          (node as AudioScheduledSourceNode).stop();
        }
        node.disconnect();
      } catch {
        // Ignore already stopped nodes
      }
    });
    this.ambientNodes = [];
    this.ambientGain = null;
    this.currentSoundscape = 'none';
  }

  public startAmbient(type: SoundscapeType): void {
    this.stopAmbient();
    this.currentSoundscape = type;
    if (type === 'none') return;

    const ctx = this.ensureContext();
    if (!ctx) return;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.001, ctx.currentTime);
    master.gain.linearRampToValueAtTime(this.getTargetGain(type), ctx.currentTime + 0.8);
    master.connect(ctx.destination);
    this.ambientGain = master;
    this.ambientNodes.push(master);

    if (type === 'drone') {
      // Peaceful D-A-D fifth harmonic drone
      const freqs = [110, 165, 220, 330];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(480, ctx.currentTime);

        g.gain.setValueAtTime(idx === 0 ? 0.32 : 0.14 / (idx + 1), ctx.currentTime);
        osc.connect(filter);
        filter.connect(g);
        g.connect(master);
        osc.start();
        this.ambientNodes.push(osc, filter, g);
      });
      return;
    }

    // Create pink/brown noise buffer for wind, rain, or stream
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
      b6 = white * 0.115926;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    if (type === 'wind') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(340, ctx.currentTime);
      filter.Q.setValueAtTime(0.8, ctx.currentTime);

      // Slow LFO modulating wind sweep
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.11, ctx.currentTime);
      lfoGain.gain.setValueAtTime(160, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      this.ambientNodes.push(lfo, lfoGain);
    } else if (type === 'rain') {
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1650, ctx.currentTime);
      filter.Q.setValueAtTime(0.5, ctx.currentTime);

      // Occasional soft raindrop plucks
      this.rainTimer = window.setInterval(() => {
        if (!this.ctx || !this.ambientGain || this.currentSoundscape !== 'rain') return;
        const dropOsc = this.ctx.createOscillator();
        const dropGain = this.ctx.createGain();
        const t = this.ctx.currentTime;
        dropOsc.type = 'sine';
        const f = 900 + Math.random() * 1400;
        dropOsc.frequency.setValueAtTime(f, t);
        dropOsc.frequency.exponentialRampToValueAtTime(f * 0.65, t + 0.08);
        dropGain.gain.setValueAtTime(0.001, t);
        dropGain.gain.linearRampToValueAtTime(0.06, t + 0.01);
        dropGain.gain.exponentialRampToValueAtTime(0.0005, t + 0.12);
        dropOsc.connect(dropGain);
        dropGain.connect(this.ambientGain);
        dropOsc.start(t);
        dropOsc.stop(t + 0.15);
      }, 420);
    } else if (type === 'stream') {
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(620, ctx.currentTime);
      filter.Q.setValueAtTime(1.1, ctx.currentTime);
    }

    noise.connect(filter);
    filter.connect(master);
    noise.start();
    this.ambientNodes.push(noise, filter);
  }
}

export const soundEngine = new CultivationSoundEngine();

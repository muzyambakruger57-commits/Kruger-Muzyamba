class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private rainGain: GainNode | null = null;
  private wavesGain: GainNode | null = null;
  private chimesInterval: number | null = null;

  // Sound generator nodes
  private oscillators: OscillatorNode[] = [];
  private rainNode: AudioNode | null = null;
  private waveNode: AudioNode | null = null;

  // User volumes
  private currentMasterVol = 0.5;
  private currentBgmVol = 0.4;
  private currentAmbienceVol = 0.3;

  constructor() {}

  init() {
    if (this.ctx) return;
    try {
      // Create audio context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Master output node
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.currentMasterVol, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Initialize sound layers
      this.setupPianoDrone();
      this.setupRain();
      this.setupOceanWaves();
      this.startAmbientChimes();
    } catch (e) {
      console.warn("Web Audio API not supported or blocked: ", e);
    }
  }

  setVolumes(master: number, bgm: number, ambience: number) {
    this.currentMasterVol = master;
    this.currentBgmVol = bgm;
    this.currentAmbienceVol = ambience;

    if (!this.ctx || !this.masterGain) return;

    this.masterGain.gain.setTargetAtTime(master, this.ctx.currentTime, 0.1);
    if (this.droneGain) {
      this.droneGain.gain.setTargetAtTime(bgm * 0.4, this.ctx.currentTime, 0.2);
    }
    if (this.rainGain) {
      this.rainGain.gain.setTargetAtTime(ambience * 0.3, this.ctx.currentTime, 0.2);
    }
    if (this.wavesGain) {
      this.wavesGain.gain.setTargetAtTime(ambience * 0.4, this.ctx.currentTime, 0.2);
    }
  }

  // Meditative warm drone base (Piano/synth pad replacement)
  private setupPianoDrone() {
    if (!this.ctx || !this.masterGain) return;

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(this.currentBgmVol * 0.4, this.ctx.currentTime);
    this.droneGain.connect(this.masterGain);

    const baseFrequencies = [110.0, 165.0, 220.0, 275.0, 330.0]; // A major / golden ratios

    baseFrequencies.forEach((freq) => {
      if (!this.ctx || !this.droneGain) return;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Low frequency oscillator (LFO) to swell individual harmonic volumes slowly
      const lfoFreq = 0.05 + Math.random() * 0.05; // 10 to 20 second periods
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();

      lfo.frequency.setValueAtTime(lfoFreq, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(gainNode.gain);

      gainNode.gain.setValueAtTime(0.08, this.ctx.currentTime);
      osc.connect(gainNode);
      gainNode.connect(this.droneGain);

      osc.start();
      lfo.start();

      this.oscillators.push(osc);
      this.oscillators.push(lfo); // keep tracked to stop on destroy
    });
  }

  // Generates rainfall procedurally using customized white noise filtering
  private setupRain() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Pink / White noise spectrum filter
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11; // normalise volume
      b6 = white * 0.115926;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Filter to make it sound muffled and organic like rain
    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(800, this.ctx.currentTime);

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(this.currentAmbienceVol * 0.3, this.ctx.currentTime);

    noiseSource.connect(lowpass);
    lowpass.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);

    noiseSource.start();
    this.rainNode = noiseSource;
  }

  // Smooth ocean waves with periodic volume swells
  private setupOceanWaves() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = 4 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    // Standard white noise
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.2;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    // Wave swell LFO
    const swellLFO = this.ctx.createOscillator();
    swellLFO.frequency.setValueAtTime(0.08, this.ctx.currentTime); // 12.5 seconds per wave sweep

    this.wavesGain = this.ctx.createGain();
    this.wavesGain.gain.setValueAtTime(this.currentAmbienceVol * 0.4, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.4, this.ctx.currentTime); // Swell amplitude

    swellLFO.connect(lfoGain);
    lfoGain.connect(this.wavesGain.gain);

    noiseSource.connect(filter);
    filter.connect(this.wavesGain);
    this.wavesGain.connect(this.masterGain);

    noiseSource.start();
    swellLFO.start();

    this.waveNode = noiseSource;
    this.oscillators.push(swellLFO);
  }

  // Ambient wind chimes ringing occasionally
  private startAmbientChimes() {
    const triggerChime = () => {
      if (!this.ctx || !this.masterGain || this.currentAmbienceVol === 0) return;
      
      const currentTime = this.ctx.currentTime;
      // High frequency pitch frequencies representing clean chime metal bars
      const chimeRoot = 1200 + Math.random() * 800;
      const frequencies = [chimeRoot, chimeRoot * 1.25, chimeRoot * 1.5, chimeRoot * 1.875];

      frequencies.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const oNode = this.ctx.createOscillator();
        const gNode = this.ctx.createGain();

        oNode.type = 'sine';
        oNode.frequency.setValueAtTime(freq, currentTime + idx * 0.15); // staggered hit

        gNode.gain.setValueAtTime(0, currentTime);
        // Peak volume
        gNode.gain.linearRampToValueAtTime(this.currentAmbienceVol * 0.08, currentTime + idx * 0.15 + 0.01);
        // Exponential decay
        gNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + idx * 0.15 + 2.5);

        oNode.connect(gNode);
        gNode.connect(this.masterGain);

        oNode.start(currentTime + idx * 0.15);
        oNode.stop(currentTime + idx * 0.15 + 2.6);
      });
    };

    // Roll timer every 4–8 seconds
    const chimeLoop = () => {
      triggerChime();
      this.chimesInterval = window.setTimeout(chimeLoop, 5000 + Math.random() * 7000);
    };

    chimeLoop();
  }

  // PLAY MEDITATION BELL (Level Complete or Start)
  playMeditationBell() {
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    // Harmonic partials of a large heavy bronze meditation bowl
    const partials = [196.0, 294.0, 392.0, 490.0, 588.0];
    const decayTimes = [7.0, 5.0, 4.0, 3.0, 2.0];
    const gains = [0.45, 0.25, 0.15, 0.10, 0.05];

    partials.forEach((freq, index) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(gains[index] * this.currentMasterVol * 0.9, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + decayTimes[index]);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + decayTimes[index] + 0.1);
    });
  }

  // WATER DRIP TAP SFX
  playWaterDrip() {
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Frequency sweep from high (800Hz) to upper registers (1200Hz) mimic splash
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.15);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(this.currentMasterVol * 0.15, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.32);
  }

  // SAND RAKING SOUND
  playSandRake() {
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const bufferSize = 0.5 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    // Create soft brown noise
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // boost
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.exponentialRampToValueAtTime(150, t + 0.4); // raking stroke pitch bend
    filter.Q.setValueAtTime(1.5, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(this.currentMasterVol * 0.18, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(t);
  }

  // STAR CONNECTED BELL PING
  playStarConnect(freq: number = 523.25) { // default C5
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(freq * 0.5, t); // lower octave body

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(this.currentMasterVol * 0.2, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

    osc.connect(gain);
    subOsc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    subOsc.start(t);
    osc.stop(t + 1.3);
    subOsc.stop(t + 1.3);
  }

  // STONE TAP SFX
  playStoneClick() {
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    // Wood block resonator frequency simulation
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.08);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(220, t);
    filter.Q.setValueAtTime(4, t);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(this.currentMasterVol * 0.35, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  // Resume context if stopped by browser autoplay policy
  async resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  stopAll() {
    // Clear timeouts
    if (this.chimesInterval) {
      clearTimeout(this.chimesInterval);
      this.chimesInterval = null;
    }

    // Stop active oscillators
    this.oscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {}
    });
    this.oscillators = [];

    // Stop and disconnect noise generators
    if (this.rainNode) {
      try { (this.rainNode as any).stop(); } catch (e) {}
      this.rainNode = null;
    }
    if (this.waveNode) {
      try { (this.waveNode as any).stop(); } catch (e) {}
      this.waveNode = null;
    }

    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.masterGain = null;
    this.droneGain = null;
    this.rainGain = null;
    this.wavesGain = null;
  }
}

export const audioEngine = new AudioEngine();

export default class AmbientEngine {
  constructor() {
    this.ctx = null;
    this.running = false;
    this.nodes = [];
    this.masterGain = null;
  }

  async init() {
    if (this.running) return this;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.08;
    this.masterGain.connect(this.ctx.destination);

    // Layer 1: Low drone ~55Hz
    const drone = this.ctx.createOscillator();
    drone.type = 'sine';
    drone.frequency.value = 55;

    const droneLFO = this.ctx.createOscillator();
    droneLFO.type = 'sine';
    droneLFO.frequency.value = 0.12;
    const droneLFOGain = this.ctx.createGain();
    droneLFOGain.gain.value = 2.5;
    droneLFO.connect(droneLFOGain);
    droneLFOGain.connect(drone.frequency);

    const droneVol = this.ctx.createGain();
    droneVol.gain.value = 0.25;
    const droneVolLFO = this.ctx.createOscillator();
    droneVolLFO.type = 'sine';
    droneVolLFO.frequency.value = 0.07;
    const droneVolLFOGain = this.ctx.createGain();
    droneVolLFOGain.gain.value = 0.08;
    droneVolLFO.connect(droneVolLFOGain);
    droneVolLFOGain.connect(droneVol.gain);

    drone.connect(droneVol);
    droneVol.connect(this.masterGain);

    // Layer 2: Filtered noise (air)
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 350;
    bandpass.Q.value = 0.4;

    const noiseVol = this.ctx.createGain();
    noiseVol.gain.value = 0.06;

    noise.connect(bandpass);
    bandpass.connect(noiseVol);
    noiseVol.connect(this.masterGain);

    // Layer 3: Sparse glass harmonics
    const scheduleGlassTone = () => {
      if (!this.running) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 600 + Math.random() * 1400;

      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.015, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 2.5);

      this.glassTimer = setTimeout(scheduleGlassTone, 7000 + Math.random() * 14000);
    };

    this.nodes = [drone, droneLFO, droneVolLFO, noise];
    scheduleGlassTone();
    this.running = true;
    return this;
  }

  start() {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.running) this.init().then(() => this._startOscillators());
    else this._startOscillators();
  }

  _startOscillators() {
    this.nodes.forEach((n) => {
      try { n.start(0); } catch (e) {}
    });
  }

  stop() {
    this.running = false;
    if (this.glassTimer) clearTimeout(this.glassTimer);
    this.nodes.forEach((n) => {
      try { n.stop(); n.disconnect(); } catch (e) {}
    });
    this.nodes = [];
    if (this.masterGain) {
      try { this.masterGain.disconnect(); } catch (e) {}
    }
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}


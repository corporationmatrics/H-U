import { SoundscapePreset, SoundscapePresetId, PhotoItem } from '../types';

export const SOUNDSCAPE_PRESETS: Record<SoundscapePresetId, SoundscapePreset> = {
  amalfi_waves: {
    id: 'amalfi_waves',
    name: 'Amalfi Coast Ocean Waves',
    icon: 'Waves',
    description: 'Gentle low-frequency tidal swells and soft surf spray',
    associatedKeywords: ['beach', 'ocean', 'coast', 'water', 'sea', 'amalfi', 'sunset', 'sand', 'swim'],
    accentColor: '#38bdf8',
    noiseType: 'brown',
    baseFrequency: 320,
    lfoSpeedHz: 0.12, // 8.3s wave swell cycle
    crackleIntensity: 0.05,
    rainTapDensity: 0,
    droneHarmonicHz: 65.41, // C2 deep oceanic resonance
  },
  paris_cafe: {
    id: 'paris_cafe',
    name: 'Parisian Cafe & Warm Vinyl',
    icon: 'Coffee',
    description: 'Soft room ambience, warm analog vinyl pops, and distant harmonic hum',
    associatedKeywords: ['cafe', 'coffee', 'paris', 'restaurant', 'bakery', 'brunch', 'wine', 'dinner', 'date'],
    accentColor: '#fbbf24',
    noiseType: 'pink',
    baseFrequency: 550,
    lfoSpeedHz: 0.05,
    crackleIntensity: 0.45, // Warm vinyl crackle
    rainTapDensity: 0.05,
    droneHarmonicHz: 110, // A2 cozy warm chord
  },
  alpine_breeze: {
    id: 'alpine_breeze',
    name: 'Alpine Mountain Wind',
    icon: 'Wind',
    description: 'Sweeping high-altitude breeze through mountain pines',
    associatedKeywords: ['mountain', 'hike', 'trail', 'alps', 'summit', 'nature', 'forest', 'trees', 'snow'],
    accentColor: '#34d399',
    noiseType: 'pink',
    baseFrequency: 680,
    lfoSpeedHz: 0.22,
    crackleIntensity: 0,
    rainTapDensity: 0,
    droneHarmonicHz: 130.81, // C3 airy wind resonance
  },
  rainy_evening: {
    id: 'rainy_evening',
    name: 'Cozy Rainy Evening',
    icon: 'CloudRain',
    description: 'Gentle raindrops tapping on windowpane with warm indoor shelter',
    associatedKeywords: ['rain', 'indoor', 'home', 'cozy', 'winter', 'bed', 'tea', 'storm', 'night'],
    accentColor: '#818cf8',
    noiseType: 'pink',
    baseFrequency: 750,
    lfoSpeedHz: 0.08,
    crackleIntensity: 0.2,
    rainTapDensity: 0.85, // Frequent raindrop impulses
    droneHarmonicHz: 82.41, // E2 shelter drone
  },
  campfire_dusk: {
    id: 'campfire_dusk',
    name: 'Campfire & Starry Dusk',
    icon: 'Flame',
    description: 'Warm glowing embers, soft wood crackles, and evening stillness',
    associatedKeywords: ['camp', 'campfire', 'fire', 'sunset', 'stars', 'night', 'cabin', 'marshmallow'],
    accentColor: '#f97316',
    noiseType: 'brown',
    baseFrequency: 280,
    lfoSpeedHz: 0.15,
    crackleIntensity: 0.75, // Wood pops
    rainTapDensity: 0,
    droneHarmonicHz: 73.42, // D2 low warm embers
  },
  summer_park: {
    id: 'summer_park',
    name: 'Sunlit Meadow & Chimes',
    icon: 'Sun',
    description: 'Soft rustling foliage, golden hour warmth, and airy acoustic shimmer',
    associatedKeywords: ['park', 'picnic', 'flowers', 'garden', 'summer', 'spring', 'sunshine', 'walk'],
    accentColor: '#f43f5e',
    noiseType: 'pink',
    baseFrequency: 820,
    lfoSpeedHz: 0.18,
    crackleIntensity: 0.1,
    rainTapDensity: 0.15,
    droneHarmonicHz: 164.81, // E3 sunlit chord
  },
};

/**
 * Procedural Web Audio Engine
 * Generates endless, zero-bandwidth environmental soundscapes directly in the browser.
 */
class ProceduralAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentPresetId: SoundscapePresetId = 'amalfi_waves';
  private masterGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private lfoNode: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;
  private crackleIntervalId: any = null;
  private volume: number = 0.35;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Generates a 4-second looped noise buffer (Pink or Brown).
   */
  private createNoiseBuffer(type: 'pink' | 'brown' | 'white'): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    let lastOut = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;

      if (type === 'pink') {
        // Paul Kellet's filtered pink noise algorithm
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
        b6 = white * 0.115926;
      } else if (type === 'brown') {
        // Brown/Red noise (integrated white noise)
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 1.8;
      } else {
        data[i] = white * 0.1;
      }
    }
    return buffer;
  }

  public play(presetId: SoundscapePresetId = 'amalfi_waves', volume: number = 0.35) {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    this.currentPresetId = presetId;
    this.volume = volume;
    const preset = SOUNDSCAPE_PRESETS[presetId] || SOUNDSCAPE_PRESETS.amalfi_waves;

    // 1. Master Output Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(this.volume, this.ctx.currentTime + 1.2);
    this.masterGain.connect(this.ctx.destination);

    // 2. Procedural Noise generator
    const noiseBuffer = this.createNoiseBuffer(preset.noiseType);
    if (noiseBuffer) {
      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = noiseBuffer;
      this.noiseNode.loop = true;

      // Filter
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = preset.noiseType === 'brown' ? 'lowpass' : 'bandpass';
      this.filterNode.frequency.setValueAtTime(preset.baseFrequency, this.ctx.currentTime);
      this.filterNode.Q.setValueAtTime(preset.noiseType === 'brown' ? 1.2 : 2.5, this.ctx.currentTime);

      // Low Frequency Oscillator for realistic waves/wind swell
      this.lfoNode = this.ctx.createOscillator();
      this.lfoNode.type = 'sine';
      this.lfoNode.frequency.setValueAtTime(preset.lfoSpeedHz, this.ctx.currentTime);

      this.lfoGain = this.ctx.createGain();
      this.lfoGain.gain.setValueAtTime(preset.baseFrequency * 0.65, this.ctx.currentTime);

      this.lfoNode.connect(this.lfoGain);
      this.lfoGain.connect(this.filterNode.frequency);

      this.noiseNode.connect(this.filterNode);
      this.filterNode.connect(this.masterGain);

      this.noiseNode.start();
      this.lfoNode.start();
    }

    // 3. Warm Harmonic Drone Oscillator (Adds emotional musical foundation)
    if (preset.droneHarmonicHz) {
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc2 = this.ctx.createOscillator();
      this.droneGain = this.ctx.createGain();

      this.droneOsc1.type = 'sine';
      this.droneOsc1.frequency.setValueAtTime(preset.droneHarmonicHz, this.ctx.currentTime);

      // Subtle 1.5 Hz detune for warm analog chorus
      this.droneOsc2.type = 'sine';
      this.droneOsc2.frequency.setValueAtTime(preset.droneHarmonicHz + 1.5, this.ctx.currentTime);

      this.droneGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      this.droneOsc1.connect(this.droneGain);
      this.droneOsc2.connect(this.droneGain);
      this.droneGain.connect(this.masterGain);

      this.droneOsc1.start();
      this.droneOsc2.start();
    }

    // 4. Procedural Crackle / Rain Impulses
    if (preset.crackleIntensity > 0 || preset.rainTapDensity > 0) {
      this.startCrackleEngine(preset);
    }

    this.isPlaying = true;
  }

  private startCrackleEngine(preset: SoundscapePreset) {
    if (!this.ctx || !this.masterGain) return;

    this.crackleIntervalId = setInterval(() => {
      if (!this.ctx || !this.masterGain || !this.isPlaying) return;

      // Random trigger
      const rand = Math.random();
      if (rand < (preset.crackleIntensity * 0.45 + preset.rainTapDensity * 0.6)) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        const isRain = preset.rainTapDensity > preset.crackleIntensity;
        osc.type = isRain ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(isRain ? 2200 + Math.random() * 1800 : 800 + Math.random() * 2400, this.ctx.currentTime);

        const popGain = isRain ? 0.03 : 0.06;
        gain.gain.setValueAtTime(popGain, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + (isRain ? 0.04 : 0.02));

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
      }
    }, 60);
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.1);
    }
  }

  public stop() {
    if (this.crackleIntervalId) {
      clearInterval(this.crackleIntervalId);
      this.crackleIntervalId = null;
    }

    if (this.noiseNode) {
      try { this.noiseNode.stop(); } catch (e) {}
      this.noiseNode.disconnect();
      this.noiseNode = null;
    }

    if (this.lfoNode) {
      try { this.lfoNode.stop(); } catch (e) {}
      this.lfoNode.disconnect();
      this.lfoNode = null;
    }

    if (this.droneOsc1) {
      try { this.droneOsc1.stop(); } catch (e) {}
      this.droneOsc1.disconnect();
      this.droneOsc1 = null;
    }

    if (this.droneOsc2) {
      try { this.droneOsc2.stop(); } catch (e) {}
      this.droneOsc2.disconnect();
      this.droneOsc2 = null;
    }

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
    }

    this.isPlaying = false;
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      currentPresetId: this.currentPresetId,
      volume: this.volume,
    };
  }

  /**
   * Auto-selects the ideal soundscape based on photo tags and location name.
   */
  public matchSoundscapeForPhoto(photo: PhotoItem): SoundscapePresetId {
    const textCorpus = `${photo.title} ${photo.location?.name || ''} ${photo.semanticTags.join(' ')} ${photo.nostalgicSummary}`.toLowerCase();

    for (const [id, preset] of Object.entries(SOUNDSCAPE_PRESETS)) {
      for (const kw of preset.associatedKeywords) {
        if (textCorpus.includes(kw)) {
          return id as SoundscapePresetId;
        }
      }
    }

    // Default by time of day or season
    if (photo.date.includes('-07-') || photo.date.includes('-08-')) {
      return 'amalfi_waves';
    }
    return 'paris_cafe';
  }
}

export const proceduralAudio = new ProceduralAudioEngine();

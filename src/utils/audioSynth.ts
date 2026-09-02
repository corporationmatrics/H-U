// Web Audio API ambient soundtrack generator for romance & nostalgic memory playback
class AmbientSoundtrackEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private timer: any = null;
  private gainNode: GainNode | null = null;

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.15, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playTrack(trackType: 'romantic-acoustic' | 'ambient-strings' | 'lofi-cafe' = 'romantic-acoustic') {
    this.init();
    if (this.isPlaying) return;
    this.isPlaying = true;

    // Chord progressions for dreamy nostalgic atmosphere (Cmaj7 - Am9 - Fmaj7 - G6)
    const chordProgressions = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 392.00], // G6
    ];

    let chordIndex = 0;

    const playChordStep = () => {
      if (!this.isPlaying || !this.ctx || !this.gainNode) return;

      const chord = chordProgressions[chordIndex % chordProgressions.length];
      chordIndex++;

      // Arpeggiate notes
      chord.forEach((freq, noteIdx) => {
        const osc = this.ctx!.createOscillator();
        const noteGain = this.ctx!.createGain();

        // Warm soft sine/triangle tone
        osc.type = trackType === 'lofi-cafe' ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq * (trackType === 'ambient-strings' ? 0.5 : 1), this.ctx!.currentTime);

        const startTime = this.ctx!.currentTime + (noteIdx * 0.25);
        const duration = 3.2;

        noteGain.gain.setValueAtTime(0.001, startTime);
        noteGain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.15);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(noteGain);
        noteGain.connect(this.gainNode!);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });

      this.timer = setTimeout(playChordStep, 2400);
    };

    playChordStep();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  public setVolume(vol: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const ambientSoundtrack = new AmbientSoundtrackEngine();

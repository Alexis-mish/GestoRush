// Retro Sound Effects Manager using Web Audio API
// Synthesizes clean, pop-up Nintendo-like sound effects natively.
// Also supports loading custom files and playing background music.

class SoundManager {
  private ctx: AudioContext | null = null;
  private customSounds: Record<string, HTMLAudioElement> = {};
  private muted: boolean = false;
  private bgm: HTMLAudioElement | null = null;

  constructor() {}

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (this.bgm) {
      this.bgm.muted = muted;
    }
  }

  public isMuted() {
    return this.muted;
  }

  // Play Background Music (Golden_Coin_Rush.mp3)
  public playBGM() {
    if (this.bgm) {
      if (this.bgm.paused) {
        this.bgm.muted = this.muted;
        this.bgm.play().catch(() => {});
      }
      return;
    }

    this.bgm = new Audio('/Golden_Coin_Rush.mp3');
    this.bgm.loop = true;
    this.bgm.volume = 0.3; // Gentle volume
    this.bgm.muted = this.muted;
    this.bgm.play().catch(() => {
      // Audio playback might be blocked until user interaction
    });
  }

  public stopBGM() {
    if (this.bgm) {
      this.bgm.pause();
    }
  }

  // Synthesize a clean retro "Coin/Save" sound (Nintendo classic arpeggio)
  public playSave() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (this.playCustomSound('save')) return;

    // Clean, crisp coin sound: two sine-like notes
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle'; // Softer, cleaner than square wave
    
    // Classic coin frequencies: B5 (988Hz) then E6 (1318Hz)
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.setValueAtTime(1318.51, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.setValueAtTime(0.2, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    // Filter to remove harsh clicking
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 3000;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Synthesize a retro "Sinking/Error" sound (slide down)
  public playSink() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (this.playCustomSound('sink')) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.3);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Synthesize a clean, fast "bubble pop" drag sound
  public playDrag() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (this.playCustomSound('drag')) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Synthesize a Nintendo Switch "Click/Snap" sound
  public playClapboard() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (this.playCustomSound('clapboard')) return;

    // Chirp 1
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1100, now);
    osc1.frequency.exponentialRampToValueAtTime(1700, now + 0.025);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.025);

    // Chirp 2 (delayed by 35ms)
    const delay = 0.035;
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1300, now + delay);
    osc2.frequency.exponentialRampToValueAtTime(2000, now + delay + 0.025);
    gain2.gain.setValueAtTime(0.15, now + delay);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.025);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + delay);
    osc2.stop(now + delay + 0.025);
  }

  // Synthesize a clean woodblock "Tick" sound for the countdown
  public playTick() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (this.playCustomSound('tick')) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, now);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.02);
  }

  // Synthesize a lower woodblock "Tock" sound for final warnings
  public playTock() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (this.playCustomSound('tock')) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  // Synthesize a classic "Buzzer" (Timbre) when round ends
  public playBuzzer() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (this.playCustomSound('buzzer')) return;

    // Fast pulsing buzzer sound (combining two square wave notes for that harsh alarm buzzer)
    const duration = 0.6;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'square';
    osc1.frequency.setValueAtTime(440, now); // A4
    // Modulate pitch slightly for buzzer effect
    for (let t = 0; t < duration; t += 0.08) {
      osc1.frequency.setValueAtTime(440, now + t);
      osc1.frequency.setValueAtTime(420, now + t + 0.04);
    }

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(220, now); // A3

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Filter to sweeten
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration);
    osc2.stop(now + duration);
  }

  // Synthesize a retro "Win / Happy major arpeggio" sound
  public playWin() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (this.playCustomSound('win')) return;

    // Clean major scale arpeggio: C5 -> E5 -> G5 -> C6
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const duration = 0.08;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * duration);

      gain.gain.setValueAtTime(0.12, now + idx * duration);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * duration + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * duration);
      osc.stop(now + idx * duration + 0.12);
    });
  }

  // Synthesize a retro "Lose" fanfare (minor chord slide down)
  public playLose() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (this.playCustomSound('lose')) return;

    const notes = [440.00, 415.30, 392.00, 311.13];
    const duration = 0.12;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * duration);

      gain.gain.setValueAtTime(0.15, now + idx * duration);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * duration + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * duration);
      osc.stop(now + idx * duration + 0.2);
    });
  }

  // Play custom sound files loaded by user if available
  private playCustomSound(key: string): boolean {
    const audio = this.customSounds[key] || new Audio(`/sounds/${key}.mp3`);
    if (!this.customSounds[key]) {
      this.customSounds[key] = audio;
      audio.load();
    }

    try {
      if (audio.readyState >= 2) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return true;
      }
    } catch (e) {}
    return false;
  }
}

export const sound = new SoundManager();

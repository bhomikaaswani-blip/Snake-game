// Simple Web Audio API Synthesizer for Retro Snake Arcade Sound Effects
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

export function playSound(type: 'EAT' | 'CRASH' | 'CLICK' | 'PORTAL' | 'POWERUP' | 'TICK', enabled: boolean) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume context if suspended (browser security policy)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  try {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'EAT':
        // Short, rising pitch beep
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;

      case 'POWERUP':
        // Double rising melody beep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);
        osc.frequency.setValueAtTime(600, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(1000, now + 0.2);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;

      case 'PORTAL':
        // Cool sci-fi sweep sound
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.linearRampToValueAtTime(200, now + 0.15);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;

      case 'CRASH':
        // Low, crashing noise (frequency rapidly falling to low rumble)
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(60, now + 0.35);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
        break;

      case 'CLICK':
        // Very quick click sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
        break;

      case 'TICK':
        // Quick subtle tick for Time Trial countdown
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
        break;
    }
  } catch (error) {
    console.warn('Sound synthesis error:', error);
  }
}

// Procedural Background Music (BGM) System
const NOTES = {
  // Octave 1/2 (Bass)
  Bb1: 58.27, C2: 65.41, D2: 73.42, Eb2: 77.78, F2: 87.31, G2: 98.00, Bb2: 116.54,
  // Octave 3
  C3: 130.81, Eb3: 155.56, G3: 196.00, Bb3: 233.08, B3: 246.94, C4: 261.63,
  // Octave 4
  D4: 293.66, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392.00, Gs4: 415.30, A4: 440.00, B4: 493.88,
  // Octave 5
  C5: 523.25, Cs5: 554.37, D5: 587.33, E5: 659.25, F5: 698.46, Fs5: 739.99, G5: 783.99, A5: 880.00, B5: 987.77
};

interface BgmSequence {
  notes: number[];
  type: OscillatorType;
  duration: number;
  volume: number;
  stepTime: number;
}

const BGM_SEQUENCES: Record<string, BgmSequence> = {
  RETRO_ARCADE: {
    notes: [NOTES.C4, NOTES.E4, NOTES.G4, NOTES.C5, NOTES.G4, NOTES.E4, NOTES.C4, NOTES.G4],
    type: 'triangle',
    duration: 0.15,
    volume: 0.03,
    stepTime: 180,
  },
  CYBERPUNK: {
    notes: [NOTES.C2, NOTES.C2, NOTES.Eb2, NOTES.Eb2, NOTES.F2, NOTES.F2, NOTES.Bb1, NOTES.Bb2],
    type: 'sawtooth',
    duration: 0.18,
    volume: 0.04,
    stepTime: 200,
  },
  NOKIA_CLASSIC: {
    notes: [NOTES.E5, NOTES.D5, NOTES.Fs4, NOTES.Gs4, NOTES.Cs5, NOTES.B4, NOTES.D4, NOTES.E4],
    type: 'square',
    duration: 0.12,
    volume: 0.012,
    stepTime: 250,
  },
  CANDY: {
    notes: [NOTES.C5, NOTES.E5, NOTES.G5, NOTES.A5, NOTES.G5, NOTES.E5, NOTES.D5, NOTES.C5],
    type: 'sine',
    duration: 0.14,
    volume: 0.04,
    stepTime: 220,
  },
  CANDY_MINT: {
    notes: [NOTES.E4, NOTES.G4, NOTES.A4, NOTES.B4, NOTES.A4, NOTES.G4, NOTES.E4, NOTES.B3],
    type: 'triangle',
    duration: 0.16,
    volume: 0.035,
    stepTime: 220,
  },
  CANDY_LEMON: {
    notes: [NOTES.F4, NOTES.A4, NOTES.C5, NOTES.D5, NOTES.C5, NOTES.A4, NOTES.G4, NOTES.F4],
    type: 'sine',
    duration: 0.15,
    volume: 0.04,
    stepTime: 200,
  },
  JUNGLE: {
    notes: [NOTES.C4, NOTES.D4, NOTES.F4, NOTES.G4, NOTES.A4, NOTES.G4, NOTES.F4, NOTES.D4],
    type: 'sine',
    duration: 0.28,
    volume: 0.04,
    stepTime: 300,
  },
  JUNGLE_NIGHT: {
    notes: [NOTES.C3, NOTES.Eb3, NOTES.G3, NOTES.C4, NOTES.Bb3, NOTES.G3, NOTES.Eb3, NOTES.C3],
    type: 'triangle',
    duration: 0.32,
    volume: 0.035,
    stepTime: 320,
  }
};

let bgmIntervalId: any = null;
let bgmStepIndex = 0;
let currentBgmThemeId: string | null = null;
let isBgmPlaying = false;

function playBgmNote(frequency: number, type: OscillatorType, duration: number, volume: number) {
  const ctx = getAudioContext();
  if (!ctx || ctx.state === 'suspended') return;

  try {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    // Smooth envelopes to prevent clipping artifacts
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (error) {
    // Fail silently on synthesis errors
  }
}

export function startBGM(themeId: string, enabled: boolean) {
  if (!enabled) {
    stopBGM();
    return;
  }

  // If already playing the same theme, let it play
  if (isBgmPlaying && currentBgmThemeId === themeId) {
    return;
  }

  // Stop any prior active loops
  stopBGM();

  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  const sequence = BGM_SEQUENCES[themeId] || BGM_SEQUENCES.RETRO_ARCADE;
  currentBgmThemeId = themeId;
  isBgmPlaying = true;
  bgmStepIndex = 0;

  const runTick = () => {
    if (!isBgmPlaying) return;
    const notes = sequence.notes;
    const note = notes[bgmStepIndex % notes.length];
    playBgmNote(note, sequence.type, sequence.duration, sequence.volume);
    bgmStepIndex++;
    
    // Schedule next beat
    bgmIntervalId = setTimeout(runTick, sequence.stepTime);
  };

  runTick();
}

export function stopBGM() {
  isBgmPlaying = false;
  currentBgmThemeId = null;
  if (bgmIntervalId) {
    clearTimeout(bgmIntervalId);
    bgmIntervalId = null;
  }
}


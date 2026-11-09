/**
 * Acoustic & Visual Emergency SOS Beacon Service
 * Synthesizes high-decibel distress sound signals and controls haptic vibration
 */

let audioCtx: AudioContext | null = null;
let activeSirenOscillator: OscillatorNode | null = null;
let activeGainNode: GainNode | null = null;
let sirenInterval: any = null;

export function playSOSMorseSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Morse SOS: ... --- ...
    // dot = 100ms, dash = 300ms, gap = 100ms
    const timing = [
      100, 100, 100, 100, 100, 300, // ...
      300, 100, 300, 100, 300, 300, // ---
      100, 100, 100, 100, 100       // ...
    ];

    let now = ctx.currentTime + 0.1;

    // Dot = 0.1s beep, Dash = 0.3s beep
    const morsePattern = [
      { duration: 0.1, pause: 0.1 },
      { duration: 0.1, pause: 0.1 },
      { duration: 0.1, pause: 0.3 }, // S
      { duration: 0.3, pause: 0.1 },
      { duration: 0.3, pause: 0.1 },
      { duration: 0.3, pause: 0.3 }, // O
      { duration: 0.1, pause: 0.1 },
      { duration: 0.1, pause: 0.1 },
      { duration: 0.1, pause: 0.5 }, // S
    ];

    morsePattern.forEach((item) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(950, now); // High pitch acoustic tone

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.8, now + 0.01);
      gain.gain.setValueAtTime(0.8, now + item.duration);
      gain.gain.linearRampToValueAtTime(0, now + item.duration + 0.01);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + item.duration + 0.02);

      now += item.duration + item.pause;
    });

  } catch (err) {
    console.error('Audio synthesis not allowed without interaction', err);
  }
}

export function startAcousticSiren() {
  stopAcousticSiren();

  try {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    activeOscillatorSweep(audioCtx);
  } catch (err) {
    console.error('Siren failed to start:', err);
  }
}

function activeOscillatorSweep(ctx: AudioContext) {
  let frequency = 600;
  let ascending = true;

  sirenInterval = setInterval(() => {
    if (!ctx || ctx.state === 'closed') return;

    if (ascending) {
      frequency += 40;
      if (frequency >= 1400) ascending = false;
    } else {
      frequency -= 40;
      if (frequency <= 600) ascending = true;
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }, 50);
}

export function stopAcousticSiren() {
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
  if (audioCtx) {
    audioCtx.close().catch(() => {});
    audioCtx = null;
  }
}

// Trigger tactile haptic Morse code vibration pattern on supported devices
export function triggerHapticSOS() {
  if ('vibrate' in navigator) {
    // Morse SOS pattern in milliseconds:
    // S: 100, 100, 100, 100, 100
    // pause: 300
    // O: 300, 100, 300, 100, 300
    // pause: 300
    // S: 100, 100, 100, 100, 100
    const sosVibrationPattern = [
      100, 100, 100, 100, 100, 300,
      300, 100, 300, 100, 300, 300,
      100, 100, 100, 100, 100
    ];
    try {
      navigator.vibrate(sosVibrationPattern);
    } catch {
      // Haptics unavailable
    }
  }
}

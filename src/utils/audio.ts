// Web Audio API DTMF Dial Tone Generator for realistic UI haptics

let audioCtx: AudioContext | null = null;

const DTMF_MAP: Record<string, [number, number]> = {
  '1': [697, 1209],
  '2': [697, 1336],
  '3': [697, 1477],
  '4': [770, 1209],
  '5': [770, 1336],
  '6': [770, 1477],
  '7': [852, 1209],
  '8': [852, 1336],
  '9': [852, 1477],
  '*': [941, 1209],
  '0': [941, 1336],
  '#': [941, 1477],
};

export function playDtmfTone(key: string, durationMs: number = 80) {
  try {
    const freqs = DTMF_MAP[key];
    if (!freqs) return;

    // Lazy load audioContext on user interaction
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      audioCtx = new AudioCtxClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';

    osc1.frequency.value = freqs[0];
    osc2.frequency.value = freqs[1];

    // Minimal gain for eye-safe and ear-safe subtle click/beep
    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + durationMs / 1000);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc1.start();
    osc2.start();

    setTimeout(() => {
      try {
        osc1.stop();
        osc2.stop();
        osc1.disconnect();
        osc2.disconnect();
        gainNode.disconnect();
      } catch (e) {
        // ignore safety stops
      }
    }, durationMs);
  } catch (err) {
    console.warn('Audio Context tone play failed:', err);
  }
}

// Simulated dynamic haptic response
export function triggerHaptic() {
  if (window.navigator && window.navigator.vibrate) {
    try {
      window.navigator.vibrate(15);
    } catch (e) {
      // safe bypass standard restriction
    }
  }
}

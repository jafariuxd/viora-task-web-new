/**
 * Tactile & Audio feedback for Viora Task Completion
 */
export function playTaskCompletedFeedback(): void {
  // 1. Tactile / Haptic feedback (supported on Android/iOS/mobile PWAs)
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate([35, 45, 60]);
    } catch {
      // Ignore vibration permissions error
    }
  }

  // 2. Audio feedback via Web Audio API synthesizer (pleasant modern two-tone confirmation)
  if (typeof window !== 'undefined') {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        // Primary tone: E5 (659.25Hz) gliding to A5 (880Hz)
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(659.25, now);
        osc1.frequency.exponentialRampToValueAtTime(880.0, now + 0.12);

        // Harmonizing bell tone: E6 (1318.5Hz) to A6 (1760Hz)
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1318.5, now);
        osc2.frequency.exponentialRampToValueAtTime(1760.0, now + 0.12);

        // Soft, fast-decaying envelope for a clean chime
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.33);
        osc2.stop(now + 0.33);

        setTimeout(() => {
          try {
            ctx.close();
          } catch {
            // ignore
          }
        }, 400);
      }
    } catch {
      // AudioContext unavailable or restricted by browser autoplay policy
    }
  }
}

const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

export function playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export const feedbackCorrect = () => playTone(880, 0.3);   // tono agudo = correcto
export const feedbackIncorrect = () => playTone(220, 0.4, 'sawtooth'); // tono grave = incorrecto
export const feedbackStart = () => playTone(440, 0.2);

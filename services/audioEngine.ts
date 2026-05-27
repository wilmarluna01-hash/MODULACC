// src/services/audioEngine.ts

let audioCtx: AudioContext | null = null;
let noiseSource: AudioBufferSourceNode | null = null;
let noiseGain: GainNode | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

// Reproduce un tono puro (para discriminación)
export function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.4
): Promise<void> {
  return new Promise((resolve) => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
    osc.onended = () => resolve();
  });
}

// Inicia ruido blanco de fondo (distractor ambiental)
export function startBackgroundNoise(volume = 0.1): void {
  const ctx = getCtx();
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  noiseSource = ctx.createBufferSource();
  noiseSource.buffer = buffer;
  noiseSource.loop = true;

  noiseGain = ctx.createGain();
  noiseGain.gain.value = volume;

  noiseSource.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noiseSource.start();
}

// Detiene el ruido de fondo
export function stopBackgroundNoise(): void {
  try {
    noiseSource?.stop();
    noiseSource?.disconnect();
    noiseGain?.disconnect();
  } catch (_) {}
  noiseSource = null;
  noiseGain = null;
}

// Lee texto en voz alta con Web Speech API
export function speak(text: string, defaultRate = 1.0, lang = 'es-ES'): Promise<void> {
  // Función para limpiar texto y mejorar la síntesis
  const cleanTextForSpeech = (input: string): string => {
    return input
      .replace(/```[\s\S]*?```/g, ' ') // Code blocks
      .replace(/`([^`]+)`/g, '$1') // Inline code
      .replace(/(\*\*|__)(.*?)\1/g, '$2') // Bold
      .replace(/(\*|_)(.*?)\1/g, '$2') // Italics
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
      .replace(/#+\s+/g, ' ') // Headers
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Images
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '') // Emojis
      .replace(/\s+/g, ' ') // Consolidate spaces
      .trim();
  };

  return new Promise((resolve) => {
    // Si ya está hablando, esperamos o cancelamos? Cancelar es necesario para que la nueva voz no se solape
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    const cleanText = cleanTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Obtener voces de forma más robusta
    const voices = window.speechSynthesis.getVoices();
    // Priorizar voces de alta calidad
    const preferredVoice = voices.find(v => v.lang.startsWith(lang) && v.name.includes('Google')) 
                        || voices.find(v => v.lang.startsWith(lang));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    utterance.lang = lang;
    utterance.pitch = 1.0; // Stabilize pitch for better clarity

    const storedProfile = localStorage.getItem('accessibilityProfile');
    const profile = storedProfile ? JSON.parse(storedProfile) : null;
    // Asegurar que la tasa esté en un rango mucho más controlado para mejorar la comprensión
    const rawRate = profile ? profile.readingSpeed : defaultRate;
    utterance.rate = Math.max(0.7, Math.min(1.1, rawRate));
    
    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      console.error('Speech synthesis error', e);
      resolve();
    };
    
    window.speechSynthesis.speak(utterance);
  });
}

// Detiene cualquier voz en curso
export function stopSpeech(): void {
  window.speechSynthesis.cancel();
}

// Espera N milisegundos
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

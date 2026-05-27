import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Brain, Headphones, Mic, Sparkles, AlertCircle } from 'lucide-react';
import { diagnosticEngine } from '../../services/diagnosticEngine';

interface DiagnosticModalProps {
  userId: string;
  onClose: (result: any) => void;
}

const EXERCISE_FLOW = [
  { id: 0, type: 'intro', title: "Exploración Auditiva", content: "Vamos a realizar unas pequeñas actividades para conocer tu nivel de atención y memoria auditiva. Se sentirá como un juego. Presiona abajo para comenzar.", icon: <Sparkles className="w-12 h-12 text-yellow-500" /> },
  { id: 1, type: 'attention', title: "Atención", content: "Escucharás varios sonidos. Presiona 'Registrar respuesta' cuando escuches el timbre de aviso.", icon: <Brain className="w-12 h-12 text-blue-500" /> },
  { id: 2, type: 'memory', title: "Memoria", content: "Escucharás una serie de palabras. Cuando escuches la palabra 'perro', presiona 'Registrar respuesta'.", icon: <Headphones className="w-12 h-12 text-purple-500" /> },
  { id: 3, type: 'discrimination', title: "Discriminación", content: "Escucharás dos sonidos de tono. ¿Son iguales o diferentes?", icon: <Mic className="w-12 h-12 text-green-500" /> },
  { id: 4, type: 'attention', title: "Atención II", content: "Ahora habrá ruido de fondo. Sigue buscando el timbre de aviso. ¡Atención!", icon: <Brain className="w-12 h-12 text-blue-500" /> },
  { id: 5, type: 'memory', title: "Memoria II", content: "Escucharás una serie de palabras. Cuando escuches la palabra 'perro', presiona 'Registrar respuesta'.", icon: <Headphones className="w-12 h-12 text-purple-500" /> },
  { id: 6, type: 'discrimination', title: "Discriminación II", content: "¿Es la misma voz o una diferente?", icon: <Mic className="w-12 h-12 text-green-500" /> },
  { id: 7, type: 'result', title: "Resultados", content: "¡Has completado el diagnóstico! Analizando resultados.", icon: <Sparkles className="w-12 h-12 text-yellow-500" /> },
];

export const DiagnosticModal: React.FC<DiagnosticModalProps> = ({ userId, onClose }) => {
  const [step, setStep] = useState(0);
  const [feedback, setFeedback] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const startTime = useRef<number>(0);
  const performanceData = useRef<any[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  const playTone = (frequency: number, type1: OscillatorType, type2: OscillatorType, duration: number, audioCtx: AudioContext, startTimeOffset: number) => {
    const oscillator1 = audioCtx.createOscillator();
    const oscillator2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator1.type = type1;
    oscillator1.frequency.setValueAtTime(frequency, audioCtx.currentTime + startTimeOffset);
    oscillator2.type = type2;
    oscillator2.frequency.setValueAtTime(frequency * 1.5, audioCtx.currentTime + startTimeOffset);

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime + startTimeOffset);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + startTimeOffset + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + startTimeOffset + duration / 1000);

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator1.start(audioCtx.currentTime + startTimeOffset);
    oscillator2.start(audioCtx.currentTime + startTimeOffset);
    oscillator1.stop(audioCtx.currentTime + startTimeOffset + duration / 1000);
    oscillator2.stop(audioCtx.currentTime + startTimeOffset + duration / 1000);
  };

  const startAttentionExercise = async () => {
    setIsPlaying(true);
    
    try {
      const audio = new Audio('/assets/audio/audio1.mp3');
      
      await audio.play();
      await new Promise((resolve) => {
        audio.onended = resolve;
      });
    } catch (e) {
      console.error("Exercise audio error", e);
      setFeedback("Error reproduciendo sonidos.");
    } finally {
      setIsPlaying(false);
    }
  };

  const startMemoryExercise = async () => {
    setIsPlaying(true);
    const animalList = ['gato', 'elefante', 'leon', 'tigre', 'jirafa', 'cebra', 'perro', 'conejo', 'oso', 'mono'];
    
    try {
      for (const animal of animalList) {
        await speakAndWait(animal);
        await new Promise(r => setTimeout(r, 500));
      }
    } catch (e) {
      console.error("Exercise speech error", e);
      setFeedback("Error reproduciendo palabras.");
    } finally {
      setIsPlaying(false);
    }
  };

  const playDiscriminationExercise = async () => {
    setIsPlaying(true);
    try {
      const audio1 = new Audio('/assets/audio/audiolicuadora1.mp3');
      const audio2 = new Audio('/assets/audio/audiolicuadora2.mp3');
      
      await audio1.play();
      await new Promise((resolve) => {
        audio1.onended = resolve;
      });
      await new Promise(r => setTimeout(r, 500)); // Pause

      await audio2.play();
      await new Promise((resolve) => {
        audio2.onended = resolve;
      });
    } catch (e) {
      console.error("Exercise audio error", e);
      setFeedback("Error reproduciendo sonidos.");
    } finally {
      setIsPlaying(false);
    }
  };

  const nextStep = () => {
    if (step < EXERCISE_FLOW.length - 1) {
      setStep(s => s + 1);
      startTime.current = Date.now();
    } else {
      onClose({ completed: true, metrics: performanceData.current });
    }
  };

  // Speak on step change
  useEffect(() => {
    speak(currentExercise.content);
  }, [step]);

  // Focus management
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    // Helper to get focusable elements
    const getFocusableElements = () => 
      modal.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');

    // Focus the first element when the modal opens initially
    const focusable = getFocusableElements();
    if (focusable.length > 0) {
      focusable[0].focus();
    }
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return; 

      const elements = getFocusableElements();
      if (elements.length === 0) return;

      const first = elements[0];
      const last = elements[elements.length - 1];

      // Trap focus
      if (e.shiftKey) { // Shift+Tab
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else { // Tab
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleKeyDown);
    return () => modal.removeEventListener('keydown', handleKeyDown);
  }, [step, isPlaying]); // Run on step change or playback change to re-focus

  // Separate effect to handle keydown listener to avoid re-adding it unnecessarily?
  // Actually, the current approach is fine but needs careful handling.
  const speakAndWait = (text: string): Promise<void> => {
    return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.onend = () => resolve();
        // window.speechSynthesis.cancel(); // We might not want to cancel here if it disrupts navigation speak
        window.speechSynthesis.speak(utterance);
    });
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleAction = async () => {
    // If it's still playing, we might want to allow them to register their answer
    // already, or stop the exercise. For now, let's just proceed to register
    // the reaction time as the answer, even if they interrupted.
    
    const reactionTime = Date.now() - startTime.current;
    
    // Simple mock metric capture
    const currentEx = EXERCISE_FLOW[step];
    if (currentEx && currentEx.type !== 'intro' && currentEx.type !== 'result') {
      performanceData.current.push({ type: currentEx.type, time: reactionTime, success: true });
    }

    setFeedback("Respuesta registrada.");
    
    setTimeout(() => {
      setFeedback('');
      if (step < EXERCISE_FLOW.length - 1) {
        setStep(s => s + 1);
        startTime.current = Date.now(); // Reset timer for new step
      } else {
        onClose({ completed: true, metrics: performanceData.current });
      }
    }, 800);
  };

  const currentExercise = EXERCISE_FLOW[step];

  if (!currentExercise) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="sr-only" aria-live="assertive" role="alert">
         {currentExercise.title}: {currentExercise.content}
      </div>
      
      <motion.div
        ref={modalRef}
        tabIndex={-1}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg w-full"
        role="dialog"
        aria-modal="true"
        aria-labelledby="diag-title"
        aria-describedby="diag-content"
      >
        <div className="flex justify-center mb-6">{currentExercise.icon}</div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div 
            className="bg-primary h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / EXERCISE_FLOW.length) * 100}%` }}
          ></div>
        </div>

        <h2 id="diag-title" className="text-3xl font-bold mb-4 text-center">{currentExercise.title}</h2>
        <p id="diag-content" className="text-xl mb-8 text-center">{currentExercise.content}</p>
        
        {feedback && <p className="text-center text-blue-600 font-bold mb-4" aria-live="polite">{feedback}</p>}

        <div className="flex flex-col gap-3">
          {currentExercise.type !== 'intro' && currentExercise.type !== 'result' && (
            <button
              onClick={async () => {
                if (isPlaying) return;
                const playFn = currentExercise.type === 'memory' ? startMemoryExercise : currentExercise.type === 'discrimination' ? playDiscriminationExercise : startAttentionExercise;
                await playFn();
              }}
              aria-label="Reproducir sonido del ejercicio"
              className={`w-full py-3 rounded-xl font-semibold transition-all focus:ring-2 focus:ring-blue-500 focus:outline-none ${isPlaying ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              Reproducir sonido
            </button>
          )}

          <button
            onClick={async () => {
              if (isPlaying) return; // Prevent action while audio is playing
              await handleAction();
            }}
            className={`w-full text-white py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 active:scale-95 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none ${isPlaying ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}`}
            aria-label={step === 0 ? "Comenzar diagnóstico" : step === EXERCISE_FLOW.length - 1 ? "Finalizar diagnóstico" : "Registrar respuesta y continuar"}
          >
            {step === 0 ? "Comenzar" : step === EXERCISE_FLOW.length - 1 ? "Finalizar" : "Registrar y continuar"}
          </button>

        </div>
      </motion.div>
    </div>
  );
};

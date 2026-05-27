import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, Brain, Headphones, ChevronRight } from 'lucide-react';
import { speak } from '../../services/audioEngine';

interface OnboardingModalProps {
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const [hasSpoken, setHasSpoken] = useState(false);

  const shortcuts = [
    { name: "Panel Principal", keys: "Alt + d" },
    { name: "Atención Auditiva", keys: "Alt + 1" },
    { name: "Memoria Auditiva", keys: "Alt + 2" },
    { name: "Discriminación Sonora", keys: "Alt + 3" },
    { name: "Tecnología e Informática", keys: "Alt + 4" },
    { name: "Mi Progreso", keys: "Alt + p" },
    { name: "Evaluación Personal", keys: "Alt + e" },
    { name: "Entrenamiento Auditivo", keys: "Alt + 5" },
    { name: "Ayuda", keys: "Alt + h" },
    { name: "Foro de Consultas", keys: "Alt + f" },
    { name: "Cerrar Sesión", keys: "Alt + q" },
    { name: "Escuchar Introducción (Solo en esta pantalla)", keys: "Alt + l" },
    { name: "Siguiente paso", keys: "Alt + n" },
  ];

  const steps = [
    {
      title: "Bienvenido a MODULACC",
      content: "Esta aplicación está diseñada para ayudarte a mejorar tus habilidades auditivas de una manera interactiva y personalizada.",
      icon: <Brain className="w-12 h-12 text-blue-500" />
    },
    {
      title: "Nuestros Objetivos",
      content: "Nos enfocamos en tres pilares fundamentales:\n1. Memoria Auditiva: Retención de sonidos y secuencias.\n2. Atención Auditiva: Concentración en estímulos relevantes.\n3. Discriminación Sonora: Diferenciación precisa entre distintos sonidos.",
      icon: <Headphones className="w-12 h-12 text-green-500" />
    },
    {
      title: "Atajos de Teclado y Accesibilidad",
      content: "Puedes navegar y controlar la aplicación usando atajos de teclado:\n" +
               shortcuts.map(s => `${s.name}: ${s.keys}`).join('\n'),
      icon: <Volume2 className="w-12 h-12 text-purple-500" />
    },
    {
      title: "Cómo funciona",
      content: "Explora los módulos de entrenamiento. Cada ejercicio está diseñado para desafiar y fortalecer tus capacidades auditivas. ¡Sigue tu progreso y disfruta el proceso de aprendizaje!",
      icon: <Volume2 className="w-12 h-12 text-orange-500" />
    }
  ];

  const stepRef = React.useRef(step);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  const playStepSpeech = (stepIndex: number) => {
    const textToSpeak = `${steps[stepIndex].title}. ${steps[stepIndex].content}`;
    console.log(`Speaking step ${stepIndex}: ${steps[stepIndex].title}`);
    speak(textToSpeak);
  };

  // Automatic speech trigger
  useEffect(() => {
    if (step !== 0 || hasSpoken) {
      playStepSpeech(step);
    }
  }, [step, hasSpoken]);

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log(`OnboardingModal keydown: ${e.key}, altKey: ${e.altKey}`);
      if (e.altKey) {
        if (e.key.toLowerCase() === 'l') {
          e.preventDefault();
          playStepSpeech(stepRef.current);
        } else if (e.key.toLowerCase() === 'n') {
          e.preventDefault();
          setStep(prev => Math.min(prev + 1, steps.length - 1));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // Only on mount/unmount

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-8 max-w-lg w-full relative shadow-xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>

          <div className="flex flex-col items-center text-center">
            {steps[step].icon}
            <h2 className="text-2xl font-bold mt-4 mb-2">{steps[step].title}</h2>
            <p className="text-gray-600 mb-6 whitespace-pre-line">{steps[step].content}</p>

            {step === 0 && !hasSpoken && (
              <button
                onClick={() => {
                  setHasSpoken(true);
                  playStepSpeech(step);
                }}
                className="mb-6 flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full hover:bg-blue-200"
              >
                <Volume2 size={20} /> ¡Haz clic aquí para escuchar la introducción!
              </button>
            )}

            <div className="flex items-center gap-2 mb-6">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${index === step ? 'bg-blue-600' : 'bg-gray-300'}`}
                />
              ))}
            </div>

            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                Siguiente <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                ¡Empezar!
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

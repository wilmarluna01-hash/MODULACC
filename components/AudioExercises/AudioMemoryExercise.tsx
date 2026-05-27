// src/components/AudioExercises/AudioMemoryExercise.tsx
import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { AudioConfig } from '../../types';
import { speak, wait } from '../../services/audioEngine';
import { AccessibleButton } from '../Shared/AccessibleButton';

interface Props {
  audioConfig: AudioConfig;
  difficulty: number;
  onAnswer: (isCorrect: boolean, reactionTimeMs: number) => void;
  isFeedbackGiven: boolean;
}

export interface AudioMemoryExerciseHandle {
  playSequence: () => Promise<void>;
}

export const AudioMemoryExercise = forwardRef<AudioMemoryExerciseHandle, Props>(({
  audioConfig, difficulty, onAnswer, isFeedbackGiven
}, ref) => {
  const sequence = audioConfig.sequenceItems || [];
  const [phase, setPhase] = useState<'idle' | 'playing' | 'answering'>('idle');
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const startTime = React.useRef<number>(0);

  useEffect(() => {
    setPhase('idle');
    setUserSequence([]);
  }, [audioConfig]);

  const playSequence = async () => {
    setPhase('playing');
    setUserSequence([]);
    await speak('Escucha la secuencia:', 1.2);
    await wait(500);
    for (const item of sequence) {
      await speak(item, difficulty === 3 ? 1.6 : 1.3);
      await wait(200);
    }
    await speak('Ahora repite la secuencia en orden.', 1.3);
    startTime.current = Date.now();
    setPhase('answering');
  };

  useImperativeHandle(ref, () => ({
    playSequence
  }));

  const handleSelect = (item: string) => {
    if (isFeedbackGiven) return;
    const next = [...userSequence, item];
    setUserSequence(next);
    if (next.length === sequence.length) {
      const reactionTime = Date.now() - startTime.current;
      const isCorrect = next.every((v, i) => v === sequence[i]);
      onAnswer(isCorrect, reactionTime);
    }
  };

  // Opciones: la secuencia correcta + distractores mezclados
  const allOptions = Array.from(
    new Set([...sequence, ...(audioConfig.distractorTexts || [])])
  ).sort(() => Math.random() - 0.5);

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 text-purple-800">
        <p className="font-bold mb-1">🧠 Ejercicio de memoria auditiva</p>
        <p className="text-sm">Escucha la secuencia de {sequence.length} elementos y repítela en el mismo orden.</p>
        <p className="text-sm mt-1 opacity-70">
          Nivel: {'★'.repeat(difficulty)}{'☆'.repeat(3 - difficulty)}
        </p>
      </div>

      {phase === 'idle' && (
        <AccessibleButton onClick={playSequence} variant="primary" size="lg" fullWidth className="rounded-xl" iconLeft={<i className="fas fa-headphones"></i>}>
          {isFeedbackGiven ? 'Escuchar secuencia de nuevo' : 'Escuchar secuencia'}
        </AccessibleButton>
      )}

      {phase === 'playing' && (
        <div className="text-center p-6 bg-purple-50 border border-purple-200 rounded-2xl" aria-live="polite">
          <i className="fas fa-music text-2xl text-purple-600 animate-pulse"></i>
          <p className="font-bold text-purple-700 mt-2">Reproduciendo secuencia...</p>
        </div>
      )}

      {phase === 'answering' && (
        <div className="space-y-4" aria-live="polite">
          <div className="flex flex-wrap gap-2 min-h-12 bg-slate-100 p-3 rounded-xl">
            {userSequence.length === 0
              ? <span className="text-slate-400 text-sm">Tu secuencia aparecerá aquí...</span>
              : userSequence.map((item, i) => (
                <span key={i} className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">{item}</span>
              ))
            }
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {allOptions.map((item, i) => (
              <AccessibleButton
                key={i}
                onClick={() => handleSelect(item)}
                disabled={isFeedbackGiven || userSequence.length >= sequence.length}
                variant="secondary"
                className="rounded-xl py-4 font-bold text-base"
              >
                {item}
              </AccessibleButton>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

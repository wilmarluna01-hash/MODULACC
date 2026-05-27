// src/components/AudioExercises/AudioDiscriminationExercise.tsx
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

export interface AudioDiscriminationExerciseHandle {
  playBoth: () => Promise<void>;
}

export const AudioDiscriminationExercise = forwardRef<AudioDiscriminationExerciseHandle, Props>(({
  audioConfig, difficulty, onAnswer, isFeedbackGiven
}, ref) => {
  const [phase, setPhase] = useState<'idle' | 'playing' | 'answering'>('idle');
  const startTime = React.useRef<number>(0);

  useEffect(() => {
    setPhase('idle');
  }, [audioConfig]);

  // stimulusText = primer sonido, distractorTexts[0] = segundo sonido
  const soundA = audioConfig.stimulusText;
  const soundB = audioConfig.distractorTexts?.[0] || audioConfig.stimulusText;
  // correctAnswer viene del campo exercise.correctAnswer: 'igual' o 'diferente'
  const areEqual = soundA === soundB;

  const playBoth = async () => {
    setPhase('playing');
    await speak('Sonido A:', 1.2);
    await wait(200);
    await speak(soundA, difficulty === 3 ? 1.6 : 1.3);
    await wait(400);
    await speak('Sonido B:', 1.2);
    await wait(200);
    await speak(soundB, difficulty === 3 ? 1.6 : 1.3);
    await wait(200);
    await speak('¿Son iguales o diferentes?', 1.2);
    startTime.current = Date.now();
    setPhase('answering');
  };

  useImperativeHandle(ref, () => ({
    playBoth
  }));

  const handleAnswer = (userSaysEqual: boolean) => {
    if (isFeedbackGiven) return;
    const reactionTime = Date.now() - startTime.current;
    const isCorrect = userSaysEqual === areEqual;
    onAnswer(isCorrect, reactionTime);
  };

  return (
    <div className="space-y-6">
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 text-orange-800">
        <p className="font-bold mb-1">🔊 Ejercicio de discriminación sonora</p>
        <p className="text-sm">Escucha dos sonidos y decide si son iguales o diferentes.</p>
        <p className="text-sm mt-1 opacity-70">
          Nivel: {'★'.repeat(difficulty)}{'☆'.repeat(3 - difficulty)}
        </p>
      </div>

      {phase === 'idle' && (
        <AccessibleButton onClick={playBoth} variant="primary" size="lg" fullWidth className="rounded-xl" iconLeft={<i className="fas fa-ear-deaf"></i>}>
          {isFeedbackGiven ? 'Reproducir sonidos de nuevo' : 'Reproducir los dos sonidos'}
        </AccessibleButton>
      )}

      {phase === 'playing' && (
        <div className="text-center p-6 bg-orange-50 border border-orange-200 rounded-2xl" aria-live="polite">
          <i className="fas fa-volume-up text-2xl text-orange-600 animate-pulse"></i>
          <p className="font-bold text-orange-700 mt-2">Reproduciendo sonidos...</p>
        </div>
      )}

      {phase === 'answering' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-live="polite">
          <AccessibleButton onClick={() => handleAnswer(true)} disabled={isFeedbackGiven} variant="secondary" size="lg" fullWidth className="rounded-xl border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50" iconLeft={<i className="fas fa-equals"></i>}>
            Son iguales
          </AccessibleButton>
          <AccessibleButton onClick={() => handleAnswer(false)} disabled={isFeedbackGiven} variant="secondary" size="lg" fullWidth className="rounded-xl border-2 border-rose-300 text-rose-700 hover:bg-rose-50" iconLeft={<i className="fas fa-not-equal"></i>}>
            Son diferentes
          </AccessibleButton>
        </div>
      )}
    </div>
  );
});

// src/components/AudioExercises/AudioAttentionExercise.tsx
import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { AudioConfig } from '../../types';
import { speak, startBackgroundNoise, stopBackgroundNoise, wait } from '../../services/audioEngine';
import { AccessibleButton } from '../Shared/AccessibleButton';

interface Props {
  audioConfig: AudioConfig;
  difficulty: number;
  onAnswer: (isCorrect: boolean, reactionTimeMs: number) => void;
  isFeedbackGiven: boolean;
}

export interface AudioAttentionExerciseHandle {
  runExercise: () => Promise<void>;
}

export const AudioAttentionExercise = forwardRef<AudioAttentionExerciseHandle, Props>(({
  audioConfig, difficulty, onAnswer, isFeedbackGiven
}, ref) => {
  const [phase, setPhase] = useState<'idle' | 'playing' | 'waiting'>('idle');
  const [heard, setHeard] = useState(false);
  const startTimeRef = useRef<number>(0);

  const runExercise = async () => {
    setPhase('playing');
    setHeard(false);

    // Nivel de ruido aumenta con dificultad
    const noiseVolume = difficulty === 1 ? 0 : difficulty === 2 ? 0.05 : 0.12;
    if (noiseVolume > 0) startBackgroundNoise(noiseVolume);

    // Leer distractores primero si existen
    if (audioConfig.distractorTexts) {
      for (const distractor of audioConfig.distractorTexts) {
        await speak(distractor, 1.2);
        await wait(300);
      }
    }

    // Leer el estímulo objetivo
    await speak(`${audioConfig.stimulusText}`, 1.2);
    stopBackgroundNoise();

    startTimeRef.current = Date.now();
    setPhase('waiting');
  };

  useImperativeHandle(ref, () => ({
    runExercise
  }));

  const handleDetected = () => {
    if (phase !== 'waiting' || heard || isFeedbackGiven) return;
    const reactionTime = Date.now() - startTimeRef.current;
    setHeard(true);
    onAnswer(true, reactionTime);
  };

  const handleMissed = () => {
    if (phase !== 'waiting' || heard || isFeedbackGiven) return;
    setHeard(true);
    onAnswer(false, 0);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-blue-800">
        <p className="font-bold mb-1">🎯 Objetivo auditivo:</p>
        <p className="text-lg">"{audioConfig.targetItem || audioConfig.stimulusText}"</p>
        <p className="text-sm mt-2 opacity-70">
          Nivel de dificultad: {'★'.repeat(difficulty)}{'☆'.repeat(3 - difficulty)}
        </p>
      </div>

      {phase === 'idle' && (
        <AccessibleButton
          onClick={runExercise}
          variant="primary"
          size="lg"
          fullWidth
          className="rounded-xl"
          iconLeft={<i className="fas fa-play"></i>}
        >
          {isFeedbackGiven ? 'Escuchar de nuevo' : 'Iniciar ejercicio auditivo'}
        </AccessibleButton>
      )}

      {phase === 'playing' && (
        <div className="text-center p-6 bg-amber-50 border border-amber-200 rounded-2xl" aria-live="polite">
          <div className="flex items-center justify-center gap-3 text-amber-700">
            <i className="fas fa-volume-up text-2xl animate-pulse"></i>
            <p className="font-bold text-lg">Escucha con atención...</p>
          </div>
        </div>
      )}

      {phase === 'waiting' && !heard && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-live="polite">
          <AccessibleButton
            onClick={handleDetected}
            disabled={isFeedbackGiven}
            variant="primary"
            size="lg"
            fullWidth
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
            iconLeft={<i className="fas fa-check"></i>}
          >
            ¡Lo escuché!
          </AccessibleButton>
          <AccessibleButton
            onClick={handleMissed}
            disabled={isFeedbackGiven}
            variant="secondary"
            size="lg"
            fullWidth
            className="rounded-xl"
            iconLeft={<i className="fas fa-times"></i>}
          >
            No lo escuché
          </AccessibleButton>
        </div>
      )}
    </div>
  );
});

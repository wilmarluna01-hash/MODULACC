import React, { useState, useEffect, useCallback } from 'react';
import { AudioExercise } from '../../data/audioExercises';
import { playStimulus, playBackgroundNoise, stopAll, speak } from '../../services/audioEngine';
import { saveAttempt } from '../../services/audioProgressService';
import { feedbackCorrect, feedbackIncorrect } from '../../services/audioFeedback';
import { Timestamp } from 'firebase/firestore';
import { AccessibleButton } from '../Shared/AccessibleButton';

interface ExercisePlayerProps {
  exercise: AudioExercise;
  userId: string;
  onComplete: () => void;
}

export const ExercisePlayer: React.FC<ExercisePlayerProps> = ({ exercise, userId, onComplete }) => {
  const [startedAt] = useState(Timestamp.now());
  const [startTime] = useState(Date.now());
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const runExercise = async () => {
      // 1. Instrucciones
      await speak(exercise.instructions);
      
      // 2. Ruido de fondo
      if (exercise.noiseLevel && exercise.noiseLevel > 0) {
        playBackgroundNoise('white', exercise.noiseLevel);
      }

      // 3. Reproducir estímulos (ejemplo simplificado)
      for (const stimulus of exercise.stimuli) {
        await playStimulus(stimulus);
      }
    };

    runExercise();
    return () => stopAll();
  }, [exercise]);

  const handleResponse = async (stimulusId: string) => {
    const isCorrect = stimulusId === exercise.targetStimulus;
    const durationMs = Date.now() - startTime;
    const reactionTimeMs = durationMs; // Simplificado

    if (isCorrect) {
      feedbackCorrect();
      await speak("Correcto, bien hecho");
    } else {
      feedbackIncorrect();
      await speak("Incorrecto");
    }

    await saveAttempt({
      userId,
      exerciseId: exercise.id,
      exerciseType: exercise.type,
      difficulty: exercise.difficulty,
      startedAt: startedAt,
      durationMs,
      reactionTimeMs,
      isCorrect,
      stimulusResponse: stimulusId,
      score: isCorrect ? 100 : 0
    });

    setIsFinished(true);
    onComplete();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">{exercise.title}</h2>
      {!isFinished && (
        <div className="space-y-4">
          {exercise.stimuli.map((st) => (
            <AccessibleButton key={st.id} onClick={() => handleResponse(st.id)}>
              Seleccionar {st.id}
            </AccessibleButton>
          ))}
        </div>
      )}
      {isFinished && <p>Ejercicio completado.</p>}
    </div>
  );
};

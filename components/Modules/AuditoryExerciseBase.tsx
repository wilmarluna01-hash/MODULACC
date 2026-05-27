
import React, { useState, useEffect, ChangeEvent, useCallback, useRef } from 'react';
import { AccessibleButton } from '../Shared/AccessibleButton';
import { AccessibleInput } from '../Shared/AccessibleInput';
import { Exercise } from '../../types';
import { toast } from '../Shared/Toast';
import { LoadingSpinner } from '../Shared/LoadingSpinner';
import { useScreenReader } from '../Shared/ScreenReaderProvider';
import { extractTextFromFile } from '../../services/geminiService';
import { feedbackCorrect, feedbackIncorrect } from '../../services/audioFeedback';
import { AudioAttentionExercise } from '../AudioExercises/AudioAttentionExercise';
import { AudioMemoryExercise } from '../AudioExercises/AudioMemoryExercise';
import { AudioDiscriminationExercise } from '../AudioExercises/AudioDiscriminationExercise';
import { stopBackgroundNoise } from '../../services/audioEngine';

import { motion } from 'framer-motion';

// ... (resto del componente)

interface ExerciseBaseProps {
  exercise: Exercise;
  moduleTitle: string;
  onNextExercise: () => void;
  onSaveProgress: (response: any) => Promise<void>;
}

export const AuditoryExerciseBase: React.FC<ExerciseBaseProps> = ({
  exercise,
  moduleTitle,
  onNextExercise,
  onSaveProgress,
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [reactionTimeMs, setReactionTimeMs] = useState<number>(0);
  const { speak, isEnabled, stop, isSpeaking } = useScreenReader();
  const exerciseRef = useRef<any>(null);

  const readExercise = useCallback(() => {
    let textToRead = `Ejercicio: ${exercise.title}. `;
    if (exercise.content) {
      textToRead += `Contenido: ${exercise.content}. `;
    }
    textToRead += `Instrucción: ${exercise.instruction}. `;
    
    if (exercise.possibleAnswers && exercise.possibleAnswers.length > 0) {
      textToRead += "Opciones disponibles: ";
      exercise.possibleAnswers.forEach((option, index) => {
        textToRead += `Opción ${String.fromCharCode(65 + index)}: ${option}. `;
      });
    }
    
    speak(textToRead, 'high');
  }, [exercise, speak]);

  const handleReadFileContent = async () => {
    if (!exercise.fileUrl) return;
    
    setIsReadingFile(true);
    try {
      const extractedText = await extractTextFromFile(exercise.fileUrl);
      if (!extractedText || extractedText.trim().length === 0) {
        toast.error("No se encontró texto legible en el archivo.");
        return;
      }
      
      toast.info("Iniciando lectura del archivo...");
      speak(`Contenido del archivo: ${extractedText}`, 'high');
    } catch (error) {
      console.error("Error reading file content:", error);
      toast.error("No se pudo extraer el texto del archivo.");
    } finally {
      setIsReadingFile(false);
    }
  };

  useEffect(() => {
    setUserAnswer('');
    setFeedback('');
    setIsSubmitting(false);
    setReactionTimeMs(0);
  }, [exercise]);

  // Automatically read the exercise when it loads if screen reader is enabled
  useEffect(() => {
      const timer = setTimeout(() => {
        readExercise();
      }, 500); // Small delay to ensure page transition is smooth
      return () => clearTimeout(timer);
    }, [exercise, isEnabled, readExercise]);

  const handleAudioAnswer = useCallback((isCorrect: boolean, reactionTime: number) => {
    stopBackgroundNoise();
    setReactionTimeMs(reactionTime);
    setUserAnswer(isCorrect ? exercise.correctAnswer : '__audio_incorrect__');
    
    const msg = isCorrect ? '¡Correcto! Buen trabajo.' : 'No fue correcto, inténtalo de nuevo.';
    setFeedback(msg);
    speak(msg, 'high');
    isCorrect ? feedbackCorrect() : feedbackIncorrect();
  
    onSaveProgress({
      exerciseId: exercise.id,
      answer: isCorrect ? exercise.correctAnswer : 'incorrect',
      isCorrect,
      reactionTimeMs: reactionTime,
      exerciseType: exercise.exerciseType,
      difficulty: exercise.difficulty || 1,
      timestamp: new Date(),
    }).catch(console.error);
  }, [exercise, onSaveProgress, speak]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFeedback('');

    let isCorrectMock = false;
    if (exercise.correctAnswer) {
      isCorrectMock = userAnswer.trim().toLowerCase() === exercise.correctAnswer.toLowerCase();
    }

    const responsePayload = {
      exerciseId: exercise.id,
      answer: userAnswer,
      isCorrect: isCorrectMock,
      timestamp: new Date(),
    };

    try {
      await onSaveProgress(responsePayload);

      const feedbackMessage = isCorrectMock ? "¡Correcto! Buen trabajo." : "Respuesta registrada. Revisa la solución si está disponible.";
      setFeedback(feedbackMessage);
      toast.success(feedbackMessage);
      
      if (isCorrectMock) {
        feedbackCorrect();
      } else {
        feedbackIncorrect();
      }

      speak(feedbackMessage, 'high');

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error al guardar el progreso.";
        setFeedback(errorMessage);
        toast.error(errorMessage);
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleNext = () => {
    setFeedback('');
    setUserAnswer('');
    onNextExercise();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Siguiente ejercicio
      if (feedback && event.altKey && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        event.stopPropagation();
        handleNext();
      }
      // Escuchar/Detener audio
      if (event.altKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        event.stopPropagation();
        
        // Si hay un ejercicio auditivo, reproducir el audio del ejercicio
        if (exerciseRef.current) {
          if (exercise.exerciseType === 'audio_attention') exerciseRef.current.runExercise();
          else if (exercise.exerciseType === 'audio_memory') exerciseRef.current.playSequence();
          else if (exercise.exerciseType === 'audio_discrimination') exerciseRef.current.playBoth();
        } else {
          // Si no hay ejercicio auditivo, o falla la ref, leer instrucciones
          if (isSpeaking) {
            stop();
          } else {
            readExercise();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [feedback, handleNext, isSpeaking, stop, readExercise]);

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-8">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">{moduleTitle}</h2>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-primary-light/20 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
              {(exercise as any).subject || 'General'}
            </span>
            <h3 className="text-xl font-bold text-slate-800">{exercise.title}</h3>
          </div>
        </div>
        <div className="flex gap-2">
          <AccessibleButton
            onClick={isSpeaking ? stop : readExercise}
            variant="secondary"
            size="sm"
            className={`rounded-full w-12 h-12 flex items-center justify-center p-0 border-none transition-colors ${isSpeaking ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
            ariaLabel={isSpeaking ? "Detener lectura" : "Escuchar pregunta e instrucciones"}
            title={isSpeaking ? "Detener" : "Escuchar Pregunta"}
          >
            <i className={`fas ${isSpeaking ? 'fa-stop' : 'fa-volume-up'} text-lg`}></i>
          </AccessibleButton>
        </div>
      </header>

      <div className="border-t border-slate-100 pt-6 space-y-6">
        {exercise.content && (
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 italic text-slate-700 leading-relaxed">
            {exercise.content}
          </div>
        )}

        {exercise.fileUrl && (
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <i className="fas fa-paperclip"></i> Archivo Adjunto
            </h4>
            {exercise.fileUrl.startsWith('data:image/') ? (
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
                <img 
                  src={exercise.fileUrl} 
                  alt={`Material para ${exercise.title}`} 
                  className="max-w-full h-auto mx-auto"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                    <i className="fas fa-file-alt text-lg"></i>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{exercise.fileName || 'Documento de actividad'}</p>
                    <p className="text-xs text-slate-500">Haz clic para ver o descargar</p>
                  </div>
                </div>
                <a 
                  href={exercise.fileUrl} 
                  download={exercise.fileName || 'actividad'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-dark transition-colors"
                >
                  Abrir Archivo
                </a>
              </div>
            )}
            <div className="flex gap-2">
              <AccessibleButton
                onClick={handleReadFileContent}
                disabled={isReadingFile || isSpeaking}
                variant="secondary"
                size="sm"
                fullWidth
                className="bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 rounded-xl py-3"
                iconLeft={isReadingFile ? <LoadingSpinner size="sm"/> : <i className="fas fa-volume-up"></i>}
              >
                {isReadingFile ? 'Extrayendo texto...' : 'Escuchar contenido'}
              </AccessibleButton>
              {isSpeaking && (
                <AccessibleButton
                  onClick={stop}
                  variant="secondary"
                  size="sm"
                  className="bg-red-50 text-red-600 border-red-100 hover:bg-red-100 rounded-xl py-3 px-6"
                  iconLeft={<i className="fas fa-stop"></i>}
                >
                  Detener
                </AccessibleButton>
              )}
            </div>
          </div>
        )}

        <p className="text-slate-800 font-medium text-lg leading-relaxed" id="exercise-instruction">
          {exercise.instruction}
        </p>
      </div>
      
      <section aria-labelledby="response-section-title" className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <h4 id="response-section-title" className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <i className="fas fa-pen-nib text-primary"></i> Tu Respuesta
        </h4>

        {/* EJERCICIOS AUDITIVOS NUEVOS */}
        {exercise.exerciseType === 'audio_attention' && exercise.audioConfig && (
          <AudioAttentionExercise
            ref={exerciseRef}
            audioConfig={exercise.audioConfig}
            difficulty={exercise.difficulty || 1}
            onAnswer={handleAudioAnswer}
            isFeedbackGiven={!!feedback}
          />
        )}

        {exercise.exerciseType === 'audio_memory' && exercise.audioConfig && (
          <AudioMemoryExercise
            ref={exerciseRef}
            audioConfig={exercise.audioConfig}
            difficulty={exercise.difficulty || 1}
            onAnswer={handleAudioAnswer}
            isFeedbackGiven={!!feedback}
          />
        )}

        {exercise.exerciseType === 'audio_discrimination' && exercise.audioConfig && (
          <AudioDiscriminationExercise
            ref={exerciseRef}
            audioConfig={exercise.audioConfig}
            difficulty={exercise.difficulty || 1}
            onAnswer={handleAudioAnswer}
            isFeedbackGiven={!!feedback}
          />
        )}

        {/* EJERCICIOS TEXTUALES EXISTENTES — solo se muestran si NO es un tipo auditivo */}
        {(!exercise.exerciseType || 
          exercise.exerciseType === 'multiple_choice' || 
          exercise.exerciseType === 'text_input') && (
          <>
            {exercise.possibleAnswers && exercise.possibleAnswers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {exercise.possibleAnswers.map((option, index) => (
                  <AccessibleButton
                    key={index}
                    onClick={() => !feedback && setUserAnswer(option)}
                    variant={userAnswer === option ? 'primary' : 'secondary'}
                    aria-pressed={userAnswer === option}
                    disabled={!!feedback}
                    fullWidth
                    className={`text-left justify-start px-6 py-4 rounded-xl transition-all ${userAnswer === option ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                  >
                    <span className="mr-3 font-bold opacity-50">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </AccessibleButton>
                ))}
              </div>
            ) : (
              <AccessibleInput
                id="text-answer"
                label="Escribe tu respuesta aquí:"
                value={userAnswer}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setUserAnswer(e.target.value)}
                disabled={isSubmitting || !!feedback}
                containerClassName="mb-3"
              />
            )}
          </>
        )}
      </section>

      {isSubmitting && <LoadingSpinner text="Enviando respuesta..." />}
      
      {feedback && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-2xl border ${feedback.includes("Correcto") ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full ${feedback.includes("Correcto") ? 'bg-emerald-200' : 'bg-amber-200'}`}>
              <i className={`fas ${feedback.includes("Correcto") ? 'fa-check' : 'fa-info-circle'}`}></i>
            </div>
            <div>
              <p className="font-bold text-lg mb-1">{feedback}</p>
              {(exercise as any).explanation && (
                <p className="text-sm opacity-90 mt-2 italic">
                  <strong>Explicación:</strong> {(exercise as any).explanation}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        {/* El botón de enviar solo aparece para ejercicios textuales */}
        {(!exercise.exerciseType ||
          exercise.exerciseType === 'multiple_choice' || 
          exercise.exerciseType === 'text_input') && (
          <AccessibleButton
            onClick={handleSubmit}
            disabled={!userAnswer.trim() || isSubmitting || !!feedback}
            variant="primary"
            size="lg"
            className="flex-1 rounded-xl"
            iconLeft={isSubmitting ? <LoadingSpinner size="sm"/> : <i className="fas fa-paper-plane"></i>}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Respuesta'}
          </AccessibleButton>
        )}
        {feedback && (
          <AccessibleButton
            onClick={handleNext}
            variant="secondary"
            size="lg"
            className="flex-1 rounded-xl"
            iconRight={<i className="fas fa-arrow-right"></i>}
          >
            Siguiente Ejercicio
          </AccessibleButton>
        )}
      </div>
    </div>
  );
};

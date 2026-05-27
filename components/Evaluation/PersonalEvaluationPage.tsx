
import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../../App';
import { AccessibleButton } from '../Shared/AccessibleButton';
import { toast } from '../Shared/Toast';
import { LoadingSpinner } from '../Shared/LoadingSpinner';
import { ScaleQuestion } from './ScaleQuestion';
import { useScreenReader } from '../Shared/ScreenReaderProvider';

interface EvaluationData {
  userId: string;
  participation: string;
  understanding: string;
  autonomy: string;
  techUsage: string;
  responsibility: string;
  submissionDate: Date;
}

const criteria = [
  {
    id: 'participation',
    question: '¿Qué tanto has participado en las actividades de clase?',
    audioQuestion: '¿Qué tanto has participado en las actividades de clase? Responde: poco, algo o mucho.',
    feedback: { Poco: 'Tu participación es clave. Intentaremos encontrar formas para que te sientas más cómodo/a compartiendo.', Algo: '¡Buen trabajo! Estás participando, sigue así.', Mucho: '¡Excelente! Tu aporte enriquece mucho al grupo.' }
  },
  {
    id: 'understanding',
    question: '¿Qué tan bien entiendes los temas que hemos visto?',
    audioQuestion: '¿Qué tan bien entiendes los temas que hemos visto? Responde: poco, algo o mucho.',
    feedback: { Poco: 'No te preocupes, revisaremos los temas juntos para que todo quede claro.', Algo: 'Vas por buen camino, sigamos practicando.', Mucho: '¡Muy bien! Demuestras un gran dominio del contenido.' }
  },
  {
    id: 'autonomy',
    question: '¿Qué tanto logras realizar tus tareas sin ayuda?',
    audioQuestion: '¿Qué tanto logras realizar tus tareas sin ayuda? Responde: poco, algo o mucho.',
    feedback: { Poco: 'Está bien pedir ayuda. Vamos a trabajar en pasos pequeños para que ganes confianza.', Algo: 'Estás ganando independencia, ¡sigue así!', Mucho: '¡Felicidades! Eres muy capaz de realizar tus tareas por ti mismo/a.' }
  },
  {
    id: 'techUsage',
    question: '¿Qué tan cómodo/a te sientes usando las herramientas digitales?',
    audioQuestion: '¿Qué tan cómodo te sientes usando las herramientas digitales? Responde: poco, algo o mucho.',
    feedback: { Poco: 'Las herramientas pueden parecer difíciles al principio. Vamos a aprender a usarlas paso a paso.', Algo: 'Estás familiarizándote con ellas, ¡muy bien!', Mucho: '¡Excelente! Manejas las herramientas con mucha soltura.' }
  },
  {
    id: 'responsibility',
    question: '¿Qué tanto cumples con tus tareas a tiempo?',
    audioQuestion: '¿Qué tanto cumples con tus tareas a tiempo? Responde: poco, algo o mucho.',
    feedback: { Poco: 'Organizar el tiempo puede ser difícil. Vamos a buscar estrategias para ayudarte a cumplir.', Algo: 'Estás cumpliendo, intenta mantener esa constancia.', Mucho: '¡Muy bien! Tu responsabilidad es un gran ejemplo.' }
  }
];

// Mock API for saving evaluation
const savePersonalEvaluation = async (evaluation: EvaluationData): Promise<void> => {
  console.log('API Call: Saving personal evaluation', evaluation);
  await new Promise(resolve => setTimeout(resolve, 1000));
  if (Math.random() < 0.1) throw new Error("Error simulado al guardar la evaluación.");
  return Promise.resolve();
};

export const PersonalEvaluationPage: React.FC = () => {
  const auth = useContext(AuthContext);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { speak, isEnabled, stop } = useScreenReader();
  const hasSpoken = useRef(false);

  useEffect(() => {
    if (!isEnabled) {
      stop();
      hasSpoken.current = false;
      return;
    }

    if (hasSpoken.current) return;
    hasSpoken.current = true;

    const allQuestionsText = criteria.map((c, index) => 
      `Pregunta ${index + 1}: ${c.question}. Opciones: Poco, Algo, Mucho.`
    ).join(' ');

    speak("Evaluación Personal. Reflexiona sobre tu proceso de aprendizaje y establece metas futuras. " + allQuestionsText, 'high');

    return () => {
      stop();
      hasSpoken.current = false;
    };
  }, [speak, isEnabled, stop]);

  if (!auth?.currentUser) {
    return <p className="text-center">Debes iniciar sesión para acceder a esta página.</p>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const evaluationData: EvaluationData = {
      userId: auth.currentUser!.id,
      ...answers as any,
      submissionDate: new Date(),
    };

    try {
      await savePersonalEvaluation(evaluationData);
      toast.success("Evaluación guardada exitosamente.");
      setAnswers({});
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar la evaluación.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-primary mb-2">Evaluación Personal</h1>
        <p className="text-gray-700">Reflexiona sobre tu proceso de aprendizaje y establece metas futuras.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {criteria.map((c) => (
          <ScaleQuestion
            key={c.id}
            id={c.id}
            question={c.question}
            audioQuestion={c.audioQuestion}
            value={answers[c.id] || ''}
            onChange={(val) => setAnswers(prev => ({ ...prev, [c.id]: val }))}
            feedback={c.feedback[answers[c.id] as keyof typeof c.feedback] || ''}
          />
        ))}

        <div className="pt-4 border-t">
          <AccessibleButton
            type="submit"
            disabled={isSubmitting || Object.keys(answers).length < criteria.length}
            variant="primary"
            size="lg"
            iconLeft={isSubmitting ? <LoadingSpinner size="sm"/> : <i className="fas fa-save"></i>}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Evaluación'}
          </AccessibleButton>
        </div>
      </form>
    </div>
  );
};

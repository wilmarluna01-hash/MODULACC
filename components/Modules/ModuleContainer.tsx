
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs, orderBy, addDoc, Timestamp } from 'firebase/firestore';
import { AuditoryExerciseBase } from './AuditoryExerciseBase';
import { CommunicationsSection } from './CommunicationsSection';
import { PeriodSection } from './PeriodSection';
import { Exercise, ExerciseResponse, Role } from '../../types';
import { LoadingSpinner } from '../Shared/LoadingSpinner';
import { toast } from '../Shared/Toast';
import { AuthContext } from '../../App';
import { AdminExerciseManager } from '../Admin/AdminExerciseManager';
import { feedbackCorrect, feedbackIncorrect } from '../../services/audioFeedback';

interface ModuleContainerProps {
  moduleId: 'auditory-attention' | 'auditory-memory' | 'auditory-survey' | 'technology';
  moduleTitle: string;
}

export const ModuleContainer: React.FC<ModuleContainerProps> = ({ moduleId, moduleTitle }) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = useContext(AuthContext);

  const isAdmin = auth?.currentUser?.role === Role.Admin;

  const fetchExercises = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'exercises'),
        where('moduleId', '==', moduleId),
        orderBy('order', 'asc'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedExercises: Exercise[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedExercises.push({
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date()
        } as Exercise);
      });
      setExercises(fetchedExercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      toast.error("Error al cargar los ejercicios.");
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const handleNextExercise = useCallback(() => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      toast.success("¡Has completado todos los ejercicios de este módulo!");
      setCurrentExerciseIndex(prev => prev + 1); 
    }
  }, [currentExerciseIndex, exercises.length]);

  const handleSaveProgress = async (response: any) => {
    try {
      const userId = auth?.currentUser?.id || "anonymous"; 
      const progressData = {
        ...response,
        userId,
        moduleId,
        timestamp: Timestamp.now()
      };
      await addDoc(collection(db, 'progress'), progressData);
      feedbackCorrect();
    } catch (error) {
       console.error("Error saving progress:", error);
       feedbackIncorrect();
       toast.error("No se pudo guardar el progreso.");
       throw error;
    }
  };

  if (loading) {
    return <LoadingSpinner text={`Cargando ejercicios de ${moduleTitle.toLowerCase()}...`} fullScreen />;
  }

  return (
    <div className="space-y-12">
      <CommunicationsSection />
      
      {exercises.length === 0 ? (
        <div className="text-center p-12 bg-white shadow-sm border border-slate-100 rounded-3xl">
          <p className="text-slate-600 mb-4">No hay ejercicios disponibles en este momento.</p>
          {isAdmin && <p className="text-primary font-bold">Como administrador, puedes añadir ejercicios abajo.</p>}
        </div>
      ) : currentExerciseIndex >= exercises.length ? (
        <div className="text-center p-12 bg-white shadow-sm border border-slate-100 rounded-3xl">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-check text-3xl"></i>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">¡Felicidades!</h2>
            <p className="text-slate-600 mb-8 text-lg">Has completado todos los ejercicios del módulo de {moduleTitle}.</p>
            <div className="flex justify-center">
              <button 
                onClick={() => window.location.hash = '#/dashboard'}
                className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors"
              >
                Volver al Panel
              </button>
            </div>
        </div>
      ) : (
        <AuditoryExerciseBase
          exercise={exercises[currentExerciseIndex]}
          moduleTitle={`Módulo de ${moduleTitle}`}
          onNextExercise={handleNextExercise}
          onSaveProgress={handleSaveProgress}
        />
      )}

      {isAdmin && (
        <AdminExerciseManager 
          moduleId={moduleId} 
          moduleTitle={moduleTitle} 
        />
      )}
    </div>
  );
};

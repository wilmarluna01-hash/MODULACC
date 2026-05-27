import React, { useEffect } from 'react';
import { speak } from '../../services/audioEngine';

export const AudioTrainingPage: React.FC = () => {
  useEffect(() => {
    speak("Bienvenido al módulo de entrenamiento auditivo. Aquí podrás mejorar tus habilidades de atención, memoria y discriminación sonora. Selecciona un ejercicio para comenzar.");
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Entrenamiento Auditivo</h1>
      <p>Bienvenido al módulo de entrenamiento auditivo. Aquí podrás mejorar tus habilidades de atención, memoria y discriminación sonora.</p>
    </div>
  );
};

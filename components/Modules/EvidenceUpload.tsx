import React, { useState } from 'react';
import { toast } from '../Shared/Toast';

export const EvidenceUpload: React.FC<{ periodId: number; moduleId: string }> = ({ periodId, moduleId }) => {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = () => {
    if (!file) {
      toast.error("Por favor selecciona un archivo.");
      return;
    }
    // Implementar lógica de subida a Firebase Storage
    toast.success(`Evidencia subida para el Periodo ${periodId} del módulo ${moduleId}`);
  };

  return (
    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
      <h4 className="font-bold text-slate-700 mb-2">Evidencia de Aprendizaje</h4>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mb-2" />
      <button 
        onClick={handleUpload}
        className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-dark transition-colors"
      >
        Subir Actividad
      </button>
    </div>
  );
};

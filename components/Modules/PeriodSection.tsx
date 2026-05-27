import React from 'react';
import { EvidenceUpload } from './EvidenceUpload';

export const PeriodSection: React.FC<{ periodId: number; moduleId: string }> = ({ periodId, moduleId }) => {
  return (
    <div className="p-6 bg-white shadow-sm border border-slate-100 rounded-2xl space-y-4">
      <h3 className="text-xl font-bold text-primary">Periodo {periodId}</h3>
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <h4 className="font-bold text-slate-700 mb-2">Información</h4>
        <p className="text-slate-600">Contenido educativo del periodo {periodId}.</p>
      </div>
      <EvidenceUpload periodId={periodId} moduleId={moduleId} />
    </div>
  );
};

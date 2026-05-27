import React, { useState } from 'react';
import { useScreenReader } from './ScreenReaderProvider';
import { AccessibleButton } from './AccessibleButton';
import { useLocation } from 'react-router-dom';
import { APP_ROUTES, KEYBOARD_SHORTCUTS } from '../../constants';
import { AccessibilityModal } from './AccessibilityModal';

export const SmartAccessibilityButton: React.FC = () => {
  const { isEnabled, toggleScreenReader, generateSmartSummary, isSmartSummaryLoading } = useScreenReader();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const location = useLocation();

  const getSectionContext = () => {
    const routeName = Object.keys(APP_ROUTES).find(key => APP_ROUTES[key as keyof typeof APP_ROUTES] === location.pathname);
    const shortcut = Object.values(KEYBOARD_SHORTCUTS).find(s => s.path === location.pathname);
    
    let sectionName = shortcut ? shortcut.name : (routeName || 'Sección desconocida');
    let sectionDescription = '';
    
    if (location.pathname === APP_ROUTES.DASHBOARD) sectionDescription = 'Panel principal donde ves tus módulos de aprendizaje y progreso.';
    else if (location.pathname === APP_ROUTES.PERSONAL_EVALUATION) sectionDescription = 'Sección de evaluación personal para reflexionar sobre tu proceso de aprendizaje.';
    else if (location.pathname.includes('/module/')) sectionDescription = 'Módulo de aprendizaje interactivo.';
    else if (location.pathname === APP_ROUTES.MY_PROGRESS) sectionDescription = 'Sección para visualizar tu progreso académico.';
    else if (location.pathname === APP_ROUTES.HELP) sectionDescription = 'Página de ayuda y soporte.';
    else if (location.pathname === APP_ROUTES.FORUM) sectionDescription = 'Foro de consultas para interactuar con otros estudiantes.';
    
    return { sectionName, sectionDescription };
  };

  const handleSmartSummary = () => {
    const { sectionName, sectionDescription } = getSectionContext();
    const context = `Estás en la sección: ${sectionName}. ${sectionDescription} Esta herramienta te ayudará a entender mejor qué puedes hacer aquí.`;
    generateSmartSummary(context);
  };

  return (
    <div className="fixed bottom-24 right-6 flex flex-col gap-3 z-50">
      <AccessibilityModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      <AccessibleButton
        onClick={() => setIsSettingsOpen(true)}
        variant="secondary"
        className="w-14 h-14 rounded-full shadow-2xl bg-white text-primary border-none flex items-center justify-center p-0 hover:scale-110 transition-transform"
        ariaLabel="Abrir configuración de accesibilidad"
        title="Accesibilidad"
      >
        <i className="fas fa-wheelchair text-xl"></i>
      </AccessibleButton>

      <AccessibleButton
        onClick={handleSmartSummary}
        variant="primary"
        className="w-14 h-14 rounded-full shadow-2xl bg-accent text-primary-dark border-none flex items-center justify-center p-0 hover:scale-110 transition-transform"
        ariaLabel="Generar resumen inteligente de esta página"
        title="Resumen Inteligente"
        disabled={isSmartSummaryLoading}
      >
        {isSmartSummaryLoading ? (
          <i className="fas fa-spinner fa-spin text-xl"></i>
        ) : (
          <i className="fas fa-magic text-xl"></i>
        )}
      </AccessibleButton>

      <AccessibleButton
        onClick={toggleScreenReader}
        variant={isEnabled ? "primary" : "secondary"}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center p-0 hover:scale-110 transition-transform ${isEnabled ? 'bg-primary text-white' : 'bg-white text-primary'}`}
        ariaLabel={isEnabled ? "Desactivar lector de pantalla" : "Activar lector de pantalla"}
        title={isEnabled ? "Lector Activado" : "Activar Lector"}
      >
        <i className={`fas ${isEnabled ? 'fa-volume-up' : 'fa-volume-mute'} text-xl`}></i>
      </AccessibleButton>
    </div>
  );
};

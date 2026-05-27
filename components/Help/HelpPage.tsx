
import React from 'react';
import { Link } from 'react-router-dom';
import { KEYBOARD_SHORTCUTS, APP_ROUTES } from '../../constants';
import { HelpAudioTutorial } from './HelpAudioTutorial';

export const HelpPage: React.FC = () => {
  const generalCommands = [
    { key: 'Tab', description: 'Moverse al siguiente elemento interactivo (botones, enlaces, campos de texto).' },
    { key: 'Shift + Tab', description: 'Moverse al elemento interactivo anterior.' },
    { key: 'Enter', description: 'Activar un botón o enlace seleccionado.' },
    { key: 'Espacio', description: 'Activar un botón o checkbox seleccionado.' },
    { key: 'Esc', description: 'Cerrar menús desplegables o modales.' },
    { key: 'Teclas de Flecha', description: 'Navegar dentro de algunos componentes como menús o selectores.' },
  ];

  const appShortcuts = Object.values(KEYBOARD_SHORTCUTS);

  return (
    <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-12 max-w-5xl mx-auto my-8">
      <header className="text-center md:text-left">
        <h1 className="text-5xl font-bold text-slate-900 mb-4 tracking-tight">Centro de Ayuda</h1>
        <p className="text-slate-500 text-xl max-w-2xl leading-relaxed">
          Encuentra información sobre cómo navegar y usar la plataforma de manera accesible para todos.
        </p>
      </header>

      <section aria-labelledby="audio-tutorial-title" className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
        <h2 id="audio-tutorial-title" className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3">
          <i className="fas fa-volume-up text-primary"></i> Tutorial en Audio
        </h2>
        <p className="text-slate-600 mb-8 text-lg">
          Escucha nuestro tutorial interactivo para familiarizarte con las funciones principales de la plataforma y cómo navegar de forma eficiente.
        </p>
        <HelpAudioTutorial />
      </section>

      <section aria-labelledby="keyboard-navigation-title">
        <h2 id="keyboard-navigation-title" className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3">
          <i className="fas fa-keyboard text-primary"></i> Navegación por Teclado
        </h2>
        <p className="text-slate-600 mb-8 text-lg leading-relaxed">
          La plataforma está diseñada para ser completamente navegable usando solo el teclado, lo que facilita el acceso para personas con discapacidades motoras o visuales.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold text-slate-700 mb-6">Comandos Generales</h3>
            <ul className="space-y-4" aria-label="Lista de comandos generales de teclado">
              {generalCommands.map(cmd => (
                <li key={cmd.key} className="flex items-start gap-4">
                  <kbd className="flex-shrink-0 px-3 py-2 text-sm font-bold text-slate-700 bg-slate-100 border-b-4 border-slate-300 rounded-xl min-w-[80px] text-center">{cmd.key}</kbd>
                  <span className="text-slate-600 pt-1">{cmd.description}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-slate-700 mb-6">Atajos de la App (Alt + Tecla)</h3>
            <p className="text-slate-600 mb-6">
              Usa la tecla <kbd className="px-2 py-1 text-sm font-bold text-slate-700 bg-slate-100 border-b-2 border-slate-300 rounded-lg">Alt</kbd> en combinación con las siguientes teclas para acceder rápidamente a las secciones principales:
            </p>
            <ul className="space-y-4" aria-label="Lista de atajos de teclado específicos de la aplicación">
              {appShortcuts.map(shortcut => (
                <li key={shortcut.name} className="flex items-center gap-4">
                  <kbd className="flex-shrink-0 px-3 py-2 text-sm font-bold text-slate-700 bg-slate-100 border-b-4 border-slate-300 rounded-xl min-w-[80px] text-center">Alt + {shortcut.key.toUpperCase()}</kbd>
                  <span className="text-slate-600">- <Link to={shortcut.path} className="font-bold text-primary hover:underline">{shortcut.name}</Link></span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="screen-reader-info-title" className="bg-primary/5 p-8 rounded-3xl border border-primary/10">
        <h2 id="screen-reader-info-title" className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3">
          <i className="fas fa-eye text-primary"></i> Lectores de Pantalla
        </h2>
        <p className="text-slate-600 mb-6 text-lg leading-relaxed">
          Esta plataforma está diseñada para ser compatible con lectores de pantalla populares como NVDA, JAWS y VoiceOver.
          Hemos utilizado atributos ARIA y HTML semántico para asegurar una experiencia de usuario óptima.
        </p>
        <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-primary/20">
          <i className="fas fa-info-circle text-primary text-xl"></i>
          <p className="text-slate-600 text-sm">
            Si encuentras algún problema de accesibilidad o tienes sugerencias, por favor <Link to={APP_ROUTES.DASHBOARD} className="font-bold text-primary hover:underline">contáctanos</Link>.
          </p>
        </div>
      </section>

      <section aria-labelledby="brand-menu-info-title">
        <h2 id="brand-menu-info-title" className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3">
          <i className="fas fa-bars text-primary"></i> Menú de la Marca
        </h2>
        <p className="text-slate-600 text-lg leading-relaxed">
          Para acceder a esta página de ayuda en cualquier momento, haz clic en el nombre de la aplicación <strong>MODULACC</strong> en la parte superior izquierda de la pantalla. 
          Se desplegará un menú donde encontrarás la opción de <strong>Ayuda</strong>.
        </p>
      </section>
    </div>
  );
};

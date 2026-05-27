
import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import { MessageCircle, X, Send, Loader2, Bot, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_ROUTES, KEYBOARD_SHORTCUTS } from '../../constants';
import { speak } from '../../services/audioEngine';

export const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
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

  const { sectionName, sectionDescription } = getSectionContext();

  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([
    { role: 'assistant', text: `¡Hola! Soy tu asistente virtual. Estoy en la sección: ${sectionName}. ${sectionDescription} ¿En qué puedo apoyarte?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [{ text: userMessage }]
          }
        ],
        config: {
          systemInstruction: `Eres un asistente virtual para una plataforma de aprendizaje inclusivo. 
          El usuario se encuentra actualmente en la sección: ${sectionName}.
          Descripción de la sección: ${sectionDescription}
          
          Tu objetivo es proporcionar ayuda contextual y específica sobre esta sección. 
          Si el usuario pide un resumen, explica detalladamente qué es esta sección, para qué sirve y qué puede hacer aquí.
          
          Ayudas a estudiantes con dudas sobre atención auditiva, memoria auditiva, encuestas sonoras y entrevistas interactivas. 
          También respondes dudas generales sobre tecnología, ciencias, matemáticas e historia en el contexto de ejercicios tipo ICFES. 
          Sé amable, paciente y motivador.`
        }
      });

      const assistantText = response.text || "Lo siento, no pude procesar tu solicitud.";
      setMessages(prev => [...prev, { role: 'assistant', text: assistantText }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', text: "Hubo un error al conectar con el asistente. Por favor, intenta de nuevo más tarde." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 sm:w-96 h-[500px] flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot size={20} />
                <span className="font-bold">Asistente Virtual</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  {msg.role === 'assistant' && (
                    <button 
                      onClick={() => speak(msg.text)} 
                      className="mt-1 p-1 text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1 text-xs"
                      aria-label="Escuchar mensaje"
                    >
                      <Volume2 size={14} /> Escuchar
                    </button>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none">
                    <Loader2 size={16} className="animate-spin text-blue-600" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Escribe tu duda aquí..."
                  className="flex-grow px-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-slate-300 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-110 active:scale-95"
        aria-label={isOpen ? "Cerrar asistente virtual" : "Abrir asistente virtual"}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
};

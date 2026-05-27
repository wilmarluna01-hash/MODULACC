import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { toast } from './Toast';

interface ScreenReaderContextType {
  isEnabled: boolean;
  toggleScreenReader: () => void;
  speak: (text: string, priority?: 'high' | 'low') => void;
  stop: () => void;
  isSpeaking: boolean;
  isSmartSummaryLoading: boolean;
  generateSmartSummary: (content: string) => Promise<void>;
}

const ScreenReaderContext = createContext<ScreenReaderContextType | null>(null);

export const useScreenReader = () => {
  const context = useContext(ScreenReaderContext);
  if (!context) throw new Error('useScreenReader must be used within a ScreenReaderProvider');
  return context;
};

export const ScreenReaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(() => {
    const saved = localStorage.getItem('screenReaderEnabled');
    return saved === 'true';
  });
  const [isSmartSummaryLoading, setIsSmartSummaryLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synth = window.speechSynthesis;
  const lastSpokenRef = useRef<string>('');
  const isSpeakingRef = useRef<boolean>(false);

  const stop = useCallback(() => {
    isSpeakingRef.current = false;
    synth.cancel();
    setIsSpeaking(false);
  }, [synth]);

  const speak = useCallback((text: string, priority: 'high' | 'low' = 'low') => {
    if (!isEnabled) return;
    if (!text) return;
    
    // Avoid repeating the same text immediately
    if (text === lastSpokenRef.current && priority === 'low') return;
    lastSpokenRef.current = text;

    stop();
    isSpeakingRef.current = true;
    setIsSpeaking(true);

    // Split long text into chunks to avoid browser limitations
    const chunks = text.match(/.{1,200}(\s|$)/g) || [text];
    
    const speakChunks = (index: number) => {
      if (index >= chunks.length || !isSpeakingRef.current) {
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunks[index].trim());
      utterance.lang = 'es-ES';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        speakChunks(index + 1);
      };

      utterance.onerror = (event) => {
        console.error("SpeechSynthesis error:", event);
        speakChunks(index + 1);
      };

      synth.speak(utterance);
    };

    speakChunks(0);
  }, [isEnabled, stop, synth]);

  const toggleScreenReader = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // Anunciar atajos de teclado tras un breve retraso al iniciar
      setTimeout(() => {
        speak("Bienvenido. Usa Alt más K para escuchar, y Alt más N para pasar al siguiente ejercicio.", 'high');
      }, 2000);
      return;
    }
    localStorage.setItem('screenReaderEnabled', String(isEnabled));
    
    if (isEnabled) {
      speak("Lector de pantalla activado. Ahora leeré los elementos al navegar.", 'high');
    } else {
      stop();
      toast.info("Lector de pantalla desactivado");
    }
  }, [isEnabled, speak, stop]);

  // Smart Summary using Gemini
  const generateSmartSummary = useCallback(async (pageContext: string) => {
    if (!process.env.GEMINI_API_KEY) {
      toast.error("Configuración de IA no disponible");
      return;
    }

    setIsSmartSummaryLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Step 1: Generate a concise description text using a standard model
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ 
          parts: [{ 
            text: `Eres un asistente de accesibilidad experto. Describe de forma muy concisa (máximo 3 frases) y clara para una persona con discapacidad visual lo que hay en esta pantalla basándote en este contexto: ${pageContext}. Enfócate en la estructura y opciones principales. Habla en español.` 
          }] 
        }],
      });

      const summaryText = response.text;
      
      if (summaryText) {
        stop();
        // Step 2: Use browser TTS to speak the generated text
        speak(summaryText, 'high');
      } else {
        speak("No pude generar un resumen de la página en este momento.");
      }
    } catch (error) {
      console.error("Error generating smart summary:", error);
      toast.error("Error al generar resumen inteligente");
      speak("Hubo un problema al intentar analizar la pantalla.");
    } finally {
      setIsSmartSummaryLoading(false);
    }
  }, [speak, stop]);

  // Global event listener to toggle with Ctrl
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control') {
        toggleScreenReader();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleScreenReader]);

  // Global event listeners for "TalkBack" behavior
  useEffect(() => {
    if (!isEnabled) return;

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const textToRead = 
        target.getAttribute('aria-label') || 
        target.getAttribute('title') || 
        target.getAttribute('alt') || 
        target.innerText || 
        (target as HTMLInputElement).placeholder ||
        '';

      if (!textToRead) return;

      const role = target.getAttribute('role') || target.tagName.toLowerCase();
      // Only speak if it's a meaningful element
      if (['button', 'a', 'h1', 'h2', 'h3', 'input', 'select', 'textarea'].includes(role)) {
        speak(`${textToRead}`);
      }
    };

    document.addEventListener('focusin', handleFocus);

    return () => {
      document.removeEventListener('focusin', handleFocus);
    };
  }, [isEnabled, speak]);

  return (
    <ScreenReaderContext.Provider value={{ 
      isEnabled, 
      toggleScreenReader, 
      speak, 
      stop, 
      isSpeaking,
      isSmartSummaryLoading, 
      generateSmartSummary 
    }}>
      {children}
      {/* Visual indicator for focused element when screen reader is on */}
      {isEnabled && (
        <style>{`
          :focus {
            outline: 4px solid #1d4ed8 !important;
            outline-offset: 4px !important;
            box-shadow: 0 0 0 8px rgba(29, 78, 216, 0.2) !important;
          }
        `}</style>
      )}
    </ScreenReaderContext.Provider>
  );
};

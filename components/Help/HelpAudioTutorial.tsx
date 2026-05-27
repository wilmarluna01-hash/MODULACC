import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { AccessibleButton } from '../Shared/AccessibleButton';
import { LoadingSpinner } from '../Shared/LoadingSpinner';
import { toast } from '../Shared/Toast';

export const HelpAudioTutorial: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const tutorialText = `
    Bienvenido a la página de ayuda de MODULACC. Esta plataforma está diseñada para ser accesible para todos. 
    Para navegar, puedes usar la tecla Tabulador para moverte entre elementos, Enter para activar botones y la barra espaciadora para seleccionar opciones.
    Hemos incluido atajos de teclado rápidos usando la tecla Alt. Por ejemplo, Alt más D te lleva al panel principal, Alt más P a tu progreso, y Alt más E a la evaluación personal.
    Recuerda que ahora puedes encontrar esta página de ayuda haciendo clic en el nombre de la aplicación, MODULACC, en la parte superior izquierda, donde se desplegará un menú con la opción de ayuda.
    La plataforma es totalmente compatible con lectores de pantalla como NVDA o JAWS. 
    Si necesitas repetir esta información, puedes usar el botón de repetir en este reproductor.
    ¡Esperamos que disfrutes tu experiencia de aprendizaje!
  `;

  const generateAudio = useCallback(async () => {
    if (audioUrl) return; // Already generated

    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: tutorialText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const part = response.candidates?.[0]?.content?.parts?.[0];
      const base64Audio = part?.inlineData?.data;
      const mimeType = part?.inlineData?.mimeType;

      if (base64Audio) {
        // If it's raw PCM (often returned as audio/pcm or similar), we need to wrap it in a WAV header
        // or use the returned mimeType if it's a container format like audio/mpeg
        if (mimeType && (mimeType.includes('mpeg') || mimeType.includes('mp3') || mimeType.includes('wav'))) {
          setAudioUrl(`data:${mimeType};base64,${base64Audio}`);
        } else {
          // Assume raw PCM 16-bit Mono 24kHz as per Gemini TTS docs
          const binaryString = window.atob(base64Audio);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          // Create WAV header
          const sampleRate = 24000;
          const numChannels = 1;
          const bitsPerSample = 16;
          const wavHeader = new ArrayBuffer(44);
          const view = new DataView(wavHeader);
          
          /* RIFF identifier */
          view.setUint32(0, 0x52494646, false);
          /* file length */
          view.setUint32(4, 36 + bytes.length, true);
          /* RIFF type */
          view.setUint32(8, 0x57415645, false);
          /* format chunk identifier */
          view.setUint32(12, 0x666d7420, false);
          /* format chunk length */
          view.setUint32(16, 16, true);
          /* sample format (raw) */
          view.setUint16(20, 1, true);
          /* channel count */
          view.setUint16(22, numChannels, true);
          /* sample rate */
          view.setUint32(24, sampleRate, true);
          /* byte rate (sample rate * block align) */
          view.setUint32(28, sampleRate * numChannels * bitsPerSample / 8, true);
          /* block align (channel count * bytes per sample) */
          view.setUint16(32, numChannels * bitsPerSample / 8, true);
          /* bits per sample */
          view.setUint16(34, bitsPerSample, true);
          /* data chunk identifier */
          view.setUint32(36, 0x64617461, false);
          /* data chunk length */
          view.setUint32(40, bytes.length, true);
          
          const blob = new Blob([wavHeader, bytes], { type: 'audio/wav' });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
        }
      } else {
        throw new Error("No se pudo generar el audio.");
      }
    } catch (error) {
      console.error("Error generating audio tutorial:", error);
      toast.error("No se pudo cargar el tutorial de audio. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }, [audioUrl, tutorialText]);

  const togglePlayPause = useCallback(async () => {
    if (!audioUrl) {
      await generateAudio();
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          console.error("Error playing audio:", err);
          toast.error("Error al reproducir el audio.");
        });
      }
      setIsPlaying(!isPlaying);
    }
  }, [audioUrl, generateAudio, isPlaying]);

  const handleRepeat = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.error("Error repeating audio:", err));
      setIsPlaying(true);
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => setIsPlaying(false);
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);

      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);

      return () => {
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
      };
    }
  }, [audioUrl]);

  return (
    <div className="p-6 border-2 border-primary/20 rounded-2xl bg-primary/5 shadow-sm" role="region" aria-label="Tutorial de audio de la plataforma">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-shrink-0 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-lg">
          <i className="fas fa-headphones text-2xl"></i>
        </div>
        <div className="flex-grow text-center md:text-left">
          <h3 className="text-xl font-bold text-slate-800 mb-1">Tutorial Interactivo</h3>
          <p className="text-slate-600 text-sm mb-4">Escucha una explicación detallada de cómo usar MODULACC y sus funciones de accesibilidad.</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            {isLoading ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200">
                <LoadingSpinner size="sm" />
                <span className="text-sm font-medium text-slate-600">Generando audio...</span>
              </div>
            ) : (
              <>
                <AccessibleButton
                  onClick={togglePlayPause}
                  variant={isPlaying ? "secondary" : "primary"}
                  className="rounded-xl px-6 py-2 shadow-md"
                  iconLeft={<i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>}
                >
                  {isPlaying ? 'Pausar Tutorial' : audioUrl ? 'Continuar Tutorial' : 'Escuchar Tutorial'}
                </AccessibleButton>
                
                {audioUrl && (
                  <AccessibleButton
                    onClick={handleRepeat}
                    variant="ghost"
                    className="rounded-xl px-6 py-2"
                    iconLeft={<i className="fas fa-redo"></i>}
                  >
                    Repetir
                  </AccessibleButton>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}
    </div>
  );
};


import React, { useRef, useState, useEffect, useCallback } from 'react';
import { AccessibleButton } from './AccessibleButton';
import { ARIA_LABELS } from '../../constants';

interface AudioPlayerProps {
  src: string;
  title?: string; // For ARIA label on the player itself
  onEnded?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, title, onEnded }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const togglePlayPause = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => console.error("Error playing audio:", error));
      }
      setIsPlaying(!isPlaying);
    }
  },[isPlaying]);

  const handleRepeat = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => console.error("Error playing audio:", error));
      setIsPlaying(true);
    }
  },[]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const setAudioData = () => {
        setDuration(audio.duration);
        setCurrentTime(audio.currentTime);
        setIsLoading(false);
      }
      const setAudioTime = () => setCurrentTime(audio.currentTime);
      const handleAudioEnded = () => {
        setIsPlaying(false);
        if (onEnded) onEnded();
      };
      
      audio.addEventListener('loadeddata', setAudioData);
      audio.addEventListener('timeupdate', setAudioTime);
      audio.addEventListener('ended', handleAudioEnded);
      audio.addEventListener('play', () => setIsPlaying(true));
      audio.addEventListener('pause', () => setIsPlaying(false));


      // If audio is already loaded
      if (audio.readyState >= 2) { // HAVE_CURRENT_DATA or more
         setAudioData();
      }


      return () => {
        audio.removeEventListener('loadeddata', setAudioData);
        audio.removeEventListener('timeupdate', setAudioTime);
        audio.removeEventListener('ended', handleAudioEnded);
        audio.removeEventListener('play', () => setIsPlaying(true));
        audio.removeEventListener('pause', () => setIsPlaying(false));
      };
    }
  }, [onEnded, src]);

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg shadow-sm bg-white" role="region" aria-label={title || "Reproductor de audio"}>
      <audio ref={audioRef} src={src} preload="metadata" className="sr-only" aria-hidden="true" />
      {isLoading && <p className="text-sm text-gray-500">Cargando audio...</p>}
      {!isLoading && (
        <>
          <div className="flex items-center space-x-3 mb-2">
            <AccessibleButton
              onClick={togglePlayPause}
              ariaLabel={isPlaying ? ARIA_LABELS.AUDIO_PLAYER_PAUSE : ARIA_LABELS.AUDIO_PLAYER_PLAY}
              aria-pressed={isPlaying}
              variant="secondary"
              iconLeft={<i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>}
            >
              {isPlaying ? 'Pausar' : 'Reproducir'}
            </AccessibleButton>
            <AccessibleButton
              onClick={handleRepeat}
              ariaLabel={ARIA_LABELS.AUDIO_PLAYER_REPEAT}
              variant="secondary"
              iconLeft={<i className="fas fa-redo"></i>}
            >
              Repetir
            </AccessibleButton>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-2">
            <div 
              className="bg-primary h-2.5 rounded-full" 
              style={{ width: `${(currentTime / duration) * 100}%` }}
              role="progressbar"
              aria-valuenow={currentTime}
              aria-valuemin={0}
              aria-valuemax={duration}
              aria-label="Progreso del audio"
            ></div>
          </div>
          <div className="text-xs text-gray-600 flex justify-between">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </>
      )}
    </div>
  );
};

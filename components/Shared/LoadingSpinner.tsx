
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text, fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} border-primary border-t-transparent`}
        role="status"
        aria-live="polite"
        aria-label={text || "Cargando"}
      >
        <span className="sr-only">{text || "Cargando..."}</span>
      </div>
      {text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background bg-opacity-75 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};


import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface ToastProps extends ToastMessage {
  onDismiss: (id: number) => void;
}

const ToastItem: React.FC<ToastProps> = ({ id, message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 5000); // Auto-dismiss after 5 seconds

    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const baseStyles = "p-4 rounded-md shadow-lg text-sm font-medium flex items-center justify-between";
  const typeStyles = {
    success: "bg-success text-white",
    error: "bg-error text-white",
    info: "bg-blue-500 text-white",
    warning: "bg-warning text-black",
  };

  const icons = {
    success: <i className="fas fa-check-circle mr-2"></i>,
    error: <i className="fas fa-exclamation-circle mr-2"></i>,
    info: <i className="fas fa-info-circle mr-2"></i>,
    warning: <i className="fas fa-exclamation-triangle mr-2"></i>,
  };

  return (
    <div
      className={`${baseStyles} ${typeStyles[type]}`}
      role="alert"
      aria-live={type === 'error' || type === 'warning' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <div>{icons[type]} {message}</div>
      <button
        onClick={() => onDismiss(id)}
        className="ml-4 text-current hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Cerrar notificación"
      >
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

let toastCount = 0;
const toastListeners: Array<(toasts: ToastMessage[]) => void> = [];

const addToast = (message: string, type: ToastMessage['type']) => {
  const id = toastCount++;
  const newToast = { id, message, type };
  toastState = [...toastState, newToast];
  notifyListeners();
};

let toastState: ToastMessage[] = [];

const notifyListeners = () => {
  toastListeners.forEach(listener => listener(toastState));
};

export const toast = {
  success: (message: string) => addToast(message, 'success'),
  error: (message: string) => addToast(message, 'error'),
  info: (message: string) => addToast(message, 'info'),
  warning: (message: string) => addToast(message, 'warning'),
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>(toastState);
  const portalRoot = document.body; // Render directly in body, or a dedicated portal div

  const handleDismiss = useCallback((id: number) => {
    toastState = toastState.filter(t => t.id !== id);
    notifyListeners();
  }, []);

  useEffect(() => {
    const listener = (newToasts: ToastMessage[]) => {
      setToasts([...newToasts]); // Create new array to trigger re-render
    };
    toastListeners.push(listener);
    return () => {
      const index = toastListeners.indexOf(listener);
      if (index > -1) {
        toastListeners.splice(index, 1);
      }
    };
  }, []);

  if (!portalRoot) return null;

  return ReactDOM.createPortal(
    <div className="fixed bottom-5 right-5 z-50 space-y-3 w-full max-w-sm">
      {toasts.map(toastItem => (
        <ToastItem key={toastItem.id} {...toastItem} onDismiss={handleDismiss} />
      ))}
    </div>,
    portalRoot
  );
};

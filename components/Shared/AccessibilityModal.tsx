import React from 'react';
import { AccessibilitySettings } from './AccessibilitySettings';
import { AccessibleButton } from './AccessibleButton';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <AccessibleButton
          onClick={onClose}
          className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full"
          ariaLabel="Cerrar"
        >
          ✕
        </AccessibleButton>
        <AccessibilitySettings />
      </div>
    </div>
  );
};

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../App';
import { AccessibilityProfile } from '../../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from './Toast';

export const AccessibilitySettings: React.FC = () => {
  const auth = useContext(AuthContext);
  const [profile, setProfile] = useState<AccessibilityProfile>({
    preferredVoice: "female",
    readingSpeed: 1.0,
    audioFeedbackEnabled: true,
    highContrastMode: false,
    fontSize: "medium"
  });

  useEffect(() => {
    if (auth?.currentUser?.accessibilityProfile) {
      setProfile(auth.currentUser.accessibilityProfile);
    }
  }, [auth]);

  const saveSettings = async (newProfile: AccessibilityProfile) => {
    if (!auth?.currentUser) return;
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.id), {
        accessibilityProfile: newProfile
      });
      localStorage.setItem('accessibilityProfile', JSON.stringify(newProfile));
      toast.success("Configuración de accesibilidad guardada");
    } catch (error) {
      toast.error("Error al guardar la configuración");
    }
  };

  const updateProfile = (key: keyof AccessibilityProfile, value: any) => {
    const newProfile = { ...profile, [key]: value };
    setProfile(newProfile);
    
    // Apply changes immediately
    document.body.className = newProfile.highContrastMode ? 'high-contrast' : '';
    document.body.setAttribute('data-font-size', newProfile.fontSize);
    
    saveSettings(newProfile);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-200 space-y-4">
      <h3 className="font-bold text-lg">Configuración de Accesibilidad</h3>
      <div>
        <label className="block text-sm font-medium">Tamaño de Fuente:</label>
        <select value={profile.fontSize} onChange={(e) => updateProfile('fontSize', e.target.value)} className="w-full p-2 border rounded">
          <option value="small">Pequeño</option>
          <option value="medium">Mediano</option>
          <option value="large">Grande</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Velocidad de Lectura (x{profile.readingSpeed}):</label>
        <input 
          type="range" 
          min="0.5" 
          max="2.0" 
          step="0.1" 
          value={profile.readingSpeed} 
          onChange={(e) => updateProfile('readingSpeed', parseFloat(e.target.value))} 
          className="w-full"
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Alto contraste:</label>
        <input type="checkbox" checked={profile.highContrastMode} onChange={(e) => updateProfile('highContrastMode', e.target.checked)} />
      </div>
    </div>
  );
};

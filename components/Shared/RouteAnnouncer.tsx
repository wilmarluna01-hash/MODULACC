import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useScreenReader } from './ScreenReaderProvider';
import { KEYBOARD_SHORTCUTS, APP_ROUTES } from '../../constants';

export const RouteAnnouncer = () => {
  const location = useLocation();
  const { speak } = useScreenReader();

  useEffect(() => {
    // Find shortcut for current path
    const shortcut = Object.values(KEYBOARD_SHORTCUTS).find(s => s.path === location.pathname);
    
    if (shortcut) {
      speak(`Sección: ${shortcut.name}`, 'high');
    } else if (location.pathname.includes('/course/')) {
      speak(`Sección: Curso`, 'high');
    } else if (location.pathname === APP_ROUTES.LOGIN) {
      speak(`Página de inicio de sesión`, 'high');
    } else if (location.pathname === APP_ROUTES.REGISTER) {
      speak(`Página de registro`, 'high');
    }
  }, [location, speak]);

  return null;
};

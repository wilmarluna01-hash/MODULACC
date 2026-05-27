
import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../App';
import { AccessibleInput } from '../Shared/AccessibleInput';
import { AccessibleButton } from '../Shared/AccessibleButton';
import { ARIA_LABELS, APP_ROUTES } from '../../constants';
import { LoadingSpinner } from '../Shared/LoadingSpinner';
import { Role } from '../../types';
import { useScreenReader } from '../Shared/ScreenReaderProvider';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>(Role.Student);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const { speak, isEnabled, stop } = useScreenReader();
  const hasSpoken = useRef(false);

  useEffect(() => {
    if (!isEnabled) {
      stop();
      hasSpoken.current = false;
      return;
    }

    if (hasSpoken.current) return;
    hasSpoken.current = true;

    speak("Página de registro. Crea una nueva cuenta para unirte a nuestra comunidad de aprendizaje. Por favor, completa los campos de nombre, correo electrónico, rol, contraseña y confirmación de contraseña.", 'high');

    return () => {
      stop();
      hasSpoken.current = false;
    };
  }, [speak, isEnabled, stop]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    if (!auth) {
      setError("Servicio de autenticación no disponible.");
      setLoading(false);
      return;
    }
    try {
      await auth.register(email, password, name, role);
      navigate(APP_ROUTES.DASHBOARD);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-150px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-sm border border-slate-100 rounded-2xl">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-primary tracking-wide">
            Crear Nueva Cuenta
          </h1>
           <p className="mt-2 text-center text-sm text-gray-600">
            Únete a nuestra comunidad de aprendizaje.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div role="alert" className="p-3 bg-error text-white rounded-md text-sm">
              {error}
            </div>
          )}
          <AccessibleInput
            id="name"
            label="Nombre Completo"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Tu Nombre"
          />
          <AccessibleInput
            id="email"
            label="Correo Electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tu@email.com"
            aria-label={ARIA_LABELS.EMAIL_INPUT}
          />

          <div className="space-y-1">
            <label htmlFor="role" className="block text-sm font-medium text-slate-700">
              ¿Cómo vas a iniciar? (Rol)
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
              required
            >
              <option value={Role.Student}>Estudiante</option>
              <option value={Role.Admin}>Administrador</option>
            </select>
          </div>

          <AccessibleInput
            id="password"
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="********"
            aria-label={ARIA_LABELS.PASSWORD_INPUT}
          />
          <AccessibleInput
            id="confirmPassword"
            label="Confirmar Contraseña"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="********"
          />
          <div>
            <AccessibleButton
              type="submit"
              disabled={loading}
              fullWidth
              ariaLabel={ARIA_LABELS.REGISTER_BUTTON}
              variant="primary"
              size="lg"
              iconRight={loading ? <LoadingSpinner size="sm" /> : null}
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </AccessibleButton>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">O continúa con</span>
            </div>
          </div>

          <div className="mt-6">
            <AccessibleButton
              type="button"
              fullWidth
              variant="secondary"
              onClick={() => auth?.loginWithGoogle()}
              ariaLabel="Registrarse con Google"
              iconLeft={<i className="fab fa-google mr-2"></i>}
            >
              Google
            </AccessibleButton>
          </div>
        </div>

         <p className="mt-4 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <Link to={APP_ROUTES.LOGIN} className="font-medium text-primary hover:text-primary-light">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

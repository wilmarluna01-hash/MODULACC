
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../App';
import { AccessibleInput } from '../Shared/AccessibleInput';
import { AccessibleButton } from '../Shared/AccessibleButton';
import { ARIA_LABELS, APP_ROUTES } from '../../constants';
import { LoadingSpinner } from '../Shared/LoadingSpinner';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!auth) {
      setError("Servicio de autenticación no disponible.");
      setLoading(false);
      return;
    }
    try {
      await auth.login(email, password);
      navigate(APP_ROUTES.DASHBOARD);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        if (e.key === 'e') {
          e.preventDefault();
          document.getElementById('email')?.focus();
        } else if (e.key === 'p') {
          e.preventDefault();
          document.getElementById('password')?.focus();
        } else if (e.key === 'g') {
          e.preventDefault();
          auth?.loginWithGoogle();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [auth]);

  return (
    <div className="min-h-[calc(100vh-150px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-sm border border-slate-100 rounded-2xl">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-primary tracking-wide">
            Iniciar Sesión
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Accede a tu cuenta para continuar aprendiendo.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div role="alert" className="p-3 bg-error text-white rounded-md text-sm">
              {error}
            </div>
          )}
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

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to={APP_ROUTES.FORGOT_PASSWORD} className="font-medium text-primary hover:text-primary-light" aria-label={ARIA_LABELS.FORGOT_PASSWORD_LINK}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <div>
            <AccessibleButton
              type="submit"
              disabled={loading}
              fullWidth
              ariaLabel={ARIA_LABELS.LOGIN_BUTTON}
              variant="primary"
              size="lg"
              iconRight={loading ? <LoadingSpinner size="sm" /> : null}
            >
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
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
              ariaLabel="Iniciar sesión con Google"
              iconLeft={<i className="fab fa-google mr-2"></i>}
            >
              Google
            </AccessibleButton>
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{' '}
          <Link to={APP_ROUTES.REGISTER} className="font-medium text-primary hover:text-primary-light">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AccessibleInput } from '../Shared/AccessibleInput';
import { AccessibleButton } from '../Shared/AccessibleButton';
import { ARIA_LABELS, APP_ROUTES } from '../../constants';
import { toast } from '../Shared/Toast';
import { LoadingSpinner } from '../Shared/LoadingSpinner';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    // Mock API call for password reset
    try {
      console.log(`API Call: Request password reset for ${email}`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      // Assume success
      setMessage('Si existe una cuenta asociada a este correo, recibirás un enlace para restablecer tu contraseña.');
      toast.success('Solicitud de restablecimiento enviada.');
      setEmail('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al solicitar restablecimiento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-150px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-10 bg-white shadow-xl rounded-lg">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-primary">
            Recuperar Contraseña
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresa tu correo electrónico y te enviaremos instrucciones.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {message && (
            <div role="alert" className="p-3 bg-success text-white rounded-md text-sm">
              {message}
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
          <div>
            <AccessibleButton
              type="submit"
              disabled={loading}
              fullWidth
              ariaLabel="Enviar enlace de restablecimiento"
              variant="primary"
              size="lg"
              iconRight={loading ? <LoadingSpinner size="sm" /> : null}
            >
              {loading ? 'Enviando...' : 'Enviar Enlace'}
            </AccessibleButton>
          </div>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          <Link to={APP_ROUTES.LOGIN} className="font-medium text-primary hover:text-primary-light">
            Volver a Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { FirebaseError } from 'firebase/app';

type AuthMode = 'login' | 'signup';

function getErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'Este email ya tiene una cuenta. Intenta iniciar sesion.';
      case 'auth/invalid-email':
        return 'Email invalido. Verifica e intenta de nuevo.';
      case 'auth/weak-password':
        return 'La contrasena debe tener al menos 6 caracteres.';
      case 'auth/user-not-found':
        return 'No existe cuenta con este email. Registrate primero.';
      case 'auth/wrong-password':
        return 'Contrasena incorrecta. Intenta de nuevo.';
      case 'auth/invalid-credential':
        return 'Credenciales invalidas. Verifica tu email y contrasena.';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Espera unos minutos e intenta de nuevo.';
      case 'auth/popup-closed-by-user':
        return 'Se cerro la ventana de Google. Intenta de nuevo.';
      case 'auth/network-request-failed':
        return 'Error de conexion. Verifica tu internet e intenta de nuevo.';
      default:
        return 'Ocurrio un error. Intenta de nuevo.';
    }
  }
  return 'Ocurrio un error inesperado. Intenta de nuevo.';
}

export default function Auth() {
  const navigate = useNavigate();
  const { user, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signup');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/feed', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        await signUpWithEmail(form.email, form.password, form.name);
      } else {
        await signInWithEmail(form.email, form.password);
      }
      navigate('/feed');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      navigate('/feed');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gradient-to-br from-warm-100 via-white to-terracotta-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-terracotta-500 to-terracotta-700 shadow-lg shadow-terracotta-500/25">
              <Flame className="h-6 w-6 text-white" />
            </div>
          </Link>
          <h1 className="mt-6 font-display text-3xl font-bold text-gray-900">
            {mode === 'signup' ? 'Unete a Lumina Red' : 'Bienvenido de vuelta'}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {mode === 'signup'
              ? 'Crea tu cuenta y unete a la comunidad'
              : 'Inicia sesion para seguir construyendo con la familia'}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="card p-6 space-y-4">
            {/* Name (signup only) */}
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Nombre completo
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="name"
                    type="text"
                    placeholder="Maria Fernanda Lopez"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
                Contrasena
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 caracteres"
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="input-field pl-10 pr-10"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Procesando...
                </span>
              ) : (
                <>
                  {mode === 'signup' ? 'Crear Cuenta' : 'Iniciar Sesion'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-gradient-to-br from-warm-100 to-white px-4 text-gray-400">
                o continua con
              </span>
            </div>
          </div>

          {/* Google sign-in */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="card flex w-full items-center justify-center gap-3 px-4 py-3.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continuar con Google
          </button>
        </form>

        {/* Toggle */}
        <p className="mt-6 text-center text-sm text-gray-500">
          {mode === 'signup' ? 'Ya tienes cuenta?' : 'No tienes cuenta?'}{' '}
          <button
            onClick={() => {
              setMode(mode === 'signup' ? 'login' : 'signup');
              setError('');
            }}
            className="font-semibold text-terracotta-500 hover:text-terracotta-600"
          >
            {mode === 'signup' ? 'Inicia sesion' : 'Registrate gratis'}
          </button>
        </p>
      </div>
    </div>
  );
}

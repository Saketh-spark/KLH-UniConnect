import React, { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8085';

const AuthenticationScreen = ({ onBack = () => {}, onAuthenticated = () => {} }) => {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState('sign-in');
  const [formValues, setFormValues] = useState({ email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(timer);
  }, []);

  const isSignIn = mode === 'sign-in';
  const primaryLabel = isSignIn ? 'Continue →' : 'Create Account →';
  const secondaryPrompt = isSignIn ? 'Don’t have an account?' : 'Already have an account?';
  const secondaryAction = isSignIn ? 'Sign up' : 'Sign in';

  const handleChange = (field) => (event) => {
    setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, api: undefined }));
    setStatus('');
  };

  const validate = () => {
    const nextErrors = {};

    if (!formValues.email) {
      nextErrors.email = 'Email is required';
    } else if (!formValues.email.endsWith('@klh.edu.in')) {
      nextErrors.email = 'Use your @klh.edu.in email';
    }

    if (!formValues.password) {
      nextErrors.password = 'Password is required';
    }

    if (!isSignIn) {
      if (!formValues.confirmPassword) {
        nextErrors.confirmPassword = 'Please re-enter your password';
      } else if (formValues.password !== formValues.confirmPassword) {
        nextErrors.confirmPassword = 'Passwords must match';
      }
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validation = validate();
    setErrors(validation);

    if (Object.keys(validation).length > 0) {
      return;
    }

    const endpoint = `${API_BASE}/api/auth/student/${isSignIn ? 'sign-in' : 'sign-up'}`;

    try {
      setStatus('Sending credentials...');
      const payload = {
        email: formValues.email,
        password: formValues.password
      };

      if (!isSignIn) {
        payload.confirmPassword = formValues.confirmPassword;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const body = await response.json();

      if (!response.ok) {
        setErrors((prev) => ({ ...prev, api: body.message ?? 'Authentication failed' }));
        setStatus('');
        return;
      }

      setStatus(body.message);
      setErrors({});
      localStorage.setItem('klhEmail', formValues.email);
      localStorage.setItem('klhStudentId', body.studentId);
      onAuthenticated(formValues.email, body.studentId);
    } catch (error) {
      setStatus('');
      setErrors((prev) => ({ ...prev, api: 'Unable to reach the authentication service' }));
    }
  };

  const errorClass = 'text-xs font-medium text-red-500';
  const headerSubtitle = isSignIn
    ? 'Sign in with your KLH email to access the platform'
    : 'Create your KLH account to start using UniConnect';

  return (
    <div className="relative min-h-screen isolate overflow-hidden bg-[#f7f7ff] text-slate-900">
      <div className="absolute inset-0 bg-gradient-to-br from-[#edf2ff] via-[#fceffe] to-[#f8fbff]" />
      <div className="pointer-events-none absolute -left-12 top-12 h-72 w-72 rounded-full bg-[#c8d7ff] blur-[120px] opacity-80" />
      <div className="pointer-events-none absolute -right-8 top-32 h-80 w-80 rounded-full bg-[#e4c7ff] blur-[180px] opacity-70" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-[#cfd6ff] blur-[150px] opacity-50" />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <header className="mb-8 flex flex-col items-center gap-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-600 to-indigo-600 text-lg font-bold text-white shadow-xl">
            K
          </span>
          <p className="text-lg font-semibold text-slate-900">KLH UniConnect</p>
        </header>

        <form
          onSubmit={handleSubmit}
          className={`w-full max-w-md rounded-[32px] border border-white/70 bg-white/90 p-0 text-slate-900 shadow-[0_40px_120px_rgba(15,23,42,0.25)] backdrop-blur transition-all duration-500 ${
            mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
          }`}
        >
          <div className="rounded-t-[32px] bg-gradient-to-br from-[#e7edff] to-[#f2d9ff] px-8 py-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome to KLH</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">{headerSubtitle}</p>
          </div>

          <div className="space-y-4 px-8 py-8">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400" htmlFor="klh-email">
                KLH Email Address
              </label>
              <div className="relative">
                <input
                  id="klh-email"
                  type="email"
                  placeholder="your.name@klh.edu.in"
                  value={formValues.email}
                  onChange={handleChange('email')}
                  className={`w-full rounded-[20px] border px-4 py-3 text-sm font-semibold text-slate-900 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                    errors.email ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
                {errors.email && <p className={errorClass}>{errors.email}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400" htmlFor="klh-password">
                Password
              </label>
              <input
                id="klh-password"
                type="password"
                placeholder="●●●●●●"
                value={formValues.password}
                onChange={handleChange('password')}
                className={`w-full rounded-[20px] border px-4 py-3 text-sm font-semibold text-slate-900 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                  errors.password ? 'border-red-400' : 'border-slate-200'
                }`}
              />
              {errors.password && <p className={errorClass}>{errors.password}</p>}
            </div>

            {!isSignIn && (
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400" htmlFor="klh-confirm">
                  Re-enter Password
                </label>
                <input
                  id="klh-confirm"
                  type="password"
                  placeholder="●●●●●●"
                  value={formValues.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  className={`w-full rounded-[20px] border px-4 py-3 text-sm font-semibold text-slate-900 transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200 ${
                    errors.confirmPassword ? 'border-red-400' : 'border-slate-200'
                  }`}
                />
                {errors.confirmPassword && <p className={errorClass}>{errors.confirmPassword}</p>}
              </div>
            )}

            {errors.api && <p className="text-sm font-medium text-red-500">{errors.api}</p>}
            {status && <p className="text-sm font-medium text-sky-600">{status}</p>}

            <button
              type="submit"
              className="mt-2 w-full rounded-[20px] bg-[#0f4dff] px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_20px_40px_-20px_rgba(15,77,255,0.7)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_30px_60px_-30px_rgba(15,77,255,0.9)]"
            >
              {primaryLabel}
            </button>

            <p className="pt-3 text-center text-sm text-slate-500">
              {secondaryPrompt}{' '}
              <button
                type="button"
                onClick={() => setMode(isSignIn ? 'sign-up' : 'sign-in')}
                className="font-semibold text-sky-600 transition hover:text-sky-500"
              >
                {secondaryAction}
              </button>
            </p>
          </div>

          <div className="rounded-b-[32px] border-t border-white/70 bg-white/60 px-8 py-5 text-center text-xs text-slate-500">
            <p className="tracking-[0.08em]">By signing in, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </form>

        <button
          type="button"
          onClick={onBack}
          className="mt-6 flex items-center justify-center gap-1 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <span aria-hidden="true">←</span>
          <span>Back to Roles</span>
        </button>
      </div>
    </div>
  );
};

export default AuthenticationScreen;

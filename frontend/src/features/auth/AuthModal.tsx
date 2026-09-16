import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';

type AuthMode = 'signin' | 'login';

type AuthModalProps = {
  isOpen: boolean;
  mode: AuthMode;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
  onAuthSuccess?: () => void;
};
type Step = 'form' | 'verify' | 'success';

export default function AuthModal({ isOpen, mode, onClose, onModeChange, onAuthSuccess }: AuthModalProps) {
  const [form, setForm] = useState({
    name: '',
    surname: '',
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setError('');
      setSuccess('');
      setIsSubmitting(false);
      setStep('form');
      setVerificationCode('');
      setPendingEmail('');
      setForm({
        name: '',
        surname: '',
        username: '',
        email: '',
        password: '',
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const isSignIn = mode === 'signin';

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        const payload = {
          name: form.name,
          surname: form.surname,
          username: form.username,
          email: form.email,
          password: form.password,
        };

        await apiClient.post('/api/Auth/register', payload);
        setPendingEmail(form.email);
        setVerificationCode('');
        setStep('verify');
        setForm({
          name: '',
          surname: '',
          username: '',
          email: '',
          password: '',
        });
        return;
      }

      const payload = {
        username: form.username,
        password: form.password,
      };

      const response = await apiClient.post('/api/Auth/login', payload);
      localStorage.setItem('username', response.data.username || form.username);
      localStorage.setItem('role', response.data.role || 'User');
      setSuccess('Login successful.');
      setForm({
        name: '',
        surname: '',
        username: '',
        email: '',
        password: '',
      });
      onAuthSuccess?.();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object'
          ? (err.response as { data?: { message?: string } }).data?.message || 'Something went wrong.'
          : 'Something went wrong.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await apiClient.post('/api/Auth/verify-email', {
        email: pendingEmail,
        code: verificationCode,
      });

      localStorage.setItem('username', response.data.username);
      localStorage.setItem('role', response.data.role);

      setStep('success');
      onAuthSuccess?.();
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err && err.response && typeof err.response === 'object'
          ? (err.response as { data?: { message?: string } }).data?.message || 'Something went wrong.'
          : 'Something went wrong.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError('');
    try{
      await apiClient.post('/api/Auth/resend-code', {
        email: pendingEmail,
      });

      setSuccess('A new code has been sent.');
    } catch {
      setError('Could not resend the code.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-4 backdrop-blur-sm md:items-center" onClick={onClose}>
      <div
        className={`w-full max-w-md rounded-t-[28px] border bg-white p-5 shadow-2xl shadow-slate-950/30 md:rounded-[28px] ${
          isSignIn ? 'border-[#f5c400]' : 'border-[#e4002b]'
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xl text-[#183b70] transition hover:bg-slate-200"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>

        {step === 'form' && (
          <>
            <div className="mt-3 border-l-4 border-[#f5c400] pl-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e4002b]">Michelin TMS</p>
              <h2 className="mt-1 text-2xl font-black text-[#183b70]">{isSignIn ? 'Create your account' : 'Welcome back'}</h2>
              <p className="mt-1 text-sm text-slate-500">{isSignIn ? 'Join the tyre management workspace.' : 'Log in to continue to your workspace.'}</p>
            </div>
            <div
              className="mt-4 grid grid-cols-2 gap-2 border border-slate-200 bg-slate-50 p-1"
              role="tablist"
              aria-label="Authentication mode"
            >
              <button
                type="button"
                className={`border-b-2 px-3 py-2.5 text-sm font-semibold transition ${
                  isSignIn ? 'border-[#f5c400] bg-white text-[#183b70]' : 'border-transparent text-slate-500 hover:text-[#183b70]'
                }`}
                onClick={() => onModeChange('signin')}
              >
                Sign in
              </button>
              <button
                type="button"
                className={`px-3 py-2.5 text-sm font-semibold transition ${
                  !isSignIn ? 'bg-[#e4002b] text-white shadow-md shadow-red-200' : 'text-slate-500 hover:text-[#e4002b]'
                }`}
                onClick={() => onModeChange('login')}
              >
                Log in
              </button>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              {mode === 'signin' && (
                <>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-[#183b70]">Name</span>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-[#183b70] outline-none transition placeholder:text-slate-400 focus:border-[#f5c400]"
                      placeholder="Your name"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-[#183b70]">Surname</span>
                    <input
                      name="surname"
                      value={form.surname}
                      onChange={handleChange}
                      required
                      className="w-full border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-[#183b70] outline-none transition placeholder:text-slate-400 focus:border-[#f5c400]"
                      placeholder="Your surname"
                    />
                  </label>
                </>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#183b70]">Username</span>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-[#183b70] outline-none transition placeholder:text-slate-400 focus:border-[#f5c400]"
                  placeholder="username"
                />
              </label>

              {mode === 'signin' && (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#183b70]">Email</span>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-[#183b70] outline-none transition placeholder:text-slate-400 focus:border-[#f5c400]"
                    placeholder="you@example.com"
                  />
                </label>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#183b70]">Password</span>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-[#183b70] outline-none transition placeholder:text-slate-400 focus:border-[#e4002b]"
                  placeholder="••••••••"
                />
              </label>

              {error && <p className="text-sm font-medium text-[#e4002b]">{error}</p>}
              {success && <p className="text-sm font-medium text-emerald-700">{success}</p>}

              <button
                type="submit"
                className={`w-full px-4 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-md transition disabled:cursor-not-allowed disabled:opacity-70 ${
                  isSignIn ? 'bg-[#f5c400] text-[#183b70] hover:bg-[#d9ad00]' : 'bg-[#e4002b] hover:bg-[#b90024]'
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Please wait...' : mode === 'signin' ? 'Create account' : 'Log in'}
              </button>
            </form>
          </>
        )}

        {step === 'verify' && (
          <div className="mt-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center border-2 border-[#f5c400] bg-[#183b70] text-xl font-black text-[#f5c400]">@</div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[#e4002b]">Michelin TMS</p>
            <h2 className="mt-2 text-2xl font-black text-[#183b70]">Verify your email</h2>
            <p className="mt-2 text-sm text-slate-500">
              A verification code was sent to <span className="font-semibold text-[#183b70]">{pendingEmail}</span>
            </p>

            <form className="mt-5 space-y-4 text-left" onSubmit={handleVerify}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#183b70]">Enter your 6-digit code</span>
                <input
                  name="code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  maxLength={6}
                  className="w-full border border-slate-200 bg-slate-50 px-3 py-3 text-center text-lg tracking-widest text-[#183b70] outline-none focus:border-[#f5c400]"
                  placeholder="XXX XXX"
                />
              </label>

              {error && <p className="text-sm font-medium text-[#e4002b]">{error}</p>}
              {success && <p className="text-sm font-medium text-emerald-700">{success}</p>}

              <button
                type="submit"
                className="w-full bg-[#e4002b] px-4 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-md transition hover:bg-[#b90024] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Please wait...' : 'Verify'}
              </button>

              <p className="text-center text-xs text-slate-500">
                Didn't get a code?{' '}
                <button type="button" onClick={handleResend} className="font-bold text-[#183b70] underline decoration-[#f5c400] decoration-2 underline-offset-4">
                  Resend
                </button>
              </p>
            </form>
          </div>
        )}

        {step === 'success' && (
          <div className="mt-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center border-4 border-[#f5c400] bg-[#183b70] text-2xl font-black text-[#f5c400]">
              ✓
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[#e4002b]">Account verified</p>
            <h2 className="mt-2 text-2xl font-black text-[#183b70]">Welcome to Michelin TMS</h2>
            <p className="mt-2 text-sm text-slate-500">You have successfully completed email verification.</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full bg-[#e4002b] px-4 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-md transition hover:bg-[#b90024]"
            >
              Main Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

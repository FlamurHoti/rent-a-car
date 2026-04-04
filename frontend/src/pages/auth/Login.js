import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Car, Loader } from '../../components/Icons';
import Button from '../../components/ui/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-pattern px-4 py-8">
      {/* Decorative floating elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 h-48 w-48 sm:h-72 sm:w-72 rounded-full bg-primary-200/20 blur-3xl animate-float" />
        <div className="absolute -bottom-20 -left-20 h-48 w-48 sm:h-72 sm:w-72 rounded-full bg-accent-400/10 blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm p-5 sm:p-8 shadow-card-hover">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6 animate-bounce-in">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-lg">
              <Car className="h-7 w-7" />
            </span>
          </div>
          <h1 className="text-2xl sm:text-display font-bold text-slate-900 text-center animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            Rent-a-Car
          </h1>
          <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-slate-600 text-center animate-fade-in-up" style={{ animationDelay: '250ms' }}>
            Sign in to your company dashboard
          </p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6 stagger-form">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 animate-fade-in">
                {error}
              </div>
            )}
            <label className="block animate-fade-in-up">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="input-field"
                placeholder="you@company.com"
              />
            </label>
            <label className="block animate-fade-in-up">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="input-field"
              />
            </label>
            <div className="animate-fade-in-up">
              <Button type="submit" disabled={loading} className="w-full gap-2" size="lg">
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : 'Sign in'}
              </Button>
            </div>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600 animate-fade-in" style={{ animationDelay: '500ms' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary-500 transition-all duration-300 hover:text-primary-600 hover:underline underline-offset-2">
              Register your company
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

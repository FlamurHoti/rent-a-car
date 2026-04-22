import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Car, Loader } from '../../components/Icons';

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
      setError(err.response?.data?.error || 'Hyrja deshtoi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-slate-900 to-slate-950" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-primary-500/15 blur-[120px] animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-accent-400/10 blur-[100px] animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="relative w-full max-w-md animate-scale-in">
        <div className="rounded-3xl glass-dark p-6 sm:p-10 shadow-glow">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8 animate-bounce-in">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-primary-500/30 blur-xl" />
              <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-2xl shadow-primary-500/40">
                <Car className="h-8 w-8" />
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white text-center font-display animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            Mire se erdhet perseri
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 text-center animate-fade-in-up" style={{ animationDelay: '250ms' }}>
            Hyni ne panelin e kompanise suaj
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5 stagger-form">
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300 animate-fade-in">
                {error}
              </div>
            )}
            <label className="block animate-fade-in-up">
              <span className="text-sm font-medium text-slate-300">Email</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="you@company.com"
                className="w-full mt-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400/50 transition-all duration-200 hover:bg-white/[0.08]" />
            </label>
            <label className="block animate-fade-in-up">
              <span className="text-sm font-medium text-slate-300">Fjalekalimi</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"
                className="w-full mt-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400/50 transition-all duration-200 hover:bg-white/[0.08]" />
            </label>
            <div className="animate-fade-in-up pt-1">
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-500/30 transition-all duration-300 hover:shadow-primary-500/50 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (<><Loader className="h-5 w-5 animate-spin" /> Duke hyre...</>) : 'Hyr'}
              </button>
            </div>
          </form>
          <p className="mt-8 text-center text-sm text-slate-400 animate-fade-in" style={{ animationDelay: '500ms' }}>
            I ri ketu?{' '}
            <Link to="/register" className="font-semibold text-primary-300 transition-all duration-300 hover:text-primary-200">
              Regjistro kompanine tende
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

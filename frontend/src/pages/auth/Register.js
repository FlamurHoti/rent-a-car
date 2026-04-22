import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Car, Loader } from '../../components/Icons';

const initial = {
  companyName: '', companyEmail: '', companyPhone: '', companyAddress: '',
  name: '', email: '', password: '',
};

export default function Register() {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try { await register(form); navigate('/'); }
    catch (err) { setError(err.response?.data?.error || 'Regjistrimi deshtoi.'); }
    finally { setLoading(false); }
  }

  const inputCls = "w-full mt-1.5 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400/50 transition-all duration-200 hover:bg-white/[0.08] text-sm";

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-slate-900 to-slate-950" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-1/4 h-[350px] w-[350px] rounded-full bg-primary-500/15 blur-[120px] animate-blob" />
        <div className="absolute bottom-10 left-1/4 h-[300px] w-[300px] rounded-full bg-accent-400/10 blur-[100px] animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="relative w-full max-w-lg animate-scale-in">
        <div className="rounded-3xl glass-dark p-6 sm:p-10 shadow-glow">
          <div className="flex items-center justify-center mb-6 animate-bounce-in">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-primary-500/30 blur-xl" />
              <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-2xl shadow-primary-500/40">
                <Car className="h-7 w-7" />
              </span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white text-center font-display animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            Regjistro kompanine tende
          </h1>
          <p className="mt-2 text-sm text-slate-400 text-center animate-fade-in-up" style={{ animationDelay: '250ms' }}>
            Fillo menaxhimin e flotes tende per disa minuta
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300 animate-fade-in">{error}</div>
            )}
            {/* Company section */}
            <fieldset className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <legend className="px-2 text-sm font-semibold text-slate-300">Detajet e kompanise</legend>
              <div className="mt-3 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-medium text-slate-400">Emri i kompanise</span>
                    <input name="companyName" value={form.companyName} onChange={handleChange} required className={inputCls} placeholder="RentKS" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-slate-400">Email i kompanise</span>
                    <input name="companyEmail" type="email" value={form.companyEmail} onChange={handleChange} required className={inputCls} placeholder="info@company.com" />
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-medium text-slate-400">Telefoni</span>
                    <input name="companyPhone" value={form.companyPhone} onChange={handleChange} className={inputCls} placeholder="+383 44 ..." />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-slate-400">Adresa</span>
                    <input name="companyAddress" value={form.companyAddress} onChange={handleChange} className={inputCls} placeholder="Prishtina, Kosovo" />
                  </label>
                </div>
              </div>
            </fieldset>

            {/* Owner section */}
            <fieldset className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 animate-fade-in-up" style={{ animationDelay: '450ms' }}>
              <legend className="px-2 text-sm font-semibold text-slate-300">Llogaria e pronarit</legend>
              <div className="mt-3 space-y-3">
                <label className="block">
                  <span className="text-xs font-medium text-slate-400">Emri juaj</span>
                  <input name="name" value={form.name} onChange={handleChange} required className={inputCls} placeholder="Flamur Hoti" />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs font-medium text-slate-400">Email</span>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required className={inputCls} placeholder="you@email.com" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-medium text-slate-400">Fjalekalimi (min 8)</span>
                    <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={8} className={inputCls} />
                  </label>
                </div>
              </div>
            </fieldset>

            <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-500/30 transition-all duration-300 hover:shadow-primary-500/50 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (<><Loader className="h-5 w-5 animate-spin" /> Duke krijuar...</>) : 'Krijo llogarinë'}
              </button>
            </div>
          </form>
          <p className="mt-6 text-center text-sm text-slate-400 animate-fade-in" style={{ animationDelay: '700ms' }}>
            Tashme i regjistruar?{' '}
            <Link to="/login" className="font-semibold text-primary-300 hover:text-primary-200 transition-all duration-300">Hyr</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

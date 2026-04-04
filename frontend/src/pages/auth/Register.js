import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Car, Loader } from '../../components/Icons';
import Button from '../../components/ui/Button';

const initial = {
  companyName: '',
  companyEmail: '',
  companyPhone: '',
  companyAddress: '',
  name: '',
  email: '',
  password: '',
};

export default function Register() {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-pattern px-4 py-6 sm:py-8">
      {/* Decorative floating elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 h-40 w-40 sm:h-64 sm:w-64 rounded-full bg-primary-200/20 blur-3xl animate-float" />
        <div className="absolute bottom-10 left-10 h-40 w-40 sm:h-64 sm:w-64 rounded-full bg-accent-400/10 blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative w-full max-w-lg animate-scale-in">
        <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm p-5 sm:p-8 shadow-card-hover">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6 animate-bounce-in">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-lg">
              <Car className="h-7 w-7" />
            </span>
          </div>
          <h1 className="text-2xl sm:text-display font-bold text-slate-900 text-center animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            Register your company
          </h1>
          <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-slate-600 text-center animate-fade-in-up" style={{ animationDelay: '250ms' }}>
            Create your rental company and owner account
          </p>
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 animate-fade-in">
                {error}
              </div>
            )}
            <fieldset className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <legend className="px-2 text-sm font-semibold text-slate-700">Company</legend>
              <div className="mt-4 space-y-4 stagger-form">
                <label className="block animate-fade-in-up">
                  <span className="text-sm font-medium text-slate-700">Company name</span>
                  <input name="companyName" value={form.companyName} onChange={handleChange} required className="input-field" />
                </label>
                <label className="block animate-fade-in-up">
                  <span className="text-sm font-medium text-slate-700">Company email</span>
                  <input name="companyEmail" type="email" value={form.companyEmail} onChange={handleChange} required className="input-field" />
                </label>
                <label className="block animate-fade-in-up">
                  <span className="text-sm font-medium text-slate-700">Company phone</span>
                  <input name="companyPhone" value={form.companyPhone} onChange={handleChange} className="input-field" />
                </label>
                <label className="block animate-fade-in-up">
                  <span className="text-sm font-medium text-slate-700">Address</span>
                  <input name="companyAddress" value={form.companyAddress} onChange={handleChange} className="input-field" />
                </label>
              </div>
            </fieldset>
            <fieldset className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 animate-fade-in-up" style={{ animationDelay: '450ms' }}>
              <legend className="px-2 text-sm font-semibold text-slate-700">Owner account</legend>
              <div className="mt-4 space-y-4 stagger-form">
                <label className="block animate-fade-in-up">
                  <span className="text-sm font-medium text-slate-700">Your name</span>
                  <input name="name" value={form.name} onChange={handleChange} required className="input-field" />
                </label>
                <label className="block animate-fade-in-up">
                  <span className="text-sm font-medium text-slate-700">Email</span>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required className="input-field" />
                </label>
                <label className="block animate-fade-in-up">
                  <span className="text-sm font-medium text-slate-700">Password (min 6)</span>
                  <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} className="input-field" />
                </label>
              </div>
            </fieldset>
            <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              <Button type="submit" disabled={loading} className="w-full gap-2" size="lg">
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : 'Register'}
              </Button>
            </div>
          </form>
          <p className="mt-6 text-center text-sm text-slate-600 animate-fade-in" style={{ animationDelay: '700ms' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-500 transition-all duration-300 hover:text-primary-600 hover:underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

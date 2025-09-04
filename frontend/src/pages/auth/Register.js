import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-card-hover">
        <h1 className="text-display font-bold text-slate-900">Register your company</h1>
        <p className="mt-2 text-slate-600">Create company and owner account</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <fieldset className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
            <legend className="px-2 text-sm font-semibold text-slate-700">Company</legend>
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Company name</span>
                <input name="companyName" value={form.companyName} onChange={handleChange} required className="input-field" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Company email</span>
                <input name="companyEmail" type="email" value={form.companyEmail} onChange={handleChange} required className="input-field" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Company phone</span>
                <input name="companyPhone" value={form.companyPhone} onChange={handleChange} className="input-field" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Address</span>
                <input name="companyAddress" value={form.companyAddress} onChange={handleChange} className="input-field" />
              </label>
            </div>
          </fieldset>
          <fieldset className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
            <legend className="px-2 text-sm font-semibold text-slate-700">Owner account</legend>
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Your name</span>
                <input name="name" value={form.name} onChange={handleChange} required className="input-field" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Email</span>
                <input name="email" type="email" value={form.email} onChange={handleChange} required className="input-field" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Password (min 6)</span>
                <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={6} className="input-field" />
              </label>
            </div>
          </fieldset>
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? 'Creating...' : 'Register'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-500 transition hover:text-primary-600">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

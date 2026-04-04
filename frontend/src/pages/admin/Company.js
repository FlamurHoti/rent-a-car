import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Building2, CheckCircle, Loader } from '../../components/Icons';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/LoadingSpinner';

const initial = { name: '', email: '', phone: '', address: '' };

export default function Company() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    api.get('/companies/me', { signal: controller.signal })
      .then((res) => setForm({
        name: res.data.name || '', email: res.data.email || '',
        phone: res.data.phone || '', address: res.data.address || '',
      }))
      .catch((err) => { if (err.name !== 'CanceledError') setError('Failed to load company'); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    api.patch('/companies/me', form)
      .then(() => setMessage('Company updated.'))
      .catch((err) => setError(err.response?.data?.error || 'Update failed'))
      .finally(() => setSaving(false));
  };

  if (loading) return <LoadingSpinner message="Loading company..." />;

  return (
    <div className="space-y-8">
      <h1 className="text-display font-bold text-slate-900 flex items-center gap-3 animate-fade-in-up">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-500 transition-all duration-300 hover:scale-110 hover:bg-primary-100">
          <Building2 className="h-6 w-6" />
        </span>
        Company profile
      </h1>
      <Card className="max-w-xl animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <form onSubmit={handleSubmit} className="space-y-6 stagger-form">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 animate-fade-in">{error}</div>
          )}
          {message && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2 animate-scale-in">
              <CheckCircle className="h-4 w-4 animate-pop" />
              {message}
            </div>
          )}
          <label className="block animate-fade-in-up">
            <span className="text-sm font-medium text-slate-700">Company name</span>
            <input name="name" value={form.name} onChange={handleChange} required className="input-field" />
          </label>
          <label className="block animate-fade-in-up">
            <span className="text-sm font-medium text-slate-700">Company email</span>
            <input name="email" type="email" value={form.email} onChange={handleChange} required className="input-field" />
          </label>
          <label className="block animate-fade-in-up">
            <span className="text-sm font-medium text-slate-700">Phone</span>
            <input name="phone" value={form.phone} onChange={handleChange} className="input-field" />
          </label>
          <label className="block animate-fade-in-up">
            <span className="text-sm font-medium text-slate-700">Address</span>
            <input name="address" value={form.address} onChange={handleChange} className="input-field" />
          </label>
          <div className="animate-fade-in-up">
            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : 'Save'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

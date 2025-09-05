import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { Building2 } from '../../components/Icons';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const initial = { name: '', email: '', phone: '', address: '' };

export default function Company() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/companies/me')
      .then((res) => setForm({
        name: res.data.name || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        address: res.data.address || '',
      }))
      .catch(() => setError('Failed to load company'))
      .finally(() => setLoading(false));
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

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-display font-bold text-slate-900 flex items-center gap-2">
        <Building2 className="h-8 w-8 text-primary-500" />
        Company profile
      </h1>
      <Card className="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          {message && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">{message}</div>
          )}
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Company name</span>
            <input name="name" value={form.name} onChange={handleChange} required className="input-field" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Company email</span>
            <input name="email" type="email" value={form.email} onChange={handleChange} required className="input-field" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Phone</span>
            <input name="phone" value={form.phone} onChange={handleChange} className="input-field" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Address</span>
            <input name="address" value={form.address} onChange={handleChange} className="input-field" />
          </label>
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </form>
      </Card>
    </div>
  );
}

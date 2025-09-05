import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { FUEL_OPTIONS, TRANS_OPTIONS, STATUS_OPTIONS } from '../../constants';





const initial = {
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  plateNumber: '',
  fuelType: 'PETROL',
  transmission: 'AUTOMATIC',
  pricePerDay: '',
  status: 'AVAILABLE',
  currentKm: 0,
  serviceDueKm: '',
  imageUrl: '',
};

export default function CarForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/cars/${id}`)
      .then((res) => {
        const c = res.data;
        setForm({
          brand: c.brand,
          model: c.model,
          year: c.year,
          plateNumber: c.plateNumber,
          fuelType: c.fuelType,
          transmission: c.transmission,
          pricePerDay: String(c.pricePerDay),
          status: c.status,
          currentKm: c.currentKm ?? 0,
          serviceDueKm: c.serviceDueKm != null ? String(c.serviceDueKm) : '',
          imageUrl: c.imageUrl || '',
        });
      })
      .catch(() => setError('Car not found'));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === 'year' || name === 'currentKm' ? (value ? parseInt(value, 10) : 0) : name === 'pricePerDay' || name === 'serviceDueKm' ? value : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const payload = {
      ...form,
      year: form.year || new Date().getFullYear(),
      currentKm: form.currentKm || 0,
      serviceDueKm: form.serviceDueKm === '' ? null : parseInt(form.serviceDueKm, 10),
      pricePerDay: parseFloat(form.pricePerDay) || 0,
    };
    const req = isEdit ? api.patch(`/cars/${id}`, payload) : api.post('/cars', payload);
    req
      .then(() => navigate('/cars'))
      .catch((err) => setError(err.response?.data?.error || 'Save failed'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-8">
      <h1 className="text-display font-bold text-slate-900">{isEdit ? 'Edit car' : 'Add car'}</h1>
      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Brand</span>
              <input name="brand" value={form.brand} onChange={handleChange} required className="input-field" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Model</span>
              <input name="model" value={form.model} onChange={handleChange} required className="input-field" />
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Year</span>
              <input name="year" type="number" min="1990" max="2030" value={form.year} onChange={handleChange} className="input-field" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Plate number</span>
              <input name="plateNumber" value={form.plateNumber} onChange={handleChange} required className="input-field" />
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Fuel type</span>
              <select name="fuelType" value={form.fuelType} onChange={handleChange} className="input-field">
                {FUEL_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Transmission</span>
              <select name="transmission" value={form.transmission} onChange={handleChange} className="input-field">
                {TRANS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Price per day (€)</span>
              <input name="pricePerDay" type="number" min="0" step="0.01" value={form.pricePerDay} onChange={handleChange} required className="input-field" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select name="status" value={form.status} onChange={handleChange} className="input-field">
                {STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Current km</span>
              <input name="currentKm" type="number" min="0" value={form.currentKm} onChange={handleChange} className="input-field" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Service due km</span>
              <input name="serviceDueKm" type="number" min="0" placeholder="Optional" value={form.serviceDueKm} onChange={handleChange} className="input-field" />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Car image URL <span className="font-normal text-slate-400">(optional)</span></span>
            <input name="imageUrl" type="url" placeholder="https://..." value={form.imageUrl} onChange={handleChange} className="input-field" />
            {form.imageUrl && (
              <img src={form.imageUrl} alt="preview" className="mt-2 h-32 w-full rounded-lg object-cover border border-slate-200" onError={(e) => { e.target.style.display = 'none'; }} />
            )}
          </label>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/cars')}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

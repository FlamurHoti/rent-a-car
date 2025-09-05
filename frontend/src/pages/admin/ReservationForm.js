import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

const initial = {
  carId: '',
  customerName: '',
  customerPhone: '',
  startDate: '',
  endDate: '',
  notes: '',
  status: 'PENDING',
};

export default function ReservationForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [cars, setCars] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/cars').then((res) => setCars(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/reservations/${id}`).then((res) => {
      const r = res.data;
      setForm({
        carId: r.carId,
        customerName: r.customerName,
        customerPhone: r.customerPhone,
        startDate: r.startDate.slice(0, 10),
        endDate: r.endDate.slice(0, 10),
        notes: r.notes || '',
        status: r.status,
      });
    }).catch(() => setError('Reservation not found'));
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (isEdit) {
      api.patch(`/reservations/${id}`, {
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        startDate: form.startDate,
        endDate: form.endDate,
        notes: form.notes || null,
        status: form.status,
      })
        .then(() => navigate('/reservations'))
        .catch((err) => setError(err.response?.data?.error || 'Update failed'))
        .finally(() => setLoading(false));
    } else {
      api.post('/reservations', {
        carId: form.carId,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        startDate: form.startDate,
        endDate: form.endDate,
        notes: form.notes || null,
      })
        .then(() => navigate('/reservations'))
        .catch((err) => setError(err.response?.data?.error || 'Create failed'))
        .finally(() => setLoading(false));
    }
  };

  const minDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-8">
      <h1 className="text-display font-bold text-slate-900">{isEdit ? 'Edit reservation' : 'New reservation'}</h1>
      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          {!isEdit && (
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Car</span>
              <select name="carId" value={form.carId} onChange={handleChange} required className="input-field">
                <option value="">Select car</option>
                {cars.filter((c) => c.status === 'AVAILABLE').map((c) => (
                  <option key={c.id} value={c.id}>{c.brand} {c.model} – {c.plateNumber} (€{Number(c.pricePerDay).toFixed(2)}/day)</option>
                ))}
              </select>
            </label>
          )}
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Customer name</span>
              <input name="customerName" value={form.customerName} onChange={handleChange} required className="input-field" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Customer phone</span>
              <input name="customerPhone" value={form.customerPhone} onChange={handleChange} required className="input-field" />
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Start date</span>
              <input name="startDate" type="date" value={form.startDate} onChange={handleChange} min={minDate} required className="input-field" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">End date</span>
              <input name="endDate" type="date" value={form.endDate} onChange={handleChange} min={form.startDate || minDate} required className="input-field" />
            </label>
          </div>
          {isEdit && (
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select name="status" value={form.status} onChange={handleChange} className="input-field">
                {STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
          )}
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Notes</span>
            <input name="notes" value={form.notes} onChange={handleChange} placeholder="Optional" className="input-field" />
          </label>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/reservations')}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';
import { Loader } from '../../components/Icons';
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
    const controller = new AbortController();
    api.get('/cars', { signal: controller.signal })
      .then((res) => setCars(res.data))
      .catch((err) => { if (err.name !== 'CanceledError') console.error(err); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    const controller = new AbortController();
    api.get(`/reservations/${id}`, { signal: controller.signal }).then((res) => {
      const r = res.data;
      setForm({
        carId: r.carId, customerName: r.customerName, customerPhone: r.customerPhone,
        startDate: r.startDate.slice(0, 10), endDate: r.endDate.slice(0, 10),
        notes: r.notes || '', status: r.status,
      });
    }).catch((err) => { if (err.name !== 'CanceledError') setError('Reservation not found'); });
    return () => controller.abort();
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
      <h1 className="text-display font-bold text-slate-900 animate-fade-in-up">
        {isEdit ? 'Edit reservation' : 'New reservation'}
      </h1>
      <Card className="max-w-2xl animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <form onSubmit={handleSubmit} className="space-y-6 stagger-form">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 animate-fade-in">{error}</div>
          )}
          {!isEdit && (
            <label className="block animate-fade-in-up">
              <span className="text-sm font-medium text-slate-700">Car</span>
              <select name="carId" value={form.carId} onChange={handleChange} required className="input-field">
                <option value="">Select car</option>
                {cars.filter((c) => c.status === 'AVAILABLE').map((c) => (
                  <option key={c.id} value={c.id}>{c.brand} {c.model} – {c.plateNumber} (&euro;{Number(c.pricePerDay).toFixed(2)}/day)</option>
                ))}
              </select>
            </label>
          )}
          <div className="grid gap-5 sm:grid-cols-2 animate-fade-in-up">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Customer name</span>
              <input name="customerName" value={form.customerName} onChange={handleChange} required className="input-field" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Customer phone</span>
              <input name="customerPhone" value={form.customerPhone} onChange={handleChange} required className="input-field" />
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 animate-fade-in-up">
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
            <label className="block animate-fade-in-up">
              <span className="text-sm font-medium text-slate-700">Status</span>
              <select name="status" value={form.status} onChange={handleChange} className="input-field">
                {STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
          )}
          <label className="block animate-fade-in-up">
            <span className="text-sm font-medium text-slate-700">Notes</span>
            <input name="notes" value={form.notes} onChange={handleChange} placeholder="Optional" className="input-field" />
          </label>
          <div className="flex gap-3 pt-2 animate-fade-in-up">
            <Button type="button" variant="secondary" onClick={() => navigate('/reservations')}>Cancel</Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? (
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

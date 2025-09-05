import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/format';
import { Plus, CheckCircle } from '../../components/Icons';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const METHOD_LABELS = { CASH: 'Cash', BANK: 'Bank', ONLINE: 'Online' };
const STATUS_LABELS = { PENDING: 'Pending', COMPLETED: 'Completed', FAILED: 'Failed', REFUNDED: 'Refunded' };
const STATUS_COLORS = {
  pending: 'bg-slate-100 text-slate-700',
  completed: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-amber-100 text-amber-700',
};

export default function Payments() {
  const { user } = useAuth();
  const isOwner = user?.role === 'OWNER';
  const [payments, setPayments] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ reservationId: '', amount: '', method: 'CASH' });
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    api.get('/payments').then((res) => setPayments(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (showForm) {
      api.get('/reservations').then((res) => setReservations(res.data.filter((r) => r.status !== 'CANCELLED')));
    }
  }, [showForm]);

  const setStatus = (paymentId, status) => {
    api.patch(`/payments/${paymentId}`, { status })
      .then((res) => setPayments((prev) => prev.map((p) => (p.id === res.data.id ? res.data : p))))
      .catch((err) => alert(err.response?.data?.error || 'Update failed'));
  };

  const handleCreatePayment = (e) => {
    e.preventDefault();
    setSubmitError('');
    api.post('/payments', { reservationId: form.reservationId, amount: parseFloat(form.amount), method: form.method })
      .then((res) => {
        setPayments((prev) => [res.data, ...prev]);
        setShowForm(false);
        setForm({ reservationId: '', amount: '', method: 'CASH' });
      })
      .catch((err) => setSubmitError(err.response?.data?.error || 'Create failed'));
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-slate-600">Loading payments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-display font-bold text-slate-900">Payments</h1>
        <Button variant={showForm ? 'secondary' : 'primary'} onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancel' : 'Add payment'}
        </Button>
      </div>

      {showForm && (
        <Card className="max-w-xl">
          <form onSubmit={handleCreatePayment} className="space-y-6">
            {submitError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{submitError}</div>
            )}
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Reservation</span>
              <select value={form.reservationId} onChange={(e) => setForm((f) => ({ ...f, reservationId: e.target.value }))} required className="input-field">
                <option value="">Select reservation</option>
                {reservations.map((r) => (
                  <option key={r.id} value={r.id}>{r.customerName} – {r.car?.brand} {r.car?.model} – €{Number(r.totalPrice).toFixed(2)}</option>
                ))}
              </select>
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Amount (€)</span>
                <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} required className="input-field" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Method</span>
                <select value={form.method} onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))} className="input-field">
                  {Object.entries(METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </label>
            </div>
            <Button type="submit">Create payment</Button>
          </form>
        </Card>
      )}

      {!isOwner && (
        <p className="text-sm text-slate-600">Only OWNER can mark payments as completed.</p>
      )}

      <div className="space-y-4">
        {payments.map((p) => (
          <Card key={p.id} hover>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-slate-900">{p.reservation?.car?.brand} {p.reservation?.car?.model} – {formatDate(p.reservation?.startDate)}</p>
                <p className="text-sm text-slate-600">{p.reservation?.customerName}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-primary-600">€{Number(p.amount).toFixed(2)}</span>
                <span className="text-sm text-slate-500">{METHOD_LABELS[p.method]}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[p.status?.toLowerCase()] || 'bg-slate-100 text-slate-700'}`}>
                  {STATUS_LABELS[p.status]}
                </span>
                <span className="text-sm text-slate-500">{p.paidAt ? formatDate(p.paidAt) : '–'}</span>
                {isOwner && p.status === 'PENDING' && (
                  <Button size="sm" onClick={() => setStatus(p.id, 'COMPLETED')} className="gap-1">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Mark completed
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {payments.length === 0 && (
        <Card>
          <p className="text-center text-slate-600">No payments yet.</p>
        </Card>
      )}
    </div>
  );
}

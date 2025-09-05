import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/format';
import { printContract } from '../../utils/contractPdf';
import { Plus, Pencil, FileText, Trash2 } from '../../components/Icons';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const STATUS_LABELS = { PENDING: 'Pending', CONFIRMED: 'Confirmed', COMPLETED: 'Completed', CANCELLED: 'Cancelled' };
const STATUS_COLORS = {
  pending: 'bg-slate-100 text-slate-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function Reservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const params = statusFilter ? { status: statusFilter } : {};
    api.get('/reservations', { params }).then((res) => setReservations(res.data)).catch(console.error).finally(() => setLoading(false));
  }, [statusFilter]);

  const handleDelete = (id, name) => {
    if (!window.confirm(`Delete reservation for ${name}?`)) return;
    api.delete(`/reservations/${id}`).then(() => setReservations((r) => r.filter((x) => x.id !== id))).catch(console.error);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-slate-600">Loading reservations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-display font-bold text-slate-900">Reservations</h1>
        <Link to="/reservations/new">
          <Button size="md" className="gap-2">
            <Plus className="h-4 w-4" />
            New reservation
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field max-w-[200px]">
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {reservations.map((r) => (
          <Card key={r.id} hover>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-slate-900">{r.customerName}</p>
                <p className="text-sm text-slate-600">{r.customerPhone}</p>
                <p className="mt-1 text-sm text-slate-700">{r.car?.brand} {r.car?.model} ({r.car?.plateNumber})</p>
                <p className="text-sm text-slate-500">{formatDate(r.startDate)} – {formatDate(r.endDate)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-semibold text-primary-600">€{Number(r.totalPrice).toFixed(2)}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[r.status?.toLowerCase()] || 'bg-slate-100 text-slate-700'}`}>
                  {STATUS_LABELS[r.status]}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to={`/reservations/${r.id}/edit`}>
                  <Button variant="secondary" size="sm" className="gap-1">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => printContract(r, user?.company)} className="gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  Print contract
                </Button>
                {r.status !== 'COMPLETED' && r.status !== 'CANCELLED' && (
                  <Button variant="danger" size="sm" onClick={() => handleDelete(r.id, r.customerName)} className="gap-1">
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {reservations.length === 0 && (
        <Card>
          <p className="text-center text-slate-600">No reservations.</p>
        </Card>
      )}
    </div>
  );
}

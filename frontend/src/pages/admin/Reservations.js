import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/format';
import { printContract } from '../../utils/contractPdf';
import { Plus, Pencil, FileText, Trash2, Calendar } from '../../components/Icons';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { RESERVATION_STATUS_LABELS as STATUS_LABELS, STATUS_COLORS } from '../../constants';


export default function Reservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const params = statusFilter ? { status: statusFilter } : {};
    api.get('/reservations', { params, signal: controller.signal })
      .then((res) => setReservations(res.data))
      .catch((err) => { if (err.name !== 'CanceledError') console.error(err); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [statusFilter]);

  const handleDelete = (id, name) => {
    if (!window.confirm(`Delete reservation for ${name}?`)) return;
    api.delete(`/reservations/${id}`).then(() => setReservations((r) => r.filter((x) => x.id !== id))).catch(console.error);
  };

  if (loading) return <LoadingSpinner message="Loading reservations..." />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in-up">
        <h1 className="text-display font-bold text-slate-900">Reservations</h1>
        <Link to="/reservations/new">
          <Button size="md" className="gap-2 group">
            <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            New reservation
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field max-w-[200px]">
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4 stagger-children">
        {reservations.map((r) => (
          <div key={r.id} className="animate-fade-in-up">
            <Card hover className="group">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="transition-all duration-200 group-hover:translate-x-1">
                  <p className="font-medium text-slate-900">{r.customerName}</p>
                  <p className="text-sm text-slate-600">{r.customerPhone}</p>
                  <p className="mt-1 text-sm text-slate-700">{r.car?.brand} {r.car?.model} ({r.car?.plateNumber})</p>
                  <p className="text-sm text-slate-500">{formatDate(r.startDate)} – {formatDate(r.endDate)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-semibold text-primary-600">&euro;{Number(r.totalPrice).toFixed(2)}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200 ${STATUS_COLORS[r.status?.toLowerCase()] || 'bg-slate-100 text-slate-700'}`}>
                    {STATUS_LABELS[r.status]}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to={`/reservations/${r.id}/edit`}>
                    <Button variant="secondary" size="sm" className="gap-1 group/edit">
                      <Pencil className="h-3.5 w-3.5 transition-transform duration-200 group-hover/edit:rotate-12" />
                      Edit
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => printContract(r, user?.company)} className="gap-1 group/print">
                    <FileText className="h-3.5 w-3.5 transition-transform duration-200 group-hover/print:scale-110" />
                    Print contract
                  </Button>
                  {r.status !== 'COMPLETED' && r.status !== 'CANCELLED' && (
                    <Button variant="danger" size="sm" onClick={() => handleDelete(r.id, r.customerName)} className="gap-1 group/del">
                      <Trash2 className="h-3.5 w-3.5 transition-transform duration-200 group-hover/del:scale-110" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {reservations.length === 0 && <EmptyState Icon={Calendar} message="No reservations." />}
    </div>
  );
}

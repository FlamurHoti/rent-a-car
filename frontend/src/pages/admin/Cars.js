import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { Car, Search, Plus, Pencil, Trash2 } from '../../components/Icons';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { CAR_STATUS_LABELS as STATUS_LABELS, FUEL_LABELS as FUEL, TRANS_LABELS as TRANS, STATUS_COLORS } from '../../constants';

export default function Cars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    api.get('/cars', { params, signal: controller.signal })
      .then((res) => setCars(res.data))
      .catch((err) => { if (err.name !== 'CanceledError') console.error(err); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [search, statusFilter]);

  const handleDelete = (id, plate) => {
    if (!window.confirm(`Delete car ${plate}?`)) return;
    api.delete(`/cars/${id}`).then(() => setCars((c) => c.filter((x) => x.id !== id))).catch(console.error);
  };

  if (loading) {
    return <LoadingSpinner message="Loading cars..." />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in-up">
        <h1 className="text-display font-bold text-slate-900">Cars</h1>
        <Link to="/cars/new">
          <Button size="md" className="gap-2 group">
            <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            Add car
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="relative max-w-xs group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-primary-500" />
          <input
            type="text"
            placeholder="Search brand, model, plate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field max-w-[200px]"
        >
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
        {cars.map((car) => (
          <div key={car.id} className="animate-fade-in-up">
            <Card hover className={`group ${car.dueForService ? 'border-l-4 border-l-amber-500' : ''}`}>
              <div className="flex flex-col gap-4">
                <div className="flex h-24 items-center justify-center rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden transition-all duration-300">
                  {car.imageUrl
                    ? <img src={car.imageUrl} alt={`${car.brand} ${car.model}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                    : null}
                  <div className={`${car.imageUrl ? 'hidden' : 'flex'} h-full w-full items-center justify-center`}>
                    <Car className="h-12 w-12 text-slate-400 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-h3 font-semibold text-slate-900 transition-colors duration-200 group-hover:text-primary-600">{car.brand} {car.model}</h3>
                    <p className="text-sm text-slate-600">{car.plateNumber} · {car.year}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-200 ${STATUS_COLORS[car.status?.toLowerCase()] || 'bg-slate-100 text-slate-700'}`}>
                    {STATUS_LABELS[car.status]}
                  </span>
                </div>
                {car.dueForService && (
                  <span className="inline-flex w-fit rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 animate-pulse-soft">
                    Service due
                  </span>
                )}
                <p className="text-sm text-slate-600">{FUEL[car.fuelType]} / {TRANS[car.transmission]}</p>
                <p className="text-xl font-bold text-primary-500">
                  &euro;{Number(car.pricePerDay).toFixed(2)}
                  <span className="text-sm font-normal text-slate-500">/day</span>
                </p>
                <p className="text-xs text-slate-500">{car.currentKm} km{car.serviceDueKm ? ` / ${car.serviceDueKm} km` : ''}</p>
                <div className="mt-2 flex gap-2">
                  <Link to={`/cars/${car.id}/edit`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full gap-1 group/edit">
                      <Pencil className="h-3.5 w-3.5 transition-transform duration-200 group-hover/edit:rotate-12" />
                      Edit
                    </Button>
                  </Link>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(car.id, car.plateNumber)} className="gap-1 group/del">
                    <Trash2 className="h-3.5 w-3.5 transition-transform duration-200 group-hover/del:scale-110" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {cars.length === 0 && <EmptyState Icon={Car} message="No cars. Add your first car." />}
    </div>
  );
}

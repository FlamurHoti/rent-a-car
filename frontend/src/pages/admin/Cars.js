import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { Car, Search, Plus, Pencil, Trash2 } from '../../components/Icons';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const STATUS_LABELS = { AVAILABLE: 'Available', RESERVED: 'Reserved', MAINTENANCE: 'Maintenance' };
const FUEL = { PETROL: 'Petrol', DIESEL: 'Diesel', ELECTRIC: 'Electric', HYBRID: 'Hybrid', LPG: 'LPG' };
const TRANS = { MANUAL: 'Manual', AUTOMATIC: 'Automatic' };
const STATUS_COLORS = {
  available: 'bg-emerald-100 text-emerald-700',
  reserved: 'bg-blue-100 text-blue-700',
  maintenance: 'bg-amber-100 text-amber-700',
};

export default function Cars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    api.get('/cars', { params }).then((res) => setCars(res.data)).catch(console.error).finally(() => setLoading(false));
  }, [search, statusFilter]);

  const handleDelete = (id, plate) => {
    if (!window.confirm(`Delete car ${plate}?`)) return;
    api.delete(`/cars/${id}`).then(() => setCars((c) => c.filter((x) => x.id !== id))).catch(console.error);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-slate-600">Loading cars...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-display font-bold text-slate-900">Cars</h1>
        <Link to="/cars/new">
          <Button size="md" className="gap-2">
            <Plus className="h-4 w-4" />
            Add car
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cars.map((car) => (
          <Card key={car.id} hover className={car.dueForService ? 'border-l-4 border-l-amber-500' : ''}>
            <div className="flex flex-col gap-4">
              <div className="flex h-24 items-center justify-center rounded-lg bg-slate-100 transition duration-300">
                <Car className="h-12 w-12 text-slate-400" />
              </div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-h3 font-semibold text-slate-900">{car.brand} {car.model}</h3>
                  <p className="text-sm text-slate-600">{car.plateNumber} · {car.year}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[car.status?.toLowerCase()] || 'bg-slate-100 text-slate-700'}`}>
                  {STATUS_LABELS[car.status]}
                </span>
              </div>
              {car.dueForService && (
                <span className="inline-flex w-fit rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                  Service due
                </span>
              )}
              <p className="text-sm text-slate-600">{FUEL[car.fuelType]} / {TRANS[car.transmission]}</p>
              <p className="text-xl font-bold text-primary-500">
                €{Number(car.pricePerDay).toFixed(2)}
                <span className="text-sm font-normal text-slate-500">/day</span>
              </p>
              <p className="text-xs text-slate-500">{car.currentKm} km{car.serviceDueKm ? ` / ${car.serviceDueKm} km` : ''}</p>
              <div className="mt-2 flex gap-2">
                <Link to={`/cars/${car.id}/edit`} className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full gap-1">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </Link>
                <Button variant="danger" size="sm" onClick={() => handleDelete(car.id, car.plateNumber)} className="gap-1">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {cars.length === 0 && (
        <Card>
          <p className="text-center text-slate-600">No cars. Add your first car.</p>
        </Card>
      )}
    </div>
  );
}

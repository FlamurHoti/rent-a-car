import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { Car, CheckCircle, Calendar, Euro, AlertTriangle, Activity } from '../../components/Icons';
import Card from '../../components/ui/Card';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/dashboard/service-alerts'),
      api.get('/dashboard/activity?limit=15'),
    ])
      .then(([s, a, act]) => {
        setStats(s.data);
        setAlerts(a.data);
        setActivity(act.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-slate-600">Loading dashboard...</p>
      </div>
    );
  }
  if (!stats) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-red-600">Failed to load dashboard.</p>
      </div>
    );
  }

  const formatAction = (action) => action.replace(/_/g, ' ');

  const statCards = [
    { label: 'Total cars', value: stats.totalCars, Icon: Car, color: 'text-primary-500', bg: 'bg-primary-50' },
    { label: 'Available now', value: stats.activeCars, Icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Reservations today', value: stats.reservationsToday, Icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Monthly revenue', value: `€${Number(stats.monthlyRevenue).toFixed(2)}`, Icon: Euro, color: 'text-primary-600', bg: 'bg-primary-50', highlight: true },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-display font-bold text-slate-900 md:text-3xl">Dashboard</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label} hover className={s.highlight ? 'border-primary-200' : ''}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{s.label}</p>
                <p className={`mt-2 text-2xl font-bold ${s.highlight ? 'text-primary-600' : 'text-slate-900'}`}>
                  {s.value}
                </p>
              </div>
              <span className={`rounded-xl p-2.5 ${s.bg} ${s.color}`}>
                <s.Icon className="h-6 w-6" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      {alerts.length > 0 && (
        <section>
          <h2 className="mb-4 text-h2 font-semibold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            Service alerts
          </h2>
          <div className="space-y-2">
            {alerts.map((car) => (
              <Link
                key={car.id}
                to={`/cars/${car.id}/edit`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-slate-800 transition duration-200 hover:border-amber-300 hover:bg-amber-100"
              >
                <span className="font-medium">{car.brand} {car.model} – {car.plateNumber}</span>
                <span className="text-sm text-slate-600">{car.currentKm} km (due: {car.serviceDueKm} km)</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-h2 font-semibold text-slate-900 flex items-center gap-2">
          <Activity className="h-6 w-6 text-slate-600" />
          Recent activity
        </h2>
        <Card padding={false}>
          <ul className="divide-y divide-slate-200">
            {activity.map((log) => (
              <li key={log.id} className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 text-sm">
                <span className="capitalize text-slate-700">{formatAction(log.action)}</span>
                <span className="text-slate-500">{log.user?.name} · {new Date(log.createdAt).toLocaleString()}</span>
              </li>
            ))}
            {activity.length === 0 && (
              <li className="px-6 py-8 text-center text-slate-500">No activity yet.</li>
            )}
          </ul>
        </Card>
      </section>
    </div>
  );
}

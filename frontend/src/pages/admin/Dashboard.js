import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { Car, CheckCircle, Calendar, Euro, AlertTriangle, Activity } from '../../components/Icons';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const sig = { signal: controller.signal };
    Promise.all([
      api.get('/dashboard/stats', sig),
      api.get('/dashboard/service-alerts', sig),
      api.get('/dashboard/activity?limit=15', sig),
    ])
      .then(([s, a, act]) => {
        setStats(s.data);
        setAlerts(a.data);
        setActivity(act.data);
      })
      .catch((err) => { if (err.name !== 'CanceledError') console.error(err); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;
  if (!stats) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center animate-scale-in">
        <p className="text-red-600">Failed to load dashboard.</p>
      </div>
    );
  }

  const formatAction = (action) => action.replace(/_/g, ' ');

  const statCards = [
    { label: 'Total cars', value: stats.totalCars, Icon: Car, color: 'text-primary-500', bg: 'bg-primary-50', ring: 'group-hover:ring-primary-200' },
    { label: 'Available now', value: stats.activeCars, Icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', ring: 'group-hover:ring-emerald-200' },
    { label: 'Reservations today', value: stats.reservationsToday, Icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50', ring: 'group-hover:ring-amber-200' },
    { label: 'Monthly revenue', value: `€${Number(stats.monthlyRevenue).toFixed(2)}`, Icon: Euro, color: 'text-primary-600', bg: 'bg-primary-50', highlight: true, ring: 'group-hover:ring-primary-200' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-display font-bold text-slate-900 md:text-3xl animate-fade-in-up">Dashboard</h1>

      {/* Stat cards with stagger */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
        {statCards.map((s) => (
          <div key={s.label} className="animate-fade-in-up">
            <Card hover className={`group transition-all duration-300 ${s.highlight ? 'border-primary-200' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{s.label}</p>
                  <p className={`mt-2 text-2xl font-bold animate-count-up ${s.highlight ? 'text-primary-600' : 'text-slate-900'}`}>
                    {s.value}
                  </p>
                </div>
                <span className={`rounded-xl p-2.5 ${s.bg} ${s.color} transition-all duration-300 ring-2 ring-transparent ${s.ring} group-hover:scale-110`}>
                  <s.Icon className="h-6 w-6" />
                </span>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Service alerts */}
      {alerts.length > 0 && (
        <section className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <h2 className="mb-4 text-h2 font-semibold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500 animate-wiggle" />
            Service alerts
          </h2>
          <div className="space-y-2 stagger-children">
            {alerts.map((car) => (
              <Link
                key={car.id}
                to={`/cars/${car.id}/edit`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-slate-800 transition-all duration-300 hover:border-amber-300 hover:bg-amber-100 hover:shadow-md hover:-translate-y-0.5 animate-fade-in-up"
              >
                <span className="font-medium">{car.brand} {car.model} – {car.plateNumber}</span>
                <span className="text-sm text-slate-600">{car.currentKm} km (due: {car.serviceDueKm} km)</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Activity log */}
      <section className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <h2 className="mb-4 text-h2 font-semibold text-slate-900 flex items-center gap-2">
          <Activity className="h-6 w-6 text-slate-600" />
          Recent activity
        </h2>
        <Card padding={false}>
          <ul className="divide-y divide-slate-200">
            {activity.map((log, i) => (
              <li
                key={log.id}
                className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 text-sm transition-all duration-200 hover:bg-slate-50 animate-fade-in-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span className="capitalize text-slate-700">{formatAction(log.action)}</span>
                <span className="text-slate-500">{log.user?.name} · {new Date(log.createdAt).toLocaleString()}</span>
              </li>
            ))}
            {activity.length === 0 && (
              <li className="px-6 py-8 text-center text-slate-500 animate-fade-in">No activity yet.</li>
            )}
          </ul>
        </Card>
      </section>
    </div>
  );
}

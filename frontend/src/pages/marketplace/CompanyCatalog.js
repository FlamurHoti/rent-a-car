import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import apiPublic from '../../api/publicClient';
import { Car, Loader, SlidersHorizontal, ChevronLeft, Fuel, Gauge, MapPin, Phone, ArrowRight } from '../../components/Icons';
import Button from '../../components/ui/Button';
import { FUEL_LABELS as FUEL, TRANS_LABELS as TRANS } from '../../constants';

export default function CompanyCatalog() {
  const { companyId } = useParams();
  const [searchParams] = useSearchParams();
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const datesValid = startDate && endDate && new Date(startDate) < new Date(endDate);

  const [data, setData] = useState({ company: null, cars: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [fuelFilter, setFuelFilter] = useState('ALL');
  const [transFilter, setTransFilter] = useState('ALL');
  const [sortPrice, setSortPrice] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback((signal) => {
    setLoading(true);
    setError(null);
    const params = datesValid ? { startDate, endDate } : {};
    apiPublic
      .get(`/public/companies/${companyId}/cars`, { params, signal })
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err.name === 'CanceledError') return;
        if (err.response) setError(err.response.data?.error || 'Failed to load cars.');
        else setError('Network error. Please check your connection and try again.');
      })
      .finally(() => setLoading(false));
  }, [companyId, startDate, endDate, datesValid]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const filteredCars = useMemo(() => {
    let cars = [...data.cars];
    if (fuelFilter !== 'ALL') cars = cars.filter((c) => c.fuelType === fuelFilter);
    if (transFilter !== 'ALL') cars = cars.filter((c) => c.transmission === transFilter);
    cars.sort((a, b) =>
      sortPrice === 'asc' ? a.pricePerDay - b.pricePerDay : b.pricePerDay - a.pricePerDay
    );
    return cars;
  }, [data.cars, fuelFilter, transFilter, sortPrice]);

  const availableFuels = useMemo(() => [...new Set(data.cars.map((c) => c.fuelType))], [data.cars]);
  const availableTrans = useMemo(() => [...new Set(data.cars.map((c) => c.transmission))], [data.cars]);
  const filtersActive = fuelFilter !== 'ALL' || transFilter !== 'ALL' || sortPrice !== 'asc';

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Loader className="h-10 w-10 animate-spin text-primary-500" />
        <p className="text-sm text-slate-400 animate-pulse-soft">Loading available cars...</p>
      </div>
    );
  }

  if (error || !data.company) {
    return (
      <div className="max-w-sm mx-auto text-center py-20 animate-scale-in">
        <p className="text-red-500 mb-4">{error || 'Company not found.'}</p>
        <div className="flex justify-center gap-2">
          {error && <Button onClick={load}>Retry</Button>}
          <Link to="/marketplace"><Button variant="secondary">Back</Button></Link>
        </div>
      </div>
    );
  }

  const { company } = data;

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Back + Company header */}
      <div className="animate-fade-in-up">
        <Link
          to={datesValid ? `/marketplace?startDate=${startDate}&endDate=${endDate}` : '/marketplace'}
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-primary-500 transition-colors duration-200 mb-4 group"
        >
          <ChevronLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          All companies
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-white border border-slate-100">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/20 flex-shrink-0">
            <Car className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{company.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              {company.address && (
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{company.address}</span>
              )}
              {company.phone && (
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{company.phone}</span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0 sm:text-right flex sm:block items-center gap-2">
            <span className="text-xl sm:text-2xl font-bold text-primary-600">{data.cars.length}</span>
            <p className="text-xs text-slate-400">car{data.cars.length !== 1 ? 's' : ''} available</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      {data.cars.length > 1 && (
        <div className="flex flex-wrap items-center gap-3 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-300
              ${showFilters || filtersActive
                ? 'bg-primary-50 border-primary-200 text-primary-700 shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:shadow-sm'}`}
          >
            <SlidersHorizontal className={`h-4 w-4 transition-transform duration-300 ${showFilters ? 'rotate-90' : ''}`} />
            Filters {filtersActive && '·'}
          </button>
          {showFilters && (
            <div className="flex flex-wrap gap-2 sm:contents animate-fade-in">
              <select value={fuelFilter} onChange={(e) => setFuelFilter(e.target.value)}
                className="flex-1 min-w-[130px] px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition">
                <option value="ALL">All fuel types</option>
                {availableFuels.map((f) => <option key={f} value={f}>{FUEL[f] || f}</option>)}
              </select>
              <select value={transFilter} onChange={(e) => setTransFilter(e.target.value)}
                className="flex-1 min-w-[130px] px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition">
                <option value="ALL">All transmissions</option>
                {availableTrans.map((t) => <option key={t} value={t}>{TRANS[t] || t}</option>)}
              </select>
              <select value={sortPrice} onChange={(e) => setSortPrice(e.target.value)}
                className="flex-1 min-w-[130px] px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 transition">
                <option value="asc">Price: low → high</option>
                <option value="desc">Price: high → low</option>
              </select>
              {filtersActive && (
                <button onClick={() => { setFuelFilter('ALL'); setTransFilter('ALL'); setSortPrice('asc'); }}
                  className="text-sm text-slate-400 hover:text-red-500 transition-colors duration-200">
                  Clear all
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Cars grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
        {filteredCars.map((car) => (
          <div key={car.id} className="animate-fade-in-up">
            <div className="group h-full rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all duration-300 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/5 hover:-translate-y-1">
              {/* Image */}
              <div className="h-36 sm:h-40 bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden relative">
                {car.imageUrl ? (
                  <img src={car.imageUrl} alt={`${car.brand} ${car.model}`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                ) : null}
                <div className={`${car.imageUrl ? 'hidden' : 'flex'} h-full w-full items-center justify-center`}>
                  <Car className="h-16 w-16 text-slate-300" />
                </div>
                {/* Price badge */}
                <div className="absolute top-3 right-3 rounded-lg bg-white/90 backdrop-blur-sm px-2.5 py-1 shadow-sm">
                  <span className="text-lg font-bold text-primary-600">&euro;{Number(car.pricePerDay).toFixed(0)}</span>
                  <span className="text-xs text-slate-400">/day</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-slate-900 transition-colors duration-200 group-hover:text-primary-600">
                  {car.brand} {car.model}
                </h3>
                <p className="mt-0.5 text-sm text-slate-400">{car.year} · {car.plateNumber}</p>

                {/* Specs */}
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1">
                    <Fuel className="h-3 w-3" />
                    {FUEL[car.fuelType]}
                  </span>
                  <span className="flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1">
                    <Gauge className="h-3 w-3" />
                    {TRANS[car.transmission]}
                  </span>
                </div>

                {/* CTA */}
                <Link
                  to={datesValid
                    ? `/marketplace/${companyId}/cars/${car.id}/book?startDate=${startDate}&endDate=${endDate}`
                    : `/marketplace/${companyId}/cars/${car.id}/book`}
                  className="mt-4 flex items-center justify-center gap-2 w-full rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/25 active:scale-[0.98] group/btn"
                >
                  Book now
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCars.length === 0 && data.cars.length > 0 && (
        <div className="text-center py-12 animate-scale-in">
          <p className="text-slate-500">No cars match the selected filters.</p>
          <button onClick={() => { setFuelFilter('ALL'); setTransFilter('ALL'); setSortPrice('asc'); }}
            className="mt-2 text-sm text-primary-500 hover:text-primary-600 font-medium">
            Clear filters
          </button>
        </div>
      )}

      {data.cars.length === 0 && (
        <div className="text-center py-20 animate-scale-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mx-auto mb-4">
            <Car className="h-8 w-8 text-slate-300" />
          </div>
          <p className="text-lg font-medium text-slate-600">No cars available</p>
          <p className="mt-1 text-sm text-slate-400">This company has no available cars right now.</p>
          <Link to="/marketplace" className="inline-block mt-4">
            <Button variant="secondary">Browse other companies</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

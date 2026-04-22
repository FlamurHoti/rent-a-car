import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import apiPublic from '../../api/publicClient';
import { Car, Loader, SlidersHorizontal, ChevronLeft, Fuel, Gauge, MapPin, Phone, Star, Shield, ArrowRight } from '../../components/Icons';
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
    setLoading(true); setError(null);
    apiPublic.get(`/public/companies/${companyId}/cars`, { params: datesValid ? { startDate, endDate } : {}, signal })
      .then((res) => setData(res.data))
      .catch((err) => { if (err.name !== 'CanceledError') setError(err.response?.data?.error || 'Gabim ne rrjet.'); })
      .finally(() => setLoading(false));
  }, [companyId, startDate, endDate, datesValid]);

  useEffect(() => { const c = new AbortController(); load(c.signal); return () => c.abort(); }, [load]);

  const filteredCars = useMemo(() => {
    let cars = [...data.cars];
    if (fuelFilter !== 'ALL') cars = cars.filter((c) => c.fuelType === fuelFilter);
    if (transFilter !== 'ALL') cars = cars.filter((c) => c.transmission === transFilter);
    cars.sort((a, b) => sortPrice === 'asc' ? a.pricePerDay - b.pricePerDay : b.pricePerDay - a.pricePerDay);
    return cars;
  }, [data.cars, fuelFilter, transFilter, sortPrice]);

  const availableFuels = useMemo(() => [...new Set(data.cars.map((c) => c.fuelType))], [data.cars]);
  const availableTrans = useMemo(() => [...new Set(data.cars.map((c) => c.transmission))], [data.cars]);
  const filtersActive = fuelFilter !== 'ALL' || transFilter !== 'ALL' || sortPrice !== 'asc';

  if (loading) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Loader className="h-10 w-10 animate-spin text-primary-500" />
      <p className="text-sm text-slate-400 animate-pulse-soft">Duke ngarkuar makinat...</p>
    </div>
  );

  if (error || !data.company) return (
    <div className="max-w-sm mx-auto text-center py-20 animate-scale-in">
      <p className="text-red-500 mb-4">{error || 'Kompania nuk u gjet.'}</p>
      <div className="flex justify-center gap-2">
        {error && <Button onClick={load}>Provo perseri</Button>}
        <Link to="/marketplace"><Button variant="secondary">Kthehu</Button></Link>
      </div>
    </div>
  );

  const { company } = data;
  const bookLink = (carId) => datesValid
    ? `/marketplace/${companyId}/cars/${carId}/book?startDate=${startDate}&endDate=${endDate}`
    : `/marketplace/${companyId}/cars/${carId}/book`;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ─── Back nav ─── */}
      <Link to={datesValid ? `/marketplace?startDate=${startDate}&endDate=${endDate}` : '/marketplace'}
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-primary-500 transition-colors group animate-fade-in">
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Te gjitha kompanite
      </Link>

      {/* ─── Company header (Turo host style) ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 animate-fade-in-up">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-xl shadow-primary-500/20 flex-shrink-0">
          <Car className="h-8 w-8" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">{company.name}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-500">
            {company.address && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-slate-400" />{company.address}</span>}
            {company.phone && <span className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-slate-400" />{company.phone}</span>}
            <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-emerald-500" />Kompani e verifikuar</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-right">
          <div>
            <p className="text-3xl font-extrabold text-primary-600 font-display">{data.cars.length}</p>
            <p className="text-xs text-slate-400 mt-0.5">makina te lira</p>
          </div>
        </div>
      </div>

      {/* ─── Filter pills (Turo style) ─── */}
      {data.cars.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 animate-fade-in-up" style={{ animationDelay: '80ms' }}>
          <button onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200
              ${showFilters || filtersActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25' : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}>
            <SlidersHorizontal className="h-4 w-4" />
            Filtrat {filtersActive && <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-white" />}
          </button>
          {showFilters && (
            <div className="flex flex-wrap gap-2 animate-fade-in">
              <select value={fuelFilter} onChange={(e) => setFuelFilter(e.target.value)} className="px-3 py-2 rounded-full border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-slate-300 transition">
                <option value="ALL">Karburanti</option>
                {availableFuels.map((f) => <option key={f} value={f}>{FUEL[f]}</option>)}
              </select>
              <select value={transFilter} onChange={(e) => setTransFilter(e.target.value)} className="px-3 py-2 rounded-full border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-slate-300 transition">
                <option value="ALL">Transmisioni</option>
                {availableTrans.map((t) => <option key={t} value={t}>{TRANS[t]}</option>)}
              </select>
              <select value={sortPrice} onChange={(e) => setSortPrice(e.target.value)} className="px-3 py-2 rounded-full border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-slate-300 transition">
                <option value="asc">Cmimi i ulet</option>
                <option value="desc">Cmimi i larte</option>
              </select>
              {filtersActive && (
                <button onClick={() => { setFuelFilter('ALL'); setTransFilter('ALL'); setSortPrice('asc'); }}
                  className="px-3 py-2 rounded-full text-sm font-medium text-red-500 hover:bg-red-50 transition">Pastro</button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── Car cards (Turo style — big photo, overlay price) ─── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
        {filteredCars.map((car) => (
          <Link key={car.id} to={bookLink(car.id)} className="group animate-fade-in-up">
            <div className="h-full rounded-2xl bg-white border border-slate-200/80 overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">

              {/* Photo — tall like Turo */}
              <div className="relative h-48 sm:h-56 bg-slate-100 overflow-hidden">
                {car.imageUrl ? (
                  <img src={car.imageUrl} alt={`${car.brand} ${car.model}`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                ) : null}
                <div className={`${car.imageUrl ? 'hidden' : 'flex'} h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50`}>
                  <Car className="h-20 w-20 text-slate-200" />
                </div>

                {/* Top badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                    {FUEL[car.fuelType]}
                  </span>
                  <span className="rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                    {TRANS[car.transmission]}
                  </span>
                </div>

                {/* Favorite heart placeholder */}
                <button className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-all" onClick={(e) => e.preventDefault()}>
                  <Star className="h-4 w-4 text-slate-400" />
                </button>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-display group-hover:text-primary-600 transition-colors">
                      {car.brand} {car.model}
                    </h3>
                    <p className="text-sm text-slate-400 mt-0.5">{car.year} · {car.plateNumber}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-extrabold text-slate-900 font-display">&euro;{Number(car.pricePerDay).toFixed(0)}</p>
                    <p className="text-xs text-slate-400">/dite</p>
                  </div>
                </div>

                {/* Specs row */}
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Fuel className="h-3.5 w-3.5" />{FUEL[car.fuelType]}</span>
                  <span className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5" />{TRANS[car.transmission]}</span>
                </div>

                {/* CTA line */}
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    E disponueshme
                  </span>
                  <span className="flex items-center gap-1 text-sm font-semibold text-primary-500 group-hover:gap-2 transition-all">
                    Rezervo <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty states */}
      {filteredCars.length === 0 && data.cars.length > 0 && (
        <div className="text-center py-16 animate-scale-in">
          <Car className="h-12 w-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500">Asnje makine nuk perputhet me filtrat.</p>
          <button onClick={() => { setFuelFilter('ALL'); setTransFilter('ALL'); setSortPrice('asc'); }} className="mt-2 text-sm text-primary-500 font-medium">Pastro filtrat</button>
        </div>
      )}
      {data.cars.length === 0 && (
        <div className="text-center py-20 animate-scale-in">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 mx-auto mb-5">
            <Car className="h-10 w-10 text-slate-300" />
          </div>
          <p className="text-xl font-semibold text-slate-600 font-display">Asnje makine e disponueshme</p>
          <p className="mt-2 text-sm text-slate-400">Kjo kompani nuk ka makina te lira per momentin.</p>
          <Link to="/marketplace" className="inline-block mt-4"><Button variant="secondary">Shiko kompani te tjera</Button></Link>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import apiPublic from '../../api/publicClient';
import { Car, Loader, SlidersHorizontal } from '../../components/Icons';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
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

  // Filters
  const [fuelFilter, setFuelFilter] = useState('ALL');
  const [transFilter, setTransFilter] = useState('ALL');
  const [sortPrice, setSortPrice] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = datesValid ? { startDate, endDate } : {};
    apiPublic
      .get(`/public/companies/${companyId}/cars`, { params })
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err.response) {
          setError(err.response.data?.error || 'Failed to load cars.');
        } else {
          setError('Network error. Please check your connection and try again.');
        }
      })
      .finally(() => setLoading(false));
  }, [companyId, startDate, endDate, datesValid]);

  useEffect(() => { load(); }, [load]);

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
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !data.company) {
    return (
      <Card className="max-w-sm mx-auto text-center">
        <p className="text-red-600">{error || 'Company not found.'}</p>
        <div className="mt-4 flex justify-center gap-2">
          {error && <Button onClick={load}>Retry</Button>}
          <Link to="/marketplace">
            <Button variant="secondary">Back to companies</Button>
          </Link>
        </div>
      </Card>
    );
  }

  const { company } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Link
          to={datesValid ? `/marketplace?startDate=${startDate}&endDate=${endDate}` : '/marketplace'}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          ← Back to companies
        </Link>
        <h1 className="text-display font-bold text-slate-900">{company.name}</h1>
        <p className="text-slate-600">
          {datesValid
            ? `${data.cars.length} car${data.cars.length !== 1 ? 's' : ''} available for your dates.`
            : `${data.cars.length} car${data.cars.length !== 1 ? 's' : ''} available — choose one to book.`}
        </p>
      </div>

      {/* Filter bar */}
      {data.cars.length > 1 && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors
              ${showFilters || filtersActive
                ? 'bg-primary-50 border-primary-300 text-primary-700'
                : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'}`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters {filtersActive && '·'}
          </button>
          {showFilters && (
            <>
              <select
                value={fuelFilter}
                onChange={(e) => setFuelFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              >
                <option value="ALL">All fuel types</option>
                {availableFuels.map((f) => (
                  <option key={f} value={f}>{FUEL[f] || f}</option>
                ))}
              </select>
              <select
                value={transFilter}
                onChange={(e) => setTransFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              >
                <option value="ALL">All transmissions</option>
                {availableTrans.map((t) => (
                  <option key={t} value={t}>{TRANS[t] || t}</option>
                ))}
              </select>
              <select
                value={sortPrice}
                onChange={(e) => setSortPrice(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              >
                <option value="asc">Price: low to high</option>
                <option value="desc">Price: high to low</option>
              </select>
              {filtersActive && (
                <button
                  onClick={() => { setFuelFilter('ALL'); setTransFilter('ALL'); setSortPrice('asc'); }}
                  className="text-sm text-slate-500 hover:text-slate-700 underline underline-offset-2"
                >
                  Clear
                </button>
              )}
            </>
          )}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCars.map((car) => (
          <Card key={car.id} hover>
            <div className="flex flex-col gap-4">
              <div className="flex h-24 items-center justify-center rounded-lg bg-slate-100 overflow-hidden">
                {car.imageUrl
                  ? <img src={car.imageUrl} alt={`${car.brand} ${car.model}`} className="h-full w-full object-cover" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                  : null}
                <div className={`${car.imageUrl ? 'hidden' : 'flex'} h-full w-full items-center justify-center`}>
                  <Car className="h-12 w-12 text-slate-400" />
                </div>
              </div>
              <div>
                <h3 className="text-h3 font-semibold text-slate-900">{car.brand} {car.model}</h3>
                <p className="text-sm text-slate-500">{car.plateNumber} · {car.year}</p>
              </div>
              <p className="text-sm text-slate-600">{FUEL[car.fuelType]} / {TRANS[car.transmission]}</p>
              <p className="text-xl font-bold text-primary-500">
                €{Number(car.pricePerDay).toFixed(2)}
                <span className="text-sm font-normal text-slate-500">/day</span>
              </p>
              <Link
                to={datesValid
                  ? `/marketplace/${companyId}/cars/${car.id}/book?startDate=${startDate}&endDate=${endDate}`
                  : `/marketplace/${companyId}/cars/${car.id}/book`}
                className="mt-auto"
              >
                <Button size="md" className="w-full">Book this car</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {filteredCars.length === 0 && data.cars.length > 0 && (
        <Card>
          <p className="text-center text-slate-600">No cars match the selected filters.</p>
          <div className="mt-3 flex justify-center">
            <button
              onClick={() => { setFuelFilter('ALL'); setTransFilter('ALL'); setSortPrice('asc'); }}
              className="text-sm text-primary-600 hover:text-primary-700 underline underline-offset-2"
            >
              Clear filters
            </button>
          </div>
        </Card>
      )}

      {data.cars.length === 0 && (
        <Card>
          <p className="text-center text-slate-600">No available cars at the moment.</p>
          <div className="mt-4 flex justify-center">
            <Link to="/marketplace">
              <Button variant="secondary">Back to companies</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
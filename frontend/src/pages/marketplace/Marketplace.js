import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import apiPublic from '../../api/publicClient';
import { Building2, Car, Loader, Calendar } from '../../components/Icons';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    apiPublic
      .get('/public/companies')
      .then((res) => setCompanies(res.data))
      .catch((err) => {
        if (err.response) {
          setError(err.response.data?.error || 'Failed to load companies.');
        } else {
          setError('Network error. Please check your connection and try again.');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDateChange = (field, value) => {
    if (field === 'startDate') setStartDate(value);
    else setEndDate(value);
    const params = {};
    if (field === 'startDate' && value) params.startDate = value;
    else if (startDate) params.startDate = startDate;
    if (field === 'endDate' && value) params.endDate = value;
    else if (endDate) params.endDate = endDate;
    setSearchParams(params, { replace: true });
  };

  const datesValid = startDate && endDate && new Date(startDate) < new Date(endDate);

  const companyLink = (id) => {
    const params = new URLSearchParams();
    if (datesValid) { params.set('startDate', startDate); params.set('endDate', endDate); }
    const qs = params.toString();
    return `/marketplace/${id}${qs ? '?' + qs : ''}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-sm mx-auto text-center">
        <p className="text-red-600">{error}</p>
        <div className="mt-4 flex justify-center">
          <Button onClick={load}>Retry</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-display font-bold text-slate-900">Find a rental car</h1>
        <p className="mt-1 text-slate-600">Pick your dates, then choose a company and book online.</p>
      </div>

      {/* Date picker */}
      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2 text-slate-500 self-end pb-2.5">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-sm font-medium text-slate-700 mb-1">Pick-up date</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-sm font-medium text-slate-700 mb-1">Return date</label>
            <input
              type="datetime-local"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="input-field"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); setSearchParams({}, { replace: true }); }}
              className="text-sm text-slate-500 hover:text-slate-700 underline underline-offset-2 pb-2.5"
            >
              Clear
            </button>
          )}
        </div>
        {startDate && endDate && !datesValid && (
          <p className="mt-2 text-sm text-red-600">Return date must be after pick-up date.</p>
        )}
        {datesValid && (
          <p className="mt-2 text-sm text-emerald-600">
            Showing companies — select one to see cars available for your dates.
          </p>
        )}
      </Card>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <Link key={company.id} to={companyLink(company.id)}>
            <Card hover className="h-full transition-all duration-200">
              <div className="flex flex-col gap-4">
                <div className="flex h-20 items-center justify-center rounded-lg bg-primary-50">
                  <Building2 className="h-10 w-10 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-h3 font-semibold text-slate-900">{company.name}</h3>
                  {company.address && (
                    <p className="mt-1 text-sm text-slate-600">{company.address}</p>
                  )}
                  {company.phone && (
                    <p className="mt-0.5 text-sm text-slate-500">{company.phone}</p>
                  )}
                </div>
                <div className="mt-auto flex items-center gap-2 text-sm text-slate-500">
                  <Car className="h-4 w-4" />
                  <span>{company._count.cars} car{company._count.cars !== 1 ? 's' : ''} available</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {companies.length === 0 && (
        <Card>
          <p className="text-center text-slate-600">No rental companies with available cars at the moment.</p>
        </Card>
      )}
    </div>
  );
}
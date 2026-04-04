import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import apiPublic from '../../api/publicClient';
import { Building2, Car, Loader, Calendar, MapPin, Phone, Shield, Clock, Sparkles, ArrowRight } from '../../components/Icons';
import Button from '../../components/ui/Button';

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');

  const load = useCallback((signal) => {
    setLoading(true);
    setError(null);
    apiPublic
      .get('/public/companies', { signal })
      .then((res) => setCompanies(res.data))
      .catch((err) => {
        if (err.name === 'CanceledError') return;
        if (err.response) setError(err.response.data?.error || 'Failed to load companies.');
        else setError('Network error. Please check your connection and try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

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

  return (
    <div>
      {/* ━━━ HERO SECTION ━━━ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[300px] w-[300px] sm:h-[500px] sm:w-[500px] rounded-full bg-primary-500/10 blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 h-[250px] w-[250px] sm:h-[400px] sm:w-[400px] rounded-full bg-accent-400/10 blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pt-10 pb-12 sm:px-6 sm:pt-24 sm:pb-28">
          {/* Badge */}
          <div className="flex justify-center animate-fade-in-up">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-1.5 text-sm font-medium text-primary-300">
              <Sparkles className="h-3.5 w-3.5" />
              Kosovo's Car Rental Platform
            </span>
          </div>

          {/* Headline */}
          <h1 className="mt-4 sm:mt-6 text-center text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Rent a car in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">minutes</span>
          </h1>
          <p className="mt-3 sm:mt-4 text-center text-base sm:text-lg text-slate-400 max-w-xl mx-auto px-2 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Compare companies, browse cars, and book online.
          </p>

          {/* Search Card */}
          <div className="mt-6 sm:mt-10 mx-auto max-w-2xl animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-3 sm:p-6 shadow-2xl">
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    <Calendar className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                    Pick-up
                  </label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => handleDateChange('startDate', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    <Calendar className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                    Return
                  </label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(e) => handleDateChange('endDate', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition duration-200"
                  />
                </div>
              </div>
              {startDate && endDate && !datesValid && (
                <p className="mt-3 text-sm text-red-400 animate-fade-in">Return date must be after pick-up date.</p>
              )}
              {(startDate || endDate) && (
                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={() => { setStartDate(''); setEndDate(''); setSearchParams({}, { replace: true }); }}
                    className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    Clear dates
                  </button>
                  {datesValid && (
                    <span className="text-sm text-emerald-400 animate-fade-in">Dates selected — choose a company below</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-6 sm:mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-10 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            {[
              { Icon: Shield, text: 'Verified companies' },
              { Icon: Clock, text: 'Instant booking' },
              { Icon: Car, text: 'Wide selection' },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-slate-400">
                <Icon className="h-4 w-4 text-primary-400" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ COMPANIES SECTION ━━━ */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader className="h-10 w-10 animate-spin text-primary-500" />
            <p className="text-sm text-slate-400 animate-pulse-soft">Finding rental companies...</p>
          </div>
        ) : error ? (
          <div className="max-w-sm mx-auto text-center py-16 animate-scale-in">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={load}>Try again</Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8 animate-fade-in-up">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {datesValid ? 'Available companies' : 'Rental companies'}
                </h2>
                <p className="mt-1 text-slate-500">
                  {companies.length} compan{companies.length !== 1 ? 'ies' : 'y'} ready to serve you
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
              {companies.map((company) => (
                <Link
                  key={company.id}
                  to={companyLink(company.id)}
                  className="group animate-fade-in-up"
                >
                  <div className="relative h-full rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/5 hover:-translate-y-1">
                    {/* Company icon */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 transition-all duration-300 group-hover:from-primary-100 group-hover:to-primary-200 group-hover:scale-105">
                        <Building2 className="h-6 w-6 text-primary-600" />
                      </div>
                      <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        <Car className="h-3 w-3" />
                        {company._count.cars}
                      </div>
                    </div>

                    {/* Company info */}
                    <h3 className="text-lg font-semibold text-slate-900 transition-colors duration-200 group-hover:text-primary-600">
                      {company.name}
                    </h3>
                    {company.address && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        {company.address}
                      </p>
                    )}
                    {company.phone && (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                        <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                        {company.phone}
                      </p>
                    )}

                    {/* CTA */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-sm text-slate-400">
                        {company._count.cars} car{company._count.cars !== 1 ? 's' : ''} available
                      </span>
                      <span className="flex items-center gap-1 text-sm font-medium text-primary-500 transition-all duration-300 group-hover:gap-2">
                        Browse
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {companies.length === 0 && (
              <div className="text-center py-20 animate-scale-in">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-lg font-medium text-slate-600">No companies yet</p>
                <p className="mt-1 text-sm text-slate-400">Check back soon for available rental companies.</p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

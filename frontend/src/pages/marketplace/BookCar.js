import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import apiPublic from '../../api/publicClient';
import { Car, CheckCircle, Loader, ChevronLeft, Calendar, Phone as PhoneIcon, Mail, Fuel, Gauge, Shield } from '../../components/Icons';
import Button from '../../components/ui/Button';
import { FUEL_LABELS as FUEL, TRANS_LABELS as TRANS } from '../../constants';

const PHONE_REGEX = /^\+?[0-9\s\-(). ]{7,20}$/;

export default function BookCar() {
  const { companyId, carId } = useParams();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState({ company: null, car: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    startDate: searchParams.get('startDate') || '',
    endDate: searchParams.get('endDate') || '',
    notes: '',
  });

  const loadCar = useCallback((signal) => {
    setLoading(true);
    setError(null);
    apiPublic
      .get(`/public/companies/${companyId}/cars/${carId}`, { signal })
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err.name === 'CanceledError') return;
        if (err.response) setError(err.response.data?.error || 'Failed to load car.');
        else setError('Network error. Please check your connection and try again.');
      })
      .finally(() => setLoading(false));
  }, [companyId, carId]);

  useEffect(() => {
    const controller = new AbortController();
    loadCar(controller.signal);
    return () => controller.abort();
  }, [loadCar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    if (!form.customerName.trim() || !form.customerPhone.trim() || !form.startDate || !form.endDate) {
      setSubmitError('Please fill in name, phone, and dates.');
      return;
    }
    if (!PHONE_REGEX.test(form.customerPhone.trim())) {
      setSubmitError('Please enter a valid phone number (e.g. +383 44 123 456).');
      return;
    }
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      setSubmitError('End date must be after start date.');
      return;
    }
    if (!termsAccepted) {
      setSubmitError('Please accept the terms to continue.');
      return;
    }
    setSubmitting(true);
    apiPublic
      .post('/public/reservations', {
        companyId, carId,
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        customerEmail: form.customerEmail.trim() || undefined,
        startDate: form.startDate, endDate: form.endDate,
        notes: form.notes.trim() || undefined,
      })
      .then((res) => setReservation(res.data))
      .catch((err) => {
        if (err.response) setSubmitError(err.response.data?.error || err.response.data?.errors?.[0]?.msg || 'Booking failed.');
        else setSubmitError('Network error. Please check your connection and try again.');
      })
      .finally(() => setSubmitting(false));
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Loader className="h-10 w-10 animate-spin text-primary-500" />
        <p className="text-sm text-slate-400 animate-pulse-soft">Loading car details...</p>
      </div>
    );
  }

  if (error || !data.car) {
    return (
      <div className="max-w-md mx-auto text-center py-20 animate-scale-in">
        <p className="text-red-500 mb-4">{error || 'Car not found.'}</p>
        <div className="flex justify-center gap-2 flex-wrap">
          {error && <Button onClick={loadCar} variant="ghost">Retry</Button>}
          <Link to={`/marketplace/${companyId}`}><Button variant="secondary">Back to cars</Button></Link>
        </div>
      </div>
    );
  }

  // ━━━ SUCCESS SCREEN ━━━
  if (reservation) {
    const resStart = new Date(reservation.startDate);
    const resEnd = new Date(reservation.endDate);
    const resDays = Math.max(1, Math.ceil((resEnd - resStart) / (1000 * 60 * 60 * 24)));
    const refCode = reservation.id.slice(-8).toUpperCase();
    return (
      <div className="max-w-lg mx-auto py-4 sm:py-8 animate-scale-in">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 text-center shadow-xl shadow-emerald-500/5">
          {/* Success icon */}
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center animate-bounce-in">
              <CheckCircle className="h-10 w-10 text-emerald-500" />
            </div>
          </div>

          <h2 className="mt-4 sm:mt-5 text-xl sm:text-2xl font-bold text-slate-900 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Booking confirmed!
          </h2>
          <p className="mt-2 text-slate-500 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <strong className="text-slate-700">{data.company?.name}</strong> will contact you at <strong className="text-slate-700">{form.customerPhone}</strong>
          </p>

          {/* Reference code */}
          <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <span className="text-xs uppercase tracking-wider text-slate-400">Reference</span>
            <span className="font-mono text-base sm:text-lg font-bold text-slate-900 tracking-wider">{refCode}</span>
          </div>

          {/* Summary */}
          <div className="mt-6 rounded-xl bg-slate-50 border border-slate-100 p-4 text-left text-sm space-y-2.5 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <div className="flex justify-between">
              <span className="text-slate-400">Car</span>
              <span className="font-medium text-slate-700">{data.car.brand} {data.car.model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Pick-up</span>
              <span className="text-slate-700">{resStart.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Return</span>
              <span className="text-slate-700">{resEnd.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Duration</span>
              <span className="text-slate-700">{resDays} day{resDays !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2.5">
              <span className="font-medium text-slate-600">Total</span>
              <span className="text-lg font-bold text-primary-600">&euro;{Number(reservation.totalPrice).toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <Link to={`/marketplace/${companyId}`}>
              <Button variant="ghost" className="w-full sm:w-auto">Book another</Button>
            </Link>
            <Link to="/marketplace">
              <Button className="w-full sm:w-auto">Back to marketplace</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ━━━ BOOKING FORM ━━━
  const { company, car } = data;
  const start = form.startDate ? new Date(form.startDate) : null;
  const end = form.endDate ? new Date(form.endDate) : null;
  const days = start && end && end > start ? Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24))) : 0;
  const totalPrice = days > 0 ? (Number(car.pricePerDay) * days).toFixed(2) : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Back link */}
      <Link to={`/marketplace/${companyId}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-primary-500 transition-colors duration-200 group animate-fade-in">
        <ChevronLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
        Back to {company?.name}
      </Link>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
        {/* Left: Car card (2 cols) */}
        <div className="lg:col-span-2 animate-fade-in-up lg:animate-slide-in-left">
          <div className="lg:sticky lg:top-24 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            {/* Car image */}
            <div className="h-40 sm:h-48 bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden relative">
              {car.imageUrl ? (
                <img src={car.imageUrl} alt={`${car.brand} ${car.model}`}
                  className="h-full w-full object-cover"
                  onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
              ) : null}
              <div className={`${car.imageUrl ? 'hidden' : 'flex'} h-full w-full items-center justify-center`}>
                <Car className="h-20 w-20 text-slate-200" />
              </div>
            </div>

            <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{car.brand} {car.model}</h2>
                <p className="text-sm text-slate-400">{car.year} · {car.plateNumber}</p>
              </div>

              <div className="flex gap-2">
                <span className="flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                  <Fuel className="h-3 w-3" /> {FUEL[car.fuelType]}
                </span>
                <span className="flex items-center gap-1 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                  <Gauge className="h-3 w-3" /> {TRANS[car.transmission]}
                </span>
              </div>

              <div className="rounded-xl bg-primary-50 p-3 sm:p-4 text-center">
                <span className="text-2xl sm:text-3xl font-bold text-primary-600">&euro;{Number(car.pricePerDay).toFixed(0)}</span>
                <span className="text-sm text-primary-400 ml-1">/day</span>
              </div>

              {/* Price calculation */}
              {totalPrice && (
                <div className="rounded-xl border border-primary-100 bg-primary-50/50 p-3 space-y-1.5 text-sm animate-scale-in">
                  <div className="flex justify-between text-slate-500">
                    <span>&euro;{Number(car.pricePerDay).toFixed(2)} &times; {days} day{days !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-700">Total</span>
                    <span className="text-primary-600 text-base">&euro;{totalPrice}</span>
                  </div>
                </div>
              )}

              {company?.phone && (
                <p className="flex items-center gap-1.5 text-sm text-slate-500">
                  <PhoneIcon className="h-3.5 w-3.5" /> {company.phone}
                </p>
              )}

              <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-2 border-t border-slate-100">
                <Shield className="h-3.5 w-3.5 text-emerald-500" />
                Free cancellation · No hidden fees
              </div>
            </div>
          </div>
        </div>

        {/* Right: Booking form (3 cols) */}
        <div className="lg:col-span-3 animate-fade-in-up lg:animate-slide-in-right">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Complete your booking</h2>
            <p className="text-sm text-slate-400 mb-6">Fill in your details and we'll confirm your reservation.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Contact info */}
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Contact info</p>
                <div>
                  <label htmlFor="customerName" className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
                  <input id="customerName" type="text" value={form.customerName}
                    onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                    className="input-field" placeholder="John Doe" required />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="customerPhone" className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1">
                      <PhoneIcon className="h-3.5 w-3.5 text-slate-400" /> Phone
                    </label>
                    <input id="customerPhone" type="tel" value={form.customerPhone}
                      onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
                      className="input-field" placeholder="+383 44 123 456" required />
                  </div>
                  <div>
                    <label htmlFor="customerEmail" className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1">
                      <Mail className="h-3.5 w-3.5 text-slate-400" /> Email <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input id="customerEmail" type="email" value={form.customerEmail}
                      onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
                      className="input-field" placeholder="john@email.com" />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-4 pt-2">
                <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Rental dates
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-1">Pick-up</label>
                    <input id="startDate" type="datetime-local" value={form.startDate}
                      onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                      className="input-field" required />
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-1">Return</label>
                    <input id="endDate" type="datetime-local" value={form.endDate}
                      onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                      className="input-field" required />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
                  Notes <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea id="notes" value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="input-field min-h-[72px]" placeholder="Any special requests..." rows={2} />
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer select-none p-3 rounded-xl border border-slate-200 hover:border-primary-200 transition-colors duration-200">
                <input type="checkbox" checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-primary-500" />
                <span className="text-sm text-slate-500">
                  I agree to the rental terms. This is a booking request — the company will confirm via phone.
                </span>
              </label>

              {submitError && (
                <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 animate-fade-in">{submitError}</p>
              )}

              <button
                type="submit"
                disabled={submitting || !termsAccepted}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {submitting ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Confirm booking
                    {totalPrice && <span className="ml-1 opacity-75">· &euro;{totalPrice}</span>}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import apiPublic from '../../api/publicClient';
import { Car, CheckCircle, Loader } from '../../components/Icons';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
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

  const loadCar = useCallback(() => {
    setLoading(true);
    setError(null);
    apiPublic
      .get(`/public/companies/${companyId}/cars/${carId}`)
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err.response) {
          setError(err.response.data?.error || 'Failed to load car.');
        } else {
          setError('Network error. Please check your connection and try again.');
        }
      })
      .finally(() => setLoading(false));
  }, [companyId, carId]);

  useEffect(() => { loadCar(); }, [loadCar]);

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
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    if (start >= end) {
      setSubmitError('End date must be after start date.');
      return;
    }
    if (!termsAccepted) {
      setSubmitError('Please accept the terms and conditions to continue.');
      return;
    }

    setSubmitting(true);
    apiPublic
      .post('/public/reservations', {
        companyId,
        carId,
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        customerEmail: form.customerEmail.trim() || undefined,
        startDate: form.startDate,
        endDate: form.endDate,
        notes: form.notes.trim() || undefined,
      })
      .then((res) => setReservation(res.data))
      .catch((err) => {
        if (err.response) {
          setSubmitError(
            err.response.data?.error || err.response.data?.errors?.[0]?.msg || 'Booking failed.'
          );
        } else {
          setSubmitError('Network error. Please check your connection and try again.');
        }
      })
      .finally(() => setSubmitting(false));
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !data.car) {
    return (
      <Card className="max-w-lg mx-auto text-center">
        <p className="text-red-600">{error || 'Car not found.'}</p>
        <div className="mt-4 flex justify-center gap-2 flex-wrap">
          {error && <Button onClick={loadCar} variant="ghost">Retry</Button>}
          <Link to={`/marketplace/${companyId}`}>
            <Button variant="secondary">Back to cars</Button>
          </Link>
          <Link to="/marketplace">
            <Button variant="ghost">Companies</Button>
          </Link>
        </div>
      </Card>
    );
  }

  if (reservation) {
    const resStart = new Date(reservation.startDate);
    const resEnd = new Date(reservation.endDate);
    const resDays = Math.max(1, Math.ceil((resEnd - resStart) / (1000 * 60 * 60 * 24)));
    const refCode = reservation.id.slice(-8).toUpperCase();
    return (
      <Card className="max-w-lg mx-auto text-center">
        <div className="flex justify-center text-emerald-500">
          <CheckCircle className="h-16 w-16" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Booking request sent!</h2>
        <p className="mt-2 text-slate-600">
          <strong>{data.company?.name}</strong> will contact you at{' '}
          <strong>{form.customerPhone}</strong> to confirm.
        </p>
        <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-4 text-left text-sm space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Booking summary</p>
          <div className="flex justify-between">
            <span className="text-slate-500">Reference</span>
            <strong className="font-mono text-slate-800">{refCode}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Car</span>
            <span className="text-slate-800">{data.car.brand} {data.car.model}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">From</span>
            <span className="text-slate-800">{resStart.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">To</span>
            <span className="text-slate-800">{resEnd.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Duration</span>
            <span className="text-slate-800">{resDays} day{resDays !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2">
            <span className="font-medium text-slate-700">Total</span>
            <strong className="text-primary-600">€{Number(reservation.totalPrice).toFixed(2)}</strong>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Save your reference: <strong className="font-mono">{refCode}</strong>
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link to={`/marketplace/${companyId}`}>
            <Button variant="secondary">Book another car</Button>
          </Link>
          <Link to="/marketplace">
            <Button>Back to companies</Button>
          </Link>
        </div>
      </Card>
    );
  }

  const { company, car } = data;
  const start = form.startDate ? new Date(form.startDate) : null;
  const end = form.endDate ? new Date(form.endDate) : null;
  const days = start && end && end > start
    ? Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))
    : 0;
  const totalPrice = days > 0 ? (Number(car.pricePerDay) * days).toFixed(2) : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <Link to={`/marketplace/${companyId}`} className="text-sm font-medium text-primary-600 hover:text-primary-700">
          ← Back to {company?.name}
        </Link>
        <h1 className="text-display font-bold text-slate-900">Book {car.brand} {car.model}</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <div className="flex flex-col gap-4">
            <div className="flex h-32 items-center justify-center rounded-lg bg-slate-100 overflow-hidden">
              {car.imageUrl
                ? <img src={car.imageUrl} alt={`${car.brand} ${car.model}`} className="h-full w-full object-cover" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                : null}
              <div className={`${car.imageUrl ? 'hidden' : 'flex'} h-full w-full items-center justify-center`}>
                <Car className="h-16 w-16 text-slate-400" />
              </div>
            </div>
            <div>
              <h2 className="text-h3 font-semibold text-slate-900">{car.brand} {car.model}</h2>
              <p className="text-slate-600">{car.plateNumber} · {car.year}</p>
            </div>
            <p className="text-sm text-slate-600">{FUEL[car.fuelType]} / {TRANS[car.transmission]}</p>
            <p className="text-2xl font-bold text-primary-500">
              €{Number(car.pricePerDay).toFixed(2)}
              <span className="text-base font-normal text-slate-500">/day</span>
            </p>
            {company?.phone && (
              <p className="text-sm text-slate-600">Contact: {company.phone}</p>
            )}
          </div>
        </Card>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-slate-700">Your name</label>
              <input
                id="customerName"
                type="text"
                value={form.customerName}
                onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                className="input-field"
                placeholder="Full name"
                required
              />
            </div>
            <div>
              <label htmlFor="customerPhone" className="block text-sm font-medium text-slate-700">Phone</label>
              <input
                id="customerPhone"
                type="tel"
                value={form.customerPhone}
                onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
                className="input-field"
                placeholder="+383 44 123 456"
                required
              />
            </div>
            <div>
              <label htmlFor="customerEmail" className="block text-sm font-medium text-slate-700">
                Email <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                id="customerEmail"
                type="email"
                value={form.customerEmail}
                onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
                className="input-field"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-slate-700">Start date</label>
              <input
                id="startDate"
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                className="input-field"
                required
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-slate-700">
                End date <span className="font-normal text-slate-400">(min. 1 day)</span>
              </label>
              <input
                id="endDate"
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                className="input-field"
                required
              />
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
                Notes <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="input-field min-h-[80px]"
                placeholder="Special requests..."
                rows={3}
              />
            </div>

            {totalPrice && (
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>€{Number(car.pricePerDay).toFixed(2)} × {days} day{days !== 1 ? 's' : ''}</span>
                  <strong className="text-slate-900">€{totalPrice}</strong>
                </div>
              </div>
            )}

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-primary-500"
              />
              <span className="text-sm text-slate-600">
                I agree to the rental terms and conditions. I understand this is a booking request and the company will confirm via phone.
              </span>
            </label>

            {submitError && (
              <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">{submitError}</p>
            )}
            <Button type="submit" disabled={submitting || !termsAccepted} className="w-full gap-2">
              {submitting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : 'Request booking'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
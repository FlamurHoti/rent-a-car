import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import apiPublic from '../../api/publicClient';
import { Car, CheckCircle, Loader, ChevronLeft, Calendar, Phone as PhoneIcon, Fuel, Gauge, Shield, Star, MapPin } from '../../components/Icons';
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
    customerName: '', customerPhone: '', customerEmail: '',
    startDate: searchParams.get('startDate') || '', endDate: searchParams.get('endDate') || '', notes: '',
  });

  const loadCar = useCallback((signal) => {
    setLoading(true); setError(null);
    apiPublic.get(`/public/companies/${companyId}/cars/${carId}`, { signal })
      .then((res) => setData(res.data))
      .catch((err) => { if (err.name !== 'CanceledError') setError(err.response?.data?.error || 'Gabim ne rrjet.'); })
      .finally(() => setLoading(false));
  }, [companyId, carId]);

  useEffect(() => { const c = new AbortController(); loadCar(c.signal); return () => c.abort(); }, [loadCar]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitError(null);
    if (!form.customerName.trim() || !form.customerPhone.trim() || !form.startDate || !form.endDate)
      return setSubmitError('Ju lutem plotesoni emrin, telefonin, dhe datat.');
    if (!PHONE_REGEX.test(form.customerPhone.trim()))
      return setSubmitError('Numri i telefonit nuk eshte i vlefshem.');
    if (new Date(form.startDate) >= new Date(form.endDate))
      return setSubmitError('Data e kthimit duhet te jete pas dates se marrjes.');
    if (!termsAccepted) return setSubmitError('Pranoni kushtet per te vazhduar.');
    setSubmitting(true);
    apiPublic.post('/public/reservations', {
      companyId, carId, customerName: form.customerName.trim(), customerPhone: form.customerPhone.trim(),
      customerEmail: form.customerEmail.trim() || undefined, startDate: form.startDate, endDate: form.endDate, notes: form.notes.trim() || undefined,
    }).then((res) => setReservation(res.data))
      .catch((err) => setSubmitError(err.response?.data?.error || 'Rezervimi deshtoi.'))
      .finally(() => setSubmitting(false));
  };

  if (loading) return <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4"><Loader className="h-10 w-10 animate-spin text-primary-500" /><p className="text-sm text-slate-400">Duke ngarkuar...</p></div>;
  if (error || !data.car) return (
    <div className="max-w-md mx-auto text-center py-20 animate-scale-in">
      <p className="text-red-500 mb-4">{error || 'Makina nuk u gjet.'}</p>
      <div className="flex justify-center gap-2">
        {error && <Button onClick={loadCar} variant="ghost">Provo perseri</Button>}
        <Link to={`/marketplace/${companyId}`}><Button variant="secondary">Kthehu</Button></Link>
      </div>
    </div>
  );

  // ─── SUCCESS ───
  if (reservation) {
    const s = new Date(reservation.startDate), en = new Date(reservation.endDate);
    const d = Math.max(1, Math.ceil((en - s) / 864e5));
    const ref = reservation.id.slice(-8).toUpperCase();
    return (
      <div className="max-w-lg mx-auto py-8 animate-scale-in">
        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-10 text-center shadow-xl">
          <div className="flex justify-center"><div className="h-20 w-20 rounded-full bg-emerald-50 flex items-center justify-center animate-bounce-in"><CheckCircle className="h-10 w-10 text-emerald-500" /></div></div>
          <h2 className="mt-5 text-2xl font-extrabold text-slate-900 font-display">Rezervimi u konfirmua!</h2>
          <p className="mt-2 text-slate-500"><strong className="text-slate-700">{data.company?.name}</strong> do t'ju kontaktoje ne <strong className="text-slate-700">{form.customerPhone}</strong></p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-5 py-3">
            <span className="text-xs uppercase tracking-wider text-slate-400">Referenca</span>
            <span className="font-mono text-lg font-bold text-slate-900">{ref}</span>
          </div>
          <div className="mt-6 rounded-2xl bg-slate-50 p-5 text-left text-sm space-y-3">
            <Row l="Makina" r={`${data.car.brand} ${data.car.model}`} />
            <Row l="Marrja" r={s.toLocaleString()} />
            <Row l="Kthimi" r={en.toLocaleString()} />
            <Row l="Kohezgjatja" r={`${d} dite`} />
            <div className="flex justify-between border-t border-slate-200 pt-3"><span className="font-semibold text-slate-700">Totali</span><span className="text-xl font-extrabold text-primary-600">&euro;{Number(reservation.totalPrice).toFixed(2)}</span></div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
            <Link to={`/marketplace/${companyId}`}><Button variant="ghost" className="w-full sm:w-auto">Rezervo tjeter</Button></Link>
            <Link to="/marketplace"><Button className="w-full sm:w-auto">Kthehu ne faqen kryesore</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── BOOKING PAGE (Turo style) ───
  const { company, car } = data;
  const start = form.startDate ? new Date(form.startDate) : null;
  const end = form.endDate ? new Date(form.endDate) : null;
  const days = start && end && end > start ? Math.max(1, Math.ceil((end - start) / 864e5)) : 0;
  const total = days > 0 ? (Number(car.pricePerDay) * days).toFixed(2) : null;

  return (
    <div className="space-y-5">
      <Link to={`/marketplace/${companyId}`} className="inline-flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-primary-500 transition-colors group animate-fade-in">
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Kthehu te {company?.name}
      </Link>

      {/* ─── Hero image (Turo style — full width) ─── */}
      <div className="rounded-3xl overflow-hidden bg-slate-100 h-56 sm:h-72 lg:h-80 relative animate-fade-in-up">
        {car.imageUrl ? (
          <img src={car.imageUrl} alt={`${car.brand} ${car.model}`} className="h-full w-full object-cover"
            onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
        ) : null}
        <div className={`${car.imageUrl ? 'hidden' : 'flex'} h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50`}>
          <Car className="h-24 w-24 text-slate-200" />
        </div>
        {/* Overlay badges */}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 text-sm font-semibold text-slate-700 shadow">{FUEL[car.fuelType]}</span>
          <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1.5 text-sm font-semibold text-slate-700 shadow">{TRANS[car.transmission]}</span>
        </div>
      </div>

      {/* ─── Content grid ─── */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left — car details + host info */}
        <div className="lg:col-span-3 space-y-6 animate-fade-in-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">{car.brand} {car.model}</h1>
            <p className="text-slate-400 mt-1">{car.year} · {car.plateNumber}</p>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Fuel, label: 'Karburanti', value: FUEL[car.fuelType] },
              { icon: Gauge, label: 'Transmisioni', value: TRANS[car.transmission] },
              { icon: Calendar, label: 'Viti', value: car.year },
              { icon: Star, label: 'Cmimi', value: `€${Number(car.pricePerDay).toFixed(0)}/dite` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-slate-200/80 bg-white p-4 text-center">
                <Icon className="h-5 w-5 text-primary-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* Host card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">Kompania e qirase</p>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/20">
                <Car className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-slate-900">{company?.name}</p>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                  {company?.address && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{company.address}</span>}
                  {company?.phone && <span className="flex items-center gap-1"><PhoneIcon className="h-3.5 w-3.5" />{company.phone}</span>}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><Shield className="h-4 w-4 text-emerald-500" />Kompani e verifikuar</span>
              <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-emerald-500" />Anulim falas</span>
            </div>
          </div>
        </div>

        {/* Right — booking card (sticky, Turo style) */}
        <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="lg:sticky lg:top-24 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-card-hover">
            {/* Price header */}
            <div className="text-center mb-5 pb-5 border-b border-slate-100">
              <p className="text-3xl font-extrabold text-slate-900 font-display">&euro;{Number(car.pricePerDay).toFixed(0)} <span className="text-base font-normal text-slate-400">/dite</span></p>
              {total && <p className="text-sm text-primary-600 font-semibold mt-1">&euro;{total} totali per {days} dite</p>}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Marrja</label>
                  <input type="datetime-local" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Kthimi</label>
                  <input type="datetime-local" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Emri i plote</label>
                <input type="text" value={form.customerName} onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))} required placeholder="Emri Mbiemri"
                  className="input-field !mt-0" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Telefoni</label>
                  <input type="tel" value={form.customerPhone} onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))} required placeholder="+383 44..."
                    className="input-field !mt-0" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Email <span className="font-normal text-slate-400">(opsionale)</span></label>
                  <input type="email" value={form.customerEmail} onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))} placeholder="email@..."
                    className="input-field !mt-0" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Shenime <span className="font-normal text-slate-400">(opsionale)</span></label>
                <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Kerkesa te vecanta..."
                  className="input-field !mt-0 min-h-[60px]" />
              </div>

              <label className="flex items-start gap-3 cursor-pointer select-none p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-primary-200 transition-colors">
                <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-primary-500" />
                <span className="text-xs text-slate-500">Pranoj kushtet e qirase. Kompania do te me kontaktoje per konfirmim.</span>
              </label>

              {submitError && <p className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600 animate-fade-in">{submitError}</p>}

              <button type="submit" disabled={submitting || !termsAccepted}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-500/25 transition-all duration-300 hover:shadow-primary-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? <><Loader className="h-5 w-5 animate-spin" />Duke procesuar...</> : <>Konfirmo rezervimin {total && <span className="opacity-75">· €{total}</span>}</>}
              </button>

              <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-500" /> Pa tarifa te fshehura · Anulim falas
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ l, r }) {
  return <div className="flex justify-between"><span className="text-slate-400">{l}</span><span className="font-medium text-slate-700">{r}</span></div>;
}

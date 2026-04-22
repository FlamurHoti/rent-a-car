import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import apiPublic from '../../api/publicClient';
import { Building2, Car, Loader, Calendar, MapPin, Phone, Shield, Sparkles, ArrowRight, Star, Users, Zap, HeartHandshake, BadgeCheck, Banknote, Search, CheckCircle } from '../../components/Icons';
import Button from '../../components/ui/Button';

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');

  const load = useCallback((signal) => {
    setLoading(true); setError(null);
    apiPublic.get('/public/companies', { signal })
      .then((res) => setCompanies(res.data))
      .catch((err) => { if (err.name !== 'CanceledError') setError('Gabim ne rrjet. Provoni perseri.'); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { const c = new AbortController(); load(c.signal); return () => c.abort(); }, [load]);

  const handleDateChange = (field, value) => {
    if (field === 'startDate') setStartDate(value); else setEndDate(value);
    const p = {};
    if (field === 'startDate' && value) p.startDate = value; else if (startDate) p.startDate = startDate;
    if (field === 'endDate' && value) p.endDate = value; else if (endDate) p.endDate = endDate;
    setSearchParams(p, { replace: true });
  };

  const datesValid = startDate && endDate && new Date(startDate) < new Date(endDate);
  const companyLink = (id) => {
    const p = new URLSearchParams();
    if (datesValid) { p.set('startDate', startDate); p.set('endDate', endDate); }
    const qs = p.toString();
    return `/marketplace/${id}${qs ? '?' + qs : ''}`;
  };
  const totalCars = companies.reduce((sum, c) => sum + c._count.cars, 0);

  return (
    <div>
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950 via-slate-900 to-slate-950" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-primary-500/15 blur-[120px] animate-blob" />
          <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-accent-400/10 blur-[100px] animate-blob" style={{ animationDelay: '2s' }} />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pt-14 pb-16 sm:px-6 sm:pt-28 sm:pb-32">
          <div className="flex justify-center animate-fade-in-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] backdrop-blur-sm border border-white/[0.08] px-5 py-2 text-sm font-medium text-primary-200">
              <Sparkles className="h-4 w-4 text-accent-300" />
              Platforma #1 e qirase se makinave ne Kosove
            </span>
          </div>

          <h1 className="mt-6 sm:mt-8 text-center text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-display animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Gjej makinen
            <br />
            <span className="bg-gradient-to-r from-primary-300 via-accent-300 to-primary-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-x">
              perfekte per ty
            </span>
          </h1>
          <p className="mt-4 sm:mt-6 text-center text-base sm:text-xl text-slate-400 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Krahaso kompanite. Zgjidh datat. Rezervo online per disa sekonda.
          </p>

          {/* Search */}
          <div className="mt-8 sm:mt-12 mx-auto max-w-2xl animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="rounded-3xl glass-dark p-4 sm:p-6 shadow-glow-lg">
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300 mb-2">
                    <Calendar className="h-4 w-4 text-primary-300" /> Data e marrjes
                  </label>
                  <input type="datetime-local" value={startDate} onChange={(e) => handleDateChange('startDate', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/40 transition-all duration-200 hover:bg-white/[0.08]" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-medium text-slate-300 mb-2">
                    <Calendar className="h-4 w-4 text-primary-300" /> Data e kthimit
                  </label>
                  <input type="datetime-local" value={endDate} min={startDate || undefined} onChange={(e) => handleDateChange('endDate', e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/40 transition-all duration-200 hover:bg-white/[0.08]" />
                </div>
              </div>
              {startDate && endDate && !datesValid && (
                <p className="mt-3 text-sm text-red-400 animate-fade-in">Data e kthimit duhet te jete pas dates se marrjes.</p>
              )}
              {(startDate || endDate) && (
                <div className="mt-3 flex items-center justify-between">
                  <button onClick={() => { setStartDate(''); setEndDate(''); setSearchParams({}, { replace: true }); }} className="text-sm text-slate-400 hover:text-white transition-colors">Pastro datat</button>
                  {datesValid && <span className="flex items-center gap-1.5 text-sm text-emerald-400 animate-fade-in"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />Gati — zgjidh nje kompani</span>}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-10 sm:mt-14 grid grid-cols-3 gap-4 sm:gap-8 max-w-md mx-auto animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            {[
              { value: companies.length || '—', label: 'Kompani' },
              { value: totalCars || '—', label: 'Makina te lira' },
              { value: '24/7', label: 'Rezervim online' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-white font-display">{value}</p>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-8 sm:h-12"><path d="M0 60L1440 60L1440 0C1440 0 1080 60 720 60C360 60 0 0 0 0L0 60Z" fill="#fafafa" /></svg>
        </div>
      </section>

      {/* ═══ SI FUNKSIONON ═══ */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="text-center mb-12 animate-fade-in-up">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-4 py-1.5 text-sm font-semibold text-primary-600 mb-4">
            <Zap className="h-3.5 w-3.5" /> Proces i thjeshte
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-display">Si funksionon</h2>
          <p className="mt-3 text-slate-500 max-w-lg mx-auto">Merr nje makine me qira ne 3 hapa. Pa tarifa te fshehura, pa burokraci.</p>
        </div>
        <div className="grid gap-6 sm:gap-8 sm:grid-cols-3 stagger-children">
          {[
            { step: '01', icon: Search, title: 'Kerko dhe krahaso', desc: 'Shfleto kompanite e qirase ne te gjithe Kosoven. Filtro sipas datave per te pare vetem makinat e lira.' },
            { step: '02', icon: Car, title: 'Zgjidh makinen', desc: 'Krahaso cmimet, llojet e karburantit dhe transmisionit. Zgjidh makinen perfekte per udhetimin tend.' },
            { step: '03', icon: CheckCircle, title: 'Rezervo menjehere', desc: 'Ploteso te dhenat e tua dhe konfirmo. Kompania do te te kontaktoje per te finalizuar marrjen.' },
          ].map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="animate-fade-in-up">
              <div className="relative h-full rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 text-center transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 group">
                <span className="absolute top-4 right-4 text-5xl font-extrabold text-slate-100 font-display select-none group-hover:text-primary-100 transition-colors duration-300">{step}</span>
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 mb-5 transition-all duration-300 group-hover:from-primary-100 group-hover:to-primary-200 group-hover:scale-110">
                  <Icon className="h-7 w-7 text-primary-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-display">{title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ KOMPANITE ═══ */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative"><div className="absolute inset-0 rounded-full bg-primary-500/20 blur-xl animate-pulse" /><Loader className="relative h-10 w-10 animate-spin text-primary-500" /></div>
            <p className="text-sm text-slate-400 animate-pulse-soft">Duke kerkuar kompanite...</p>
          </div>
        ) : error ? (
          <div className="max-w-sm mx-auto text-center py-20 animate-scale-in">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={load}>Provo perseri</Button>
          </div>
        ) : (
          <>
            <div className="flex items-end justify-between mb-10 animate-fade-in-up">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
                  {datesValid ? 'Kompanite e disponueshme' : 'Kompanite e besueshme te qirase'}
                </h2>
                <p className="mt-2 text-slate-500">{companies.length} kompani{companies.length !== 1 ? '' : ''} gati per t'ju sherbyer</p>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
              {companies.map((company) => (
                <Link key={company.id} to={companyLink(company.id)} className="group animate-fade-in-up">
                  <div className="relative h-full rounded-2xl border border-slate-200/80 bg-white p-6 transition-all duration-300 hover:border-primary-200 hover:shadow-card-hover hover:-translate-y-1.5">
                    <div className="absolute top-0 left-6 right-6 h-0.5 rounded-full bg-gradient-to-r from-transparent via-primary-400/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100/80 transition-all duration-300 group-hover:from-primary-100 group-hover:to-primary-200 group-hover:shadow-lg group-hover:shadow-primary-500/10 group-hover:scale-105">
                        <Building2 className="h-7 w-7 text-primary-600" />
                      </div>
                      <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-100">
                        <Car className="h-3.5 w-3.5" />{company._count.cars} makina
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 font-display transition-colors duration-200 group-hover:text-primary-600">{company.name}</h3>
                    <div className="mt-2 space-y-1.5">
                      {company.address && <p className="flex items-center gap-2 text-sm text-slate-500"><MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />{company.address}</p>}
                      {company.phone && <p className="flex items-center gap-2 text-sm text-slate-500"><Phone className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />{company.phone}</p>}
                    </div>
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400"><Users className="h-3.5 w-3.5" />E disponueshme</div>
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-primary-500 transition-all duration-300 group-hover:gap-2.5">Shiko makinat <ArrowRight className="h-4 w-4" /></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {companies.length === 0 && (
              <div className="text-center py-24 animate-scale-in">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 mx-auto mb-5"><Building2 className="h-10 w-10 text-slate-300" /></div>
                <p className="text-xl font-semibold text-slate-600 font-display">Ende pa kompani</p>
                <p className="mt-2 text-sm text-slate-400">Kontrolloni perseri se shpejti per kompani te qirase ne Kosove.</p>
              </div>
            )}
          </>
        )}
      </section>

      {/* ═══ PSE NE ═══ */}
      <section className="bg-white border-y border-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="text-center mb-12 animate-fade-in-up">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-600 mb-4"><Star className="h-3.5 w-3.5" /> Pse RentKS</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-display">Pse te zgjidhni platformen tone</h2>
            <p className="mt-3 text-slate-500 max-w-lg mx-auto">E bejme qirane e makinave ne Kosove te thjeshte, transparente, dhe te besueshme.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
            {[
              { icon: BadgeCheck, title: 'Kompani te verifikuara', desc: 'Cdo kompani e qirase eshte e verifikuar dhe e besueshme.' },
              { icon: Banknote, title: 'Pa tarifa te fshehura', desc: 'Cmimi qe shihni eshte cmimi qe paguani.' },
              { icon: Shield, title: 'Rezervim i sigurt', desc: 'Te dhenat tuaja mbrohen me enkriptim.' },
              { icon: HeartHandshake, title: 'Mbeshtetje lokale', desc: 'Mbeshtetje ne Kosove kur keni nevoje per ndihme.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="animate-fade-in-up group">
                <div className="text-center p-6 rounded-2xl transition-all duration-300 hover:bg-slate-50">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary-500/10">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{title}</h3>
                  <p className="mt-1.5 text-sm text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="text-center mb-12 animate-fade-in-up">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-4 py-1.5 text-sm font-semibold text-primary-600 mb-4"><MsgIcon className="h-3.5 w-3.5" /> Pyetje te shpeshta</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-display">Pyetjet me te shpeshta</h2>
        </div>
        <div className="space-y-4 stagger-children">
          {[
            { q: 'Si funksionon rezervimi?', a: 'Zgjidhni datat, zgjidhni kompanine dhe makinen, plotesoni te dhenat tuaja te kontaktit, dhe dergoni kerkesen per rezervim. Kompania do t\'ju kontaktoje per te konfirmuar detajet e marrjes.' },
            { q: 'A duhet te paguaj online?', a: 'Jo, nuk kerkohet pagese online. Pagesen e rregulloni direkt me kompanine e qirase — me pare ne dore, transfer bankar, ose metoda te tjera qe ata pranojne.' },
            { q: 'A mund ta anuloj rezervimin?', a: 'Po, mund ta anuloni duke kontaktuar kompanine e qirase direkt me numrin e telefonit qe jepet ne konfirmimin e rezervimit tuaj.' },
            { q: 'Cilat dokumente me duhen?', a: 'Ju nevojitet nje patente shoferi e vlefshme dhe nje leternjoftim ose pasaporte. Kompania e qirase mund te kete kerkesa shtese.' },
            { q: 'A ka kufizim moshe?', a: 'Shumica e kompanive kerkojne qe shoferet te jene te pakten 21 vjec. Disa mund te kene politika te ndryshme — kontrolloni me kompanine specifike.' },
          ].map(({ q, a }) => (
            <details key={q} className="animate-fade-in-up group rounded-2xl border border-slate-200/80 bg-white transition-all duration-300 hover:border-primary-200 hover:shadow-sm">
              <summary className="flex items-center justify-between px-6 py-4 cursor-pointer select-none text-base font-semibold text-slate-900 marker:content-['']">
                {q}
                <PlusIcon className="h-5 w-5 text-slate-400 transition-transform duration-300 group-open:rotate-45 flex-shrink-0 ml-4" />
              </summary>
              <p className="px-6 pb-5 text-sm text-slate-500 leading-relaxed -mt-1">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20">
        <div className="relative rounded-3xl overflow-hidden animate-fade-in-up">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-700" />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="relative px-6 py-12 sm:px-12 sm:py-16 text-center">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-display">Gati per te nisur udhetimin?</h2>
            <p className="mt-3 text-primary-100 text-base sm:text-lg max-w-lg mx-auto">Gjeni ofertat me te mira te qirase ne Kosove. Rezervoni makinen tuaj per me pak se 2 minuta.</p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="#top" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-primary-600 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]">
                <Search className="h-5 w-5" />Shiko makinat tani
              </a>
              <Link to="/register" className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-6 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:border-white/50">
                <Building2 className="h-5 w-5" />Listo kompanine tende
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function MsgIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>;
}
function PlusIcon({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>;
}

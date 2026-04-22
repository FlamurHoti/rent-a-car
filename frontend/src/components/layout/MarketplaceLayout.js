import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Car, ChevronRight, MapPin, Phone, Mail } from '../Icons';

export default function MarketplaceLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/marketplace';

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="sticky top-0 z-50 glass animate-fade-in-down">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/marketplace" className="group flex items-center gap-2.5 transition duration-300">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 transition-all duration-300 group-hover:shadow-primary-500/50 group-hover:scale-105">
              <Car className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
              </span>
            </span>
            <div>
              <span className="text-lg font-bold text-slate-900 font-display">RentKS</span>
              <span className="hidden sm:block text-[10px] leading-none text-slate-400 font-medium -mt-0.5">Rent-a-Car Kosova</span>
            </div>
          </Link>
          <Link to="/login"
            className="group flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all duration-300 hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-[0.98]">
            <span className="hidden sm:inline">Per kompani</span>
            <span className="sm:hidden">Hyr</span>
            <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </header>

      <main key={location.pathname} className={`${isHome ? '' : 'mx-auto max-w-6xl px-4 py-5 sm:py-8 sm:px-6'} page-enter`}>
        <Outlet />
      </main>

      <footer className="bg-slate-900 text-slate-400">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                  <Car className="h-4 w-4" />
                </span>
                <span className="text-lg font-bold text-white font-display">RentKS</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs">
                Menyra me e lehtë per te marrë makina me qira ne Kosove. Krahaso kompanite, shiko makina, dhe rezervo online.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Linqe te shpejta</h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/marketplace" className="hover:text-white transition-colors">Shiko makinat</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Hyrje per kompani</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Regjistro kompanine</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Kontakti</h4>
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 flex-shrink-0" />Prishtine, Kosove</li>
                <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 flex-shrink-0" />info@rentks.com</li>
                <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 flex-shrink-0" />+383 44 000 000</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} RentKS. Te gjitha te drejtat e rezervuara.</p>
            <p>Ndertuar ne Kosove</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

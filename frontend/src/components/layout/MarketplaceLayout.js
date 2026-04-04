import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Car, ChevronRight } from '../Icons';

export default function MarketplaceLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/marketplace';

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-xl animate-fade-in-down">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:py-3 sm:px-6">
          <Link
            to="/marketplace"
            className="group flex items-center gap-2 sm:gap-2.5 transition duration-300"
          >
            <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/25 transition-all duration-300 group-hover:shadow-primary-500/40 group-hover:scale-105">
              <Car className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
            <div>
              <span className="text-base sm:text-lg font-bold text-slate-900">RentKS</span>
              <span className="hidden sm:block text-[10px] leading-none text-slate-400 font-medium -mt-0.5">Kosovo Car Rental</span>
            </div>
          </Link>
          <Link
            to="/login"
            className="group flex items-center gap-1 sm:gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white transition-all duration-300 hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/25"
          >
            <span className="hidden sm:inline">For companies</span>
            <span className="sm:hidden">Login</span>
            <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </header>

      {/* Content */}
      <main key={location.pathname} className={`${isHome ? '' : 'mx-auto max-w-6xl px-4 py-5 sm:py-8 sm:px-6'} page-enter`}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-slate-50 mt-10 sm:mt-16">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Car className="h-4 w-4" />
              <span className="text-sm font-medium">RentKS</span>
            </div>
            <p className="text-sm text-slate-400">Kosovo Car Rental Marketplace</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

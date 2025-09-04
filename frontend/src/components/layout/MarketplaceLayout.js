import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function MarketplaceLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            to="/marketplace"
            className="text-xl font-bold text-slate-900 transition duration-200 hover:text-primary-500"
          >
            Rent-a-Car
          </Link>
          <Link
            to="/login"
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-primary-400 hover:text-primary-600"
          >
            Company login
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

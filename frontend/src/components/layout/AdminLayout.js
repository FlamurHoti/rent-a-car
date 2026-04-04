import React, { useState } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Car, Calendar, CreditCard, Building2, LogOut, Plus } from '../Icons';
import Button from '../ui/Button';

const navItems = [
  { to: '/', end: true, label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/cars', end: false, label: 'Cars', Icon: Car },
  { to: '/reservations', end: false, label: 'Reservations', Icon: Calendar },
  { to: '/payments', end: false, label: 'Payments', Icon: CreditCard },
  { to: '/company', end: false, label: 'Company', Icon: Building2 },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      {/* ━━━ DESKTOP HEADER ━━━ */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 shadow-soft backdrop-blur-md animate-fade-in-down hidden md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <NavLink to="/" className="group text-xl font-bold text-slate-900 transition duration-300 hover:text-primary-500 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                <Car className="h-4 w-4" />
              </span>
              Rent-a-Car
            </NavLink>
            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
              {user?.company?.name}
            </span>
          </div>
          <nav className="flex items-center gap-1">
            {navItems.map(({ to, end, label, Icon }) => (
              <NavLink
                key={to} to={to} end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                   ${isActive ? 'text-primary-600 bg-primary-50 shadow-sm' : 'text-slate-600 hover:text-primary-600 hover:bg-slate-100'}`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
            <Link to="/marketplace" className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-100 transition-all duration-200">
              Client booking
            </Link>
            <Button variant="ghost" size="sm" onClick={logout} className="ml-2 gap-2">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </nav>
        </div>
      </header>

      {/* ━━━ MOBILE HEADER ━━━ */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white shadow-md">
              <Car className="h-4 w-4" />
            </span>
            <span className="text-lg font-bold text-slate-900">RentKS</span>
          </NavLink>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 max-w-[100px] truncate">
              {user?.company?.name}
            </span>
            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Plus className={`h-5 w-5 text-slate-700 transition-transform duration-300 ${menuOpen ? 'rotate-45' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-3 space-y-1 animate-slide-down">
            <Link to="/marketplace" onClick={() => setMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
              Client booking
            </Link>
            <button onClick={() => { logout(); setMenuOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        )}
      </header>

      {/* ━━━ MAIN CONTENT ━━━ */}
      <main key={location.pathname} className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8 page-enter">
        <Outlet />
      </main>

      {/* ━━━ MOBILE BOTTOM NAV ━━━ */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md md:hidden safe-bottom">
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.map(({ to, end, label, Icon }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg text-[10px] font-medium transition-all duration-200 min-w-[56px]
                 ${isActive ? 'text-primary-600' : 'text-slate-400'}`
              }
            >
              <Icon className="h-5 w-5" />
              <span>{label === 'Reservations' ? 'Bookings' : label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

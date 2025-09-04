import React from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Car, Calendar, CreditCard, Building2, LogOut } from '../Icons';
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

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 shadow-soft backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <NavLink
              to="/"
              className="text-xl font-bold text-slate-900 transition duration-200 hover:text-primary-500"
            >
              Rent-a-Car
            </NavLink>
            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
              {user?.company?.name}
            </span>
          </div>
          <nav className="flex flex-wrap items-center gap-1">
            {navItems.map(({ to, end, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                   ${isActive
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-slate-600 hover:text-primary-600 hover:bg-slate-100'}`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
            <Link
              to="/marketplace"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-slate-100"
            >
              Client booking
            </Link>
            <Button variant="ghost" size="sm" onClick={logout} className="ml-2 gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Newspaper,
  Store,
  User,
  Wallet,
  Menu,
  X,
  Flame,
  LogOut,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

const navLinks = [
  { to: '/', label: 'Inicio', icon: Home },
  { to: '/feed', label: 'Feed', icon: Newspaper },
  { to: '/marketplace', label: 'Mercado', icon: Store },
  { to: '/messages', label: 'Mensajes', icon: MessageCircle },
  { to: '/profile', label: 'Perfil', icon: User },
  { to: '/wallet', label: 'Wallet', icon: Wallet },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setMobileOpen(false);
  };

  return (
    <>
      {/* Desktop / Tablet navbar */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-terracotta-500 to-terracotta-700 shadow-md shadow-terracotta-500/25">
              <Flame className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-gray-900">
              Lumina<span className="text-terracotta-500">Red</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-terracotta-50 text-terracotta-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop auth */}
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Avatar'}
                      className="h-8 w-8 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta-100 text-sm font-semibold text-terracotta-600">
                      {(user.displayName || user.email || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {user.displayName || user.email}
                  </span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar Sesion
                </button>
              </div>
            ) : (
              <Link to="/auth" className="btn-primary text-sm">
                Iniciar Sesion
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-50 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 md:hidden">
            {navLinks.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-terracotta-50 text-terracotta-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              );
            })}
            {user ? (
              <div className="mt-3 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-3 px-4 py-2">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Avatar'}
                      className="h-8 w-8 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta-100 text-sm font-semibold text-terracotta-600">
                      {(user.displayName || user.email || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {user.displayName || user.email}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="mt-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                  Cerrar Sesion
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileOpen(false)}
                className="btn-primary mt-3 w-full text-sm"
              >
                Iniciar Sesion
              </Link>
            )}
          </nav>
        )}
      </header>
    </>
  );
}

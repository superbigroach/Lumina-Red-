import { Link } from 'react-router-dom';
import { Flame, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-terracotta-500 to-terracotta-700">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-gray-900">
                Lumina<span className="text-terracotta-500">Red</span>
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              El nexo aliado del talento latino. Building economic power through
              community, one business at a time.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Plataforma</h4>
            <ul className="mt-4 space-y-3">
              {['Feed', 'Mercado', 'Wallet', 'Cooperativa'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-500 transition-colors hover:text-terracotta-500">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Comunidad</h4>
            <ul className="mt-4 space-y-3">
              {['Blog', 'Eventos', 'Mentorship', 'Embajadores'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-500 transition-colors hover:text-terracotta-500">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Legal</h4>
            <ul className="mt-4 space-y-3">
              {['Privacidad', 'Terminos', 'Accesibilidad', 'Contacto'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-gray-500 transition-colors hover:text-terracotta-500">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 sm:flex-row">
          <p className="flex items-center gap-1 text-sm text-gray-400">
            Hecho con <Heart className="h-3.5 w-3.5 fill-terracotta-500 text-terracotta-500" /> por la comunidad
          </p>
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Lumina Red Cooperative. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

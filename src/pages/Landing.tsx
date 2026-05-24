import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Users,
  Store,
  Wallet,
  Globe,
  Sparkles,
  Heart,
  ArrowUpRight,
  Check,
  Loader2,
  Monitor,
  Rocket,
  UserPlus,
  TrendingUp,
  MessageCircle,
} from 'lucide-react';
import { onBusinesses, waitlistSignup, onWaitlistCount, Business } from '../lib/firestore';
import FundingProgress from '../components/FundingProgress';

const MEMBER_GOAL = 1000;

function formatStat(n: number, type: 'currency' | 'plus' = 'plus'): string {
  if (type === 'currency') return n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n}`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K+`;
  return n > 0 ? `${n}+` : '—';
}

function useCountUp(target: number, duration = 1400) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const steps = 50;
    const inc = target / steps;
    const interval = duration / steps;
    const timer = setInterval(() => {
      start += inc;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, interval);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function FeaturedBusinessCard({ business }: { business: Business }) {
  const cover = business.coverPhotoUrl || business.galleryUrls?.[0] || business.logoUrl;
  return (
    <Link to={`/business/${business.id}`} className="card group flex flex-col overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={cover} alt={business.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <span className="absolute left-3 top-3 badge bg-white/90 text-gray-700 shadow-sm backdrop-blur-sm">{business.category}</span>
        <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4 text-gray-700" />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold text-gray-900 transition-colors group-hover:text-terracotta-500">{business.name}</h3>
        <p className="mt-1 text-sm text-gray-500">{business.tagline}</p>
        <div className="mt-auto pt-4">
          <FundingProgress raised={business.amountRaisedUsdc} goal={business.fundingGoalUsdc} backers={business.backerCount} compact />
        </div>
      </div>
    </Link>
  );
}

export default function Landing() {
  const [featuredBusinesses, setFeaturedBusinesses] = useState<Business[]>([]);
  const [stats, setStats] = useState({ members: 0, businesses: 0, raised: 0, countries: 0 });
  const [waitlistName, setWaitlistName] = useState('');
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistCountry, setWaitlistCountry] = useState('');
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [waitlistError, setWaitlistError] = useState('');
  const [barVisible, setBarVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  const memberCount = useCountUp(stats.members);
  const progressPct = Math.min((stats.members / MEMBER_GOAL) * 100, 100);
  const membersToGo = Math.max(MEMBER_GOAL - stats.members, 0);

  useEffect(() => {
    const unsub = onBusinesses((b) => setFeaturedBusinesses(b.slice(0, 3)));
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onWaitlistCount((count) => {
      setStats((prev) => ({ ...prev, members: count }));
    });
    return unsub;
  }, []);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setBarVisible(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleWaitlist = async () => {
    const name = waitlistName.trim();
    const email = waitlistEmail.trim();
    if (!name || !email) return;
    setWaitlistLoading(true);
    setWaitlistError('');
    try {
      const result = await waitlistSignup(name, email, waitlistCountry.trim());
      if (result === 'duplicate') {
        setWaitlistError('Este correo ya está registrado. ¡Te avisamos cuando lancemos!');
      } else {
        setWaitlistSuccess(true);
      }
    } catch {
      setWaitlistError('Algo salió mal. Intenta de nuevo.');
    } finally {
      setWaitlistLoading(false);
    }
  };

  return (
    <div>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.4); opacity: 0.6; }
        }
        .anim-fade-up   { animation: fadeUp 0.7s cubic-bezier(.22,1,.36,1) forwards; opacity: 0; }
        .anim-fade-in   { animation: fadeIn 0.6s ease forwards; opacity: 0; }
        .shimmer-text {
          background: linear-gradient(90deg, #F59E0B, #C2652A, #F59E0B);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden flex flex-col justify-center"
        style={{ background: 'linear-gradient(160deg, #1A0A04 0%, #0D0806 60%, #0F0A05 100%)' }}
      >
        {/* Glows */}
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-terracotta-700/20 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-teal-800/15 blur-[100px]" />

        <div className="relative mx-auto w-full max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
          {/* Chip */}
          <div className="anim-fade-up" style={{ animationDelay: '0s' }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-gray-400 backdrop-blur-sm">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-terracotta-400" style={{ animation: 'pulse-dot 2s ease-in-out infinite' }} />
              Cooperativa Digital · Latino · Global
            </span>
          </div>

          {/* H1 */}
          <h1 className="anim-fade-up mt-8 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-7xl lg:text-8xl" style={{ animationDelay: '0.1s' }}>
            El nexo aliado del
            <br />
            <span className="shimmer-text">talento latino.</span>
          </h1>

          {/* Subline */}
          <p className="anim-fade-up mx-auto mt-6 max-w-xl text-lg text-gray-400 sm:text-xl" style={{ animationDelay: '0.2s' }}>
            Conecta. Apoya. Construye.
            <br />
            <span className="text-gray-500 text-base">Sin bancos. Sin intermediarios. Solo comunidad.</span>
          </p>

          {/* CTAs */}
          <div className="anim-fade-up mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center" style={{ animationDelay: '0.3s' }}>
            <Link
              to="/auth"
              className="group inline-flex items-center gap-2 rounded-2xl bg-terracotta-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-terracotta-900/40 transition-all hover:-translate-y-0.5 hover:bg-terracotta-400 hover:shadow-terracotta-500/40 active:translate-y-0"
            >
              Unirme ahora
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-gray-300 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              Ver negocios
            </Link>
          </div>

          {/* Live counter — always visible, no blank state */}
          <div ref={barRef} className="anim-fade-in mx-auto mt-14 max-w-xl" style={{ animationDelay: '0.4s' }}>
            <div className="mb-3 flex items-baseline justify-between px-1">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-3xl font-extrabold text-white tabular-nums">
                  {memberCount.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500">/ 1,000 miembros</span>
              </div>
              <span className="text-xs font-medium text-terracotta-400">
                {membersToGo > 0 ? `${membersToGo.toLocaleString()} para el lanzamiento` : '¡Meta alcanzada!'}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-full rounded-full transition-all duration-[1800ms] ease-out"
                style={{
                  width: barVisible ? `${progressPct || 0.5}%` : '0%',
                  background: 'linear-gradient(90deg, #C2652A, #D4845A, #F59E0B)',
                  boxShadow: '0 0 10px rgba(194,101,42,0.5)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0D0806] to-transparent" />
      </section>

      {/* ── PILLARS + SIGNUP ── seamless with hero */}
      <section
        className="relative overflow-hidden pb-14 pt-6"
        style={{ background: 'linear-gradient(180deg, #0D0806 0%, #110A05 100%)' }}
      >
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          {/* 3 pillars */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { Icon: Monitor,  title: 'Estaciones de Impacto', desc: 'Labs tecnológicos en LatAm sin acceso digital' },
              { Icon: Globe,    title: 'Red Global Latina',      desc: 'Diáspora conectada con su región de origen' },
              { Icon: Rocket,   title: 'Pilotos de Donación',    desc: 'Primeras campañas directas a fundadores' },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-white/8 p-5 text-left transition-colors hover:border-white/15 hover:bg-white/5" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-terracotta-500/15">
                  <Icon className="h-4 w-4 text-terracotta-400" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-white">{title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">{desc}</p>
              </div>
            ))}
          </div>

          {/* Signup */}
          <div className="mx-auto mt-8 max-w-md">
            {waitlistSuccess ? (
              <div className="rounded-2xl border border-teal-500/20 bg-teal-500/8 py-10 text-center" style={{ backgroundColor: 'rgba(20,184,166,0.06)' }}>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-500/15">
                  <Check className="h-7 w-7 text-teal-400" />
                </div>
                <p className="mt-4 font-display text-xl font-semibold text-white">¡Estás dentro!</p>
                <p className="mt-1 text-sm text-gray-400">Te avisamos cuando lancemos.</p>
                <Link to="/auth" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-terracotta-400 hover:text-terracotta-300">
                  Crear cuenta completa <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">Regístrate — te avisamos cuando lancemos.</p>
                {(['Tu nombre', 'Tu correo electrónico', 'Tu país (ej. México, Canadá...)'] as const).map((ph, i) => (
                  <input
                    key={ph}
                    type={i === 1 ? 'email' : 'text'}
                    placeholder={ph}
                    value={[waitlistName, waitlistEmail, waitlistCountry][i]}
                    onChange={(e) => [setWaitlistName, setWaitlistEmail, setWaitlistCountry][i](e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && i === 2 && handleWaitlist()}
                    className="w-full rounded-xl border px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:border-terracotta-400 focus:outline-none focus:ring-1 focus:ring-terracotta-400"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                  />
                ))}
                {waitlistError && <p className="text-xs text-red-400">{waitlistError}</p>}
                <button
                  onClick={handleWaitlist}
                  disabled={waitlistLoading || !waitlistName.trim() || !waitlistEmail.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-terracotta-500 py-4 text-sm font-semibold text-white shadow-lg shadow-terracotta-900/40 transition-all hover:-translate-y-0.5 hover:bg-terracotta-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:translate-y-0"
                >
                  {waitlistLoading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Registrando...</>
                    : <>Contarme entre los 1,000 <ArrowRight className="h-4 w-4" /></>
                  }
                </button>
                <p className="text-center text-xs text-gray-600">
                  ¿Ya tienes cuenta?{' '}
                  <Link to="/auth" className="text-terracotta-400 underline hover:text-terracotta-300">Inicia sesión</Link>
                </p>
              </div>
            )}
          </div>

          <p className="mt-8 font-display text-lg font-bold italic text-gold-400/70">"La comunidad es el capital."</p>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-warm-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-terracotta-500">La plataforma</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold text-gray-900 sm:text-4xl">Tres pasos. Un movimiento.</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { Icon: UserPlus, color: 'bg-terracotta-500', light: 'bg-terracotta-50', step: '01', title: 'Únete', desc: 'Crea tu perfil, conecta con la comunidad latina.' },
              { Icon: Heart,    color: 'bg-teal-500',       light: 'bg-teal-50',       step: '02', title: 'Apoya', desc: 'Dona directamente a negocios y causas que importan.' },
              { Icon: TrendingUp, color: 'bg-gold-500',     light: 'bg-gold-50',       step: '03', title: 'Crece', desc: 'Construye conexiones, gana insignias, haz historia.' },
            ].map(({ Icon, color, light, step, title, desc }) => (
              <div key={title} className={`rounded-2xl ${light} p-8 transition-transform hover:-translate-y-1`}>
                <div className="flex items-center justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color} shadow-md`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-display text-4xl font-extrabold text-black/5">{step}</span>
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { Icon: Users,         label: 'Red Social',        desc: 'Conecta y haz networking real.' },
              { Icon: Store,         label: 'Mercado',           desc: 'Descubre y apoya negocios latinos.' },
              { Icon: MessageCircle, label: 'Mensajería',        desc: 'DMs directos con fundadores.' },
              { Icon: Wallet,        label: 'Wallet',            desc: 'Rastrea tu impacto y donaciones.' },
            ].map(({ Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-900/5">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-terracotta-50">
                  <Icon className="h-4 w-4 text-terracotta-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{label}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED BUSINESSES ── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-terracotta-500">Negocios</p>
              <h2 className="mt-1 font-display text-3xl font-extrabold text-gray-900 sm:text-4xl">Apoya hoy.</h2>
            </div>
            <Link to="/marketplace" className="hidden items-center gap-1 text-sm font-semibold text-terracotta-500 hover:text-terracotta-600 sm:flex">
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredBusinesses.length > 0
              ? featuredBusinesses.map((b) => <FeaturedBusinessCard key={b.id} business={b} />)
              : [1, 2, 3].map((i) => (
                  <div key={i} className="card animate-pulse overflow-hidden">
                    <div className="aspect-[16/10] bg-gray-100" />
                    <div className="space-y-3 p-5">
                      <div className="h-5 w-2/3 rounded bg-gray-100" />
                      <div className="h-3 w-full rounded bg-gray-50" />
                    </div>
                  </div>
                ))
            }
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link to="/marketplace" className="btn-secondary">Ver todos <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      {/* ── CLOSING DARK ── */}
      <section
        className="relative overflow-hidden py-24 sm:py-32 text-center"
        style={{ background: 'linear-gradient(160deg, #1A0A04 0%, #0D0806 100%)' }}
      >
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-terracotta-700/15 blur-[100px]" />
        <div className="relative mx-auto max-w-2xl px-4">
          <h2 className="font-display text-4xl font-extrabold text-white sm:text-6xl">
            ¿Listo para unirte
            <br />
            <span className="shimmer-text">a la familia?</span>
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-lg text-gray-400">
            {stats.members > 0
              ? <>{stats.members.toLocaleString()} personas ya están construyendo algo juntas.</>
              : 'Sé de los primeros en construir algo juntos.'
            }
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/auth"
              className="group inline-flex items-center gap-2 rounded-2xl bg-terracotta-500 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-terracotta-900/40 transition-all hover:-translate-y-0.5 hover:bg-terracotta-400"
            >
              Crear cuenta gratis
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-10 py-4 text-base font-semibold text-gray-300 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              Explorar negocios
            </Link>
          </div>
          <p className="mt-14 font-display text-xl font-bold italic text-gold-400/60">"La comunidad es el capital."</p>
        </div>
      </section>
    </div>
  );
}

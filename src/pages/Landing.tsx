import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Users,
  Store,
  Wallet,
  TrendingUp,
  Shield,
  Globe,
  Sparkles,
  Heart,
  MapPin,
  ArrowUpRight,
} from 'lucide-react';
import { onBusinesses, Business } from '../lib/firestore';
import FundingProgress from '../components/FundingProgress';

const stats = [
  { value: '2,400+', label: 'Miembros' },
  { value: '$1.2M', label: 'Fondos distribuidos' },
  { value: '180+', label: 'Negocios apoyados' },
  { value: '12', label: 'Ciudades' },
];

const features = [
  {
    icon: Users,
    title: 'Red Social',
    description:
      'Connect with fellow Latino entrepreneurs, share wins, ask for help, and build genuine relationships that turn into opportunities.',
    color: 'terracotta',
  },
  {
    icon: Store,
    title: 'Mercado Cooperativo',
    description:
      'Discover and fund Latino-owned businesses. Invest in your community and watch your dollars create real impact.',
    color: 'teal',
  },
  {
    icon: Wallet,
    title: 'Digital Wallet',
    description:
      'A simple wallet to contribute to Community Funds, receive dividends, and track your impact portfolio. No crypto jargon.',
    color: 'gold',
  },
];

const values = [
  {
    icon: Shield,
    title: 'Confianza',
    description: 'Trust is earned, not assumed. Every business is community-vetted.',
  },
  {
    icon: Heart,
    title: 'Comunidad',
    description: 'We succeed together. Your investment is an investment in familia.',
  },
  {
    icon: Globe,
    title: 'Inclusividad',
    description: 'Bilingual, accessible, and designed for our diverse community.',
  },
  {
    icon: TrendingUp,
    title: 'Crecimiento',
    description: 'Building generational wealth, one cooperative business at a time.',
  },
];

function FeaturedBusinessCard({ business }: { business: Business }) {
  const coverImage = business.galleryUrls?.[0] || business.logoUrl;

  return (
    <Link
      to={`/business/${business.id}`}
      className="card group flex flex-col overflow-hidden"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={coverImage}
          alt={business.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <span className="absolute left-3 top-3 badge bg-white/90 text-gray-700 shadow-sm backdrop-blur-sm">
          {business.category}
        </span>
        {business.isTemplate && (
          <span className="absolute right-3 top-3 badge bg-gold-400 text-white shadow-sm">
            Destacado
          </span>
        )}
        <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4 text-gray-700" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold text-gray-900 group-hover:text-terracotta-500 transition-colors">
          {business.name}
        </h3>
        <p className="mt-1 text-sm text-gray-500">{business.tagline}</p>

        <div className="mt-auto pt-4">
          <FundingProgress
            raised={business.amountRaisedUsdc}
            goal={business.fundingGoalUsdc}
            backers={business.backerCount}
            compact
          />
        </div>
      </div>
    </Link>
  );
}

export default function Landing() {
  const [featuredBusinesses, setFeaturedBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    const unsub = onBusinesses((businesses) => {
      setFeaturedBusinesses(businesses.slice(0, 3));
    });
    return unsub;
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-warm-100 via-white to-terracotta-50">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-terracotta-100/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-teal-100/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-terracotta-50 px-4 py-1.5 text-sm font-medium text-terracotta-600 ring-1 ring-terracotta-200">
              <Sparkles className="h-4 w-4" />
              Cooperativa Digital para la Comunidad Latina
            </div>

            <h1 className="font-display text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              El nexo aliado del{' '}
              <span className="bg-gradient-to-r from-terracotta-500 via-terracotta-600 to-teal-500 bg-clip-text text-transparent">
                talento latino
              </span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-gray-600 sm:text-xl">
              Lumina Red is the social cooperative where Latino entrepreneurs connect,
              fund each other, and build generational wealth{' '}
              <span className="font-medium text-gray-700">together</span>. Social
              networking meets community investment.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/auth" className="btn-primary px-8 py-4 text-base">
                Unete a la Red
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/marketplace" className="btn-secondary px-8 py-4 text-base">
                Explorar Negocios
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-3xl font-bold text-gray-900 sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="section-heading">
              Una plataforma, tres pilares
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Everything you need to connect, fund, and grow in one place.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature) => {
              const colorMap: Record<string, { bg: string; icon: string; text: string }> = {
                terracotta: { bg: 'bg-terracotta-50', icon: 'bg-terracotta-500', text: 'text-terracotta-600' },
                teal: { bg: 'bg-teal-50', icon: 'bg-teal-500', text: 'text-teal-600' },
                gold: { bg: 'bg-gold-100', icon: 'bg-gold-400', text: 'text-gold-600' },
              };
              const colors = colorMap[feature.color];
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className={`rounded-2xl ${colors.bg} p-8 transition-transform hover:-translate-y-1`}
                >
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${colors.icon} shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured businesses */}
      <section className="bg-warm-50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="section-heading">Negocios Destacados</h2>
              <p className="mt-3 text-lg text-gray-500">
                Fund the businesses shaping our community.
              </p>
            </div>
            <Link
              to="/marketplace"
              className="hidden items-center gap-1 text-sm font-semibold text-terracotta-500 transition-colors hover:text-terracotta-600 sm:flex"
            >
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredBusinesses.length > 0 ? (
              featuredBusinesses.map((business) => (
                <FeaturedBusinessCard key={business.id} business={business} />
              ))
            ) : (
              // Placeholder cards while loading
              [1, 2, 3].map((i) => (
                <div key={i} className="card overflow-hidden animate-pulse">
                  <div className="aspect-[16/10] bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 w-2/3 rounded bg-gray-200" />
                    <div className="h-4 w-full rounded bg-gray-100" />
                    <div className="h-2.5 w-full rounded-full bg-gray-100" />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link to="/marketplace" className="btn-secondary">
              Ver todos los negocios
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="section-heading">Nuestros Valores</h2>
            <p className="mt-4 text-lg text-gray-500">
              Built by Latinos, for Latinos. Rooted in the values that make our community strong.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <div key={value.title} className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-terracotta-50">
                    <Icon className="h-7 w-7 text-terracotta-500" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-gray-900">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-500">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-terracotta-500 via-terracotta-600 to-terracotta-700 py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Ready to join la familia?
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-terracotta-100">
            Whether you're an entrepreneur, investor, or supporter, there's a place
            for you in Lumina Red. Let's build generational wealth together.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-terracotta-600 shadow-lg transition-all hover:bg-terracotta-50 active:scale-[0.97]"
            >
              Crear Cuenta Gratis
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-8 py-4 text-base font-semibold text-white transition-all hover:border-white/60 hover:bg-white/10"
            >
              Explorar Mercado
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

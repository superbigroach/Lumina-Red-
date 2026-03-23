import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, ArrowUpRight, Plus } from 'lucide-react';
import { onBusinesses, seedTemplateBusinesses, Business } from '../lib/firestore';
import FundingProgress from '../components/FundingProgress';

const categories = [
  'All',
  'Food & Restaurant',
  'Technology',
  'Health & Fitness',
  'Fashion',
  'Education',
  'Arts & Culture',
  'Services',
  'Other',
];

function MarketplaceCard({ business }: { business: Business }) {
  const logoUrl = business.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(business.name)}&background=C2652A&color=fff&size=200`;
  const coverImage = business.galleryUrls?.[0] || logoUrl;

  return (
    <Link
      to={`/business/${business.id}`}
      className="card group flex flex-col overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={coverImage}
          alt={business.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Category badge */}
        <span className="absolute left-3 top-3 badge bg-white/90 text-gray-700 shadow-sm backdrop-blur-sm">
          {business.category}
        </span>

        {/* Template badge */}
        {business.isTemplate && (
          <span className="absolute right-3 top-3 badge bg-gold-400 text-white shadow-sm">
            Template
          </span>
        )}

        {/* Arrow on hover */}
        <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4 text-gray-700" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt="" className="h-10 w-10 rounded-xl object-cover" />
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-semibold text-gray-900 group-hover:text-terracotta-500 transition-colors truncate">
              {business.name}
            </h3>
            <p className="text-xs text-gray-500">by {business.founderName}</p>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-500 line-clamp-2">{business.tagline}</p>

        {/* Funding progress */}
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

export default function Marketplace() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'trending' | 'newest' | 'most-funded'>('trending');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedTemplateBusinesses().catch(console.error);
    const unsub = onBusinesses((biz) => {
      setBusinesses(biz);
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    let result = businesses;

    if (activeCategory !== 'All') {
      result = result.filter((b) => b.category === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.tagline.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.founderName.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case 'most-funded':
        result = [...result].sort((a, b) => b.amountRaisedUsdc - a.amountRaisedUsdc);
        break;
      case 'newest':
        result = [...result].sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || new Date(0);
          const bTime = b.createdAt?.toDate?.() || new Date(0);
          return bTime.getTime() - aTime.getTime();
        });
        break;
      case 'trending':
      default:
        result = [...result].sort((a, b) => b.backerCount - a.backerCount);
        break;
    }

    return result;
  }, [search, activeCategory, sortBy, businesses]);

  const totalRaised = businesses.reduce((sum, b) => sum + (b.amountRaisedUsdc || 0), 0);
  const totalBackers = businesses.reduce((sum, b) => sum + (b.backerCount || 0), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="section-heading">Mercado Cooperativo</h1>
          <p className="mt-3 text-lg text-gray-500">
            Discover, support, and invest in Latino-owned businesses.
          </p>

          {/* Quick stats */}
          <div className="mt-6 flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-teal-500" />
              <span className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{businesses.length}</span> negocios activos
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-terracotta-500" />
              <span className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">
                  ${totalRaised >= 1000 ? `${(totalRaised / 1000).toFixed(1)}k` : totalRaised.toLocaleString()}
                </span>{' '}
                fondos recaudados
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-gold-400" />
              <span className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{totalBackers.toLocaleString()}</span> backers
              </span>
            </div>
          </div>
        </div>

        <Link to="/create-business" className="btn-primary shrink-0">
          <Plus className="h-4 w-4" />
          Registrar Mi Negocio
        </Link>
      </div>

      {/* Filters bar */}
      <div className="mt-8 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search businesses, categories, founders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 focus:border-terracotta-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500/20"
            >
              <option value="trending">Trending</option>
              <option value="most-funded">Most Funded</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-terracotta-500 text-white shadow-md shadow-terracotta-500/25'
                  : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="mt-16 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-terracotta-500" />
          <p className="mt-4 text-sm text-gray-500">Cargando negocios...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((business) => (
            <MarketplaceCard key={business.id} business={business} />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-lg font-medium text-gray-900">No businesses found</p>
          <p className="mt-2 text-sm text-gray-500">
            Try adjusting your search or filters.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setActiveCategory('All');
            }}
            className="btn-secondary mt-4"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

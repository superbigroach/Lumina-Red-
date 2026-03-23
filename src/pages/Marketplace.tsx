import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';
import BusinessCard from '../components/BusinessCard';
import { businesses, categories } from '../data/businesses';

export default function Marketplace() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'trending' | 'newest' | 'most-funded'>('trending');

  const filtered = useMemo(() => {
    let result = businesses;

    // Category filter
    if (activeCategory !== 'All') {
      result = result.filter((b) => b.category === activeCategory);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.tagline.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q)) ||
          b.location.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case 'most-funded':
        result = [...result].sort((a, b) => b.fundingRaised - a.fundingRaised);
        break;
      case 'newest':
        result = [...result].sort((a, b) => b.foundedYear - a.foundedYear);
        break;
      case 'trending':
      default:
        result = [...result].sort((a, b) => b.backers - a.backers);
        break;
    }

    return result;
  }, [search, activeCategory, sortBy]);

  const totalRaised = businesses.reduce((sum, b) => sum + b.fundingRaised, 0);
  const totalBackers = businesses.reduce((sum, b) => sum + b.backers, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
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
                ${(totalRaised / 1000).toFixed(0)}k
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

      {/* Filters bar */}
      <div className="mt-8 space-y-4">
        {/* Search + sort row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search businesses, categories, locations..."
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
      {filtered.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-lg font-medium text-gray-900">
            No businesses found
          </p>
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

import { Link } from 'react-router-dom';
import { MapPin, ArrowUpRight } from 'lucide-react';
import type { Business } from '../data/businesses';
import FundingProgress from './FundingProgress';

interface BusinessCardProps {
  business: Business;
}

export default function BusinessCard({ business }: BusinessCardProps) {
  return (
    <Link
      to={`/business/${business.id}`}
      className="card group flex flex-col overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={business.image}
          alt={business.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Category badge */}
        <span className="absolute left-3 top-3 badge bg-white/90 text-gray-700 shadow-sm backdrop-blur-sm">
          {business.category}
        </span>

        {/* Featured badge */}
        {business.featured && (
          <span className="absolute right-3 top-3 badge bg-gold-400 text-white shadow-sm">
            Destacado
          </span>
        )}

        {/* Arrow on hover */}
        <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4 text-gray-700" />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold text-gray-900 group-hover:text-terracotta-500 transition-colors">
          {business.name}
        </h3>
        <p className="mt-1 text-sm text-gray-500">{business.tagline}</p>

        <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
          <MapPin className="h-3.5 w-3.5" />
          {business.location}
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {business.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-gray-50 px-2 py-0.5 text-xs text-gray-500"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Funding progress */}
        <div className="mt-auto pt-4">
          <FundingProgress
            raised={business.fundingRaised}
            goal={business.fundingGoal}
            backers={business.backers}
            compact
          />
        </div>
      </div>
    </Link>
  );
}

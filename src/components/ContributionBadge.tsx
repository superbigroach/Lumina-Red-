import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import type { DonationBadge } from '../lib/firestore';

// ─── ContributionBadge ───────────────────────────────────────────────────────

interface ContributionBadgeProps {
  badge: DonationBadge;
  size?: 'sm' | 'md';
}

export function ContributionBadge({ badge, size = 'md' }: ContributionBadgeProps) {
  const fallbackLogo = `https://ui-avatars.com/api/?name=${encodeURIComponent(badge.businessName)}&background=C2652A&color=fff&size=100`;
  const dateLabel = badge.createdAt
    .toDate()
    .toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });

  // ── sm: compact pill / chip ─────────────────────────────────────────────
  if (size === 'sm') {
    return (
      <Link
        to={`/business/${badge.businessId}`}
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-terracotta-50 to-gold-50 border border-terracotta-100 px-3 py-1.5 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
      >
        <img
          src={badge.businessLogoUrl || fallbackLogo}
          alt={badge.businessName}
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallbackLogo; }}
          className="h-8 w-8 rounded-full object-cover flex-shrink-0 border border-terracotta-100"
        />
        <span className="max-w-[120px] truncate text-sm font-medium text-gray-800">
          {badge.businessName}
        </span>
        <span className="text-sm font-bold text-teal-600 flex-shrink-0">
          ${badge.amountUsdc} USDC
        </span>
      </Link>
    );
  }

  // ── md: full badge card ─────────────────────────────────────────────────
  return (
    <Link
      to={`/business/${badge.businessId}`}
      className="relative flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-br from-terracotta-50 to-gold-50 border border-terracotta-100 p-4 shadow-sm transition-all duration-200 hover:scale-[1.03] hover:shadow-md"
    >
      {/* Heart icon — top-right corner */}
      <Heart
        className="absolute right-3 top-3 h-4 w-4 fill-terracotta-500 text-terracotta-500"
        aria-hidden="true"
      />

      {/* Business logo */}
      <div className="mt-1 h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-terracotta-100 shadow-sm">
        <img
          src={badge.businessLogoUrl || fallbackLogo}
          alt={badge.businessName}
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallbackLogo; }}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Business name */}
      <p className="w-full truncate text-center text-sm font-semibold text-gray-800">
        {badge.businessName}
      </p>

      {/* Amount */}
      <p className="text-base font-bold text-teal-600">
        ${badge.amountUsdc} USDC
      </p>

      {/* "Supporter" label + date */}
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-xs font-medium uppercase tracking-wide text-terracotta-500">
          Supporter
        </span>
        <span className="text-xs text-gray-400">{dateLabel}</span>
      </div>
    </Link>
  );
}

// ─── BadgeGrid ────────────────────────────────────────────────────────────────

interface BadgeGridProps {
  badges: DonationBadge[];
  emptyText?: string;
}

export function BadgeGrid({
  badges,
  emptyText = 'Aún no tienes insignias de apoyo. ¡Apoya a una comunidad para ganar tu primera insignia!',
}: BadgeGridProps) {
  if (badges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-gradient-to-br from-terracotta-50 to-gold-50 border border-terracotta-100 py-12 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-terracotta-100">
          <Heart className="h-7 w-7 fill-terracotta-500 text-terracotta-500" aria-hidden="true" />
        </div>
        <p className="max-w-xs text-sm text-gray-500">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {badges.map((badge) => (
        <ContributionBadge key={badge.id} badge={badge} size="md" />
      ))}
    </div>
  );
}

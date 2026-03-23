interface FundingProgressProps {
  raised: number;
  goal: number;
  backers: number;
  compact?: boolean;
}

export default function FundingProgress({
  raised,
  goal,
  backers,
  compact = false,
}: FundingProgressProps) {
  const percentage = Math.min((raised / goal) * 100, 100);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <div className={compact ? '' : 'space-y-3'}>
      {/* Progress bar */}
      <div className="relative h-2.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Stats */}
      <div className={`flex items-center justify-between ${compact ? 'mt-2' : 'mt-3'}`}>
        <div>
          <span className={`font-semibold text-teal-600 ${compact ? 'text-sm' : 'text-lg'}`}>
            {formatCurrency(raised)}
          </span>
          <span className={`text-gray-400 ${compact ? 'text-xs' : 'text-sm'}`}>
            {' '}
            / {formatCurrency(goal)}
          </span>
        </div>
        <div className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
          <span className="font-medium text-gray-700">{backers}</span> backers
        </div>
      </div>

      {/* Percentage badge */}
      {!compact && (
        <div className="flex items-center gap-2">
          <span className="badge bg-teal-50 text-teal-700">
            {percentage.toFixed(0)}% funded
          </span>
          {percentage >= 80 && (
            <span className="badge bg-gold-100 text-gold-700">Almost there!</span>
          )}
        </div>
      )}
    </div>
  );
}

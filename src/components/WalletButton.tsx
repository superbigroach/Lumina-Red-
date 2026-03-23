import { Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

interface WalletButtonProps {
  balance?: number;
  compact?: boolean;
}

export default function WalletButton({ balance = 0, compact = false }: WalletButtonProps) {
  if (compact) {
    return (
      <Link
        to="/wallet"
        className="flex items-center gap-2 rounded-xl bg-teal-50 px-3 py-1.5 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-100"
      >
        <Wallet className="h-4 w-4" />
        <span>${balance.toFixed(2)}</span>
      </Link>
    );
  }

  return (
    <Link
      to="/wallet"
      className="card flex items-center gap-4 p-4 transition-all hover:ring-2 hover:ring-teal-500/20"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-md shadow-teal-500/25">
        <Wallet className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500">Digital Wallet</p>
        <p className="text-xl font-bold text-gray-900">
          ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>
    </Link>
  );
}

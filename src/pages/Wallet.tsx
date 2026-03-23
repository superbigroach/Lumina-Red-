import { useState, useEffect } from 'react';
import {
  Wallet as WalletIcon,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  Shield,
  Copy,
  Check,
  X,
  Eye,
  EyeOff,
  ChevronRight,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useWallet } from '../lib/WalletContext';
import { onUserTransactions, LRTransaction } from '../lib/firestore';

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Wallet() {
  const { user } = useAuth();
  const {
    isCreated, walletAddress, usdcBalance, ethBalance,
    loading: walletLoading, creating, error,
    createWallet, refreshBalance, formatBalance,
  } = useWallet();

  const [showCreateFlow, setShowCreateFlow] = useState(false);
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [pinStep, setPinStep] = useState<'create' | 'confirm' | 'done'>('create');
  const [firstPin, setFirstPin] = useState('');
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);
  const [transactions, setTransactions] = useState<LRTransaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = onUserTransactions(user.uid, setTransactions);
    return unsub;
  }, [user]);

  const handlePinInput = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 5) {
      const next = document.getElementById(`pin-${index + 1}`);
      next?.focus();
    }

    if (newPin.every((d) => d !== '')) {
      const fullPin = newPin.join('');
      if (pinStep === 'create') {
        setFirstPin(fullPin);
        setPinStep('confirm');
        setPin(['', '', '', '', '', '']);
        setTimeout(() => {
          document.getElementById('pin-0')?.focus();
        }, 100);
      } else if (pinStep === 'confirm') {
        if (fullPin === firstPin) {
          setPinStep('done');
          createWallet(fullPin).then(() => {
            setTimeout(() => {
              setShowCreateFlow(false);
              setPinStep('create');
              setPin(['', '', '', '', '', '']);
              setFirstPin('');
            }, 1500);
          });
        } else {
          setPin(['', '', '', '', '', '']);
          setTimeout(() => {
            document.getElementById('pin-0')?.focus();
          }, 100);
        }
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prev = document.getElementById(`pin-${index - 1}`);
      prev?.focus();
    }
  };

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshBalance();
    setRefreshing(false);
  };

  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : '';

  const balanceNum = parseFloat(usdcBalance) || 0;
  const ethNum = parseFloat(ethBalance) || 0;

  if (walletLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-teal-500" />
      </div>
    );
  }

  // No wallet -- show CTA
  if (!isCreated && !showCreateFlow) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 px-8 py-12 text-center text-white">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <WalletIcon className="h-10 w-10" />
            </div>
            <h1 className="mt-6 font-display text-3xl font-bold">
              Tu Community Wallet
            </h1>
            <p className="mt-3 text-teal-100">
              A secure wallet to contribute to Community Funds, receive dividends,
              and track your impact in the Lumina Red ecosystem.
            </p>
          </div>

          <div className="p-8">
            <div className="space-y-4">
              {[
                { title: 'Fund Latino businesses', description: 'Donate or invest directly from your wallet' },
                { title: 'Earn rewards', description: 'Get Community Funds for referrals and engagement' },
                { title: 'Track your impact', description: 'See exactly where your dollars make a difference' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-teal-50">
                    <Check className="h-3.5 w-3.5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-start gap-3 rounded-xl bg-gray-50 p-4">
              <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-500" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Protected by a 6-digit PIN
                </p>
                <p className="text-xs text-gray-500">
                  Your wallet is secured locally. Only you can authorize transactions.
                  No seed phrases or complex passwords to remember.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCreateFlow(true)}
              className="btn-teal mt-6 w-full py-4 text-base"
            >
              <Plus className="h-5 w-5" />
              Create Your Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PIN creation flow
  if (showCreateFlow && !isCreated) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <div className="card p-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-gray-900">
              {pinStep === 'create'
                ? 'Create Your PIN'
                : pinStep === 'confirm'
                ? 'Confirm Your PIN'
                : 'Wallet Created!'}
            </h2>
            {pinStep !== 'done' && (
              <button
                onClick={() => {
                  setShowCreateFlow(false);
                  setPinStep('create');
                  setPin(['', '', '', '', '', '']);
                  setFirstPin('');
                }}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-50"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {error && (
            <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {pinStep === 'done' || creating ? (
            <div className="mt-8 text-center">
              {creating ? (
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-teal-500" />
              ) : (
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-50">
                  <Check className="h-10 w-10 text-teal-500" />
                </div>
              )}
              <p className="mt-4 text-sm text-gray-500">
                {creating ? 'Creating your wallet...' : 'Your Digital Wallet is ready. Welcome to the cooperative economy!'}
              </p>
            </div>
          ) : (
            <>
              <p className="mt-2 text-sm text-gray-500">
                {pinStep === 'create'
                  ? 'Choose a 6-digit PIN to secure your wallet.'
                  : 'Enter the same PIN again to confirm.'}
              </p>

              <div className="mt-8 flex justify-center gap-3">
                {pin.map((digit, i) => (
                  <input
                    key={i}
                    id={`pin-${i}`}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinInput(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="h-14 w-12 rounded-xl border-2 border-gray-200 text-center text-xl font-bold text-gray-900 transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              <div className="mt-6 flex justify-center gap-2">
                <div className={`h-2 w-8 rounded-full ${pinStep === 'create' ? 'bg-teal-500' : 'bg-gray-200'}`} />
                <div className={`h-2 w-8 rounded-full ${pinStep === 'confirm' ? 'bg-teal-500' : 'bg-gray-200'}`} />
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Main wallet view
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Balance card */}
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <WalletIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-teal-100">Digital Wallet</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-teal-200">{truncatedAddress}</p>
                  <button
                    onClick={handleCopy}
                    className="rounded p-0.5 text-teal-200 transition-colors hover:text-white"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className={`rounded-lg p-2 text-teal-200 transition-colors hover:bg-white/10 hover:text-white ${refreshing ? 'animate-spin' : ''}`}
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="rounded-lg p-2 text-teal-200 transition-colors hover:bg-white/10 hover:text-white"
              >
                {showBalance ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-teal-200">USDC Balance</p>
            <p className="mt-1 font-display text-4xl font-bold text-white">
              {showBalance ? formatBalance(balanceNum) : '$****.**'}
            </p>
            <p className="mt-1 text-sm text-teal-300">
              {showBalance ? `${ethNum.toFixed(6)} ETH` : '****** ETH'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex gap-3">
            <a
              href="https://faucet.circle.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/20 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/30"
            >
              <Plus className="h-4 w-4" />
              Add Funds
              <ExternalLink className="h-3 w-3" />
            </a>
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/20 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/30">
              <ArrowUpRight className="h-4 w-4" />
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { label: 'Fund a Business', icon: ArrowUpRight, color: 'terracotta' },
          { label: 'Request Funds', icon: ArrowDownLeft, color: 'teal' },
          { label: 'View Impact', icon: History, color: 'gold' },
        ].map(({ label, icon: Icon, color }) => {
          const colorClasses: Record<string, string> = {
            terracotta: 'bg-terracotta-50 text-terracotta-600',
            teal: 'bg-teal-50 text-teal-600',
            gold: 'bg-gold-100 text-gold-600',
          };
          return (
            <button
              key={label}
              className="card flex flex-col items-center gap-2 p-4 transition-all hover:shadow-md"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorClasses[color]}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-gray-700">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Transaction history */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-gray-900">
            <History className="h-5 w-5 text-gray-400" />
            Transaction History
          </h2>
        </div>

        <div className="mt-4 space-y-2">
          {transactions.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-sm text-gray-500">No transactions yet. Fund a business to get started!</p>
            </div>
          ) : (
            transactions.map((tx) => {
              const isOutgoing = tx.type === 'donation' || tx.type === 'equity_purchase';
              const createdAt = tx.createdAt?.toDate ? tx.createdAt.toDate() : new Date();
              return (
                <div
                  key={tx.id}
                  className="card flex items-center gap-4 p-4 transition-all hover:shadow-md cursor-pointer"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    isOutgoing ? 'bg-terracotta-50' : 'bg-teal-50'
                  }`}>
                    {isOutgoing ? (
                      <ArrowUpRight className="h-5 w-5 text-terracotta-600" />
                    ) : (
                      <ArrowDownLeft className="h-5 w-5 text-teal-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {tx.type === 'donation' ? 'Donation' : 'Investment'} - {tx.businessName}
                    </p>
                    <p className="text-xs text-gray-400">{timeAgo(createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${isOutgoing ? 'text-gray-900' : 'text-teal-600'}`}>
                      {isOutgoing ? '-' : '+'}${tx.amountUsdc.toFixed(2)}
                    </p>
                    <p className={`text-xs ${
                      tx.status === 'completed' ? 'text-teal-500' : tx.status === 'pending' ? 'text-gold-500' : 'text-red-500'
                    }`}>
                      {tx.status}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

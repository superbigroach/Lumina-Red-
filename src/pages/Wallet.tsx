import { useState } from 'react';
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
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'sent' | 'received' | 'donation' | 'reward';
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending';
}

const transactions: Transaction[] = [
  {
    id: 't1',
    type: 'donation',
    description: 'Donation to Sabor de Casa',
    amount: -50,
    date: 'Mar 22, 2026',
    status: 'completed',
  },
  {
    id: 't2',
    type: 'reward',
    description: 'Referral Reward',
    amount: 25,
    date: 'Mar 20, 2026',
    status: 'completed',
  },
  {
    id: 't3',
    type: 'donation',
    description: 'Donation to NexoTech Labs',
    amount: -100,
    date: 'Mar 18, 2026',
    status: 'completed',
  },
  {
    id: 't4',
    type: 'received',
    description: 'Community Funds deposit',
    amount: 500,
    date: 'Mar 15, 2026',
    status: 'completed',
  },
  {
    id: 't5',
    type: 'donation',
    description: 'Donation to Pan Dulce Bakery',
    amount: -25,
    date: 'Mar 12, 2026',
    status: 'completed',
  },
  {
    id: 't6',
    type: 'sent',
    description: 'Sent to @carlosmendoza',
    amount: -75,
    date: 'Mar 10, 2026',
    status: 'completed',
  },
  {
    id: 't7',
    type: 'reward',
    description: 'Early Adopter Bonus',
    amount: 50,
    date: 'Mar 5, 2026',
    status: 'completed',
  },
  {
    id: 't8',
    type: 'received',
    description: 'Cooperative dividend',
    amount: 12.50,
    date: 'Mar 1, 2026',
    status: 'completed',
  },
];

export default function Wallet() {
  const [walletCreated, setWalletCreated] = useState(false);
  const [showCreateFlow, setShowCreateFlow] = useState(false);
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [pinStep, setPinStep] = useState<'create' | 'confirm' | 'done'>('create');
  const [firstPin, setFirstPin] = useState('');
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);

  const balance = 1247.5;
  const walletAddress = '0x7a3B...9f4E';

  const handlePinInput = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 5) {
      const next = document.getElementById(`pin-${index + 1}`);
      next?.focus();
    }

    // Check if all filled
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
          setTimeout(() => {
            setWalletCreated(true);
            setShowCreateFlow(false);
            setPinStep('create');
            setPin(['', '', '', '', '', '']);
            setFirstPin('');
          }, 1500);
        } else {
          // Reset on mismatch
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
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTypeStyles = (type: Transaction['type']) => {
    switch (type) {
      case 'donation':
        return { bg: 'bg-terracotta-50', color: 'text-terracotta-600', icon: ArrowUpRight };
      case 'sent':
        return { bg: 'bg-gray-50', color: 'text-gray-600', icon: ArrowUpRight };
      case 'received':
        return { bg: 'bg-teal-50', color: 'text-teal-600', icon: ArrowDownLeft };
      case 'reward':
        return { bg: 'bg-gold-100', color: 'text-gold-600', icon: ArrowDownLeft };
    }
  };

  // No wallet created yet — show CTA
  if (!walletCreated && !showCreateFlow) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="card overflow-hidden">
          <div className="bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 px-8 py-12 text-center text-white">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <WalletIcon className="h-10 w-10" />
            </div>
            <h1 className="mt-6 font-display text-3xl font-bold">
              Tu Digital Wallet
            </h1>
            <p className="mt-3 text-teal-100">
              A secure wallet to contribute to Community Funds, receive dividends,
              and track your impact in the Lumina Red ecosystem.
            </p>
          </div>

          <div className="p-8">
            <div className="space-y-4">
              {[
                {
                  title: 'Fund Latino businesses',
                  description: 'Donate or invest directly from your wallet',
                },
                {
                  title: 'Earn rewards',
                  description: 'Get Community Funds for referrals and engagement',
                },
                {
                  title: 'Track your impact',
                  description: 'See exactly where your dollars make a difference',
                },
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
  if (showCreateFlow) {
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

          {pinStep === 'done' ? (
            <div className="mt-8 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-50">
                <Check className="h-10 w-10 text-teal-500" />
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Your Digital Wallet is ready. Welcome to the cooperative economy!
              </p>
            </div>
          ) : (
            <>
              <p className="mt-2 text-sm text-gray-500">
                {pinStep === 'create'
                  ? 'Choose a 6-digit PIN to secure your wallet.'
                  : 'Enter the same PIN again to confirm.'}
              </p>

              {/* PIN dots */}
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

              {/* Step indicator */}
              <div className="mt-6 flex justify-center gap-2">
                <div
                  className={`h-2 w-8 rounded-full ${
                    pinStep === 'create' ? 'bg-teal-500' : 'bg-gray-200'
                  }`}
                />
                <div
                  className={`h-2 w-8 rounded-full ${
                    pinStep === 'confirm' ? 'bg-teal-500' : 'bg-gray-200'
                  }`}
                />
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
                  <p className="text-sm text-teal-200">{walletAddress}</p>
                  <button
                    onClick={handleCopy}
                    className="rounded p-0.5 text-teal-200 transition-colors hover:text-white"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="rounded-lg p-2 text-teal-200 transition-colors hover:bg-white/10 hover:text-white"
            >
              {showBalance ? (
                <Eye className="h-5 w-5" />
              ) : (
                <EyeOff className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="mt-6">
            <p className="text-sm text-teal-200">Community Funds Balance</p>
            <p className="mt-1 font-display text-4xl font-bold text-white">
              {showBalance
                ? `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                : '$****.**'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex gap-3">
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/20 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/30">
              <Plus className="h-4 w-4" />
              Add Funds
            </button>
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
          const colorClasses = {
            terracotta: 'bg-terracotta-50 text-terracotta-600',
            teal: 'bg-teal-50 text-teal-600',
            gold: 'bg-gold-100 text-gold-600',
          };
          return (
            <button
              key={label}
              className="card flex flex-col items-center gap-2 p-4 transition-all hover:shadow-md"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorClasses[color as keyof typeof colorClasses]}`}
              >
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
          <button className="text-sm font-medium text-teal-600 hover:text-teal-700">
            View all
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {transactions.map((tx) => {
            const styles = getTypeStyles(tx.type);
            const Icon = styles.icon;
            return (
              <div
                key={tx.id}
                className="card flex items-center gap-4 p-4 transition-all hover:shadow-md cursor-pointer"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles.bg}`}
                >
                  <Icon className={`h-5 w-5 ${styles.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {tx.description}
                  </p>
                  <p className="text-xs text-gray-400">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${
                      tx.amount >= 0 ? 'text-teal-600' : 'text-gray-900'
                    }`}
                  >
                    {tx.amount >= 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-300" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

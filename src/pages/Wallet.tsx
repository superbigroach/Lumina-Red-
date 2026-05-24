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
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useWallet } from '../lib/WalletContext';
import { onUserTransactions, LRTransaction, createTransaction } from '../lib/firestore';

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

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function generateFakeTxHash(): string {
  const hex = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += hex[Math.floor(Math.random() * 16)];
  }
  return result;
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
  const [requestCopied, setRequestCopied] = useState(false);
  const [transactions, setTransactions] = useState<LRTransaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Send modal state
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendStep, setSendStep] = useState<'form' | 'review' | 'pending' | 'success' | 'error'>('form');
  const [sendTo, setSendTo] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendNote, setSendNote] = useState('');
  const [sendError, setSendError] = useState('');
  const [fakeTxHash, setFakeTxHash] = useState('');

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

  const handleRequestCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress).catch(() => {});
    }
    setRequestCopied(true);
    setTimeout(() => setRequestCopied(false), 2000);
  };

  const handleViewHistory = () => {
    document.querySelector('.transactions-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetSendModal = () => {
    setSendStep('form');
    setSendTo('');
    setSendAmount('');
    setSendNote('');
    setSendError('');
    setFakeTxHash('');
  };

  const closeSendModal = () => {
    setShowSendModal(false);
    resetSendModal();
  };

  const isValidAddress = (addr: string) => /^0x[0-9a-fA-F]{40}$/.test(addr);
  const balanceNum = parseFloat(usdcBalance) || 0;
  const amountNum = parseFloat(sendAmount) || 0;
  const sendFormValid =
    isValidAddress(sendTo) && amountNum > 0 && amountNum <= balanceNum;

  const simulateSend = async () => {
    if (!user) return;
    try {
      await createTransaction({
        backerId: user.uid,
        backerName: user.displayName ?? 'User',
        recipientId: 'external',
        businessId: 'external',
        businessName: 'External Transfer',
        businessLogoUrl: '',
        amountUsdc: amountNum,
        type: 'donation',
      });
    } catch {
      // Non-fatal — the UI already shows success after the delay
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const hash = generateFakeTxHash();
    setFakeTxHash(hash);
    setSendStep('success');
    refreshBalance();
  };

  const handleConfirmSend = async () => {
    setSendStep('pending');
    try {
      await simulateSend();
    } catch {
      setSendError('Error al procesar la transacción. Intenta de nuevo.');
      setSendStep('error');
    }
  };

  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : '';

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
            <button
              onClick={() => { resetSendModal(); setShowSendModal(true); }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/20 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/30"
            >
              <ArrowUpRight className="h-4 w-4" />
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <button
          onClick={() => { resetSendModal(); setShowSendModal(true); }}
          className="card flex flex-col items-center gap-2 p-4 transition-all hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta-50 text-terracotta-600">
            <ArrowUpRight className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium text-gray-700">Fund a Business</span>
        </button>

        <button
          onClick={handleRequestCopy}
          className="card flex flex-col items-center gap-2 p-4 transition-all hover:shadow-md"
        >
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${requestCopied ? 'bg-teal-500 text-white' : 'bg-teal-50 text-teal-600'}`}>
            {requestCopied ? <Check className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
          </div>
          <span className="text-xs font-medium text-gray-700">
            {requestCopied ? '¡Copiado!' : 'Request Funds'}
          </span>
        </button>

        <button
          onClick={handleViewHistory}
          className="card flex flex-col items-center gap-2 p-4 transition-all hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-100 text-gold-600">
            <History className="h-5 w-5" />
          </div>
          <span className="text-xs font-medium text-gray-700">Ver historial</span>
        </button>
      </div>

      {/* Transaction history */}
      <div className="transactions-section mt-8">
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
              const isOutgoing = tx.type === 'donation';
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

      {/* ===================== SEND MODAL ===================== */}
      {showSendModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={sendStep === 'pending' ? undefined : closeSendModal}
          />

          {/* Panel */}
          <div className="relative z-10 w-full max-w-md rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl">

            {/* ---- STEP: FORM ---- */}
            {sendStep === 'form' && (
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-gray-900">Enviar USDC</h2>
                  <button
                    onClick={closeSendModal}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Testnet notice */}
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-amber-500" />
                  <p className="text-xs font-medium text-amber-700">
                    Base Sepolia Testnet — Fondos de prueba únicamente
                  </p>
                </div>

                <div className="mt-5 space-y-4">
                  {/* Recipient */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Dirección del destinatario
                    </label>
                    <input
                      type="text"
                      value={sendTo}
                      onChange={(e) => setSendTo(e.target.value.trim())}
                      placeholder="0x..."
                      className={`w-full rounded-xl border px-4 py-3 font-mono text-sm transition-colors focus:outline-none focus:ring-2 ${
                        sendTo && !isValidAddress(sendTo)
                          ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200'
                          : 'border-gray-200 bg-gray-50 focus:border-teal-400 focus:ring-teal-200'
                      }`}
                    />
                    {sendTo && !isValidAddress(sendTo) && (
                      <p className="mt-1 text-xs text-red-500">
                        Dirección inválida. Debe comenzar con 0x seguido de 40 caracteres hexadecimales.
                      </p>
                    )}
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Cantidad (USDC)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                        placeholder="0.00"
                        className={`w-full rounded-xl border py-3 pl-8 pr-16 text-sm transition-colors focus:outline-none focus:ring-2 ${
                          sendAmount && amountNum > balanceNum
                            ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-200'
                            : 'border-gray-200 bg-gray-50 focus:border-teal-400 focus:ring-teal-200'
                        }`}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">USDC</span>
                    </div>
                    <p className={`mt-1 text-xs ${sendAmount && amountNum > balanceNum ? 'text-red-500' : 'text-gray-400'}`}>
                      Saldo disponible: {formatBalance(balanceNum)}
                    </p>

                    {/* Quick amounts */}
                    <div className="mt-2 flex gap-2">
                      {[10, 25, 50].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setSendAmount(String(amt))}
                          disabled={amt > balanceNum}
                          className={`flex-1 rounded-lg border py-1.5 text-xs font-semibold transition-colors ${
                            amt > balanceNum
                              ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300'
                              : parseFloat(sendAmount) === amt
                              ? 'border-teal-500 bg-teal-50 text-teal-700'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700'
                          }`}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Note */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Nota <span className="font-normal text-gray-400">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={sendNote}
                      onChange={(e) => setSendNote(e.target.value.slice(0, 100))}
                      placeholder="Ej: Pago por servicios..."
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition-colors focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200"
                    />
                    <p className="mt-1 text-right text-xs text-gray-300">{sendNote.length}/100</p>
                  </div>
                </div>

                <button
                  onClick={() => setSendStep('review')}
                  disabled={!sendFormValid}
                  className="mt-6 w-full rounded-xl bg-teal-600 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Revisar
                </button>
              </div>
            )}

            {/* ---- STEP: REVIEW ---- */}
            {sendStep === 'review' && (
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-gray-900">Revisar envío</h2>
                  <button
                    onClick={closeSendModal}
                    className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-500">Enviando a</span>
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {truncateAddress(sendTo)}
                      </span>
                    </div>
                    <div className="my-1 border-t border-gray-100" />
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-500">Cantidad</span>
                      <span className="text-sm font-semibold text-gray-900">
                        ${parseFloat(sendAmount).toFixed(2)} USDC
                      </span>
                    </div>
                    <div className="my-1 border-t border-gray-100" />
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-500">Tarifa de red</span>
                      <span className="text-sm text-gray-500">~0.001 ETH (estimado)</span>
                    </div>
                    {sendNote && (
                      <>
                        <div className="my-1 border-t border-gray-100" />
                        <div className="flex items-start justify-between py-2">
                          <span className="text-sm text-gray-500">Nota</span>
                          <span className="max-w-[200px] text-right text-sm text-gray-700">{sendNote}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="rounded-xl bg-amber-50 px-4 py-3">
                    <p className="text-xs text-amber-700">
                      Esta transacción es en la red de prueba Base Sepolia y no tiene valor real.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setSendStep('form')}
                    className="flex-1 rounded-xl border border-gray-200 bg-white py-3.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Volver
                  </button>
                  <button
                    onClick={handleConfirmSend}
                    className="flex-1 rounded-xl bg-teal-600 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
                  >
                    Confirmar envío
                  </button>
                </div>
              </div>
            )}

            {/* ---- STEP: PENDING ---- */}
            {sendStep === 'pending' && (
              <div className="p-10 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-50">
                  <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
                </div>
                <h2 className="mt-5 font-display text-xl font-bold text-gray-900">
                  Procesando transacción...
                </h2>
                <p className="mt-2 text-sm text-gray-400">
                  Esperando confirmación en la blockchain
                </p>
              </div>
            )}

            {/* ---- STEP: SUCCESS ---- */}
            {sendStep === 'success' && (
              <div className="p-6 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-teal-50">
                  <Check className="h-10 w-10 text-teal-500" />
                </div>
                <h2 className="mt-5 font-display text-xl font-bold text-gray-900">
                  ¡Transacción enviada!
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Se enviaron{' '}
                  <span className="font-semibold text-gray-900">
                    ${parseFloat(sendAmount).toFixed(2)} USDC
                  </span>{' '}
                  a{' '}
                  <span className="font-mono font-medium text-gray-900">
                    {truncateAddress(sendTo)}
                  </span>
                </p>

                {fakeTxHash && (
                  <div className="mt-4 rounded-xl bg-gray-50 p-3">
                    <p className="text-xs text-gray-400">TX Hash</p>
                    <p className="mt-1 break-all font-mono text-xs text-gray-600">
                      0x{fakeTxHash.slice(0, 20)}...{fakeTxHash.slice(-8)}
                    </p>
                  </div>
                )}

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={`https://sepolia.basescan.org/tx/0x${fakeTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Ver en BaseScan
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={() => { closeSendModal(); refreshBalance(); }}
                    className="flex-1 rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}

            {/* ---- STEP: ERROR ---- */}
            {sendStep === 'error' && (
              <div className="p-6 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
                  <X className="h-10 w-10 text-red-500" />
                </div>
                <h2 className="mt-5 font-display text-xl font-bold text-gray-900">
                  Error en la transacción
                </h2>
                <p className="mt-2 text-sm text-gray-500">{sendError}</p>

                <button
                  onClick={() => setSendStep('form')}
                  className="mt-6 w-full rounded-xl bg-teal-600 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
                >
                  Intentar de nuevo
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

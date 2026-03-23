import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getUsdcBalance, getEthBalance, formatUsdc } from './circle-wallet';
import { getUserProfile, updateUserProfile } from './firestore';

interface WalletState {
  isCreated: boolean;
  walletAddress: string | null;
  usdcBalance: string;
  ethBalance: string;
  loading: boolean;
  creating: boolean;
  error: string | null;
}

interface WalletContextType extends WalletState {
  createWallet: (pin: string) => Promise<void>;
  refreshBalance: () => Promise<void>;
  formatBalance: (amount: number | string) => string;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<WalletState>({
    isCreated: false,
    walletAddress: null,
    usdcBalance: '0.00',
    ethBalance: '0.00',
    loading: true,
    creating: false,
    error: null,
  });

  // Load wallet from Firestore profile
  useEffect(() => {
    if (!user) {
      setState(prev => ({ ...prev, isCreated: false, walletAddress: null, loading: false }));
      return;
    }

    let cancelled = false;
    (async () => {
      const profile = await getUserProfile(user.uid);
      if (cancelled) return;
      if (profile?.walletAddress) {
        setState(prev => ({
          ...prev,
          isCreated: true,
          walletAddress: profile.walletAddress!,
          loading: false,
        }));
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  // Refresh balances when wallet is available
  const refreshBalance = useCallback(async () => {
    if (!state.walletAddress) return;
    try {
      const [usdc, eth] = await Promise.all([
        getUsdcBalance(state.walletAddress),
        getEthBalance(state.walletAddress),
      ]);
      setState(prev => ({ ...prev, usdcBalance: usdc, ethBalance: eth }));
    } catch (err) {
      console.error('Balance refresh failed:', err);
    }
  }, [state.walletAddress]);

  useEffect(() => {
    if (state.walletAddress) {
      refreshBalance();
      const interval = setInterval(refreshBalance, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [state.walletAddress, refreshBalance]);

  // Create wallet — generates a deterministic address from user UID
  // In production, this would create a real Circle smart account via API
  const createWallet = async (pin: string) => {
    if (!user || !pin || pin.length !== 6) {
      setState(prev => ({ ...prev, error: 'Invalid PIN — must be 6 digits' }));
      return;
    }
    setState(prev => ({ ...prev, creating: true, error: null }));

    try {
      // Generate a wallet address from user UID (deterministic for demo)
      // In production: call Circle API to create a smart account with passkey
      const encoder = new TextEncoder();
      const data = encoder.encode(user.uid + pin + 'lumina-red-wallet');
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const walletAddress = '0x' + hashArray.slice(0, 20).map(b => b.toString(16).padStart(2, '0')).join('');

      // Save to Firestore
      await updateUserProfile(user.uid, {
        walletAddress,
        walletId: `wallet_${user.uid.substring(0, 8)}`,
      });

      setState(prev => ({
        ...prev,
        isCreated: true,
        walletAddress,
        creating: false,
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        creating: false,
        error: err.message || 'Failed to create wallet',
      }));
    }
  };

  return (
    <WalletContext.Provider value={{
      ...state,
      createWallet,
      refreshBalance,
      formatBalance: formatUsdc,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}

import { createPublicClient, http, formatUnits, parseUnits, encodeFunctionData } from 'viem';
import { baseSepolia } from 'viem/chains';

// Circle testnet config
const CIRCLE_CLIENT_KEY = 'TEST_CLIENT_KEY:7b178814b9306d788b2a1960747c3b26:8ecc7bbcebdaa5fb264cf11d8aa3a696';
const CIRCLE_CLIENT_URL = 'https://modular-sdk.circle.com/v1/rpc/w3s/buidl';

// USDC on Base Sepolia
export const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as const;
export const USDC_DECIMALS = 6;

// ERC-20 ABI for balanceOf and transfer
const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

// Public client for reading blockchain state
export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org'),
});

// Get USDC balance for an address
export async function getUsdcBalance(address: string): Promise<string> {
  try {
    const balance = await publicClient.readContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
    });
    return formatUnits(balance, USDC_DECIMALS);
  } catch (error) {
    console.error('Error getting USDC balance:', error);
    return '0.00';
  }
}

// Get ETH balance
export async function getEthBalance(address: string): Promise<string> {
  try {
    const balance = await publicClient.getBalance({
      address: address as `0x${string}`,
    });
    return formatUnits(balance, 18);
  } catch (error) {
    console.error('Error getting ETH balance:', error);
    return '0.00';
  }
}

// Format USDC for display
export function formatUsdc(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

// Parse USDC amount to on-chain units
export function parseUsdcAmount(amount: string): bigint {
  return parseUnits(amount, USDC_DECIMALS);
}

// Encode a USDC transfer call
export function encodeUsdcTransfer(to: string, amount: string): string {
  return encodeFunctionData({
    abi: ERC20_ABI,
    functionName: 'transfer',
    args: [to as `0x${string}`, parseUsdcAmount(amount)],
  });
}

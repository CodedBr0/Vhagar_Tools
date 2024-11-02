import { PublicKey } from '@solana/web3.js';

export const RPC_ENDPOINTS = {
  'devnet': 'https://api.devnet.solana.com',
  'mainnet-beta': 'https://swift-mariele-fast-mainnet.helius-rpc.com'
};

export const DEFAULT_NETWORK = 'mainnet-beta';

export const TOKEN_MINTS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
};

export const FEE_ACCOUNTS = {
  [TOKEN_MINTS.SOL]: new PublicKey('D5EShfDtcUURUZ5h1FrmmKJEfkDwPXg2nT2gwJgJq6Jh'),
  [TOKEN_MINTS.USDC]: new PublicKey('J97m9qU41d8rSjymBN6mfnTmzdeQeAkm71LirtqRzohh'),
  [TOKEN_MINTS.USDT]: new PublicKey('BaZKR1pVtttNcBKeeF1jSSeYZf5a39gaAEC4wdb88XEf')
};

export const JUPITER_REFERRAL_KEY = new PublicKey('9jpy1BrXzzpH1HfSsWTRyJKLm6KqMo5paAe3CU15nXj8');

// New constants for stake program IDs
export const STAKE_PROGRAM_IDS = {
  devnet: {
    token2022: '5aLrQV7Ynicnov36VHqYF2aX8yNrw9HhKkxtTmqx1utR',
    legacy: 'BTHkyrVmVjn8cF5y2a5w43V5n5h7omqv4UAyJyLyMQ14'
  },
  'mainnet-beta': {
    token2022: 'Coming Soon',
    legacy: 'Coming Soon'
  }
};
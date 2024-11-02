'use client';

import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl, PublicKey } from '@solana/web3.js';
import * as wallets from '@solana/wallet-adapter-wallets';

import '@solana/wallet-adapter-react-ui/styles.css';

// Jupiter Referral Key
const JUPITER_REFERRAL_KEY = new PublicKey('9jpy1BrXzzpH1HfSsWTRyJKLm6KqMo5paAe3CU15nXj8');

export default function WalletContextProvider({ children }) {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const walletOptions = useMemo(
    () => [
      new wallets.PhantomWalletAdapter(),
      new wallets.SolflareWalletAdapter(),
      new wallets.WalletConnectWalletAdapter(),
      new wallets.AlphaWalletAdapter(),
      new wallets.BitgetWalletAdapter(),
      new wallets.BitpieWalletAdapter(),
      new wallets.CloverWalletAdapter(),
      new wallets.Coin98WalletAdapter(),
      new wallets.CoinhubWalletAdapter(),
      new wallets.AvanaWalletAdapter(),
      new wallets.FractalWalletAdapter(),
      new wallets.HuobiWalletAdapter(),
      new wallets.HyperPayWalletAdapter(),
      new wallets.KeystoneWalletAdapter(),
      new wallets.KrystalWalletAdapter(),
      new wallets.LedgerWalletAdapter(),
      new wallets.MathWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={walletOptions} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

// Export the referral key for use in other parts of the application
export { JUPITER_REFERRAL_KEY };
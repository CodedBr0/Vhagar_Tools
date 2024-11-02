'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Image from 'next/image';
import styles from './Swap.module.css';
import { useNetwork } from '@/components/NetworkContext';
import { RPC_ENDPOINTS, TOKEN_MINTS, FEE_ACCOUNTS, JUPITER_REFERRAL_KEY } from '@/constants';

const SwapPage = () => {
  const { publicKey, connected } = useWallet();
  const [isTerminalLoaded, setIsTerminalLoaded] = useState(false);
  const [message, setMessage] = useState(null);
  const { network } = useNetwork();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://terminal.jup.ag/main-v2.js';
    script.async = true;
    script.onload = () => setIsTerminalLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (isTerminalLoaded && connected) {
      initJupiterTerminal();
    }
  }, [isTerminalLoaded, connected, publicKey, network]);

  const initJupiterTerminal = () => {
    if (window.Jupiter) {
      const currentTokenMints = TOKEN_MINTS[network];
      const currentFeeAccounts = FEE_ACCOUNTS[network];

      window.Jupiter.init({
        displayMode: 'integrated',
        integratedTargetId: 'swap-container',
        endpoint: RPC_ENDPOINTS[network],
        platformFeeAndAccounts: {
          feeBps: 50,
          feeAccounts: currentFeeAccounts
        },
        containerStyles: {
          width: '100%',
          height: '600px',
          border: '1px solid #5ee616',
          borderRadius: '12px',
          background: 'rgba(5, 12, 36, 0.95)',
          boxShadow: '0 0 20px rgba(94, 230, 22, 0.3)',
        },
        defaultExplorer: 'SolanaFM',
        onSuccess: ({ txid, swapResult }) => {
          setMessage({
            type: 'success',
            content: `Swap successful! Transaction hash: ${txid}`
          });
          console.log('Swap Result:', swapResult);
        },
        onSwapError: ({ error }) => {
          setMessage({
            type: 'error',
            content: `Swap failed: ${error.message || 'Unknown error occurred'}`
          });
          console.error('Swap Error:', error);
        },
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Swap Tokens</h1>
        {connected ? (
          <div className={styles.swapWrapper}>
            {network === 'devnet' && (
              <div className={styles.devnetWarning}>
                <i className="bi bi-exclamation-triangle-fill"></i>
                Warning: Swap functionality is not available on Devnet. Please switch to Mainnet.
              </div>
            )}
            <div id="swap-container" className={styles.swapContainer}></div>
            {message && (
              <div className={`${styles.message} ${styles[message.type]}`}>
                {message.content}
              </div>
            )}
            <div className={styles.poweredBy}>
              <span>Powered by</span>
              <Image src="/jupiter.png" alt="Jupiter" width={30} height={30} />
              <span>Jupiter Dex Aggregator</span>
            </div>
          </div>
        ) : (
          <div className={styles.connectPrompt}>
            <p>Please connect your wallet to use the swap feature.</p>
            <div className={styles.walletIcon}>
              <i className="bi bi-wallet2"></i>
            </div>
          </div>
        )}
      </div>
      <div className={styles.backgroundDecoration}>
        <div className={styles.circle}></div>
        <div className={styles.circle}></div>
        <div className={styles.circle}></div>
      </div>
    </div>
  );
};

export default SwapPage;
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import styles from './TokenMint.module.css';
import ConstructionOverlay from '@/components/ConstructionOverlay';

// Dynamically import the TokenMintContent component with SSR disabled
const TokenMintContent = dynamic(() => import('@/components/TokenMintContent'), { ssr: false });

// Set this to false when the page is completed to remove the construction overlay
const SHOW_CONSTRUCTION_OVERLAY = true;

export default function TokenMintPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Token Mint</h1>
        <TokenMintContent />
      </div>
      <ConstructionOverlay isVisible={SHOW_CONSTRUCTION_OVERLAY} />
    </div>
  );
}
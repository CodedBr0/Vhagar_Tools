'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import styles from './TokenBurn.module.css';
import ConstructionOverlay from '@/components/ConstructionOverlay';

// Dynamically import the TokenBurnContent component with SSR disabled
const TokenBurnContent = dynamic(() => import('@/components/TokenBurnContent'), { ssr: false });

// Set this to false when the page is completed to remove the construction overlay
const SHOW_CONSTRUCTION_OVERLAY = true;

export default function TokenBurnPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Token Burn</h1>
        <TokenBurnContent />
      </div>
      <ConstructionOverlay isVisible={SHOW_CONSTRUCTION_OVERLAY} />
    </div>
  );
}
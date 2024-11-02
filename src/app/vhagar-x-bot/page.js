'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import styles from './VhagarXBot.module.css';
import ConstructionOverlay from '@/components/ConstructionOverlay';

// Dynamically import the VhagarXBot component with SSR disabled
// Note: You'll need to create this component separately
const VhagarXBot = dynamic(() => import('@/components/VhagarXBot'), { ssr: false });

// Set this to false when the page is completed to remove the construction overlay
const SHOW_CONSTRUCTION_OVERLAY = true;

export default function VhagarXBotPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Vhagar-X Bot</h1>
        <VhagarXBot />
      </div>
      <ConstructionOverlay isVisible={SHOW_CONSTRUCTION_OVERLAY} />
    </div>
  );
}
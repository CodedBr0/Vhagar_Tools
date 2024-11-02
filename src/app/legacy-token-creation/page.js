'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import styles from './LegacyTokenCreation.module.css';
import ConstructionOverlay from '@/components/ConstructionOverlay';

// Dynamically import the LegacyTokenCreator component with SSR disabled
const LegacyTokenCreator = dynamic(() => import('@/components/LegacyTokenCreator'), { ssr: false });

// Set this to false when the page is completed to remove the construction overlay
const SHOW_CONSTRUCTION_OVERLAY = true;

export default function LegacyTokenCreationPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Create Legacy Token</h1>
        <LegacyTokenCreator />
      </div>
      <ConstructionOverlay isVisible={SHOW_CONSTRUCTION_OVERLAY} />
    </div>
  );
}
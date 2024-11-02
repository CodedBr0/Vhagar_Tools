'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import styles from './MetadataManager.module.css';
import ConstructionOverlay from '@/components/ConstructionOverlay';

// Dynamically import the MetadataManagerContent component with SSR disabled
const MetadataManagerContent = dynamic(() => import('@/components/MetadataManagerContent'), { ssr: false });

// Set this to false when the page is completed to remove the construction overlay
const SHOW_CONSTRUCTION_OVERLAY = true;

export default function MetadataManagerPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Metadata Manager</h1>
        <MetadataManagerContent />
      </div>
      <ConstructionOverlay isVisible={SHOW_CONSTRUCTION_OVERLAY} />
    </div>
  );
}
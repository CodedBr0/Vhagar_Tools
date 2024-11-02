'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import styles from './Token2022Creation.module.css';
import ConstructionOverlay from '@/components/ConstructionOverlay';

// Dynamically import the Token2022Creator component with SSR disabled
const Token2022Creator = dynamic(() => import('@/components/Token2022Creator'), { ssr: false });

// Set this to false when the page is completed to remove the construction overlay
const SHOW_CONSTRUCTION_OVERLAY = true;

export default function Token2022CreationPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Create Token 2022</h1>
        <Token2022Creator />
      </div>
      <ConstructionOverlay isVisible={SHOW_CONSTRUCTION_OVERLAY} />
    </div>
  );
}
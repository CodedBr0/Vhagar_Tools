'use client';

import React from 'react';
import Image from 'next/image';
import styles from './TokenManager.module.css';
import ConstructionOverlay from '@/components/ConstructionOverlay';
import TokenManagerContent from '@/components/TokenManagerContent';

// Set this to false when the page is ready to remove the construction overlay
const SHOW_CONSTRUCTION_OVERLAY = true;

export default function TokenManagerPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          Token Manager
          {!SHOW_CONSTRUCTION_OVERLAY && (
            <Image
              src="/construction.png"
              alt="Under Construction"
              width={200}
              height={121}
              className={styles.constructionImage}
            />
          )}
        </h1>
        <TokenManagerContent />
      </div>
      <ConstructionOverlay isVisible={SHOW_CONSTRUCTION_OVERLAY} />
    </div>
  );
}
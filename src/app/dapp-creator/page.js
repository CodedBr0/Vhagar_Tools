'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import styles from './DappCreator.module.css';
import ConstructionOverlay from '@/components/ConstructionOverlay';

const DappCreator = dynamic(() => import('@/components/DappCreator'), { ssr: false });

// Set this to false when the page is completed to remove the construction overlay
const SHOW_CONSTRUCTION_OVERLAY = false;

export default function DappCreatorPage() {
  return (
    <div className={styles.container}>
      <div className={styles.backgroundDecoration}>
        <div className={styles.circle}></div>
        <div className={styles.circle}></div>
        <div className={styles.circle}></div>
      </div>
      <div className={styles.content}>
        <h1 className={styles.title}>Staking Dapp Creator</h1>
        <div className={styles.iconContainer}>
          <Image src="/solana.png" alt="Solana Logo" width={60} height={60} className={styles.icon} />
          <Image src="/mint.png" alt="Mint Icon" width={60} height={60} className={styles.icon} />
        </div>
        <p className={styles.description}>
          Create your own staking dapp for Solana tokens. Choose between Legacy and Token2022 standards,
          set lock durations, and reward percentages for your staking pool.
          <br />
          Make sure to read and understand the <a href="https://docs.vhagar.finance/greenpaper/staking-dapp-deployer" target="_blank" rel="noopener noreferrer" className={styles.yellowLink}>guidelines</a> in our <a href="https://docs.vhagar.finance/greenpaper" target="_blank" rel="noopener noreferrer" className={styles.yellowLink}>official documentation</a> before proceeding.
        </p>
        <div className={styles.cardContainer}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Customizable</h2>
            <p className={styles.cardDescription}>Tailor your staking dapp to your specific needs with flexible options.</p>
          </div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Secure</h2>
            <p className={styles.cardDescription}>Built on Solana&apos;s robust blockchain for maximum security and efficiency.</p>
          </div>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>User-Friendly</h2>
            <p className={styles.cardDescription}>Intuitive interface for easy setup and management of your staking pool.</p>
          </div>
        </div>
        <DappCreator />
      </div>
      <ConstructionOverlay isVisible={SHOW_CONSTRUCTION_OVERLAY} />
    </div>
  );
}
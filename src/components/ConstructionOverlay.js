// src/components/ConstructionOverlay.js
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './ConstructionOverlay.module.css';

const ConstructionOverlay = ({ isVisible = true }) => {
  if (!isVisible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <Image
          src="/construction.png"
          alt="Under Construction"
          width={200}
          height={121}
          className={styles.image}
        />
        <h2 className={styles.title}>Coming Soon!</h2>
        <p className={styles.message}>
          Sorry for the inconvenience, this section is still under development or being updated.
        </p>
        <Link href="/" className={styles.button}>
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ConstructionOverlay;
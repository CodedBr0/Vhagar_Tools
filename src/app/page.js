'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

const tools = [
  { name: 'Vhagar Swap', description: 'Rapidly Swap tokens', icon: '/jupiter.png', link: '/swap' },
  { name: 'Vhagar-X Bot', description: 'Telegram trading bot for Solana', icon: '/vhagar-x-bot.png' },
  { name: 'Staking Dapp Creator', description: 'Staking Dapp Creation Tool', icon: '/mint.png', link: '/dapp-creator'  },
  { name: 'Token2022 Creation', description: 'Create a v2 Token with Extensions', icon: '/solana.png', link: '/token2022-creation' },
  { name: 'Legacy Token Creation', description: 'Create a v1 Token', icon: '/solana.png', link: '/legacy-token-creation' },
  { name: 'Token Manager', description: 'Manage Token authority and updates', icon: '/token-manager.png', link: '/token-manager' },
  { name: 'Metadata Manager', description: 'Update token Metadata', icon: '/metadata-manager.png' },
  { name: 'Token Burn', description: 'Burn Tokens', icon: '/token-burn.png' },
  { name: 'Token Mint', description: 'Mint more tokens for an existing token', icon: '/mint.png' },
];

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Vhagar Tools</h1>
      <div className={styles.grid}>
        {tools.map((tool, index) => (
          <Link href={tool.link || `/${tool.name.toLowerCase().replace(/\s+/g, '-')}`} key={index} className={styles.card}>
            <div className={styles.cardContent}>
              <div className={styles.iconWrapper}>
                <Image src={tool.icon} alt={tool.name} width={100} height={100} className={styles.icon} />
              </div>
              <h2 className={styles.cardTitle}>{tool.name}</h2>
              <p className={styles.cardDescription}>{tool.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
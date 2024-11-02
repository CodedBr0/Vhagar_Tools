// src/components/TokenMintContent.js
import React, { useState } from 'react';
import styles from './TokenMintContent.module.css';

const TokenMintContent = () => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [mintStatus, setMintStatus] = useState(null);

  const handleTokenAddressChange = (e) => {
    setTokenAddress(e.target.value);
  };

  const handleAmountChange = (e) => {
    setMintAmount(e.target.value);
  };

  const handleRecipientChange = (e) => {
    setRecipientAddress(e.target.value);
  };

  const handleMint = () => {
    // Placeholder function for minting tokens
    console.log(`Minting ${mintAmount} tokens to ${recipientAddress} for token: ${tokenAddress}`);
    // In a real implementation, you would call your API or blockchain here
    setMintStatus({ success: true, message: `Successfully minted ${mintAmount} tokens to ${recipientAddress}.` });
  };

  return (
    <div className={styles.mintContainer}>
      <div className={styles.inputSection}>
        <input
          type="text"
          value={tokenAddress}
          onChange={handleTokenAddressChange}
          placeholder="Enter token address"
          className={styles.input}
        />
        <input
          type="number"
          value={mintAmount}
          onChange={handleAmountChange}
          placeholder="Amount to mint"
          className={styles.input}
        />
        <input
          type="text"
          value={recipientAddress}
          onChange={handleRecipientChange}
          placeholder="Recipient address"
          className={styles.input}
        />
        <button onClick={handleMint} className={styles.mintButton}>
          Mint Tokens
        </button>
      </div>
      {mintStatus && (
        <div className={mintStatus.success ? styles.successMessage : styles.errorMessage}>
          {mintStatus.message}
        </div>
      )}
    </div>
  );
};

export default TokenMintContent;
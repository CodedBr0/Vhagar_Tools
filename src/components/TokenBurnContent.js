// src/components/TokenBurnContent.js
import React, { useState } from 'react';
import styles from './TokenBurnContent.module.css';

const TokenBurnContent = () => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [burnStatus, setBurnStatus] = useState(null);

  const handleAddressChange = (e) => {
    setTokenAddress(e.target.value);
  };

  const handleAmountChange = (e) => {
    setBurnAmount(e.target.value);
  };

  const handleBurn = () => {
    // Placeholder function for burning tokens
    console.log(`Burning ${burnAmount} tokens from address: ${tokenAddress}`);
    // In a real implementation, you would call your API or blockchain here
    setBurnStatus({ success: true, message: `Successfully burned ${burnAmount} tokens.` });
  };

  return (
    <div className={styles.burnContainer}>
      <div className={styles.inputSection}>
        <input
          type="text"
          value={tokenAddress}
          onChange={handleAddressChange}
          placeholder="Enter token address"
          className={styles.addressInput}
        />
        <input
          type="number"
          value={burnAmount}
          onChange={handleAmountChange}
          placeholder="Amount to burn"
          className={styles.amountInput}
        />
        <button onClick={handleBurn} className={styles.burnButton}>
          Burn Tokens
        </button>
      </div>
      {burnStatus && (
        <div className={burnStatus.success ? styles.successMessage : styles.errorMessage}>
          {burnStatus.message}
        </div>
      )}
    </div>
  );
};

export default TokenBurnContent;
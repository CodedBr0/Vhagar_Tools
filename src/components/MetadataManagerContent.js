// src/components/MetadataManagerContent.js
import React, { useState } from 'react';
import styles from './MetadataManagerContent.module.css';

const MetadataManagerContent = () => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [metadata, setMetadata] = useState(null);

  const handleAddressChange = (e) => {
    setTokenAddress(e.target.value);
  };

  const fetchMetadata = () => {
    // Placeholder function for fetching metadata
    console.log('Fetching metadata for:', tokenAddress);
    // In a real implementation, you would call your API or blockchain here
    setMetadata({
      name: 'Example Token',
      symbol: 'EXT',
      description: 'This is an example token metadata.',
      image: 'https://example.com/token-image.png'
    });
  };

  return (
    <div className={styles.managerContainer}>
      <div className={styles.inputSection}>
        <input
          type="text"
          value={tokenAddress}
          onChange={handleAddressChange}
          placeholder="Enter token address"
          className={styles.addressInput}
        />
        <button onClick={fetchMetadata} className={styles.fetchButton}>
          Fetch Metadata
        </button>
      </div>
      {metadata && (
        <div className={styles.metadataDisplay}>
          <h2>Token Metadata</h2>
          <p><strong>Name:</strong> {metadata.name}</p>
          <p><strong>Symbol:</strong> {metadata.symbol}</p>
          <p><strong>Description:</strong> {metadata.description}</p>
          <img src={metadata.image} alt={metadata.name} className={styles.tokenImage} />
        </div>
      )}
    </div>
  );
};

export default MetadataManagerContent;
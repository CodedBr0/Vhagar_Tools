// src/components/LegacyTokenCreator.js
import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import Image from 'next/image';
import styles from './LegacyTokenCreator.module.css';

const Switch = ({ isOn, handleToggle, name }) => {
  return (
    <label className={styles.switch}>
      <input
        checked={isOn}
        onChange={handleToggle}
        className={styles.switchCheckbox}
        id={`react-switch-${name}`}
        type="checkbox"
      />
      <span className={styles.switchSlider}></span>
    </label>
  );
};

const LegacyTokenCreator = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [network, setNetwork] = useState('devnet');
  const [tokenDetails, setTokenDetails] = useState({
    metadataUrl: '',
    supply: '',
    decimals: '',
  });

  const [otherSettings, setOtherSettings] = useState({
    revokeMintAuthority: false,
    revokeFreezeAuthority: false,
    revokeUpdateAuthority: false,
  });

  const [createdToken, setCreatedToken] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (tokenDetails.metadataUrl) {
      fetchMetadata(tokenDetails.metadataUrl);
    }
  }, [tokenDetails.metadataUrl]);

  const fetchMetadata = async (url) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      setMetadata(data);
      setImageError(false);
    } catch (error) {
      console.error('Error fetching metadata:', error);
      setMetadata(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTokenDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleOtherSettingsChange = (setting) => {
    setOtherSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const createToken = async () => {
    if (!publicKey) {
      alert('Please connect your wallet first.');
      return;
    }

    if (!metadata) {
      alert('Please enter a valid metadata URL and wait for it to load.');
      return;
    }

    setIsLoading(true);

    try {
      // Token creation logic would go here
      // This is a placeholder for the actual token creation process
      console.log('Creating token with:', { tokenDetails, otherSettings, metadata });
      
      // Simulate token creation
      await new Promise(resolve => setTimeout(resolve, 2000));

      setCreatedToken({
        tokenAddress: 'SIMULATED_TOKEN_ADDRESS',
        network: network,
        ...tokenDetails,
        ...metadata,
        ...otherSettings,
      });

      console.log('Token created successfully!');
    } catch (error) {
      console.error('Error creating token:', error);
      alert('Failed to create token. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h2 className={styles.heading2}>Token Details</h2>
        <div className={styles.networkSelector}>
          <label htmlFor="network">Network:</label>
          <select
            id="network"
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            className={`${styles.networkSelect} ${styles[network]}`}
          >
            <option value="devnet">Devnet</option>
            <option value="mainnet-beta">Mainnet</option>
          </select>
        </div>
        <input
          type="text"
          name="metadataUrl"
          placeholder="Metadata URL"
          value={tokenDetails.metadataUrl}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="supply"
          placeholder="Supply"
          value={tokenDetails.supply}
          onChange={handleInputChange}
        />
        <input
          type="number"
          name="decimals"
          placeholder="Decimals"
          value={tokenDetails.decimals}
          onChange={handleInputChange}
        />

        <h2 className={styles.heading2}>Other Settings</h2>
        <div className={styles.settingGroup}>
          <label className={styles.switchContainer}>
            <span className={styles.labelText}>Revoke Mint Authority</span>
            <Switch
              isOn={otherSettings.revokeMintAuthority}
              handleToggle={() => handleOtherSettingsChange('revokeMintAuthority')}
              name="revokeMintAuthority"
            />
          </label>
        </div>
        <div className={styles.settingGroup}>
          <label className={styles.switchContainer}>
            <span className={styles.labelText}>Revoke Freeze Authority</span>
            <Switch
              isOn={otherSettings.revokeFreezeAuthority}
              handleToggle={() => handleOtherSettingsChange('revokeFreezeAuthority')}
              name="revokeFreezeAuthority"
            />
          </label>
        </div>
        <div className={styles.settingGroup}>
          <label className={styles.switchContainer}>
            <span className={styles.labelText}>Revoke Update Authority</span>
            <Switch
              isOn={otherSettings.revokeUpdateAuthority}
              handleToggle={() => handleOtherSettingsChange('revokeUpdateAuthority')}
              name="revokeUpdateAuthority"
            />
          </label>
        </div>

        <button onClick={createToken} className={styles.createButton} disabled={isLoading}>
          {isLoading ? 'Creating Token...' : 'Create Token'}
        </button>
      </div>

      <div className={styles.previewContainer}>
        <h2 className={styles.heading2}>Preview</h2>
        {metadata && (
          <div className={styles.metadataPreview}>
            <h3>Metadata</h3>
            <p><strong>Name:</strong> {metadata.name}</p>
            <p><strong>Symbol:</strong> {metadata.symbol}</p>
            <p><strong>Description:</strong> {metadata.description || 'N/A'}</p>
            {metadata.image && !imageError ? (
              <div className={styles.imageContainer}>
                <Image 
                  src={metadata.image} 
                  alt="Token Image" 
                  width={200} 
                  height={200} 
                  onError={handleImageError}
                />
              </div>
            ) : (
              <p>No image available or failed to load</p>
            )}
            {metadata.extensions && (
              <div className={styles.metadataSection}>
                <h4>Extensions</h4>
                <p><strong>Website:</strong> {metadata.extensions.website || 'N/A'}</p>
                <p><strong>Twitter:</strong> {metadata.extensions.twitter || 'N/A'}</p>
                <p><strong>Telegram:</strong> {metadata.extensions.telegram || 'N/A'}</p>
                <p><strong>Discord:</strong> {metadata.extensions.discord || 'N/A'}</p>
              </div>
            )}
            {metadata.tags && (
              <div className={styles.metadataSection}>
                <h4>Tags</h4>
                <p>{metadata.tags.join(', ')}</p>
              </div>
            )}
            {metadata.creator && (
              <div className={styles.metadataSection}>
                <h4>Creator</h4>
                <p><strong>Name:</strong> {metadata.creator.name}</p>
                <p><strong>Site:</strong> {metadata.creator.site}</p>
              </div>
            )}
          </div>
        )}
        <div className={styles.tokenSetup}>
          <h3>Token Setup</h3>
          <p><strong>Network:</strong> {network}</p>
          <p><strong>Supply:</strong> {tokenDetails.supply}</p>
          <p><strong>Decimals:</strong> {tokenDetails.decimals}</p>
        </div>
        <div className={styles.otherSettingsPreview}>
          <h3>Other Settings</h3>
          <ul>
            {otherSettings.revokeMintAuthority && <li>Revoke Mint Authority</li>}
            {otherSettings.revokeFreezeAuthority && <li>Revoke Freeze Authority</li>}
            {otherSettings.revokeUpdateAuthority && <li>Revoke Update Authority</li>}
          </ul>
        </div>
      </div>

      {createdToken && (
        <div className={styles.createdTokenContainer}>
          <h2 className={styles.heading2}>Created Token Details</h2>
          <pre>{JSON.stringify(createdToken, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default LegacyTokenCreator;
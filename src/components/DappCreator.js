import React, { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Connection } from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@project-serum/anchor';
import { RPC_ENDPOINTS, STAKE_PROGRAM_IDS } from '@/constants';
import { useNetwork } from '@/components/NetworkContext';
import idl from '@/idl.json';
import styles from './DappCreator.module.css';
import { initializeLegacyStaking } from '@/utils/initializeLegacyStaking';
import { initializeToken2022Staking } from '@/utils/initializeToken2022Staking';

const DappCreator = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { network } = useNetwork();
  const [isToken2022, setIsToken2022] = useState(true);
  const [formData, setFormData] = useState({
    bronzeLockDuration: '',
    bronzeRewardPercentage: '',
    stakeTokenMint: '',
  });
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const networkConnection = new Connection(RPC_ENDPOINTS[network]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTokenTypeChange = (e) => {
    setIsToken2022(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!publicKey) {
      alert('Please connect your wallet first.');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const provider = new AnchorProvider(networkConnection, window.solana, { preflightCommitment: 'processed' });
      const programId = new PublicKey(STAKE_PROGRAM_IDS[network][isToken2022 ? 'token2022' : 'legacy']);
      const program = new Program(idl, programId, provider);

      const bronzeLockDuration = new BN(formData.bronzeLockDuration);
      const bronzeRewardPercentage = new BN(formData.bronzeRewardPercentage);
      const stakeTokenMint = new PublicKey(formData.stakeTokenMint);

      let initResult;
      if (isToken2022) {
        initResult = await initializeToken2022Staking(
          program,
          provider,
          bronzeLockDuration,
          bronzeRewardPercentage,
          stakeTokenMint
        );
      } else {
        initResult = await initializeLegacyStaking(
          program,
          provider,
          bronzeLockDuration,
          bronzeRewardPercentage,
          stakeTokenMint
        );
      }

      setResult({
        status: 'success',
        message: `${isToken2022 ? 'Token2022' : 'Legacy'} staking pool initialized successfully!`,
        details: {
          ...initResult,
          network: network,
          tokenType: isToken2022 ? 'Token2022' : 'Legacy',
        }
      });
    } catch (error) {
      console.error('Error initializing staking pool:', error);
      setResult({
        status: 'error',
        message: 'Failed to initialize staking pool. Please try again.',
        details: { error: error.message, network: network }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadDetails = () => {
    if (!result) return;
    const detailsText = Object.entries(result.details)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    const blob = new Blob([detailsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'staking_pool_details.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.switchContainer}>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={isToken2022}
                onChange={handleTokenTypeChange}
              />
              <span className={styles.slider}></span>
            </label>
            <span className={styles.switchLabel}>
              {isToken2022 ? 'Token2022' : 'Legacy Token'}
            </span>
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="bronzeLockDuration">Bronze Lock Duration (seconds)</label>
            <input
              type="number"
              id="bronzeLockDuration"
              name="bronzeLockDuration"
              value={formData.bronzeLockDuration}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="bronzeRewardPercentage">Bronze Reward Percentage</label>
            <input
              type="number"
              id="bronzeRewardPercentage"
              name="bronzeRewardPercentage"
              value={formData.bronzeRewardPercentage}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="stakeTokenMint">Stake Token Address</label>
            <input
              type="text"
              id="stakeTokenMint"
              name="stakeTokenMint"
              value={formData.stakeTokenMint}
              onChange={handleInputChange}
              required
            />
          </div>
          <p className={styles.feeText}>Fee: 3 Sol</p>
          <button type="submit" className={styles.submitButton} disabled={!publicKey || isLoading}>
            {isLoading ? 'Initializing...' : (publicKey ? 'Initialize Staking Pool' : 'Connect Wallet to Initialize')}
          </button>
        </form>
      </div>
      <div className={styles.previewContainer}>
        <h2 className={styles.previewTitle}>Preview</h2>
        {result ? (
          <div className={`${styles.previewContent} ${styles[result.status]}`}>
            <h3>{result.status === 'success' ? 'Success!' : 'Error'}</h3>
            <p>{result.message}</p>
            {result.details && (
              <div className={styles.detailsSection}>
                {Object.entries(result.details).map(([key, value]) => (
                  <p key={key} className={key === 'transaction' ? styles.transactionHash : ''}>
                    <strong>{key}:</strong>{' '}
                    {key === 'transaction' ? (
                      <a 
                        href={`https://explorer.solana.com/tx/${value}${network === 'devnet' ? '?cluster=devnet' : ''}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.transactionLink}
                      >
                        {value}
                      </a>
                    ) : (
                      value
                    )}
                  </p>
                ))}
              </div>
            )}
            {result.status === 'success' && (
              <div className={styles.buttonContainer}>
                <button className={styles.downloadButton} onClick={downloadDetails}>Download Details</button>
                <a 
                  href="https://docs.vhagar.finance/greenpaper/staking-dapp-deployer" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.setupButton}
                >
                  Setup Dapp
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.previewPlaceholder}>
            <p>Your staking pool details will appear here after initialization.</p>
            <div className={styles.placeholderDetails}>
              <p><strong>Network:</strong> <span className={styles.placeholderDetailsnorm}>{network}</span></p>
              <p><strong>Token Type:</strong> <span className={styles.placeholderDetailsnorm}>{isToken2022 ? 'Token2022' : 'Legacy'}</span></p>
              <p><strong>Bronze Lock Duration:</strong> <span className={styles.placeholderDetailsnorm}>{formData.bronzeLockDuration || 'Not set'}</span></p>
              <p><strong>Bronze Reward Percentage:</strong> <span className={styles.placeholderDetailsnorm}>{formData.bronzeRewardPercentage || 'Not set'}</span></p>
              <p><strong>Stake Token Address:</strong> <span className={styles.placeholderDetailsnorm}>{formData.stakeTokenMint || 'Not set'}</span></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DappCreator;
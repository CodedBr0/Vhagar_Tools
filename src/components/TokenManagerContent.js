import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, createSetAuthorityInstruction, AuthorityType } from '@solana/spl-token';
import { Metaplex } from "@metaplex-foundation/js";
import { debounce } from 'lodash';
import styles from './TokenManagerContent.module.css';

const RPC_ENDPOINTS = {
  'devnet': 'https://api.devnet.solana.com',
  'mainnet-beta': 'https://solana-mainnet.g.alchemy.com/v2/OvB71oLwrC6diGcnikOxh2f3Mta9dwOV'
};

const TokenManagerContent = () => {
  const { publicKey, sendTransaction } = useWallet();
  const [network, setNetwork] = useState('mainnet-beta');
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenDetails, setTokenDetails] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newAuthorityAddress, setNewAuthorityAddress] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleNetworkChange = (e) => {
    setNetwork(e.target.value);
    clearForm();
  };

  const validateTokenAddress = (address) => {
    try {
      new PublicKey(address);
      return true;
    } catch (error) {
      setError('Invalid token address');
      return false;
    }
  };

  const handleAddressChange = (e) => {
    const address = e.target.value;
    setTokenAddress(address);
    if (address && !validateTokenAddress(address)) {
      setError('Invalid token address');
    } else {
      setError(null);
    }
  };

  const clearForm = () => {
    setTokenAddress('');
    setTokenDetails(null);
    setMetadata(null);
    setError(null);
    setSuccessMessage('');
    setNewAuthorityAddress('');
  };

  const fetchTokenDetails = async () => {
    setError(null);
    setTokenDetails(null);
    setMetadata(null);
    setIsLoading(true);
    setSuccessMessage('');

    try {
      const mintPublicKey = new PublicKey(tokenAddress);
      const connectionConfig = {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000,
      };
      const conn = new Connection(RPC_ENDPOINTS[network], connectionConfig);

      const accountInfo = await conn.getAccountInfo(mintPublicKey);
      if (!accountInfo) {
        throw new Error('Token not found');
      }

      const programId = accountInfo.owner.toString();
      const tokenType = programId === TOKEN_PROGRAM_ID.toString() ? 'Legacy Token' : 'Token 2022';

      const mintInfo = await conn.getParsedAccountInfo(mintPublicKey);
      const tokenInfo = mintInfo.value.data.parsed.info;

      const metaplex = new Metaplex(conn);
      let metadata;
      try {
        const nft = await metaplex.nfts().findByMint({ mintAddress: mintPublicKey });
        metadata = nft.json;
      } catch (metaplexError) {
        console.error("Error fetching metadata:", metaplexError);
        metadata = null;
      }

      const tokenDetails = {
        mintAddress: tokenAddress,
        programId: programId,
        tokenType: tokenType,
        decimals: tokenInfo.decimals,
        supply: (Number(tokenInfo.supply) / Math.pow(10, tokenInfo.decimals)).toLocaleString(),
        mintAuthority: tokenInfo.mintAuthority || 'Not set',
        freezeAuthority: tokenInfo.freezeAuthority || 'Not set',
        closeAuthority: tokenInfo.closeAuthority || 'Not set (Token 2022 only)',
        metadataPointerAuthority: tokenInfo.metadataPointerAuthority || 'Not set',
        metadataUpdateAuthority: metadata ? metadata.update_authority : 'Not set',
      };

      setTokenDetails(tokenDetails);
      setMetadata(metadata);

      console.log("Token details:", tokenDetails);
      console.log("Metadata:", metadata);

    } catch (err) {
      console.error('Error fetching token details:', err);
      setError('Unable to fetch token details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetchTokenDetails = useCallback(
    debounce(fetchTokenDetails, 300),
    [network, tokenAddress]
  );

  useEffect(() => {
    if (tokenAddress && validateTokenAddress(tokenAddress)) {
      debouncedFetchTokenDetails();
    }
  }, [tokenAddress, network]);

  const updateTokenAuthority = async (authorityType, action) => {
    if (!publicKey) {
      setError('Please connect your wallet first.');
      return;
    }

    setIsUpdating(true);
    setError(null);
    setSuccessMessage('');

    try {
      const mintPublicKey = new PublicKey(tokenAddress);
      const newAuthority = action === 'update' ? new PublicKey(newAuthorityAddress) : null;
      const conn = new Connection(RPC_ENDPOINTS[network], 'confirmed');

      if (authorityType === 'updateAuthority') {
        const metaplex = new Metaplex(conn);
        const nft = await metaplex.nfts().findByMint({ mintAddress: mintPublicKey });

        if (!nft) {
          throw new Error('No metadata found for this token.');
        }

        console.log("Current update authority:", nft.updateAuthorityAddress.toString());
        console.log("Connected wallet:", publicKey.toString());

        if (nft.updateAuthorityAddress.toString() !== publicKey.toString()) {
          throw new Error('Connected wallet is not the current update authority.');
        }

        const { response } = await metaplex.nfts().update({
          nftOrSft: nft,
          newUpdateAuthority: newAuthority,
        });

        await conn.confirmTransaction(response.signature, 'confirmed');

        setMetadata(prevMetadata => ({
          ...prevMetadata,
          update_authority: action === 'update' ? newAuthorityAddress : 'Not set',
        }));

        setSuccessMessage(`Successfully ${action === 'update' ? 'updated' : 'revoked'} metadata update authority.`);
      } else {
        let authorityTypeEnum;
        switch (authorityType) {
          case 'mintAuthority':
            authorityTypeEnum = AuthorityType.MintTokens;
            break;
          case 'freezeAuthority':
            authorityTypeEnum = AuthorityType.FreezeAccount;
            break;
          case 'metadataPointerAuthority':
            authorityTypeEnum = AuthorityType.MetadataPointer;
            break;
          default:
            throw new Error('Invalid authority type');
        }

        const instruction = createSetAuthorityInstruction(
          mintPublicKey,
          publicKey,
          authorityTypeEnum,
          newAuthority,
          [],
          tokenDetails.tokenType === 'Token 2022' ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID
        );

        const transaction = new Transaction().add(instruction);
        const signature = await sendTransaction(transaction, conn);
        await conn.confirmTransaction(signature, 'confirmed');

        setTokenDetails(prevDetails => ({
          ...prevDetails,
          [authorityType]: action === 'update' ? newAuthorityAddress : 'Not set',
        }));

        setSuccessMessage(`Successfully ${action === 'update' ? 'updated' : 'revoked'} ${authorityType}.`);
      }
    } catch (err) {
      console.error('Error updating authority:', err);
      setError(`Error updating authority: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const isAuthorityOwner = (authorityAddress) => {
    if (!publicKey || !authorityAddress) return false;
    const connectedAddress = publicKey.toString();
    console.log(`Comparing: connected=${connectedAddress}, authority=${authorityAddress}`);
    return connectedAddress === authorityAddress;
  };

  return (
    <div className={styles.managerContainer}>
      <div className={styles.inputSection}>
        <select
          value={network}
          onChange={handleNetworkChange}
          className={styles.networkSelect}
        >
          <option value="mainnet-beta">Mainnet</option>
          <option value="devnet">Devnet</option>
        </select>

        <input
          type="text"
          value={tokenAddress}
          onChange={handleAddressChange}
          placeholder="Enter token address"
          className={styles.addressInput}
        />

        <button 
          onClick={fetchTokenDetails} 
          className={styles.fetchButton}
          disabled={isLoading || isUpdating || !tokenAddress || !validateTokenAddress(tokenAddress)}
        >
          {isLoading ? 'Fetching...' : 'Fetch Token Details'}
        </button>

        <button 
          onClick={clearForm} 
          className={styles.clearButton}
          disabled={isLoading || isUpdating}
        >
          Clear Form
        </button>
      </div>

      {isLoading && <div className={styles.loading}>Loading token details... This may take a moment.</div>}
      {isUpdating && <div className={styles.loading}>Updating authority... Please wait.</div>}
      {error && <div className={styles.error}>{error}</div>}
      {successMessage && <div className={styles.success}>{successMessage}</div>}

      {tokenDetails && (
        <div className={styles.detailsContainer}>
          <h2 className={styles.sectionTitle}>Token Details</h2>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <strong>Mint Address:</strong> <span>{tokenDetails.mintAddress}</span>
            </div>
            <div className={styles.detailItem}>
              <strong>Program ID:</strong> <span>{tokenDetails.programId}</span>
            </div>
            <div className={styles.detailItem}>
              <strong>Token Type:</strong> <span>{tokenDetails.tokenType}</span>
            </div>
            <div className={styles.detailItem}>
              <strong>Decimals:</strong> <span>{tokenDetails.decimals}</span>
            </div>
            <div className={styles.detailItem}>
              <strong>Supply:</strong> <span>{tokenDetails.supply}</span>
            </div>
            <div className={styles.detailItem}>
              <strong>Mint Authority:</strong> <span>{tokenDetails.mintAuthority}</span>
            </div>
            <div className={styles.detailItem}>
              <strong>Freeze Authority:</strong> <span>{tokenDetails.freezeAuthority}</span>
            </div>
            {tokenDetails.tokenType === 'Token 2022' && (
              <div className={styles.detailItem}>
                <strong>Close Authority:</strong> <span>{tokenDetails.closeAuthority}</span>
              </div>
            )}
            <div className={styles.detailItem}>
              <strong>Metadata Pointer Authority:</strong> <span>{tokenDetails.metadataPointerAuthority}</span>
            </div>
            <div className={styles.detailItem}>
              <strong>Metadata Update Authority:</strong> <span>{tokenDetails.metadataUpdateAuthority}</span>
            </div>
          </div>
        </div>
      )}

      {metadata && (
        <div className={styles.metadataContainer}>
          <h3 className={styles.sectionTitle}>Token Metadata</h3>
          <div className={styles.metadataGrid}>
            <div className={styles.metadataItem}>
              <strong>Name:</strong> <span>{metadata.name}</span>
            </div>
            <div className={styles.metadataItem}>
              <strong>Symbol:</strong> <span>{metadata.symbol}</span>
            </div>
            <div className={styles.metadataItem}>
              <strong>Description:</strong> <span>{metadata.description || 'N/A'}</span>
            </div>
            {metadata.external_url && (
              <div className={styles.metadataItem}>
                <strong>External URL:</strong> <a href={metadata.external_url} target="_blank" rel="noopener noreferrer">{metadata.external_url}</a>
              </div>
            )}
          </div>
          {metadata.image && (
            <div className={styles.imageContainer}>
              <img src={metadata.image} alt={metadata.name} className={styles.tokenImage} />
            </div>
          )}
        </div>
      )}

      {tokenDetails && (
        <div className={styles.authorityUpdateSection}>
          <h2 className={styles.sectionTitle}>Update Authorities</h2>
          <div className={styles.authorityGrid}>
            <div className={styles.authorityItem}>
              <strong>Mint Authority</strong>
              <input
                type="text"
                placeholder="New authority address"
                className={styles.authorityInput}
                disabled={!isAuthorityOwner(tokenDetails.mintAuthority) || isUpdating}
                onChange={(e) => setNewAuthorityAddress(e.target.value)}
              />
              <button
                className={styles.updateButton}
                disabled={!isAuthorityOwner(tokenDetails.mintAuthority) || isUpdating}
                onClick={() => updateTokenAuthority('mintAuthority', 'update')}
              >
                Update
              </button>
              <button
                className={styles.revokeButton}
                disabled={!isAuthorityOwner(tokenDetails.mintAuthority) || isUpdating}
                onClick={() => updateTokenAuthority('mintAuthority', 'revoke')}
              >
                Revoke
              </button>
            </div>
            <div className={styles.authorityItem}>
              <strong>Freeze Authority</strong>
              <input
                type="text"
                placeholder="New authority address"
                className={styles.authorityInput}
                disabled={!isAuthorityOwner(tokenDetails.freezeAuthority) || isUpdating}
                onChange={(e) => setNewAuthorityAddress(e.target.value)}
              />
              <button
                className={styles.updateButton}
                disabled={!isAuthorityOwner(tokenDetails.freezeAuthority) || isUpdating}
                onClick={() => updateTokenAuthority('freezeAuthority', 'update')}
              >
                Update
              </button>
              <button
                className={styles.revokeButton}
                disabled={!isAuthorityOwner(tokenDetails.freezeAuthority) || isUpdating}
                onClick={() => updateTokenAuthority('freezeAuthority', 'revoke')}
              >
                Revoke
              </button>
            </div>
            <div className={styles.authorityItem}>
              <strong>Metadata Update Authority</strong>
              <input
                type="text"
                placeholder="New authority address"
                className={styles.authorityInput}
                disabled={!isAuthorityOwner(tokenDetails.metadataUpdateAuthority) || isUpdating}
                onChange={(e) => setNewAuthorityAddress(e.target.value)}
              />
              <button
                className={styles.updateButton}
                disabled={!isAuthorityOwner(tokenDetails.metadataUpdateAuthority) || isUpdating}
                onClick={() => updateTokenAuthority('updateAuthority', 'update')}
              >
                Update
              </button>
              <button
                className={styles.revokeButton}
                disabled={!isAuthorityOwner(tokenDetails.metadataUpdateAuthority) || isUpdating}
                onClick={() => updateTokenAuthority('updateAuthority', 'revoke')}
              >
                Revoke
              </button>
            </div>
            {tokenDetails.tokenType === 'Token 2022' && (
              <div className={styles.authorityItem}>
                <strong>Metadata Pointer Authority</strong>
                <input
                  type="text"
                  placeholder="New authority address"
                  className={styles.authorityInput}
                  disabled={!isAuthorityOwner(tokenDetails.metadataPointerAuthority) || isUpdating}
                  onChange={(e) => setNewAuthorityAddress(e.target.value)}
                />
                <button
                  className={styles.updateButton}
                  disabled={!isAuthorityOwner(tokenDetails.metadataPointerAuthority) || isUpdating}
                  onClick={() => updateTokenAuthority('metadataPointerAuthority', 'update')}
                >
                  Update
                </button>
                <button
                  className={styles.revokeButton}
                  disabled={!isAuthorityOwner(tokenDetails.metadataPointerAuthority) || isUpdating}
                  onClick={() => updateTokenAuthority('metadataPointerAuthority', 'revoke')}
                >
                  Revoke
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenManagerContent;
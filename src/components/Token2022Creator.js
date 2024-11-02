import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
    PublicKey,
    Transaction,
    SystemProgram,
    Keypair,
    Connection
} from '@solana/web3.js';
import {
    TOKEN_2022_PROGRAM_ID,
    ExtensionType,
    createInitializeMintInstruction,
    getMintLen,
    createInitializeTransferFeeConfigInstruction,
    createInitializeDefaultAccountStateInstruction,
    createInitializePermanentDelegateInstruction,
    createInitializeNonTransferableMintInstruction,
    createInitializeInterestBearingConfigInstruction,
    createInitializeMetadataPointerInstruction,
    AccountState,
} from '@solana/spl-token';
import {
    createInitializeInstruction,
    TokenMetadata,
} from '@solana/spl-token-metadata';
import Image from 'next/image';
import styles from './Token2022Creator.module.css';
import TokenDetailsPopup from './TokenDetailsPopup';

const RPC_ENDPOINTS = {
    'devnet': 'https://api.devnet.solana.com',
    'mainnet-beta': 'https://solana-mainnet.g.alchemy.com/v2/OvB71oLwrC6diGcnikOxh2f3Mta9dwOV'
};

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

const Token2022Creator = () => {
    const { publicKey, sendTransaction } = useWallet();
    const [network, setNetwork] = useState('devnet');
    const [tokenDetails, setTokenDetails] = useState({
        name: '',
        symbol: '',
        decimals: '',
        supply: '',
        metadataUrl: '',
    });

    const [extensions, setExtensions] = useState({
        transferFee: {
            enabled: false,
            feeBasisPoints: '',
            maxFee: '',
        },
        defaultAccountState: {
            enabled: false,
            state: 'initialized',
        },
        permanentDelegate: {
            enabled: false,
            delegateAddress: '',
        },
        nonTransferable: false,
        interestBearing: {
            enabled: false,
            rate: '',
        },
    });

    const [createdToken, setCreatedToken] = useState(null);
    const [metadata, setMetadata] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showNetworkWarning, setShowNetworkWarning] = useState(false);
    const [pendingNetwork, setPendingNetwork] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [transactionHash, setTransactionHash] = useState('');

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

    const handleExtensionChange = (e) => {
        const { name, value, type, checked } = e.target;
        setExtensions(prev => {
            if (type === 'checkbox') {
                if (name.includes('.')) {
                    const [parent, child] = name.split('.');
                    return { ...prev, [parent]: { ...prev[parent], [child]: checked } };
                }
                return { ...prev, [name]: checked };
            } else if (name.includes('.')) {
                const [parent, child] = name.split('.');
                return { ...prev, [parent]: { ...prev[parent], [child]: value } };
            } else {
                return { ...prev, [name]: value };
            }
        });
    };

    const handleImageError = () => {
        setImageError(true);
    };

    const handleNetworkChange = (e) => {
        const newNetwork = e.target.value;
        if (hasUserInput()) {
            setShowNetworkWarning(true);
            setPendingNetwork(newNetwork);
        } else {
            setNetwork(newNetwork);
            // Reset the connection with the new network
            const connection = new Connection(RPC_ENDPOINTS[newNetwork], 'confirmed');
            // You might want to update any other network-dependent state here
        }
    };

    const confirmNetworkChange = () => {
        setNetwork(pendingNetwork);
        setShowNetworkWarning(false);
        // Reset the connection with the new network
        const connection = new Connection(RPC_ENDPOINTS[pendingNetwork], 'confirmed');
        // You might want to update any other network-dependent state here
        resetForm();
    };

    const cancelNetworkChange = () => {
        setShowNetworkWarning(false);
        setPendingNetwork(null);
    };

    const resetForm = () => {
        setTokenDetails({
            name: '',
            symbol: '',
            decimals: '',
            supply: '',
            metadataUrl: '',
        });
        setExtensions({
            transferFee: {
                enabled: false,
                feeBasisPoints: '',
                maxFee: '',
            },
            defaultAccountState: {
                enabled: false,
                state: 'initialized',
            },
            permanentDelegate: {
                enabled: false,
                delegateAddress: '',
            },
            nonTransferable: false,
            interestBearing: {
                enabled: false,
                rate: '',
            },
        });
        setMetadata(null);
        setCreatedToken(null);
    };

    const hasUserInput = () => {
        return Object.values(tokenDetails).some(value => value !== '') ||
               Object.values(extensions).some(ext => 
                 typeof ext === 'object' ? ext.enabled : ext
               );
    };

    const createToken = async () => {
        if (!publicKey) {
            alert('Please connect your wallet first.');
            return;
        }

        setIsLoading(true);

        try {
            const mintKeypair = Keypair.generate();
            const mint = mintKeypair.publicKey;
            const decimals = parseInt(tokenDetails.decimals);
            const supply = parseFloat(tokenDetails.supply);

            // Use the correct RPC endpoint based on the selected network
            const connection = new Connection(RPC_ENDPOINTS[network], 'confirmed');

            let extensionTypes = [];
            if (extensions.transferFee.enabled) extensionTypes.push(ExtensionType.TransferFeeConfig);
            if (extensions.defaultAccountState.enabled) extensionTypes.push(ExtensionType.DefaultAccountState);
            if (extensions.permanentDelegate.enabled) extensionTypes.push(ExtensionType.PermanentDelegate);
            if (extensions.nonTransferable) extensionTypes.push(ExtensionType.NonTransferable);
            if (extensions.interestBearing.enabled) extensionTypes.push(ExtensionType.InterestBearingConfig);

            const mintLen = getMintLen(extensionTypes);
            const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

            const metadataLen = 500; // Estimate, adjust as needed
            const totalLen = mintLen + metadataLen;
            const totalLamports = await connection.getMinimumBalanceForRentExemption(totalLen);

            const transaction = new Transaction();

            transaction.add(
                SystemProgram.createAccount({
                    fromPubkey: publicKey,
                    newAccountPubkey: mint,
                    space: totalLen,
                    lamports: totalLamports,
                    programId: TOKEN_2022_PROGRAM_ID,
                })
            );

            if (extensions.transferFee.enabled) {
                transaction.add(
                    createInitializeTransferFeeConfigInstruction(
                        mint,
                        publicKey,
                        publicKey,
                        parseInt(extensions.transferFee.feeBasisPoints),
                        BigInt(parseFloat(extensions.transferFee.maxFee) * Math.pow(10, decimals)),
                        TOKEN_2022_PROGRAM_ID
                    )
                );
            }

            if (extensions.defaultAccountState.enabled) {
                const stateMap = { uninitialized: AccountState.Uninitialized, initialized: AccountState.Initialized, frozen: AccountState.Frozen };
                transaction.add(
                    createInitializeDefaultAccountStateInstruction(
                        mint,
                        publicKey,
                        stateMap[extensions.defaultAccountState.state],
                        TOKEN_2022_PROGRAM_ID
                    )
                );
            }

            if (extensions.permanentDelegate.enabled) {
                transaction.add(
                    createInitializePermanentDelegateInstruction(
                        mint,
                        publicKey,
                        new PublicKey(extensions.permanentDelegate.delegateAddress),
                        TOKEN_2022_PROGRAM_ID
                    )
                );
            }

            if (extensions.nonTransferable) {
                transaction.add(
                    createInitializeNonTransferableMintInstruction(
                        mint,
                        publicKey,
                        TOKEN_2022_PROGRAM_ID
                    )
                );
            }

            if (extensions.interestBearing.enabled) {
                transaction.add(
                    createInitializeInterestBearingConfigInstruction(
                        mint,
                        publicKey,
                        publicKey,
                        parseInt(extensions.interestBearing.rate),
                        TOKEN_2022_PROGRAM_ID
                    )
                );
            }

            transaction.add(
                createInitializeMetadataPointerInstruction(
                    mint,
                    publicKey,
                    mint,
                    TOKEN_2022_PROGRAM_ID
                )
            );

            transaction.add(
                createInitializeMintInstruction(
                    mint,
                    decimals,
                    publicKey,
                    publicKey,
                    TOKEN_2022_PROGRAM_ID
                )
            );

            const metaData = {
                name: tokenDetails.name,
                symbol: tokenDetails.symbol,
                uri: tokenDetails.metadataUrl,
            };

            transaction.add(
                createInitializeInstruction({
                    programId: TOKEN_2022_PROGRAM_ID,
                    metadata: mint,
                    updateAuthority: publicKey,
                    mint: mint,
                    mintAuthority: publicKey,
                    name: metaData.name,
                    symbol: metaData.symbol,
                    uri: metaData.uri,
                })
            );

            const signature = await sendTransaction(transaction, connection, {
                signers: [mintKeypair],
            });

            await connection.confirmTransaction(signature, 'confirmed');

            const createdTokenDetails = {
                tokenAddress: mint.toBase58(),
                network: network,
                ...tokenDetails,
                ...metadata,
                ...extensions,
            };

            setCreatedToken(createdTokenDetails);
            setTransactionHash(signature);
            setShowPopup(true);

            console.log('Token created successfully!', mint.toBase58());
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
                        onChange={handleNetworkChange}
                        className={`${styles.networkSelect} ${styles[network]}`}
                    >
                        <option value="devnet">Devnet</option>
                        <option value="mainnet-beta">Mainnet</option>
                    </select>
                </div>
                {showNetworkWarning && (
                    <div className={styles.warningDialog}>
                        <p>Changing the network will reset your form. Are you sure you want to proceed?</p>
                        <button onClick={confirmNetworkChange}>Yes</button>
                        <button onClick={cancelNetworkChange}>No</button>
                    </div>
                )}
                <input
                    type="text"
                    name="name"
                    placeholder="Token Name"
                    value={tokenDetails.name}
                    onChange={handleInputChange}
                />
                <input
                    type="text"
                    name="symbol"
                    placeholder="Token Symbol"
                    value={tokenDetails.symbol}
                    onChange={handleInputChange}
                />
                <input
                    type="number"
                    name="decimals"
                    placeholder="Decimals"
                    value={tokenDetails.decimals}
                    onChange={handleInputChange}
                />
                <input
                    type="number"
                    name="supply"
                    placeholder="Initial Supply"
                    value={tokenDetails.supply}
                    onChange={handleInputChange}
                />
                <input
                    type="text"
                    name="metadataUrl"
                    placeholder="Metadata URL"
                    value={tokenDetails.metadataUrl}
                    onChange={handleInputChange}
                />

                <h2 className={styles.heading2}>Extensions</h2>
                <div className={styles.extensionGroup}>
                    <label className={styles.switchContainer}>
                        <span className={styles.labelText}>Enable Transfer Fee</span>
                        <Switch
                            isOn={extensions.transferFee.enabled}
                            handleToggle={() => handleExtensionChange({ target: { name: 'transferFee.enabled', type: 'checkbox', checked: !extensions.transferFee.enabled } })}
                            name="transferFee"
                        />
                    </label>
                    {extensions.transferFee.enabled && (
                        <div className={styles.extensionInputs}>
                            <input
                                type="number"
                                name="transferFee.feeBasisPoints"
                                placeholder="Fee Basis Points"
                                value={extensions.transferFee.feeBasisPoints}
                                onChange={handleExtensionChange}
                            />
                            <input
                                type="number"
                                name="transferFee.maxFee"
                                placeholder="Max Fee"
                                value={extensions.transferFee.maxFee}
                                onChange={handleExtensionChange}
                            />
                        </div>
                    )}
                </div>

                <div className={styles.extensionGroup}>
                    <label className={styles.switchContainer}>
                        <span className={styles.labelText}>Enable Default Account State</span>
                        <Switch
                            isOn={extensions.defaultAccountState.enabled}
                            handleToggle={() => handleExtensionChange({ target: { name: 'defaultAccountState.enabled', type: 'checkbox', checked: !extensions.defaultAccountState.enabled } })}
                            name="defaultAccountState"
                        />
                    </label>
                    {extensions.defaultAccountState.enabled && (
                        <div className={styles.extensionInputs}>
                            <select
                                name="defaultAccountState.state"
                                value={extensions.defaultAccountState.state}
                                onChange={handleExtensionChange}
                            >
                                <option value="uninitialized">Uninitialized</option>
                                <option value="initialized">Initialized</option>
                                <option value="frozen">Frozen</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className={styles.extensionGroup}>
                    <label className={styles.switchContainer}>
                        <span className={styles.labelText}>Enable Permanent Delegate</span>
                        <Switch
                            isOn={extensions.permanentDelegate.enabled}
                            handleToggle={() => handleExtensionChange({ target: { name: 'permanentDelegate.enabled', type: 'checkbox', checked: !extensions.permanentDelegate.enabled } })}
                            name="permanentDelegate"
                        />
                    </label>
                    {extensions.permanentDelegate.enabled && (
                        <div className={styles.extensionInputs}>
                            <input
                                type="text"
                                name="permanentDelegate.delegateAddress"
                                placeholder="Delegate Address"
                                value={extensions.permanentDelegate.delegateAddress}
                                onChange={handleExtensionChange}
                            />
                        </div>
                    )}
                </div>

                <div className={styles.extensionGroup}>
                    <label className={styles.switchContainer}>
                        <span className={styles.labelText}>Non-Transferable</span>
                        <Switch
                            isOn={extensions.nonTransferable}
                            handleToggle={() => handleExtensionChange({ target: { name: 'nonTransferable', type: 'checkbox', checked: !extensions.nonTransferable } })}
                            name="nonTransferable"
                        />
                    </label>
                </div>

                <div className={styles.extensionGroup}>
                    <label className={styles.switchContainer}>
                        <span className={styles.labelText}>Interest Bearing</span>
                        <Switch
                            isOn={extensions.interestBearing.enabled}
                            handleToggle={() => handleExtensionChange({ target: { name: 'interestBearing.enabled', type: 'checkbox', checked: !extensions.interestBearing.enabled } })}
                            name="interestBearing"
                        />
                    </label>
                    {extensions.interestBearing.enabled && (
                        <div className={styles.extensionInputs}>
                            <input
                                type="number"
                                name="interestBearing.rate"
                                placeholder="Interest Rate (basis points)"
                                value={extensions.interestBearing.rate}
                                onChange={handleExtensionChange}
                            />
                        </div>
                    )}
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
                    </div>
                )}
                <div className={styles.tokenSetup}>
                    <h3>Token Setup</h3>
                    <p><strong>Network:</strong> {network}</p>
                    <p><strong>Name:</strong> {tokenDetails.name}</p>
                    <p><strong>Symbol:</strong> {tokenDetails.symbol}</p>
                    <p><strong>Decimals:</strong> {tokenDetails.decimals}</p>
                    <p><strong>Supply:</strong> {tokenDetails.supply}</p>
                </div>
                <div className={styles.extensionsPreview}>
                    <h3>Extensions</h3>
                    <ul>
                        {extensions.transferFee.enabled && (
                            <li>
                                Transfer Fee: {extensions.transferFee.feeBasisPoints} basis points
                                (Max: {extensions.transferFee.maxFee})
                            </li>
                        )}
                        {extensions.defaultAccountState.enabled && (
                            <li>Default Account State: {extensions.defaultAccountState.state}</li>
                        )}
                        {extensions.permanentDelegate.enabled && (
                            <li>Permanent Delegate: {extensions.permanentDelegate.delegateAddress}</li>
                        )}
                        {extensions.nonTransferable && <li>Non-Transferable</li>}
                        {extensions.interestBearing.enabled && (
                            <li>Interest Bearing: {extensions.interestBearing.rate} basis points</li>
                        )}
                    </ul>
                </div>
            </div>

            {showPopup && createdToken && (
                <TokenDetailsPopup
                    token={createdToken}
                    onClose={() => setShowPopup(false)}
                    transactionHash={transactionHash}
                />
            )}
        </div>
    );
};

export default Token2022Creator;
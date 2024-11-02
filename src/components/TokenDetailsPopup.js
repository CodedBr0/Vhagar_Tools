import React from 'react';
import styles from './TokenDetailsPopup.module.css';

const TokenDetailsPopup = ({ token, onClose, transactionHash }) => {
    return (
        <div className={styles.overlay}>
            <div className={styles.popup}>
                <h2 className={styles.title}>Created Token Details</h2>
                <div className={styles.content}>
                    <p><strong>Token Address:</strong> {token.tokenAddress}</p>
                    <p><strong>Network:</strong> {token.network}</p>
                    <p><strong>Name:</strong> {token.name}</p>
                    <p><strong>Symbol:</strong> {token.symbol}</p>
                    <p><strong>Decimals:</strong> {token.decimals}</p>
                    <p><strong>Supply:</strong> {token.supply}</p>
                    <p><strong>Transaction Hash:</strong> {transactionHash}</p>
                    <h3>Extensions:</h3>
                    <ul>
                        {token.transferFee.enabled && (
                            <li>Transfer Fee: {token.transferFee.feeBasisPoints} basis points (Max: {token.transferFee.maxFee})</li>
                        )}
                        {token.defaultAccountState.enabled && (
                            <li>Default Account State: {token.defaultAccountState.state}</li>
                        )}
                        {token.permanentDelegate.enabled && (
                            <li>Permanent Delegate: {token.permanentDelegate.delegateAddress}</li>
                        )}
                        {token.nonTransferable && <li>Non-Transferable</li>}
                        {token.interestBearing.enabled && (
                            <li>Interest Bearing: {token.interestBearing.rate} basis points</li>
                        )}
                    </ul>
                </div>
                <button className={styles.closeButton} onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default TokenDetailsPopup;
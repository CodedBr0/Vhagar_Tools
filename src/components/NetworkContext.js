'use client';

import React, { createContext, useState, useContext } from 'react';
import { DEFAULT_NETWORK } from '../constants';

const NetworkContext = createContext();

export const NetworkProvider = ({ children }) => {
  const [network, setNetwork] = useState(DEFAULT_NETWORK);

  return (
    <NetworkContext.Provider value={{ network, setNetwork }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);
// src/context/walletContext.jsx
import React, { createContext, useState } from 'react';
import { ethers } from 'ethers';

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [network, setNetwork] = useState(null);
  const [portfolio, setPortfolio] = useState(null);

  // Function to fetch token balances using Covalent API
  const fetchPortfolio = async (address) => {
    // Replace with your actual Covalent API key
    const API_KEY = 'YOUR_COVALENT_API_KEY';
    const chainId = 1; // Ethereum mainnet (change if needed)
    const url = `https://api.covalenthq.com/v1/${chainId}/address/${address}/balances_v2/?key=${API_KEY}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.data) {
        // data.data.items is an array of token balances
        setPortfolio(data.data.items);
      }
    } catch (err) {
      console.error("Error fetching portfolio data:", err);
    }
  };

  // Connect wallet and fetch ETH balance, network, and portfolio data
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request wallet connection
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const selectedAccount = accounts[0];
        setAccount(selectedAccount);

        // Create an ethers provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        // Fetch ETH balance and format to 4 decimals
        const bal = await provider.getBalance(selectedAccount);
        setBalance(parseFloat(ethers.utils.formatEther(bal)).toFixed(4));

        // Fetch network details
        const net = await provider.getNetwork();
        setNetwork(net.name);

        // Fetch portfolio (token balances) for the connected address
        fetchPortfolio(selectedAccount);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("MetaMask is not installed. Please install MetaMask to use this feature.");
    }
  };

  return (
    <WalletContext.Provider
      value={{ account, balance, network, connectWallet, portfolio }}
    >
      {children}
    </WalletContext.Provider>
  );
};

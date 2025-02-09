import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Coin.css';

const Coin = () => {
  const walletid = localStorage.getItem('walletId');
  const { coinId } = useParams();
  const [coin, setCoin] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('candlestick');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [account, setAccount] = useState(null);
  const currency = 'usd';

  // Chart dimensions for the SVG
  const chartWidth = 800;
  const chartHeight = 400;
  const chartPadding = 60;

  // ---------------------------
  // Utility & Fetch Functions
  // ---------------------------

  // Delay function for retries and smoother UI transitions


  // fetching wallet id from local storage
  
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // A fetch function with retry logic (useful when hitting rate limits)
  const fetchWithRetry = async (url, options = {}, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After') || 60;
          await delay(retryAfter * 1000);
          continue;
        }
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
      } catch (err) {
        if (i === retries - 1) throw err;
        await delay(1000);
      }
    }
  };

  // Fetch coin details from CoinGecko
  const fetchCoin = async (id) => {
    const url = `https://api.coingecko.com/api/v3/coins/${id}`;
    return await fetchWithRetry(url);
  };

  // Fetch OHLC historical data (7 days) and format it
  const fetchHistory = async (id) => {
    const url = `https://api.coingecko.com/api/v3/coins/${id}/ohlc?vs_currency=${currency}&days=7`;
    const data = await fetchWithRetry(url);
    if (data && data.length > 0) {
      return data.map(([timestamp, open, high, low, close]) => ({
        date: new Date(timestamp).toLocaleDateString(),
        timestamp,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2))
      }));
    } else {
      throw new Error("No price data available");
    }
  };

  // Load coin and history data
  const loadData = async () => {
    if (!coinId) {
      setError("No coin ID provided");
      setLoading(false);
      return;
    }
    const normalizedCoinId = coinId.toLowerCase().trim();
    setLoading(true);
    setError(null);
    try {
      const coinData = await fetchCoin(normalizedCoinId);
      setCoin(coinData);
      await delay(500); // Brief pause for smoother UI transitions
      const historyData = await fetchHistory(normalizedCoinId);
      setHistory(historyData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // MetaMask & Trading Functions
  // ---------------------------

  // Check if MetaMask is installed and get the current account
  const checkMetaMaskConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request current accounts (if already connected)
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        setAccount(accounts[0]);
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
          setAccount(accounts[0]);
        });
      } catch (err) {
        console.error('Error connecting to MetaMask:', err);
      }
    }
  };

  // Connect to MetaMask (request account access)
  const connectMetaMask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (err) {
        console.error('Error connecting to MetaMask:', err);
      }
    } else {
      alert('Please install MetaMask to use this feature!');
    }
  };

  // Handle a buy transaction
  const handleBuy = async () => {
    if (!account) {
      await connectMetaMask();
      return;
    }
    try {
      const transactionParameters = {
        to: walletid, // Replace with your trading contract address
        from: account,
        value: '0x00', // Replace with the actual value in wei
        data: '0x', // Replace with the actual contract method call data
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      console.log('Transaction Hash:', txHash);
    } catch (err) {
      console.error('Error during buy transaction:', err);
      alert('Transaction failed. Please try again.');
    }
  };

  // Handle a sell transaction
  const handleSell = async () => {
    if (!account) {
      await connectMetaMask();
      return;
    }
    try {
      const transactionParameters = {
        to: walletid, // Replace with your trading contract address
        from: account,
        value: '0x00', // Replace with the actual value in wei
        data: '0x', // Replace with the actual contract method call data
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      console.log('Transaction Hash:', txHash);
    } catch (err) {
      console.error('Error during sell transaction:', err);
      alert('Transaction failed. Please try again.');
    }
  };

  // ---------------------------
  // Chart Rendering Functions
  // ---------------------------

  // Create the points for the line chart using the history data
  const createLineChartPoints = () => {
    if (!history || history.length === 0) return '';
    const prices = history.map((point) => point.close);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    return history
      .map((point, index) => {
        const x =
          chartPadding +
          (index * (chartWidth - 2 * chartPadding)) / (history.length - 1);
        const y =
          chartHeight -
          chartPadding -
          ((point.close - minPrice) * (chartHeight - 2 * chartPadding)) / priceRange;
        return `${x},${y}`;
      })
      .join(' ');
  };

  // Render a candlestick chart using the historical data
  const CandlestickChart = () => {
    if (!history || history.length === 0) return null;
    const allPrices = history.flatMap((point) => [point.high, point.low]);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice || 1;
    const candleWidth = Math.min(20, ((chartWidth - 2 * chartPadding) / history.length) * 0.8);

    return (
      <g>
        {history.map((point, index) => {
          const x =
            chartPadding +
            (index * (chartWidth - 2 * chartPadding)) / (history.length - 1);
          const getY = (price) =>
            chartHeight -
            chartPadding -
            ((price - minPrice) * (chartHeight - 2 * chartPadding)) / priceRange;
          const openY = getY(point.open);
          const closeY = getY(point.close);
          const highY = getY(point.high);
          const lowY = getY(point.low);
          const isUp = point.close >= point.open;
          const candleColor = isUp ? "#22c55e" : "#ef4444";
          return (
            <g key={index}>
              {/* Wick */}
              <line
                x1={x}
                y1={highY}
                x2={x}
                y2={lowY}
                stroke={candleColor}
                strokeWidth="1"
              />
              {/* Candle body */}
              <rect
                x={x - candleWidth / 2}
                y={isUp ? closeY : openY}
                width={candleWidth}
                height={Math.max(Math.abs(closeY - openY), 1)}
                fill={candleColor}
                stroke={candleColor}
              />
            </g>
          );
        })}
      </g>
    );
  };

  // ---------------------------
  // useEffect: Load data and check MetaMask connection
  // ---------------------------
  useEffect(() => {
    loadData();
    checkMetaMaskConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coinId]);

  // ---------------------------
  // Render Loading and Error States
  // ---------------------------
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text mt-4">Loading {coinId} data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container mx-auto max-w-md">
        <p>Error: {error}</p>
        <button className="retry-button" onClick={loadData}>
          Retry
        </button>
      </div>
    );
  }

  // ---------------------------
  // Main Render
  // ---------------------------
  return (
    <div className="crypto-container">
      {/* Header */}
      <div className="crypto-header">
        <img
          src={coin.image?.large}
          alt={coin.name}
          className="coin-image"
          onError={(e) => {
            e.target.src = '/api/placeholder/64/64';
            e.target.alt = 'Coin image unavailable';
          }}
        />
        <div className="coin-details">
          <h2>
            {coin.name}{' '}
            <span className="uppercase text-gray-500">({coin.symbol})</span>
          </h2>
          <p className="coin-price">
            ${history[history.length - 1]?.close.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Trading Buttons */}
      <div className="trading-buttons flex justify-center gap-4 my-4">
        <button
          onClick={handleBuy}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Buy {coin?.symbol?.toUpperCase()}
        </button>
        <button
          onClick={handleSell}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Sell {coin?.symbol?.toUpperCase()}
        </button>
      </div>

      {/* MetaMask Connection Status */}
      <div className="text-center mb-4">
        {!account ? (
          <button onClick={connectMetaMask} className="text-blue-500 hover:text-blue-600">
            Connect MetaMask
          </button>
        ) : (
          <p className="text-sm text-gray-600">
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </p>
        )}
      </div>

      {/* Chart Tabs */}
      <div className="chart-tabs flex justify-center gap-4 my-4">
        <button
          className={`tab-button ${activeTab === 'candlestick' ? 'active' : ''}`}
          onClick={() => setActiveTab('candlestick')}
        >
          Candlestick
        </button>
        <button
          className={`tab-button ${activeTab === 'line' ? 'active' : ''}`}
          onClick={() => setActiveTab('line')}
        >
          Line
        </button>
      </div>

      {/* Chart Container */}
      <div className="chart-container">
        <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          {/* Y-axis Grid and Labels */}
          {Array.from({ length: 6 }).map((_, i) => {
            const allPrices = history.flatMap((point) => [point.high, point.low]);
            const minPrice = Math.min(...allPrices);
            const maxPrice = Math.max(...allPrices);
            const price = maxPrice - ((maxPrice - minPrice) * i) / 5;
            const y = chartPadding + (i * (chartHeight - 2 * chartPadding)) / 5;
            return (
              <g key={i}>
                <text
                  x={chartPadding - 10}
                  y={y}
                  textAnchor="end"
                  alignmentBaseline="middle"
                  className="price-label"
                >
                  ${price.toLocaleString()}
                </text>
                <line
                  x1={chartPadding}
                  y1={y}
                  x2={chartWidth - chartPadding}
                  y2={y}
                  className="chart-grid"
                />
              </g>
            );
          })}

          {/* Render the Chart (Candlestick or Line) */}
          {activeTab === 'candlestick' ? (
            <CandlestickChart />
          ) : (
            <polyline
              className="price-line"
              points={createLineChartPoints()}
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
            />
          )}
        </svg>
      </div>

      {/* Statistics */}
      <div className="stats-grid grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
        <div className="stat-card">
          <div className="stat-label">24h High</div>
          <div className="stat-value">
            ${Math.max(...history.slice(-24).map((point) => point.high)).toLocaleString()}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">24h Low</div>
          <div className="stat-value">
            ${Math.min(...history.slice(-24).map((point) => point.low)).toLocaleString()}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Volume</div>
          <div className="stat-value">
            ${ (coin.market_data?.total_volume?.usd || 0).toLocaleString() }
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Market Cap</div>
          <div className="stat-value">
            ${ (coin.market_data?.market_cap?.usd || 0).toLocaleString() }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Coin;

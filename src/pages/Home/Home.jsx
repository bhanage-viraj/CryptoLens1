import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import { CoinContext } from '../../context/coincontext';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const Home = () => {
  const { allcoins, Currency } = useContext(CoinContext);
  const [displayCoins, setDisplayCoins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [watchlist, setWatchlist] = useLocalStorage('watchlist', []);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    if (event.target.value === '') {
      setDisplayCoins(allcoins.slice(0, 20));
    }
  };

  const searchHandler = (e) => {
    e.preventDefault();
    const filteredCoins = allcoins
      .filter((coin) =>
        coin.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 20);
    setDisplayCoins(filteredCoins);
  };

  useEffect(() => {
    setDisplayCoins(allcoins.slice(0, 20));
  }, [allcoins]);

  const handleWatchlistDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const draggedFrom = e.dataTransfer.getData("draggedFrom");
    if (draggedFrom === "table") {
      const coinId = e.dataTransfer.getData("coinId");
      const coinToAdd = allcoins.find(coin => coin.id === coinId);
      if (coinToAdd && !watchlist.some(item => item.id === coinId)) {
        setWatchlist([...watchlist, coinToAdd]);
      }
    }
  };

  const handleWatchlistItemDrop = (e, dropIndex) => {
    e.preventDefault();
    const draggedFrom = e.dataTransfer.getData("draggedFrom");
    if (draggedFrom === "watchlist") {
      const draggedIndex = parseInt(e.dataTransfer.getData("watchlistIndex"), 10);
      if (draggedIndex === dropIndex) return;
      const updatedWatchlist = Array.from(watchlist);
      const [movedItem] = updatedWatchlist.splice(draggedIndex, 1);
      updatedWatchlist.splice(dropIndex, 0, movedItem);
      setWatchlist(updatedWatchlist);
    } else if (draggedFrom === "table") {
      const coinId = e.dataTransfer.getData("coinId");
      const coinToAdd = allcoins.find(coin => coin.id === coinId);
      if (coinToAdd && !watchlist.some(item => item.id === coinId)) {
        const updatedWatchlist = Array.from(watchlist);
        updatedWatchlist.splice(dropIndex, 0, coinToAdd);
        setWatchlist(updatedWatchlist);
      }
    }
  };

  const handleWatchlistItemDragStart = (e, index) => {
    e.dataTransfer.setData("watchlistIndex", index);
    e.dataTransfer.setData("draggedFrom", "watchlist");
  };

  // Visual feedback for drag-over in the watchlist area
  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setDisplayCoins(allcoins.slice(0, 20));
  };

  return (
    <div className="home">
      <header className="header">
        <h1>CryptoLens</h1>
      </header>

      <div className="hero">
        <form onSubmit={searchHandler} className="search-form">
          <input
            onChange={handleSearch}
            value={searchTerm}
            list="coins"
            type="text"
            placeholder="Search for a coin..."
            required
            aria-label="Search coins"
            autoFocus
          />
          {searchTerm && (
            <button type="button" onClick={clearSearch} className="clear-btn" aria-label="Clear search">
              &times;
            </button>
          )}
          <button type="submit" className="search-btn">Search</button>
          <datalist id="coins">
            {allcoins.map((item, index) => (
              <option key={index} value={item.name} />
            ))}
          </datalist>
        </form>
      </div>

      <div className="main">
        <div className="cryptotable">
          <div className="table-layout header">
            <p className="rank">#</p>
            <p className="name">Coins</p>
            <p className="price">Price</p>
            <p className="change">24h Change</p>
            <p className="market">Market Cap</p>
          </div>
          {displayCoins.length > 0 ? (
            displayCoins.map((coin) => (
              <Link
                to={`/coin/${coin.id}`}
                className="table-layout coin-row"
                key={coin.id}
                draggable="true"
                onDragStart={(e) => {
                  e.dataTransfer.setData("coinId", coin.id);
                  e.dataTransfer.setData("draggedFrom", "table");
                }}
              >
                <p className="rank">{coin.market_cap_rank}</p>
                <p className="name">
                  <img src={coin.image} alt={coin.name} />
                  {coin.name}
                </p>
                <p className="price">
                  {Currency.symbol}{coin.current_price.toFixed(2)}
                </p>
                <p className="change">
                  {coin.price_change_percentage_24h > 0 ? (
                    <span className="green">
                      {coin.price_change_percentage_24h.toFixed(2)}%
                    </span>
                  ) : (
                    <span className="red">
                      {coin.price_change_percentage_24h.toFixed(2)}%
                    </span>
                  )}
                </p>
                <p className="market">
                  {Currency.symbol}{coin.market_cap.toLocaleString()}
                </p>
              </Link>
            ))
          ) : (
            <p className="no-results">No coins found.</p>
          )}
        </div>

        <div
          className={`watchlist ${isDraggingOver ? 'drag-over' : ''}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleWatchlistDrop}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
          <h2>Watchlist</h2>
          {watchlist.length === 0 ? (
            <p className="empty-text">
              Drag coins here to add them to your watchlist.
            </p>
          ) : (
            watchlist.map((coin, index) => (
              <div
                key={coin.id}
                className="watchlist-item"
                draggable="true"
                onDragStart={(e) => handleWatchlistItemDragStart(e, index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleWatchlistItemDrop(e, index)}
              >
                <Link to={`/coin/${coin.id}`} className="watchlist-link">
                  <img src={coin.image} alt={coin.name} />
                  <span>{coin.name}</span>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

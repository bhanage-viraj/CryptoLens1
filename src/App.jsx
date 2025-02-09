import React from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Coin from './pages/Coin/Coin';
import Navbar from './components/Navbar/navbar';
import Home from './pages/Home/Home';
import WatchList from './components/Watchlist/WatchList';
function App() {
  return (
    <div className='App'>

      <Navbar />
      <div className="main">
      <Routes>
        <Route path='/' element={<Home />} />
        {/* Changed route to use a dynamic parameter */}
        <Route path='/coin/:coinId' element={<Coin />} />
      </Routes>

     
      </div>
    </div>
  );
}

export default App;

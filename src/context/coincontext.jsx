import React, { createContext, useState, useEffect } from "react";

export const CoinContext = createContext();

export const CoinContextProvider = (props) => {
    const [allcoins, setAllcoins] = useState([]);
    const [Currency, setCurrency] = useState({
        name: "USD",
        symbol: "$"
    });

    const fetchAllCoins = async () => {
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                'x-cg-demo-api-key': 'CG-812Pcv4vQZShSTWYAXi9fcXC'
            }
        };

        fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${Currency.name}`, options)
            .then(res => res.json())
            .then(res => setAllcoins(res))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchAllCoins();
    }, [Currency]);

    const contextValue = {
        allcoins,
        Currency,
        setCurrency
    };

    return (
        <CoinContext.Provider value={contextValue}>
            {props.children}
        </CoinContext.Provider>
    );
};

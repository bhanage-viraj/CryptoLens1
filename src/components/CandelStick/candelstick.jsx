import React, { useEffect, useState } from "react";
import { Chart } from "react-google-charts";

const CandlestickChart = ({ history }) => {
  const [chartType, setChartType] = useState("LineChart"); // Toggle state

  const [lineData, setLineData] = useState([["Date", "Price"]]);
  const [candleData, setCandleData] = useState([
    ["Date", "Low", "Open", "Close", "High"],
  ]);

  useEffect(() => {
    if (history && history.length > 0) {
      // Process Line Chart Data
      const formattedLineData = history.map(([timestamp, price]) => {
        const date = new Date(timestamp);
        return [date.toLocaleDateString(), price];
      });

      // Process Candlestick Chart Data
      const formattedCandleData = history.map(
        ([timestamp, open, high, low, close]) => {
          const date = new Date(timestamp);
          return [date.toLocaleDateString(), low, open, close, high];
        }
      );

      setLineData([["Date", "Price"], ...formattedLineData]);
      setCandleData([["Date", "Low", "Open", "Close", "High"], ...formattedCandleData]);
    }
  }, [history]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Toggle Button */}
      <button
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() =>
          setChartType(chartType === "LineChart" ? "CandlestickChart" : "LineChart")
        }
      >
        Switch to {chartType === "LineChart" ? "Candlestick Chart" : "Line Chart"}
      </button>

      {/* Chart Rendering */}
      <Chart
        chartType={chartType}
        width="100%"
        height="400px"
        data={chartType === "LineChart" ? lineData : candleData}
        loader={<div>Loading Chart...</div>}
        options={{
          title: "Coin Price History",
          legend: "none",
          hAxis: { title: "Date", titleTextStyle: { color: "#333" } },
          vAxis: { title: "Price", titleTextStyle: { color: "#333" } },
          backgroundColor: "#f4f4f4",
        }}
      />
    </div>
  );
};

export default CandlestickChart;

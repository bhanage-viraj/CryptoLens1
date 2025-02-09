import React, { useEffect, useState } from "react";
// Import Chart as a named export:
import { Chart } from "react-google-charts";

const LineChart = ({ history }) => {
  const [data, setData] = useState([["Date", "Price"]]);

  useEffect(() => {
    if (history && history.length > 0) {
      // Format each data point from the API response
      const formattedData = history.map(([timestamp, price]) => {
        const date = new Date(timestamp);
        const formattedDate = date.toLocaleDateString(); // You can change the locale if needed
        return [formattedDate, price];
      });
      setData([["Date", "Price"], ...formattedData]);
    }
  }, [history]);

  return (
    <Chart
      chartType="LineChart"
      width="100%"
      height="400px"
      data={data}
      loader={<div>Loading Chart...</div>}
      options={{
        title: "Coin Price History",
        hAxis: { title: "Date", titleTextStyle: { color: "#333" } },
        vAxis: { title: "Price", titleTextStyle: { color: "#333" } },
        legend: "none",
        backgroundColor: "#f4f4f4",
      }}
    />
  );
};

export default LineChart;

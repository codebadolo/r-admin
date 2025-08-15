import React, { useState } from "react";
import { Button, Divider } from "antd";
import StockManagement from "./StockManagement";
import StockStatistics from "./StockStatistics";

export default function StockPage() {
  const [showStats, setShowStats] = useState(true);

  return (
    <div style={{ maxWidth: '100%', margin: "auto", padding: 4 }}>
      
      {showStats ? (
             <StockManagement onSwitch={() => setShowStats(true)} />
      ) : (
           <StockStatistics onSwitch={() => setShowStats(false)} />

      )}
    </div>
  );
}

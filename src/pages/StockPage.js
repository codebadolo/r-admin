import { Button, Divider } from "antd";
import { useState } from "react";
import StockManagement from "./StockManagement";
import StockStatistics from "./StockStatistics";



export default function StockPage() {
  const [showStats, setShowStats] = useState(false);

  return (
    <div
      style={{
      
        margin: "auto",
        padding: 2,
       
      }}
    >

      <Button
        onClick={() => setShowStats(!showStats)}
        style={{ marginBottom: 2}}
      >
        {showStats ? "Voir la gestion détaillée" : "Voir les statistiques"}
      </Button>

      <Divider />

      {showStats ? <StockStatistics /> : <StockManagement maxWidth={2000} />}
    </div>
  );
}
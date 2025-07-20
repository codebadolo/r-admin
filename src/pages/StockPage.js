import { Button, Divider, Typography } from "antd";
import { useState } from "react";
import StockManagement from "./StockManagement";
import StockStatistics from "./StockStatistics";

const { Title } = Typography;

export default function StockPage() {
  const [showStats, setShowStats] = useState(false);

  return (
    <div
      style={{
        maxWidth: 2000,
        margin: "auto",
        padding: 2,
        boxSizing: "border-box",
      }}
    >
      <Title level={3} style={{ marginBottom: 24 }}>
        Gestion des stocks
      </Title>

      <Button
        onClick={() => setShowStats(!showStats)}
        style={{ marginBottom: 16 }}
      >
        {showStats ? "Voir la gestion détaillée" : "Voir les statistiques"}
      </Button>

      <Divider />

      {showStats ? <StockStatistics /> : <StockManagement maxWidth={2000} />}
    </div>
  );
}

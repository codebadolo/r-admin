import { Tabs, Typography } from "antd";
import { useState } from "react";
import AttributeSection from "../components/AttributeSection";
import BrandSection from "../components/BrandSection";
import CategorySection from "../components/CategorySection";
import ProductTypeSection from "../components/ProductTypeSection";

const { TabPane } = Tabs;
const { Title, Paragraph } = Typography;

export default function BrandsPage() {
  const [activeTab, setActiveTab] = useState("brands");

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Gestion des Produits</Title>
      <Paragraph>Administrer marques, catégories, attributs...</Paragraph>

      <Tabs activeKey={activeTab} onChange={setActiveTab} style={{ marginTop: 20 }}>
        <TabPane tab="Marques" key="brands">
          <BrandSection />
        </TabPane>
        <TabPane tab="Catégories" key="categories">
          <CategorySection />
        </TabPane>
        <TabPane tab="Types de produits" key="types">
          <ProductTypeSection />
        </TabPane>
        <TabPane tab="Attributs" key="attributes">
          <AttributeSection />
        </TabPane>
        {/* Ajouter d’autres onglets si nécessaire */}
      </Tabs>
    </div>
  );
}

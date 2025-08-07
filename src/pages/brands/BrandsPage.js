import { Tabs, Typography } from "antd";
import { useState } from "react";
import AttributeSection from "../../components/product/AttributeSection";
import BrandSection from "../../components/brand/BrandSection";
import CategorySection from "../../components/category/CategorySection";
import ProductTypeSection from "../../components/product/ProductTypeSection";

const { TabPane } = Tabs;
const { Title, Paragraph } = Typography;

export default function BrandsPage() {
  const [activeTab, setActiveTab] = useState("brands");

  return (
    <div style={{ padding: 24 }}>
    
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

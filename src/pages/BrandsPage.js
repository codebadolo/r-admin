import { Tabs } from 'antd';
import { useState } from 'react';
import AttributesManager from './AttributesManager';
import BrandsManager from './BrandsManager';
import CategoriesManager from './CategoriesManager';
import ProductTypesManager from './ProductTypesManager';

const { TabPane } = Tabs;

export default function BrandsPage() {
  const [activeKey, setActiveKey] = useState('categories');

  return (
    <Tabs activeKey={activeKey} onChange={setActiveKey}>
      <TabPane tab="Catégories" key="categories">
        <CategoriesManager />
      </TabPane>
      <TabPane tab="Attributs" key="attributes">
        <AttributesManager />
      </TabPane>
      <TabPane tab="Types de produits" key="productTypes">
        <ProductTypesManager />
      </TabPane>
      <TabPane tab="Marques" key="brands">
        <BrandsManager />
      </TabPane>
    </Tabs>
  );
}

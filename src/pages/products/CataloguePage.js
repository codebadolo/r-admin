// src/pages/products/CataloguePage.js

import React from 'react';
import { Typography} from 'antd';
import ProductTable from '../../components/product/ProductTable';
   import { PageHeader } from '@ant-design/pro-components';
const { Title } = Typography;

const CataloguePage = () => {
  return (
    <div>
   
      <div style={{ padding: 4, background: '#fff' }}>

        <ProductTable />
      </div>
    </div>
  );
};

export default CataloguePage;

import { Table, Tag, Typography } from 'antd';

const { Title } = Typography;

const StockPage = () => {
  const columns = [
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'Produit', dataIndex: 'productName', key: 'productName' },
    { title: 'Quantité en stock', dataIndex: 'units', key: 'units' },
    { title: 'Vendus', dataIndex: 'unitsSold', key: 'unitsSold' },
    {
      title: 'Dernière vérification',
      dataIndex: 'lastChecked',
      key: 'lastChecked',
    },
    {
      title: 'Statut',
      dataIndex: 'units',
      key: 'status',
      render: (units) => (
        units > 10 ? <Tag color="green">Stock suffisant</Tag> : <Tag color="volcano">Stock faible</Tag>
      ),
    },
  ];

  const data = [
    { key: '1', sku: 'SKU001', productName: 'Ordinateur Portable', units: 20, unitsSold: 50, lastChecked: '2025-06-20' },
    { key: '2', sku: 'SKU002', productName: 'Switch Réseau', units: 5, unitsSold: 30, lastChecked: '2025-06-18' },
  ];

  return (
    <>
      <Title level={2}>Gestion du Stock</Title>
      <Table columns={columns} dataSource={data} />
    </>
  );
};

export default StockPage;

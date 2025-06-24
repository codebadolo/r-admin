import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Space, Table, Typography } from 'antd';

const { Title } = Typography;

const ProductsPage = () => {
  const columns = [
    {
      title: 'Nom du produit',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Catégorie',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Prix',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price} €`,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} type="primary" size="small" />
          <Button icon={<DeleteOutlined />} type="danger" size="small" />
        </Space>
      ),
    },
  ];

  // Exemple de données statiques
  const data = [
    {
      key: '1',
      name: 'Ordinateur Portable',
      category: 'Informatique',
      price: 1200,
      stock: 15,
    },
    {
      key: '2',
      name: 'Switch Réseau',
      category: 'Réseau',
      price: 250,
      stock: 30,
    },
  ];

  return (
    <>
      <Title level={2}>Produits</Title>
      <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16 }}>
        Ajouter un produit
      </Button>
      <Table columns={columns} dataSource={data} />
    </>
  );
};

export default ProductsPage;

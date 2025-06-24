import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Modal, Select, Space, Table, Typography } from 'antd';
import { useState } from 'react';

const { Title } = Typography;
const { Option } = Select;

const VariantsPage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [form] = Form.useForm();

  const data = [
    { key: '1', sku: 'SKU001', productName: 'Ordinateur Portable', retailPrice: 1200, storePrice: 1100, isDefault: true },
    { key: '2', sku: 'SKU002', productName: 'Switch Réseau', retailPrice: 250, storePrice: 230, isDefault: false },
  ];

  const showModal = (record = null) => {
    setEditingVariant(record);
    form.resetFields();
    if (record) form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      console.log('Variante sauvegardée:', values);
      setModalVisible(false);
      // TODO: API save
    });
  };

  const handleCancel = () => setModalVisible(false);

  const columns = [
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: 'Produit', dataIndex: 'productName', key: 'productName' },
    { title: 'Prix de détail (€)', dataIndex: 'retailPrice', key: 'retailPrice' },
    { title: 'Prix magasin (€)', dataIndex: 'storePrice', key: 'storePrice' },
    { title: 'Par défaut', dataIndex: 'isDefault', key: 'isDefault', render: val => (val ? 'Oui' : 'Non') },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Button icon={<DeleteOutlined />} danger />
        </Space>
      ),
    },
  ];

  return (
    <>
      <Title level={2}>Variantes de produits</Title>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} style={{ marginBottom: 16 }}>
        Ajouter une variante
      </Button>
      <Table columns={columns} dataSource={data} />

      <Modal title={editingVariant ? 'Modifier variante' : 'Ajouter variante'} visible={modalVisible} onOk={handleOk} onCancel={handleCancel} destroyOnClose>
        <Form form={form} layout="vertical" initialValues={{ retailPrice: 0, storePrice: 0, isDefault: false }}>
          <Form.Item name="sku" label="SKU" rules={[{ required: true, message: 'Veuillez saisir le SKU' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="productName" label="Produit" rules={[{ required: true, message: 'Veuillez saisir le nom du produit' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="retailPrice" label="Prix de détail (€)" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="storePrice" label="Prix magasin (€)" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="isDefault" label="Par défaut" valuePropName="checked">
            <Select>
              <Option value={true}>Oui</Option>
              <Option value={false}>Non</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default VariantsPage;

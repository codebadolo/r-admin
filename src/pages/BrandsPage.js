import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, List, Modal, Typography } from 'antd';
import { useState } from 'react';

const { Title } = Typography;

const BrandsPage = () => {
  const [brands, setBrands] = useState([{ id: 1, name: 'Dell' }, { id: 2, name: 'HP' }]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [form] = Form.useForm();

  const showModal = (brand = null) => {
    setEditingBrand(brand);
    form.resetFields();
    if (brand) form.setFieldsValue(brand);
    setModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      if (editingBrand) {
        setBrands(brands.map(b => (b.id === editingBrand.id ? { ...b, ...values } : b)));
      } else {
        setBrands([...brands, { id: Date.now(), ...values }]);
      }
      setModalVisible(false);
      // TODO: API save
    });
  };

  const handleDelete = id => setBrands(brands.filter(b => b.id !== id));

  return (
    <>
      <Title level={2}>Marques</Title>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} style={{ marginBottom: 16 }}>
        Ajouter une marque
      </Button>
      <List
        bordered
        dataSource={brands}
        renderItem={item => (
          <List.Item
            actions={[
              <Button icon={<EditOutlined />} onClick={() => showModal(item)} />,
              <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(item.id)} />,
            ]}
          >
            {item.name}
          </List.Item>
        )}
      />
      <Modal title={editingBrand ? 'Modifier marque' : 'Ajouter marque'} visible={modalVisible} onOk={handleOk} onCancel={() => setModalVisible(false)} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nom" rules={[{ required: true, message: 'Veuillez saisir le nom' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default BrandsPage;

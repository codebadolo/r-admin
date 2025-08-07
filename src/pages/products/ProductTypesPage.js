import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, List, Modal, Typography } from 'antd';
import { useState } from 'react';

const { Title } = Typography;

const ProductTypesPage = () => {
  const [types, setTypes] = useState([{ id: 1, name: 'Ordinateur' }, { id: 2, name: 'Accessoire' }]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [form] = Form.useForm();

  const showModal = (type = null) => {
    setEditingType(type);
    form.resetFields();
    if (type) form.setFieldsValue(type);
    setModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      if (editingType) {
        setTypes(types.map(t => (t.id === editingType.id ? { ...t, ...values } : t)));
      } else {
        setTypes([...types, { id: Date.now(), ...values }]);
      }
      setModalVisible(false);
      // TODO: API save
    });
  };

  const handleDelete = id => setTypes(types.filter(t => t.id !== id));

  return (
    <>
      <Title level={2}>Types de produits</Title>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} style={{ marginBottom: 16 }}>
        Ajouter un type
      </Button>
      <List
        bordered
        dataSource={types}
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
      <Modal title={editingType ? 'Modifier type' : 'Ajouter type'} visible={modalVisible} onOk={handleOk} onCancel={() => setModalVisible(false)} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nom" rules={[{ required: true, message: 'Veuillez saisir le nom' }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ProductTypesPage;

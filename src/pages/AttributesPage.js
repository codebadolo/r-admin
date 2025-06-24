import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, List, Modal, Typography } from 'antd';
import { useState } from 'react';

const { Title } = Typography;

const AttributesPage = () => {
  const [attributes, setAttributes] = useState([
    { id: 1, name: 'Couleur', description: 'Couleur du produit' },
    { id: 2, name: 'Taille', description: 'Taille ou dimensions' },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAttr, setEditingAttr] = useState(null);
  const [form] = Form.useForm();

  const showModal = (attr = null) => {
    setEditingAttr(attr);
    form.resetFields();
    if (attr) form.setFieldsValue(attr);
    setModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      if (editingAttr) {
        setAttributes(attributes.map(a => (a.id === editingAttr.id ? { ...a, ...values } : a)));
      } else {
        setAttributes([...attributes, { id: Date.now(), ...values }]);
      }
      setModalVisible(false);
      // TODO: API save
    });
  };

  const handleDelete = id => setAttributes(attributes.filter(a => a.id !== id));

  return (
    <>
      <Title level={2}>Attributs Produits</Title>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} style={{ marginBottom: 16 }}>
        Ajouter un attribut
      </Button>
      <List
        bordered
        dataSource={attributes}
        renderItem={item => (
          <List.Item
            actions={[
              <Button icon={<EditOutlined />} onClick={() => showModal(item)} />,
              <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(item.id)} />,
            ]}
          >
            <List.Item.Meta title={item.name} description={item.description} />
          </List.Item>
        )}
      />
      <Modal title={editingAttr ? 'Modifier attribut' : 'Ajouter attribut'} visible={modalVisible} onOk={handleOk} onCancel={() => setModalVisible(false)} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nom" rules={[{ required: true, message: 'Veuillez saisir le nom' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AttributesPage;

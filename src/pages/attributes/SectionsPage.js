import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, List, Modal, Typography } from 'antd';
import { useState } from 'react';

const { Title } = Typography;

const SectionsPage = () => {
  const [sections, setSections] = useState([
    { id: 1, name: 'Caractéristiques générales', order: 1 },
    { id: 2, name: 'Dimensions', order: 2 },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [form] = Form.useForm();

  const showModal = (section = null) => {
    setEditingSection(section);
    form.resetFields();
    if (section) form.setFieldsValue(section);
    setModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      if (editingSection) {
        setSections(sections.map(s => (s.id === editingSection.id ? { ...s, ...values } : s)));
      } else {
        setSections([...sections, { id: Date.now(), ...values }]);
      }
      setModalVisible(false);
      // TODO: API save
    });
  };

  const handleDelete = id => setSections(sections.filter(s => s.id !== id));

  return (
    <>
      <Title level={2}>Sections de Spécification</Title>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} style={{ marginBottom: 16 }}>
        Ajouter une section
      </Button>
      <List
        bordered
        dataSource={sections.sort((a,b) => a.order - b.order)}
        renderItem={item => (
          <List.Item
            actions={[
              <Button icon={<EditOutlined />} onClick={() => showModal(item)} />,
              <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(item.id)} />,
            ]}
          >
            {item.order}. {item.name}
          </List.Item>
        )}
      />
      <Modal title={editingSection ? 'Modifier section' : 'Ajouter section'} visible={modalVisible} onOk={handleOk} onCancel={() => setModalVisible(false)} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nom" rules={[{ required: true, message: 'Veuillez saisir le nom' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="order" label="Ordre" rules={[{ required: true, message: 'Veuillez saisir un ordre' }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default SectionsPage;

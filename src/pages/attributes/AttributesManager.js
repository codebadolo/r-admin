import {
    Button,
    Form,
    Input,
    message,
    Modal,
    Popconfirm,
    Select,
    Space,
    Table,
} from "antd";
import { useEffect, useState } from "react";

import {
    createProductAttribute,
    createProductAttributeValue,
    deleteProductAttribute,
    deleteProductAttributeValue,
    fetchProductAttributes,
    fetchProductAttributeValues,
    updateProductAttribute,
} from "../../services/productService";

const { Option } = Select;

export default function AttributesManager() {
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [valuesModalVisible, setValuesModalVisible] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState(null);

  const [attrModalVisible, setAttrModalVisible] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);

  const [form] = Form.useForm();
  const [valuesForm] = Form.useForm();

  const [attributeValues, setAttributeValues] = useState([]);
  const [valuesLoading, setValuesLoading] = useState(false);

  useEffect(() => {
    loadAttributes();
  }, []);

  const loadAttributes = async () => {
    setLoading(true);
    try {
      const data = await fetchProductAttributes();
      setAttributes(data);
    } catch {
      message.error("Erreur lors du chargement des attributs");
    } finally {
      setLoading(false);
    }
  };

  const openAttrModal = (attribute = null) => {
    setEditingAttribute(attribute);
    if (attribute) {
      form.setFieldsValue({
        name: attribute.name,
        type: attribute.type,
      });
    } else {
      form.resetFields();
    }
    setAttrModalVisible(true);
  };

  const handleAttrModalCancel = () => {
    setAttrModalVisible(false);
    setEditingAttribute(null);
    form.resetFields();
  };

  const onAttrFinish = async (values) => {
    try {
      if (editingAttribute) {
        await updateProductAttribute(editingAttribute.id, values);
        message.success("Attribut modifié");
      } else {
        await createProductAttribute(values);
        message.success("Attribut créé");
      }
      loadAttributes();
      handleAttrModalCancel();
    } catch {
      message.error("Erreur lors de la sauvegarde");
    }
  };

  const openValuesModal = async (attribute) => {
    setSelectedAttribute(attribute);
    setValuesLoading(true);
    try {
      const values = await fetchProductAttributeValues({ attribute: attribute.id });
      setAttributeValues(values);
      setValuesModalVisible(true);
    } catch {
      message.error("Erreur chargement des valeurs");
    } finally {
      setValuesLoading(false);
    }
  };

  const closeValuesModal = () => {
    setSelectedAttribute(null);
    setAttributeValues([]);
    setValuesModalVisible(false);
    valuesForm.resetFields();
  };

  const addValue = async (vals) => {
    try {
      await createProductAttributeValue({ ...vals, attribute: selectedAttribute.id });
      message.success("Valeur ajoutée");
      const values = await fetchProductAttributeValues({ attribute: selectedAttribute.id });
      setAttributeValues(values);
      valuesForm.resetFields();
    } catch {
      message.error("Erreur ajout valeur");
    }
  };

  const deleteValue = async (id) => {
    try {
      await deleteProductAttributeValue(id);
      message.success("Valeur supprimée");
      const values = await fetchProductAttributeValues({ attribute: selectedAttribute.id });
      setAttributeValues(values);
    } catch {
      message.error("Erreur suppression valeur");
    }
  };

  const attributesColumns = [
    { title: "Nom", dataIndex: "name", key: "name" },
    { title: "Type", dataIndex: "type", key: "type" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openAttrModal(record)}>
            Modifier
          </Button>
          <Button size="small" onClick={() => openValuesModal(record)}>
            Gérer valeurs
          </Button>
          <Popconfirm
            title="Confirmer la suppression ?"
            onConfirm={async () => {
              try {
                await deleteProductAttribute(record.id);
                message.success("Attribut supprimé");
                loadAttributes();
              } catch {
                message.error("Erreur suppression");
              }
            }}
          >
            <Button danger size="small">
              Supprimer
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const valuesColumns = [
    { title: "Valeur", dataIndex: "value", key: "value" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Popconfirm
          title="Confirmer la suppression ?"
          onConfirm={() => deleteValue(record.id)}
        >
          <Button danger size="small">
            Supprimer
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <Button
        type="primary"
        onClick={() => openAttrModal()}
        style={{ marginBottom: 16 }}
      >
        Ajouter un attribut
      </Button>

      <Table
        dataSource={attributes}
        columns={attributesColumns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        visible={attrModalVisible}
        title={editingAttribute ? "Modifier attribut" : "Ajouter attribut"}
        onCancel={handleAttrModalCancel}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onAttrFinish}>
          <Form.Item
            label="Nom"
            name="name"
            rules={[{ required: true, message: "Nom requis" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Type"
            name="type"
            rules={[{ required: true, message: "Type requis" }]}
          >
            <Select>
              <Option value="text">Texte</Option>
              <Option value="number">Nombre</Option>
              <Option value="select">Liste déroulante</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        visible={valuesModalVisible}
        title={`Valeurs de l'attribut : ${selectedAttribute?.name || ""}`}
        onCancel={closeValuesModal}
        footer={null}
        destroyOnClose
      >
        <Table
          dataSource={attributeValues}
          columns={valuesColumns}
          rowKey="id"
          loading={valuesLoading}
          pagination={false}
          size="small"
          style={{ marginBottom: 16 }}
        />
        <Form form={valuesForm} layout="inline" onFinish={addValue}>
          <Form.Item
            name="value"
            rules={[{ required: true, message: "Veuillez saisir une valeur" }]}
          >
            <Input placeholder="Nouvelle valeur" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Ajouter
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

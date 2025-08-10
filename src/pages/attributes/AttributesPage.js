import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
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
import productService from "../../services/productService";

const { Option } = Select;

export default function AttributesManager() {
  const [productTypes, setProductTypes] = useState([]);
  const [selectedProductType, setSelectedProductType] = useState(null);

  const [attributes, setAttributes] = useState([]);
  const [loadingAttributes, setLoadingAttributes] = useState(false);

  // Modal gestion attribut
  const [attrModalVisible, setAttrModalVisible] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [attrForm] = Form.useForm();

  // Modal gestion valeurs/options d'attribut
  const [valuesModalVisible, setValuesModalVisible] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [attributeValues, setAttributeValues] = useState([]);
  const [loadingValues, setLoadingValues] = useState(false);
  const [valuesForm] = Form.useForm();

  // Chargement des types de produits
  useEffect(() => {
    loadProductTypes();
  }, []);

  const loadProductTypes = async () => {
    try {
      const typesRes = await productService.getProductTypes();
      const types = typesRes.data;
      setProductTypes(types);
      if (types.length > 0) setSelectedProductType(types[0].id);
    } catch {
      message.error("Erreur chargement des types de produits");
    }
  };

  // Charger les attributs pour le type sélectionné
  useEffect(() => {
    if (selectedProductType) loadAttributes(selectedProductType);
    else setAttributes([]);
  }, [selectedProductType]);

  const loadAttributes = async (typeId) => {
    setLoadingAttributes(true);
    try {
      // Récupérer tous les attributs
      const attrRes = await productService.getProductAttributes();
      const allAttributes = attrRes.data;

      // Filtrer localement par type si API ne supporte pas filtre côté backend
      const filtered = allAttributes.filter((attr) => attr.product_type === typeId);
      setAttributes(filtered);
    } catch {
      message.error("Erreur chargement des attributs");
    } finally {
      setLoadingAttributes(false);
    }
  };

  // Ouvrir modal ajout/modification attribut
  const openAttrModal = (attribute = null) => {
    setEditingAttribute(attribute);
    if (attribute) {
      attrForm.setFieldsValue({
        name: attribute.name,
        type: attribute.type,
      });
    } else {
      attrForm.resetFields();
    }
    setAttrModalVisible(true);
  };

  const closeAttrModal = () => {
    setAttrModalVisible(false);
    setEditingAttribute(null);
    attrForm.resetFields();
  };

  const onAttrFinish = async (values) => {
    try {
      if (!selectedProductType) {
        message.error("Sélectionnez un type de produit");
        return;
      }
      const payload = {
        ...values,
        product_type: selectedProductType,
      };
      if (editingAttribute) {
        await productService.updateProductAttribute(editingAttribute.id, payload);
        message.success("Attribut modifié");
      } else {
        await productService.createProductAttribute(payload);
        message.success("Attribut créé");
      }
      await loadAttributes(selectedProductType);
      closeAttrModal();
    } catch {
      message.error("Erreur sauvegarde attribut");
    }
  };

  // Gestion modal valeurs/options d'attribut
  const openValuesModal = async (attribute) => {
    setSelectedAttribute(attribute);
    setLoadingValues(true);
    try {
      const valuesRes = await productService.getProductAttributeValues({ attribute: attribute.id });
      const values = valuesRes.data;
      setAttributeValues(values);
      setValuesModalVisible(true);
    } catch {
      message.error("Erreur chargement des valeurs");
    } finally {
      setLoadingValues(false);
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
      await productService.createProductAttributeValue({
        ...vals,
        attribute: selectedAttribute.id,
      });
      message.success("Valeur ajoutée");
      const valuesRes = await productService.getProductAttributeValues({ attribute: selectedAttribute.id });
      setAttributeValues(valuesRes.data);
      valuesForm.resetFields();
    } catch {
      message.error("Erreur ajout valeur");
    }
  };

  const deleteValue = async (id) => {
    try {
      await productService.deleteProductAttributeValue(id);
      message.success("Valeur supprimée");
      const valuesRes = await productService.getProductAttributeValues({ attribute: selectedAttribute.id });
      setAttributeValues(valuesRes.data);
    } catch {
      message.error("Erreur suppression valeur");
    }
  };

  const attributeColumns = [
    { title: "Nom", dataIndex: "name", key: "name" },
    { title: "Type", dataIndex: "type", key: "type" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button onClick={() => openAttrModal(record)}>Modifier</Button>
          <Button onClick={() => openValuesModal(record)}>Gérer valeurs</Button>
          <Popconfirm
            title="Confirmer la suppression ?"
            onConfirm={async () => {
              try {
                await productService.deleteProductAttribute(record.id);
                message.success("Attribut supprimé");
                loadAttributes(selectedProductType);
              } catch {
                message.error("Erreur suppression");
              }
            }}
          >
            <Button danger>Supprimer</Button>
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
        <Popconfirm title="Confirmer la suppression ?" onConfirm={() => deleteValue(record.id)}>
          <Button danger>Supprimer</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <span style={{ marginRight: 8 }}>Type de produit :</span>
        <Select
          style={{ width: 250 }}
          value={selectedProductType}
          onChange={setSelectedProductType}
          placeholder="Sélectionner un type"
          allowClear
        >
          {productTypes.map((pt) => (
            <Option key={pt.id} value={pt.id}>
              {pt.name}
            </Option>
          ))}
        </Select>

        <Button
          type="primary"
          style={{ marginLeft: 16 }}
          onClick={() => openAttrModal()}
          disabled={!selectedProductType}
        >
          Ajouter un attribut
        </Button>
      </div>

      <Table
        dataSource={attributes}
        columns={attributeColumns}
        rowKey="id"
        loading={loadingAttributes}
        pagination={{ pageSize: 10 }}
      />

      {/* Modal création/modification attribut */}
      <Modal
        visible={attrModalVisible}
        title={editingAttribute ? "Modifier attribut" : "Ajouter attribut"}
        onCancel={closeAttrModal}
        onOk={() => attrForm.submit()}
        destroyOnClose
      >
        <Form form={attrForm} layout="vertical" onFinish={onAttrFinish}>
          <Form.Item
            label="Nom"
            name="name"
            rules={[{ required: true, message: "Veuillez saisir un nom" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Type"
            name="type"
            rules={[{ required: true, message: "Veuillez sélectionner un type" }]}
          >
            <Select placeholder="Sélectionner un type">
              <Option value="text">Texte</Option>
              <Option value="number">Nombre</Option>
              <Option value="select">Liste déroulante</Option>
              {/* ajoutez d’autres types si besoin */}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal gestion des valeurs/options */}
      <Modal
        visible={valuesModalVisible}
        title={`Valeurs de l'attribut : ${selectedAttribute?.name || ""}`}
        footer={null}
        onCancel={closeValuesModal}
        destroyOnClose
      >
        <Table
          dataSource={attributeValues}
          columns={valuesColumns}
          rowKey="id"
          loading={loadingValues}
          pagination={false}
          size="small"
          style={{ marginBottom: 16 }}
        />

        <Form form={valuesForm} layout="inline" onFinish={addValue}>
          <Form.Item
            name="value"
            rules={[{ required: true, message: "Veuillez saisir une valeur" }]}
            style={{ flex: 1 }}
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

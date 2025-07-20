import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
    Button,
    Card,
    Col,
    Collapse,
    Input,
    List,
    message,
    Modal,
    Row,
    Space,
    Spin,
} from "antd";
import { useEffect, useState } from "react";
import {
    createProductAttribute,
    deleteProductAttribute,
    deleteProductAttributeValue,
    fetchProductAttributeOptions,
    fetchProductAttributes,
    fetchProductTypes,
    updateProductAttribute,
} from "../services/productService";
import AttributeModalForm from "./AttributeModalForm";

const { Panel } = Collapse;
const { Search } = Input;

export default function AttributeSection() {
  const [attributes, setAttributes] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState(null);
  const [searchText, setSearchText] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [attrs, types] = await Promise.all([
        fetchProductAttributes(),
        fetchProductTypes(),
      ]);
      const allOptions = await fetchProductAttributeOptions();

      // Affecter les options à chaque attribut correspondant
      const attrsWithOptions = attrs.map((attr) => ({
        ...attr,
        options: allOptions.filter(
          (opt) => opt.product_attribute === attr.id
        ),
      }));

      setAttributes(attrsWithOptions);
      setProductTypes(types);
    } catch (error) {
      message.error("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Gestion recherche locale : filtre attributs avec nom et nom de type produit
  const filteredAttributes = attributes.filter((attr) => {
    const lowerSearch = searchText.toLowerCase();
    return (
      attr.name.toLowerCase().includes(lowerSearch) ||
      (attr.product_type?.name?.toLowerCase().includes(lowerSearch) ?? false)
    );
  });

  const handleAdd = () => {
    setEditingAttribute(null);
    setModalVisible(true);
  };

  const handleEdit = (attr) => {
    setEditingAttribute(attr);
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Confirmer suppression",
      content: "Voulez-vous supprimer cet attribut ?",
      okText: "Oui",
      cancelText: "Non",
      onOk: () => {
        deleteProductAttribute(id)
          .then(() => {
            message.success("Attribut supprimé");
            loadData();
          })
          .catch(() => message.error("Erreur lors de la suppression"));
      },
    });
  };

  const handleDeleteOption = (optionId) => {
    Modal.confirm({
      title: "Confirmer suppression",
      content: "Voulez-vous supprimer cette option ?",
      okText: "Oui",
      cancelText: "Non",
      onOk: () => {
        deleteProductAttributeValue(optionId)
          .then(() => {
            message.success("Option supprimée");
            loadData();
          })
          .catch(() => message.error("Erreur suppression option"));
      },
    });
  };

  const handleSubmit = (values) => {
    const action = editingAttribute
      ? updateProductAttribute(editingAttribute.id, values)
      : createProductAttribute(values);
    action
      .then(() => {
        message.success(
          `Attribut ${editingAttribute ? "modifié" : "créé"}`
        );
        setModalVisible(false);
        loadData();
      })
      .catch(() => message.error("Erreur à l'enregistrement"));
  };

  return (
    <>
      <Search
        placeholder="Rechercher un attribut ou type"
        allowClear
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 16, maxWidth: 400 }}
        enterButton
      />

      <Button
        type="primary"
        onClick={handleAdd}
        style={{ marginBottom: 16, marginLeft: 8 }}
      >
        Ajouter un attribut
      </Button>

      {loading ? (
        <Spin tip="Chargement..." style={{ display: "block", marginTop: 40 }} />
      ) : filteredAttributes.length === 0 ? (
        <div>Aucun attribut disponible.</div>
      ) : (
        <Row gutter={[24, 24]}>
          {filteredAttributes.map((attr) => (
            <Col key={attr.id} xs={24} sm={24} md={12} lg={8} xl={6}>
              <Card
                size="small"
                title={attr.name}
                style={{ minWidth: 320 }}
                extra={
                  <Space size="middle">
                    <EditOutlined
                      style={{ fontSize: 18, cursor: "pointer" }}
                      onClick={() => handleEdit(attr)}
                      title="Modifier"
                    />
                    <DeleteOutlined
                      style={{ fontSize: 18, color: "red", cursor: "pointer" }}
                      onClick={() => handleDelete(attr.id)}
                      title="Supprimer"
                    />
                  </Space>
                }
              >
                <Collapse ghost>
                  <Panel header={`Options (${attr.options.length})`} key="1">
                    {attr.options.length === 0 ? (
                      <div>Aucune option</div>
                    ) : (
                      <List
                        size="small"
                        bordered
                        dataSource={attr.options}
                        renderItem={(option) => (
                          <List.Item
                            actions={[
                              <Button
                                type="link"
                                danger
                                onClick={() => handleDeleteOption(option.id)}
                              >
                                Supprimer
                              </Button>,
                            ]}
                          >
                            {option.name}
                          </List.Item>
                        )}
                      />
                    )}
                  </Panel>
                </Collapse>
                <div style={{ marginTop: 8 }}>
                  <b>Type :</b> {attr.product_type?.name || "-"}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <AttributeModalForm
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        attribute={editingAttribute}
        productTypes={productTypes}
      />
    </>
  );
}

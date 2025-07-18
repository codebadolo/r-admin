import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Radio,
  Row,
  Select,
  Spin,
  Typography,
  Upload,
} from "antd";


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createProduct,
  createProductAttributeOption,
  createProductAttributeValue,
  createProductImage,
  createStock,
  fetchBrands,
  fetchCategories,
  fetchProductAttributeOptions,
  fetchProductAttributes,
  fetchProductTypes,
  fetchWarehouses,
} from "../services/productService";

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

export default function AjouterProduit() {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [types, setTypes] = useState([]);
  const [allAttributes, setAllAttributes] = useState([]);
  const [allOptions, setAllOptions] = useState([]);
  const [showAttributes, setShowAttributes] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageFileList, setImageFileList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAttrForNewOption, setCurrentAttrForNewOption] = useState(null);
  const [newOptionValue, setNewOptionValue] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [cat, brd, typ, wh, attrs, opts] = await Promise.all([
          fetchCategories(),
          fetchBrands(),
          fetchProductTypes(),
          fetchWarehouses(),
          fetchProductAttributes(),
          fetchProductAttributeOptions(),
        ]);
        setCategories(cat);
        setBrands(brd);
        setTypes(typ);
        setWarehouses(wh);
        setAllAttributes(attrs);
        setAllOptions(opts);
      } catch {
        message.error("Erreur lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleTypeChange = (typeId) => {
    form.setFieldsValue({ attributeValues: {} }); 

    if (!typeId) {
      setShowAttributes([]);
      return;
    }
    const filteredAttrs = allAttributes.filter(
      (attr) =>
        attr.product_type === typeId ||
        attr.product_type?.id === typeId
    );
    setShowAttributes(filteredAttrs);
  };

  const getOptionsForAttribute = (attrId) =>
    allOptions.filter(
      (opt) => opt.attribute === attrId || opt.attribute?.id === attrId
    );

  const openNewOptionModal = (attr) => {
    setCurrentAttrForNewOption(attr);
    setNewOptionValue("");
    setModalVisible(true);
  };

  const handleAddNewOption = async () => {
    if (!newOptionValue.trim()) {
      message.warning("Merci d'indiquer une valeur.");
      return;
    }
    setSubmitting(true);
    try {
      await createProductAttributeOption({
        attribute: currentAttrForNewOption.id,
        value: newOptionValue.trim(),
      });
      message.success("Nouvelle valeur ajoutée !");
      const updatedOptions = await fetchProductAttributeOptions();
      setAllOptions(updatedOptions);

      const newOption = updatedOptions.find(
        (o) =>
          (o.attribute === currentAttrForNewOption.id ||
            o.attribute?.id === currentAttrForNewOption.id) &&
          o.value.toLowerCase() === newOptionValue.trim().toLowerCase()
      );
      if (newOption) {
        const currentAttributes = form.getFieldValue("attributeValues") || {};
        const updatedAttributes = {
          ...currentAttributes,
          [currentAttrForNewOption.id]: newOption.id,
        };
        form.setFieldsValue({ attributeValues: updatedAttributes });
      }
      setModalVisible(false);
    } catch {
      message.error("Erreur lors de la création de la valeur.");
    }
    setSubmitting(false);
  };

  const handleImageChange = ({ fileList }) => {
    const limitedList = fileList.slice(0, 5).map((f, i) => ({
      ...f,
      is_feature: f.is_feature !== undefined ? f.is_feature : i === 0,
      alt_text: f.alt_text || "",
    }));
    setImageFileList(limitedList);
  };

  const setFeatureImage = (uid) => {
    setImageFileList((list) =>
      list.map((file) => ({
        ...file,
        is_feature: file.uid === uid,
      }))
    );
  };

  const setAltText = (uid, text) => {
    setImageFileList((list) =>
      list.map((file) => (file.uid === uid ? { ...file, alt_text: text } : file))
    );
  };

  const removeImage = (uid) => {
    setImageFileList((list) => list.filter((file) => file.uid !== uid));
  };

  // Récupération dynamique de la valeur entrepôt sélectionnée
  const selectedWarehouse = Form.useWatch("warehouse", form);

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const product = await createProduct({
        name: values.name,
        description: values.description,
        price: values.price,
        category_id: values.category,
        brand_id: values.brand,
        product_type_id: values.product_type,
      });

      for (const attr of showAttributes) {
        const optionId = values.attributeValues?.[attr.id];
        if (optionId) {
          await createProductAttributeValue({ product: product.id, option: optionId });
        }
      }

      if (values.stock_units && values.warehouse) {
        await createStock({
          product: product.id,
          warehouse_id: values.warehouse,
          units: values.stock_units,
          units_sold: 0,
        });
      }

      for (const fileObj of imageFileList) {
        const formData = new FormData();
        formData.append("product", product.id);
        formData.append("image", fileObj.originFileObj || fileObj);
        formData.append("is_feature", fileObj.is_feature ? "true" : "false");
        formData.append("alt_text", fileObj.alt_text || "");

        await createProductImage(formData);
      }

      message.success("Produit ajouté avec succès !");
      form.resetFields();
      setImageFileList([]);
      setShowAttributes([]);
      navigate(`/products/${product.id}`);
    } catch (error) {
      message.error(
        "Erreur lors de la création du produit : " +
          (error.response?.data || error.message || "")
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Spin tip="Chargement..." style={{ display: "block", margin: "60px auto" }} />;
  }

  return (
    <>
      <Card title="Ajouter un nouveau produit" style={{ maxWidth: 900, margin: "auto" }}>
        <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label="Nom du produit"
                rules={[{ required: true, message: "Ce champ est obligatoire" }]}
              >
                <Input />
              </Form.Item>

              <Form.Item name="description" label="Description">
                <TextArea rows={3} />
              </Form.Item>

              <Form.Item
                name="price"
                label="Prix (€)"
                rules={[
                  { required: true, message: "Ce champ est obligatoire" },
                  { type: "number", min: 0, message: "Le prix doit être positif" },
                ]}
              >
                <InputNumber style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="category"
                label="Catégorie"
                rules={[{ required: true, message: "Sélection obligatoire" }]}
              >
                <Select showSearch placeholder="Choisir une catégorie" optionFilterProp="children">
                  {categories.map((cat) => (
                    <Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="brand"
                label="Marque"
                rules={[{ required: true, message: "Sélection obligatoire" }]}
              >
                <Select showSearch placeholder="Choisir une marque" optionFilterProp="children">
                  {brands.map((brand) => (
                    <Option key={brand.id} value={brand.id}>
                      {brand.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="product_type"
                label="Type de produit"
                rules={[{ required: true, message: "Sélection obligatoire" }]}
              >
                <Select
                  showSearch
                  onChange={handleTypeChange}
                  placeholder="Choisir un type"
                  optionFilterProp="children"
                >
                  {types.map((type) => (
                    <Option key={type.id} value={type.id}>
                      {type.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="warehouse"
                label="Entrepôt"
                rules={[{ required: true, message: "Sélection obligatoire de l'entrepôt" }]}
              >
                <Select allowClear showSearch placeholder="Choisir un entrepôt" optionFilterProp="children">
                  {warehouses.map((wh) => (
                    <Option key={wh.id} value={wh.id}>
                      {wh.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {selectedWarehouse && (
                <Form.Item
                  name="stock_units"
                  label="Stock initial (unités)"
                  rules={[
                    { required: true, message: "Veuillez saisir le stock initial" },
                    { type: "number", min: 0, message: "Le stock doit être positif" },
                  ]}
                >
                  <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>
              )}
            </Col>
          </Row>

          {showAttributes.length > 0 && (
            <Card
              type="inner"
              size="small"
              title="Spécifications techniques"
              style={{ marginTop: 24 }}
            >
              <Row gutter={16}>
                {showAttributes.map((attr) => (
                  <Col span={12} key={attr.id}>
                    <Form.Item
                      name={["attributeValues", attr.id]}
                      label={attr.name}
                      rules={[
                        {
                          required: true,
                          message: `Sélectionnez une valeur pour ${attr.name}`,
                        },
                      ]}
                    >
                      <Select
                        placeholder={`Choisir une valeur pour ${attr.name}`}
                        showSearch
                        optionFilterProp="children"
                        dropdownRender={(menu) => (
                          <>
                            {menu}
                            <div style={{ padding: 8, display: "flex" }}>
                              <Button
                                type="link"
                                icon={<PlusOutlined />}
                                onClick={() => openNewOptionModal(attr)}
                                style={{ padding: 0 }}
                              >
                                Ajouter une nouvelle valeur
                              </Button>
                            </div>
                          </>
                        )}
                      >
                        {getOptionsForAttribute(attr.id).map((opt) => (
                          <Option key={opt.id} value={opt.id}>
                            {opt.value}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                ))}
              </Row>
            </Card>
          )}

          <Form.Item label="Photos (max 5)" style={{ marginTop: 24 }}>
            <Upload
              accept="image/*"
              multiple
              maxCount={5}
              listType="picture"
              fileList={imageFileList}
              beforeUpload={() => false}
              onChange={handleImageChange}
            >
              <Button icon={<UploadOutlined />}>Ajouter des photos</Button>
            </Upload>

            {imageFileList.length > 0 && (
              <div style={{ marginTop: 12 }}>
                {imageFileList.map((file) => (
                  <div
                    key={file.uid}
                    style={{ display: "flex", alignItems: "center", marginBottom: 8 }}
                  >
                    <Radio
                      checked={file.is_feature}
                      onChange={() => setFeatureImage(file.uid)}
                      style={{ marginRight: 12 }}
                    >
                      Image principale
                    </Radio>
                    <Input
                      placeholder="Description de l'image"
                      value={file.alt_text}
                      onChange={(e) => setAltText(file.uid, e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <Button
                      danger
                      size="small"
                      onClick={() => removeImage(file.uid)}
                      style={{ marginLeft: 12 }}
                    >
                      Supprimer
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" loading={submitting} block>
              Ajouter le produit
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Modal
        title={
          currentAttrForNewOption ? `Ajouter une valeur pour ${currentAttrForNewOption.name}` : ""
        }
        visible={modalVisible}
        onOk={handleAddNewOption}
        onCancel={() => setModalVisible(false)}
        confirmLoading={submitting}
        okText="Ajouter"
        cancelText="Annuler"
      >
        <Input
          placeholder="Nouvelle valeur"
          value={newOptionValue}
          onChange={(e) => setNewOptionValue(e.target.value)}
          onPressEnter={handleAddNewOption}
          autoFocus
        />
      </Modal>
    </>
  );
}

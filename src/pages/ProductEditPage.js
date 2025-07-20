import { ArrowLeftOutlined, PlusOutlined, SaveOutlined, UploadOutlined } from "@ant-design/icons";
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
  Space,
  Spin,
  Tag,
  Typography,
  Upload,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  createProductAttributeOption,
  createProductAttributeValue,
  createProductImage,
  deleteProductImage,
  fetchBrands,
  fetchCategories,
  fetchProduct,
  fetchProductAttributeOptions,
  fetchProductAttributes,
  fetchProductAttributeValues,
  fetchProductImages,
  fetchProductTypes,
  fetchStocks,
  fetchWarehouses,
  updateProduct,
  updateProductAttributeValue,
  updateStock,
} from "../services/productService";

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

export default function ProductEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [types, setTypes] = useState([]);
  const [allAttributes, setAllAttributes] = useState([]);
  const [allOptions, setAllOptions] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [showAttributes, setShowAttributes] = useState([]);
  const [attributeValuesMap, setAttributeValuesMap] = useState({}); // attrId -> ProductAttributeValueId

  const [stock, setStock] = useState(null);
  const [imageFileList, setImageFileList] = useState([]);

  // Modal states for adding new attribute option
  const [modalVisible, setModalVisible] = useState(false);
  const [currentAttrForNewOption, setCurrentAttrForNewOption] = useState(null);
  const [newOptionValue, setNewOptionValue] = useState("");

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        categoriesData,
        brandsData,
        typesData,
        warehousesData,
        attributesData,
        optionsData,
        productData,
        attributeValuesData,
        stocksData,
        imagesData,
      ] = await Promise.all([
        fetchCategories(),
        fetchBrands(),
        fetchProductTypes(),
        fetchWarehouses(),
        fetchProductAttributes(),
        fetchProductAttributeOptions(),
        fetchProduct(id),
        fetchProductAttributeValues({ product: id }),
        fetchStocks({ product: id }),
        fetchProductImages({ product: id }),
      ]);

      setCategories(categoriesData);
      setBrands(brandsData);
      setTypes(typesData);
      setWarehouses(warehousesData);
      setAllAttributes(attributesData);
      setAllOptions(optionsData);
      setProduct(productData);

      // Prefill form fields
      form.setFieldsValue({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        brand: productData.brand,
        product_type: productData.product_type,
      });

      // Filter attributes by product_type
      const filteredAttributes = attributesData.filter(
        (attr) =>
          attr.product_type === productData.product_type ||
          attr.product_type?.id === productData.product_type
      );
      setShowAttributes(filteredAttributes);

      // Map attrId -> ProductAttributeValueId and prefill attribute select values
      const attrValInit = {};
      const attrValMap = {};
      attributeValuesData.forEach((av) => {
        const attrId = av.option.attribute?.id || av.option.attribute;
        if (attrId && av.option.id) {
          attrValInit[attrId] = av.option.id;
          attrValMap[attrId] = av.id;
        }
      });
      setAttributeValuesMap(attrValMap);
      form.setFieldsValue({ attributeValues: attrValInit });

      // Stock and warehouse prefill
      if (stocksData.length > 0) {
        setStock(stocksData[0]);
        form.setFieldsValue({
          warehouse: stocksData[0].warehouse_id,
          stock_units: stocksData[0].units,
        });
      }

      // Images prefill for Upload
      setImageFileList(
        imagesData.map((img) => ({
          uid: `img-${img.id}`,
          name: img.image.split("/").pop(),
          status: "done",
          url: img.image,
          is_feature: img.is_feature,
          alt_text: img.alt_text,
          id: img.id,
        }))
      );
    } catch (e) {
      message.error("Erreur lors du chargement des données : " + e.message);
    } finally {
      setLoading(false);
    }
  }, [form, id]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleTypeChange = (typeId) => {
    if (!typeId) {
      setShowAttributes([]);
      form.setFieldsValue({ attributeValues: {} });
      return;
    }
    const filtered = allAttributes.filter(
      (attr) => attr.product_type === typeId || attr.product_type?.id === typeId
    );
    setShowAttributes(filtered);
    form.setFieldsValue({ attributeValues: {} });
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
      setModalVisible(false);
    } catch (err) {
      message.error("Erreur lors de la création de la valeur.");
    }
    setSubmitting(false);
  };

  const handleImageChange = ({ fileList }) => {
    // Limit max 5 images, preserve custom fields
    setImageFileList(
      fileList.slice(0, 5).map((file) => ({
        ...file,
        is_feature: file.is_feature ?? false,
        alt_text: file.alt_text ?? "",
      }))
    );
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

  const removeImage = async (file) => {
    if (file.id) {
      try {
        await deleteProductImage(file.id);
        message.success("Image supprimée");
      } catch {
        message.error("Erreur lors de la suppression de l'image");
        return;
      }
    }
    setImageFileList((list) => list.filter((f) => f.uid !== file.uid));
  };

  const selectedWarehouse = Form.useWatch("warehouse", form);

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      await updateProduct(id, {
        name: values.name,
        description: values.description,
        price: values.price,
        category_id: values.category,
        brand_id: values.brand,
        product_type_id: values.product_type,
      });

      const attrVals = values.attributeValues || {};

      for (const attr of showAttributes) {
        const optId = attrVals[attr.id];
        if (!optId) continue;

        const existingAttrValId = attributeValuesMap[attr.id];
        if (existingAttrValId) {
          await updateProductAttributeValue(existingAttrValId, {
            option: optId,
          });
        } else {
          await createProductAttributeValue({
            product: parseInt(id),
            option: optId,
          });
        }
      }

      if (stock && values.stock_units != null && values.warehouse) {
        await updateStock(stock.id, {
          product: parseInt(id),
          warehouse_id: values.warehouse,
          units: values.stock_units,
          units_sold: stock.units_sold || 0,
        });
      }

      for (const fileObj of imageFileList) {
        if (!fileObj.id) {
          const formData = new FormData();
          formData.append("product", id);
          formData.append("image", fileObj.originFileObj || fileObj);
          formData.append("is_feature", fileObj.is_feature ? "true" : "false");
          formData.append("alt_text", fileObj.alt_text || "");
          await createProductImage(formData);
        }
      }

      message.success("Produit modifié avec succès !");
      navigate(`/products/${id}`);
    } catch (err) {
      message.error("Erreur lors de la modification du produit : " + (err.response?.data || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Spin tip="Chargement..." style={{ display: "block", margin: "auto", marginTop: 60 }} />
    );
  }

  return (
    <Card
      title={
        <Space align="center" wrap>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
          <Title level={4} style={{ margin: 0 }}>
            Modifier - {product?.name || ""}
          </Title>
          <Tag color={product?.is_active ? "green" : "red"}>
            {product?.is_active ? "Actif" : "Inactif"}
          </Tag>
        </Space>
      }
      style={{ maxWidth: 900, margin: "auto" }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
        <Row gutter={24}>
          <Col span={16}>
            <Form.Item
              name="name"
              label="Nom du produit"
              rules={[{ required: true, message: "Ce champ est obligatoire" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <TextArea rows={4} />
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
                placeholder="Choisir un type"
                optionFilterProp="children"
                onChange={handleTypeChange}
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
              rules={[{ required: true, message: "Sélection obligatoire" }]}
            >
              <Select allowClear placeholder="Choisir un entrepôt" optionFilterProp="children" showSearch>
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
    label="Stock (unités)"
    rules={[
      { required: true, message: "Veuillez saisir le stock" },
      { type: "number", min: 0, message: "Le stock doit être positif" },
    ]}
  >
    <InputNumber min={0} style={{ width: "100%" }} />
  </Form.Item>
)}
          </Col>
        </Row>

        {showAttributes.length > 0 && (
          <Card size="small" type="inner" title="Spécifications techniques" style={{ marginTop: 24 }}>
            <Row gutter={24}>
              {showAttributes.map((attr) => (
                <Col span={12} key={attr.id}>
                  <Form.Item
                    label={attr.name}
                    name={["attributeValues", attr.id]}
                    rules={[{ required: true, message: "Valeur obligatoire" }]}
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
            onRemove={removeImage}
          >
            <Button icon={<UploadOutlined />}>Ajouter / Modifier des photos</Button>
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
                    onClick={() => removeImage(file)}
                    style={{ marginLeft: 12 }}
                  >
                    Supprimer
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Form.Item>

        <Form.Item>
          <Button type="primary" icon={<SaveOutlined />} htmlType="submit" loading={submitting} block>
            Enregistrer les modifications
          </Button>
        </Form.Item>
      </Form>

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
    </Card>
  );
}

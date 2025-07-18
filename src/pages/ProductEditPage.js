import {
    PlusOutlined,
    UploadOutlined,
} from "@ant-design/icons";
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
    Upload
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    createProductAttributeOption,
    createProductAttributeValue,
    createProductImage,
    createStock,
    deleteProductImage,
    fetchBrands,
    fetchCategories,
    fetchProduct,
    fetchProductAttributeOptions,
    fetchProductAttributes,
    fetchProductAttributeValues,
    fetchProductTypes,
    fetchStocks,
    fetchWarehouses,
    patchProduct,
    updateProductAttributeValue,
    updateProductImage,
    updateStock,
} from "../services/productService";

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

export default function ProductEditPage() {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [product, setProduct] = useState(null);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [types, setTypes] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [attributeOptions, setAttributeOptions] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [showAttributes, setShowAttributes] = useState([]);
  const [attributeValuesMap, setAttributeValuesMap] = useState({});

  const [stocksMap, setStocksMap] = useState({});
  const [imageFileList, setImageFileList] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [currentAttrForNewOption, setCurrentAttrForNewOption] = useState(null);
  const [newOptionValue, setNewOptionValue] = useState("");

  const updateShowAttributes = useCallback(
    (typeId, allAttrs = attributes) => {
      if (!typeId) {
        setShowAttributes([]);
        return;
      }
      const filteredAttrs = allAttrs.filter(
        (attr) => attr.product_type === typeId || attr.product_type?.id === typeId
      );
      setShowAttributes(filteredAttrs);
    },
    [attributes]
  );

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [
          prod,
          cats,
          brd,
          tps,
          whs,
          attrs,
          opts,
          stocks,
          attrVals,
        ] = await Promise.all([
          fetchProduct(id),
          fetchCategories(),
          fetchBrands(),
          fetchProductTypes(),
          fetchWarehouses(),
          fetchProductAttributes(),
          fetchProductAttributeOptions(),
          fetchStocks({ product: id }),
          fetchProductAttributeValues({ product: id }),
        ]);
        if (!mounted) return;

        setProduct(prod);
        setCategories(cats);
        setBrands(brd);
        setTypes(tps);
        setWarehouses(whs);
        setAttributes(attrs);
        setAttributeOptions(opts);

        form.setFieldsValue({
          name: prod.name,
          description: prod.description,
          price: Number(prod.price),
          category: prod.category_id,
          brand: prod.brand_id,
          product_type: prod.product_type_id,
        });

        const avMap = {};
        attrVals.forEach((av) => {
          avMap[av.option.attribute] = av.option.id;
        });
        setAttributeValuesMap(avMap);

        updateShowAttributes(prod.product_type_id, attrs);

        const sMap = {};
        stocks.forEach((stock) => {
          sMap[stock.warehouse_id] = { id: stock.id, units: stock.units ?? 0 };
        });
        setStocksMap(sMap);

        const files = (prod.images || []).map((img) => ({
          uid: String(img.id),
          id: img.id,
          name: `image_${img.id}`,
          status: "done",
          url: img.image,
          is_feature: !!img.is_feature,
          alt_text: img.alt_text || "",
        }));
        setImageFileList(files);
      } catch (e) {
        message.error("Erreur lors du chargement des données");
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [id, form, updateShowAttributes]);

  const handleTypeChange = (typeId) => {
    form.setFieldsValue({ attributeValues: {} });
    setAttributeValuesMap({});
    updateShowAttributes(typeId);
  };

  const getOptionsForAttribute = (attrId) =>
    attributeOptions.filter(
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
      setAttributeOptions(updatedOptions);

      const newOpt = updatedOptions.find(
        (o) =>
          (o.attribute === currentAttrForNewOption.id ||
            o.attribute?.id === currentAttrForNewOption.id) &&
          o.value.toLowerCase() === newOptionValue.trim().toLowerCase()
      );
      if (newOpt) {
        const currentAttrs = form.getFieldValue("attributeValues") || {};
        const updatedAttrs = {
          ...currentAttrs,
          [currentAttrForNewOption.id]: newOpt.id,
        };
        form.setFieldsValue({ attributeValues: updatedAttrs });
        setAttributeValuesMap((av) => ({ ...av, [currentAttrForNewOption.id]: newOpt.id }));
      }
      setModalVisible(false);
    } catch (e) {
      message.error("Erreur lors de la création de la valeur.");
      console.error(e);
    }
    setSubmitting(false);
  };

  const handleImageChange = ({ fileList }) => {
    const limited = fileList.slice(0, 5).map((file, idx) => {
      const prev = imageFileList.find((f) => f.uid === file.uid);
      return {
        ...file,
        is_feature: prev ? prev.is_feature : idx === 0,
        alt_text: prev ? prev.alt_text : "",
      };
    });
    setImageFileList(limited);
  };

  const setFeatureImage = (uid) => {
    setImageFileList((files) =>
      files.map((f) => ({ ...f, is_feature: f.uid === uid }))
    );
  };

  const setAltText = (uid, text) => {
    setImageFileList((files) =>
      files.map((f) => (f.uid === uid ? { ...f, alt_text: text } : f))
    );
  };

  const removeImage = (uid) => {
    setImageFileList((files) => files.filter((f) => f.uid !== uid));
  };

  const onAttributeValueChange = (attrId, optionId) => {
    setAttributeValuesMap((av) => ({
      ...av,
      [attrId]: optionId,
    }));
  };

  const setStockUnits = (warehouseId, units) => {
    setStocksMap((s) => ({
      ...s,
      [warehouseId]: { ...(s[warehouseId] || {}), units: Number(units) },
    }));
  };

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      await patchProduct(id, {
        name: values.name,
        description: values.description,
        price: values.price,
        category_id: values.category,
        brand_id: values.brand,
        product_type_id: values.product_type,
      });

      const currentAV = product.attribute_values || [];
      for (const [attrIdStr, optionId] of Object.entries(attributeValuesMap)) {
        const attrId = Number(attrIdStr);
        const existingValue = currentAV.find((av) => av.option.attribute === attrId);
        if (existingValue) {
          if (existingValue.option.id !== optionId) {
            await updateProductAttributeValue(existingValue.id, { option: optionId });
          }
        } else {
          await createProductAttributeValue({ product: id, option: optionId });
        }
      }

      for (const [warehouseIdStr, stockData] of Object.entries(stocksMap)) {
        const warehouseId = Number(warehouseIdStr);
        if (stockData.id) {
          await updateStock(stockData.id, { units: stockData.units });
        } else {
          await createStock({ product: id, warehouse: warehouseId, units: stockData.units });
        }
      }

      for (const file of imageFileList) {
        if (file.originFileObj) {
          const formData = new FormData();
          formData.append("product", id);
          formData.append("image", file.originFileObj);
          formData.append("is_feature", file.is_feature ? "true" : "false");
          formData.append("alt_text", file.alt_text || "");
          await createProductImage(formData);
        } else if (file.id) {
          await updateProductImage(file.id, {
            is_feature: file.is_feature,
            alt_text: file.alt_text || "",
          });
        }
      }

      const keptIds = imageFileList.filter((f) => f.id).map((f) => f.id);
      for (const img of product.images || []) {
        if (!keptIds.includes(img.id)) {
          await deleteProductImage(img.id);
        }
      }

      message.success("Produit mis à jour avec succès");
      navigate(`/products/${id}`);
    } catch (e) {
      message.error("Erreur lors de la mise à jour : " + (e.message || ""));
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Spin tip="Chargement..." style={{ display: "block", margin: "60px auto" }} />
    );
  }

  return (
    <>
      <Card title={`Modifier le produit #${id}`} style={{ maxWidth: 900, margin: "auto" }}>
        <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
          {/* Général */}
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label="Nom du produit"
                rules={[{ required: true, message: "Champ obligatoire" }]}
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
                  { required: true, message: "Champ obligatoire" },
                  { type: "number", min: 0, message: "Prix positif requis" },
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
                    <Option key={cat.id} value={cat.id}>{cat.name}</Option>
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
                    <Option key={brand.id} value={brand.id}>{brand.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="product_type"
                label="Type de produit"
                rules={[{ required: true, message: "Sélection obligatoire" }]}
              >
                <Select onChange={handleTypeChange} showSearch placeholder="Choisir un type" optionFilterProp="children">
                  {types.map((type) => (
                    <Option key={type.id} value={type.id}>{type.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Attributs dynamiques */}
          {showAttributes.length > 0 && (
            <Card type="inner" size="small" title="Spécifications techniques" style={{ marginTop: 24 }}>
              <Row gutter={16}>
                {showAttributes.map((attr) => (
                  <Col span={12} key={attr.id}>
                    <Form.Item
                      name={["attributeValues", attr.id]}
                      label={attr.name}
                      rules={[{ required: true, message: `Sélectionnez une valeur pour ${attr.name}` }]}
                    >
                      <Select
                        placeholder={`Choisir une valeur pour ${attr.name}`}
                        showSearch
                        optionFilterProp="children"
                        dropdownRender={(menu) => (
                          <>
                            {menu}
                            <div style={{ padding: 8, display: "flex" }}>
                              <Button type="link" icon={<PlusOutlined />} onClick={() => openNewOptionModal(attr)} style={{ padding: 0 }}>
                                Ajouter une nouvelle valeur
                              </Button>
                            </div>
                          </>
                        )}
                        onChange={(val) => onAttributeValueChange(attr.id, val)}
                        value={attributeValuesMap[attr.id]}
                      >
                        {getOptionsForAttribute(attr.id).map((opt) => (
                          <Option key={opt.id} value={opt.id}>{opt.value}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                ))}
              </Row>
            </Card>
          )}

          {/* Stocks */}
          <Card type="inner" size="small" title="Stocks par entrepôt" style={{ marginTop: 24 }}>
            <Row gutter={16}>
              {warehouses.map((wh) => {
                const stock = stocksMap[wh.id] || { units: 0 };
                return (
                  <Col span={12} key={wh.id}>
                    <Form.Item label={wh.name}>
                      <InputNumber min={0} style={{ width: "100%" }} value={stock.units} onChange={(val) => setStockUnits(wh.id, val)} />
                    </Form.Item>
                  </Col>
                );
              })}
            </Row>
          </Card>

          {/* Images */}
          <Form.Item label="Photos du produit" style={{ marginTop: 24 }}>
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
                  <div key={file.uid} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                    <Radio checked={file.is_feature} onChange={() => setFeatureImage(file.uid)} style={{ marginRight: 12 }}>
                      Image principale
                    </Radio>
                    <Input placeholder="Description de l'image" value={file.alt_text} onChange={(e) => setAltText(file.uid, e.target.value)} style={{ flex: 1 }} />
                    <Button danger size="small" onClick={() => removeImage(file.uid)} style={{ marginLeft: 12 }}>
                      Supprimer
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" loading={submitting} block>
              Sauvegarder les modifications
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Modal pour ajouter nouvelle valeur attribut */}
      <Modal
        title={currentAttrForNewOption ? `Ajouter une valeur pour ${currentAttrForNewOption.name}` : ""}
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

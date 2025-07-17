import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Collapse,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Switch,
  message
} from "antd";
import { useEffect, useState } from "react";
import {
  createProduct,
  fetchBrands,
  fetchCategories,
  fetchCleSpecifications,
  fetchProductTypeAttributesByProductType,
  fetchProductTypes,
  fetchSectionSpecifications
} from "../services/productService";

const { Option } = Select;
const { Panel } = Collapse;

export default function AjouterProduit() {
  const [form] = Form.useForm();
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [typeAttributes, setTypeAttributes] = useState([]);
  const [sections, setSections] = useState([]);
  const [cleSpecifications, setCleSpecifications] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [
          brandsData,
          categoriesData,
          typesData,
          sectionsData,
          cleSpecsData,
        ] = await Promise.all([
          fetchBrands(),
          fetchCategories(),
          fetchProductTypes(),
          fetchSectionSpecifications(),
          fetchCleSpecifications(),
        ]);
        setBrands(brandsData.data);
        setCategories(categoriesData.data.filter((c) => c.is_active));
        setProductTypes(typesData.data);
        setSections(sectionsData.data);
        setCleSpecifications(cleSpecsData.data);
      } catch {
        message.error("Erreur lors du chargement des données");
      }
    }
    loadData();
  }, []);

  // Charger les attributs dynamiques selon le type choisi
  const onTypeChange = async (value) => {
    if (!value) {
      setTypeAttributes([]);
      form.setFieldsValue({ attributes: {} });
      return;
    }
    try {
      const res = await fetchProductTypeAttributesByProductType(value);
      setTypeAttributes(res.data);
      form.setFieldsValue({ attributes: {} });
    } catch {
      message.error("Erreur chargement des attributs");
    }
  };

  // Filtrer les clés de spécifications par section
  const filteredCleSpecs = (sectionId) =>
    cleSpecifications.filter(
      (cle) => cle.section === sectionId || (cle.section && cle.section.id === sectionId)
    );

  // Soumission - formater selon serializer backend (sans product ni product_inventory)
  const onFinish = async (values) => {
    try {
      const inventories = (values.inventories || []).map((inv) => ({
        sku: inv.sku,
        upc: inv.upc,
        product_type: inv.product_type,
        brand: inv.brand,
        attributes: (inv.attributes || []).map((a) => ({
          product_attribute_value: a.product_attribute_value,
        })),
        is_active: inv.is_active,
        is_default: inv.is_default,
        retail_price: inv.retail_price,
        store_price: inv.store_price,
        is_digital: inv.is_digital || false,
        weight: inv.weight,
        stock: inv.stock ? { units: inv.stock.units, units_sold: inv.stock.units_sold || 0 } : undefined,
      }));

      const specifications = (values.specifications || []).map((spec) => ({
        cle_specification: spec.cle_specification,
        value: spec.value,
      }));

      const payload = {
        web_id: values.web_id,
        name: values.name,
        description: values.description,
        category: values.category,
        brand: values.brand,
        product_type: values.product_type,
        is_active: values.is_active,
        inventories,
        specifications,
      };

      await createProduct(payload);
      message.success("Produit créé avec succès !");
      form.resetFields();
    } catch {
      message.error("Erreur lors de la création");
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ is_active: true }}>
      <Card title="Informations générales" style={{ marginBottom: 24 }}>
        <Form.Item name="web_id" label="Web ID" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="name" label="Nom" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description" rules={[{ required: true }]}>
          <Input.TextArea rows={4} />
        </Form.Item>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="category" label="Catégorie" rules={[{ required: true }]}>
              <Select placeholder="Sélectionnez une catégorie">
                {categories.map((c) => (
                  <Option key={c.id} value={c.id}>{c.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="brand" label="Marque" rules={[{ required: true }]}>
              <Select placeholder="Sélectionnez une marque">
                {brands.map((b) => (
                  <Option key={b.id} value={b.id}>{b.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="product_type"
              label="Type de produit"
              rules={[{ required: true }]}
            >
              <Select placeholder="Sélectionnez un type" onChange={onTypeChange}>
                {productTypes.map((pt) => (
                  <Option key={pt.id} value={pt.id}>{pt.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="is_active" label="Produit actif ?" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Card>

      <Card title="Attributs du type" style={{ marginBottom: 24 }}>
        {typeAttributes.length === 0 ? (
          <em>Choisissez un type de produit pour afficher les attributs</em>
        ) : (
          typeAttributes.map(({ product_attribute }) => (
            <Form.Item
              key={product_attribute.id}
              label={product_attribute.name}
              name={['attributes', product_attribute.id]}
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          ))
        )}
      </Card>

      <Card title="Variantes" style={{ marginBottom: 24 }}>
        <Form.List name="inventories">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...rest }) => (
                <Card
                  key={key}
                  type="inner"
                  title={`Variante ${key + 1}`}
                  extra={<Button danger onClick={() => remove(name)}>Supprimer</Button>}
                  style={{ marginBottom: 16 }}
                >
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item {...rest} name={[name, 'sku']} label="SKU" rules={[{ required: true }]}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item {...rest} name={[name, 'upc']} label="UPC">
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item {...rest} name={[name, 'product_type']} label="Type variante" rules={[{ required: true }]}>
                        <Select placeholder="Type variante">
                          {productTypes.map(pt => (
                            <Option key={pt.id} value={pt.id}>{pt.name}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item {...rest} name={[name, 'brand']} label="Marque variante" rules={[{ required: true }]}>
                        <Select placeholder="Marque">
                          {brands.map(b => (
                            <Option key={b.id} value={b.id}>{b.name}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item {...rest} name={[name, 'retail_price']} label="Prix détail" rules={[{ required: true }]}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item {...rest} name={[name, 'store_price']} label="Prix magasin" rules={[{ required: true }]}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item {...rest} name={[name, 'is_active']} label="Active ?" valuePropName="checked" initialValue={true}>
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item {...rest} name={[name, 'is_default']} label="Par défaut ?" valuePropName="checked">
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item {...rest} name={[name, 'weight']} label="Poids (kg)">
                        <InputNumber min={0} step={0.001} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>
                  {/* Attributs variant */}
                  <Form.List name={[name, 'attributes']}>
                    {(attrs, { add: addAttr, remove: removeAttr }) => (
                      <>
                        {attrs.map(({ key: attrKey, name: attrName, ...attrRest }) => (
                          <Row key={attrKey} gutter={16} align="middle">
                            <Col span={20}>
                              <Form.Item
                                {...attrRest}
                                label="Valeur d'attribut (ID)"
                                name={attrName}
                                rules={[{ required: true }]}
                              >
                                <InputNumber min={1} style={{ width: '100%' }} />
                              </Form.Item>
                            </Col>
                            <Col span={4}>
                              <Button type="link" danger onClick={() => removeAttr(attrName)}>Supprimer</Button>
                            </Col>
                          </Row>
                        ))}
                        <Form.Item>
                          <Button type="dashed" onClick={() => addAttr()} block icon={<PlusOutlined />}>
                            Ajouter valeur attribut
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </Card>
              ))}

              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Ajouter variante
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Card>

      <Card title="Spécifications" style={{ marginBottom: 24 }}>
        <Collapse>
          {sections.map(section => (
            <Panel key={section.id} header={section.name}>
              <Form.List name="specifications">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...rest }) => (
                      <Row key={key} gutter={16} align="middle" style={{ marginBottom: 8 }}>
                        <Col span={10}>
                          <Form.Item {...rest} name={[name, 'cle_specification']} rules={[{ required: true }]} noStyle>
                            <Select placeholder="Clé de spécification">
                              {filteredCleSpecs(section.id).map(cle => (
                                <Option key={cle.id} value={cle.id}>{cle.name}</Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={10}>
                          <Form.Item {...rest} name={[name, 'value']} rules={[{ required: true }]} noStyle>
                            <Input placeholder="Valeur" />
                          </Form.Item>
                        </Col>
                        <Col span={4}>
                          <Button danger onClick={() => remove(name)}>Supprimer</Button>
                        </Col>
                      </Row>
                    ))}

                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Ajouter spécification
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Panel>
          ))}
        </Collapse>
      </Card>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Enregistrer le produit
        </Button>
      </Form.Item>
    </Form>
  );
}

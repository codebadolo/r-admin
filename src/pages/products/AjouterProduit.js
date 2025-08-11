import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Checkbox,
  Typography,
  Space,
  Divider,
  Row,
  Col,
  Steps,
  message,
  Spin,
} from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import * as productService from '../../services/productService';

const { Title } = Typography;
const { Step } = Steps;
const { Option } = Select;

const AjouterProduit = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [specKeys, setSpecKeys] = useState([]);

  // Chargement des listes catégories, marques, spécifications
  useEffect(() => {
    const loadMeta = async () => {
      setLoadingMeta(true);
      try {
        const [catRes, brandsRes, specsRes] = await Promise.all([
          productService.fetchCategories(),
          productService.fetchBrands(),
          productService.fetchSpecKeys(),
        ]);
        setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data.results || []);
        setBrands(Array.isArray(brandsRes.data) ? brandsRes.data : brandsRes.data.results || []);
        setSpecKeys(Array.isArray(specsRes.data) ? specsRes.data : specsRes.data.results || []);
      } catch (err) {
        message.error('Erreur lors du chargement des données');
        console.error(err);
      } finally {
        setLoadingMeta(false);
      }
    };
    loadMeta();
  }, []);

  const steps = [
    {
      title: 'Infos générales',
      content: (
        <>
          <Form.Item
            label="Nom"
            name="nom"
            rules={[{ required: true, message: 'Le nom est obligatoire' }]}
          >
            <Input placeholder="Nom du produit" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} placeholder="Description (optionnelle)" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Catégorie"
                name="category"
                rules={[{ required: true, message: 'Veuillez sélectionner une catégorie' }]}
              >
                <Select placeholder="Sélectionnez une catégorie" showSearch optionFilterProp="children" allowClear>
                  {categories.map(cat => (
                    <Option key={cat.id} value={cat.id}>
                      {cat.nom}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Marque"
                name="brand"
                rules={[{ required: true, message: 'Veuillez sélectionner une marque' }]}
              >
                <Select placeholder="Sélectionnez une marque" showSearch optionFilterProp="children" allowClear>
                  {brands.map(brand => (
                    <Option key={brand.id} value={brand.id}>
                      {brand.nom}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Prix (€)"
                name="prix"
                rules={[
                  { required: true, message: 'Le prix est obligatoire' },
                  { type: 'number', min: 0, message: 'Le prix doit être positif' },
                ]}
              >
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Stock"
                name="stock"
                rules={[
                  { required: true, message: 'Le stock est obligatoire' },
                  { type: 'number', min: 0, message: 'Le stock doit être positif' },
                ]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="État"
                name="etat"
                rules={[{ required: true, message: 'Veuillez sélectionner un état' }]}
              >
                <Select placeholder="État du produit">
                  <Option value="disponible">Disponible</Option>
                  <Option value="indisponible">Indisponible</Option>
                  <Option value="en rupture">En rupture</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="URL Image" name="image_url">
            <Input placeholder="URL de l'image (optionnelle)" />
          </Form.Item>

          <Form.Item label="Code EAN" name="ean_code">
            <Input placeholder="Code EAN (optionnel)" />
          </Form.Item>

          <Form.Item name="is_active" valuePropName="checked">
            <Checkbox>Produit actif</Checkbox>
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Variantes, Stock & Images',
      content: (
        <>
          <Divider orientation="left">Variantes</Divider>
          <Form.List name="variants">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <div
                    key={key}
                    style={{
                      marginBottom: 12,
                      padding: 12,
                      border: '1px solid #d9d9d9',
                      borderRadius: 6,
                      backgroundColor: '#fafafa',
                    }}
                  >
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Row gutter={16}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            {...restField}
                            label="Nom variante"
                            name={[name, 'nom']}
                            rules={[{ required: true, message: 'Nom de la variante obligatoire' }]}
                          >
                            <Input placeholder="Ex: Couleur" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            {...restField}
                            label="Valeur"
                            name={[name, 'valeur']}
                            rules={[{ required: true, message: 'Valeur obligatoire' }]}
                          >
                            <Input placeholder="Ex: Rouge" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col xs={24} sm={8}>
                          <Form.Item
                            {...restField}
                            label="Prix supplément."
                            name={[name, 'prix_supplémentaire']}
                            rules={[{ type: 'number', min: 0, message: '≥ 0' }]}
                            initialValue={0}
                          >
                            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                          <Form.Item
                            {...restField}
                            label="Stock"
                            name={[name, 'stock']}
                            rules={[{ type: 'number', min: 0, message: '≥ 0' }]}
                            initialValue={0}
                          >
                            <InputNumber min={0} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={8}>
                          <Form.Item {...restField} label="URL image" name={[name, 'image_url']}>
                            <Input placeholder="URL (optionnel)" />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Button
                        type="link"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(name)}
                        style={{ padding: 0 }}
                      >
                        Supprimer la variante
                      </Button>
                    </Space>
                  </div>
                ))}

                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Ajouter une variante
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </>
      ),
    },
    {
      title: 'Spécifications',
      content: (
        <>
          <Form.List name="specifications">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                    <Form.Item
                      {...restField}
                      name={[name, 'spec_key_id']}
                      rules={[{ required: true, message: 'Veuillez sélectionner une clé de spécification' }]}
                    >
                      <Select placeholder="Clé de spécification" style={{ width: 250 }} allowClear showSearch optionFilterProp="children">
                        {specKeys.map(sk => (
                          <Option key={sk.id} value={sk.id}>{sk.nom_attribut}</Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'valeur']}
                      rules={[{ required: true, message: 'Valeur requise' }]}
                    >
                      <Input placeholder="Valeur" style={{ width: 300 }} />
                    </Form.Item>

                    <MinusCircleOutlined
                      onClick={() => remove(name)}
                      style={{ marginTop: 8, fontSize: 20, color: 'red' }}
                      title="Supprimer cette spécification"
                    />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Ajouter une spécification
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </>
      ),
    },
  ];

  const next = async () => {
    try {
      // Valider uniquement les champs de l'étape en cours
      const stepFields = getFieldsForStep(currentStep);
      await form.validateFields(stepFields);
      setCurrentStep(currentStep + 1);
    } catch {
      message.error('Veuillez corriger les erreurs avant de continuer');
    }
  };

  const prev = () => setCurrentStep(currentStep - 1);

  // Détermine quelles clés valider selon l'étape
  const getFieldsForStep = (step) => {
    switch(step) {
      case 0:
        return ['nom', 'category', 'brand', 'prix', 'stock', 'etat'];
      case 1:
        // Variantes : on valide le tableau variants entier
        return ['variants'];
      case 2:
        // Spécifications : forme complète
        return ['specifications'];
      default:
        return [];
    }
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      setLoading(true);
      const values = form.getFieldsValue(true);

      const payload = {
        nom: values.nom,
        description: values.description || '',
        category_id: values.category,
        brand_id: values.brand,
        prix: values.prix,
        stock: values.stock,
        etat: values.etat,
        image_url: values.image_url || '',
        ean_code: values.ean_code || '',
        is_active: values.is_active || false,
        variants: values.variants || [],
        specifications: values.specifications || [],
      };

      await productService.createProduct(payload);
      message.success('Produit créé avec succès !');
      navigate('/products/catalogue');
    } catch (err) {
      message.error('Erreur lors de la création du produit.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingMeta) {
    return (
      <div style={{ marginTop: 60, textAlign: 'center' }}>
        <Spin tip="Chargement des données..." />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: 'auto', padding: 24, backgroundColor: '#fff', borderRadius: 8 }}>
      <Title level={2}>Ajouter un produit</Title>

      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        {steps.map((item) => <Step key={item.title} title={item.title} />)}
      </Steps>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          is_active: true,
          etat: 'disponible',
          prix: 0,
          stock: 0,
          variants: [],
          specifications: [],
        }}
      >
        <div>{steps[currentStep].content}</div>

        <Form.Item>
          <Space style={{ marginTop: 24 }}>
            {currentStep > 0 && <Button onClick={prev}>Précédent</Button>}
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={next}>
                Suivant
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button type="primary" loading={loading} onClick={handleSubmit}>
                Soumettre
              </Button>
            )}
            <Button onClick={() => navigate('/products/catalogue')} disabled={loading}>
              Annuler
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AjouterProduit;

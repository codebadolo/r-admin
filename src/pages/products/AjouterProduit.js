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
  TreeSelect,
  Upload,
} from 'antd';
import {
  PlusOutlined,
  MinusCircleOutlined,
  UploadOutlined,
} from '@ant-design/icons';
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

  // Données métiers à charger
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [specKeys, setSpecKeys] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  // Construire arbre catégories
  const buildCategoryTree = (cats) => {
    const map = {};
    cats.forEach((cat) => {
      map[cat.id] = {
        ...cat,
        title: cat.nom,
        value: cat.id,
        children: [],
      };
    });
    const roots = [];
    cats.forEach((cat) => {
      if (cat.parent_category) {
        if (map[cat.parent_category]) {
          map[cat.parent_category].children.push(map[cat.id]);
        }
      } else {
        roots.push(map[cat.id]);
      }
    });
    return roots;
  };

  // Données redux et regroupements
  const [treeCategories, setTreeCategories] = useState([]);
  const [selectedSpecCategoryId, setSelectedSpecCategoryId] = useState(null);

  useEffect(() => {
    const loadMeta = async () => {
      setLoadingMeta(true);
      try {
        const [catRes, brandsRes, specsRes, whRes] = await Promise.all([
          productService.fetchCategories(),
          productService.fetchBrands(),
          productService.fetchSpecKeys(),
          productService.fetchWarehouses(),
        ]);
        const cats =
          Array.isArray(catRes.data) ? catRes.data : catRes.data.results || [];
        setCategories(cats);
        setTreeCategories(buildCategoryTree(cats));

        setBrands(
          Array.isArray(brandsRes.data)
            ? brandsRes.data
            : brandsRes.data.results || []
        );

        const specs =
          Array.isArray(specsRes.data)
            ? specsRes.data
            : specsRes.data.results || [];
        setSpecKeys(specs);

        setWarehouses(
          Array.isArray(whRes.data) ? whRes.data : whRes.data.results || []
        );
      } catch (err) {
        message.error('Erreur lors du chargement des données');
        console.error(err);
      } finally {
        setLoadingMeta(false);
      }
    };
    loadMeta();
  }, []);

  // Regroupement specKeys par catégorie pour front
  const specsByCategory = React.useMemo(() => {
    const grouped = {};
    specKeys.forEach((sk) => {
      const cat = sk.spec_category;
      if (!grouped[cat.id]) {
        grouped[cat.id] = { category: cat, keys: [] };
      }
      grouped[cat.id].keys.push(sk);
    });
    return Object.values(grouped);
  }, [specKeys]);

  // Spécifications pour catégorie sélectionnée
  const currentSpecCategory = specsByCategory.find(
    (cat) => cat.category.id === selectedSpecCategoryId
  );

  // Fonction résumé (page review)
  const reviewContent = () => {
    const values = form.getFieldsValue(true);

    // Fusionne toutes specs presentes
    const allSpecs = [];
    specsByCategory.forEach(({ category }) => {
      const specsList = values[`specifications_${category.id}`] || [];
      allSpecs.push(...specsList);
    });

    return (
      <>
        <Title level={4}>Résumé du produit</Title>

        <Divider>Informations générales</Divider>
        <p><b>Nom :</b> {values.nom}</p>
        <p><b>Description :</b> {values.description || '(aucune)'}</p>
        <p>
          <b>Catégorie :</b>{' '}
          {categories.find(c => c.id === values.category_id)?.nom || ''}
        </p>
        <p>
          <b>Marque :</b>{' '}
          {brands.find(b => b.id === values.brand_id)?.nom || ''}
        </p>
        <p><b>Prix :</b> {values.prix} €</p>
        <p><b>Stock global :</b> {values.stock}</p>
        <p><b>État :</b> {values.etat}</p>

        <Divider>Variantes</Divider>
        {(values.variants || []).length === 0 ? (
          <p>Aucune variante ajoutée</p>
        ) : (
          values.variants.map((v, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <p>
                <b>{v.nom} :</b> {v.valeur}
              </p>
              <p>Prix supplément. : {v.prix_supplémentaire}</p>
              <p>Stock : {v.stock}</p>
            </div>
          ))
        )}

        <Divider>Spécifications techniques</Divider>
        {allSpecs.length === 0 ? (
          <p>Aucune spécification ajoutée</p>
        ) : (
          allSpecs.map((spec, i) => (
            <p key={i}>
              <b>Clé {spec.spec_key_id || spec.spec_key} :</b> {spec.valeur}
            </p>
          ))
        )}

        <Divider>Stocks par entrepôt</Divider>
        {(values.stock_levels || []).length === 0 ? (
          <p>Aucun stock par entrepôt renseigné</p>
        ) : (
          values.stock_levels.map((sl, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <p>
                <b>Entrepôt :</b>{' '}
                {warehouses.find(w => w.id === sl.warehouse_id)?.nom || ''}
              </p>
              <p>Stock total : {sl.stock_total}</p>
              <p>Stock réservé : {sl.stock_reserve}</p>
              <p>Seuil d’alerte : {sl.seuil_alerte}</p>
            </div>
          ))
        )}
      </>
    );
  };

  // Définition des étapes du wizard
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
                name="category_id"
                rules={[
                  { required: true, message: 'Veuillez sélectionner une catégorie' },
                ]}
              >
                <TreeSelect
                  treeData={treeCategories}
                  placeholder="Sélectionnez une catégorie"
                  treeDefaultExpandAll
                  allowClear
                  showSearch
                  filterTreeNode={(input, node) =>
                    node.title.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Marque"
                name="brand_id"
                rules={[
                  { required: true, message: 'Veuillez sélectionner une marque' },
                ]}
              >
                <Select
                  placeholder="Sélectionnez une marque"
                  showSearch
                  optionFilterProp="children"
                  allowClear
                  style={{ width: '100%' }}
                >
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
                  {
                    validator(_, val) {
                      if (val == null || val >= 0) return Promise.resolve();
                      return Promise.reject(new Error('Le prix doit être positif'));
                    },
                  },
                ]}
              >
                <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={8}>
              <Form.Item
                label="Stock global"
                name="stock"
                rules={[
                  { required: true, message: 'Le stock est obligatoire' },
                  {
                    validator(_, val) {
                      if (val == null || val >= 0) return Promise.resolve();
                      return Promise.reject(new Error('Le stock doit être positif'));
                    },
                  },
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
                <Select placeholder="État du produit" allowClear style={{ width: '100%' }}>
                  <Option value="disponible">Disponible</Option>
                  <Option value="indisponible">Indisponible</Option>
                  <Option value="en rupture">En rupture</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Image principale"
            name="image_file"
            valuePropName="fileList"
            getValueFromEvent={e => (Array.isArray(e) ? e : e && e.fileList)}
            extra="Uploader l’image principale du produit"
          >
            <Upload maxCount={1} beforeUpload={() => false} accept="image/*" listType="picture">
              <Button icon={<UploadOutlined />}>Sélectionner une image</Button>
            </Upload>
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
                          <Form.Item
                            {...restField}
                            label="Image variante"
                            name={[name, 'image_file']}
                            valuePropName="fileList"
                            getValueFromEvent={e =>
                              Array.isArray(e) ? e : e && e.fileList
                            }
                            extra="Uploader une image pour la variante"
                          >
                            <Upload
                              maxCount={1}
                              beforeUpload={() => false}
                              accept="image/*"
                              listType="picture"
                            >
                              <Button icon={<UploadOutlined />}>Sélectionner une image</Button>
                            </Upload>
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
          <Form.Item label="Catégorie de spécifications" required>
            <Select
              placeholder="Sélectionnez une catégorie"
              onChange={value => setSelectedSpecCategoryId(value)}
              allowClear
            >
              {specsByCategory.map(({ category }) => (
                <Option key={category.id} value={category.id}>
                  {category.nom}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {selectedSpecCategoryId && currentSpecCategory && (
            <Form.List name={`specifications_${selectedSpecCategoryId}`}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      key={key}
                      align="baseline"
                      style={{ display: 'flex', marginBottom: 8 }}
                    >
                      <Form.Item
                        {...restField}
                        name={[name, 'spec_key_id']}
                        rules={[
                          {
                            required: true,
                            message: 'Veuillez sélectionner une clé de spécification',
                          },
                        ]}
                      >
                        <Select
                          placeholder="Clé de spécification"
                          style={{ width: 250 }}
                          allowClear
                          showSearch
                          optionFilterProp="children"
                        >
                          {currentSpecCategory.keys.map(sk => (
                            <Option key={sk.id} value={sk.id}>
                              {sk.nom_attribut}
                            </Option>
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
          )}
        </>
      ),
    },

    {
      title: 'Stock & Entrepôts',
      content: (
        <>
          <Divider orientation="left">Stocks par entrepôt</Divider>
          <Form.List name="stock_levels">
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
                      <Form.Item
                        {...restField}
                        name={[name, 'warehouse_id']}
                        label="Entrepôt"
                        rules={[{ required: true, message: 'Choisir un entrepôt' }]}
                      >
                        <Select
                          placeholder="Sélectionner un entrepôt"
                          showSearch
                          optionFilterProp="children"
                          allowClear
                          style={{ width: '100%' }}
                        >
                          {warehouses.map(wh => (
                            <Option key={wh.id} value={wh.id}>
                              {wh.nom}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Row gutter={16}>
                        <Col xs={24} sm={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'stock_total']}
                            label="Stock total"
                            rules={[
                              { required: true, message: 'Stock total obligatoire' },
                              {
                                validator(_, val) {
                                  if (val == null || val >= 0) return Promise.resolve();
                                  return Promise.reject(new Error('Valeur positive requise'));
                                },
                              },
                            ]}
                          >
                            <InputNumber min={0} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'stock_reserve']}
                            label="Stock réservé"
                            rules={[
                              { required: true, message: 'Stock réservé obligatoire' },
                              {
                                validator(_, val) {
                                  if (val == null || val >= 0) return Promise.resolve();
                                  return Promise.reject(new Error('Valeur positive requise'));
                                },
                              },
                            ]}
                          >
                            <InputNumber min={0} style={{ width: '100%' }} />
                          </Form.Item>
                        </Col>

                        <Col xs={24} sm={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'seuil_alerte']}
                            label="Seuil d'alerte"
                            rules={[
                              { required: true, message: 'Seuil d’alerte obligatoire' },
                              {
                                validator(_, val) {
                                  if (val == null || val >= 0) return Promise.resolve();
                                  return Promise.reject(new Error('Valeur positive requise'));
                                },
                              },
                            ]}
                          >
                            <InputNumber min={0} style={{ width: '100%' }} />
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
                        Supprimer cet entrepôt
                      </Button>
                    </Space>
                  </div>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Ajouter un entrepôt
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </>
      ),
    },

    {
      title: 'Revue & Validation',
      content: reviewContent(),
    },
  ];

  // Validation par étape (aucune pour revue)
  const getFieldsForStep = (step) => {
    switch (step) {
      case 0:
        return ['nom', 'category_id', 'brand_id', 'prix', 'stock', 'etat'];
      case 1:
        return ['variants'];
      case 2:
        return selectedSpecCategoryId ? [`specifications_${selectedSpecCategoryId}`] : [];
      case 3:
        return ['stock_levels'];
      case 4:
        return [];
      default:
        return [];
    }
  };

  const next = async () => {
    try {
      const stepFields = getFieldsForStep(currentStep);
      await form.validateFields(stepFields);
      setCurrentStep(currentStep + 1);
    } catch {
      message.error('Veuillez corriger les erreurs avant de continuer');
    }
  };

  const prev = () => setCurrentStep(currentStep - 1);

  // Soumission finale (remonte les images fichier, fusionne specs)
  const handleSubmit = async () => {
    try {
      await form.validateFields();
      setLoading(true);

      const values = form.getFieldsValue(true);

      // Fusionner toutes les spécifications présentes
      const mergedSpecifications = [];
      specsByCategory.forEach(({ category }) => {
        const specsList = values[`specifications_${category.id}`] || [];
        mergedSpecifications.push(...specsList);
      });

      // Préparer les images variant au format fichier
      const variantsData = (values.variants || []).map(v => ({
        ...v,
        image_file: v.image_file && v.image_file.length > 0 ? v.image_file[0].originFileObj : null,
      }));

      // Image produit principale
      const mainImageFile =
        values.image_file && values.image_file.length > 0
          ? values.image_file[0].originFileObj
          : null;

      const payload = {
        nom: values.nom,
        description: values.description || '',
        category_id: values.category_id,
        brand_id: values.brand_id,
        prix: values.prix,
        stock: values.stock,
        etat: values.etat,
        image_file: mainImageFile,
        ean_code: values.ean_code || '',
        is_active: values.is_active || false,
        variants: variantsData,
        specifications: mergedSpecifications,
        stock_levels: values.stock_levels || [],
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
      <div style={{ marginTop: 60, textAlign: 'center', width: '100%' }}>
        <Spin tip="Chargement des données..." />
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '100%',
        width: '100%',
        margin: 'auto',
        padding: 24,
        backgroundColor: '#fff',
        borderRadius: 8,
      }}
    >
      <Title level={2}>Ajouter un produit</Title>

      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        {steps.map((item) => (
          <Step key={item.title} title={item.title} />
        ))}
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
          stock_levels: [],
        }}
        style={{ width: '100%' }}
      >
        <div style={{ width: '100%' }}>{steps[currentStep].content}</div>

        <Form.Item style={{ marginTop: 24 }}>
          <Space>
            {currentStep > 0 && (
              <Button onClick={prev} style={{ minWidth: 100 }}>
                Précédent
              </Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={next} style={{ minWidth: 100 }}>
                Suivant
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button
                type="primary"
                loading={loading}
                onClick={handleSubmit}
                style={{ minWidth: 100 }}
              >
                Valider
              </Button>
            )}
            <Button
              onClick={() => navigate('/products/catalogue')}
              disabled={loading}
              style={{ minWidth: 100 }}
            >
              Annuler
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AjouterProduit;

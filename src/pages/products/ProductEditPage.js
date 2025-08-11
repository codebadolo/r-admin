// src/pages/products/ProductEditPage.js

import React, { useEffect, useState } from 'react';
import { Form, Input, InputNumber, Button, Select, message, Spin, Typography } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import * as productService from '../../services/productService';

const { Title } = Typography;
const { Option } = Select;

const ProductEditPage = () => {
  const { id } = useParams(); // Récupère l'id du produit depuis l'URL
  const navigate = useNavigate();

  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true); // chargement catégories, marques
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Charger le produit par id
  const loadProduct = async () => {
    setLoading(true);
    try {
      const res = await productService.fetchProductById(id);
      const product = res.data;

      // Préparer les valeurs initiales du formulaire.
      // Pour les ForeignKey, on met les id (ex : category, brand)
      form.setFieldsValue({
        nom: product.nom,
        description: product.description,
        category: product.category?.id || null,
        brand: product.brand?.id || null,
        prix: product.prix,
        stock: product.stock,
        etat: product.etat,
        image_url: product.image_url,
        ean_code: product.ean_code,
        is_active: product.is_active,
      });
    } catch (error) {
      message.error("Erreur lors du chargement du produit.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Charger catégories et marques
  const loadMeta = async () => {
    try {
      const [resCategories, resBrands] = await Promise.all([
        productService.fetchCategories(),
        productService.fetchBrands(),
      ]);
      setCategories(Array.isArray(resCategories.data) ? resCategories.data : resCategories.data.results || []);
      setBrands(Array.isArray(resBrands.data) ? resBrands.data : resBrands.data.results || []);
    } catch (error) {
      message.error("Erreur lors du chargement des données.");
      console.error(error);
    } finally {
      setLoadingMeta(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadProduct();
      loadMeta();
    }
  }, [id]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await productService.updateProduct(id, values);
      message.success("Produit mis à jour avec succès !");
      navigate('/products'); // Redirection vers la liste des produits après la sauvegarde
    } catch (error) {
      console.error('Erreur sauvegarde produit:', error);
      message.error("Erreur lors de la mise à jour du produit");
    } finally {
      setLoading(false);
    }
  };

  if (loadingMeta) return <Spin tip="Chargement des données..." style={{ width: '100%', marginTop: 100 }} />;

  return (
    <div style={{ padding: 24, backgroundColor: '#fff', maxWidth: 700, margin: 'auto' }}>
      <Title level={2}>Modifier un Produit</Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ is_active: true, etat: 'disponible' }}
      >
        <Form.Item
          label="Nom"
          name="nom"
          rules={[{ required: true, message: 'Le nom est requis' }]}
        >
          <Input placeholder="Nom du produit" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <Input.TextArea rows={4} placeholder="Description détaillée" />
        </Form.Item>

        <Form.Item
          label="Catégorie"
          name="category"
          rules={[{ required: true, message: 'La catégorie est requise' }]}
        >
          <Select placeholder="Sélectionnez une catégorie" allowClear showSearch optionFilterProp="children">
            {categories.map(cat => (
              <Option key={cat.id} value={cat.id}>
                {cat.nom}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Marque"
          name="brand"
          rules={[{ required: true, message: 'La marque est requise' }]}
        >
          <Select placeholder="Sélectionnez une marque" allowClear showSearch optionFilterProp="children">
            {brands.map(brand => (
              <Option key={brand.id} value={brand.id}>
                {brand.nom}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Prix (€)"
          name="prix"
          rules={[{ required: true, message: 'Le prix est requis' }]}
        >
          <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="Prix en euros" />
        </Form.Item>

        <Form.Item
          label="Stock"
          name="stock"
          rules={[{ required: true, message: 'Le stock est requis' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} placeholder="Quantité en stock" />
        </Form.Item>

        <Form.Item
          label="État"
          name="etat"
          rules={[{ required: true, message: "L'état est requis" }]}
        >
          <Select placeholder="État du produit">
            <Option value="disponible">Disponible</Option>
            <Option value="indisponible">Indisponible</Option>
            <Option value="en rupture">En rupture</Option>
            {/* Ajoutez d'autres états possibles si vous en avez */}
          </Select>
        </Form.Item>

        <Form.Item label="URL de l'image" name="image_url">
          <Input placeholder="URL de l'image du produit (optionnel)" />
        </Form.Item>

        <Form.Item label="Code EAN" name="ean_code">
          <Input placeholder="Code EAN (optionnel)" />
        </Form.Item>

        <Form.Item name="is_active" valuePropName="checked">
          <Input.Checkbox>Produit actif</Input.Checkbox>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Enregistrer
          </Button>
          <Button
            style={{ marginLeft: 8 }}
            onClick={() => navigate('/products')}
            disabled={loading}
          >
            Annuler
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ProductEditPage;

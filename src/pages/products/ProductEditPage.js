import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // React Router v6+
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Space,
  Spin,
  Upload,
} from "antd";
import { UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import productService from "../../services/productService";

const { TextArea } = Input;
const { Option } = Select;

export default function ProductEditPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [initialImages, setInitialImages] = useState([]);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    loadReferenceData();
    loadProductDetails();
  }, [productId]);

  // Charger catégories et marques
  const loadReferenceData = async () => {
    try {
      const [catsRes, brandsRes] = await Promise.all([
        productService.getCategories(),
        productService.getBrands(),
      ]);
      setCategories(catsRes.data);
      setBrands(brandsRes.data);
    } catch {
      message.error("Erreur de chargement des données de référence");
    }
  };

  // Charger les données du produit à éditer
  const loadProductDetails = async () => {
    setLoading(true);
    try {
      const res = await productService.getProductById(productId);
      const product = res.data;

      // Préparer données initiales du formulaire
      form.setFieldsValue({
        nom: product.nom,
        description: product.description,
        prix: product.prix,
        stock: product.stock,
        etat: product.etat,
        category: product.category?.id || null,
        brand: product.brand?.id || null,
        is_active: product.is_active,
        ean_code: product.ean_code || "",
      });

      if (product.images && product.images.length > 0) {
        // Préparer fileList pour upload d’image existante (affichage)
        const files = product.images.map((img, index) => ({
          uid: `-1-${index}`, // identifiant temporaire négatif
          name: img.name || `image-${index + 1}`,
          status: "done",
          url: img.url || img.image_url,
        }));
        setFileList(files);
        setInitialImages(files); // conserver pour comparaison
      }
    } catch {
      message.error("Erreur lors du chargement du produit");
    } finally {
      setLoading(false);
    }
  };

  // Normaliser upload pour Antd Form.Item
  const normFile = e => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  // Gérer changements fichier(s)
  const onUploadChange = ({ fileList }) => {
    setFileList(fileList.slice(-1)); // garder un seul fichier
  };

  // Soumettre modification produit
  const onFinish = async (values) => {
    setSaving(true);

    // Parse images : si nouveau fichier chargé, récupérer originFileObj
    const formData = new FormData();
    formData.append("nom", values.nom);
    formData.append("description", values.description || "");
    formData.append("prix", values.prix);
    formData.append("stock", values.stock || 0);
    formData.append("etat", values.etat);
    formData.append("category", values.category);
    formData.append("brand", values.brand);
    formData.append("is_active", values.is_active !== undefined ? values.is_active : true);
    formData.append("ean_code", values.ean_code || "");

    // Si image nouvelle (not loaded previously), la joindre
    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("images", fileList[0].originFileObj);
    }
    // Sinon pas de changement image (ou gérer suppression spécifique selon l'API)

    try {
      await productService.updateProduct(productId, formData);
      message.success("Produit mis à jour avec succès");
      navigate("/products");
    } catch {
      message.error("Erreur lors de la mise à jour du produit");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card
      title={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/products")} />
          Modifier le produit
        </Space>
      }
      style={{ maxWidth: 800, margin: "40px auto" }}
    >
      {loading ? (
        <Spin tip="Chargement..." />
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ etat: "disponible", is_active: true }}
        >
          <Form.Item
            label="Nom du produit"
            name="nom"
            rules={[{ required: true, message: "Merci de saisir le nom du produit" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            label="Prix (€)"
            name="prix"
            rules={[
              { required: true, message: "Merci de saisir le prix" },
              { type: "number", min: 0, message: "Le prix doit être positif" },
            ]}
          >
            <InputNumber style={{ width: "100%" }} min={0} step={0.01} stringMode />
          </Form.Item>

          <Form.Item
            label="Stock"
            name="stock"
            rules={[{ type: "number", min: 0, message: "Le stock ne peut être négatif" }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>

          <Form.Item
            label="État"
            name="etat"
            rules={[{ required: true, message: "Merci de sélectionner l'état" }]}
          >
            <Select>
              <Option value="disponible">Disponible</Option>
              <Option value="rupture">Rupture de stock</Option>
              <Option value="indisponible">Indisponible</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Catégorie"
            name="category"
            rules={[{ required: true, message: "Merci de sélectionner une catégorie" }]}
          >
            <Select showSearch placeholder="Sélectionner une catégorie" optionFilterProp="children">
              {categories.map(cat => (
                <Option key={cat.id} value={cat.id}>
                  {cat.nom || cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Marque"
            name="brand"
            rules={[{ required: true, message: "Merci de sélectionner une marque" }]}
          >
            <Select showSearch placeholder="Sélectionner une marque" optionFilterProp="children">
              {brands.map(brand => (
                <Option key={brand.id} value={brand.id}>
                  {brand.nom || brand.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Code EAN"
            name="ean_code"
          >
            <Input placeholder="Code EAN (optionnel)" />
          </Form.Item>

          <Form.Item
            label="Image principale"
            name="image"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            extra="Téléchargez une image principale pour le produit"
          >
            <Upload
              listType="picture"
              accept="image/*"
              beforeUpload={() => false} // Upload manuel au submit
              onChange={onUploadChange}
              fileList={fileList}
            >
              <Button icon={<UploadOutlined />}>Choisir une image</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={saving}>
                Enregistrer
              </Button>
              <Button onClick={() => navigate("/products")}>Annuler</Button>
            </Space>
          </Form.Item>
        </Form>
      )}
    </Card>
  );
}

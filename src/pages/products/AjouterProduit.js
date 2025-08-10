import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import productService from "../../services/productService";

const { TextArea } = Input;
const { Option } = Select;

export default function AjouterProduit() {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await productService.getCategories();
      setCategories(res.data);
    } catch {
      message.error("Erreur lors du chargement des catégories");
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await productService.getBrands();
      setBrands(res.data);
    } catch {
      message.error("Erreur lors du chargement des marques");
    }
  };

  const normFile = e => {
    // Compatibilité avec Antd Upload value prop
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const onFinish = async (values) => {
    setLoading(true);

    // Construction des données à envoyer (formData pour gérer upload)
    const formData = new FormData();
    formData.append("nom", values.nom);
    formData.append("description", values.description || "");
    formData.append("prix", values.prix);
    formData.append("stock", values.stock || 0);
    formData.append("etat", values.etat);
    formData.append("category", values.category);
    formData.append("brand", values.brand);
    formData.append("is_active", true);

    if (values.image && values.image.length > 0) {
      // Dépose le premier fichier seulement en image principale
      formData.append("images", values.image[0].originFileObj);
    }

    try {
      await productService.createProduct(formData);
      message.success("Produit créé avec succès");
      form.resetFields();
      setFileList([]);
    } catch (error) {
      message.error("Erreur lors de la création du produit");
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    accept: "image/*",
    beforeUpload: (file) => {
      // Limitez ici si besoin (taille, type...)
      return false; // pour contrôle manuel, upload sur submit
    },
    onRemove: (file) => {
      setFileList([]);
    },
    onChange: ({ fileList }) => {
      setFileList(fileList.slice(-1)); // garder 1 seul fichier
    },
    fileList,
  };

  return (
    <Card
      title="Ajouter un nouveau produit"
      style={{ maxWidth: 700, margin: "auto", marginTop: 40 }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ etat: "disponible", stock: 0 }}
      >
        <Form.Item
          label="Nom du produit"
          name="nom"
          rules={[{ required: true, message: "Veuillez saisir le nom du produit" }]}
        >
          <Input placeholder="Nom" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: false }]}
        >
          <TextArea rows={4} placeholder="Description (optionnelle)" />
        </Form.Item>

        <Form.Item
          label="Prix (€)"
          name="prix"
          rules={[
            { required: true, message: "Veuillez saisir un prix" },
            { type: "number", min: 0, message: "Le prix doit être positif" },
          ]}
        >
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            step={0.01}
            stringMode
            placeholder="Prix"
          />
        </Form.Item>

        <Form.Item
          label="Stock initial"
          name="stock"
          rules={[
            { type: "number", min: 0, message: "Le stock ne peut pas être négatif" },
          ]}
        >
          <InputNumber style={{ width: "100%" }} min={0} placeholder="Stock" />
        </Form.Item>

        <Form.Item
          label="État du produit"
          name="etat"
          rules={[{ required: true, message: "Veuillez sélectionner un état" }]}
        >
          <Select placeholder="Sélectionnez l’état">
            <Option value="disponible">Disponible</Option>
            <Option value="rupture">Rupture de stock</Option>
            <Option value="indisponible">Indisponible</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Catégorie"
          name="category"
          rules={[{ required: true, message: "Veuillez sélectionner une catégorie" }]}
        >
          <Select placeholder="Sélectionnez une catégorie">
            {categories.map((cat) => (
              <Option key={cat.id} value={cat.id}>
                {cat.nom || cat.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Marque"
          name="brand"
          rules={[{ required: true, message: "Veuillez sélectionner une marque" }]}
        >
          <Select placeholder="Sélectionnez une marque">
            {brands.map((brand) => (
              <Option key={brand.id} value={brand.id}>
                {brand.nom || brand.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Image principale"
          name="image"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          extra="Téléchargez une image principale du produit (optionnel)"
        >
          <Upload {...uploadProps} listType="picture">
            <Button icon={<UploadOutlined />}>Choisir une image</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Créer le produit
            </Button>
            <Button onClick={() => form.resetFields()}>Annuler</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}

import { Col, Form, Input, message, Row, Select } from "antd";
import { useEffect, useState } from "react";
import {
    fetchBrands,
    fetchCategories,
    fetchProductTypes,
} from "../services/productService";

const { Option } = Select;

export default function ProduitInfos({ onTypeChange }) {
  const [categories, setCategories] = useState([]);
  const [marques, setMarques] = useState([]);
  const [typesProduit, setTypesProduit] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        const [catRes, brandRes, typeRes] = await Promise.all([
          fetchCategories(),
          fetchBrands(),
          fetchProductTypes(),
        ]);
        setCategories(catRes.data);
        setMarques(brandRes.data);
        setTypesProduit(typeRes.data);
      } catch (error) {
        message.error("Erreur lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  return (
    <fieldset disabled={loading} style={{ border: "none", padding: 0 }}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Nom du produit"
            rules={[{ required: true, message: "Veuillez saisir le nom." }]}
          >
            <Input placeholder="Nom du produit" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="web_id"
            label="Web ID"
            rules={[{ required: true, message: "Veuillez saisir le Web ID." }]}
          >
            <Input placeholder="Identifiant unique" />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="description" label="Description">
        <Input.TextArea rows={3} placeholder="Description courte" />
      </Form.Item>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="category"
            label="Catégorie"
            rules={[
              { required: true, message: "Veuillez sélectionner une catégorie." },
            ]}
          >
            <Select placeholder="Sélectionner une catégorie" allowClear>
              {categories.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="brand"
            label="Marque"
            rules={[
              { required: true, message: "Veuillez sélectionner une marque." },
            ]}
          >
            <Select placeholder="Sélectionner une marque" allowClear>
              {marques.map((b) => (
                <Option key={b.id} value={b.id}>
                  {b.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="product_type"
            label="Type de produit"
            rules={[
              { required: true, message: "Veuillez sélectionner un type." },
            ]}
          >
            <Select
              placeholder="Sélectionner un type"
              allowClear
              onChange={onTypeChange}
            >
              {typesProduit.map((t) => (
                <Option key={t.id} value={t.id}>
                  {t.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </fieldset>
  );
}

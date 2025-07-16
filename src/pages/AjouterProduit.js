import { Button, Collapse, Form, Space, message } from "antd";
import { useEffect, useState } from "react";

import ProduitAttributs from "./ProduitAttributs";
import ProduitInfos from "./ProduitInfos";
import ProduitMedia from "./ProduitMedia";
import ProduitSpecifications from "./ProduitSpecifications";
import ProduitVariantes from "./ProduitVariantes";

const { Panel } = Collapse;

export default function AjouterProduit() {
  const [form] = Form.useForm();
  const [selectedType, setSelectedType] = useState(null);
  const [varianteCount, setVarianteCount] = useState(1);
  const [categories, setCategories] = useState([]);
  const [marques, setMarques] = useState([]);
  const [typesProduit, setTypesProduit] = useState([]);
  const [attributsTypes, setAttributsTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [tRes, cRes, mRes] = await Promise.all([
          fetchAPI("/api/producttypes/"),
          fetchAPI("/api/categories/"),
          fetchAPI("/api/brands/"),
        ]);
        setTypesProduit(tRes);
        setCategories(cRes);
        setMarques(mRes);
      } catch {
        message.error("Erreur de chargement des données");
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function loadAttributs() {
      if (!selectedType) {
        setAttributsTypes([]);
        return;
      }
      try {
        const res = await fetchAPI(`/api/producttypes/${selectedType}/attributes/`);
        setAttributsTypes(res);
      } catch {
        setAttributsTypes([]);
      }
    }
    loadAttributs();
  }, [selectedType]);

  async function fetchAPI(url) {
    // wrapper axios ou fetch selon ton setup
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erreur API");
    return await res.json();
  }

  const onFinish = async (values) => {
    setLoading(true);
    try {
      console.log("Payload final", values);
      message.success("Produit créé avec succès !");
      form.resetFields();
      setVarianteCount(1);
      setSelectedType(null);
    } catch {
      message.error("Erreur création produit");
    }
    setLoading(false);
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} scrollToFirstError style={{ maxWidth: 900, margin: "auto" }}>
      <Collapse defaultActiveKey={["1", "2", "3", "4", "5"]} ghost>
        <Panel header="Informations produit" key="1">
          <ProduitInfos
            categories={categories}
            marques={marques}
            typesProduit={typesProduit}
            onTypeChange={setSelectedType}
          />
        </Panel>
        <Panel header="Attributs" key="2" disabled={!selectedType}>
          <ProduitAttributs attributsTypes={attributsTypes} disabled={!selectedType} />
        </Panel>
        <Panel header="Variantes / SKU" key="3">
          <ProduitVariantes varianteCount={varianteCount} setVarianteCount={setVarianteCount} />
        </Panel>
        <Panel header="Images média" key="4">
          <ProduitMedia />
        </Panel>
        <Panel header="Spécifications" key="5">
          <ProduitSpecifications />
        </Panel>
      </Collapse>
      <Form.Item style={{ marginTop: 24 }}>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            Créer le produit
          </Button>
          <Button
            htmlType="reset"
            onClick={() => {
              form.resetFields();
              setVarianteCount(1);
              setSelectedType(null);
            }}
          >
            Réinitialiser
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}

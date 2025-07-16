import { Form, Input, message } from "antd";
import { useEffect, useState } from "react";
import { fetchProductTypeAttributes } from "../services/productService";

export default function ProduitAttributs({ productTypeId }) {
  const [attributsGlobal, setAttributsGlobal] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const res = await fetchProductTypeAttributes();
        setAttributsGlobal(res.data);
      } catch {
        message.error("Erreur chargement attributs");
      }
      setLoading(false);
    }
    loadAll();
  }, []);

  if (!productTypeId) return <p>Veuillez sélectionner un type pour voir les attributs.</p>;

  if (loading) return <p>Chargement des attributs...</p>;

  // Filtrer côté frontend
  const attributsFiltres = attributsGlobal.filter(
    (a) => a.product_type === productTypeId || a.product_type?.id === productTypeId
  );

  if (attributsFiltres.length === 0)
    return <p>Aucun attribut défini pour ce type.</p>;

  return (
    <>
      {attributsFiltres.map((attr) => (
        <Form.Item
          key={attr.id}
          name={['attributes', attr.product_attribute.id]}
          label={attr.product_attribute.name}
          rules={[{ required: true, message: `${attr.product_attribute.name} est requis` }]}
        >
          <Input placeholder={`Valeur pour ${attr.product_attribute.name}`} />
        </Form.Item>
      ))}
    </>
  );
}

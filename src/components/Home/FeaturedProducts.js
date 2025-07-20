import { Card, Spin } from "antd";
import { useEffect, useState } from "react";
import { fetchProducts } from "../../services/productService";

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts({ featured: true }).then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Spin tip="Chargement des produits..." />;

  return (
    <section style={{ padding: 24 }}>
      <h2>Nos produits phares</h2>
      <div style={{ display: "flex", gap: 16, overflowX: "auto" }}>
        {products.map((p) => (
          <Card
            key={p.id}
            hoverable
            style={{ width: 240 }}
            cover={
              <img alt={p.name} src={p.images?.[0]?.image || "/images/no-image.png"} style={{ height: 160, objectFit: "cover" }} />
            }
          >
            <Card.Meta title={p.name} description={`${p.price} €`} />
          </Card>
        ))}
      </div>
    </section>
  );
}

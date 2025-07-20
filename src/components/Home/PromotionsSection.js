
export default function PromotionsSection() {
  return (
    <section style={{ padding: 24, backgroundColor: "#fafafa" }}>
      <h2>Offres spéciales</h2>
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1, background: "#fff", padding: 16, borderRadius: 8 }}>
          <h3>Promo Smartphone</h3>
          <p>Jusqu’à -20% sur les modèles récents</p>
        </div>
        <div style={{ flex: 1, background: "#fff", padding: 16, borderRadius: 8 }}>
          <h3>Accessoires gratuits</h3>
          <p>Pour tout achat supérieur à 100€</p>
        </div>
      </div>
    </section>
  );
}

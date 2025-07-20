
export default function HeroBanner() {
  return (
    <section style={{ position: "relative", height: 400, background: "url('/images/hero.jpg') center/cover no-repeat", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ backgroundColor: "rgba(0, 0, 0, 0.4)", padding: 24, borderRadius: 8, maxWidth: 600, textAlign: "center" }}>
        <h1>Découvrez nos offres exclusives</h1>
        <p>Le meilleur de la tech à portée de clic</p>
        <button style={{ padding: "12px 24px", backgroundColor: "#1890ff", border: "none", color: "#fff", cursor: "pointer", borderRadius: 4 }}>
          Voir les produits
        </button>
      </div>
    </section>
  );
}

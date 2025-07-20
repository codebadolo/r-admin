
// exemple de données statiques, à remplacer par props ou requête API
const categories = [
  { id: 1, name: "Ordinateurs", image: "/images/cat-ordinateur.jpg" },
  { id: 2, name: "Smartphones", image: "/images/cat-smartphone.jpg" },
  { id: 3, name: "Accessoires", image: "/images/cat-accessoires.jpg" },
];

export default function CategoriesSection() {
  return (
    <section style={{ padding: 24 }}>
      <h2>Nos catégories</h2>
      <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
        {categories.map((cat) => (
          <div key={cat.id} style={{ width: 200, cursor: "pointer", textAlign: "center" }}>
            <img src={cat.image} alt={cat.name} style={{ width: "100%", borderRadius: 8 }} />
            <h3>{cat.name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}

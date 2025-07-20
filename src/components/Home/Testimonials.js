
const testimonials = [
  { id: 1, author: "Alice Dupont", text: "Livraison rapide et service client excellent!" },
  { id: 2, author: "Jean Martin", text: "Qualité des produits au top, je recommande." },
];

export default function Testimonials() {
  return (
    <section style={{ padding: 24 }}>
      <h2>Avis clients</h2>
      {testimonials.map((t) => (
        <blockquote key={t.id} style={{ fontStyle: "italic", marginBottom: 16 }}>
          "{t.text}" <br />
          <strong>- {t.author}</strong>
        </blockquote>
      ))}
    </section>
  );
}

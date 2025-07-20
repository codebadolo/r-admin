import { Input, message } from "antd";
import { useState } from "react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (!email) {
      message.error("Veuillez saisir un email valide");
      return;
    }
    // Simule un appel API
    message.success("Merci pour votre inscription !");
    setEmail("");
  };

  return (
    <section style={{ padding: 24, backgroundColor: "#eee", textAlign: "center" }}>
      <h2>Inscrivez-vous à notre newsletter</h2>
      <Input.Search
        placeholder="Entrez votre email"
        enterButton="S’inscrire"
        size="large"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onSearch={handleSubmit}
        style={{ maxWidth: 400, margin: "auto" }}
      />
    </section>
  );
}

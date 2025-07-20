import { useState } from "react";
import Navbar from "../components/Home/Navbar";

export default function HomePage() {
  const [user, setUser] = useState(null); // À relier à ton contexte Auth
 
  const handleLogout = () => {
    // logique de deconnexion
    setUser(null);
  };

  return (
    <>
      <Navbar user={user}  onLogout={handleLogout} />
      {/* Le reste de ta page d’accueil */}
      <main style={{ padding: 24 }}>
        {/* HeroBanner, featured products ... */}
        <h2>Bienvenue sur mon e-commerce</h2>
      </main>
    </>
  );
}

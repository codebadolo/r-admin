import { Layout } from "antd";

const { Header, Content, Footer } = Layout;

const HomeLayout = ({ children }) => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Header simplifié */}
      <Header
        style={{
          position: "fixed",
          zIndex: 100,
          width: "100%",
          background: "#fff",
          boxShadow: "0 2px 8px #f0f1f2",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          height: 64,
        }}
      >
        {/* Logo */}
        <div style={{ flex: 1, fontWeight: "bold", fontSize: 20 }}>
          Mon E-commerce
        </div>

        {/* Ajouter ici ton input de recherche, boutons Connexion, Panier, etc. */}
      </Header>

      {/* Espace pour le contenu, décalé sous l’en-tête fixe */}
      <Content
        style={{
          marginTop: 64,
          padding: "24px 48px",
          background: "#fafafa",
          minHeight: "calc(100vh - 64px - 70px)", // footer hauteur supposée 70px
        }}
      >
        {children}
      </Content>

      <Footer
        style={{
          textAlign: "center",
          background: "#001529",
          color: "#fff",
          height: 70,
          lineHeight: "70px",
        }}
      >
        © 2025 Mon E-commerce - Tous droits réservés
      </Footer>
    </Layout>
  );
};

export default HomeLayout;

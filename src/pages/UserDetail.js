import { Button, Card, Descriptions, message, Spin } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchUser } from "../services/userServices"; // Assurez-vous du bon chemin

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function loadUser() {
      setLoading(true);
      try {
        const response = await fetchUser(id);
        // Assurez-vous que response.data contient bien l’utilisateur
        setUser(response.data);
      } catch (error) {
        message.error("Erreur lors du chargement de l'utilisateur");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [id]);

  if (loading) {
    return (
      <div style={{textAlign: "center", marginTop: 50}}>
        <Spin size="large" tip="Chargement de l'utilisateur..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <p>Aucun utilisateur trouvé.</p>
        <Button onClick={() => navigate(-1)}>Retour</Button>
      </div>
    );
  }

  return (
    <Card
      title={`Détails utilisateur : ${user.email}`}
      extra={<Button onClick={() => navigate(-1)}>Retour</Button>}
      style={{ maxWidth: 600, margin: "20px auto" }}
    >
      <Descriptions column={1} bordered>
        <Descriptions.Item label="Prénom">{user.first_name}</Descriptions.Item>
        <Descriptions.Item label="Nom">{user.last_name}</Descriptions.Item>
        <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
        <Descriptions.Item label="Statut">
          {user.is_active ? "Actif" : "Inactif"}
        </Descriptions.Item>
        <Descriptions.Item label="Date d'inscription">
          {user.date_joined ? new Date(user.date_joined).toLocaleString() : "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Rôles">
          {user.roles && user.roles.length > 0
            ? user.roles.map((role) => role.name).join(", ")
            : "-"}
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
}

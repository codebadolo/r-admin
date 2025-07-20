import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Input,
  message,
  Modal,
  Row,
  Space,
  Spin,
  Statistic,
  Table,
  Tooltip,
  Typography,
} from "antd";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import RoleModalForm from "./RoleModalForm"; // Formulaire modale de création/édition

const { Search } = Input;
const { Title } = Typography;

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [searchText, setSearchText] = useState("");

  // Chargement roles depuis API
  const fetchRoles = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Pas de token d'authentification");
    const response = await axios.get("http://127.0.0.1:8000/api/users/roles/", {
      headers: { Authorization: `Token ${token}` },
    });
    return response.data;
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRoles();
      const lowerSearch = searchText.toLowerCase();
      const filtered = data.filter((r) => r.name.toLowerCase().includes(lowerSearch));
      setRoles(filtered);
    } catch (error) {
      message.error("Erreur lors du chargement des rôles");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [searchText]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Confirmer la suppression",
      content: "Voulez-vous supprimer ce rôle ?",
      okText: "Oui",
      cancelText: "Non",
      onOk: async () => {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`http://127.0.0.1:8000/api/users/roles/${id}/`, {
            headers: { Authorization: `Token ${token}` },
          });
          message.success("Rôle supprimé");
          loadData();
        } catch {
          message.error("Erreur lors de la suppression");
        }
      },
    });
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingRole(null);
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    const token = localStorage.getItem("token");
    try {
      if (editingRole) {
        // mise à jour
        await axios.put(
          `http://127.0.0.1:8000/api/users/roles/${editingRole.id}/`,
          values,
          { headers: { Authorization: `Token ${token}` } }
        );
        message.success("Rôle modifié");
      } else {
        // création
        await axios.post("http://127.0.0.1:8000/api/users/roles/", values, {
          headers: { Authorization: `Token ${token}` },
        });
        message.success("Rôle créé");
      }
      setModalVisible(false);
      loadData();
    } catch (error) {
      message.error("Erreur lors de l'enregistrement");
      console.error(error);
    }
  };

  // Statistiques simples
  const totalRoles = roles.length;

  // Colonnes tableau roles
  const columns = [
    { title: "Nom", dataIndex: "name", key: "name" },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Modifier">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Supprimer">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 960, margin: "20px auto", padding: 20 }}>
      <Title level={2} style={{ textAlign: "center" }}>
        Gestion des rôles
      </Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Nombre total de rôles"
              value={totalRoles}
              valueStyle={{ color: "#722ed1" }}
              prefix={<UsergroupAddOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Space style={{ marginBottom: 16 }}>
        <Search
          placeholder="Rechercher un rôle"
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          enterButton
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          style={{ marginLeft: 16 }}
        >
          Ajouter un rôle
        </Button>
      </Space>

      {loading ? (
        <Spin tip="Chargement des rôles..." />
      ) : (
        <Table
          columns={columns}
          dataSource={roles}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      )}

      {/* Modal création/édition rôle */}
      <RoleModalForm
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        role={editingRole}
      />
    </div>
  );
}

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
import { useCallback, useEffect, useState } from "react";
import RoleModalForm from "./RoleModalForm";
import api from "../../services/api";
import { createRole, updateRole } from "../../services/userServices";

const { Search } = Input;
const { Title } = Typography;

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchRoles = async () => {
    const response = await api.get("/users/roles/");
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
          await api.delete(`/users/roles/${id}/`);
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
    setSaving(true);
    try {
      if (editingRole) {
        await updateRole(editingRole.id, values);
        message.success("Rôle modifié");
      } else {
        await createRole(values);
        message.success("Rôle créé");
      }
      setModalVisible(false);
      loadData();
    } catch (error) {
      message.error("Erreur lors de la sauvegarde");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const totalRoles = roles.length;
  const now = new Date();

  const recentRolesCount = roles.filter((r) => {
    if (!r.created_at) return false;
    const createdAt = new Date(r.created_at);
    return (now - createdAt) / (1000 * 3600 * 24) <= 7;
  }).length;

  const noDescriptionCount = roles.filter((r) => !r.description || r.description.trim() === "").length;

  const longNameCount = roles.filter((r) => r.name && r.name.length > 30).length;

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
            <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="Supprimer">
            <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1500, margin: "20px auto", padding: 20 }}>
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

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Rôles créés dans les 7 derniers jours"
              value={recentRolesCount}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Rôles sans description"
              value={noDescriptionCount}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Rôles avec nom &gt; 30 caractères"
              value={longNameCount}
              valueStyle={{ color: "#1890ff" }}
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
        <Table columns={columns} dataSource={roles} rowKey="id" pagination={{ pageSize: 10 }} />
      )}

      <RoleModalForm
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        role={editingRole}
        confirmLoading={saving} // Ajoutez ce prop et gérez-le dans RoleModalForm pour bouton loading
      />
    </div>
  );
}

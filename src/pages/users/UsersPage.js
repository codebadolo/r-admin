import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Badge,
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
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  fetchUsers,
  deleteUser,
} from "../../services/userServices"; // Ajustez le chemin selon votre projet

const { Search } = Input;

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const navigate = useNavigate();

  // Chargement des utilisateurs via service
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchUsers();
      const data = response.data;

      const lowerSearch = searchText.toLowerCase();

      const filtered = searchText.trim() === ""
        ? data
        : data.filter((user) => {
            const roles = user.user_roles?.map((ur) => ur.role?.name) || [];
            return (
              user.email.toLowerCase().includes(lowerSearch) ||
              user.first_name.toLowerCase().includes(lowerSearch) ||
              user.last_name.toLowerCase().includes(lowerSearch) ||
              (user.telephone?.toLowerCase().includes(lowerSearch) || false) ||
              (user.type_client?.toLowerCase().includes(lowerSearch) || false) ||
              roles.some((r) => r.toLowerCase().includes(lowerSearch))
            );
          });

      setUsers(filtered);
    } catch (error) {
      message.error("Erreur lors du chargement des utilisateurs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [searchText]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Statistiques
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.is_active).length;
  const inactiveUsers = totalUsers - activeUsers;

  const rolesSet = new Set();
  users.forEach((u) => {
    (u.user_roles || []).forEach((ur) => {
      if (ur.role?.name) rolesSet.add(ur.role.name);
    });
  });
  const totalRoles = rolesSet.size;

  // Suppression utilisateur avec confirmation
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Confirmer la suppression",
      content: "Voulez-vous supprimer cet utilisateur ?",
      okText: "Oui",
      cancelText: "Non",
      onOk: async () => {
        try {
          await deleteUser(id);
          message.success("Utilisateur supprimé avec succès");
          await loadData();
        } catch (error) {
          message.error("Erreur lors de la suppression");
          console.error(error);
        }
      },
    });
  };

  // Navigation vers la page d'ajout utilisateur
  const handleAdd = () => {
    navigate('/users/create');  // À créer si besoin
  };

  // Navigation vers la page d'édition utilisateur
  const handleEdit = (user) => {
    navigate(`/users/edit/${user.id}`);
  };

  // Navigation vers la page de détail utilisateur
  const showDetails = (user) => {
    navigate(`/users/${user.id}`);
  };

  // Colonnes tableau
  const columns = [
    { title: "Email", dataIndex: "email", key: "email", sorter: (a, b) => a.email.localeCompare(b.email) },
    { title: "Prénom", dataIndex: "first_name", key: "first_name", sorter: (a, b) => a.first_name.localeCompare(b.first_name) },
    { title: "Nom", dataIndex: "last_name", key: "last_name", sorter: (a, b) => a.last_name.localeCompare(b.last_name) },
    { title: "Téléphone", dataIndex: "telephone", key: "telephone" },
    {
      title: "Type Client",
      dataIndex: "type_client",
      key: "type_client",
      filters: [
        { text: "Particulier", value: "particulier" },
        { text: "Entreprise", value: "entreprise" },
      ],
      onFilter: (value, record) => record.type_client === value,
      render: (type) => (type ? type.charAt(0).toUpperCase() + type.slice(1) : "-")
    },
    {
      title: "Statut",
      dataIndex: "is_active",
      key: "is_active",
      filters: [
        { text: "Actif", value: true },
        { text: "Inactif", value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
      render: (active) => (
        <Badge color={active ? "green" : "red"} text={active ? "Actif" : "Inactif"} />
      )
    },
    {
      title: "Date d'inscription",
      dataIndex: "date_joined",
      key: "date_joined",
      sorter: (a, b) => new Date(a.date_joined) - new Date(b.date_joined),
      render: (date) => (date ? new Date(date).toLocaleDateString() : "-")
    },
    {
      title: "Rôles",
      key: "roles",
      render: (_, record) => {
        const roles = record.user_roles?.map((ur) => ur.role).filter(Boolean) || [];
        return roles.length > 0 ? (
          roles.map((r) => (
            <Tooltip key={r.id} title={r.description || ""}>
              <span style={{ marginRight: 6 }}>{r.name}</span>
            </Tooltip>
          ))
        ) : (
          "-"
        );
      }
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 140,
      render: (_, record) => (
        <Space>
          <Tooltip title="Modifier">
            <EditOutlined style={{ cursor: "pointer" }} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="Supprimer">
            <DeleteOutlined style={{ cursor: "pointer", color: "red" }} onClick={() => handleDelete(record.id)} />
          </Tooltip>
          <Tooltip title="Voir détails">
            <EyeOutlined style={{ cursor: "pointer" }} onClick={() => showDetails(record)} />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Search
          placeholder="Rechercher un utilisateur"
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          enterButton
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Ajouter un utilisateur
        </Button>
      </Space>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Nombre total d'utilisateurs"
              value={totalUsers}
              valueStyle={{ color: "#3f8600" }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Utilisateurs actifs"
              value={activeUsers}
              valueStyle={{ color: "#1890ff" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Utilisateurs inactifs"
              value={inactiveUsers}
              valueStyle={{ color: "#cf1322" }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Nombre total de rôles"
              value={totalRoles}
              valueStyle={{ color: "#eb2f96" }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {loading ? (
        <Spin tip="Chargement utilisateurs..." />
      ) : (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={users}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 1000 }}
        />
      )}
    </>
  );
}

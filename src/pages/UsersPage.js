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
import { useCallback, useEffect, useState } from "react";

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

import axios from "axios";
import { useNavigate } from "react-router-dom";
import UserModalForm from "./UserModalForm"; // Ajustez chemin selon votre projet

const { Search } = Input;

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailUser,] = useState(null);

  const navigate = useNavigate();

  // Fetch users + roles API
  const fetchUsersWithRoles = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");
    const response = await axios.get("http://127.0.0.1:8000/api/users/users/", {
      headers: { Authorization: `Token ${token}` },
    });
    return response.data;
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchUsersWithRoles();

      const lowerSearch = searchText.toLowerCase();
      const filtered = data.filter(
        (user) =>
          user.email.toLowerCase().includes(lowerSearch) ||
          user.first_name.toLowerCase().includes(lowerSearch) ||
          user.last_name.toLowerCase().includes(lowerSearch) ||
          (user.roles || []).some((role) =>
            role.name.toLowerCase().includes(lowerSearch)
          )
      );

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

  // Calcul des stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.is_active).length;
  const inactiveUsers = totalUsers - activeUsers;
  const rolesSet = new Set();
  users.forEach((u) => {
    (u.roles || []).forEach((r) => rolesSet.add(r.name));
  });
  const totalRoles = rolesSet.size;

  // Suppression (non implémentée ici)
  const handleDelete = (id) => {
    Modal.confirm({
      title: "Confirmer la suppression",
      content: "Voulez-vous supprimer cet utilisateur ?",
      okText: "Oui",
      cancelText: "Non",
      onOk: () => {
        // TODO: appeler API DELETE et reloadData
        message.success("Fonction suppression non implémentée");
      },
    });
  };



  const handleAdd = () => {
    setEditingUser(null);
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    // TODO: appel API POST / PUT pour créer ou update
    message.success("Fonction sauvegarde non implémentée");
    setModalVisible(false);
    await loadData();
  };

 

  // Colonnes Table
  const columns = [
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Prénom", dataIndex: "first_name", key: "first_name" },
    { title: "Nom", dataIndex: "last_name", key: "last_name" },
    {
      title: "Statut",
      dataIndex: "is_active",
      key: "is_active",
      render: (active) => (
        <Badge color={active ? "green" : "red"} text={active ? "Actif" : "Inactif"} />
      ),
    },
    {
      title: "Date d'inscription",
      dataIndex: "date_joined",
      key: "date_joined",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
    },
    {
      title: "Rôles",
      dataIndex: "roles",
      key: "roles",
      render: (roles) =>
        roles && roles.length > 0
          ? roles.map((r) => (
              <Tooltip key={r.id} title={r.description || ""}>
                <span style={{ marginRight: 6 }}>{r.name}</span>
              </Tooltip>
            ))
          : "-",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Modifier">
            <EditOutlined
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/users/edit/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Supprimer">
            <DeleteOutlined
              style={{ cursor: "pointer", color: "red" }}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
          <Tooltip title="Voir détails">
            <EyeOutlined
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/users/${record.id}`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      {/* Barre recherche + ajout */}
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

      {/* Statistiques cards */}
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

      {/* Tableau users */}
      {loading ? (
        <Spin tip="Chargement utilisateurs..." />
      ) : (
        <Table rowKey="id" columns={columns} dataSource={users} pagination={{ pageSize: 10 }} />
      )}

      {/* Modal formulaire utilisateur */}
      <UserModalForm
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onSubmit={handleSubmit}
        user={editingUser}
        // passer roles si nécessaire
      />

      {/* Modal détails utilisateur */}
      <Modal
        visible={detailModalVisible}
        title={`Détails utilisateur : ${detailUser?.email || ""}`}
        footer={null}
        onCancel={() => setDetailModalVisible(false)}
        destroyOnClose
      >
        {detailUser ? (
          <div>
            <p>
              <b>Prénom :</b> {detailUser.first_name}
            </p>
            <p>
              <b>Nom :</b> {detailUser.last_name}
            </p>
            <p>
              <b>Statut :</b> {detailUser.is_active ? "Actif" : "Inactif"}
            </p>
            <p>
              <b>Date d’inscription :</b>{" "}
              {detailUser.date_joined ? new Date(detailUser.date_joined).toLocaleString() : "-"}
            </p>
            <p>
              <b>Rôles :</b> {detailUser.roles?.map((r) => r.name).join(", ") || "-"}
            </p>
          </div>
        ) : null}
      </Modal>
    </>
  );
}

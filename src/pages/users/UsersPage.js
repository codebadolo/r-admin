import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  TeamOutlined,
  UserOutlined,
  DownloadOutlined,
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
  Badge,
  Spin,
  Statistic,
  Table,
  Tooltip,
  Breadcrumb,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchUsers, deleteUser } from "../../services/userServices";

import * as XLSX from "xlsx";

import { saveAs } from "file-saver";

const { Search } = Input;

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 12 });

  const handleTableChange = (pagination) => {
    setPagination(pagination);
    // Vous pouvez aussi gérer filtres / tris ici si besoin
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchUsers();
      const data = response.data;
      const lowerSearch = searchText.toLowerCase();

      const filtered =
        searchText.trim() === ""
          ? data
          : data.filter((user) => {
              // Récupérer liste rôles (support roles ou user_roles)
              const roles =
                user.roles ||
                user.user_roles?.map((ur) => ur.role).filter(Boolean) ||
                [];
              return (
                user.email?.toLowerCase().includes(lowerSearch) ||
                (user.first_name?.toLowerCase() || "").includes(lowerSearch) ||
                (user.last_name?.toLowerCase() || "").includes(lowerSearch) ||
                (user.numero?.toLowerCase() || "").includes(lowerSearch) ||
                user.type_client?.toLowerCase().includes(lowerSearch) ||
                roles.some((r) =>
                  r.name ? r.name.toLowerCase().includes(lowerSearch) : false
                )
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

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.is_active).length;
  const inactiveUsers = totalUsers - activeUsers;

  const rolesSet = new Set();
  users.forEach((u) => {
    (u.roles || u.user_roles || []).forEach((ur) => {
      let role = ur.role || ur; // si direct roles
      if (role?.name) rolesSet.add(role.name);
    });
  });
  const totalRoles = rolesSet.size;

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

  const handleAdd = () => {
    navigate("/users/create");
  };

  const handleEdit = (user) => {
    navigate(`/users/edit/${user.id}`);
  };

  const showDetails = (user) => {
    navigate(`/users/${user.id}`);
  };

  // Fonction d'export Excel
  const exportToExcel = () => {
    if (!users || users.length === 0) {
      message.warning("Aucun utilisateur à exporter");
      return;
    }

    const exportData = users.map((user) => {
      const roles =
        user.roles
          ?.map((r) => r.name)
          .join(", ") ||
        user.user_roles
          ?.map((ur) => ur.role?.name)
          .filter(Boolean)
          .join(", ") ||
        "";

      return {
        Email: user.email || "",
        Téléphone: user.telephone || "",
        "Type Client": user.type_client || "",
        "Date d'inscription": user.date_joined
          ? new Date(user.date_joined).toLocaleDateString()
          : "",
        Rôles: roles,
        Statut: user.is_active ? "Actif" : "Inactif",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Utilisateurs");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "utilisateurs.xlsx");
  };

  const columns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 350,
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Téléphone",
      key: "telephone",
      width: "150px",
      render: (_, record) => {
        const { type_client, telephone, adresses } = record;

        if (Array.isArray(adresses) && adresses.length > 0) {
          if (type_client === "particulier") {
            const adresseParticulier = adresses.find(
              (a) => a.type_client === "particulier"
            );
            return adresseParticulier?.telephone || telephone || "-";
          } else if (type_client === "entreprise") {
            const adresseEntreprise =
              adresses.find(
                (a) =>
                  a.type_client === "entreprise" && a.utilisation === "facturation"
              ) || adresses.find((a) => a.type_client === "entreprise");
            return adresseEntreprise?.telephone || telephone || "-";
          }
        }
        return telephone || "-";
      },
    },
    {
      title: "Type Client",
      dataIndex: "type_client",
      key: "type_client",
      filters: [
        { text: "Particulier", value: "particulier" },
        { text: "Entreprise", value: "entreprise" },
      ],
      onFilter: (value, record) => record.type_client === value,
      render: (type) => (type ? type.charAt(0).toUpperCase() + type.slice(1) : "-"),
    },
    {
      title: "Date d'inscription",
      dataIndex: "date_joined",
      key: "date_joined",
      sorter: (a, b) => new Date(a.date_joined) - new Date(b.date_joined),
      render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
    },
   {
  title: "Rôles",
  key: "roles",
  render: (_, record) => {
    let roles = [];

    if (record.roles && Array.isArray(record.roles)) {
      roles = record.roles;
    } else if (record.user_roles && Array.isArray(record.user_roles)) {
      roles = record.user_roles.map(ur => ur.role).filter(r => r);
    } else if (record.roles_detail && Array.isArray(record.roles_detail)) {
      roles = record.roles_detail;
    }

    if (!roles.length) return "-";

    return roles.map(r => (
      <Tooltip key={r.id} title={r.description || ""}>
        <span style={{ marginRight: 6 }}>{r.name}</span>
      </Tooltip>
    ));
  },
}
,
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
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 140,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Modifier">
            <EditOutlined
              style={{ cursor: "pointer" }}
              onClick={() => handleEdit(record)}
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
              onClick={() => showDetails(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item>Accueil</Breadcrumb.Item>
            <Breadcrumb.Item>Utilisateurs</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
        <Col>
          <Space>
            <Button icon={<DownloadOutlined />} onClick={exportToExcel} type="primary">
              Export Excel
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Ajouter un utilisateur
            </Button>
          </Space>
        </Col>
      </Row>

      <Space style={{ marginBottom: 16 }}>
        <Search
          placeholder="Rechercher un utilisateur"
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          enterButton
        />
      </Space>

      <Row
        gutter={16}
        style={{ marginBottom: 24 }}
        wrap={false}
        justify="start"
      >
        <Col span={4}>
          <Card>
            <Statistic
              title="Nombre total d'utilisateurs"
              value={totalUsers}
              valueStyle={{ color: "#3f8600" }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>

        <Col span={4}>
          <Card>
            <Statistic
              title="Utilisateurs actifs"
              value={activeUsers}
              valueStyle={{ color: "#1890ff" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>

        <Col span={4}>
          <Card>
            <Statistic
              title="Utilisateurs inactifs"
              value={inactiveUsers}
              valueStyle={{ color: "#cf1322" }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>

        <Col span={4}>
          <Card>
            <Statistic
              title="Nombre total de rôles"
              value={totalRoles}
              valueStyle={{ color: "#eb2f96" }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>

        <Col span={4}>
          <Card>
            <Statistic
              title="Nombre d'entreprises"
              value={users.filter((u) => u.type_client === "entreprise").length}
              valueStyle={{ color: "#1890ff" }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>

        <Col span={4}>
          <Card>
            <Statistic
              title="Nombre de particuliers"
              value={users.filter((u) => u.type_client === "particulier").length}
              valueStyle={{ color: "#52c41a" }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {loading ? (
        <Spin
          tip="Chargement utilisateurs..."
          style={{ display: "block", textAlign: "center", padding: 40 }}
        />
      ) : (
        <Table
          className="my-compact-table"
          rowKey="id"
          size="small"
          columns={columns}
          dataSource={users}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      )}
    </>
  );
}

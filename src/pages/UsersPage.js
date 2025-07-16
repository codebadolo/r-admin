import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Spin,
  Table,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import {
  createUser,
  deleteUser,
  fetchRoles,
  fetchUsers,
  updateUser,
} from "../services/userServices";

const { Search } = Input;
const { Option } = Select;

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [form] = Form.useForm();
const navigate = useNavigate();
  // Charge utilisateurs et rôles
  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchUsers();
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      message.error("Erreur lors du chargement des utilisateurs");
      setUsers([]);
    }
    setLoading(false);
  };

  const loadRoles = async () => {
    try {
      const res = await fetchRoles();
      setRoles(Array.isArray(res.data) ? res.data : []);
    } catch {
      message.error("Erreur lors du chargement des rôles");
      setRoles([]);
    }
  };

  // Ouvre modal => si user passé : édition, sinon création
  const openModal = (user = null) => {
    setEditingUser(user);
    form.resetFields();
    if (user) {
      form.setFieldsValue({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        role: user.roles?.[0]?.id || null, // choix du 1er rôle si existant
        is_active: user.is_active ?? true,
      });
    }
    setModalVisible(true);
  };

  // Supprime utilisateur avec confirmation
  const handleDelete = (userId) => {
    Modal.confirm({
      title: "Confirmer la suppression de cet utilisateur ?",
      okText: "Oui",
      cancelText: "Non",
      async onOk() {
        try {
          await deleteUser(userId);
          message.success("Utilisateur supprimé");
          loadUsers();
        } catch {
          message.error("Erreur lors de la suppression");
        }
      },
    });
  };

  // Soumet formulaire (création/modification)
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        is_active: values.is_active,
        roles: values.role ? [values.role] : [],
      };
      if (editingUser) {
        await updateUser(editingUser.id, payload);
        message.success("Utilisateur mis à jour");
      } else {
        await createUser(payload);
        message.success("Utilisateur créé");
      }
      setModalVisible(false);
      loadUsers();
    } catch {
      message.error("Erreur lors de la sauvegarde");
    }
  };

  // Filtrage simple par prénom, nom, email
  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      user.first_name?.toLowerCase().includes(term) ||
      user.last_name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term)
    );
  });

  // Colonnes tableau, affichant les rôles concaténés par utilisateur
  const columns = [
    { title: "Prénom", dataIndex: "first_name", key: "first_name" },
    { title: "Nom", dataIndex: "last_name", key: "last_name" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Rôle(s)",
      key: "roles",
      render: (_, record) =>
        record.roles?.length > 0
          ? record.roles.map((r) => r.name).join(", ")
          : "-",
    },
    {
      title: "Actif",
      dataIndex: "is_active",
      key: "is_active",
      render: (val) => (val ? "Oui" : "Non"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
                  <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/users/${record.id}`)}
        >
          Voir
        </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            Modifier
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Supprimer
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Search
          placeholder="Rechercher utilisateur"
          allowClear
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 300 }}
          value={searchTerm}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          Ajouter utilisateur
        </Button>
      </Space>

      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredUsers}
          pagination={{ pageSize: 10 }}
        />
      )}

      <Modal
        visible={modalVisible}
        title={editingUser ? "Modifier utilisateur" : "Créer utilisateur"}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            label="Prénom"
            name="first_name"
            rules={[{ required: true, message: "Le prénom est requis" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Nom"
            name="last_name"
            rules={[{ required: true, message: "Le nom est requis" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "L'email est requis" },
              { type: "email", message: "Email invalide" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Rôle"
            name="role"
            rules={[{ required: true, message: "Le rôle est requis" }]}
          >
            <Select placeholder="Sélectionnez un rôle" allowClear>
              {roles.map((role) => (
                <Option key={role.id} value={role.id}>
                  {role.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Actif"
            name="is_active"
            valuePropName="checked"
            initialValue={true}
          >
            <Input type="checkbox" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

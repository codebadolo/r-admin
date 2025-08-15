import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Typography,
  Tooltip,
  Breadcrumb,
  Row,
  Col,
  Card,
  Statistic,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  HomeOutlined,
  ApartmentOutlined,
  FolderOpenOutlined,
  ClusterOutlined,
  BarsOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import * as productService from "../../services/productService";

const { Title } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  // Construire l’arbre depuis la liste plate
  const buildTreeData = (items) => {
    const map = {};
    const roots = [];

    items.forEach((cat) => {
      map[cat.id] = {
        key: cat.id,
        id: cat.id,
        nom: cat.nom,
        // Sécurisation accès parent_category.id
        parent_category:
          cat.parent_category !== null && typeof cat.parent_category === "object"
            ? cat.parent_category.id
            : cat.parent_category || null,
        description: cat.description,
        children: [],
      };
    });

    items.forEach((cat) => {
      const parentId =
        cat.parent_category !== null && typeof cat.parent_category === "object"
          ? cat.parent_category.id
          : cat.parent_category || null;
      if (parentId && map[parentId]) {
        map[parentId].children.push(map[cat.id]);
      } else {
        roots.push(map[cat.id]);
      }
    });

    const sortTree = (nodes) => {
      nodes.sort((a, b) => a.nom.localeCompare(b.nom));
      nodes.forEach((n) => n.children && sortTree(n.children));
    };
    sortTree(roots);

    return roots;
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await productService.fetchCategories();
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      setCategories(data);
    } catch (error) {
      console.error("Erreur chargement catégories :", error);
      message.error("Erreur lors du chargement des catégories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openModal = (category = null) => {
    setEditingCategory(category);
    if (category) {
      form.setFieldsValue({
        ...category,
        parent_category:
          category.parent_category !== null &&
          typeof category.parent_category === "object"
            ? category.parent_category.id
            : category.parent_category || null,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingCategory(null);
  };

  const onFinish = async (values) => {
    try {
      if (editingCategory) {
        await productService.updateCategory(editingCategory.id, values);
        message.success("Catégorie mise à jour avec succès");
      } else {
        await productService.createCategory(values);
        message.success("Catégorie créée avec succès");
      }
      closeModal();
      loadCategories();
    } catch (error) {
      console.error("Erreur sauvegarde catégorie :", error);
      message.error("Erreur lors de la sauvegarde de la catégorie");
    }
  };

  const onDelete = (id, nom) => {
    confirm({
      title: "Confirmer la suppression",
      icon: <ExclamationCircleOutlined />,
      content: `Voulez-vous vraiment supprimer la catégorie "${nom}" ?`,
      okText: "Oui",
      okType: "danger",
      cancelText: "Non",
      onOk: async () => {
        try {
          setLoading(true);
          await productService.deleteCategory(id);
          message.success("Catégorie supprimée");
          await loadCategories();
        } catch (error) {
          console.error("Erreur suppression catégorie :", error);
          message.error("Impossible de supprimer la catégorie");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const columns = [
    {
      title: "Nom",
      dataIndex: "nom",
      key: "nom",
      sorter: (a, b) => (a.nom || "").localeCompare(b.nom || ""),
      width: 250,
    },
    {
      title: "Catégorie Parente",
      key: "parent_category",
      render: (_, record) => {
        const parentCat = categories.find((c) => c.id === record.parent_category);
        return parentCat ? parentCat.nom : "-";
      },
      sorter: (a, b) => {
        const aName = categories.find((c) => c.id === a.parent_category)?.nom || "";
        const bName = categories.find((c) => c.id === b.parent_category)?.nom || "";
        return aName.localeCompare(bName);
      },
      width: 200,
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Modifier">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
              aria-label={`Modifier catégorie ${record.nom}`}
              disabled={loading}
            />
          </Tooltip>
          <Tooltip title="Supprimer">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => onDelete(record.id, record.nom)}
              aria-label={`Supprimer catégorie ${record.nom}`}
              disabled={loading}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const treeData = buildTreeData(categories);

  // Statistiques calculées
  const totalCategories = categories.length;
  const rootCategoriesCount = categories.filter(
    (cat) => !cat.parent_category || (typeof cat.parent_category === "object" ? !cat.parent_category.id : !cat.parent_category)
  ).length;

  // Moyenne nombre d'enfants par catégorie
  const avgChildrenPerCategory =
    categories.length > 0 
      ? (
          categories.reduce((acc, cat) => {
            const childrenCount = categories.filter((c) => {
              const parentId =
                c.parent_category && typeof c.parent_category === "object" ? c.parent_category.id : c.parent_category;
              return parentId === cat.id;
            }).length;
            return acc + childrenCount;
          }, 0) / categories.length
        ).toFixed(2)
      : 0;

  // Nombre de catégories avec enfants
  const categoriesWithChildrenCount = categories.filter(cat => 
    categories.some(c => {
      const parentId = c.parent_category && typeof c.parent_category === "object" ? c.parent_category.id : c.parent_category;
      return parentId === cat.id;
    })
  ).length;

  // Nombre de catégories feuilles (sans enfants)
  const leafCategoriesCount = totalCategories - categoriesWithChildrenCount;

  // Nombre de catégories avec description non vide
  const categoriesWithDescriptionCount = categories.filter(cat => cat.description && cat.description.trim() !== "").length;

  return (
    <div style={{ padding: 24, backgroundColor: "#fff" }}>
      {/* Breadcrumb et bouton d'ajout */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Breadcrumb>
            <Breadcrumb.Item href="/">
              <HomeOutlined />
            </Breadcrumb.Item>
            <Breadcrumb.Item>Gestion des Catégories</Breadcrumb.Item>
          </Breadcrumb>
        </Col>
        <Col>
          <Button type="primary" onClick={() => openModal()} disabled={loading}>
            Ajouter une catégorie
          </Button>
        </Col>
      </Row>

      {/* Cards de statistiques */}
      <Row gutter={16} style={{ marginBottom: 24 }} wrap={false} justify="start">
        <Col span={4}>
          <Card>
            <Statistic
              title="Nombre total de catégories"
              value={totalCategories}
              valueStyle={{ color: "#3f8600" }}
              prefix={<ApartmentOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Catégories racines"
              value={rootCategoriesCount}
              valueStyle={{ color: "#1890ff" }}
              prefix={<FolderOpenOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Moyenne enfants/catégorie"
              value={avgChildrenPerCategory}
              valueStyle={{ color: "#faad14" }}
              prefix={<ClusterOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Catégories avec enfants"
              value={categoriesWithChildrenCount}
              valueStyle={{ color: "#2f54eb" }}
              prefix={<BarsOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Catégories sans enfants"
              value={leafCategoriesCount}
              valueStyle={{ color: "#cf1322" }}
              prefix={<BarsOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Catégories avec description"
              value={categoriesWithDescriptionCount}
              valueStyle={{ color: "#eb2f96" }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Table
        dataSource={treeData}
        columns={columns}
        rowKey="id"
        size="small"
        loading={loading}
        pagination={{ pageSize: 10 }}
        bordered
        expandable={{ defaultExpandAllRows: true }}
        scroll={{ x: 600 }}
      />

      <Modal
        title={editingCategory ? "Modifier la catégorie" : "Ajouter une catégorie"}
        visible={modalVisible}
        onCancel={closeModal}
        onOk={() => form.submit()}
        okText={editingCategory ? "Mettre à jour" : "Créer"}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish} preserve={false}>
          <Form.Item
            label="Nom"
            name="nom"
            rules={[{ required: true, message: "Le nom est requis" }]}
          >
            <Input placeholder="Nom de la catégorie" />
          </Form.Item>

          <Form.Item label="Catégorie Parente" name="parent_category">
            <Select
              allowClear
              placeholder="Sélectionnez une catégorie parente (optionnel)"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {categories
                .filter((cat) => !editingCategory || cat.id !== editingCategory.id)
                .map((cat) => (
                  <Option key={cat.id} value={cat.id}>
                    {cat.nom}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} placeholder="Description optionnelle" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoriesPage;

import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Input,
  Layout,
  message,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Tree,
} from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

import productService from "../../services/productService";

const { Content } = Layout;
const { Search } = Input;
const { Option } = Select;
const { TreeNode } = Tree;

// Ajoute le champ `parent_name` pour l’affichage
function enrichCategoriesWithParentName(categories) {
  const idToName = {};
  categories.forEach(cat => {
    idToName[cat.id] = cat.name;
  });
  return categories.map(cat => ({
    ...cat,
    parent_name:
      cat.parent && cat.parent !== 0 ? idToName[cat.parent] || "Non défini" : "Racine",
  }));
}

// Construire une arborescence à partir d'une liste plate
function buildCategoryTree(categories) {
  const map = {};
  categories.forEach(cat => {
    map[cat.id] = { ...cat, children: [] };
  });
  const tree = [];
  categories.forEach(cat => {
    if (cat.parent && cat.parent !== 0 && map[cat.parent]) {
      map[cat.parent].children.push(map[cat.id]);
    } else {
      tree.push(map[cat.id]);
    }
  });
  return tree;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formVals, setFormVals] = useState({ name: "", parent: 0 });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await productService.getCategories();
      const enriched = enrichCategoriesWithParentName(res.data);
      setCategories(enriched);
    } catch {
      message.error("Erreur lors du chargement des catégories");
    } finally {
      setLoading(false);
    }
  };

  // Filtre simple par nom puis construction arbre
  const filteredTree = () => {
    const filtered = !searchTerm.trim()
      ? categories
      : categories.filter(cat =>
          cat.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    return buildCategoryTree(filtered);
  };

  function openModal(category = null) {
    setEditingCategory(category);
    setFormVals({
      name: category ? category.name : "",
      parent: category ? category.parent || 0 : 0,
    });
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    setEditingCategory(null);
    setFormVals({ name: "", parent: 0 });
  }

  async function submitForm() {
    if (!formVals.name.trim()) {
      message.error("Le nom est obligatoire");
      return;
    }
    if (editingCategory && formVals.parent === editingCategory.id) {
      message.error("Une catégorie ne peut pas être sa propre catégorie parente");
      return;
    }

    try {
      if (editingCategory) {
        await productService.updateCategory(editingCategory.id, formVals);
        message.success("Catégorie mise à jour");
      } else {
        await productService.createCategory(formVals);
        message.success("Catégorie créée");
      }
      closeModal();
      loadCategories();
    } catch {
      message.error("Erreur lors de la sauvegarde");
    }
  }

  const handleDelete = (category) => {
    Modal.confirm({
      title: `Voulez-vous vraiment supprimer la catégorie "${category.name}" ?`,
      okText: "Oui",
      cancelText: "Non",
      async onOk() {
        try {
          await productService.deleteCategory(category.id);
          message.success("Catégorie supprimée");
          loadCategories();
        } catch (error) {
          console.error("Erreur suppression:", error);
          message.error("Erreur lors de la suppression");
        }
      },
    });
  };

  // Rendu récursif de l’arbre avec actions
  function renderTree(nodes) {
    return nodes.map(n => (
      <TreeNode
        key={n.id}
        title={
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "6px 12px",
              fontWeight: 500,
              fontSize: 17,
              borderRadius: 8,
              transition: "background .13s",
              userSelect: "none",
            }}
            onMouseOver={e => (e.currentTarget.style.background = "#f3f7fe")}
            onMouseOut={e => (e.currentTarget.style.background = "transparent")}
          >
            <span>
              {n.name}{" "}
              <i style={{
                color: "#999",
                fontWeight: "normal",
                marginLeft: 8,
                fontSize: 14,
                fontStyle: "normal",
              }}>
                (Parent : {n.parent_name})
              </i>
            </span>
            <Space>
              <Button
                size="small"
                type="text"
                style={{ color: "#1976d2", fontWeight: 600 }}
                onClick={() => openModal(n)}
                title="Modifier la catégorie"
              >
                Modifier
              </Button>
              <Button
                size="small"
                type="text"
                danger
                onClick={() => handleDelete(n)}
                title="Supprimer la catégorie"
              >
                Supprimer
              </Button>
            </Space>
          </div>
        }
      >
        {n.children && n.children.length > 0 && renderTree(n.children)}
      </TreeNode>
    ));
  }

  return (
    <Layout style={{ background: "#f6f8fa" }}>
      <Content
        style={{
          maxWidth: 900,
          margin: "48px auto",
          padding: 36,
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 8px 36px rgba(0,0,0,0.08)",
        }}
      >
        <Row justify="space-between" align="middle" style={{ marginBottom: 32, gap: 12 }}>
          <Col>
            <h1 style={{ fontWeight: 700, fontSize: 32, color: "#222", margin: 0 }}>
              Catégories
            </h1>
          </Col>

          <Col style={{ flex: 1, maxWidth: 380 }}>
            <Search
              placeholder="Rechercher une catégorie"
              allowClear
              size="large"
              style={{ width: "100%", borderRadius: 8 }}
              onChange={e => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
          </Col>

          <Col>
            <Button
              icon={<ReloadOutlined />}
              size="large"
              style={{ borderRadius: 8, marginRight: 10 }}
              onClick={loadCategories}
              title="Recharger"
            />
            <Button
              icon={<PlusOutlined />}
              type="primary"
              size="large"
              style={{ borderRadius: 8 }}
              onClick={() => openModal(null)}
              title="Ajouter une catégorie"
            >
              Ajouter
            </Button>
          </Col>
        </Row>

        {loading ? (
          <Spin tip="Chargement..." size="large" />
        ) : (
          <Tree
            showLine
            defaultExpandAll
            blockNode
            style={{
              fontSize: 17,
              fontWeight: 500,
              borderRadius: 10,
              padding: "12px 6px",
              background: "#fafbff",
              userSelect: "none",
            }}
          >
            {renderTree(filteredTree())}
          </Tree>
        )}

        {/* Modal de création / modification */}
        <Modal
          open={modalVisible}
          title={editingCategory ? "Modifier la catégorie" : "Créer une catégorie"}
          okText={editingCategory ? "Enregistrer" : "Créer"}
          onOk={submitForm}
          onCancel={closeModal}
          destroyOnClose
        >
          <Input
            placeholder="Nom de la catégorie"
            value={formVals.name}
            onChange={e => setFormVals({...formVals, name: e.target.value})}
            style={{ marginBottom: 22, fontSize: 16 }}
            autoFocus
          />

          <label
            style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, display: "block" }}
          >
            Catégorie parente
          </label>

          <Select
            showSearch
            placeholder="Sélectionnez une catégorie parente (ou aucune)"
            optionFilterProp="children"
            allowClear
            value={formVals.parent || 0}
            onChange={value => setFormVals({...formVals, parent: value || 0})}
            filterOption={(input, option) =>
              option.children.toLowerCase().includes(input.toLowerCase())
            }
            style={{ width: "100%", fontSize: 16 }}
          >
            <Option value={0}>Aucune (catégorie racine)</Option>
            {categories
              .filter(cat => !editingCategory || cat.id !== editingCategory.id)
              .map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
          </Select>
        </Modal>
      </Content>
    </Layout>
  );
}

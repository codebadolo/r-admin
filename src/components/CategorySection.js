import { Button, Form, Input, message, Modal, Select, Space, Spin, Tree } from "antd";
import { useEffect, useState } from "react";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from "../services/productService";

// Construction arbre avec sélectabilité selon enfants
function buildTreeSelectable(categories, parentId = null) {
  return categories
    .filter(cat => (cat.parent === parentId)) // MODIFIÉ ICI
    .map(cat => {
      const children = buildTreeSelectable(categories, cat.id);
      return {
        title: cat.name,
        key: cat.id,
        children,
        selectable: children.length > 0,
      };
    });
}


export default function CategorySection() {
  const [categories, setCategories] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

const loadCategories = () => {
  setLoading(true);
  fetchCategories()
    .then(cats => {
      console.log("Catégories brutes reçues de l'API:", cats); // Ajoutez cette ligne
      setCategories(cats);
      setTreeData(buildTreeSelectable(cats));
    })
    .catch(() => message.error("Erreur de chargement des catégories"))
    .finally(() => setLoading(false));
};


  useEffect(() => {
    loadCategories();
  }, []);

const onSelect = (selectedKeys, info) => {
  if (!info.node || !info.node.selectable) {
    message.warning("Veuillez sélectionner uniquement une catégorie parente");
    return;
  }

  if (selectedKeys.length === 0) {
    setSelectedKey(null);
    setEditingCategory(null);
    form.resetFields();
  } else {
    const id = selectedKeys[0];
    setSelectedKey(id);
    const cat = categories.find(c => c.id === id);  // Ici le problème possible
    setEditingCategory(cat);
    form.setFieldsValue({
      name: cat.name,
      parent: cat.parent ? cat.parent.id : null,
    });
  }
};


  const openAddModal = () => {
    setEditingCategory(null);
    setModalVisible(true);
    form.resetFields();
  };

  const openEditModal = () => {
    if (!editingCategory) {
      message.warn("Veuillez sélectionner une catégorie à modifier");
      return;
    }
    setModalVisible(true);
  };

  const handleDelete = () => {
    if (!editingCategory) {
      message.warn("Veuillez sélectionner une catégorie à supprimer");
      return;
    }
    Modal.confirm({
      title: "Confirmer la suppression",
      content: "Voulez-vous vraiment supprimer cette catégorie ?",
      okText: "Oui",
      cancelText: "Non",
      onOk: () => {
        deleteCategory(editingCategory.id)
          .then(() => {
            message.success("Catégorie supprimée");
            setSelectedKey(null);
            setEditingCategory(null);
            form.resetFields();
            loadCategories();
          })
          .catch(() => message.error("Erreur lors de la suppression"));
      },
    });
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const data = {
        name: values.name,
        parent: values.parent || null,
      };

      const action = editingCategory
        ? updateCategory(editingCategory.id, data)
        : createCategory(data);

      action
        .then(() => {
          message.success(`Catégorie ${editingCategory ? "modifiée" : "créée"}`);
          setModalVisible(false);
          setSelectedKey(null);
          setEditingCategory(null);
          form.resetFields();
          loadCategories();
        })
        .catch(() => message.error("Erreur à l'enregistrement"));
    });
  };

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={openAddModal}>Ajouter une catégorie</Button>
        <Button disabled={!editingCategory} onClick={openEditModal}>Modifier la catégorie sélectionnée</Button>
        <Button danger disabled={!editingCategory} onClick={handleDelete}>Supprimer la catégorie sélectionnée</Button>
      </Space>

      {loading ? (
        <Spin />
      ) : (
        <Tree
          showLine
          defaultExpandAll
          treeData={treeData}
          onSelect={onSelect}
          selectedKeys={selectedKey ? [selectedKey] : []}
        />
      )}

      <Modal
        title={editingCategory ? "Modifier une catégorie" : "Ajouter une catégorie"}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ parent: null }}>
          <Form.Item
            name="name"
            label="Nom de la catégorie"
            rules={[{ required: true, message: "Veuillez saisir un nom" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="parent"
            label="Catégorie parente (optionnel)"
            // Passage des options via prop options (plus moderne)
            // Options = tableau d’objets { value, label }
          >
            <Select
              allowClear
              placeholder="Choisir une catégorie parente"
              options={categories
                .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                .map(cat => ({ value: cat.id, label: cat.name }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

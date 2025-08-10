import { Button, Form, Input, message, Modal, Select, Space, Spin, Tree } from "antd";
import { useEffect, useState } from "react";
import productService from "../../services/productService";


// Construction de l’arbre compatible avec la structure retournée
// Ici on assume que chaque catégorie a : { id, name, parent: null | objet { id, name } }
// On utilise parentId comme id parent attendu, donc si parent est objet, on utilise parent.id
function buildTreeSelectable(categories, parentId = null) {
  return categories
    .filter(cat => {
      // parent peut être null ou un objet avec id
      const pId = cat.parent ? (typeof cat.parent === "object" ? cat.parent.id : cat.parent) : null;
      return pId === parentId;
    })
    .map(cat => {
      const children = buildTreeSelectable(categories, cat.id);
      return {
        title: cat.name,
        key: cat.id,
        children,
        // On autorise la sélection uniquement sur les catégories sans enfants
        selectable: children.length === 0,
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

  // Chargement des catégories
  const loadCategories = () => {
    setLoading(true);
    productService.getCategories()
      .then(res => {
        // res.data doit être la liste effective des catégories
        const cats = res.data;

        // Normalisation: convertir les parents en id ou null
        // Certains API renvoient parent en objet, ici on garde la structure complète
        setCategories(cats);

        // Construction de l’arbre
        setTreeData(buildTreeSelectable(cats));
      })
      .catch(() => message.error("Erreur de chargement des catégories"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const onSelect = (selectedKeys, info) => {
    if (!info.node) return;

    // Sélection uniquement si node.selectable (pas parent)
    if (!info.node.selectable) {
      message.warning("Veuillez sélectionner uniquement une catégorie sans enfant");
      return;
    }

    if (selectedKeys.length === 0) {
      setSelectedKey(null);
      setEditingCategory(null);
      form.resetFields();
    } else {
      const id = selectedKeys[0];
      setSelectedKey(id);

      // Trouver la catégorie sélectionnée dans categories
      const cat = categories.find(c => c.id === id);
      setEditingCategory(cat);

      form.setFieldsValue({
        name: cat.name,
        // remonter id du parent ou null
        parent: cat.parent ? (typeof cat.parent === "object" ? cat.parent.id : cat.parent) : null,
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
        productService.deleteCategory(editingCategory.id)
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
      // Construire la payload API
      const data = {
        name: values.name,
        parent: values.parent || null,
      };

      const action = editingCategory
        ? productService.updateCategory(editingCategory.id, data)
        : productService.createCategory(data);

      action
        .then(() => {
          message.success(`Catégorie ${editingCategory ? "modifiée" : "créée"} avec succès`);
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
        <Button type="primary" onClick={openAddModal}>
          Ajouter une catégorie
        </Button>
        <Button disabled={!editingCategory} onClick={openEditModal}>
          Modifier la catégorie sélectionnée
        </Button>
        <Button danger disabled={!editingCategory} onClick={handleDelete}>
          Supprimer la catégorie sélectionnée
        </Button>
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

          <Form.Item name="parent" label="Catégorie parente (optionnel)">
            <Select
              allowClear
              placeholder="Choisir une catégorie parente"
              options={categories
                // Ne pas autoriser un choix avec la catégorie même pour éviter boucle
                .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                .map(cat => ({
                  value: cat.id,
                  label: cat.name,
                }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

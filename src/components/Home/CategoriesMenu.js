import { CloseOutlined, MenuOutlined } from "@ant-design/icons";
import { Button, Drawer, Menu } from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";
import "./CategoriesMenu.css"; // pour styles personnalisés

// Exemple données catégories / sous-cat
const categoriesData = [
  {
    id: 1,
    name: "Informatique",
    subcategories: [
      { id: 11, name: "Ordinateurs portables" },
      { id: 12, name: "Composants PC" },
      { id: 13, name: "Périphériques" },
    ],
  },
  {
    id: 2,
    name: "Téléphonie",
    subcategories: [
      { id: 21, name: "Smartphones" },
      { id: 22, name: "Accessoires téléphonie" },
    ],
  },
  {
    id: 3,
    name: "Audio",
    subcategories: [
      { id: 31, name: "Casques" },
      { id: 32, name: "Enceintes" },
    ],
  },
  {
    id: 4,
    name: "Gaming",
    subcategories: [
      { id: 41, name: "Consoles" },
      { id: 42, name: "Accessoires" },
    ],
  },
];

export default function CategoriesMenu() {
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Catégories à afficher horizontalement (ex: 3 premières)
  const mainCategories = categoriesData.slice(0, 3);

  // Ouvre drawer categories
  const showDrawer = () => setDrawerVisible(true);
  const onClose = () => setDrawerVisible(false);

  return (
    <nav className="categories-menu-container">
      <div className="categories-horizontal">
        {mainCategories.map((cat) => (
          <div key={cat.id} className="category-item">
            <Link to={`/category/${cat.id}`}>{cat.name}</Link>
          </div>
        ))}

        <Button
          icon={<MenuOutlined />}
          type="text"
          className="btn-all-categories"
          onClick={showDrawer}
          aria-label="Afficher toutes les catégories"
        >
          Toutes les catégories
        </Button>
      </div>

      <Drawer
        title={
          <div>
            Toutes les catégories
            <Button
              icon={<CloseOutlined />}
              type="text"
              onClick={onClose}
              aria-label="Fermer"
              style={{ float: "right" }}
            />
          </div>
        }
        placement="left"
        onClose={onClose}
        visible={drawerVisible}
        width={320}
      >
        <Menu mode="inline" selectable={false} className="drawer-categories-menu">
          {categoriesData.map((cat) => (
            <Menu.SubMenu key={cat.id} title={cat.name}>
              {cat.subcategories.map((sub) => (
                <Menu.Item key={sub.id}>
                  <Link to={`/category/${sub.id}`}>{sub.name}</Link>
                </Menu.Item>
              ))}
            </Menu.SubMenu>
          ))}
        </Menu>
      </Drawer>
    </nav>
  );
}

import {
  BellOutlined,
  LogoutOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Dropdown,
  Layout,
  Menu,
  Space,
  Typography,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;
const { Text } = Typography;

const Topbar = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [userName, setUserName] = useState("Utilisateur");
  // Pour l’exemple, on pourrait aussi récupérer une URL d’avatar réelle
  const [userAvatar,] = useState(null);

  const navigate = useNavigate();

  // Exemple : récupérer le nom user au chargement (depuis localStorage ou API)
  useEffect(() => {
    // Supposons qu’on stocke username en localStorage :
    const savedName = localStorage.getItem("username");
    if (savedName) {
      setUserName(savedName);
    }
    // Vous pouvez aussi récupérer avatar ici si stocké ou via API
  }, []);

  const handleMenuClick = ({ key }) => {
    setDropdownVisible(false);
    switch (key) {
      case "logout": {
        // Supprimer token + infos utilisateur
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        message.success("Vous êtes déconnecté.");
        // Redirection vers page login
        navigate("/login");
        break;
      }
      case "settings":
        // Redirection vers paramètres utilisateur
        navigate("/settings");
        break;
      case "profile":
        // Redirection vers profil utilisateur
        navigate("/profile");
        break;
      default:
    }
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Profil
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Paramètres
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} danger>
        Déconnexion
      </Menu.Item>
    </Menu>
  );

  return (
    <Header
      style={{
        background: "#fff",
        padding: "0 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 8px #f0f1f2",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div style={{ fontWeight: "bold", fontSize: 20 }}>
        ROH Store - Tableau de bord
      </div>

      <Space size="large" align="center">
        <Badge count={5} size="small">
          <BellOutlined style={{ fontSize: 20, cursor: "pointer" }} />
        </Badge>

        <Dropdown
          overlay={menu}
          trigger={["click"]}
          onVisibleChange={setDropdownVisible}
          visible={dropdownVisible}
          placement="bottomRight"
        >
          <Space style={{ cursor: "pointer" }}>
            {userAvatar ? (
              <Avatar src={userAvatar} />
            ) : (
              <Avatar icon={<UserOutlined />} />
            )}
            <Text strong>{userName}</Text>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default Topbar;

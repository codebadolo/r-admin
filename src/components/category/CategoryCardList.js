import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Avatar, Card, Col, Popconfirm, Row, Tooltip } from "antd";

export default function CategoryCardList({ categories, onEdit, onDelete }) {
  return (
    <Row gutter={[16, 24]}>
      {categories.map((category) => (
        <Col key={category.id} xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            cover={
              category.logo ? (
                <img
                  alt={category.name}
                  src={category.logo}
                  style={{
                    height: 140,
                    objectFit: "contain",
                    margin: "12px auto",
                  }}
                />
              ) : (
                <Avatar
                  size={140}
                  style={{
                    backgroundColor: "#87d068",
                    fontSize: 48,
                    lineHeight: "140px",
                    width: "100%",
                  }}
                >
                  {category.name?.[0]?.toUpperCase() || "?"}
                </Avatar>
              )
            }
            actions={[
              <Tooltip title="Modifier" key="edit">
                <EditOutlined onClick={() => onEdit(category)} />
              </Tooltip>,
              <Tooltip title="Supprimer" key="delete">
                <Popconfirm
                  title={`Supprimer la catégorie "${category.name}"?`}
                  onConfirm={() => onDelete(category)}
                  okText="Oui"
                  cancelText="Non"
                >
                  <DeleteOutlined />
                </Popconfirm>
              </Tooltip>,
            ]}
          >
            <Card.Meta title={category.name} style={{ textAlign: "center" }} />
          </Card>
        </Col>
      ))}
    </Row>
  );
}

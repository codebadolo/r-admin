import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Avatar, Card, Col, Popconfirm, Row, Tooltip } from "antd";

export default function BrandCardList({ brands, onEdit, onDelete }) {
  return (
    <Row gutter={[16, 24]}>
      {brands.map((brand) => (
        <Col key={brand.id} xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            cover={
              brand.logo ? (
                <img alt={brand.name} src={brand.logo} style={{ height: 140, objectFit: "contain", padding: 12 }} />
              ) : (
                <Avatar
                  size={140}
                  style={{ backgroundColor: "#87d068", lineHeight: "140px", fontSize: 48, width: "100%" }}
                >
                  {brand.name?.[0]?.toUpperCase() || "?"}
                </Avatar>
              )
            }
            actions={[
              <Tooltip title="Modifier" key="edit">
                <EditOutlined onClick={() => onEdit(brand)} />
              </Tooltip>,
              <Tooltip title="Supprimer" key="delete">
                <Popconfirm
                  title={`Supprimer la marque "${brand.name}" ?`}
                  onConfirm={() => onDelete(brand)}
                  okText="Oui"
                  cancelText="Non"
                >
                  <DeleteOutlined />
                </Popconfirm>
              </Tooltip>,
            ]}
          >
            <Card.Meta title={brand.name} style={{ textAlign: "center" }} />
          </Card>
        </Col>
      ))}
    </Row>
  );
}

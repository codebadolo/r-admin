import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Image, Popconfirm, Table } from "antd";

export default function BrandTable({ brands, loading, onEdit, onDelete }) {
  const columns = [
    {
      title: "Logo",
      dataIndex: "logo",
      render: (logo) => logo ? <Image src={logo} width={40} /> : "—",
      width: 80,
    },
    {
      title: "Nom",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, brand) => (
        <>
          <Button
            icon={<EditOutlined />}
            onClick={() => onEdit(brand)}
            style={{ marginRight: 8 }}
          />
          <Popconfirm
            title="Confirmer la suppression ?"
            onConfirm={() => onDelete(brand)}
            okText="Oui"
            cancelText="Non"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </>
      ),
      width: 110,
    },
  ];

  return (
    <Table
      rowKey="id"
      dataSource={brands}
      columns={columns}
      loading={loading}
      pagination={{ pageSize: 10 }}
    />
  );
}

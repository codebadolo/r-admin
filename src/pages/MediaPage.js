import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Image, List, Modal, Space, Typography, Upload } from 'antd';
import { useState } from 'react';

const { Title } = Typography;

const MediaPage = () => {
  const [mediaList, setMediaList] = useState([
    { id: 1, sku: 'SKU001', url: '/images/sample1.jpg', alt: 'Image produit 1', isFeature: true },
    { id: 2, sku: 'SKU002', url: '/images/sample2.jpg', alt: 'Image produit 2', isFeature: false },
  ]);
  const [uploadVisible, setUploadVisible] = useState(false);

  const handleDelete = (id) => {
    setMediaList(mediaList.filter(m => m.id !== id));
  };

  return (
    <>
      <Title level={2}>Gestion des Médias</Title>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setUploadVisible(true)} style={{ marginBottom: 16 }}>
        Ajouter un média
      </Button>

      <List
        grid={{ gutter: 16, column: 4 }}
        dataSource={mediaList}
        renderItem={item => (
          <List.Item>
            <Image src={item.url} alt={item.alt} style={{ maxHeight: 150, objectFit: 'cover' }} />
            <Space direction="vertical" style={{ width: '100%' }}>
              <div><b>SKU:</b> {item.sku}</div>
              <div><b>Alt text:</b> {item.alt}</div>
              <div><b>Image principale:</b> {item.isFeature ? 'Oui' : 'Non'}</div>
              <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(item.id)}>Supprimer</Button>
            </Space>
          </List.Item>
        )}
      />

      <Modal
        title="Ajouter un média"
        visible={uploadVisible}
        onCancel={() => setUploadVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Upload
          listType="picture"
          maxCount={1}
          // TODO: configurer action API upload
        >
          <Button icon={<PlusOutlined />}>Sélectionner un fichier</Button>
        </Upload>
      </Modal>
    </>
  );
};

export default MediaPage;

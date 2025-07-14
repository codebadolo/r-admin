import { CopyOutlined, DeleteOutlined, PictureOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Form, Image, Input, InputNumber, message, Modal, Select, Space, Table, Tooltip, Typography, Upload } from 'antd';
import { useEffect, useRef, useState } from 'react';

const { Option } = Select;
const { Title } = Typography;

// Produit cartésien pour générer toutes les combinaisons d'attributs
function cartesianProduct(arr) {
  return arr.reduce((a, b) => a.flatMap(d => b.map(e => [].concat(d, e))), [[]]);
}

const GestionVariantes = ({
  attributs = [],
  data = [],
  imagesMedias = [],
  onChange,
}) => {
  const safeAttributs = Array.isArray(attributs) ? attributs : [];
  const [variants, setVariants] = useState(data);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [form] = Form.useForm();
  // Liste dynamique des images/médias (locales + props)
  const [localImages, setLocalImages] = useState([]);
  const uploadInputRef = useRef();

  // Fusion des images passées en props et uploadées localement
  const allImages = [...imagesMedias, ...localImages];

  // Génère toutes les combinaisons d'attributs à chaque changement
  useEffect(() => {
    const attrArrays = safeAttributs.map(attr =>
      Array.isArray(attr.values) ? attr.values.map(val => ({ [attr.attribute]: val })) : []
    );
    const combos = attrArrays.length ? cartesianProduct(attrArrays) : [];
    const rows = combos.map(comboArr => {
      const combo = Object.assign({}, ...comboArr);
      const key = Object.values(combo).join('-');
      const existing = data.find(v => v.key === key);
      return (
        existing || {
          key,
          attributes: combo,
          sku: '',
          retail_price: 0,
          stock_units: 0,
          mediaIds: [],
        }
      );
    });
    setVariants(rows);
    onChange && onChange(rows);
    // eslint-disable-next-line
  }, [JSON.stringify(safeAttributs)]);

  // Édition inline
  const handleChange = (value, record, field) => {
    const newVariants = variants.map(v =>
      v.key === record.key ? { ...v, [field]: value } : v
    );
    setVariants(newVariants);
    onChange && onChange(newVariants);
  };

  // Suppression d'une variante
  const handleDelete = (record) => {
    Modal.confirm({
      title: 'Supprimer cette variante ?',
      content: (
        <span>
          Confirmer la suppression de la variante :
          <br />
          {Object.entries(record.attributes).map(
            ([k, v]) => (
              <span key={k}><b>{k}:</b> {v} </span>
            )
          )}
        </span>
      ),
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: () => {
        const newVariants = variants.filter(v => v.key !== record.key);
        setVariants(newVariants);
        onChange && onChange(newVariants);
      },
    });
  };

  // Duplication rapide
  const handleDuplicate = (record) => {
    const copy = { ...record, key: record.key + '-copy' + Date.now() };
    setVariants([...variants, copy]);
    onChange && onChange([...variants, copy]);
    message.success('Variante dupliquée');
  };

  // Ajout manuel d'une variante
  const handleAddVariant = (values) => {
    const key = Object.values(values.attributes).join('-') + '-' + Date.now();
    const newVariant = { ...values, key, mediaIds: [] };
    setVariants([...variants, newVariant]);
    onChange && onChange([...variants, newVariant]);
    setAddModalOpen(false);
    form.resetFields();
  };

  // Ajout dynamique d'image (upload local)
  const handleImageUpload = ({ file }) => {
    // Crée un objet image local (pas encore envoyé au backend)
    const reader = new FileReader();
    reader.onload = (e) => {
      const newImg = {
        uid: 'local-' + Date.now(),
        name: file.name,
        url: e.target.result,
      };
      setLocalImages((imgs) => [...imgs, newImg]);
      message.success('Image ajoutée !');
    };
    reader.readAsDataURL(file);
    // Empêche l'upload automatique (on gère tout côté client ici)
    return false;
  };

  // Affichage des images associées à la variante
  const renderImages = (mediaIds) => (
    <Space>
      {mediaIds.map(id => {
        const img = allImages.find(img => img.uid === id || img.id === id);
        return img ? (
          <Tooltip key={id} title={img.name || img.url}>
            <Image src={img.url || img.thumbUrl} width={32} height={32} preview={false} style={{ borderRadius: 4 }} />
          </Tooltip>
        ) : null;
      })}
    </Space>
  );

  // Colonnes du tableau de variantes
  const columns = [
    {
      title: 'Attributs',
      dataIndex: 'attributes',
      render: (attrs) =>
        <Space>
          {Object.entries(attrs).map(([k, v]) => (
            <span key={k}><b>{k}:</b> {v}</span>
          ))}
        </Space>
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      render: (_, r) => (
        <Input
          value={r.sku}
          onChange={e => handleChange(e.target.value, r, 'sku')}
          placeholder="SKU unique"
          maxLength={32}
        />
      ),
    },
    {
      title: 'Prix',
      dataIndex: 'retail_price',
      render: (_, r) => (
        <InputNumber
          min={0}
          value={r.retail_price}
          onChange={v => handleChange(v, r, 'retail_price')}
          style={{ width: 90 }}
          addonAfter="€"
        />
      ),
    },
    {
      title: 'Stock',
      dataIndex: 'stock_units',
      render: (_, r) => (
        <InputNumber
          min={0}
          value={r.stock_units}
          onChange={v => handleChange(v, r, 'stock_units')}
          style={{ width: 70 }}
        />
      ),
    },
    {
      title: 'Images',
      dataIndex: 'mediaIds',
      render: (mediaIds, record) => (
        <Space>
          <Select
            mode="multiple"
            allowClear
            style={{ minWidth: 90, maxWidth: 180 }}
            placeholder="Associer"
            value={mediaIds}
            onChange={val => handleChange(val, record, 'mediaIds')}
            optionLabelProp="label"
            maxTagCount={2}
          >
            {allImages.map(img => (
              <Option key={img.uid || img.id} value={img.uid || img.id} label={img.name || img.url}>
                <Space>
                  <PictureOutlined /> {img.name || img.url}
                </Space>
              </Option>
            ))}
          </Select>
          {mediaIds.length > 0 && renderImages(mediaIds)}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Dupliquer">
            <Button icon={<CopyOutlined />} onClick={() => handleDuplicate(record)} />
          </Tooltip>
          <Tooltip title="Supprimer">
            <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Pour l'ajout manuel
  const attributeFields = safeAttributs.map(a => a.attribute);

  return (
    <>
      <Title level={4} style={{ marginBottom: 16 }}>Définir les variantes (SKU)</Title>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => setAddModalOpen(true)}
        >
          Ajouter une variante manuellement
        </Button>
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={handleImageUpload}
        >
          <Button icon={<UploadOutlined />}>Ajouter une image</Button>
        </Upload>
      </Space>
      <Table
        columns={columns}
        dataSource={variants}
        pagination={false}
        rowKey="key"
        size="middle"
        bordered
        style={{ background: '#fff' }}
        scroll={{ x: true }}
      />

      <Modal
        open={addModalOpen}
        title="Ajouter une variante"
        onCancel={() => setAddModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleAddVariant}>
          <Form.Item label="Attributs" required>
            <Space direction="vertical" style={{ width: '100%' }}>
              {attributeFields.map(attr => (
                <Form.Item key={attr} name={['attributes', attr]} label={attr} rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
              ))}
            </Space>
          </Form.Item>
          <Form.Item name="sku" label="SKU">
            <Input />
          </Form.Item>
          <Form.Item name="retail_price" label="Prix">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="stock_units" label="Stock">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="mediaIds" label="Images associées">
            <Select
              mode="multiple"
              allowClear
              placeholder="Associer des images"
              optionLabelProp="label"
              maxTagCount={2}
            >
              {allImages.map(img => (
                <Option key={img.uid || img.id} value={img.uid || img.id} label={img.name || img.url}>
                  <Space>
                    <PictureOutlined /> {img.name || img.url}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default GestionVariantes;

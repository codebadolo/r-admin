import { PlusOutlined } from '@ant-design/icons';
import { Modal, Radio, Typography, Upload } from 'antd';
import { useEffect, useState } from 'react';

const { Title } = Typography;

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const ImagesMedias = ({ data = [], onChange }) => {
  const [fileList, setFileList] = useState(data);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [mainImageId, setMainImageId] = useState(null);

  useEffect(() => {
    onChange(fileList);
  }, [fileList, onChange]);

  const handleCancel = () => setPreviewVisible(false);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const onMainImageChange = (e) => {
    setMainImageId(e.target.value);
  };

  return (
    <>
      <Title level={4}>Images et Médias</Title>
      <Radio.Group onChange={onMainImageChange} value={mainImageId} style={{ marginBottom: 16 }}>
        {fileList.map((file) => (
          <Radio key={file.uid} value={file.uid} style={{ display: 'block', marginBottom: 8 }}>
            {file.name || file.url}
          </Radio>
        ))}
      </Radio.Group>
      <Upload
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        beforeUpload={() => false} // empêche upload automatique
      >
        {fileList.length >= 8 ? null : <div><PlusOutlined /><div style={{ marginTop: 8 }}>Ajouter</div></div>}
      </Upload>
      <Modal visible={previewVisible} title={previewTitle} footer={null} onCancel={handleCancel}>
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  );
};

export default ImagesMedias;

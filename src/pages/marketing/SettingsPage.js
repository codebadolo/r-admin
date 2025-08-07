import { LockOutlined, NotificationOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Modal, Space, Typography, message } from 'antd';
import { useState } from 'react';

const { Title } = Typography;

const SettingsPage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [form] = Form.useForm();

  const openModal = (type) => {
    setModalContent(type);
    setModalVisible(true);
    form.resetFields();
  };

  const handleOk = () => {
    form.validateFields()
      .then(values => {
        message.success('Paramètres sauvegardés avec succès');
        setModalVisible(false);
        // Ici, appeler API pour sauvegarder les paramètres
      })
      .catch(() => {
        message.error('Veuillez corriger les erreurs dans le formulaire');
      });
  };

  return (
    <>
      <Title level={2}><SettingOutlined /> Paramètres</Title>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card
          title={<><NotificationOutlined /> Notifications</>}
          extra={<Button type="link" onClick={() => openModal('notifications')}>Modifier</Button>}
        >
          Configuration des notifications en temps réel, alertes et emails.
        </Card>

        <Card
          title={<><LockOutlined /> Sécurité</>}
          extra={<Button type="link" onClick={() => openModal('security')}>Modifier</Button>}
        >
          Gestion des mots de passe, authentification à deux facteurs et sessions.
        </Card>

        <Card
          title={<><SettingOutlined /> Préférences générales</>}
          extra={<Button type="link" onClick={() => openModal('preferences')}>Modifier</Button>}
        >
          Personnalisation de l’interface, langue, thème et autres paramètres utilisateur.
        </Card>
      </Space>

      <Modal
        title={
          modalContent === 'notifications' ? 'Modifier Notifications' :
          modalContent === 'security' ? 'Modifier Sécurité' :
          'Modifier Préférences'
        }
        visible={modalVisible}
        onOk={handleOk}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          {modalContent === 'notifications' && (
            <>
              <Form.Item name="emailNotifications" label="Notifications par email" initialValue="activées">
                <Input placeholder="Activées / Désactivées" />
              </Form.Item>
              <Form.Item name="pushNotifications" label="Notifications push" initialValue="activées">
                <Input placeholder="Activées / Désactivées" />
              </Form.Item>
            </>
          )}

          {modalContent === 'security' && (
            <>
              <Form.Item name="password" label="Nouveau mot de passe" rules={[{ required: true, min: 6 }]}>
                <Input.Password placeholder="Saisir un nouveau mot de passe" />
              </Form.Item>
              <Form.Item name="twoFactor" label="Authentification à deux facteurs" initialValue="activée">
                <Input placeholder="Activée / Désactivée" />
              </Form.Item>
            </>
          )}

          {modalContent === 'preferences' && (
            <>
              <Form.Item name="language" label="Langue" initialValue="Français">
                <Input placeholder="Français, Anglais, etc." />
              </Form.Item>
              <Form.Item name="theme" label="Thème" initialValue="Clair">
                <Input placeholder="Clair / Sombre" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </>
  );
};

export default SettingsPage;

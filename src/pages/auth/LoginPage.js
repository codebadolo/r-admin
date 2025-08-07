import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Input, Space, Typography } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const { Title, Text } = Typography;

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    try {
      await login(values.email, values.password);
      navigate('/');
    } catch (err) {
      setError('Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f0f2f5',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      gap: '40px'
    }}>
      {/* Left Side - Login Form */}
      <Card
        style={{
          flex: '1 1 400px',
          maxWidth: 450,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          borderRadius: 12,
          backgroundColor: 'white',
          padding: '40px 32px'
        }}
        bordered={false}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={2} style={{ margin: 0 }}>Connexion</Title>
            <Text type="secondary">Accédez à votre espace administrateur</Text>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Form
            name="login"
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Veuillez saisir votre email' },
                { type: 'email', message: 'Email non valide' }
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Veuillez saisir votre mot de passe' }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Mot de passe"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{ width: '100%' }}
                loading={loading}
              >
                Se connecter
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>

      {/* Right Side - Image or Business info */}
      <div style={{
        flex: '1 1 450px',
        maxWidth: 500,
        height: '600px',
        borderRadius: 12,
        background: 'linear-gradient(135deg, #1d8cf8 0%, #3358f4 100%)',
        color: '#fff',
        padding: '40px 32px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        textAlign: 'center'
      }}>
        <img
          src="/logo192.png"
          alt="Logo ROH Store"
          style={{ width: 120, margin: '0 auto 24px' }}
        />
        <Title level={3} style={{ color: 'white' }}>
          Bienvenue chez ROH Store
        </Title>
        <Text style={{ fontSize: 16, lineHeight: 1.6 }}>
          Gérez facilement votre boutique électronique avec une interface simple et sécurisée.
          Accédez à toutes vos données produit, commandes et utilisateurs en un seul endroit.
        </Text>

        {/* Exemple de message ou slogan */}
        <div style={{ marginTop: 40, fontStyle: 'italic', fontSize: 14 }}>
          « Votre succès est notre priorité »
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

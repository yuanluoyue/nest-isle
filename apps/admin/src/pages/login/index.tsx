import { useState, useEffect, useCallback } from 'react';
import { Form, Input, Button, Card, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login, getCaptcha } from '../../api/auth';
import { useAuthStore, saveRememberPassword, getRememberPassword, clearRememberPassword } from '../../stores/auth';
import { useLocalAccountStore } from '../../stores/local-accounts';

const LoginPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const navigate = useNavigate();
  const { setTokens, setUser, accessToken } = useAuthStore();
  const { addAccount, updateAccount, findByUsername } = useLocalAccountStore();

  useEffect(() => {
    if (accessToken) {
      navigate('/dashboard');
      return;
    }
    refreshCaptcha();
    const remembered = getRememberPassword();
    if (remembered) {
      form.setFieldsValue({ username: remembered.username, password: remembered.password, remember: true });
    }
  }, []);

  const refreshCaptcha = useCallback(async () => {
    try {
      const data = await getCaptcha();
      setCaptchaId(data.captchaId);
      setCaptchaSvg(data.svg);
    } catch {
      message.error('获取验证码失败');
    }
  }, []);

  const handleSubmit = async (values: { username: string; password: string; captchaCode: string; remember: boolean }) => {
    setLoading(true);
    try {
      const result = await login({
        username: values.username,
        password: values.password,
        captchaId,
        captchaCode: values.captchaCode,
      });
      setTokens(result.accessToken, result.refreshToken);
      setUser(result.user);

      // 自动保存到本地账号管理
      const existing = findByUsername(values.username);
      if (existing) {
        updateAccount(existing.id, { password: values.password });
      } else {
        addAccount({ username: values.username, password: values.password });
      }

      if (values.remember) {
        saveRememberPassword(values.username, values.password);
      } else {
        clearRememberPassword();
      }

      message.success('登录成功');
      navigate('/dashboard');
    } catch (err: any) {
      message.error(err.message || '登录失败');
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <Card style={{ width: 400, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ marginBottom: 4 }}>{import.meta.env.VITE_APP_NAME || 'Admin'}</h1>
          <p style={{ color: '#999' }}>通用后台管理系统</p>
        </div>
        <Form form={form} onFinish={handleSubmit} size="large">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item name="captchaCode" rules={[{ required: true, message: '请输入验证码' }]}>
            <Input
              prefix={<SafetyOutlined />}
              placeholder="验证码"
              suffix={
                <div
                  onClick={refreshCaptcha}
                  style={{ height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="点击刷新"
                  dangerouslySetInnerHTML={{ __html: captchaSvg }}
                />
              }
            />
          </Form.Item>
          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>记住密码</Checkbox>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;

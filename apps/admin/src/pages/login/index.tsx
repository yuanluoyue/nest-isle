import { useState, useEffect, useCallback } from 'react';
import { Form, Input, Button, Card, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';
import { setToken, setRefreshToken, saveRememberPassword, getRememberPassword, clearRememberPassword, isAuthenticated } from '../../stores/auth';
import { generateCaptcha } from '../../utils/captcha';

const LoginPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [captchaUrl, setCaptchaUrl] = useState('');
  const [captchaText, setCaptchaText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard');
      return;
    }
    refreshCaptcha();
    const remembered = getRememberPassword();
    if (remembered) {
      form.setFieldsValue({ username: remembered.username, password: remembered.password, remember: true });
    }
  }, []);

  const refreshCaptcha = useCallback(() => {
    const { canvas, text } = generateCaptcha();
    setCaptchaUrl(canvas.toDataURL());
    setCaptchaText(text);
  }, []);

  const handleSubmit = async (values: { username: string; password: string; captcha: string; remember: boolean }) => {
    if (values.captcha.toLowerCase() !== captchaText.toLowerCase()) {
      message.error('验证码错误');
      refreshCaptcha();
      return;
    }

    setLoading(true);
    try {
      const result = await login({ username: values.username, password: values.password });
      setToken(result.accessToken);
      setRefreshToken(result.refreshToken);

      if (values.remember) {
        saveRememberPassword(values.username, values.password);
      } else {
        clearRememberPassword();
      }

      message.success('登录成功');
      navigate('/dashboard');
    } catch (err: any) {
      message.error(err.response?.data?.message || '登录失败');
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <Card style={{ width: 400, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ marginBottom: 4 }}>Nest Isle</h1>
          <p style={{ color: '#999' }}>通用后台管理系统</p>
        </div>
        <Form form={form} onFinish={handleSubmit} size="large">
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>
          <Form.Item name="captcha" rules={[{ required: true, message: '请输入验证码' }]}>
            <Input
              prefix={<SafetyOutlined />}
              placeholder="验证码"
              suffix={
                <img
                  src={captchaUrl}
                  alt="验证码"
                  onClick={refreshCaptcha}
                  style={{ height: 32, cursor: 'pointer', borderRadius: 4 }}
                  title="点击刷新"
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

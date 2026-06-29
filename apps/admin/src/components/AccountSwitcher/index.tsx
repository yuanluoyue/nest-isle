import { useState } from 'react';
import { Modal, List, Button, Input, Form, Space, Popconfirm, message, Tag, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SwapOutlined } from '@ant-design/icons';
import { useLocalAccountStore, type LocalAccount } from '../../stores/local-accounts';
import { useAuthStore } from '../../stores/auth';
import { useMenuStore } from '../../stores/menu';
import { login as loginApi, getCaptcha } from '../../api/auth';

const { Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AccountSwitcher({ open, onClose }: Props) {
  const { accounts, addAccount, updateAccount, removeAccount } = useLocalAccountStore();
  const { setTokens, setUser, user: currentUser } = useAuthStore();
  const { clearMenus } = useMenuStore();
  const [switching, setSwitching] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  // 验证码弹窗
  const [captchaOpen, setCaptchaOpen] = useState(false);
  const [captchaSvg, setCaptchaSvg] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [pendingAccount, setPendingAccount] = useState<LocalAccount | null>(null);
  const [captchaForm] = Form.useForm();

  const refreshCaptcha = async () => {
    try {
      const data = await getCaptcha();
      setCaptchaId(data.captchaId);
      setCaptchaSvg(data.svg);
    } catch {
      message.error('获取验证码失败');
    }
  };

  const handleSwitchClick = async (account: LocalAccount) => {
    setPendingAccount(account);
    await refreshCaptcha();
    captchaForm.resetFields();
    setCaptchaOpen(true);
  };

  const handleCaptchaSubmit = async () => {
    const values = await captchaForm.validateFields();
    if (!pendingAccount) return;
    setSwitching(pendingAccount.id);
    try {
      const result = await loginApi({
        username: pendingAccount.username,
        password: pendingAccount.password,
        captchaId,
        captchaCode: values.captchaCode,
      });
      setTokens(result.accessToken, result.refreshToken);
      setUser(result.user);
      clearMenus();
      message.success(`已切换到 ${pendingAccount.remark || pendingAccount.username}`);
      setCaptchaOpen(false);
      onClose();
      window.location.reload();
    } catch (err: any) {
      message.error(err.message || '切换账号失败，请检查账号密码或验证码');
      await refreshCaptcha();
      captchaForm.resetFields();
    } finally {
      setSwitching(null);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setEditOpen(true);
  };

  const handleEdit = (account: LocalAccount) => {
    setEditingId(account.id);
    form.setFieldsValue({
      username: account.username,
      password: account.password,
      remark: account.remark,
    });
    setEditOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (editingId) {
      updateAccount(editingId, values);
      message.success('更新成功');
    } else {
      addAccount(values);
      message.success('添加成功');
    }
    setEditOpen(false);
  };

  const isCurrent = (account: LocalAccount) =>
    currentUser?.username === account.username;

  return (
    <>
      <Modal
        title="切换账号"
        open={open}
        onCancel={onClose}
        footer={null}
        width={520}
      >
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary">本地保存的账号列表，点击账号即可切换</Text>
          <Button type="primary" icon={<PlusOutlined />} size="small" onClick={handleAdd}>
            添加账号
          </Button>
        </div>
        <List
          dataSource={accounts}
          locale={{ emptyText: '暂无保存的账号，点击右上角添加' }}
          renderItem={(account) => (
            <List.Item
              actions={[
                <Button
                  key="switch"
                  type="link"
                  icon={<SwapOutlined />}
                  loading={switching === account.id}
                  disabled={isCurrent(account)}
                  onClick={() => handleSwitchClick(account)}
                >
                  切换
                </Button>,
                <Button
                  key="edit"
                  type="link"
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => handleEdit(account)}
                />,
                <Popconfirm
                  key="delete"
                  title="确定删除该账号？"
                  onConfirm={() => {
                    removeAccount(account.id);
                    message.success('已删除');
                  }}
                >
                  <Button type="link" danger icon={<DeleteOutlined />} size="small" />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <span>{account.username}</span>
                    {isCurrent(account) && <Tag color="green">当前</Tag>}
                    {account.remark && <Tag>{account.remark}</Tag>}
                  </Space>
                }
                description={`密码：${'•'.repeat(account.password.length)}（${account.password.length} 位）`}
              />
            </List.Item>
          )}
        />
      </Modal>

      <Modal
        title={editingId ? '编辑账号' : '添加账号'}
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={handleSubmit}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="登录用户名" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password placeholder="登录密码" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input placeholder="如：管理员、测试账号" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="输入验证码"
        open={captchaOpen}
        onCancel={() => setCaptchaOpen(false)}
        onOk={handleCaptchaSubmit}
        confirmLoading={switching !== null}
        destroyOnClose
      >
        <Form form={captchaForm} layout="vertical">
          <Form.Item label="账号">
            <Text>{pendingAccount?.remark || pendingAccount?.username}</Text>
          </Form.Item>
          <Form.Item name="captchaCode" label="验证码" rules={[{ required: true, message: '请输入验证码' }]}>
            <Input
              placeholder="请输入图中验证码"
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
        </Form>
      </Modal>
    </>
  );
}

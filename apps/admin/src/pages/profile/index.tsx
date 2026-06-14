import { useEffect, useState } from 'react';
import { Card, Descriptions, Avatar, Tag, Button, Form, Input, Select, Upload, message, Spin, theme } from 'antd';
import { UserOutlined, EditOutlined, CameraOutlined } from '@ant-design/icons';
import { getProfile, updateProfile } from '../../api/auth';
import { uploadAvatar } from '../../api/file';
import { useAuthStore } from '../../stores/auth';
import type { UserProfile, UpdateProfileParams } from '../../types/api';

const genderOptions = [
  { label: '未知', value: 0 },
  { label: '男', value: 1 },
  { label: '女', value: 2 },
];

const statusMap: Record<number, { text: string; color: string }> = {
  0: { text: '正常', color: 'green' },
  1: { text: '禁用', color: 'red' },
};

const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [form] = Form.useForm();
  const { token: themeToken } = theme.useToken();
  const { setUser } = useAuthStore();

  // 同步更新 auth store 中的用户信息
  const syncToAuthStore = (updated: UserProfile) => {
    setUser({
      id: updated.id,
      username: updated.username,
      nickname: updated.nickname,
      avatar: updated.avatar,
    });
  };

  const fetchProfile = () => {
    setLoading(true);
    getProfile()
      .then((data) => {
        setProfile(data);
        setAvatarUrl(data.avatar);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarUpload = async (file: File) => {
    try {
      const result = await uploadAvatar(file);
      setAvatarUrl(result.url);
      // 同步更新头像到个人信息
      const updated = await updateProfile({ avatar: result.url });
      setProfile(updated);
      syncToAuthStore(updated);
      message.success('头像更新成功');
    } catch (err: any) {
      message.error(err.message || '头像上传失败');
    }
    return false;
  };

  const handleEdit = () => {
    form.setFieldsValue({
      nickname: profile?.nickname || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      gender: profile?.gender,
    });
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    form.resetFields();
  };

  const handleSave = async (values: UpdateProfileParams) => {
    setSaving(true);
    try {
      const updated = await updateProfile(values);
      setProfile(updated);
      syncToAuthStore(updated);
      setEditing(false);
      message.success('修改成功');
    } catch (err: any) {
      message.error(err.message || '修改失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Card style={{ maxWidth: 800 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <Upload
            showUploadList={false}
            accept="image/*"
            beforeUpload={(file) => {
              handleAvatarUpload(file);
              return false;
            }}
          >
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Avatar size={64} src={avatarUrl} icon={!avatarUrl ? <UserOutlined /> : undefined} />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: themeToken.colorPrimary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 10,
                }}
              >
                <CameraOutlined />
              </div>
            </div>
          </Upload>
          <div>
            <h2 style={{ margin: 0 }}>{profile?.nickname || profile?.username}</h2>
            <span style={{ color: '#999' }}>@{profile?.username}</span>
          </div>
          {!editing && (
            <Button type="primary" icon={<EditOutlined />} style={{ marginLeft: 'auto' }} onClick={handleEdit}>
              编辑
            </Button>
          )}
        </div>

        {editing ? (
          <Form form={form} onFinish={handleSave} layout="vertical" style={{ maxWidth: 500 }}>
            <Form.Item name="nickname" label="昵称">
              <Input placeholder="请输入昵称" />
            </Form.Item>
            <Form.Item name="email" label="邮箱">
              <Input placeholder="请输入邮箱" />
            </Form.Item>
            <Form.Item name="phone" label="手机号">
              <Input placeholder="请输入手机号" />
            </Form.Item>
            <Form.Item name="gender" label="性别">
              <Select options={genderOptions} allowClear placeholder="请选择性别" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={saving} style={{ marginRight: 8 }}>
                保存
              </Button>
              <Button onClick={handleCancel}>取消</Button>
            </Form.Item>
          </Form>
        ) : (
          <Descriptions column={2} bordered size="middle">
            <Descriptions.Item label="用户名">{profile?.username}</Descriptions.Item>
            <Descriptions.Item label="昵称">{profile?.nickname || '-'}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{profile?.email || '-'}</Descriptions.Item>
            <Descriptions.Item label="手机号">{profile?.phone || '-'}</Descriptions.Item>
            <Descriptions.Item label="性别">
              {profile?.gender != null ? genderOptions.find((g) => g.value === profile.gender)?.label || '-' : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              {profile?.status != null ? (
                <Tag color={statusMap[profile.status]?.color}>{statusMap[profile.status]?.text}</Tag>
              ) : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Card>
    </div>
  );
};

export default ProfilePage;

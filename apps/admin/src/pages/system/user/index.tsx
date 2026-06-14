import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  Form,
  message,
  Popconfirm,
  Row,
  Col,
  Transfer,
  Tooltip,
} from 'antd';
import { PlusOutlined, ReloadOutlined, KeyOutlined, TeamOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UserItem, CreateUserParams, QueryUserParams, RoleItem } from '../../../types/api';
import { getUserList, createUser, updateUser, deleteUser, resetPassword, assignUserRoles, getUserDetail } from '../../../api/user';
import { getRoleList } from '../../../api/role';

const genderMap: Record<number, string> = { 0: '未知', 1: '男', 2: '女' };
const statusMap: Record<number, { color: string; text: string }> = {
  0: { color: 'green', text: '正常' },
  1: { color: 'red', text: '禁用' },
};

const UserPage = () => {
  const [data, setData] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<QueryUserParams>({ page: 1, pageSize: 10 });

  // 弹窗
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<UserItem | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();

  // 重置密码弹窗
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetUserId, setResetUserId] = useState<string>('');
  const [resetForm] = Form.useForm();

  // 分配角色弹窗
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleUserId, setRoleUserId] = useState<string>('');
  const [roleLoading, setRoleLoading] = useState(false);
  const [allRoles, setAllRoles] = useState<RoleItem[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUserList(query);
      setData(res.list);
      setTotal(res.total);
    } catch {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 搜索
  const handleSearch = () => {
    setQuery((prev) => ({ ...prev, page: 1 }));
  };

  const handleReset = () => {
    setQuery({ page: 1, pageSize: 10 });
  };

  // 新增/编辑
  const handleAdd = () => {
    setEditRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (record: UserItem) => {
    setEditRecord(record);
    setModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setModalLoading(true);
      if (editRecord) {
        await updateUser(editRecord.id, values);
        message.success('更新成功');
      } else {
        await createUser(values as CreateUserParams);
        message.success('创建成功');
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      if (err.message) message.error(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  // 删除
  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id);
      message.success('删除成功');
      fetchData();
    } catch {
      message.error('删除失败');
    }
  };

  // 重置密码
  const handleResetPassword = (record: UserItem) => {
    setResetUserId(record.id);
    resetForm.resetFields();
    setResetModalOpen(true);
  };

  const handleResetPasswordOk = async () => {
    try {
      const values = await resetForm.validateFields();
      await resetPassword(resetUserId, values.newPassword);
      message.success('重置密码成功');
      setResetModalOpen(false);
    } catch (err: any) {
      if (err.message) message.error(err.message);
    }
  };

  // 分配角色
  const handleAssignRole = async (record: UserItem) => {
    setRoleUserId(record.id);
    setRoleLoading(true);
    try {
      const [rolesRes, userDetail] = await Promise.all([
        getRoleList({ page: 1, pageSize: 999 }),
        getUserDetail(record.id),
      ]);
      setAllRoles(rolesRes.list);
      setSelectedRoleIds(userDetail.roles?.map((r) => r.id) || []);
      setRoleModalOpen(true);
    } catch {
      message.error('获取角色数据失败');
    } finally {
      setRoleLoading(false);
    }
  };

  const handleRoleOk = async () => {
    setRoleLoading(true);
    try {
      await assignUserRoles(roleUserId, selectedRoleIds);
      message.success('分配角色成功');
      setRoleModalOpen(false);
      fetchData();
    } catch {
      message.error('分配角色失败');
    } finally {
      setRoleLoading(false);
    }
  };

  const columns: ColumnsType<UserItem> = [
    { title: '用户名', dataIndex: 'username', width: 120 },
    { title: '昵称', dataIndex: 'nickname', width: 120 },
    { title: '性别', dataIndex: 'gender', width: 80, render: (v) => genderMap[v ?? 0] ?? '未知' },
    { title: '手机号', dataIndex: 'phone', width: 140 },
    { title: '邮箱', dataIndex: 'email', width: 180, ellipsis: true },
    {
      title: '角色',
      dataIndex: 'roles',
      width: 160,
      render: (roles: UserItem['roles']) =>
        roles?.map((r) => <Tag key={r.id} color="blue">{r.name}</Tag>),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (v) => {
        const s = statusMap[v ?? 0];
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (v) => v ? new Date(v).toLocaleString() : '-',
    },
    {
      title: '操作',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="分配角色">
            <Button type="link" size="small" icon={<TeamOutlined />} onClick={() => handleAssignRole(record)} />
          </Tooltip>
          <Tooltip title="重置密码">
            <Button type="link" size="small" icon={<KeyOutlined />} onClick={() => handleResetPassword(record)} />
          </Tooltip>
          {record.username !== 'admin' && (
            <Popconfirm title="确定删除该用户吗？" onConfirm={() => handleDelete(record.id)}>
              <Tooltip title="删除">
                <Button type="link" size="small" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* 搜索区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col>
            <Input
              placeholder="用户名"
              value={query.username}
              onChange={(e) => setQuery((prev) => ({ ...prev, username: e.target.value || undefined }))}
              onPressEnter={handleSearch}
              allowClear
              style={{ width: 160 }}
            />
          </Col>
          <Col>
            <Input
              placeholder="昵称"
              value={query.nickname}
              onChange={(e) => setQuery((prev) => ({ ...prev, nickname: e.target.value || undefined }))}
              onPressEnter={handleSearch}
              allowClear
              style={{ width: 160 }}
            />
          </Col>
          <Col>
            <Input
              placeholder="手机号"
              value={query.phone}
              onChange={(e) => setQuery((prev) => ({ ...prev, phone: e.target.value || undefined }))}
              onPressEnter={handleSearch}
              allowClear
              style={{ width: 160 }}
            />
          </Col>
          <Col>
            <Select
              placeholder="状态"
              value={query.status}
              onChange={(v) => setQuery((prev) => ({ ...prev, status: v }))}
              allowClear
              style={{ width: 120 }}
              options={[
                { label: '正常', value: 0 },
                { label: '禁用', value: 1 },
              ]}
            />
          </Col>
          <Col>
            <Space>
              <Button type="primary" onClick={handleSearch}>搜索</Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 表格区域 */}
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增用户</Button>
          </Space>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
        </div>
        <Table<UserItem>
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 1300 }}
          pagination={{
            current: query.page,
            pageSize: query.pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (page, pageSize) => setQuery((prev) => ({ ...prev, page, pageSize })),
          }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editRecord ? '编辑用户' : '新增用户'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={modalLoading}
        width={600}
        destroyOnClose
        afterOpenChange={(open) => {
          if (open && editRecord) {
            form.setFieldsValue(editRecord);
          }
        }}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
                <Input disabled={!!editRecord} placeholder="请输入用户名" />
              </Form.Item>
            </Col>
            {!editRecord && (
              <Col span={12}>
                <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6位' }]}>
                  <Input.Password placeholder="请输入密码" />
                </Form.Item>
              </Col>
            )}
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="nickname" label="昵称">
                <Input placeholder="请输入昵称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gender" label="性别">
                <Select placeholder="请选择性别" options={[
                  { label: '未知', value: 0 },
                  { label: '男', value: 1 },
                  { label: '女', value: 2 },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="手机号">
                <Input placeholder="请输入手机号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="邮箱">
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="状态" initialValue={0}>
                <Select options={[
                  { label: '正常', value: 0 },
                  { label: '禁用', value: 1 },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 重置密码弹窗 */}
      <Modal
        title="重置密码"
        open={resetModalOpen}
        onOk={handleResetPasswordOk}
        onCancel={() => setResetModalOpen(false)}
        destroyOnClose
      >
        <Form form={resetForm} layout="vertical" preserve={false}>
          <Form.Item name="newPassword" label="新密码" rules={[{ required: true, message: '请输入新密码' }, { min: 6, message: '密码至少6位' }]}>
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 分配角色弹窗 */}
      <Modal
        title="分配角色"
        open={roleModalOpen}
        onOk={handleRoleOk}
        onCancel={() => setRoleModalOpen(false)}
        confirmLoading={roleLoading}
        width={600}
        destroyOnClose
      >
        <Transfer
          dataSource={allRoles.map((r) => ({ key: r.id, title: r.name, description: r.code }))}
          targetKeys={selectedRoleIds}
          onChange={(targetKeys) => setSelectedRoleIds(targetKeys as string[])}
          render={(item) => item.title!}
          listStyle={{ width: 250, height: 400 }}
          showSearch
          filterOption={(inputValue, item) => (item.title ?? '').toLowerCase().includes(inputValue.toLowerCase())}
        />
      </Modal>
    </div>
  );
};

export default UserPage;

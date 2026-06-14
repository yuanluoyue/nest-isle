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
  Tree,
  InputNumber,
  Tooltip,
} from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, SafetyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { RoleItem, CreateRoleParams, QueryRoleParams, MenuItem } from '../../../types/api';
import { getRoleList, createRole, updateRole, deleteRole, assignRoleMenus, getMenuTree, getRoleDetail } from '../../../api/role';

const statusMap: Record<number, { color: string; text: string }> = {
  0: { color: 'green', text: '正常' },
  1: { color: 'red', text: '禁用' },
};

const RolePage = () => {
  const [data, setData] = useState<RoleItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<QueryRoleParams>({ page: 1, pageSize: 10 });

  // 新增/编辑弹窗
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<RoleItem | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();

  // 分配权限弹窗
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [permRoleId, setPermRoleId] = useState<string>('');
  const [permLoading, setPermLoading] = useState(false);
  const [menuTree, setMenuTree] = useState<MenuItem[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getRoleList(query);
      setData(res.list);
      setTotal(res.total);
    } catch {
      message.error('获取角色列表失败');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const handleEdit = (record: RoleItem) => {
    setEditRecord(record);
    setModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setModalLoading(true);
      if (editRecord) {
        await updateRole(editRecord.id, values);
        message.success('更新成功');
      } else {
        await createRole(values as CreateRoleParams);
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
      await deleteRole(id);
      message.success('删除成功');
      fetchData();
    } catch {
      message.error('删除失败');
    }
  };

  // 分配权限
  const handleAssignPerm = async (record: RoleItem) => {
    setPermRoleId(record.id);
    setPermLoading(true);
    try {
      const [tree, roleDetail] = await Promise.all([getMenuTree(), getRoleDetail(record.id)]);
      setMenuTree(tree);
      setCheckedKeys(roleDetail.menuIds || []);
      setPermModalOpen(true);
    } catch {
      message.error('获取权限数据失败');
    } finally {
      setPermLoading(false);
    }
  };

  const handlePermOk = async () => {
    setPermLoading(true);
    try {
      await assignRoleMenus(permRoleId, checkedKeys);
      message.success('分配权限成功');
      setPermModalOpen(false);
    } catch {
      message.error('分配权限失败');
    } finally {
      setPermLoading(false);
    }
  };

  // 构建菜单树
  const buildMenuTree = (menus: MenuItem[]) => {
    const typeLabel: Record<number, string> = { 0: '目录', 1: '菜单', 2: '按钮' };
    const map = new Map<string, any>();
    const roots: any[] = [];

    menus.forEach((m) => {
      map.set(m.id, {
        key: m.id,
        title: (
          <span>
            {m.name}
            {m.type !== null && <Tag color={m.type === 2 ? 'green' : m.type === 1 ? 'blue' : undefined} style={{ marginLeft: 4, fontSize: 11 }}>{typeLabel[m.type]}</Tag>}
            {m.permission && <span style={{ color: '#999', fontSize: 12, marginLeft: 4 }}>{m.permission}</span>}
          </span>
        ),
        children: [],
      });
    });

    menus.forEach((m) => {
      const node = map.get(m.id)!;
      if (m.parentId && map.has(m.parentId)) {
        map.get(m.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    // 清理空 children
    const clean = (nodes: any[]) => {
      nodes.forEach((n) => {
        if (n.children.length === 0) {
          delete n.children;
        } else {
          clean(n.children);
        }
      });
    };
    clean(roots);

    return roots;
  };

  const columns: ColumnsType<RoleItem> = [
    { title: '角色名称', dataIndex: 'name', width: 150 },
    { title: '角色编码', dataIndex: 'code', width: 150 },
    { title: '排序', dataIndex: 'sort', width: 80 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (v) => {
        const s = statusMap[v ?? 0];
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    { title: '备注', dataIndex: 'remark', width: 200, ellipsis: true },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (v) => v ? new Date(v).toLocaleString() : '-',
    },
    {
      title: '操作',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="分配权限">
            <Button type="link" size="small" icon={<SafetyOutlined />} onClick={() => handleAssignPerm(record)} />
          </Tooltip>
          {record.code !== 'admin' && (
            <Popconfirm title="确定删除该角色吗？" onConfirm={() => handleDelete(record.id)}>
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
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col>
            <Input
              placeholder="角色名称"
              value={query.name}
              onChange={(e) => setQuery((prev) => ({ ...prev, name: e.target.value || undefined }))}
              onPressEnter={handleSearch}
              allowClear
              style={{ width: 160 }}
            />
          </Col>
          <Col>
            <Input
              placeholder="角色编码"
              value={query.code}
              onChange={(e) => setQuery((prev) => ({ ...prev, code: e.target.value || undefined }))}
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

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增角色</Button>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
        </div>
        <Table<RoleItem>
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 1000 }}
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
        title={editRecord ? '编辑角色' : '新增角色'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={modalLoading}
        width={500}
        destroyOnClose
        afterOpenChange={(open) => {
          if (open && editRecord) {
            form.setFieldsValue(editRecord);
          }
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="角色名称" rules={[{ required: true, message: '请输入角色名称' }]}>
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item name="code" label="角色编码" rules={[{ required: true, message: '请输入角色编码' }]}>
            <Input disabled={!!editRecord} placeholder="请输入角色编码" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="sort" label="排序" initialValue={0}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
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

      {/* 分配权限弹窗 */}
      <Modal
        title="分配权限"
        open={permModalOpen}
        onOk={handlePermOk}
        onCancel={() => setPermModalOpen(false)}
        confirmLoading={permLoading}
        width={500}
        destroyOnClose
      >
        <Tree
          checkable
          defaultExpandAll
          checkedKeys={checkedKeys}
          onCheck={(keys) => setCheckedKeys(keys as string[])}
          treeData={buildMenuTree(menuTree)}
        />
      </Modal>
    </div>
  );
};

export default RolePage;

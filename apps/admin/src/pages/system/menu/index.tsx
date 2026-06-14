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
  InputNumber,
  Tooltip,
  TreeSelect,
} from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, ApartmentOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuItem, CreateMenuParams, QueryMenuParams } from '../../../types/api';
import { getMenuList, createMenu, updateMenu, deleteMenu } from '../../../api/menu';

const typeMap: Record<number, { color: string; text: string }> = {
  0: { color: '', text: '目录' },
  1: { color: 'blue', text: '菜单' },
  2: { color: 'green', text: '按钮' },
};

const statusMap: Record<number, { color: string; text: string }> = {
  0: { color: 'green', text: '正常' },
  1: { color: 'red', text: '禁用' },
};

const MenuPage = () => {
  const [data, setData] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<QueryMenuParams>({});

  // 弹窗
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<MenuItem | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();

  // 菜单树（用于选择父级）
  const [menuTree, setMenuTree] = useState<MenuItem[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMenuList(query);
      setData(res);
    } catch {
      message.error('获取菜单列表失败');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchMenuTree = async () => {
    try {
      const res = await getMenuList();
      setMenuTree(res);
    } catch {
      // ignore
    }
  };

  const handleSearch = () => {
    fetchData();
  };

  const handleReset = () => {
    setQuery({});
  };

  const handleAdd = (parentId?: string) => {
    setEditRecord(null);
    form.resetFields();
    if (parentId) {
      form.setFieldsValue({ parentId });
    }
    fetchMenuTree();
    setModalOpen(true);
  };

  const handleEdit = (record: MenuItem) => {
    setEditRecord(record);
    fetchMenuTree();
    setModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setModalLoading(true);
      if (editRecord) {
        await updateMenu(editRecord.id, values);
        message.success('更新成功');
      } else {
        await createMenu(values as CreateMenuParams);
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

  const handleDelete = async (id: string) => {
    try {
      await deleteMenu(id);
      message.success('删除成功');
      fetchData();
    } catch {
      message.error('删除失败');
    }
  };

  // 构建父级选择树
  const buildSelectTree = (menus: MenuItem[]): any[] => {
    return menus
      .filter((m) => m.type !== 2) // 按钮不能作为父级
      .map((m) => ({
        value: m.id,
        title: m.name || '',
        children: m.children ? buildSelectTree(m.children) : undefined,
      }));
  };

  const columns: ColumnsType<MenuItem> = [
    {
      title: '菜单名称',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 80,
      render: (v) => {
        const t = typeMap[v ?? 0];
        return <Tag color={t.color}>{t.text}</Tag>;
      },
    },
    {
      title: '图标',
      dataIndex: 'icon',
      width: 100,
      render: (v) => v || '-',
    },
    {
      title: '路由路径',
      dataIndex: 'path',
      width: 180,
      render: (v) => v || '-',
    },
    {
      title: '组件路径',
      dataIndex: 'component',
      width: 160,
      render: (v) => v || '-',
    },
    {
      title: '权限标识',
      dataIndex: 'permission',
      width: 180,
      render: (v) => v ? <Tag color="orange">{v}</Tag> : '-',
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 70,
    },
    {
      title: '可见',
      dataIndex: 'visible',
      width: 70,
      render: (v) => v === 0 ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 70,
      render: (v) => {
        const s = statusMap[v ?? 0];
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: '操作',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {record.type !== 2 && (
            <Tooltip title="新增子菜单">
              <Button type="link" size="small" icon={<ApartmentOutlined />} onClick={() => handleAdd(record.id)} />
            </Tooltip>
          )}
          <Tooltip title="编辑">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm title="确定删除该菜单吗？" onConfirm={() => handleDelete(record.id)}>
            <Tooltip title="删除">
              <Button type="link" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
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
              placeholder="菜单名称"
              value={query.name}
              onChange={(e) => setQuery((prev) => ({ ...prev, name: e.target.value || undefined }))}
              onPressEnter={handleSearch}
              allowClear
              style={{ width: 160 }}
            />
          </Col>
          <Col>
            <Select
              placeholder="类型"
              value={query.type}
              onChange={(v) => setQuery((prev) => ({ ...prev, type: v }))}
              allowClear
              style={{ width: 120 }}
              options={[
                { label: '目录', value: 0 },
                { label: '菜单', value: 1 },
                { label: '按钮', value: 2 },
              ]}
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
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd()}>新增菜单</Button>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
        </div>
        <Table<MenuItem>
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 1300 }}
          pagination={false}
          defaultExpandAllRows
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editRecord ? '编辑菜单' : '新增菜单'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={modalLoading}
        width={650}
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
              <Form.Item name="parentId" label="上级菜单">
                <TreeSelect
                  placeholder="顶级菜单"
                  allowClear
                  treeData={buildSelectTree(menuTree)}
                  treeDefaultExpandAll
                  showSearch
                  treeNodeFilterProp="title"
                  treeLine
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择类型' }]} initialValue={1}>
                <Select options={[
                  { label: '目录', value: 0 },
                  { label: '菜单', value: 1 },
                  { label: '按钮', value: 2 },
                ]} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="菜单名称" rules={[{ required: true, message: '请输入菜单名称' }]}>
                <Input placeholder="请输入菜单名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="icon" label="图标">
                <Input placeholder="请输入图标名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="path" label="路由路径">
                <Input placeholder="如 /system/user" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="component" label="组件路径">
                <Input placeholder="如 system/user" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="permission" label="权限标识">
                <Input placeholder="如 system:user:list" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sort" label="排序" initialValue={0}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="visible" label="是否可见" initialValue={0}>
                <Select options={[
                  { label: '可见', value: 0 },
                  { label: '隐藏', value: 1 },
                ]} />
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
        </Form>
      </Modal>
    </div>
  );
};

export default MenuPage;

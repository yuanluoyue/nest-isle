import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Form,
  Modal,
  Tag,
  message,
  Popconfirm,
  Tooltip,
  App,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type {
  ConfigItem,
  CreateConfigParams,
  UpdateConfigParams,
  QueryConfigParams,
} from '../../../types/api';
import {
  getConfigList,
  createConfig,
  updateConfig,
  deleteConfig,
  refreshConfigCache,
} from '../../../api/config';

const typeMap: Record<number, { color: string; text: string }> = {
  0: { color: 'blue', text: '系统内置' },
  1: { color: 'green', text: '自定义' },
};

const statusMap: Record<number, { color: string; text: string }> = {
  0: { color: 'green', text: '启用' },
  1: { color: 'red', text: '禁用' },
};

export default function ConfigPage() {
  App.useApp();
  const [data, setData] = useState<ConfigItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<QueryConfigParams>({ page: 1, pageSize: 10 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ConfigItem | null>(null);
  const [form] = Form.useForm<CreateConfigParams>();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getConfigList(query);
      setData(res.list);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ type: 1, status: 0 });
    setModalOpen(true);
  };

  const handleEdit = (record: ConfigItem) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name ?? '',
      key: record.key ?? '',
      value: record.value ?? '',
      type: record.type ?? 1,
      status: record.status ?? 0,
      remark: record.remark ?? '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteConfig(id);
    message.success('删除成功');
    fetchData();
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (editing) {
      await updateConfig(editing.id, values as UpdateConfigParams);
      message.success('更新成功');
    } else {
      await createConfig(values);
      message.success('创建成功');
    }
    setModalOpen(false);
    fetchData();
  };

  const handleRefreshCache = async () => {
    const res = await refreshConfigCache();
    message.success(`缓存刷新成功，共 ${res.count} 项`);
  };

  const columns: ColumnsType<ConfigItem> = [
    { title: '配置名称', dataIndex: 'name', width: 160, ellipsis: true },
    {
      title: '配置键',
      dataIndex: 'key',
      width: 200,
      ellipsis: true,
      render: (v) => <code style={{ fontSize: 12 }}>{v}</code>,
    },
    {
      title: '配置值',
      dataIndex: 'value',
      width: 200,
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      render: (v) => {
        const t = typeMap[v ?? 1];
        return <Tag color={t.color}>{t.text}</Tag>;
      },
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
    { title: '备注', dataIndex: 'remark', width: 160, ellipsis: true },
    {
      title: '操作',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
            <Tooltip title="删除">
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          <Input
            placeholder="配置名称"
            allowClear
            prefix={<SearchOutlined />}
            style={{ width: 160 }}
            onChange={(e) =>
              setQuery((q) => ({ ...q, name: e.target.value || undefined, page: 1 }))
            }
          />
          <Input
            placeholder="配置键"
            allowClear
            style={{ width: 160 }}
            onChange={(e) =>
              setQuery((q) => ({ ...q, key: e.target.value || undefined, page: 1 }))
            }
          />
          <Select
            placeholder="类型"
            allowClear
            style={{ width: 120 }}
            onChange={(v) => setQuery((q) => ({ ...q, type: v, page: 1 }))}
            options={[
              { label: '系统内置', value: 0 },
              { label: '自定义', value: 1 },
            ]}
          />
          <Select
            placeholder="状态"
            allowClear
            style={{ width: 100 }}
            onChange={(v) => setQuery((q) => ({ ...q, status: v, page: 1 }))}
            options={[
              { label: '启用', value: 0 },
              { label: '禁用', value: 1 },
            ]}
          />
        </Space>
        <Space>
          <Tooltip title="刷新缓存">
            <Button icon={<ReloadOutlined />} onClick={handleRefreshCache} />
          </Tooltip>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增
          </Button>
        </Space>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        scroll={{ x: 1020 }}
        pagination={{
          current: query.page,
          pageSize: query.pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (page, pageSize) => setQuery((q) => ({ ...q, page, pageSize })),
        }}
      />

      <Modal
        title={editing ? '编辑配置' : '新增配置'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        width={520}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="配置名称" rules={[{ required: true, max: 100 }]}>
            <Input placeholder="如：系统名称" />
          </Form.Item>
          <Form.Item name="key" label="配置键" rules={[{ required: true, max: 100 }]}>
            <Input placeholder="如：sys.site.name" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="value" label="配置值" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="配置值" />
          </Form.Item>
          <Form.Item name="type" label="类型">
            <Select
              options={[
                { label: '系统内置', value: 0 },
                { label: '自定义', value: 1 },
              ]}
            />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select
              options={[
                { label: '启用', value: 0 },
                { label: '禁用', value: 1 },
              ]}
            />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} maxLength={500} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

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
  Badge,
  Switch,
} from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, ApiOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { AiProviderItem, QueryAiProviderParams, CreateAiProviderParams, UpdateAiProviderParams } from '../../../types/api';
import { getProviderList, createProvider, updateProvider, deleteProvider, testProviderConnection } from '../../../api/ai-provider';

const typeColorMap: Record<string, string> = {
  openai: 'green',
  anthropic: 'blue',
  gemini: 'purple',
  deepseek: 'cyan',
};

const typeOptions = [
  { label: 'OpenAI', value: 'openai' },
  { label: 'Anthropic', value: 'anthropic' },
  { label: 'Gemini', value: 'gemini' },
  { label: 'DeepSeek', value: 'deepseek' },
];

const defaultBaseUrls: Record<string, string> = {
  openai: 'https://api.openai.com/v1',
  deepseek: 'https://api.deepseek.com',
  anthropic: 'https://api.anthropic.com/v1',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/openai',
};

const ProviderPage = () => {
  const [data, setData] = useState<AiProviderItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<QueryAiProviderParams>({ page: 1, pageSize: 10 });

  // 弹窗
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<AiProviderItem | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();

  // 测试连接
  const [testingId, setTestingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProviderList(query);
      setData(res.list);
      setTotal(res.total);
    } catch {
      // ignore
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

  const handleAdd = () => {
    setEditRecord(null);
    form.resetFields();
    form.setFieldsValue({ enabled: 0, priority: 0 });
    setModalOpen(true);
  };

  const handleEdit = (record: AiProviderItem) => {
    setEditRecord(record);
    form.setFieldsValue({
      name: record.name ?? '',
      type: record.type ?? '',
      baseUrl: record.baseUrl ?? '',
      apiKey: record.apiKey ?? '',
      enabled: record.enabled ?? 0,
      priority: record.priority ?? 0,
      remark: record.remark ?? '',
    });
    setModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const { enabledSwitch, ...rest } = values;
      const payload = { ...rest, enabled: enabledSwitch ? 0 : 1 };
      setModalLoading(true);
      if (editRecord) {
        await updateProvider(editRecord.id, payload as UpdateAiProviderParams);
        message.success('更新成功');
      } else {
        await createProvider(payload as CreateAiProviderParams);
        message.success('创建成功');
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      if (err?.errorFields) return;
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProvider(id);
      message.success('删除成功');
      fetchData();
    } catch {
      // ignore
    }
  };

  const handleTestConnection = async (record: AiProviderItem) => {
    setTestingId(record.id);
    try {
      const res = await testProviderConnection(record.id);
      if (res.success) {
        message.success('连接成功');
      } else {
        message.error(res.message || '连接失败');
      }
    } catch (err: any) {
      message.error(err.message || '连接失败');
    } finally {
      setTestingId(null);
    }
  };

  const columns: ColumnsType<AiProviderItem> = [
    { title: '名称', dataIndex: 'name', width: 140 },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      render: (v) => <Tag color={typeColorMap[v] || 'default'}>{v}</Tag>,
    },
    { title: 'Base URL', dataIndex: 'baseUrl', ellipsis: true, width: 200 },
    {
      title: '启用',
      dataIndex: 'enabled',
      width: 80,
      render: (v) => (
        <Badge status={v === 0 ? 'success' : 'default'} text={v === 0 ? '启用' : '禁用'} />
      ),
    },
    { title: '优先级', dataIndex: 'priority', width: 80 },
    {
      title: '操作',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size={0}>
          <Tooltip title="编辑">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="测试连接">
            <Button
              type="link"
              size="small"
              icon={<ApiOutlined />}
              loading={testingId === record.id}
              onClick={() => handleTestConnection(record)}
            />
          </Tooltip>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
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
              placeholder="名称"
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
              style={{ width: 140 }}
              options={typeOptions}
            />
          </Col>
          <Col>
            <Select
              placeholder="启用状态"
              value={query.enabled}
              onChange={(v) => setQuery((prev) => ({ ...prev, enabled: v }))}
              allowClear
              style={{ width: 120 }}
              options={[
                { label: '启用', value: 0 },
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
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增</Button>
          </Space>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
        </div>
        <Table<AiProviderItem>
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 800 }}
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

      <Modal
        title={editRecord ? '编辑 Provider' : '新增 Provider'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={modalLoading}
        width={600}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
                <Input placeholder="请输入名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择类型' }]}>
                <Select
                  placeholder="请选择类型"
                  options={typeOptions}
                  onChange={(v) => {
                    const url = defaultBaseUrls[v];
                    if (url) {
                      form.setFieldsValue({ baseUrl: url });
                    }
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="baseUrl" label="Base URL">
            <Input placeholder="请输入 Base URL" />
          </Form.Item>
          <Form.Item name="apiKey" label="API Key">
            <Input.Password placeholder="请输入 API Key" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="enabledSwitch" label="启用" valuePropName="checked" initialValue={true}>
                <Switch checkedChildren="启用" unCheckedChildren="禁用" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="priority" label="优先级" initialValue={0}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} maxLength={500} showCount placeholder="请输入备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProviderPage;

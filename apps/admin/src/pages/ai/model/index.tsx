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
  Alert,
} from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { AiModelItem, AiProviderItem, QueryAiModelParams, CreateAiModelParams, UpdateAiModelParams } from '../../../types/api';
import { getModelList, createModel, updateModel, deleteModel } from '../../../api/ai-model';
import { getProviderList } from '../../../api/ai-provider';

const modelTypeColorMap: Record<string, string> = {
  chat: 'blue',
  embedding: 'orange',
};

const ModelPage = () => {
  const [data, setData] = useState<AiModelItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<QueryAiModelParams>({ page: 1, pageSize: 10 });

  // Provider 列表
  const [providers, setProviders] = useState<AiProviderItem[]>([]);

  // 弹窗
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<AiModelItem | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getModelList(query);
      setData(res.list);
      setTotal(res.total);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [query]);

  const fetchProviders = useCallback(async () => {
    try {
      const res = await getProviderList({ page: 1, pageSize: 999 });
      setProviders(res.list);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleSearch = () => {
    setQuery((prev) => ({ ...prev, page: 1 }));
  };

  const handleReset = () => {
    setQuery({ page: 1, pageSize: 10 });
  };

  const handleAdd = () => {
    setEditRecord(null);
    form.resetFields();
    form.setFieldsValue({ enabled: 0, isDefault: 0 });
    setModalOpen(true);
  };

  const handleEdit = (record: AiModelItem) => {
    setEditRecord(record);
    form.setFieldsValue({
      providerId: record.providerId ?? '',
      name: record.name ?? '',
      displayName: record.displayName ?? '',
      modelType: record.modelType ?? '',
      enabledSwitch: record.enabled === 0,
      isDefaultSwitch: record.isDefault === 1,
      contextLength: record.contextLength,
      inputPrice: record.inputPrice ?? '',
      outputPrice: record.outputPrice ?? '',
      remark: record.remark ?? '',
    });
    setModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const { enabledSwitch, isDefaultSwitch, ...rest } = values;
      const payload = {
        ...rest,
        enabled: enabledSwitch ? 0 : 1,
        isDefault: isDefaultSwitch ? 1 : 0,
      };
      setModalLoading(true);
      if (editRecord) {
        await updateModel(editRecord.id, payload as UpdateAiModelParams);
        message.success('更新成功');
      } else {
        await createModel(payload as CreateAiModelParams);
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
      await deleteModel(id);
      message.success('删除成功');
      fetchData();
    } catch {
      // ignore
    }
  };

  const columns: ColumnsType<AiModelItem> = [
    {
      title: '显示名称',
      dataIndex: 'displayName',
      width: 160,
      render: (v, r) => v || r.name,
    },
    {
      title: 'Provider',
      dataIndex: ['provider', 'name'],
      width: 120,
    },
    {
      title: '模型类型',
      dataIndex: 'modelType',
      width: 100,
      render: (v) => <Tag color={modelTypeColorMap[v] || 'default'}>{v}</Tag>,
    },
    {
      title: '启用',
      dataIndex: 'enabled',
      width: 80,
      render: (v) => (
        <Badge status={v === 0 ? 'success' : 'default'} text={v === 0 ? '启用' : '禁用'} />
      ),
    },
    {
      title: '默认',
      dataIndex: 'isDefault',
      width: 80,
      render: (v) => v === 1 ? <Tag color="gold">默认</Tag> : '-',
    },
    {
      title: '上下文长度',
      dataIndex: 'contextLength',
      width: 120,
      render: (v) => v ?? '-',
    },
    {
      title: '操作',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Space size={0}>
          <Tooltip title="编辑">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
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
            <Select
              placeholder="Provider"
              value={query.providerId}
              onChange={(v) => setQuery((prev) => ({ ...prev, providerId: v }))}
              allowClear
              style={{ width: 180 }}
              options={providers.map((p) => ({ label: p.name, value: p.id }))}
            />
          </Col>
          <Col>
            <Select
              placeholder="模型类型"
              value={query.modelType}
              onChange={(v) => setQuery((prev) => ({ ...prev, modelType: v }))}
              allowClear
              style={{ width: 120 }}
              options={[
                { label: 'Chat', value: 'chat' },
                { label: 'Embedding', value: 'embedding' },
              ]}
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
        <Table<AiModelItem>
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 900 }}
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
        title={editRecord ? '编辑模型' : '新增模型'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={modalLoading}
        width={640}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="providerId" label="Provider" rules={[{ required: true, message: '请选择 Provider' }]}>
            <Select
              placeholder="请选择 Provider"
              showSearch
              optionFilterProp="label"
              options={providers.map((p) => ({ label: p.name, value: p.id }))}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="模型标识" rules={[{ required: true, message: '请输入模型标识' }]}>
                <Input placeholder="如：gpt-4o" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="displayName" label="显示名称">
                <Input placeholder="如：GPT-4o" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="modelType" label="模型类型" rules={[{ required: true, message: '请选择模型类型' }]}>
                <Select
                  placeholder="请选择模型类型"
                  options={[
                    { label: 'Chat', value: 'chat' },
                    { label: 'Embedding', value: 'embedding' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="enabledSwitch" label="启用" valuePropName="checked" initialValue={true}>
                <Switch checkedChildren="启用" unCheckedChildren="禁用" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="isDefaultSwitch" label="默认" valuePropName="checked" initialValue={false}>
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.isDefaultSwitch !== cur.isDefaultSwitch}>
            {({ getFieldValue }) =>
              getFieldValue('isDefaultSwitch') ? (
                <Alert
                  message="设为默认后，同类型的其他模型将取消默认"
                  type="info"
                  showIcon
                  style={{ marginBottom: 24 }}
                />
              ) : null
            }
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="contextLength" label="上下文长度">
                <InputNumber min={0} style={{ width: '100%' }} placeholder="如：128000" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="inputPrice" label="输入价格">
                <Input placeholder="如：0.005" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="outputPrice" label="输出价格">
                <Input placeholder="如：0.015" />
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

export default ModelPage;

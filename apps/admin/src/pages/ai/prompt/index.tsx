import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Select,
  Space,
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
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { AiPromptItem, QueryAiPromptParams, CreateAiPromptParams, UpdateAiPromptParams } from '../../../types/api';
import { getPromptList, createPrompt, updatePrompt, deletePrompt } from '../../../api/ai-prompt';

const PromptPage = () => {
  const [data, setData] = useState<AiPromptItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<QueryAiPromptParams>({ page: 1, pageSize: 10 });

  // 弹窗
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<AiPromptItem | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPromptList(query);
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
    form.setFieldsValue({ enabled: 0, version: 1 });
    setModalOpen(true);
  };

  const handleEdit = (record: AiPromptItem) => {
    setEditRecord(record);
    form.setFieldsValue({
      code: record.code ?? '',
      name: record.name ?? '',
      content: record.content ?? '',
      version: record.version ?? 1,
      enabledSwitch: record.enabled === 0,
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
        await updatePrompt(editRecord.id, payload as UpdateAiPromptParams);
        message.success('更新成功');
      } else {
        await createPrompt(payload as CreateAiPromptParams);
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
      await deletePrompt(id);
      message.success('删除成功');
      fetchData();
    } catch {
      // ignore
    }
  };

  const columns: ColumnsType<AiPromptItem> = [
    { title: '编码', dataIndex: 'code', width: 160 },
    { title: '名称', dataIndex: 'name', width: 160 },
    { title: '版本', dataIndex: 'version', width: 80 },
    {
      title: '启用',
      dataIndex: 'enabled',
      width: 80,
      render: (v) => (
        <Badge status={v === 0 ? 'success' : 'default'} text={v === 0 ? '启用' : '禁用'} />
      ),
    },
    { title: '备注', dataIndex: 'remark', ellipsis: true },
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
            <Input
              placeholder="编码"
              value={query.code}
              onChange={(e) => setQuery((prev) => ({ ...prev, code: e.target.value || undefined }))}
              onPressEnter={handleSearch}
              allowClear
              style={{ width: 160 }}
            />
          </Col>
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
        <Table<AiPromptItem>
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 700 }}
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
        title={editRecord ? '编辑 Prompt' : '新增 Prompt'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={modalLoading}
        width={640}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="code" label="编码" rules={[{ required: true, message: '请输入编码' }]}>
                <Input placeholder="请输入编码" disabled={!!editRecord} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
                <Input placeholder="请输入名称" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="content" label="内容" rules={[{ required: true, message: '请输入内容' }]}>
            <Input.TextArea rows={6} placeholder="请输入 Prompt 内容" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="version" label="版本" initialValue={1}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="enabledSwitch" label="启用" valuePropName="checked" initialValue={true}>
                <Switch checkedChildren="启用" unCheckedChildren="禁用" />
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

export default PromptPage;

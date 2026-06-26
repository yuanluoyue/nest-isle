import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Tooltip,
  Drawer,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SendOutlined,
  StopOutlined,
  FormOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { FormItem, CreateFormParams, QueryFormParams } from '../../../types/api';
import {
  getFormList,
  createForm,
  updateForm,
  deleteForm,
  publishForm,
  unpublishForm,
  getFormDetail,
} from '../../../api/form';
import FormRender, { useForm } from 'form-render';
import { resolveSchemaDatasources } from '../../../utils/datasource';

const statusMap: Record<number, { color: string; text: string }> = {
  0: { color: 'orange', text: '草稿' },
  1: { color: 'green', text: '已发布' },
  2: { color: 'red', text: '停用' },
};

// 表单预览组件
const FormPreview = ({ schema }: { schema: Record<string, any> }) => {
  const form = useForm();
  return (
    <div style={{ padding: '16px 0' }}>
      <FormRender form={form} schema={schema} />
    </div>
  );
};

const FormDesignPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<FormItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<QueryFormParams>({ page: 1, pageSize: 10 });

  // 新增/编辑弹窗
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<FormItem | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();

  // 预览抽屉
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSchema, setPreviewSchema] = useState<Record<string, any> | null>(null);
  const [previewTitle, setPreviewTitle] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getFormList(query);
      setData(res.list);
      setTotal(res.total);
    } catch {
      message.error('获取表单列表失败');
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
    setModalOpen(true);
  };

  const handleEdit = (record: FormItem) => {
    setEditRecord(record);
    setModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setModalLoading(true);
      if (editRecord) {
        await updateForm(editRecord.id, values);
        message.success('更新成功');
      } else {
        await createForm(values as CreateFormParams);
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
      await deleteForm(id);
      message.success('删除成功');
      fetchData();
    } catch {
      message.error('删除失败');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await publishForm(id);
      message.success('发布成功');
      fetchData();
    } catch (err: any) {
      message.error(err?.message || '发布失败');
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await unpublishForm(id);
      message.success('已停用');
      fetchData();
    } catch (err: any) {
      message.error(err?.message || '停用失败');
    }
  };

  const handlePreview = async (record: FormItem) => {
    try {
      const detail = await getFormDetail(record.id);
      let schema = detail.publishedSchema || detail.schema;
      if (!schema) {
        message.warning('表单Schema为空，无法预览');
        return;
      }
      // 解析数据源配置
      schema = await resolveSchemaDatasources(schema);
      setPreviewSchema(schema);
      setPreviewTitle(`预览: ${record.name}`);
      setPreviewOpen(true);
    } catch {
      message.error('获取表单详情失败');
    }
  };

  const columns: ColumnsType<FormItem> = [
    { title: '表单名称', dataIndex: 'name', width: 180 },
    { title: '表单编码', dataIndex: 'code', width: 150 },
    { title: '描述', dataIndex: 'description', width: 200, ellipsis: true },
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
      render: (v) => (v ? new Date(v).toLocaleString() : '-'),
    },
    {
      title: '操作',
      width: 280,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title={record.status === 2 ? '已停用，无法填写' : '填写'}>
            <Button type="link" size="small" icon={<FileTextOutlined />} disabled={record.status === 2} onClick={() => navigate(`/form/fill/${record.id}`)} />
          </Tooltip>
          <Tooltip title="设计">
            <Button type="link" size="small" icon={<FormOutlined />} onClick={() => navigate(`/form/design/${record.id}`)} />
          </Tooltip>
          <Tooltip title="编辑">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="预览">
            <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handlePreview(record)} />
          </Tooltip>
          {record.status !== 1 && (
            <Tooltip title="发布">
              <Button type="link" size="small" icon={<SendOutlined />} onClick={() => handlePublish(record.id)} />
            </Tooltip>
          )}
          {record.status === 1 && (
            <Tooltip title="停用">
              <Button type="link" size="small" icon={<StopOutlined />} onClick={() => handleUnpublish(record.id)} />
            </Tooltip>
          )}
          <Popconfirm title="确定删除该表单吗？" onConfirm={() => handleDelete(record.id)}>
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
              placeholder="表单名称"
              value={query.name}
              onChange={(e) => setQuery((prev) => ({ ...prev, name: e.target.value || undefined }))}
              onPressEnter={handleSearch}
              allowClear
              style={{ width: 160 }}
            />
          </Col>
          <Col>
            <Input
              placeholder="表单编码"
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
                { label: '草稿', value: 0 },
                { label: '已发布', value: 1 },
                { label: '停用', value: 2 },
              ]}
            />
          </Col>
          <Col>
            <Space>
              <Button type="primary" onClick={handleSearch}>
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增表单
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            刷新
          </Button>
        </div>
        <Table<FormItem>
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
        title={editRecord ? '编辑表单' : '新增表单'}
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
          <Form.Item name="name" label="表单名称" rules={[{ required: true, message: '请输入表单名称' }]}>
            <Input placeholder="请输入表单名称" />
          </Form.Item>
          <Form.Item name="code" label="表单编码" rules={[{ required: true, message: '请输入表单编码' }]}>
            <Input disabled={!!editRecord} placeholder="请输入表单编码" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 预览抽屉 */}
      <Drawer
        title={previewTitle}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        width={600}
        destroyOnClose
      >
        {previewSchema && (
          <FormPreview schema={previewSchema} />
        )}
      </Drawer>
    </div>
  );
};

export default FormDesignPage;

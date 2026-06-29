/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Tooltip,
  Alert,
} from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, ThunderboltOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type {
  FormDatasourceItem,
  CreateFormDatasourceParams,
  UpdateFormDatasourceParams,
  QueryFormDatasourceParams,
} from '../../../types/api';
import {
  getFormDatasourceList,
  createFormDatasource,
  updateFormDatasource,
  deleteFormDatasource,
  getDatasourceData,
} from '../../../api/form-datasource';

const typeOptions = [
  { label: '字典', value: 'dict' },
  { label: 'API', value: 'api' },
  { label: '静态数据', value: 'static' },
];

const typeConfigHint: Record<string, string> = {
  dict: '字典类型：配置中填写 {"dictCode": "字典编码"}，例如 {"dictCode": "gender"}',
  api: 'API类型：配置中填写 {"url": "接口地址", "method": "GET", "labelField": "label", "valueField": "value"}',
  static: '静态类型：配置中填写 {"options": [{"label": "选项1", "value": "1"}, {"label": "选项2", "value": "2"}]}',
};

const FormDatasourcePage = () => {
  const [data, setData] = useState<FormDatasourceItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<QueryFormDatasourceParams>({ page: 1, pageSize: 10 });

  // 新增/编辑弹窗
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<FormDatasourceItem | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm();
  const [currentType, setCurrentType] = useState('dict');

  // 测试结果
  const [, setTestResult] = useState<any[] | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getFormDatasourceList(query);
      setData(res.list);
      setTotal(res.total);
    } catch {
      message.error('获取数据源列表失败');
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
    setCurrentType('dict');
    setTestResult(null);
    setModalOpen(true);
  };

  const handleEdit = (record: FormDatasourceItem) => {
    setEditRecord(record);
    setCurrentType(record.type || 'dict');
    setTestResult(null);
    setModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const submitData = { ...values };
      if (submitData.configStr) {
        try {
          submitData.config = JSON.parse(submitData.configStr);
        } catch {
          message.error('配置JSON格式错误');
          return;
        }
        delete submitData.configStr;
      } else {
        delete submitData.configStr;
      }

      setModalLoading(true);
      if (editRecord) {
        await updateFormDatasource(editRecord.id, submitData as UpdateFormDatasourceParams);
        message.success('更新成功');
      } else {
        await createFormDatasource(submitData as CreateFormDatasourceParams);
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
      await deleteFormDatasource(id);
      message.success('删除成功');
      fetchData();
    } catch {
      message.error('删除失败');
    }
  };

  const handleTest = async (record: FormDatasourceItem) => {
    setTestLoading(true);
    try {
      const result = await getDatasourceData(record.id);
      if (result.length === 0) {
        message.info('数据源返回为空，请检查配置');
      } else {
        message.success(`获取到 ${result.length} 条数据`);
      }
      Modal.info({
        title: `数据源测试 - ${record.name}`,
        width: 500,
        content: (
          <div style={{ marginTop: 12 }}>
            <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, maxHeight: 400, overflow: 'auto', fontSize: 12 }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        ),
      });
    } catch {
      message.error('获取数据源数据失败');
    } finally {
      setTestLoading(false);
    }
  };

  const columns: ColumnsType<FormDatasourceItem> = [
    { title: '名称', dataIndex: 'name', width: 150 },
    { title: '编码', dataIndex: 'code', width: 150 },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      render: (v) => {
        const opt = typeOptions.find((o) => o.value === v);
        return opt ? opt.label : v || '-';
      },
    },
    {
      title: '配置',
      dataIndex: 'config',
      width: 250,
      ellipsis: true,
      render: (v) => (v ? JSON.stringify(v) : '-'),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (v) => (v ? new Date(v).toLocaleString() : '-'),
    },
    {
      title: '操作',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="测试">
            <Button type="link" size="small" icon={<ThunderboltOutlined />} loading={testLoading} onClick={() => handleTest(record)} />
          </Tooltip>
          <Tooltip title="编辑">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm title="确定删除该数据源吗？" onConfirm={() => handleDelete(record.id)}>
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
              style={{ width: 120 }}
              options={typeOptions}
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
            新增数据源
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            刷新
          </Button>
        </div>
        <Table<FormDatasourceItem>
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

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editRecord ? '编辑数据源' : '新增数据源'}
        open={modalOpen}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={modalLoading}
        width={500}
        destroyOnClose
        afterOpenChange={(open) => {
          if (open && editRecord) {
            form.setFieldsValue({
              ...editRecord,
              configStr: editRecord.config ? JSON.stringify(editRecord.config, null, 2) : '',
            });
            setCurrentType(editRecord.type || 'dict');
          }
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="请输入名称" />
          </Form.Item>
          <Form.Item name="code" label="编码" rules={[{ required: true, message: '请输入编码' }]}>
            <Input disabled={!!editRecord} placeholder="请输入编码（创建后不可修改）" />
          </Form.Item>
          <Form.Item name="type" label="类型" initialValue="dict">
            <Select
              options={typeOptions}
              onChange={(v) => setCurrentType(v)}
            />
          </Form.Item>
          {currentType && (
            <Alert
              message="配置说明"
              description={typeConfigHint[currentType]}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          <Form.Item name="configStr" label="配置（JSON）">
            <Input.TextArea rows={4} placeholder='{"key": "value"}' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FormDatasourcePage;

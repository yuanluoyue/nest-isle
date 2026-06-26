/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  message,
  Popconfirm,
  Row,
  Col,
  Tooltip,
  Select,
  Drawer,
  Descriptions,
} from 'antd';
import { ReloadOutlined, DeleteOutlined, EyeOutlined, DesktopOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { FormRecordItem, QueryFormRecordParams, FormItem } from '../../../types/api';
import { getFormRecordList, deleteFormRecord } from '../../../api/form-record';
import { getFormList, getFormDetail } from '../../../api/form';
import { resolveSchemaDatasources } from '../../../utils/datasource';
import FormRender, { useForm } from 'form-render';

const FormRecordPage = () => {
  const [data, setData] = useState<FormRecordItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<QueryFormRecordParams>({ page: 1, pageSize: 10 });

  // 表单列表（用于筛选）
  const [formOptions, setFormOptions] = useState<FormItem[]>([]);

  // 详情抽屉
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState<FormRecordItem | null>(null);

  // 预览抽屉
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSchema, setPreviewSchema] = useState<any>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewForm = useForm();

  // 当 schema 加载完成后设置表单数据
  useEffect(() => {
    if (previewSchema && previewData && previewOpen) {
      // 延迟设置，确保 FormRender 已渲染
      setTimeout(() => {
        previewForm.setValues(previewData);
      }, 100);
    }
  }, [previewSchema, previewOpen]);

  const fetchForms = useCallback(async () => {
    try {
      const res = await getFormList({ page: 1, pageSize: 1000 });
      setFormOptions(res.list);
    } catch {
      // ignore
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getFormRecordList(query);
      setData(res.list);
      setTotal(res.total);
    } catch {
      message.error('获取表单数据失败');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    try {
      await deleteFormRecord(id);
      message.success('删除成功');
      fetchData();
    } catch {
      message.error('删除失败');
    }
  };

  const handleDetail = (record: FormRecordItem) => {
    setDetailRecord(record);
    setDetailOpen(true);
  };

  const handlePreview = async (record: FormRecordItem) => {
    setPreviewLoading(true);
    setPreviewOpen(true);
    setPreviewTitle('表单数据预览');
    try {
      const detail = await getFormDetail(record.formId);
      let schema = detail.publishedSchema || detail.schema;
      if (!schema || !schema.properties || Object.keys(schema.properties).length === 0) {
        message.warning('表单Schema为空');
        setPreviewLoading(false);
        return;
      }
      // 解析数据源配置
      schema = await resolveSchemaDatasources(schema);
      setPreviewSchema(schema);
      setPreviewData(record.data || {});
    } catch {
      message.error('加载表单失败');
    } finally {
      setPreviewLoading(false);
    }
  };

  const columns: ColumnsType<FormRecordItem> = [
    {
      title: '表单',
      dataIndex: 'formId',
      width: 180,
      render: (v) => {
        const f = formOptions.find((item) => item.id === v);
        return f ? f.name : v;
      },
    },
    {
      title: '数据',
      dataIndex: 'data',
      width: 300,
      ellipsis: true,
      render: (v) => (v ? JSON.stringify(v) : '-'),
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (v) => (v ? new Date(v).toLocaleString() : '-'),
    },
    {
      title: '操作',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="预览">
            <Button type="link" size="small" icon={<DesktopOutlined />} onClick={() => handlePreview(record)} />
          </Tooltip>
          <Tooltip title="详情">
            <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleDetail(record)} />
          </Tooltip>
          <Popconfirm title="确定删除该记录吗？" onConfirm={() => handleDelete(record.id)}>
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
              placeholder="选择表单"
              value={query.formId}
              onChange={(v) => setQuery((prev) => ({ ...prev, formId: v, page: 1 }))}
              allowClear
              style={{ width: 200 }}
              options={formOptions.map((f) => ({ label: f.name, value: f.id }))}
              showSearch
              filterOption={(input, option) => (option?.label as string)?.toLowerCase().includes(input.toLowerCase())}
            />
          </Col>
          <Col>
            <Button type="primary" onClick={() => fetchData()}>
              搜索
            </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            刷新
          </Button>
        </div>
        <Table<FormRecordItem>
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

      {/* 详情抽屉 */}
      <Drawer
        title="数据详情"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width={600}
        destroyOnClose
      >
        {detailRecord && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="ID">{detailRecord.id}</Descriptions.Item>
            <Descriptions.Item label="表单ID">{detailRecord.formId}</Descriptions.Item>
            <Descriptions.Item label="提交人">{detailRecord.createdBy || '-'}</Descriptions.Item>
            <Descriptions.Item label="提交时间">{detailRecord.createdAt ? new Date(detailRecord.createdAt).toLocaleString() : '-'}</Descriptions.Item>
            <Descriptions.Item label="数据">
              <pre style={{ margin: 0, background: '#f5f5f5', padding: 8, borderRadius: 4, overflow: 'auto', maxHeight: 400 }}>
                {detailRecord.data ? JSON.stringify(detailRecord.data, null, 2) : '-'}
              </pre>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      {/* 预览抽屉 - 表单+数据一起渲染 */}
      <Drawer
        title={previewTitle}
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewSchema(null);
          setPreviewData(null);
        }}
        width={700}
        destroyOnClose
      >
        {previewLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>加载中...</div>
        ) : previewSchema ? (
          <FormRender form={previewForm} schema={previewSchema} readOnly />
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>无表单数据</div>
        )}
      </Drawer>
    </div>
  );
};

export default FormRecordPage;

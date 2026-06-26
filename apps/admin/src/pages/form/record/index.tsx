import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  message,
  Popconfirm,
  Row,
  Col,
  Tooltip,
  Select,
} from 'antd';
import { ReloadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { FormRecordItem, QueryFormRecordParams, FormItem } from '../../../types/api';
import { getFormRecordList, deleteFormRecord } from '../../../api/form-record';
import { getFormList } from '../../../api/form';
import { Drawer, Descriptions } from 'antd';

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
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
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
    </div>
  );
};

export default FormRecordPage;

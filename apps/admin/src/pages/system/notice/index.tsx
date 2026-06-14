import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  message,
  Popconfirm,
  Row,
  Col,
  Select,
  Tooltip,
  Drawer,
} from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { NoticeItem, CreateNoticeParams, QueryNoticeParams } from '../../../types/api';
import {
  getNoticeList,
  getNoticeDetail,
  createNotice,
  updateNotice,
  deleteNotice,
} from '../../../api/notice';

const categoryMap: Record<string, { color: string; text: string }> = {
  system: { color: 'blue', text: '系统' },
  release: { color: 'green', text: '发布' },
  maintenance: { color: 'orange', text: '维护' },
  security: { color: 'red', text: '安全' },
};

const statusMap: Record<number, { color: string; text: string }> = {
  0: { color: 'default', text: '草稿' },
  1: { color: 'green', text: '已发布' },
  2: { color: 'default', text: '已归档' },
};

const categoryOptions = [
  { label: '系统', value: 'system' },
  { label: '发布', value: 'release' },
  { label: '维护', value: 'maintenance' },
  { label: '安全', value: 'security' },
];

const statusOptions = [
  { label: '草稿', value: 0 },
  { label: '已发布', value: 1 },
  { label: '已归档', value: 2 },
];

const NoticePage = () => {
  const [data, setData] = useState<NoticeItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<QueryNoticeParams>({ page: 1, pageSize: 10 });

  // 新增/编辑弹窗
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NoticeItem | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm<CreateNoticeParams>();

  // 详情抽屉
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<NoticeItem | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getNoticeList(query);
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
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ category: 'system', status: 0 });
    setModalOpen(true);
  };

  const handleEdit = (record: NoticeItem) => {
    setEditing(record);
    form.setFieldsValue({
      title: record.title ?? '',
      summary: record.summary ?? '',
      content: record.content ?? '',
      category: record.category ?? 'system',
      status: record.status ?? 0,
      remark: record.remark ?? '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (record: NoticeItem) => {
    try {
      await deleteNotice(record.id);
      message.success('删除成功');
      fetchData();
    } catch {
      // ignore
    }
  };

  const handleDetail = async (record: NoticeItem) => {
    try {
      const res = await getNoticeDetail(record.id);
      setDetail(res);
      setDetailOpen(true);
    } catch {
      // ignore
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setModalLoading(true);
      if (editing) {
        await updateNotice(editing.id, values);
        message.success('更新成功');
      } else {
        await createNotice(values);
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

  const columns: ColumnsType<NoticeItem> = [
    { title: '标题', dataIndex: 'title', ellipsis: true },
    {
      title: '分类',
      dataIndex: 'category',
      width: 90,
      render: (v) => {
        const c = categoryMap[v ?? 'system'];
        return <Tag color={c.color}>{c.text}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (v) => {
        const s = statusMap[v ?? 0];
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (v) => v ? new Date(v).toLocaleString() : '-',
    },
    {
      title: '操作',
      width: 110,
      fixed: 'right',
      render: (_, record) => (
        <Space size={0}>
          <Tooltip title="详情">
            <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleDetail(record)} />
          </Tooltip>
          <Tooltip title="编辑">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record)}>
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
              placeholder="标题"
              value={query.title}
              onChange={(e) => setQuery((prev) => ({ ...prev, title: e.target.value || undefined }))}
              onPressEnter={handleSearch}
              allowClear
              style={{ width: 180 }}
            />
          </Col>
          <Col>
            <Select
              placeholder="分类"
              value={query.category}
              onChange={(v) => setQuery((prev) => ({ ...prev, category: v }))}
              allowClear
              style={{ width: 120 }}
              options={categoryOptions}
            />
          </Col>
          <Col>
            <Select
              placeholder="状态"
              value={query.status}
              onChange={(v) => setQuery((prev) => ({ ...prev, status: v }))}
              allowClear
              style={{ width: 120 }}
              options={statusOptions}
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
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增</Button>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
        </div>
        <Table<NoticeItem>
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
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
        title={editing ? '编辑通知公告' : '新增通知公告'}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={modalLoading}
        destroyOnHidden
        width={680}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, max: 200 }]}>
            <Input placeholder="请输入标题" />
          </Form.Item>
          <Form.Item name="summary" label="摘要">
            <Input.TextArea rows={2} maxLength={500} showCount placeholder="请输入摘要" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="分类" rules={[{ required: true }]}>
                <Select options={categoryOptions} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                <Select options={statusOptions} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="content" label="正文" rules={[{ required: true }]}>
            <Input.TextArea rows={8} placeholder="请输入正文内容" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情抽屉 */}
      <Drawer
        title="通知公告详情"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width={640}
      >
        {detail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Row gutter={16}>
              <Col span={24}>
                <h2 style={{ marginTop: 0 }}>{detail.title}</h2>
              </Col>
            </Row>
            {detail.summary && (
              <div style={{ color: '#666' }}>{detail.summary}</div>
            )}
            <Row gutter={16}>
              <Col span={8}>
                <b>分类：</b>
                <Tag color={categoryMap[detail.category ?? 'system'].color}>{categoryMap[detail.category ?? 'system'].text}</Tag>
              </Col>
              <Col span={8}>
                <b>状态：</b>
                <Tag color={statusMap[detail.status ?? 0].color}>{statusMap[detail.status ?? 0].text}</Tag>
              </Col>
              <Col span={8}>
                <b>创建时间：</b>
                {detail.createdAt ? new Date(detail.createdAt).toLocaleString() : '-'}
              </Col>
            </Row>
            {detail.publishedAt && (
              <div>
                <b>发布时间：</b>
                {new Date(detail.publishedAt).toLocaleString()}
              </div>
            )}
            {detail.remark && (
              <div>
                <b>备注：</b>{detail.remark}
              </div>
            )}
            <div>
              <b>正文：</b>
              <pre
                style={{
                  marginTop: 8,
                  background: '#fafafa',
                  padding: 16,
                  borderRadius: 6,
                  fontFamily: 'inherit',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {detail.content}
              </pre>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default NoticePage;

import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Card,
  Button,
  Space,
  Tag,
  message,
  Popconfirm,
  Row,
  Col,
  Select,
  Tooltip,
  Drawer,
  Typography,
} from 'antd';
import { ReloadOutlined, DeleteOutlined, EyeOutlined, CheckOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { NotificationReceiverItem, QueryNotificationParams } from '../../types/api';
import {
  getNotificationList,
  getNotificationDetail,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../../api/notification';
import { useNotificationStore } from '../../stores/notification';

const typeMap: Record<string, { color: string; text: string }> = {
  announcement: { color: 'blue', text: '通知公告' },
  role_change: { color: 'purple', text: '角色变更' },
};

const priorityMap: Record<number, { color: string; text: string }> = {
  0: { color: 'default', text: '普通' },
  1: { color: 'orange', text: '重要' },
  2: { color: 'red', text: '紧急' },
};

const statusOptions = [
  { label: '未读', value: 'unread' },
  { label: '已读', value: 'read' },
];

const typeOptions = [
  { label: '通知公告', value: 'announcement' },
  { label: '角色变更', value: 'role_change' },
];

const NotificationPage = () => {
  const [data, setData] = useState<NotificationReceiverItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<QueryNotificationParams>({ page: 1, pageSize: 10 });
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);

  // 详情抽屉
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<NotificationReceiverItem | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getNotificationList(query);
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

  const handleDetail = async (record: NotificationReceiverItem) => {
    try {
      const res = await getNotificationDetail(record.id);
      setDetail(res);
      setDetailOpen(true);
      // 如果未读，标记为已读
      if (record.status === 'unread') {
        await markAsRead(record.id);
        fetchUnreadCount();
        fetchData();
      }
    } catch {
      // ignore
    }
  };

  const handleMarkRead = async (record: NotificationReceiverItem) => {
    try {
      await markAsRead(record.id);
      message.success('已标记为已读');
      fetchUnreadCount();
      fetchData();
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      message.success('已全部标记为已读');
      fetchUnreadCount();
      fetchData();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (record: NotificationReceiverItem) => {
    try {
      await deleteNotification(record.id);
      message.success('删除成功');
      fetchUnreadCount();
      fetchData();
    } catch {
      // ignore
    }
  };

  const columns: ColumnsType<NotificationReceiverItem> = [
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (v) => (
        <Tag color={v === 'unread' ? 'blue' : 'default'}>
          {v === 'unread' ? '未读' : '已读'}
        </Tag>
      ),
    },
    {
      title: '类型',
      dataIndex: ['notification', 'type'],
      width: 100,
      render: (v) => {
        const t = typeMap[v ?? 'announcement'];
        return <Tag color={t.color}>{t.text}</Tag>;
      },
    },
    {
      title: '标题',
      dataIndex: ['notification', 'title'],
      ellipsis: true,
      render: (v, record) => (
        <span style={{ fontWeight: record.status === 'unread' ? 600 : 400 }}>
          {v}
        </span>
      ),
    },
    {
      title: '优先级',
      dataIndex: ['notification', 'priority'],
      width: 80,
      render: (v) => {
        const p = priorityMap[v ?? 0];
        return <Tag color={p.color}>{p.text}</Tag>;
      },
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      width: 170,
      render: (v) => (v ? new Date(v).toLocaleString() : '-'),
    },
    {
      title: '操作',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size={0}>
          <Tooltip title="详情">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleDetail(record)}
            />
          </Tooltip>
          {record.status === 'unread' && (
            <Tooltip title="标记已读">
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleMarkRead(record)}
              />
            </Tooltip>
          )}
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
        <div
          style={{
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Button
            icon={<CheckCircleOutlined />}
            onClick={handleMarkAllRead}
          >
            全部已读
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            刷新
          </Button>
        </div>
        <Table<NotificationReceiverItem>
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          onRow={(record) => ({
            onClick: () => handleDetail(record),
            style: { cursor: 'pointer' },
          })}
          pagination={{
            current: query.page,
            pageSize: query.pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (page, pageSize) =>
              setQuery((prev) => ({ ...prev, page, pageSize })),
          }}
        />
      </Card>

      {/* 详情抽屉 */}
      <Drawer
        title="站内信详情"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width={560}
      >
        {detail?.notification && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Typography.Title level={4} style={{ marginTop: 0 }}>
              {detail.notification.title}
            </Typography.Title>
            <div>
              <Space size={16}>
                <Tag color={typeMap[detail.notification.type ?? 'announcement'].color}>
                  {typeMap[detail.notification.type ?? 'announcement'].text}
                </Tag>
                <Tag color={priorityMap[detail.notification.priority ?? 0].color}>
                  {priorityMap[detail.notification.priority ?? 0].text}
                </Tag>
                <Tag color={detail.status === 'unread' ? 'blue' : 'default'}>
                  {detail.status === 'unread' ? '未读' : '已读'}
                </Tag>
              </Space>
            </div>
            <div style={{ color: '#999', fontSize: 13 }}>
              {detail.createdAt ? new Date(detail.createdAt).toLocaleString() : '-'}
              {detail.readAt && (
                <span style={{ marginLeft: 16 }}>
                  已读于 {new Date(detail.readAt).toLocaleString()}
                </span>
              )}
            </div>
            <div
              style={{
                background: '#fafafa',
                padding: 16,
                borderRadius: 8,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: 1.8,
              }}
            >
              {detail.notification.content}
            </div>
            {/* {detail.notification.link && (
              <div>
                <Typography.Text type="secondary">相关链接：</Typography.Text>
                <Typography.Link
                  onClick={() => {
                    setDetailOpen(false);
                    // 内部链接直接导航
                    window.location.hash = detail.notification?.link ?? '';
                  }}
                >
                  {detail.notification.link}
                </Typography.Link>
              </div>
            )} */}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default NotificationPage;

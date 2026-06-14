import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Space,
  Input,
  Select,
  Tag,
  message,
  Popconfirm,
  Tooltip,
  Badge,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { LogoutOutlined, SearchOutlined } from '@ant-design/icons';
import type { SessionItem, QuerySessionParams } from '../../../types/api';
import { getSessionList, forceLogout } from '../../../api/session';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const userTypeMap: Record<string, { color: string; text: string }> = {
  admin: { color: 'blue', text: '管理员' },
  user: { color: 'green', text: '用户' },
};

export default function SessionPage() {
  const [data, setData] = useState<SessionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<QuerySessionParams>({ page: 1, pageSize: 10 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSessionList(query);
      setData(res.list);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleForceLogout = async (id: string) => {
    await forceLogout(id);
    message.success('已强制下线');
    fetchData();
  };

  const columns: ColumnsType<SessionItem> = [
    {
      title: '状态',
      dataIndex: 'online',
      width: 80,
      render: (online: boolean) =>
        online ? (
          <Badge status="success" text="在线" />
        ) : (
          <Badge status="default" text="离线" />
        ),
    },
    {
      title: '用户类型',
      dataIndex: 'userType',
      width: 100,
      render: (v) => {
        const t = userTypeMap[v ?? 'admin'] ?? { color: 'default', text: v };
        return <Tag color={t.color}>{t.text}</Tag>;
      },
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      width: 140,
    },
    {
      title: '浏览器',
      dataIndex: 'browser',
      width: 120,
      ellipsis: true,
    },
    {
      title: '操作系统',
      dataIndex: 'os',
      width: 120,
      ellipsis: true,
    },
    {
      title: '设备',
      dataIndex: 'device',
      width: 100,
      ellipsis: true,
      render: (v) => v || '-',
    },
    {
      title: '登录时间',
      dataIndex: 'loginAt',
      width: 170,
      render: (v) => (v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '最后活跃',
      dataIndex: 'lastActiveAt',
      width: 170,
      render: (v) => (v ? dayjs(v).fromNow() : '-'),
    },
    {
      title: '操作',
      width: 80,
      fixed: 'right',
      render: (_, record) =>
        record.online ? (
          <Popconfirm
            title="确认强制下线？"
            onConfirm={() => handleForceLogout(record.id)}
          >
            <Tooltip title="强制下线">
              <Button type="text" size="small" danger icon={<LogoutOutlined />} />
            </Tooltip>
          </Popconfirm>
        ) : null,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          <Input
            placeholder="IP 地址"
            allowClear
            prefix={<SearchOutlined />}
            style={{ width: 160 }}
            onChange={(e) =>
              setQuery((q) => ({ ...q, ip: e.target.value || undefined, page: 1 }))
            }
          />
          <Select
            placeholder="用户类型"
            allowClear
            style={{ width: 120 }}
            onChange={(v) => setQuery((q) => ({ ...q, userType: v, page: 1 }))}
            options={[
              { label: '管理员', value: 'admin' },
              { label: '用户', value: 'user' },
            ]}
          />
        </Space>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        scroll={{ x: 1080 }}
        pagination={{
          current: query.page,
          pageSize: query.pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t) => `共 ${t} 条`,
          onChange: (page, pageSize) => setQuery((q) => ({ ...q, page, pageSize })),
        }}
      />
    </div>
  );
}

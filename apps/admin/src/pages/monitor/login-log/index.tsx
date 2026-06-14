import { useState, useEffect, useCallback } from 'react';
import { Table, Card, Button, Input, Select, Space, Tag, Row, Col, Modal, Tooltip } from 'antd';
import { ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { LoginLogItem, QueryLoginLogParams } from '../../../types/api';
import { getLoginLogList, getLoginLogDetail } from '../../../api/login-log';

const statusMap: Record<number, { color: string; text: string }> = {
  0: { color: 'green', text: '成功' },
  1: { color: 'red', text: '失败' },
};

const LoginLogPage = () => {
  const [data, setData] = useState<LoginLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<QueryLoginLogParams>({ page: 1, pageSize: 10 });

  // 详情弹窗
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<LoginLogItem | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLoginLogList(query);
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

  const handleDetail = async (record: LoginLogItem) => {
    try {
      const res = await getLoginLogDetail(record.id);
      setDetail(res);
      setDetailOpen(true);
    } catch {
      // ignore
    }
  };

  const columns: ColumnsType<LoginLogItem> = [
    { title: '用户名', dataIndex: 'username', width: 140 },
    { title: 'IP 地址', dataIndex: 'ip', width: 140 },
    { title: '浏览器', dataIndex: 'browser', width: 120 },
    { title: '操作系统', dataIndex: 'os', width: 120 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (v) => {
        const s = statusMap[v ?? 0];
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    { title: '消息', dataIndex: 'message', width: 180, ellipsis: true },
    {
      title: '登录时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (v) => v ? new Date(v).toLocaleString() : '-',
    },
    {
      title: '操作',
      width: 60,
      fixed: 'right',
      render: (_, record) => (
        <Tooltip title="详情">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleDetail(record)} />
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col>
            <Input
              placeholder="用户名"
              value={query.username}
              onChange={(e) => setQuery((prev) => ({ ...prev, username: e.target.value || undefined }))}
              onPressEnter={handleSearch}
              allowClear
              style={{ width: 160 }}
            />
          </Col>
          <Col>
            <Input
              placeholder="IP 地址"
              value={query.ip}
              onChange={(e) => setQuery((prev) => ({ ...prev, ip: e.target.value || undefined }))}
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
                { label: '成功', value: 0 },
                { label: '失败', value: 1 },
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
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
        </div>
        <Table<LoginLogItem>
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

      <Modal
        title="登录日志详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={700}
      >
        {detail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Row gutter={16}>
              <Col span={12}><b>用户名：</b>{detail.username || '-'}</Col>
              <Col span={12}><b>IP 地址：</b>{detail.ip || '-'}</Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}><b>浏览器：</b>{detail.browser || '-'}</Col>
              <Col span={12}><b>操作系统：</b>{detail.os || '-'}</Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <b>状态：</b>
                <Tag color={statusMap[detail.status ?? 0].color}>{statusMap[detail.status ?? 0].text}</Tag>
              </Col>
              <Col span={12}><b>登录时间：</b>{detail.createdAt ? new Date(detail.createdAt).toLocaleString() : '-'}</Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}><b>消息：</b>{detail.message || '-'}</Col>
            </Row>
            {detail.userAgent && (
              <div>
                <b>User Agent：</b>
                <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, maxHeight: 160, overflow: 'auto', fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {detail.userAgent}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LoginLogPage;

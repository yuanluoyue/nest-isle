import { useState, useEffect, useCallback } from 'react';
import { Table, Card, Button, Input, Select, Space, Tag, Row, Col, Modal } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { OperateLogItem, QueryOperateLogParams } from '../../../types/api';
import { getOperateLogList, getOperateLogDetail } from '../../../api/operate-log';

const statusMap: Record<number, { color: string; text: string }> = {
  0: { color: 'green', text: '成功' },
  1: { color: 'red', text: '失败' },
};

const OperateLogPage = () => {
  const [data, setData] = useState<OperateLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<QueryOperateLogParams>({ page: 1, pageSize: 10 });

  // 详情弹窗
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<OperateLogItem | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOperateLogList(query);
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

  const handleDetail = async (record: OperateLogItem) => {
    try {
      const res = await getOperateLogDetail(record.id);
      setDetail(res);
      setDetailOpen(true);
    } catch {
      // ignore
    }
  };

  const columns: ColumnsType<OperateLogItem> = [
    { title: '操作模块', dataIndex: 'module', width: 120 },
    { title: '操作描述', dataIndex: 'description', width: 120 },
    { title: '请求方法', dataIndex: 'method', width: 100 },
    { title: '请求URL', dataIndex: 'url', width: 220, ellipsis: true },
    { title: 'IP地址', dataIndex: 'ip', width: 140 },
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
      title: '操作时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (v) => v ? new Date(v).toLocaleString() : '-',
    },
    {
      title: '操作',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => handleDetail(record)}>详情</Button>
      ),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col>
            <Input
              placeholder="操作模块"
              value={query.module}
              onChange={(e) => setQuery((prev) => ({ ...prev, module: e.target.value || undefined }))}
              onPressEnter={handleSearch}
              allowClear
              style={{ width: 160 }}
            />
          </Col>
          <Col>
            <Input
              placeholder="操作描述"
              value={query.description}
              onChange={(e) => setQuery((prev) => ({ ...prev, description: e.target.value || undefined }))}
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
        <Table<OperateLogItem>
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
        title="操作日志详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={700}
      >
        {detail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Row gutter={16}>
              <Col span={12}><b>操作模块：</b>{detail.module}</Col>
              <Col span={12}><b>操作描述：</b>{detail.description}</Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}><b>请求方法：</b>{detail.method}</Col>
              <Col span={12}><b>请求URL：</b>{detail.url}</Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}><b>IP地址：</b>{detail.ip}</Col>
              <Col span={12}>
                <b>状态：</b>
                <Tag color={statusMap[detail.status ?? 0].color}>{statusMap[detail.status ?? 0].text}</Tag>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}><b>操作时间：</b>{detail.createdAt ? new Date(detail.createdAt).toLocaleString() : '-'}</Col>
            </Row>
            {detail.request && (
              <div>
                <b>请求参数：</b>
                <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, maxHeight: 200, overflow: 'auto', fontSize: 12 }}>
                  {(() => { try { return JSON.stringify(JSON.parse(detail.request), null, 2); } catch { return detail.request; } })()}
                </pre>
              </div>
            )}
            {detail.response && (
              <div>
                <b>响应结果：</b>
                <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, maxHeight: 200, overflow: 'auto', fontSize: 12 }}>
                  {(() => { try { return JSON.stringify(JSON.parse(detail.response), null, 2); } catch { return detail.response; } })()}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OperateLogPage;

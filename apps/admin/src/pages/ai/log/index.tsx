import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Card,
  Button,
  Select,
  Space,
  Row,
  Col,
  Badge,
} from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { AiLogItem, QueryAiLogParams, AiProviderItem, AiModelItem } from '../../../types/api';
import { getAiLogList } from '../../../api/ai-log';
import { getProviderList } from '../../../api/ai-provider';
import { getModelList } from '../../../api/ai-model';
import dayjs from 'dayjs';

const statusMap: Record<number, { color: string; text: string }> = {
  0: { color: 'green', text: '成功' },
  1: { color: 'red', text: '失败' },
};

const AiLogPage = () => {
  const [data, setData] = useState<AiLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<QueryAiLogParams>({ page: 1, pageSize: 10 });

  // 筛选下拉数据
  const [providers, setProviders] = useState<AiProviderItem[]>([]);
  const [models, setModels] = useState<AiModelItem[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAiLogList(query);
      setData(res.list);
      setTotal(res.total);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [query]);

  const fetchFilters = useCallback(async () => {
    try {
      const [providerRes, modelRes] = await Promise.all([
        getProviderList({ page: 1, pageSize: 999 }),
        getModelList({ page: 1, pageSize: 999 }),
      ]);
      setProviders(providerRes.list);
      setModels(modelRes.list);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  const handleSearch = () => {
    setQuery((prev) => ({ ...prev, page: 1 }));
  };

  const handleReset = () => {
    setQuery({ page: 1, pageSize: 10 });
  };

  const columns: ColumnsType<AiLogItem> = [
    {
      title: 'Provider',
      dataIndex: ['provider', 'name'],
      width: 120,
      render: (v) => v ?? '-',
    },
    {
      title: '模型',
      dataIndex: ['model', 'name'],
      width: 140,
      render: (v) => v ?? '-',
    },
    { title: 'Prompt Tokens', dataIndex: 'promptTokens', width: 120, render: (v) => v ?? '-' },
    { title: 'Completion Tokens', dataIndex: 'completionTokens', width: 140, render: (v) => v ?? '-' },
    { title: 'Total Tokens', dataIndex: 'totalTokens', width: 120, render: (v) => v ?? '-' },
    {
      title: '耗时',
      dataIndex: 'duration',
      width: 100,
      render: (v) => v != null ? `${v}ms` : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (v) => {
        const s = statusMap[v ?? 0];
        return <Badge status={s.color === 'green' ? 'success' : 'error'} text={s.text} />;
      },
    },
    { title: '错误', dataIndex: 'error', ellipsis: true, width: 160 },
    {
      title: '时间',
      dataIndex: 'createdAt',
      width: 180,
      render: (v) => v ? dayjs(v).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col>
            <Select
              placeholder="Provider"
              value={query.providerId}
              onChange={(v) => setQuery((prev) => ({ ...prev, providerId: v }))}
              allowClear
              style={{ width: 180 }}
              options={providers.map((p) => ({ label: p.name, value: p.id }))}
            />
          </Col>
          <Col>
            <Select
              placeholder="模型"
              value={query.modelId}
              onChange={(v) => setQuery((prev) => ({ ...prev, modelId: v }))}
              allowClear
              style={{ width: 200 }}
              showSearch
              optionFilterProp="label"
              options={models.map((m) => ({ label: m.displayName || m.name, value: m.id }))}
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
        <Table<AiLogItem>
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 1200 }}
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
    </div>
  );
};

export default AiLogPage;

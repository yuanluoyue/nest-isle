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
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  CaretRightOutlined,
  PauseOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { JobItem, CreateJobParams, QueryJobParams, JobLogItem, QueryJobLogParams } from '../../../types/api';
import {
  getJobList,
  createJob,
  updateJob,
  deleteJob,
  startJob,
  stopJob,
  runJobOnce,
  getJobLogList,
} from '../../../api/job';
/**
 * 纯前端 Cron 表达式翻译（支持 5 位和 6 位格式）
 */
const translateCron = (cron: string | null): string => {
  if (!cron) return '';
  try {
    const parts = cron.trim().split(/\s+/);
    if (parts.length < 5) return '';
    // 支持 5 位(分时日月周) 和 6 位(秒分时日月周)
    const hasSecond = parts.length === 6;
    const offset = hasSecond ? 1 : 0;
    const minute = parts[offset];
    const hour = parts[offset + 1];
    const dayOfMonth = parts[offset + 2];
    const month = parts[offset + 3];
    const dayOfWeek = parts[offset + 4];

    const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];

    const desc: string[] = [];

    // 频率判断
    const everyMinute = minute === '*';
    const everyHour = hour === '*';
    const everyDay = dayOfMonth === '*';
    const everyMonth = month === '*';
    const everyWeek = dayOfWeek === '*';

    // 分钟
    if (everyMinute && everyHour) {
      // 不显示，由小时部分处理
    } else if (everyMinute) {
      desc.push('每分钟');
    } else if (minute.startsWith('*/')) {
      desc.push(`每${minute.slice(2)}分钟`);
    } else {
      desc.push(`${minute}分`);
    }

    // 小时
    if (everyHour) {
      // 不显示
    } else if (hour.startsWith('*/')) {
      desc.push(`每${hour.slice(2)}小时`);
    } else if (hour.includes('-')) {
      const [from, to] = hour.split('-');
      desc.push(`${from}点到${to}点`);
    } else {
      desc.push(`${hour}点`);
    }

    // 日
    if (!everyDay) {
      if (dayOfMonth.startsWith('*/')) {
        desc.push(`每${dayOfMonth.slice(2)}天`);
      } else {
        desc.push(`每月${dayOfMonth}号`);
      }
    }

    // 月
    if (!everyMonth) {
      if (month.startsWith('*/')) {
        desc.push(`每${month.slice(2)}个月`);
      } else {
        const m = parseInt(month);
        const monthNames = ['', '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
        desc.push(m >= 1 && m <= 12 ? monthNames[m] : `${month}月`);
      }
    }

    // 周
    if (!everyWeek) {
      if (dayOfWeek.includes('-')) {
        const [from, to] = dayOfWeek.split('-').map(Number);
        desc.push(`${weekNames[from] || from}到${weekNames[to] || to}`);
      } else if (dayOfWeek.includes(',')) {
        desc.push(dayOfWeek.split(',').map(d => weekNames[parseInt(d)] || d).join('、'));
      } else {
        const w = parseInt(dayOfWeek);
        desc.push(weekNames[w] || dayOfWeek);
      }
    }

    // 秒
    if (hasSecond && parts[0] !== '*' && !parts[0].startsWith('*/')) {
      desc.unshift(`${parts[0]}秒`);
    }

    if (desc.length === 0) {
      if (hasSecond) return '每秒执行';
      return '每分钟执行';
    }

    // 拼接：如果没有时间前缀，加上"每天"
    const hasTimePrefix = everyMinute || minute.startsWith('*/') || hour.startsWith('*/');
    const hasDayOrWeek = !everyDay || !everyWeek || !everyMonth;
    if (!hasTimePrefix && everyDay && everyWeek && everyMonth) {
      desc.unshift('每天');
    }

    return desc.join('') + '执行';
  } catch {
    return '';
  }
};

const statusMap: Record<number, { color: string; text: string }> = {
  0: { color: 'default', text: '暂停' },
  1: { color: 'green', text: '运行中' },
};

const logStatusMap: Record<number, { color: string; text: string }> = {
  0: { color: 'green', text: '成功' },
  1: { color: 'red', text: '失败' },
};

const JobPage = () => {
  const [data, setData] = useState<JobItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<QueryJobParams>({ page: 1, pageSize: 10 });

  // 新增/编辑弹窗
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<JobItem | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [form] = Form.useForm<CreateJobParams>();
  const [cronDesc, setCronDesc] = useState('');

  // 日志抽屉
  const [logOpen, setLogOpen] = useState(false);
  const [logJobId, setLogJobId] = useState<string>('');
  const [logData, setLogData] = useState<JobLogItem[]>([]);
  const [logTotal, setLogTotal] = useState(0);
  const [logLoading, setLogLoading] = useState(false);
  const [logQuery, setLogQuery] = useState<QueryJobLogParams>({ page: 1, pageSize: 10 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getJobList(query);
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

  const fetchLogs = useCallback(async () => {
    if (!logJobId) return;
    setLogLoading(true);
    try {
      const res = await getJobLogList({ ...logQuery, jobId: logJobId });
      setLogData(res.list);
      setLogTotal(res.total);
    } catch {
      // ignore
    } finally {
      setLogLoading(false);
    }
  }, [logJobId, logQuery]);

  useEffect(() => {
    if (logOpen) fetchLogs();
  }, [logOpen, fetchLogs]);

  const handleSearch = () => setQuery((prev) => ({ ...prev, page: 1 }));
  const handleReset = () => setQuery({ page: 1, pageSize: 10 });

  const handleAdd = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ group: 'default', status: 0 });
    setCronDesc('');
    setModalOpen(true);
  };

  const handleEdit = (record: JobItem) => {
    setEditing(record);
    form.setFieldsValue({
      name: record.name ?? '',
      group: record.group ?? 'default',
      handler: record.handler ?? '',
      cron: record.cron ?? '',
      status: record.status ?? 0,
      remark: record.remark ?? '',
    });
    setCronDesc(translateCron(record.cron));
    setModalOpen(true);
  };

  const handleDelete = async (record: JobItem) => {
    try {
      await deleteJob(record.id);
      message.success('删除成功');
      fetchData();
    } catch {
      // ignore
    }
  };

  const handleStart = async (record: JobItem) => {
    try {
      await startJob(record.id);
      message.success('启动成功');
      fetchData();
    } catch {
      // ignore
    }
  };

  const handleStop = async (record: JobItem) => {
    try {
      await stopJob(record.id);
      message.success('停止成功');
      fetchData();
    } catch {
      // ignore
    }
  };

  const handleRunOnce = async (record: JobItem) => {
    try {
      await runJobOnce(record.id);
      message.success('执行成功');
    } catch {
      // ignore
    }
  };

  const handleViewLogs = (record: JobItem) => {
    setLogJobId(record.id);
    setLogQuery({ page: 1, pageSize: 10 });
    setLogOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setModalLoading(true);
      if (editing) {
        await updateJob(editing.id, values);
        message.success('更新成功');
      } else {
        await createJob(values);
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

  const columns: ColumnsType<JobItem> = [
    { title: '任务名称', dataIndex: 'name', width: 140, ellipsis: true },
    { title: '分组', dataIndex: 'group', width: 100 },
    { title: '处理器', dataIndex: 'handler', width: 160, ellipsis: true },
    {
      title: 'Cron 表达式',
      dataIndex: 'cron',
      width: 220,
      render: (v) => {
        const desc = translateCron(v);
        return (
          <div>
            <span>{v}</span>
            {desc && <div style={{ fontSize: 12, color: '#888' }}>({desc})</div>}
          </div>
        );
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
      render: (v) => (v ? new Date(v).toLocaleString() : '-'),
    },
    {
      title: '操作',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size={0}>
          {record.status === 0 ? (
            <Tooltip title="启动">
              <Button type="link" size="small" icon={<CaretRightOutlined />} onClick={() => handleStart(record)} />
            </Tooltip>
          ) : (
            <Tooltip title="停止">
              <Button type="link" size="small" icon={<PauseOutlined />} onClick={() => handleStop(record)} />
            </Tooltip>
          )}
          <Tooltip title="执行一次">
            <Button type="link" size="small" icon={<ThunderboltOutlined />} onClick={() => handleRunOnce(record)} />
          </Tooltip>
          <Tooltip title="日志">
            <Button type="link" size="small" icon={<FileTextOutlined />} onClick={() => handleViewLogs(record)} />
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

  const logColumns: ColumnsType<JobLogItem> = [
    { title: '处理器', dataIndex: 'handler', width: 160, ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (v) => {
        const s = logStatusMap[v ?? 0];
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: '执行结果',
      dataIndex: 'result',
      width: 200,
      ellipsis: true,
      render: (v) => v || '-',
    },
    {
      title: '错误信息',
      dataIndex: 'error',
      width: 200,
      ellipsis: true,
      render: (v) => v || '-',
    },
    {
      title: '开始时间',
      dataIndex: 'startedAt',
      width: 180,
      render: (v) => (v ? new Date(v).toLocaleString() : '-'),
    },
    {
      title: '结束时间',
      dataIndex: 'finishedAt',
      width: 180,
      render: (v) => (v ? new Date(v).toLocaleString() : '-'),
    },
  ];

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col>
            <Input
              placeholder="任务名称"
              value={query.name}
              onChange={(e) => setQuery((prev) => ({ ...prev, name: e.target.value || undefined }))}
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
                { label: '暂停', value: 0 },
                { label: '运行中', value: 1 },
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
            新增
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchData}>
            刷新
          </Button>
        </div>
        <Table<JobItem>
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 1100 }}
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
        title={editing ? '编辑定时任务' : '新增定时任务'}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={modalLoading}
        destroyOnHidden
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="任务名称" rules={[{ required: true, max: 50 }]}>
            <Input placeholder="请输入任务名称" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="group" label="任务分组" rules={[{ max: 50 }]}>
                <Input placeholder="default" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                <Select
                  options={[
                    { label: '暂停', value: 0 },
                    { label: '运行', value: 1 },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="handler" label="处理器" rules={[{ required: true, max: 200 }]}>
            <Input placeholder="处理器名称，如 DataBackupHandler" />
          </Form.Item>
          <Form.Item name="cron" label="Cron 表达式" rules={[{ required: true, max: 50 }]}>
            <Input
              placeholder="如 0 0 2 * * *"
              onChange={(e) => setCronDesc(translateCron(e.target.value))}
            />
          </Form.Item>
          {cronDesc && (
            <div style={{ marginTop: -16, marginBottom: 16, fontSize: 12, color: '#888', paddingLeft: 0 }}>
              ({cronDesc})
            </div>
          )}
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>

      {/* 执行日志抽屉 */}
      <Drawer
        title="执行日志"
        open={logOpen}
        onClose={() => setLogOpen(false)}
        width={900}
      >
        <Table<JobLogItem>
          rowKey="id"
          columns={logColumns}
          dataSource={logData}
          loading={logLoading}
          scroll={{ x: 1000 }}
          pagination={{
            current: logQuery.page,
            pageSize: logQuery.pageSize,
            total: logTotal,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (page, pageSize) => setLogQuery((prev) => ({ ...prev, page, pageSize })),
          }}
        />
      </Drawer>
    </div>
  );
};

export default JobPage;

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
  InputNumber,
  Tooltip,
  Select,
  Empty,
} from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { DictTypeItem, DictItem, CreateDictTypeParams, CreateDictItemParams } from '../../../types/api';
import {
  getDictTypeList,
  createDictType,
  updateDictType,
  deleteDictType,
  getDictItemList,
  createDictItem,
  updateDictItem,
  deleteDictItem,
} from '../../../api/dict';

const statusMap: Record<number, { color: string; text: string }> = {
  0: { color: 'green', text: '正常' },
  1: { color: 'red', text: '禁用' },
};

const colorOptions = [
  { label: 'default', value: '' },
  { label: 'blue', value: 'blue' },
  { label: 'green', value: 'green' },
  { label: 'red', value: 'red' },
  { label: 'orange', value: 'orange' },
  { label: 'purple', value: 'purple' },
  { label: 'gold', value: 'gold' },
  { label: 'cyan', value: 'cyan' },
  { label: 'magenta', value: 'magenta' },
];

// antd 预设色对应的可视化颜色（用于 Select 中的预览色块）
const colorPreviewMap: Record<string, string> = {
  blue: '#1677ff',
  green: '#52c41a',
  red: '#ff4d4f',
  orange: '#fa8c16',
  purple: '#722ed1',
  gold: '#faad14',
  cyan: '#13c2c2',
  magenta: '#eb2f96',
};

const renderColorOption = (value: string, label: string) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
    <span
      style={{
        display: 'inline-block',
        width: 14,
        height: 14,
        borderRadius: 3,
        background: colorPreviewMap[value] ?? 'transparent',
        border: value ? '1px solid rgba(0,0,0,0.1)' : '1px dashed #d9d9d9',
      }}
    />
    <span>{label}</span>
  </span>
);

const colorSelectOptions = colorOptions.map((opt) => ({
  value: opt.value,
  label: renderColorOption(opt.value, opt.label),
}));

const DictPage = () => {
  // 字典类型
  const [typeList, setTypeList] = useState<DictTypeItem[]>([]);
  const [typeTotal, setTypeTotal] = useState(0);
  const [typeLoading, setTypeLoading] = useState(false);
  const [typeQuery, setTypeQuery] = useState<{ page: number; pageSize: number; name?: string }>({ page: 1, pageSize: 10 });
  const [selectedType, setSelectedType] = useState<DictTypeItem | null>(null);

  // 字典项
  const [itemList, setItemList] = useState<DictItem[]>([]);
  const [itemLoading, setItemLoading] = useState(false);
  const [itemLabelFilter, setItemLabelFilter] = useState<string>('');

  // 字典类型弹窗
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [typeEditing, setTypeEditing] = useState<DictTypeItem | null>(null);
  const [typeModalLoading, setTypeModalLoading] = useState(false);
  const [typeForm] = Form.useForm<CreateDictTypeParams>();

  // 字典项弹窗
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [itemEditing, setItemEditing] = useState<DictItem | null>(null);
  const [itemModalLoading, setItemModalLoading] = useState(false);
  const [itemForm] = Form.useForm<CreateDictItemParams & { extraText?: string }>();

  const fetchTypes = useCallback(async () => {
    setTypeLoading(true);
    try {
      const res = await getDictTypeList(typeQuery);
      setTypeList(res.list);
      setTypeTotal(res.total);
      // 默认选中第一个
      if (res.list.length > 0 && !selectedType) {
        setSelectedType(res.list[0]);
      } else if (selectedType && !res.list.find((t) => t.id === selectedType.id)) {
        setSelectedType(res.list[0] ?? null);
      }
    } catch {
      // ignore
    } finally {
      setTypeLoading(false);
    }
  }, [typeQuery, selectedType]);

  const fetchItems = useCallback(async () => {
    if (!selectedType) {
      setItemList([]);
      return;
    }
    setItemLoading(true);
    try {
      const res = await getDictItemList({ dictTypeId: selectedType.id, label: itemLabelFilter || undefined });
      setItemList(res);
    } catch {
      // ignore
    } finally {
      setItemLoading(false);
    }
  }, [selectedType, itemLabelFilter]);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // ============ 字典类型操作 ============
  const handleAddType = () => {
    setTypeEditing(null);
    typeForm.resetFields();
    typeForm.setFieldsValue({ status: 0 });
    setTypeModalOpen(true);
  };

  const handleEditType = (record: DictTypeItem) => {
    setTypeEditing(record);
    typeForm.setFieldsValue({
      name: record.name ?? '',
      code: record.code ?? '',
      status: record.status ?? 0,
      remark: record.remark ?? '',
    });
    setTypeModalOpen(true);
  };

  const handleDeleteType = async (record: DictTypeItem) => {
    try {
      await deleteDictType(record.id);
      message.success('删除成功');
      if (selectedType?.id === record.id) setSelectedType(null);
      fetchTypes();
    } catch {
      // ignore
    }
  };

  const handleTypeOk = async () => {
    try {
      const values = await typeForm.validateFields();
      setTypeModalLoading(true);
      if (typeEditing) {
        await updateDictType(typeEditing.id, values);
        message.success('更新成功');
      } else {
        await createDictType(values);
        message.success('创建成功');
      }
      setTypeModalOpen(false);
      fetchTypes();
    } catch (err: any) {
      if (err?.errorFields) return;
    } finally {
      setTypeModalLoading(false);
    }
  };

  // ============ 字典项操作 ============
  const handleAddItem = () => {
    if (!selectedType) {
      message.warning('请先选择字典类型');
      return;
    }
    setItemEditing(null);
    itemForm.resetFields();
    itemForm.setFieldsValue({ dictTypeId: selectedType.id, status: 0, sort: 0 });
    setItemModalOpen(true);
  };

  const handleEditItem = (record: DictItem) => {
    setItemEditing(record);
    itemForm.setFieldsValue({
      dictTypeId: record.dictTypeId ?? selectedType?.id ?? '',
      label: record.label ?? '',
      value: record.value ?? '',
      sort: record.sort ?? 0,
      color: record.color ?? '',
      status: record.status ?? 0,
      remark: record.remark ?? '',
      extraText: record.extra ? JSON.stringify(record.extra, null, 2) : '',
    });
    setItemModalOpen(true);
  };

  const handleDeleteItem = async (record: DictItem) => {
    try {
      await deleteDictItem(record.id);
      message.success('删除成功');
      fetchItems();
    } catch {
      // ignore
    }
  };

  const handleItemOk = async () => {
    try {
      const values = await itemForm.validateFields();
      const { extraText, ...rest } = values;
      let extra: Record<string, unknown> | undefined;
      if (extraText && extraText.trim()) {
        try {
          extra = JSON.parse(extraText);
        } catch {
          message.error('extra 必须是合法 JSON');
          return;
        }
      }

      setItemModalLoading(true);
      const payload: CreateDictItemParams = { ...rest, extra };
      if (itemEditing) {
        await updateDictItem(itemEditing.id, payload);
        message.success('更新成功');
      } else {
        await createDictItem(payload);
        message.success('创建成功');
      }
      setItemModalOpen(false);
      fetchItems();
    } catch (err: any) {
      if (err?.errorFields) return;
    } finally {
      setItemModalLoading(false);
    }
  };

  const typeColumns: ColumnsType<DictTypeItem> = [
    { title: '名称', dataIndex: 'name', ellipsis: true },
    { title: '编码', dataIndex: 'code', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      width: 70,
      render: (v) => {
        const s = statusMap[v ?? 0];
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: '操作',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Space size={0}>
          <Tooltip title="编辑">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); handleEditType(record); }} />
          </Tooltip>
          <Popconfirm title="确认删除？" onConfirm={(e) => { e?.stopPropagation(); handleDeleteType(record); }} onCancel={(e) => e?.stopPropagation()}>
            <Tooltip title="删除">
              <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const itemColumns: ColumnsType<DictItem> = [
    { title: '标签', dataIndex: 'label', width: 140, render: (v, r) => r.color ? <Tag color={r.color}>{v}</Tag> : v },
    { title: '值', dataIndex: 'value', width: 120 },
    { title: '排序', dataIndex: 'sort', width: 80 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (v) => {
        const s = statusMap[v ?? 0];
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    { title: '备注', dataIndex: 'remark', ellipsis: true },
    {
      title: '操作',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Space size={0}>
          <Tooltip title="编辑">
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditItem(record)} />
          </Tooltip>
          <Popconfirm title="确认删除？" onConfirm={() => handleDeleteItem(record)}>
            <Tooltip title="删除">
              <Button type="link" size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Row gutter={16}>
      <Col span={10}>
        <Card title="字典类型" size="small">
          <Space style={{ marginBottom: 12 }} wrap>
            <Input
              placeholder="名称搜索"
              value={typeQuery.name}
              onChange={(e) => setTypeQuery((prev) => ({ ...prev, name: e.target.value || undefined, page: 1 }))}
              allowClear
              style={{ width: 160 }}
            />
            <Button icon={<ReloadOutlined />} onClick={fetchTypes}>刷新</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddType}>新增</Button>
          </Space>
          <Table<DictTypeItem>
            rowKey="id"
            size="small"
            columns={typeColumns}
            dataSource={typeList}
            loading={typeLoading}
            rowClassName={(r) => (selectedType?.id === r.id ? 'ant-table-row-selected' : '')}
            onRow={(record) => ({ onClick: () => setSelectedType(record), style: { cursor: 'pointer' } })}
            pagination={{
              current: typeQuery.page,
              pageSize: typeQuery.pageSize,
              total: typeTotal,
              showSizeChanger: true,
              showTotal: (t) => `共 ${t} 条`,
              onChange: (page, pageSize) => setTypeQuery((prev) => ({ ...prev, page, pageSize })),
            }}
          />
        </Card>
      </Col>
      <Col span={14}>
        <Card
          title={selectedType ? `字典项 - ${selectedType.name}（${selectedType.code}）` : '字典项'}
          size="small"
        >
          {selectedType ? (
            <>
              <Space style={{ marginBottom: 12 }} wrap>
                <Input
                  placeholder="标签搜索"
                  value={itemLabelFilter}
                  onChange={(e) => setItemLabelFilter(e.target.value)}
                  allowClear
                  style={{ width: 160 }}
                />
                <Button icon={<ReloadOutlined />} onClick={fetchItems}>刷新</Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddItem}>新增</Button>
              </Space>
              <Table<DictItem>
                rowKey="id"
                size="small"
                columns={itemColumns}
                dataSource={itemList}
                loading={itemLoading}
                pagination={false}
              />
            </>
          ) : (
            <Empty description="请选择字典类型" />
          )}
        </Card>
      </Col>

      {/* 字典类型弹窗 */}
      <Modal
        title={typeEditing ? '编辑字典类型' : '新增字典类型'}
        open={typeModalOpen}
        onOk={handleTypeOk}
        onCancel={() => setTypeModalOpen(false)}
        confirmLoading={typeModalLoading}
        destroyOnHidden
      >
        <Form form={typeForm} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true, max: 50 }]}>
            <Input placeholder="如：性别" />
          </Form.Item>
          <Form.Item name="code" label="编码" rules={[{ required: true, max: 50 }]}>
            <Input placeholder="如：sys_gender" />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select
              options={[
                { label: '正常', value: 0 },
                { label: '禁用', value: 1 },
              ]}
            />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} maxLength={500} showCount />
          </Form.Item>
        </Form>
      </Modal>

      {/* 字典项弹窗 */}
      <Modal
        title={itemEditing ? '编辑字典项' : '新增字典项'}
        open={itemModalOpen}
        onOk={handleItemOk}
        onCancel={() => setItemModalOpen(false)}
        confirmLoading={itemModalLoading}
        destroyOnHidden
        width={560}
      >
        <Form form={itemForm} layout="vertical">
          <Form.Item name="dictTypeId" hidden>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="label" label="标签" rules={[{ required: true, max: 100 }]}>
                <Input placeholder="如：男" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="value" label="值" rules={[{ required: true, max: 100 }]}>
                <Input placeholder="如：1" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="sort" label="排序">
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="color" label="颜色">
                <Select allowClear options={colorSelectOptions} placeholder="可选" optionLabelProp="label" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                <Select
                  options={[
                    { label: '正常', value: 0 },
                    { label: '禁用', value: 1 },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} maxLength={500} showCount />
          </Form.Item>
          <Form.Item name="extraText" label="扩展信息（JSON 格式）">
            <Input.TextArea rows={3} placeholder='例如：{"icon": "MaleOutlined"}' />
          </Form.Item>
        </Form>
      </Modal>
    </Row>
  );
};

export default DictPage;

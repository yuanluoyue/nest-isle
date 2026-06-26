/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Space, Spin, message, Modal, Input, Select } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, RobotOutlined } from '@ant-design/icons';
import Generator, { defaultSettings } from 'fr-generator';
import { getFormDetail, updateForm, aiGenerateSchema } from '../../../api/form';
import { getModelList } from '../../../api/ai-model';
import type { AiModelItem } from '../../../types/api';

// 自定义基础组件 - 添加单行文本组件，给组件加默认 placeholder
const customSettings = defaultSettings.map((group: any) => {
  if (group.title === '基础组件') {
    const widgets = group.widgets.map((w: any) => {
      // 给已有组件的 schema 加上默认 placeholder
      const newSchema = { ...w.schema };
      if (!newSchema.placeholder) {
        if (w.name === 'input') newSchema.placeholder = '请输入';
        if (w.name === 'textarea') newSchema.placeholder = '请输入';
        if (w.name === 'number') newSchema.placeholder = '请输入数字';
        if (w.name === 'select' || w.name === 'multiSelect') newSchema.placeholder = '请选择';
      }
      // 给已有组件的 setting 加上占位符配置（如果不存在）
      const newSetting = { ...w.setting };
      if (!newSetting.placeholder) {
        newSetting.placeholder = { title: '占位符', type: 'string' };
      }
      // 给选择类组件添加数据源配置
      if (['select', 'radio', 'multiSelect', 'checkboxes'].includes(w.name)) {
        newSetting.datasourceCode = {
          title: '数据源编码',
          type: 'string',
          description: '填写数据源编码，填写后将自动从数据源加载选项',
        };
      }
      return { ...w, schema: newSchema, setting: newSetting };
    });
    // 在最前面插入"单行文本"组件
    widgets.unshift({
      text: '单行文本',
      name: 'textInput',
      schema: {
        type: 'string',
        title: '单行文本',
        placeholder: '请输入',
      },
      setting: {
        placeholder: {
          title: '占位符',
          type: 'string',
        },
        maxLength: {
          title: '最大长度',
          type: 'number',
        },
        minLength: {
          title: '最小长度',
          type: 'number',
        },
        pattern: {
          title: '正则校验',
          type: 'string',
        },
      },
    });
    return { ...group, widgets, useCommon: true };
  }
  return group;
});

const FormDesignerPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [schema, setSchema] = useState<any>({ type: 'object', properties: {} });
  const genRef = useRef<any>(null);
  const loadedRef = useRef(false);

  // AI 生成
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiRequirement, setAiRequirement] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiModelId, setAiModelId] = useState<string | undefined>(undefined);
  const [modelOptions, setModelOptions] = useState<AiModelItem[]>([]);

  // 加载模型列表
  const loadModels = async () => {
    try {
      const res = await getModelList({ page: 1, pageSize: 100, enabled: 0 });
      setModelOptions(res.list);
      // 默认选第一个或默认模型
      const defaultModel = res.list.find((m) => m.isDefault === 1);
      setAiModelId(defaultModel?.id || res.list[0]?.id);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (id) {
      loadForm();
    }
  }, [id]);

  const loadForm = async () => {
    setLoading(true);
    try {
      const detail = await getFormDetail(id!);
      setFormName(detail.name);
      if (detail.schema) {
        setSchema(detail.schema);
        if (genRef.current) {
          genRef.current.setValue(detail.schema);
        }
      }
    } catch (e: any) {
      console.error('加载表单失败:', e);
      setError('加载表单失败: ' + (e?.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id || !genRef.current) return;
    setSaving(true);
    try {
      const currentSchema = genRef.current.getValue();
      await updateForm(id, { schema: currentSchema });
      message.success('保存成功');
    } catch (e: any) {
      message.error('保存失败: ' + (e?.message || '未知错误'));
    } finally {
      setSaving(false);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiRequirement.trim()) {
      message.warning('请输入需求描述');
      return;
    }
    setAiLoading(true);
    try {
      const res = await aiGenerateSchema(aiRequirement, aiModelId);
      if (res.error) {
        message.error(res.error);
        return;
      }
      if (res.schema) {
        // 应用生成的 schema 到设计器
        setSchema(res.schema);
        if (genRef.current) {
          genRef.current.setValue(res.schema);
        }
        message.success('AI 生成成功');
        setAiModalOpen(false);
        setAiRequirement('');
      } else {
        message.warning('AI 未生成有效的 Schema');
      }
    } catch (e: any) {
      message.error('AI 生成失败: ' + (e?.message || '未知错误'));
    } finally {
      setAiLoading(false);
    }
  };

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400, flexDirection: 'column', gap: 16 }}>
        <div style={{ color: '#ff4d4f' }}>{error}</div>
        <Button onClick={() => navigate('/form/design')}>返回列表</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ height: 'calc(100vh - 144px)', display: 'flex', flexDirection: 'column', margin: '-24px' }}>
      {/* 顶部工具栏 */}
      <div
        style={{
          height: 48,
          borderBottom: '1px solid #eee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          background: '#fff',
          flexShrink: 0,
          zIndex: 100,
        }}
      >
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/form/design')}>
            返回
          </Button>
          <span style={{ fontWeight: 500, fontSize: 16 }}>{formName}</span>
        </Space>
        <Space>
          <Button icon={<RobotOutlined />} onClick={() => { loadModels(); setAiModalOpen(true); }}>
            AI 生成
          </Button>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
            保存
          </Button>
        </Space>
      </div>

      {/* 设计器主体 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Generator
          ref={genRef}
          defaultValue={schema}
          settings={customSettings}
          onChange={() => {}}
          onSchemaChange={(newSchema) => {
            if (!loadedRef.current) {
              loadedRef.current = true;
              return;
            }
            setSchema(newSchema);
          }}
        />
      </div>

      {/* AI 生成弹窗 */}
      <Modal
        title="AI 生成表单"
        open={aiModalOpen}
        onCancel={() => {
          setAiModalOpen(false);
          setAiRequirement('');
        }}
        onOk={handleAiGenerate}
        confirmLoading={aiLoading}
        okText="生成"
        cancelText="取消"
        width={600}
        destroyOnClose
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 6, fontWeight: 500 }}>选择模型</div>
          <Select
            style={{ width: '100%' }}
            placeholder="请选择 AI 模型"
            value={aiModelId}
            onChange={(v) => setAiModelId(v)}
            disabled={aiLoading}
            options={modelOptions.map((m) => ({
              label: m.displayName ? `${m.displayName} (${m.name})` : m.name,
              value: m.id,
            }))}
            showSearch
            filterOption={(input, option) =>
              (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
            }
          />
        </div>
        <div style={{ marginBottom: 8, color: '#666', fontSize: 13 }}>
          描述你需要的表单，AI 将自动生成表单 Schema。例如："创建一个员工信息采集表，包含姓名、性别、年龄、部门、入职日期、联系电话"
        </div>
        <Input.TextArea
          rows={6}
          placeholder="请输入表单需求描述..."
          value={aiRequirement}
          onChange={(e) => setAiRequirement(e.target.value)}
          maxLength={1000}
          showCount
          disabled={aiLoading}
        />
      </Modal>
    </div>
  );
};

export default FormDesignerPage;

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Space, Spin, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import Generator, { defaultSettings } from 'fr-generator';
import { getFormDetail, updateForm } from '../../../api/form';

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
        <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
          保存
        </Button>
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
    </div>
  );
};

export default FormDesignerPage;

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Space, Spin, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import Generator from 'fr-generator';
import { getFormDetail, updateForm } from '../../../api/form';

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
        // fr-generator 加载后通过 defaultValue 设置，如果已加载则用 setValue
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
        <div style={{ color: '#ff4d4f' }}>{error}</div>
        <Button onClick={() => navigate('/form/design')}>返回列表</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
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
          hideId
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

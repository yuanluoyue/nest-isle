import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spin, message, Result } from 'antd';
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons';
import FormRender, { useForm } from 'form-render';
import { getFormDetail } from '../../../api/form';
import { createFormRecord } from '../../../api/form-record';

const FormFillPage = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const form = useForm();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formName, setFormName] = useState('');
  const [schema, setSchema] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (formId) {
      loadForm();
    }
  }, [formId]);

  const loadForm = async () => {
    setLoading(true);
    try {
      const detail = await getFormDetail(formId!);
      setFormName(detail.name);

      // 使用已发布的 schema，如果没有则使用草稿 schema
      const formSchema = detail.publishedSchema || detail.schema;

      if (!formSchema || !formSchema.properties || Object.keys(formSchema.properties).length === 0) {
        setError('表单尚未配置，无法填写');
        return;
      }

      setSchema(formSchema);
    } catch (e: any) {
      setError('加载表单失败: ' + (e?.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formId || !schema) return;

    setSubmitting(true);
    try {
      // 直接获取表单数据，form-render 内部会自动处理校验
      const formData = form.getValues();
      await createFormRecord({
        formId: formId!,
        data: formData,
      });
      message.success('提交成功');
      navigate('/form/record');
    } catch (e: any) {
      message.error('提交失败: ' + (e?.message || '未知错误'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Result status="error" title="无法填写表单" subTitle={error} />
      </div>
    );
  }

  if (!schema) {
    return (
      <div style={{ padding: 24 }}>
        <Result status="warning" title="表单内容为空" subTitle="请先设计表单并发布" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Card>
        {/* 顶部标题栏 */}
        <div
          style={{
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #eee',
            padding: '12px 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              返回
            </Button>
            <span style={{ fontSize: 18, fontWeight: 500 }}>{formName}</span>
          </div>
          <Button type="primary" icon={<SendOutlined />} loading={submitting} onClick={handleSubmit}>
            提交
          </Button>
        </div>

        {/* 表单渲染区域 */}
        <FormRender form={form} schema={schema} />
      </Card>
    </div>
  );
};

export default FormFillPage;
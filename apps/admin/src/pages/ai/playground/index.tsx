import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Select, Button, Input, Space, Spin, Empty, Typography } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import type { AiModelItem } from '../../../types/api';
import { getModelList } from '../../../api/ai-model';
import { streamChat } from '../../../api/ai-playground';

const { Text } = Typography;

interface Message {
  role: string;
  content: string;
}

const PlaygroundPage = () => {
  const [models, setModels] = useState<AiModelItem[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchModels = useCallback(async () => {
    try {
      const res = await getModelList({ enabled: 0, modelType: 'chat', page: 1, pageSize: 999 });
      setModels(res.list);
      if (res.list.length > 0 && !selectedModelId) {
        setSelectedModelId(res.list[0].id);
      }
    } catch {
      // ignore
    }
  }, [selectedModelId]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content || !selectedModelId || streaming) return;

    const userMessage: Message = { role: 'user', content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setStreaming(true);

    // 创建空的助手消息
    const assistantMessage: Message = { role: 'assistant', content: '' };
    setMessages([...newMessages, assistantMessage]);

    await streamChat(
      {
        modelId: selectedModelId,
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
      },
      (chunk) => {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === 'assistant') {
            updated[updated.length - 1] = { ...last, content: last.content + chunk };
          }
          return updated;
        });
      },
      () => {
        setStreaming(false);
      },
      (error) => {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last.role === 'assistant') {
            updated[updated.length - 1] = { ...last, content: last.content || `[错误] ${error}` };
          }
          return updated;
        });
        setStreaming(false);
      },
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)' }}>
      <Card
        size="small"
        style={{ marginBottom: 12 }}
        styles={{ body: { padding: '8px 16px' } }}
      >
        <Space>
          <Text strong>模型：</Text>
          <Select
            value={selectedModelId}
            onChange={setSelectedModelId}
            style={{ width: 240 }}
            placeholder="选择模型"
            options={models.map((m) => ({
              label: m.displayName || m.name,
              value: m.id,
            }))}
          />
        </Space>
      </Card>

      <Card
        style={{ flex: 1, overflow: 'hidden' }}
        styles={{ body: { height: '100%', display: 'flex', flexDirection: 'column', padding: 0 } }}
      >
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          {messages.length === 0 ? (
            <Empty description="选择模型并开始对话" style={{ marginTop: 80 }} />
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    maxWidth: '70%',
                    padding: '8px 14px',
                    borderRadius: 8,
                    background: msg.role === 'user' ? '#1677ff' : '#f0f0f0',
                    color: msg.role === 'user' ? '#fff' : '#000',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.content}
                  {msg.role === 'assistant' && streaming && idx === messages.length - 1 && !msg.content && (
                    <Spin size="small" />
                  )}
                </div>
              </div>
            ))
          )}
          {streaming && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && messages[messages.length - 1].content && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
              <div style={{ padding: '8px 14px' }}>
                <Spin size="small" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ padding: 12, borderTop: '1px solid #f0f0f0' }}>
          <Space.Compact style={{ width: '100%' }}>
            <Input.TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="输入消息..."
              autoSize={{ minRows: 1, maxRows: 4 }}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={streaming}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={streaming}
              disabled={!inputValue.trim() || !selectedModelId}
            >
              发送
            </Button>
          </Space.Compact>
        </div>
      </Card>
    </div>
  );
};

export default PlaygroundPage;

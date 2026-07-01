import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Modal,
  Input,
  List,
  Tag,
  Space,
  Typography,
  Empty,
  Spin,
} from 'antd';
import {
  SearchOutlined,
  DeleteOutlined,
  FormOutlined,
  UserOutlined,
  RobotOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { globalSearch, getSearchHistory, clearSearchHistory } from '../../api/search';
import type { SearchItem, SearchHistoryItem } from '../../types/api';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

const providerConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  menu: { label: '菜单', color: 'blue', icon: <MenuOutlined /> },
  user: { label: '用户', color: 'green', icon: <UserOutlined /> },
  form: { label: '表单', color: 'orange', icon: <FormOutlined /> },
  prompt: { label: '提示词', color: 'purple', icon: <RobotOutlined /> },
};

const SearchModal = ({ open, onClose }: SearchModalProps) => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<any>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      const data = await getSearchHistory();
      setHistory(data);
    } catch {
      // ignore
    }
  }, []);

  // 打开时聚焦输入框 + 加载历史
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      loadHistory();
    } else {
      setKeyword('');
      setResults([]);
    }
  }, [open, loadHistory]);

  // 防抖搜索
  const doSearch = useCallback((kw: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!kw.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await globalSearch(kw.trim());
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setKeyword(val);
    doSearch(val);
  };

  const handleHistoryClick = (kw: string) => {
    setKeyword(kw);
    doSearch(kw);
    inputRef.current?.focus();
  };

  const handleResultClick = (item: SearchItem) => {
    navigate(item.url);
    onClose();
  };

  const handleClearHistory = async () => {
    try {
      await clearSearchHistory();
      setHistory([]);
    } catch {
      // ignore
    }
  };

  const showHistory = !keyword.trim() && history.length > 0;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={640}
      styles={{ body: { padding: '12px 24px 24px' } }}
    >
      <Input
        ref={inputRef}
        prefix={<SearchOutlined style={{ color: '#999' }} />}
        suffix={
          keyword ? (
            <Typography.Text keyboard style={{ fontSize: 12 }}>
              ESC
            </Typography.Text>
          ) : null
        }
        placeholder="搜索菜单、用户、表单、提示词..."
        value={keyword}
        onChange={handleInputChange}
        size="large"
        allowClear
        style={{ marginBottom: 12 }}
      />

      {loading && (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <Spin />
        </div>
      )}

      {!loading && keyword.trim() && results.length === 0 && (
        <Empty description="未找到相关结果" style={{ margin: '24px 0' }} />
      )}

      {!loading && keyword.trim() && results.length > 0 && (
        <List
          dataSource={results}
          renderItem={(item) => {
            const config = providerConfig[item.provider];
            return (
              <List.Item
                style={{ cursor: 'pointer', padding: '8px 4px' }}
                onClick={() => handleResultClick(item)}
              >
                <List.Item.Meta
                  avatar={
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        background: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        color: '#666',
                      }}
                    >
                      {config?.icon ?? <SearchOutlined />}
                    </div>
                  }
                  title={
                    <Space>
                      <span>{item.title}</span>
                      <Tag color={config?.color ?? 'default'} style={{ fontSize: 11 }}>
                        {config?.label ?? item.provider}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Typography.Text
                      type="secondary"
                      ellipsis
                      style={{ fontSize: 12, maxWidth: 480 }}
                    >
                      {item.subtitle ?? item.description ?? item.url}
                    </Typography.Text>
                  }
                />
              </List.Item>
            );
          }}
        />
      )}

      {showHistory && (
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8,
            }}
          >
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              搜索历史
            </Typography.Text>
            <Typography.Link
              onClick={handleClearHistory}
              style={{ fontSize: 12 }}
            >
              <DeleteOutlined /> 清空
            </Typography.Link>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {history.map((item) => (
              <Tag
                key={item.id}
                style={{ cursor: 'pointer', fontSize: 13, padding: '2px 8px' }}
                onClick={() => handleHistoryClick(item.keyword)}
              >
                {item.keyword}
              </Tag>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default SearchModal;

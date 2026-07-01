import { useState, useMemo, useEffect } from 'react';
import {
  Layout,
  Avatar,
  Dropdown,
  Breadcrumb,
  theme,
  Badge,
  Popover,
  List,
  Typography,
  Space,
  Tag,
  Drawer,
  Button,
  Tooltip,
} from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SwapOutlined,
  BellOutlined,
  CheckOutlined,
  SunOutlined,
  MoonOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { useMenuStore } from '../stores/menu';
import { useSettingsStore } from '../stores/settings';
import { useNotificationStore } from '../stores/notification';
import { useProfile } from '../hooks/useProfile';
import { useNotificationSocket } from '../hooks/useNotificationSocket';
import { logout as logoutApi } from '../api/auth';
import { getNotificationDetail, markAsRead } from '../api/notification';
import SideMenu from '../components/SideMenu';
import AccountSwitcher from '../components/AccountSwitcher';
import SearchModal from '../components/SearchModal';
import type { MenuItem, NotificationReceiverItem } from '../types/api';

const { Header, Content } = Layout;

// 公共路径，所有登录用户都能访问
const PUBLIC_PATHS = ['/dashboard', '/profile', '/notification', '/403'];

function buildBreadcrumbItems(menus: MenuItem[], pathname: string) {
  const items: { title: string; path?: string }[] = [{ title: '首页', path: '/dashboard' }];

  const findPath = (menuList: MenuItem[], target: string, parents: MenuItem[]): boolean => {
    for (const menu of menuList) {
      if (menu.path === target) {
        parents.forEach((p) => items.push({ title: p.name || '', path: p.path || undefined }));
        items.push({ title: menu.name || '' });
        return true;
      }
      if (menu.children && findPath(menu.children, target, [...parents, menu])) {
        return true;
      }
    }
    return false;
  };

  findPath(menus, pathname, []);

  // 特殊页面不在菜单中
  if (items.length === 1 && pathname === '/profile') {
    items.push({ title: '个人信息' });
  }
  if (items.length === 1 && pathname === '/notification') {
    items.push({ title: '站内信' });
  }

  return items;
}

// 收集所有菜单 path（递归）
function collectMenuPaths(menus: MenuItem[]): string[] {
  const paths: string[] = [];
  const walk = (list: MenuItem[]) => {
    list.forEach((m) => {
      if (m.path) paths.push(m.path);
      if (m.children?.length) walk(m.children);
    });
  };
  walk(menus);
  return paths;
}

// 判断当前路径是否有权限访问
function hasMenuPermission(pathname: string, menus: MenuItem[]): boolean {
  if (PUBLIC_PATHS.some((p) => pathname === p)) return true;
  const menuPaths = collectMenuPaths(menus);
  return menuPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

const priorityMap: Record<number, { color: string; text: string }> = {
  0: { color: 'default', text: '普通' },
  1: { color: 'orange', text: '重要' },
  2: { color: 'red', text: '紧急' },
};

const typeMap: Record<string, { color: string; text: string }> = {
  announcement: { color: 'blue', text: '通知公告' },
  role_change: { color: 'purple', text: '角色变更' },
};

const AdminLayout = () => {
  const [accountSwitcherOpen, setAccountSwitcherOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token: themeToken } = theme.useToken();
  const { clearAuth } = useAuthStore();
  const { menus } = useMenuStore();
  const user = useProfile();
  const { menuCollapsed, toggleMenuCollapsed, themeMode, toggleThemeMode } = useSettingsStore();
  const { unreadCount, latestNotifications, fetchUnreadCount, setLatestNotifications } =
    useNotificationStore();

  // 通知浮层
  const [notificationPopoverOpen, setNotificationPopoverOpen] = useState(false);
  // 通知详情抽屉
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<NotificationReceiverItem | null>(null);

  // 初始化 Socket.IO 连接
  useNotificationSocket();

  // 初始加载未读数
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  const breadcrumbItems = useMemo(
    () => buildBreadcrumbItems(menus, location.pathname),
    [menus, location.pathname],
  );

  // 权限校验：菜单加载后，若无当前路径权限则重定向到 403 页面
  useEffect(() => {
    if (menus.length === 0) return;
    if (!hasMenuPermission(location.pathname, menus)) {
      navigate('/403', { replace: true });
    }
  }, [location.pathname, menus, navigate]);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // 忽略登出接口错误，仍然清理本地状态
    }
    clearAuth();
    useMenuStore.getState().clearMenus();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'switch-account',
      icon: <SwapOutlined />,
      label: '切换账号',
      onClick: () => setAccountSwitcherOpen(true),
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  // 点击通知项 → 关闭浮层 + 打开详情抽屉 + 标记已读
  const handleNotificationClick = async (item: NotificationReceiverItem) => {
    setNotificationPopoverOpen(false);
    try {
      const res = await getNotificationDetail(item.id);
      setDetail(res);
      setDetailOpen(true);
      // 如果未读则标记已读
      if (item.status === 'unread') {
        await markAsRead(item.id);
        fetchUnreadCount();
        // 更新浮层中该项的已读状态
        setLatestNotifications(
          latestNotifications.map((n) =>
            n.id === item.id ? { ...n, status: 'read' } : n,
          ),
        );
      }
    } catch {
      // 忽略
    }
  };

  // 勾选已读 → 仅标记已读，不弹详情
  const handleMarkRead = async (e: React.MouseEvent, item: NotificationReceiverItem) => {
    e.stopPropagation();
    try {
      await markAsRead(item.id);
      fetchUnreadCount();
      setLatestNotifications(
        latestNotifications.map((n) =>
          n.id === item.id ? { ...n, status: 'read' } : n,
        ),
      );
    } catch {
      // 忽略
    }
  };

  const notificationContent = (
    <div style={{ width: 360 }}>
      <List
        dataSource={latestNotifications}
        locale={{ emptyText: '暂无通知' }}
        renderItem={(item) => (
          <List.Item
            style={{ cursor: 'pointer', padding: '8px 0' }}
            onClick={() => handleNotificationClick(item)}
            actions={
              item.status === 'unread'
                ? [
                  <Button
                    key="read"
                    type="text"
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={(e) => handleMarkRead(e, item)}
                  />,
                ]
                : undefined
            }
          >
            <List.Item.Meta
              title={
                <Space>
                  <Tag color={item.status === 'unread' ? 'blue' : 'default'} style={{ fontSize: 11 }}>
                    {item.status === 'unread' ? '未读' : '已读'}
                  </Tag>
                  <span style={{ fontSize: 13, fontWeight: item.status === 'unread' ? 600 : 400 }}>
                    {item.notification?.title}
                  </span>
                  {item.notification?.priority === 1 && <Tag color="orange">重要</Tag>}
                  {item.notification?.priority === 2 && <Tag color="red">紧急</Tag>}
                </Space>
              }
              description={
                <Typography.Paragraph
                  ellipsis={{ rows: 2 }}
                  style={{ margin: 0, fontSize: 12, color: themeToken.colorTextSecondary }}
                >
                  {item.notification?.content}
                </Typography.Paragraph>
              }
            />
          </List.Item>
        )}
      />
      {latestNotifications.length > 0 && (
        <div style={{ textAlign: 'center', padding: '8px 0 0' }}>
          <Typography.Link onClick={() => navigate('/notification')}>
            查看全部通知
          </Typography.Link>
        </div>
      )}
    </div>
  );

  return (
    <Layout style={{ height: '100vh' }}>
      <SideMenu />
      <Layout>
        <Header
          style={{
            padding: '0 16px',
            background: themeToken.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{ cursor: 'pointer', fontSize: 18, marginRight: 12 }}
              onClick={toggleMenuCollapsed}
            >
              {menuCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>
            <Breadcrumb
              items={breadcrumbItems.map((item, index) => ({
                title: index === 0 ? (
                  <a onClick={() => navigate('/dashboard')}>{item.title}</a>
                ) : (
                  item.title
                ),
              }))}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Tooltip title="全局搜索">
              <div
                style={{ cursor: 'pointer', fontSize: 18 }}
                onClick={() => setSearchModalOpen(true)}
              >
                <SearchOutlined />
              </div>
            </Tooltip>
            <Popover
              content={notificationContent}
              title="通知"
              trigger="hover"
              placement="bottomRight"
              open={notificationPopoverOpen}
              onOpenChange={setNotificationPopoverOpen}
            >
              <Badge count={unreadCount} size="small" onClick={() => navigate('/notification')} style={{ cursor: 'pointer' }}>
                <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
              </Badge>
            </Popover>
            <Tooltip title={themeMode === 'dark' ? '切换亮色模式' : '切换暗色模式'}>
              <div style={{ cursor: 'pointer', fontSize: 18 }} onClick={toggleThemeMode}>
                {themeMode === 'dark' ? <SunOutlined /> : <MoonOutlined />}
              </div>
            </Tooltip>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar src={user?.avatar} icon={!user?.avatar ? <UserOutlined /> : undefined} />
                <span>{user?.nickname || user?.username || 'Admin'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: 16,
            padding: 24,
            background: themeToken.colorBgContainer,
            borderRadius: 8,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
      <AccountSwitcher open={accountSwitcherOpen} onClose={() => setAccountSwitcherOpen(false)} />

      {/* 通知详情抽屉 */}
      <Drawer
        title="通知详情"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width={480}
      >
        {detail?.notification && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Typography.Title level={4} style={{ marginTop: 0 }}>
              {detail.notification.title}
            </Typography.Title>
            <div>
              <Space size={16}>
                <Tag color={typeMap[detail.notification.type ?? 'announcement']?.color ?? 'default'}>
                  {typeMap[detail.notification.type ?? 'announcement']?.text ?? detail.notification.type}
                </Tag>
                <Tag color={priorityMap[detail.notification.priority ?? 0]?.color ?? 'default'}>
                  {priorityMap[detail.notification.priority ?? 0]?.text ?? '普通'}
                </Tag>
                <Tag color={detail.status === 'unread' ? 'blue' : 'default'}>
                  {detail.status === 'unread' ? '未读' : '已读'}
                </Tag>
              </Space>
            </div>
            <div style={{ color: '#999', fontSize: 13 }}>
              {detail.createdAt ? new Date(detail.createdAt).toLocaleString() : '-'}
              {detail.readAt && (
                <span style={{ marginLeft: 16 }}>
                  已读于 {new Date(detail.readAt).toLocaleString()}
                </span>
              )}
            </div>
            <div
              style={{
                background: themeToken.colorFillQuaternary,
                padding: 16,
                borderRadius: 8,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: 1.8,
              }}
            >
              {detail.notification.content}
            </div>
            {detail.notification.link && (
              <div>
                <Typography.Text type="secondary">相关链接：</Typography.Text>
                <Typography.Link
                  onClick={() => {
                    setDetailOpen(false);
                    window.location.hash = detail.notification?.link ?? '';
                  }}
                >
                  {detail.notification.link}
                </Typography.Link>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* 全局搜索弹窗 */}
      <SearchModal open={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </Layout>
  );
};

export default AdminLayout;

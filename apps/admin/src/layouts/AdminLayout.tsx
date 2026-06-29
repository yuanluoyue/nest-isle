import { useState, useMemo } from 'react';
import { Layout, Avatar, Dropdown, Breadcrumb, theme } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { useMenuStore } from '../stores/menu';
import { useProfile } from '../hooks/useProfile';
import { logout as logoutApi } from '../api/auth';
import SideMenu from '../components/SideMenu';
import AccountSwitcher from '../components/AccountSwitcher';
import type { MenuItem } from '../types/api';

const { Header, Content } = Layout;

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

  return items;
}

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [accountSwitcherOpen, setAccountSwitcherOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token: themeToken } = theme.useToken();
  const { clearAuth } = useAuthStore();
  const { menus } = useMenuStore();
  const user = useProfile();

  const breadcrumbItems = useMemo(
    () => buildBreadcrumbItems(menus, location.pathname),
    [menus, location.pathname],
  );

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

  return (
    <Layout style={{ height: '100vh' }}>
      <SideMenu collapsed={collapsed} />
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
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
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
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar src={user?.avatar} icon={!user?.avatar ? <UserOutlined /> : undefined} />
              <span>{user?.nickname || user?.username || 'Admin'}</span>
            </div>
          </Dropdown>
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
    </Layout>
  );
};

export default AdminLayout;

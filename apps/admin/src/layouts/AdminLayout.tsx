import { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, theme } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  MonitorOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { useProfile } from '../hooks/useProfile';

const { Header, Sider, Content } = Layout;

const menuConfig: MenuProps['items'] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '仪表盘',
  },
  {
    key: '/system',
    icon: <SettingOutlined />,
    label: '系统管理',
    children: [
      {
        key: '/system/user',
        icon: <UserOutlined />,
        label: '用户管理',
      },
    ],
  },
  {
    key: '/monitor',
    icon: <MonitorOutlined />,
    label: '系统监控',
    children: [
      {
        key: '/monitor/operate-log',
        icon: <FileTextOutlined />,
        label: '操作日志',
      },
    ],
  },
];

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token: themeToken } = theme.useToken();
  const { clearAuth } = useAuthStore();
  const user = useProfile();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  // 计算选中和展开的菜单 key
  const selectedKeys = [location.pathname];
  const openKeys = collapsed
    ? []
    : location.pathname.split('/').filter(Boolean).reduce<string[]>((acc, _, i, arr) => {
        const path = '/' + arr.slice(0, i + 1).join('/');
        acc.push(path);
        return acc;
      }, []).slice(0, -1);

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} style={{ overflow: 'auto', height: '100vh', position: 'sticky', top: 0 }}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255,255,255,0.2)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: collapsed ? 14 : 16 }}>
          {collapsed ? 'NI' : 'Nest Isle'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={openKeys}
          items={menuConfig}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 16px', background: themeToken.colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ cursor: 'pointer', fontSize: 18 }} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar src={user?.avatar} icon={!user?.avatar ? <UserOutlined /> : undefined} />
              <span>{user?.nickname || user?.username || 'Admin'}</span>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ margin: 16, padding: 24, background: themeToken.colorBgContainer, borderRadius: 8, overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;

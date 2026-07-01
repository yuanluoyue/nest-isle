import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMenuStore } from '../../stores/menu';
import { useSettingsStore } from '../../stores/settings';
import { buildMenuItems } from './menu';

const { Sider } = Layout;

const SideMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { menus } = useMenuStore();
  const collapsed = useSettingsStore((s) => s.menuCollapsed);
  const themeMode = useSettingsStore((s) => s.themeMode);

  const selectedKeys = [location.pathname];
  const openKeys = collapsed
    ? []
    : location.pathname
        .split('/')
        .filter(Boolean)
        .reduce<string[]>((acc, _, i, arr) => {
          const path = '/' + arr.slice(0, i + 1).join('/');
          acc.push(path);
          return acc;
        }, [])
        .slice(0, -1);

  const menuItems = buildMenuItems(menus);
  const isDark = themeMode === 'dark';

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      theme={isDark ? 'dark' : 'light'}
      style={{
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Logo - 固定不滚动 */}
      <div
        style={{
          height: 32,
          margin: 16,
          background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isDark ? '#fff' : '#1F2925',
          fontWeight: 'bold',
          fontSize: collapsed ? 14 : 16,
          flexShrink: 0,
        }}
      >
        {collapsed
          ? (import.meta.env.VITE_APP_NAME || 'Admin').split(' ').map(w => w[0]).join('')
          : import.meta.env.VITE_APP_NAME || 'Admin'
        }
      </div>
      {/* 菜单 - 独立滚动区域，logo 区域高 32+margin 16*2=64px */}
      <div
        className="side-menu-scroll"
        style={{ height: 'calc(100vh - 64px)', overflowY: 'auto', overflowX: 'hidden' }}
      >
        <Menu
          theme={isDark ? 'dark' : 'light'}
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={openKeys}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </div>
    </Sider>
  );
};

export default SideMenu;

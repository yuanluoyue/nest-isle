import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMenuStore } from '../../stores/menu';
import { buildMenuItems } from './menu';

const { Sider } = Layout;

interface SideMenuProps {
  collapsed: boolean;
}

const SideMenu: React.FC<SideMenuProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { menus } = useMenuStore();

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

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      style={{ overflow: 'auto', height: '100vh', position: 'sticky', top: 0 }}
    >
      <div
        style={{
          height: 32,
          margin: 16,
          background: 'rgba(255,255,255,0.2)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: collapsed ? 14 : 16,
        }}
      >
        {collapsed ? 'NI' : 'Nest Isle'}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        defaultOpenKeys={openKeys}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
      />
    </Sider>
  );
};

export default SideMenu;

import React from 'react';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  TeamOutlined,
  MenuOutlined,
  MonitorOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  FormOutlined,
  DatabaseOutlined,
  CloudOutlined,
  ProfileOutlined,
  TableOutlined,
  ControlOutlined,
  SafetyOutlined,
  AuditOutlined,
  ApiOutlined,
  ToolOutlined,
  HomeOutlined,
  BellOutlined,
  CalendarOutlined,
  FlagOutlined,
  GlobalOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  PictureOutlined,
  SearchOutlined,
  StarOutlined,
  TagOutlined,
  ThunderboltOutlined,
  UnorderedListOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { MenuItem } from '../../types/api';

const iconMap: Record<string, React.ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  UserOutlined: <UserOutlined />,
  SettingOutlined: <SettingOutlined />,
  TeamOutlined: <TeamOutlined />,
  MenuOutlined: <MenuOutlined />,
  MonitorOutlined: <MonitorOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
  ShoppingOutlined: <ShoppingOutlined />,
  BarChartOutlined: <BarChartOutlined />,
  FormOutlined: <FormOutlined />,
  DatabaseOutlined: <DatabaseOutlined />,
  CloudOutlined: <CloudOutlined />,
  ProfileOutlined: <ProfileOutlined />,
  TableOutlined: <TableOutlined />,
  ControlOutlined: <ControlOutlined />,
  SafetyOutlined: <SafetyOutlined />,
  AuditOutlined: <AuditOutlined />,
  ApiOutlined: <ApiOutlined />,
  ToolOutlined: <ToolOutlined />,
  HomeOutlined: <HomeOutlined />,
  BellOutlined: <BellOutlined />,
  CalendarOutlined: <CalendarOutlined />,
  FlagOutlined: <FlagOutlined />,
  GlobalOutlined: <GlobalOutlined />,
  LockOutlined: <LockOutlined />,
  MailOutlined: <MailOutlined />,
  PhoneOutlined: <PhoneOutlined />,
  PictureOutlined: <PictureOutlined />,
  SearchOutlined: <SearchOutlined />,
  StarOutlined: <StarOutlined />,
  TagOutlined: <TagOutlined />,
  ThunderboltOutlined: <ThunderboltOutlined />,
  UnorderedListOutlined: <UnorderedListOutlined />,
  WarningOutlined: <WarningOutlined />,
};

export const getIcon = (iconName: string | null): React.ReactNode | undefined => {
  if (!iconName) return undefined;
  return iconMap[iconName];
};

export const buildMenuItems = (menus: MenuItem[]): MenuProps['items'] => {
  return menus
    .filter((m) => m.visible === 0 && m.type !== 2)
    .map((m) => {
      const item: any = {
        key: m.path || m.id,
        icon: getIcon(m.icon),
        label: m.name,
      };

      const childItems = m.children ? buildMenuItems(m.children) : [];
      if (childItems && childItems.length > 0) {
        item.children = childItems;
      }

      return item;
    });
};

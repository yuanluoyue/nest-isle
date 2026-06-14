import React, { Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { AuthGuard } from '../components/AuthGuard';
import PageLoading from '../components/PageLoading';

const LazyLoad = (Component: React.LazyExoticComponent<React.ComponentType>) => (
  <Suspense fallback={<PageLoading />}>
    <Component />
  </Suspense>
);

// Layout
const AdminLayout = React.lazy(() => import('../layouts/AdminLayout'));

// Pages
const LoginPage = React.lazy(() => import('../pages/login'));
const DashboardPage = React.lazy(() => import('../pages/dashboard'));
const UserPage = React.lazy(() => import('../pages/system/user'));
const OperateLogPage = React.lazy(() => import('../pages/monitor/operate-log'));

export interface RouteConfig {
  path: string;
  element?: React.ReactNode;
  children?: RouteConfig[];
  meta?: {
    title?: string;
    icon?: string;
    auth?: boolean;
    hidden?: boolean;
  };
}

/**
 * 静态路由配置
 * 后期做动态路由时，可在此基础合并后端返回的路由
 */
export const staticRoutes: RouteConfig[] = [
  {
    path: '/login',
    element: LazyLoad(LoginPage),
    meta: { title: '登录', hidden: true },
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <Suspense fallback={<PageLoading />}>
          <AdminLayout />
        </Suspense>
      </AuthGuard>
    ),
    meta: { auth: true },
    children: [
      { path: '', element: <Navigate to="/dashboard" replace /> },
      {
        path: 'dashboard',
        element: LazyLoad(DashboardPage),
        meta: { title: '仪表盘', icon: 'DashboardOutlined' },
      },
      {
        path: 'system',
        meta: { title: '系统管理', icon: 'SettingOutlined' },
        children: [
          {
            path: 'user',
            element: LazyLoad(UserPage),
            meta: { title: '用户管理', icon: 'UserOutlined' },
          },
        ],
      },
      {
        path: 'monitor',
        meta: { title: '系统监控', icon: 'MonitorOutlined' },
        children: [
          {
            path: 'operate-log',
            element: LazyLoad(OperateLogPage),
            meta: { title: '操作日志', icon: 'FileTextOutlined' },
          },
        ],
      },
    ],
  },
];

/**
 * 将 RouteConfig 转换为 react-router-dom 的 RouteObject[]
 */
function normalizeRoutes(routes: RouteConfig[]): RouteObject[] {
  return routes.map(({ path, element, children }) => {
    const route: RouteObject = { path };
    if (element) route.element = element;
    if (children) route.children = normalizeRoutes(children);
    return route;
  });
}

export const routeObjects: RouteObject[] = normalizeRoutes(staticRoutes);

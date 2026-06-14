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
const RolePage = React.lazy(() => import('../pages/system/role'));
const MenuPage = React.lazy(() => import('../pages/system/menu'));
const DictPage = React.lazy(() => import('../pages/system/dict'));
const NoticePage = React.lazy(() => import('../pages/system/notice'));
const OperateLogPage = React.lazy(() => import('../pages/monitor/operate-log'));
const LoginLogPage = React.lazy(() => import('../pages/monitor/login-log'));
const JobPage = React.lazy(() => import('../pages/monitor/job'));
const ProfilePage = React.lazy(() => import('../pages/profile'));
const NotFoundPage = React.lazy(() => import('../pages/404'));

export const routeObjects: RouteObject[] = [
  {
    path: '/login',
    element: LazyLoad(LoginPage),
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
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: LazyLoad(DashboardPage) },
      { path: 'profile', element: LazyLoad(ProfilePage) },
      {
        path: 'system',
        children: [
          { path: 'user', element: LazyLoad(UserPage) },
          { path: 'role', element: LazyLoad(RolePage) },
          { path: 'menu', element: LazyLoad(MenuPage) },
          { path: 'dict', element: LazyLoad(DictPage) },
          { path: 'notice', element: LazyLoad(NoticePage) },
        ],
      },
      {
        path: 'monitor',
        children: [
          { path: 'operate-log', element: LazyLoad(OperateLogPage) },
          { path: 'login-log', element: LazyLoad(LoginLogPage) },
          { path: 'job', element: LazyLoad(JobPage) },
        ],
      },
      { path: '*', element: LazyLoad(NotFoundPage) },
    ],
  },
];

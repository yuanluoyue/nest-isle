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
const ConfigPage = React.lazy(() => import('../pages/system/config'));
const OperateLogPage = React.lazy(() => import('../pages/monitor/operate-log'));
const LoginLogPage = React.lazy(() => import('../pages/monitor/login-log'));
const JobPage = React.lazy(() => import('../pages/monitor/job'));
const SessionPage = React.lazy(() => import('../pages/monitor/session'));
const AiProviderPage = React.lazy(() => import('../pages/ai/provider'));
const AiModelPage = React.lazy(() => import('../pages/ai/model'));
const AiPlaygroundPage = React.lazy(() => import('../pages/ai/playground'));
const AiPromptPage = React.lazy(() => import('../pages/ai/prompt'));
const AiLogPage = React.lazy(() => import('../pages/ai/log'));
const FormDesignPage = React.lazy(() => import('../pages/form/design'));
const FormDesignerPage = React.lazy(() => import('../pages/form/design/designer'));
const FormRecordPage = React.lazy(() => import('../pages/form/record'));
const FormDatasourcePage = React.lazy(() => import('../pages/form/datasource'));
const FormFillPage = React.lazy(() => import('../pages/form/fill'));
const ProfilePage = React.lazy(() => import('../pages/profile'));
const NotificationPage = React.lazy(() => import('../pages/notification'));
const ForbiddenPage = React.lazy(() => import('../pages/403'));
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
      { path: 'notification', element: LazyLoad(NotificationPage) },
      { path: '403', element: LazyLoad(ForbiddenPage) },
      {
        path: 'system',
        children: [
          { path: 'user', element: LazyLoad(UserPage) },
          { path: 'role', element: LazyLoad(RolePage) },
          { path: 'menu', element: LazyLoad(MenuPage) },
          { path: 'dict', element: LazyLoad(DictPage) },
          { path: 'notice', element: LazyLoad(NoticePage) },
          { path: 'config', element: LazyLoad(ConfigPage) },
        ],
      },
      {
        path: 'monitor',
        children: [
          { path: 'operate-log', element: LazyLoad(OperateLogPage) },
          { path: 'login-log', element: LazyLoad(LoginLogPage) },
          { path: 'job', element: LazyLoad(JobPage) },
          { path: 'session', element: LazyLoad(SessionPage) },
        ],
      },
      {
        path: 'ai',
        children: [
          { path: 'provider', element: LazyLoad(AiProviderPage) },
          { path: 'model', element: LazyLoad(AiModelPage) },
          { path: 'playground', element: LazyLoad(AiPlaygroundPage) },
          { path: 'prompt', element: LazyLoad(AiPromptPage) },
          { path: 'log', element: LazyLoad(AiLogPage) },
        ],
      },
      {
        path: 'form',
        children: [
          { path: 'design', element: LazyLoad(FormDesignPage) },
          { path: 'design/:id', element: LazyLoad(FormDesignerPage) },
          { path: 'fill/:formId', element: LazyLoad(FormFillPage) },
          { path: 'record', element: LazyLoad(FormRecordPage) },
          { path: 'datasource', element: LazyLoad(FormDatasourcePage) },
        ],
      },
      { path: '*', element: LazyLoad(NotFoundPage) },
    ],
  },
];

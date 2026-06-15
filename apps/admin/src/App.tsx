import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { routeObjects } from './router/routes';
import { ErrorBoundary } from './components/ErrorBoundary';

const router = createBrowserRouter(routeObjects);

function App() {
  return (
    <ErrorBoundary>
      <ConfigProvider locale={zhCN}>
        <RouterProvider router={router} />
      </ConfigProvider>
    </ErrorBoundary>
  );
}

export default App;

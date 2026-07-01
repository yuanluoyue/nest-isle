import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { routeObjects } from './router/routes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useSettingsStore } from './stores/settings';

const router = createBrowserRouter(routeObjects);

const lightTheme = {
  token: {
    colorPrimary: '#2E7D52',
    colorInfo: '#64A6BD',
    colorSuccess: '#3D9970',
    colorWarning: '#E6B86C',
    colorError: '#D15B47',
    colorTextBase: '#1F2925',
    sizeStep: 4,
    sizeUnit: 3,
    borderRadius: 4,
    wireframe: false,
    colorBgLayout: '#F8FBF9',
    colorBorder: '#E2EBE7',
  },
  algorithm: theme.compactAlgorithm,
};

const darkTheme = {
  token: {
    colorPrimary: '#2E7D52',
    colorInfo: '#64A6BD',
    colorSuccess: '#3D9970',
    colorWarning: '#E6B86C',
    colorError: '#D15B47',
    sizeStep: 4,
    sizeUnit: 3,
    borderRadius: 4,
    wireframe: false,
  },
  algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
};

function App() {
  const themeMode = useSettingsStore((s) => s.themeMode);

  return (
    <ErrorBoundary>
      <ConfigProvider
        locale={zhCN}
        theme={themeMode === 'dark' ? darkTheme : lightTheme}
      >
        <RouterProvider router={router} />
      </ConfigProvider>
    </ErrorBoundary>
  );
}

export default App;

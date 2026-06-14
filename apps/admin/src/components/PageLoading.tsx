import React from 'react';
import { Spin } from 'antd';

const PageLoading: React.FC = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      minHeight: 200,
    }}
  >
    <Spin size="large" tip="加载中..." />
  </div>
);

export default PageLoading;

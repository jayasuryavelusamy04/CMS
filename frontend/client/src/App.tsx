import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import { store } from './store';
import { AppRoutes } from './routes/AppRoutes';

// Customize Ant Design theme
const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 4,
  },
};

const App = () => {
  return (
    <Provider store={store}>
      <ConfigProvider theme={theme}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ConfigProvider>
    </Provider>
  );
};

export default App;

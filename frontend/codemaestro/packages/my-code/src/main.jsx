import { React, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import axios from 'axios'
// Redux 관련
import { Provider } from 'react-redux';
import { PersistGate } from "redux-persist/integration/react";
import store, {persistor} from './reducer/store.js'
// 콘텍스트 api
import { NotificationsProvider } from './context/NotificationContext';

axios.defaults.withCredentials = true
// react-toastify 알림 표시용 라이브러리
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


createRoot(document.getElementById('root')).render(

// provider, persistGate: 스토어 적용용
// Browserrouter 라우팅 적용용

<Provider store={store}>
<PersistGate loading={<div>Loading...</div>} persistor={persistor}>
  <BrowserRouter>

    <NotificationsProvider>
      <App />
      <ToastContainer position="bottom-right" autoClose={5000} />
      </NotificationsProvider>
  </BrowserRouter>
  </PersistGate>
</Provider>
,
)

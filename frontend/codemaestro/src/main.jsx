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

createRoot(document.getElementById('root')).render(

// provider, persistGate: 스토어 적용용
// Browserrouter 라우팅 적용용

<Provider store={store}>
<PersistGate loading={<div>Loading...</div>} persistor={persistor}>
  <BrowserRouter>

    <NotificationsProvider>
      <App />
      </NotificationsProvider>
  </BrowserRouter>
  </PersistGate>
</Provider>
,
)

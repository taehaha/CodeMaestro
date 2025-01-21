import { React, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
// Redux 관련
import { Provider } from 'react-redux';
import { PersistGate } from "redux-persist/integration/react";
import store, {persistor} from './reducer/store.js'

createRoot(document.getElementById('root')).render(

// provider, persistGate: 스토어 적용용
// Browserrouter 라우팅 적용용

<Provider store={store}>
<PersistGate loading={<div>Loading...</div>} persistor={persistor}>
  <BrowserRouter>
    <StrictMode>
      <App />
    </StrictMode>
  </BrowserRouter>
  </PersistGate>
</Provider>
,
)

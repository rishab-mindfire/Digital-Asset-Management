import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthProvider';
import { ToastContainer } from 'react-toastify';
import ErrorBoundary from './utils/ErrorBoundary';
import ErrorPage from './components/common/ErrorPage';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary fallback={<ErrorPage />}>
      <AuthProvider>
        <App />
        <ToastContainer />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);

import { lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './auth/ProtectedRoute';
import { useAuth } from './hooks/useAuth';
import type { JSX } from 'react';
import Signup from './pages/login/SignUp';
import DashBord from './pages/dashBoard/DashBord';

// React.lazy component
const Login = lazy(() => import('./pages/login/LoginPage'));
const PageNotFound = lazy(() => import('./pages/errorPage/PageNotFound'));
const Layout = lazy(() => import('./components/layout/Layout'));

const RootRedirect = (): JSX.Element => {
  const { state } = useAuth();
  return <Navigate to={state.isAuthenticated ? '/dashboard' : '/login'} replace />;
};

function App() {
  return (
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <DashBord />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

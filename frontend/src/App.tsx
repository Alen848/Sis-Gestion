import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './controllers/AuthController';
import Login from './pages/Login';
import Registro from './pages/Registro';
import AdminDashboard from './pages/AdminDashboard';
import ClienteDashboard from './pages/ClienteDashboard';

function PrivateRoute({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { usuario, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!usuario) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && usuario.rol !== 'admin') {
    return <Navigate to="/cliente" />;
  }

  if (!requireAdmin && usuario.rol === 'admin') {
    return <Navigate to="/admin" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { usuario } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={!usuario ? <Login /> : <Navigate to={usuario.rol === 'admin' ? '/admin' : '/cliente'} />} />
      <Route path="/registro" element={!usuario ? <Registro /> : <Navigate to="/cliente" />} />
      <Route path="/admin/*" element={<PrivateRoute requireAdmin><AdminDashboard /></PrivateRoute>} />
      <Route path="/cliente/*" element={<PrivateRoute><ClienteDashboard /></PrivateRoute>} />
      <Route path="/" element={<Navigate to={usuario ? (usuario.rol === 'admin' ? '/admin' : '/cliente') : '/login'} />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;







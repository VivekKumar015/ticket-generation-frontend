import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import UserDashboard from './pages/UserDashboard';
import Tickets from './pages/Tickets';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';
import Profile from './pages/Profile';
import Configuration from './pages/Configuration';
import Reports from './pages/Reports';

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'ROLE_SUPER_ADMIN') return <Navigate to="/admin" replace />;
  if (user?.role === 'ROLE_SUPPORT_EMPLOYEE') return <Navigate to="/employee" replace />;
  return <Navigate to="/user" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right"
          toastOptions={{ style: { background: '#1c2128', color: '#e6edf3', border: '1px solid #30363d' }}} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={
            <ProtectedRoute><Layout><DashboardRedirect /></Layout></ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute><Layout><DashboardRedirect /></Layout></ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN']}>
              <Layout><AdminDashboard /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/employee" element={
            <ProtectedRoute allowedRoles={['ROLE_SUPPORT_EMPLOYEE', 'ROLE_SUPER_ADMIN']}>
              <Layout><EmployeeDashboard /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/user" element={
            <ProtectedRoute><Layout><UserDashboard /></Layout></ProtectedRoute>
          } />

          <Route path="/tickets" element={
            <ProtectedRoute><Layout><Tickets /></Layout></ProtectedRoute>
          } />

          <Route path="/tickets/new" element={
            <ProtectedRoute><Layout><CreateTicket /></Layout></ProtectedRoute>
          } />

          <Route path="/tickets/:id" element={
            <ProtectedRoute><Layout><TicketDetail /></Layout></ProtectedRoute>
          } />

          <Route path="/configuration" element={
            <ProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN']}>
              <Layout><Configuration /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute allowedRoles={['ROLE_SUPER_ADMIN']}>
              <Layout><Reports /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
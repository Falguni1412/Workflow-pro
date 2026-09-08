import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AppLayout from './components/layout/AppLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Splash from './pages/Splash';

// Main Pages
import Dashboard from './pages/Dashboard';
import RequestsList from './pages/RequestsList';
import SubmitRequest from './pages/SubmitRequest';
import RequestDetail from './pages/RequestDetail';
import ApprovalQueue from './pages/ApprovalQueue';
import WorkflowBuilder from './pages/admin/WorkflowBuilder';

// A simple PrivateRoute wrapper
const PrivateRoute = ({ children, roles }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/app/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <Routes>
      {/* Splash — first-visit only, shows once per browser then routes onward */}
      <Route path="/" element={<Splash />} />

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route path="/app" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Requests */}
        <Route path="requests" element={<RequestsList />} />
        <Route path="requests/:id" element={<RequestDetail />} />
        <Route path="submit/:type" element={<SubmitRequestWrapper />} />

        {/* Approvals */}
        <Route path="approvals" element={
          <PrivateRoute roles={['Manager', 'HR', 'Finance', 'Admin', 'Super Admin']}>
            <ApprovalQueue />
          </PrivateRoute>
        } />
        
        {/* Admin */}
        <Route path="admin/workflows" element={
          <PrivateRoute roles={['Admin', 'Super Admin']}>
            <WorkflowBuilder />
          </PrivateRoute>
        } />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Helper to extract type parameter and match our predefined configs
import { useParams } from 'react-router-dom';
function SubmitRequestWrapper() {
  const { type } = useParams();
  const typeMap = {
    leave: 'Leave', expense: 'Expense', travel: 'Travel',
    purchase: 'Purchase', asset: 'Asset', document: 'Document'
  };
  return <SubmitRequest requestType={typeMap[type?.toLowerCase()] || 'Leave'} />;
}

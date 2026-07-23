import { Navigate } from 'react-router-dom';

const decodeAdminToken = (token) => {
  try {
    const payloadBase64 = token.split('.')[1];
    return payloadBase64 ? JSON.parse(atob(payloadBase64)) : null;
  } catch {
    return null;
  }
};

const AdminRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');

  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  const decoded = decodeAdminToken(adminToken);
  if (decoded && decoded.role !== 'admin' && !decoded.isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminRoute;

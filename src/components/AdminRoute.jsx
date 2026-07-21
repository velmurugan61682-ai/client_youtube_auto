import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');

  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  try {
    const payloadBase64 = adminToken.split('.')[1];
    if (payloadBase64) {
      const decoded = JSON.parse(atob(payloadBase64));
      // Allow if token has role admin or isAdmin true
      if (decoded.role !== 'admin' && !decoded.isAdmin) {
        return <Navigate to="/admin/login" replace />;
      }
    }
  } catch (e) {
    // If token decoding fails, allow pass-through if adminToken is present, backend will enforce 403
  }

  return children;
};

export default AdminRoute;

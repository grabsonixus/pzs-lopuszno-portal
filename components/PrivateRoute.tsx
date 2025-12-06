import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { pb } from '../services/pocketbase';

const PrivateRoute: React.FC = () => {
  const isAdminLoggedIn = pb.authStore.isValid && pb.authStore.model?.id !== '';

  return isAdminLoggedIn ? <Outlet /> : <Navigate to="/admin" />;
};

export default PrivateRoute;

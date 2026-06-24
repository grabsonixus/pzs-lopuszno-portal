import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { pb } from '../services/pocketbase';

const PrivateRoute: React.FC = () => {
  const model = pb.authStore.model;
  const isAdminLoggedIn =
    pb.authStore.isValid &&
    (model?.collectionName === "_admins" || model?.collectionName === "_superusers");

  return isAdminLoggedIn ? <Outlet /> : <Navigate to="/admin" />;
};

export default PrivateRoute;

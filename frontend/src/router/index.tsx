import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppNavigation } from '../modules/amic-invisibles/components/AppNavigation';
import { GiftAssignedView } from '../modules/amic-invisibles/views/GiftAssignedView';
import { WishlistView } from '../modules/amic-invisibles/views/WishlistView';
import { AdminDashboardView } from '../modules/amic-invisibles/views/AdminDashboardView';
import { AdminIncompatibilitiesView } from '../modules/amic-invisibles/views/AdminIncompatibilitiesView';
import { LoginView } from '../modules/amic-invisibles/views/LoginView';
import { GuiaView } from '../modules/amic-invisibles/views/GuiaView';

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('yule_auth_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <AppNavigation>{children}</AppNavigation>;
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginView />,
  },
  {
    path: '/guia',
    element: <GuiaView />,
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <GiftAssignedView />
      </RequireAuth>
    ),
  },
  {
    path: '/wishlist',
    element: (
      <RequireAuth>
        <WishlistView />
      </RequireAuth>
    ),
  },
  {
    path: '/admin',
    element: (
      <RequireAuth>
        <AdminDashboardView />
      </RequireAuth>
    ),
  },
  {
    path: '/admin/incompatibilities',
    element: (
      <RequireAuth>
        <AdminIncompatibilitiesView />
      </RequireAuth>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

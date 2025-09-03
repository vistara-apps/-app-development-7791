import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Layout
import AppShell from '../components/AppShell';

// Pages
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import Dashboard from '../components/Dashboard'; // Using existing component for now
import SubscriptionPlans from '../pages/Billing/SubscriptionPlans';
import BillingHistory from '../pages/Billing/BillingHistory';

// Protected route wrapper
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// App layout with authenticated user
const AppLayout = () => {
  const { user, userDetails } = useAuth();

  return (
    <div className="min-h-screen gradient-bg">
      <AppShell user={userDetails || { email: user?.email, subscriptionTier: 'Free' }}>
        <Outlet />
      </AppShell>
    </div>
  );
};

// Create router
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          {
            path: 'claims',
            element: <div>Claims Page (Coming Soon)</div>,
          },
          {
            path: 'claims/:claimId',
            element: <div>Claim Details Page (Coming Soon)</div>,
          },
          {
            path: 'photos',
            element: <div>Photo Library Page (Coming Soon)</div>,
          },
          {
            path: 'analytics',
            element: <div>Analytics Page (Coming Soon)</div>,
          },
          {
            path: 'billing',
            element: <SubscriptionPlans />,
          },
          {
            path: 'billing/history',
            element: <BillingHistory />,
          },
          {
            path: 'settings',
            element: <div>Settings Page (Coming Soon)</div>,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <div>404 - Page Not Found</div>,
  },
]);


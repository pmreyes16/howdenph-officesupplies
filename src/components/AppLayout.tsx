import React from 'react';
import { useApp } from '@/contexts/AppContext';
import LoginForm from './LoginForm';
import Dashboard from './Dashboard';

const AppLayout: React.FC = () => {
  const { user } = useApp();

  if (!user) {
    return <LoginForm />;
  }

  return <Dashboard />;
};

export default AppLayout;
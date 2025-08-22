
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { AppProvider } from '@/contexts/AppContext';
import RequestHistoryPage from './RequestHistoryPage';

const Index: React.FC = () => {
  const path = window.location.pathname;
  if (path === '/request-history') {
    return <RequestHistoryPage />;
  }
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
};

export default Index;

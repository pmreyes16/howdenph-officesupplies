import React from 'react';
import RequestHistoryView from '@/components/RequestHistoryView';

import { AppProvider } from '@/contexts/AppContext';

const RequestHistoryPage: React.FC = () => {
  return (
    <AppProvider>
      <div className="p-4 max-w-4xl mx-auto">
        <RequestHistoryView />
      </div>
    </AppProvider>
  );
};

export default RequestHistoryPage;

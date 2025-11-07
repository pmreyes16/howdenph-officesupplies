import React, { useState } from 'react';
import { AddItemDialog } from './components/AddItemDialog';
import { AppProvider } from './contexts/AppContext';

const App: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = (open: boolean) => {
    setIsDialogOpen(open);
  };

  return (
    <AppProvider>
      <div className="app-container">
        <h1>Office Supplies Inventory</h1>
        <button onClick={handleOpenDialog}>Add New Item</button>
        <AddItemDialog open={isDialogOpen} onOpenChange={handleCloseDialog} />
      </div>
    </AppProvider>
  );
};

export default App;
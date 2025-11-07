import React, { createContext, useContext, useState } from 'react';

interface Item {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minstock: number;
  supplier: string;
  price: number;
}

interface AppContextType {
  items: Item[];
  addItem: (item: Item) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>([]);

  const addItem = (item: Item) => {
    setItems(prevItems => [...prevItems, item]);
  };

  return (
    <AppContext.Provider value={{ items, addItem }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
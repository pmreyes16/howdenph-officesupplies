import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  name: string;
  department: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minstock: number;
  supplier: string;
}

export interface Request {
  id: string;
  userId: string;
  userName: string;
  department: string;
  itemId: string;
  itemName: string;
  quantity: number;
  status: 'pending' | 'approved' | 'denied' | 'fulfilled';
  requestDate: string;
  approvedDate?: string;
  fulfilledDate?: string;
  notes?: string;
  adminNotes?: string;
  archived?: boolean;
}

interface AppContextType {
  user: User | null;
  inventory: InventoryItem[];
  requests: Request[];
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  createRequest: (itemId: string, quantity: number, notes?: string) => void;
  updateRequest: (id: string, status: Request['status']) => void;
  addUser: (user: { name: string; email: string; role: 'admin' | 'user'; password: string; department: string }) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock users
// Mock users
const mockUsers: User[] = [
  { id: '1', username: 'admin', role: 'admin', name: 'Admin User', department: 'IT' },
  { id: '2', username: 'user1', role: 'user', name: 'John Doe', department: 'Marketing' },
  { id: '3', username: 'user2', role: 'user', name: 'Jane Smith', department: 'HR' },
  { id: '4', username: 'user3', role: 'user', name: 'Mike Johnson', department: 'Finance' },
];

// Mock inventory
const mockInventory: InventoryItem[] = [
  { id: '1', name: 'Pens (Blue)', category: 'Writing', quantity: 150, minstock: 20, supplier: 'Office Depot' },
  { id: '2', name: 'A4 Paper', category: 'Paper', quantity: 5, minstock: 10, supplier: 'Staples' },
  { id: '3', name: 'Staplers', category: 'Tools', quantity: 8, minstock: 5, supplier: 'Amazon' },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // Persist user state in localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);
  // 2-minute inactivity kill switch
  useEffect(() => {
    if (!user) return;
    let timer: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setUser(null);
        localStorage.removeItem('user');
        alert('Logged out due to inactivity.');
      }, 2 * 60 * 1000);
    };
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [user]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  useEffect(() => {
    // Fetch inventory and requests from Supabase on app load
    const fetchInventory = async () => {
      const { data, error } = await supabase.from('Inventory').select('*');
      if (error) {
        console.error('Supabase fetch inventory error:', error.message);
      } else if (data) {
        setInventory(data);
      }
    };
    const fetchRequests = async () => {
      const { data, error } = await supabase.from('Requests').select('*');
      if (error) {
        console.error('Supabase fetch requests error:', error.message);
      } else if (data) {
        setRequests(data);
      }
    };
    fetchInventory();
    fetchRequests();
  }, []);
  const [requests, setRequests] = useState<Request[]>([]);
  const [users, setUsers] = useState<User[]>(mockUsers);

  const login = async (username: string, password: string): Promise<boolean> => {
    // After login, fetch inventory and requests from Supabase
    const inventoryResult = await supabase.from('Inventory').select('*');
    if (!inventoryResult.error && inventoryResult.data) {
      setInventory(inventoryResult.data);
    }
    const requestsResult = await supabase.from('Requests').select('*');
    if (!requestsResult.error && requestsResult.data) {
      setRequests(requestsResult.data);
    }
    // Try Supabase authentication first
    const userResult = await supabase
      .from('Users')
      .select('*')
      .eq('email', username)
      .eq('password', password)
      .limit(1);
    if (userResult.error) {
      console.error('Supabase login error:', userResult.error.message, userResult.error.details);
    }
    console.log('Supabase login query result:', userResult.data);
    const user = userResult.data && userResult.data[0];
    if (user) {
      setUser({
        id: user.id,
        username: user.email,
        role: user.role,
        name: user.name,
        department: user.department || '',
      });
      // Log to Supabase audit_log_entries
      supabase.from('auth.audit_log_entries').insert([
        {
          event_type: 'login',
          user_id: user.id,
          username: user.email,
          timestamp: new Date().toISOString(),
          details: 'User logged in successfully.'
        }
      ]);
      return true;
    } else {
      console.warn('No matching user found in Supabase for:', username);
    }
    // Fallback to mock users
  const foundUser = mockUsers.find(u => u.username === username && password === 'password');
    if (foundUser) {
      setUser(foundUser);
      supabase.from('auth.audit_log_entries').insert([
        {
          event_type: 'login',
          user_id: foundUser.id,
          username: foundUser.username,
          timestamp: new Date().toISOString(),
          details: 'Mock user logged in.'
        }
      ]);
      return true;
    }
    return false;
  };

  // Also clear localStorage on logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const addItem = (item: Omit<InventoryItem, 'id'>) => {
  const newItem = { ...item, id: Date.now().toString() };
  // Ensure minstock is used instead of minStock
  if ('minStock' in newItem) {
    newItem.minstock = Number((newItem as any).minStock);
    delete (newItem as any).minStock;
  }
  setInventory(prev => [...prev, newItem]);
  // Save to Supabase
  supabase.from('Inventory').insert([newItem]);
  };

  const updateItem = (id: string, updates: Partial<InventoryItem>) => {
    // Ensure minstock is used instead of minStock
    if ('minStock' in updates) {
      updates.minstock = Number((updates as any).minStock);
      delete (updates as any).minStock;
    }
    setInventory(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
    // Update in Supabase
    supabase.from('Inventory').update(updates).eq('id', id);
  };

  const deleteItem = (id: string) => {
  setInventory(prev => prev.filter(item => item.id !== id));
  // Delete from Supabase
  supabase.from('Inventory').delete().eq('id', id);
  };

  const createRequest = (itemId: string, quantity: number, notes?: string) => {
    (async () => {
      if (!user) return;
      const item = inventory.find(i => i.id === itemId);
      if (!item) return;
      const newRequest: Request = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        department: user.department,
        itemId,
        itemName: item.name,
        quantity,
        status: 'pending',
        requestDate: new Date().toISOString().split('T')[0],
        notes,
      };
      setRequests(prev => [...prev, newRequest]);
      // Save to Supabase with error handling
  const { error } = await supabase.from('Requests').insert([newRequest]);
      if (error) {
        console.error('Supabase request insert error:', error.message);
      }
    })();
  };

  const updateRequest = (id: string, status: Request['status']) => {
    // Soft delete: archive if status is not pending
    const shouldArchive = status === 'denied' || status === 'fulfilled' || status === 'approved';
    supabase.from('Requests').update({ status, archived: shouldArchive }).eq('id', id).then(async () => {
      // After update, fetch latest requests from Supabase
      const { data: requestsData } = await supabase.from('Requests').select('*');
      if (requestsData) setRequests(requestsData);

      // If approved or fulfilled, update inventory quantity
      if (status === 'approved' || status === 'fulfilled') {
        const request = requestsData?.find((r: any) => r.id === id);
        if (request) {
          // Find inventory item
          const { data: inventoryData } = await supabase.from('Inventory').select('*').eq('id', request.itemId);
          const item = inventoryData && inventoryData[0];
          if (item) {
            const newQuantity = Math.max(0, item.quantity - request.quantity);
            await supabase.from('Inventory').update({ quantity: newQuantity }).eq('id', item.id);
            // Update local state
            setInventory(prev => prev.map(inv => inv.id === item.id ? { ...inv, quantity: newQuantity } : inv));
          }
        }
      }
    });
  };

  const addUser = async (newUser: { id: string; name: string; email: string; role: 'admin' | 'user'; password: string; department: string }) => {
    // Add to local state
    setUsers(prev => [
      ...prev,
      {
        id: newUser.id,
        username: newUser.email,
        name: newUser.name,
        department: newUser.department,
        role: newUser.role,
        password: newUser.password,
        email: newUser.email,
      }
    ]);
    // Add to Supabase
    const { error } = await supabase.from('Users').insert([
      {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        password: newUser.password,
        department: newUser.department
      }
    ]);
    if (error) throw new Error(error.message);
  };

  return (
    <AppContext.Provider value={{
      user, inventory, requests, login, logout, addItem, 
      updateItem, deleteItem, createRequest, updateRequest, addUser
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
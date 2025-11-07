import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
// import bcrypt from 'bcryptjs';
// End of Request interface

export interface LoginLog {
  id: string;
  user_id: string;
  username: string;
  login_time: string;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
}

// Add users to your context type
export type User = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  department?: string;
};

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minstock: number;
  supplier: string;
  price: number; // <-- Add this line
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

export interface AppContextType {
  user: User | null;
  users: User[]; // <-- Make sure this is here
  inventory: InventoryItem[];
  requests: Request[];
  loginLogs: LoginLog[];
  login: (username: string, password: string) => Promise<{ success: boolean; user: User | null }>;
  logout: () => void;
  addItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  createRequest: (itemId: string, quantity: number, notes?: string) => void;
  updateRequest: (id: string, status: Request['status']) => void;
  addUser: (user: { name: string; email: string; role: 'admin' | 'user'; password: string; department: string }) => Promise<void>;
  updateInventoryStock: (itemName: string, quantityToDeduct: number) => Promise<boolean>; // <-- Add this line
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock users
// Mock users
const mockUsers: User[] = [
  { id: '1', role: 'admin', name: 'Admin User', email: 'admin@example.com', department: 'IT' },
  { id: '2', role: 'user', name: 'John Doe', email: 'user1@example.com', department: 'Marketing' },
  { id: '3', role: 'user', name: 'Jane Smith', email: 'user2@example.com', department: 'HR' },
  { id: '4', role: 'user', name: 'Mike Johnson', email: 'user3@example.com', department: 'Finance' },
];

// Mock inventory
const mockInventory: InventoryItem[] = [
  { id: '1', name: 'Pens (Blue)', category: 'Writing', quantity: 150, minstock: 20, supplier: 'Office Depot', price: 0.99 },
  { id: '2', name: 'A4 Paper', category: 'Paper', quantity: 5, minstock: 10, supplier: 'Staples', price: 4.99 },
  { id: '3', name: 'Staplers', category: 'Tools', quantity: 8, minstock: 5, supplier: 'Amazon', price: 19.99 },
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
    // Fetch inventory, requests, and loginLogs from Supabase on app load
    const fetchInventory = async () => {
      const { data, error } = await supabase.from('Inventory').select('*');
      if (error) {
        console.error('Supabase fetch inventory error:', error.message);
      } else if (data) {
        setInventory(data);
      }
    };

    const fetchRequests = async () => {
      let data, error;
      if (user?.role === 'superadmin') {
        // Superadmin: fetch only pending requests from public.Requests
        ({ data, error } = await supabase
          .from('Requests')
          .select('*')
          .eq('status', 'pending'));
      } else if (user?.role === 'admin') {
        // Admin: fetch all requests
        ({ data, error } = await supabase
          .from('Requests')
          .select('*'));
      } else if (user?.role === 'user' && user?.id) {
        // User: fetch only their own requests
        ({ data, error } = await supabase
          .from('Requests')
          .select('*')
          .eq('userId', user.id));
      } else {
        // Default: fetch nothing
        data = [];
      }
      if (!error && data) setRequests(data);
    };

    const fetchLoginLogs = async () => {
      const { data, error } = await supabase.from('loginlogs').select('*');
      if (error) {
        console.error('Supabase fetch loginlogs error:', error.message);
      }
      setLoginLogs(data || []);
    };

    const fetchUsers = async () => {
      const { data, error } = await supabase.from('Users').select('*');
      if (error) {
        console.error('Supabase fetch users error:', error.message);
      } else if (data) {
        setUsers(data);
      }
    };

    fetchInventory();
    fetchRequests();
    fetchLoginLogs();
    fetchUsers();
  }, [user]); // <-- re-run when user changes
  const [requests, setRequests] = useState<Request[]>([]);
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [users, setUsers] = useState<User[]>(mockUsers);

  const login = async (username: string, password: string): Promise<{ success: boolean; user: User | null }> => {
    // After login, fetch inventory and requests from Supabase
    const inventoryResult = await supabase.from('Inventory').select('*');
    if (!inventoryResult.error && inventoryResult.data) {
      setInventory(inventoryResult.data);
    }
    const requestsResult = await supabase.from('Requests').select('*');
    if (!requestsResult.error && requestsResult.data) {
      setRequests(requestsResult.data);
    }

    // Try Supabase authentication first (allow login by username or email, plain text password)
      // Test with only email field to isolate .or filter issue
      const userResult = await supabase
        .from('Users')
        .select('*')
        .eq('email', username)
        .limit(1);

    const supabaseUser = userResult.data && userResult.data[0];
    if (supabaseUser && password === supabaseUser.password) {
      const userObj: User = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        role: supabaseUser.role,
        name: supabaseUser.name,
        department: supabaseUser.department || '',
      };
      setUser(userObj);
      // loginlogs functionality is handled in LoginForm.tsx
      return { success: true, user: userObj };
    }
    return { success: false, user: null };
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

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    // Update the item in Supabase
    const { error } = await supabase
      .from('Inventory')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating item:', error.message);
      return;
    }

    // Optionally, update the local state (if you keep inventory in state)
    setInventory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
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

  const addUser = async (user: {
    name: string;
    email: string;
    role: 'user' | 'admin';
    password: string;
    department: string;
  }) => {
    const id = Date.now().toString();
    // Save plain text password
    setUsers(prev => [
      ...prev,
      {
        id,
        name: user.name,
        department: user.department,
        role: user.role,
        email: user.email,
      }
    ]);
    // Add to Supabase
    const { error } = await supabase.from('Users').insert([
      {
        id,
        name: user.name,
        email: user.email,
        role: user.role,
        password: user.password,
        department: user.department
      }
    ]);
    if (error) throw new Error(error.message);
  };

  const updateInventoryStock = async (itemName: string, quantityToDeduct: number) => {
    // Find the item in inventory by name
    const item = inventory.find(i => i.name === itemName);
    if (!item) {
      console.error(`Item ${itemName} not found in inventory`);
      return false;
    }

    // Calculate new quantity
    const newQuantity = item.quantity - quantityToDeduct;
    
    if (newQuantity < 0) {
      console.error(`Not enough stock for ${itemName}. Available: ${item.quantity}, Requested: ${quantityToDeduct}`);
      return false;
    }

    // Update in Supabase
    const { error } = await supabase
      .from('Inventory')
      .update({ quantity: newQuantity })
      .eq('id', item.id);

    if (error) {
      console.error('Error updating inventory:', error);
      return false;
    }

    // Update local state
    setInventory(prev => prev.map(i => 
      i.id === item.id ? { ...i, quantity: newQuantity } : i
    ));

    return true;
  };

  return (
    <AppContext.Provider value={{
      user, users, inventory, requests, loginLogs, login, logout, addItem, 
      updateItem, deleteItem, createRequest, updateRequest, addUser, updateInventoryStock
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
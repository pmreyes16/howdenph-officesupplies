import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import Header from './Header';
import AddUserForm from './AddUserForm';
import InventoryView from './InventoryView';
import RequestsView from './RequestsView';
import ReportsView from './ReportsView';
import RequestHistoryView from './RequestHistoryView';
import LoginLogsView from './LoginLogsView';
import StatsCards from './StatsCards';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, FileText, BarChart3, History, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { isLowStock } from '@/utils/inventory';
import { supabase } from '@/lib/supabaseClient';

// Make sure your User type includes id and all roles
export type User = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  password: string;
  department: string;
};

type UserRole = 'admin' | 'superadmin' | 'user';

interface AddUserFormProps {
  onAdd: (user: { name: string; email: string; role: 'admin' | 'user'; password: string; department: string }) => Promise<void>;
  onClose: () => void;
}

const Dashboard: React.FC = () => {
  const { user, addUser, inventory } = useApp();
  const userRole = user?.role as UserRole;
  const [activeTab, setActiveTab] = useState('inventory');
  const [showAddUser, setShowAddUser] = useState(false);
  const [showLoginLogs, setShowLoginLogs] = useState(false);

  const stats = {
    lowStockItems: inventory.filter(isLowStock),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-gray-600">
            {(userRole === 'admin' || userRole === 'superadmin')
              ? 'Manage your office supplies inventory and user requests.'
              : 'View available supplies and manage your requests.'
            }
          </p>
          {(userRole === 'admin' || userRole === 'superadmin') && (
            <div className="flex gap-2 mt-4">
              {/* Both admin and superadmin can add users */}
              <button
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded shadow hover:from-teal-600 hover:to-blue-700"
                onClick={() => setShowAddUser(true)}
              >
                Add User
              </button>
              {/* Only superadmin can view users */}
              {userRole === 'superadmin' && (
                <button
                  className="px-4 py-2 bg-gradient-to-r from-teal-600 to-blue-500 text-white rounded shadow hover:from-teal-700 hover:to-blue-600"
                  onClick={() => window.location.href = '/users'}
                >
                  View Users
                </button>
              )}
              <button
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded shadow hover:from-teal-600 hover:to-blue-700"
                onClick={() => setShowLoginLogs(true)}
              >
                View Login Logs
              </button>
            </div>
          )}
        </div>

        <StatsCards />

        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-3">
              <TabsTrigger value="inventory" className="flex items-center space-x-2">
                <Package className="w-4 h-4" />
                <span>Inventory</span>
              </TabsTrigger>
              <TabsTrigger value="requests" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Requests</span>
              </TabsTrigger>
              {(userRole === 'admin' || userRole === 'superadmin') && (
                <TabsTrigger value="reports" className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Reports</span>
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="inventory" className="mt-6">
              <InventoryView userRole={userRole} />
            </TabsContent>

            <TabsContent value="requests" className="mt-6">
              <RequestsView />
            </TabsContent>
            {(userRole === 'admin' || userRole === 'superadmin') && (
              <TabsContent value="reports" className="mt-6">
                <ReportsView />
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Low Stock Alert Card */}
        
      </main>
      {showAddUser && (
        <AddUserForm
          onAdd={addUser}
          onClose={() => setShowAddUser(false)}
        />
      )}
      {showLoginLogs && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowLoginLogs(false)}
            >
              &times;
            </button>
            <LoginLogsView />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

// Make sure to import or initialize supabase before using it, for example:
// import { supabase } from '@/lib/supabaseClient';

// Example usage (uncomment and ensure supabase is properly imported/initialized):
// let { data, error } = await supabase
//   .from('Requests')
//   .select('id,userName,itemName,requestDate,status')
//   .eq('status', 'pending')
//   .order('requestDate', { ascending: false })
//   .limit(10);



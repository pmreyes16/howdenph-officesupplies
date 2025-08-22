import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import Header from './Header';
import AddUserForm from './AddUserForm';
import InventoryView from './InventoryView';
import RequestsView from './RequestsView';
import ReportsView from './ReportsView';
import RequestHistoryView from './RequestHistoryView';
import StatsCards from './StatsCards';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, FileText, BarChart3, History } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, addUser } = useApp();
  const [activeTab, setActiveTab] = useState('inventory');
  const [showAddUser, setShowAddUser] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-gray-600">
            {user?.role === 'admin' 
              ? 'Manage your office supplies inventory and user requests.'
              : 'View available supplies and manage your requests.'
            }
          </p>
          {user?.role === 'admin' && (
            <div className="flex gap-2 mt-4">
              <button
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded shadow hover:from-teal-600 hover:to-blue-700"
                onClick={() => setShowAddUser(true)}
              >
                Add User
              </button>
              <button
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 text-white rounded shadow hover:from-blue-700 hover:to-teal-600"
                onClick={() => window.location.href = '/users'}
              >
                View Users
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
              {user?.role === 'admin' && (
                <TabsTrigger value="reports" className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Reports</span>
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="inventory" className="mt-6">
              <InventoryView />
            </TabsContent>
            
            <TabsContent value="requests" className="mt-6">
              <RequestsView />
            </TabsContent>
            
            {user?.role === 'admin' && (
              <TabsContent value="reports" className="mt-6">
                <ReportsView />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
      {showAddUser && (
        <AddUserForm
          onAdd={addUser}
          onClose={() => setShowAddUser(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
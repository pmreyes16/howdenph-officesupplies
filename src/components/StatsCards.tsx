import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, FileText, CheckCircle } from 'lucide-react';

const StatsCards: React.FC = () => {
  const { user, inventory, requests } = useApp();

  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.quantity <= item.minStock).length;
  const totalRequests = user?.role === 'admin' 
    ? requests.length 
    : requests.filter(req => req.userId === user?.id).length;
  const pendingRequests = user?.role === 'admin'
    ? requests.filter(req => req.status === 'pending').length
    : requests.filter(req => req.userId === user?.id && req.status === 'pending').length;

  const stats = [
    {
      title: 'Total Items',
      value: totalItems,
      icon: Package,
      color: 'bg-blue-500',
      description: 'Items in inventory'
    },
    {
      title: 'Low Stock Alert',
      value: lowStockItems,
      icon: AlertTriangle,
      color: lowStockItems > 0 ? 'bg-red-500' : 'bg-green-500',
      description: 'Items below minimum'
    },
    {
      title: user?.role === 'admin' ? 'All Requests' : 'My Requests',
      value: totalRequests,
      icon: FileText,
      color: 'bg-purple-500',
      description: user?.role === 'admin' ? 'Total requests' : 'Your requests'
    },
    {
      title: 'Pending',
      value: pendingRequests,
      icon: CheckCircle,
      color: pendingRequests > 0 ? 'bg-orange-500' : 'bg-green-500',
      description: 'Awaiting action'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white shadow-sm border-0 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              {stat.title === 'Low Stock Alert' && stat.value > 0 && (
                <Badge variant="destructive" className="text-xs">
                  Alert
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsCards;
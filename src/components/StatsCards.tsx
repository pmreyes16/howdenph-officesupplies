import React, { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, FileText, CheckCircle } from 'lucide-react';
import { isLowStock } from '@/utils/inventory';

const StatsCards: React.FC = () => {
  const { user, inventory, requests } = useApp();

  const [allRequestsCount, setAllRequestsCount] = useState<number>(0);

  useEffect(() => {
    // Always fetch the count from public.Requests
    const fetchAllRequestsCount = async () => {
      const { count, error } = await supabase
        .from('Requests')
        .select('*', { count: 'exact', head: true });
      if (!error && typeof count === 'number') {
        setAllRequestsCount(count);
      }
    };
    fetchAllRequestsCount();
  }, []);

  const totalItems = inventory.length;
  const lowStockItemsList = inventory.filter(isLowStock);
  const lowStockItems = lowStockItemsList.length;
  const pendingRequests =
    user?.role === 'admin' || user?.role === 'superadmin'
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
      description: 'Items below minimum',
      items: lowStockItemsList,
    },
    {
      title:
        user?.role === 'admin' || user?.role === 'superadmin'
          ? 'All Requests'
          : 'My Requests',
      value:
        user?.role === 'admin' || user?.role === 'superadmin'
          ? allRequestsCount
          : requests.filter(req => req.userId === user?.id).length,
      icon: FileText,
      color: 'bg-purple-500',
      description:
        user?.role === 'admin' || user?.role === 'superadmin'
          ? 'Total requests'
          : 'Your requests'
    },
    {
      title: 'Pending',
      value: pendingRequests,
      icon: CheckCircle,
      color: pendingRequests > 0 ? 'bg-orange-500' : 'bg-green-500',
      description: 'Awaiting action'
    }
  ];

  // Check for low stock items
  const lowStockItemsCheck = inventory.filter(item => item.quantity <= item.minstock);
  const outOfStockItems = inventory.filter(item => item.quantity === 0);

  useEffect(() => {
    // Show low stock alert
    if (lowStockItemsCheck.length > 0) {
      console.warn(`Low stock alert: ${lowStockItemsCheck.length} items are running low`);
      // You can also show a toast notification here
    }

    if (outOfStockItems.length > 0) {
      console.error(`Out of stock alert: ${outOfStockItems.length} items are out of stock`);
      // You can also show a toast notification here
    }
  }, [lowStockItemsCheck.length, outOfStockItems.length]);

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
            {stat.title === 'Low Stock Alert' && stat.value > 0 && (
              <ul className="mt-2 ml-2 list-disc text-xs text-red-700">
                {stat.items.map((item: any) => (
                  <li key={item.id}>{item.name}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Add low stock warning card */}
      {lowStockItemsCheck.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Low Stock Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockItemsCheck.length}</div>
            <p className="text-xs text-orange-700">
              Items need restocking
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add out of stock warning card */}
      {outOfStockItems.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Out of Stock</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockItems.length}</div>
            <p className="text-xs text-red-700">
              Items unavailable
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StatsCards;
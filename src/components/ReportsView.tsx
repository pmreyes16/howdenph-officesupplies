import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, BarChart3, Users, Package, TrendingUp } from 'lucide-react';

const ReportsView: React.FC = () => {
  const { user, requests, inventory } = useApp();
  const [reportType, setReportType] = useState('overview');

  const departments = [...new Set(requests.map(r => r.department))];
  
  const stats = {
    totalRequests: requests.length,
    pendingRequests: requests.filter(r => r.status === 'pending').length,
    fulfilledRequests: requests.filter(r => r.status === 'fulfilled').length,
    lowStockItems: inventory.filter(i => i.quantity <= i.minstock).length,
  };

  const departmentStats = departments.map(dept => ({
    department: dept,
    totalRequests: requests.filter(r => r.department === dept).length,
    pendingRequests: requests.filter(r => r.department === dept && r.status === 'pending').length,
    fulfilledRequests: requests.filter(r => r.department === dept && r.status === 'fulfilled').length,
  }));

  const exportReport = () => {
    const data = reportType === 'department' ? departmentStats : requests;
    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reports & Analytics</h2>
        <div className="flex gap-4">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="department">By Department</SelectItem>
              <SelectItem value="requests">All Requests</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {reportType === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fulfilled</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.fulfilledRequests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <Package className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.lowStockItems}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === 'department' && (
        <Card>
          <CardHeader>
            <CardTitle>Department Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentStats.map(dept => (
                <div key={dept.department} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">{dept.department}</span>
                  </div>
                  <div className="flex gap-4">
                    <Badge variant="outline">Total: {dept.totalRequests}</Badge>
                    <Badge variant="secondary">Pending: {dept.pendingRequests}</Badge>
                    <Badge variant="default">Fulfilled: {dept.fulfilledRequests}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === 'requests' && (
        <Card>
          <CardHeader>
            <CardTitle>All Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {(user?.role === 'admin' ? requests : requests.filter(r => r.userId === user?.id)).map(request => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <span className="font-medium">{request.itemName}</span>
                    <div className="text-sm text-gray-600">
                      {request.userName} - {request.department} - Qty: {request.quantity}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      request.status === 'fulfilled' ? 'default' :
                      request.status === 'approved' ? 'secondary' :
                      request.status === 'denied' ? 'destructive' : 'outline'
                    }>
                      {request.status}
                    </Badge>
                    <span className="text-sm text-gray-500">{request.requestDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportsView;
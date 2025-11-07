import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileBarChart, Users, Package, Clock, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

interface RequestWithPrice {
  id: string;
  itemName: string;
  userName: string;
  department: string;
  quantity: number;
  price: number;
  status: string;
  requestDate: string;
  userId: string;
  notes?: string;
  supplier: string; // Make supplier required since it comes from inventory
  approvedDate?: string;
  deniedDate?: string;
  processedDate?: string;
}

const ReportsView: React.FC = () => {
  const { requests, inventory, user } = useApp();
  const [reportType, setReportType] = useState<'overview' | 'department' | 'requests' | 'inventory'>('overview');
  const [requestsData, setRequestsData] = useState<RequestWithPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('Requests')
        .select('*')
        .order('requestDate', { ascending: false });
      if (!error && data) {
        setRequestsData(data as RequestWithPrice[]);
      }
      setLoading(false);
    };
    fetchRequests();
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading reports...</div>;
  }

  // Use fetched data instead of context
  const typedRequests = requestsData;

  const requestsThisMonth = typedRequests.filter(r => {
    const requestDate = new Date(r.requestDate);
    const now = new Date();
    return requestDate.getMonth() === now.getMonth() && requestDate.getFullYear() === now.getFullYear();
  });

  const stats = {
    totalRequests: typedRequests.length,
    totalRequestsThisMonth: requestsThisMonth.length,
    pendingRequests: typedRequests.filter(r => r.status === 'pending').length,
    // Fulfilled: all requests that are not pending (approved + denied + fulfilled)
    fulfilledRequests: typedRequests.filter(
      r => r.status === 'approved' || r.status === 'denied' || r.status === 'fulfilled'
    ).length,
    approvedRequests: typedRequests.filter(r => r.status === 'approved').length,
    deniedRequests: typedRequests.filter(r => r.status === 'denied').length
  };

  const departments = Array.from(new Set(typedRequests.map(r => r.department)));

  // Filter requests for department stats based on user role
  const departmentStats = departments.map(dept => {
    // For admin/superadmin: all requests in the department
    // For user: only their own requests in the department
    const deptRequests =
      user?.role === 'admin' || user?.role === 'superadmin'
        ? typedRequests.filter(r => r.department === dept)
        : typedRequests.filter(r => r.department === dept && r.userId === user?.id);

    return {
      department: dept,
      totalRequests: deptRequests.length,
      pendingRequests: deptRequests.filter(r => r.status === 'pending').length,
      // Fulfilled: all requests that are not pending (approved + denied + fulfilled)
      fulfilledRequests: deptRequests.filter(
        r => r.status === 'approved' || r.status === 'denied' || r.status === 'fulfilled'
      ).length,
      approvedRequests: deptRequests.filter(r => r.status === 'approved').length,
      deniedRequests: deptRequests.filter(r => r.status === 'denied').length,
    };
  });

  const categoryData = Array.from(new Set(inventory.map(i => i.category))).map(cat => ({
    category: cat,
    count: inventory.filter(i => i.category === cat).length
  }));

  const statusData = [
    { name: 'Pending', value: stats.pendingRequests, color: '#f59e0b' },
    { name: 'Approved', value: stats.approvedRequests, color: '#10b981' },
    { name: 'Denied', value: stats.deniedRequests, color: '#ef4444' },
  ];

  const exportReport = () => {
    let data: any[] = [];
    let filename = '';

    if (reportType === 'department') {
      data = departmentStats;
      filename = 'department-report.xlsx';
    } else if (reportType === 'requests') {
      data = (user?.role === 'admin' || user?.role === 'superadmin'
        ? typedRequests
        : typedRequests.filter(r => r.userId === user?.id)
      ).map(r => ({
        userName: r.userName,
        department: r.department,
        nameOfItem: r.itemName,
        quantity: r.quantity,
        price: `₱${r.price}`,
        supplier: r.supplier || 'N/A',
        dateOfRequest: r.requestDate
          ? new Date(r.requestDate).toLocaleString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true,
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            })
          : '',
        dateApproved: r.status === 'approved' 
          ? (r.approvedDate || r.processedDate)
            ? new Date(r.approvedDate || r.processedDate).toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
              })
            : 'Approved (Date Not Available)'
          : r.status === 'denied'
          ? (r.deniedDate)
            ? new Date(r.deniedDate).toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
              })
            : 'Denied (Date Not Available)'
          : 'Pending',
      }));
      filename = 'requests-report.xlsx';
    } else if (reportType === 'inventory') {
      // include supplier and date added in exported inventory rows
      data = inventory.map(i => ({
        id: i.id,
        itemNumber: (i as any).itemNumber ?? '',
        itemName: i.name ?? (i as any).itemName ?? '',
        category: i.category ?? '',
        supplier: (i as any).supplier ?? '',
        quantity: i.quantity ?? '',
        price: `₱${i.price}` ?? '',
        dateAdded: ((i as any).dateAdded || (i as any).date_added || (i as any).created_at)
          ? new Date((i as any).dateAdded ?? (i as any).date_added ?? (i as any).created_at).toLocaleString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true,
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            })
          : '',
      }));
      filename = 'inventory-report.xlsx';
    } else {
      data = [
        { metric: 'Total Requests', value: stats.totalRequests },
        { metric: 'Pending Requests', value: stats.pendingRequests },
        { metric: 'Fulfilled Requests', value: stats.fulfilledRequests },
        { metric: 'Total Inventory Items', value: inventory.length },
      ];
      filename = 'overview-report.xlsx';
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileBarChart className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant={reportType === 'overview' ? 'default' : 'outline'}
            onClick={() => setReportType('overview')}
          >
            Overview
          </Button>
          <Button
            variant={reportType === 'department' ? 'default' : 'outline'}
            onClick={() => setReportType('department')}
          >
            Department
          </Button>
          <Button
            variant={reportType === 'requests' ? 'default' : 'outline'}
            onClick={() => setReportType('requests')}
          >
            Requests
          </Button>
          <Button
            variant={reportType === 'inventory' ? 'default' : 'outline'}
            onClick={() => setReportType('inventory')}
          >
            Inventory
          </Button>
          <Button onClick={exportReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {reportType === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalRequests}</div>
              <p className="text-xs text-gray-500">
                {stats.totalRequestsThisMonth} this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingRequests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fulfilled</CardTitle>
              <Package className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.fulfilledRequests}</div>
              <div className="text-xs text-gray-500 mt-1">
                Approved: <span className="font-semibold">{stats.approvedRequests}</span>
                {" | "}
                Denied: <span className="font-semibold">{stats.deniedRequests}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{inventory.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Request Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
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
                  <div className="flex flex-col gap-1 items-end">
                    <div className="flex gap-4">
                      <Badge variant="outline">Total: {dept.totalRequests}</Badge>
                      <Badge variant="secondary">Pending: {dept.pendingRequests}</Badge>
                      <Badge variant="default">Fulfilled: {dept.fulfilledRequests}</Badge>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Approved: <span className="font-semibold">{dept.approvedRequests}</span>
                      {" | "}
                      Denied: <span className="font-semibold">{dept.deniedRequests}</span>
                    </div>
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
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name of Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date of Request</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Approved</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(user?.role === 'admin' || user?.role === 'superadmin'
                    ? typedRequests
                    : typedRequests.filter(r => r.userId === user?.id)
                  ).map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.userName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.itemName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₱{request.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.supplier || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.requestDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.status === 'approved' 
                          ? (request.approvedDate || request.processedDate)
                            ? new Date(request.approvedDate || request.processedDate).toLocaleDateString()
                            : 'Approved (Date Not Available)'
                          : request.status === 'denied'
                          ? (request.deniedDate)
                            ? new Date(request.deniedDate).toLocaleDateString()
                            : 'Denied (Date Not Available)'
                          : 'Pending'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={
                            request.status === 'approved' ? 'default' :
                            request.status === 'denied' ? 'destructive' : 'secondary'
                          }
                        >
                          {request.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === 'inventory' && (
        <Card>
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventory.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {(item as any).itemNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(item as any).supplier || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₱{item.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {((item as any).dateAdded || (item as any).date_added || (item as any).created_at)
                          ? new Date((item as any).dateAdded ?? (item as any).date_added ?? (item as any).created_at).toLocaleDateString()
                          : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportsView;


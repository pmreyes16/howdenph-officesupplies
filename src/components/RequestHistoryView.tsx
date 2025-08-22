import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar, Package, Search, Filter } from 'lucide-react';

const RequestHistoryView: React.FC = () => {
  const { user, requests } = useApp();
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Only admins see all requests; users see only their own requests (by role as identifier)
  let userRequests: typeof requests = [];
  if (user && user.role === 'admin') {
    userRequests = requests;
  } else if (user && user.role) {
    userRequests = requests.filter(req => req.userId === user.id);
  }

  const filteredRequests = userRequests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesSearch = request.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.userName.toLowerCase().includes(searchTerm.toLowerCase());
    // Only admins can see pending requests
    if (user?.role !== 'admin' && request.status === 'pending') {
      return false;
    }
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'denied': return 'bg-red-100 text-red-800';
      case 'fulfilled': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold">Request History</h2>
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="denied">Denied</SelectItem>
              <SelectItem value="fulfilled">Fulfilled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredRequests.map((request) => (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{request.itemName}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {user?.role === 'admin' && (
                        <span>{request.userName} - {request.department}</span>
                      )}
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{request.requestDate}</span>
                      </div>
                      <span>Qty: {request.quantity}</span>
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(request.status)}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </Badge>
              </div>
              <div className="mt-2">
                <span className={`text-xs font-semibold px-2 py-1 rounded ${request.status === 'approved' ? 'bg-blue-100 text-blue-700' : request.status === 'denied' ? 'bg-red-100 text-red-700' : request.status === 'fulfilled' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {request.status === 'pending' && 'Pending'}
                  {request.status === 'approved' && 'Approved'}
                  {request.status === 'denied' && 'Denied'}
                  {request.status === 'fulfilled' && 'Fulfilled'}
                </span>
              </div>
              {request.notes && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                  <strong>Notes:</strong> {request.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'No requests have been made yet.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default RequestHistoryView;
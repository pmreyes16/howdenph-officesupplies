import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, Package, Calendar, User, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const RequestsView: React.FC = () => {
  const { user, requests, updateRequest } = useApp();

  // Admins see all requests; users see only their own requests (any status)
  const userRequests = user?.role === 'admin'
    ? requests.filter(req => req.archived !== true)
    : requests.filter(req => req.userId === user?.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'denied': return 'bg-red-100 text-red-800 border-red-200';
      case 'fulfilled': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusUpdate = (requestId: string, status: 'approved' | 'denied' | 'fulfilled') => {
  updateRequest(requestId, status);
  };

  if (userRequests.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests found</h3>
        <p className="text-gray-600">
          {user?.role === 'admin' 
            ? 'No supply requests have been submitted yet.' 
            : 'You haven\'t made any supply requests yet.'
          }
        </p>
        <div className="mt-6">
          <Link to="/request-history" className="inline-block">
            <Button variant="outline">View Request History</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <Link to="/request-history" className="inline-block">
          <Button variant="outline">View Request History</Button>
        </Link>
      </div>
      <div className="grid gap-4">
        {userRequests.map((request) => (
          <Card key={request.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{request.itemName}</CardTitle>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      {user?.role === 'admin' && (
                        <>
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{request.userName}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <span>{request.department}</span>
                          </div>
                        </>
                      )}
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{request.requestDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Badge className={getStatusColor(request.status)}>
                  {request.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Quantity Requested</p>
                  <p className="font-semibold text-lg">{request.quantity}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-semibold capitalize">{request.status}</p>
                </div>
              </div>
              
              {request.notes && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium mb-1">Notes:</p>
                  <p className="text-sm text-gray-800">{request.notes}</p>
                </div>
              )}
              
              {user?.role === 'admin' && request.status === 'pending' && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => handleStatusUpdate(request.id, 'approved')}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleStatusUpdate(request.id, 'denied')}
                    className="flex-1"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Deny
                  </Button>
                </div>
              )}
              
              {user?.role === 'admin' && request.status === 'approved' && (
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate(request.id, 'fulfilled')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Mark as Fulfilled
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RequestsView;
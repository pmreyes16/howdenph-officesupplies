import React, { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, Clock, List, LayoutGrid, CheckCircle, XCircle } from 'lucide-react';
import AddItemDialog from './AddItemDialog';
import EditItemDialog from './EditItemDialog';
import RequestItemDialog from './RequestItemDialog';
import { isLowStock } from '@/utils/inventory';

type UserRole = 'user' | 'admin' | 'superadmin';

interface User {
  id: string; // <-- Add this line
  role: UserRole;
  // add other user properties if needed
}

// Example TypeScript interface
interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minstock: number;
  supplier: string;
  price: number; // <-- Add this line
}

interface InventoryViewProps {
  userRole?: UserRole;
}

const InventoryView: React.FC<InventoryViewProps> = ({ userRole }) => {
  // Get user and requests from context
  const { user, inventory, deleteItem, requests, updateInventoryStock } = useApp() as { 
    user: User | null, 
    inventory: any[], 
    deleteItem: (id: string) => void, 
    requests: any[],
    updateInventoryStock: (itemName: string, quantity: number) => Promise<boolean>
  };
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [requestingItem, setRequestingItem] = useState<string | null>(null);
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [pendingRequestsState, setPendingRequestsState] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteItem(id);
    }
  };

  // Process approved requests from today and yesterday
  useEffect(() => {
    const processApprovedRequests = async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
      
      try {
        // Fetch approved requests from yesterday and today that haven't been processed
        const { data: approvedRequests, error } = await supabase
          .from('Requests')
          .select('*')
          .eq('status', 'approved')
          .gte('requestDate', startOfYesterday.toISOString())
          .is('processed', null); // Only get unprocessed requests

        if (error) {
          console.error('Error fetching approved requests:', error);
          return;
        }

        if (approvedRequests && approvedRequests.length > 0) {
          console.log(`Processing ${approvedRequests.length} approved requests...`);
          
          for (const request of approvedRequests) {
            console.log(`Processing request: ${request.itemName} (${request.quantity})`);
            
            // Deduct stock from inventory
            const success = await updateInventoryStock(request.itemName, request.quantity);
            
            if (success) {
              // Mark as processed
              await supabase
                .from('Requests')
                .update({ processed: true })
                .eq('id', request.id);
              
              console.log(`✅ Processed request for ${request.itemName}`);
            } else {
              console.error(`❌ Failed to process request for ${request.itemName}`);
            }
          }
        }
      } catch (error) {
        console.error('Error processing approved requests:', error);
      }
    };

    if (inventory.length > 0) {
      processApprovedRequests();
    }
  }, [inventory, updateInventoryStock]);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      setLoading(true);
      try {
        // Fetch recent requests
        const { data: recentData, error: recentError } = await supabase
          .from('Requests')
          .select('id,userName,itemName,requestDate,status,quantity')
          .order('requestDate', { ascending: false })
          .limit(10);

        if (!recentError && recentData) {
          setRecentRequests(recentData);
        }

        // Fetch pending requests for admin/superadmin
        if (user?.role === 'admin' || user?.role === 'superadmin') {
          const { data: pendingData, error: pendingError } = await supabase
            .from('Requests')
            .select('*')
            .eq('status', 'pending')
            .order('requestDate', { ascending: false });

          if (!pendingError && pendingData) {
            setPendingRequestsState(pendingData);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, [user?.role]);

  const handleApprove = async (request: any) => {
    try {
      // Check if there's enough stock
      const item = inventory.find(i => i.name === request.itemName);
      if (!item) {
        alert(`Item "${request.itemName}" not found in inventory`);
        return;
      }

      if (item.quantity < request.quantity) {
        alert(`Not enough stock for "${request.itemName}". Available: ${item.quantity}, Requested: ${request.quantity}`);
        return;
      }

      // Update request status to approved and set approval date
      const { error: updateError } = await supabase
        .from('Requests')
        .update({ 
          status: 'approved',
          approvedDate: new Date().toISOString() // Set current timestamp when approved
        })
        .eq('id', request.id);

      if (updateError) {
        alert('Error approving request: ' + updateError.message);
        return;
      }

      // Deduct stock immediately
      const success = await updateInventoryStock(request.itemName, request.quantity);
      
      if (success) {
        // Mark as processed
        await supabase
          .from('Requests')
          .update({ processed: true })
          .eq('id', request.id);

        alert(`Request approved and ${request.quantity} ${request.itemName} deducted from inventory`);
        
        // Remove from pending requests
        setPendingRequestsState(prev => prev.filter(r => r.id !== request.id));
      } else {
        alert('Request approved but failed to update inventory. Please check manually.');
      }
    } catch (error) {
      console.error('Error in handleApprove:', error);
      alert('Error processing approval');
    }
  };

  const handleDeny = async (requestId: string) => {
    const { error } = await supabase
      .from('Requests')
      .update({ 
        status: 'denied',
        deniedDate: new Date().toISOString() // Set current timestamp when denied
      })
      .eq('id', requestId);
    
    if (!error) {
      setPendingRequestsState(prev => prev.filter(r => r.id !== requestId));
    } else {
      alert('Error denying request: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'card' ? 'default' : 'outline'}
            size="icon"
            aria-label="Card view"
            onClick={() => setViewMode('card')}
          >
            <LayoutGrid className="w-5 h-5" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            aria-label="List view"
            onClick={() => setViewMode('list')}
          >
            <List className="w-5 h-5" />
          </Button>
          {(user?.role === 'admin' || user?.role === 'superadmin') && (
            <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-teal-500 to-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          )}
        </div>
      </div>

      {/* Pending Requests Section - for admin and superadmin */}
      {(user?.role === 'admin' || user?.role === 'superadmin') && pendingRequestsState.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pending Requests ({pendingRequestsState.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequestsState.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-white rounded border">
                  <div>
                    <span className="font-medium">{request.userName}</span> requested{' '}
                    <span className="font-bold">{request.quantity}</span> {request.itemName}
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(request.requestDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(request)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeny(request.id)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Deny
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInventory.map((item) => (
            <Card key={item.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-grey-500 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                  {/* Show low stock alert for admin and superadmin only */}
                  {(userRole === 'superadmin' || userRole === 'admin') && isLowStock(item) && (
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Superadmin and admin can see stock info */}
                {(userRole === 'superadmin' || userRole === 'admin') && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Stock</p>
                      <p className={`font-semibold ${item.quantity <= item.minstock ? 'text-red-600' : 'text-green-600'}`}>
                        {item.quantity}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Min Stock</p>
                      <p className="font-semibold">{item.minstock}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Supplier</p>
                      <p className="font-semibold text-xs">{item.supplier}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Price</p>
                      <p className="font-semibold">₱{item.price}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  {user?.role === 'user' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRequestingItem(item.id)}
                      className="flex-1"
                      disabled={item.quantity === 0}
                    >
                      Request
                    </Button>
                  )}
                  {/* Only superadmin can edit or delete */}
                  {user?.role === 'superadmin' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingItem(item.id)}
                        className="flex-1"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Stock</th>
                <th className="px-4 py-2 text-left">Min Stock</th>
                <th className="px-4 py-2 text-left">Supplier</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">{item.category}</td>
                  <td className={`px-4 py-2 ${item.quantity <= item.minstock ? 'text-red-600' : 'text-green-600'}`}>{item.quantity}</td>
                  <td className="px-4 py-2">{item.minstock}</td>
                  <td className="px-4 py-2">{item.supplier}</td>
                  <td className="px-4 py-2 flex gap-2">
                    {user?.role === 'user' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRequestingItem(item.id)}
                        disabled={item.quantity === 0}
                      >
                        Request
                      </Button>
                    )}
                    {user?.role === 'superadmin' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingItem(item.id)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredInventory.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Try adjusting your search terms.' : 'No inventory items available.'}
          </p>
        </div>
      )}

      <AddItemDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      <EditItemDialog itemId={editingItem} onClose={() => setEditingItem(null)} />
      <RequestItemDialog itemId={requestingItem} onClose={() => setRequestingItem(null)} />

      {/* Recent Activity Section - for admin and superadmin */}
      {(user?.role === 'admin' || user?.role === 'superadmin') && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Recent Activity
          </h2>
          <div className="bg-white rounded shadow p-4">
            {loading ? (
              <div className="text-gray-500 text-sm">Loading...</div>
            ) : recentRequests.length > 0 ? (
              <ul className="divide-y">
                {recentRequests.map((req) => (
                  <li key={req.id} className="py-3 flex flex-col md:flex-row md:justify-between md:items-center">
                    <div>
                      <span className="font-medium">{req.userName}</span> requested{' '}
                      <span className="font-bold">{req.quantity}</span> {req.itemName}
                      <Badge 
                        className="ml-2" 
                        variant={
                          req.status === 'approved' ? 'default' :
                          req.status === 'denied' ? 'destructive' : 'secondary'
                        }
                      >
                        {req.status}
                      </Badge>
                    </div>
                    <div className="text-gray-500 text-xs mt-1 md:mt-0">
                      {req.requestDate
                        ? new Date(req.requestDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : ''}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500 text-sm">No recent activity.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;


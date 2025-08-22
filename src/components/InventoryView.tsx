import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Edit, Trash2, Package, AlertTriangle } from 'lucide-react';
import AddItemDialog from './AddItemDialog';
import EditItemDialog from './EditItemDialog';
import RequestItemDialog from './RequestItemDialog';

const InventoryView: React.FC = () => {
  const { user, inventory, deleteItem } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [requestingItem, setRequestingItem] = useState<string | null>(null);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      deleteItem(id);
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
        {user?.role === 'admin' && (
          <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-teal-500 to-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInventory.map((item) => (
          <Card key={item.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {item.category}
                    </Badge>
                  </div>
                </div>
                {user?.role === 'admin' && item.quantity <= item.minstock && (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {user?.role === 'admin' && (
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
                {user?.role === 'admin' && (
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
    </div>
  );
};

export default InventoryView;
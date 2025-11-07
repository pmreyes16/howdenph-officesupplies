import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { v4 as uuidv4 } from 'uuid'; // ✅ Correct import

interface RequestItemDialogProps {
  itemId: string | null;
  onClose: () => void;
}

const RequestItemDialog: React.FC<RequestItemDialogProps> = ({ itemId, onClose }) => {
  const { inventory, user } = useApp();
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');

  const item = itemId ? inventory.find(i => i.id === itemId) : null;

  useEffect(() => {
    if (!itemId || !item || !user) {
      console.warn('RequestItemDialog: Invalid item or user');
    }
  }, [itemId, item, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemId || !item || !user) return;

    // Fetch supplier from inventory table
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('Inventory')
      .select('supplier')
      .eq('id', itemId)
      .single();

    if (inventoryError) {
      console.error('Error fetching supplier:', inventoryError);
    }

    const supplier = inventoryData?.supplier || 'N/A';

    const insertObj = {
      id: uuidv4(), // Add unique ID
      itemName: item.name,
      userName: user.name,
      department: user.department,
      quantity: parseInt(quantity),
      price: typeof item.price === 'number' ? item.price : 0,
      supplier: supplier, // Add supplier from inventory
      status: 'pending',
      requestDate: new Date().toISOString(),
      userId: user.id,
      notes: notes || null,
    };

    console.log('Insert object:', insertObj);

    const { error } = await supabase.from('Requests').insert([insertObj]);
    if (error) {
      alert('Error submitting request: ' + error.message);
    } else {
      setQuantity('1');
      setNotes('');
      onClose();
    }
  };

  if (!item) return null;

  return (
    <Dialog open={!!itemId} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md" aria-describedby="request-item-description">
        <DialogHeader>
          <DialogTitle>Request Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg" id="request-item-description">
            <h4 className="font-semibold text-gray-900">{item.name}</h4>
            <p className="text-sm text-gray-600">Available: {item.quantity} units</p>
            <p className="text-sm text-gray-600">Category: {item.category}</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity Requested</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={item.quantity}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Add any additional notes for your request..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={item.quantity === 0}>
              Submit Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RequestItemDialog;
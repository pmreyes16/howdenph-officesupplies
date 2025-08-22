import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categories = ['Writing', 'Paper', 'Tools', 'Electronics', 'Furniture', 'Cleaning', 'Other'];

const AddItemDialog: React.FC<AddItemDialogProps> = ({ open, onOpenChange }) => {
  const { addItem } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    minstock: '',
    supplier: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = {
      id: Date.now().toString(), // or use uuid if preferred
      name: formData.name,
      category: formData.category,
      quantity: parseInt(formData.quantity),
      minstock: parseInt(formData.minstock),
      supplier: formData.supplier
    };
    const { error } = await supabase.from('Inventory').insert([newItem]);
    if (error) {
      console.error('Supabase insert error:', error.message, error.details);
    }
    addItem(newItem);
    setFormData({
      name: '',
      category: '',
      quantity: '',
      minstock: '',
      supplier: ''
    });
    onOpenChange(false);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minstock">Min Stock</Label>
              <Input
                id="minstock"
                type="number"
                min="0"
                value={formData.minstock}
                onChange={(e) => handleChange('minstock', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Input
              id="supplier"
              value={formData.supplier}
              onChange={(e) => handleChange('supplier', e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Item</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemDialog;
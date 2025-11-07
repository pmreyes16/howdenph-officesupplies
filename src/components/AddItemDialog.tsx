import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// Example item numbers for demonstration (should come from your inventory DB in production)
const itemNumbers = [
  { number: 'ITM-001', price: 10, supplier: 'Supplier A', count: 100 },
  { number: 'ITM-002', price: 25, supplier: 'Supplier B', count: 50 },
  { number: 'ITM-003', price: 5, supplier: 'Supplier C', count: 200 },
];

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
  const [price, setPrice] = useState('');
  const [itemNumber, setItemNumber] = useState('');

  // When user types an item number, check if it exists and auto-fill fields if so
  const handleItemNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setItemNumber(value);
    const found = itemNumbers.find(i => i.number === value);
    if (found) {
      setPrice(found.price.toString());
      setFormData(prev => ({ ...prev, supplier: found.supplier }));
    } else {
      setPrice('');
      setFormData(prev => ({ ...prev, supplier: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.category ||
      !formData.supplier ||
      !itemNumber ||
      parseInt(formData.quantity) < 0 ||
      parseInt(formData.minstock) < 0 ||
      price === '' ||
      isNaN(Number(price))
    ) {
      alert('Please fill in all fields correctly.');
      return;
    }
    const newItem = {
      id: uuidv4(),
      name: formData.name,
      category: formData.category,
      quantity: parseInt(formData.quantity),
      minstock: parseInt(formData.minstock),
      supplier: formData.supplier,
      price: Number(price),
      itemNumber,
    };
    const { error } = await supabase.from('Inventory').insert([newItem]);
    if (error) {
      alert('Error adding item: ' + error.message);
    } else {
      addItem(newItem);
      setFormData({
        name: '',
        category: '',
        quantity: '',
        minstock: '',
        supplier: ''
      });
      setPrice('');
      setItemNumber('');
      onOpenChange(false);
    }
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
          <div className="space-y-2">
            <Label htmlFor="itemNumber">Item Number</Label>
            <Input
              id="itemNumber"
              placeholder="Enter or create item number"
              value={itemNumber}
              onChange={handleItemNumberInput}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={e => handleChange('supplier', e.target.value)}
                required
              />
            </div>
          </div>
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
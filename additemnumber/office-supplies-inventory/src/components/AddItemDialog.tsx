import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

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
    supplier: '',
    itemNumber: ''
  });
  const [price, setPrice] = useState(0);
  const [itemNumbers, setItemNumbers] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchItemNumbers = async () => {
      const { data, error } = await supabase.from('Inventory').select('id, price, supplier, quantity');
      if (error) {
        console.error('Error fetching item numbers:', error);
      } else {
        setItemNumbers(data);
      }
    };
    fetchItemNumbers();
  }, []);

  const handleItemNumberChange = (value: string) => {
    const selected = itemNumbers.find(item => item.id === value);
    if (selected) {
      setSelectedItem(selected);
      setPrice(selected.price);
      setFormData(prev => ({
        ...prev,
        supplier: selected.supplier,
        quantity: selected.quantity.toString(),
        itemNumber: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.supplier || parseInt(formData.quantity) < 0 || parseInt(formData.minstock) < 0 || price < 0) {
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
      price
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
        supplier: '',
        itemNumber: ''
      });
      setPrice(0);
      setSelectedItem(null);
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="itemNumber">Item Number</Label>
              <Select value={formData.itemNumber} onValueChange={handleItemNumberChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select item number" />
                </SelectTrigger>
                <SelectContent>
                  {itemNumbers.map(item => (
                    <SelectItem key={item.id} value={item.id}>{item.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
          </div>
          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => handleChange('supplier', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              type="number"
              placeholder="Price"
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
              min={0}
              step={0.01}
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
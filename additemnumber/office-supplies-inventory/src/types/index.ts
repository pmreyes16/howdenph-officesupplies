export interface Item {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minstock: number;
  supplier: string;
  price: number;
}

export interface Inventory {
  items: Item[];
}

export interface AddItemFormData {
  name: string;
  category: string;
  quantity: string;
  minstock: string;
  supplier: string;
  price: number;
}

export interface ItemNumber {
  number: string;
  price: number;
  supplier: string;
  quantity: number;
}
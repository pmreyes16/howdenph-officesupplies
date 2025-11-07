import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const addItemToInventory = async (item) => {
    const newItem = { ...item, id: Date.now().toString() };
    const { data, error } = await supabase
        .from('Inventory')
        .insert([newItem]);

    if (error) {
        console.error('Error adding item to inventory:', error);
        return null;
    }

    return data;
};

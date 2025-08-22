import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qcsdytspmmnqwdrwoiuj.supabase.co'; // Replace with your Supabase project URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjc2R5dHNwbW1ucXdkcndvaXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3Mjc3MTksImV4cCI6MjA3MDMwMzcxOX0.TsiyC1f2VaB9RtmlAQPFlAKM5rDlWY0EJX4sZN2wFpc'; // Replace with your Supabase anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

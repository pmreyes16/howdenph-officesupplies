import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const SupabaseDebug: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: inventoryData, error: inventoryError } = await supabase.from('Inventory').select('*');
      const { data: requestsData, error: requestsError } = await supabase.from('Requests').select('*');
      if (inventoryError || requestsError) {
        setError((inventoryError?.message || '') + ' ' + (requestsError?.message || ''));
      } else {
        setInventory(inventoryData || []);
        setRequests(requestsData || []);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Supabase Inventory & Requests Debug</h2>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      <h3>Inventory Table</h3>
      <table border={1} cellPadding={8} style={{ marginBottom: 24 }}>
        <thead>
          <tr>
            <th>id</th>
            <th>name</th>
            <th>category</th>
            <th>quantity</th>
            <th>minStock</th>
            <th>price</th>
            <th>supplier</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.category}</td>
              <td>{item.quantity}</td>
              <td>{item.minStock}</td>
              <td>{item.price}</td>
              <td>{item.supplier}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Requests Table</h3>
      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>id</th>
            <th>userId</th>
            <th>userName</th>
            <th>department</th>
            <th>itemId</th>
            <th>itemName</th>
            <th>quantity</th>
            <th>status</th>
            <th>requestDate</th>
            <th>approvedDate</th>
            <th>fulfilledDate</th>
            <th>notes</th>
            <th>adminNotes</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(req => (
            <tr key={req.id}>
              <td>{req.id}</td>
              <td>{req.userId}</td>
              <td>{req.userName}</td>
              <td>{req.department}</td>
              <td>{req.itemId}</td>
              <td>{req.itemName}</td>
              <td>{req.quantity}</td>
              <td>{req.status}</td>
              <td>{req.requestDate}</td>
              <td>{req.approvedDate}</td>
              <td>{req.fulfilledDate}</td>
              <td>{req.notes}</td>
              <td>{req.adminNotes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SupabaseDebug;

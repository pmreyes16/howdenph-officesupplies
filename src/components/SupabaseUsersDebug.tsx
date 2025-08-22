import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const SupabaseUsersDebug: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from('Users').select('*');
      if (error) setError(error.message);
      else setUsers(data || []);
    };
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Supabase Users Table Debug</h2>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      <table border={1} cellPadding={8} style={{ marginTop: 8 }}>
        <thead>
          <tr>
            <th>id</th>
            <th>name</th>
            <th>email</th>
            <th>role</th>
            <th>password</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.password}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SupabaseUsersDebug;

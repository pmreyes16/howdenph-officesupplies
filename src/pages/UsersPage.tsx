import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface User {
  id: string;
  name?: string;
  email?: string;
  username?: string;
  role: string;
  department?: string;
  password?: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<User>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    let data, error;
    // Try 'Users' first
    ({ data, error } = await supabase.from('Users').select('*'));
    if (error || !data) {
      // If error, try 'users'
      const res = await supabase.from('users').select('*');
      if (res.error) {
        setError(res.error.message);
        setUsers([]);
      } else {
        setUsers(res.data || []);
        setError(null);
      }
    } else {
      setUsers(data || []);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setEditData({
      name: user.name ?? '',
      email: user.email ?? '',
      role: user.role ?? 'user',
      department: user.department ?? ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async (id: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    // Always include role in update
    const updateData = { ...editData, role: editData.role ?? 'user' };
    let error = (await supabase.from('Users').update(updateData).eq('id', id)).error;
    if (error) {
      error = (await supabase.from('users').update(updateData).eq('id', id)).error;
    }
    if (error) {
      setError(error.message);
      setSuccess(null);
    } else {
      setEditingId(null);
      setEditData({});
      setSuccess('User role updated successfully!');
      fetchUsers();
    }
    setLoading(false);
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setLoading(true);
    let error = (await supabase.from('Users').delete().eq('id', id)).error;
    if (error) {
      error = (await supabase.from('users').delete().eq('id', id)).error;
    }
    if (error) setError(error.message);
    else fetchUsers();
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <button
          type="button"
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          onClick={() => window.history.back()}
        >
          ← Back
        </button>
        <div className="flex gap-2">
          <Button onClick={fetchUsers} variant="outline">View Users</Button>
          <a href="/request-history">
            <Button variant="outline">View History</Button>
          </a>
        </div>
      </div>
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
  {error && <div className="text-red-600 mb-2">{error}</div>}
  {success && <div className="text-green-600 mb-2">{success}</div>}
      {loading && <div className="text-gray-500 mb-2">Loading...</div>}
      <table className="w-full border mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Department</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <tr key={user.id || user.email || idx}>
              <td className="border p-2">
                {editingId === user.id ? (
                  <Input value={editData.name || ''} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} />
                ) : (user.name || user.email || user.username || '-')}
              </td>
              <td className="border p-2">
                {editingId === user.id ? (
                  <Input value={editData.email || ''} onChange={e => setEditData(d => ({ ...d, email: e.target.value }))} />
                ) : (user.email || user.username || user.name || '-')}
              </td>
              <td className="border p-2">
                {editingId === user.id ? (
                  <select
                    value={editData.role || ''}
                    onChange={e => setEditData(d => ({ ...d, role: e.target.value }))}
                    className="border rounded px-2 py-1"
                  >
                    <option value="user">Standard User</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                ) : user.role}
              </td>
              <td className="border p-2">
                {user.department || '-'}
              </td>
              <td className="border p-2">
                {editingId === user.id ? (
                  <>
                    <Button size="sm" onClick={() => saveEdit(user.id)} className="mr-2">Save</Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" onClick={() => startEdit(user)} className="mr-2">Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteUser(user.id)}>Delete</Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersPage;

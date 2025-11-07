import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useApp } from '@/contexts/AppContext';

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  department?: string;
};

const roles = ['user', 'admin', 'superadmin'] as const;

const roleColors: Record<User['role'], string> = {
  user: 'bg-gray-200 text-gray-800',
  admin: 'bg-blue-200 text-blue-800',
  superadmin: 'bg-red-200 text-red-800',
};

const Spinner = () => (
  <svg className="animate-spin h-4 w-4 text-gray-500 inline ml-1" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
  </svg>
);

const ViewUsers: React.FC = () => {
  const { user, users } = useApp();
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<User>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!user || user.role !== 'superadmin') {
    return <div className="text-center text-red-600 mt-10 text-lg">Access denied.</div>;
  }

  const handleEdit = (u: User) => {
    setEditId(u.id);
    setEditData(u);
    setError(null);
  };

  const handleCancel = () => {
    setEditId(null);
    setEditData({});
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const { id, ...updateFields } = editData;
    const { error: updateError } = await supabase
      .from('Users')
      .update(updateFields)
      .eq('id', editId);
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
    } else {
      setEditId(null);
      setEditData({});
      window.location.reload();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    setDeletingId(id);
    setError(null);
    const { error: deleteError } = await supabase
      .from('Users')
      .delete()
      .eq('id', id);
    setDeletingId(null);
    if (deleteError) {
      setError(deleteError.message);
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Users List</h2>
      {error && <div className="text-red-600 mb-2 text-center">{error}</div>}
      <div className="overflow-x-auto rounded shadow">
        <table className="min-w-full bg-white border rounded text-sm">
          <thead>
            <tr className="bg-gradient-to-r from-blue-50 to-teal-50">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users && users.length > 0 ? (
              users.map((u, idx) => (
                <tr
                  key={u.id}
                  className={`transition-colors duration-150 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50`}
                >
                  <td className="p-2">
                    {editId === u.id ? (
                      <input
                        name="name"
                        value={editData.name ?? ''}
                        onChange={handleChange}
                        className="border px-2 py-1 rounded w-full"
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium">{u.name}</span>
                    )}
                  </td>
                  <td className="p-2">
                    {editId === u.id ? (
                      <input
                        name="email"
                        value={editData.email ?? ''}
                        onChange={handleChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    ) : (
                      u.email
                    )}
                  </td>
                  <td className="p-2">
                    {editId === u.id ? (
                      <select
                        name="role"
                        value={editData.role ?? ''}
                        onChange={handleChange}
                        className="border px-2 py-1 rounded w-full"
                      >
                        {roles.map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${roleColors[u.role]}`}>
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td className="p-2">
                    {editId === u.id ? (
                      <input
                        name="department"
                        value={editData.department ?? ''}
                        onChange={handleChange}
                        className="border px-2 py-1 rounded w-full"
                      />
                    ) : (
                      u.department
                    )}
                  </td>
                  <td className="p-2">
                    {editId === u.id ? (
                      <>
                        <button
                          className="px-3 py-1 bg-green-500 text-white rounded mr-2 hover:bg-green-600 transition"
                          onClick={handleSave}
                          disabled={saving}
                        >
                          {saving ? <>Saving<Spinner /></> : 'Save'}
                        </button>
                        <button
                          className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 transition"
                          onClick={handleCancel}
                          disabled={saving}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="px-3 py-1 bg-blue-500 text-white rounded mr-2 hover:bg-blue-600 transition"
                          onClick={() => handleEdit(u)}
                          disabled={deletingId === u.id}
                        >
                          Edit
                        </button>
                        <button
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                          onClick={() => handleDelete(u.id)}
                          disabled={deletingId === u.id}
                        >
                          {deletingId === u.id ? <>Deleting<Spinner /></> : 'Delete'}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="border px-4 py-6 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewUsers;

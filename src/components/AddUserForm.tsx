import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddUserFormProps {
  onAdd: (user: { id: string; name: string; email: string; role: 'admin' | 'user'; password: string; department: string }) => void;
  onClose: () => void;
}

const AddUserForm: React.FC<AddUserFormProps> = ({ onAdd, onClose }) => {
  // Autogenerate id using crypto.randomUUID()
  const id = React.useMemo(() => (window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).slice(2)), []);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const departments = ['Office of the President','CRS', 'EB', 'RI', 'Claims', 'Finance', 'IT', 'Admin', 'Human Resources'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    Promise.resolve(onAdd({ id, name, email, role, password, department }))
      .then(() => onClose())
      .catch((err: any) => setError(err.message || 'Failed to add user.'));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm space-y-4">
        <h2 className="text-xl font-bold mb-2">Add User</h2>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <div>
            {/* <Label htmlFor="id">ID</Label>
            <Input id="id" value={id} onChange={e => setId(e.target.value)} required /> */}
        </div>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="role">Role</Label>
          <select id="role" value={role} onChange={e => setRole(e.target.value as 'admin' | 'user')} className="w-full border rounded px-2 py-1">
            <option value="user">Standard User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dep => (
                <SelectItem key={dep} value={dep}>{dep}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">Add User</Button>
        </div>
      </form>
    </div>
  );
};

export default AddUserForm;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Package } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const LoginForm: React.FC = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ackChecked, setAckChecked] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 800));
    try {
      const success = await login(username, password);
      if (success) {
        navigate('/'); // Redirect to dashboard or home
      } else {
        setError('Invalid credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <img src="/Logo.png" alt="Logo" className="mx-auto mb-4" style={{ width: '196px' }} />
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Office Supplies
            </CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Inventory Management System
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="h-11"
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
                disabled={isLoading || !ackChecked}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            <div className={`mt-4 border border-gray-500 rounded-md p-2 bg-black bg-opacity-50 text-white w-full h-auto text-xs space-y-2`}>
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="acknowledgement"
                  className="mt-1"
                  checked={ackChecked}
                  onChange={e => setAckChecked(e.target.checked)}
                />
                <label htmlFor="acknowledgement" className="text-xs">
                  I accept and acknowledge the statement below
                </label>
              </div>
              <p className="font-bold text-teal-400 text-left text-xs">
                * UNAUTHORIZED ACCESS TO THIS APPLICATION IS PROHIBITED *
              </p>
              <p className="text-xs text-justify leading-snug">
                <strong>WARNING:</strong> You must have explicit, authorized
                permission to access or configure this device. Unauthorized
                attempts and actions to access or use this system may result in
                civil and/or criminal penalties. All activities performed on
                this device are logged and monitored.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Package } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';

// Extend ImportMeta interface for Vite env variables
declare global {
  interface ImportMeta {
    env: {
      VITE_SUPABASE_URL: string;
      VITE_SUPABASE_ANON_KEY: string;
      [key: string]: any;
    };
  }
}

// Use shared Supabase client from src/lib/supabaseClient.ts

const LoginForm: React.FC = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ackChecked, setAckChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [showForgot, setShowForgot] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 800));
    try {
      const result = await login(username, password);
      let logData;
      if (
        result &&
        typeof result === 'object' &&
        'success' in result &&
        result.success &&
        'user' in result &&
        result.user != null
      ) {
        // Successful login
        logData = {
          user_id: result.user.id && /^[0-9a-fA-F-]{36}$/.test(result.user.id) ? result.user.id : null,
          username: username,
          login_time: new Date().toISOString(),
          ip_address: window.location.hostname,
          user_agent: navigator.userAgent,
          success: true,
          action: 'login-success',
        };
        navigate('/'); // Redirect to dashboard or home
      } else {
        // Unsuccessful login
        logData = {
          user_id: null,
          username,
          login_time: new Date().toISOString(),
          ip_address: window.location.hostname,
          user_agent: navigator.userAgent,
          success: false,
          action: 'login-failed',
        };
        setError('Invalid credentials.');
      }
      // Insert login log into 'loginlogs' table only
      console.log('Login log insert object:', logData);
      try {
        const { error } = await supabase.from('loginlogs').insert([logData]);
        if (error) console.error('Supabase loginlogs insert error:', error.message, error.details);
      } catch (e) {
        console.error('Supabase loginlogs insert exception:', e);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    }
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMessage('');
    setForgotError('');
    if (!forgotEmail) {
      setForgotError('Please enter your email.');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: window.location.origin + '/reset-password'
    });
    if (error) {
      setForgotError(error.message);
    } else {
      setForgotMessage('Password reset email sent! Please check your inbox.');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[600px] h-[600px] bg-gradient-to-br from-blue-400 via-grey-400 to-pink-400 opacity-30 rounded-full blur-3xl animate-float1" style={{ top: '-200px', left: '-200px' }} />
        <div className="absolute w-[400px] h-[400px] bg-gradient-to-br from-teal-300 via-blue-300 to-grey-300 opacity-20 rounded-full blur-2xl animate-float2" style={{ bottom: '-100px', right: '-100px' }} />
      </div>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-grey-50 p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <img src="/Logo.png" alt="Logo" className="mx-auto mb-4" style={{ width: '196px' }} />
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-grey-600 bg-clip-text text-transparent">
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
                <div className="space-y-2 relative">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-8 text-gray-500 hover:text-gray-700 focus:outline-none"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-medium"
                  disabled={isLoading || !ackChecked}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
              <div className="text-sm">
                <button
                  type="button"
                  className="text-blue-500 hover:underline"
                  onClick={() => setShowForgot(true)}
                >
                  Forgot Password?
                </button>
              </div>
              {showForgot && (
                <div className="mt-6 p-4 border rounded bg-gray-50">
                  <form onSubmit={handleForgotPassword} className="space-y-3">
                    <Label htmlFor="forgot-email" className="text-sm font-medium">Enter your email address</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="you@email.com"
                      required
                    />
                    <div className="flex gap-2">
                      <Button type="submit" className="bg-blue-600 text-white">Send Reset Link</Button>
                      <Button type="button" variant="outline" onClick={() => setShowForgot(false)}>Cancel</Button>
                    </div>
                    {forgotMessage && <div className="text-green-600 text-sm">{forgotMessage}</div>}
                    {forgotError && <div className="text-red-600 text-sm">{forgotError}</div>}
                  </form>
                </div>
              )}
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
    </>
  );
};

export default LoginForm;
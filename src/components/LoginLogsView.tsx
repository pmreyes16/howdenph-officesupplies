import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, User, Search, Filter } from 'lucide-react';

// Try to fetch from 'loginLogs' first, then 'loginlogs' if not found
async function fetchLoginLogs(supabase) {
  let { data, error } = await supabase.from('loginLogs').select('*');
  // If loginLogs exists, always use it
  if (!error || (error && !error.message.includes('Could not find the table'))) {
    return { data, error };
  }
  // If loginLogs does not exist, fallback to loginlogs
  ({ data, error } = await supabase.from('loginlogs').select('*'));
  return { data, error };
}


const LoginLogsView: React.FC = () => {
  const { user } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
  let { data, error } = await fetchLoginLogs(supabase);
      if (error) setError(error.message);
      setLogs(data || []);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  // Only admins see all logs; users see only their own
  let userLogs: typeof logs = [];
  if (user && user.role === 'admin') {
    userLogs = logs;
  } else if (user && user.role) {
    userLogs = logs.filter(log => log.user_id === user.id);
  }

  const filteredLogs = userLogs.filter(log => {
    const matchesSearch = (log.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (log.ip_address?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold">Login Logs</h2>
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
  <div className="grid gap-4 max-h-[500px] overflow-y-auto rounded-lg border border-gray-200 bg-white/80 p-2">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No login logs found</h3>
              <p className="text-gray-600">
                {searchTerm
                  ? 'Try adjusting your search criteria.'
                  : 'No login logs have been recorded yet.'
                }
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{log.username}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(log.login_time).toLocaleString()}</span>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {log.action}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default LoginLogsView;

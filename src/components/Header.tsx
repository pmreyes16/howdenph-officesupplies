import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LogOut, Package, User, Shield, Bell } from 'lucide-react';
import NotificationBadge from './NotificationBadge';

const Header: React.FC = () => {
  const { user, logout, requests } = useApp();
  const [showNotifications, setShowNotifications] = React.useState(false);

  if (!user) return null;

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-16 py-2 sm:py-0">
          <div className="flex items-center space-x-3 mb-2 sm:mb-0">
            <img src="/Logo.png" alt="Logo" className="mx-auto" style={{ width: '196px' }} />
            <div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Office Supplies
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">Inventory Management</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            {user.role === 'admin' && (
              <div className="relative">
                <Button variant="ghost" size="sm" className="relative" onClick={() => setShowNotifications(v => !v)}>
                  <Bell className="w-4 h-4" />
                  <NotificationBadge className="absolute -top-1 -right-1 h-5 w-5 text-xs" />
                </Button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded shadow-lg z-50">
                    <div className="p-4 border-b font-bold text-gray-700">New Requests</div>
                    <ul className="max-h-64 overflow-y-auto">
                      {requests.filter(r => r.status === 'pending').length === 0 ? (
                        <li className="p-4 text-gray-500 text-sm">No new requests.</li>
                      ) : (
                        requests.filter(r => r.status === 'pending').map(r => (
                          <li key={r.id} className="p-4 border-b last:border-b-0 flex flex-col">
                            <span className="font-semibold text-blue-600">{r.itemName}</span>
                            <span className="text-xs text-gray-500">Requested by: {r.userName} ({r.department})</span>
                            <span className="text-xs text-gray-500">Qty: {r.quantity} | Date: {r.requestDate}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">{user.department}</span>
                  {user.role === 'admin' ? (
                    <Shield className="w-3 h-3 text-blue-600" />
                  ) : (
                    <User className="w-3 h-3 text-gray-600" />
                  )}
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                    {user.role}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
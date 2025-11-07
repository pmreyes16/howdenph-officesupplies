import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useApp();

  if (!user) return null;

  return (
    <header className="bg-white shadow px-8 md:px-20 lg:px-32 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-6 flex-shrink-0">
        <img src="/Logo.png" alt="Logo" className="h-16 ml-4 md:ml-10" />
        <div className="flex flex-col">
          <span className="text-lg font-semibold">Office Supplies</span>
          <span className="text-sm text-gray-500">Inventory Management</span>
        </div>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-500 text-white text-sm">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-end">
            <span className="font-semibold">{user?.name}</span>
            <span className="text-xs text-gray-500">{user?.department}</span>
          </div>
          {user?.role && (
            <span
              className={`ml-2 px-3 py-1 rounded-full text-xs font-bold
                ${user.role === 'admin'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 text-gray-700'
                }`}
            >
              {user.role}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="flex items-center space-x-2 ml-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
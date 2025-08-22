import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';

interface NotificationBadgeProps {
  className?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ className = '' }) => {
  const { requests, user } = useApp();
  
  if (user?.role !== 'admin') return null;
  
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  
  if (pendingCount === 0) return null;
  
  return (
    <Badge variant="destructive" className={`${className} animate-pulse`}>
      {pendingCount}
    </Badge>
  );
};

export default NotificationBadge;
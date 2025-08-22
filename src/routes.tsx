import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import Dashboard from '@/components/Dashboard';
import LoginForm from '@/components/LoginForm';
import UsersPage from '@/pages/UsersPage';
import NotFound from '@/pages/NotFound';

const AppRoutes: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<LoginForm />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/" element={<AppLayout />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Router>
);

export default AppRoutes;

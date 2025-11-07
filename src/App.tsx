import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import UsersPage from '@/pages/UsersPage';
import RequestHistoryPage from './pages/RequestHistoryPage';
import { createClient } from '@supabase/supabase-js';
import UsersView from './components/ViewUsers';
import { AppProvider } from '@/contexts/AppContext';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const queryClient = new QueryClient();

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  password: string;
  department: string;
};

// Updated to match AddUserFormProps
const addUser = (user: { id: string; name: string; email: string; role: 'superadmin' | 'admin' | 'user'; password: string; department: string }) => {
  // implementation (make sure to handle the id and superadmin role)
  // Example: Insert user into Supabase
  return supabase.from('Users').insert([user]);
};

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppProvider>
          {/* Use RouterProvider with future flags for React Router v7 compatibility */}
          <RouterProvider
            router={createBrowserRouter([
              { path: "/", element: <Index /> },
              { path: "/users", element: <UsersView /> },
              { path: "/request-history", element: <RequestHistoryPage /> },
              { path: "*", element: <NotFound /> },
            ])}
            future={{
              v7_startTransition: true,
            }}
          />
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;

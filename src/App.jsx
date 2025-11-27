

import Login from './pages/Login';
import Register from './pages/Register';
import WorkflowRun from './pages/WorkflowRun';
import LandingPage from './pages/LandingPage';
import WorkflowList from './pages/WorkflowList';
import WorkflowBuilder from './pages/WorkflowBuilder';
import DashboardLayout from './layouts/DashboardLayout';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Toaster } from "@/components/ui/sonner"; 

const queryClient = new QueryClient();


const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token || token === 'undefined' || token === 'null') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token && token !== 'undefined' && token !== 'null') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<WorkflowList />} />
            <Route path="create" element={<WorkflowBuilder />} />
            <Route path="edit/:id" element={<WorkflowBuilder />} />
            <Route path="run/:id" element={<WorkflowRun />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      
      
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}

export default App;
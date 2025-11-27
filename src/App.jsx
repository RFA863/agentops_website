import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import WorkflowBuilder from './pages/WorkflowBuilder';
import WorkflowRun from './pages/WorkflowRun';

const queryClient = new QueryClient();

// Komponen Proteksi Route
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            {/* Dashboard Default: Langsung ke create workflow agar cepat dites */}
            <Route index element={<Navigate to="/workflows/create" replace />} /> 
            
            <Route path="workflows/create" element={<WorkflowBuilder />} />
            <Route path="workflows/run/:id" element={<WorkflowRun />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
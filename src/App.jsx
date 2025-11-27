import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardLayout from './layouts/DashboardLayout';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import WorkflowBuilder from './pages/WorkflowBuilder';
import WorkflowRun from './pages/WorkflowRun';
import WorkflowList from './pages/WorkflowList';

const queryClient = new QueryClient();

// Komponen Proteksi Route
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  // Cek token valid sederhana
  if (!token || token === 'undefined' || token === 'null') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Komponen Public Route (Redirect ke dashboard jika sudah login)
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
          {/* Public Routes */}
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          
          
          {/* Protected Dashboard Routes */}
         <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            {/* GANTI INI: Jangan redirect ke create lagi */}
            <Route index element={<WorkflowList />} /> 
            
            {/* Route lainnya tetap sama */}
            <Route path="create" element={<WorkflowBuilder />} />
            <Route path="run/:id" element={<WorkflowRun />} />
        </Route>

          {/* Catch all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
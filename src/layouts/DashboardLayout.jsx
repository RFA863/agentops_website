import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, LogOut, Bot } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = [
    // Pastikan path-nya '/dashboard' saja (yang akan merender WorkflowList)
    { label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4 mr-2" />, path: '/dashboard' },
    { label: 'Create Workflow', icon: <PlusCircle className="w-4 h-4 mr-2" />, path: '/dashboard/create' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <div className="bg-indigo-600 p-1 rounded">
            <Bot className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">AgentOps</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Dashboard</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Button 
                variant={location.pathname === item.path ? "secondary" : "ghost"} 
                className={`w-full justify-start ${location.pathname === item.path ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' : 'text-slate-600'}`}
              >
                {item.icon}
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-slate-200 p-4 md:hidden flex justify-between items-center">
           <h1 className="font-bold text-slate-900">AgentOps</h1>
           <Button size="sm" variant="ghost" onClick={handleLogout}><LogOut className="w-4 h-4" /></Button>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
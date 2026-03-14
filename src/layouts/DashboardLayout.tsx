import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  History, 
  LogOut, 
  Bell, 
  Calendar,
  ChevronRight
} from 'lucide-react';

const DashboardLayout = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Dashboard';
      case '/faculty-review': return 'Faculty Review';
      case '/history': return 'History';
      default: return 'Portal';
    }
  };

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Users size={20} />, label: 'Faculty Review', path: '/faculty-review' },
    { icon: <History size={20} />, label: 'History', path: '/history' },
  ];

  return (
    <div className="flex h-screen bg-[#f3f4f6]">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-white flex flex-col shrink-0">
        <div className="p-8 flex flex-col items-center border-b border-white/10">
          <img src="/assets/gc-logo.png" alt="Logo" className="w-16 h-16 mb-4" />
          <h1 className="text-sm font-bold tracking-tight text-center">Gordon College</h1>
          <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold">VPAA RANKING PORTAL</p>
        </div>

        <nav className="flex-1 py-10 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all group
                ${isActive ? 'bg-white/10 text-white font-semibold' : 'text-white/60 hover:text-white hover:bg-white/5'}
              `}
            >
              <div className="group-hover:scale-110 transition-transform">{item.icon}</div>
              <span className="text-sm">{item.label}</span>
              {location.pathname === item.path && (
                <ChevronRight size={14} className="ml-auto text-white/30" />
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-white/10">
              <span className="font-bold text-primary-light">MS</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">Dr. Maria Santos</p>
              <p className="text-[10px] text-white/40 font-semibold uppercase">VPAA Director</p>
            </div>
          </div>
          
          <button className="flex items-center gap-3 px-4 py-3 w-full text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all text-sm font-semibold">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-sidebar">{getPageTitle()}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">VPAA Portal</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
              <Calendar size={16} />
              <span className="text-sm font-semibold">Saturday, Feb 28, 2026</span>
            </div>
            
            <button className="relative p-2 text-slate-400 hover:text-primary transition-colors bg-slate-50 rounded-full border border-slate-200">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

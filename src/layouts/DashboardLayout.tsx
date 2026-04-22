import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  History, 
  LogOut, 
  Bell, 
  Calendar,
  ChevronRight,
  AlertCircle,
  Check
} from 'lucide-react';
import { supabase } from '../supabaseClient'; 

// Define the notification type based on your Supabase table
interface AppNotification {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // User Profile States
  const [userName, setUserName] = useState("Loading...");
  const [userInitials, setUserInitials] = useState("");

  // Notification States
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Logged-in User Profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // 1. Get the current authenticated user
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData?.user) return;

        // 2. Fetch their details from your public.users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('name_first, name_last')
          .eq('user_id', authData.user.id) // Ensure 'user_id' is the correct column name connecting to auth
          .single();

        if (userError) throw userError;

        if (userData) {
          const first = userData.name_first || '';
          const last = userData.name_last || '';
          // We add 'Dr.' here based on your previous mock data, remove if not applicable to all VPAAs!
          setUserName(`Dr. ${first} ${last}`.trim());
          setUserInitials(`${first.charAt(0)}${last.charAt(0)}`.toUpperCase());
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUserName("VPAA User");
        setUserInitials("VP");
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch and subscribe to notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch initial notifications
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        // .eq('user_id', user.id) // Uncomment if notifications are user-specific
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        setNotifications(data);
      }
    };

    fetchNotifications();

    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          setNotifications((prev) => [payload.new as AppNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id: string) => {
    // Update local state instantly
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );

    // Update in Supabase
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    
    // Update all unread in Supabase
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length > 0) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', unreadIds);
    }
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Dashboard';
      case '/faculty-review': return 'Faculty Review';
      case '/history': return 'History';
      default: return 'Portal';
    }
  };

  const handleConfirmLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const getCurrentDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <Users size={20} />, label: 'Faculty Review', path: '/faculty-review' },
    { icon: <History size={20} />, label: 'History', path: '/history' },
  ];

  return (
    <div className="flex h-screen bg-[#f3f4f6]">
      
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
              {/* Dynamic Initials applied here */}
              <span className="font-bold text-primary-light">{userInitials || 'VP'}</span>
            </div>
            <div className="overflow-hidden">
              {/* Dynamic Name applied here */}
              <p className="text-sm font-bold truncate" title={userName}>{userName}</p>
              <p className="text-[10px] text-white/40 font-semibold uppercase">VPAA Director</p>
            </div>
          </div>
          
          <button 
            onClick={() => setShowLogoutModal(true)} 
            className="flex items-center gap-3 px-4 py-3 w-full text-white/60 hover:text-white hover:bg-green-500/20 hover:text-red-400 rounded-lg transition-all text-sm font-semibold"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
    
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm relative">
          <div>
            <h2 className="text-lg font-bold text-sidebar">{getPageTitle()}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">VPAA Portal</p>
          </div>

          <div className="flex items-center gap-6">
            
            <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
              <Calendar size={16} />
              <span className="text-sm font-semibold">{getCurrentDate()}</span>
            </div>
            
            {/* Notification Bell */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-400 hover:text-primary transition-colors bg-slate-50 rounded-full border border-slate-200 cursor-pointer"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">
                        <Bell size={24} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm font-semibold">No notifications yet</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            className={`p-4 flex gap-3 hover:bg-slate-50 transition-colors ${!notif.is_read ? 'bg-primary/5' : ''}`}
                          >
                            <div className="mt-1">
                              {!notif.is_read ? (
                                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--color-primary),0.5)]"></div>
                              ) : (
                                <Check size={12} className="text-slate-300" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm ${!notif.is_read ? 'text-slate-800 font-semibold' : 'text-slate-600'}`}>
                                {notif.message}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium mt-1">
                                {new Date(notif.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'})}
                              </p>
                            </div>
                            {!notif.is_read && (
                              <button 
                                onClick={() => markAsRead(notif.id)}
                                className="text-slate-300 hover:text-primary transition-colors cursor-pointer"
                                title="Mark as read"
                              >
                                <Check size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 relative">
          <Outlet />
        </main>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-500 mb-4 mx-auto">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 text-center mb-2">Ready to leave?</h3>
              <p className="text-sm text-slate-500 text-center mb-6">
                Are you sure you want to log out of the VPAA portal? You will need to sign in again to access your account.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmLogout}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-500/30 transition-colors cursor-pointer"
                >
                  Yes, Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
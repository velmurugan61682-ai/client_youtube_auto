import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  DollarSign, 
  LogOut, 
  ShieldCheck, 
  Bot,
  ChevronRight
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/clients', label: 'Client Management', icon: Users },
    { path: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
    { path: '/admin/payments', label: 'Payments', icon: DollarSign },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#F0FFF8] text-slate-900 font-['Outfit'] flex relative">
      {/* Admin Sidebar */}
      <aside className="w-68 bg-white/70 backdrop-blur-2xl border-r border-emerald-500/15 p-6 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 mb-8 select-none">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Bot size={22} />
            </div>
            <div>
              <span className="text-[17px] font-black tracking-tighter text-slate-900 block leading-none">CHANNELMATE</span>
              <span className="text-[9px] font-black text-emerald-600 tracking-[0.2em] uppercase mt-1 block">ADMIN SaaS</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Footer / Logout */}
        <div className="border-t border-slate-100 pt-4">
          <div className="px-3 py-2 bg-emerald-50/60 rounded-2xl border border-emerald-500/20 mb-3 flex items-center gap-2.5">
            <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-slate-900 truncate">ChannelMate Admin</p>
              <p className="text-[10px] font-bold text-emerald-600">Single-Admin System</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-red-50 text-red-600 rounded-xl transition-all font-bold text-xs"
          >
            <div className="flex items-center gap-2.5">
              <LogOut size={16} />
              <span>Admin Logout</span>
            </div>
            <ChevronRight size={14} />
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Floating Header */}
        <header className="h-18 bg-white/60 backdrop-blur-xl border-b border-emerald-500/10 px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="md:hidden flex items-center gap-2">
              <Bot size={20} className="text-emerald-600" />
              <span className="font-black text-sm">ChannelMate Admin</span>
            </div>
            <h2 className="hidden md:block text-base font-black text-slate-800 uppercase tracking-wider">
              {navItems.find(i => location.pathname.startsWith(i.path))?.label || 'Admin Control Panel'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <span className="yt-badge yt-badge-success flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              System Status: Healthy
            </span>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scroll">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

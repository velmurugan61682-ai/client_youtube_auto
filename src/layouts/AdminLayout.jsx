import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  DollarSign,
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [dashboardDark, setDashboardDark] = useState(() => localStorage.getItem('adminDashboardTheme') === 'dark');
  const [sidebarPinned, setSidebarPinned] = useState(() => localStorage.getItem('adminSidebarExpanded') !== 'false');
  const [sidebarHover, setSidebarHover] = useState(false);
  const sidebarExpanded = sidebarPinned || sidebarHover;

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/clients', label: 'Client Management', icon: Users },
    { path: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
    { path: '/admin/payments', label: 'Payments', icon: DollarSign },
  ];

  useEffect(() => {
    localStorage.setItem('adminDashboardTheme', dashboardDark ? 'dark' : 'light');
    window.dispatchEvent(new CustomEvent('admin-dashboard-theme-change', { detail: { dark: dashboardDark } }));
  }, [dashboardDark]);

  useEffect(() => {
    localStorage.setItem('adminSidebarExpanded', JSON.stringify(sidebarPinned));
  }, [sidebarPinned]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className={`admin-shell ${dashboardDark ? 'admin-dark' : 'admin-light'} min-h-screen font-['Outfit'] flex relative overflow-hidden transition-colors ${dashboardDark ? 'bg-[#0f0f0f] text-white' : 'bg-white text-[#0f0f0f]'}`}>
      <aside onMouseEnter={() => setSidebarHover(true)} onMouseLeave={() => setSidebarHover(false)} className={`hidden min-[1025px]:flex h-screen ${sidebarExpanded ? 'w-[272px]' : 'w-[88px]'} ${dashboardDark ? 'bg-[#0f0f0f] border-[#2a2a2a]' : 'bg-white border-[#e5e5e5]'} border-r ${sidebarExpanded ? 'p-6' : 'p-3'} flex-col justify-between shrink-0 transition-[width,background-color,border-color] duration-300 ease-in-out overflow-hidden`}>
        <div>
          <div className={`flex items-center gap-3 px-0 mb-8 select-none relative ${sidebarExpanded ? 'min-w-[220px]' : 'w-full justify-center'}`}>
            <img src="/logo_icon.png" className="w-10 h-10 object-contain drop-shadow-sm shrink-0" alt="Channelbot Logo" />
            <div className={`${sidebarExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'} transition-all duration-200 whitespace-nowrap`}>
              <span className={`${dashboardDark ? 'text-white' : 'text-[#0f0f0f]'} text-[17px] font-black tracking-tighter block leading-none`}>CHANNELBOT</span>
              <span className="text-[9px] font-black text-[#ff0000] tracking-[0.2em] uppercase mt-1 block">ADMIN SAAS</span>
            </div>
            <button type="button" onClick={() => setSidebarPinned(prev => !prev)} className={`absolute right-0 top-0 h-9 w-9 rounded-xl flex items-center justify-center transition-colors ${dashboardDark ? 'text-[#aaaaaa] hover:bg-[#202020] hover:text-white' : 'text-[#606060] hover:bg-[#fff1f1] hover:text-[#ff0000]'}`} title={sidebarPinned ? 'Unpin sidebar' : 'Pin sidebar'}>
              {sidebarPinned ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
            </button>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={item.label}
                  className={`flex items-center gap-4 rounded-2xl py-3.5 text-sm font-black transition-colors border ${sidebarExpanded ? 'min-w-[220px] px-4' : 'w-full px-0 justify-center'} ${isActive ? 'bg-[#fff1f1] text-[#ff0000] border-red-100' : (dashboardDark ? 'text-[#aaaaaa] hover:bg-[#202020] hover:text-white border-transparent' : 'text-[#475569] hover:bg-[#f7f7f7] border-transparent')}`}
                >
                  <Icon size={18} className="shrink-0" />
                  {sidebarExpanded && <span className="transition-opacity duration-200 whitespace-nowrap">{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className={`border-t ${dashboardDark ? 'border-[#2a2a2a]' : 'border-[#e5e5e5]'} pt-4 space-y-3 ${sidebarExpanded ? 'min-w-[220px]' : 'w-full'}`}>
          <button
            onClick={() => setDashboardDark(prev => !prev)}
            className={`w-full flex items-center gap-4 py-3 rounded-2xl transition-colors font-black text-xs ${sidebarExpanded ? 'px-4' : 'justify-center px-0'} ${dashboardDark ? 'bg-[#202020] hover:bg-[#2a2a2a] text-white' : 'bg-[#f7f7f7] hover:bg-[#eeeeee] text-[#0f0f0f]'}`}
            title={dashboardDark ? 'Light mode' : 'Dark mode'}
          >
            {dashboardDark ? <Sun size={17} className="shrink-0 text-[#ff0000]" /> : <Moon size={17} className="shrink-0 text-[#ff0000]" />}
            {sidebarExpanded && (
              <span className="transition-opacity duration-200 whitespace-nowrap">
                {dashboardDark ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </button>

          <div className={`px-3 py-3 rounded-2xl border flex items-center gap-3 ${sidebarExpanded ? '' : 'justify-center'} ${dashboardDark ? 'bg-[#202020] border-[#2a2a2a]' : 'bg-[#fff1f1] border-red-100'}`}>
            <img src="/logo_icon.png" className="w-6 h-6 object-contain shrink-0" alt="Channelbot Logo" />
            {sidebarExpanded && (
              <div className="min-w-0 flex-1 transition-opacity duration-200">
                <p className={`${dashboardDark ? 'text-white' : 'text-[#0f0f0f]'} text-xs font-black truncate`}>ChannelBot Admin</p>
                <p className="text-[10px] font-bold text-[#ff0000]">Single-Admin System</p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-between py-3 text-[#ff0000] rounded-2xl transition-colors font-black text-xs ${sidebarExpanded ? 'px-4' : 'px-0 justify-center'} ${dashboardDark ? 'hover:bg-[#202020]' : 'hover:bg-red-50'}`}
            title="Admin Logout"
          >
            <div className="flex items-center gap-4">
              <LogOut size={16} className="shrink-0" />
              {sidebarExpanded && <span className="transition-opacity duration-200 whitespace-nowrap">Admin Logout</span>}
            </div>
            {sidebarExpanded && <ChevronRight size={14} className="transition-opacity duration-200" />}
          </button>
        </div>
      </aside>

      <main className={`flex-1 min-w-0 h-screen overflow-y-auto p-3 sm:p-4 lg:p-5 pb-[calc(92px+env(safe-area-inset-bottom))] min-[1025px]:pb-4 custom-scroll transition-colors ${dashboardDark ? 'bg-[#0f0f0f]' : 'bg-white'}`}>
        {children}
      </main>
      <nav className={`min-[1025px]:hidden fixed bottom-0 left-0 right-0 z-[200] h-16 border-t px-2 pb-safe shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.08)] flex items-center justify-around ${dashboardDark ? 'bg-[#0f0f0f] border-[#2a2a2a]' : 'bg-white border-[#e5e5e5]'}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
          return (
            <Link key={item.path} to={item.path} className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[10px] font-black ${isActive ? 'text-[#ff0000]' : 'text-[#606060]'}`}>
              <Icon size={18} />
              <span className="truncate">{item.label.replace('Client Management', 'Clients')}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setDashboardDark(prev => !prev)}
          className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[10px] font-black text-[#606060]"
          title={dashboardDark ? 'Light mode' : 'Dark mode'}
        >
          {dashboardDark ? <Sun size={18} className="text-[#ff0000]" /> : <Moon size={18} />}
          <span>{dashboardDark ? 'Light' : 'Dark'}</span>
        </button>
      </nav>
    </div>
  );
};

export default AdminLayout;





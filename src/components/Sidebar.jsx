import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Video,
  PlaySquare,
  ShieldCheck,
  Settings,
  LogOut,
  UsersRound,
  ChevronRight,
  CreditCard,
  UserCircle,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ activeTab, setActiveTab, onLogout, isOpen, setIsOpen, user, onProfileClick, isDark = false, onToggleTheme }) => {
  const [hoverOpen, setHoverOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth > 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isDesktop) setIsOpen(false);
  }, [activeTab, isDesktop, setIsOpen]);

  const expanded = isOpen || (isDesktop && hoverOpen);
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'channels', label: 'Channels', icon: PlaySquare },
    { id: 'leads', label: 'Leads', icon: UsersRound },
    { id: 'moderation', label: 'Auto-Mod', icon: ShieldCheck },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-[#0f0f0f]/35 z-[110] min-[1025px]:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: expanded ? 'min(300px, 86vw)' : '88px',
          x: isDesktop ? 0 : (isOpen ? 0 : -300),
        }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        onMouseEnter={() => setHoverOpen(true)}
        onMouseLeave={() => setHoverOpen(false)}
        className={`fixed inset-y-0 left-0 border-r flex flex-col z-[150] min-[1025px]:relative shadow-none shrink-0 overflow-hidden transition-colors ${isDark ? 'bg-[#0f0f0f] border-[#2a2a2a]' : 'bg-white border-[#e5e5e5]'}`}
      >
        <div className={`px-4 pt-5 pb-4 border-b ${isDark ? 'border-[#2a2a2a]' : 'border-[#eeeeee]'}`}>
          <div className={`flex items-center gap-3 ${expanded ? '' : 'justify-center'}`}>
            <img src="/logo_icon.png" className="h-10 w-10 object-contain drop-shadow-sm shrink-0" alt="ChannelMate Logo" />
            {expanded && (
              <div className="min-w-0">
                <p className={`${isDark ? 'text-white' : 'text-[#0f0f0f]'} text-[16px] font-black leading-none tracking-tight`}>ChannelMate</p>
                <p className="mt-1 text-[9px] font-black uppercase tracking-[0.18em] text-[#ff0000]">Online</p>
              </div>
            )}
            {isDesktop && (
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`ml-auto h-9 w-9 items-center justify-center rounded-xl transition-colors ${isDark ? 'text-[#aaaaaa] hover:bg-[#202020] hover:text-white' : 'text-[#606060] hover:bg-[#fff1f1] hover:text-[#ff0000]'} ${expanded ? 'flex' : 'absolute right-3 top-5 flex'}`}
                title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                {isOpen ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
              </button>
            )}
          </div>
        </div>

        <nav className="flex-1 py-5 px-3 flex flex-col gap-2 overflow-y-auto custom-scroll">
          {menuItems.map((item) => {
            const isMenuTabActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth <= 1024) setIsOpen(false);
                }}
                title={item.label}
                className={`relative h-12 w-full flex items-center gap-4 rounded-2xl transition-all duration-200 group border ${
                  isMenuTabActive
                    ? 'bg-[#fff1f1] text-[#ff0000] border-red-100 font-black shadow-sm'
                    : (isDark ? 'text-[#aaaaaa] border-transparent hover:bg-[#202020] hover:text-white font-bold' : 'text-[#475569] border-transparent hover:bg-[#f7f7f7] hover:text-[#0f0f0f] font-bold')
                } ${expanded ? 'px-4' : 'justify-center px-0'}`}
              >
                <item.icon size={20} strokeWidth={isMenuTabActive ? 2.6 : 2.1} className="shrink-0" />
                {expanded && <span className="text-[14px] font-black tracking-tight whitespace-nowrap">{item.label}</span>}
                {isMenuTabActive && expanded && <ChevronRight size={14} className="ml-auto" />}
                {!expanded && isDesktop && (
                  <span className="absolute left-full ml-4 px-3 py-2 bg-[#0f0f0f] text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-[200] shadow-2xl">
                    {item.label}
                  </span>
                )}
                {isMenuTabActive && !expanded && <span className="absolute right-[-13px] top-1/2 -translate-y-1/2 h-6 w-1 rounded-l-full bg-[#ff0000]" />}
              </button>
            );
          })}
        </nav>

        <div className={`border-t p-4 space-y-3 ${isDark ? 'border-[#2a2a2a]' : 'border-[#eeeeee]'}`}>
          <button
            type="button"
            onClick={onProfileClick}
            className={`w-full flex items-center gap-3 rounded-2xl py-3 transition-colors font-black text-[13px] ${expanded ? 'px-4' : 'justify-center px-0'} ${isDark ? 'text-white bg-[#202020] hover:bg-[#2a2a2a]' : 'text-[#0f0f0f] bg-[#f7f7f7] hover:bg-[#eeeeee]'}`}
            title="Profile"
          >
            <div className="h-8 w-8 rounded-xl bg-[#0f0f0f] text-white flex items-center justify-center text-[11px] font-black shrink-0">
              {user?.name?.charAt(0).toUpperCase() || <UserCircle size={18} />}
            </div>
            {expanded && (
              <div className="min-w-0 text-left">
                <p className="truncate text-[12px] leading-none">{user?.name || 'ChannelMate'}</p>
                <p className="mt-1 text-[9px] uppercase tracking-widest text-[#ff0000]">Online</p>
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            className={`w-full flex items-center gap-3 rounded-2xl py-3 transition-colors font-black text-[13px] ${expanded ? 'px-4' : 'justify-center px-0'} ${isDark ? 'text-white hover:bg-[#202020]' : 'text-[#606060] hover:text-[#ff0000] hover:bg-[#fff1f1]'}`}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? <Sun size={18} className="text-[#ff0000]" /> : <Moon size={18} />}
            {expanded && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>

          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 rounded-2xl py-3 transition-colors font-black text-[13px] ${expanded ? 'px-4' : 'justify-center px-0'} ${isDark ? 'text-[#aaaaaa] hover:text-white hover:bg-[#202020]' : 'text-[#606060] hover:text-[#ff0000] hover:bg-[#fff1f1]'}`}
            title="Logout"
          >
            <LogOut size={18} />
            {expanded && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;

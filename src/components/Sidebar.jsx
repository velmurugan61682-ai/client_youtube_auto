import React from 'react';
import {
  LayoutDashboard,
  Video,
  PlaySquare,
  ShieldCheck,
  Settings,
  LogOut,
  UsersRound,
  ChevronRight,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab, onLogout, isOpen, setIsOpen }) => {
  const { user } = useAuth();
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
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-[#0f0f0f]/10 backdrop-blur-[2px] z-[110] lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? '280px' : '88px',
          x: (typeof window !== 'undefined' && window.innerWidth >= 1024) ? 0 : (isOpen ? 0 : -280),
        }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="fixed inset-y-0 left-0 bg-white/70 backdrop-blur-xl rounded-r-3xl border border-white/40 shadow-2xl flex flex-col z-[150] lg:relative transition-all duration-300"
      >
        {/* Navigation Section */}
        <div className="flex-1 py-8 flex flex-col gap-2 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const isMenuTabActive = activeTab === item.id;
            return (
              <div key={item.id} className="px-3 relative h-12">
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  className={`relative w-full h-full flex items-center gap-4 rounded-2xl transition-all duration-300 group ${isMenuTabActive
                      ? 'bg-green-500/20 text-[#22c55e] border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)] font-black'
                      : 'hover:bg-slate-500/10 text-slate-600 hover:text-slate-950 border border-transparent'
                    } ${isOpen ? 'px-4' : 'justify-center'}`}
                >
                  <div className="flex-shrink-0">
                    <item.icon
                      size={20}
                      strokeWidth={isMenuTabActive ? 2.5 : 2}
                    />
                  </div>

                  {isOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-[14px] font-black tracking-tight"
                    >
                      {item.label}
                    </motion.span>
                  )}

                  {isMenuTabActive && isOpen && (
                    <div className="ml-auto opacity-60">
                      <ChevronRight size={14} />
                    </div>
                  )}

                  {/* Tooltip for Collapsed State */}
                  {!isOpen && typeof window !== 'undefined' && window.innerWidth >= 1024 && (
                    <div className="absolute left-full ml-4 px-3 py-2 bg-[#0f0f0f] text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 whitespace-nowrap z-[200] shadow-2xl translate-x-3 group-hover:translate-x-0">
                      {item.label}
                    </div>
                  )}
                </button>
                {isMenuTabActive && !isOpen && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#22c55e] rounded-l-full" />
                )}
              </div>
            );
          })}
        </div>

        {/* Profile Footer */}
        <div className="p-4 mt-auto border-t border-slate-100 bg-white/0 flex justify-center">
          {isOpen ? (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-3 py-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-black text-[13px]"
              title="Logout"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          ) : (
            <button
              onClick={onLogout}
              className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;

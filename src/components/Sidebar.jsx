import React from 'react';
import { 
  LayoutDashboard, 
  Video, 
  PlaySquare, 
  ShieldCheck, 
  Settings,
  LogOut,
  Zap,
  UsersRound,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ activeTab, setActiveTab, onLogout, isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'channels', label: 'Channels', icon: PlaySquare },
    { id: 'leads', label: 'Leads', icon: UsersRound },
    { id: 'moderation', label: 'Auto-Mod', icon: ShieldCheck },
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
        className="fixed inset-y-0 left-0 bg-white border-r border-[#f0f0f0] flex flex-col z-[150] lg:relative transition-all duration-300"
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
                  className={`relative w-full h-full flex items-center gap-4 rounded-2xl transition-all duration-300 group ${
                    isMenuTabActive 
                      ? 'bg-[#0f0f0f] text-white shadow-lg shadow-black/10' 
                      : 'hover:bg-[#f8f8f8] text-[#909090] hover:text-[#0f0f0f]'
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
                    <div className="ml-auto opacity-40">
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
                   <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#ff0000] rounded-l-full" />
                )}
              </div>
            );
          })}
        </div>

        {/* AI & Security Footer */}
        <div className="p-4 mt-auto border-t border-[#f0f0f0] bg-[#fcfcfc] space-y-3">
          <div className={`overflow-hidden transition-all duration-500 rounded-[24px] cursor-default bg-white border border-[#f0f0f0] hover:border-red-500/20 group/ai ${isOpen ? 'p-4' : 'p-0 h-14 flex items-center justify-center'}`}>
             <div className={`flex items-center ${isOpen ? 'gap-3 mb-3' : 'justify-center'}`}>
                <div className={`rounded-xl transition-all duration-500 flex items-center justify-center ${isOpen ? 'w-10 h-10 bg-red-50 text-red-600' : 'w-12 h-12 bg-white text-red-600 border border-red-50 group-hover/ai:border-red-500/20'}`}>
                   <Zap size={isOpen ? 20 : 24} className="animate-pulse" fill="currentColor" />
                </div>
                {isOpen && (
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-[#909090] uppercase tracking-widest leading-none mb-1">AI Guardian</p>
                    <p className="text-[14px] font-black text-[#0f0f0f] truncate">Online</p>
                  </div>
                )}
             </div>
             {isOpen && (
                <div className="w-full h-1 bg-[#f0f0f0] rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '0%' }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="h-full bg-red-600 w-1/2 shadow-[0_0_10px_#ff0000]"
                   />
                </div>
             )}
          </div>

          <div className="px-1">
            <button 
              onClick={onLogout}
              className={`flex items-center transition-all duration-300 rounded-[20px] ${
                isOpen ? 'w-full px-4 py-3 bg-[#fce8e6]/30 text-[#d93025] hover:bg-[#fce8e6] font-black text-xs uppercase tracking-widest' : 'h-14 w-full justify-center text-[#909090] hover:text-[#d93025] hover:bg-[#fce8e6]'
              }`}
            >
              <LogOut size={20} />
              {isOpen && <span className="ml-3">Logout</span>}
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;


import React, { useState } from 'react';
import { Role, Militar } from '../types';
import { 
  LayoutDashboard, 
  CalendarRange, 
  Utensils, 
  Users, 
  ClipboardCheck, 
  LogOut, 
  Menu as MenuIcon, 
  X, 
  FileText,
  ShieldAlert
} from 'lucide-react';

interface LayoutProps {
  user: Militar;
  onLogout: () => void;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, activeTab, setActiveTab }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [Role.ADM_LOCAL, Role.ADM_GERAL] },
    { id: 'arranchamento', label: 'Arranchamento', icon: CalendarRange, roles: [Role.MILITAR, Role.FISCAL, Role.ADM_LOCAL, Role.ADM_GERAL] },
    { id: 'presenca', label: 'Presença', icon: ClipboardCheck, roles: [Role.FISCAL, Role.ADM_LOCAL, Role.ADM_GERAL] },
    { id: 'cardapio', label: 'Cardápio', icon: Utensils, roles: [Role.MILITAR, Role.FISCAL, Role.ADM_LOCAL, Role.ADM_GERAL] },
    { id: 'especial', label: 'Especial', icon: ShieldAlert, roles: [Role.ADM_LOCAL, Role.ADM_GERAL] },
    { id: 'usuarios', label: 'Usuários', icon: Users, roles: [Role.ADM_GERAL] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen flex bg-background text-slate-100">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 glass border-r border-white/10 z-50 transform transition-transform duration-300 lg:relative lg:transform-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase text-white">E-Rancho</h1>
        </div>

        <nav className="p-4 space-y-1">
          {filteredItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${activeTab === item.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'}
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-semibold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-3">
            <div className="w-10 h-10 rounded-full bg-military-green flex items-center justify-center font-bold text-white border-2 border-white/10">
              {user.nomeGuerra.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user.nomeGuerra}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest truncate">{user.posto} • {user.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-bold"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 glass border-b border-white/5 flex items-center justify-between px-6 lg:px-10">
          <button 
            className="lg:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setIsSidebarOpen(true)}
          >
            <MenuIcon className="w-6 h-6" />
          </button>
          <div className="hidden lg:block text-slate-400 text-xs font-bold uppercase tracking-widest">
            {activeTab.replace(/([A-Z])/g, ' $1')}
          </div>
          <div className="flex items-center gap-4">
             <span className="text-xs text-slate-400 font-mono">
               {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
             </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

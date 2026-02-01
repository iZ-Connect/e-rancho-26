import React, { useState } from 'react';
import { Militar } from '../types';
import {
  LayoutDashboard,
  CalendarRange,
  Utensils,
  LogOut,
  Menu as MenuIcon,
  Scan,
  UserCircle,
  Wifi,
  WifiOff,
  Info,
  Users,
  Printer // Mantive o ícone
} from 'lucide-react';

interface LayoutProps {
  user: Militar;
  onLogout: () => void;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOnline: boolean;
  syncing: boolean;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, activeTab, setActiveTab, isOnline, syncing }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['ADM_LOCAL', 'ADM_GERAL']
    },
    // REMOVIDO: Menu Relatórios
    {
      id: 'impressao',
      label: 'Imprimir IDs',
      icon: Printer,
      roles: ['ADM_LOCAL', 'ADM_GERAL']
    },
    {
      id: 'arranchamento',
      label: 'Arranchamento',
      icon: CalendarRange,
      roles: ['MILITAR', 'Militar', 'FISC_SU', 'ADM_LOCAL', 'ADM_GERAL']
    },
    {
      id: 'scanner',
      label: 'Validar QR',
      icon: Scan,
      roles: ['FISC_SU', 'ADM_LOCAL', 'ADM_GERAL']
    },
    {
      id: 'militares',
      label: 'Militares',
      icon: Users,
      roles: ['ADM_LOCAL', 'ADM_GERAL']
    },
    {
      id: 'identidade',
      label: 'Minha ID',
      icon: UserCircle,
      roles: ['MILITAR', 'Militar', 'FISC_SU', 'ADM_LOCAL', 'ADM_GERAL']
    },
    {
      id: 'cardapio',
      label: 'Cardápio',
      icon: Utensils,
      roles: ['MILITAR', 'Militar', 'FISC_SU', 'ADM_LOCAL', 'ADM_GERAL']
    },
    {
      id: 'sobre',
      label: 'Sobre',
      icon: Info,
      roles: ['MILITAR', 'Militar', 'FISC_SU', 'ADM_LOCAL', 'ADM_GERAL']
    },
  ];

  // FILTRAGEM SEGURA DE PERFIL
  const userPerfil = String(user.perfil || '').toUpperCase();
  const filteredItems = navItems.filter(item => {
    return item.roles.some(role => String(role).toUpperCase() === userPerfil);
  });

  const nomeExibicao = user.nome_guerra || user["Nome de Guerra"] || "MILITAR";
  const postoExibicao = user.posto || user.posto_grad || user["Posto"] || "---";

  return (
    <div className="min-h-screen flex bg-background text-slate-100 flex-col lg:flex-row">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 w-64 glass border-r border-white/10 z-50 transform transition-transform duration-300 lg:relative lg:transform-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} no-print`}>
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tighter  text-white">e-Rancho HGeSM</h1>
        </div>

        <nav className="p-4 space-y-1">
          {filteredItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-semibold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 mb-3">
            <div className="w-10 h-10 rounded-full bg-military-green flex items-center justify-center font-bold text-white border-2 border-white/10 uppercase">
              {nomeExibicao.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate uppercase">{nomeExibicao}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest truncate">{postoExibicao}</p>
            </div>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-bold uppercase">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-16 glass border-b border-white/5 flex items-center justify-between px-6 lg:px-10 no-print">
          <button className="lg:hidden p-2 text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(true)}>
            <MenuIcon className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            {syncing && <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${isOnline ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {isOnline ? <><Wifi className="w-3 h-3" /> Online</> : <><WifiOff className="w-3 h-3" /> Offline</>}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-10 pb-20">
          {children}
        </div>

        <footer className="h-12 absolute bottom-0 left-0 w-full glass border-t border-white/5 flex items-center justify-center px-6 no-print">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">
            Desenvolvido por <span className="text-slate-300 uppercase">Ezequiel FAGUNDES</span>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Layout;
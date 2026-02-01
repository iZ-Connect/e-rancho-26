import React, { useState, useEffect } from 'react';
import { Militar, AuthState, Arranchamento, Cardapio, Aviso, UserRole, Bloqueio } from './types';
import { dbService } from './services/dbService';
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import MyID from './components/MyID';
import Scanner from './components/Scanner';
import CardapioView from './components/CardapioView';
import About from './components/About';
import MilitaresList from './components/MilitaresList';
import RelatorioImpressao from './components/RelatorioImpressao';
import { Megaphone, CheckCircle2, ChevronLeft } from 'lucide-react';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [activeTab, setActiveTab] = useState('arranchamento');
  const [militares, setMilitares] = useState<Militar[]>([]);
  const [arranchamentos, setArranchamentos] = useState<Arranchamento[]>([]);
  const [cardapio, setCardapio] = useState<Cardapio[]>([]);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [bloqueios, setBloqueios] = useState<Bloqueio[]>([]);
  const [unseenNotice, setUnseenNotice] = useState<Aviso | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  const [selectedMilitar, setSelectedMilitar] = useState<Militar | null>(null);

  useEffect(() => {
    const initApp = async () => {
      setSyncing(true);
      await dbService.init();
      await refreshData();

      const savedUser = dbService.getSession();
      if (savedUser) {
        setAuth({ user: savedUser, isAuthenticated: true });
        setupInitialTab(savedUser);
        await checkNotices();
      }
      setSyncing(false);
    };

    initApp();

    const handleNetwork = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleNetwork);
    window.addEventListener('offline', handleNetwork);
    return () => {
      window.removeEventListener('online', handleNetwork);
      window.removeEventListener('offline', handleNetwork);
    };
  }, []);

  const checkNotices = async () => {
    const unseen = await dbService.getUnseenActiveNotices();
    if (unseen.length > 0) setUnseenNotice(unseen[0]);
  };

  const closeNoticePopup = () => {
    if (unseenNotice) {
      dbService.markNoticeAsSeen(unseenNotice.id);
      setUnseenNotice(null);
      setTimeout(checkNotices, 300);
    }
  };

  const setupInitialTab = (user: Militar) => {
    if (user.perfil === UserRole.ADM_LOCAL || user.perfil === UserRole.ADM_GERAL) setActiveTab('dashboard');
    else if (user.perfil === UserRole.FISC_SU) setActiveTab('scanner');
    else setActiveTab('arranchamento');
  };

  const refreshData = async () => {
    setMilitares(await dbService.getMilitares());
    setArranchamentos(await dbService.getArranchamentos());
    setCardapio(await dbService.getCardapio());
    setAvisos(await dbService.getAvisos());
    setBloqueios(await dbService.getBloqueios());
  };

  const handleLogin = (user: Militar, persistent: boolean) => {
    setAuth({ user, isAuthenticated: true });
    if (persistent) dbService.saveSession(user);
    setupInitialTab(user);
    checkNotices();
  };

  const handleLogout = () => {
    dbService.clearSession();
    setAuth({ user: null, isAuthenticated: false });
  };

  const handleUpdatePin = async (newPin: string) => {
    if (!auth.user) return;
    const updated = { ...auth.user, pin: newPin };
    await dbService.updateMilitar(updated);
    setAuth({ ...auth, user: updated });
    await refreshData();
  };

  const handleAdminUpdateMilitar = async (updated: Militar) => {
    await dbService.updateMilitar(updated);
    await refreshData();
    if (auth.user?.cpf === updated.cpf) {
      setAuth({ ...auth, user: updated });
      dbService.saveSession(updated);
    }
    if (selectedMilitar?.cpf === updated.cpf) {
      setSelectedMilitar(updated);
    }
  };

  if (!auth.isAuthenticated || !auth.user) {
    return <Login onLogin={handleLogin} militares={militares} />;
  }

  const isAdmin = auth.user.perfil === UserRole.ADM_LOCAL || auth.user.perfil === UserRole.ADM_GERAL;

  return (
    <>
      <Layout
        user={auth.user}
        activeTab={activeTab}
        setActiveTab={(tab) => { setActiveTab(tab); setSelectedMilitar(null); }}
        onLogout={handleLogout}
        isOnline={isOnline}
        syncing={syncing}
      >
        {activeTab === 'dashboard' && (
          <Dashboard
            arranchamentos={arranchamentos}
            militares={militares}
            bloqueios={bloqueios}
            onRefresh={refreshData}
          />
        )}

        {/* Antigo menu 'relatorios' removido daqui */}

        {activeTab === 'impressao' && isAdmin && (
          <RelatorioImpressao militares={militares} />
        )}

        {activeTab === 'identidade' && (
          <MyID
            user={auth.user}
            viewer={auth.user}
            onUpdateMilitar={handleAdminUpdateMilitar}
            onUpdatePin={handleUpdatePin}
          />
        )}

        {activeTab === 'scanner' && (
          <Scanner
            militares={militares}
            arranchamentos={arranchamentos}
            onConfirm={async (cpf, tipo) => {
              await dbService.togglePresenca(cpf, new Date().toISOString().split('T')[0], tipo);
              await refreshData();
            }}
          />
        )}

        {activeTab === 'arranchamento' && (
          <CalendarView
            user={auth.user}
            arranchamentos={arranchamentos}
            cardapio={cardapio}
            bloqueios={bloqueios}
            onToggle={async (d, t) => {
              await dbService.saveArranchamento(String(auth.user!.cpf), d, t);
              await refreshData();
            }}
            refresh={refreshData}
          />
        )}

        {activeTab === 'cardapio' && (
          <CardapioView
            user={auth.user}
            cardapio={cardapio}
            avisos={avisos}
            refresh={refreshData}
          />
        )}

        {activeTab === 'sobre' && <About />}

        {activeTab === 'militares' && (
          selectedMilitar ? (
            <div className="space-y-6">
              <button
                onClick={() => setSelectedMilitar(null)}
                className="flex items-center gap-2 text-slate-400 hover:text-white font-bold text-xs uppercase transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Voltar para Lista
              </button>

              <MyID
                user={selectedMilitar}
                viewer={auth.user}
                onUpdateMilitar={handleAdminUpdateMilitar}
                onUpdatePin={async () => { }}
              />
            </div>
          ) : (
            <MilitaresList
              militares={militares}
              currentUser={auth.user}
              onSelectMilitar={(m) => setSelectedMilitar(m)}
              onRefresh={refreshData}
            />
          )
        )}
      </Layout>

      {unseenNotice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-lg glass rounded-3xl border-l-[12px] overflow-hidden shadow-2xl ${unseenNotice.tipo === 'vermelho' ? 'border-red-500' : 'border-amber-500'}`}>
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-2xl ${unseenNotice.tipo === 'vermelho' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
                  <Megaphone className="w-8 h-8" />
                </div>
                <div>
                  <h3 className={`text-2xl font-black uppercase tracking-tighter ${unseenNotice.tipo === 'vermelho' ? 'text-red-500' : 'text-amber-500'}`}>{unseenNotice.titulo}</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Comunicado Oficial do Rancho</p>
                </div>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5 mb-8">
                <p className="text-white text-base leading-relaxed whitespace-pre-wrap">{unseenNotice.descricao}</p>
              </div>
              <button onClick={closeNoticePopup} className="w-full h-14 bg-primary text-white font-black uppercase text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Entendido, ciente do aviso
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
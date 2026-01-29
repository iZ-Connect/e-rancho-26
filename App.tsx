import React, { useState, useEffect } from 'react';
import { Militar, AuthState, Arranchamento, Cardapio, SpecialArranchamento, Role } from './types';
import { dbService } from './services/dbService';
import { fetchUsersFromSheet } from './services/googleSheets'; // ✅ Import da planilha
import Layout from './components/Layout';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import Presence from './components/Presence';
import { Save, Plus, Trash2, Calendar as CalendarIcon, Users as UsersIcon } from 'lucide-react';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [activeTab, setActiveTab] = useState('arranchamento');
  const [militares, setMilitares] = useState<Militar[]>([]);
  const [arranchamentos, setArranchamentos] = useState<Arranchamento[]>([]);
  const [cardapio, setCardapio] = useState<Cardapio[]>([]);
  const [especial, setEspecial] = useState<SpecialArranchamento[]>([]);

  // Special Rationing Form State
  const [specialForm, setSpecialForm] = useState({
    data: new Date().toISOString().split('T')[0],
    quantidade: 0,
    motivo: ''
  });

  // Cardapio Form State
  const [editingCardapio, setEditingCardapio] = useState<Cardapio | null>(null);

  // 🔹 useEffect para carregar dados
  useEffect(() => {
    refreshData();
  }, []);

  // 🔹 refreshData agora é async e busca do Google Sheets
  const refreshData = async () => {
    let users: Militar[] = [];
    try {
      users = await fetchUsersFromSheet(); // tenta buscar do Google Sheet
      dbService.saveMilitares(users);       // salva no dbService como cache
    } catch (err) {
      console.warn('Não foi possível buscar do Google Sheets, usando cache', err);
      users = dbService.getMilitares();     // fallback para cache/localStorage
    }
    setMilitares(users);
    setArranchamentos(dbService.getArranchamentos());
    setCardapio(dbService.getCardapio());
    setEspecial(dbService.getEspecial());
  };

  const handleLogin = (user: Militar) => {
    setAuth({ user, isAuthenticated: true });
    if (user.role === Role.ADM_LOCAL || user.role === Role.ADM_GERAL) setActiveTab('dashboard');
    else if (user.role === Role.FISCAL) setActiveTab('presenca');
    else setActiveTab('arranchamento');
  };

  const handleLogout = () => setAuth({ user: null, isAuthenticated: false });

  const toggleArranchamento = (date: string, type: 'almoço' | 'jantar') => {
    if (!auth.user) return;
    const existing = arranchamentos.find(a => a.data === date && a.militarId === auth.user!.id);
    const newArr: Arranchamento = existing
      ? { ...existing, [type]: !existing[type] }
      : {
        id: Math.random().toString(36).substr(2, 9),
        militarId: auth.user.id,
        data: date,
        almoço: type === 'almoço',
        jantar: type === 'jantar',
        presencaAlmoço: false,
        presencaJantar: false
      };
    dbService.saveArranchamento(newArr);
    refreshData();
  };

  const handleTogglePresenca = (militarId: string, data: string, tipo: 'almoço' | 'jantar') => {
    dbService.togglePresenca(militarId, data, tipo);
    refreshData();
  };

  const handleSaveEspecial = () => {
    if (!auth.user || specialForm.quantidade <= 0 || !specialForm.motivo) return;
    const newEsp: SpecialArranchamento = {
      id: Math.random().toString(36).substr(2, 9),
      ...specialForm,
      registradoPor: auth.user.nomeGuerra
    };
    dbService.saveEspecial(newEsp);
    setSpecialForm({ data: new Date().toISOString().split('T')[0], quantidade: 0, motivo: '' });
    refreshData();
    alert('Arranchamento especial registrado com sucesso!');
  };

  const handleSaveCardapio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCardapio) return;
    const current = [...cardapio];
    const index = current.findIndex(c => c.data === editingCardapio.data);
    if (index > -1) current[index] = editingCardapio;
    else current.push(editingCardapio);
    dbService.saveCardapio(current);
    setEditingCardapio(null);
    refreshData();
  };

  if (!auth.isAuthenticated || !auth.user) {
    return <Login onLogin={handleLogin} militares={militares} />;
  }

  return (
    <Layout user={auth.user} activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout}>
      {/* ... restante do seu JSX permanece igual ... */}
    </Layout>
  );
};

export default App;

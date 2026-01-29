
import React, { useState, useEffect } from 'react';
import { Militar, AuthState, Arranchamento, Cardapio, SpecialArranchamento, Role } from './types';
import { dbService } from './services/dbService';
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

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setMilitares(dbService.getMilitares());
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

  const handleLogout = () => {
    setAuth({ user: null, isAuthenticated: false });
  };

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
      {activeTab === 'dashboard' && <Dashboard arranchamentos={arranchamentos} militares={militares} />}
      
      {activeTab === 'arranchamento' && (
        <CalendarView 
          user={auth.user} 
          arranchamentos={arranchamentos} 
          cardapio={cardapio} 
          onToggle={toggleArranchamento} 
        />
      )}

      {activeTab === 'presenca' && (
        <Presence 
          arranchamentos={arranchamentos} 
          militares={militares} 
          onTogglePresenca={handleTogglePresenca} 
        />
      )}

      {activeTab === 'cardapio' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Gerenciamento de Cardápio</h2>
            {(auth.user.role === Role.ADM_LOCAL || auth.user.role === Role.ADM_GERAL) && (
              <button 
                onClick={() => setEditingCardapio({ data: new Date().toISOString().split('T')[0], almoço: '', jantar: '' })}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4" /> Novo Prato
              </button>
            )}
          </div>

          {editingCardapio && (
            <div className="glass p-8 rounded-3xl border border-primary/30 max-w-2xl mx-auto shadow-2xl shadow-primary/10">
              <h3 className="text-xl font-bold text-white mb-6 uppercase flex items-center gap-2">
                <Save className="w-5 h-5 text-primary" /> Editando Cardápio
              </h3>
              <form onSubmit={handleSaveCardapio} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Data</label>
                  <input 
                    type="date" 
                    required
                    value={editingCardapio.data}
                    onChange={e => setEditingCardapio({...editingCardapio, data: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white focus:ring-2 focus:ring-primary outline-none" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Almoço</label>
                  <textarea 
                    required
                    rows={3}
                    value={editingCardapio.almoço}
                    onChange={e => setEditingCardapio({...editingCardapio, almoço: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Ex: Arroz, Feijão, Frango Grelhado..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Jantar</label>
                  <textarea 
                    required
                    rows={3}
                    value={editingCardapio.jantar}
                    onChange={e => setEditingCardapio({...editingCardapio, jantar: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-primary outline-none"
                    placeholder="Ex: Caldo de Cana, Pão com Ovo..."
                  />
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="flex-1 h-12 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20">Salvar Alterações</button>
                  <button type="button" onClick={() => setEditingCardapio(null)} className="flex-1 h-12 bg-white/5 text-slate-400 font-bold rounded-xl border border-white/10 hover:bg-white/10">Cancelar</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cardapio.length > 0 ? cardapio.sort((a,b) => b.data.localeCompare(a.data)).map(item => (
              <div key={item.data} className="glass p-6 rounded-2xl border border-white/10 space-y-4 hover:border-primary/50 transition-all group">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                    <CalendarIcon className="w-3 h-3" /> {item.data.split('-').reverse().join('/')}
                  </span>
                  {(auth.user!.role === Role.ADM_LOCAL || auth.user!.role === Role.ADM_GERAL) && (
                    <button 
                      onClick={() => setEditingCardapio(item)}
                      className="text-slate-500 hover:text-white transition-colors"
                    >
                      Editar
                    </button>
                  )}
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-1">Almoço</h4>
                  <p className="text-sm text-white font-medium">{item.almoço || 'Não informado'}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-1">Jantar</h4>
                  <p className="text-sm text-white font-medium">{item.jantar || 'Não informado'}</p>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-20 text-center text-slate-500 font-medium glass rounded-2xl border-dashed border-2 border-white/5">
                Nenhum cardápio cadastrado.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'especial' && (
        <div className="max-w-4xl mx-auto space-y-10 animate-in zoom-in-95 duration-500">
           <div className="text-center">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Arranchamento Especial</h2>
            <p className="text-slate-400 text-sm mt-2 max-w-lg mx-auto">Registre refeições para convidados, delegações externas ou eventos comemorativos da organização militar.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="glass p-8 rounded-3xl border border-white/10 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Data do Evento</label>
                    <input 
                      type="date" 
                      value={specialForm.data}
                      onChange={e => setSpecialForm({...specialForm, data: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white focus:ring-2 focus:ring-primary outline-none" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Quantidade de Pessoas</label>
                    <input 
                      type="number" 
                      placeholder="Ex: 15" 
                      value={specialForm.quantidade || ''}
                      onChange={e => setSpecialForm({...specialForm, quantidade: parseInt(e.target.value) || 0})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white focus:ring-2 focus:ring-primary outline-none" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Motivo / Delegação</label>
                    <textarea 
                      rows={3} 
                      value={specialForm.motivo}
                      onChange={e => setSpecialForm({...specialForm, motivo: e.target.value})}
                      placeholder="Ex: Visita da Inspetoria Geral..." 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white resize-none focus:ring-2 focus:ring-primary outline-none" 
                    />
                  </div>
                </div>
                <button 
                  onClick={handleSaveEspecial}
                  className="w-full h-14 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-sm"
                >
                  Registrar Agora
                </button>
              </div>
            </div>

            <div className="md:col-span-3 space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" /> Registros Recentes
              </h3>
              <div className="space-y-3">
                {especial.length > 0 ? especial.slice().reverse().map(esp => (
                  <div key={esp.id} className="glass p-4 rounded-2xl border border-white/5 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex flex-col items-center justify-center border border-white/10">
                        <span className="text-[10px] text-slate-500 font-bold leading-none">{esp.data.split('-')[2]}</span>
                        <span className="text-xs text-white font-black">{esp.data.split('-')[1]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{esp.motivo}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Registrado por {esp.registradoPor}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xl font-black text-primary leading-none">{esp.quantidade}</p>
                       <p className="text-[10px] text-slate-500 font-bold uppercase">Refeições</p>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-slate-600 font-medium glass rounded-2xl border-dashed border-2 border-white/5">
                    Nenhum registro especial encontrado.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'usuarios' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Gestão de Efetivo</h2>
            <button className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all">
              <Plus className="w-4 h-4" /> Cadastrar Militar
            </button>
          </div>
          <div className="glass rounded-2xl border border-white/10 overflow-hidden shadow-xl">
             <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Posto/Grad</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Nome de Guerra</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Setor</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Perfil</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {militares.map(m => (
                  <tr key={m.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-sm text-slate-400">{m.posto}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">{m.nomeGuerra}</span>
                        <span className="text-[10px] text-slate-600 font-mono">{m.cpf}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400 font-medium">{m.setor}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${m.role === Role.ADM_GERAL ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                        {m.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="p-2 text-slate-400 hover:text-white transition-colors" title="Editar"><Save className="w-4 h-4" /></button>
                         <button className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Desativar"><Trash2 className="w-4 h-4" /></button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;

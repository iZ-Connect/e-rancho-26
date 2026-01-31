
import React, { useState } from 'react';
import { Cardapio, Aviso, UserRole, Militar } from '../types';
import { dbService } from '../src/services/dbService';
// Added 'Utensils' to imports from 'lucide-react'
import { AlertTriangle, Plus, Trash2, Megaphone, Info, Utensils } from 'lucide-react';

interface CardapioViewProps {
  user: Militar;
  cardapio: Cardapio[];
  avisos: Aviso[];
  refresh: () => void;
}

const CardapioView: React.FC<CardapioViewProps> = ({ user, cardapio, avisos, refresh }) => {
  const [showAddAviso, setShowAddAviso] = useState(false);
  const [newAviso, setNewAviso] = useState({ titulo: '', descricao: '', tipo: 'amarelo' as 'amarelo' | 'vermelho' });

  // Fix: changed 'role' to 'perfil' and 'Role' to 'UserRole' based on types.ts definitions
  const isAdmin = user.perfil === UserRole.ADM_LOCAL || user.perfil === UserRole.ADM_GERAL;
  const activeAvisos = avisos.filter(a => a.ativo);

  const handleAddAviso = () => {
    if (!newAviso.titulo || !newAviso.descricao) return;

    dbService.saveAviso({
      id: Math.random().toString(36).substr(2, 9),
      titulo: newAviso.titulo,
      descricao: newAviso.descricao,
      tipo: newAviso.tipo,
      ativo: true,
      dataCriacao: new Date().toISOString()
    });

    setNewAviso({ titulo: '', descricao: '', tipo: 'amarelo' });
    setShowAddAviso(false);
    refresh();
  };

  const handleRemoveAviso = (id: string) => {
    dbService.deactivateAviso(id);
    refresh();
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
          <Megaphone className="text-primary w-8 h-8" /> Central de Comunicados
        </h2>
        {isAdmin && (
          <button
            onClick={() => setShowAddAviso(!showAddAviso)}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-lg hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" /> Novo Aviso
          </button>
        )}
      </div>

      {showAddAviso && (
        <div className="glass p-6 rounded-2xl border-2 border-primary animate-in zoom-in-95">
          <h3 className="font-bold text-white mb-6 uppercase text-sm">Configurar Novo Comunicado</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Título do Aviso</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Ex: Manutenção no Rancho"
                  value={newAviso.titulo}
                  onChange={e => setNewAviso({ ...newAviso, titulo: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tipo de Gravidade</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setNewAviso({ ...newAviso, tipo: 'amarelo' })}
                    className={`flex-1 h-12 rounded-xl font-bold text-xs uppercase border-2 transition-all ${newAviso.tipo === 'amarelo' ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-white/5 border-transparent text-slate-400'}`}
                  >
                    Atenção (Amarelo)
                  </button>
                  <button
                    onClick={() => setNewAviso({ ...newAviso, tipo: 'vermelho' })}
                    className={`flex-1 h-12 rounded-xl font-bold text-xs uppercase border-2 transition-all ${newAviso.tipo === 'vermelho' ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-white/5 border-transparent text-slate-400'}`}
                  >
                    Urgente (Vermelho)
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Descrição do Comunicado</label>
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-xl h-32 p-4 text-white focus:ring-2 focus:ring-primary outline-none resize-none"
                placeholder="Descreva aqui as informações importantes..."
                value={newAviso.descricao}
                onChange={e => setNewAviso({ ...newAviso, descricao: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <button onClick={handleAddAviso} className="flex-1 bg-primary h-12 rounded-xl text-white font-bold uppercase text-xs">Publicar para Todos</button>
            <button onClick={() => setShowAddAviso(false)} className="flex-1 bg-white/5 h-12 rounded-xl text-slate-400 font-bold uppercase text-xs">Cancelar</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-white uppercase text-sm tracking-widest">Mural de Avisos</h3>
          </div>

          {activeAvisos.length === 0 ? (
            <div className="glass p-12 rounded-2xl border border-white/5 text-center">
              <Info className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Nenhum aviso ativo no momento.</p>
            </div>
          ) : (
            activeAvisos.map(aviso => (
              <div
                key={aviso.id}
                className={`glass p-6 rounded-2xl border-l-8 relative overflow-hidden transition-all hover:scale-[1.01] ${aviso.tipo === 'vermelho' ? 'border-red-500 bg-red-500/5' : 'border-amber-500 bg-amber-500/5'}`}
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <h4 className={`text-lg font-black uppercase tracking-tighter ${aviso.tipo === 'vermelho' ? 'text-red-500' : 'text-amber-500'}`}>
                    {aviso.titulo}
                  </h4>
                  {isAdmin && (
                    <button
                      onClick={() => handleRemoveAviso(aviso.id)}
                      className="p-2 bg-white/5 hover:bg-red-500/20 text-slate-500 hover:text-red-500 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{aviso.descricao}</p>
                <div className="mt-4 flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                  <span>Postado em: {new Date(aviso.dataCriacao).toLocaleDateString('pt-BR')}</span>
                  <span className={`px-2 py-0.5 rounded ${aviso.tipo === 'vermelho' ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-500'}`}>
                    {aviso.tipo === 'vermelho' ? 'Urgente' : 'Atenção'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Utensils className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-white uppercase text-sm tracking-widest">Previsão do Cardápio</h3>
          </div>

          <div className="glass rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-12 text-center">
              <p className="text-slate-500 italic text-sm">O cardápio semanal é atualizado toda segunda-feira pelo encarregado do rancho.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardapioView;

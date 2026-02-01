import React, { useState } from 'react';
import { Cardapio, Aviso, UserRole, Militar } from '../types';
import { dbService } from '../services/dbService';
// Adicionei 'Pencil' (Lápis) nas importações
import { AlertTriangle, Plus, Trash2, Megaphone, Info, Utensils, Calendar, Pencil } from 'lucide-react';

interface CardapioViewProps {
  user: Militar;
  cardapio: Cardapio[];
  avisos: Aviso[];
  refresh: () => void;
}

const CardapioView: React.FC<CardapioViewProps> = ({ user, cardapio = [], avisos = [], refresh }) => {
  const [showAddAviso, setShowAddAviso] = useState(false);
  const [showAddCardapio, setShowAddCardapio] = useState(false);

  const [newAviso, setNewAviso] = useState({ titulo: '', descricao: '', tipo: 'amarelo' as 'amarelo' | 'vermelho' });
  const [newCardapio, setNewCardapio] = useState({ data: '', almoço: '', jantar: '' });

  const isAdmin = user.perfil === UserRole.ADM_LOCAL || user.perfil === UserRole.ADM_GERAL;
  const activeAvisos = avisos.filter(a => a.ativo);

  // --- Lógica de Avisos ---
  const handleAddAviso = async () => {
    if (!newAviso.titulo || !newAviso.descricao) return;

    await dbService.saveAviso({
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

  const handleRemoveAviso = async (id: string) => {
    if (window.confirm("Deseja arquivar este aviso?")) {
      await dbService.deactivateAviso(id);
      refresh();
    }
  };

  // --- Lógica de Cardápio ---
  const handleAddCardapio = async () => {
    if (!newCardapio.data || !newCardapio.almoço || !newCardapio.jantar) {
      alert("Preencha todos os campos do cardápio!");
      return;
    }

    await dbService.saveCardapio({
      data: newCardapio.data,
      almoço: newCardapio.almoço,
      jantar: newCardapio.jantar
    });

    setNewCardapio({ data: '', almoço: '', jantar: '' });
    setShowAddCardapio(false);
    refresh();
  };

  const handleEditCardapio = (item: Cardapio) => {
    // Preenche o formulário com os dados do item clicado
    setNewCardapio({
      data: item.data,
      almoço: item.almoço,
      jantar: item.jantar
    });
    // Abre o formulário
    setShowAddCardapio(true);
    // Rola a tela para o topo do formulário (opcional, bom para mobile)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteCardapio = async (data: string) => {
    if (window.confirm(`Tem certeza que deseja EXCLUIR o cardápio do dia ${data}?`)) {
      await dbService.deleteCardapio(data);
      refresh();
    }
  };

  // Ordenar cardápio por data (mais recente primeiro)
  const cardapioOrdenado = [...cardapio].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">

      {/* --- SEÇÃO DE COMUNICADOS --- */}
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

      {/* Formulário Novo Aviso */}
      {showAddAviso && (
        <div className="glass p-6 rounded-2xl border-2 border-primary animate-in zoom-in-95">
          <h3 className="font-bold text-white mb-6 uppercase text-sm">Novo Comunicado</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl h-12 px-4 text-white"
                placeholder="Título do Aviso"
                value={newAviso.titulo}
                onChange={e => setNewAviso({ ...newAviso, titulo: e.target.value })}
              />
              <div className="flex gap-4">
                <button onClick={() => setNewAviso({ ...newAviso, tipo: 'amarelo' })} className={`flex-1 h-12 rounded-xl font-bold text-xs uppercase border-2 ${newAviso.tipo === 'amarelo' ? 'bg-amber-500/20 border-amber-500 text-amber-500' : 'bg-white/5 border-transparent text-slate-400'}`}>Atenção (Amarelo)</button>
                <button onClick={() => setNewAviso({ ...newAviso, tipo: 'vermelho' })} className={`flex-1 h-12 rounded-xl font-bold text-xs uppercase border-2 ${newAviso.tipo === 'vermelho' ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-white/5 border-transparent text-slate-400'}`}>Urgente (Vermelho)</button>
              </div>
            </div>
            <textarea
              className="w-full bg-white/5 border border-white/10 rounded-xl h-32 p-4 text-white resize-none"
              placeholder="Descrição..."
              value={newAviso.descricao}
              onChange={e => setNewAviso({ ...newAviso, descricao: e.target.value })}
            />
          </div>
          <div className="flex gap-4 mt-4">
            <button onClick={handleAddAviso} className="flex-1 bg-primary h-12 rounded-xl text-white font-bold uppercase text-xs">Publicar</button>
            <button onClick={() => setShowAddAviso(false)} className="flex-1 bg-white/5 h-12 rounded-xl text-slate-400 font-bold uppercase text-xs">Cancelar</button>
          </div>
        </div>
      )}

      {/* --- SEÇÃO DE CONTEÚDO --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* COLUNA 1: AVISOS */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-white uppercase text-sm tracking-widest">Mural de Avisos</h3>
          </div>

          {activeAvisos.length === 0 ? (
            <div className="glass p-12 rounded-2xl border border-white/5 text-center">
              <Info className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">Nenhum aviso ativo.</p>
            </div>
          ) : (
            activeAvisos.map(aviso => (
              <div key={aviso.id} className={`glass p-6 rounded-2xl border-l-8 relative mb-4 ${aviso.tipo === 'vermelho' ? 'border-red-500 bg-red-500/5' : 'border-amber-500 bg-amber-500/5'}`}>
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h4 className={`text-lg font-black uppercase ${aviso.tipo === 'vermelho' ? 'text-red-500' : 'text-amber-500'}`}>{aviso.titulo}</h4>
                  {isAdmin && (
                    <button onClick={() => handleRemoveAviso(aviso.id)} className="text-slate-500 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  )}
                </div>
                <p className="text-white text-sm">{aviso.descricao}</p>
                <div className="mt-2 text-[10px] text-slate-500 uppercase font-bold text-right">
                  {new Date(aviso.dataCriacao).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))
          )}
        </div>

        {/* COLUNA 2: CARDÁPIO */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-white uppercase text-sm tracking-widest">Cardápio da Semana</h3>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowAddCardapio(!showAddCardapio)}
                className="text-primary hover:text-white text-xs font-bold uppercase flex gap-1 items-center bg-primary/10 px-3 py-1 rounded-lg"
              >
                <Plus className="w-3 h-3" /> {showAddCardapio ? 'Fechar' : 'Gerenciar'}
              </button>
            )}
          </div>

          {/* Formulário de Adicionar/Editar Cardápio */}
          {showAddCardapio && (
            <div className="glass p-4 rounded-2xl border border-primary mb-4 animate-in fade-in">
              <h4 className="text-white font-bold text-xs uppercase mb-3">
                {newCardapio.data ? 'Editar/Adicionar Refeição' : 'Nova Refeição'}
              </h4>
              <div className="space-y-3">
                <input
                  type="date"
                  className="w-full bg-white/5 border border-white/10 rounded-lg h-10 px-3 text-white"
                  value={newCardapio.data}
                  onChange={e => setNewCardapio({ ...newCardapio, data: e.target.value })}
                />
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-lg h-20 p-3 text-white text-sm"
                  placeholder="Cardápio do Almoço..."
                  value={newCardapio.almoço}
                  onChange={e => setNewCardapio({ ...newCardapio, almoço: e.target.value })}
                />
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-lg h-20 p-3 text-white text-sm"
                  placeholder="Cardápio do Jantar..."
                  value={newCardapio.jantar}
                  onChange={e => setNewCardapio({ ...newCardapio, jantar: e.target.value })}
                />
                <div className="flex gap-2">
                  <button onClick={handleAddCardapio} className="flex-1 bg-primary h-10 rounded-lg text-white font-bold text-xs uppercase">Salvar Cardápio</button>
                  <button onClick={() => {
                    setShowAddCardapio(false);
                    setNewCardapio({ data: '', almoço: '', jantar: '' });
                  }} className="flex-1 bg-white/5 h-10 rounded-lg text-slate-400 font-bold text-xs uppercase">Cancelar</button>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Cardápios */}
          {cardapioOrdenado.length === 0 ? (
            <div className="glass rounded-2xl border border-white/10 p-12 text-center">
              <p className="text-slate-500 italic text-sm">Nenhum cardápio cadastrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cardapioOrdenado.map((item) => (
                <div key={item.data} className="glass rounded-2xl border border-white/10 overflow-hidden group">
                  <div className="bg-white/5 p-3 flex justify-between items-center border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="font-bold text-white text-sm uppercase">
                        {new Date(item.data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'numeric' })}
                      </span>
                    </div>

                    {/* BOTÕES DE AÇÃO (SÓ PARA ADMIN) */}
                    {isAdmin && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditCardapio(item)}
                          className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCardapio(item.data)}
                          className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                  </div>
                  <div className="p-4 grid grid-cols-1 gap-4 text-sm">
                    <div>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">Almoço</span>
                      <p className="text-slate-300 whitespace-pre-wrap">{item.almoço}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">Jantar</span>
                      <p className="text-slate-300 whitespace-pre-wrap">{item.jantar}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardapioView;
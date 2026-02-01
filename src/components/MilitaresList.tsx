import React, { useState } from 'react';
import { Militar, UserRole } from '../types';
import { dbService } from '../services/dbService';
import {
  Search,
  UserCog,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Trash2,
  Plus,
  UserPlus,
  X,
  Save
} from 'lucide-react';

interface MilitaresListProps {
  militares: Militar[];
  onSelectMilitar: (militar: Militar) => void;
  currentUser: Militar;
  onRefresh?: () => void;
}

const POSTOS_EB = [
  "Gen Ex", "Gen Div", "Gen Bda", "Cel", "Ten Cel", "Maj", "Cap", "1º Ten", "2º Ten", "Asp",
  "Subten", "1º Sgt", "2º Sgt", "3º Sgt", "Cb", "Sd", "Recruta"
];

const MilitaresList: React.FC<MilitaresListProps> = ({ militares, onSelectMilitar, currentUser, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Estado do Formulário de Novo Militar com NOME COMPLETO
  const [newMilitar, setNewMilitar] = useState<Partial<Militar>>({
    cpf: '',
    email: '',
    nome_guerra: '',
    nome: '', // Nome completo
    posto: 'Sd',
    perfil: UserRole.MILITAR,
    pin: '1234',
    ativo: true
  });

  const filteredMilitares = militares.filter(m => {
    if (!m) return false;
    const term = searchTerm.toLowerCase();
    const nome = (m.nome_guerra || m["Nome de Guerra"] || '').toLowerCase();
    const cpf = String(m.cpf || '').toLowerCase();
    return nome.includes(term) || cpf.includes(term);
  });

  const isAdmin = currentUser.perfil === UserRole.ADM_GERAL || currentUser.perfil === UserRole.ADM_LOCAL;

  const canManage = (targetUser: Militar) => {
    if (!targetUser) return false;
    if (currentUser.perfil === UserRole.ADM_GERAL) return true;
    if (currentUser.perfil === UserRole.ADM_LOCAL && targetUser.perfil === UserRole.ADM_GERAL) return false;
    if (currentUser.perfil === UserRole.ADM_LOCAL) return true;
    return false;
  };

  const handleDelete = async (e: React.MouseEvent, militar: Militar) => {
    e.stopPropagation();
    const confirmacao = window.confirm(
      `ATENÇÃO: Você está prestes a excluir o militar ${militar.nome_guerra}.\n\n` +
      `Isso também excluirá TODOS os registros de arranchamento e histórico dele.\n\n` +
      `Deseja continuar?`
    );

    if (confirmacao) {
      try {
        await dbService.deleteMilitar(String(militar.cpf));
        alert("Militar excluído com sucesso.");
        if (onRefresh) onRefresh();
        else window.location.reload();
      } catch (error) {
        alert("Erro ao excluir militar.");
        console.error(error);
      }
    }
  };

  const handleAddMilitar = async () => {
    // Validação agora exige nome completo
    if (!newMilitar.cpf || !newMilitar.nome_guerra || !newMilitar.nome || !newMilitar.posto || !newMilitar.email) {
      alert("Preencha todos os campos obrigatórios (CPF, Email, Nome de Guerra, Nome Completo e Posto).");
      return;
    }

    const cpfExiste = militares.some(m => m && String(m.cpf) === String(newMilitar.cpf));
    if (cpfExiste) {
      alert("Este CPF já está cadastrado!");
      return;
    }

    setIsProcessing(true);
    try {
      await dbService.addMilitar(newMilitar as Militar);
      alert("Militar cadastrado com sucesso!");
      setShowAddModal(false);
      setNewMilitar({ cpf: '', email: '', nome_guerra: '', nome: '', posto: 'Sd', perfil: UserRole.MILITAR, pin: '1234', ativo: true });
      if (onRefresh) onRefresh();
      else window.location.reload();
    } catch (error) {
      alert("Erro ao cadastrar.");
    }
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">

      <div className="glass p-6 rounded-2xl border border-white/10 sticky top-0 z-10 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <UserCog className="w-6 h-6 text-primary" /> Gestão de Efetivo
          </h2>

          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" /> Novo Militar
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por Nome de Guerra ou CPF..."
            className="w-full h-12 bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-primary transition-all uppercase"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <p className="text-right text-[10px] text-slate-500 font-bold mt-2 uppercase">
          Total: {filteredMilitares.length} Militares
        </p>
      </div>

      <div className="space-y-3">
        {filteredMilitares.map(militar => {
          if (!militar) return null;
          const permission = canManage(militar);
          const isInactive = militar.ativo === false;
          const postoExibicao = militar.posto || militar.posto_grad || "---";

          return (
            <div
              key={militar.id || militar.cpf || Math.random()}
              onClick={() => permission && onSelectMilitar(militar)}
              className={`glass p-4 rounded-xl border border-white/5 flex items-center justify-between group transition-all ${permission ? 'hover:scale-[1.01] hover:bg-white/5 cursor-pointer' : 'opacity-60 cursor-not-allowed grayscale'
                }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isInactive
                  ? 'bg-red-500/10 border-red-500 text-red-500'
                  : 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                  }`}>
                  {isInactive ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-white uppercase text-sm">{militar.nome_guerra || "Sem Nome"}</h3>
                  <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400">
                    <span className="text-primary">{postoExibicao}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                    <span className={militar.perfil === UserRole.ADM_GERAL ? 'text-amber-400' : 'text-slate-400'}>
                      {militar.perfil ? militar.perfil.replace(/_/g, ' ') : 'MILITAR'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!permission && (
                  <div className="flex items-center gap-1 text-[9px] font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded">
                    <ShieldAlert className="w-3 h-3" /> RESTRITO
                  </div>
                )}
                {permission && (
                  <>
                    <button
                      onClick={(e) => handleDelete(e, militar)}
                      className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Excluir Militar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                  </>
                )}
              </div>
            </div>
          );
        })}
        {filteredMilitares.length === 0 && (
          <div className="text-center py-10 text-slate-500 text-sm font-bold uppercase">
            Nenhum militar encontrado.
          </div>
        )}
      </div>

      {/* --- MODAL DE ADICIONAR MILITAR --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md glass p-6 rounded-3xl border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-white uppercase flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" /> Novo Militar
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* CPF */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">CPF (Apenas números)</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl h-10 px-3 text-white focus:ring-2 focus:ring-primary outline-none"
                  placeholder="00000000000"
                  maxLength={11}
                  value={newMilitar.cpf}
                  onChange={e => setNewMilitar({ ...newMilitar, cpf: e.target.value.replace(/\D/g, '') })}
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">E-mail de Login</label>
                <input
                  type="email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl h-10 px-3 text-white focus:ring-2 focus:ring-primary outline-none"
                  placeholder="exemplo@eb.mil.br"
                  value={newMilitar.email}
                  onChange={e => setNewMilitar({ ...newMilitar, email: e.target.value })}
                />
              </div>

              {/* Nome de Guerra */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nome de Guerra</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl h-10 px-3 text-white focus:ring-2 focus:ring-primary outline-none uppercase"
                  placeholder="Ex: FAGUNDES"
                  value={newMilitar.nome_guerra}
                  onChange={e => setNewMilitar({ ...newMilitar, nome_guerra: e.target.value.toUpperCase() })}
                />
              </div>

              {/* NOVO: Nome Completo */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nome Completo</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl h-10 px-3 text-white focus:ring-2 focus:ring-primary outline-none uppercase"
                  placeholder="Ex: EZEQUIEL FAGUNDES"
                  value={newMilitar.nome}
                  onChange={e => setNewMilitar({ ...newMilitar, nome: e.target.value.toUpperCase() })}
                />
              </div>

              {/* Posto */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Posto / Graduação</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-xl h-10 px-3 text-white focus:ring-2 focus:ring-primary outline-none"
                  value={newMilitar.posto}
                  onChange={e => setNewMilitar({ ...newMilitar, posto: e.target.value })}
                >
                  {POSTOS_EB.map(posto => (
                    <option key={posto} value={posto} className="bg-slate-900">{posto}</option>
                  ))}
                </select>
              </div>

              {/* Perfil */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Perfil de Acesso</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-xl h-10 px-3 text-white focus:ring-2 focus:ring-primary outline-none"
                  value={newMilitar.perfil}
                  onChange={e => setNewMilitar({ ...newMilitar, perfil: e.target.value as UserRole })}
                >
                  <option value={UserRole.MILITAR} className="bg-slate-900">MILITAR</option>
                  <option value={UserRole.FISC_SU} className="bg-slate-900">FISCAL DE SU</option>
                  <option value={UserRole.ADM_LOCAL} className="bg-slate-900">ADM LOCAL</option>
                  <option value={UserRole.ADM_GERAL} className="bg-slate-900">ADM GERAL</option>
                </select>
              </div>

              {/* PIN */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Senha Inicial (PIN)</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl h-10 px-3 text-white focus:ring-2 focus:ring-primary outline-none"
                  value={newMilitar.pin}
                  onChange={e => setNewMilitar({ ...newMilitar, pin: e.target.value })}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={handleAddMilitar}
                  disabled={isProcessing}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl uppercase text-xs flex items-center justify-center gap-2"
                >
                  {isProcessing ? 'Salvando...' : <><Save className="w-4 h-4" /> Cadastrar</>}
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-white/5 text-slate-400 font-bold h-12 rounded-xl uppercase text-xs"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilitaresList;
import React, { useState } from 'react';
import { Militar, UserRole } from '../types';
import { Search, UserCog, ShieldAlert, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';

interface MilitaresListProps {
  militares: Militar[];
  onSelectMilitar: (militar: Militar) => void;
  currentUser: Militar;
}

const MilitaresList: React.FC<MilitaresListProps> = ({ militares, onSelectMilitar, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtra a lista pelo termo de busca
  const filteredMilitares = militares.filter(m => {
    const term = searchTerm.toLowerCase();
    const nome = (m.nome_guerra || m["Nome de Guerra"] || '').toLowerCase();
    const cpf = String(m.cpf || '').toLowerCase();
    return nome.includes(term) || cpf.includes(term);
  });

  // Função para checar permissão de edição
  const canEdit = (targetUser: Militar) => {
    // ADM_GERAL pode tudo
    if (currentUser.perfil === UserRole.ADM_GERAL) return true;

    // ADM_LOCAL não pode editar ADM_GERAL
    if (currentUser.perfil === UserRole.ADM_LOCAL && targetUser.perfil === UserRole.ADM_GERAL) {
      return false;
    }

    // ADM_LOCAL pode editar o resto
    if (currentUser.perfil === UserRole.ADM_LOCAL) return true;

    return false;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">

      {/* --- CABEÇALHO E BUSCA --- */}
      <div className="glass p-6 rounded-2xl border border-white/10 sticky top-0 z-10">
        <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2 mb-4">
          <UserCog className="w-6 h-6 text-primary" /> Gestão de Efetivo
        </h2>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por Nome de Guerra ou CPF..."
            className="w-full h-12 bg-black/20 border border-white/10 rounded-xl pl-12 pr-4 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-primary transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <p className="text-right text-[10px] text-slate-500 font-bold mt-2 uppercase">
          Total: {filteredMilitares.length} Militares
        </p>
      </div>

      {/* --- LISTA DE MILITARES --- */}
      <div className="space-y-3">
        {filteredMilitares.map(militar => {
          const permission = canEdit(militar);
          const isInactive = militar.ativo === false;

          return (
            <div
              key={militar.id || militar.cpf}
              onClick={() => permission && onSelectMilitar(militar)}
              className={`glass p-4 rounded-xl border border-white/5 flex items-center justify-between group transition-all ${permission ? 'hover:scale-[1.01] hover:bg-white/5 cursor-pointer' : 'opacity-60 cursor-not-allowed grayscale'
                }`}
            >
              <div className="flex items-center gap-4">
                {/* Ícone de Status */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isInactive
                    ? 'bg-red-500/10 border-red-500 text-red-500'
                    : 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                  }`}>
                  {isInactive ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                </div>

                <div>
                  <h3 className="font-bold text-white uppercase text-sm">{militar.nome_guerra || "Sem Nome"}</h3>
                  <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-slate-400">
                    <span>{militar.posto_grad || "---"}</span>
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
                    <ShieldAlert className="w-3 h-3" /> RESTITRO
                  </div>
                )}
                {permission && (
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
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
    </div>
  );
};

export default MilitaresList;
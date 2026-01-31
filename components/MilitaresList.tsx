
import React, { useState } from 'react';
import { Militar, UserRole } from '../types';
import { Search, UserCog, Shield, ChevronRight } from 'lucide-react';

interface MilitaresListProps {
  militares: Militar[];
  onSelectMilitar: (militar: Militar) => void;
}

const MilitaresList: React.FC<MilitaresListProps> = ({ militares, onSelectMilitar }) => {
  const [search, setSearch] = useState('');

  const filtered = militares.filter(m => 
    m.nome.toLowerCase().includes(search.toLowerCase()) || 
    m.nome_guerra.toLowerCase().includes(search.toLowerCase()) ||
    m.cpf.includes(search)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Gestão de Usuários</h2>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Pesquisar por nome ou CPF..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-11 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm text-white focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
      </div>

      <div className="glass rounded-3xl border border-white/10 overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Militar</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden md:table-cell">Setor</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Perfil</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(m => (
              <tr key={m.cpf} className="hover:bg-white/5 transition-all group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-white border border-white/10 group-hover:border-primary/50 transition-all uppercase">
                      {m.nome_guerra.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{m.nome_guerra} ({m.posto_grad})</p>
                      <p className="text-[10px] text-slate-500 uppercase">{m.nome}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                   <span className="text-xs text-slate-400 font-medium">{m.setor_nome}</span>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-2">
                     <Shield className={`w-3 h-3 ${m.perfil === UserRole.MILITAR ? 'text-slate-500' : 'text-primary'}`} />
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{m.perfil}</span>
                   </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onSelectMilitar(m)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 text-slate-400 hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-all"
                  >
                    <UserCog className="w-4 h-4" /> Gerenciar <ChevronRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MilitaresList;


import React, { useState } from 'react';
import { Arranchamento, Militar } from '../types';
import { Search, CheckCircle, XCircle, Printer, Filter } from 'lucide-react';

interface PresenceProps {
  arranchamentos: Arranchamento[];
  militares: Militar[];
  onTogglePresenca: (militarCpf: string, data: string, tipo: 'almoço' | 'jantar') => void;
}

const Presence: React.FC<PresenceProps> = ({ arranchamentos, militares, onTogglePresenca }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<'almoço' | 'jantar'>('almoço');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  const arranchadosNoDia = arranchamentos.filter(a => a.data === filterDate && (tipoFiltro === 'almoço' ? a.almoco : a.jantar));

  const filtered = militares.filter(m => {
    const isArranchado = arranchadosNoDia.some(a => a.militar_cpf === m.cpf);
    const matchesSearch = m.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.nome_guerra.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.cpf.includes(searchTerm);
    return isArranchado && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Presença Real</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <Filter className="w-4 h-4 text-slate-400" />
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="bg-transparent text-white text-sm font-bold focus:outline-none" />
          </div>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg"><Printer className="w-4 h-4" /> Exportar</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input type="text" placeholder="Buscar militar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary" />
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 h-14">
          <button onClick={() => setTipoFiltro('almoço')} className={`flex-1 rounded-xl text-xs font-bold uppercase ${tipoFiltro === 'almoço' ? 'bg-primary text-white' : 'text-slate-400'}`}>Almoço</button>
          <button onClick={() => setTipoFiltro('jantar')} className={`flex-1 rounded-xl text-xs font-bold uppercase ${tipoFiltro === 'jantar' ? 'bg-primary text-white' : 'text-slate-400'}`}>Jantar</button>
        </div>
      </div>
      <div className="glass rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Militar</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Setor</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-center">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase text-right print:hidden">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(m => {
              const arr = arranchadosNoDia.find(a => a.militar_cpf === m.cpf)!;
              const hasCheck = tipoFiltro === 'almoço' ? arr.presenca_almoco : arr.presenca_jantar;
              return (
                <tr key={m.cpf} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col"><span className="font-bold text-white text-sm">{m.nome_guerra} ({m.posto_grad})</span><span className="text-[10px] text-slate-500 uppercase">{m.nome}</span></div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400 font-medium">{m.setor_id}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${hasCheck ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                      {hasCheck ? 'Compareceu' : 'Faltou'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right print:hidden">
                    <button onClick={() => onTogglePresenca(m.cpf, filterDate, tipoFiltro)} className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${hasCheck ? 'bg-green-500 text-white' : 'bg-white/5 text-slate-400'}`}>
                      {hasCheck ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {hasCheck ? 'Presente' : 'Marcar'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Presence;

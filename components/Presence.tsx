
import React, { useState } from 'react';
import { Arranchamento, Militar } from '../types';
import { Search, CheckCircle, XCircle, Printer, Filter } from 'lucide-react';

interface PresenceProps {
  arranchamentos: Arranchamento[];
  militares: Militar[];
  onTogglePresenca: (militarId: string, data: string, tipo: 'almoço' | 'jantar') => void;
}

const Presence: React.FC<PresenceProps> = ({ arranchamentos, militares, onTogglePresenca }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<'almoço' | 'jantar'>('almoço');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  const arranchadosNoDia = arranchamentos.filter(a => a.data === filterDate && (tipoFiltro === 'almoço' ? a.almoço : a.jantar));

  const filtered = militares.filter(m => {
    const isArranchado = arranchadosNoDia.some(a => a.militarId === m.id);
    const matchesSearch = m.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.nomeGuerra.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.cpf.includes(searchTerm);
    return isArranchado && matchesSearch;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Controle de Presença</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <Filter className="w-4 h-4 text-slate-400" />
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-transparent text-white text-sm font-bold focus:outline-none"
            />
          </div>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
          >
            <Printer className="w-4 h-4" /> Exportar Lista
          </button>
        </div>
      </div>

      {/* Header only for Print */}
      <div className="hidden print:block text-black p-8 border-b-2 border-black mb-6">
        <h1 className="text-2xl font-bold text-center uppercase">Lista de Arranchados - E-Rancho</h1>
        <div className="flex justify-between mt-4 font-bold">
          <span>Data: {filterDate.split('-').reverse().join('/')}</span>
          <span>Refeição: {tipoFiltro.toUpperCase()}</span>
          <span>Total: {filtered.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nome, guerra ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 h-14">
          <button
            onClick={() => setTipoFiltro('almoço')}
            className={`flex-1 rounded-xl text-xs font-bold uppercase transition-all ${tipoFiltro === 'almoço' ? 'bg-primary text-white' : 'text-slate-400'}`}
          >
            Almoço
          </button>
          <button
            onClick={() => setTipoFiltro('jantar')}
            className={`flex-1 rounded-xl text-xs font-bold uppercase transition-all ${tipoFiltro === 'jantar' ? 'bg-primary text-white' : 'text-slate-400'}`}
          >
            Jantar
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl border border-white/10 overflow-hidden print:border-black print:text-black print:bg-white">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10 print:bg-gray-100 print:border-black">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest print:text-black">Posto/Grad</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest print:text-black">Nome de Guerra</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest print:text-black">Setor</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center print:text-black">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right print:hidden">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 print:divide-black">
            {filtered.length > 0 ? filtered.map(m => {
              const arr = arranchadosNoDia.find(a => a.militarId === m.id)!;
              const hasCheck = tipoFiltro === 'almoço' ? arr.presencaAlmoço : arr.presencaJantar;

              return (
                <tr key={m.id} className="hover:bg-white/5 transition-colors print:hover:bg-transparent">
                  <td className="px-6 py-4 text-sm text-slate-400 font-medium print:text-black">{m.posto}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-sm print:text-black">{m.nomeGuerra}</span>
                      <span className="text-[10px] text-slate-500 uppercase print:hidden">{m.nomeCompleto}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400 font-medium print:text-black">{m.setor}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`
                      inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase
                      ${hasCheck ? 'bg-green-500/20 text-green-500 print:text-green-700' : 'bg-red-500/20 text-red-500 print:text-red-700'}
                    `}>
                      {hasCheck ? 'Compareceu' : 'Faltou'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right print:hidden">
                    <button
                      onClick={() => onTogglePresenca(m.id, filterDate, tipoFiltro)}
                      className={`
                        inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all
                        ${hasCheck ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-white/5 text-slate-400 hover:text-white'}
                      `}
                    >
                      {hasCheck ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {hasCheck ? 'Presente' : 'Marcar'}
                    </button>
                  </td>
                </tr>
              )
            }) : (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center text-slate-500 font-medium">Nenhum militar arranchado para {tipoFiltro} na data selecionada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\:block, .print\:block * { visibility: visible; }
          .glass { visibility: visible; background: white !important; color: black !important; border: 1px solid black !important; }
          table, th, td { visibility: visible; border: 1px solid black !important; }
          thead th { background-color: #f3f4f6 !important; color: black !important; }
          .print\:hidden { display: none !important; }
          .fixed, header, aside { display: none !important; }
          main { margin: 0 !important; padding: 0 !important; }
          .min-h-screen { height: auto !important; min-height: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default Presence;

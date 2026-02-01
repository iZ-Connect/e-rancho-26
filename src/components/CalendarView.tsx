import React, { useState } from 'react';
import { Arranchamento, Cardapio, Militar, Bloqueio, UserRole } from '../types';
import { isBusinessDay, getDayName, getMinArranchamentoDate, getMaxArranchamentoDate } from '../utils/helpers';
import { ChevronLeft, ChevronRight, Check, X, Utensils, AlertCircle, Lock, Unlock } from 'lucide-react';
import { dbService } from '../services/dbService';

interface CalendarViewProps {
  user: Militar;
  arranchamentos: Arranchamento[];
  cardapio: Cardapio[];
  bloqueios: Bloqueio[];
  onToggle: (date: string, type: 'almoço' | 'jantar') => void;
  refresh: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ user, arranchamentos, cardapio, bloqueios, onToggle, refresh }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showBlockModal, setShowBlockModal] = useState<{ date: string } | null>(null);
  const [blockReason, setBlockReason] = useState('');

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const isAdmin = user.perfil === UserRole.ADM_LOCAL || user.perfil === UserRole.ADM_GERAL || user.cpf === '00000000001';

  const handleBlockDay = async () => {
    if (!showBlockModal || !blockReason) return;
    await dbService.saveBloqueio({
      data: showBlockModal.date,
      motivo: blockReason,
      criadoPor: user.nome_guerra
    });
    setBlockReason('');
    setShowBlockModal(null);
    await refresh();
  };

  const handleUnblockDay = async (date: string) => {
    if (confirm('Deseja liberar este dia para arranchamento?')) {
      await dbService.removeBloqueio(date);
      await refresh();
    }
  };

  const renderDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = daysInMonth(year, month);
    const days = [];

    // Calcula datas limites para o militar comum (Regra dos 5 dias)
    const minDate = getMinArranchamentoDate();
    const maxDate = getMaxArranchamentoDate(minDate);

    // Usuários de teste ou Admins podem ter regras diferentes, mas aqui seguimos o padrão
    const isTestUser = user.cpf === '00000000001' || String(user.cpf) === '12345678910';

    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      const dateStr = date.toISOString().split('T')[0];
      const isBusiness = isBusinessDay(date);
      const bloqueio = bloqueios.find(b => b.data === dateStr);

      // Verifica se a data está dentro da janela permitida para arranchamento
      const isInWindow = (date >= minDate && date <= maxDate);

      // Permissão de edição: TestUser OU (Dentro da Janela E Sem Bloqueio)
      // Nota: Admins podem bloquear/desbloquear, mas a regra de arranchar segue a janela para evitar bagunça
      const canEdit = isTestUser || (isInWindow && !bloqueio);

      const arrData = arranchamentos.find(a => a.data === dateStr && a.militar_cpf === user.cpf);
      const dayCardapio = cardapio.find(c => c.data === dateStr);

      days.push(
        <div
          key={dateStr}
          className={`p-4 rounded-2xl border flex flex-col gap-3 relative overflow-hidden transition-all ${bloqueio
              ? 'bg-red-900/20 border-red-500/50' // VERMELHO SE BLOQUEADO
              : 'glass border-white/5'
            } ${(!isBusiness || (bloqueio && !isAdmin)) ? 'opacity-60' : ''}`}
        >
          {/* Faixa superior indicando bloqueio */}
          {bloqueio && <div className="absolute top-0 right-0 w-full h-1 bg-red-500" />}

          <div className="flex justify-between items-start">
            <div>
              <p className={`text-xl font-black ${bloqueio ? 'text-red-400' : 'text-white'}`}>{i}</p>
              <p className={`text-[9px] font-bold uppercase tracking-tighter ${bloqueio ? 'text-red-300' : 'text-slate-400'}`}>{getDayName(dateStr)}</p>
            </div>

            <div className="flex gap-1">
              {isAdmin && (
                bloqueio
                  ? <button onClick={() => handleUnblockDay(dateStr)} className="p-1.5 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors" title="Desbloquear"><Unlock className="w-3.5 h-3.5" /></button>
                  : <button onClick={() => setShowBlockModal({ date: dateStr })} className="p-1.5 bg-slate-500/20 text-slate-400 rounded-lg hover:bg-slate-500/30 transition-colors" title="Bloquear"><Lock className="w-3.5 h-3.5" /></button>
              )}
            </div>
          </div>

          {/* Mensagem de Bloqueio */}
          {bloqueio && (
            <div className="bg-red-500/10 border border-red-500/20 p-2 rounded-lg">
              <p className="text-[9px] font-black text-red-500 uppercase flex items-center gap-1 mb-1"><AlertCircle className="w-3 h-3" /> Bloqueado</p>
              <p className="text-[10px] text-white font-medium leading-tight">{bloqueio.motivo}</p>
            </div>
          )}

          {/* Botões de Refeição (Só aparecem se for dia útil e não estiver bloqueado para o usuário comum) */}
          {isBusiness && (
            <>
              <div className="flex flex-col gap-1.5 mt-auto">
                <button
                  disabled={!canEdit}
                  onClick={() => onToggle(dateStr, 'almoço')}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${arrData?.almoco ? 'bg-primary text-white shadow-lg' : 'bg-white/5 text-slate-400'
                    } ${!canEdit ? 'cursor-not-allowed opacity-50' : 'hover:scale-105'}`}
                >
                  <div className="flex items-center gap-2"><Utensils className="w-3 h-3" /> Almoço</div>
                  {arrData?.almoco ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                </button>

                <button
                  disabled={!canEdit}
                  onClick={() => onToggle(dateStr, 'jantar')}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-bold transition-all ${arrData?.jantar ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-slate-400'
                    } ${!canEdit ? 'cursor-not-allowed opacity-50' : 'hover:scale-105'}`}
                >
                  <div className="flex items-center gap-2"><Utensils className="w-3 h-3" /> Jantar</div>
                  {arrData?.jantar ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                </button>
              </div>

              {/* Cardápio do dia */}
              {dayCardapio && (
                <div className="text-[9px] text-slate-400 bg-white/5 p-1.5 rounded-lg line-clamp-1 mt-1 border border-white/5">
                  {dayCardapio.almoço}
                </div>
              )}
            </>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3 uppercase">Arranchamento</h2>
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 hover:bg-white/10 rounded-lg text-slate-400"><ChevronLeft className="w-5 h-5" /></button>
          <span className="text-sm font-black text-white px-4 uppercase tracking-widest min-w-[150px] text-center">{currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 hover:bg-white/10 rounded-lg text-slate-400"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {renderDays()}
      </div>

      {showBlockModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md glass rounded-3xl border border-white/10 p-8 shadow-2xl">
            <h3 className="text-xl font-black text-white uppercase mb-4 flex items-center gap-2"><Lock className="w-6 h-6 text-amber-500" /> Bloquear Dia</h3>
            <p className="text-sm text-slate-400 mb-4">Motivo para o dia <span className="text-white font-bold">{showBlockModal.date.split('-').reverse().join('/')}</span></p>
            <textarea
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Ex: Manutenção do Refeitório, Dedetização..."
              className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-primary outline-none resize-none mb-6 placeholder-slate-500"
            />
            <div className="flex gap-4">
              <button onClick={handleBlockDay} className="flex-1 h-12 bg-primary text-white font-bold rounded-xl uppercase text-xs hover:bg-primary/90 transition-colors">Confirmar</button>
              <button onClick={() => setShowBlockModal(null)} className="flex-1 h-12 bg-white/5 text-slate-400 font-bold rounded-xl uppercase text-xs hover:bg-white/10 transition-colors">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
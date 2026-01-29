
import React, { useState } from 'react';
import { Arranchamento, Cardapio, Militar } from '../types';
import { isBusinessDay, formatDateBR, getDayName, getMinArranchamentoDate } from '../utils/helpers';
import { ChevronLeft, ChevronRight, Check, X, Utensils } from 'lucide-react';

interface CalendarViewProps {
  user: Militar;
  arranchamentos: Arranchamento[];
  cardapio: Cardapio[];
  onToggle: (date: string, type: 'almoço' | 'jantar') => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ user, arranchamentos, cardapio, onToggle }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

  const renderDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = daysInMonth(year, month);
    const days = [];
    const minDate = getMinArranchamentoDate();

    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      const dateStr = date.toISOString().split('T')[0];
      const isBusiness = isBusinessDay(date);
      const canEdit = date >= minDate;
      const arrData = arranchamentos.find(a => a.data === dateStr && a.militarId === user.id);
      const dayCardapio = cardapio.find(c => c.data === dateStr);

      days.push(
        <div key={dateStr} className={`glass p-4 rounded-2xl border border-white/5 flex flex-col gap-4 ${!isBusiness ? 'opacity-30' : ''}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xl font-black text-white">{i}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{getDayName(dateStr)}</p>
            </div>
            {!canEdit && isBusiness && (
              <span className="text-[9px] font-bold text-red-400 uppercase bg-red-400/10 px-1.5 py-0.5 rounded">Bloqueado</span>
            )}
          </div>

          {isBusiness && (
            <>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => canEdit && onToggle(dateStr, 'almoço')}
                  className={`
                    flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all
                    ${arrData?.almoço ? 'bg-primary text-white' : 'bg-white/5 text-slate-400'}
                    ${!canEdit ? 'cursor-not-allowed' : 'hover:scale-105'}
                  `}
                >
                  <div className="flex items-center gap-2">
                    <Utensils className="w-3 h-3" /> Almoço
                  </div>
                  {arrData?.almoço ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                </button>

                <button
                  onClick={() => canEdit && onToggle(dateStr, 'jantar')}
                  className={`
                    flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all
                    ${arrData?.jantar ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400'}
                    ${!canEdit ? 'cursor-not-allowed' : 'hover:scale-105'}
                  `}
                >
                   <div className="flex items-center gap-2">
                    <Utensils className="w-3 h-3" /> Jantar
                  </div>
                  {arrData?.jantar ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                </button>
              </div>

              {dayCardapio && (
                <div className="text-[9px] text-slate-500 bg-white/5 p-2 rounded-lg line-clamp-2">
                  <span className="font-bold text-slate-400">Cardápio: </span>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3 uppercase">
          Calendário de Rancho
        </h2>
        <div className="flex items-center gap-3 bg-white/5 p-1 rounded-xl">
          <button 
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
            className="p-2 hover:bg-white/10 rounded-lg text-slate-400"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-black text-white px-4 uppercase tracking-widest min-w-[150px] text-center">
            {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </span>
          <button 
             onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
             className="p-2 hover:bg-white/10 rounded-lg text-slate-400"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
        {renderDays()}
      </div>

      <div className="p-4 glass border-l-4 border-primary rounded-xl flex items-start gap-4">
        <div className="p-2 bg-primary/20 text-primary rounded-lg shrink-0">
          <Check className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">Regras de Arranchamento</h4>
          <p className="text-xs text-slate-400 mt-1">
            Militar não pode arranchar para Hoje ou Amanhã. A janela mínima de antecedência é de <strong className="text-white">5 dias</strong>.
            Cancelamentos também devem respeitar este prazo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;

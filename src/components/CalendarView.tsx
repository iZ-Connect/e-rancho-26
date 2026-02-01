import React, { useMemo } from 'react';
import { Arranchamento, Cardapio, Militar, Bloqueio, UserRole } from '../types';
import {
  Calendar as CalendarIcon,
  Utensils,
  Check,
  AlertCircle,
  Lock,
  Clock
} from 'lucide-react';

interface CalendarViewProps {
  user: Militar;
  arranchamentos: Arranchamento[];
  cardapio: Cardapio[];
  bloqueios: Bloqueio[];
  onToggle: (data: string, refeicao: 'almoco' | 'jantar') => void;
  refresh?: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  user,
  arranchamentos,
  cardapio,
  bloqueios,
  onToggle
}) => {

  // Função para calcular data com acréscimo de dias úteis
  const addBusinessDays = (startDate: Date, daysToAdd: number) => {
    let count = 0;
    const currentDate = new Date(startDate);
    while (count < daysToAdd) {
      currentDate.setDate(currentDate.getDate() + 1);
      const day = currentDate.getDay();
      // 0 = Domingo, 6 = Sábado
      if (day !== 0 && day !== 6) {
        count++;
      }
    }
    return currentDate;
  };

  const getTodayLocal = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    return new Date(today.getTime() - offset).toISOString().split('T')[0];
  }

  const todayVal = getTodayLocal();
  const isAdmGeral = user.perfil === UserRole.ADM_GERAL;

  // Calcula a data limite para usuários comuns (Hoje + 5 dias úteis)
  const deadlineDate = useMemo(() => {
    const hoje = new Date();
    // Ajuste de fuso para garantir cálculo correto
    const offset = hoje.getTimezoneOffset() * 60000;
    const localHoje = new Date(hoje.getTime() - offset);
    localHoje.setHours(0, 0, 0, 0);

    return addBusinessDays(localHoje, 5); // 5 dias úteis de antecedência
  }, []);

  // Gera os próximos 30 dias
  const days = useMemo(() => {
    const lista = [];
    const hoje = new Date();
    const offset = hoje.getTimezoneOffset() * 60000;
    const localHoje = new Date(hoje.getTime() - offset);

    for (let i = 0; i < 35; i++) { // Aumentei um pouco para garantir visualização pós-prazo
      const d = new Date(localHoje);
      d.setDate(localHoje.getDate() + i);
      lista.push(d.toISOString().split('T')[0]);
    }
    return lista;
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between glass p-6 rounded-2xl border border-white/10 sticky top-0 z-10">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-primary" /> Arranchamento
          </h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
            {isAdmGeral ? "Modo Teste: Acesso Total Liberado" : "Planejamento (Antecedência: 5 dias úteis)"}
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-[10px] text-slate-500 font-bold uppercase">Hoje</p>
          <p className="text-lg font-black text-white">{new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {days.map(dayStr => {
          const dateObj = new Date(dayStr);
          // Ajuste para comparação correta de datas (zera horas)
          const dateObjCompare = new Date(dateObj);
          dateObjCompare.setHours(0, 0, 0, 0);
          dateObjCompare.setDate(dateObjCompare.getDate() + 1); // Compensação de timezone simples para comparação

          const diaSemana = dateObj.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
          const diaMes = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

          const agendamento = arranchamentos.find(a => a.data === dayStr);
          const almocoMarcado = agendamento?.almoco || false;
          const jantarMarcado = agendamento?.jantar || false;

          const itemCardapio = cardapio.find(c => c.data === dayStr);
          const bloqueio = bloqueios.find(b => b.data === dayStr);

          // LÓGICA DE TRAVAMENTO
          const isPast = dayStr < todayVal;
          const isToday = dayStr === todayVal;

          // Verifica se a data é anterior ao prazo de 5 dias úteis
          // Nota: deadlineDate já está calculado corretamente acima
          // Criamos um new Date(dayStr) para comparar
          const currentDayObj = new Date(dayStr);
          currentDayObj.setHours(0, 0, 0, 0);
          // Pequeno ajuste de fuso para garantir que a comparação seja justa
          const offset = currentDayObj.getTimezoneOffset() * 60000;
          const localCurrentDay = new Date(currentDayObj.getTime() + offset);

          const isBeforeDeadline = localCurrentDay < deadlineDate;

          let isLocked = false;
          let lockReason = "";

          if (isPast) {
            isLocked = true;
            lockReason = "Data Passada";
          } else if (bloqueio) {
            isLocked = true;
            lockReason = bloqueio.motivo; // Bloqueio administrativo (feriado, etc)
          } else if (isAdmGeral) {
            // ADM GERAL: Só bloqueia se for passado ou tiver bloqueio explícito (feriado)
            // LIBERA O RESTO (inclusive hoje e dentro do prazo de 5 dias)
            isLocked = false;
          } else {
            // USUÁRIO COMUM: Aplica a regra dos 5 dias úteis
            if (isBeforeDeadline) {
              isLocked = true;
              lockReason = "Fora do Prazo";
            }
          }

          return (
            <div
              key={dayStr}
              className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${isToday ? 'bg-white/5 border-primary/50 ring-1 ring-primary/30' :
                  isPast ? 'bg-black/20 border-white/5 opacity-60' :
                    'glass border-white/10 hover:border-white/20'
                }`}
            >
              {isToday && (
                <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-black px-2 py-1 rounded-bl-xl uppercase tracking-widest z-20">
                  Hoje
                </div>
              )}

              {/* Título do Dia */}
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/20">
                <div>
                  <span className="text-xs font-black uppercase text-slate-500 mr-2">{diaSemana}</span>
                  <span className="text-lg font-black text-white">{diaMes}</span>
                </div>
                {bloqueio && (
                  <div className="flex items-center gap-1 text-red-400 bg-red-400/10 px-2 py-1 rounded-lg">
                    <AlertCircle className="w-3 h-3" />
                    <span className="text-[9px] font-bold uppercase">{bloqueio.motivo}</span>
                  </div>
                )}
              </div>

              {/* Prato do Dia (Resumo) */}
              <div className="px-4 py-2 min-h-[40px] flex items-center">
                {itemCardapio ? (
                  <p className="text-[10px] text-slate-400 line-clamp-1 italic">
                    🍽️ {itemCardapio.almoco}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-600 italic">Cardápio não cadastrado</p>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="p-3 grid grid-cols-2 gap-3">
                {/* Botão Almoço */}
                <button
                  onClick={() => !isLocked && onToggle(dayStr, 'almoco')}
                  disabled={isLocked}
                  className={`h-12 rounded-xl flex items-center justify-center gap-2 transition-all relative overflow-hidden ${almocoMarcado
                      ? 'bg-emerald-500 text-black font-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    } ${isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                  {almocoMarcado ? <Check className="w-5 h-5" /> : <Utensils className="w-4 h-4" />}
                  <span className="text-xs font-bold uppercase">Almoço</span>
                </button>

                {/* Botão Jantar */}
                <button
                  onClick={() => !isLocked && onToggle(dayStr, 'jantar')}
                  disabled={isLocked}
                  className={`h-12 rounded-xl flex items-center justify-center gap-2 transition-all relative overflow-hidden ${jantarMarcado
                      ? 'bg-indigo-500 text-white font-black shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    } ${isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                  {jantarMarcado ? <Check className="w-5 h-5" /> : <Utensils className="w-4 h-4" />}
                  <span className="text-xs font-bold uppercase">Jantar</span>
                </button>
              </div>

              {/* Aviso de Bloqueio (Visual) */}
              {isLocked && !isPast && !bloqueio && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col items-center justify-center text-slate-400 z-10">
                  {isBeforeDeadline && !isAdmGeral ? (
                    <>
                      <Clock className="w-6 h-6 mb-1 opacity-50 text-amber-500" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500">Fora do Prazo</span>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">(5 dias úteis)</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-6 h-6 mb-1 opacity-50" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Fechado</span>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
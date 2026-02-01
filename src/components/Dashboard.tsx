import React, { useMemo, useState, useEffect } from 'react';
import { Arranchamento, Militar, Bloqueio } from '../types';
import { dbService } from '../services/dbService';
import {
  Utensils,
  CheckCircle2,
  Percent,
  Search,
  UserCheck,
  Calendar,
  AlertCircle,
  Clock,
  Printer
} from 'lucide-react';

interface DashboardProps {
  arranchamentos: Arranchamento[];
  militares: Militar[];
  bloqueios: Bloqueio[];
  onRefresh?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ arranchamentos, militares, bloqueios, onRefresh }) => {
  const getTodayLocal = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    return new Date(today.getTime() - offset).toISOString().split('T')[0];
  }

  const todayVal = getTodayLocal();
  const [filterDate, setFilterDate] = useState(todayVal);
  const [mealType, setMealType] = useState<'almoco' | 'jantar'>('almoco');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const isToday = filterDate === todayVal;

  // Atualiza título da aba para o arquivo PDF sair com nome correto
  useEffect(() => {
    const dataFormatada = filterDate.split('-').reverse().join('_');
    const refeicaoNome = mealType === 'almoco' ? 'ALMOCO' : 'JANTAR';
    document.title = `Relatorio_${refeicaoNome}_${dataFormatada}_HGeSM`;
  }, [filterDate, mealType]);

  const bloqueioDoDia = useMemo(() => {
    return bloqueios.find(b => b.data === filterDate);
  }, [bloqueios, filterDate]);

  const dashboardData = useMemo(() => {
    const dailyArr = arranchamentos.filter(a => a.data === filterDate);

    const list = dailyArr.filter(a => {
      if (mealType === 'almoco') return a.almoco || a.presenca_almoco;
      return a.jantar || a.presenca_jantar;
    });

    const richList = list.map(item => {
      const militar = militares.find(m => String(m.cpf) === String(item.militar_cpf));

      const isArranchado = mealType === 'almoco' ? item.almoco : item.jantar;
      const isPresente = mealType === 'almoco' ? item.presenca_almoco : item.presenca_jantar;
      const isLiberadoNaHora = isPresente && !isArranchado;

      return {
        ...item,
        nome: militar ? (militar["Nome de Guerra"] || militar.nome_guerra) : 'Desconhecido',
        posto: militar ? (militar["Posto"] || militar.posto_grad) : '---',
        isArranchado,
        isPresente,
        isLiberadoNaHora
      };
    });

    const totalPrevisto = richList.filter(i => i.isArranchado).length;
    const totalPresente = richList.filter(i => i.isPresente).length;
    const percentual = totalPrevisto > 0 ? Math.round((totalPresente / totalPrevisto) * 100) : 0;

    const filteredList = richList.filter(item => {
      const term = searchTerm.toLowerCase();
      return item.nome?.toLowerCase().includes(term) || String(item.militar_cpf).includes(term);
    });

    const sortedList = filteredList.sort((a, b) => {
      if (a.isLiberadoNaHora !== b.isLiberadoNaHora) return a.isLiberadoNaHora ? -1 : 1;
      if (a.isPresente !== b.isPresente) return a.isPresente ? -1 : 1;
      return a.nome.localeCompare(b.nome);
    });

    return { totalPrevisto, totalPresente, percentual, list: sortedList };
  }, [arranchamentos, militares, filterDate, mealType, searchTerm]);

  const handleTogglePresenca = async (cpf: string) => {
    if (!isToday) {
      alert("Você só pode marcar presença para o dia de HOJE.");
      return;
    }
    setLoadingAction(cpf);
    try {
      await dbService.togglePresenca(cpf, filterDate, mealType);
      if (onRefresh) onRefresh();
    } catch (error) { console.error(error); }
    setLoadingAction(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">

      {/* --- CABEÇALHO DA TELA (Oculto na Impressão) --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Painel de Controle</h2>
          <p className="text-xs text-slate-400 font-bold uppercase mt-1">Gestão Operacional do Rancho</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold uppercase transition-all w-full sm:w-auto justify-center"
          >
            <Printer className="w-4 h-4" /> Imprimir Lista
          </button>

          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-full sm:w-auto">
            <button
              onClick={() => setMealType('almoco')}
              className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${mealType === 'almoco' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Almoço
            </button>
            <button
              onClick={() => setMealType('jantar')}
              className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${mealType === 'jantar' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Jantar
            </button>
          </div>

          <div className="relative w-full sm:w-auto">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full bg-white/5 text-white text-sm font-bold border border-white/10 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:bg-black/20 uppercase"
            />
          </div>
        </div>
      </div>

      {bloqueioDoDia && (
        <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-xl animate-in slide-in-from-left-2 no-print">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
            <div>
              <h3 className="text-red-500 font-black uppercase text-sm tracking-wide">Dia Bloqueado</h3>
              <p className="text-red-300 text-xs font-bold mt-1 uppercase">Motivo: {bloqueioDoDia.motivo}</p>
            </div>
          </div>
        </div>
      )}

      {/* --- CARDS (Ocultos na Impressão) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        <StatCard title={`Previsto (${mealType})`} value={dashboardData.totalPrevisto} icon={Utensils} color="blue" />
        <StatCard title="Presentes Agora" value={dashboardData.totalPresente} icon={UserCheck} color="green" />
        <StatCard title="Adesão" value={dashboardData.percentual} unit="%" icon={Percent} color={dashboardData.percentual > 80 ? "green" : "amber"} />
      </div>

      {/* --- LISTA E RELATÓRIO --- */}
      <div className="glass rounded-2xl border border-white/10 overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black">

        {/* === CABEÇALHO DE IMPRESSÃO === */}
        <div className="hidden print:block text-center mb-6 pt-4">
          <h1 className="text-5xl font-black mb-1 leading-none text-black">HGeSM</h1>
          <h2 className="text-2xl font-bold uppercase border-b-2 border-black pb-1 mb-2 text-black">
            RELATÓRIO DE ARRANCHAMENTO - {mealType === 'almoco' ? 'ALMOÇO' : 'JANTAR'}
          </h2>
          <div className="flex justify-between items-end px-2">
            <p className="text-sm font-bold text-black">Data: {new Date(filterDate).toLocaleDateString('pt-BR')}</p>
            <div className="text-right">
              <p className="text-xs text-black font-bold">Previsto: {dashboardData.totalPrevisto}</p>
              <p className="text-xs text-black font-bold">Presente: {dashboardData.totalPresente}</p>
            </div>
          </div>
        </div>

        {/* Busca (Tela) */}
        <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-3 no-print">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="BUSCAR MILITAR..."
            className="bg-transparent text-white placeholder-slate-500 text-sm font-bold w-full outline-none uppercase"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Lista de Nomes */}
        <div className="max-h-[500px] overflow-y-auto print:max-h-none print:overflow-visible">
          {dashboardData.list.length === 0 ? (
            <div className="p-10 text-center text-slate-500 font-bold uppercase text-sm">
              Nenhum militar registrado.
            </div>
          ) : (
            // GRID DE 3 COLUNAS PARA ECONOMIZAR PAPEL
            <div className="divide-y divide-white/5 print:divide-y-0 print:grid print:grid-cols-3 print:gap-x-4 print:gap-y-2">
              {dashboardData.list.map(item => (
                <div
                  key={item.militar_cpf}
                  className={`p-4 flex items-center justify-between transition-colors 
                    ${item.isLiberadoNaHora ? 'bg-amber-500/10 border-l-4 border-amber-500' : ''}
                    ${item.isPresente && !item.isLiberadoNaHora ? 'bg-emerald-500/5' : ''}
                    hover:bg-white/5 
                    /* Estilos específicos de Impressão */
                    print:border print:border-black print:rounded-none print:p-1.5 print:break-inside-avoid print:bg-white print:text-black print:flex-row print:shadow-none print:h-auto`}
                >

                  {/* --- VISUALIZAÇÃO DE TELA (APP) --- */}
                  <div className="flex items-center gap-4 print:hidden">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 no-print ${item.isPresente ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                      {item.nome.charAt(0)}
                    </div>
                    <div>
                      <h4 className={`font-black uppercase text-sm flex items-center gap-2 ${item.isPresente ? 'text-white' : 'text-slate-300'}`}>
                        {item.nome}
                        {item.isLiberadoNaHora && (
                          <span className="bg-amber-500 text-black text-[9px] px-2 py-0.5 rounded font-bold uppercase no-print">
                            Acesso Liberado
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {item.posto} • CPF: {String(item.militar_cpf).slice(0, 3)}...
                      </p>
                    </div>
                  </div>

                  {/* --- VISUALIZAÇÃO DE IMPRESSÃO (CHECKBOX NA ESQUERDA) --- */}
                  <div className="hidden print:flex flex-row items-center w-full justify-start gap-2">

                    {/* CAIXA DE CHECKBOX */}
                    <div className="w-4 h-4 border border-black shrink-0 flex items-center justify-center">
                      {item.isPresente && (
                        <span className="text-xs font-bold text-black leading-none">X</span>
                      )}
                    </div>

                    {/* NOME E POSTO */}
                    <span className="font-bold text-[11px] uppercase truncate text-black leading-tight text-left">
                      {item.posto} {item.nome}
                      {item.isLiberadoNaHora && <span className="ml-1 text-[9px] font-bold">(LIB)</span>}
                    </span>
                  </div>

                  {/* Botão de Ação (Tela) */}
                  <button
                    onClick={() => isToday && handleTogglePresenca(String(item.militar_cpf))}
                    disabled={!isToday || loadingAction === String(item.militar_cpf)}
                    className={`px-4 py-2 rounded-lg font-bold text-[10px] uppercase flex items-center gap-2 transition-all no-print ${!isToday
                        ? 'bg-white/5 text-slate-500 cursor-not-allowed opacity-50'
                        : item.isPresente
                          ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                          : 'bg-white/10 text-slate-300 hover:bg-emerald-500 hover:text-black'
                      }`}
                  >
                    {loadingAction === String(item.militar_cpf) ? (
                      <span className="animate-spin">⌛</span>
                    ) : !isToday ? (
                      <><Clock className="w-3 h-3" /> Arranchado</>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        {item.isPresente ? "OK" : "Marcar"}
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, unit = "", icon: Icon, color }: { title: string, value: number, unit?: string, icon: any, color: string }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    green: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
  };

  return (
    <div className={`glass p-5 rounded-2xl border ${colorClasses[color]} flex items-center justify-between group`}>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
        <p className="text-3xl font-black text-white">{value}{unit}</p>
      </div>
      <div className={`p-3 rounded-xl bg-black/20 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

export default Dashboard;
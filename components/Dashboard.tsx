
import React, { useMemo, useState } from 'react';
import { Arranchamento, Militar } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Utensils, CheckCircle2, Filter, Percent } from 'lucide-react';

interface DashboardProps {
  arranchamentos: Arranchamento[];
  militares: Militar[];
}

const Dashboard: React.FC<DashboardProps> = ({ arranchamentos, militares }) => {
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealType, setMealType] = useState<'almoço' | 'jantar'>('almoço');

  const stats = useMemo(() => {
    const dailyArr = arranchamentos.filter(a => a.data === filterDate);
    
    const totalAlmoço = dailyArr.filter(a => a.almoco).length;
    const totalJanta = dailyArr.filter(a => a.jantar).length;
    const presenceAlmoço = dailyArr.filter(a => a.almoco && a.presenca_almoco).length;
    const presenceJanta = dailyArr.filter(a => a.jantar && a.presenca_jantar).length;

    const currentTotal = mealType === 'almoço' ? totalAlmoço : totalJanta;
    const currentPresent = mealType === 'almoço' ? presenceAlmoço : presenceJanta;
    const currentAbsent = currentTotal - currentPresent;

    const presenceData = [
      { name: 'Presentes', value: currentPresent, color: '#22c55e' },
      { name: 'Faltando', value: Math.max(0, currentAbsent), color: '#ef4444' }
    ];

    const sectorStats: Record<string, { total: number, present: number }> = {};
    dailyArr.forEach(arr => {
      const m = militares.find(mil => mil.cpf === arr.militar_cpf);
      if (m) {
        const setorNome = "Setor " + m.setor_id;
        if (!sectorStats[setorNome]) sectorStats[setorNome] = { total: 0, present: 0 };
        const isMealRelevant = mealType === 'almoço' ? arr.almoco : arr.jantar;
        const isPresenceRelevant = mealType === 'almoço' ? arr.presenca_almoco : arr.presenca_jantar;
        
        if (isMealRelevant) {
          sectorStats[setorNome].total += 1;
          if (isPresenceRelevant) sectorStats[setorNome].present += 1;
        }
      }
    });

    return { 
      totalAlmoço, totalJanta, presenceAlmoço, presenceJanta,
      presenceData,
      sectors: Object.entries(sectorStats).map(([name, data]) => ({ name, ...data }))
    };
  }, [arranchamentos, militares, filterDate, mealType]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Status de Presença</h2>
        <div className="flex items-center gap-2">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button onClick={() => setMealType('almoço')} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase ${mealType === 'almoço' ? 'bg-primary text-white' : 'text-slate-400'}`}>Almoço</button>
            <button onClick={() => setMealType('jantar')} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase ${mealType === 'jantar' ? 'bg-primary text-white' : 'text-slate-400'}`}>Jantar</button>
          </div>
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="bg-white/5 text-white text-sm font-bold border border-white/10 rounded-xl p-2 focus:outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Previsto Almoço" value={stats.totalAlmoço} icon={Utensils} color="blue" />
        <StatCard title="Previsto Jantar" value={stats.totalJanta} icon={Utensils} color="indigo" />
        <StatCard title="Presenças (Total)" value={stats.presenceAlmoço + stats.presenceJanta} icon={CheckCircle2} color="green" />
        <StatCard title="% Presença" value={Math.round(((stats.presenceAlmoço + stats.presenceJanta) / Math.max(1, stats.totalAlmoço + stats.totalJanta)) * 100)} unit="%" icon={Percent} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-6 rounded-2xl border border-white/10 h-[400px]">
          <h3 className="text-lg font-bold mb-6 text-white flex justify-between items-center">Consumo por Setor <span className="text-[10px] text-slate-500">{mealType}</span></h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.sectors}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                <Bar dataKey="total" name="Previsto" fill="#1e40af" radius={[4, 4, 0, 0]} />
                <Bar dataKey="present" name="Realizado" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass p-6 rounded-2xl border border-white/10 h-[400px]">
          <h3 className="text-lg font-bold mb-6 text-white flex justify-between items-center">Distribuição Real <span className="text-[10px] text-slate-500">{mealType}</span></h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.presenceData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value" nameKey="name">
                  {stats.presenceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, unit = "", icon: Icon, color }: { title: string, value: number, unit?: string, icon: any, color: string }) => {
  const colorClasses: Record<string, string> = { blue: 'bg-blue-500/10 text-blue-500', green: 'bg-green-500/10 text-green-500', indigo: 'bg-indigo-500/10 text-indigo-500', amber: 'bg-amber-500/10 text-amber-500' };
  return (
    <div className="glass p-6 rounded-2xl border border-white/10 flex items-center justify-between group">
      <div><p className="text-xs font-bold text-slate-400 uppercase mb-1">{title}</p><p className="text-3xl font-black text-white">{value}{unit}</p></div>
      <div className={`p-4 rounded-xl ${colorClasses[color]} group-hover:scale-110 transition-transform`}><Icon className="w-6 h-6" /></div>
    </div>
  );
};

export default Dashboard;

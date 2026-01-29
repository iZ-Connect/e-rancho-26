
import React, { useMemo, useState } from 'react';
import { Arranchamento, Militar } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Utensils, CheckCircle2, XCircle, Filter } from 'lucide-react';

interface DashboardProps {
  arranchamentos: Arranchamento[];
  militares: Militar[];
}

const Dashboard: React.FC<DashboardProps> = ({ arranchamentos, militares }) => {
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  const stats = useMemo(() => {
    const dailyArr = arranchamentos.filter(a => a.data === filterDate);
    
    const totalAlmoço = dailyArr.filter(a => a.almoço).length;
    const totalJanta = dailyArr.filter(a => a.jantar).length;
    const presenceAlmoço = dailyArr.filter(a => a.almoço && a.presencaAlmoço).length;
    const presenceJanta = dailyArr.filter(a => a.jantar && a.presencaJantar).length;
    const ausentes = (totalAlmoço + totalJanta) - (presenceAlmoço + presenceJanta);

    // Breakdown by Sector
    const sectorStats: Record<string, { total: number, present: number }> = {};
    dailyArr.forEach(arr => {
      const m = militares.find(mil => mil.id === arr.militarId);
      if (m) {
        if (!sectorStats[m.setor]) sectorStats[m.setor] = { total: 0, present: 0 };
        const meals = (arr.almoço ? 1 : 0) + (arr.jantar ? 1 : 0);
        const presence = (arr.presencaAlmoço ? 1 : 0) + (arr.presencaJantar ? 1 : 0);
        sectorStats[m.setor].total += meals;
        sectorStats[m.setor].present += presence;
      }
    });

    // Breakdown by Rank
    const rankStats: Record<string, { total: number, present: number }> = {};
    dailyArr.forEach(arr => {
      const m = militares.find(mil => mil.id === arr.militarId);
      if (m) {
        if (!rankStats[m.posto]) rankStats[m.posto] = { total: 0, present: 0 };
        const meals = (arr.almoço ? 1 : 0) + (arr.jantar ? 1 : 0);
        const presence = (arr.presencaAlmoço ? 1 : 0) + (arr.presencaJantar ? 1 : 0);
        rankStats[m.posto].total += meals;
        rankStats[m.posto].present += presence;
      }
    });

    return { 
      totalAlmoço, totalJanta, presenceAlmoço, presenceJanta, ausentes,
      sectors: Object.entries(sectorStats).map(([name, data]) => ({ name, ...data })),
      ranks: Object.entries(rankStats).map(([name, data]) => ({ name, ...data }))
    };
  }, [arranchamentos, militares, filterDate]);

  const COLORS = ['#1152d4', '#4b5320', '#ef4444', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Dashboard Administrativo</h2>
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/10">
          <Filter className="w-4 h-4 text-slate-400 ml-2" />
          <input 
            type="date" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-transparent text-white text-sm font-bold focus:outline-none border-none p-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Almoço" value={stats.totalAlmoço} icon={Utensils} color="blue" />
        <StatCard title="Total Janta" value={stats.totalJanta} icon={Utensils} color="indigo" />
        <StatCard title="Presenças" value={stats.presenceAlmoço + stats.presenceJanta} icon={CheckCircle2} color="green" />
        <StatCard title="Faltas" value={stats.ausentes} icon={XCircle} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-6 rounded-2xl border border-white/10 h-[400px] flex flex-col">
          <h3 className="text-lg font-bold mb-6 text-white">Consumo por Setor</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.sectors}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '11px' }}
                />
                <Bar dataKey="total" name="Previsto" fill="#1e40af" radius={[4, 4, 0, 0]} />
                <Bar dataKey="present" name="Realizado" fill="#1152d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-6 rounded-2xl border border-white/10 h-[400px] flex flex-col">
          <h3 className="text-lg font-bold mb-6 text-white">Distribuição por Posto/Grad</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.ranks}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="total"
                  nameKey="name"
                >
                  {stats.ranks.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) => {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-green-500/10 text-green-500',
    red: 'bg-red-500/10 text-red-500',
    indigo: 'bg-indigo-500/10 text-indigo-500',
  };

  return (
    <div className="glass p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all flex items-center justify-between group">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black text-white">{value}</p>
      </div>
      <div className={`p-4 rounded-xl ${colorClasses[color]} group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

export default Dashboard;

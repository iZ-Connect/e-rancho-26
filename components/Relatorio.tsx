import React, { useState } from 'react';
import { Militar, Arranchamento } from '../types';
import { FileText, Download } from 'lucide-react';

interface RelatorioProps {
    militares: Militar[];
    arranchamentos: Arranchamento[];
}

const Relatorio: React.FC<RelatorioProps> = ({ militares, arranchamentos }) => {
    const [dataFiltro, setDataFiltro] = useState(new Date().toISOString().split('T')[0]);
    const [tipoFiltro, setTipoFiltro] = useState<'almoco' | 'jantar'>('almoco');

    // Filtra militares que confirmaram presença no scanner
    const confirmados = arranchamentos.filter(a =>
        a.data === dataFiltro &&
        (tipoFiltro === 'almoco' ? a.presenca_almoco : a.presenca_jantar)
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                <h2 className="text-xl font-black text-white uppercase flex items-center gap-2">
                    <FileText className="text-primary" /> Relatório de Consumo
                </h2>
                <div className="flex gap-2">
                    <input
                        type="date"
                        value={dataFiltro}
                        onChange={(e) => setDataFiltro(e.target.value)}
                        className="bg-white/10 border-none rounded-lg text-white text-sm p-2"
                    />
                    <select
                        value={tipoFiltro}
                        onChange={(e) => setTipoFiltro(e.target.value as any)}
                        className="bg-white/10 border-none rounded-lg text-white text-sm p-2"
                    >
                        <option value="almoco">Almoço</option>
                        <option value="jantar">Jantar</option>
                    </select>
                </div>
            </div>

            <div className="glass rounded-2xl overflow-hidden border border-white/10">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-white/5 text-white uppercase font-bold text-xs">
                        <tr>
                            <th className="p-4">Posto/Grad</th>
                            <th className="p-4">Nome de Guerra</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {confirmados.map(conf => {
                            const mil = militares.find(m => String(m.cpf) === String(conf.militar_cpf));
                            return (
                                <tr key={conf.id} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4">{mil?.["Posto"] || '---'}</td>
                                    <td className="p-4 font-bold text-white">{mil?.["Nome de Guerra"] || 'Desconhecido'}</td>
                                    <td className="p-4">
                                        <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-[10px] font-black uppercase">Consumido</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {confirmados.length === 0 && (
                    <div className="p-10 text-center text-slate-500 font-bold uppercase text-xs">Nenhum registro encontrado para esta data.</div>
                )}
            </div>

            <div className="text-right">
                <p className="text-slate-400 text-xs font-bold uppercase">Total de refeições: {confirmados.length}</p>
            </div>
        </div>
    );
};

export default Relatorio;
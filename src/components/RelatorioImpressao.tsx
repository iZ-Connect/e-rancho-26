import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Militar } from '../types';
import { Printer, ShieldCheck, Ban, X, Globe } from 'lucide-react';

interface RelatorioImpressaoProps {
    militares: Militar[];
}

const RelatorioImpressao: React.FC<RelatorioImpressaoProps> = ({ militares }) => {

    // Ordenar por nome de guerra para facilitar a distribuição
    const militaresOrdenados = [...militares].sort((a, b) => {
        const nomeA = (a["Nome de Guerra"] || a.nome_guerra || '').toLowerCase();
        const nomeB = (b["Nome de Guerra"] || b.nome_guerra || '').toLowerCase();
        return nomeA.localeCompare(nomeB);
    });

    return (
        <div className="p-6 space-y-6">

            {/* Cabeçalho da Ferramenta (Não sai na impressão) */}
            <div className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/10 no-print">
                <div>
                    <h2 className="text-xl font-black text-white uppercase flex items-center gap-2">
                        <Printer className="text-primary" /> Impressão em Lote
                    </h2>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1">
                        Gerando {militares.length} crachás.
                        <span className="text-amber-500 ml-2 block sm:inline">⚠️ Ative "Gráficos de Plano de Fundo" na impressão.</span>
                    </p>
                </div>
                <button
                    onClick={() => window.print()}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs shadow-lg transition-all flex items-center gap-2"
                >
                    <Printer className="w-4 h-4" /> Imprimir Agora
                </button>
            </div>

            {/* GRADE DE CRACHÁS */}
            {/* print:block garante que o grid funcione bem no papel */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 print:grid-cols-2 print:gap-4 print:p-0">
                {militaresOrdenados.map((mil) => {
                    const isInactive = mil.ativo === false;
                    const statusTexto = isInactive ? 'INATIVO' : 'ATIVO';
                    const qrValue = String(mil.cpf).replace(/\D/g, '');
                    const nome = mil["Nome de Guerra"] || mil.nome_guerra;
                    const posto = mil["Posto"] || mil.posto_grad;
                    const perfil = mil.perfil ? mil.perfil.replace(/_/g, ' ') : 'MILITAR';

                    return (
                        <div
                            key={String(mil.cpf)}
                            className={`p-6 rounded-[2rem] border border-white/10 shadow-xl relative overflow-hidden flex flex-col items-center text-center print:break-inside-avoid print:page-break-inside-avoid mb-4 print:mb-6 ${isInactive
                                    ? 'bg-gradient-to-br from-red-800 to-red-950 text-white print:bg-red-900' // Visual Inativo
                                    : 'bg-gradient-to-br from-[#0f172a] to-slate-900 text-white print:bg-[#1e293b]' // Visual Ativo (Escuro/Glass simulado para impressão)
                                }`}
                            style={{
                                minHeight: '400px',
                                printColorAdjust: 'exact', // Força o navegador a imprimir as cores de fundo
                                WebkitPrintColorAdjust: 'exact'
                            }}
                        >
                            {/* Faixa Superior Colorida */}
                            <div className={`absolute top-0 left-0 w-full h-3 ${isInactive ? 'bg-red-500' : 'bg-emerald-500'}`} />

                            {/* Cabeçalho do Crachá */}
                            <div className="flex flex-col items-center mb-4 mt-2">
                                <span className={`text-[9px] font-black uppercase tracking-[0.4em] mb-1 ${isInactive ? 'text-red-300' : 'text-emerald-400'}`}>
                                    e-Rancho
                                </span>
                                <div className="flex items-center gap-2">
                                    {isInactive ? <Ban className="w-4 h-4 text-red-400" /> : <ShieldCheck className="w-4 h-4 text-slate-400" />}
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isInactive ? 'text-red-200' : 'text-slate-400'}`}>
                                        {isInactive ? 'ACESSO SUSPENSO' : 'Identidade Digital'}
                                    </span>
                                </div>
                            </div>

                            {/* QR Code Box */}
                            <div className={`p-3 bg-white rounded-xl mb-4 border-4 shadow-lg relative ${isInactive ? 'border-red-400 opacity-80' : 'border-white'}`}>
                                <QRCodeSVG value={qrValue} size={130} />
                                {isInactive && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <X className="w-20 h-20 text-red-600 opacity-80" strokeWidth={3} />
                                    </div>
                                )}
                            </div>

                            {/* Dados Principais */}
                            <div className="space-y-1 mb-6">
                                <h2 className="text-xl font-black uppercase leading-none tracking-tight">{nome}</h2>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{posto}</p>
                            </div>

                            {/* Grid de Informações (Perfil e Status) */}
                            <div className="w-full grid grid-cols-2 gap-3 mb-4">
                                <div className="p-2 bg-white/10 rounded-lg border border-white/5">
                                    <p className="text-[7px] font-bold text-slate-400 uppercase">Perfil</p>
                                    <p className="text-[10px] font-bold truncate uppercase tracking-wider">{perfil}</p>
                                </div>
                                <div className={`p-2 rounded-lg border border-white/5 ${isInactive ? 'bg-red-900/40' : 'bg-emerald-900/20'}`}>
                                    <p className={`text-[7px] font-bold uppercase ${isInactive ? 'text-red-300' : 'text-emerald-300'}`}>Status</p>
                                    <p className={`text-[10px] font-bold uppercase ${isInactive ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {statusTexto}
                                    </p>
                                </div>
                            </div>

                            {/* RODAPÉ OM (Substituindo o botão de imprimir) */}
                            <div className="mt-auto w-full pt-3 border-t border-white/10 flex justify-between items-center">
                                <div className="text-left">
                                    <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">ID Único</p>
                                    <p className="text-[9px] font-mono text-slate-300">{String(mil.id || '000').padStart(3, '0')}</p>
                                </div>

                                {/* NOME DA OM */}
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                                    <Globe className="w-3 h-3 text-slate-400" />
                                    <span className="text-xs font-black text-white tracking-widest uppercase">HGeSM</span>
                                </div>
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RelatorioImpressao;
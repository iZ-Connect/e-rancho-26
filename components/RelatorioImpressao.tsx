import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Militar } from '../types';
import { Printer, ShieldCheck } from 'lucide-react';

interface RelatorioImpressaoProps {
    militares: Militar[];
}

const RelatorioImpressao: React.FC<RelatorioImpressaoProps> = ({ militares }) => {
    return (
        <div className="p-6 space-y-6">
            {/* Cabeçalho da Ferramenta */}
            <div className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/10 no-print">
                <div>
                    <h2 className="text-xl font-black text-white uppercase flex items-center gap-2">
                        <Printer className="text-primary" /> Impressão em Lote
                    </h2>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1">Gerar identidades físicas para {militares.length} militares</p>
                </div>
                <button
                    onClick={() => window.print()}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs shadow-lg transition-all"
                >
                    Imprimir Agora
                </button>
            </div>

            {/* Grade de Crachás - Otimizada para A4 */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4 print:p-0">
                {militares.map((mil) => (
                    <div
                        key={String(mil.cpf)}
                        className="bg-white text-black p-6 rounded-xl border-2 border-slate-200 flex flex-col items-center text-center shadow-sm print:shadow-none print:border-slate-300 print:break-inside-avoid mb-4"
                        style={{ width: '8.5cm', height: '12cm', margin: 'auto' }} // Tamanho aproximado de crachá padrão
                    >
                        <div className="w-full border-b-2 border-primary pb-2 mb-4 flex items-center justify-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest">e-Rancho | Identidade</span>
                        </div>

                        <div className="bg-white p-2 border border-slate-100 mb-4">
                            <QRCodeSVG value={String(mil.cpf).replace(/\D/g, '')} size={140} />
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-lg font-black uppercase leading-tight">{mil["Nome de Guerra"] || mil.nome_guerra}</h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{mil["Posto"] || mil.posto_grad}</p>
                        </div>

                        <div className="mt-auto w-full pt-4 border-t border-slate-100 flex justify-between items-end">
                            <div className="text-left">
                                <p className="text-[7px] font-bold text-slate-400 uppercase">Identificador CPF</p>
                                <p className="text-[9px] font-mono">{String(mil.cpf).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}</p>
                            </div>
                            <img src="/logo-eb.png" alt="" className="h-8 opacity-20" /> {/* Opcional: logo do exército ao fundo */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RelatorioImpressao;

import React from 'react';
import { Info, ShieldCheck, Heart, Code2 } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4">
        <div className="inline-flex p-4 bg-primary/10 rounded-3xl text-primary mb-2">
          <Info className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-black text-white uppercase tracking-tight">Sobre o e-Rancho</h2>
        <p className="text-slate-400 font-medium">Versão 1.5.0 • Gestão Inteligente de Arranchamento</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-8 rounded-3xl border border-white/10 space-y-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 w-fit rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white uppercase">Missão</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            O e-Rancho foi concebido para modernizar o controle de alimentação nas unidades militares, 
            garantindo precisão estatística, redução de desperdício e facilidade para o militar no dia a dia.
          </p>
        </div>

        <div className="glass p-8 rounded-3xl border border-white/10 space-y-4">
          <div className="p-3 bg-red-500/10 text-red-500 w-fit rounded-2xl">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white uppercase">Desenvolvedor</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Sistema idealizado e desenvolvido por <strong className="text-white">Ezequiel Fagundes</strong>. 
            Foco em UX/UI militar, performance offline e segurança de dados.
          </p>
        </div>
      </div>

      <div className="glass p-8 rounded-3xl border border-white/10 text-center space-y-6">
        <div className="flex justify-center -space-x-2">
           {[1,2,3].map(i => (
             <div key={i} className="w-12 h-12 rounded-full border-4 border-surface bg-slate-700 flex items-center justify-center text-white font-bold text-xs">
                EF
             </div>
           ))}
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-white uppercase flex items-center justify-center gap-2">
            <Code2 className="w-5 h-5 text-primary" /> Ezequiel Fagundes
          </h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Fullstack Developer & Military Systems Specialist</p>
        </div>
        <p className="text-sm text-slate-400 max-w-lg mx-auto italic">
          "A tecnologia deve servir à operacionalidade, simplificando processos complexos com apenas alguns toques."
        </p>
      </div>

      <div className="text-center">
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.4em]">© 2024 e-Rancho • Todos os direitos reservados</p>
      </div>
    </div>
  );
};

export default About;

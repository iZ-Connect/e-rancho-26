
import React, { useState } from 'react';
import { Utensils, ShieldCheck, HelpCircle } from 'lucide-react';
import { normalizeCPF } from '../utils/helpers';
import { Militar } from '../types';

interface LoginProps {
  onLogin: (militar: Militar) => void;
  militares: Militar[];
}

const Login: React.FC<LoginProps> = ({ onLogin, militares }) => {
  const [cpf, setCpf] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCpf = normalizeCPF(cpf);
    const user = militares.find(m => normalizeCPF(m.cpf) === cleanCpf && m.pin === pin);

    if (user) {
      if (!user.ativo) {
        setError('Usuário inativo no sistema.');
      } else {
        onLogin(user);
      }
    } else {
      setError('CPF ou PIN inválidos.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-10 space-y-2">
          <div className="inline-flex p-4 bg-primary/20 rounded-2xl text-primary mb-4">
            <Utensils className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">E-Rancho</h1>
          <p className="text-slate-400 font-medium uppercase tracking-[0.2em] text-xs">Gestão de Arranchamento Militar</p>
        </div>

        <div className="glass border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-white/5 px-8 py-6 border-b border-white/5">
            <h2 className="text-xl font-bold text-white text-center">Acesso Restrito</h2>
            <p className="text-slate-400 text-sm text-center mt-1">Insira suas credenciais militares</p>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm font-bold text-center animate-pulse">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">CPF</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">PIN de Acesso</label>
              <input
                type="password"
                placeholder="••••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 uppercase tracking-widest text-sm"
            >
              Entrar no Sistema
            </button>
          </form>

          <div className="p-4 bg-white/5 flex items-center justify-center gap-2">
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-500">Problemas no acesso? Contate o S1</span>
          </div>
        </div>
        
        <p className="mt-8 text-center text-slate-600 text-[10px] uppercase font-bold tracking-widest">
          © 2024 E-Rancho • Todos os Direitos Reservados
        </p>
      </div>
    </div>
  );
};

export default Login;

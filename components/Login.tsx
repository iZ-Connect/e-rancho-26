import React, { useState } from 'react';
import { Utensils, HelpCircle } from 'lucide-react';
import { normalizeCPF } from '../utils/helpers';
import { Militar } from '../types';

interface LoginProps {
  onLogin: (militar: Militar, persistent: boolean) => void;
  militares: Militar[];
}

const Login: React.FC<LoginProps> = ({ onLogin, militares }) => {
  const [cpf, setCpf] = useState('');
  const [pin, setPin] = useState('');
  const [persistent, setPersistent] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Normaliza o CPF digitado para ter exatamente 11 dígitos (preenche com zero se necessário)
    const cleanInputCpf = normalizeCPF(cpf).padStart(11, '0');

    // 2. Busca o militar com tratamento de tipos e chaves
    const user = militares.find(m => {
      // Pega o CPF do banco (seja cpf ou CPF) e garante que tenha 11 dígitos para comparar
      const rawDbCpf = m.cpf || m.CPF || m["CPF"];
      const dbCpf = String(rawDbCpf || '').replace(/\D/g, '').padStart(11, '0');

      // Garante que o PIN seja comparado como texto simples
      const dbPin = String(m.pin || m.PIN || m["PIN"] || '').trim();
      const inputPin = pin.trim();

      return dbCpf === cleanInputCpf && dbPin === inputPin;
    });

    if (user) {
      // 3. Verifica se está ativo (aceita 'Ativo?' da planilha ou 'ativo' do sistema)
      const statusAtivo = user["Ativo?"] !== undefined ? user["Ativo?"] : user.ativo;

      if (statusAtivo === false) {
        setError('Usuário inativo no sistema.');
      } else {
        setError('');

        // Normaliza o objeto para garantir que campos como 'perfil' e 'nome_guerra' 
        // existam mesmo que na planilha estivessem com outros nomes
        const normalizedUser = {
          ...user,
          cpf: cleanInputCpf,
          nome_guerra: user.nome_guerra || user["Nome de Guerra"] || 'Militar',
          perfil: user.perfil || user["Usuário"] || 'MILITAR',
          posto_grad: user.posto_grad || user["Posto"] || ''
        };

        onLogin(normalizedUser, persistent);
      }
    } else {
      setError('CPF ou PIN incorretos.');
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
          <p className="text-slate-400 font-medium uppercase tracking-[0.2em] text-xs">Gestão Militar</p>
        </div>

        <div className="glass border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <form onSubmit={handleLogin} className="p-8 space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm font-bold text-center">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">CPF</label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">PIN</label>
              <input
                type="password"
                placeholder="••••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="persistent"
                checked={persistent}
                onChange={(e) => setPersistent(e.target.checked)}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-0"
              />
              <label htmlFor="persistent" className="text-xs text-slate-400 font-bold uppercase cursor-pointer select-none">
                Manter conectado
              </label>
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg uppercase text-sm transition-all active:scale-[0.98]"
            >
              Entrar
            </button>
          </form>

          <div className="p-4 bg-white/5 flex items-center justify-center gap-2 border-t border-white/5 text-xs text-slate-500">
            <HelpCircle className="w-4 h-4" /> Contate o S1 para suporte
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
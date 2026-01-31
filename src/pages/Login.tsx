import React, { useState } from 'react';
import { Utensils, HelpCircle } from 'lucide-react';
import { normalizeCPF } from '../utils/helpers';
import { Militar } from '../types';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';

interface LoginProps {
  onLogin: (militar: Militar, persistent: boolean) => void;
  militares: Militar[];
}

const Login: React.FC<LoginProps> = ({ onLogin, militares }) => {
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [persistent, setPersistent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 🔐 1. Login REAL pelo Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const uid = userCredential.user.uid;

      // 🪪 2. Busca o militar pelo UID do Firebase
      const militar = militares.find(m => m.uid === uid);

      if (!militar) {
        setError('Usuário autenticado, mas não autorizado no sistema.');
        return;
      }

      // 3. Verifica se o militar está ativo
      const statusAtivo =
        militar['Ativo?'] !== undefined ? militar['Ativo?'] : militar.ativo;

      if (statusAtivo === false) {
        setError('Usuário inativo no sistema.');
        return;
      }

      // 4. Normaliza dados
      const normalizedUser: Militar = {
        ...militar,
        cpf: normalizeCPF(cpf),
        nome_guerra:
          militar.nome_guerra || militar['Nome de Guerra'] || 'Militar',
        perfil: militar.perfil || militar['Usuário'] || 'MILITAR',
        posto_grad: militar.posto_grad || militar['Posto'] || ''
      };

      // ✅ Login final
      onLogin(normalizedUser, persistent);
    } catch (err) {
      setError('Email ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-10 space-y-2">
          <div className="inline-flex p-4 bg-primary/20 rounded-2xl text-primary mb-4">
            <Utensils className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">
            E-Rancho
          </h1>
          <p className="text-slate-400 font-medium uppercase tracking-[0.2em] text-xs">
            Gestão Militar
          </p>
        </div>

        <div className="glass border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <form onSubmit={handleLogin} className="p-8 space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm font-bold text-center">
                {error}
              </div>
            )}

            {/* CPF apenas para identificação */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                CPF
              </label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white"
                required
              />
            </div>

            {/* Email Firebase */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                placeholder="email@dominio.mil.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white"
                required
              />
            </div>

            {/* Senha Firebase */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Senha
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={persistent}
                onChange={(e) => setPersistent(e.target.checked)}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary"
              />
              <span className="text-xs text-slate-400 font-bold uppercase">
                Manter conectado
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold uppercase text-sm"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="p-4 bg-white/5 flex items-center justify-center gap-2 border-t border-white/5 text-xs text-slate-500">
            <HelpCircle className="w-4 h-4" /> Contate o S1 para additionally suporte
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

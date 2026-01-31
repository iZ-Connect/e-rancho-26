import React, { useState } from 'react';
import { Utensils, HelpCircle } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Militar } from '../types';
import { dbService } from '../services/dbService';

interface LoginProps {
  onLogin: (militar: Militar, persistent: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
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
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = cred.user;

      const militar = await dbService.getMilitarByEmail(user.email || '');

      if (!militar) {
        setError('Usuário autenticado, mas não cadastrado no sistema.');
        return;
      }

      onLogin(
        {
          ...militar,
          uid: user.uid,
          email: user.email
        },
        persistent
      );

    } catch (err) {
      setError('Email ou senha inválidos.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-primary/20 rounded-2xl text-primary mb-4">
            <Utensils className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-white uppercase">E-Rancho</h1>
          <p className="text-slate-400 text-xs uppercase tracking-widest">Gestão Militar</p>
        </div>

        <div className="glass rounded-2xl overflow-hidden">
          <form onSubmit={handleLogin} className="p-8 space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs text-slate-400 uppercase">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 uppercase">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={persistent}
                onChange={e => setPersistent(e.target.checked)}
              />
              <span className="text-xs text-slate-400">Manter conectado</span>
            </div>

            <button
              disabled={loading}
              className="w-full h-12 bg-primary text-white rounded-xl font-bold uppercase"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="p-4 bg-white/5 text-xs text-slate-500 flex justify-center gap-2">
            <HelpCircle className="w-4 h-4" /> Contate o Rancho
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { Utensils, HelpCircle } from 'lucide-react';
// REMOVIDO: import { signInWithEmailAndPassword } from 'firebase/auth'; 
// REMOVIDO: import { auth } from '../services/firebase';
import { Militar } from '../types';
// ADICIONADO: Importações necessárias para consultar o Realtime Database diretamente
import { getDatabase, ref, query, orderByChild, equalTo, get } from "firebase/database";
import { app } from "../services/firebase";

interface LoginProps {
  onLogin: (militar: Militar, persistent: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Aqui "password" na verdade será o PIN
  const [persistent, setPersistent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Conecta ao banco de dados
      const db = getDatabase(app);
      const militaresRef = ref(db, 'militares');

      // 2. Prepara a consulta: buscar na lista 'militares' onde 'email' é igual ao digitado
      const consultaEmail = query(militaresRef, orderByChild('email'), equalTo(email));

      // 3. Executa a busca
      const snapshot = await get(consultaEmail);

      if (snapshot.exists()) {
        // O Firebase retorna um objeto com chaves (ex: {"0": {...}}), precisamos dos dados internos
        const dadosRetornados = snapshot.val();
        const chavePrimeiroResultado = Object.keys(dadosRetornados)[0];
        const militarEncontrado = dadosRetornados[chavePrimeiroResultado];

        // 4. Validação Manual da Senha (PIN)
        // Comparar o PIN digitado (password) com o PIN do banco
        // Convertemos ambos para String para evitar erros de tipo (número vs texto)
        if (String(militarEncontrado.pin) === String(password)) {

          // Sucesso! Chama a função de login do pai passando os dados do militar
          onLogin(
            {
              ...militarEncontrado,
              // Como não temos uid do Auth, podemos usar o ID do banco ou gerar um temporário
              uid: String(militarEncontrado.id),
              email: militarEncontrado.email
            },
            persistent
          );

        } else {
          setError('PIN inválido (Senha incorreta).');
        }
      } else {
        setError('Email não encontrado no sistema.');
      }

    } catch (err) {
      console.error("Erro no login:", err);
      setError('Erro ao conectar com o banco de dados. Verifique sua conexão.');
    } finally {
      setLoading(false);
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
                placeholder="ex: teste@erancho.mil.br"
              />
            </div>

            <div>
              {/* Alterei o label para PIN para ficar mais claro para o usuário */}
              <label className="text-xs text-slate-400 uppercase">PIN (Senha)</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white"
                required
                placeholder="Digite seu PIN (ex: 1234)"
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
              {loading ? 'Verificando...' : 'Entrar'}
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
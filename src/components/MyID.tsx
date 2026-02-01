import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Militar, UserRole } from '../types';
import { Printer, ShieldCheck, User, Key, Edit3, Save, X, Ban, RefreshCcw, Lock } from 'lucide-react';

interface MyIDProps {
  user: Militar;
  viewer: Militar; // Quem está vendo (para checar permissões)
  onUpdateMilitar?: (updated: Militar) => Promise<void> | void;
  onUpdatePin: (newPin: string) => Promise<void> | void;
}

const MyID: React.FC<MyIDProps> = ({ user, viewer, onUpdateMilitar, onUpdatePin }) => {
  const [newPin, setNewPin] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estado local para edição (Copia os dados do usuário)
  const [editData, setEditData] = useState<Militar>({ ...user });

  // Verifica se quem está vendo é Admin
  const isAdmin = viewer.perfil === UserRole.ADM_LOCAL || viewer.perfil === UserRole.ADM_GERAL;
  const isOwnProfile = String(viewer.cpf) === String(user.cpf);

  // QR Code (Apenas Números do CPF)
  const qrValue = String(user.cpf).replace(/\D/g, '');

  const isInactive = user.ativo === false;
  const statusTexto = isInactive ? 'INATIVO' : 'ATIVO';

  // --- AÇÕES ---

  const handleSaveEdit = async () => {
    if (onUpdateMilitar) {
      setIsLoading(true);
      try {
        await onUpdateMilitar(editData);
        setIsEditing(false);
        alert('✅ Dados atualizados com sucesso!');
      } catch (e) {
        alert('Erro ao salvar.');
      }
      setIsLoading(false);
    }
  };

  const handleResetPin = async () => {
    if (window.confirm(`Tem certeza que deseja resetar a senha do ${user.nome_guerra} para "1234"?`)) {
      // Atualiza localmente e chama a função de update geral
      const updatedUser = { ...user, pin: "1234" };
      if (onUpdateMilitar) {
        await onUpdateMilitar(updatedUser);
        alert("✅ Senha resetada para 1234 com sucesso!");
      }
    }
  };

  const handleUpdateOwnPin = async () => {
    if (newPin.length >= 4) {
      try {
        await onUpdatePin(newPin);
        setNewPin('');
        setShowPinInput(false);
        alert('✅ Seu PIN foi atualizado!');
      } catch (error) { alert('Erro ao atualizar.'); }
    } else {
      alert('Mínimo 4 dígitos.');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-8 py-4 animate-in fade-in duration-500 pb-20">

      {/* --- CARTÃO DE IDENTIDADE --- */}
      <div className={`p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col items-center text-center transition-all duration-500 ${isInactive
          ? 'bg-gradient-to-br from-red-800 to-red-950 shadow-red-900/50'
          : 'glass'
        }`}>

        <div className={`absolute top-0 left-0 w-full h-2 ${isInactive ? 'bg-red-500' : 'bg-primary'}`} />

        <div className="flex flex-col items-center mb-6">
          <span className={`text-[10px] font-black uppercase tracking-[0.5em] mb-1 ${isInactive ? 'text-red-300' : 'text-primary'}`}>
            e-Rancho
          </span>
          <div className="flex items-center gap-2">
            {isInactive ? <Ban className="w-5 h-5 text-red-400" /> : <ShieldCheck className="w-5 h-5 text-slate-400" />}
            <span className={`text-xs font-black uppercase tracking-[0.3em] ${isInactive ? 'text-red-200' : 'text-slate-400'}`}>
              {isInactive ? 'ACESSO SUSPENSO' : 'Identidade Digital'}
            </span>
          </div>
        </div>

        <div className={`p-4 bg-white rounded-2xl mb-6 border-4 shadow-xl relative ${isInactive ? 'border-red-400 opacity-50' : 'border-white'}`}>
          <QRCodeSVG value={qrValue} size={180} />
          {isInactive && (
            <div className="absolute inset-0 flex items-center justify-center">
              <X className="w-24 h-24 text-red-600 opacity-80" strokeWidth={3} />
            </div>
          )}
        </div>

        {/* --- MODO EDIÇÃO (Só Admin vê isso quando clica em editar) --- */}
        {isEditing ? (
          <div className="w-full space-y-4 mb-6 text-left">

            {/* 1. Nome de Guerra */}
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Nome de Guerra</label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl h-10 px-4 text-white text-sm focus:bg-black/20"
                value={editData["Nome de Guerra"] || editData.nome_guerra}
                onChange={e => setEditData({ ...editData, nome_guerra: e.target.value, "Nome de Guerra": e.target.value })}
              />
            </div>

            {/* 2. Posto / Graduação */}
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Posto / Graduação</label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl h-10 px-4 text-white text-sm focus:bg-black/20"
                value={editData["Posto"] || editData.posto_grad}
                onChange={e => setEditData({ ...editData, posto_grad: e.target.value, "Posto": e.target.value })}
              />
            </div>

            {/* 3. Perfil (Militar, Fiscal, Adm) - SÓ ADMIN EDITA */}
            {isAdmin && (
              <div>
                <label className="text-[9px] font-bold text-amber-500 uppercase ml-1">Perfil de Acesso</label>
                <select
                  className="w-full bg-amber-500/10 border border-amber-500/30 rounded-xl h-10 px-4 text-amber-200 text-sm focus:bg-black/40 outline-none"
                  value={editData.perfil}
                  onChange={e => setEditData({ ...editData, perfil: e.target.value as UserRole })}
                >
                  <option value={UserRole.MILITAR}>MILITAR</option>
                  <option value={UserRole.FISC_SU}>FISCAL DE SU</option>
                  <option value={UserRole.ADM_LOCAL}>ADM LOCAL</option>
                  <option value={UserRole.ADM_GERAL}>ADM GERAL</option>
                </select>
              </div>
            )}

            {/* 4. Status (Ativo/Inativo) - SÓ ADMIN EDITA */}
            {isAdmin && (
              <div>
                <label className={`text-[9px] font-bold uppercase ml-1 ${editData.ativo === false ? 'text-red-400' : 'text-green-400'}`}>Status do Usuário</label>
                <select
                  className={`w-full border rounded-xl h-10 px-4 text-sm focus:bg-black/40 outline-none ${editData.ativo === false ? 'bg-red-500/10 border-red-500/30 text-red-200' : 'bg-green-500/10 border-green-500/30 text-green-200'}`}
                  value={editData.ativo === false ? 'false' : 'true'} // Lógica inversa pq o padrão é true
                  onChange={e => setEditData({ ...editData, ativo: e.target.value === 'true' })}
                >
                  <option value="true">ATIVO (Acesso Liberado)</option>
                  <option value="false">INATIVO (Bloquear Acesso)</option>
                </select>
              </div>
            )}

            {/* BOTÕES DE SALVAR */}
            <div className="flex gap-2 pt-2">
              <button onClick={handleSaveEdit} className="flex-1 bg-green-600 hover:bg-green-500 text-white h-10 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all">
                {isLoading ? '...' : <><Save className="w-3 h-3" /> Salvar</>}
              </button>
              <button onClick={() => setIsEditing(false)} className="flex-1 bg-white/5 text-slate-400 h-10 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2">
                <X className="w-3 h-3" /> Cancelar
              </button>
            </div>

            {/* BOTÃO RESETAR SENHA (SÓ ADMIN) */}
            {isAdmin && !isOwnProfile && (
              <button onClick={handleResetPin} className="w-full mt-4 bg-red-500/10 border border-red-500/30 text-red-400 h-10 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all">
                <Lock className="w-3 h-3" /> Resetar Senha para "1234"
              </button>
            )}

          </div>
        ) : (
          /* --- MODO VISUALIZAÇÃO --- */
          <div className="space-y-1 mb-8">
            <h2 className="text-2xl font-black text-white uppercase">{user.nome_guerra || "Militar"}</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{user.posto_grad || "Posto"}</p>

            {/* Botão de Editar (Só Admin vendo outro perfil) */}
            {isAdmin && (
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 px-4 py-2 bg-white/5 rounded-full flex items-center gap-2 mx-auto text-[10px] font-bold text-primary hover:bg-primary hover:text-white transition-all uppercase"
              >
                <Edit3 className="w-3 h-3" /> Editar Dados do Militar
              </button>
            )}
          </div>
        )}

        {/* INFO EXTRA NO CARD (SÓ APARECE SE NÃO ESTIVER EDITANDO) */}
        {!isEditing && (
          <div className="w-full grid grid-cols-2 gap-4">
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <p className="text-[9px] font-bold text-slate-500 uppercase">Perfil</p>
              <p className="text-xs font-bold text-white truncate uppercase">
                {user.perfil ? user.perfil.replace(/_/g, ' ') : 'MILITAR'}
              </p>
            </div>
            <div className={`p-3 rounded-xl border border-white/5 ${isInactive ? 'bg-red-900/40' : 'bg-white/5'}`}>
              <p className={`text-[9px] font-bold uppercase ${isInactive ? 'text-red-300' : 'text-slate-500'}`}>Status</p>
              <p className={`text-xs font-bold uppercase ${isInactive ? 'text-red-400' : 'text-green-500'}`}>
                {statusTexto}
              </p>
            </div>
          </div>
        )}

        <button onClick={() => window.print()} className="mt-6 flex items-center gap-2 px-6 py-2 bg-white/5 text-white rounded-xl text-xs font-bold border border-white/5 hover:bg-white/10 transition-all">
          <Printer className="w-4 h-4" /> Imprimir Crachá
        </button>
      </div>

      {/* --- ÁREA DE ALTERAR PIN (SÓ USUÁRIO PRÓPRIO) --- */}
      {isOwnProfile && (
        <div className="glass p-6 rounded-2xl border border-white/10">
          <button onClick={() => setShowPinInput(!showPinInput)} className="w-full flex items-center justify-between text-slate-400 font-bold text-sm uppercase">
            <div className="flex items-center gap-2"><Key className="w-4 h-4" /> Alterar Meu PIN</div>
            <User className="w-4 h-4" />
          </button>
          {showPinInput && (
            <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
              <input
                type="password"
                maxLength={6}
                placeholder="Novo PIN"
                value={newPin}
                onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white outline-none focus:ring-2 focus:ring-primary text-center tracking-widest"
              />
              <button onClick={handleUpdateOwnPin} className="w-full h-11 bg-primary text-white font-bold rounded-xl text-xs uppercase">Confirmar</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyID;
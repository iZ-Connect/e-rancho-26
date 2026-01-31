import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Militar, UserRole } from '../types';
import { Printer, ShieldCheck, User, Key, Edit3, Save, X } from 'lucide-react';

interface MyIDProps {
  user: Militar;
  viewer: Militar;
  onUpdateMilitar?: (updated: Militar) => void;
  onUpdatePin: (newPin: string) => void;
}

const MyID: React.FC<MyIDProps> = ({ user, viewer, onUpdateMilitar, onUpdatePin }) => {
  const [newPin, setNewPin] = useState('');
  const [showPinInput, setShowPinInput] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [editData, setEditData] = useState<Militar>({ ...user });

  const isAdmin = viewer.perfil === UserRole.ADM_LOCAL || viewer.perfil === UserRole.ADM_GERAL;

  // 1. Garantir que o QR Code use apenas os números do CPF para ser único e imutável
  const qrValue = String(user.cpf).replace(/\D/g, '');

  // 2. Mapeamento de campos do Firebase para exibição
  const nomeGuerra = user["Nome de Guerra"] || user.nome_guerra;
  const postoGrad = user["Posto"] || user.posto_grad;
  const statusAtivo = user["Ativo?"] !== undefined ? user["Ativo?"] : user.status;

  const handleUpdatePin = () => {
    if (newPin.length >= 4) {
      onUpdatePin(newPin);
      setNewPin('');
      setShowPinInput(false);
      alert('PIN atualizado com sucesso!');
    }
  };

  const handleSaveEdit = () => {
    if (onUpdateMilitar) {
      onUpdateMilitar(editData);
      setIsEditing(false);
      alert('Dados atualizados com sucesso!');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-8 py-4 animate-in fade-in duration-500">
      <div className="glass p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute top-0 left-0 w-full h-2 bg-primary" />

        <div className="flex flex-col items-center mb-6">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] mb-1">e-Rancho</span>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-slate-400" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Identidade Digital</span>
          </div>
        </div>

        {/* QR Code baseado puramente no CPF numérico */}
        <div className="p-4 bg-white rounded-2xl mb-6 border-4 border-white shadow-xl">
          <QRCodeSVG value={qrValue} size={180} />
        </div>

        {isEditing ? (
          <div className="w-full space-y-4 mb-6">
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl h-10 px-4 text-white text-sm"
              value={editData["Nome de Guerra"]}
              onChange={e => setEditData({ ...editData, "Nome de Guerra": e.target.value })}
              placeholder="Nome de Guerra"
            />
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl h-10 px-4 text-white text-sm"
              value={editData["Posto"]}
              onChange={e => setEditData({ ...editData, "Posto": e.target.value })}
              placeholder="Posto/Grad"
            />
            <div className="flex gap-2">
              <button onClick={handleSaveEdit} className="flex-1 bg-green-600 text-white h-10 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2"><Save className="w-3 h-3" /> Salvar</button>
              <button onClick={() => setIsEditing(false)} className="flex-1 bg-white/5 text-slate-400 h-10 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2"><X className="w-3 h-3" /> Cancelar</button>
            </div>
          </div>
        ) : (
          <div className="space-y-1 mb-8">
            <h2 className="text-2xl font-black text-white uppercase">{nomeGuerra}</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{postoGrad}</p>
            {isAdmin && viewer.cpf !== user.cpf && (
              <button
                onClick={() => setIsEditing(true)}
                className="mt-2 flex items-center gap-1 mx-auto text-[10px] font-bold text-primary hover:underline uppercase"
              >
                <Edit3 className="w-3 h-3" /> Editar Dados
              </button>
            )}
          </div>
        )}

        <div className="w-full grid grid-cols-2 gap-4">
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <p className="text-[9px] font-bold text-slate-500 uppercase">Setor</p>
            <p className="text-xs font-bold text-white truncate">{user.setor_nome || 'Não definido'}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/5">
            <p className="text-[9px] font-bold text-slate-500 uppercase">Status</p>
            <p className={`text-xs font-bold uppercase ${statusAtivo ? 'text-green-500' : 'text-red-500'}`}>
              {statusAtivo ? 'Ativo' : 'Inativo'}
            </p>
          </div>
        </div>

        <button onClick={() => window.print()} className="mt-6 flex items-center gap-2 px-6 py-2 bg-white/5 text-white rounded-xl text-xs font-bold border border-white/5 hover:bg-white/10 transition-all">
          <Printer className="w-4 h-4" /> Imprimir Crachá
        </button>
      </div>

      {String(viewer.cpf) === String(user.cpf) && (
        <div className="glass p-6 rounded-2xl border border-white/10">
          <button onClick={() => setShowPinInput(!showPinInput)} className="w-full flex items-center justify-between text-slate-400 font-bold text-sm uppercase">
            <div className="flex items-center gap-2"><Key className="w-4 h-4" /> Alterar PIN</div>
            <User className="w-4 h-4" />
          </button>
          {showPinInput && (
            <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
              <input type="password" maxLength={6} placeholder="Novo PIN (Mín. 4 dígitos)" value={newPin} onChange={e => setNewPin(e.target.value)} className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white outline-none focus:ring-2 focus:ring-primary" />
              <button onClick={handleUpdatePin} className="w-full h-11 bg-primary text-white font-bold rounded-xl text-xs uppercase">Confirmar</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyID;
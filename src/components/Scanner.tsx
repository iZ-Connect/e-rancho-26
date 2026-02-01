import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Militar, Arranchamento } from '../types';
import { CheckCircle2, XCircle, AlertTriangle, UserCheck, ShieldAlert } from 'lucide-react';
import { dbService } from '../services/dbService';

interface ScannerProps {
  militares: Militar[];
  arranchamentos: Arranchamento[];
  onConfirm: (cpf: string, tipo: 'almoco' | 'jantar') => Promise<void>;
}

const Scanner: React.FC<ScannerProps> = ({ militares, arranchamentos, onConfirm }) => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'liberado'>('idle');
  const [scannedMilitar, setScannedMilitar] = useState<Militar | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [refeicaoAtual, setRefeicaoAtual] = useState<'almoco' | 'jantar'>('almoco');

  // Define a refeição baseada no horário atual
  useEffect(() => {
    const hour = new Date().getHours();
    setRefeicaoAtual(hour < 14 ? 'almoco' : 'jantar');
  }, []);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(onScanSuccess, onScanFailure);

    function onScanSuccess(decodedText: string) {
      if (status !== 'idle') return; // Evita leituras duplicadas rápidas

      try {
        // Tenta ler JSON (novo formato) ou apenas números (formato antigo/legado)
        let cpfLido = decodedText;
        try {
          const data = JSON.parse(decodedText);
          if (data.cpf) cpfLido = String(data.cpf).replace(/\D/g, '');
        } catch (e) {
          // Se falhar o parse, assume que o texto é o próprio CPF (formato antigo)
          cpfLido = decodedText.replace(/\D/g, '');
        }

        const militar = militares.find(m => String(m.cpf) === cpfLido);

        if (militar) {
          setScannedMilitar(militar);
          checkArranchamento(militar.cpf, refeicaoAtual);
          scanner.pause(true); // Pausa para mostrar o resultado
        } else {
          setErrorMessage("Militar não encontrado no banco de dados.");
          setStatus('error');
          scanner.pause(true);
        }
      } catch (err) {
        console.error(err);
      }
    }

    function onScanFailure(error: any) {
      // Ignora erros de leitura frame a frame
    }

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner", error));
    };
  }, [militares, arranchamentos, refeicaoAtual, status]);

  const checkArranchamento = (cpf: string | number, tipo: 'almoco' | 'jantar') => {
    const hoje = new Date().toISOString().split('T')[0];

    // Busca se existe agendamento
    const agendamento = arranchamentos.find(a =>
      String(a.militar_cpf) === String(cpf) &&
      a.data === hoje
    );

    // Verifica se está marcado para a refeição atual
    const isArranchado = agendamento ? (tipo === 'almoco' ? agendamento.almoco : agendamento.jantar) : false;

    if (isArranchado) {
      // SUCESSO: Está arranchado
      setStatus('success');
      onConfirm(String(cpf), tipo);
      setTimeout(resetScanner, 3000); // Reseta em 3s
    } else {
      // ERRO: Não está arranchado
      setStatus('error');
      setErrorMessage(`NÃO ARRANCHADO PARA ${tipo.toUpperCase()}`);
      // Não reseta automático, espera decisão do fiscal
    }
  };

  const handleLiberarAcesso = async () => {
    if (scannedMilitar) {
      // Força a presença mesmo sem estar arranchado
      await onConfirm(String(scannedMilitar.cpf), refeicaoAtual);
      setStatus('liberado');
      setTimeout(resetScanner, 3000);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setStatus('idle');
    setScannedMilitar(null);
    setErrorMessage('');
    // Hack para retomar o scanner da lib HTML5QrcodeScanner
    const resumeButton = document.getElementById("html5-qrcode-button-camera-start");
    if (resumeButton) resumeButton.click();
    else window.location.reload(); // Fallback se travar
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pb-20 animate-in fade-in">

      {/* Cabeçalho */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Scanner de Acesso</h2>
        <div className="inline-flex bg-white/10 rounded-lg p-1">
          <button onClick={() => setRefeicaoAtual('almoco')} className={`px-4 py-1 rounded-md text-xs font-bold uppercase ${refeicaoAtual === 'almoco' ? 'bg-primary text-white' : 'text-slate-400'}`}>Almoço</button>
          <button onClick={() => setRefeicaoAtual('jantar')} className={`px-4 py-1 rounded-md text-xs font-bold uppercase ${refeicaoAtual === 'jantar' ? 'bg-indigo-500 text-white' : 'text-slate-400'}`}>Jantar</button>
        </div>
      </div>

      {/* Área da Câmera */}
      <div className="glass p-4 rounded-3xl border border-white/10 overflow-hidden relative min-h-[400px]">

        {/* MODO LEITURA (Padrão) */}
        <div id="reader" className={`rounded-xl overflow-hidden ${status !== 'idle' ? 'hidden' : 'block'}`} />

        {/* FEEDBACK: SUCESSO (VERDE) */}
        {status === 'success' && scannedMilitar && (
          <div className="absolute inset-0 bg-emerald-600 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl">
              <CheckCircle2 className="w-16 h-16 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-black text-white uppercase mb-2">Acesso Autorizado</h2>
            <p className="text-xl font-bold text-emerald-100 uppercase">{scannedMilitar.nome_guerra}</p>
            <p className="text-sm font-bold text-emerald-200 uppercase tracking-widest">{scannedMilitar.posto_grad}</p>
          </div>
        )}

        {/* FEEDBACK: LIBERADO (AZUL) */}
        {status === 'liberado' && scannedMilitar && (
          <div className="absolute inset-0 bg-blue-600 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl">
              <ShieldAlert className="w-16 h-16 text-blue-600" />
            </div>
            <h2 className="text-3xl font-black text-white uppercase mb-2">Acesso Liberado</h2>
            <p className="text-white/80 text-xs font-bold uppercase mb-4">Registro forçado pelo Fiscal</p>
            <p className="text-xl font-bold text-blue-100 uppercase">{scannedMilitar.nome_guerra}</p>
          </div>
        )}

        {/* FEEDBACK: ERRO (VERMELHO) */}
        {status === 'error' && scannedMilitar && (
          <div className="absolute inset-0 bg-red-600 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-xl">
              <XCircle className="w-16 h-16 text-red-600" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase mb-1">Acesso Negado</h2>
            <p className="text-red-200 font-bold uppercase text-sm mb-6">{errorMessage}</p>

            <div className="bg-black/20 p-4 rounded-xl w-full mb-6">
              <p className="text-xl font-bold text-white uppercase">{scannedMilitar.nome_guerra}</p>
              <p className="text-xs font-bold text-red-200 uppercase tracking-widest">{scannedMilitar.posto_grad}</p>
            </div>

            {/* BOTÃO MÁGICO DE LIBERAR */}
            <button
              onClick={handleLiberarAcesso}
              className="w-full py-4 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-black uppercase text-sm shadow-lg flex items-center justify-center gap-2 mb-3"
            >
              <UserCheck className="w-5 h-5" /> Liberar Acesso
            </button>

            <button
              onClick={resetScanner}
              className="w-full py-3 bg-black/20 text-white rounded-xl font-bold uppercase text-xs hover:bg-black/30"
            >
              Cancelar
            </button>
          </div>
        )}

      </div>

      <p className="text-center text-[10px] text-slate-500 font-bold uppercase">
        Aponte a câmera para o QR Code do crachá
      </p>
    </div>
  );
};

export default Scanner;
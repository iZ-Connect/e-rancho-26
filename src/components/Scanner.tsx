import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckCircle2, XCircle, Camera } from 'lucide-react';
import { Militar, Arranchamento } from '../types';

interface ScannerProps {
  militares: Militar[];
  arranchamentos: Arranchamento[];
  onConfirm: (militarCpf: string, tipo: 'almoço' | 'jantar') => void;
}

const Scanner: React.FC<ScannerProps> = ({ militares, arranchamentos, onConfirm }) => {
  const [result, setResult] = useState<{ status: 'success' | 'error' | null; message: string }>({ status: null, message: '' });
  const [tipo, setTipo] = useState<'almoço' | 'jantar'>('almoço');
  const [isScanning, setIsScanning] = useState(true);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isScanning) {
      setTimeout(() => {
        try {
          scannerRef.current = new Html5QrcodeScanner("reader", {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          }, false);
          scannerRef.current.render(onScanSuccess, onScanError);
        } catch (e) { console.error(e); }
      }, 100);
    }
    return () => { if (scannerRef.current) scannerRef.current.clear().catch(e => console.error(e)); };
  }, [isScanning, tipo]);

  const onScanSuccess = (decodedText: string) => {
    // Ajustado para garantir que a comparação de CPF funcione independente do tipo de dado
    const cleanCpfScaneado = decodedText.replace(/\D/g, '');
    const militar = militares.find(m => String(m.cpf).replace(/\D/g, '') === cleanCpfScaneado);
    const today = new Date().toISOString().split('T')[0];

    if (!militar) {
      setResult({ status: 'error', message: 'MILITAR NÃO IDENTIFICADO' });
    } else {
      // Busca o arranchamento no array que vem do Firebase
      const arrData = arranchamentos.find(a => String(a.militar_cpf) === String(militar.cpf) && a.data === today);
      const isArranchado = tipo === 'almoço' ? arrData?.almoco : arrData?.jantar;

      // Importante: Usamos ["Nome de Guerra"] porque é assim que está no seu Firebase
      const nomeGuerra = militar["Nome de Guerra"] || "MILITAR";

      if (isArranchado) {
        setResult({ status: 'success', message: `LIBERADO: ${nomeGuerra}` });
        onConfirm(String(militar.cpf), tipo);
      } else {
        setResult({ status: 'error', message: `NÃO ARRANCHADO: ${nomeGuerra}` });
      }
    }

    setIsScanning(false);
    // Tempo de espera antes de liberar a próxima leitura
    setTimeout(() => {
      setResult({ status: null, message: '' });
      setIsScanning(true);
    }, 3000);
  };

  const onScanError = () => {
    // Erros de leitura (QR code fora de foco, etc) são ignorados para não travar o app
  };

  return (
    <div className="flex flex-col items-center gap-6 max-w-lg mx-auto py-4">
      {/* Seletor de Refeição */}
      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-full h-14">
        <button
          onClick={() => setTipo('almoço')}
          className={`flex-1 rounded-xl text-xs font-bold uppercase transition-all ${tipo === 'almoço' ? 'bg-primary text-white shadow-lg' : 'text-slate-400'}`}
        >
          Validar Almoço
        </button>
        <button
          onClick={() => setTipo('jantar')}
          className={`flex-1 rounded-xl text-xs font-bold uppercase transition-all ${tipo === 'jantar' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
        >
          Validar Jantar
        </button>
      </div>

      {/* Área do Scanner / Resultado */}
      <div className="relative w-full aspect-square bg-black rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl">
        {isScanning ? (
          <div id="reader" className="w-full h-full"></div>
        ) : (
          <div className={`w-full h-full flex flex-col items-center justify-center p-8 text-center transition-colors duration-300 ${result.status === 'success' ? 'bg-blue-600' : 'bg-red-600'}`}>
            {result.status === 'success' ? (
              <CheckCircle2 className="w-24 h-24 text-white mb-4 animate-bounce" />
            ) : (
              <XCircle className="w-24 h-24 text-white mb-4 animate-pulse" />
            )}
            <h3 className="text-2xl font-black text-white uppercase leading-tight">{result.message}</h3>
            <p className="mt-6 text-white/70 text-xs font-bold uppercase tracking-widest">Aguarde para o próximo...</p>
          </div>
        )}
      </div>

      {/* Instrução de Uso */}
      <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full">
        <Camera className="w-4 h-4" /> Aponte para o QR Code do militar
      </div>
    </div>
  );
};

export default Scanner;
"use client";

import React, { ReactNode } from "react";
import { 
  Printer, 
  Share2, 
  Leaf, 
  FileText, 
  MapPin,
  Lock
} from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // Ajuste o import conforme seu projeto

interface CalculatorLayoutProps {
  // Estados compartilhados
  produtor: string;
  setProdutor: (v: string) => void;
  talhao: string;
  setTalhao: (v: string) => void;
  
  // Informações da Ferramenta
  title: string;
  subtitle: string;
  category: string;
  icon: ReactNode;
  
  // Texto para o WhatsApp (apenas o resultado)
  shareText: string;
  
  children: ReactNode;
}

export function CalculatorLayout({
  produtor,
  setProdutor,
  talhao,
  setTalhao,
  title,
  subtitle,
  category,
  icon,
  shareText,
  children
}: CalculatorLayoutProps) {
  
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const dataRelatorio = new Date().toLocaleDateString('pt-BR');

  const handleShare = () => {
    if (!isAuthenticated) return;
    const header = `🌱 *Ruralis PRO - ${title}*\n👤 *Produtor:* ${produtor || 'Não informado'}\n📍 *Talhão:* ${talhao || 'Geral'}\n━━━━━━━━━━━━━━━━\n`;
    const finalMessage = header + shareText;
    window.open(`https://wa.me/?text=${encodeURIComponent(finalMessage)}`, '_blank');
  };

  const handlePrint = () => {
    if (!isAuthenticated) return;
    window.print();
  }

  // Função para abrir o modal de login (ajuste o ID conforme seu modal)
  const openLogin = () => (document.getElementById("modal_auth") as any)?.showModal();

  return (
    <>
      {/* --- CSS GLOBAL DE IMPRESSÃO --- */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { 
            position: absolute; left: 0; top: 0; width: 100%; 
            margin: 0; padding: 20px; background: white; color: black; z-index: 9999; 
          }
          .no-print { display: none !important; }
          .print-card { 
            background-color: white !important; 
            color: black !important; 
            border: 2px solid #000 !important; 
            box-shadow: none !important;
          }
          .print-text-black { color: black !important; }
        }
      `}</style>

      <div id="print-area" className="max-w-6xl mx-auto pt-10 pb-20 space-y-8 px-4">
        
        {/* --- CABEÇALHO DO RELATÓRIO (SÓ IMPRESSÃO) --- */}
        <div className="hidden print:block border-b-2 border-slate-900 pb-6 mb-8">
           <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2">
                 <Leaf size={32} className="text-black"/> 
                 <div>
                    <h1 className="text-2xl font-bold uppercase tracking-tight">Ruralis PRO</h1>
                    <p className="text-xs text-slate-600">{category}</p>
                 </div>
              </div>
              <div className="text-right">
                 <h2 className="text-xl font-bold uppercase">{title}</h2>
                 <p className="text-sm text-slate-600">Emissão: {dataRelatorio}</p>
              </div>
           </div>
           <div className="border border-slate-300 rounded p-4 bg-slate-50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                 <p><strong>Produtor:</strong> {produtor || '____________________'}</p>
                 <p><strong>Talhão:</strong> {talhao || '____________________'}</p>
              </div>
           </div>
        </div>

        {/* --- CABEÇALHO DA TELA --- */}
        <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-6 gap-4 no-print">
          <div>
             <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase text-xs tracking-wider mb-2">
               {icon} {category}
             </div>
             <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
               {title}
             </h1>
             <p className="text-slate-500 mt-2 text-lg">
               {subtitle}
             </p>
          </div>
          
          <div className="flex gap-2">
            {/* BOTÃO WHATSAPP */}
            <button 
              onClick={isAuthenticated ? handleShare : openLogin} 
              disabled={!isAuthenticated}
              className={`flex items-center gap-2 font-bold text-sm px-4 py-2 rounded-lg shadow-sm transition-colors ${
                isAuthenticated 
                ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {isAuthenticated ? <Share2 size={16} /> : <Lock size={16} />}
              WhatsApp
            </button>

            {/* BOTÃO IMPRIMIR */}
            <button 
              onClick={isAuthenticated ? handlePrint : openLogin}
              disabled={!isAuthenticated} 
              className={`flex items-center gap-2 border font-bold text-sm px-4 py-2 rounded-lg transition-colors ${
                 isAuthenticated
                 ? "text-slate-700 bg-white border-slate-300 hover:bg-slate-50"
                 : "text-slate-400 bg-slate-100 border-slate-200 cursor-not-allowed"
              }`}
            >
              {isAuthenticated ? <Printer size={16} /> : <Lock size={16} />}
              Imprimir
            </button>
          </div>
        </header>

        {/* --- INPUTS DE IDENTIFICAÇÃO --- */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 no-print">
            <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 flex gap-1 items-center"><FileText size={14}/> Produtor</label>
                <input 
                  type="text" 
                  value={produtor} 
                  onChange={(e) => setProdutor(e.target.value)} 
                  placeholder="Nome do produtor..." 
                  className="w-full border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none border text-sm" 
                />
            </div>
            <div className="flex-1">
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 flex gap-1 items-center"><MapPin size={14}/> Talhão / Área</label>
                <input 
                  type="text" 
                  value={talhao} 
                  onChange={(e) => setTalhao(e.target.value)} 
                  placeholder="Identificação da área..." 
                  className="w-full border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none border text-sm" 
                />
            </div>
        </div>

        {/* --- CONTEÚDO DA CALCULADORA --- */}
        {children}

        {/* --- RODAPÉ IMPRESSO --- */}
        <div className="hidden print:block pt-12 mt-8 text-center border-t border-slate-200">
           <div className="border-t border-black w-48 mx-auto pt-2 mb-4">
              <p className="text-xs font-bold">Assinatura do Responsável</p>
           </div>
           <p className="text-[10px] text-slate-500">
              Documento gerado via Ruralis PRO. A validação técnica agronômica é indispensável.
           </p>
        </div>
      </div>
    </>
  );
}
"use client";

import React, { ReactNode } from "react";
import { 
  Printer, 
  MapPin,
  Lock,
  User,
  ChevronRight,
  PenLine
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface CalculatorLayoutProps {
  produtor: string;
  setProdutor: (v: string) => void;
  talhao: string;
  setTalhao: (v: string) => void;
  title: string;
  subtitle: string;
  category: string;
  icon: ReactNode;
  shareText: string;
  children: ReactNode;
}

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

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
    const header = `🌱 *Ruralis PRO* | Relatório Técnico\n📂 *Ferramenta:* ${title}\n👤 *Produtor:* ${produtor || 'Não informado'}\n📍 *Talhão:* ${talhao || 'Geral'}\n📅 *Data:* ${dataRelatorio}\n━━━━━━━━━━━━━━━━━━\n\n`;
    const footer = `\n━━━━━━━━━━━━━━━━━━\n🔗 _Gerado via Plataforma Ruralis PRO_`;
    const finalMessage = header + shareText + footer;
    window.open(`https://wa.me/?text=${encodeURIComponent(finalMessage)}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  }

  const handleAction = (action: () => void) => {
    if (isAuthenticated) {
      action();
    } else {
      (document.getElementById("modal_auth") as any)?.showModal();
    }
  };

  return (
    <>
      <style jsx global>{`
        /* CORREÇÃO DE QUEBRA DE PÁGINA */
        /* Aplique a classe 'avoid-break' nas divs dos seus cards/resultados */
        .avoid-break {
          break-inside: avoid;
          page-break-inside: avoid;
          page-break-before: auto;
          display: block; /* Garante comportamento de bloco na impressão */
        }

        @media print {
          @page { margin: 0.8cm; size: A4; }
          body { background-color: white; -webkit-print-color-adjust: exact; }
          body * { visibility: hidden; }
          
          #print-area, #print-area * { visibility: visible; }
          
          #print-area { 
            position: absolute; left: 0; top: 0; width: 100%; 
            margin: 0; padding: 0; background: white; color: black; 
          }
          
          .no-print { display: none !important; }
          
          /* Força visual limpo na impressão */
          .print-border-black { border-color: black !important; }
          .print-text-black { color: black !important; }
          .shadow-xl, .shadow-lg, .shadow-md, .shadow-sm { box-shadow: none !important; }
          
          /* Remove cores de fundo pesadas */
          .bg-emerald-600, .bg-slate-900, .bg-slate-50 { 
            background-color: transparent !important; 
            color: black !important; 
          }
          
          /* Inputs na impressão ficam parecendo texto puro */
          input { 
            border: none !important; 
            padding: 0 !important; 
            font-weight: bold !important;
          }
        }
      `}</style>

      <div id="print-area" className="max-w-6xl mx-auto pt-8 pb-20 px-4 md:px-8">
        
        {/* === CABEÇALHO IMPRESSÃO (Mantido igual) === */}
        <div className="hidden print:block mb-6 border-b-2 border-black pb-4">
           <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-5">
                 <img src="/logo.png" alt="Ruralis PRO" className="h-14 w-auto object-contain grayscale contrast-150"/>
                 <div className="h-10 w-[2px] bg-black"></div>
                 <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ferramenta</p>
                    <p className="text-xl font-black uppercase tracking-tight leading-none text-black">{category}</p>
                 </div>
              </div>
              <div className="text-right">
                 <h2 className="text-xl font-bold text-black">{title}</h2>
                 <p className="text-xs text-slate-600 font-medium">Emitido em: {dataRelatorio}</p>
              </div>
           </div>
           
           <div className="flex border border-black rounded overflow-hidden">
              <div className="flex-1 p-2 border-r border-black">
                 <span className="text-[10px] font-bold uppercase text-slate-500 block">Produtor</span>
                 <span className="text-sm font-bold text-black truncate block">{produtor || '—'}</span>
              </div>
              <div className="flex-1 p-2 border-r border-black">
                 <span className="text-[10px] font-bold uppercase text-slate-500 block">Talhão / Área</span>
                 <span className="text-sm font-bold text-black truncate block">{talhao || '—'}</span>
              </div>
              <div className="flex-1 p-2">
                 <span className="text-[10px] font-bold uppercase text-slate-500 block">Responsável Técnico</span>
                 <span className="text-sm font-bold text-black truncate block">{user?.name || '_______________________'}</span>
              </div>
           </div>
        </div>

        {/* === CABEÇALHO DA TELA (Botões melhorados) === */}
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-10 no-print">
          <div className="flex-1">
             <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-100">
               {icon} {category}
             </div>
             <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
               {title}
             </h1>
             <p className="text-slate-500 mt-3 text-lg leading-relaxed max-w-2xl">
               {subtitle}
             </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
            <button 
              onClick={() => handleAction(handlePrint)}
              className="group flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-600 font-bold text-sm px-6 py-3.5 rounded-xl hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 transition-all active:scale-[0.98]"
            >
              {isAuthenticated ? (
                <> <Printer size={18} className="text-slate-400 group-hover:text-slate-600"/> <span>Imprimir</span> </>
              ) : (
                <> <Lock size={16} className="text-slate-400"/> <span>Login p/ Imprimir</span> </>
              )}
            </button>

            <button 
              onClick={() => handleAction(handleShare)} 
              className={`group flex items-center justify-center gap-3 font-bold text-sm px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] ${
                isAuthenticated 
                ? "bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-emerald-200 hover:shadow-emerald-300 ring-offset-2 focus:ring-2 ring-[#25d366]" 
                : "bg-slate-100 text-slate-400 border border-slate-200 cursor-pointer hover:bg-slate-200"
              }`}
            >
              {isAuthenticated ? (
                <> <WhatsAppIcon className="w-5 h-5 fill-white" /> <span>Enviar no WhatsApp</span> <ChevronRight size={16} className="opacity-70 group-hover:translate-x-1 transition-transform"/> </>
              ) : (
                <> <Lock size={16} /> <span>Login p/ Compartilhar</span> </>
              )}
            </button>
          </div>
        </header>

        {/* === NOVO DESIGN DE INPUTS (Parece um painel) === */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 no-print">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Input Produtor */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all flex items-center gap-4">
                    <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-700">
                        <User size={20} />
                    </div>
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Nome do Produtor
                        </label>
                        <input 
                            type="text" 
                            value={produtor} 
                            onChange={(e) => setProdutor(e.target.value)} 
                            placeholder="Toque para identificar..." 
                            className="w-full text-slate-900 font-bold outline-none placeholder:text-slate-300 placeholder:font-normal text-base bg-transparent"
                        />
                    </div>
                    <PenLine size={16} className="text-slate-300" />
                </div>

                {/* Input Talhão */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100 transition-all flex items-center gap-4">
                    <div className="bg-blue-100 p-2.5 rounded-lg text-blue-700">
                         <MapPin size={20} />
                    </div>
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Talhão / Área
                        </label>
                        <input 
                            type="text" 
                            value={talhao} 
                            onChange={(e) => setTalhao(e.target.value)} 
                            placeholder="Ex: Talhão da Baixada..." 
                            className="w-full text-slate-900 font-bold outline-none placeholder:text-slate-300 placeholder:font-normal text-base bg-transparent"
                        />
                    </div>
                    <PenLine size={16} className="text-slate-300" />
                </div>

            </div>
        </div>

        {/* === ÁREA DA CALCULADORA (Injectada) === */}
        <main className="w-full space-y-6">
             {children}
        </main>

        {/* RODAPÉ IMPRESSÃO */}
        <div className="hidden print:flex flex-col justify-end mt-12 pt-8 border-t border-slate-200 avoid-break">
           <div className="grid grid-cols-2 gap-12 mb-8">
              <div className="text-center pt-4 border-t border-black">
                  <p className="text-sm font-bold uppercase text-black">{produtor || 'Produtor'}</p>
                  <p className="text-xs text-slate-500">Assinatura</p>
              </div>
              <div className="text-center pt-4 border-t border-black">
                  <p className="text-sm font-bold uppercase text-black">Responsável Técnico</p>
                  <p className="text-xs text-slate-500">CREA / Assinatura</p>
              </div>
           </div>
           
           <div className="text-center bg-slate-50 p-2 rounded border border-slate-100">
             <p className="text-[9px] text-slate-400 uppercase tracking-widest leading-relaxed">
               Este documento é uma estimativa técnica gerada pela plataforma <strong>Ruralis PRO</strong>.
               A validação agronômica presencial é indispensável.
             </p>
           </div>
        </div>

      </div>
    </>
  );
}
"use client";

import React, { ReactNode } from "react";
import { Printer, MapPin, User, Share2, ChevronRight } from "lucide-react";

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
  produtor, setProdutor, talhao, setTalhao, title, subtitle, category, icon, shareText, children
}: CalculatorLayoutProps) {
  
  const handlePrint = () => window.print();

  const handleShareWhatsApp = () => {
    const header = `🌱 *Ruralis PRO* | Relatório Técnico\n📂 *Ferramenta:* ${title}\n👤 *Produtor:* ${produtor || 'Não informado'}\n📍 *Talhão:* ${talhao || 'Geral'}\n━━━━━━━━━━━━━━━━━━\n\n`;
    const footer = `\n━━━━━━━━━━━━━━━━━━\n🔗 _Gerado via Plataforma Ruralis PRO_`;
    window.open(`https://wa.me/?text=${encodeURIComponent(header + shareText + footer)}`, '_blank');
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media screen { .only-print { display: none !important; } }
        @media print {
          @page { margin: 1cm; size: A4; }
          body * { visibility: hidden; }
          .no-print { display: none !important; }
          .only-print, .only-print * { visibility: visible !important; }
          .only-print { display: block !important; position: absolute; left: 0; top: 0; width: 100%; background: white !important; }
        }
      `}} />

      <div className="max-w-6xl mx-auto pt-8 pb-20 px-4 md:px-8">
        
        {/* HEADER COM OS DOIS BOTÕES */}
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-10 no-print">
          <div className="flex-1">
             <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase mb-4 border border-emerald-100">
               {icon} {category}
             </div>
             <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{title}</h1>
             <p className="text-slate-500 mt-2 text-lg">{subtitle}</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handlePrint}
              className="flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-600 font-bold px-6 py-3.5 rounded-xl hover:border-slate-400 transition-all shadow-sm active:scale-95"
            >
              <Printer size={18}/> <span>Gerar PDF / Imprimir</span>
            </button>

            <button 
              onClick={handleShareWhatsApp}
              className="flex items-center justify-center gap-3 bg-[#25D366] text-white font-bold px-6 py-3.5 rounded-xl shadow-md hover:bg-[#20ba5a] transition-all active:scale-95"
            >
              <WhatsAppIcon className="w-5 h-5" /> <span>Enviar WhatsApp</span> <ChevronRight size={16}/>
            </button>
          </div>
        </header>

        {/* INPUTS DE IDENTIFICAÇÃO (TELA) */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 no-print">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
                    <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700"><User size={20} /></div>
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Produtor</label>
                        <input type="text" value={produtor} onChange={(e) => setProdutor(e.target.value)} placeholder="Nome do produtor..." className="w-full text-slate-900 font-bold outline-none bg-transparent" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-700"><MapPin size={20} /></div>
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Talhão / Área</label>
                        <input type="text" value={talhao} onChange={(e) => setTalhao(e.target.value)} placeholder="Identificação da área..." className="w-full text-slate-900 font-bold outline-none bg-transparent" />
                    </div>
                </div>
            </div>
        </div>

        {/* CALCULADORA (TELA) */}
        <main className="no-print"> {children} </main>

        {/* LAUDO TÉCNICO (PDF/IMPRESSÃO) */}
        <div className="only-print text-black">
           <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-8">
              <div>
                <h1 className="text-2xl font-black">RURALIS PRO</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest border-l-2 border-black pl-2">Relatório de Consultoria Técnica</p>
              </div>
              <div className="text-right text-black">
                <p className="text-sm font-bold uppercase">{title}</p>
                <p className="text-[10px]">Data: {new Date().toLocaleDateString('pt-BR')}</p>
              </div>
           </div>

           <div className="grid grid-cols-2 border border-black rounded-lg overflow-hidden mb-8">
              <div className="p-4 border-r border-black">
                <p className="text-[9px] font-bold uppercase text-slate-500 mb-1">Produtor / Propriedade:</p>
                <p className="text-sm font-bold uppercase">{produtor || "___________________________"}</p>
              </div>
              <div className="p-4">
                <p className="text-[9px] font-bold uppercase text-slate-500 mb-1">Localização / Talhão:</p>
                <p className="text-sm font-bold uppercase">{talhao || "___________________________"}</p>
              </div>
           </div>

           <div className="technical-body"> {children} </div>

           <div className="mt-32 grid grid-cols-2 gap-20">
              <div className="text-center">
                <div className="border-t border-black w-full mb-1"></div>
                <p className="text-[9px] font-bold uppercase">Assinatura do Produtor</p>
              </div>
              <div className="text-center">
                <div className="border-t border-black w-full mb-1"></div>
                <p className="text-[9px] font-bold uppercase">Responsável Técnico</p>
              </div>
           </div>
        </div>
      </div>
    </>
  );
}
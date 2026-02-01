"use client";

import { useState, useMemo } from "react";
import { 
  Sprout, 
  Ruler, 
  ArrowRight, 
  Lock, 
  Percent, 
  LayoutGrid,
  Tractor,
  AlertTriangle,
  ClipboardList,
  Info
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CalculatorLayout } from "@/app/components/CalculatorLayout";

// --- COMPONENTES AUXILIARES ---

// 1. Tabela para Impressão
const TechnicalTable = ({ title, rows }: { title: string; rows: any[] }) => {
  if (!rows || rows.length === 0) return null;

  return (
    <div className="mt-4 mb-6 border border-black rounded-lg overflow-hidden avoid-break shadow-none break-inside-avoid">
      <div className="bg-slate-200 border-b border-black p-2 flex justify-between items-center print:bg-slate-200">
        <h3 className="font-bold text-xs uppercase text-black tracking-wider flex items-center gap-2">
           <ClipboardList size={14}/> {title}
        </h3>
      </div>
      <table className="w-full text-sm text-left">
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-slate-300 last:border-0 bg-white">
              {Object.values(row).map((val: any, i) => (
                  <td key={i} className={`p-2 text-black ${i === 0 ? 'font-bold w-1/2' : 'font-medium text-right'}`}>{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// 2. Input Padronizado
const InputGroup = ({ label, icon, value, onChange, placeholder = "0", step="0.1" }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
        {icon}
      </div>
      <input 
        type="number" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        onWheel={(e) => e.currentTarget.blur()}
        placeholder={placeholder}
        step={step}
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900 font-medium placeholder:text-slate-300"
      />
    </div>
  </div>
);

export default function PopulacaoPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // ESTADOS
  const [produtor, setProdutor] = useState("");
  const [talhao, setTalhao] = useState("");

  // INPUTS
  const [entrelinha, setEntrelinha] = useState<number | string>(""); 
  const [sementesMetro, setSementesMetro] = useState<number | string>(""); 
  const [germinacao, setGerminacao] = useState<number | string>(95); 

  // FORMATAÇÃO NÚMEROS
  const fmt = (n: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(n);

  // CÁLCULOS
  const resultados = useMemo(() => {
    const eCm = Number(entrelinha) || 0;
    const sMetro = Number(sementesMetro) || 0;
    const gPct = Number(germinacao) || 0;

    if (eCm === 0) return { metrosLineares: 0, sementesHa: 0, plantasHa: 0, perda: 0, rowsResumo: [] };

    const eMetro = eCm / 100;
    const metrosLineares = 10000 / eMetro;
    const sementesHa = metrosLineares * sMetro;
    const plantasHa = sementesHa * (gPct / 100);

    return {
        metrosLineares,
        sementesHa,
        plantasHa,
        perda: sementesHa - plantasHa,
        rowsResumo: [
            { "Item": "Espaçamento", "Valor": `${eCm} cm` },
            { "Item": "Sementes p/ Metro", "Valor": `${sMetro} sem/m` },
            { "Item": "Germinação Esperada", "Valor": `${gPct}%` },
            { "Item": "Metros Lineares/ha", "Valor": `${fmt(metrosLineares)} m` },
            { "Item": "Sementes Totais/ha", "Valor": `${fmt(sementesHa)} sem` },
            { "Item": "STAND FINAL (Est.)", "Valor": `${fmt(plantasHa)} pl/ha` }
        ]
    };
  }, [entrelinha, sementesMetro, germinacao]);

  const shareText = `🌱 *Cálculo de Stand*\n\n📏 *Espaçamento:* ${entrelinha} cm\n🎯 *Regulagem:* ${sementesMetro} sem/m\n\n✅ *População Final Estimada:*\n${fmt(resultados.plantasHa)} plantas/ha\n\n⚠️ *Perda Potencial:* ${fmt(resultados.perda)} sementes/ha`;

  return (
    <CalculatorLayout
      title="População de Plantas"
      subtitle="Estimativa de stand final e metros lineares por hectare."
      category="Planejamento de Plantio"
      icon={<Sprout size={16} />}
      produtor={produtor}
      setProdutor={setProdutor}
      talhao={talhao}
      setTalhao={setTalhao}
      shareText={shareText}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
        
        {/* --- INPUTS --- */}
        <div className="lg:col-span-7 space-y-6">
           <div className="print:hidden">
               {/* Seção 1: Configuração da Máquina */}
               <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                     <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><Tractor size={20} /></div>
                     <div>
                        <h3 className="font-bold text-lg text-slate-800">1. Configuração de Plantio</h3>
                        <p className="text-xs text-slate-400">Dados da plantadeira e regulagem</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <InputGroup label="Espaçamento Entrelinhas (cm)" icon={<Ruler size={16}/>} value={entrelinha} onChange={setEntrelinha} placeholder="Ex: 45 ou 50" />
                     <InputGroup label="Sementes por Metro" icon={<LayoutGrid size={16}/>} value={sementesMetro} onChange={setSementesMetro} placeholder="Ex: 12" />
                  </div>
                  
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                      {[45, 50, 75, 90].map(val => (
                          <button key={val} onClick={() => setEntrelinha(val)} className="text-xs border border-slate-200 px-3 py-1 rounded-full text-slate-500 hover:bg-slate-50 transition-colors whitespace-nowrap">
                              {val} cm
                          </button>
                      ))}
                  </div>
               </section>

               {/* Seção 2: Qualidade da Semente */}
               <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-6">
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                     <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Sprout size={20} /></div>
                     <div>
                        <h3 className="font-bold text-lg text-slate-800">2. Qualidade da Semente</h3>
                        <p className="text-xs text-slate-400">Para estimativa de perdas e falhas</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <InputGroup label="Germinação Esperada (%)" icon={<Percent size={16}/>} value={germinacao} onChange={setGerminacao} placeholder="Ex: 95" />
                  </div>
               </section>
           </div>

           {/* TABELA VISIVEL APENAS NA IMPRESSAO */}
           <div className="hidden print:block">
               <TechnicalTable title="Relatório de População e Stand" rows={resultados.rowsResumo} />
           </div>
        </div>

        {/* --- RESULTADOS --- */}
        <div className="lg:col-span-5 relative">
            <div className="sticky top-10 print:static">

                 {!isAuthenticated && (
                   <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg h-full print:hidden">
                      <div className="bg-slate-900 text-emerald-400 p-4 rounded-full mb-4 shadow-xl animate-pulse">
                         <Lock size={32} />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">Resultado Bloqueado</h3>
                      <button 
                        onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 hover:scale-105"
                      >
                        Visualizar Stand <ArrowRight size={16}/>
                      </button>
                    </div>
                 )}

                 <div className={`space-y-6 transition-all duration-500 print:hidden ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>
                    
                    {/* Card Principal: POPULAÇÃO */}
                    <div className="print-card bg-slate-900 text-white rounded-xl p-8 shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-emerald-400 font-bold uppercase tracking-wider text-xs mb-1">Stand Final Estimado</p>
                            <p className="text-slate-400 text-[10px] mb-6">Plantas viáveis por hectare</p>

                            <div className="flex items-end gap-3 mb-8">
                                <span className="text-5xl lg:text-6xl font-black tracking-tighter text-white">
                                    {fmt(resultados.plantasHa)}
                                </span>
                                <div className="mb-2">
                                    <span className="text-lg font-medium text-slate-300 block">pl/ha</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                                    <span>Plantas Nascidas ({germinacao}%)</span>
                                    <span>Perda ({100 - Number(germinacao)}%)</span>
                                </div>
                                <div className="flex h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                   <div style={{ width: `${germinacao}%` }} className="bg-emerald-500"></div>
                                   <div style={{ width: `${100 - Number(germinacao)}%` }} className="bg-red-500/50 striped-bg"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    

                    {/* Card Secundário: METROS LINEARES */}
                    <div className="print-card bg-white border border-slate-200 rounded-xl p-6 shadow-lg">
                        <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
                             <Ruler className="text-blue-600" size={20}/>
                             <div>
                                <h4 className="font-bold text-slate-800 text-sm">Metros Lineares</h4>
                                <p className="text-[10px] text-slate-400">Total de linhas em 1 hectare</p>
                             </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-3xl font-black text-slate-900">{fmt(resultados.metrosLineares)}</span>
                            <span className="text-sm font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">m/ha</span>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg flex gap-3 items-start">
                        <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-800 leading-normal">
                            <span className="font-bold block mb-1">Dica de Manejo:</span>
                            Aumentar a densidade além do recomendado para o híbrido reduz a espessura do colmo e pode causar acamamento.
                        </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex gap-3 items-start">
                        <Info size={18} className="text-slate-500 shrink-0 mt-0.5" />
                        <div className="text-xs text-slate-600 leading-normal italic">
                            O cálculo de metros lineares é a base para o dimensionamento de fertilizantes e defensivos aplicados no sulco de plantio.
                        </div>
                    </div>

                 </div>
            </div>
        </div>

      </div>
    </CalculatorLayout>
  );
}
"use client";

import { useState, useMemo } from "react";
import { 
  Wheat, 
  Coins, 
  Scale, 
  ArrowRight, 
  Lock, 
  LayoutGrid, 
  AlertOctagon,
  CheckCircle2,
  XCircle,
  ClipboardList,
  ArrowDownRight,
  Sprout,
  Calculator,
  Info
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CalculatorLayout } from "@/app/components/CalculatorLayout";

// --- COMPONENTES VISUAIS ---

// 1. INPUTS (Visual Limpo e Padrão)
const InputGroup = ({ label, icon, value, onChange, placeholder = "0", subLabel }: any) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1.5">
        {label}
        </label>
        {subLabel && <span className="text-[10px] text-slate-400 font-medium">{subLabel}</span>}
    </div>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors font-bold text-sm">
        {icon}
      </div>
      <input 
        type="number" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder}
        step="0.01"
        onWheel={(e) => e.currentTarget.blur()}
        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 font-semibold placeholder:text-slate-300 shadow-sm"
      />
    </div>
  </div>
);

// 2. TABELA TÉCNICA (Padrão para Impressão)
const TechnicalTable = ({ title, rows }: { title: string, rows: any[] }) => {
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
            <tr 
              key={index} 
              className={`
                border-b border-slate-300 last:border-0 
                ${index % 2 === 0 ? 'bg-white' : 'bg-slate-100'} 
                ${row.isHeader ? 'bg-slate-800 text-white print:bg-slate-900 print:text-white font-bold' : ''}
              `}
            >
              <td className={`p-2 w-2/3 ${row.isHeader ? 'text-white' : 'text-slate-700 font-medium'}`}>
                {row.label}
              </td>
              <td className={`p-2 w-1/3 text-right font-bold ${row.isHeader ? 'text-white' : 'text-black'}`}>
                {row.value} <span className="text-[10px] font-normal text-slate-500 ml-1 uppercase">{row.unit}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function PerdaColheitaPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // ESTADOS GERAIS
  const [produtor, setProdutor] = useState("");
  const [talhao, setTalhao] = useState("");

  // CONFIGURAÇÃO
  const [cultura, setCultura] = useState<"soja" | "milho">("soja");
  const [metodo, setMetodo] = useState<"contagem" | "pesagem">("contagem");
  
  // INPUTS
  const [areaArmacao, setAreaArmacao] = useState<number | string>(1); // m² (padrão 1m x 1m)
  const [valorMedido, setValorMedido] = useState<number | string>(""); // Qtd grãos ou Gramas
  const [precoSaca, setPrecoSaca] = useState<number | string>(""); // R$

  // CONSTANTES
  const PMG_SOJA = 0.16; // ~160g por 1000 grãos
  const PMG_MILHO = 0.35; // ~350g por 1000 grãos

  // CÁLCULOS
  const resultados = useMemo(() => {
    const area = Number(areaArmacao) || 1;
    const medido = Number(valorMedido) || 0;
    const preco = Number(precoSaca) || 0;

    let perdaGramasPorMetro = 0;

    // 1. Calcular gramas perdidos por m²
    if (metodo === "pesagem") {
        perdaGramasPorMetro = medido / area;
    } else {
        const pesoGrao = cultura === "soja" ? PMG_SOJA : PMG_MILHO;
        perdaGramasPorMetro = (medido * pesoGrao) / area;
    }

    // 2. Extrapolar
    const perdaKgHa = perdaGramasPorMetro * 10;
    const perdaScHa = perdaKgHa / 60;
    const prejuizoHa = perdaScHa * preco;

    // 3. Tolerância
    const limiteAceitavel = cultura === "soja" ? 60 : 90; // kg/ha
    const isCritical = perdaKgHa > limiteAceitavel;

    return {
        kgHa: perdaKgHa,
        scHa: perdaScHa,
        prejuizo: prejuizoHa,
        isCritical,
        limite: limiteAceitavel
    };
  }, [areaArmacao, valorMedido, precoSaca, cultura, metodo]);

  // FORMATAÇÃO
  const fmtMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(v);

  const shareText = `📉 *Monitoramento de Colheita*\n\n🌾 *Cultura:* ${cultura.toUpperCase()}\n⚠️ *Perda Identificada:* ${fmtNum(resultados.scHa)} sc/ha\n⚖️ *Volume:* ${fmtNum(resultados.kgHa)} kg/ha\n\n💸 *Prejuízo Estimado:* ${fmtMoeda(resultados.prejuizo)} /ha`;

  return (
    <CalculatorLayout
      title="Perda de Colheita"
      subtitle="Cálculo de desperdício na plataforma e peneiras (Método da Armação)."
      category="Colheita"
      icon={<ArrowDownRight size={16} />}
      produtor={produtor}
      setProdutor={setProdutor}
      talhao={talhao}
      setTalhao={setTalhao}
      shareText={shareText}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
        
        {/* --- COLUNA ESQUERDA: INPUTS --- */}
        <div className="lg:col-span-7 space-y-6 print:space-y-4">
           
           {/* ==================================================================================
               SEÇÃO 1: CONFIGURAÇÃO DA AMOSTRAGEM
           ================================================================================== */}
           
           <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center shadow-sm border border-emerald-200">
                     <LayoutGrid size={20} />
                 </div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">Método de Aferição</h3>
                    <p className="text-xs text-slate-400 font-medium">Definição da cultura e coleta</p>
                 </div>
              </div>

              {/* Seletor de Cultura */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                 <button 
                    onClick={() => setCultura("soja")} 
                    className={`relative p-3 rounded-lg border text-left transition-all group flex items-center gap-3 ${
                        cultura === 'soja'
                        ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-1 ring-emerald-500' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                 >
                    <div className={`p-2 rounded-lg ${cultura === 'soja' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <Sprout size={18}/>
                    </div>
                    <div>
                        <span className={`block text-xs font-bold uppercase ${cultura === 'soja' ? 'text-emerald-700' : 'text-slate-400'}`}>Cultura</span>
                        <span className={`text-sm font-bold block ${cultura === 'soja' ? 'text-slate-900' : 'text-slate-600'}`}>Soja</span>
                    </div>
                 </button>

                 <button 
                    onClick={() => setCultura("milho")} 
                    className={`relative p-3 rounded-lg border text-left transition-all group flex items-center gap-3 ${
                        cultura === 'milho'
                        ? 'bg-amber-50 border-amber-500 shadow-sm ring-1 ring-amber-500' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                 >
                    <div className={`p-2 rounded-lg ${cultura === 'milho' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        <Wheat size={18}/>
                    </div>
                    <div>
                        <span className={`block text-xs font-bold uppercase ${cultura === 'milho' ? 'text-amber-700' : 'text-slate-400'}`}>Cultura</span>
                        <span className={`text-sm font-bold block ${cultura === 'milho' ? 'text-slate-900' : 'text-slate-600'}`}>Milho</span>
                    </div>
                 </button>
              </div>

              {/* Seletor de Método */}
              <div className="bg-slate-50 p-1 rounded-lg flex mb-6 border border-slate-200">
                 <button 
                    onClick={() => setMetodo("contagem")} 
                    className={`flex-1 py-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        metodo === 'contagem' ? 'bg-white text-emerald-700 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'
                    }`}
                 >
                    <Calculator size={14}/> Contagem de Grãos
                 </button>
                 <button 
                    onClick={() => setMetodo("pesagem")} 
                    className={`flex-1 py-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        metodo === 'pesagem' ? 'bg-white text-emerald-700 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'
                    }`}
                 >
                    <Scale size={14}/> Pesagem Direta
                 </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <InputGroup 
                    label="Área da Armação" 
                    icon={<LayoutGrid size={14}/>} 
                    value={areaArmacao} 
                    onChange={setAreaArmacao} 
                    subLabel="(m²)"
                 />
                 <InputGroup 
                    label={metodo === "contagem" ? "Grãos Contados" : "Peso Coletado"}
                    icon={metodo === "contagem" ? <Wheat size={14}/> : <Scale size={14}/>} 
                    value={valorMedido} 
                    onChange={setValorMedido} 
                    subLabel={metodo === "contagem" ? "(unid)" : "(gramas)"}
                 />
              </div>
           </section>

           {/* Visual Impressão (Tabela 1) */}
           <div className="hidden print:block">
             <TechnicalTable 
                title="1. Dados da Coleta (Amostragem)"
                rows={[
                  { label: "Cultura Avaliada", value: cultura.toUpperCase(), unit: "" },
                  { label: "Método Utilizado", value: metodo === "contagem" ? "Contagem de Grãos" : "Pesagem Direta", unit: "" },
                  { label: "Área da Armação", value: Number(areaArmacao).toFixed(2), unit: "m²" },
                  { label: metodo === "contagem" ? "Grãos na Área" : "Peso na Área", value: Number(valorMedido).toFixed(2), unit: metodo === "contagem" ? "unid" : "g" },
                ]}
             />
           </div>

           {/* ==================================================================================
               SEÇÃO 2: DADOS FINANCEIROS
           ================================================================================== */}
           
           <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center shadow-sm border border-blue-200">
                     <Coins size={20} />
                 </div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">Impacto Financeiro</h3>
                    <p className="text-xs text-slate-400 font-medium">Custo de oportunidade</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                 <InputGroup label="Preço da Saca" icon="R$" value={precoSaca} onChange={setPrecoSaca} placeholder="0.00" />
              </div>
           </section>

           {/* Visual Impressão (Tabela 2) */}
           <div className="hidden print:block">
             <TechnicalTable 
                title="2. Parâmetros Econômicos"
                rows={[
                  { label: "Preço de Mercado (Saca)", value: fmtMoeda(Number(precoSaca)), unit: "" },
                ]}
             />
           </div>
        </div>

        {/* --- COLUNA DIREITA: RESULTADOS --- */}
        <div className="lg:col-span-5 relative">
            <div className="sticky top-6 print:static space-y-6">

             {/* OVERLAY DE BLOQUEIO */}
             {!isAuthenticated && (
               <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200 shadow-lg h-full print:hidden">
                  <div className="bg-slate-900 text-emerald-400 p-4 rounded-full mb-4 shadow-xl animate-pulse">
                     <Lock size={32} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">Resultados Bloqueados</h3>
                  <button 
                    onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 hover:scale-105"
                  >
                    Ver Perdas <ArrowRight size={16}/>
                  </button>
               </div>
             )}

             {/* CONTEÚDO TELA */}
             <div className={`space-y-6 transition-all duration-500 print:hidden ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>
                
                {/* Card Principal: VOLUME (Escuro) */}
                <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                   {/* Background Effect */}
                   <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] opacity-20 -mr-10 -mt-10 pointer-events-none transition-colors duration-500 ${resultados.isCritical ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                   
                   <div className="relative z-10">
                       <div className="flex justify-between items-start mb-6">
                         <div>
                            <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                                Estimativa de Perda
                            </p>
                            <h4 className="font-bold text-lg text-white flex items-center gap-2">
                                Volume Perdido
                                {resultados.isCritical ? (
                                    <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><AlertOctagon size={10}/> CRÍTICO</span>
                                ) : (
                                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><CheckCircle2 size={10}/> OK</span>
                                )}
                            </h4>
                         </div>
                         <div className="bg-slate-800 p-2 rounded-lg text-slate-300 border border-slate-700">
                             <ArrowDownRight size={20} />
                         </div>
                       </div>
                       
                       <div className="flex items-baseline gap-2 mb-6">
                          <span className="text-6xl font-black tracking-tighter text-white">{fmtNum(resultados.scHa)}</span>
                          <span className="text-xl font-medium text-slate-400">sc/ha</span>
                       </div>

                       {/* Barra de Progresso / Limite */}
                       <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                            <div className="flex justify-between text-[10px] text-slate-400 mb-2 font-medium uppercase">
                                <span>0 sc</span>
                                <span>Limite: {fmtNum(resultados.limite / 60)} sc</span>
                            </div>
                            <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden relative">
                                {/* Linha de Limite */}
                                <div className="absolute left-[50%] top-0 bottom-0 w-0.5 bg-white/30 z-10" title="Limite de Tolerância"></div>
                                {/* Barra de Valor (Escala ajustada: 50% é o limite) */}
                                <div 
                                    style={{ width: `${Math.min((resultados.kgHa / (resultados.limite * 2)) * 100, 100)}%` }} 
                                    className={`h-full rounded-full transition-all duration-500 ${resultados.isCritical ? 'bg-red-500' : 'bg-emerald-500'}`}
                                ></div>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-2 text-center">
                                {resultados.isCritical 
                                    ? `Você está perdendo acima do aceitável (${fmtNum(resultados.kgHa)} kg/ha)`
                                    : `Perda dentro da tolerância (${fmtNum(resultados.kgHa)} kg/ha)`
                                }
                            </p>
                       </div>
                   </div>
                </div>
                
                {/* Card Financeiro (Claro) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg shadow-slate-200/50 relative overflow-hidden">
                   <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                     <div className="flex items-center gap-2">
                        <div className="bg-red-50 p-1.5 rounded-lg text-red-500">
                            <XCircle size={16} />
                        </div>
                        <h4 className="font-bold text-slate-800">Prejuízo Financeiro</h4>
                     </div>
                   </div>

                   <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-4xl font-black tracking-tighter text-slate-900">{fmtMoeda(resultados.prejuizo)}</span>
                      <span className="text-sm font-bold text-slate-400">/ ha</span>
                   </div>
                   
                   {resultados.prejuizo > 0 && (
                       <div className="mt-3 bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-100 flex items-start gap-2">
                           <Info size={14} className="mt-0.5 shrink-0"/>
                           <p>
                               Em uma área de <strong>100 hectares</strong>, você está deixando <strong>{fmtMoeda(resultados.prejuizo * 100)}</strong> no campo.
                           </p>
                       </div>
                   )}
                </div>

                {/* Nota Técnica */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex gap-3 items-start">
                  <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    <strong>Nota:</strong> Tolerância baseada em Embrapa (Soja: 60kg/ha, Milho: 90kg/ha). O cálculo assume peso médio de grãos padrão.
                  </p>
                </div>
             </div>

             {/* VISUAL IMPRESSÃO (Tabelas de Resultado) */}
             <div className="hidden print:block space-y-4">
                <TechnicalTable 
                  title="3. Diagnóstico de Perdas"
                  rows={[
                    { label: "Perda em Massa (kg)", value: resultados.kgHa.toFixed(2), unit: "kg/ha", isHeader: true },
                    { label: "Perda em Sacas (sc)", value: resultados.scHa.toFixed(2), unit: "sc/ha", isHeader: true },
                    { label: "Prejuízo Financeiro", value: fmtMoeda(resultados.prejuizo), unit: "/ha", isHeader: true },
                  ]}
                />
                
                <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 text-[10px] text-slate-600 text-justify leading-snug">
                   <strong>Status da Colheita:</strong> {resultados.isCritical ? "CRÍTICO - Acima do limite de tolerância." : "ACEITÁVEL - Dentro dos limites técnicos."} <br/>
                   Recomenda-se regulagem imediata da colhedora (velocidade do molinete, abertura das peneiras e ventilação) caso os valores estejam elevados.
                </div>
             </div>

            </div>
        </div>

      </div>
    </CalculatorLayout>
  );
}
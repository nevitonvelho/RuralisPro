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
  HelpCircle,
  ArrowDownRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CalculatorLayout } from "@/app/components/CalculatorLayout";

// Input Padronizado
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
        placeholder={placeholder}
        step={step}
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900 font-medium placeholder:text-slate-300"
      />
    </div>
  </div>
);

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

  // CONSTANTES (Peso médio por grão em gramas)
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
        // Contagem
        const pesoGrao = cultura === "soja" ? PMG_SOJA : PMG_MILHO;
        perdaGramasPorMetro = (medido * pesoGrao) / area;
    }

    // 2. Extrapolar para Hectare (10.000m²)
    // g/m² * 10.000 = g/ha -> dividir por 1000 = kg/ha
    const perdaKgHa = perdaGramasPorMetro * 10;
    
    // 3. Converter para Sacas (60kg)
    const perdaScHa = perdaKgHa / 60;

    // 4. Prejuízo Financeiro
    const prejuizoHa = perdaScHa * preco;

    // 5. Nível de Tolerância (Referência genérica Embrapa)
    // Soja: aceitável até 60kg/ha (1 sc)
    // Milho: aceitável até 90kg/ha (1.5 sc)
    const limiteAceitavel = cultura === "soja" ? 60 : 90;
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- INPUTS --- */}
        <div className="lg:col-span-7 space-y-6">
           
           {/* Seção 1: Parâmetros */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><LayoutGrid size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">1. Método de Aferição</h3>
                    <p className="text-xs text-slate-400">Defina o tipo de coleta</p>
                 </div>
              </div>

              {/* Toggle Cultura */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                  <button onClick={() => setCultura("soja")} className={`py-3 rounded-lg border text-sm font-bold flex justify-center items-center gap-2 ${cultura === 'soja' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-500 border-slate-200'}`}>
                      <div className="w-2 h-2 rounded-full bg-current"/> Soja
                  </button>
                  <button onClick={() => setCultura("milho")} className={`py-3 rounded-lg border text-sm font-bold flex justify-center items-center gap-2 ${cultura === 'milho' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-500 border-slate-200'}`}>
                      <div className="w-2 h-2 rounded-full bg-current"/> Milho
                  </button>
              </div>

              {/* Toggle Método */}
              <div className="bg-slate-100 p-1 rounded-lg flex mb-6">
                  <button onClick={() => setMetodo("contagem")} className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${metodo === 'contagem' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>
                      Contagem (Grãos)
                  </button>
                  <button onClick={() => setMetodo("pesagem")} className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${metodo === 'pesagem' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>
                      Pesagem (Gramas)
                  </button>
              </div>

              <div className="grid grid-cols-2 gap-5">
                 <InputGroup 
                    label="Área da Armação (m²)" 
                    icon={<LayoutGrid size={16}/>} 
                    value={areaArmacao} 
                    onChange={setAreaArmacao} 
                    placeholder="Ex: 1 (para 1x1m)" 
                 />
                 <InputGroup 
                    label={metodo === "contagem" ? "Total de Grãos Contados" : "Peso Coletado (g)"}
                    icon={metodo === "contagem" ? <Wheat size={16}/> : <Scale size={16}/>} 
                    value={valorMedido} 
                    onChange={setValorMedido} 
                    placeholder="0" 
                 />
              </div>
           </section>

           {/* Seção 2: Financeiro */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Coins size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">2. Impacto Financeiro</h3>
                    <p className="text-xs text-slate-400">Quanto custa deixar isso no chão?</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 gap-5">
                 <InputGroup label="Preço da Saca (R$)" icon={<span className="font-bold text-xs">R$</span>} value={precoSaca} onChange={setPrecoSaca} placeholder="Ex: 120.00" />
              </div>
           </section>
        </div>

        {/* --- RESULTADOS --- */}
        <div className="lg:col-span-5 relative">
            <div className="sticky top-10 print:static">

                 {/* OVERLAY BLOQUEIO */}
                 {!isAuthenticated && (
                   <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg h-full">
                      <div className="bg-slate-900 text-emerald-400 p-4 rounded-full mb-4 shadow-xl animate-pulse">
                         <Lock size={32} />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">Análise Bloqueada</h3>
                      <button 
                        onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 hover:scale-105"
                      >
                        Ver Perdas <ArrowRight size={16}/>
                      </button>
                   </div>
                 )}

                 <div className={`space-y-6 transition-all duration-500 ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>
                    
                    {/* Card Principal: PERDA EM SC */}
                    <div className="print-card bg-slate-900 text-white rounded-xl p-8 shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-emerald-400 font-bold uppercase tracking-wider text-xs">
                                    Perda Estimada
                                </p>
                                {resultados.isCritical ? (
                                    <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><AlertOctagon size={12}/> CRÍTICO</span>
                                ) : (
                                    <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><CheckCircle2 size={12}/> ACEITÁVEL</span>
                                )}
                            </div>
                            
                            <div className="flex items-end gap-3 my-6">
                                <span className="text-6xl font-black tracking-tighter text-white">
                                    {fmtNum(resultados.scHa)}
                                </span>
                                <div className="mb-2">
                                    <span className="text-xl font-medium text-slate-300 block">sc/ha</span>
                                </div>
                            </div>

                             {/* Barra de Tolerância */}
                             <div className="mt-4">
                                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                                    <span>0 sc</span>
                                    <span>Limite: {fmtNum(resultados.limite / 60)} sc</span>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden relative">
                                    {/* Marcador de Limite */}
                                    <div className="absolute left-1/3 top-0 bottom-0 w-0.5 bg-slate-600 z-10"></div>
                                    <div 
                                        style={{ width: `${Math.min((resultados.kgHa / (resultados.limite * 2)) * 100, 100)}%` }} 
                                        className={`h-full rounded-full transition-all duration-500 ${resultados.isCritical ? 'bg-red-500' : 'bg-emerald-500'}`}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card Secundário: PREJUÍZO (O mais doloroso) */}
                    <div className="print-card bg-white border border-red-100 rounded-xl p-6 shadow-lg relative overflow-hidden">
                         {/* Efeito de fundo */}
                         <div className="absolute -right-6 -top-6 text-red-50 opacity-50 rotate-12">
                             <Coins size={100} />
                         </div>

                        <div className="relative z-10">
                            <h4 className="font-bold text-red-600 text-sm flex items-center gap-2 mb-1">
                                <XCircle size={16}/> Prejuízo Financeiro
                            </h4>
                            <p className="text-[10px] text-slate-400 mb-4">Dinheiro deixado no campo por hectare</p>
                            
                            <span className="text-4xl font-black text-slate-900 tracking-tight">
                                {fmtMoeda(resultados.prejuizo)}
                            </span>
                            <span className="text-sm font-bold text-slate-400 ml-1">/ ha</span>

                            {resultados.prejuizo > 0 && (
                                <p className="text-xs text-red-500 mt-3 bg-red-50 p-2 rounded border border-red-100">
                                    Em 100 ha: <strong>{fmtMoeda(resultados.prejuizo * 100)}</strong> perdidos.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Dados Técnicos */}
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-xs flex justify-between items-center">
                         <span className="text-slate-500 font-bold uppercase">Volume Total</span>
                         <span className="font-mono font-bold text-slate-800">{fmtNum(resultados.kgHa)} kg/ha</span>
                    </div>

                 </div>
            </div>
        </div>

      </div>
    </CalculatorLayout>
  );
}
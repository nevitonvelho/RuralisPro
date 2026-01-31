"use client";

import { useState, useMemo } from "react";
import { 
  Leaf, 
  Package, 
  Scale, 
  ArrowRight, 
  Lock, 
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CalculatorLayout } from "@/app/components/CalculatorLayout";

// Input Padronizado
const InputGroup = ({ label, icon, value, onChange, placeholder = "0", step="1" }: any) => (
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

// Componente visual para barra de balanço NPK
const BalanceBar = ({ label, applied, target, unit = "kg" }: any) => {
    const percentage = target > 0 ? (applied / target) * 100 : 0;
    const diff = applied - target;
    const isDeficit = diff < -0.1;
    const isSurplus = diff > 0.1;
    
    // Limita a barra visualmente entre 0 e 150% para não quebrar o layout
    const visualWidth = Math.min(Math.max(percentage, 0), 150);

    return (
        <div className="mb-4 last:mb-0">
            <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-slate-700">{label}</span>
                <span className="text-slate-500">
                    Aplicado: <strong>{applied.toFixed(1)}</strong> / Meta: {target}
                </span>
            </div>
            <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden relative">
                {/* Marcador da Meta (100%) */}
                <div className="absolute left-[min(100%,_100%)] top-0 bottom-0 w-0.5 bg-slate-900 z-10" title="Meta Ideal"></div>
                
                <div 
                    style={{ width: `${visualWidth}%` }} 
                    className={`h-full rounded-full transition-all duration-500 ${
                        isDeficit ? 'bg-amber-400' : isSurplus ? 'bg-blue-500' : 'bg-emerald-500'
                    }`}
                ></div>
            </div>
            <div className="text-[10px] mt-1 text-right font-bold">
                {isDeficit && <span className="text-amber-600">Faltam {Math.abs(diff).toFixed(1)} {unit}</span>}
                {isSurplus && <span className="text-blue-600">Sobram {diff.toFixed(1)} {unit}</span>}
                {!isDeficit && !isSurplus && <span className="text-emerald-600">Balanceado</span>}
            </div>
        </div>
    );
};

export default function AdubacaoNPKPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // ESTADOS
  const [produtor, setProdutor] = useState("");
  const [talhao, setTalhao] = useState("");

  // Inputs: Recomendação (Meta)
  const [metaN, setMetaN] = useState<number | string>("");
  const [metaP, setMetaP] = useState<number | string>("");
  const [metaK, setMetaK] = useState<number | string>("");

  // Inputs: Adubo (Fórmula)
  const [formN, setFormN] = useState<number | string>("");
  const [formP, setFormP] = useState<number | string>("");
  const [formK, setFormK] = useState<number | string>("");

  // Lógica de Cálculo (Base)
  const [baseCalculo, setBaseCalculo] = useState<"N" | "P" | "K">("P");

  // CÁLCULOS
  const resultados = useMemo(() => {
    const mN = Number(metaN) || 0;
    const mP = Number(metaP) || 0;
    const mK = Number(metaK) || 0;

    const fN = Number(formN) || 0;
    const fP = Number(formP) || 0;
    const fK = Number(formK) || 0;

    let doseHa = 0;

    // Calcula a dose baseada na escolha do usuário
    if (baseCalculo === "N" && fN > 0) doseHa = (mN / fN) * 100;
    if (baseCalculo === "P" && fP > 0) doseHa = (mP / fP) * 100;
    if (baseCalculo === "K" && fK > 0) doseHa = (mK / fK) * 100;

    // O que está sendo aplicado de fato com essa dose
    const aplicadoN = (doseHa * fN) / 100;
    const aplicadoP = (doseHa * fP) / 100;
    const aplicadoK = (doseHa * fK) / 100;

    return {
        doseHa,
        sacosHa: doseHa / 50, // Sacos de 50kg
        aplicado: { N: aplicadoN, P: aplicadoP, K: aplicadoK },
        meta: { N: mN, P: mP, K: mK }
    };
  }, [metaN, metaP, metaK, formN, formP, formK, baseCalculo]);

  const shareText = `🚜 *Planejamento NPK*\n\n🎯 *Adubo:* ${formN}-${formP}-${formK}\n⚖️ *Dose Calculada:* ${resultados.doseHa.toFixed(0)} kg/ha\n📦 *Sacos (50kg):* ${resultados.sacosHa.toFixed(1)} sc/ha\n\n*Balanço Nutricional:*\nN: ${resultados.aplicado.N.toFixed(1)} kg (Meta: ${resultados.meta.N})\nP: ${resultados.aplicado.P.toFixed(1)} kg (Meta: ${resultados.meta.P})\nK: ${resultados.aplicado.K.toFixed(1)} kg (Meta: ${resultados.meta.K})`;

  return (
    <CalculatorLayout
      title="Adubação NPK"
      subtitle="Cálculo de dosagem e balanço nutricional de formulados."
      category="Nutrição de Plantas"
      icon={<Leaf size={16} />}
      produtor={produtor}
      setProdutor={setProdutor}
      talhao={talhao}
      setTalhao={setTalhao}
      shareText={shareText}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- INPUTS --- */}
        <div className="lg:col-span-7 space-y-6">
           
           {/* Seção 1: Recomendação */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><CheckCircle2 size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">1. Recomendação (Meta)</h3>
                    <p className="text-xs text-slate-400">Necessidade do solo em kg/ha</p>
                 </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                 <InputGroup label="N (Nitrogênio)" icon={<span className="font-black text-xs">N</span>} value={metaN} onChange={setMetaN} placeholder="0" />
                 <InputGroup label="P₂O₅ (Fósforo)" icon={<span className="font-black text-xs">P</span>} value={metaP} onChange={setMetaP} placeholder="0" />
                 <InputGroup label="K₂O (Potássio)" icon={<span className="font-black text-xs">K</span>} value={metaK} onChange={setMetaK} placeholder="0" />
              </div>
           </section>

           {/* Seção 2: Adubo */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Package size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">2. Adubo Escolhido</h3>
                    <p className="text-xs text-slate-400">Garantia do formulado (%)</p>
                 </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                 <InputGroup label="% N" icon={<span className="font-black text-xs">N</span>} value={formN} onChange={setFormN} placeholder="04" />
                 <InputGroup label="% P₂O₅" icon={<span className="font-black text-xs">P</span>} value={formP} onChange={setFormP} placeholder="14" />
                 <InputGroup label="% K₂O" icon={<span className="font-black text-xs">K</span>} value={formK} onChange={setFormK} placeholder="08" />
              </div>
              
              {/* Seletor de Base de Cálculo */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                     <Scale size={14}/> Calcular dose baseada em:
                  </label>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                      {["N", "P", "K"].map((item) => (
                          <button
                            key={item}
                            onClick={() => setBaseCalculo(item as any)}
                            className={`flex-1 py-2 rounded-md text-sm font-bold transition-all ${
                                baseCalculo === item 
                                ? 'bg-white text-emerald-600 shadow-sm' 
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            {item}
                          </button>
                      ))}
                  </div>
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
                      <h3 className="text-xl font-black text-slate-900 mb-2">Resultado Bloqueado</h3>
                      <button 
                        onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 hover:scale-105"
                      >
                        Desbloquear <ArrowRight size={16}/>
                      </button>
                   </div>
                 )}

                 <div className={`space-y-6 transition-all duration-500 ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>
                    
                    {/* Card Principal: DOSE */}
                    <div className="print-card bg-slate-900 text-white rounded-xl p-8 shadow-xl relative overflow-hidden">
                        {/* Background Effect */}
                        <div className="absolute top-0 right-0 p-16 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                        <div className="relative z-10">
                            <p className="text-emerald-400 font-bold uppercase tracking-wider text-xs mb-1">
                                Dose Necessária
                            </p>
                            <p className="text-slate-400 text-[10px] mb-4">
                                Para atingir a meta de <strong>{baseCalculo}</strong>
                            </p>

                            <div className="flex items-end gap-3 mb-6">
                                <span className="text-6xl font-black tracking-tighter text-white">
                                    {resultados.doseHa.toFixed(0)}
                                </span>
                                <div className="mb-2">
                                    <span className="text-xl font-medium text-slate-300 block">kg/ha</span>
                                </div>
                            </div>

                            <div className="bg-slate-800/50 rounded-lg p-3 flex items-center justify-between border border-slate-700">
                                <div className="flex items-center gap-2">
                                    <Package size={18} className="text-emerald-400"/>
                                    <span className="text-sm font-medium text-slate-300">Sacos de 50kg</span>
                                </div>
                                <span className="text-lg font-bold text-white">{resultados.sacosHa.toFixed(1)} <span className="text-xs text-slate-500 font-normal">sc/ha</span></span>
                            </div>
                        </div>
                    </div>

                    {/* Card Secundário: BALANÇO */}
                    <div className="print-card bg-white border border-slate-200 rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <RefreshCw size={18} className="text-blue-600"/> Balanço Final
                            </h3>
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded">Aplicado vs. Meta</span>
                        </div>

                        <div className="space-y-5">
                            <BalanceBar 
                                label="Nitrogênio (N)" 
                                applied={resultados.aplicado.N} 
                                target={resultados.meta.N} 
                            />
                            <BalanceBar 
                                label="Fósforo (P₂O₅)" 
                                applied={resultados.aplicado.P} 
                                target={resultados.meta.P} 
                            />
                            <BalanceBar 
                                label="Potássio (K₂O)" 
                                applied={resultados.aplicado.K} 
                                target={resultados.meta.K} 
                            />
                        </div>
                    </div>

                    {/* Alerta / Dica */}
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3 items-start no-print">
                        <AlertCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />
                        <div className="text-xs text-blue-800">
                            <span className="font-bold block mb-1">Interpretação:</span>
                            A dose foi calculada para suprir 100% da meta de <strong>{baseCalculo}</strong>. 
                            Verifique as barras de balanço acima para ver se faltou ou sobrou os outros nutrientes.
                        </div>
                    </div>

                 </div>
            </div>
        </div>

      </div>
    </CalculatorLayout>
  );
}
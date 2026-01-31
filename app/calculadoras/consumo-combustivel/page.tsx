"use client";

import { useState, useMemo } from "react";
import { 
  Fuel, 
  Timer, 
  Map, // Representando Área
  ArrowRight, 
  Lock, 
  Coins,
  Gauge, // Velocidade/Performance
  Settings,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CalculatorLayout } from "@/app/components/CalculatorLayout";

// Interface para as props do InputGroup
interface InputGroupProps {
  label: string;
  icon: React.ReactNode;
  value: string | number;
  onChange: (val: string) => void;
  placeholder?: string;
  step?: string;
  suffix?: string;
}

// Input Padronizado com tipagem
const InputGroup = ({ label, icon, value, onChange, placeholder = "0", step="0.1", suffix }: InputGroupProps) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors">
        {icon}
      </div>
      <input 
        type="number" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder}
        step={step}
        className="w-full pl-10 pr-12 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-slate-900 font-medium placeholder:text-slate-300"
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
            {suffix}
        </div>
      )}
    </div>
  </div>
);

export default function CombustivelMaquinarioPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // ESTADOS
  const [produtor, setProdutor] = useState("");
  const [talhao, setTalhao] = useState(""); // Máquina / Operação

  // INPUTS - OPERAÇÃO
  const [areaTrabalhada, setAreaTrabalhada] = useState<number | string>(""); // ha
  const [totalLitros, setTotalLitros] = useState<number | string>(""); // L
  const [totalHoras, setTotalHoras] = useState<number | string>(""); // h

  // INPUTS - FINANCEIRO E METAS
  const [precoDiesel, setPrecoDiesel] = useState<number | string>(""); // R$/L
  const [metaConsumo, setMetaConsumo] = useState<number | string>(""); // L/ha (Opcional)

  // CÁLCULOS
  const resultados = useMemo(() => {
    const area = Number(areaTrabalhada) || 0;
    const litros = Number(totalLitros) || 0;
    const horas = Number(totalHoras) || 0;
    const preco = Number(precoDiesel) || 0;
    const meta = Number(metaConsumo) || 0;

    // CORREÇÃO AQUI: Adicionado 'meta: 0' para manter consistência do tipo de retorno
    if (area === 0 || litros === 0) {
        return { 
            l_ha: 0, 
            l_h: 0, 
            ha_h: 0, 
            custoHa: 0, 
            totalGasto: 0, 
            desvio: 0, 
            status: 'neutral',
            meta: 0 
        };
    }

    // 1. Eficiência de Combustível (Consumo por Área)
    const l_ha = litros / area;

    // 2. Consumo Horário (Consumo por Tempo)
    const l_h = horas > 0 ? litros / horas : 0;

    // 3. Capacidade Operacional (Rendimento)
    const ha_h = horas > 0 ? area / horas : 0;

    // 4. Financeiro
    const totalGasto = litros * preco;
    const custoHa = totalGasto / area;

    // 5. Comparativo com Meta
    let desvio = 0;
    let status = 'neutral';
    
    if (meta > 0) {
        desvio = l_ha - meta; // Positivo = Gastou mais. Negativo = Economizou.
        if (desvio > 0) status = 'ruim';
        else if (desvio <= 0) status = 'bom';
    }

    return {
        l_ha,
        l_h,
        ha_h,
        custoHa,
        totalGasto,
        desvio,
        status,
        meta
    };
  }, [areaTrabalhada, totalLitros, totalHoras, precoDiesel, metaConsumo]);

  // FORMATAÇÃO
  const fmtMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(v);

  const shareText = `🚜 *Eficiência de Maquinário*\n\n⛽ *Consumo:* ${fmtNum(resultados.l_ha)} L/ha\n⏱️ *Rendimento:* ${fmtNum(resultados.ha_h)} ha/h\n💰 *Custo Diesel:* ${fmtMoeda(resultados.custoHa)} /ha\n\n📊 *Operação:* ${talhao || 'Geral'}`;

  return (
    <CalculatorLayout
      title="Consumo de Combustível"
      subtitle="Eficiência operacional, custo por hectare e desempenho de máquinas."
      category="Maquinário"
      icon={<Fuel size={16} />}
      produtor={produtor}
      setProdutor={setProdutor}
      talhao={talhao}
      setTalhao={setTalhao}
      shareText={shareText}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- INPUTS --- */}
        <div className="lg:col-span-7 space-y-6">
           
           {/* Seção 1: Dados da Operação */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-slate-100 text-slate-700 rounded-lg"><Settings size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">1. Dados da Operação</h3>
                    <p className="text-xs text-slate-400">Apontamento de campo</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <InputGroup label="Área Trabalhada" icon={<Map size={16}/>} value={areaTrabalhada} onChange={setAreaTrabalhada} placeholder="Ex: 50" suffix="ha" />
                 <InputGroup label="Total Litros Consumidos" icon={<Fuel size={16}/>} value={totalLitros} onChange={setTotalLitros} placeholder="Ex: 600" suffix="L" />
                 <InputGroup label="Horas Trabalhadas" icon={<Timer size={16}/>} value={totalHoras} onChange={setTotalHoras} placeholder="Ex: 12" suffix="h" />
              </div>
           </section>

           {/* Seção 2: Financeiro e Metas */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-amber-100 text-amber-700 rounded-lg"><Coins size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">2. Custos e Metas</h3>
                    <p className="text-xs text-slate-400">Para análise de eficiência</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <InputGroup label="Preço Diesel (R$/L)" icon={<Coins size={16}/>} value={precoDiesel} onChange={setPrecoDiesel} placeholder="Ex: 6.20" suffix="R$" />
                 <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                        Meta de Consumo (Opcional)
                    </label>
                    <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors">
                            <Gauge size={16} />
                        </div>
                        <input 
                            type="number" 
                            value={metaConsumo} 
                            onChange={(e) => setMetaConsumo(e.target.value)} 
                            placeholder="Ex: 12 (L/ha)"
                            className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-slate-900 font-medium placeholder:text-slate-400"
                        />
                         <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                            L/ha
                        </div>
                    </div>
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
                      <div className="bg-slate-900 text-amber-400 p-4 rounded-full mb-4 shadow-xl animate-pulse">
                         <Lock size={32} />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">Eficiência Bloqueada</h3>
                      <button 
                        onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-amber-600/20 transition-all flex items-center gap-2 hover:scale-105"
                      >
                        Ver Análise <ArrowRight size={16}/>
                      </button>
                   </div>
                 )}

                 <div className={`space-y-6 transition-all duration-500 ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>
                    
                    {/* Card Principal: L/HA */}
                    <div className="print-card bg-slate-900 text-white rounded-xl p-8 shadow-xl relative overflow-hidden">
                        {/* Background Effect */}
                        <div className="absolute top-0 right-0 p-16 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-amber-400 font-bold uppercase tracking-wider text-xs mb-1">
                                        Consumo por Área
                                    </p>
                                    <p className="text-slate-400 text-[10px] mb-6">
                                        Indicador principal de eficiência
                                    </p>
                                </div>
                                {/* Badge de Status */}
                                {resultados.status === 'bom' && <div className="bg-emerald-500 text-white p-1 rounded-full"><CheckCircle2 size={16}/></div>}
                                {resultados.status === 'ruim' && <div className="bg-red-500 text-white p-1 rounded-full"><AlertTriangle size={16}/></div>}
                            </div>

                            <div className="flex items-end gap-3 mb-4">
                                <span className="text-6xl font-black tracking-tighter text-white">
                                    {fmtNum(resultados.l_ha)}
                                </span>
                                <div className="mb-2">
                                    <span className="text-xl font-medium text-slate-300 block">L/ha</span>
                                </div>
                            </div>

                            {/* Comparativo com Meta */}
                            {resultados.meta > 0 && (
                                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 text-xs">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-slate-400">Meta: {fmtNum(resultados.meta)} L/ha</span>
                                        <span className={resultados.desvio > 0 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                                            {resultados.desvio > 0 ? `+${fmtNum(resultados.desvio)} L (Excesso)` : `${fmtNum(resultados.desvio)} L (Economia)`}
                                        </span>
                                    </div>
                                    {resultados.desvio > 0 && (
                                        <p className="text-[10px] text-red-300 mt-1">
                                            Atenção: Você está gastando <strong>{fmtMoeda(resultados.desvio * Number(precoDiesel))}</strong> a mais por hectare do que o planejado.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card Secundário: GRID DE OPERAÇÃO */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                             <div className="flex items-center gap-2 mb-2 text-slate-500">
                                <Timer size={16}/>
                                <span className="text-[10px] uppercase font-bold">Consumo Horário</span>
                             </div>
                             <p className="text-2xl font-black text-slate-800">{fmtNum(resultados.l_h)} <span className="text-xs font-normal text-slate-400">L/h</span></p>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                             <div className="flex items-center gap-2 mb-2 text-slate-500">
                                <Gauge size={16}/>
                                <span className="text-[10px] uppercase font-bold">Capacidade Op.</span>
                             </div>
                             <p className="text-2xl font-black text-slate-800">{fmtNum(resultados.ha_h)} <span className="text-xs font-normal text-slate-400">ha/h</span></p>
                        </div>
                    </div>

                    {/* Card Financeiro */}
                    <div className="print-card bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                             <div className="flex items-center gap-2">
                                <Coins className="text-amber-700" size={20}/>
                                <h4 className="font-bold text-amber-900 text-sm">Custo Combustível</h4>
                             </div>
                        </div>
                        
                        <div className="flex justify-between items-end border-b border-amber-200 pb-3 mb-3">
                             <span className="text-xs text-amber-800 font-medium">Custo por Hectare</span>
                             <span className="text-2xl font-black text-amber-700">{fmtMoeda(resultados.custoHa)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-amber-800">
                             <span>Total da Operação:</span>
                             <span className="font-bold">{fmtMoeda(resultados.totalGasto)}</span>
                        </div>
                    </div>

                 </div>
            </div>
        </div>

      </div>
    </CalculatorLayout>
  );
}
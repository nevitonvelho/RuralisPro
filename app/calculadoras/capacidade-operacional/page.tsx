"use client";

import { useState, useMemo } from "react";
import { 
  Tractor, 
  Timer, 
  ArrowRight, 
  Lock, 
  Gauge, 
  CalendarClock,
  Activity,
  Maximize,
  HelpCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CalculatorLayout } from "@/app/components/CalculatorLayout";

// Input Padronizado
const InputGroup = ({ label, icon, value, onChange, placeholder = "0", step="0.1", suffix }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
        {icon}
      </div>
      <input 
        type="number" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder}
        step={step}
        className="w-full pl-10 pr-12 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-slate-900 font-medium placeholder:text-slate-300"
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
            {suffix}
        </div>
      )}
    </div>
  </div>
);

export default function CapacidadeOperacionalPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // ESTADOS
  const [produtor, setProdutor] = useState("");
  const [talhao, setTalhao] = useState(""); // Operação

  // INPUTS - MÁQUINA
  const [velocidade, setVelocidade] = useState<number | string>(""); // km/h
  const [largura, setLargura] = useState<number | string>(""); // metros
  
  // INPUTS - EFICIÊNCIA
  const [eficiencia, setEficiencia] = useState<number | string>(75); // %

  // INPUTS - PLANEJAMENTO (Opcional)
  const [areaTotal, setAreaTotal] = useState<number | string>(""); // ha
  const [jornada, setJornada] = useState<number | string>(10); // horas/dia

  // CÁLCULOS
  const resultados = useMemo(() => {
    const vel = Number(velocidade) || 0;
    const larg = Number(largura) || 0;
    const efic = Number(eficiencia) || 0;
    const area = Number(areaTotal) || 0;
    const horasDia = Number(jornada) || 10;

    if (vel === 0 || larg === 0) return { cct: 0, cce: 0, horasTotais: 0, diasTotais: 0 };

    // 1. Capacidade de Campo Teórica (CCT)
    // (Velocidade km/h * Largura m) / 10
    const cct = (vel * larg) / 10;

    // 2. Capacidade de Campo Efetiva (CCE) - O que realmente faz
    const cce = cct * (efic / 100);

    // 3. Planejamento (Tempo para terminar)
    let horasTotais = 0;
    let diasTotais = 0;
    
    if (area > 0 && cce > 0) {
        horasTotais = area / cce;
        diasTotais = horasTotais / horasDia;
    }

    return {
        cct,
        cce,
        horasTotais,
        diasTotais
    };
  }, [velocidade, largura, eficiencia, areaTotal, jornada]);

  // PRESETS DE EFICIÊNCIA
  const setPreset = (val: number) => setEficiencia(val);

  // FORMATAÇÃO
  const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(v);

  const shareText = `🚜 *Planejamento Operacional*\n\n⚙️ *Config:* ${velocidade} km/h x ${largura}m\n📉 *Eficiência:* ${eficiencia}%\n\n✅ *Capacidade Real:* ${fmtNum(resultados.cce)} ha/h\n${resultados.diasTotais > 0 ? `📅 *Previsão:* ${fmtNum(resultados.diasTotais)} dias de trabalho` : ''}`;

  return (
    <CalculatorLayout
      title="Capacidade Operacional"
      subtitle="Cálculo de rendimento efetivo (ha/h) e planejamento de tempo."
      category="Maquinário"
      icon={<Tractor size={16} />}
      produtor={produtor}
      setProdutor={setProdutor}
      talhao={talhao}
      setTalhao={setTalhao}
      shareText={shareText}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- INPUTS --- */}
        <div className="lg:col-span-7 space-y-6">
           
           {/* Seção 1: Configuração da Máquina */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-slate-100 text-slate-700 rounded-lg"><Tractor size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">1. Configuração da Máquina</h3>
                    <p className="text-xs text-slate-400">Parâmetros de trabalho</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <InputGroup label="Velocidade (km/h)" icon={<Gauge size={16}/>} value={velocidade} onChange={setVelocidade} placeholder="Ex: 6.5" suffix="km/h" />
                 <InputGroup label="Largura Útil (m)" icon={<Maximize size={16}/>} value={largura} onChange={setLargura} placeholder="Ex: 12" suffix="m" />
              </div>
           </section>

           {/* Seção 2: Eficiência Operacional */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-orange-100 text-orange-700 rounded-lg"><Activity size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">2. Eficiência de Campo (%)</h3>
                    <p className="text-xs text-slate-400">Tempo real trabalhado (descontando manobras/abastecimento)</p>
                 </div>
              </div>

              {/* Presets */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                  <button onClick={() => setPreset(65)} className={`p-2 rounded border text-xs font-bold transition-all ${eficiencia == 65 ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-50 text-slate-500'}`}>
                      Plantio (65%)
                  </button>
                  <button onClick={() => setPreset(75)} className={`p-2 rounded border text-xs font-bold transition-all ${eficiencia == 75 ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-50 text-slate-500'}`}>
                      Colheita (75%)
                  </button>
                  <button onClick={() => setPreset(55)} className={`p-2 rounded border text-xs font-bold transition-all ${eficiencia == 55 ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-50 text-slate-500'}`}>
                      Pulverização (55%)
                  </button>
              </div>

              <div className="grid grid-cols-1 gap-5">
                 <InputGroup label="Eficiência Personalizada (%)" icon={<Activity size={16}/>} value={eficiencia} onChange={setEficiencia} placeholder="Ex: 70" suffix="%" />
              </div>
           </section>

           {/* Seção 3: Planejamento (Opcional) */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><CalendarClock size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">3. Planejamento (Opcional)</h3>
                    <p className="text-xs text-slate-400">Estimar tempo de término</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <InputGroup label="Área Total (ha)" icon={<Maximize size={16}/>} value={areaTotal} onChange={setAreaTotal} placeholder="Ex: 200" suffix="ha" />
                 <InputGroup label="Jornada (horas/dia)" icon={<Timer size={16}/>} value={jornada} onChange={setJornada} placeholder="Ex: 10" suffix="h" />
              </div>
           </section>
        </div>

        {/* --- RESULTADOS --- */}
        <div className="lg:col-span-5 relative">
            <div className="sticky top-10 print:static">

                 {/* OVERLAY BLOQUEIO */}
                 {!isAuthenticated && (
                   <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg h-full">
                      <div className="bg-slate-900 text-orange-400 p-4 rounded-full mb-4 shadow-xl animate-pulse">
                         <Lock size={32} />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">Cálculo Bloqueado</h3>
                      <button 
                        onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-orange-600/20 transition-all flex items-center gap-2 hover:scale-105"
                      >
                        Ver Rendimento <ArrowRight size={16}/>
                      </button>
                   </div>
                 )}

                 <div className={`space-y-6 transition-all duration-500 ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>
                    
                    {/* Card Principal: RENDIMENTO EFETIVO */}
                    <div className="print-card bg-slate-900 text-white rounded-xl p-8 shadow-xl relative overflow-hidden">
                        {/* Background Effect */}
                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl -mr-10 -mb-10 pointer-events-none"></div>

                        <div className="relative z-10">
                            <p className="text-orange-400 font-bold uppercase tracking-wider text-xs mb-1">
                                Capacidade Operacional
                            </p>
                            <p className="text-slate-400 text-[10px] mb-6">
                                Rendimento real considerando eficiência
                            </p>

                            <div className="flex items-end gap-3 mb-8">
                                <span className="text-6xl font-black tracking-tighter text-white">
                                    {fmtNum(resultados.cce)}
                                </span>
                                <div className="mb-2">
                                    <span className="text-xl font-medium text-slate-300 block">ha/h</span>
                                </div>
                            </div>

                            {/* Barra de Comparação (Teórico vs Real) */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold">
                                    <span>Real: {fmtNum(resultados.cce)} ha/h</span>
                                    <span>Potencial: {fmtNum(resultados.cct)} ha/h</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden relative border border-slate-700">
                                    {/* Barra de Potencial (Transparente/Cinza) */}
                                    <div className="absolute inset-0 w-full bg-slate-700/30"></div>
                                    {/* Barra Real */}
                                    <div 
                                        className="h-full bg-orange-500 transition-all duration-700"
                                        style={{ width: `${Number(eficiencia) > 100 ? 100 : eficiencia}%` }}
                                    ></div>
                                </div>
                                <p className="text-[10px] text-slate-500 text-right">
                                    A máquina está operando a {eficiencia}% do seu potencial teórico.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Card Secundário: LOGÍSTICA DE TEMPO */}
                    {resultados.horasTotais > 0 ? (
                        <div className="print-card bg-white border border-slate-200 rounded-xl p-6 shadow-lg relative">
                             <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
                                <CalendarClock className="text-blue-600" size={20}/>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">Tempo Estimado</h4>
                                    <p className="text-[10px] text-slate-400">Para finalizar {areaTotal} ha</p>
                                </div>
                             </div>

                             <div className="grid grid-cols-2 gap-4 text-center">
                                 <div>
                                     <span className="block text-3xl font-black text-slate-900">{Math.ceil(resultados.diasTotais)}</span>
                                     <span className="text-[10px] text-slate-500 font-bold uppercase">Dias de Trabalho</span>
                                 </div>
                                 <div>
                                     <span className="block text-3xl font-black text-slate-900">{Math.ceil(resultados.horasTotais)}</span>
                                     <span className="text-[10px] text-slate-500 font-bold uppercase">Horas Totais</span>
                                 </div>
                             </div>
                             
                             <div className="mt-4 bg-blue-50 p-2 rounded text-center text-xs text-blue-800">
                                 Baseado em jornada de {jornada}h/dia.
                             </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center text-slate-400 gap-2">
                             <CalendarClock size={24} />
                             <p className="text-xs">Preencha a "Área Total" para calcular a previsão de término.</p>
                        </div>
                    )}

                 </div>
            </div>
        </div>

      </div>
    </CalculatorLayout>
  );
}
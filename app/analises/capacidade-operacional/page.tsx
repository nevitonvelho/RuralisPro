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
  ClipboardList,
  Info,
  Settings2,
  Clock
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CalculatorLayout } from "@/app/components/CalculatorLayout";

// --- COMPONENTES VISUAIS ---

// 1. INPUTS (Padrão Unificado)
const InputGroup = ({ label, icon, value, onChange, placeholder = "0", suffix }: any) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex justify-between items-end">
        <label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1.5">
        {label}
        </label>
    </div>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors font-bold text-sm">
        {icon}
      </div>
      <input 
        type="number" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder}
        step="0.1"
        onWheel={(e) => e.currentTarget.blur()}
        className="w-full pl-9 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-slate-900 font-semibold placeholder:text-slate-300 shadow-sm"
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
            {suffix}
        </div>
      )}
    </div>
  </div>
);

// 2. TABELA TÉCNICA (Impressão)
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

    // 1. CCT: (Vel km/h * Larg m) / 10
    const cct = (vel * larg) / 10;

    // 2. CCE: cct * eficiencia%
    const cce = cct * (efic / 100);

    // 3. Planejamento
    let horasTotais = 0;
    let diasTotais = 0;
    
    if (area > 0 && cce > 0) {
        horasTotais = area / cce;
        diasTotais = horasTotais / horasDia;
    }

    return { cct, cce, horasTotais, diasTotais };
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
        
        {/* --- COLUNA ESQUERDA: INPUTS --- */}
        <div className="lg:col-span-7 space-y-6 print:space-y-4">
           
           {/* Seção 1: Configuração da Máquina */}
           <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center shadow-sm border border-slate-200">
                     <Settings2 size={20} />
                 </div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">Parâmetros da Máquina</h3>
                    <p className="text-xs text-slate-400 font-medium">Configuração de trabalho</p>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <InputGroup label="Velocidade" icon={<Gauge size={14}/>} value={velocidade} onChange={setVelocidade} placeholder="0.0" suffix="km/h" />
                 <InputGroup label="Largura Útil" icon={<Maximize size={14}/>} value={largura} onChange={setLargura} placeholder="0.0" suffix="m" />
              </div>
           </section>

           {/* Visual Impressão (Tabela 1) */}
           <div className="hidden print:block">
             <TechnicalTable 
                title="1. Configuração do Equipamento"
                rows={[
                  { label: "Velocidade de Trabalho", value: Number(velocidade).toFixed(1), unit: "km/h" },
                  { label: "Largura da Faixa", value: Number(largura).toFixed(2), unit: "m" },
                ]}
             />
           </div>

           {/* Seção 2: Eficiência Operacional */}
           <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shadow-sm border border-orange-200">
                     <Activity size={20} />
                 </div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">Eficiência de Campo</h3>
                    <p className="text-xs text-slate-400 font-medium">Tempo real trabalhado (descontando paradas)</p>
                 </div>
              </div>

              {/* Presets */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                 {[
                    { label: "Pulverização", val: 55 },
                    { label: "Plantio", val: 65 },
                    { label: "Colheita", val: 75 }
                 ].map((preset) => (
                    <button 
                        key={preset.label}
                        onClick={() => setPreset(preset.val)} 
                        className={`
                            py-2 px-1 rounded-lg border text-[10px] font-bold uppercase tracking-wide transition-all
                            ${Number(eficiencia) === preset.val 
                                ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20' 
                                : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-white hover:border-slate-300'
                            }
                        `}
                    >
                        {preset.label} ({preset.val}%)
                    </button>
                 ))}
              </div>

              <div className="grid grid-cols-1 gap-4">
                 <InputGroup label="Eficiência Personalizada" icon="%" value={eficiencia} onChange={setEficiencia} placeholder="Ex: 75" suffix="%" />
              </div>
           </section>

           {/* Visual Impressão (Tabela 2) */}
           <div className="hidden print:block">
             <TechnicalTable 
                title="2. Fator de Eficiência"
                rows={[
                  { label: "Eficiência Considerada", value: Number(eficiencia).toFixed(0), unit: "%" },
                ]}
             />
           </div>

           {/* Seção 3: Planejamento (Logística) */}
           <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center shadow-sm border border-blue-200">
                     <CalendarClock size={20} />
                 </div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">Logística (Opcional)</h3>
                    <p className="text-xs text-slate-400 font-medium">Para estimar previsão de término</p>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <InputGroup label="Área Total" icon={<Maximize size={14}/>} value={areaTotal} onChange={setAreaTotal} placeholder="0" suffix="ha" />
                 <InputGroup label="Jornada Diária" icon={<Clock size={14}/>} value={jornada} onChange={setJornada} placeholder="10" suffix="h" />
              </div>
           </section>
        </div>

        {/* --- COLUNA DIREITA: RESULTADOS --- */}
        <div className="lg:col-span-5 relative">
            <div className="sticky top-6 print:static space-y-6">

             {/* OVERLAY DE BLOQUEIO */}
             {!isAuthenticated && (
               <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200 shadow-lg h-full print:hidden">
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

             <div className={`space-y-6 transition-all duration-500 print:hidden ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>
                
                {/* Card Principal: RENDIMENTO (Escuro) */}
                <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                   {/* Background Effect */}
                   <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-500 rounded-full blur-[100px] opacity-20 -mr-16 -mb-16 pointer-events-none"></div>

                   <div className="relative z-10">
                       <div className="flex justify-between items-start mb-6">
                         <div>
                            <p className="text-orange-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                                Capacidade Operacional
                            </p>
                            <h4 className="font-bold text-lg text-white">Rendimento Efetivo</h4>
                         </div>
                         <div className="bg-slate-800 p-2 rounded-lg text-slate-300 border border-slate-700">
                             <Tractor size={20} />
                         </div>
                       </div>
                       
                       <div className="flex items-baseline gap-2 mb-8">
                          <span className="text-6xl font-black tracking-tighter text-white">{fmtNum(resultados.cce)}</span>
                          <span className="text-xl font-medium text-slate-400">ha/h</span>
                       </div>

                       {/* Barra de Eficiência Visual */}
                       <div className="space-y-2">
                           <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400">
                               <span>Real ({Number(eficiencia)}%)</span>
                               <span>Potencial Teórico</span>
                           </div>
                           <div className="h-3 bg-slate-800 rounded-full overflow-hidden relative border border-slate-700">
                               {/* Barra Teórica (Fundo) */}
                               <div className="absolute inset-0 bg-slate-700/20 w-full" title="Capacidade Teórica"></div>
                               {/* Barra Real (Fill) */}
                               <div 
                                   className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full"
                                   style={{ width: `${Math.min(Number(eficiencia), 100)}%` }}
                               ></div>
                           </div>
                           <p className="text-[10px] text-slate-500 text-right mt-1">
                               Teórico: {fmtNum(resultados.cct)} ha/h
                           </p>
                       </div>
                   </div>
                </div>

                {/* Card Secundário: TEMPO */}
                {resultados.horasTotais > 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg shadow-slate-200/50 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-50 p-1.5 rounded-lg text-blue-600">
                                    <Clock size={16} />
                                </div>
                                <h4 className="font-bold text-slate-800">Estimativa de Tempo</h4>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-center divide-x divide-slate-100">
                            <div>
                                <span className="block text-3xl font-black text-slate-900">{fmtNum(resultados.diasTotais)}</span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Dias de Trabalho</span>
                            </div>
                            <div>
                                <span className="block text-3xl font-black text-slate-900">{Math.ceil(resultados.horasTotais)}</span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Horas Totais</span>
                            </div>
                        </div>
                        
                        <div className="mt-4 bg-slate-50 p-3 rounded-lg flex gap-2 items-start border border-slate-100">
                            <Info size={14} className="text-slate-400 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-slate-500 leading-snug">
                                Cálculo considera jornada de <strong>{jornada}h</strong>. Não inclui dias parados por chuva ou manutenção.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center text-slate-400 gap-3">
                        <div className="p-3 bg-slate-100 rounded-full">
                            <CalendarClock size={24} className="text-slate-300" />
                        </div>
                        <p className="text-xs font-medium">Preencha a "Área Total" para ver a previsão de término.</p>
                    </div>
                )}
             </div>

             {/* VISUAL IMPRESSÃO (Tabelas de Resultado) */}
             <div className="hidden print:block space-y-4">
                <TechnicalTable 
                  title="3. Resultados Operacionais"
                  rows={[
                    { label: "Capacidade Teórica (CCT)", value: resultados.cct.toFixed(2), unit: "ha/h" },
                    { label: "Capacidade Efetiva (CCE)", value: resultados.cce.toFixed(2), unit: "ha/h", isHeader: true },
                    { label: "Tempo Total Estimado", value: resultados.horasTotais > 0 ? resultados.horasTotais.toFixed(1) : "-", unit: "horas" },
                    { label: "Dias de Serviço", value: resultados.diasTotais > 0 ? resultados.diasTotais.toFixed(1) : "-", unit: "dias" },
                  ]}
                />
                
                <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 text-[10px] text-slate-600 text-justify leading-snug">
                   <strong>Nota Técnica:</strong> A eficiência de campo ({eficiencia}%) impacta diretamente o rendimento e o custo operacional. Valores baixos indicam excesso de manobras, abastecimentos lentos ou terrenos irregulares.
                </div>
             </div>

            </div>
        </div>

      </div>
    </CalculatorLayout>
  );
}
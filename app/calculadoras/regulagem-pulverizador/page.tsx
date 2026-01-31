"use client";

import { useState, useMemo } from "react";
import { 
  Droplets, // Pulverização
  Gauge, 
  ArrowRight, 
  Lock, 
  FlaskConical,
  Target,
  AlertTriangle,
  Scale
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CalculatorLayout } from "@/app/components/CalculatorLayout";

// Input Padronizado
const InputGroup = ({ label, icon, value, onChange, placeholder = "0", step="1", suffix }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors">
        {icon}
      </div>
      <input 
        type="number" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder}
        step={step}
        className="w-full pl-10 pr-12 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-slate-900 font-medium placeholder:text-slate-300"
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
            {suffix}
        </div>
      )}
    </div>
  </div>
);

export default function RegulagemPulverizadorPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // ESTADOS
  const [produtor, setProdutor] = useState("");
  const [talhao, setTalhao] = useState("");

  // INPUTS - MÁQUINA
  const [velocidade, setVelocidade] = useState<number | string>(""); // km/h
  const [espacamento, setEspacamento] = useState<number | string>("50"); // cm (padrão)
  
  // INPUTS - CALIBRAÇÃO (JARRA)
  const [coletaMl, setColetaMl] = useState<number | string>(""); // ml/min (coletado no copo)

  // INPUTS - META E TANQUE
  const [metaVolume, setMetaVolume] = useState<number | string>(""); // L/ha (Desejado)
  const [capacidadeTanque, setCapacidadeTanque] = useState<number | string>(""); // Litros
  const [custoCalda, setCustoCalda] = useState<number | string>(""); // R$/ha (Opcional - Custo dos produtos)

  // CÁLCULOS
  const resultados = useMemo(() => {
    const vel = Number(velocidade) || 0;
    const esp = Number(espacamento) || 0;
    const ml = Number(coletaMl) || 0;
    const meta = Number(metaVolume) || 0;
    const tanque = Number(capacidadeTanque) || 0;
    const custo = Number(custoCalda) || 0;

    if (vel === 0 || esp === 0 || ml === 0) return { l_ha: 0, autonomia: 0, desvio: 0, perdaFinanceira: 0, status: 'neutral' };

    // 1. Converter ml/min para L/min
    const l_min = ml / 1000;

    // 2. Fórmula Universal de Pulverização
    // Volume (L/ha) = (L/min * 60.000) / (km/h * espaçamento cm)
    const l_ha = (l_min * 60000) / (vel * esp);

    // 3. Autonomia do Tanque (ha)
    const autonomia = l_ha > 0 ? tanque / l_ha : 0;

    // 4. Análise de Desvio (Meta vs Real)
    let desvio = 0; // %
    let perdaFinanceira = 0;
    let status = 'ok';

    if (meta > 0) {
        // Desvio percentual
        desvio = ((l_ha - meta) / meta) * 100;
        
        // Se estiver aplicando a mais (overdose), calcula perda
        if (desvio > 0 && custo > 0) {
            perdaFinanceira = custo * (desvio / 100);
        }

        if (Math.abs(desvio) > 10) status = 'danger'; // +/- 10% erro
        else if (Math.abs(desvio) > 5) status = 'warning'; // +/- 5% erro
    }

    return {
        l_ha,
        autonomia,
        desvio,
        perdaFinanceira,
        status
    };
  }, [velocidade, espacamento, coletaMl, metaVolume, capacidadeTanque, custoCalda]);

  // FORMATAÇÃO
  const fmtMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(v);

  const shareText = `💧 *Regulagem de Pulverizador*\n\n⚙️ *Config:* ${velocidade} km/h | Bico: ${coletaMl} ml/min\n📊 *Taxa Real:* ${fmtNum(resultados.l_ha)} L/ha\n🎯 *Meta:* ${metaVolume || '-'} L/ha\n\n🚜 *Autonomia:* ${fmtNum(resultados.autonomia)} ha/tanque`;

  return (
    <CalculatorLayout
      title="Regulagem de Pulverizador"
      subtitle="Calibração de pontas, volume de calda (L/ha) e autonomia."
      category="Maquinário"
      icon={<Droplets size={16} />}
      produtor={produtor}
      setProdutor={setProdutor}
      talhao={talhao}
      setTalhao={setTalhao}
      shareText={shareText}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- INPUTS --- */}
        <div className="lg:col-span-7 space-y-6">
           
           {/* Seção 1: Parâmetros de Campo */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-slate-100 text-slate-700 rounded-lg"><Gauge size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">1. Parâmetros de Campo</h3>
                    <p className="text-xs text-slate-400">Velocidade e configuração da barra</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <InputGroup label="Velocidade (km/h)" icon={<Gauge size={16}/>} value={velocidade} onChange={setVelocidade} placeholder="Ex: 18" suffix="km/h" />
                 <InputGroup label="Espaçamento entre Bicos" icon={<Scale size={16}/>} value={espacamento} onChange={setEspacamento} placeholder="Ex: 50" suffix="cm" />
              </div>
           </section>

           {/* Seção 2: Teste de Vazão (Jarra) */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-cyan-100 text-cyan-700 rounded-lg"><FlaskConical size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">2. Calibração (Teste da Jarra)</h3>
                    <p className="text-xs text-slate-400">Colete a água de 1 bico por 1 minuto</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <InputGroup label="Volume Coletado (1 min)" icon={<Droplets size={16}/>} value={coletaMl} onChange={setColetaMl} placeholder="Ex: 800" suffix="ml" />
              </div>
           </section>

           {/* Seção 3: Planejamento (Opcional) */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><Target size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">3. Metas e Custos</h3>
                    <p className="text-xs text-slate-400">Para análise de eficiência</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                 <InputGroup label="Meta de Volume" icon={<Target size={16}/>} value={metaVolume} onChange={setMetaVolume} placeholder="Ex: 100" suffix="L/ha" />
                 <InputGroup label="Capacidade Tanque" icon={<FlaskConical size={16}/>} value={capacidadeTanque} onChange={setCapacidadeTanque} placeholder="Ex: 2000" suffix="L" />
                 <InputGroup label="Custo Prod. Químico" icon={<Scale size={16}/>} value={custoCalda} onChange={setCustoCalda} placeholder="Ex: 350" suffix="R$/ha" />
              </div>
           </section>
        </div>

        {/* --- RESULTADOS --- */}
        <div className="lg:col-span-5 relative">
            <div className="sticky top-10 print:static">

                 {/* OVERLAY BLOQUEIO */}
                 {!isAuthenticated && (
                   <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg h-full">
                      <div className="bg-slate-900 text-cyan-400 p-4 rounded-full mb-4 shadow-xl animate-pulse">
                         <Lock size={32} />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">Calibração Bloqueada</h3>
                      <button 
                        onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-cyan-600/20 transition-all flex items-center gap-2 hover:scale-105"
                      >
                        Ver Resultado <ArrowRight size={16}/>
                      </button>
                   </div>
                 )}

                 <div className={`space-y-6 transition-all duration-500 ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>
                    
                    {/* Card Principal: VOLUME DE CALDA */}
                    <div className="print-card bg-slate-900 text-white rounded-xl p-8 shadow-xl relative overflow-hidden">
                        {/* Background Effect */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                        <div className="relative z-10 text-center">
                            <p className="text-cyan-400 font-bold uppercase tracking-wider text-xs mb-4">
                                Volume de Aplicação
                            </p>
                            
                            {/* Visual Drop Icon */}
                            <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 text-cyan-400 mb-4 animate-pulse">
                                <Droplets size={32} fill="currentColor" className="opacity-50"/>
                            </div>

                            <div className="relative inline-block mb-4">
                                <span className="text-6xl font-black tracking-tighter text-white">
                                    {fmtNum(resultados.l_ha)}
                                </span>
                                <span className="text-xl font-medium text-slate-300 ml-2">L/ha</span>
                            </div>

                            {/* Alerta de Desvio */}
                            {resultados.desvio !== 0 && (
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${resultados.status === 'danger' ? 'bg-red-500/20 border-red-500 text-red-200' : resultados.status === 'warning' ? 'bg-amber-500/20 border-amber-500 text-amber-200' : 'bg-emerald-500/20 border-emerald-500 text-emerald-200'}`}>
                                    {resultados.status !== 'ok' && <AlertTriangle size={12}/>}
                                    <span>
                                        {resultados.desvio > 0 ? `+${fmtNum(resultados.desvio)}% (Sobredose)` : `${fmtNum(resultados.desvio)}% (Subdose)`}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card Secundário: CUSTO DO ERRO */}
                    {resultados.perdaFinanceira > 0 && (
                        <div className="print-card bg-red-50 border border-red-200 rounded-xl p-6 shadow-lg animate-in fade-in slide-in-from-bottom-4">
                             <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-red-100 text-red-600 rounded-full">
                                    <AlertTriangle size={20}/>
                                </div>
                                <h4 className="font-bold text-red-900 text-sm">Custo do Desperdício</h4>
                             </div>
                             
                             <p className="text-xs text-red-800 mb-4 leading-relaxed">
                                Você está aplicando <strong>{fmtNum(resultados.desvio)}%</strong> a mais de produto do que o necessário.
                             </p>

                             <div className="border-t border-red-200 pt-4 flex justify-between items-center">
                                 <span className="text-xs text-red-700 font-bold uppercase">Prejuízo por Hectare</span>
                                 <span className="text-2xl font-black text-red-700">{fmtMoeda(resultados.perdaFinanceira)}</span>
                             </div>
                        </div>
                    )}

                    {/* Card Terciário: LOGÍSTICA */}
                    {resultados.autonomia > 0 && (
                        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <FlaskConical className="text-slate-400" size={18}/>
                                    <span className="text-xs font-bold text-slate-600 uppercase">Logística</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-3xl font-black text-slate-800">{fmtNum(resultados.autonomia)}</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Hectares por Tanque</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-cyan-600">1 Tanque = {capacidadeTanque} L</p>
                                </div>
                            </div>
                        </div>
                    )}

                 </div>
            </div>
        </div>

      </div>
    </CalculatorLayout>
  );
}
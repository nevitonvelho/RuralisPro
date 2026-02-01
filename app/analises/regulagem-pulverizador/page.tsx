"use client";

import { useState, useMemo } from "react";
import { 
  Droplets, 
  Gauge, 
  ArrowRight, 
  Lock, 
  FlaskConical,
  Target,
  AlertTriangle,
  Scale,
  ClipboardList,
  Info
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CalculatorLayout } from "@/app/components/CalculatorLayout";

// --- COMPONENTES AUXILIARES ---

const TechnicalTable = ({ title, rows }: { title: string; rows: any[] }) => {
  if (!rows || rows.length === 0) return null;
  return (
    <div className="mt-4 mb-6 border border-black rounded-lg overflow-hidden avoid-break shadow-none break-inside-avoid">
      <div className="bg-slate-200 border-b border-black p-2 flex justify-between items-center">
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
        onWheel={(e) => e.currentTarget.blur()}
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

  const [produtor, setProdutor] = useState("");
  const [talhao, setTalhao] = useState("");
  const [velocidade, setVelocidade] = useState<number | string>(""); 
  const [espacamento, setEspacamento] = useState<number | string>("50"); 
  const [coletaMl, setColetaMl] = useState<number | string>(""); 
  const [metaVolume, setMetaVolume] = useState<number | string>(""); 
  const [capacidadeTanque, setCapacidadeTanque] = useState<number | string>(""); 
  const [custoCalda, setCustoCalda] = useState<number | string>(""); 

  const fmtMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(v);

  const resultados = useMemo(() => {
    const vel = Number(velocidade) || 0;
    const esp = Number(espacamento) || 0;
    const ml = Number(coletaMl) || 0;
    const meta = Number(metaVolume) || 0;
    const tanque = Number(capacidadeTanque) || 0;
    const custo = Number(custoCalda) || 0;

    if (vel === 0 || esp === 0 || ml === 0) return { l_ha: 0, autonomia: 0, desvio: 0, perdaFinanceira: 0, status: 'neutral', rowsResumo: [] };

    const l_min = ml / 1000;
    const l_ha = (l_min * 60000) / (vel * esp);
    const autonomia = l_ha > 0 ? tanque / l_ha : 0;

    let desvio = 0;
    let perdaFinanceira = 0;
    let status = 'ok';

    if (meta > 0) {
        desvio = ((l_ha - meta) / meta) * 100;
        if (desvio > 0 && custo > 0) perdaFinanceira = custo * (desvio / 100);
        if (Math.abs(desvio) > 10) status = 'danger';
        else if (Math.abs(desvio) > 5) status = 'warning';
    }

    return {
        l_ha,
        autonomia,
        desvio,
        perdaFinanceira,
        status,
        rowsResumo: [
            { "Item": "Velocidade", "Valor": `${vel} km/h` },
            { "Item": "Vazão do Bico", "Valor": `${ml} ml/min` },
            { "Item": "Volume Aplicado", "Valor": `${fmtNum(l_ha)} L/ha` },
            { "Item": "Desvio da Meta", "Valor": `${fmtNum(desvio)}%` },
            { "Item": "Autonomia Tanque", "Valor": `${fmtNum(autonomia)} ha` }
        ]
    };
  }, [velocidade, espacamento, coletaMl, metaVolume, capacidadeTanque, custoCalda]);

  const shareText = `💧 *Regulagem de Pulverizador*\n\n⚙️ *Config:* ${velocidade} km/h | Bico: ${coletaMl} ml/min\n📊 *Taxa Real:* ${fmtNum(resultados.l_ha)} L/ha\n🎯 *Meta:* ${metaVolume || '-'} L/ha`;

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
        
        <div className="lg:col-span-7 space-y-6">
           <div className="print:hidden space-y-6">
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

               <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                     <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><Target size={20} /></div>
                     <div>
                        <h3 className="font-bold text-lg text-slate-800">3. Metas e Custos</h3>
                        <p className="text-xs text-slate-400">Para análise de eficiência e desperdício</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                     <InputGroup label="Meta de Volume" icon={<Target size={16}/>} value={metaVolume} onChange={setMetaVolume} placeholder="Ex: 100" suffix="L/ha" />
                     <InputGroup label="Capacidade Tanque" icon={<FlaskConical size={16}/>} value={capacidadeTanque} onChange={setCapacidadeTanque} placeholder="Ex: 2000" suffix="L" />
                     <InputGroup label="Custo da Calda" icon={<Scale size={16}/>} value={custoCalda} onChange={setCustoCalda} placeholder="Ex: 350" suffix="R$/ha" />
                  </div>
               </section>
           </div>

           <div className="hidden print:block">
               <TechnicalTable title="Relatório de Calibração de Pulverização" rows={resultados.rowsResumo} />
           </div>
        </div>

        <div className="lg:col-span-5 relative">
            <div className="sticky top-10 print:static">
                 {!isAuthenticated && (
                   <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg h-full print:hidden">
                      <div className="bg-slate-900 text-cyan-400 p-4 rounded-full mb-4 shadow-xl animate-pulse">
                         <Lock size={32} />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">Acesso Restrito</h3>
                      <button onClick={() => (document.getElementById("modal_auth") as any)?.showModal()} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-cyan-600/20 transition-all flex items-center gap-2">
                        Ver Calibração <ArrowRight size={16}/>
                      </button>
                    </div>
                 )}

                 <div className={`space-y-6 transition-all duration-500 print:hidden ${!isAuthenticated ? 'opacity-40 filter blur-sm select-none' : ''}`}>
                    <div className="print-card bg-slate-900 text-white rounded-xl p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                        <div className="relative z-10 text-center">
                            <p className="text-cyan-400 font-bold uppercase tracking-wider text-xs mb-4">Volume de Aplicação Real</p>
                            <div className="relative inline-block mb-4">
                                <span className="text-6xl font-black tracking-tighter text-white">{fmtNum(resultados.l_ha)}</span>
                                <span className="text-xl font-medium text-slate-300 ml-2">L/ha</span>
                            </div>

                            {resultados.desvio !== 0 && (
                                <div className={`block mt-2 px-3 py-1.5 rounded-full border text-xs font-bold ${resultados.status === 'danger' ? 'bg-red-500/20 border-red-500 text-red-200' : resultados.status === 'warning' ? 'bg-amber-500/20 border-amber-500 text-amber-200' : 'bg-emerald-500/20 border-emerald-500 text-emerald-200'}`}>
                                    {resultados.desvio > 0 ? `SOBREDOSE: +${fmtNum(resultados.desvio)}%` : `SUBDOSE: ${fmtNum(resultados.desvio)}%`}
                                </div>
                            )}
                        </div>
                    </div>

                    {resultados.perdaFinanceira > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-lg">
                             <div className="flex justify-between items-center mb-2 text-red-900">
                                <span className="text-xs font-bold uppercase">Prejuízo Estimado</span>
                                <AlertTriangle size={18}/>
                             </div>
                             <p className="text-2xl font-black text-red-700">{fmtMoeda(resultados.perdaFinanceira)}<span className="text-xs ml-1">/ha</span></p>
                        </div>
                    )}

                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-3">Autonomia e Logística</p>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-3xl font-black text-slate-800">{fmtNum(resultados.autonomia)}</p>
                                <p className="text-[10px] text-slate-500 italic">Hectares por tanque</p>
                            </div>
                            <div className="text-right text-xs font-bold text-cyan-600 bg-cyan-50 px-2 py-1 rounded">
                                Tanque: {capacidadeTanque || 0} L
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex gap-3 items-start">
                        <Info size={18} className="text-slate-500 shrink-0" />
                        <div className="text-xs text-slate-600 leading-normal italic">
                            Verifique o desgaste das pontas. Se a vazão entre bicos variar mais de 10%, substitua o jogo completo.
                        </div>
                    </div>
                 </div>
            </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
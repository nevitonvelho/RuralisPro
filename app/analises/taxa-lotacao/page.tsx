"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Footprints, 
  Scale, 
  Ruler, 
  ArrowRight, 
  Lock, 
  Gauge, 
  AlertTriangle,
  TrendingDown,
  Info,
  ClipboardList
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CalculatorLayout } from "@/app/components/CalculatorLayout";

// --- COMPONENTES AUXILIARES ---

const TechnicalTable = ({ title, rows }: { title: string; rows: any[] }) => {
  if (!rows || rows.length === 0) return null;
  return (
    <div className="mt-4 mb-6 border border-black rounded-lg overflow-hidden shadow-none break-inside-avoid">
      <div className="bg-slate-200 border-b border-black p-2 flex justify-between items-center">
        <h3 className="font-bold text-xs uppercase text-black tracking-wider flex items-center gap-2">
           <ClipboardList size={14}/> {title}
        </h3>
      </div>
      <table className="w-full text-sm text-left">
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-slate-300 last:border-0 bg-white">
              <td className="p-2 text-black font-bold w-1/2">{row.label}</td>
              <td className="p-2 text-black font-medium text-right">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const InputGroup = ({ label, icon, value, onChange, placeholder = "0", step="0.1", suffix }: any) => (
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
        className="w-full pl-10 pr-12 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900 font-medium placeholder:text-slate-300"
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
            {suffix}
        </div>
      )}
    </div>
  </div>
);

export default function TaxaLotacaoPage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // ESTADOS
  const [produtor, setProdutor] = useState("");
  const [talhao, setTalhao] = useState("");
  const [qtdAnimais, setQtdAnimais] = useState<number | string>(""); 
  const [pesoMedio, setPesoMedio] = useState<number | string>(""); 
  const [area, setArea] = useState<number | string>(""); 
  const [capacidadeSuporte, setCapacidadeSuporte] = useState<number | string>("1.0");

  const PESO_UA = 450;

  // Garantir hidratação segura
  useEffect(() => { setMounted(true); }, []);

  const resultados = useMemo(() => {
    const qtd = Number(qtdAnimais) || 0;
    const peso = Number(pesoMedio) || 0;
    const ha = Number(area) || 0;
    const meta = Number(capacidadeSuporte) || 1;

    if (ha === 0) return { uaTotal: 0, uaHa: 0, kgHa: 0, diff: 0, status: 'neutral', meta, rows: [] };

    const pesoTotal = qtd * peso;
    const uaTotal = pesoTotal / PESO_UA;
    const uaHa = uaTotal / ha;
    const kgHa = pesoTotal / ha;
    const diff = uaHa - meta;
    
    let status = 'ideal';
    if (diff > 0.2) status = 'over';
    if (diff < -0.2) status = 'under';

    const fmt = (n: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(n);

    return {
        uaTotal, uaHa, kgHa, diff, status, meta,
        rows: [
            { label: "Total de Unidades Animais", value: `${fmt(uaTotal)} UA` },
            { label: "Lotação Atual", value: `${fmt(uaHa)} UA/ha` },
            { label: "Carga Animal (kg/ha)", value: `${fmt(kgHa)} kg/ha` },
            { label: "Capacidade de Suporte (Meta)", value: `${fmt(meta)} UA/ha` },
            { label: "Diferença vs Meta", value: `${diff > 0 ? '+' : ''}${fmt(diff)} UA/ha` }
        ]
    };
  }, [qtdAnimais, pesoMedio, area, capacidadeSuporte]);

  if (!mounted) return null;

  const fmt = (n: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(n);

  return (
    <CalculatorLayout
      title="Taxa de Lotação (UA/ha)"
      subtitle="Cálculo de pressão de pastejo e ajuste de carga animal."
      category="Pecuária a Pasto"
      icon={<Footprints size={16} />}
      produtor={produtor}
      setProdutor={setProdutor}
      talhao={talhao}
      setTalhao={setTalhao}
      shareText={`🐄 Lotação Atual: ${fmt(resultados.uaHa)} UA/ha`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
        
        {/* --- INPUTS --- */}
        <div className="lg:col-span-7 space-y-6">
           <div className="print:hidden space-y-6">
               <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                     <div className="p-2 bg-slate-100 text-slate-700 rounded-lg"><Footprints size={20} /></div>
                     <h3 className="font-bold text-lg text-slate-800">1. Dados do Rebanho</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                     <InputGroup label="Qtd Animais" icon={<span className="font-bold text-xs">Nº</span>} value={qtdAnimais} onChange={setQtdAnimais} />
                     <InputGroup label="Peso Médio" icon={<Scale size={16}/>} value={pesoMedio} onChange={setPesoMedio} suffix="kg" />
                  </div>
               </section>

               <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                     <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><Ruler size={20} /></div>
                     <h3 className="font-bold text-lg text-slate-800">2. Área e Suporte</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <InputGroup label="Área Total" icon={<Ruler size={16}/>} value={area} onChange={setArea} suffix="ha" />
                     <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Meta de Suporte</label>
                        <select 
                            value={capacidadeSuporte}
                            onChange={(e) => setCapacidadeSuporte(e.target.value)}
                            className="w-full pl-3 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 font-medium cursor-pointer"
                        >
                            <option value="0.5">0.5 UA/ha (Baixo)</option>
                            <option value="1.0">1.0 UA/ha (Médio)</option>
                            <option value="1.5">1.5 UA/ha (Rotacionado)</option>
                            <option value="2.5">2.5 UA/ha (Intensivo)</option>
                        </select>
                     </div>
                  </div>
               </section>
           </div>

           <div className="hidden print:block">
               <TechnicalTable title="Análise de Pressão de Pastejo" rows={resultados.rows} />
           </div>
        </div>

        {/* --- RESULTADOS --- */}
        <div className="lg:col-span-5 relative">
            <div className="sticky top-10 print:static">
                 {!isAuthenticated && (
                   <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg h-full print:hidden">
                      <div className="bg-slate-900 text-emerald-400 p-4 rounded-full mb-4 shadow-xl"><Lock size={32} /></div>
                      <button onClick={() => (document.getElementById("modal_auth") as any)?.showModal()} className="bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center gap-2">Ver Lotação <ArrowRight size={16}/></button>
                   </div>
                 )}

                 <div className={`space-y-6 transition-all duration-500 print:hidden ${!isAuthenticated ? 'opacity-40 filter blur-sm select-none pointer-events-none' : ''}`}>
                    <div className="bg-slate-900 text-white rounded-xl p-8 shadow-xl relative overflow-hidden">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">Taxa de Lotação Atual</p>
                            {resultados.status === 'ideal' && <span className="bg-emerald-500 text-white text-[10px] px-2 py-1 rounded font-bold">IDEAL</span>}
                            {resultados.status === 'over' && <span className="bg-red-500 text-white text-[10px] px-2 py-1 rounded font-bold animate-pulse">SUPERPASTEJO</span>}
                        </div>
                        <div className="flex items-end gap-2 mb-6">
                            <span className={`text-6xl font-black tracking-tighter ${resultados.status === 'over' ? 'text-red-400' : 'text-white'}`}>{fmt(resultados.uaHa)}</span>
                            <span className="text-xl text-slate-400 mb-2 font-medium">UA/ha</span>
                        </div>
                        
                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-400">
                                <span>Meta: {fmt(resultados.meta)}</span>
                                <span>Desvio: {fmt(resultados.diff)}</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-500 ${resultados.status === 'over' ? 'bg-red-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${Math.min((resultados.uaHa / (resultados.meta * 1.5)) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    

                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Total UAs</p>
                            <p className="text-2xl font-black text-slate-900">{fmt(resultados.uaTotal)}</p>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Carga kg/ha</p>
                            <p className="text-2xl font-black text-slate-900">{fmt(resultados.kgHa)}</p>
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl border flex gap-3 ${resultados.status === 'over' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                        <Info size={20} className="shrink-0" />
                        <p className="text-xs leading-relaxed">
                            {resultados.status === 'over' ? "Cuidado: A carga atual excede a capacidade de suporte. Isso reduzirá o ganho de peso individual." : "Atenção ao manejo: Monitore a altura de entrada e saída para garantir o rebrote vigoroso."}
                        </p>
                    </div>
                 </div>
            </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
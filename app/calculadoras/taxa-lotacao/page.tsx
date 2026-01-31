"use client";

import { useState, useMemo } from "react";
import { 
  Footprints, // Representando gado/pegada
  Scale, 
  Ruler, 
  ArrowRight, 
  Lock, 
  Gauge, // Velocímetro/Pressão
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Info
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
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
        {icon}
      </div>
      <input 
        type="number" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
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
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // ESTADOS
  const [produtor, setProdutor] = useState("");
  const [talhao, setTalhao] = useState(""); // Pode ser Piquete ou Módulo

  // INPUTS - REBANHO
  const [qtdAnimais, setQtdAnimais] = useState<number | string>(""); 
  const [pesoMedio, setPesoMedio] = useState<number | string>(""); // kg

  // INPUTS - ÁREA
  const [area, setArea] = useState<number | string>(""); // ha
  const [capacidadeSuporte, setCapacidadeSuporte] = useState<number | string>("1.0"); // Meta UA/ha

  // CONSTANTE
  const PESO_UA = 450; // 1 UA = 450kg

  // CÁLCULOS
  const resultados = useMemo(() => {
    const qtd = Number(qtdAnimais) || 0;
    const peso = Number(pesoMedio) || 0;
    const ha = Number(area) || 0;
    const meta = Number(capacidadeSuporte) || 1;

    if (ha === 0) return { uaTotal: 0, uaHa: 0, kgHa: 0, diff: 0, status: 'neutral' };

    // 1. Peso Total do Rebanho
    const pesoTotal = qtd * peso;

    // 2. Total de UAs (Unidades Animais)
    const uaTotal = pesoTotal / PESO_UA;

    // 3. Taxa de Lotação (UA/ha)
    const uaHa = uaTotal / ha;

    // 4. Carga Animal (kg/ha) - Útil para pisoteio
    const kgHa = pesoTotal / ha;

    // 5. Diferença para a Meta (Pressão de Pastejo)
    const diff = uaHa - meta;
    
    // Definição de Status
    let status = 'ideal'; // Verde
    if (diff > 0.2) status = 'over'; // Vermelho (Superpastejo)
    if (diff < -0.2) status = 'under'; // Amarelo (Subpastejo)

    return {
        uaTotal,
        uaHa,
        kgHa,
        diff,
        status,
        meta
    };
  }, [qtdAnimais, pesoMedio, area, capacidadeSuporte]);

  // FORMATAÇÃO
  const fmt = (n: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(n);

  const shareText = `🐄 *Taxa de Lotação*\n\n📏 *Lotação Atual:* ${fmt(resultados.uaHa)} UA/ha\n🎯 *Capacidade Meta:* ${fmt(resultados.meta)} UA/ha\n⚖️ *Carga Animal:* ${fmt(resultados.kgHa)} kg/ha\n\n${resultados.status === 'over' ? '⚠️ Atenção: Superpastejo' : resultados.status === 'under' ? '📉 Atenção: Subpastejo' : '✅ Pastagem Equilibrada'}`;

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
      shareText={shareText}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- INPUTS --- */}
        <div className="lg:col-span-7 space-y-6">
           
           {/* Seção 1: Inventário Animal */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-slate-100 text-slate-700 rounded-lg"><Footprints size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">1. Dados do Rebanho</h3>
                    <p className="text-xs text-slate-400">Quantidade e peso médio do lote</p>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                 <InputGroup label="Qtd Animais" icon={<span className="font-bold text-xs">Nº</span>} value={qtdAnimais} onChange={setQtdAnimais} placeholder="Ex: 100" />
                 <InputGroup label="Peso Médio (kg)" icon={<Scale size={16}/>} value={pesoMedio} onChange={setPesoMedio} placeholder="Ex: 380" suffix="kg" />
              </div>
              <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400">
                  <Info size={12} />
                  <span>Considerando 1 UA = {PESO_UA} kg (Padrão)</span>
              </div>
           </section>

           {/* Seção 2: Área e Meta */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><Ruler size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">2. Área e Suporte</h3>
                    <p className="text-xs text-slate-400">Tamanho do piquete e capacidade esperada</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <InputGroup label="Área Total (ha)" icon={<Ruler size={16}/>} value={area} onChange={setArea} placeholder="Ex: 50" suffix="ha" />
                 
                 <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                        Capacidade Suporte (Meta)
                    </label>
                    <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <Gauge size={16} />
                        </div>
                        <select 
                            value={capacidadeSuporte}
                            onChange={(e) => setCapacidadeSuporte(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 font-medium appearance-none cursor-pointer"
                        >
                            <option value="0.5">0.5 UA/ha (Extensivo/Baixo)</option>
                            <option value="1.0">1.0 UA/ha (Médio/Águas)</option>
                            <option value="1.5">1.5 UA/ha (Rotacionado)</option>
                            <option value="2.5">2.5 UA/ha (Intensivo/Irrigado)</option>
                            <option value="4.0">4.0+ UA/ha (Alta Tecnologia)</option>
                        </select>
                         <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <TrendingDown size={14} />
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
                      <div className="bg-slate-900 text-emerald-400 p-4 rounded-full mb-4 shadow-xl animate-pulse">
                         <Lock size={32} />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">Lotação Bloqueada</h3>
                      <button 
                        onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 hover:scale-105"
                      >
                        Verificar Pasto <ArrowRight size={16}/>
                      </button>
                   </div>
                 )}

                 <div className={`space-y-6 transition-all duration-500 ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>
                    
                    {/* Card Principal: UA/HA */}
                    <div className="print-card bg-slate-900 text-white rounded-xl p-8 shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-2">
                                <p className="text-emerald-400 font-bold uppercase tracking-wider text-xs">
                                    Taxa de Lotação
                                </p>
                                
                                {/* Badge de Status */}
                                {resultados.status === 'ideal' && <span className="bg-emerald-500 text-white text-[10px] px-2 py-1 rounded font-bold">IDEAL</span>}
                                {resultados.status === 'over' && <span className="bg-red-500 text-white text-[10px] px-2 py-1 rounded font-bold animate-pulse">SUPERPASTEJO</span>}
                                {resultados.status === 'under' && <span className="bg-amber-500 text-slate-900 text-[10px] px-2 py-1 rounded font-bold">SUBPASTEJO</span>}
                            </div>
                            
                            <p className="text-slate-400 text-[10px] mb-6">
                                Pressão atual sobre a área
                            </p>

                            <div className="flex items-end gap-3 mb-6">
                                <span className={`text-6xl font-black tracking-tighter ${resultados.status === 'over' ? 'text-red-400' : 'text-white'}`}>
                                    {fmt(resultados.uaHa)}
                                </span>
                                <div className="mb-2">
                                    <span className="text-xl font-medium text-slate-300 block">UA/ha</span>
                                </div>
                            </div>

                            {/* Barra de Comparação com Meta */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] text-slate-400">
                                    <span>Meta: {fmt(resultados.meta)}</span>
                                    <span>{resultados.diff > 0 ? `+${fmt(resultados.diff)}` : fmt(resultados.diff)} UA (Desvio)</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden relative">
                                    {/* Marcador de Meta (Centro Relativo ou Fixo) */}
                                    <div className="absolute left-0 h-full bg-blue-500/30 w-full"></div> 
                                    {/* Barra de Progresso simplificada: Width baseada na relação Atual/Meta */}
                                    <div 
                                        className={`h-full transition-all duration-500 ${resultados.status === 'over' ? 'bg-red-500' : resultados.status === 'under' ? 'bg-amber-400' : 'bg-emerald-500'}`}
                                        style={{ width: `${Math.min((resultados.uaHa / (resultados.meta * 2)) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card Secundário: TOTAIS */}
                    <div className="print-card bg-white border border-slate-200 rounded-xl p-6 shadow-lg">
                        <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
                             <Gauge className="text-blue-600" size={20}/>
                             <div>
                                <h4 className="font-bold text-slate-800 text-sm">Carga Total</h4>
                                <p className="text-[10px] text-slate-400">Indicadores físicos</p>
                             </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-slate-50 rounded-lg p-3">
                                <span className="block text-2xl font-black text-slate-900">{fmt(resultados.uaTotal)}</span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase">Total de UAs</span>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-3">
                                <span className="block text-2xl font-black text-slate-900">{fmt(resultados.kgHa)}</span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase">kg / ha</span>
                            </div>
                        </div>

                        {/* Dica de Manejo Dinâmica */}
                        <div className="mt-4 text-xs bg-blue-50 text-blue-800 p-3 rounded-lg border border-blue-100 flex gap-2 items-start">
                             <Info size={16} className="shrink-0 mt-0.5"/>
                             {resultados.status === 'over' && (
                                <p>Você está com <strong>excesso de carga</strong>. Risco de degradação da pastagem e perda de desempenho individual (GMD). Considere vender animais ou suplementar no cocho.</p>
                             )}
                             {resultados.status === 'under' && (
                                <p>Você está com <strong>sobra de pasto</strong>. O capim pode passar do ponto (ficar fibroso) e perder qualidade. Considere comprar animais ou fazer feno/silagem.</p>
                             )}
                             {resultados.status === 'ideal' && (
                                <p><strong>Parabéns!</strong> A lotação está alinhada com a capacidade de suporte definida. Monitore a altura do pasto para manter o equilíbrio.</p>
                             )}
                        </div>
                    </div>

                 </div>
            </div>
        </div>

      </div>
    </CalculatorLayout>
  );
}
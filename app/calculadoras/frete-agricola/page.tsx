"use client";

import { useState, useMemo } from "react";
import { 
  Truck, // Frete
  Route, // Distância
  Coins, 
  ArrowRight, 
  Lock, 
  MapPin,
  Scale,
  ArrowDownUp
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CalculatorLayout } from "@/app/components/CalculatorLayout";

// Input Padronizado
const InputGroup = ({ label, icon, value, onChange, placeholder = "0", step="0.01", suffix }: any) => (
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

export default function FreteAgricolaPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // ESTADOS
  const [produtor, setProdutor] = useState("");
  const [talhao, setTalhao] = useState(""); // Rota (ex: Fazenda -> Porto)

  // INPUTS - LOGÍSTICA
  const [precoTon, setPrecoTon] = useState<number | string>(""); // R$/Ton (Cotação do frete)
  const [distancia, setDistancia] = useState<number | string>(""); // km
  const [pesoCarga, setPesoCarga] = useState<number | string>(""); // Toneladas (Ex: 37, 50)

  // INPUTS - MERCADO (Para contexto)
  const [precoSaca, setPrecoSaca] = useState<number | string>(""); // R$/sc (Preço da mercadoria no destino)

  // CÁLCULOS
  const resultados = useMemo(() => {
    const pTon = Number(precoTon) || 0;
    const dist = Number(distancia) || 0;
    const peso = Number(pesoCarga) || 0;
    const pSaca = Number(precoSaca) || 0;

    if (pTon === 0) return { custoSaca: 0, totalViagem: 0, custoKm: 0, impactoMargem: 0, sacaLiquida: 0 };

    // 1. Custo por Saca (O dado mais importante)
    // 1 Ton = 1000kg / 60kg = 16.666 sacas
    const sacasPorTon = 1000 / 60;
    const custoSaca = pTon / sacasPorTon;

    // 2. Custo Total da Viagem (Faturamento do Caminhoneiro)
    const totalViagem = pTon * peso;

    // 3. Eficiência (R$ por km rodado total)
    const custoKm = dist > 0 ? totalViagem / dist : 0;

    // 4. Impacto na Margem (%)
    const impactoMargem = pSaca > 0 ? (custoSaca / pSaca) * 100 : 0;

    // 5. Netback (Saca Líquida de Frete)
    const sacaLiquida = pSaca - custoSaca;

    return {
        custoSaca,
        totalViagem,
        custoKm,
        impactoMargem,
        sacaLiquida
    };
  }, [precoTon, distancia, pesoCarga, precoSaca]);

  // SET PRESETS (Tipos de Caminhão)
  const setTruck = (val: number) => setPesoCarga(val);

  // FORMATAÇÃO
  const fmtMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(v);
  const fmtPct = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(v) + '%';

  const shareText = `🚛 *Custo de Frete - ${talhao || 'Rota'}*\n\n💰 *Cotação:* ${fmtMoeda(Number(precoTon))}/ton\n📉 *Impacto:* -${fmtMoeda(resultados.custoSaca)} / saca\n\n🏁 *Total Viagem:* ${fmtMoeda(resultados.totalViagem)}\n📊 *Peso no Preço:* ${fmtPct(resultados.impactoMargem)}`;

  return (
    <CalculatorLayout
      title="Frete Agrícola & Netback"
      subtitle="Converta o custo de tonelada para sacas e calcule o impacto logístico na margem."
      category="Financeiro e Mercado"
      icon={<Truck size={16} />}
      produtor={produtor}
      setProdutor={setProdutor}
      talhao={talhao}
      setTalhao={setTalhao}
      shareText={shareText}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- INPUTS --- */}
        <div className="lg:col-span-7 space-y-6">
           
           {/* Seção 1: Cotação do Frete */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Truck size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">1. Dados do Transporte</h3>
                    <p className="text-xs text-slate-400">Valores negociados com transportadora</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <InputGroup label="Preço por Tonelada" icon={<Coins size={16}/>} value={precoTon} onChange={setPrecoTon} placeholder="Ex: 220.00" suffix="R$/ton" />
                 <InputGroup label="Distância (Ida)" icon={<Route size={16}/>} value={distancia} onChange={setDistancia} placeholder="Ex: 850" suffix="km" />
              </div>

              {/* Presets de Caminhão */}
              <div className="mt-5">
                 <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Capacidade de Carga (Estimada)</label>
                 <div className="grid grid-cols-3 gap-2 mb-3">
                    <button onClick={() => setTruck(32)} className={`p-2 rounded border text-xs font-bold transition-all ${pesoCarga == 32 ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-50 text-slate-500'}`}>
                        Vanderleia (32t)
                    </button>
                    <button onClick={() => setTruck(37)} className={`p-2 rounded border text-xs font-bold transition-all ${pesoCarga == 37 ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-50 text-slate-500'}`}>
                        Bitrem (37t)
                    </button>
                    <button onClick={() => setTruck(50)} className={`p-2 rounded border text-xs font-bold transition-all ${pesoCarga == 50 ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-50 text-slate-500'}`}>
                        Rodotrem (50t)
                    </button>
                 </div>
                 <InputGroup label="Peso da Carga" icon={<Scale size={16}/>} value={pesoCarga} onChange={setPesoCarga} placeholder="Ou digite..." suffix="ton" />
              </div>
           </section>

           {/* Seção 2: Valor da Mercadoria (Contexto) */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-slate-100 text-slate-700 rounded-lg"><Coins size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">2. Contexto de Mercado</h3>
                    <p className="text-xs text-slate-400">Para calcular o Netback (Opcional)</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 gap-5">
                 <InputGroup label="Preço da Saca no Destino" icon={<ArrowDownUp size={16}/>} value={precoSaca} onChange={setPrecoSaca} placeholder="Ex: 135.00" suffix="R$/sc" />
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
                      <h3 className="text-xl font-black text-slate-900 mb-2">Custo Bloqueado</h3>
                      <button 
                        onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-orange-600/20 transition-all flex items-center gap-2 hover:scale-105"
                      >
                        Ver Custo Real <ArrowRight size={16}/>
                      </button>
                   </div>
                 )}

                 <div className={`space-y-6 transition-all duration-500 ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>
                    
                    {/* Card Principal: CUSTO POR SACA */}
                    <div className="print-card bg-slate-900 text-white rounded-xl p-8 shadow-xl relative overflow-hidden">
                        {/* Background Detail */}
                        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-orange-600/20 to-transparent pointer-events-none"></div>

                        <div className="relative z-10">
                            <p className="text-orange-400 font-bold uppercase tracking-wider text-xs mb-4">
                                Desconto de Frete (Basis)
                            </p>
                            
                            <div className="relative inline-block mb-2">
                                <span className="text-5xl font-black tracking-tighter text-white">
                                    {fmtMoeda(resultados.custoSaca)}
                                </span>
                                <span className="block text-xl font-medium text-slate-400 mt-1">por Saca</span>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-800">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-400">Preço Líquido (Netback):</span>
                                    <span className={`text-xl font-bold ${Number(precoSaca) > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>
                                        {Number(precoSaca) > 0 ? fmtMoeda(resultados.sacaLiquida) : '---'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card Secundário: CUSTO TOTAL DA VIAGEM */}
                    <div className="print-card bg-white border border-slate-200 rounded-xl p-6 shadow-lg relative">
                        <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
                             <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><Truck size={20} /></div>
                             <div>
                                <h4 className="font-bold text-slate-800 text-sm">Custo da Carga Fechada</h4>
                                <p className="text-[10px] text-slate-400">Valor pago ao transportador</p>
                             </div>
                        </div>
                        
                        <div className="flex items-end justify-between">
                            <div>
                                <span className="block text-3xl font-black text-slate-900">{fmtMoeda(resultados.totalViagem)}</span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase">Total da Nota</span>
                            </div>
                            <div className="text-right">
                                <span className="block text-lg font-bold text-slate-700">{fmtMoeda(resultados.custoKm)}</span>
                                <span className="text-[10px] text-slate-400 uppercase">R$ / Km rodado</span>
                            </div>
                        </div>
                    </div>

                    {/* Card Terciário: IMPACTO % */}
                    {Number(precoSaca) > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 relative">
                            <div className="flex gap-3 items-center mb-2">
                                <ArrowDownUp size={18} className="text-orange-600"/>
                                <p className="text-xs font-bold text-orange-800 uppercase">Impacto Financeiro</p>
                            </div>
                            <p className="text-sm text-orange-900">
                                O frete está consumindo <strong>{fmtPct(resultados.impactoMargem)}</strong> do valor bruto da sua mercadoria.
                            </p>
                        </div>
                    )}

                 </div>
            </div>
        </div>

      </div>
    </CalculatorLayout>
  );
}
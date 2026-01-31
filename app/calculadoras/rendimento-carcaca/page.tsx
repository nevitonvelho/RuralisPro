"use client";

import { useState, useMemo } from "react";
import { 
  Beef, 
  Scale, 
  Truck, 
  ArrowRight, 
  Lock, 
  Coins,
  TrendingUp,
  AlertCircle,
  BarChart3
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
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors">
        {icon}
      </div>
      <input 
        type="number" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder}
        step={step}
        className="w-full pl-10 pr-12 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-slate-900 font-medium placeholder:text-slate-300"
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
            {suffix}
        </div>
      )}
    </div>
  </div>
);

export default function RendimentoCarcacaPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // ESTADOS
  const [produtor, setProdutor] = useState("");
  const [talhao, setTalhao] = useState(""); // Lote/Romaneio

  // INPUTS
  const [pesoVivo, setPesoVivo] = useState<number | string>(""); // kg (Fazenda/Embarque)
  const [pesoCarcaca, setPesoCarcaca] = useState<number | string>(""); // kg (Gancho/Frigorifico)
  const [precoArroba, setPrecoArroba] = useState<number | string>(""); // R$

  // CÁLCULOS
  const resultados = useMemo(() => {
    const pVivo = Number(pesoVivo) || 0;
    const pCarcaca = Number(pesoCarcaca) || 0;
    const vArroba = Number(precoArroba) || 0;

    if (pVivo === 0) return { rc: 0, arrobas: 0, receita: 0, status: 'neutral', diff1pct: 0 };

    // 1. Rendimento de Carcaça (%)
    const rc = (pCarcaca / pVivo) * 100;

    // 2. Total de Arrobas (Base 15kg carcaça)
    // No Brasil, vende-se a @ carcaça (15kg).
    const arrobas = pCarcaca / 15;

    // 3. Receita Total
    const receita = arrobas * vArroba;

    // 4. Status (Benchmark)
    let status = 'media';
    if (rc < 52) status = 'baixo';
    if (rc >= 55) status = 'alto';

    // 5. Simulação: O que seria +1% de rendimento?
    // Se RC fosse +1%, quanto seria o peso carcaça?
    const pesoCarcacaMelhor = pVivo * ((rc + 1) / 100);
    const arrobasMelhor = pesoCarcacaMelhor / 15;
    const receitaMelhor = arrobasMelhor * vArroba;
    const diff1pct = receitaMelhor - receita;

    return {
        rc,
        arrobas,
        receita,
        status,
        diff1pct
    };
  }, [pesoVivo, pesoCarcaca, precoArroba]);

  // FORMATAÇÃO
  const fmtMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(v);

  const shareText = `🥩 *Rendimento de Carcaça*\n\n📊 *Rendimento:* ${fmtNum(resultados.rc)}%\n⚖️ *Peso:* ${fmtNum(resultados.arrobas)} @\n💰 *Receita:* ${fmtMoeda(resultados.receita)}\n\n(Base: ${pesoVivo}kg Vivo -> ${pesoCarcaca}kg Carcaça)`;

  return (
    <CalculatorLayout
      title="Rendimento de Carcaça"
      subtitle="Auditoria de abate e eficiência industrial do lote."
      category="Comercial"
      icon={<Beef size={16} />}
      produtor={produtor}
      setProdutor={setProdutor}
      talhao={talhao}
      setTalhao={setTalhao}
      shareText={shareText}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- INPUTS --- */}
        <div className="lg:col-span-7 space-y-6">
           
           {/* Seção 1: Pesagem */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-slate-100 text-slate-700 rounded-lg"><Scale size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">1. Comparativo de Peso</h3>
                    <p className="text-xs text-slate-400">Dados da fazenda vs. dados do frigorífico</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <InputGroup label="Peso Vivo (Fazenda)" icon={<Truck size={16}/>} value={pesoVivo} onChange={setPesoVivo} placeholder="Ex: 540" suffix="kg" />
                 <InputGroup label="Peso Carcaça (Gancho)" icon={<Beef size={16}/>} value={pesoCarcaca} onChange={setPesoCarcaca} placeholder="Ex: 290" suffix="kg" />
              </div>
              <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100 flex gap-2 items-start text-xs text-amber-800">
                  <AlertCircle size={14} className="mt-0.5 shrink-0"/>
                  <p>Atenção: Utilize o peso vivo após o jejum ou peso de embarque para um cálculo mais real do rendimento industrial.</p>
              </div>
           </section>

           {/* Seção 2: Comercial */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-green-100 text-green-700 rounded-lg"><Coins size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">2. Valores</h3>
                    <p className="text-xs text-slate-400">Base de negociação</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <InputGroup label="Preço da Arroba (R$)" icon={<Coins size={16}/>} value={precoArroba} onChange={setPrecoArroba} placeholder="Ex: 280.00" suffix="R$" />
              </div>
           </section>
        </div>

        {/* --- RESULTADOS --- */}
        <div className="lg:col-span-5 relative">
            <div className="sticky top-10 print:static">

                 {/* OVERLAY BLOQUEIO */}
                 {!isAuthenticated && (
                   <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg h-full">
                      <div className="bg-slate-900 text-red-400 p-4 rounded-full mb-4 shadow-xl animate-pulse">
                         <Lock size={32} />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">Resultado Bloqueado</h3>
                      <button 
                        onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-red-600/20 transition-all flex items-center gap-2 hover:scale-105"
                      >
                        Ver Rendimento <ArrowRight size={16}/>
                      </button>
                   </div>
                 )}

                 <div className={`space-y-6 transition-all duration-500 ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>
                    
                    {/* Card Principal: RENDIMENTO % */}
                    <div className="print-card bg-slate-900 text-white rounded-xl p-8 shadow-xl relative overflow-hidden">
                        {/* Background Detail */}
                        <div className="absolute -right-6 -top-6 w-32 h-32 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="relative z-10 text-center">
                            <p className="text-red-400 font-bold uppercase tracking-wider text-xs mb-4">
                                Rendimento de Carcaça (RC)
                            </p>
                            
                            {/* Gauge Visual Simples */}
                            <div className="relative inline-block">
                                <span className={`text-6xl font-black tracking-tighter ${resultados.rc >= 55 ? 'text-emerald-400' : resultados.rc < 52 ? 'text-red-400' : 'text-white'}`}>
                                    {fmtNum(resultados.rc)}<span className="text-3xl">%</span>
                                </span>
                            </div>

                            <div className="flex justify-center mt-4 gap-2">
                                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full border ${resultados.status === 'baixo' ? 'bg-red-500/20 border-red-500 text-red-400' : 'border-slate-700 text-slate-600'}`}>Baixo (&lt;52%)</span>
                                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full border ${resultados.status === 'media' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'border-slate-700 text-slate-600'}`}>Médio</span>
                                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full border ${resultados.status === 'alto' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-slate-700 text-slate-600'}`}>Alto (&gt;55%)</span>
                            </div>
                        </div>
                    </div>

                    {/* Card Secundário: FINANCEIRO DO ABATE */}
                    <div className="print-card bg-white border border-slate-200 rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
                             <div className="flex items-center gap-2">
                                <Coins className="text-green-600" size={20}/>
                                <h4 className="font-bold text-slate-800 text-sm">Receita do Abate</h4>
                             </div>
                             <span className="text-xs font-bold text-slate-500">{fmtNum(resultados.arrobas)} @ Faturadas</span>
                        </div>
                        
                        <div className="text-center py-2">
                            <span className="block text-3xl font-black text-slate-900">{fmtMoeda(resultados.receita)}</span>
                            <span className="text-[10px] text-slate-400 uppercase">Valor Total (Por Animal)</span>
                        </div>
                    </div>

                    {/* Card Terciário: DINHEIRO NA MESA (Impacto 1%) */}
                    {resultados.receita > 0 && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 relative overflow-hidden group hover:border-blue-300 transition-colors">
                            <div className="flex gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg text-blue-600 h-fit">
                                    <TrendingUp size={18}/>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-600 uppercase">Impacto da Genética (+1%)</p>
                                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                                        Se o rendimento fosse <strong>1% maior</strong> (aprox. {fmtNum(resultados.rc + 1)}%), você ganharia mais:
                                    </p>
                                    <p className="text-xl font-black text-blue-600 mt-1">
                                        + {fmtMoeda(resultados.diff1pct)} <span className="text-xs font-normal text-slate-400">/cabeça</span>
                                    </p>
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
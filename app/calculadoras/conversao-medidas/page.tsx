"use client";

import { useState, useMemo } from "react";
import { 
  ArrowLeftRight, // Conversão
  Globe, // Mercado Internacional
  Coins, 
  ArrowRight, 
  Lock, 
  Scale,
  Calculator,
  Sprout
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
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
        {icon}
      </div>
      <input 
        type="number" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder}
        step={step}
        className="w-full pl-10 pr-12 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 font-medium placeholder:text-slate-300"
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
            {suffix}
        </div>
      )}
    </div>
  </div>
);

export default function ConversorMercadoPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // ESTADOS
  const [produtor, setProdutor] = useState("");
  const [talhao, setTalhao] = useState(""); // Uso livre

  // INPUTS - TIPO DE GRÃO
  const [cultura, setCultura] = useState<"soja" | "milho" | "trigo">("soja");

  // INPUTS - MERCADO (FINANCEIRO)
  const [cotacaoChicago, setCotacaoChicago] = useState<number | string>(""); // $/bu
  const [premioPorto, setPremioPorto] = useState<number | string>(""); // cents/bu (Basis) - Opcional
  const [taxaCambio, setTaxaCambio] = useState<number | string>(""); // R$/USD

  // INPUTS - PRODUTIVIDADE (AGRONÔMICO)
  const [produtividadeBuAcre, setProdutividadeBuAcre] = useState<number | string>(""); // bu/acre

  // CONSTANTES DE CONVERSÃO
  const PESO_BUSHEL = {
    soja: 27.2155, // kg
    trigo: 27.2155, // kg (Mesmo da soja geralmente para soft red)
    milho: 25.4012  // kg
  };

  const FATOR_AREA = 2.47105; // 1 ha = 2.471 acres
  const PESO_SACA = 60; // kg

  // CÁLCULOS
  const resultados = useMemo(() => {
    const chicago = Number(cotacaoChicago) || 0;
    const premio = Number(premioPorto) || 0; // cents
    const dolar = Number(taxaCambio) || 0;
    const prodBu = Number(produtividadeBuAcre) || 0;
    
    const kgPorBu = PESO_BUSHEL[cultura];

    // --- CÁLCULOS FINANCEIROS ---
    // 1. Preço Total em Dólares por Bushel (Chicago + Prêmio)
    // Prêmio geralmente é em cents, então divide por 100
    const precoFullUsdBu = chicago + (premio / 100);

    // 2. Fator de Conversão: Quantos Bushels cabem em uma Saca (60kg)?
    // Ex Soja: 60 / 27.2155 = 2.2046 bu/sc
    const buPorSaca = PESO_SACA / kgPorBu;

    // 3. Preço por Saca em Dólar
    const precoSacaUsd = precoFullUsdBu * buPorSaca;

    // 4. Preço por Saca em Reais (Paridade)
    const precoSacaBrl = precoSacaUsd * dolar;

    // 5. Preço por Tonelada (R$)
    const precoTonBrl = (precoSacaBrl / 60) * 1000;


    // --- CÁLCULOS AGRONÔMICOS (YIELD) ---
    // Converter bu/acre para sc/ha
    // (bu * kg_bu) = kg/acre
    // kg/acre * 2.471 = kg/ha
    // kg/ha / 60 = sc/ha
    const kgPorAcre = prodBu * kgPorBu;
    const kgPorHa = kgPorAcre * FATOR_AREA;
    const scPorHa = kgPorHa / PESO_SACA;

    return {
        precoSacaBrl,
        precoSacaUsd,
        precoTonBrl,
        buPorSaca,
        scPorHa,
        kgPorHa
    };
  }, [cultura, cotacaoChicago, premioPorto, taxaCambio, produtividadeBuAcre]);

  // FORMATAÇÃO
  const fmtMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtUsd = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
  const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(v);

  const shareText = `🌎 *Conversor de Mercado - ${cultura.toUpperCase()}*\n\n📉 *Chicago:* $${cotacaoChicago}/bu\n💵 *Dólar:* R$ ${taxaCambio}\n\n💰 *Paridade:* ${fmtMoeda(resultados.precoSacaBrl)} / sc\n📊 *Equivalência:* 1 sc = ${fmtNum(resultados.buPorSaca)} bu`;

  return (
    <CalculatorLayout
      title="Conversor Agro & Paridade"
      subtitle="Converta cotações internacionais (CBOT) e produtividade (bu/ac) para o padrão nacional."
      category="Financeiro e Mercado"
      icon={<Globe size={16} />}
      produtor={produtor}
      setProdutor={setProdutor}
      talhao={talhao}
      setTalhao={setTalhao}
      shareText={shareText}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- INPUTS --- */}
        <div className="lg:col-span-7 space-y-6">
           
           {/* Seção 1: Configuração do Grão */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-slate-100 text-slate-700 rounded-lg"><Scale size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">1. Cultura Base</h3>
                    <p className="text-xs text-slate-400">Define o peso específico do Bushel</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-2">
                  <button onClick={() => setCultura("soja")} className={`py-3 px-4 rounded-lg font-bold text-sm border transition-all flex flex-col items-center gap-1 ${cultura === 'soja' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300'}`}>
                      <span>Soja</span>
                      <span className="text-[10px] opacity-70 font-normal">27.21 kg/bu</span>
                  </button>
                  <button onClick={() => setCultura("milho")} className={`py-3 px-4 rounded-lg font-bold text-sm border transition-all flex flex-col items-center gap-1 ${cultura === 'milho' ? 'bg-yellow-500 text-white border-yellow-500 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-yellow-300'}`}>
                      <span>Milho</span>
                      <span className="text-[10px] opacity-70 font-normal">25.40 kg/bu</span>
                  </button>
                  <button onClick={() => setCultura("trigo")} className={`py-3 px-4 rounded-lg font-bold text-sm border transition-all flex flex-col items-center gap-1 ${cultura === 'trigo' ? 'bg-amber-700 text-white border-amber-700 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-amber-300'}`}>
                      <span>Trigo</span>
                      <span className="text-[10px] opacity-70 font-normal">27.21 kg/bu</span>
                  </button>
              </div>
           </section>

           {/* Seção 2: Dados Financeiros */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><Coins size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">2. Cotações (Financeiro)</h3>
                    <p className="text-xs text-slate-400">Chicago e Dólar Ptax/Comercial</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <InputGroup label="Cotação Chicago" icon={<Globe size={16}/>} value={cotacaoChicago} onChange={setCotacaoChicago} placeholder="Ex: 12.50" suffix="$/bu" />
                 <InputGroup label="Taxa de Câmbio" icon={<ArrowLeftRight size={16}/>} value={taxaCambio} onChange={setTaxaCambio} placeholder="Ex: 5.15" suffix="R$" />
                 <InputGroup label="Prêmio/Basis (Opcional)" icon={<Coins size={16}/>} value={premioPorto} onChange={setPremioPorto} placeholder="Ex: 45" suffix="¢/bu" />
              </div>
           </section>

           {/* Seção 3: Dados Agronômicos */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Sprout size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">3. Produtividade (Agronômico)</h3>
                    <p className="text-xs text-slate-400">Conversão de rendimento (EUA x Brasil)</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 gap-5">
                 <InputGroup label="Produtividade Americana" icon={<Calculator size={16}/>} value={produtividadeBuAcre} onChange={setProdutividadeBuAcre} placeholder="Ex: 55" suffix="bu/acre" />
              </div>
           </section>
        </div>

        {/* --- RESULTADOS --- */}
        <div className="lg:col-span-5 relative">
            <div className="sticky top-10 print:static">

                 {/* OVERLAY BLOQUEIO */}
                 {!isAuthenticated && (
                   <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg h-full">
                      <div className="bg-slate-900 text-indigo-400 p-4 rounded-full mb-4 shadow-xl animate-pulse">
                         <Lock size={32} />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">Conversão Bloqueada</h3>
                      <button 
                        onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 hover:scale-105"
                      >
                        Ver Paridade <ArrowRight size={16}/>
                      </button>
                   </div>
                 )}

                 <div className={`space-y-6 transition-all duration-500 ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>
                    
                    {/* Card Principal: PREÇO SACA */}
                    <div className="print-card bg-slate-900 text-white rounded-xl p-8 shadow-xl relative overflow-hidden">
                        {/* Background Effect */}
                        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="relative z-10 text-center">
                            <p className="text-indigo-400 font-bold uppercase tracking-wider text-xs mb-4">
                                Paridade de Mercado
                            </p>
                            
                            <div className="relative inline-block mb-2">
                                <span className="text-5xl font-black tracking-tighter text-white">
                                    {fmtMoeda(resultados.precoSacaBrl)}
                                </span>
                                <span className="block text-xl font-medium text-slate-400 mt-1">por Saca (60kg)</span>
                            </div>

                            <div className="mt-6 flex justify-between border-t border-slate-800 pt-6">
                                <div className="text-left">
                                    <span className="block text-lg font-bold text-white">{fmtUsd(resultados.precoSacaUsd)}</span>
                                    <span className="text-[10px] text-slate-500 uppercase">Preço em USD/sc</span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-lg font-bold text-white">{fmtMoeda(resultados.precoTonBrl)}</span>
                                    <span className="text-[10px] text-slate-500 uppercase">Preço Tonelada</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card Secundário: CONVERSÃO DE YIELD */}
                    {Number(produtividadeBuAcre) > 0 && (
                        <div className="print-card bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-lg relative">
                            <div className="flex items-center gap-3 mb-4 border-b border-blue-100 pb-4">
                                <Sprout className="text-blue-600" size={20}/>
                                <div>
                                    <h4 className="font-bold text-blue-900 text-sm">Equivalência de Produtividade</h4>
                                    <p className="text-[10px] text-blue-400">Comparativo EUA x Brasil</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="text-center">
                                    <span className="block text-3xl font-black text-slate-400">{produtividadeBuAcre}</span>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">bu / acre</span>
                                </div>
                                <ArrowRight className="text-blue-300" />
                                <div className="text-center">
                                    <span className="block text-3xl font-black text-blue-700">{fmtNum(resultados.scPorHa)}</span>
                                    <span className="text-[10px] text-blue-600 uppercase font-bold">sc / ha</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Card Terciário: TABELA RÁPIDA */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 relative">
                        <div className="flex gap-2 items-center mb-4 text-xs font-bold text-slate-700 uppercase">
                            <Calculator size={14} /> Fatores Utilizados ({cultura})
                        </div>
                        <ul className="space-y-3 text-xs text-slate-600">
                            <li className="flex justify-between border-b border-slate-50 pb-2">
                                <span>Peso do Bushel:</span>
                                <span className="font-bold font-mono">{PESO_BUSHEL[cultura].toFixed(3)} kg</span>
                            </li>
                            <li className="flex justify-between border-b border-slate-50 pb-2">
                                <span>Conversão Saca:</span>
                                <span className="font-bold font-mono">1 sc = {fmtNum(resultados.buPorSaca)} bu</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Conversão Área:</span>
                                <span className="font-bold font-mono">1 ha = 2.47 acres</span>
                            </li>
                        </ul>
                    </div>

                 </div>
            </div>
        </div>

      </div>
    </CalculatorLayout>
  );
}
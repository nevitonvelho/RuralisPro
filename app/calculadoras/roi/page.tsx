"use client";

import { useState, useMemo } from "react";
import { 
  TrendingUp, // Lucro/ROI
  Sprout, // Cultura
  DollarSign, 
  ArrowRight, 
  Lock, 
  PieChart,
  Scale,
  AlertTriangle,
  LandPlot
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

export default function RoiCulturaPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // ESTADOS
  const [produtor, setProdutor] = useState("");
  const [talhao, setTalhao] = useState(""); // Cultura (ex: Soja 23/24)

  // INPUTS - PRODUÇÃO
  const [area, setArea] = useState<number | string>(""); // Hectares
  const [produtividade, setProdutividade] = useState<number | string>(""); // Sacas/ha

  // INPUTS - MERCADO
  const [precoVenda, setPrecoVenda] = useState<number | string>(""); // R$/saca
  
  // INPUTS - CUSTOS
  const [custoPorHa, setCustoPorHa] = useState<number | string>(""); // R$/ha (Custo Operacional Total)

  // CÁLCULOS
  const resultados = useMemo(() => {
    const ha = Number(area) || 0;
    const prod = Number(produtividade) || 0;
    const preco = Number(precoVenda) || 0;
    const custoHa = Number(custoPorHa) || 0;

    if (ha === 0 || prod === 0 || preco === 0 || custoHa === 0) {
        return { 
            receitaTotal: 0, 
            custoTotal: 0, 
            lucroLiquido: 0, 
            roi: 0, 
            pontoEquilibrio: 0,
            margemLiquida: 0,
            cenarioPessimista: 0
        };
    }

    // 1. Totais Financeiros
    const custoTotal = custoHa * ha;
    const producaoTotalSacas = prod * ha;
    const receitaTotal = producaoTotalSacas * preco;
    
    // 2. Resultado
    const lucroLiquido = receitaTotal - custoTotal;

    // 3. Indicadores
    // ROI = (Lucro / Custo) * 100
    const roi = (lucroLiquido / custoTotal) * 100;
    
    // Margem Líquida = (Lucro / Receita) * 100
    const margemLiquida = (lucroLiquido / receitaTotal) * 100;

    // 4. Ponto de Equilíbrio (Quantas sacas/ha para pagar a conta?)
    // CustoHa / PreçoSaca
    const pontoEquilibrio = custoHa / preco;

    // 5. Cenário de Estresse (Queda de 10% no preço e 10% na produtividade)
    const receitaEstresse = (producaoTotalSacas * 0.9) * (preco * 0.9);
    const lucroEstresse = receitaEstresse - custoTotal;

    return {
        receitaTotal,
        custoTotal,
        lucroLiquido,
        roi,
        pontoEquilibrio,
        margemLiquida,
        cenarioPessimista: lucroEstresse
    };
  }, [area, produtividade, precoVenda, custoPorHa]);

  // FORMATAÇÃO
  const fmtMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(v);
  const fmtPct = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(v) + '%';

  const shareText = `💰 *Análise de ROI - ${talhao || 'Cultura'}*\n\n🌱 *Produtividade:* ${produtividade} sc/ha\n💵 *Preço:* ${fmtMoeda(Number(precoVenda))}/sc\n\n📈 *ROI:* ${fmtPct(resultados.roi)}\n✅ *Lucro:* ${fmtMoeda(resultados.lucroLiquido)}\n⚖️ *Ponto de Equilíbrio:* ${fmtNum(resultados.pontoEquilibrio)} sc/ha`;

  return (
    <CalculatorLayout
      title="ROI por Cultura"
      subtitle="Viabilidade econômica, ponto de equilíbrio e análise de sensibilidade."
      category="Financeiro e Mercado"
      icon={<TrendingUp size={16} />}
      produtor={produtor}
      setProdutor={setProdutor}
      talhao={talhao}
      setTalhao={setTalhao}
      shareText={shareText}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- INPUTS --- */}
        <div className="lg:col-span-7 space-y-6">
           
           {/* Seção 1: Dados de Produção */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><Sprout size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">1. Produção Estimada</h3>
                    <p className="text-xs text-slate-400">Escala e rendimento da lavoura</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <InputGroup label="Área Plantada" icon={<LandPlot size={16}/>} value={area} onChange={setArea} placeholder="Ex: 500" suffix="ha" />
                 <InputGroup label="Produtividade Meta" icon={<Scale size={16}/>} value={produtividade} onChange={setProdutividade} placeholder="Ex: 65" suffix="sc/ha" />
              </div>
           </section>

           {/* Seção 2: Mercado e Custos */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><DollarSign size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">2. Mercado e Custos</h3>
                    <p className="text-xs text-slate-400">Preços e custo de produção</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <InputGroup label="Preço de Venda (Médio)" icon={<TrendingUp size={16}/>} value={precoVenda} onChange={setPrecoVenda} placeholder="Ex: 135.00" suffix="R$/sc" />
                 <InputGroup label="Custo Total por Ha" icon={<PieChart size={16}/>} value={custoPorHa} onChange={setCustoPorHa} placeholder="Ex: 5500.00" suffix="R$/ha" />
              </div>
              <p className="text-[10px] text-slate-400 mt-3 text-right">
                  *Inclua insumos, operações e custos fixos no Custo por Ha.
              </p>
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
                      <h3 className="text-xl font-black text-slate-900 mb-2">Análise Financeira Bloqueada</h3>
                      <button 
                        onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 hover:scale-105"
                      >
                        Ver Rentabilidade <ArrowRight size={16}/>
                      </button>
                   </div>
                 )}

                 <div className={`space-y-6 transition-all duration-500 ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>
                    
                    {/* Card Principal: ROI */}
                    <div className={`print-card text-white rounded-xl p-8 shadow-xl relative overflow-hidden ${resultados.roi >= 0 ? 'bg-slate-900' : 'bg-red-900'}`}>
                        {/* Background Effect */}
                        <div className={`absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${resultados.roi >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>

                        <div className="relative z-10 text-center">
                            <p className={`font-bold uppercase tracking-wider text-xs mb-4 ${resultados.roi >= 0 ? 'text-emerald-400' : 'text-red-300'}`}>
                                Retorno sobre Investimento (ROI)
                            </p>
                            
                            <div className="relative inline-block mb-2">
                                <span className="text-6xl font-black tracking-tighter text-white">
                                    {fmtNum(resultados.roi)}
                                </span>
                                <span className="text-3xl font-medium text-slate-300">%</span>
                            </div>

                            <div className="flex justify-center gap-2 mt-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${resultados.roi >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-200'}`}>
                                    {resultados.roi >= 0 ? 'Lucrativo' : 'Prejuízo'}
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
                                    Margem: {fmtNum(resultados.margemLiquida)}%
                                </span>
                            </div>

                            <div className="mt-8 border-t border-white/10 pt-6">
                                <div className="flex justify-between items-end">
                                    <div className="text-left">
                                        <p className="text-[10px] text-slate-400 uppercase">Lucro Líquido Total</p>
                                        <p className="text-2xl font-bold text-white">{fmtMoeda(resultados.lucroLiquido)}</p>
                                    </div>
                                    <div className="text-right">
                                         <p className="text-[10px] text-slate-400 uppercase">Por Hectare</p>
                                         <p className="text-lg font-medium text-emerald-400">
                                            {Number(area) > 0 ? fmtMoeda(resultados.lucroLiquido / Number(area)) : 'R$ 0,00'}
                                         </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card Secundário: PONTO DE EQUILÍBRIO */}
                    <div className="print-card bg-white border border-slate-200 rounded-xl p-6 shadow-lg relative">
                        <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
                             <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Scale size={20} /></div>
                             <div>
                                <h4 className="font-bold text-slate-800 text-sm">Ponto de Equilíbrio</h4>
                                <p className="text-[10px] text-slate-400">Obrigatório para pagar os custos</p>
                             </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="block text-3xl font-black text-slate-900">{fmtNum(resultados.pontoEquilibrio)}</span>
                                <span className="text-[10px] text-slate-500 font-bold uppercase">Sacas / Ha</span>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-500 mb-1">
                                    Sua Produção: <strong>{produtividade} sc/ha</strong>
                                </div>
                                <div className={`text-xs font-bold px-2 py-1 rounded ${Number(produtividade) > resultados.pontoEquilibrio ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                    {Number(produtividade) > resultados.pontoEquilibrio 
                                        ? `Folga de ${fmtNum(Number(produtividade) - resultados.pontoEquilibrio)} sc/ha` 
                                        : `Faltam ${fmtNum(resultados.pontoEquilibrio - Number(produtividade))} sc/ha`
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card Terciário: ANÁLISE DE SENSIBILIDADE */}
                    {resultados.roi > 0 && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 relative">
                            <div className="flex gap-3 items-center mb-3">
                                <AlertTriangle size={18} className="text-slate-400"/>
                                <p className="text-xs font-bold text-slate-700 uppercase">Cenário Pessimista</p>
                            </div>
                            <p className="text-xs text-slate-500 mb-2 leading-relaxed">
                                Se o preço cair <strong>10%</strong> e a produção cair <strong>10%</strong>, seu resultado será:
                            </p>
                            <div className={`text-xl font-black ${resultados.cenarioPessimista > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {fmtMoeda(resultados.cenarioPessimista)}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">
                                {resultados.cenarioPessimista > 0 ? "Ainda lucra, mas com margem apertada." : "Entraria em prejuízo."}
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
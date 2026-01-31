"use client";

import { useState, useMemo } from "react";
import { 
  Wallet, 
  TrendingUp, 
  Scale, 
  ArrowRight, 
  Lock, 
  CircleDollarSign,
  Landmark,
  PiggyBank,
  AlertCircle
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

export default function CustoArrobaPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // ESTADOS
  const [produtor, setProdutor] = useState("");
  const [talhao, setTalhao] = useState("");

  // INPUTS - COMPRA (Boi Magro)
  const [pesoEntrada, setPesoEntrada] = useState<number | string>(""); // Arrobas
  const [precoCompra, setPrecoCompra] = useState<number | string>(""); // R$/@

  // INPUTS - CUSTOS
  const [custoProducao, setCustoProducao] = useState<number | string>(""); // R$/cabeça (Total do período)

  // INPUTS - VENDA (Boi Gordo)
  const [pesoSaida, setPesoSaida] = useState<number | string>(""); // Arrobas
  const [precoVenda, setPrecoVenda] = useState<number | string>(""); // R$/@ (Opcional)

  // CÁLCULOS
  const resultados = useMemo(() => {
    const pEntrada = Number(pesoEntrada) || 0;
    const vCompra = Number(precoCompra) || 0;
    const cProducao = Number(custoProducao) || 0;
    const pSaida = Number(pesoSaida) || 0;
    const vVenda = Number(precoVenda) || 0;

    if (pSaida === 0) return { custoTotalCabeca: 0, breakEven: 0, lucro: 0, roi: 0, custoCompraTotal: 0 };

    // 1. Custo de Aquisição (Boi Magro)
    const custoCompraTotal = pEntrada * vCompra;

    // 2. Custo Total do Animal (Aquisição + Produção)
    const custoTotalCabeca = custoCompraTotal + cProducao;

    // 3. Ponto de Equilíbrio (Break-Even)
    // Por quanto preciso vender cada @ final para pagar a conta?
    const breakEven = custoTotalCabeca / pSaida;

    // 4. Resultado (Se houver preço de venda)
    const receitaTotal = pSaida * vVenda;
    const lucro = receitaTotal - custoTotalCabeca;
    const roi = custoTotalCabeca > 0 ? (lucro / custoTotalCabeca) * 100 : 0;

    return {
        custoCompraTotal,
        custoTotalCabeca,
        breakEven,
        lucro,
        roi,
        temVenda: vVenda > 0
    };
  }, [pesoEntrada, precoCompra, custoProducao, pesoSaida, precoVenda]);

  // FORMATAÇÃO
  const fmtMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(v);

  const shareText = `💰 *Fechamento de Custo (@)*\n\n📉 *Custo de Equilíbrio:* ${fmtMoeda(resultados.breakEven)}/@\n🐂 *Custo Total:* ${fmtMoeda(resultados.custoTotalCabeca)}/cb\n\n${resultados.temVenda ? `✅ *Lucro Líquido:* ${fmtMoeda(resultados.lucro)}/cb\n📈 *ROI:* ${resultados.roi.toFixed(1)}%` : '⚠️ Simulação de custo (sem venda)'}`;

  return (
    <CalculatorLayout
      title="Custo da @ Final"
      subtitle="Cálculo do Ponto de Equilíbrio (Break-even) e Lucratividade."
      category="Gestão Financeira"
      icon={<Wallet size={16} />}
      produtor={produtor}
      setProdutor={setProdutor}
      talhao={talhao}
      setTalhao={setTalhao}
      shareText={shareText}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- INPUTS --- */}
        <div className="lg:col-span-7 space-y-6">
           
           {/* Seção 1: Compra e Produção */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-slate-100 text-slate-700 rounded-lg"><Landmark size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">1. Estrutura de Custos</h3>
                    <p className="text-xs text-slate-400">Aquisição e investimento no animal</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <InputGroup label="Peso Entrada (@)" icon={<Scale size={16}/>} value={pesoEntrada} onChange={setPesoEntrada} placeholder="Ex: 12" suffix="@" />
                 <InputGroup label="Preço Compra (R$/@)" icon={<CircleDollarSign size={16}/>} value={precoCompra} onChange={setPrecoCompra} placeholder="Ex: 280.00" suffix="R$" />
                 <div className="col-span-1 md:col-span-2">
                    <InputGroup 
                        label="Custo Produção Total (R$/cb)" 
                        icon={<Wallet size={16}/>} 
                        value={custoProducao} 
                        onChange={setCustoProducao} 
                        placeholder="Ex: 1200.00 (Nutrição + Sanitário + Operacional)" 
                        suffix="R$"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 ml-1">Some nutrição, sanidade e custos fixos por cabeça no período.</p>
                 </div>
              </div>
           </section>

           {/* Seção 2: Venda (Simulação) */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><TrendingUp size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">2. Projeção de Venda</h3>
                    <p className="text-xs text-slate-400">Dados do abate/saída</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <InputGroup label="Peso Final (@)" icon={<Scale size={16}/>} value={pesoSaida} onChange={setPesoSaida} placeholder="Ex: 21" suffix="@" />
                 <InputGroup label="Preço Venda (R$/@)" icon={<CircleDollarSign size={16}/>} value={precoVenda} onChange={setPrecoVenda} placeholder="Ex: 290.00" suffix="R$" />
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
                      <h3 className="text-xl font-black text-slate-900 mb-2">Financeiro Bloqueado</h3>
                      <button 
                        onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 hover:scale-105"
                      >
                        Ver Lucratividade <ArrowRight size={16}/>
                      </button>
                   </div>
                 )}

                 <div className={`space-y-6 transition-all duration-500 ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>
                    
                    {/* Card Principal: PONTO DE EQUILÍBRIO */}
                    <div className="print-card bg-slate-900 text-white rounded-xl p-8 shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-emerald-400 font-bold uppercase tracking-wider text-xs mb-1">
                                Custo da @ Final (Break-even)
                            </p>
                            <p className="text-slate-400 text-[10px] mb-6">
                                Preço mínimo de venda para não ter prejuízo
                            </p>

                            <div className="flex items-end gap-3 mb-6">
                                <span className="text-5xl font-black tracking-tighter text-white">
                                    {fmtMoeda(resultados.breakEven)}
                                </span>
                                <div className="mb-2">
                                    <span className="text-lg font-medium text-slate-300 block">/@</span>
                                </div>
                            </div>

                            {/* Detalhamento do Custo Total */}
                            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                                <div className="flex justify-between items-center text-xs text-slate-300 mb-1">
                                    <span>Custo Total do Animal</span>
                                    <span className="font-bold text-white">{fmtMoeda(resultados.custoTotalCabeca)}</span>
                                </div>
                                {/* Barra Visual de Composição */}
                                <div className="flex h-1.5 w-full rounded-full overflow-hidden mt-2">
                                    {/* Compra */}
                                    <div 
                                        className="bg-blue-500" 
                                        style={{ width: `${(resultados.custoCompraTotal / resultados.custoTotalCabeca) * 100}%` }} 
                                        title="Custo de Aquisição"
                                    ></div>
                                    {/* Produção */}
                                    <div 
                                        className="bg-amber-500" 
                                        style={{ width: `${100 - ((resultados.custoCompraTotal / resultados.custoTotalCabeca) * 100)}%` }}
                                        title="Custo de Produção"
                                    ></div>
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Aquisição</span>
                                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Produção</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card Secundário: RESULTADO FINANCEIRO (Se tiver venda) */}
                    <div className="print-card bg-white border border-slate-200 rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                <PiggyBank size={18} className="text-emerald-600"/> Resultado da Venda
                            </h4>
                            {resultados.temVenda ? (
                                <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${resultados.lucro >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                    {resultados.lucro >= 0 ? 'Lucro' : 'Prejuízo'}
                                </span>
                            ) : (
                                <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-1 rounded-full uppercase">Simulação</span>
                            )}
                        </div>

                        {resultados.temVenda ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                                    <span className="text-xs text-slate-500 font-bold uppercase">Lucro Líquido</span>
                                    <span className={`text-2xl font-black ${resultados.lucro >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {fmtMoeda(resultados.lucro)}
                                        <span className="text-xs text-slate-400 font-medium ml-1">/cb</span>
                                    </span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-slate-500 font-bold uppercase">Retorno (ROI)</span>
                                    <span className={`text-lg font-bold ${resultados.roi >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {resultados.roi.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 text-slate-400 text-xs flex flex-col items-center gap-2 bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                                <AlertCircle size={20}/>
                                Preencha o "Preço de Venda" para calcular o Lucro e ROI.
                            </div>
                        )}
                    </div>

                 </div>
            </div>
        </div>

      </div>
    </CalculatorLayout>
  );
}
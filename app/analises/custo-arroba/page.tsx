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
  AlertCircle,
  Beef,
  Calculator,
  ClipboardList
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CalculatorLayout } from "@/app/components/CalculatorLayout";

// --- TIPAGEM E COMPONENTES VISUAIS ---

// 1. INPUTS
interface InputGroupProps {
  label: string;
  icon: React.ReactNode;
  value: string | number;
  onChange: (val: string) => void;
  placeholder?: string;
  step?: string;
  suffix?: string;
  helperText?: string;
}

const InputGroup = ({ label, icon, value, onChange, placeholder = "0", suffix, step = "0.01", helperText }: InputGroupProps) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1.5">
       {label}
    </label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors font-bold text-sm">
        {icon}
      </div>
      <input 
        type="number" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder}
        step={step}
        onWheel={(e) => e.currentTarget.blur()}
        className="w-full pl-9 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 font-semibold placeholder:text-slate-300 shadow-sm"
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
            {suffix}
        </div>
      )}
    </div>
    {helperText && <p className="text-[10px] text-slate-400 leading-tight">{helperText}</p>}
  </div>
);

// 2. TABELA TÉCNICA
interface TechnicalTableRow {
  label: string;
  value: string | number;
  unit: string;
  isHeader?: boolean;
}

interface TechnicalTableProps {
  title: string;
  rows: TechnicalTableRow[];
}

const TechnicalTable = ({ title, rows }: TechnicalTableProps) => {
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

export default function CustoArrobaPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // ESTADOS
  const [produtor, setProdutor] = useState("");
  const [talhao, setTalhao] = useState("");

  // INPUTS - COMPRA (Boi Magro)
  const [pesoEntrada, setPesoEntrada] = useState<number | string>(""); 
  const [precoCompra, setPrecoCompra] = useState<number | string>(""); 

  // INPUTS - CUSTOS
  const [custoProducao, setCustoProducao] = useState<number | string>(""); 

  // INPUTS - VENDA (Boi Gordo)
  const [pesoSaida, setPesoSaida] = useState<number | string>(""); 
  const [precoVenda, setPrecoVenda] = useState<number | string>(""); 

  // CÁLCULOS
  const resultados = useMemo(() => {
    const pEntrada = Number(pesoEntrada) || 0;
    const vCompra = Number(precoCompra) || 0;
    const cProducao = Number(custoProducao) || 0;
    const pSaida = Number(pesoSaida) || 0;
    const vVenda = Number(precoVenda) || 0;

    if (pSaida === 0) return { custoTotalCabeca: 0, breakEven: 0, lucro: 0, roi: 0, custoCompraTotal: 0, temVenda: false };

    // 1. Custo de Aquisição (Boi Magro)
    const custoCompraTotal = pEntrada * vCompra;

    // 2. Custo Total do Animal
    const custoTotalCabeca = custoCompraTotal + cProducao;

    // 3. Ponto de Equilíbrio (Break-Even)
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
      subtitle="Descubra seu Ponto de Equilíbrio (Break-even) e analise a viabilidade da engorda."
      category="Gestão Pecuária"
      icon={<Wallet size={16} />}
      produtor={produtor}
      setProdutor={setProdutor}
      talhao={talhao}
      setTalhao={setTalhao}
      shareText={shareText}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
        
        {/* --- COLUNA ESQUERDA: INPUTS --- */}
        <div className="lg:col-span-7 space-y-6 print:space-y-4">
           
           {/* Seção 1: Aquisição */}
           <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shadow-sm border border-blue-200">
                     <Beef size={20} />
                 </div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">1. Aquisição (Boi Magro)</h3>
                    <p className="text-xs text-slate-400 font-medium">Dados de entrada do animal</p>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <InputGroup label="Peso Entrada" icon={<Scale size={14}/>} value={pesoEntrada} onChange={setPesoEntrada} placeholder="0.0" suffix="@" />
                 <InputGroup label="Preço Compra" icon={<CircleDollarSign size={14}/>} value={precoCompra} onChange={setPrecoCompra} placeholder="0.00" suffix="R$/@" />
              </div>
           </section>

           {/* Seção 2: Produção */}
           <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shadow-sm border border-amber-200">
                     <Wallet size={20} />
                 </div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">2. Custo Operacional</h3>
                    <p className="text-xs text-slate-400 font-medium">Investimento durante o período</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                 <InputGroup 
                    label="Custo Produção (Total)" 
                    icon={<Calculator size={14}/>} 
                    value={custoProducao} 
                    onChange={setCustoProducao} 
                    placeholder="0.00" 
                    suffix="R$/cb"
                    helperText="Some aqui: Nutrição, Sanitário, Funcionários e Custos Fixos diluídos por cabeça."
                 />
              </div>
           </section>

           {/* Seção 3: Venda */}
           <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm border border-emerald-200">
                     <TrendingUp size={20} />
                 </div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">3. Saída (Abate)</h3>
                    <p className="text-xs text-slate-400 font-medium">Projeção de peso e preço final</p>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <InputGroup label="Peso Final" icon={<Scale size={14}/>} value={pesoSaida} onChange={setPesoSaida} placeholder="0.0" suffix="@" />
                 <InputGroup label="Preço Venda" icon={<CircleDollarSign size={14}/>} value={precoVenda} onChange={setPrecoVenda} placeholder="0.00" suffix="R$/@" />
              </div>
           </section>

           {/* Visual Impressão (Inputs) */}
           <div className="hidden print:block">
              <TechnicalTable 
                 title="Parâmetros de Entrada"
                 rows={[
                    { label: "Peso Entrada", value: pesoEntrada, unit: "@" },
                    { label: "Preço Compra", value: fmtMoeda(Number(precoCompra)), unit: "/@" },
                    { label: "Custo Operacional Total", value: fmtMoeda(Number(custoProducao)), unit: "/cb" },
                    { label: "Peso Saída (Final)", value: pesoSaida, unit: "@" },
                    { label: "Preço Venda Estimado", value: fmtMoeda(Number(precoVenda)), unit: "/@" },
                 ]}
              />
           </div>
        </div>

        {/* --- COLUNA DIREITA: RESULTADOS --- */}
        <div className="lg:col-span-5 relative">
            <div className="sticky top-6 print:static space-y-6">

             {/* OVERLAY BLOQUEIO */}
             {!isAuthenticated && (
               <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200 shadow-lg h-full print:hidden">
                  <div className="bg-slate-900 text-emerald-400 p-4 rounded-full mb-4 shadow-xl animate-pulse">
                     <Lock size={32} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">Análise Bloqueada</h3>
                  <button 
                    onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 hover:scale-105"
                  >
                    Ver Lucratividade <ArrowRight size={16}/>
                  </button>
               </div>
             )}

             <div className={`space-y-6 transition-all duration-500 print:hidden ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>
                
                {/* Card Principal: BREAK-EVEN (Dark Theme) */}
                <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                   <div className="relative z-10">
                       <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 mb-4">
                           <Landmark size={12} className="text-emerald-400"/>
                           <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Ponto de Equilíbrio (Break-Even)</span>
                       </div>
                       
                       <div className="mb-6 flex items-baseline gap-2">
                           <span className="text-5xl font-black tracking-tighter text-white block">
                               {fmtMoeda(resultados.breakEven)}
                           </span>
                           <span className="text-lg font-medium text-slate-400">/@</span>
                       </div>
                       <p className="text-xs text-slate-400 mb-6">
                           Você precisa vender acima deste valor para cobrir todos os custos.
                       </p>

                       {/* Barra de Composição de Custo */}
                       <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                           <div className="flex justify-between items-center text-xs text-slate-300 mb-2">
                               <span>Custo Total: <strong className="text-white">{fmtMoeda(resultados.custoTotalCabeca)}</strong></span>
                           </div>
                           
                           {resultados.custoTotalCabeca > 0 && (
                               <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-700">
                                   <div 
                                      className="bg-blue-500 hover:bg-blue-400 transition-colors" 
                                      style={{ width: `${(resultados.custoCompraTotal / resultados.custoTotalCabeca) * 100}%` }} 
                                      title={`Aquisição: ${fmtMoeda(resultados.custoCompraTotal)}`}
                                   ></div>
                                   <div 
                                      className="bg-amber-500 hover:bg-amber-400 transition-colors" 
                                      style={{ width: `${100 - ((resultados.custoCompraTotal / resultados.custoTotalCabeca) * 100)}%` }}
                                      title={`Operacional: ${fmtMoeda(Number(custoProducao))}`}
                                   ></div>
                               </div>
                           )}

                           <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-wide">
                               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Boi Magro</div>
                               <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Operacional</div>
                           </div>
                       </div>
                   </div>
                </div>

                {/* Card Secundário: RESULTADO DA VENDA */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                            <PiggyBank className="text-emerald-600" size={18}/>
                            <h4 className="font-bold text-slate-800 text-sm">Resultado Financeiro</h4>
                        </div>
                        {resultados.temVenda ? (
                            <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wide ${resultados.lucro >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {resultados.lucro >= 0 ? 'Lucro' : 'Prejuízo'}
                            </span>
                        ) : (
                            <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-1 rounded-full uppercase font-bold">Aguardando Preço</span>
                        )}
                    </div>

                    {resultados.temVenda ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-xs text-slate-500 font-bold uppercase">Lucro Líquido</span>
                                <span className={`text-3xl font-black tracking-tight ${resultados.lucro >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {fmtMoeda(resultados.lucro)}
                                    <span className="text-xs text-slate-400 font-medium ml-1">/cb</span>
                                </span>
                            </div>
                            
                            <div className="bg-slate-50 rounded-lg p-3 flex justify-between items-center border border-slate-100">
                                <span className="text-xs text-slate-500 font-bold uppercase flex gap-1 items-center">
                                    <TrendingUp size={14}/> ROI (Retorno)
                                </span>
                                <span className={`text-sm font-bold ${resultados.roi >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {resultados.roi > 0 ? '+' : ''}{resultados.roi.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400 text-xs flex flex-col items-center gap-2">
                            <AlertCircle size={24} className="text-slate-300 mb-1"/>
                            Preencha o "Preço de Venda" <br/> para calcular o Lucro Real e ROI.
                        </div>
                    )}
                </div>
             </div>

             {/* VISUAL IMPRESSÃO (Tabelas) */}
             <div className="hidden print:block space-y-4">
                <TechnicalTable 
                  title="Detalhamento de Custos"
                  rows={[
                    { label: "Custo Aquisição (Boi Magro)", value: fmtMoeda(resultados.custoCompraTotal), unit: "" },
                    { label: "Custo Produção (Operacional)", value: fmtMoeda(Number(custoProducao)), unit: "" },
                    { label: "Custo Total por Cabeça", value: fmtMoeda(resultados.custoTotalCabeca), unit: "", isHeader: true },
                    { label: "Ponto de Equilíbrio (@)", value: fmtMoeda(resultados.breakEven), unit: "/@", isHeader: true },
                  ]}
                />

                {resultados.temVenda && (
                    <TechnicalTable 
                      title="Análise de Lucratividade"
                      rows={[
                        { label: "Receita Bruta", value: fmtMoeda(Number(pesoSaida) * Number(precoVenda)), unit: "" },
                        { label: "Lucro Líquido", value: fmtMoeda(resultados.lucro), unit: "/cb" },
                        { label: "Margem ROI", value: resultados.roi.toFixed(2), unit: "%", isHeader: true },
                      ]}
                    />
                )}
             </div>

            </div>
        </div>

      </div>
    </CalculatorLayout>
  );
}
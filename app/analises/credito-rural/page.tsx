"use client";

import { useState, useMemo } from "react";
import { 
  Landmark, 
  ScrollText, 
  Coins, 
  ArrowRight, 
  Lock, 
  Percent,
  Sprout,
  AlertCircle,
  Tractor,
  TrendingUp,
  Receipt,
  ClipboardList
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CalculatorLayout } from "@/app/components/CalculatorLayout";

// --- COMPONENTES VISUAIS ---

// 1. INPUTS (Padrão Unificado - Emerald Theme)
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

// 2. TABELA TÉCNICA (Impressão)
const TechnicalTable = ({ title, rows }: { title: string, rows: any[] }) => {
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

export default function CreditoRuralPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // ESTADOS
  const [produtor, setProdutor] = useState("");
  const [talhao, setTalhao] = useState(""); // Finalidade

  // INPUTS - EMPRÉSTIMO
  const [valorSolicitado, setValorSolicitado] = useState<number | string>(""); 
  const [taxaJurosAnual, setTaxaJurosAnual] = useState<number | string>(""); 
  const [prazoMeses, setPrazoMeses] = useState<number | string>(""); 

  // INPUTS - CUSTOS ACESSÓRIOS
  const [taxasAdicionais, setTaxasAdicionais] = useState<number | string>(""); 

  // INPUTS - MERCADO
  const [precoSacaFuturo, setPrecoSacaFuturo] = useState<number | string>(""); 

  // CÁLCULOS
  const resultados = useMemo(() => {
    const principal = Number(valorSolicitado) || 0;
    const jurosAA = Number(taxaJurosAnual) || 0;
    const meses = Number(prazoMeses) || 0;
    const taxasExtrasPct = Number(taxasAdicionais) || 0;
    const preco = Number(precoSacaFuturo) || 0;

    if (principal === 0) {
        return { montanteFinal: 0, jurosNominal: 0, custoTotalExtras: 0, sacasParaQuitar: 0, custoEmSacas: 0, cet: 0 };
    }

    // 1. Juros Compostos (Equivalência Mensal)
    const taxaMensal = Math.pow(1 + (jurosAA / 100), 1/12) - 1;
    const montanteJuros = principal * Math.pow(1 + taxaMensal, meses);
    const jurosNominal = montanteJuros - principal;

    // 2. Custos Adicionais (Flat sobre principal)
    const custoTotalExtras = principal * (taxasExtrasPct / 100);

    // 3. Totais
    const montanteFinal = principal + jurosNominal + custoTotalExtras;

    // 4. Barter (Sacas)
    const sacasParaQuitar = preco > 0 ? montanteFinal / preco : 0;
    const sacasPrincipal = preco > 0 ? principal / preco : 0;
    const custoEmSacas = sacasParaQuitar - sacasPrincipal;

    // 5. CET Simplificado (% do período)
    const cet = ((montanteFinal - principal) / principal) * 100;

    return { montanteFinal, jurosNominal, custoTotalExtras, sacasParaQuitar, custoEmSacas, cet };
  }, [valorSolicitado, taxaJurosAnual, prazoMeses, taxasAdicionais, precoSacaFuturo]);

  // FORMATAÇÃO
  const fmtMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(v);

  const shareText = `🏦 *Simulação Crédito Rural*\n\n💰 *Valor:* ${fmtMoeda(Number(valorSolicitado))}\n📅 *Prazo:* ${prazoMeses} meses\n\n📊 *A Pagar:* ${fmtMoeda(resultados.montanteFinal)}\n🌾 *Custo em Produto:* ${fmtNum(resultados.sacasParaQuitar)} sacas\n(Considerando soja a ${fmtMoeda(Number(precoSacaFuturo))})`;

  return (
    <CalculatorLayout
      title="Custo do Crédito Rural"
      subtitle="Simule o custo efetivo de empréstimos (Custeio/Investimento) e converta sua dívida para sacas."
      category="Financeiro"
      icon={<Landmark size={16} />}
      produtor={produtor}
      setProdutor={setProdutor}
      talhao={talhao}
      setTalhao={setTalhao}
      shareText={shareText}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
        
        {/* --- COLUNA ESQUERDA: INPUTS --- */}
        <div className="lg:col-span-7 space-y-6 print:space-y-4">
           
           {/* Seção 1: Condições */}
           <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm border border-emerald-200">
                     <ScrollText size={20} />
                 </div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">Condições do Contrato</h3>
                    <p className="text-xs text-slate-400 font-medium">Dados do Banco ou Plano Safra</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 mb-4">
                 <InputGroup label="Principal Solicitado" icon={<Coins size={14}/>} value={valorSolicitado} onChange={setValorSolicitado} placeholder="0.00" suffix="R$" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <InputGroup label="Taxa de Juros (a.a.)" icon={<Percent size={14}/>} value={taxaJurosAnual} onChange={setTaxaJurosAnual} placeholder="0.00" suffix="%" />
                 <InputGroup label="Prazo Vencimento" icon={<Tractor size={14}/>} value={prazoMeses} onChange={setPrazoMeses} placeholder="0" suffix="meses" />
              </div>
           </section>

           {/* Seção 2: Custos Extras */}
           <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shadow-sm border border-amber-200">
                     <Receipt size={20} />
                 </div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">Custos Acessórios & Mercado</h3>
                    <p className="text-xs text-slate-400 font-medium">Taxas ocultas e projeção de venda</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <InputGroup 
                    label="Outras Taxas (Total)" 
                    icon={<AlertCircle size={14}/>} 
                    value={taxasAdicionais} 
                    onChange={setTaxasAdicionais} 
                    placeholder="0.00" 
                    suffix="%" 
                    helperText="Some aqui: IOF, Seguro, Proagro, TAC e Taxa Flat."
                 />
                 <InputGroup 
                    label="Preço Futuro (Estimado)" 
                    icon={<Sprout size={14}/>} 
                    value={precoSacaFuturo} 
                    onChange={setPrecoSacaFuturo} 
                    placeholder="0.00" 
                    suffix="R$/sc"
                    helperText="Preço esperado para a venda na colheita."
                 />
              </div>
           </section>

           {/* Visual Impressão (Inputs) */}
           <div className="hidden print:block">
              <TechnicalTable 
                 title="Parâmetros do Financiamento"
                 rows={[
                    { label: "Valor Principal", value: fmtMoeda(Number(valorSolicitado)), unit: "" },
                    { label: "Taxa de Juros", value: taxaJurosAnual, unit: "% a.a." },
                    { label: "Prazo", value: prazoMeses, unit: "meses" },
                    { label: "Taxas Acessórias (IOF/Seguro)", value: taxasAdicionais, unit: "%" },
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
                  <h3 className="text-xl font-black text-slate-900 mb-2">Simulação Bloqueada</h3>
                  <button 
                    onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 hover:scale-105"
                  >
                    Calcular Custo <ArrowRight size={16}/>
                  </button>
               </div>
             )}

             <div className={`space-y-6 transition-all duration-500 print:hidden ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>
                
                {/* Card Principal: TOTAL A PAGAR (Dark Emerald Theme) */}
                <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-2xl shadow-emerald-900/20 relative overflow-hidden">
                   {/* Background Effect */}
                   <div className="absolute top-0 right-0 p-32 bg-emerald-600 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20 pointer-events-none"></div>

                   <div className="relative z-10">
                       <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 mb-4">
                           <TrendingUp size={12} className="text-emerald-400"/>
                           <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Montante Final Devido</span>
                       </div>
                       
                       <div className="mb-6">
                           <span className="text-5xl font-black tracking-tighter text-white block">
                               {fmtMoeda(resultados.montanteFinal)}
                           </span>
                           <span className="text-sm font-medium text-slate-400 mt-2 block">
                               CET do Período: <span className="text-emerald-400 font-bold">{resultados.cet.toFixed(2)}%</span>
                           </span>
                       </div>

                       <div className="flex gap-2 border-t border-slate-800 pt-6 overflow-x-auto">
                           <div className="flex-1 min-w-[100px]">
                               <span className="block text-xs text-slate-500 uppercase font-bold">Principal</span>
                               <span className="text-sm font-bold text-white">{fmtMoeda(Number(valorSolicitado))}</span>
                           </div>
                           <div className="flex-1 min-w-[100px]">
                               <span className="block text-xs text-slate-500 uppercase font-bold">Juros</span>
                               <span className="text-sm font-bold text-emerald-200">{fmtMoeda(resultados.jurosNominal)}</span>
                           </div>
                           <div className="flex-1 min-w-[100px]">
                               <span className="block text-xs text-slate-500 uppercase font-bold">Taxas</span>
                               <span className="text-sm font-bold text-amber-200">{fmtMoeda(resultados.custoTotalExtras)}</span>
                           </div>
                       </div>
                   </div>
                </div>

                {/* Card Secundário: CUSTO EM SACAS */}
                {Number(precoSacaFuturo) > 0 && (
                    <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-2xl p-6 shadow-sm relative">
                        <div className="flex items-center gap-2 mb-6 border-b border-emerald-100 pb-3">
                            <Sprout className="text-emerald-600" size={18}/>
                            <h4 className="font-bold text-emerald-900 text-sm">Equivalência em Produto (Barter)</h4>
                        </div>

                        <div className="flex items-center justify-between px-2">
                            <div>
                                <span className="block text-4xl font-black text-slate-800">{fmtNum(resultados.sacasParaQuitar)}</span>
                                <span className="text-[10px] text-slate-500 uppercase font-bold">Sacas Comprometidas</span>
                            </div>
                            
                            <div className="text-right">
                                <div className="inline-block bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-bold mb-1">
                                    {fmtNum(resultados.custoEmSacas)} sc
                                </div>
                                <p className="text-[10px] text-slate-500">são apenas custo financeiro</p>
                            </div>
                        </div>

                        {/* Dica de Hedge */}
                        <div className="mt-4 p-3 bg-amber-50/50 border border-amber-100 rounded-lg flex gap-3">
                            <Lock className="text-amber-500 shrink-0 mt-0.5" size={16} />
                            <p className="text-xs text-amber-800 leading-relaxed">
                                <strong className="font-bold">Recomendação:</strong> Considere travar o preço de pelo menos {fmtNum(resultados.sacasParaQuitar)} sacas para mitigar o risco de queda no mercado futuro.
                            </p>
                        </div>
                    </div>
                )}
             </div>

             {/* VISUAL IMPRESSÃO (Tabelas de Resultado) */}
             <div className="hidden print:block space-y-4">
                <TechnicalTable 
                  title="Detalhamento Financeiro"
                  rows={[
                    { label: "Principal (Valor Líquido)", value: fmtMoeda(Number(valorSolicitado)), unit: "" },
                    { label: "Juros do Período", value: fmtMoeda(resultados.jurosNominal), unit: "" },
                    { label: "Custos Acessórios (Taxas)", value: fmtMoeda(resultados.custoTotalExtras), unit: "" },
                    { label: "Montante Total a Pagar", value: fmtMoeda(resultados.montanteFinal), unit: "", isHeader: true },
                  ]}
                />

                {Number(precoSacaFuturo) > 0 && (
                    <TechnicalTable 
                      title="Análise de Viabilidade (Em Sacas)"
                      rows={[
                        { label: "Preço Futuro Estimado", value: fmtMoeda(Number(precoSacaFuturo)), unit: "/ sc" },
                        { label: "Sacas para cobrir Principal", value: fmtNum(Number(valorSolicitado) / Number(precoSacaFuturo)), unit: "sc" },
                        { label: "Sacas para cobrir Juros/Taxas", value: fmtNum(resultados.custoEmSacas), unit: "sc" },
                        { label: "Comprometimento Total", value: fmtNum(resultados.sacasParaQuitar), unit: "sc", isHeader: true },
                      ]}
                    />
                )}
                
                <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 text-[10px] text-slate-600 text-justify leading-snug">
                   <strong>Aviso Legal:</strong> Esta simulação considera juros compostos para o período informado e soma simples de taxas acessórias sobre o principal. O Custo Efetivo Total (CET) real pode variar conforme datas exatas de desembolso e amortização do contrato bancário.
                </div>
             </div>

            </div>
        </div>

      </div>
    </CalculatorLayout>
  );
}
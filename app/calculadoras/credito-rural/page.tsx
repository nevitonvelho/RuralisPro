"use client";

import { useState, useMemo } from "react";
import { 
  Landmark, // Banco
  ScrollText, // Contrato
  Coins, 
  ArrowRight, 
  Lock, 
  Percent,
  Sprout,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CalculatorLayout } from "@/app/components/CalculatorLayout";

// Interface para tipagem correta das props
interface InputGroupProps {
  label: string;
  icon: React.ReactNode;
  value: string | number;
  onChange: (val: string) => void;
  placeholder?: string;
  step?: string;
  suffix?: string;
}

// Input Padronizado com tipagem
const InputGroup = ({ label, icon, value, onChange, placeholder = "0", step="0.01", suffix }: InputGroupProps) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
        {icon}
      </div>
      <input 
        type="number" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder}
        step={step}
        className="w-full pl-10 pr-12 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all text-slate-900 font-medium placeholder:text-slate-300"
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
            {suffix}
        </div>
      )}
    </div>
  </div>
);

export default function CreditoRuralPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // ESTADOS
  const [produtor, setProdutor] = useState("");
  const [talhao, setTalhao] = useState(""); // Finalidade (Custeio, Investimento)

  // INPUTS - EMPRÉSTIMO
  const [valorSolicitado, setValorSolicitado] = useState<number | string>(""); // Principal
  const [taxaJurosAnual, setTaxaJurosAnual] = useState<number | string>(""); // % a.a.
  const [prazoMeses, setPrazoMeses] = useState<number | string>(""); // Meses até vencimento (Custeio) ou 12 (parcela anual)

  // INPUTS - CUSTOS ACESSÓRIOS (CET)
  const [taxasAdicionais, setTaxasAdicionais] = useState<number | string>(""); // % (IOF, Taxa Flat, Seguro, Proagro)

  // INPUTS - MERCADO (Conversão)
  const [precoSacaFuturo, setPrecoSacaFuturo] = useState<number | string>(""); // Preço estimado na colheita/vencimento

  // CÁLCULOS
  const resultados = useMemo(() => {
    const principal = Number(valorSolicitado) || 0;
    const jurosAA = Number(taxaJurosAnual) || 0;
    const meses = Number(prazoMeses) || 0;
    const taxasExtrasPct = Number(taxasAdicionais) || 0;
    const preco = Number(precoSacaFuturo) || 0;

    // CORREÇÃO AQUI: Adicionado 'custoEmSacas: 0' para igualar o tipo de retorno
    if (principal === 0) {
        return { 
            montanteFinal: 0, 
            jurosNominal: 0, 
            custoTotalExtras: 0, 
            sacasParaQuitar: 0, 
            custoEmSacas: 0, // Faltava essa propriedade aqui
            cet: 0 
        };
    }

    // 1. Cálculo de Juros
    // Taxa mensal equivalente
    const taxaMensal = Math.pow(1 + (jurosAA / 100), 1/12) - 1;
    
    // Montante apenas dos juros do período
    const montanteJuros = principal * Math.pow(1 + taxaMensal, meses);
    const jurosNominal = montanteJuros - principal;

    // 2. Custos Adicionais (Flat, IOF, Seguro aplicados sobre o Principal no início)
    const custoTotalExtras = principal * (taxasExtrasPct / 100);

    // 3. Montante Final a Pagar (Principal + Juros + Taxas)
    const montanteFinal = principal + jurosNominal + custoTotalExtras;

    // 4. Equivalência em Sacas
    const sacasParaQuitar = preco > 0 ? montanteFinal / preco : 0;
    const sacasPrincipal = preco > 0 ? principal / preco : 0;
    const custoEmSacas = sacasParaQuitar - sacasPrincipal;

    // 5. Custo Efetivo Total (CET) Simplificado em % do período
    const cet = ((montanteFinal - principal) / principal) * 100;

    return {
        montanteFinal,
        jurosNominal,
        custoTotalExtras,
        sacasParaQuitar,
        custoEmSacas,
        cet
    };
  }, [valorSolicitado, taxaJurosAnual, prazoMeses, taxasAdicionais, precoSacaFuturo]);

  // FORMATAÇÃO
  const fmtMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(v);
  const fmtPct = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(v) + '%';

  const shareText = `🏦 *Simulação Crédito Rural*\n\n💰 *Valor:* ${fmtMoeda(Number(valorSolicitado))}\n📅 *Prazo:* ${prazoMeses} meses\n\n📊 *A Pagar:* ${fmtMoeda(resultados.montanteFinal)}\n🌾 *Custo em Produto:* ${fmtNum(resultados.sacasParaQuitar)} sacas\n(Considerando soja a ${fmtMoeda(Number(precoSacaFuturo))})`;

  return (
    <CalculatorLayout
      title="Custo do Crédito Rural"
      subtitle="Calcule o montante final, taxas ocultas e quantas sacas são necessárias para quitar a dívida."
      category="Financeiro e Mercado"
      icon={<Landmark size={16} />}
      produtor={produtor}
      setProdutor={setProdutor}
      talhao={talhao}
      setTalhao={setTalhao}
      shareText={shareText}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- INPUTS --- */}
        <div className="lg:col-span-7 space-y-6">
           
           {/* Seção 1: Detalhes do Financiamento */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><ScrollText size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">1. Condições do Empréstimo</h3>
                    <p className="text-xs text-slate-400">Valores e taxas nominais (Banco/Plano Safra)</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 gap-5 mb-4">
                 <InputGroup label="Valor Solicitado" icon={<Coins size={16}/>} value={valorSolicitado} onChange={setValorSolicitado} placeholder="Ex: 500000.00" suffix="R$" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                 <InputGroup label="Taxa de Juros (Anual)" icon={<Percent size={16}/>} value={taxaJurosAnual} onChange={setTaxaJurosAnual} placeholder="Ex: 12.5" suffix="% a.a." />
                 <InputGroup label="Prazo para Pagamento" icon={<ScrollText size={16}/>} value={prazoMeses} onChange={setPrazoMeses} placeholder="Ex: 10" suffix="meses" />
              </div>
           </section>

           {/* Seção 2: Taxas Ocultas e Conversão */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><AlertCircle size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">2. Custos Extras e Mercado</h3>
                    <p className="text-xs text-slate-400">CET e equivalência em produto</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <InputGroup label="Outras Taxas (Seguro/IOF)" icon={<Percent size={16}/>} value={taxasAdicionais} onChange={setTaxasAdicionais} placeholder="Ex: 3.5" suffix="%" />
                 <InputGroup label="Preço da Saca (Futuro)" icon={<Sprout size={16}/>} value={precoSacaFuturo} onChange={setPrecoSacaFuturo} placeholder="Ex: 120.00" suffix="R$/sc" />
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                 *No campo "Outras Taxas", some TAC, Seguro, Proagro e IOF se houver.
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
                      <h3 className="text-xl font-black text-slate-900 mb-2">Simulação Bloqueada</h3>
                      <button 
                        onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 hover:scale-105"
                      >
                        Ver Custo Real <ArrowRight size={16}/>
                      </button>
                   </div>
                 )}

                 <div className={`space-y-6 transition-all duration-500 ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>
                    
                    {/* Card Principal: TOTAL A PAGAR */}
                    <div className="print-card bg-slate-900 text-white rounded-xl p-8 shadow-xl relative overflow-hidden">
                        {/* Background Effect */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="relative z-10">
                            <p className="text-emerald-400 font-bold uppercase tracking-wider text-xs mb-4">
                                Montante Final (Dívida Total)
                            </p>
                            
                            <div className="relative inline-block mb-2">
                                <span className="text-4xl font-black tracking-tighter text-white">
                                    {fmtMoeda(resultados.montanteFinal)}
                                </span>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300 border border-slate-700">
                                    Juros: {fmtMoeda(resultados.jurosNominal)}
                                </span>
                                <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300 border border-slate-700">
                                    Taxas: {fmtMoeda(resultados.custoTotalExtras)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Card Secundário: EQUIVALÊNCIA EM SACAS */}
                    {Number(precoSacaFuturo) > 0 && (
                        <div className="print-card bg-emerald-50 border border-emerald-200 rounded-xl p-6 shadow-lg relative">
                            <div className="flex items-center gap-3 mb-4 border-b border-emerald-100 pb-4">
                                <Sprout className="text-emerald-600" size={20}/>
                                <div>
                                    <h4 className="font-bold text-emerald-900 text-sm">Custo em Produto</h4>
                                    <p className="text-[10px] text-emerald-600">Quantas sacas comprometidas?</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="block text-3xl font-black text-slate-800">{fmtNum(resultados.sacasParaQuitar)}</span>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Sacas Totais</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-emerald-700 font-bold bg-emerald-200 px-2 py-1 rounded mb-1">
                                        +{fmtNum(resultados.custoEmSacas)} sc de Custo
                                    </div>
                                    <p className="text-[10px] text-slate-500">Juros consumiram essa quantia</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Card Terciário: DICA DE HEDGE */}
                    {Number(precoSacaFuturo) > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 relative">
                            <div className="flex gap-2 items-center mb-2 text-xs font-bold text-amber-800 uppercase">
                                <Lock size={14} /> Recomendação de Trava
                            </div>
                            <p className="text-xs text-amber-900 leading-relaxed">
                                Para não correr risco cambial ou de mercado, o ideal seria travar (vender futuro/barter) pelo menos <strong>{fmtNum(resultados.sacasParaQuitar)} sacas</strong> a {fmtMoeda(Number(precoSacaFuturo))}.
                            </p>
                            <p className="text-[10px] text-amber-700 mt-2">
                                *Se o preço cair para {fmtMoeda(Number(precoSacaFuturo) * 0.9)}, sua dívida subiria para {fmtNum(resultados.montanteFinal / (Number(precoSacaFuturo) * 0.9))} sacas.
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
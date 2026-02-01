"use client";

import { useState, useMemo, useEffect } from "react";
import {
  TrendingUp,
  Sprout,
  DollarSign,
  ArrowRight,
  Lock,
  PieChart,
  Scale,
  AlertTriangle,
  LandPlot,
  ClipboardList,
  Info
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CalculatorLayout } from "@/app/components/CalculatorLayout";

// --- COMPONENTES AUXILIARES ---

const TechnicalTable = ({ title, rows }: { title: string; rows: any[] }) => {
  if (!rows || rows.length === 0) return null;
  return (
    <div className="mt-4 mb-6 border border-slate-300 rounded-lg overflow-hidden avoid-break shadow-none break-inside-avoid print:rounded-none print:border-collapse print:border-slate-300">
      <div className="bg-slate-200 border-b border-slate-300 p-2 flex justify-between items-center print:bg-transparent print:border-b print:border-slate-300">
        <h3 className="font-bold text-xs uppercase text-black tracking-wider flex items-center gap-2">
          <span className="print:hidden"><ClipboardList size={14} /></span> {title}
        </h3>
      </div>
      <table className="w-full text-sm text-left print:border print:border-slate-300">
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-slate-300 last:border-0 bg-white print:border print:border-slate-300">
              {Object.values(row).map((val: any, i) => (
                <td key={i} className={`p-2 text-black ${i === 0 ? 'font-bold w-1/2' : 'font-medium text-right'} print:border-r print:border-slate-300 print:text-black`}>{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const InputGroup = ({ label, icon, value, onChange, placeholder = "0", step = "0.01", suffix }: any) => (
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

export default function RoiCulturaPage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // Estados dos Inputs
  const [produtor, setProdutor] = useState("");
  const [talhao, setTalhao] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [registro, setRegistro] = useState("");
  const [area, setArea] = useState<number | string>("");
  const [produtividade, setProdutividade] = useState<number | string>("");
  const [precoVenda, setPrecoVenda] = useState<number | string>("");
  const [custoPorHa, setCustoPorHa] = useState<number | string>("");

  // Garantir hidratação segura
  useEffect(() => {
    setMounted(true);
  }, []);

  // Formatações
  const fmtMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(v);

  // Cálculos
  const resultados = useMemo(() => {
    const ha = Number(area) || 0;
    const prod = Number(produtividade) || 0;
    const preco = Number(precoVenda) || 0;
    const custoHa = Number(custoPorHa) || 0;

    if (ha === 0 || prod === 0) return { roi: 0, lucroLiquido: 0, pontoEquilibrio: 0, margemLiquida: 0, cenarioPessimista: 0, rows: [] };

    const custoTotal = custoHa * ha;
    const receitaTotal = (prod * ha) * preco;
    const lucroLiquido = receitaTotal - custoTotal;
    const roi = custoTotal > 0 ? (lucroLiquido / custoTotal) * 100 : 0;
    const pontoEquilibrio = preco > 0 ? custoHa / preco : 0;
    const margemLiquida = receitaTotal > 0 ? (lucroLiquido / receitaTotal) * 100 : 0;

    // Cenário Pessimista: -10% Preço e -10% Produtividade
    const cenarioPessimista = ((prod * 0.9 * ha) * (preco * 0.9)) - custoTotal;

    return {
      roi, lucroLiquido, pontoEquilibrio, margemLiquida, cenarioPessimista,
      rows: [
        { "Indicador": "Área Total", "Valor": `${ha} ha` },
        { "Indicador": "Produção Estimada", "Valor": `${fmtNum(prod * ha)} sacas` },
        { "Indicador": "Custo Operacional", "Valor": fmtMoeda(custoTotal) },
        { "Indicador": "Receita Bruta", "Valor": fmtMoeda(receitaTotal) },
        { "Indicador": "Lucro por Hectare", "Valor": fmtMoeda(lucroLiquido / ha) },
        { "Indicador": "Margem Líquida", "Valor": `${fmtNum(margemLiquida)}%` }
      ]
    };
  }, [area, produtividade, precoVenda, custoPorHa]);

  if (!mounted) return null;

  const shareText = `💰 *Análise de ROI - ${talhao || 'Cultura'}*\n\n📈 *ROI:* ${fmtNum(resultados.roi)}%\n✅ *Lucro Total:* ${fmtMoeda(resultados.lucroLiquido)}\n⚖️ *Ponto de Eq:* ${fmtNum(resultados.pontoEquilibrio)} sc/ha`;

  return (
    <CalculatorLayout
      title="ROI por Cultura"
      subtitle="Viabilidade econômica e análise de margem de segurança."
      category="Financeiro"
      icon={<TrendingUp size={16} />}
      produtor={produtor}
      setProdutor={setProdutor}
      talhao={talhao}
      setTalhao={setTalhao}
      responsavelTecnico={responsavel}
      setResponsavelTecnico={setResponsavel}
      registroProfissional={registro}
      setRegistroProfissional={setRegistro}
      shareText={shareText}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">

        {/* --- COLUNA DE INPUTS --- */}
        <div className="lg:col-span-7 space-y-6">
          <div className="print:hidden space-y-6">
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><Sprout size={20} /></div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">1. Produção</h3>
                  <p className="text-xs text-slate-400">Escala e produtividade da safra</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputGroup label="Área Total" icon={<LandPlot size={16} />} value={area} onChange={setArea} suffix="ha" />
                <InputGroup label="Produtividade Meta" icon={<Scale size={16} />} value={produtividade} onChange={setProdutividade} suffix="sc/ha" />
              </div>
            </section>



            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><DollarSign size={20} /></div>
                <h3 className="font-bold text-lg text-slate-800">2. Mercado e Custos</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputGroup label="Preço da Saca" icon={<TrendingUp size={16} />} value={precoVenda} onChange={setPrecoVenda} suffix="R$/sc" />
                <InputGroup label="Custo por Ha (COT)" icon={<PieChart size={16} />} value={custoPorHa} onChange={setCustoPorHa} suffix="R$/ha" />
              </div>
            </section>
          </div>

          {/* Versão para Impressão */}
          <div className="hidden print:block">
            <TechnicalTable title="Relatório de Rentabilidade da Lavoura" rows={resultados.rows} />
          </div>
        </div>

        {/* --- COLUNA DE RESULTADOS --- */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-10 print:static">
            {!isAuthenticated && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg h-full print:hidden">
                <div className="bg-slate-900 text-emerald-400 p-4 rounded-full mb-4 shadow-xl">
                  <Lock size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Análise Bloqueada</h3>
                <button
                  onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center gap-2"
                >
                  Ver Rentabilidade <ArrowRight size={16} />
                </button>
              </div>
            )}

            <div className={`space-y-6 transition-all duration-500 print:hidden ${!isAuthenticated ? 'opacity-40 filter blur-sm select-none pointer-events-none' : ''}`}>

              {/* Card ROI Principal */}
              <div className={`rounded-xl p-8 shadow-xl relative overflow-hidden text-white transition-colors duration-500 ${resultados.roi >= 0 ? 'bg-slate-900' : 'bg-red-950'}`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
                <div className="relative z-10 text-center">
                  <p className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] mb-2">Retorno sobre Investimento</p>
                  <div className="mb-4">
                    <span className="text-6xl font-black tracking-tighter">{fmtNum(resultados.roi)}%</span>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${resultados.roi >= 0 ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-red-500/10 border-red-500/40 text-red-400'}`}>
                    {resultados.roi >= 0 ? 'Operação Lucrativa' : 'Alerta: Prejuízo Operacional'}
                  </div>
                </div>
              </div>

              {/* Card Financeiro */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Lucro Líquido Estimado</p>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Total</span>
                </div>
                <p className={`text-3xl font-black ${resultados.lucroLiquido >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                  {fmtMoeda(resultados.lucroLiquido)}
                </p>

                <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Ponto de Equilíbrio</p>
                    <p className="text-sm font-bold text-slate-800">{fmtNum(resultados.pontoEquilibrio)} sc/ha</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Margem Líquida</p>
                    <p className="text-sm font-bold text-slate-800">{fmtNum(resultados.margemLiquida)}%</p>
                  </div>
                </div>
              </div>

              {/* Card de Risco/Sensibilidade */}
              {resultados.roi > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 border-l-4 border-l-amber-500">
                  <div className="flex gap-3">
                    <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                    <div>
                      <p className="text-xs font-bold text-amber-900 uppercase">Margem de Segurança</p>
                      <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                        Em um cenário de estresse (-10% no preço e volume), seu lucro cairia para <span className="font-bold">{fmtMoeda(resultados.cenarioPessimista)}</span>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Dica Técnica */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex gap-3">
                <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-500 leading-normal italic">
                  O Ponto de Equilíbrio indica quantas sacas você precisa produzir por hectare apenas para cobrir o seu **Custo Operacional**.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
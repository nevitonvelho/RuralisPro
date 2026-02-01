"use client";

import { useState, useMemo } from "react";
import {
  ArrowLeftRight,
  Globe,
  Coins,
  ArrowRight,
  Lock,
  Scale,
  Calculator,
  Sprout,
  Wheat,
  Sun,
  TrendingUp,
  Landmark,
  ClipboardList
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CalculatorLayout } from "@/app/components/CalculatorLayout";

// --- COMPONENTES VISUAIS ---

// 1. INPUTS (Padrão Unificado - Indigo Theme)
const InputGroup = ({ label, icon, value, onChange, placeholder = "0", suffix, step = "0.01" }: any) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex justify-between items-end">
      <label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1.5">
        {label}
      </label>
    </div>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors font-bold text-sm">
        {icon}
      </div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        step={step}
        onWheel={(e) => e.currentTarget.blur()}
        className="w-full pl-9 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 font-semibold placeholder:text-slate-300 shadow-sm"
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
          {suffix}
        </div>
      )}
    </div>
  </div>
);

// 2. TABELA TÉCNICA (Impressão)
const TechnicalTable = ({ title, rows }: { title: string, rows: any[] }) => {
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
            <tr
              key={index}
              className={`
                border-b border-slate-300 last:border-0 
                ${index % 2 === 0 ? 'bg-white' : 'bg-slate-100'} 
                ${row.isHeader ? 'bg-slate-800 text-white print:bg-white print:text-black font-bold' : ''}
                print:bg-white print:border print:border-slate-300
              `}
            >
              <td className={`p-2 w-2/3 print:border-r print:border-slate-300 ${row.isHeader ? 'text-white print:text-black print:font-bold' : 'text-slate-700 font-medium print:text-black'}`}>
                {row.label}
              </td>
              <td className={`p-2 w-1/3 text-right font-bold ${row.isHeader ? 'text-white print:text-black' : 'text-black'}`}>
                {row.value} <span className="text-[10px] font-normal text-slate-500 ml-1 uppercase print:text-black">{row.unit}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function ConversorMercadoPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // ESTADOS
  const [produtor, setProdutor] = useState("");
  const [talhao, setTalhao] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [registro, setRegistro] = useState("");

  // INPUTS - TIPO DE GRÃO
  const [cultura, setCultura] = useState<"soja" | "milho" | "trigo">("soja");

  // INPUTS - MERCADO (FINANCEIRO)
  const [cotacaoChicago, setCotacaoChicago] = useState<number | string>(""); // $/bu
  const [premioPorto, setPremioPorto] = useState<number | string>(""); // cents/bu (Basis)
  const [taxaCambio, setTaxaCambio] = useState<number | string>(""); // R$/USD

  // INPUTS - PRODUTIVIDADE (AGRONÔMICO)
  const [produtividadeBuAcre, setProdutividadeBuAcre] = useState<number | string>(""); // bu/acre

  // CONSTANTES DE CONVERSÃO
  const PESO_BUSHEL = {
    soja: 27.2155,
    trigo: 27.2155,
    milho: 25.4012
  };
  const FATOR_AREA = 2.47105;
  const PESO_SACA = 60;

  // CÁLCULOS
  const resultados = useMemo(() => {
    const chicago = Number(cotacaoChicago) || 0;
    const premio = Number(premioPorto) || 0;
    const dolar = Number(taxaCambio) || 0;
    const prodBu = Number(produtividadeBuAcre) || 0;

    const kgPorBu = PESO_BUSHEL[cultura];

    // Financeiro
    const precoFullUsdBu = chicago + (premio / 100);
    const buPorSaca = PESO_SACA / kgPorBu;
    const precoSacaUsd = precoFullUsdBu * buPorSaca;
    const precoSacaBrl = precoSacaUsd * dolar;
    const precoTonBrl = (precoSacaBrl / 60) * 1000;

    // Agronômico
    const kgPorAcre = prodBu * kgPorBu;
    const kgPorHa = kgPorAcre * FATOR_AREA;
    const scPorHa = kgPorHa / PESO_SACA;

    return { precoSacaBrl, precoSacaUsd, precoTonBrl, buPorSaca, scPorHa, kgPorHa, precoFullUsdBu };
  }, [cultura, cotacaoChicago, premioPorto, taxaCambio, produtividadeBuAcre]);

  // FORMATAÇÃO
  const fmtMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtUsd = (v: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);
  const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(v);

  const shareText = `🌎 *Conversor de Mercado - ${cultura.toUpperCase()}*\n\n📉 *Chicago:* $${cotacaoChicago}/bu\n💵 *Dólar:* R$ ${taxaCambio}\n\n💰 *Paridade:* ${fmtMoeda(resultados.precoSacaBrl)} / sc\n📊 *Equivalência:* 1 sc = ${fmtNum(resultados.buPorSaca)} bu`;

  return (
    <CalculatorLayout
      title="Conversor Agro & Paridade"
      subtitle="Converta cotações de Chicago (CBOT) e produtividade (bu/ac) para padrões nacionais."
      category="Mercado"
      icon={<Globe size={16} />}
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

        {/* --- COLUNA ESQUERDA: INPUTS --- */}
        <div className="lg:col-span-7 space-y-6 print:space-y-4">

          {/* Seção 1: Seleção de Cultura */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center shadow-sm border border-slate-200">
                <Scale size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">Cultura Base</h3>
                <p className="text-xs text-slate-400 font-medium">Define o peso específico do Bushel</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => setCultura("soja")} className={`relative py-4 px-4 rounded-xl font-bold text-sm border transition-all flex flex-col items-center gap-2 ${cultura === 'soja' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500' : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30'}`}>
                <Sprout size={24} strokeWidth={1.5} className={cultura === 'soja' ? 'text-emerald-600' : 'text-slate-400'} />
                <span>Soja</span>
              </button>
              <button onClick={() => setCultura("milho")} className={`relative py-4 px-4 rounded-xl font-bold text-sm border transition-all flex flex-col items-center gap-2 ${cultura === 'milho' ? 'bg-yellow-50 border-yellow-500 text-yellow-700 ring-1 ring-yellow-500' : 'bg-white text-slate-500 border-slate-200 hover:border-yellow-300 hover:bg-yellow-50/30'}`}>
                <Sun size={24} strokeWidth={1.5} className={cultura === 'milho' ? 'text-yellow-600' : 'text-slate-400'} />
                <span>Milho</span>
              </button>
              <button onClick={() => setCultura("trigo")} className={`relative py-4 px-4 rounded-xl font-bold text-sm border transition-all flex flex-col items-center gap-2 ${cultura === 'trigo' ? 'bg-amber-50 border-amber-500 text-amber-700 ring-1 ring-amber-500' : 'bg-white text-slate-500 border-slate-200 hover:border-amber-300 hover:bg-amber-50/30'}`}>
                <Wheat size={24} strokeWidth={1.5} className={cultura === 'trigo' ? 'text-amber-600' : 'text-slate-400'} />
                <span>Trigo</span>
              </button>
            </div>
          </section>

          {/* Seção 2: Financeiro */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm border border-indigo-200">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">Cotações de Mercado</h3>
                <p className="text-xs text-slate-400 font-medium">Chicago (CBOT), Basis e Câmbio</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup label="Cotação Chicago" icon={<Globe size={14} />} value={cotacaoChicago} onChange={setCotacaoChicago} placeholder="0.00" suffix="$/bu" />
              <InputGroup label="Dólar Comercial" icon={<ArrowLeftRight size={14} />} value={taxaCambio} onChange={setTaxaCambio} placeholder="0.00" suffix="BRL" />
              <div className="md:col-span-2">
                <InputGroup label="Prêmio no Porto (Basis)" icon={<Coins size={14} />} value={premioPorto} onChange={setPremioPorto} placeholder="Ex: 40" suffix="cents/bu" />
              </div>
            </div>
          </section>

          {/* Seção 3: Produtividade */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shadow-sm border border-blue-200">
                <Calculator size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">Conversão de Yield</h3>
                <p className="text-xs text-slate-400 font-medium">Produtividade americana para brasileira</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <InputGroup label="Produtividade (EUA)" icon={<Sprout size={14} />} value={produtividadeBuAcre} onChange={setProdutividadeBuAcre} placeholder="Ex: 60" suffix="bu/acre" />
            </div>
          </section>

          {/* Visual Impressão (Tabelas Inputs) */}
          <div className="hidden print:block">
            <TechnicalTable
              title="Parâmetros de Entrada"
              rows={[
                { label: "Cultura", value: cultura.toUpperCase(), unit: "" },
                { label: "Cotação Chicago", value: Number(cotacaoChicago).toFixed(2), unit: "$/bu" },
                { label: "Taxa de Câmbio", value: Number(taxaCambio).toFixed(3), unit: "R$" },
                { label: "Basis / Prêmio", value: Number(premioPorto).toFixed(0), unit: "cents" },
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
                <div className="bg-slate-900 text-indigo-400 p-4 rounded-full mb-4 shadow-xl animate-pulse">
                  <Lock size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Cálculo Bloqueado</h3>
                <button
                  onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 hover:scale-105"
                >
                  Ver Paridade <ArrowRight size={16} />
                </button>
              </div>
            )}

            <div className={`space-y-6 transition-all duration-500 print:hidden ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>



              {/* Card Principal: PREÇO SACA (Dark Theme) */}
              <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-2xl shadow-indigo-900/20 relative overflow-hidden">
                {/* Background Effect */}
                <div className="absolute top-0 right-0 p-32 bg-indigo-600 rounded-full blur-[100px] opacity-30 -mr-20 -mt-20 pointer-events-none"></div>

                <div className="relative z-10 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 mb-4">
                    <Landmark size={12} className="text-indigo-400" />
                    <span className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">Paridade de Importação/Exportação</span>
                  </div>

                  <div className="mb-8">
                    <span className="text-6xl font-black tracking-tighter text-white block">
                      {fmtMoeda(resultados.precoSacaBrl)}
                    </span>
                    <span className="text-lg font-medium text-slate-400 mt-1 block">por Saca (60kg)</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-6">
                    <div className="text-left">
                      <span className="block text-xl font-bold text-white">{fmtUsd(resultados.precoSacaUsd)}</span>
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Dólar por Saca</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-xl font-bold text-white">{fmtMoeda(resultados.precoTonBrl)}</span>
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Preço Tonelada</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Secundário: YIELD CONVERSION */}
              {Number(produtividadeBuAcre) > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl p-6 shadow-sm relative">
                  <div className="flex items-center gap-2 mb-6 border-b border-blue-100 pb-3">
                    <Sprout className="text-blue-500" size={18} />
                    <h4 className="font-bold text-blue-900 text-sm">Equivalência Agronômica</h4>
                  </div>

                  <div className="flex items-center justify-between px-2">
                    <div className="text-center">
                      <span className="block text-3xl font-black text-slate-400">{produtividadeBuAcre}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">bu / acre</span>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-mono text-blue-300">x {FATOR_AREA.toFixed(2)}</span>
                      <ArrowRight className="text-blue-400" />
                    </div>

                    <div className="text-center">
                      <span className="block text-3xl font-black text-blue-600">{fmtNum(resultados.scPorHa)}</span>
                      <span className="text-[10px] text-blue-500 uppercase font-bold">sc / ha</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabela de Referência Rápida */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex gap-2 items-center mb-3 text-xs font-bold text-slate-500 uppercase tracking-wide">
                  <Scale size={14} /> Fatores de Conversão ({cultura})
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Peso Bushel</span>
                    <span className="font-mono font-bold text-slate-800">{PESO_BUSHEL[cultura].toFixed(4)} kg</span>
                  </div>
                  <div className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded-lg">
                    <span className="text-slate-600">Bushels p/ Saca</span>
                    <span className="font-mono font-bold text-slate-800">1 sc = {fmtNum(resultados.buPorSaca)} bu</span>
                  </div>
                </div>
              </div>
            </div>

            {/* VISUAL IMPRESSÃO (Tabelas de Resultado) */}
            <div className="hidden print:block space-y-4">
              <TechnicalTable
                title="3. Conversão de Preços (Paridade)"
                rows={[
                  { label: "Preço Final (BRL)", value: fmtMoeda(resultados.precoSacaBrl), unit: "/ sc", isHeader: true },
                  { label: "Preço Final (USD)", value: fmtUsd(resultados.precoSacaUsd), unit: "/ sc" },
                  { label: "Preço Tonelada (BRL)", value: fmtMoeda(resultados.precoTonBrl), unit: "/ ton" },
                  { label: "Preço Bushel (Composto)", value: fmtUsd(resultados.precoFullUsdBu), unit: "/ bu" },
                ]}
              />

              {Number(produtividadeBuAcre) > 0 && (
                <TechnicalTable
                  title="4. Conversão Agronômica"
                  rows={[
                    { label: "Produtividade Americana", value: produtividadeBuAcre, unit: "bu/ac" },
                    { label: "Produtividade Brasileira", value: resultados.scPorHa.toFixed(2), unit: "sc/ha", isHeader: true },
                    { label: "Equivalência em Peso", value: resultados.kgPorHa.toFixed(0), unit: "kg/ha" },
                  ]}
                />
              )}

              <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 text-[10px] text-slate-600 text-justify leading-snug">
                <strong>Nota:</strong> O cálculo de paridade considera o preço de Chicago + Basis multiplicado pelo câmbio. Custos de "Fobbing", frete interno e impostos não estão deduzidos neste cálculo simples.
              </div>
            </div>

          </div>
        </div>

      </div>
    </CalculatorLayout>
  );
}
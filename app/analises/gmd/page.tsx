"use client";

import { useState, useMemo } from "react";
import {
  Beef,
  Scale,
  Timer,
  ArrowRight,
  Lock,
  Coins,
  TrendingUp,
  Utensils,
  PiggyBank,
  ClipboardList
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CalculatorLayout } from "@/app/components/CalculatorLayout";

// --- COMPONENTES AUXILIARES ---

// 1. Tabela para Impressão
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

// 2. Input Padronizado
const InputGroup = ({ label, icon, value, onChange, placeholder = "0", step = "0.1", suffix }: any) => (
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

export default function ConversaoAlimentarPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // ESTADOS
  const [produtor, setProdutor] = useState("");
  const [talhao, setTalhao] = useState(""); // Lote
  const [responsavel, setResponsavel] = useState("");
  const [registro, setRegistro] = useState("");

  // INPUTS - DESEMPENHO
  const [pesoEntrada, setPesoEntrada] = useState<number | string>(""); // kg
  const [pesoSaida, setPesoSaida] = useState<number | string>(""); // kg
  const [dias, setDias] = useState<number | string>(""); // dias de cocho

  // INPUTS - NUTRIÇÃO
  const [consumoDiario, setConsumoDiario] = useState<number | string>(""); // kg MN ou MS
  const [custoRacao, setCustoRacao] = useState<number | string>(""); // R$ por kg

  // FORMATAÇÃO
  const fmtMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(v);
  const fmtDec = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 }).format(v);

  // CÁLCULOS
  const resultados = useMemo(() => {
    const pEntrada = Number(pesoEntrada) || 0;
    const pSaida = Number(pesoSaida) || 0;
    const nDias = Number(dias) || 0;
    const cDiario = Number(consumoDiario) || 0;
    const cKg = Number(custoRacao) || 0;

    if (nDias === 0) return {
      gmd: 0,
      ca: 0,
      custoArroba: 0,
      custoCabecaDia: 0,
      ganhoTotal: 0,
      rowsResumo: []
    };

    // 1. Ganho de Peso Total
    const ganhoTotal = pSaida - pEntrada;

    // 2. GMD (Ganho Médio Diário)
    const gmd = ganhoTotal / nDias;

    // 3. Conversão Alimentar (CA)
    const ca = gmd > 0 ? cDiario / gmd : 0;

    // 4. Custo Cabeça/Dia
    const custoCabecaDia = cDiario * cKg;

    // 5. Custo por @ Produzida (Considerando @ de 30kg de peso vivo ganho)
    const custoPorKgGanho = ca * cKg;
    const custoArroba = custoPorKgGanho * 30;

    return {
      gmd,
      ca,
      ganhoTotal,
      custoCabecaDia,
      custoArroba,
      eficiencia: ca > 0 ? (1 / ca) * 100 : 0,
      // DADOS PARA TABELA DE IMPRESSÃO
      rowsResumo: [
        { "Item": "Peso Inicial", "Valor": `${pEntrada} kg` },
        { "Item": "Peso Final", "Valor": `${pSaida} kg` },
        { "Item": "Período (Dias)", "Valor": `${nDias}` },
        { "Item": "Ganho de Peso Total", "Valor": `${fmtNum(ganhoTotal)} kg` },
        { "Item": "G.M.D. (Ganho Diário)", "Valor": `${fmtDec(gmd)} kg/dia` },
        { "Item": "Consumo Diário", "Valor": `${fmtNum(cDiario)} kg` },
        { "Item": "CONVERSÃO ALIMENTAR (CA)", "Valor": fmtNum(ca) },
        { "Item": "Custo Cabeça/Dia", "Valor": fmtMoeda(custoCabecaDia) },
        { "Item": "Custo por @ Produzida", "Valor": fmtMoeda(custoArroba) },
      ]
    };
  }, [pesoEntrada, pesoSaida, dias, consumoDiario, custoRacao]);

  const shareText = `🐂 *Zootecnia de Precisão*\n\n📊 *GMD:* ${fmtDec(resultados.gmd)} kg/dia\n🔄 *Conversão (CA):* ${fmtNum(resultados.ca)}\n\n💰 *Custo da @ Produzida:* ${fmtMoeda(resultados.custoArroba)}\n📅 *Período:* ${dias} dias`;

  // Define status da CA (Referência Confinamento)
  const getStatusCA = (val: number) => {
    if (val === 0) return { label: "-", color: "bg-slate-200" };
    if (val < 6.5) return { label: "Excelente", color: "bg-emerald-500" };
    if (val < 7.5) return { label: "Bom", color: "bg-blue-500" };
    if (val < 8.5) return { label: "Regular", color: "bg-amber-500" };
    return { label: "Alerta", color: "bg-red-500" };
  };

  const statusCA = getStatusCA(resultados.ca);

  return (
    <CalculatorLayout
      title="Conversão Alimentar & GMD"
      subtitle="Análise de desempenho zootécnico e custo da arroba produzida."
      category="Pecuária"
      icon={<Beef size={16} />}
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

        {/* --- INPUTS --- */}
        <div className="lg:col-span-7 space-y-6">

          <div className="print:hidden">
            {/* Seção 1: Pesagem (Balança) */}
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg"><Scale size={20} /></div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">1. Pesagem e Período</h3>
                  <p className="text-xs text-slate-400">Dados de entrada e saída do lote</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <InputGroup label="Peso Entrada (kg)" icon={<span className="text-[10px] font-bold">In</span>} value={pesoEntrada} onChange={setPesoEntrada} placeholder="Ex: 350" />
                <InputGroup label="Peso Saída (kg)" icon={<span className="text-[10px] font-bold">Out</span>} value={pesoSaida} onChange={setPesoSaida} placeholder="Ex: 530" />
                <InputGroup label="Dias Cocho" icon={<Timer size={16} />} value={dias} onChange={setDias} placeholder="Ex: 100" />
              </div>
            </section>

            {/* Seção 2: Nutrição e Custo */}
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><Utensils size={20} /></div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">2. Consumo e Custos</h3>
                  <p className="text-xs text-slate-400">Eficiência nutricional e valores</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <InputGroup label="Consumo Diário (kg/cb)" icon={<Utensils size={16} />} value={consumoDiario} onChange={setConsumoDiario} placeholder="Ex: 12" suffix="kg" />
                <InputGroup label="Custo Ração (R$/kg)" icon={<Coins size={16} />} value={custoRacao} onChange={setCustoRacao} placeholder="Ex: 1.20" suffix="R$" />
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {[0.80, 1.00, 1.20, 1.50].map(val => (
                  <button key={val} onClick={() => setCustoRacao(val)} className="text-xs border border-slate-200 px-3 py-1 rounded-full text-slate-500 hover:bg-slate-50 transition-colors whitespace-nowrap">
                    R$ {val.toFixed(2)}
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* TABELA VISIVEL APENAS NA IMPRESSAO */}
          <div className="hidden print:block">
            <TechnicalTable title="Relatório de Desempenho (GMD & CA)" rows={resultados.rowsResumo} />
          </div>

        </div>

        {/* --- RESULTADOS --- */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-10 print:static">

            {/* OVERLAY BLOQUEIO */}
            {!isAuthenticated && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg h-full print:hidden">
                <div className="bg-slate-900 text-emerald-400 p-4 rounded-full mb-4 shadow-xl animate-pulse">
                  <Lock size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Análise Bloqueada</h3>
                <button
                  onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 hover:scale-105"
                >
                  Ver Custo da @ <ArrowRight size={16} />
                </button>
              </div>
            )}

            <div className={`space-y-6 transition-all duration-500 print:hidden ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>

              {/* Card Principal: CA */}
              <div className="print-card bg-slate-900 text-white rounded-xl p-8 shadow-xl relative overflow-hidden">
                {/* Background Detail */}
                <div className="absolute top-0 right-0 p-16 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-emerald-400 font-bold uppercase tracking-wider text-xs">
                      Conversão Alimentar (CA)
                    </p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold text-white uppercase ${statusCA.color}`}>
                      {statusCA.label}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[10px] mb-4">
                    Kg de ração para ganhar 1 kg de peso
                  </p>

                  <div className="flex items-end gap-3 mb-6">
                    <span className="text-6xl font-black tracking-tighter text-white">
                      {fmtNum(resultados.ca)}
                    </span>
                    <div className="mb-2">
                      <span className="text-xl font-medium text-slate-300 block">pts</span>
                    </div>
                  </div>

                  {/* Barra Visual da CA */}
                  <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden flex">
                    <div className={`h-full ${statusCA.color}`} style={{ width: `${Math.min(((12 - resultados.ca) / 8) * 100, 100)}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Ruim (+12)</span>
                    <span>Excelente (4)</span>
                  </div>
                </div>
              </div>

              {/* Grid Secundário: GMD e Custo */}
              <div className="grid grid-cols-2 gap-4">
                {/* GMD */}
                <div className="print-card bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2 text-emerald-600">
                    <TrendingUp size={18} />
                    <span className="font-bold text-xs uppercase">GMD</span>
                  </div>
                  <span className="text-3xl font-black text-slate-900 block">{fmtDec(resultados.gmd)}</span>
                  <span className="text-xs text-slate-400">kg/dia</span>
                </div>

                {/* Custo Cabeça */}
                <div className="print-card bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2 text-blue-600">
                    <PiggyBank size={18} />
                    <span className="font-bold text-xs uppercase">Custo Dia</span>
                  </div>
                  <span className="text-3xl font-black text-slate-900 block">{fmtMoeda(resultados.custoCabecaDia)}</span>
                  <span className="text-xs text-slate-400">por animal</span>
                </div>
              </div>

              {/* Card Financeiro Principal: Custo da Arroba */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-full">
                    <Coins size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Custo da @ Produzida</p>
                    <p className="text-2xl font-black text-slate-800 tracking-tight">{fmtMoeda(resultados.custoArroba)}</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 ml-1">
                  Considerando apenas nutrição. Custos fixos não inclusos.
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </CalculatorLayout>
  );
}
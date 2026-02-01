"use client";

import { useState, useMemo } from "react";
import {
  Fuel,
  Timer,
  Map,
  ArrowRight,
  Lock,
  Coins,
  Gauge,
  Settings2,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  ClipboardList,
  Droplets
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CalculatorLayout } from "@/app/components/CalculatorLayout";

// --- COMPONENTES VISUAIS ---

// 1. INPUTS (Padrão Unificado - Amber Theme)
const InputGroup = ({ label, icon, value, onChange, placeholder = "0", suffix }: any) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex justify-between items-end">
      <label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1.5">
        {label}
      </label>
    </div>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-600 transition-colors font-bold text-sm">
        {icon}
      </div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        step="0.1"
        onWheel={(e) => e.currentTarget.blur()}
        className="w-full pl-9 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-900 font-semibold placeholder:text-slate-300 shadow-sm"
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

import { saveReport, saveClient, getReportById, updateReport } from "@/services/firestore";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

// ... (imports remain)

export default function CombustivelMaquinarioPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const searchParams = useSearchParams();
  const reportId = searchParams.get('id');
  const router = useRouter();

  // ESTADOS
  const [produtor, setProdutor] = useState("");
  const [talhao, setTalhao] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [registro, setRegistro] = useState("");
  const [saved, setSaved] = useState(false);

  // AUTO-FILL TÉCNICO
  useEffect(() => {
    if (user && !reportId && !responsavel) {
      setResponsavel(user.displayName || "");
    }
  }, [user, reportId]);

  // INPUTS - OPERAÇÃO
  const [areaTrabalhada, setAreaTrabalhada] = useState<number | string>(""); // ha
  const [totalLitros, setTotalLitros] = useState<number | string>(""); // L
  const [totalHoras, setTotalHoras] = useState<number | string>(""); // h

  // INPUTS - FINANCEIRO E METAS
  const [precoDiesel, setPrecoDiesel] = useState<number | string>(""); // R$/L
  const [metaConsumo, setMetaConsumo] = useState<number | string>(""); // L/ha (Opcional)

  // LOAD REPORT DATA
  useEffect(() => {
    if (reportId && user?.uid) {
      getReportById(reportId).then(report => {
        if (report && report.data?.inputs) {
          const i = report.data.inputs;
          setProdutor(i.produtor || "");
          setTalhao(i.talhao || "");
          setResponsavel(i.responsavel || "");
          setRegistro(i.registro || "");
          setAreaTrabalhada(i.areaTrabalhada || "");
          setTotalLitros(i.totalLitros || "");
          setTotalHoras(i.totalHoras || "");
          setPrecoDiesel(i.precoDiesel || "");
          setMetaConsumo(i.metaConsumo || "");
        }
      }).catch(console.error);
    }
  }, [reportId, user]);

  // CÁLCULOS
  const resultados = useMemo(() => {
    const area = Number(areaTrabalhada) || 0;
    const litros = Number(totalLitros) || 0;
    const horas = Number(totalHoras) || 0;
    const preco = Number(precoDiesel) || 0;
    const meta = Number(metaConsumo) || 0;

    if (area === 0 || litros === 0) {
      return { l_ha: 0, l_h: 0, ha_h: 0, custoHa: 0, totalGasto: 0, desvio: 0, status: 'neutral', meta: 0, percentualMeta: 0 };
    }

    // 1. Indicadores Físicos
    const l_ha = litros / area;
    const l_h = horas > 0 ? litros / horas : 0;
    const ha_h = horas > 0 ? area / horas : 0;

    // 2. Financeiro
    const totalGasto = litros * preco;
    const custoHa = totalGasto / area;

    // 3. Análise de Meta
    let desvio = 0;
    let percentualMeta = 0;
    let status = 'neutral';

    if (meta > 0) {
      desvio = l_ha - meta; // Positivo = Ruim (Gastou mais)
      percentualMeta = (l_ha / meta) * 100;

      if (desvio > 0) status = 'ruim';
      else if (desvio <= 0) status = 'bom';
    }

    return { l_ha, l_h, ha_h, custoHa, totalGasto, desvio, status, meta, percentualMeta };
  }, [areaTrabalhada, totalLitros, totalHoras, precoDiesel, metaConsumo]);

  const handleSave = async () => {
    if (!user) return;

    try {
      if (produtor) await saveClient(user.uid, produtor, talhao);

      const reportData = {
        inputs: {
          produtor, talhao, responsavel, registro,
          areaTrabalhada, totalLitros, totalHoras, precoDiesel, metaConsumo
        },
        results: {
          l_ha: resultados.l_ha,
          l_h: resultados.l_h,
          ha_h: resultados.ha_h,
          custoHa: resultados.custoHa,
          totalGasto: resultados.totalGasto,
          desvio: resultados.desvio,
          status: resultados.status
        }
      };

      if (reportId) {
        await updateReport(reportId, {
          title: `Combustível - ${produtor || 'Sem Cliente'}`,
          data: reportData,
          clientName: produtor
        });
      } else {
        const newId = await saveReport(
          user.uid,
          'consumo-combustivel',
          `Combustível - ${produtor || 'Sem Cliente'}`,
          reportData,
          produtor
        );
        router.replace(`/analises/consumo-combustivel?id=${newId}`);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar relatório.");
    }
  };

  // FORMATAÇÃO
  const fmtMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(v);

  const shareText = `🚜 *Eficiência de Maquinário*\n\n⛽ *Consumo:* ${fmtNum(resultados.l_ha)} L/ha\n⏱️ *Rendimento:* ${fmtNum(resultados.ha_h)} ha/h\n💰 *Custo Diesel:* ${fmtMoeda(resultados.custoHa)} /ha\n\n📊 *Operação:* ${talhao || 'Geral'}`;

  return (
    <CalculatorLayout
      title="Consumo de Combustível"
      subtitle="Análise de eficiência (L/ha), custo operacional e desempenho."
      category="Maquinário"
      icon={<Fuel size={16} />}
      produtor={produtor}
      setProdutor={setProdutor}
      talhao={talhao}
      setTalhao={setTalhao}
      responsavelTecnico={responsavel}
      setResponsavelTecnico={setResponsavel}
      registroProfissional={registro}
      setRegistroProfissional={setRegistro}
      shareText={shareText}
      onSave={handleSave}
      saved={saved}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">

        {/* --- COLUNA ESQUERDA: INPUTS --- */}
        <div className="lg:col-span-7 space-y-6 print:space-y-4">

          {/* Seção 1: Dados de Campo */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center shadow-sm border border-slate-200">
                <Settings2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">Apontamento de Campo</h3>
                <p className="text-xs text-slate-400 font-medium">Dados da máquina/operação</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Área Realizada" icon={<Map size={14} />} value={areaTrabalhada} onChange={setAreaTrabalhada} placeholder="0" suffix="ha" />
              <InputGroup label="Combustível Total" icon={<Fuel size={14} />} value={totalLitros} onChange={setTotalLitros} placeholder="0" suffix="L" />
              <div className="col-span-2">
                <InputGroup label="Horímetro (Horas Trabalhadas)" icon={<Timer size={14} />} value={totalHoras} onChange={setTotalHoras} placeholder="0" suffix="h" />
              </div>
            </div>
          </section>

          {/* Visual Impressão (Tabela 1) */}
          <div className="hidden print:block">
            <TechnicalTable
              title="1. Dados da Operação"
              rows={[
                { label: "Área Trabalhada", value: Number(areaTrabalhada).toFixed(2), unit: "ha" },
                { label: "Volume Consumido", value: Number(totalLitros).toFixed(1), unit: "L" },
                { label: "Tempo de Operação", value: Number(totalHoras).toFixed(1), unit: "h" },
              ]}
            />
          </div>

          {/* Seção 2: Financeiro e Metas */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shadow-sm border border-amber-200">
                <Coins size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">Custo & Metas</h3>
                <p className="text-xs text-slate-400 font-medium">Para análise financeira e eficiência</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup label="Preço Médio Diesel" icon="R$" value={precoDiesel} onChange={setPrecoDiesel} placeholder="0.00" suffix="/ L" />
              <div className="relative">
                <InputGroup label="Meta de Consumo (Opcional)" icon={<Gauge size={14} />} value={metaConsumo} onChange={setMetaConsumo} placeholder="Ex: 12" suffix="L/ha" />
                {/* Tooltip hint */}
                <div className="absolute top-0 right-0 text-[10px] text-slate-400 font-medium">
                  Meta Recomendada
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* --- COLUNA DIREITA: RESULTADOS --- */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-6 print:static space-y-6">

            {/* OVERLAY BLOQUEIO */}
            {!isAuthenticated && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200 shadow-lg h-full print:hidden">
                <div className="bg-slate-900 text-amber-400 p-4 rounded-full mb-4 shadow-xl animate-pulse">
                  <Lock size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Cálculo Bloqueado</h3>
                <button
                  onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-amber-600/20 transition-all flex items-center gap-2 hover:scale-105"
                >
                  Ver Indicadores <ArrowRight size={16} />
                </button>
              </div>
            )}

            <div className={`space-y-6 transition-all duration-500 print:hidden ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>

              {/* Card Principal: L/HA (Tema Escuro) */}
              <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                {/* Background Effect */}
                <div className="absolute top-0 right-0 p-24 bg-amber-500 rounded-full blur-[90px] opacity-20 -mr-10 -mt-10 pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-amber-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                        Indicador Principal
                      </p>
                      <h4 className="font-bold text-lg text-white">Consumo por Área</h4>
                    </div>
                    {/* Badge de Status */}
                    {resultados.status !== 'neutral' && (
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${resultados.status === 'bom' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-red-500/20 text-red-400 border-red-500/50'}`}>
                        {resultados.status === 'bom' ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                        {resultados.status === 'bom' ? 'Eficiente' : 'Alto Consumo'}
                      </div>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-6xl font-black tracking-tighter text-white">{fmtNum(resultados.l_ha)}</span>
                    <span className="text-xl font-medium text-slate-400">L/ha</span>
                  </div>

                  {/* Barra de Comparação com Meta */}
                  {resultados.meta > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400">
                        <span>Real ({fmtNum(resultados.l_ha)})</span>
                        <span>Meta ({fmtNum(resultados.meta)})</span>
                      </div>
                      <div className="h-3 bg-slate-800 rounded-full overflow-hidden relative border border-slate-700">
                        {/* Marcador da Meta (Linha Branca Vertical) */}
                        <div className="absolute top-0 bottom-0 bg-white w-0.5 z-20" style={{ left: `${Math.min((resultados.meta / (Math.max(resultados.l_ha, resultados.meta) * 1.2)) * 100, 100)}%` }}></div>

                        {/* Barra de Progresso */}
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${resultados.status === 'ruim' ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-emerald-600 to-emerald-400'}`}
                          style={{ width: `${Math.min((resultados.l_ha / (Math.max(resultados.l_ha, resultados.meta) * 1.2)) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <p className={`text-[10px] text-right mt-1 ${resultados.status === 'ruim' ? 'text-red-400' : 'text-emerald-400'}`}>
                        {resultados.desvio > 0
                          ? `+${fmtNum(resultados.desvio)} L/ha acima da meta`
                          : `-${fmtNum(Math.abs(resultados.desvio))} L/ha de economia`}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Grid Secundário: Performance */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2 text-slate-500">
                    <Droplets size={16} className="text-amber-500" />
                    <span className="text-[10px] uppercase font-bold">Consumo Horário</span>
                  </div>
                  <p className="text-2xl font-black text-slate-800 tracking-tight">
                    {fmtNum(resultados.l_h)} <span className="text-xs font-normal text-slate-400">L/h</span>
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2 text-slate-500">
                    <Gauge size={16} className="text-blue-500" />
                    <span className="text-[10px] uppercase font-bold">Rendimento</span>
                  </div>
                  <p className="text-2xl font-black text-slate-800 tracking-tight">
                    {fmtNum(resultados.ha_h)} <span className="text-xs font-normal text-slate-400">ha/h</span>
                  </p>
                </div>
              </div>

              {/* Card Financeiro */}
              <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-amber-100">
                  <div className="flex items-center gap-2">
                    <div className="bg-amber-100 p-1.5 rounded-lg text-amber-700">
                      <Coins size={16} />
                    </div>
                    <h4 className="font-bold text-amber-950 text-sm">Impacto Financeiro</h4>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs text-amber-800/70 font-bold uppercase">Custo por Hectare</span>
                  <span className="text-2xl font-black text-amber-700">{fmtMoeda(resultados.custoHa)}</span>
                </div>

                <div className="bg-amber-100/50 rounded-lg p-2 mt-2 flex justify-between items-center text-xs text-amber-900">
                  <span>Custo Total da Operação:</span>
                  <span className="font-bold">{fmtMoeda(resultados.totalGasto)}</span>
                </div>

                {resultados.desvio > 0 && precoDiesel && (
                  <div className="mt-3 flex gap-2 items-start">
                    <AlertTriangle size={12} className="text-red-400 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-red-400 leading-tight">
                      O excesso de consumo está custando <strong>{fmtMoeda(resultados.desvio * Number(precoDiesel))}</strong> extras por hectare.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* VISUAL IMPRESSÃO (Tabelas de Resultado) */}
            <div className="hidden print:block space-y-4">
              <TechnicalTable
                title="2. Indicadores de Performance"
                rows={[
                  { label: "Consumo Específico", value: resultados.l_ha.toFixed(2), unit: "L/ha", isHeader: true },
                  { label: "Consumo Horário", value: resultados.l_h.toFixed(1), unit: "L/h" },
                  { label: "Capacidade Operacional", value: resultados.ha_h.toFixed(2), unit: "ha/h" },
                ]}
              />

              <TechnicalTable
                title="3. Análise Financeira"
                rows={[
                  { label: "Custo Combustível/ha", value: fmtMoeda(resultados.custoHa), unit: "", isHeader: true },
                  { label: "Custo Total Lote", value: fmtMoeda(resultados.totalGasto), unit: "" },
                ]}
              />

              <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 text-[10px] text-slate-600 text-justify leading-snug">
                <strong>Nota:</strong> O consumo específico (L/ha) é influenciado pela regulagem da máquina, profundidade de trabalho, pressão dos pneus e rotação do motor. Monitore o patinamento para otimizar.
              </div>
            </div>

          </div>
        </div>

      </div>
    </CalculatorLayout>
  );
}
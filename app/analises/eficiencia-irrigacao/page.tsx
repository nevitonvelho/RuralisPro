"use client";

import { useState, useMemo } from "react";
import {
  Droplets, // Irrigação
  Zap, // Energia
  ArrowRight,
  Lock,
  BarChart3,
  Waves,
  AlertOctagon,
  ClipboardList
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CalculatorLayout } from "@/app/components/CalculatorLayout";

// --- COMPONENTES VISUAIS (TELA) ---

interface InputGroupProps {
  label: string;
  icon: React.ReactNode;
  value: string | number;
  onChange: (val: string) => void;
  placeholder?: string;
  step?: string;
  suffix?: string;
}

const InputGroup = ({ label, icon, value, onChange, placeholder = "0", step = "0.1", suffix }: InputGroupProps) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
        {icon}
      </div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        step={step}
        onWheel={(e) => e.currentTarget.blur()}
        className="w-full pl-10 pr-12 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 font-medium placeholder:text-slate-300"
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
          {suffix}
        </div>
      )}
    </div>
  </div>
);

// --- COMPONENTE VISUAL (IMPRESSÃO - TABELA TÉCNICA) ---
interface TechnicalTableRow {
  label: string;
  value: string | number;
  unit?: string;
  isHeader?: boolean;
}

const TechnicalTable = ({ title, rows }: { title: string; rows: TechnicalTableRow[] }) => {
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
                {row.value} {row.unit && <span className="text-[10px] font-normal text-slate-500 ml-1 uppercase print:text-black">{row.unit}</span>}
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

export default function EficienciaIrrigacaoPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const searchParams = useSearchParams();
  const reportId = searchParams.get('id');
  const router = useRouter();

  // ESTADOS
  const [produtor, setProdutor] = useState("");
  const [talhao, setTalhao] = useState(""); // Pivô / Setor
  const [responsavel, setResponsavel] = useState("");
  const [registro, setRegistro] = useState("");
  const [saved, setSaved] = useState(false);

  // AUTO-FILL TÉCNICO
  useEffect(() => {
    if (user && !reportId && !responsavel) {
      setResponsavel(user.displayName || "");
    }
  }, [user, reportId]);

  // INPUTS - TESTE DE COLETORES
  const [mediaGeral, setMediaGeral] = useState<number | string>(""); // mm
  const [mediaInferior, setMediaInferior] = useState<number | string>(""); // mm 

  // INPUTS - ENERGIA E CUSTO
  const [potencia, setPotencia] = useState<number | string>(""); // cv/hp
  const [custoKwh, setCustoKwh] = useState<number | string>(""); // R$/kWh
  const [horasAno, setHorasAno] = useState<number | string>("2000"); // Horas trabalhadas/ano

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
          setMediaGeral(i.mediaGeral || "");
          setMediaInferior(i.mediaInferior || "");
          setPotencia(i.potencia || "");
          setCustoKwh(i.custoKwh || "");
          setHorasAno(i.horasAno || "2000");
        }
      }).catch(console.error);
    }
  }, [reportId, user]);

  // CÁLCULOS
  const resultados = useMemo(() => {
    const mg = Number(mediaGeral) || 0;
    const mi = Number(mediaInferior) || 0;
    const pot = Number(potencia) || 0;
    const kwhPrice = Number(custoKwh) || 0;
    const horas = Number(horasAno) || 0;

    if (mg === 0) return { du: 0, status: 'neutral', fatorAjuste: 1, custoTotalEnergia: 0, desperdicio: 0 };

    // 1. Uniformidade de Distribuição (DU)
    // DU = (Média dos 25% menores / Média Geral) * 100
    let du = (mi / mg) * 100;
    if (du > 100) du = 100;

    // 2. Status
    let status = 'excelente';
    if (du < 90) status = 'bom';
    if (du < 80) status = 'regular';
    if (du < 70) status = 'ruim';
    if (du < 60) status = 'critico';

    // 3. Fator de Ajuste (Quanto eu preciso aplicar a mais para compensar?)
    const fatorAjuste = du > 0 ? 100 / du : 0;

    // 4. Custo Energético
    // Converter CV para kW (1 cv = 0.735 kW)
    const potKw = pot * 0.7355;
    const custoTotalEnergia = potKw * horas * kwhPrice;

    // 5. Desperdício Financeiro (Teórico)
    const desperdicio = custoTotalEnergia * ((100 - du) / 100);

    return {
      du,
      status,
      fatorAjuste,
      custoTotalEnergia,
      desperdicio
    };
  }, [mediaGeral, mediaInferior, potencia, custoKwh, horasAno]);

  const handleSave = async () => {
    if (!user) return;

    try {
      if (produtor) await saveClient(user.uid, produtor, talhao);

      const reportData = {
        inputs: {
          produtor, talhao, responsavel, registro,
          mediaGeral, mediaInferior, potencia, custoKwh, horasAno
        },
        results: {
          du: resultados.du,
          status: resultados.status,
          fatorAjuste: resultados.fatorAjuste,
          custoTotalEnergia: resultados.custoTotalEnergia,
          desperdicio: resultados.desperdicio
        }
      };

      if (reportId) {
        await updateReport(reportId, {
          title: `Irrigação (Eficiência) - ${produtor || 'Sem Cliente'}`,
          data: reportData,
          clientName: produtor
        });
      } else {
        const newId = await saveReport(
          user.uid,
          'eficiencia-irrigacao',
          `Irrigação (Eficiência) - ${produtor || 'Sem Cliente'}`,
          reportData,
          produtor
        );
        router.replace(`/analises/eficiencia-irrigacao?id=${newId}`);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar relatório.");
    }
  };

  const fmtMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(v);
  const fmtPct = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(v) + '%';

  const shareText = `💧 *Eficiência de Irrigação*\n\n📊 *Uniformidade (CD):* ${fmtPct(resultados.du)}\n🚦 *Status:* ${resultados.status.toUpperCase()}\n💸 *Desperdício Energia:* ${fmtMoeda(resultados.desperdicio)}/ano\n\n(Baseado no Teste de Uniformidade)`;

  return (
    <CalculatorLayout
      title="Eficiência de Irrigação"
      subtitle="Cálculo de Uniformidade de Distribuição (CD), perdas e custo energético."
      category="Maquinário"
      icon={<Waves size={16} />}
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

        {/* --- COLUNA ESQUERDA (INPUTS) --- */}
        <div className="lg:col-span-7 space-y-6 print:space-y-4">

          {/* ========================================================
               SEÇÃO 1: TESTE DE UNIFORMIDADE
           ======================================================== */}


          {/* A. VISUAL DE TELA */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:hidden">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Droplets size={20} /></div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">1. Teste de Uniformidade</h3>
                <p className="text-xs text-slate-400">Dados coletados nos copos/pluviômetros</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputGroup
                label="Média GERAL dos Coletores"
                icon={<Waves size={16} />}
                value={mediaGeral}
                onChange={setMediaGeral}
                placeholder="Ex: 10"
                suffix="mm"
              />
              <InputGroup
                label="Média dos 25% MENORES"
                icon={<BarChart3 size={16} />}
                value={mediaInferior}
                onChange={setMediaInferior}
                placeholder="Ex: 8.5"
                suffix="mm"
              />
            </div>
            <div className="mt-3 text-[10px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
              <strong>Nota:</strong> Para calcular a Uniformidade de Distribuição (DU), insira a média de todos os copos e a média apenas do "quarto inferior" (os 25% de copos que pegaram menos água).
            </div>
          </section>

          {/* B. VISUAL IMPRESSÃO */}
          <div className="hidden print:block">
            <TechnicalTable
              title="1. Dados do Teste de Campo"
              rows={[
                { label: "Lâmina Média Geral", value: Number(mediaGeral), unit: "mm" },
                { label: "Média do Quarto Inferior (25% secos)", value: Number(mediaInferior), unit: "mm" },
              ]}
            />
          </div>

          {/* ========================================================
               SEÇÃO 2: ENERGIA
           ======================================================== */}

          {/* A. VISUAL DE TELA */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:hidden">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-lg"><Zap size={20} /></div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">2. Dados Energéticos</h3>
                <p className="text-xs text-slate-400">Para calcular o custo da ineficiência</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <InputGroup label="Potência da Bomba" icon={<Zap size={16} />} value={potencia} onChange={setPotencia} placeholder="Ex: 100" suffix="cv" />
              <InputGroup label="Custo Energia" icon={<Zap size={16} />} value={custoKwh} onChange={setCustoKwh} placeholder="Ex: 0.65" suffix="R$/kWh" />
              <InputGroup label="Horas/Ano" icon={<Zap size={16} />} value={horasAno} onChange={setHorasAno} placeholder="Ex: 2000" suffix="h" />
            </div>
          </section>

          {/* B. VISUAL IMPRESSÃO */}
          <div className="hidden print:block">
            <TechnicalTable
              title="2. Parâmetros Operacionais"
              rows={[
                { label: "Potência Instalada", value: Number(potencia), unit: "cv" },
                { label: "Horas de Operação Anual", value: Number(horasAno), unit: "h" },
                { label: "Tarifa de Energia", value: fmtMoeda(Number(custoKwh)), unit: "/ kWh" },
              ]}
            />
          </div>

        </div>

        {/* --- COLUNA DIREITA (RESULTADOS) --- */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-10 print:static">

            {/* OVERLAY BLOQUEIO */}
            {!isAuthenticated && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg h-full print:hidden">
                <div className="bg-slate-900 text-blue-400 p-4 rounded-full mb-4 shadow-xl animate-pulse">
                  <Lock size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Análise Bloqueada</h3>
                <button
                  onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 hover:scale-105"
                >
                  Ver Eficiência <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* --- ÁREA DE RESULTADOS VISUAIS (TELA - print:hidden) --- */}
            <div className={`print:hidden space-y-6 transition-all duration-500 ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>

              {/* Card Principal: UNIFORMIDADE (DU) */}
              <div className="print-card bg-slate-900 text-white rounded-xl p-8 shadow-xl relative overflow-hidden">
                {/* Background Effect */}
                <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none ${resultados.status === 'excelente' ? 'bg-emerald-500/20' :
                  resultados.status === 'bom' ? 'bg-blue-500/20' :
                    resultados.status === 'regular' ? 'bg-yellow-500/20' :
                      'bg-red-500/20'
                  }`}></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-blue-200 font-bold uppercase tracking-wider text-xs">
                      Coeficiente de Uniformidade
                    </p>
                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${resultados.status === 'excelente' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' :
                      resultados.status === 'bom' ? 'bg-blue-500/20 border-blue-500 text-blue-300' :
                        resultados.status === 'regular' ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300' :
                          'bg-red-500/20 border-red-500 text-red-300'
                      }`}>
                      {resultados.status}
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-6xl font-black tracking-tighter text-white">
                      {fmtNum(resultados.du)}
                    </span>
                    <span className="text-2xl text-slate-400">%</span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${resultados.status === 'excelente' ? 'bg-emerald-500' :
                        resultados.status === 'bom' ? 'bg-blue-500' :
                          resultados.status === 'regular' ? 'bg-yellow-500' :
                            'bg-red-500'
                        }`}
                      style={{ width: `${resultados.du}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-slate-400 text-right">Meta ideal: &gt;90%</p>
                </div>
              </div>



              {/* Card Secundário: CUSTO DA INEFICIÊNCIA */}
              {resultados.desperdicio > 0 && (
                <div className="print-card bg-red-50 border border-red-200 rounded-xl p-6 shadow-lg relative animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-3 mb-4 border-b border-red-100 pb-4">
                    <AlertOctagon className="text-red-600" size={20} />
                    <div>
                      <h4 className="font-bold text-red-900 text-sm">Custo da Desuniformidade</h4>
                      <p className="text-[10px] text-red-400">Energia gasta sem efetividade agronômica</p>
                    </div>
                  </div>

                  <div className="text-center py-2">
                    <span className="block text-3xl font-black text-red-700">{fmtMoeda(resultados.desperdicio)}</span>
                    <span className="text-[10px] text-red-600 uppercase mt-1 block">Jogados fora por Ano</span>
                  </div>

                  <div className="mt-4 bg-white p-3 rounded border border-red-100 text-xs text-red-800">
                    <strong>Análise:</strong> A cada R$ 1.000 de energia, você perde <strong>{fmtMoeda((100 - resultados.du) * 10)}</strong> devido à má distribuição de água.
                  </div>
                </div>
              )}

              {/* Card Terciário: COMPENSAÇÃO OPERACIONAL */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 relative shadow-sm">
                <div className="flex gap-3 items-center mb-3">
                  <div className="bg-blue-100 p-2 rounded text-blue-600">
                    <Waves size={18} />
                  </div>
                  <p className="text-xs font-bold text-slate-700 uppercase">Ajuste de Lâmina</p>
                </div>
                <p className="text-xs text-slate-500 mb-2">
                  Para garantir 10mm na parte mais seca, aplique:
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-slate-800">{fmtNum(10 * resultados.fatorAjuste)} mm</span>
                  <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded">Bruto</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 italic">
                  Sobrecarga hídrica de +{fmtNum((resultados.fatorAjuste - 1) * 100)}%
                </p>
              </div>

            </div>

            {/* --- TABELA DE RESULTADOS (IMPRESSÃO - hidden print:block) --- */}
            <div className="hidden print:block">
              <TechnicalTable
                title="3. Diagnóstico de Eficiência"
                rows={[
                  { label: "Uniformidade (CUC/DU)", value: fmtPct(resultados.du), isHeader: true },
                  { label: "Classificação", value: resultados.status.toUpperCase() },
                  { label: "Fator de Ajuste Necessário", value: fmtNum(resultados.fatorAjuste), unit: "x" },
                  { label: "Custo Total Energia", value: fmtMoeda(resultados.custoTotalEnergia), unit: "/ ano" },
                  { label: "Desperdício Financeiro", value: fmtMoeda(resultados.desperdicio), unit: "/ ano", isHeader: true },
                ]}
              />
            </div>

          </div>
        </div>

      </div>
    </CalculatorLayout>
  );
}
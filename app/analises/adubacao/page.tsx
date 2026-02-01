"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Leaf,
  Package,
  Scale,
  ArrowRight,
  Lock,
  CheckCircle2,
  RefreshCw,
  Info,
  Droplets,
  ClipboardList
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CalculatorLayout } from "@/app/components/CalculatorLayout";

// --- TIPAGEM ---
interface InputGroupProps {
  label: string;
  icon: React.ReactNode;
  value: number | string;
  onChange: (val: string) => void;
  placeholder?: string;
  subLabel?: string;
}

interface BalanceBarProps {
  label: string;
  applied: number;
  target: number;
  unit?: string;
  isBase?: boolean;
}

// --- COMPONENTES VISUAIS ---

// 1. INPUTS (Visual de Formulário - Só aparece na tela)
const InputGroup = ({ label, icon, value, onChange, placeholder = "0", subLabel }: InputGroupProps) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex justify-between items-end">
      <label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1.5">
        {label}
      </label>
      {subLabel && <span className="text-[10px] text-slate-400 font-medium">{subLabel}</span>}
    </div>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors font-bold text-sm">
        {icon}
      </div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        step="0.1"
        onWheel={(e) => e.currentTarget.blur()}
        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 font-semibold placeholder:text-slate-300 shadow-sm"
      />
    </div>
  </div>
);

// 2. TABELA TÉCNICA (Visual de Relatório - Só aparece na impressão)
// Esta é a estrutura que garante o visual de lista/tabela que você quer
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

// 3. BARRA DE BALANÇO (Visual Interativo)
const BalanceBar = ({ label, applied, target, unit = "kg", isBase }: BalanceBarProps) => {
  const percentage = target > 0 ? (applied / target) * 100 : (applied > 0 ? 150 : 0);
  const diff = applied - target;
  const isBalanced = Math.abs(diff) < 0.5;
  const isDeficit = diff < -0.5;
  const isSurplus = diff > 0.5;
  const visualWidth = Math.min(Math.max(percentage, 0), 150);

  return (
    <div className="mb-4 last:mb-0 p-3 rounded-lg border bg-transparent border-transparent hover:bg-slate-50 transition-colors break-inside-avoid">
      <div className="flex justify-between text-xs mb-2">
        <span className="font-bold text-slate-700 flex items-center gap-1.5">
          {label}
          {isBase && <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">Base</span>}
        </span>
        <span className="text-slate-500 font-medium tabular-nums">
          {applied.toFixed(1)} <span className="text-slate-300">/</span> {target} {unit}
        </span>
      </div>
      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
        {target > 0 && (
          <div className="absolute left-[min(100%,_100%)] -translate-x-1/2 top-0 bottom-0 w-0.5 bg-slate-400 z-10 opacity-50"></div>
        )}
        <div
          style={{ width: `${visualWidth}%` }}
          className={`h-full rounded-full transition-all duration-700 ease-out relative ${isBalanced ? 'bg-emerald-500' :
            isDeficit ? 'bg-amber-400' : 'bg-blue-500'
            }`}
        >
          <div className="absolute top-0 right-0 bottom-0 w-full bg-gradient-to-l from-black/10 to-transparent"></div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-1.5">
        <span className="text-[10px] text-slate-400 font-medium">
          {percentage.toFixed(0)}% da meta
        </span>
        <span className="text-[10px] font-bold">
          {isDeficit && <span className="text-amber-600 flex items-center gap-1">Faltam {Math.abs(diff).toFixed(1)} {unit}</span>}
          {isSurplus && <span className="text-blue-600 flex items-center gap-1">Sobram {diff.toFixed(1)} {unit}</span>}
          {isBalanced && <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 size={10} /> Ideal</span>}
        </span>
      </div>
    </div>
  );
};

import { useSearchParams, useRouter } from "next/navigation";
import { saveReport, saveClient, getReportById, updateReport } from "@/services/firestore";

// ... (other imports)

export default function AdubacaoNPKPage() {
  const { user } = useAuth(); // Ensure user is correctly typed if possible, but for now we assume it has uid
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

  // AUTO-FILL TÉCNICO (Corrigido)
  useEffect(() => {
    if (user && !reportId && !responsavel) {
      setResponsavel(user.displayName || "");
      // Se tivesse campo de registro no user, seria: setRegistro(user.registro || "")
    }
  }, [user, reportId]);

  const [metaN, setMetaN] = useState<number | string>("");
  const [metaP, setMetaP] = useState<number | string>("");
  const [metaK, setMetaK] = useState<number | string>("");

  const [formN, setFormN] = useState<number | string>("");
  const [formP, setFormP] = useState<number | string>("");
  const [formK, setFormK] = useState<number | string>("");

  const [baseCalculo, setBaseCalculo] = useState<"N" | "P" | "K">("P");

  // LOAD DATA IF EDITING
  useEffect(() => {
    if (reportId && user?.uid) {
      getReportById(reportId).then(report => {
        if (report && report.data?.inputs) {
          const i = report.data.inputs;
          setProdutor(i.produtor || "");
          setTalhao(i.talhao || "");
          setResponsavel(i.responsavel || "");
          setRegistro(i.registro || "");
          setMetaN(i.metaN || "");
          setMetaP(i.metaP || "");
          setMetaK(i.metaK || "");
          setFormN(i.formN || "");
          setFormP(i.formP || "");
          setFormK(i.formK || "");
          setBaseCalculo(i.baseCalculo || "P");
        }
      }).catch(console.error);
    }
  }, [reportId, user]);

  // CÁLCULOS
  const resultados = useMemo(() => {
    // ... (existing calculation logic)
    const mN = Number(metaN) || 0;
    const mP = Number(metaP) || 0;
    const mK = Number(metaK) || 0;

    const fN = Number(formN) || 0;
    const fP = Number(formP) || 0;
    const fK = Number(formK) || 0;

    let doseHa = 0;

    if (baseCalculo === "N" && fN > 0) doseHa = (mN / fN) * 100;
    if (baseCalculo === "P" && fP > 0) doseHa = (mP / fP) * 100;
    if (baseCalculo === "K" && fK > 0) doseHa = (mK / fK) * 100;

    const aplicadoN = (doseHa * fN) / 100;
    const aplicadoP = (doseHa * fP) / 100;
    const aplicadoK = (doseHa * fK) / 100;

    return {
      doseHa,
      sacosHa: doseHa / 50,
      aplicado: { N: aplicadoN, P: aplicadoP, K: aplicadoK },
      meta: { N: mN, P: mP, K: mK },
      formula: `${fN}-${fP}-${fK}`
    };
  }, [metaN, metaP, metaK, formN, formP, formK, baseCalculo]);

  const handleSave = async () => {
    if (!user) return;

    try {
      // 1. Salvar Cliente (se houver nome)
      if (produtor) {
        await saveClient(user.uid, produtor, talhao);
      }

      // 2. Dados do relatório
      const reportData = {
        inputs: {
          produtor, talhao, responsavel, registro,
          metaN, metaP, metaK,
          formN, formP, formK,
          baseCalculo
        },
        results: resultados
      };

      if (reportId) {
        // UPDATE
        await updateReport(reportId, {
          title: `Adubação NPK - ${produtor || 'Sem Cliente'}`,
          data: reportData,
          clientName: produtor
        });
      } else {
        // CREATE
        const newId = await saveReport(
          user.uid,
          'adubacao',
          `Adubação NPK - ${produtor || 'Sem Cliente'}`,
          reportData,
          produtor
        );
        router.replace(`/analises/adubacao?id=${newId}`);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000); // Reset feedback after 3s

    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar relatório. Tente novamente.");
    }
  };

  const shareText = `🚜 *Planejamento NPK*\n\n🎯 *Adubo:* ${resultados.formula}\n⚖️ *Dose Calculada:* ${resultados.doseHa.toFixed(0)} kg/ha\n📦 *Sacos (50kg):* ${resultados.sacosHa.toFixed(1)} sc/ha\n\n*Balanço Nutricional:*\nN: ${resultados.aplicado.N.toFixed(1)} kg (Meta: ${resultados.meta.N})\nP: ${resultados.aplicado.P.toFixed(1)} kg (Meta: ${resultados.meta.P})\nK: ${resultados.aplicado.K.toFixed(1)} kg (Meta: ${resultados.meta.K})`;

  return (
    <CalculatorLayout
      title="Adubação NPK (Formulados)"
      subtitle="Cálculo de dosagem e balanço nutricional."
      category="Nutrição de Plantas"
      icon={<Leaf size={16} />}
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

          {/* ==================================================================================
               SEÇÃO 1: META NUTRICIONAL
               Aqui está o segredo: Temos a <section> (tela) e a <div hidden> (impressão)
           ================================================================================== */}

          {/* A. VISUAL DE TELA (Interativo) - some na impressão (print:hidden) */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden print:hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[4rem] -z-0"></div>
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center shadow-sm border border-emerald-200">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">Meta Nutricional</h3>
                <p className="text-xs text-slate-400 font-medium">Extraída da análise de solo (kg/ha)</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 relative z-10">
              <InputGroup label="Nitrogênio" icon="N" value={metaN} onChange={setMetaN} subLabel="Recomendado" />
              <InputGroup label="Fósforo" icon="P" value={metaP} onChange={setMetaP} subLabel="P₂O₅" />
              <InputGroup label="Potássio" icon="K" value={metaK} onChange={setMetaK} subLabel="K₂O" />
            </div>
          </section>

          {/* B. VISUAL DE IMPRESSÃO (Tabela Técnica) - só aparece na impressão (hidden print:block) */}
          <div className="hidden print:block">
            <TechnicalTable
              title="1. Meta Nutricional (Análise de Solo)"
              rows={[
                { label: "Nitrogênio Recomendado (N)", value: Number(metaN).toFixed(1), unit: "kg/ha" },
                { label: "Fósforo Recomendado (P₂O₅)", value: Number(metaP).toFixed(1), unit: "kg/ha" },
                { label: "Potássio Recomendado (K₂O)", value: Number(metaK).toFixed(1), unit: "kg/ha" },
              ]}
            />
          </div>

          {/* ==================================================================================
               SEÇÃO 2: ADUBO ESCOLHIDO
               Mesma lógica: Formulário na tela, Tabela no papel.
           ================================================================================== */}

          {/* A. VISUAL DE TELA */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative print:hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center shadow-sm border border-blue-200">
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">Adubo Escolhido</h3>
                  <p className="text-xs text-slate-400 font-medium">Garantia do formulado (%)</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1 bg-slate-800 text-white px-3 py-1.5 rounded-lg shadow-md">
                <span className="font-mono font-bold text-sm tracking-widest">
                  {String(formN || '00').padStart(2, '0')} - {String(formP || '00').padStart(2, '0')} - {String(formK || '00').padStart(2, '0')}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <InputGroup label="% N" icon="N" value={formN} onChange={setFormN} placeholder="00" />
              <InputGroup label="% P" icon="P" value={formP} onChange={setFormP} placeholder="00" />
              <InputGroup label="% K" icon="K" value={formK} onChange={setFormK} placeholder="00" />
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <label className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                <Scale size={14} className="text-slate-400" /> Qual meta devo priorizar?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "N", label: "Nitrogênio", desc: "Priorizar N" },
                  { id: "P", label: "Fósforo", desc: "Priorizar P" },
                  { id: "K", label: "Potássio", desc: "Priorizar K" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setBaseCalculo(item.id as any)}
                    className={`relative py-2.5 px-3 rounded-lg border text-left transition-all group ${baseCalculo === item.id
                      ? 'bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500'
                      : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200'
                      }`}
                  >
                    <span className={`block text-xs font-black uppercase tracking-wider mb-0.5 ${baseCalculo === item.id ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {item.id}
                    </span>
                    <span className={`text-sm font-bold block ${baseCalculo === item.id ? 'text-slate-800' : 'text-slate-500'}`}>
                      {item.label}
                    </span>
                    {baseCalculo === item.id && (
                      <div className="absolute top-2 right-2 text-emerald-500">
                        <CheckCircle2 size={14} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* B. VISUAL DE IMPRESSÃO (Tabela Técnica) */}
          <div className="hidden print:block">
            <TechnicalTable
              title="2. Garantia do Adubo (% no Saco)"
              rows={[
                { label: "Garantia de Nitrogênio (N)", value: Number(formN).toFixed(0), unit: "%" },
                { label: "Garantia de Fósforo (P₂O₅)", value: Number(formP).toFixed(0), unit: "%" },
                { label: "Garantia de Potássio (K₂O)", value: Number(formK).toFixed(0), unit: "%" },
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
                <h3 className="text-xl font-black text-slate-900 mb-2">Resultado Premium</h3>
                <button
                  onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 hover:scale-105"
                >
                  Desbloquear <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* VISUAL TELA: CARDS VISUAIS */}
            <div className={`space-y-6 transition-all duration-500 print:hidden ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>
              {/* Card DOSE */}
              <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500 rounded-full blur-[80px] opacity-20 -mr-10 -mt-10 pointer-events-none group-hover:opacity-30 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500 rounded-full blur-[60px] opacity-10 -ml-10 -mb-10 pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                        Resultado Calculado
                      </p>
                      <h3 className="text-white font-bold text-lg">Dose Recomendada</h3>
                    </div>
                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                      <Droplets className="text-emerald-300" size={20} />
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-6xl font-black tracking-tighter text-white">
                      {resultados.doseHa.toFixed(0)}
                    </span>
                    <span className="text-xl font-medium text-slate-400">kg/ha</span>
                  </div>

                  <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between border border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-700 p-2 rounded-lg">
                        <Package size={18} className="text-emerald-400" />
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block">Sacos (50kg)</span>
                        <span className="text-sm font-bold text-slate-200">Quantidade</span>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-white tabular-nums">
                      {resultados.sacosHa.toFixed(1)} <span className="text-xs text-slate-500 font-normal">sc/ha</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Card BALANÇO */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg shadow-slate-200/50">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <RefreshCw size={18} className="text-slate-400" />
                    <h3 className="font-bold text-slate-800">Balanço Nutricional</h3>
                  </div>
                  <div className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200">
                    Aplicado vs. Meta
                  </div>
                </div>

                <div className="space-y-2">
                  <BalanceBar
                    label="Nitrogênio (N)"
                    applied={resultados.aplicado.N}
                    target={resultados.meta.N}
                    isBase={baseCalculo === 'N'}
                  />
                  <BalanceBar
                    label="Fósforo (P₂O₅)"
                    applied={resultados.aplicado.P}
                    target={resultados.meta.P}
                    isBase={baseCalculo === 'P'}
                  />
                  <BalanceBar
                    label="Potássio (K₂O)"
                    applied={resultados.aplicado.K}
                    target={resultados.meta.K}
                    isBase={baseCalculo === 'K'}
                  />
                </div>

                <div className="mt-6 bg-blue-50/80 border border-blue-100 p-4 rounded-xl flex gap-3 items-start">
                  <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-900 leading-relaxed">
                    <span className="font-bold block mb-1 text-blue-700">Entendendo o cálculo:</span>
                    A dose de <strong>{resultados.doseHa.toFixed(0)} kg/ha</strong> foi definida para suprir exatos 100% da necessidade de <strong>{baseCalculo}</strong>.
                    Observe as barras acima para identificar excessos (azul) ou déficits (amarelo) nos outros nutrientes.
                  </div>
                </div>
              </div>
            </div>

            {/* VISUAL IMPRESSÃO: TABELAS FINAIS */}
            <div className="hidden print:block space-y-4">

              <TechnicalTable
                title="3. Parâmetros de Cálculo"
                rows={[
                  { label: "Meta Prioritária (Cálculo)", value: baseCalculo === 'N' ? 'Nitrogênio' : baseCalculo === 'P' ? 'Fósforo' : 'Potássio', unit: "" },
                  { label: "Fórmula Utilizada", value: resultados.formula, unit: "NPK" }
                ]}
              />

              <TechnicalTable
                title="4. Balanço Nutricional Final"
                rows={[
                  { label: "Nitrogênio (N) - Aplicado", value: resultados.aplicado.N.toFixed(1), unit: "kg/ha" },
                  { label: "Fósforo (P₂O₅) - Aplicado", value: resultados.aplicado.P.toFixed(1), unit: "kg/ha" },
                  { label: "Potássio (K₂O) - Aplicado", value: resultados.aplicado.K.toFixed(1), unit: "kg/ha" },
                ]}
              />

              <TechnicalTable
                title="5. Recomendação Técnica"
                rows={[
                  { label: "Dose por Hectare", value: resultados.doseHa.toFixed(1), unit: "kg/ha", isHeader: true },
                  { label: "Quantidade de Sacos (50kg)", value: resultados.sacosHa.toFixed(1), unit: "sc/ha" },
                  { label: "Status da Recomendação", value: "CALCULADO", unit: "" },
                ]}
              />
            </div>

          </div>
        </div>

      </div>
    </CalculatorLayout>
  );
}
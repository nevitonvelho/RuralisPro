"use client";

import { useState, useMemo } from "react";
import {
  Scale,
  Ruler,
  Wheat,
  ArrowRight,
  Lock,
  Calculator,
  LayoutGrid,
  TrendingUp,
  TrendingDown,
  Info,
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
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
        {icon}
      </div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        step={step}
        onWheel={(e) => e.currentTarget.blur()}
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

export default function ProdutividadePage() {
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

  // INPUTS DE AMOSTRAGEM
  const [metrosAmostra, setMetrosAmostra] = useState<number | string>(10); // Metros lineares contados
  const [espacamento, setEspacamento] = useState<number | string>(""); // cm
  const [contagemEspigas, setContagemEspigas] = useState<number | string>(""); // Qtd na amostra

  // INPUTS DE GRÃOS
  const [graosPorEspiga, setGraosPorEspiga] = useState<number | string>("");
  const [pmg, setPmg] = useState<number | string>(""); // Peso de mil grãos

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
          setMetrosAmostra(i.metrosAmostra || 10);
          setEspacamento(i.espacamento || "");
          setContagemEspigas(i.contagemEspigas || "");
          setGraosPorEspiga(i.graosPorEspiga || "");
          setPmg(i.pmg || "");
        }
      }).catch(console.error);
    }
  }, [reportId, user]);

  // CÁLCULOS
  const resultados = useMemo(() => {
    const mAmostra = Number(metrosAmostra) || 1;
    const espCm = Number(espacamento) || 0;
    const nEspigas = Number(contagemEspigas) || 0;
    const nGraos = Number(graosPorEspiga) || 0;
    const pesoMil = Number(pmg) || 0;

    if (espCm === 0 || mAmostra === 0) return { sacas: 0, kg: 0, populacao: 0, min: 0, max: 0 };

    // 1. Área Amostrada (m²)
    // Se espaçamento é 50cm (0.5m) e andei 10m -> Amostrei 5m²
    const areaAmostrada = mAmostra * (espCm / 100);

    // 2. População Estimada (Espigas/ha)
    const espigasPorHa = (nEspigas / areaAmostrada) * 10000;

    // 3. Peso Total (g/ha) -> (Espigas/ha * Grãos/Espiga * PMG) / 1000
    // O PMG é para mil grãos, então dividimos o peso por 1000
    const pesoTotalGramas = (espigasPorHa * nGraos * pesoMil) / 1000;

    // 4. Conversão Final
    const kgHa = pesoTotalGramas / 1000;
    const scHa = kgHa / 60;

    return {
      populacao: espigasPorHa,
      kg: kgHa,
      sacas: scHa,
      min: scHa * 0.90, // Variação de -10%
      max: scHa * 1.10  // Variação de +10%
    };
  }, [metrosAmostra, espacamento, contagemEspigas, graosPorEspiga, pmg]);

  const handleSave = async () => {
    if (!user) return;

    try {
      if (produtor) await saveClient(user.uid, produtor, talhao);

      const reportData = {
        inputs: {
          produtor, talhao, responsavel, registro,
          metrosAmostra, espacamento, contagemEspigas, graosPorEspiga, pmg
        },
        results: {
          populacao: resultados.populacao,
          kg: resultados.kg,
          sacas: resultados.sacas,
          min: resultados.min,
          max: resultados.max
        }
      };

      if (reportId) {
        await updateReport(reportId, {
          title: `Produtividade - ${produtor || 'Sem Cliente'}`,
          data: reportData,
          clientName: produtor
        });
      } else {
        const newId = await saveReport(
          user.uid,
          'estimativa-campo',
          `Produtividade - ${produtor || 'Sem Cliente'}`,
          reportData,
          produtor
        );
        router.replace(`/analises/estimativa-campo?id=${newId}`);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar relatório.");
    }
  };

  const fmt = (n: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(n);
  const fmtInt = (n: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(n);

  const shareText = `🌾 *Estimativa de Safra*\n\n📊 *Produtividade Calculada:*\n🎯 *${fmt(resultados.sacas)} sc/ha* (${fmt(resultados.kg)} kg/ha)\n\n⚖️ *Cenários:*\n🔻 Mín: ${fmt(resultados.min)} sc/ha\n🔺 Máx: ${fmt(resultados.max)} sc/ha`;

  return (
    <CalculatorLayout
      title="Estimativa de Produtividade"
      subtitle="Cálculo de rendimento baseado nos componentes de produção (Soja/Milho/Trigo)."
      category="Colheita"
      icon={<Wheat size={16} />}
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
               SEÇÃO 1: AMOSTRAGEM
           ======================================================== */}



          {/* A. VISUAL DE TELA */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:hidden">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><Ruler size={20} /></div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">1. Amostragem de Campo</h3>
                <p className="text-xs text-slate-400">Dados coletados na linha de plantio</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2 md:col-span-1">
                <InputGroup label="Metros Lineares" icon={<Ruler size={16} />} value={metrosAmostra} onChange={setMetrosAmostra} placeholder="Ex: 10" suffix="m" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <InputGroup label="Espaçamento" icon={<LayoutGrid size={16} />} value={espacamento} onChange={setEspacamento} placeholder="Ex: 50" suffix="cm" />
              </div>
              <div className="col-span-2">
                <InputGroup label="Nº de Espigas/Vagens na Amostra" icon={<Wheat size={16} />} value={contagemEspigas} onChange={setContagemEspigas} placeholder="Total contado" />
              </div>
            </div>
          </section>

          {/* B. VISUAL IMPRESSÃO */}
          <div className="hidden print:block">
            <TechnicalTable
              title="1. Dados da Amostragem"
              rows={[
                { label: "Comprimento da Linha", value: Number(metrosAmostra), unit: "m" },
                { label: "Espaçamento Entre Linhas", value: Number(espacamento), unit: "cm" },
                { label: "Contagem (Espigas/Vagens)", value: Number(contagemEspigas) },
              ]}
            />
          </div>

          {/* ========================================================
               SEÇÃO 2: ANÁLISE GRÃOS
           ======================================================== */}

          {/* A. VISUAL DE TELA */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:hidden">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Scale size={20} /></div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">2. Análise de Grãos</h3>
                <p className="text-xs text-slate-400">Componentes de peso e enchimento</p>
              </div>
            </div>



            <div className="grid grid-cols-2 gap-5 mt-4">
              <InputGroup label="Grãos por Espiga/Vagem" icon={<Calculator size={16} />} value={graosPorEspiga} onChange={setGraosPorEspiga} placeholder="Média" />
              <InputGroup label="PMG (Peso Mil Grãos)" icon={<Scale size={16} />} value={pmg} onChange={setPmg} placeholder="Ex: 300" suffix="g" />
            </div>

            <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-100 flex gap-2 items-center">
              <Info size={16} className="text-slate-400" />
              <p className="text-[10px] text-slate-500">
                O <strong>PMG</strong> varia conforme a cultivar. Consulte o datasheet da semente (Milho ~300g, Soja ~160g).
              </p>
            </div>
          </section>

          {/* B. VISUAL IMPRESSÃO */}
          <div className="hidden print:block">
            <TechnicalTable
              title="2. Componentes de Rendimento"
              rows={[
                { label: "Média de Grãos por Estrutura", value: Number(graosPorEspiga) },
                { label: "Peso de Mil Grãos (PMG)", value: Number(pmg), unit: "g" },
                { label: "População Estimada", value: fmtInt(resultados.populacao), unit: "pl/ha" },
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
                <div className="bg-slate-900 text-emerald-400 p-4 rounded-full mb-4 shadow-xl animate-pulse">
                  <Lock size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Estimativa Bloqueada</h3>
                <button
                  onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 hover:scale-105"
                >
                  Ver Resultado <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* --- ÁREA DE RESULTADOS VISUAIS (TELA - print:hidden) --- */}
            <div className={`print:hidden space-y-6 transition-all duration-500 ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>

              {/* Card Principal: SACAS/HA */}
              <div className="print-card bg-slate-900 text-white rounded-xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-20 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                <div className="relative z-10">
                  <p className="text-emerald-400 font-bold uppercase tracking-wider text-xs mb-1 flex items-center gap-2">
                    <TrendingUp size={16} /> Produtividade Estimada
                  </p>

                  <div className="flex items-end gap-3 my-6">
                    <span className="text-6xl font-black tracking-tighter text-white">
                      {fmt(resultados.sacas)}
                    </span>
                    <div className="mb-2">
                      <span className="text-xl font-medium text-slate-300 block">sc/ha</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-sm text-slate-400">Produção Total</span>
                    <span className="font-mono text-xl font-bold">{fmt(resultados.kg)} <span className="text-sm text-slate-500 font-normal">kg/ha</span></span>
                  </div>
                </div>
              </div>



              {/* Card Cenários (Sensibilidade) */}
              <div className="print-card bg-white border border-slate-200 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-slate-800 text-sm">Cenários de Risco (+/- 10%)</h4>
                  <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">Sensibilidade</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Cenário Pessimista */}
                  <div className="bg-red-50 rounded-lg p-3 border border-red-100 flex flex-col items-center text-center">
                    <div className="flex items-center gap-1 text-red-600 text-xs font-bold mb-1">
                      <TrendingDown size={14} /> Pessimista
                    </div>
                    <span className="text-2xl font-black text-slate-900">{fmt(resultados.min)}</span>
                    <span className="text-[10px] text-slate-500">sc/ha</span>
                  </div>

                  {/* Cenário Otimista */}
                  <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100 flex flex-col items-center text-center">
                    <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mb-1">
                      <TrendingUp size={14} /> Otimista
                    </div>
                    <span className="text-2xl font-black text-slate-900">{fmt(resultados.max)}</span>
                    <span className="text-[10px] text-slate-500">sc/ha</span>
                  </div>
                </div>
              </div>

              {/* População Calculada */}
              <div className="bg-white border border-slate-200 rounded-lg p-4 flex justify-between items-center text-xs shadow-sm">
                <span className="text-slate-500 font-bold uppercase">Stand Calculado</span>
                <span className="text-slate-900 font-mono font-bold bg-slate-100 px-2 py-1 rounded">
                  {fmtInt(resultados.populacao)} plantas/ha
                </span>
              </div>

            </div>

            {/* --- TABELA DE RESULTADOS (IMPRESSÃO - hidden print:block) --- */}
            <div className="hidden print:block">
              <TechnicalTable
                title="3. Estimativa Final"
                rows={[
                  { label: "Cenário Pessimista (-10%)", value: fmt(resultados.min), unit: "sc/ha" },
                  { label: "PRODUTIVIDADE ESTIMADA", value: fmt(resultados.sacas), unit: "sc/ha", isHeader: true },
                  { label: "Rendimento em Massa", value: fmt(resultados.kg), unit: "kg/ha" },
                  { label: "Cenário Otimista (+10%)", value: fmt(resultados.max), unit: "sc/ha" },
                ]}
              />
            </div>

          </div>
        </div>

      </div>
    </CalculatorLayout>
  );
}
"use client";

import { useState, useMemo } from "react";
import {
  Droplets,
  Layers,
  Ruler,
  ArrowRight,
  Lock,
  CloudRain,
  AlertTriangle,
  CheckCircle2,
  ThermometerSun,
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
}

const InputGroup = ({ label, icon, value, onChange, placeholder = "0", step = "0.1" }: InputGroupProps) => (
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
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 font-medium placeholder:text-slate-300"
      />
    </div>
  </div>
);

// --- COMPONENTE VISUAL (IMPRESSÃO - TABELA TÉCNICA) ---
interface TechnicalTableRow {
  label: string;
  value: string | number;
  unit: string;
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

export default function DeplecaoAguaPage() {
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

  // INPUTS - FÍSICA DO SOLO
  const [cc, setCc] = useState<number | string>(""); // Capacidade de Campo (%)
  const [pmp, setPmp] = useState<number | string>(""); // Ponto de Murcha (%)
  const [densidade, setDensidade] = useState<number | string>("1.2"); // g/cm3

  // INPUTS - SITUAÇÃO ATUAL
  const [profundidade, setProfundidade] = useState<number | string>(20); // cm (Z)
  const [umidadeAtual, setUmidadeAtual] = useState<number | string>(""); // % atual

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
          setCc(i.cc || "");
          setPmp(i.pmp || "");
          setDensidade(i.densidade || "1.2");
          setProfundidade(i.profundidade || 20);
          setUmidadeAtual(i.umidadeAtual || "");
        }
      }).catch(console.error);
    }
  }, [reportId, user]);

  // CÁLCULOS
  const resultados = useMemo(() => {
    const _cc = Number(cc) || 0;
    const _pmp = Number(pmp) || 0;
    const _ds = Number(densidade) || 0;
    const _z = Number(profundidade) || 0;
    const _uAtual = Number(umidadeAtual) || 0;

    if (_ds === 0 || _z === 0) return { cta: 0, atualMm: 0, irrigacao: 0, pctDisponivel: 0 };

    // 1. CTA (Capacidade Total de Água Disponível) em mm
    const cta = (_cc - _pmp) * _ds * _z / 10;

    // 2. Armazenamento Atual em mm (Acima do PMP)
    let atualMm = (_uAtual - _pmp) * _ds * _z / 10;
    if (atualMm < 0) atualMm = 0;
    if (atualMm > cta) atualMm = cta;

    // 3. Lâmina de Irrigação
    let irrigacaoNecessaria = (_cc - _uAtual) * _ds * _z / 10;
    if (irrigacaoNecessaria < 0) irrigacaoNecessaria = 0;

    // 4. Porcentagem do "Tanque" cheio
    const pctDisponivel = cta > 0 ? (atualMm / cta) * 100 : 0;

    return {
      cta, // Capacidade total do tanque
      atualMm, // O que tem hoje
      irrigacao: irrigacaoNecessaria, // O que falta repor
      pctDisponivel
    };
  }, [cc, pmp, densidade, profundidade, umidadeAtual]);

  const handleSave = async () => {
    if (!user) return;

    try {
      if (produtor) await saveClient(user.uid, produtor, talhao);

      const reportData = {
        inputs: {
          produtor, talhao, responsavel, registro,
          cc, pmp, densidade, profundidade, umidadeAtual
        },
        results: {
          cta: resultados.cta,
          atualMm: resultados.atualMm,
          irrigacao: resultados.irrigacao,
          pctDisponivel: resultados.pctDisponivel
        }
      };

      if (reportId) {
        await updateReport(reportId, {
          title: `Irrigação - ${produtor || 'Sem Cliente'}`,
          data: reportData,
          clientName: produtor
        });
      } else {
        const newId = await saveReport(
          user.uid,
          'deplecao-agua-solo',
          `Irrigação - ${produtor || 'Sem Cliente'}`,
          reportData,
          produtor
        );
        router.replace(`/analises/deplecao-agua-solo?id=${newId}`);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar relatório.");
    }
  };

  const shareText = `💧 *Manejo de Irrigação*\n\n📉 *Umidade Atual:* ${umidadeAtual}%\n🚿 *Reposição Necessária:* ${resultados.irrigacao.toFixed(1)} mm\n\n📊 *Status do Solo:*\nO solo está com ${resultados.pctDisponivel.toFixed(0)}% da sua capacidade de água disponível.`;

  // Define cores e status baseado na disponibilidade
  const getStatus = (pct: number) => {
    if (pct < 30) return { color: "text-red-500", bg: "bg-red-500", text: "Crítico (Estresse)", icon: <ThermometerSun size={18} /> };
    if (pct < 60) return { color: "text-amber-500", bg: "bg-amber-500", text: "Alerta (Baixa)", icon: <AlertTriangle size={18} /> };
    return { color: "text-blue-500", bg: "bg-blue-500", text: "Conforto Hídrico", icon: <CheckCircle2 size={18} /> };
  };

  const status = getStatus(resultados.pctDisponivel);

  return (
    <CalculatorLayout
      title="Depleção de Água (Irrigação)"
      subtitle="Cálculo da lâmina de reposição hídrica baseada na física do solo."
      category="Irrigação e Clima"
      icon={<Droplets size={16} />}
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
               SEÇÃO 1: FÍSICA DO SOLO
           ======================================================== */}

          {/* A. VISUAL DE TELA (Some na impressão) */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:hidden">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="p-2 bg-slate-100 text-slate-700 rounded-lg"><Layers size={20} /></div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">1. Dados do Solo (Análise Física)</h3>
                <p className="text-xs text-slate-400">Parâmetros de retenção de água</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <InputGroup label="CC (% Peso)" icon={<span className="text-[10px] font-bold">CC</span>} value={cc} onChange={setCc} placeholder="Ex: 30" />
              <InputGroup label="PMP (% Peso)" icon={<span className="text-[10px] font-bold">PMP</span>} value={pmp} onChange={setPmp} placeholder="Ex: 15" />
              <InputGroup label="Densidade (g/cm³)" icon={<span className="text-[10px] font-bold">Ds</span>} value={densidade} onChange={setDensidade} placeholder="Ex: 1.2" />
            </div>
          </section>

          {/* B. VISUAL IMPRESSÃO (Tabela Técnica) */}
          <div className="hidden print:block">
            <TechnicalTable
              title="1. Física do Solo"
              rows={[
                { label: "Capacidade de Campo (CC)", value: Number(cc), unit: "%" },
                { label: "Ponto de Murcha (PMP)", value: Number(pmp), unit: "%" },
                { label: "Densidade do Solo", value: Number(densidade), unit: "g/cm³" },
              ]}
            />
          </div>

          {/* ========================================================
               SEÇÃO 2: MONITORAMENTO
           ======================================================== */}

          {/* A. VISUAL DE TELA */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:hidden">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Droplets size={20} /></div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">2. Monitoramento Atual</h3>
                <p className="text-xs text-slate-400">Profundidade das raízes e umidade medida</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <InputGroup label="Profundidade Efetiva (cm)" icon={<Ruler size={16} />} value={profundidade} onChange={setProfundidade} placeholder="Ex: 20" />
              <InputGroup label="Umidade Atual (%)" icon={<Droplets size={16} />} value={umidadeAtual} onChange={setUmidadeAtual} placeholder="Ex: 22" />
            </div>

            <div className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-800 flex gap-2">
              <Droplets className="shrink-0 mt-0.5" size={16} />
              <span>Insira a umidade baseada em peso (gravimétrica). Se tiver sensor volumétrico, ajuste a densidade para 1.0.</span>
            </div>
          </section>

          {/* B. VISUAL IMPRESSÃO */}
          <div className="hidden print:block">
            <TechnicalTable
              title="2. Monitoramento de Campo"
              rows={[
                { label: "Profundidade de Raiz (Z)", value: Number(profundidade), unit: "cm" },
                { label: "Umidade Atual Medida", value: Number(umidadeAtual), unit: "%" },
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
                <h3 className="text-xl font-black text-slate-900 mb-2">Cálculo Bloqueado</h3>
                <button
                  onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 hover:scale-105"
                >
                  Ver Lâmina de Água <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* --- ÁREA DE RESULTADOS VISUAIS (TELA - print:hidden) --- */}
            <div className={`print:hidden space-y-6 transition-all duration-500 ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>

              {/* Card Principal: LÂMINA */}
              <div className="print-card bg-slate-900 text-white rounded-xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mb-10 pointer-events-none"></div>

                <div className="relative z-10">
                  <p className="text-blue-400 font-bold uppercase tracking-wider text-xs mb-1">
                    Lâmina de Irrigação
                  </p>
                  <p className="text-slate-400 text-[10px] mb-6">
                    Quantidade necessária para atingir a Capacidade de Campo (CC)
                  </p>

                  <div className="flex items-end gap-3 mb-6">
                    <span className="text-6xl font-black tracking-tighter text-white">
                      {resultados.irrigacao.toFixed(1)}
                    </span>
                    <div className="mb-2">
                      <span className="text-xl font-medium text-slate-300 block">mm</span>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">litros/m²</span>
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-3 flex items-center justify-between border border-slate-700">
                    <div className="flex items-center gap-2">
                      <CloudRain size={18} className="text-blue-400" />
                      <span className="text-sm font-medium text-slate-300">Tempo de Rega</span>
                    </div>
                    <span className="text-xs text-slate-400">Depende da vazão do sistema</span>
                  </div>
                </div>
              </div>

              {/* Card Secundário: O TANQUE (Gráfico) */}
              <div className="print-card bg-white border border-slate-200 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    Status do Solo
                  </h4>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold flex items-center gap-1 border ${status.color.replace('text', 'border')} bg-white`}>
                    {status.icon} {status.text}
                  </span>
                </div>

                <div className="flex gap-4 items-stretch h-40">
                  {/* O Tanque */}
                  <div className="w-16 bg-slate-100 rounded-lg relative overflow-hidden border border-slate-300 shadow-inner flex flex-col justify-end">
                    {/* Nível de Água */}
                    <div
                      style={{ height: `${resultados.pctDisponivel}%` }}
                      className={`w-full transition-all duration-700 relative ${status.bg} opacity-80`}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-white/30 w-full"></div>
                    </div>
                    <div className="absolute top-0 w-full border-t border-dashed border-slate-400 text-[8px] text-right pr-1 pt-0.5 text-slate-500 font-bold">CC</div>
                  </div>

                  {/* Legenda Lateral */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-bold">Capacidade Total (CTA)</span>
                      <span className="text-lg font-bold text-slate-800">{resultados.cta.toFixed(1)} mm</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-bold">Disponível Agora</span>
                      <span className={`text-2xl font-black ${status.color}`}>{resultados.atualMm.toFixed(1)} mm</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Solo a <strong>{resultados.pctDisponivel.toFixed(0)}%</strong> da capacidade útil.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* --- TABELA DE RESULTADOS (IMPRESSÃO - hidden print:block) --- */}
            <div className="hidden print:block">
              <TechnicalTable
                title="3. Resultados Hídricos"
                rows={[
                  { label: "Capacidade Total de Água (CTA)", value: resultados.cta.toFixed(1), unit: "mm" },
                  { label: "Água Disponível Atual", value: resultados.atualMm.toFixed(1), unit: "mm" },
                  { label: "REPOSIÇÃO NECESSÁRIA", value: resultados.irrigacao.toFixed(1), unit: "mm", isHeader: true },
                ]}
              />
            </div>

          </div>
        </div>

      </div>
    </CalculatorLayout>
  );
}
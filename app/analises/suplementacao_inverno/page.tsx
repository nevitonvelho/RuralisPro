"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Snowflake,
  ShoppingBag,
  Scale,
  ArrowRight,
  Lock,
  Coins,
  Truck,
  TrendingUp,
  Info,
  ClipboardList
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CalculatorLayout } from "@/app/components/CalculatorLayout";

// --- COMPONENTES AUXILIARES ---

const TechnicalTable = ({ title, rows }: { title: string, rows: any[] }) => {
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
              <td className="p-2 text-black font-bold w-1/2 print:border-r print:border-slate-300 print:text-black">{row.label}</td>
              <td className="p-2 text-black font-medium text-right print:text-black">{row.value}</td>
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
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
        {icon}
      </div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onWheel={(e) => e.currentTarget.blur()}
        placeholder={placeholder}
        step={step}
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

import { saveReport, saveClient, getReportById, updateReport } from "@/services/firestore";
import { useSearchParams, useRouter } from "next/navigation";
// ... (imports remain)

export default function SuplementacaoInvernoPage() {
  const [mounted, setMounted] = useState(false);
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

  const [qtdAnimais, setQtdAnimais] = useState<number | string>("");
  const [pesoMedio, setPesoMedio] = useState<number | string>("");
  const [precoSaco, setPrecoSaco] = useState<number | string>("");
  const [pesoSaco, setPesoSaco] = useState<number | string>(30);
  const [consumoAlvo, setConsumoAlvo] = useState<number | string>("");
  const [tipoEstrategia, setTipoEstrategia] = useState<"ureia" | "01" | "03" | "custom">("custom");

  useEffect(() => { setMounted(true); }, []);

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
          setQtdAnimais(i.qtdAnimais || "");
          setPesoMedio(i.pesoMedio || "");
          setPrecoSaco(i.precoSaco || "");
          setPesoSaco(i.pesoSaco || 30);
          setConsumoAlvo(i.consumoAlvo || "");
          setTipoEstrategia(i.tipoEstrategia || "custom");
        }
      }).catch(console.error);
    }
  }, [reportId, user]);

  const aplicarPreset = (tipo: "ureia" | "01" | "03") => {
    const peso = Number(pesoMedio) || 450;
    setTipoEstrategia(tipo);
    if (tipo === "ureia") setConsumoAlvo(50);
    else if (tipo === "01") setConsumoAlvo((peso * 0.001 * 1000).toFixed(0));
    else if (tipo === "03") setConsumoAlvo((peso * 0.003 * 1000).toFixed(0));
  };

  const resultados = useMemo(() => {
    const qtd = Number(qtdAnimais) || 0;
    const consDia = Number(consumoAlvo) || 0;
    const prcSaco = Number(precoSaco) || 0;
    const kgSaco = Number(pesoSaco) || 30;

    if (consDia === 0 || kgSaco === 0) return { custoDia: 0, custoMes: 0, sacosMes: 0, rows: [] };

    const precoKg = prcSaco / kgSaco;
    const custoDia = (consDia / 1000) * precoKg;
    const consumoLoteDiaKg = (consDia * qtd) / 1000;
    const consumoLoteMesKg = consumoLoteDiaKg * 30;
    const sacosMes = consumoLoteMesKg / kgSaco;
    const custoMes = custoDia * qtd * 30;

    const fmtMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

    return {
      custoDia, custoMes, sacosMes, consumoLoteMesKg,
      rows: [
        { label: "Consumo Individual", value: `${consDia} g/dia` },
        { label: "Consumo Lote (Mês)", value: `${consumoLoteMesKg.toFixed(0)} kg` },
        { label: "Necessidade de Compra", value: `${Math.ceil(sacosMes)} sacos/mês` },
        { label: "Custo Cabeça/Mês", value: fmtMoeda(custoDia * 30) },
        { label: "Investimento Lote (90 dias)", value: fmtMoeda(custoMes * 3) }
      ]
    };
  }, [qtdAnimais, consumoAlvo, precoSaco, pesoSaco]);

  const handleSave = async () => {
    if (!user) return;

    try {
      if (produtor) await saveClient(user.uid, produtor, talhao);

      const reportData = {
        inputs: {
          produtor, talhao, responsavel, registro,
          qtdAnimais, pesoMedio, precoSaco, pesoSaco, consumoAlvo, tipoEstrategia
        },
        results: {
          custoDia: resultados.custoDia,
          custoMes: resultados.custoMes,
          sacosMes: resultados.sacosMes,
          consumoLoteMesKg: resultados.consumoLoteMesKg
        }
      };

      if (reportId) {
        await updateReport(reportId, {
          title: `Suplementação - ${produtor || 'Sem Cliente'}`,
          data: reportData,
          clientName: produtor
        });
      } else {
        const newId = await saveReport(
          user.uid,
          'suplementacao_inverno',
          `Suplementação - ${produtor || 'Sem Cliente'}`,
          reportData,
          produtor
        );
        router.replace(`/analises/suplementacao_inverno?id=${newId}`);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar relatório.");
    }
  };

  if (!mounted) return null;

  const fmtMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <CalculatorLayout
      title="Suplementação de Inverno"
      subtitle="Planejamento de custo nutricional e logística para o período da seca."
      category="Nutrição"
      icon={<Snowflake size={16} />}
      produtor={produtor}
      setProdutor={setProdutor}
      talhao={talhao}
      setTalhao={setTalhao}
      responsavelTecnico={responsavel}
      setResponsavelTecnico={setResponsavel}
      registroProfissional={registro}
      setRegistroProfissional={setRegistro}
      shareText={`📊 Planejamento Nutricional: ${fmtMoeda(resultados.custoDia)}/dia`}
      onSave={handleSave}
      saved={saved}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">

        {/* --- INPUTS --- */}
        <div className="lg:col-span-7 space-y-6">
          <div className="print:hidden space-y-6">
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg"><Scale size={20} /></div>
                <h3 className="font-bold text-lg text-slate-800">1. Dados do Lote</h3>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <InputGroup label="Qtd Animais" icon={<span className="font-bold text-xs">Nº</span>} value={qtdAnimais} onChange={setQtdAnimais} />
                <InputGroup label="Peso Médio" icon={<Scale size={16} />} value={pesoMedio} onChange={setPesoMedio} suffix="kg" />
              </div>
            </section>

            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Snowflake size={20} /></div>
                <h3 className="font-bold text-lg text-slate-800">2. Estratégia Nutricional</h3>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-6">
                {/* Botoes de Preset ... (Mantidos do seu original com estilo ajustado) */}
                <button onClick={() => aplicarPreset("ureia")} className={`p-3 rounded-lg border text-xs font-bold transition-all ${tipoEstrategia === 'ureia' ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>Sal/Ureia</button>
                <button onClick={() => aplicarPreset("01")} className={`p-3 rounded-lg border text-xs font-bold transition-all ${tipoEstrategia === '01' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>Proteinado 0.1%</button>
                <button onClick={() => aplicarPreset("03")} className={`p-3 rounded-lg border text-xs font-bold transition-all ${tipoEstrategia === '03' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>Energético 0.3%</button>
              </div>

              <div className="grid grid-cols-2 gap-5 mb-4">
                <InputGroup label="Consumo Alvo" icon={<TrendingUp size={16} />} value={consumoAlvo} onChange={(v: any) => { setConsumoAlvo(v); setTipoEstrategia('custom'); }} suffix="g/dia" />
                <InputGroup label="Preço Saco" icon={<Coins size={16} />} value={precoSaco} onChange={setPrecoSaco} suffix="R$" />
              </div>
              <InputGroup label="Peso do Saco" icon={<ShoppingBag size={16} />} value={pesoSaco} onChange={setPesoSaco} suffix="kg" />
            </section>
          </div>

          <div className="hidden print:block">
            <TechnicalTable title="Detalhamento Logístico e Nutricional" rows={resultados.rows} />
          </div>
        </div>

        {/* --- RESULTADOS --- */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-10 print:static">
            {!isAuthenticated && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg h-full print:hidden">
                <div className="bg-slate-900 text-blue-400 p-4 rounded-full mb-4 shadow-xl animate-pulse"><Lock size={32} /></div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Orçamento Bloqueado</h3>
                <button onClick={() => (document.getElementById("modal_auth") as any)?.showModal()} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center gap-2">Ver Custos <ArrowRight size={16} /></button>
              </div>
            )}

            <div className={`space-y-6 transition-all duration-500 print:hidden ${!isAuthenticated ? 'opacity-40 filter blur-sm select-none pointer-events-none' : ''}`}>
              <div className="bg-slate-900 text-white rounded-xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-16 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <p className="text-blue-400 font-bold uppercase tracking-wider text-[10px] mb-1">Custo por Cabeça / Dia</p>
                <div className="flex items-end gap-2 mb-6">
                  <span className="text-5xl font-black tracking-tighter">{fmtMoeda(resultados.custoDia)}</span>
                </div>
                <div className="bg-slate-800 rounded-lg p-3 flex justify-between border border-slate-700">
                  <span className="text-sm text-slate-300">Consumo Lote</span>
                  <span className="text-xs font-bold text-white">{(resultados.consumoLoteMesKg || 0).toFixed(0)} kg / mês</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Truck size={18} className="text-emerald-600" />
                  <h4 className="font-bold text-slate-800 text-sm">Logística Mensal</h4>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="bg-slate-50 p-4 rounded-lg text-center min-w-[90px]">
                    <span className="block text-2xl font-black text-slate-900">{Math.ceil(resultados.sacosMes || 0)}</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Sacos</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Investimento Mensal</p>
                    <p className="text-2xl font-black text-emerald-600">{fmtMoeda(resultados.custoMes)}</p>
                  </div>
                </div>
              </div>



              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3 border-l-4 border-l-amber-500">
                <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-amber-800 leading-relaxed">
                  <strong>Reserva Estratégica:</strong> Para atravessar 90 dias de seca, você precisará de <strong>{Math.ceil(resultados.sacosMes * 3)} sacos</strong> em estoque.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
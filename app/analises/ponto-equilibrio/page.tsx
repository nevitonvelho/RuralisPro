"use client";

import { useState, useMemo } from "react";
import {
  Scale, // Balança/Equilíbrio
  DollarSign,
  ArrowRight,
  Lock,
  Target,
  ShieldCheck,
  TrendingDown,
  AlertTriangle,
  LandPlot,
  ClipboardList,
  TrendingUp
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
const InputGroup = ({ label, icon, value, onChange, placeholder = "0", step = "0.01", suffix }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
        {icon}
      </div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onWheel={(e) => e.currentTarget.blur()}
        placeholder={placeholder}
        step={step}
        className="w-full pl-10 pr-12 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 font-medium placeholder:text-slate-300"
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
import { useEffect } from "react";

// ... (imports remain)

export default function PontoEquilibrioPage() {
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

  // INPUTS - CUSTOS
  const [custoPorHa, setCustoPorHa] = useState<number | string>(""); // Custo Total

  // INPUTS - EXPECTATIVAS
  const [precoAlvo, setPrecoAlvo] = useState<number | string>(""); // R$/sc
  const [produtividadeAlvo, setProdutividadeAlvo] = useState<number | string>(""); // sc/ha

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
          setCustoPorHa(i.custoPorHa || "");
          setPrecoAlvo(i.precoAlvo || "");
          setProdutividadeAlvo(i.produtividadeAlvo || "");
        }
      }).catch(console.error);
    }
  }, [reportId, user]);

  // FORMATAÇÃO
  const fmtMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(v);
  const fmtPct = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(v) + '%';

  // CÁLCULOS
  const resultados = useMemo(() => {
    const custo = Number(custoPorHa) || 0;
    const preco = Number(precoAlvo) || 0;
    const prod = Number(produtividadeAlvo) || 0;

    if (custo === 0) return {
      eqSacas: 0,
      eqPreco: 0,
      margemSeguranca: 0,
      status: 'neutral',
      receitaEsperada: 0,
      lucroProjetado: 0,
      rowsResumo: []
    };

    // 1. Ponto de Equilíbrio em PRODUÇÃO (sc/ha)
    const eqSacas = preco > 0 ? custo / preco : 0;

    // 2. Ponto de Equilíbrio em PREÇO (R$/sc)
    const eqPreco = prod > 0 ? custo / prod : 0;

    // 3. Financeiro Projetado
    const receitaEsperada = prod * preco;
    const lucroProjetado = receitaEsperada - custo;

    // 4. Margem de Segurança (%)
    let margemSeguranca = 0;
    if (prod > 0 && eqSacas > 0) {
      margemSeguranca = ((prod - eqSacas) / prod) * 100;
    }

    // 5. Status
    let status = 'safe';
    let labelStatus = 'Margem Segura';
    if (margemSeguranca < 10) { status = 'warning'; labelStatus = 'Margem Apertada'; }
    if (margemSeguranca < 0) { status = 'danger'; labelStatus = 'Prejuízo Projetado'; }

    return {
      eqSacas,
      eqPreco,
      margemSeguranca,
      status,
      receitaEsperada,
      lucroProjetado,
      // DADOS PARA TABELA DE IMPRESSÃO
      rowsResumo: [
        { "Item": "Custo por Hectare", "Valor": fmtMoeda(custo) },
        { "Item": "Preço de Venda (Est.)", "Valor": fmtMoeda(preco) },
        { "Item": "Produtividade (Est.)", "Valor": `${fmtNum(prod)} sc/ha` },
        { "Item": "PONTO EQUILÍBRIO (PROD)", "Valor": `${fmtNum(eqSacas)} sc/ha` },
        { "Item": "PONTO EQUILÍBRIO (PREÇO)", "Valor": fmtMoeda(eqPreco) },
        { "Item": "Margem de Segurança", "Valor": fmtPct(margemSeguranca) },
        { "Item": "Lucro Projetado/ha", "Valor": fmtMoeda(lucroProjetado) },
      ]
    };
  }, [custoPorHa, precoAlvo, produtividadeAlvo]);

  const handleSave = async () => {
    if (!user) return;

    try {
      if (produtor) await saveClient(user.uid, produtor, talhao);

      const reportData = {
        inputs: {
          produtor, talhao, responsavel, registro,
          custoPorHa, precoAlvo, produtividadeAlvo
        },
        results: {
          eqSacas: resultados.eqSacas,
          eqPreco: resultados.eqPreco,
          margemSeguranca: resultados.margemSeguranca,
          status: resultados.status,
          receitaEsperada: resultados.receitaEsperada,
          lucroProjetado: resultados.lucroProjetado
        }
      };

      if (reportId) {
        await updateReport(reportId, {
          title: `Ponto Equilíbrio - ${produtor || 'Sem Cliente'}`,
          data: reportData,
          clientName: produtor
        });
      } else {
        const newId = await saveReport(
          user.uid,
          'ponto-equilibrio',
          `Ponto Equilíbrio - ${produtor || 'Sem Cliente'}`,
          reportData,
          produtor
        );
        router.replace(`/analises/ponto-equilibrio?id=${newId}`);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar relatório.");
    }
  };

  const shareText = `⚖️ *Ponto de Equilíbrio - ${talhao || 'Safra'}*\n\n📉 *Preciso Colher:* ${fmtNum(resultados.eqSacas)} sc/ha\n💲 *Preço Mínimo:* ${fmtMoeda(resultados.eqPreco)}/sc\n\n🛡️ *Margem de Segurança:* ${fmtPct(resultados.margemSeguranca)}\n(Custo Base: ${fmtMoeda(Number(custoPorHa))}/ha)`;

  return (
    <CalculatorLayout
      title="Ponto de Equilíbrio"
      subtitle="Cálculo de Break-even Point (Nivelamento) por produtividade e preço."
      category="Financeiro e Mercado"
      icon={<Scale size={16} />}
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

        {/* --- INPUTS --- */}
        <div className="lg:col-span-7 space-y-6">

          <div className="print:hidden">
            {/* Seção 1: Estrutura de Custo */}
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg"><TrendingDown size={20} /></div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">1. Custo de Produção</h3>
                  <p className="text-xs text-slate-400">Total investido para produzir (COE + Custos Fixos)</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-5">
                <InputGroup label="Custo Total por Hectare" icon={<DollarSign size={16} />} value={custoPorHa} onChange={setCustoPorHa} placeholder="Ex: 5800.00" suffix="R$/ha" />
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                *Inclua sementes, químicos, fertilizantes, operações, arrendamento e depreciação para um cálculo preciso.
              </p>
            </section>

            {/* Seção 2: Cenário Esperado */}
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg"><Target size={20} /></div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">2. Expectativas</h3>
                  <p className="text-xs text-slate-400">O que você espera do mercado e da lavoura?</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputGroup label="Preço de Mercado/Venda" icon={<DollarSign size={16} />} value={precoAlvo} onChange={setPrecoAlvo} placeholder="Ex: 125.00" suffix="R$/sc" />
                <InputGroup label="Produtividade Estimada" icon={<LandPlot size={16} />} value={produtividadeAlvo} onChange={setProdutividadeAlvo} placeholder="Ex: 65" suffix="sc/ha" />
              </div>
            </section>
          </div>

          {/* TABELA VISIVEL APENAS NA IMPRESSAO */}
          <div className="hidden print:block">
            <TechnicalTable title="Análise de Viabilidade Econômica" rows={resultados.rowsResumo} />
          </div>
        </div>

        {/* --- RESULTADOS --- */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-10 print:static">

            {/* OVERLAY BLOQUEIO */}
            {!isAuthenticated && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg h-full print:hidden">
                <div className="bg-slate-900 text-indigo-400 p-4 rounded-full mb-4 shadow-xl animate-pulse">
                  <Lock size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Análise de Risco Bloqueada</h3>
                <button
                  onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 hover:scale-105"
                >
                  Ver Nivelamento <ArrowRight size={16} />
                </button>
              </div>
            )}

            <div className={`space-y-6 transition-all duration-500 print:hidden ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>

              {/* Card Principal: MATRIZ DE EQUILÍBRIO */}
              <div className="print-card bg-slate-900 text-white rounded-xl p-8 shadow-xl relative overflow-hidden">
                {/* Background Effect */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                <div className="relative z-10 text-center">
                  <p className="text-indigo-400 font-bold uppercase tracking-wider text-xs mb-6 flex items-center justify-center gap-2">
                    <Scale size={14} /> Matriz de Nivelamento (Zero-a-Zero)
                  </p>

                  <div className="grid grid-cols-2 gap-8 relative">
                    {/* Linha vertical divisória */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-700/50 -translate-x-1/2"></div>

                    {/* Lado Esquerdo: Produção Necessária */}
                    <div>
                      <div className="flex justify-center text-slate-400 mb-2"><LandPlot size={24} /></div>
                      <p className="text-[10px] text-slate-400 uppercase mb-1">Para pagar a conta</p>
                      <span className="block text-4xl font-black text-white">{fmtNum(resultados.eqSacas)}</span>
                      <span className="text-xs font-bold text-indigo-400">sc/ha</span>
                      <p className="text-[10px] text-slate-500 mt-2 leading-tight">
                        Considerando venda a {fmtMoeda(Number(precoAlvo))}
                      </p>
                    </div>

                    {/* Lado Direito: Preço Necessário */}
                    <div>
                      <div className="flex justify-center text-slate-400 mb-2"><DollarSign size={24} /></div>
                      <p className="text-[10px] text-slate-400 uppercase mb-1">Preço Mínimo</p>
                      <span className="block text-4xl font-black text-white">
                        <span className="text-lg align-top">R$</span>
                        {fmtNum(resultados.eqPreco)}
                      </span>
                      <span className="text-xs font-bold text-indigo-400">por saca</span>
                      <p className="text-[10px] text-slate-500 mt-2 leading-tight">
                        Considerando colher {produtividadeAlvo} sc/ha
                      </p>
                    </div>
                  </div>
                </div>
              </div>



              {/* Card Secundário: MARGEM DE SEGURANÇA */}
              <div className={`print-card border rounded-xl p-6 shadow-lg relative ${resultados.status === 'safe' ? 'bg-emerald-50 border-emerald-200' :
                resultados.status === 'warning' ? 'bg-amber-50 border-amber-200' :
                  'bg-red-50 border-red-200'
                }`}>
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-black/5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={
                      resultados.status === 'safe' ? 'text-emerald-600' :
                        resultados.status === 'warning' ? 'text-amber-600' :
                          'text-red-600'
                    } size={20} />
                    <h4 className={`font-bold text-sm ${resultados.status === 'safe' ? 'text-emerald-900' :
                      resultados.status === 'warning' ? 'text-amber-900' :
                        'text-red-900'
                      }`}>Margem de Segurança</h4>
                  </div>
                  <div className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${resultados.status === 'safe' ? 'bg-emerald-200 text-emerald-800' :
                    resultados.status === 'warning' ? 'bg-amber-200 text-amber-800' :
                      'bg-red-200 text-red-800'
                    }`}>
                    {resultados.status === 'safe' ? 'Seguro' : resultados.status === 'warning' ? 'Atenção' : 'Risco'}
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <span className={`block text-3xl font-black ${resultados.status === 'safe' ? 'text-emerald-700' :
                      resultados.status === 'warning' ? 'text-amber-700' :
                        'text-red-700'
                      }`}>{fmtPct(resultados.margemSeguranca)}</span>
                    <span className="text-[10px] opacity-70 uppercase font-bold text-black">Acima do custo</span>
                  </div>

                  <div className="text-right max-w-[50%]">
                    <p className="text-[10px] text-slate-600 leading-tight">
                      {resultados.status === 'safe'
                        ? "Você tem uma boa 'gordura' para quebra de safra ou queda de preço."
                        : resultados.status === 'warning'
                          ? "Qualquer imprevisto climático ou de mercado colocará a operação no vermelho."
                          : "Custo projetado é maior que a receita. Revise custos ou aguarde preço melhor."
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Dica Estratégica */}
              {resultados.status !== 'danger' && Number(custoPorHa) > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 text-xs text-slate-500 shadow-sm">
                  <div className="flex gap-2 items-center mb-2 font-bold text-slate-700 uppercase">
                    <TrendingUp size={14} /> Estratégia Sugerida
                  </div>
                  <p>
                    Se o mercado oferecer contratos futuros acima de <strong>{fmtMoeda(resultados.eqPreco)}</strong>, considere travar parte da produção para garantir o pagamento dos custos fixos.
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
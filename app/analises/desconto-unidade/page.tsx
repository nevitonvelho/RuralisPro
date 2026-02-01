"use client";

import { useState, useMemo } from "react";
import {
  Droplets, // Umidade
  Scale, // Peso
  Coins,
  ArrowRight,
  Lock,
  Info,
  Flame,
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
  isNegative?: boolean; // Para destacar descontos em vermelho/alerta
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
              <td className={`p-2 w-1/3 text-right font-bold ${row.isHeader ? 'text-white print:text-black' : (row.isNegative ? 'text-red-700' : 'text-black')}`}>
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

export default function DescontoUmidadePage() {
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

  // INPUTS - CARGA
  const [pesoBruto, setPesoBruto] = useState<number | string>("");
  const [umidadeAtual, setUmidadeAtual] = useState<number | string>("");
  const [umidadePadrao, setUmidadePadrao] = useState<number | string>("14");

  // INPUTS - CUSTOS
  const [taxaSecagem, setTaxaSecagem] = useState<number | string>("");
  const [precoSaca, setPrecoSaca] = useState<number | string>("");

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
          setPesoBruto(i.pesoBruto || "");
          setUmidadeAtual(i.umidadeAtual || "");
          setUmidadePadrao(i.umidadePadrao || "14");
          setTaxaSecagem(i.taxaSecagem || "");
          setPrecoSaca(i.precoSaca || "");
        }
      }).catch(console.error);
    }
  }, [reportId, user]);

  // CÁLCULOS
  const resultados = useMemo(() => {
    const peso = Number(pesoBruto) || 0;
    const ui = Number(umidadeAtual) || 0;
    const up = Number(umidadePadrao) || 14;
    const taxa = Number(taxaSecagem) || 0;
    const preco = Number(precoSaca) || 0;

    if (peso === 0) {
      return {
        pesoLiquidoTecnico: 0,
        quebraKg: 0,
        custoSecagemTotal: 0,
        perdaTotalFinanceira: 0,
        precoRealSaca: 0,
        percentualQuebra: 0
      };
    }

    // 1. Cálculo da Quebra Técnica
    let pesoLiquidoTecnico = peso;
    if (ui > up) {
      pesoLiquidoTecnico = peso * ((100 - ui) / (100 - up));
    }

    const quebraKg = peso - pesoLiquidoTecnico;

    // 2. Custo da Secagem
    const toneladasEntrada = peso / 1000;
    const custoSecagemTotal = toneladasEntrada * taxa;

    // 3. Conversão Financeira
    const sacasPerdidas = quebraKg / 60;
    const valorQuebraTecnica = sacasPerdidas * preco;

    // 4. Perda Total
    const perdaTotalFinanceira = valorQuebraTecnica + custoSecagemTotal;

    // 5. Preço Real (Netback)
    const sacasBrutas = peso / 60;
    const receitaTeorica = sacasBrutas * preco;

    const receitaLiquida = receitaTeorica - perdaTotalFinanceira;
    const precoRealSaca = sacasBrutas > 0 ? receitaLiquida / sacasBrutas : 0;

    return {
      pesoLiquidoTecnico,
      quebraKg,
      custoSecagemTotal,
      perdaTotalFinanceira,
      precoRealSaca,
      percentualQuebra: (quebraKg / peso) * 100
    };
  }, [pesoBruto, umidadeAtual, umidadePadrao, taxaSecagem, precoSaca]);

  const handleSave = async () => {
    if (!user) return;

    try {
      if (produtor) await saveClient(user.uid, produtor, talhao);

      const reportData = {
        inputs: {
          produtor, talhao, responsavel, registro,
          pesoBruto, umidadeAtual, umidadePadrao, taxaSecagem, precoSaca
        },
        results: {
          pesoLiquidoTecnico: resultados.pesoLiquidoTecnico,
          quebraKg: resultados.quebraKg,
          custoSecagemTotal: resultados.custoSecagemTotal,
          perdaTotalFinanceira: resultados.perdaTotalFinanceira,
          precoRealSaca: resultados.precoRealSaca,
          percentualQuebra: resultados.percentualQuebra
        }
      };

      if (reportId) {
        await updateReport(reportId, {
          title: `Desconto Umidade - ${produtor || 'Sem Cliente'}`,
          data: reportData,
          clientName: produtor
        });
      } else {
        const newId = await saveReport(
          user.uid,
          'desconto-unidade',
          `Desconto Umidade - ${produtor || 'Sem Cliente'}`,
          reportData,
          produtor
        );
        router.replace(`/analises/desconto-unidade?id=${newId}`);
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
  const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(v);
  const fmtPct = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(v) + '%';

  const shareText = `💧 *Desconto de Umidade - ${talhao || 'Carga'}*\n\n📉 *Entrada:* ${fmtNum(Number(pesoBruto))} kg (${umidadeAtual}%)\n✅ *Líquido:* ${fmtNum(resultados.pesoLiquidoTecnico)} kg (${umidadePadrao}%)\n\n💸 *Desconto Peso:* ${fmtNum(resultados.quebraKg)} kg\n🔥 *Custo Secagem:* ${fmtMoeda(resultados.custoSecagemTotal)}\n\n(Total descontado: ${fmtMoeda(resultados.perdaTotalFinanceira)})`;

  return (
    <CalculatorLayout
      title="Desconto de Umidade"
      subtitle="Calcule a quebra técnica (água) e custos de secagem no romaneio."
      category="Financeiro e Mercado"
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
               SEÇÃO 1: DADOS DA CARGA
           ======================================================== */}

          {/* A. VISUAL DE TELA */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:hidden">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Scale size={20} /></div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">1. Dados do Romaneio</h3>
                <p className="text-xs text-slate-400">Peso e umidade medidos na entrada</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
              <InputGroup label="Peso de Entrada (Bruto)" icon={<Scale size={16} />} value={pesoBruto} onChange={setPesoBruto} placeholder="Ex: 35000" suffix="kg" />
              <InputGroup label="Umidade Aferida" icon={<Droplets size={16} />} value={umidadeAtual} onChange={setUmidadeAtual} placeholder="Ex: 18.5" suffix="%" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputGroup label="Umidade Padrão" icon={<Info size={16} />} value={umidadePadrao} onChange={setUmidadePadrao} placeholder="Padrão: 14" suffix="%" />
            </div>
          </section>

          {/* B. VISUAL IMPRESSÃO (Tabela) */}
          <div className="hidden print:block">
            <TechnicalTable
              title="1. Dados de Entrada (Romaneio)"
              rows={[
                { label: "Peso Bruto de Entrada", value: fmtNum(Number(pesoBruto)), unit: "kg" },
                { label: "Umidade Aferida na Carga", value: Number(umidadeAtual), unit: "%" },
                { label: "Umidade Padrão (Base)", value: Number(umidadePadrao), unit: "%" },
              ]}
            />
          </div>

          {/* ========================================================
               SEÇÃO 2: CUSTOS
           ======================================================== */}

          {/* A. VISUAL DE TELA */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:hidden">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Flame size={20} /></div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">2. Taxas e Preços</h3>
                <p className="text-xs text-slate-400">Custo de serviço e valor de mercado</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputGroup label="Taxa de Secagem (Armazém)" icon={<Coins size={16} />} value={taxaSecagem} onChange={setTaxaSecagem} placeholder="Ex: 35.00" suffix="R$/ton" />
              <InputGroup label="Preço da Saca (Mercado)" icon={<Coins size={16} />} value={precoSaca} onChange={setPrecoSaca} placeholder="Ex: 130.00" suffix="R$/sc" />
            </div>
          </section>

          {/* B. VISUAL IMPRESSÃO (Tabela) */}
          <div className="hidden print:block">
            <TechnicalTable
              title="2. Parâmetros Comerciais"
              rows={[
                { label: "Taxa de Secagem (Armazém)", value: fmtMoeda(Number(taxaSecagem)), unit: "/ ton" },
                { label: "Preço de Mercado (Saca)", value: fmtMoeda(Number(precoSaca)), unit: "/ sc" },
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
                  Ver Desconto <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* --- ÁREA DE RESULTADOS VISUAIS (TELA - print:hidden) --- */}
            <div className={`print:hidden space-y-6 transition-all duration-500 ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>

              {/* Card Principal: QUEBRA DE PESO */}
              <div className="print-card bg-slate-900 text-white rounded-xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-full bg-gradient-to-l from-blue-600/20 to-transparent pointer-events-none"></div>

                <div className="relative z-10">
                  <p className="text-blue-300 font-bold uppercase tracking-wider text-xs mb-4">
                    Desconto de Peso (Água)
                  </p>

                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-5xl font-black tracking-tighter text-white">
                      {fmtNum(resultados.quebraKg)}
                    </span>
                    <span className="text-xl font-medium text-slate-400">kg</span>
                  </div>

                  <div className="inline-block px-3 py-1 rounded bg-red-500/20 text-red-300 text-xs font-bold mb-6">
                    -{fmtPct(resultados.percentualQuebra)} do volume total
                  </div>

                  <div className="border-t border-slate-700 pt-4 flex justify-between items-center">
                    <span className="text-xs text-slate-400 uppercase">Peso Líquido Final</span>
                    <span className="text-2xl font-bold text-emerald-400">{fmtNum(resultados.pesoLiquidoTecnico)} kg</span>
                  </div>
                </div>
              </div>

              {/* Card Secundário: IMPACTO FINANCEIRO TOTAL */}
              {Number(precoSaca) > 0 && (
                <div className="print-card bg-white border border-slate-200 rounded-xl p-6 shadow-lg relative">
                  <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
                    <Coins className="text-slate-600" size={20} />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Custo Total da Umidade</h4>
                      <p className="text-[10px] text-slate-400">Produto Perdido + Taxas</p>
                    </div>
                  </div>

                  <div className="text-center py-2">
                    <span className="block text-3xl font-black text-red-600">{fmtMoeda(resultados.perdaTotalFinanceira)}</span>
                    <span className="text-[10px] text-red-400 uppercase font-bold mt-1">Deixado na Mesa</span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded text-center">
                      <span className="block text-slate-400 text-[10px] uppercase">Perda Técnica</span>
                      <span className="font-bold text-slate-700">{fmtMoeda(resultados.quebraKg / 60 * Number(precoSaca))}</span>
                    </div>
                    <div className="bg-orange-50 p-2 rounded text-center">
                      <span className="block text-orange-400 text-[10px] uppercase">Taxa Secagem</span>
                      <span className="font-bold text-orange-700">{fmtMoeda(resultados.custoSecagemTotal)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Card Terciário: PREÇO REAL */}
              {Number(precoSaca) > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 relative">
                  <div className="flex gap-3 items-center mb-2">
                    <Info size={18} className="text-blue-600" />
                    <p className="text-xs font-bold text-blue-800 uppercase">Análise de Preço</p>
                  </div>
                  <p className="text-sm text-blue-900 mb-1">
                    Você vendeu por <strong>{fmtMoeda(Number(precoSaca))}</strong>, mas descontando a umidade e taxas, seu recebimento real é:
                  </p>
                  <p className="text-2xl font-black text-blue-700 mt-2">
                    {fmtMoeda(resultados.precoRealSaca)} <span className="text-xs font-normal text-blue-500">/ sc</span>
                  </p>
                </div>
              )}
            </div>

            {/* --- TABELA DE RESULTADOS (IMPRESSÃO - hidden print:block) --- */}
            <div className="hidden print:block">
              <TechnicalTable
                title="3. Resultados do Desconto"
                rows={[
                  { label: "Peso Líquido Calculado", value: fmtNum(resultados.pesoLiquidoTecnico), unit: "kg" },
                  { label: "Quebra de Peso (Água)", value: fmtNum(resultados.quebraKg), unit: "kg", isNegative: true },
                  { label: "Custo Secagem (Serviço)", value: fmtMoeda(resultados.custoSecagemTotal), isNegative: true },
                  { label: "PERDA FINANCEIRA TOTAL", value: fmtMoeda(resultados.perdaTotalFinanceira), isHeader: true },
                  { label: "Preço Líquido Real (Netback)", value: fmtMoeda(resultados.precoRealSaca), unit: "/ sc", isHeader: true },
                ]}
              />
            </div>

          </div>
        </div>

      </div>
    </CalculatorLayout>
  );
}
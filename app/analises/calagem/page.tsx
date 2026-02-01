"use client";

import { useState, useMemo } from "react";
import {
  FlaskConical,
  Layers,
  Lock,
  ArrowRight,
  Target,
  Percent,
  Mountain,
  CheckCircle2,
  Sprout,
  Info,
  ClipboardList,
  Tractor
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CalculatorLayout } from "@/app/components/CalculatorLayout";

// --- COMPONENTES VISUAIS ---

// 1. INPUTS (Visual Limpo e Padrão)
const InputGroup = ({ label, icon, value, onChange, placeholder = "0", subLabel }: any) => (
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

// 2. TABELA TÉCNICA (Mantida igual para impressão)
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
              <td className={`p-2 w-1/3 text-right font-bold ${row.isHeader ? 'text-white print:text-black' : 'black'}`}>
                {row.value} <span className="text-[10px] font-normal text-slate-500 ml-1 uppercase print:text-black">{row.unit}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function CalagemPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // ESTADOS GERAIS
  const [produtor, setProdutor] = useState("");
  const [talhao, setTalhao] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [registro, setRegistro] = useState("");

  // ESTADOS ESPECÍFICOS
  const [ctc, setCtc] = useState<number | string>("");
  const [vAtual, setVAtual] = useState<number | string>("");
  const [argila, setArgila] = useState<number | string>("");
  const [vDesejado, setVDesejado] = useState<number | string>(60);
  const [prnt, setPrnt] = useState<number | string>(80);
  const [fatorGesso, setFatorGesso] = useState<number | string>(50);

  // LÓGICA
  const resultados = useMemo(() => {
    const _ctc = Number(ctc) || 0;
    const _vAtual = Number(vAtual) || 0;
    const _vDesejado = Number(vDesejado) || 0;
    const _prnt = Number(prnt) || 1;
    const _argila = Number(argila) || 0;
    const _fator = Number(fatorGesso) || 50;

    let nc = 0;
    if (_vDesejado > _vAtual) {
      nc = ((_vDesejado - _vAtual) * _ctc) / _prnt;
    }

    const ngKg = _argila * _fator;
    const ngTon = ngKg / 1000;

    return {
      calagem: nc > 0 ? nc : 0,
      gessagem: ngTon > 0 ? ngTon : 0
    };
  }, [ctc, vAtual, vDesejado, prnt, argila, fatorGesso]);

  // TEXTO WHATSAPP
  const shareText = `🧪 *Relatório de Fertilidade:*\n\n✅ *Necessidade de Calagem:* ${resultados.calagem.toFixed(2)} ton/ha\n✅ *Necessidade de Gessagem:* ${resultados.gessagem.toFixed(2)} ton/ha`;

  return (
    <CalculatorLayout
      title="Calagem e Gessagem"
      subtitle="Cálculo técnico de correção de acidez e condicionamento."
      category="Fertilidade do Solo"
      icon={<FlaskConical size={16} />}
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

          {/* ==================================================================================
               SEÇÃO 1: DADOS DA ANÁLISE
           ================================================================================== */}

          {/* Visual Tela */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden no-print relative overflow-hidden">
            {/* Detalhe de fundo sutil */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[4rem] -z-0"></div>

            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center shadow-sm border border-emerald-200">
                <Layers size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">Análise de Solo</h3>
                <p className="text-xs text-slate-400 font-medium">Dados da camada 0-20cm</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 relative z-10">
              <InputGroup label="CTC pH 7.0" icon={<FlaskConical size={14} />} value={ctc} onChange={setCtc} />
              <InputGroup label="Saturação Atual" icon="%" value={vAtual} onChange={setVAtual} subLabel="(V%)" />
              <div className="col-span-2">
                <InputGroup label="Teor de Argila" icon={<Mountain size={14} />} value={argila} onChange={setArgila} subLabel="(%)" />
              </div>
            </div>
          </section>

          {/* Visual Impressão (Tabela 1) */}
          <div className="hidden print:block">
            <TechnicalTable
              title="1. Dados da Análise de Solo"
              rows={[
                { label: "CTC (pH 7.0)", value: Number(ctc).toFixed(1), unit: "cmolc/dm³" },
                { label: "Saturação por Bases Atual (V%)", value: Number(vAtual).toFixed(0), unit: "%" },
                { label: "Teor de Argila", value: Number(argila).toFixed(0), unit: "%" },
              ]}
            />
          </div>

          {/* ==================================================================================
               SEÇÃO 2: METAS DE CORREÇÃO
           ================================================================================== */}

          {/* Visual Tela */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden no-print">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center shadow-sm border border-blue-200">
                <Target size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800">Metas de Correção</h3>
                <p className="text-xs text-slate-400 font-medium">Parâmetros do cálculo</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <InputGroup label="Meta de V%" icon={<Target size={14} />} value={vDesejado} onChange={setVDesejado} />
              <InputGroup label="PRNT Calcário" icon={<CheckCircle2 size={14} />} value={prnt} onChange={setPrnt} />
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <label className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                <Sprout size={14} className="text-slate-400" /> Selecione a Cultura
              </label>

              {/* Botões de Seleção (Estilo Limpo) */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFatorGesso(50)}
                  className={`relative py-3 px-3 rounded-lg border text-left transition-all group ${fatorGesso == 50
                    ? 'bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500'
                    : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200'
                    }`}
                >
                  <span className={`block text-xs font-black uppercase tracking-wider mb-0.5 ${fatorGesso == 50 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    Anuais
                  </span>
                  <span className={`text-sm font-bold block ${fatorGesso == 50 ? 'text-slate-800' : 'text-slate-500'}`}>
                    Grãos
                  </span>
                  {fatorGesso == 50 && (
                    <div className="absolute top-2 right-2 text-emerald-500">
                      <CheckCircle2 size={14} />
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setFatorGesso(75)}
                  className={`relative py-3 px-3 rounded-lg border text-left transition-all group ${fatorGesso == 75
                    ? 'bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500'
                    : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200'
                    }`}
                >
                  <span className={`block text-xs font-black uppercase tracking-wider mb-0.5 ${fatorGesso == 75 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    Perenes
                  </span>
                  <span className={`text-sm font-bold block ${fatorGesso == 75 ? 'text-slate-800' : 'text-slate-500'}`}>
                    Café
                  </span>
                  {fatorGesso == 75 && (
                    <div className="absolute top-2 right-2 text-emerald-500">
                      <CheckCircle2 size={14} />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* Visual Impressão (Tabela 2) */}
          <div className="hidden print:block">
            <TechnicalTable
              title="2. Parâmetros Definidos"
              rows={[
                { label: "Saturação Alvo (V% Desejado)", value: Number(vDesejado).toFixed(0), unit: "%" },
                { label: "Qualidade do Calcário (PRNT)", value: Number(prnt).toFixed(0), unit: "%" },
                { label: "Fator Gesso (Cultura)", value: `x${fatorGesso}`, unit: "" },
              ]}
            />
          </div>
        </div>

        {/* --- COLUNA DIREITA: RESULTADOS --- */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-6 print:static space-y-6">

            {/* OVERLAY DE BLOQUEIO */}
            {!isAuthenticated && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200 shadow-lg h-full print:hidden">
                <div className="bg-slate-900 text-emerald-400 p-4 rounded-full mb-4 shadow-xl animate-pulse">
                  <Lock size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Resultados Bloqueados</h3>
                <button
                  onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 hover:scale-105"
                >
                  Desbloquear <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* CONTEÚDO TELA (Fica borrado se não logado) */}
            <div className={`space-y-6 transition-all duration-500 print:hidden no-print ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>

              {/* Card Calagem (Escuro) */}
              <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
                {/* Fundo sutil sem exageros */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500 rounded-full blur-[80px] opacity-20 -mr-10 -mt-10 pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] mb-1">
                        Recomendação Principal
                      </p>
                      <h4 className="font-bold text-lg text-white">Correção (Calagem)</h4>
                    </div>
                    <div className="bg-slate-800 p-2 rounded-lg text-emerald-400 border border-slate-700">
                      <Layers size={20} />
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-6xl font-black tracking-tighter text-white">{resultados.calagem.toFixed(1)}</span>
                    <span className="text-xl font-medium text-slate-400">ton/ha</span>
                  </div>

                  {/* Detalhes organizados */}
                  <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between border border-slate-700/50">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-700 p-2 rounded-lg">
                        <Target size={18} className="text-emerald-400" />
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block">Saturação Final</span>
                        <span className="text-sm font-bold text-slate-200">Meta Atingida</span>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-white tabular-nums">
                      {vDesejado} <span className="text-xs text-slate-500 font-normal">%</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Gessagem (Claro) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg shadow-slate-200/50">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600">
                      <FlaskConical size={16} />
                    </div>
                    <h4 className="font-bold text-slate-800">Gessagem (NG)</h4>
                  </div>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200">Condicionamento</span>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-5xl font-black tracking-tighter text-slate-900">{resultados.gessagem.toFixed(1)}</span>
                  <span className="text-lg font-bold text-slate-400">ton/ha</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Baseado em {argila}% de argila (fator {fatorGesso}x)
                </p>
              </div>

              {/* Nota Técnica */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex gap-3 items-start">
                <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  <strong>Nota:</strong> Cálculo de calagem pelo método de Saturação por Bases (IAC). Gessagem baseada em teor de argila (Demattê).
                </p>
              </div>
            </div>

            {/* VISUAL IMPRESSÃO (Tabelas de Resultado) */}
            <div className="hidden print:block space-y-4">
              <TechnicalTable
                title="3. Recomendação Técnica Final"
                rows={[
                  { label: "Necessidade de Calagem (NC)", value: resultados.calagem.toFixed(2), unit: "ton/ha", isHeader: true },
                  { label: "Necessidade de Gessagem (NG)", value: resultados.gessagem.toFixed(2), unit: "ton/ha", isHeader: true },
                ]}
              />

              <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 text-[10px] text-slate-600 text-justify leading-snug">
                <strong>Nota Técnica:</strong> Os cálculos acima utilizam o método de Elevação da Saturação por Bases (IAC) para calagem e a correlação com teor de argila para gessagem. Consulte sempre um Engenheiro Agrônomo para ajustes locais.
              </div>
            </div>

          </div>
        </div>

      </div>
    </CalculatorLayout>
  );
}
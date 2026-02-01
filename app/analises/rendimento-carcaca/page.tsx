"use client";

import { useState, useMemo } from "react";
import {
  Beef,
  Scale,
  Truck,
  ArrowRight,
  Lock,
  Coins,
  TrendingUp,
  AlertCircle,
  ClipboardList,
  Info
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CalculatorLayout } from "@/app/components/CalculatorLayout";

// --- COMPONENTES AUXILIARES ---

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

const InputGroup = ({ label, icon, value, onChange, placeholder = "0", step = "0.1", suffix }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors">
        {icon}
      </div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onWheel={(e) => e.currentTarget.blur()}
        placeholder={placeholder}
        step={step}
        className="w-full pl-10 pr-12 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-slate-900 font-medium placeholder:text-slate-300"
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

export default function RendimentoCarcacaPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const searchParams = useSearchParams();
  const reportId = searchParams.get('id');
  const router = useRouter();

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

  const [pesoVivo, setPesoVivo] = useState<number | string>("");
  const [pesoCarcaca, setPesoCarcaca] = useState<number | string>("");
  const [precoArroba, setPrecoArroba] = useState<number | string>("");

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
          setPesoVivo(i.pesoVivo || "");
          setPesoCarcaca(i.pesoCarcaca || "");
          setPrecoArroba(i.precoArroba || "");
        }
      }).catch(console.error);
    }
  }, [reportId, user]);

  const fmtMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(v);

  const resultados = useMemo(() => {
    const pVivo = Number(pesoVivo) || 0;
    const pCarcaca = Number(pesoCarcaca) || 0;
    const vArroba = Number(precoArroba) || 0;

    if (pVivo === 0 || pCarcaca === 0) return { rc: 0, arrobas: 0, receita: 0, status: 'neutral', diff1pct: 0, rows: [] };

    const rc = (pCarcaca / pVivo) * 100;
    const arrobas = pCarcaca / 15;
    const receita = arrobas * vArroba;

    let status = 'media';
    if (rc < 52) status = 'baixo';
    if (rc >= 55) status = 'alto';

    const diff1pct = ((pVivo * ((rc + 1) / 100)) / 15 * vArroba) - receita;

    return {
      rc, arrobas, receita, status, diff1pct,
      rows: [
        { "Item": "Peso Vivo Médio", "Valor": `${pVivo} kg` },
        { "Item": "Peso Carcaça Quente", "Valor": `${pCarcaca} kg` },
        { "Item": "Rendimento (RC)", "Valor": `${fmtNum(rc)}%` },
        { "Item": "Arrobas Faturadas", "Valor": `${fmtNum(arrobas)} @` },
        { "Item": "Preço da @", "Valor": fmtMoeda(vArroba) }
      ]
    };
  }, [pesoVivo, pesoCarcaca, precoArroba]);

  const handleSave = async () => {
    if (!user) return;

    try {
      if (produtor) await saveClient(user.uid, produtor, talhao);

      const reportData = {
        inputs: {
          produtor, talhao, responsavel, registro,
          pesoVivo, pesoCarcaca, precoArroba
        },
        results: {
          rc: resultados.rc,
          arrobas: resultados.arrobas,
          receita: resultados.receita,
          diff1pct: resultados.diff1pct
        }
      };

      if (reportId) {
        await updateReport(reportId, {
          title: `Rendimento - ${produtor || 'Sem Cliente'}`,
          data: reportData,
          clientName: produtor
        });
      } else {
        const newId = await saveReport(
          user.uid,
          'rendimento-carcaca',
          `Rendimento - ${produtor || 'Sem Cliente'}`,
          reportData,
          produtor
        );
        router.replace(`/analises/rendimento-carcaca?id=${newId}`);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar relatório.");
    }
  };

  const shareText = `🥩 *Rendimento de Carcaça*\n\n📊 *RC:* ${fmtNum(resultados.rc)}%\n⚖️ *Arrobas:* ${fmtNum(resultados.arrobas)} @\n💰 *Total:* ${fmtMoeda(resultados.receita)}`;

  return (
    <CalculatorLayout
      title="Rendimento de Carcaça"
      subtitle="Auditoria de abate e análise de eficiência industrial."
      category="Comercial"
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
      onSave={handleSave}
      saved={saved}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">

        <div className="lg:col-span-7 space-y-6">
          <div className="print:hidden space-y-6">
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg"><Scale size={20} /></div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">1. Pesagem</h3>
                  <p className="text-xs text-slate-400">Peso de balança vs. peso de gancho</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputGroup label="Peso Vivo" icon={<Truck size={16} />} value={pesoVivo} onChange={setPesoVivo} placeholder="Ex: 540" suffix="kg" />
                <InputGroup label="Peso Carcaça" icon={<Beef size={16} />} value={pesoCarcaca} onChange={setPesoCarcaca} placeholder="Ex: 290" suffix="kg" />
              </div>
              <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100 flex gap-2 text-xs text-amber-800">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <p>Para maior precisão, utilize o <strong>Peso de Embarque</strong> com jejum de sólidos.</p>
              </div>
            </section>



            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Coins size={20} /></div>
                <h3 className="font-bold text-lg text-slate-800">2. Comercial</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputGroup label="Preço da Arroba" icon={<Coins size={16} />} value={precoArroba} onChange={setPrecoArroba} placeholder="Ex: 280" suffix="R$" />
              </div>
            </section>
          </div>

          <div className="hidden print:block">
            <TechnicalTable title="Relatório de Rendimento e Abate" rows={resultados.rows} />
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="sticky top-10 print:static">
            {!isAuthenticated && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg h-full print:hidden">
                <div className="bg-slate-900 text-red-400 p-4 rounded-full mb-4 shadow-xl">
                  <Lock size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Análise Bloqueada</h3>
                <button onClick={() => (document.getElementById("modal_auth") as any)?.showModal()} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center gap-2">
                  Ver Resultados <ArrowRight size={16} />
                </button>
              </div>
            )}

            <div className={`space-y-6 transition-all duration-500 print:hidden ${!isAuthenticated ? 'opacity-40 filter blur-sm select-none pointer-events-none' : ''}`}>
              <div className="bg-slate-900 text-white rounded-xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl"></div>
                <div className="relative z-10 text-center">
                  <p className="text-red-400 font-bold uppercase tracking-wider text-[10px] mb-2">Rendimento Real</p>
                  <div className="mb-4">
                    <span className={`text-6xl font-black tracking-tighter ${resultados.status === 'alto' ? 'text-emerald-400' : resultados.status === 'baixo' ? 'text-red-400' : 'text-white'}`}>
                      {fmtNum(resultados.rc)}%
                    </span>
                  </div>
                  <div className="inline-flex gap-1.5 p-1 bg-white/5 rounded-full border border-white/10">
                    <span className={`text-[9px] px-2 py-1 rounded-full font-bold ${resultados.status === 'baixo' ? 'bg-red-500 text-white' : 'text-slate-500'}`}>BAIXO</span>
                    <span className={`text-[9px] px-2 py-1 rounded-full font-bold ${resultados.status === 'media' ? 'bg-blue-500 text-white' : 'text-slate-500'}`}>MÉDIO</span>
                    <span className={`text-[9px] px-2 py-1 rounded-full font-bold ${resultados.status === 'alto' ? 'bg-emerald-500 text-white' : 'text-slate-500'}`}>ALTO</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Receita Líquida Estimada</p>
                    <p className="text-3xl font-black text-slate-900">{fmtMoeda(resultados.receita)}</p>
                  </div>
                  <div className="bg-green-100 p-2 rounded-lg text-green-700"><Coins size={20} /></div>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between text-xs font-medium text-slate-500">
                  <span>Total de Arrobas:</span>
                  <span className="text-slate-900">{fmtNum(resultados.arrobas)} @</span>
                </div>
              </div>

              {resultados.receita > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 group transition-all">
                  <div className="flex gap-3">
                    <TrendingUp className="text-blue-600 shrink-0" size={20} />
                    <div>
                      <p className="text-xs font-bold text-blue-900 uppercase tracking-tight">Potencial Genético (+1%)</p>
                      <p className="text-[11px] text-blue-800 mt-1 leading-snug">
                        Melhorar 1% no rendimento adicionaria <span className="font-bold">{fmtMoeda(resultados.diff1pct)}</span> à sua receita por cabeça.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex gap-3">
                <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-500 leading-normal">
                  O rendimento médio de machos castrados é de 52-54%. Animais inteiros ou precoces tendem a atingir 55-56% se bem terminados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CalculatorLayout>
  );
}
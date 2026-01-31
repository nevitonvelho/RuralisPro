"use client";

import { useState, useMemo } from "react";
import { 
  BadgeDollarSign, 
  Tractor, 
  Sprout, 
  Droplets, 
  Lock, 
  PieChart, 
  FlaskConical,
  HelpCircle,
  TrendingUp,
  ArrowRight
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { CalculatorLayout } from "@/app/components/CalculatorLayout"; 

// Componente de Input Padronizado (Visual Profissional)
const InputGroup = ({ label, icon, value, onChange, placeholder = "0.00" }: any) => (
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
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900 font-medium placeholder:text-slate-300"
      />
    </div>
  </div>
);

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function CustoHectarePage() {
  const { user, loading } = useAuth();
  const isAuthenticated = !!user;

  // Estados que vão para o Layout
  const [produtor, setProdutor] = useState("");
  const [talhao, setTalhao] = useState("");

  // Estados da Lógica
  const [sementes, setSementes] = useState<number | string>("");
  const [fertilizantes, setFertilizantes] = useState<number | string>("");
  const [defensivos, setDefensivos] = useState<number | string>("");
  const [mecanizacao, setMecanizacao] = useState<number | string>("");

  // Cálculos
  const resultados = useMemo(() => {
    const s = Number(sementes) || 0;
    const f = Number(fertilizantes) || 0;
    const d = Number(defensivos) || 0;
    const m = Number(mecanizacao) || 0;
    
    const insumos = s + f + d;
    const total = insumos + m;
    
    return {
      insumos,
      mecanizacao: m,
      total,
      pctInsumos: total > 0 ? (insumos / total) * 100 : 0,
      pctMecanizacao: total > 0 ? (m / total) * 100 : 0
    };
  }, [sementes, fertilizantes, defensivos, mecanizacao]);

  // Texto Específico para o WhatsApp
  const shareText = `💰 *Estimativa de Custos de Implantação*
  
🧪 *Insumos:* ${formatCurrency(resultados.insumos)}/ha
🚜 *Operacional:* ${formatCurrency(resultados.mecanizacao)}/ha
────────────────
💵 *CUSTO TOTAL:* ${formatCurrency(resultados.total)}/ha`;

  if (loading) return <div className="p-10 text-center text-slate-500">Carregando ferramenta...</div>;

  return (
    <CalculatorLayout
      title="Custo de Implantação"
      subtitle="Simulação detalhada de investimento por hectare (R$/ha)."
      category="Gestão Financeira"
      icon={<BadgeDollarSign size={16} />}
      produtor={produtor}
      setProdutor={setProdutor}
      talhao={talhao}
      setTalhao={setTalhao}
      shareText={shareText}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* --- COLUNA ESQUERDA (INPUTS) --- */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card Insumos */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-black">
             <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 print:border-slate-300">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg print:hidden"><FlaskConical size={20} /></div>
                <div>
                   <h3 className="font-bold text-lg text-slate-800">Insumos Agrícolas</h3>
                   <p className="text-xs text-slate-400 print:hidden">Custos diretos com produtos</p>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputGroup label="Sementes (R$)" icon={<Sprout size={16}/>} value={sementes} onChange={setSementes} />
                <InputGroup label="Fertilizantes (R$)" icon={<Droplets size={16}/>} value={fertilizantes} onChange={setFertilizantes} />
                <InputGroup label="Defensivos (R$)" icon={<Lock size={16}/>} value={defensivos} onChange={setDefensivos} />
             </div>
          </section>

          {/* Card Operacional */}
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-black">
             <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 print:border-slate-300">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg print:hidden"><Tractor size={20} /></div>
                <div>
                   <h3 className="font-bold text-lg text-slate-800">Operacional</h3>
                   <p className="text-xs text-slate-400 print:hidden">Máquinas, combustível e serviços</p>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Mecanização Total (R$)" icon={<Tractor size={16}/>} value={mecanizacao} onChange={setMecanizacao} />
             </div>
          </section>

           {/* Dica (Oculta na impressão) */}
           <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex gap-4 items-start no-print">
               <HelpCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
               <div>
                  <h4 className="font-bold text-amber-800 text-sm">Dica Ruralis</h4>
                  <p className="text-amber-700/80 text-xs mt-1">
                    Se você utiliza tratamento de sementes industrial (TSI), lembre-se de incluir esse valor no campo "Sementes" ou separá-lo em "Defensivos".
                  </p>
               </div>
            </div>
        </div>

        {/* --- COLUNA DIREITA (RESULTADOS) --- */}
        <div className="lg:col-span-4 relative">
           
           <div className="sticky top-10 print:static">
              
              {/* --- OVERLAY DE BLOQUEIO (Se não logado) --- */}
              {!isAuthenticated && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg h-full transition-all">
                   <div className="bg-slate-900 text-emerald-400 p-4 rounded-full mb-4 shadow-xl animate-pulse">
                      <Lock size={32} />
                   </div>
                   <h3 className="text-xl font-black text-slate-900 mb-2">Análise Bloqueada</h3>
                   <p className="text-slate-500 text-sm mb-6 max-w-[250px]">
                     Faça login para visualizar a viabilidade financeira e gerar relatórios.
                   </p>
                   <button 
                     onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                     className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 hover:scale-105"
                   >
                     Entrar Agora <ArrowRight size={16}/>
                   </button>
                </div>
              )}

              {/* --- CARD PRINCIPAL --- */}
              {/* A classe 'opacity-40 blur-sm' é aplicada se não estiver logado */}
              <div className={`print-card bg-slate-900 rounded-xl p-6 text-white shadow-xl overflow-hidden min-h-[420px] flex flex-col justify-between transition-all duration-500 ${!isAuthenticated ? 'opacity-40 filter blur-sm select-none pointer-events-none' : ''}`}>
                 
                  {/* Conteúdo do Card */}
                  <div className="relative z-10">
                     <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-xl flex items-center gap-2 print-text-black">
                           <PieChart size={20} className="text-emerald-400 print-text-black" /> Resumo
                        </h3>
                     </div>

                     <div>
                        <p className="text-slate-400 text-xs mb-1 uppercase tracking-wider font-bold print-text-black">Custo Total Estimado</p>
                        <div className="text-4xl font-black tracking-tight text-white print-text-black">
                           {formatCurrency(resultados.total)}
                           <span className="text-lg text-slate-500 font-medium ml-1">/ha</span>
                        </div>
                     </div>

                     {/* Barra Visual */}
                     <div className="space-y-2 mt-8">
                        <div className="flex h-3 w-full bg-slate-800 rounded-full overflow-hidden print-border-black border border-transparent">
                           <div style={{ width: `${resultados.pctInsumos}%` }} className="bg-emerald-500 print-bg-black transition-all duration-1000"></div>
                           <div style={{ width: `${resultados.pctMecanizacao}%` }} className="bg-blue-500 print-bg-black opacity-80 transition-all duration-1000"></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider print-text-black mt-1">
                           <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 print:bg-black"></div>
                              Insumos ({resultados.pctInsumos.toFixed(0)}%)
                           </div>
                           <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-blue-500 print:bg-black"></div>
                              Operacional ({resultados.pctMecanizacao.toFixed(0)}%)
                           </div>
                        </div>
                     </div>

                     <div className="space-y-3 pt-6 mt-6 border-t border-slate-800 print-border-black">
                        <div className="flex justify-between items-center text-sm print-text-black">
                           <span className="text-slate-300 print-text-black">Total Insumos</span>
                           <span className="font-bold font-mono">{formatCurrency(resultados.insumos)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm print-text-black">
                           <span className="text-slate-300 print-text-black">Total Mecanização</span>
                           <span className="font-bold font-mono">{formatCurrency(resultados.mecanizacao)}</span>
                        </div>
                     </div>
                  </div>

                  {/* Footer do Card */}
                  <div className="mt-8 bg-slate-800/50 p-4 rounded-lg flex items-start gap-3 relative z-10 no-print border border-slate-700/50">
                     <TrendingUp className="text-emerald-400 shrink-0" size={18} />
                     <div>
                        <p className="text-xs font-bold text-white">Análise de Viabilidade</p>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                           Verifique a cotação atual da saca. Se o custo ultrapassar 40% da receita esperada, revise o pacote tecnológico.
                        </p>
                     </div>
                  </div>
              </div>

           </div>
        </div>

      </div>
    </CalculatorLayout>
  );
}
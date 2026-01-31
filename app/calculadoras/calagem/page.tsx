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
  CheckCircle,
  Sprout,
  Info
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CalculatorLayout } from "@/app/components/CalculatorLayout";

// Componente de Input Padronizado (Mesmo do Custo)
const InputGroup = ({ label, icon, value, onChange, placeholder = "0" }: any) => (
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

export default function CalagemPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // ESTADOS GERAIS
  const [produtor, setProdutor] = useState("");
  const [talhao, setTalhao] = useState("");

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
      subtitle="Cálculo técnico de correção de acidez e condicionamento de subsuperfície."
      category="Fertilidade do Solo"
      icon={<FlaskConical size={16} />}
      produtor={produtor}
      setProdutor={setProdutor}
      talhao={talhao}
      setTalhao={setTalhao}
      shareText={shareText}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- COLUNA ESQUERDA: INPUTS --- */}
        <div className="lg:col-span-7 space-y-6">
           
           {/* Seção 1: Análise */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-black">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg print:hidden"><Layers size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">1. Dados da Análise</h3>
                    <p className="text-xs text-slate-400 print:hidden">Informações da camada 0-20cm</p>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                 <InputGroup label="CTC pH 7.0" icon={<FlaskConical size={16}/>} value={ctc} onChange={setCtc} placeholder="Ex: 12.5" />
                 <InputGroup label="Saturação Atual (V%)" icon={<Percent size={16}/>} value={vAtual} onChange={setVAtual} placeholder="Ex: 45" />
                 <div className="col-span-2">
                   <InputGroup label="Teor de Argila (%)" icon={<Mountain size={16}/>} value={argila} onChange={setArgila} placeholder="Ex: 35" />
                 </div>
              </div>
           </section>

           {/* Seção 2: Metas */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-black">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-blue-100 text-blue-700 rounded-lg print:hidden"><Target size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">2. Metas de Correção</h3>
                    <p className="text-xs text-slate-400 print:hidden">Definição dos objetivos</p>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                 <InputGroup label="Meta V% Desejada" icon={<Target size={16}/>} value={vDesejado} onChange={setVDesejado} />
                 <InputGroup label="PRNT do Calcário" icon={<CheckCircle size={16}/>} value={prnt} onChange={setPrnt} />
              </div>
              
              <div className="mt-8 no-print">
                  <label className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1">
                     <Sprout size={14}/> Cultura (Define Fator Gesso)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setFatorGesso(50)} 
                        className={`py-3 px-4 rounded-lg border text-sm font-bold transition-all flex flex-col items-center justify-center gap-1 ${fatorGesso == 50 ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                      >
                        <span>Grãos / Anuais</span>
                        <span className="text-[10px] font-normal opacity-70">Fator x50</span>
                      </button>

                      <button 
                        onClick={() => setFatorGesso(75)} 
                        className={`py-3 px-4 rounded-lg border text-sm font-bold transition-all flex flex-col items-center justify-center gap-1 ${fatorGesso == 75 ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                      >
                        <span>Café / Perenes</span>
                        <span className="text-[10px] font-normal opacity-70">Fator x75</span>
                      </button>
                  </div>
              </div>
           </section>
        </div>

        {/* --- COLUNA DIREITA: RESULTADOS --- */}
        <div className="lg:col-span-5 relative">
           
           {/* STICKY WRAPPER */}
           <div className="sticky top-10 print:static">

             {/* OVERLAY DE BLOQUEIO */}
             {!isAuthenticated && (
               <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg h-full">
                  <div className="bg-slate-900 text-emerald-400 p-4 rounded-full mb-4 shadow-xl animate-pulse">
                     <Lock size={32} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">Resultados Bloqueados</h3>
                  <p className="text-slate-500 text-sm mb-6 max-w-[250px]">
                    Faça login para acessar a recomendação técnica completa.
                  </p>
                  <button 
                    onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 hover:scale-105"
                  >
                    Entrar Agora <ArrowRight size={16}/>
                  </button>
               </div>
             )}

             {/* CONTEÚDO (Fica borrado se não logado) */}
             <div className={`space-y-6 transition-all duration-500 ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>
               
               {/* Card Calagem */}
               <div className="print-card bg-slate-900 text-white rounded-xl p-8 shadow-xl print:shadow-none">
                  <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-700 print:border-black">
                    <p className="text-emerald-400 font-bold uppercase tracking-wider text-xs print:text-black">
                      Correção de Acidez (NC)
                    </p>
                    <Layers size={18} className="text-emerald-400 print:text-black opacity-80" />
                  </div>
                  
                  <div className="flex items-baseline gap-2">
                     <span className="text-6xl font-black tracking-tighter print:text-black">{resultados.calagem.toFixed(2)}</span>
                     <span className="text-xl font-medium text-slate-400 print:text-black">t/ha</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-2 print:text-black font-medium">Calcário (PRNT {prnt}%)</p>
                  
                  {/* Mini tabela de detalhes */}
                  <div className="mt-6 pt-4 border-t border-slate-800 print:border-slate-300 grid grid-cols-2 gap-4 text-xs opacity-70 print:opacity-100">
                     <div>
                        <span className="block mb-1">Saturação Atual</span>
                        <strong className="text-white print:text-black text-base">{vAtual || 0}%</strong>
                     </div>
                     <div className="text-right">
                        <span className="block mb-1">Meta Desejada</span>
                        <strong className="text-emerald-400 print:text-black text-base">{vDesejado}%</strong>
                     </div>
                  </div>
               </div>
               
               {/* Card Gessagem */}
               <div className="print-card bg-white border border-slate-200 rounded-xl p-8 shadow-lg print:shadow-none">
                  <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-100 print:border-black">
                    <p className="text-blue-600 font-bold uppercase tracking-wider text-xs print:text-black">
                      Condicionamento (NG)
                    </p>
                    <FlaskConical size={18} className="text-blue-600 print:text-black opacity-80" />
                  </div>

                  <div className="flex items-baseline gap-2">
                     <span className="text-6xl font-black tracking-tighter text-slate-900">{resultados.gessagem.toFixed(2)}</span>
                     <span className="text-xl font-medium text-slate-400 print:text-black">t/ha</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2 print:text-black font-medium">Gesso Agrícola</p>
               </div>

               {/* Nota Técnica */}
               <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex gap-3 items-start no-print">
                 <Info size={18} className="text-slate-400 shrink-0 mt-0.5" />
                 <p className="text-[11px] text-slate-500 leading-relaxed">
                   <strong>Nota Técnica:</strong> Cálculo de calagem pelo método de Saturação por Bases (IAC) e gessagem baseada no teor de argila (Demattê, 1986 ou similar).
                 </p>
               </div>

             </div>
           </div>
        </div>

      </div>
    </CalculatorLayout>
  );
}
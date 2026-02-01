"use client";

import { useState, useMemo } from "react";
import { 
  CircleDashed, // Representando Pneu/Roda
  Settings2, 
  ArrowRight, 
  Lock, 
  AlertTriangle,
  Fuel,
  TrendingDown,
  Info,
  ClipboardList
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CalculatorLayout } from "@/app/components/CalculatorLayout";

// --- COMPONENTES AUXILIARES ---

// 1. Tabela para Impressão
const TechnicalTable = ({ title, rows }: { title: string; rows: any[] }) => {
  if (!rows || rows.length === 0) return null;

  return (
    <div className="mt-4 mb-6 border border-black rounded-lg overflow-hidden avoid-break shadow-none break-inside-avoid">
      <div className="bg-slate-200 border-b border-black p-2 flex justify-between items-center print:bg-slate-200">
        <h3 className="font-bold text-xs uppercase text-black tracking-wider flex items-center gap-2">
           <ClipboardList size={14}/> {title}
        </h3>
      </div>
      <table className="w-full text-sm text-left">
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-slate-300 last:border-0 bg-white">
              {Object.values(row).map((val: any, i) => (
                  <td key={i} className={`p-2 text-black ${i === 0 ? 'font-bold w-1/2' : 'font-medium text-right'}`}>{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// 2. Input Padronizado
const InputGroup = ({ label, icon, value, onChange, placeholder = "0", step="0.1", suffix }: any) => (
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

export default function PatinagemPneusPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // ESTADOS
  const [produtor, setProdutor] = useState("");
  const [talhao, setTalhao] = useState(""); // Máquina

  // INPUTS - TESTE DE CAMPO (Método das Voltas)
  const [voltasCarga, setVoltasCarga] = useState<number | string>(""); 
  const [voltasVazio, setVoltasVazio] = useState<number | string>(""); 
  
  // INPUTS - FINANCEIRO (Para estimar perda)
  const [consumoHora, setConsumoHora] = useState<number | string>(""); // L/h
  const [precoDiesel, setPrecoDiesel] = useState<number | string>(""); // R$/L

  // FORMATAÇÃO
  const fmtMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(v);

  // CÁLCULOS
  const resultados = useMemo(() => {
    const vCarga = Number(voltasCarga) || 0;
    const vVazio = Number(voltasVazio) || 0;
    const l_h = Number(consumoHora) || 0;
    const p_diesel = Number(precoDiesel) || 0;

    if (vCarga === 0) return { 
        patinagem: 0, 
        status: 'neutral', 
        desperdicioL: 0, 
        desperdicioR: 0,
        rowsResumo: []
    };

    // 1. Cálculo de Patinagem (%)
    // Fórmula: ((VoltasCarga - VoltasVazio) / VoltasCarga) * 100
    const patinagemCalc = ((vCarga - vVazio) / vCarga) * 100;
    const patinagem = patinagemCalc < 0 ? 0 : patinagemCalc;

    // 2. Classificação (Benchmark para 4x4 / TDA)
    let status = 'ideal'; // 8 a 12%
    let labelStatus = 'Ideal';
    
    if (patinagem < 6) {
        status = 'muito_pesado';
        labelStatus = 'Muito Pesado (Lastro Excessivo)';
    }
    if (patinagem > 15) {
        status = 'muito_leve';
        labelStatus = 'Excessiva (Falta Lastro)';
    }

    // 3. Estimativa de Desperdício (Se acima do ideal)
    let desperdicioL = 0;
    let desperdicioR = 0;

    if (patinagem > 12) {
        const excesso = (patinagem - 12) / 100;
        desperdicioL = l_h * excesso;
        desperdicioR = desperdicioL * p_diesel;
    }

    return {
        patinagem,
        status,
        desperdicioL,
        desperdicioR,
        // DADOS PARA TABELA DE IMPRESSÃO
        rowsResumo: [
            { "Item": "Voltas com Carga", "Valor": `${vCarga}` },
            { "Item": "Voltas Vazio", "Valor": `${vVazio}` },
            { "Item": "ÍNDICE DE PATINAGEM", "Valor": `${fmtNum(patinagem)}%` },
            { "Item": "Diagnóstico", "Valor": labelStatus },
            { "Item": "Consumo Hora", "Valor": `${l_h} L/h` },
            { "Item": "Perda Est. (Litros)", "Valor": `${fmtNum(desperdicioL)} L/h` },
            { "Item": "Perda Est. (R$)", "Valor": `${fmtMoeda(desperdicioR)}/h` },
        ]
    };
  }, [voltasCarga, voltasVazio, consumoHora, precoDiesel]);

  const shareText = `🚜 *Diagnóstico de Tração*\n\n🔄 *Patinagem:* ${fmtNum(resultados.patinagem)}%\n📊 *Status:* ${resultados.status === 'ideal' ? '✅ Ideal' : resultados.status === 'muito_pesado' ? '⚠️ Muito Pesado' : '🛑 Patinando'}\n\n${resultados.desperdicioR > 0 ? `💸 *Perda Estimada:* ${fmtMoeda(resultados.desperdicioR)}/hora` : ''}`;

  return (
    <CalculatorLayout
      title="Patinagem de Pneus"
      subtitle="Ajuste fino de lastragem para máxima tração e economia."
      category="Maquinário"
      icon={<CircleDashed size={16} />}
      produtor={produtor}
      setProdutor={setProdutor}
      talhao={talhao}
      setTalhao={setTalhao}
      shareText={shareText}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
        
        {/* --- INPUTS --- */}
        <div className="lg:col-span-7 space-y-6">
           
           <div className="print:hidden">
               {/* Seção 1: Método das Voltas */}
               <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                     <div className="p-2 bg-slate-100 text-slate-700 rounded-lg"><Settings2 size={20} /></div>
                     <div>
                        <h3 className="font-bold text-lg text-slate-800">1. Teste de Campo</h3>
                        <p className="text-xs text-slate-400">Marque uma distância fixa (Ex: 50m) e conte as voltas </p>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <InputGroup 
                        label="Voltas TRABALHANDO" 
                        icon={<CircleDashed size={16}/>} 
                        value={voltasCarga} 
                        onChange={setVoltasCarga} 
                        placeholder="Ex: 11.5" 
                        suffix="voltas" 
                     />
                     <InputGroup 
                        label="Voltas VAZIO (Levantado)" 
                        icon={<CircleDashed size={16}/>} 
                        value={voltasVazio} 
                        onChange={setVoltasVazio} 
                        placeholder="Ex: 10" 
                        suffix="voltas" 
                     />
                  </div>
                  <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100 flex gap-2 items-start text-xs text-indigo-800">
                      <Info size={14} className="mt-0.5 shrink-0"/>
                      <p>
                        <strong>Como medir:</strong> Conte quantas voltas o pneu dá para percorrer 50m ou 100m no asfalto/terra dura (Vazio). Depois, conte quantas voltas ele dá para percorrer os mesmos metros operando com o implemento enterrado (Carga).
                      </p>
                  </div>
               </section>

               {/* Seção 2: Custo do Desperdício (Opcional) */}
               <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                     <div className="p-2 bg-rose-100 text-rose-700 rounded-lg"><Fuel size={20} /></div>
                     <div>
                        <h3 className="font-bold text-lg text-slate-800">2. Custo da Perda (Opcional)</h3>
                        <p className="text-xs text-slate-400">Quanto custa "lixar" pneu?</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <InputGroup label="Consumo (L/h)" icon={<Fuel size={16}/>} value={consumoHora} onChange={setConsumoHora} placeholder="Ex: 25" suffix="L/h" />
                     <InputGroup label="Preço Diesel (R$)" icon={<TrendingDown size={16}/>} value={precoDiesel} onChange={setPrecoDiesel} placeholder="Ex: 6.00" suffix="R$" />
                  </div>
               </section>
           </div>

           {/* TABELA VISIVEL APENAS NA IMPRESSAO */}
           <div className="hidden print:block">
               <TechnicalTable title="Relatório de Eficiência de Tração" rows={resultados.rowsResumo} />
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
                      <h3 className="text-xl font-black text-slate-900 mb-2">Diagnóstico Bloqueado</h3>
                      <button 
                        onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 hover:scale-105"
                      >
                        Ver Resultado <ArrowRight size={16}/>
                      </button>
                    </div>
                 )}

                 <div className={`space-y-6 transition-all duration-500 print:hidden ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>
                    
                    {/* Card Principal: GAUGE DE PATINAGEM */}
                    <div className="print-card bg-slate-900 text-white rounded-xl p-8 shadow-xl relative overflow-hidden text-center">
                        {/* Background Effect */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-emerald-500 to-red-500 opacity-50"></div>

                        <div className="relative z-10">
                            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-4">
                                Índice de Patinagem
                            </p>

                            <div className="mb-6 relative inline-block">
                                <span className={`text-6xl font-black tracking-tighter ${resultados.status === 'ideal' ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {fmtNum(resultados.patinagem)}<span className="text-3xl">%</span>
                                </span>
                            </div>

                            {/* Status Badge */}
                            <div className="flex justify-center">
                                {resultados.status === 'muito_pesado' && (
                                    <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-lg flex items-center gap-2">
                                        <TrendingDown size={18}/>
                                        <div className="text-left">
                                            <span className="block text-xs font-bold uppercase">Muito Pesado (&lt;6%)</span>
                                            <span className="text-[10px] opacity-70">Risco de compactação e quebra</span>
                                        </div>
                                    </div>
                                )}
                                {resultados.status === 'ideal' && (
                                    <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-200 px-4 py-2 rounded-lg flex items-center gap-2">
                                        <CircleDashed size={18}/>
                                        <div className="text-left">
                                            <span className="block text-xs font-bold uppercase">Excelente (8% - 12%)</span>
                                            <span className="text-[10px] opacity-70">Máxima eficiência de tração</span>
                                        </div>
                                    </div>
                                )}
                                {resultados.status === 'muito_leve' && (
                                    <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-lg flex items-center gap-2">
                                        <AlertTriangle size={18}/>
                                        <div className="text-left">
                                            <span className="block text-xs font-bold uppercase">Excessiva (&gt;15%)</span>
                                            <span className="text-[10px] opacity-70">Adicione lastro (pesos/água)</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Card Secundário: CUSTO DE OPORTUNIDADE */}
                    {resultados.status === 'muito_leve' && resultados.desperdicioR > 0 && (
                        <div className="print-card bg-rose-50 border border-rose-200 rounded-xl p-6 shadow-lg animate-in fade-in slide-in-from-bottom-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-rose-100 text-rose-600 rounded-full">
                                    <AlertTriangle size={20}/>
                                </div>
                                <h4 className="font-bold text-rose-900 text-sm">Desperdício Oculto</h4>
                            </div>
                            
                            <p className="text-xs text-rose-800 mb-4 leading-relaxed">
                                Você está gastando combustível para girar o pneu sem sair do lugar na velocidade ideal.
                            </p>

                            <div className="grid grid-cols-2 gap-4 border-t border-rose-200 pt-4">
                                <div>
                                    <span className="block text-xl font-black text-rose-700">{fmtNum(resultados.desperdicioL)} L</span>
                                    <span className="text-[10px] text-rose-500 font-bold uppercase">Perda / Hora</span>
                                </div>
                                <div>
                                    <span className="block text-xl font-black text-rose-700">{fmtMoeda(resultados.desperdicioR)}</span>
                                    <span className="text-[10px] text-rose-500 font-bold uppercase">Dinheiro Jogado Fora</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dica Técnica */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-500">
                        <p className="font-bold mb-1 uppercase text-slate-700">Ação Recomendada:</p>
                        {resultados.status === 'muito_pesado' 
                           ? "Retire pesos das rodas ou diminua a água dos pneus. O trator precisa 'escorregar' um pouco para não forçar a transmissão."
                           : resultados.status === 'muito_leve'
                           ? "Adicione lastro (pesos frontais/traseiros ou água). Verifique também a calibragem dos pneus (baixa pressão aumenta a área de contato)."
                           : "Mantenha a configuração atual. Monitore novamente se mudar o tipo de solo ou implemento."
                        }
                    </div>

                 </div>
            </div>
        </div>

      </div>
    </CalculatorLayout>
  );
}
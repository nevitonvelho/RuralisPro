"use client";

import { useState, useMemo } from "react";
import { 
  Database, // Representando Silo
  ArrowRight, 
  Lock, 
  Coins,
  Scale,
  Ruler,
  Wheat,
  LayoutDashboard
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CalculatorLayout } from "@/app/components/CalculatorLayout";

// Input Padronizado
const InputGroup = ({ label, icon, value, onChange, placeholder = "0", step="0.1", suffix }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-zinc-600 transition-colors">
        {icon}
      </div>
      <input 
        type="number" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder}
        step={step}
        className="w-full pl-10 pr-12 py-2.5 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 transition-all text-slate-900 font-medium placeholder:text-slate-300"
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
            {suffix}
        </div>
      )}
    </div>
  </div>
);

export default function DimensionamentoSiloPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // ESTADOS
  const [produtor, setProdutor] = useState("");
  const [talhao, setTalhao] = useState(""); // Identificação do Silo

  // INPUTS - DIMENSÕES
  const [diametro, setDiametro] = useState<number | string>(""); // m
  const [altura, setAltura] = useState<number | string>(""); // m (altura útil/cilindro)

  // INPUTS - GRÃO
  const [densidade, setDensidade] = useState<number | string>(750); // kg/m3 (Default Soja)
  
  // INPUTS - COMERCIAL
  const [precoSaca, setPrecoSaca] = useState<number | string>(""); // R$/sc
  const [produtividade, setProdutividade] = useState<number | string>(""); // sc/ha (para calculo de area coberta)

  // CÁLCULOS
  const resultados = useMemo(() => {
    const d = Number(diametro) || 0;
    const h = Number(altura) || 0;
    const dens = Number(densidade) || 0;
    const preco = Number(precoSaca) || 0;
    const prod = Number(produtividade) || 0;

    if (d === 0 || h === 0) return { volM3: 0, pesoTon: 0, sacas: 0, valorTotal: 0, haCobertos: 0 };

    // 1. Volume (Cilindro Base)
    // V = pi * r^2 * h
    const raio = d / 2;
    const volM3 = Math.PI * Math.pow(raio, 2) * h;

    // 2. Peso Total (kg -> Ton)
    const pesoTotalKg = volM3 * dens;
    const pesoTon = pesoTotalKg / 1000;

    // 3. Capacidade em Sacas (60kg)
    const sacas = pesoTotalKg / 60;

    // 4. Valor Financeiro
    const valorTotal = sacas * preco;

    // 5. Cobertura de Área (Quantos ha cabem no silo?)
    const haCobertos = prod > 0 ? sacas / prod : 0;

    return {
        volM3,
        pesoTon,
        sacas,
        valorTotal,
        haCobertos
    };
  }, [diametro, altura, densidade, precoSaca, produtividade]);

  // PRESETS DE DENSIDADE
  const setPreset = (val: number) => setDensidade(val);

  // FORMATAÇÃO
  const fmtMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  const fmtNum = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(v); // Sacas sem decimal
  const fmtDec = (v: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(v);

  const shareText = `🏭 *Capacidade de Silo*\n\n📏 *Dimensões:* ${diametro}m x ${altura}m\n⚖️ *Capacidade:* ${fmtNum(resultados.sacas)} sc (${fmtDec(resultados.pesoTon)} ton)\n💰 *Valor Estocado:* ${fmtMoeda(resultados.valorTotal)}\n\n(Base: ${densidade} kg/m³)`.trim();

  return (
    <CalculatorLayout
      title="Dimensionamento de Silos"
      subtitle="Cálculo de volume estático, tonelagem e capacidade financeira de armazenagem."
      category="Pós-Colheita"
      icon={<Database size={16} />}
      produtor={produtor}
      setProdutor={setProdutor}
      talhao={talhao}
      setTalhao={setTalhao}
      shareText={shareText}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- INPUTS --- */}
        <div className="lg:col-span-7 space-y-6">
           
           {/* Seção 1: Geometria */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-slate-100 text-slate-700 rounded-lg"><Ruler size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">1. Dimensões do Silo</h3>
                    <p className="text-xs text-slate-400">Medidas internas da estrutura</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <InputGroup label="Diâmetro (m)" icon={<Database size={16}/>} value={diametro} onChange={setDiametro} placeholder="Ex: 18" suffix="m" />
                 <InputGroup label="Altura da Chaparia (m)" icon={<Ruler size={16} className="rotate-90"/>} value={altura} onChange={setAltura} placeholder="Ex: 15" suffix="m" />
              </div>
              <p className="text-[10px] text-slate-400 mt-3 text-right">
                  *Cálculo baseado no volume cilíndrico (chaparia).
              </p>
           </section>

           {/* Seção 2: Tipo de Grão */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg"><Wheat size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">2. Densidade do Grão</h3>
                    <p className="text-xs text-slate-400">Peso específico (kg/m³)</p>
                 </div>
              </div>

              {/* Presets */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                  <button onClick={() => setPreset(750)} className={`p-2 rounded border text-xs font-bold transition-all ${densidade == 750 ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-slate-50 text-slate-500'}`}>
                      Soja (750)
                  </button>
                  <button onClick={() => setPreset(720)} className={`p-2 rounded border text-xs font-bold transition-all ${densidade == 720 ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-slate-50 text-slate-500'}`}>
                      Milho (720)
                  </button>
                  <button onClick={() => setPreset(780)} className={`p-2 rounded border text-xs font-bold transition-all ${densidade == 780 ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-slate-50 text-slate-500'}`}>
                      Trigo (780)
                  </button>
              </div>

              <div className="grid grid-cols-1 gap-5">
                 <InputGroup label="Densidade (kg/m³)" icon={<Scale size={16}/>} value={densidade} onChange={setDensidade} placeholder="Ex: 750" suffix="kg/m³" />
              </div>
           </section>

           {/* Seção 3: Estratégia (Opcional) */}
           <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                 <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><Coins size={20} /></div>
                 <div>
                    <h3 className="font-bold text-lg text-slate-800">3. Dados Comerciais (Opcional)</h3>
                    <p className="text-xs text-slate-400">Para valuation do estoque</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <InputGroup label="Preço da Saca (R$)" icon={<Coins size={16}/>} value={precoSaca} onChange={setPrecoSaca} placeholder="Ex: 120.00" suffix="R$" />
                 <InputGroup label="Produtividade Média" icon={<LayoutDashboard size={16}/>} value={produtividade} onChange={setProdutividade} placeholder="Ex: 70" suffix="sc/ha" />
              </div>
           </section>
        </div>

        {/* --- RESULTADOS --- */}
        <div className="lg:col-span-5 relative">
            <div className="sticky top-10 print:static">

                 {/* OVERLAY BLOQUEIO */}
                 {!isAuthenticated && (
                   <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-white/60 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg h-full">
                      <div className="bg-slate-900 text-zinc-400 p-4 rounded-full mb-4 shadow-xl animate-pulse">
                         <Lock size={32} />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mb-2">Resultado Bloqueado</h3>
                      <button 
                        onClick={() => (document.getElementById("modal_auth") as any)?.showModal()}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-zinc-800/20 transition-all flex items-center gap-2 hover:scale-105"
                      >
                        Ver Capacidade <ArrowRight size={16}/>
                      </button>
                   </div>
                 )}

                 <div className={`space-y-6 transition-all duration-500 ${!isAuthenticated ? 'opacity-40 pointer-events-none filter blur-sm select-none' : ''}`}>
                    
                    {/* Card Principal: CAPACIDADE EM SACAS */}
                    <div className="print-card bg-slate-900 text-white rounded-xl p-8 shadow-xl relative overflow-hidden">
                        {/* Background Detail */}
                        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-zinc-700/30 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="relative z-10 text-center">
                            <p className="text-zinc-400 font-bold uppercase tracking-wider text-xs mb-4">
                                Capacidade Estática
                            </p>
                            
                            <div className="relative inline-block mb-2">
                                <span className="text-5xl font-black tracking-tighter text-white">
                                    {fmtNum(resultados.sacas)}
                                </span>
                                <span className="block text-xl font-medium text-slate-400 mt-1">Sacas (60kg)</span>
                            </div>

                            <div className="mt-6 flex justify-center gap-8 border-t border-slate-800 pt-6">
                                <div>
                                    <span className="block text-xl font-bold text-white">{fmtDec(resultados.pesoTon)}</span>
                                    <span className="text-[10px] text-slate-500 uppercase">Toneladas</span>
                                </div>
                                <div>
                                    <span className="block text-xl font-bold text-white">{fmtDec(resultados.volM3)}</span>
                                    <span className="text-[10px] text-slate-500 uppercase">Metros Cúbicos</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card Secundário: FINANCEIRO DO ESTOQUE */}
                    <div className="print-card bg-emerald-50 border border-emerald-200 rounded-xl p-6 shadow-lg relative">
                        <div className="flex items-center justify-between mb-4 border-b border-emerald-100 pb-4">
                             <div className="flex items-center gap-2">
                                <Coins className="text-emerald-600" size={20}/>
                                <h4 className="font-bold text-emerald-900 text-sm">Valor em Estoque</h4>
                             </div>
                        </div>
                        
                        <div className="text-center py-2">
                            {resultados.valorTotal > 0 ? (
                                <span className="block text-3xl font-black text-emerald-700">{fmtMoeda(resultados.valorTotal)}</span>
                            ) : (
                                <span className="text-sm text-emerald-400 italic">Defina o preço da saca</span>
                            )}
                            <span className="text-[10px] text-emerald-600 uppercase mt-1 block">Capital Imobilizado no Silo</span>
                        </div>
                    </div>

                    {/* Card Terciário: COBERTURA DE ÁREA */}
                    {resultados.haCobertos > 0 && (
                        <div className="bg-white border border-slate-200 rounded-xl p-5 relative overflow-hidden">
                            <div className="flex gap-3 items-center">
                                <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                                    <LayoutDashboard size={20}/>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-600 uppercase">Capacidade de Recebimento</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                        Este silo comporta a colheita de aprox:
                                    </p>
                                    <p className="text-2xl font-black text-blue-600 mt-1">
                                        {fmtDec(resultados.haCobertos)} <span className="text-sm font-normal text-slate-400">hectares</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                 </div>
            </div>
        </div>

      </div>
    </CalculatorLayout>
  );
}